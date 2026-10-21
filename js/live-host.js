// The DM side of a live party session. It lives outside the map editor so the session survives switching maps:
// whichever map the DM has open is the map the players see (follow a linked area and the party follows along).

import { hostParty } from './net.js';
import { publicState, LIVE_DEFAULTS } from './map-logic.js';
import { getParty, upsertMember, saveParty } from './party.js';

const RESUME_KEY = 'characterforge.live.v1'; // party that was live in this tab, so a page refresh resumes it
let session = null; // { party, host, settings, status, state, online: Map(memberId -> conn), editor }
const listeners = new Set();
const notify = () => listeners.forEach((fn) => { try { fn(session); } catch { /* ignore */ } });

export const liveSession = () => session;
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});

/** Map images go through a public relay in small parts, so send players a lighter copy (max 2048 px, JPEG). */
async function lightImage(blob) {
  try {
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 2048 / Math.max(bmp.width, bmp.height));
    if (scale === 1 && blob.size < 900 * 1024) return blob;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b || blob), 'image/jpeg', 0.82));
  } catch { return blob; }
}

let imageCache = { id: null, dataUrl: null };
async function imageMessage() {
  const ed = session && session.editor;
  if (!ed) return null;
  const enc = ed.getEnc();
  if (!enc || !enc.imageId) return { type: 'image', imageId: null, dataUrl: null };
  if (imageCache.id !== enc.imageId) {
    const blob = await ed.getImageBlob();
    imageCache = { id: enc.imageId, dataUrl: blob ? await blobToDataUrl(await lightImage(blob)) : null };
  }
  return { type: 'image', imageId: imageCache.id, dataUrl: imageCache.dataUrl };
}

const stateMessage = () => {
  const enc = session && session.editor && session.editor.getEnc();
  const roster = session.party.members.map((m) => ({
    memberId: m.memberId, name: m.name, online: session.online.has(m.memberId),
    character: m.character ? { name: m.character.name, classLine: m.character.classLine } : null,
  }));
  return enc ? { type: 'state', map: publicState(enc, session.settings), party: session.party.name, roster } : { type: 'idle', party: session.party.name, roster };
};

async function sendFull(conn) {
  if (!session) return;
  const img = await imageMessage();
  if (img && conn.imageSent !== img.imageId) { session.host.send(conn, img); conn.imageSent = img.imageId; }
  session.host.send(conn, stateMessage());
}

export async function startLive(partyId) {
  if (session && session.party.id === partyId) return session;
  stopLive();
  const party = getParty(partyId);
  if (!party) throw new Error('Party not found.');
  try { sessionStorage.setItem(RESUME_KEY, partyId); } catch { /* ignore */ }
  session = { party, host: null, settings: { ...LIVE_DEFAULTS, ...(party.settings || {}) }, status: 'Starting…', state: 'connecting', online: new Map(), editor: null };
  const s = session;
  s.host = await hostParty(party.code, {
    onStatus: (text, state) => { if (session !== s) return; s.status = text; s.state = state; notify(); },
    onJoin: () => { notify(); pushState(); },
    onLeave: (conn) => {
      if (session !== s) return;
      for (const [mid, c] of s.online) if (c === conn) s.online.delete(mid);
      notify();
      pushState();
    },
    onMessage: (msg, conn) => {
      if (session !== s) return;
      if (msg.type === 'hello') {
        const memberId = String(msg.memberId || '').slice(0, 60);
        if (!memberId) return;
        conn.memberId = memberId;
        s.online.set(memberId, conn);
        s.party = upsertMember(getParty(s.party.id) || s.party, msg);
        s.host.send(conn, { type: 'welcome', party: s.party.name, memberId });
        const member = s.party.members.find((m) => m.memberId === memberId);
        if (s.editor && member) s.editor.onMemberHello(member);
        sendFull(conn);
        notify();
        return;
      }
      if (!conn.memberId || !s.editor) return;
      if (msg.type === 'move') s.editor.onMemberMove(conn.memberId, msg);
      else if (msg.type === 'hp') s.editor.onMemberHp(conn.memberId, msg);
    },
  });
  notify();
  return session;
}

export function stopLive() {
  try { sessionStorage.removeItem(RESUME_KEY); } catch { /* ignore */ }
  if (!session) return;
  try { session.host && session.host.broadcast({ type: 'ended' }); } catch { /* ignore */ }
  const s = session;
  session = null;
  setTimeout(() => { try { s.host && s.host.close(); } catch { /* ignore */ } }, 200);
  imageCache = { id: null, dataUrl: null };
  notify();
}

export function setLiveSettings(patch) {
  if (!session) return;
  session.settings = { ...session.settings, ...patch };
  const party = getParty(session.party.id);
  if (party) saveParty({ ...party, settings: session.settings });
  pushState();
  notify();
}

/** The map editor that is open now. Attaching a different map sends it (image and all) to every player. */
export async function attachEditor(editor) {
  if (!session) return;
  session.editor = editor;
  const enc = editor.getEnc();
  // Members who are online but not yet on this map get placed (when the DM allows auto-placing).
  for (const memberId of session.online.keys()) {
    const m = session.party.members.find((x) => x.memberId === memberId);
    if (m) editor.onMemberHello(m);
  }
  const img = await imageMessage();
  if (!session || session.editor !== editor) return;
  if (img) { session.host.broadcast(img); session.online.forEach((c) => { c.imageSent = img.imageId; }); }
  session.host.broadcast(stateMessage());
  notify();
  return enc;
}

export function detachEditor(editor) {
  if (!session || session.editor !== editor) return;
  session.editor = null;
  session.host.broadcast(stateMessage());
  notify();
}

let stateTimer = null;
/** Send the current map state to everyone (throttled a little so rapid edits do not flood the connection). */
export function pushState() {
  if (!session || stateTimer) return;
  stateTimer = setTimeout(() => {
    stateTimer = null;
    if (session) session.host.broadcast(stateMessage());
  }, 60);
}

let moveTimer = 0;
/** While the DM drags a token, stream its position so players see it move. */
export function pushMoving(tokenId, x, y) {
  if (!session) return;
  const now = performance.now();
  if (now - moveTimer < 50) return;
  moveTimer = now;
  session.host.broadcast({ type: 'moving', id: tokenId, x, y });
}

/** The share link players open to join this party. */
export const joinLink = (code) => `${location.origin}${location.pathname}#/join/${code}`;

/** After a page refresh, go live again with the party that was live in this tab. */
export function resumeLive() {
  let id = null;
  try { id = sessionStorage.getItem(RESUME_KEY); } catch { /* ignore */ }
  if (id && getParty(id)) return startLive(id).catch(() => null);
  return null;
}
