// Live party sessions through a public MQTT relay over secure WebSockets (bundled MQTT.js in vendor/mqtt).
// Browser-to-browser connections (WebRTC) fail between many home and mobile networks, so instead every message goes
// through a free public broker on the normal web port: it works wherever a website works, with no account.
// The DM's browser stays the authority; the broker only forwards messages on the party's topics.
//
// Topics (code = 6-character party code):  cforge/v2/<code>/up        players -> DM
//                                           cforge/v2/<code>/down      DM -> everyone
//                                           cforge/v2/<code>/to/<id>   DM -> one player
// To survive one broker being down or blocked, both sides connect to every broker in the list and drop duplicates.

const DEFAULT_BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt'];
const BROKER_KEY = 'characterforge.mqtt.brokers'; // optional override, comma separated (tests use ?mqtt=ws://127.0.0.1:8888)
const CHUNK = 48 * 1024; // public brokers cap message size; bigger payloads (map images) are split
const PING_MS = 6000;
const TIMEOUT_MS = 20000;

let libPromise = null;
function loadLib() {
  if (globalThis.mqtt && globalThis.mqtt.connect) return Promise.resolve(globalThis.mqtt);
  if (libPromise) return libPromise;
  libPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('../vendor/mqtt/mqtt.min.js', import.meta.url).href;
    s.onload = () => (globalThis.mqtt && globalThis.mqtt.connect ? resolve(globalThis.mqtt) : reject(new Error('Live play library failed to load.')));
    s.onerror = () => { libPromise = null; reject(new Error('Could not load the live play library (vendor/mqtt).')); };
    document.head.append(s);
  });
  return libPromise;
}

function brokers() {
  let custom = null;
  try { custom = new URLSearchParams(location.search).get('mqtt') || localStorage.getItem(BROKER_KEY); } catch { /* ignore */ }
  return custom ? custom.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_BROKERS;
}

const rid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
export const topicsFor = (code) => {
  const base = `cforge/v2/${code}`;
  return { up: `${base}/up`, down: `${base}/down`, to: (id) => `${base}/to/${id}` };
};

/** Split a message into broker-sized parts (pure, exported for tests). */
export function encodeParts(msg) {
  const body = JSON.stringify(msg);
  if (body.length <= CHUNK) return [body];
  const n = Math.ceil(body.length / CHUNK);
  const parts = [];
  for (let i = 0; i < n; i++) parts.push(JSON.stringify({ mid: msg.mid, part: i, parts: n, chunk: body.slice(i * CHUNK, (i + 1) * CHUNK) }));
  return parts;
}

/** Reassembles parts and drops duplicates (a message arrives once per broker). Returns a function text -> message|null. */
export function createDecoder(maxSeen = 2000) {
  const seen = new Set();
  const pending = new Map();
  const remember = (mid) => {
    seen.add(mid);
    if (seen.size > maxSeen) seen.delete(seen.values().next().value);
  };
  return (text) => {
    let data;
    try { data = JSON.parse(text); } catch { return null; }
    if (!data || typeof data !== 'object' || !data.mid || seen.has(data.mid)) return null;
    if (data.parts === undefined) { remember(data.mid); return data; }
    const entry = pending.get(data.mid) || { parts: new Array(data.parts), got: 0, at: Date.now() };
    if (entry.parts[data.part] === undefined) { entry.parts[data.part] = data.chunk; entry.got++; }
    pending.set(data.mid, entry);
    for (const [k, v] of pending) if (Date.now() - v.at > 120000) pending.delete(k);
    if (entry.got < data.parts) return null;
    pending.delete(data.mid);
    remember(data.mid);
    try { return JSON.parse(entry.parts.join('')); } catch { return null; }
  };
}

/** One logical connection over several brokers. */
async function relay({ subscribe = [], will = null, onMessage, onStatus }) {
  const mqtt = await loadLib();
  const decode = createDecoder();
  const urls = brokers();
  const clients = urls.map((url) => {
    const opts = { clientId: `cf_${rid()}`, clean: true, reconnectPeriod: 3000, connectTimeout: 8000, keepalive: 30, protocolVersion: 4 };
    if (will) opts.will = { topic: will.topic, payload: JSON.stringify({ ...will.message, mid: rid() }), qos: 0, retain: false };
    const c = mqtt.connect(url, opts);
    c.on('connect', () => { c.subscribe(subscribe, { qos: 0 }); report(); });
    c.on('close', report);
    c.on('offline', report);
    c.on('error', () => report());
    c.on('message', (_topic, payload) => {
      const msg = decode(payload.toString());
      if (msg) onMessage(msg, _topic);
    });
    return c;
  });
  function report() {
    const up = clients.filter((c) => c.connected).length;
    onStatus(up, urls.length);
  }
  return {
    connectedCount: () => clients.filter((c) => c.connected).length,
    addSubscription: (topic) => { subscribe.push(topic); clients.forEach((c) => { if (c.connected) c.subscribe(topic, { qos: 0 }); }); },
    publish: (topic, msg) => {
      const parts = encodeParts({ ...msg, mid: msg.mid || rid() });
      clients.forEach((c) => { if (c.connected) parts.forEach((p) => c.publish(topic, p, { qos: 0 })); });
    },
    close: () => clients.forEach((c) => { try { c.end(true); } catch { /* ignore */ } }),
  };
}

/**
 * Host a party (DM). Handlers: onStatus(text, state), onJoin(conn), onMessage(msg, conn), onLeave(conn).
 * A "conn" is { memberId, open } for one player. Returns { send(conn, msg), broadcast(msg), connections(), close() }.
 */
