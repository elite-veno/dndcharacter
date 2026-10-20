// Live party sessions over WebRTC (PeerJS, bundled in vendor/peerjs). The DM's browser is the host and keeps the
// truth; players connect with a 6-character party code. No account or server of our own: PeerJS's free public
// broker only introduces the browsers to each other, after that data flows directly between them.

const PREFIX = 'cforge-party-';
const SERVER_KEY = 'characterforge.peer.server'; // optional "host:port" of a self-hosted PeerJS server (used by tests)

let libPromise = null;
function loadLib() {
  if (globalThis.Peer) return Promise.resolve(globalThis.Peer);
  if (libPromise) return libPromise;
  libPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('../vendor/peerjs/peerjs.min.js', import.meta.url).href;
    s.onload = () => (globalThis.Peer ? resolve(globalThis.Peer) : reject(new Error('Live play library failed to load.')));
    s.onerror = () => { libPromise = null; reject(new Error('Could not load the live play library (vendor/peerjs).')); };
    document.head.append(s);
  });
  return libPromise;
}

/** PeerJS options: the public PeerJS cloud by default, or a custom server set in localStorage / ?peer=host:port. */
function peerOptions() {
  let custom = null;
  try { custom = new URLSearchParams(location.search).get('peer') || localStorage.getItem(SERVER_KEY); } catch { /* ignore */ }
  const opts = { debug: 0 };
  if (custom) {
    const [host, port] = custom.split(':');
    Object.assign(opts, { host, port: Number(port) || 9000, path: '/', secure: location.protocol === 'https:' && host !== 'localhost' });
  }
  return opts;
}

const friendlyError = (err) => {
  const type = err && err.type;
  if (type === 'unavailable-id') return 'This party is already live in another tab or on another device. Close it there first.';
  if (type === 'peer-unavailable') return 'The DM is not live right now. Waiting for the DM to start the session…';
  if (type === 'network' || type === 'server-error' || type === 'socket-error' || type === 'socket-closed') return 'No connection to the live service. Check the internet connection; retrying…';
  if (type === 'browser-incompatible') return 'This browser does not support live play (WebRTC).';
  return (err && err.message) || String(err);
};

/**
 * Host a party (DM). Handlers: onStatus(text, state), onJoin(conn), onMessage(msg, conn), onLeave(conn).
 * Returns { send(conn, msg), broadcast(msg), connections(), close() }.
 */
export async function hostParty(code, { onStatus = () => {}, onJoin = () => {}, onMessage = () => {}, onLeave = () => {} } = {}) {
  const Peer = await loadLib();
  const conns = new Set();
  let closed = false;
  let peer = null;
  let retry = null;

  const start = () => {
    if (closed) return;
    onStatus('Starting the live session…', 'connecting');
    peer = new Peer(PREFIX + code, peerOptions());
    peer.on('open', () => onStatus('Live: players can join with the code.', 'live'));
    peer.on('connection', (conn) => {
      conn.on('open', () => { conns.add(conn); onJoin(conn); });
      conn.on('data', (msg) => { if (msg && typeof msg === 'object') onMessage(msg, conn); });
      const gone = () => { if (conns.delete(conn)) onLeave(conn); };
      conn.on('close', gone);
      conn.on('error', gone);
    });
    peer.on('disconnected', () => { if (!closed) { onStatus('Reconnecting to the live service…', 'connecting'); try { peer.reconnect(); } catch { /* ignore */ } } });
    peer.on('error', (err) => {
      onStatus(friendlyError(err), err && err.type === 'unavailable-id' ? 'error' : 'connecting');
      if (err && ['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type) && !closed) {
        clearTimeout(retry);
        retry = setTimeout(() => { try { peer.destroy(); } catch { /* ignore */ } start(); }, 4000);
      }
    });
  };
  start();

  const send = (conn, msg) => { try { if (conn.open) conn.send(msg); } catch { /* a closing connection */ } };
  return {
    send,
    broadcast: (msg) => conns.forEach((c) => send(c, msg)),
    connections: () => [...conns],
    close: () => { closed = true; clearTimeout(retry); conns.forEach((c) => { try { c.close(); } catch { /* ignore */ } }); try { peer && peer.destroy(); } catch { /* ignore */ } },
  };
}

/**
 * Join a party (player). Keeps retrying while the DM is offline. Handlers: onStatus(text, state), onOpen(), onMessage(msg).
 * Returns { send(msg), close() }.
 */
export async function joinParty(code, { onStatus = () => {}, onOpen = () => {}, onMessage = () => {} } = {}) {
  const Peer = await loadLib();
  let closed = false;
  let peer = null;
  let conn = null;
  let retry = null;

  const again = (ms = 3000) => { if (closed) return; clearTimeout(retry); retry = setTimeout(connect, ms); };
  function connect() {
    if (closed) return;
    if (!peer || peer.destroyed) {
      peer = new Peer(peerOptions());
      peer.on('open', connect);
      peer.on('error', (err) => {
        onStatus(friendlyError(err), 'waiting');
        if (err && (err.type === 'peer-unavailable')) again(3000);
        else if (err && ['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) { try { peer.destroy(); } catch { /* ignore */ } again(4000); }
      });
      peer.on('disconnected', () => { if (!closed) try { peer.reconnect(); } catch { /* ignore */ } });
      onStatus('Connecting…', 'connecting');
      return;
    }
    if (!peer.open) return; // 'open' will call connect again
    onStatus('Looking for the DM…', 'connecting');
    conn = peer.connect(PREFIX + code, { reliable: true });
    conn.on('open', () => { onStatus('Connected to the DM.', 'live'); onOpen(); });
    conn.on('data', (msg) => { if (msg && typeof msg === 'object') onMessage(msg); });
    conn.on('close', () => { if (!closed) { onStatus('Lost the connection to the DM. Reconnecting…', 'waiting'); again(2000); } });
    conn.on('error', () => { if (!closed) again(3000); });
  }
  connect();

  return {
    send: (msg) => { try { if (conn && conn.open) conn.send(msg); } catch { /* ignore */ } },
    close: () => { closed = true; clearTimeout(retry); try { conn && conn.close(); } catch { /* ignore */ } try { peer && peer.destroy(); } catch { /* ignore */ } },
  };
}