export async function hostParty(code, { onStatus = () => {}, onJoin = () => {}, onMessage = () => {}, onLeave = () => {} } = {}) {
  const t = topicsFor(code);
  const dmId = rid();
  const conns = new Map(); // memberId -> conn
  let otherDm = 0;
  let closed = false;
  onStatus('Connecting to the live service…', 'connecting');
  const net = await relay({
    subscribe: [t.up, t.down],
    onStatus: (up, total) => {
      if (closed) return;
      if (up === 0) onStatus('No connection to the live service. Check the internet connection; retrying…', 'connecting');
      else if (Date.now() - otherDm < 15000) onStatus('This party is also live in another tab or on another device. Close it there.', 'error');
      else onStatus(`Live: players can join with the code.${up < total ? ` (${up}/${total} relays)` : ''}`, 'live');
      if (up > 0) net && net.publish(t.down, { type: 'dm-online', dmId });
    },
    onMessage: (msg, topic) => {
      if (closed) return;
      if (topic === t.down) {
        if (msg.dmId && msg.dmId !== dmId && (msg.type === 'dm-online' || msg.type === 'dm-ping')) { otherDm = Date.now(); onStatus('This party is also live in another tab or on another device. Close it there.', 'error'); }
        return;
      }
      const from = typeof msg.from === 'string' ? msg.from.slice(0, 60) : '';
      if (!from) return;
      let conn = conns.get(from);
      if (msg.type === 'bye') { if (conn) { conns.delete(from); conn.open = false; onLeave(conn); } return; }
      if (!conn) {
        if (msg.type !== 'hello') { net.publish(t.to(from), { type: 'who' }); return; } // DM restarted: ask the player to say hello again
        conn = { memberId: from, open: true, lastSeen: Date.now() };
        conns.set(from, conn);
        onJoin(conn);
      }
      conn.lastSeen = Date.now();
      if (msg.type !== 'ping') onMessage(msg, conn);
    },
  });
  // Tell players the DM is here, and drop players that went quiet.
  const timer = setInterval(() => {
    if (closed) return;
    net.publish(t.down, { type: 'dm-ping', dmId });
    const now = Date.now();
    for (const [id, c] of conns) if (now - c.lastSeen > TIMEOUT_MS) { conns.delete(id); c.open = false; onLeave(c); }
  }, PING_MS);

  return {
    send: (conn, msg) => { if (!closed && conn && conn.open) net.publish(t.to(conn.memberId), msg); },
    broadcast: (msg) => { if (!closed) net.publish(t.down, msg); },
    connections: () => [...conns.values()],
    close: () => { closed = true; clearInterval(timer); setTimeout(() => net.close(), 300); },
  };
}

/**
 * Join a party (player). Keeps saying hello until the DM answers, and again whenever the DM comes back.
 * Handlers: onStatus(text, state), onOpen(), onMessage(msg). Returns { send(msg), close() }.
 */
export async function joinParty(code, { onStatus = () => {}, onOpen = () => {}, onMessage = () => {} } = {}) {
  const t = topicsFor(code);
  let memberId = null;
  let hello = null;
  let welcomed = false;
  let lastDm = 0;
  let closed = false;
  let net = null;
  let opened = false;

  const status = () => {
    if (closed || !net) return;
    if (net.connectedCount() === 0) onStatus('No connection to the live service. Retrying…', 'waiting');
    else if (!lastDm || Date.now() - lastDm > TIMEOUT_MS) onStatus('Waiting for the DM to go live…', 'waiting');
    else if (!welcomed) onStatus('Found the DM, joining…', 'connecting');
  };
  onStatus('Connecting…', 'connecting');
  net = await relay({
    subscribe: [t.down],
    will: null,
    onStatus: (up) => {
      if (closed) return;
      if (up > 0 && !opened) { opened = true; onOpen(); }
      if (up > 0 && hello) net.publish(t.up, hello);
      status();
    },
    onMessage: (msg, topic) => {
      if (closed) return;
      if (topic === t.down && (msg.type === 'dm-online' || msg.type === 'dm-ping')) {
        const wasAway = !lastDm || Date.now() - lastDm > TIMEOUT_MS;
        lastDm = Date.now();
        if ((wasAway || !welcomed) && hello) net.publish(t.up, { ...hello, mid: undefined });
        if (msg.type === 'dm-online') welcomed = false;
        status();
        return;
      }
      lastDm = Date.now();
      if (msg.type === 'who') { if (hello) net.publish(t.up, { ...hello, mid: undefined }); return; }
      if (msg.type === 'welcome') welcomed = true;
      if (msg.type === 'ended') welcomed = false;
      onMessage(msg);
    },
  });
  const timer = setInterval(() => {
    if (closed || !memberId) return;
    if (!welcomed && hello) net.publish(t.up, { ...hello, mid: undefined });
    else net.publish(t.up, { type: 'ping', from: memberId });
    status();
  }, PING_MS);
  const leave = () => { if (memberId) net.publish(t.up, { type: 'bye', from: memberId }); };
  window.addEventListener('pagehide', leave);

  return {
    send: (msg) => {
      if (closed) return;
      if (msg.type === 'hello') {
        memberId = String(msg.memberId || '').slice(0, 60);
        net.addSubscription(t.to(memberId));
        hello = { ...msg, from: memberId };
        net.publish(t.up, hello);
        return;
      }
      net.publish(t.up, { ...msg, from: memberId });
    },
    close: () => { closed = true; clearInterval(timer); leave(); window.removeEventListener('pagehide', leave); setTimeout(() => net.close(), 300); },
  };
}
