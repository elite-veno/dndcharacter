// Battle map: pure logic for encounters and tokens (no DOM, no storage) so it can be unit tested.
// Coordinates are in image pixels of the uploaded map; a token's (x, y) is its centre.

export const TOKEN_KINDS = {
  player: { label: 'Player', color: '#2f6fb5' },
  ally: { label: 'Ally', color: '#3f9a6f' },
  enemy: { label: 'Enemy', color: '#b8324a' },
  neutral: { label: 'Neutral', color: '#7d8596' },
  marker: { label: 'Marker', color: '#a9772f' },
};
export const TOKEN_SIZES = [
  { value: 0.5, label: 'Tiny (½ square)' }, { value: 1, label: 'Small / Medium (1 square)' },
  { value: 2, label: 'Large (2×2)' }, { value: 3, label: 'Huge (3×3)' }, { value: 4, label: 'Gargantuan (4×4)' },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const int = (v, fallback = 0) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Math.round(Number(v)) : fallback);
const text = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
let counter = 0;
export const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function defaultGrid(width = 1000) {
  return { show: true, snap: true, size: Math.max(20, Math.round(width / 30)), offsetX: 0, offsetY: 0, feet: 5, color: 'rgba(40, 26, 14, 0.35)' };
}

export function normalizeGrid(raw, width = 1000) {
  const base = defaultGrid(width);
  const g = { ...base, ...(raw || {}) };
  g.show = g.show !== false;
  g.snap = g.snap !== false;
  g.size = clamp(Number(g.size) || base.size, 8, 1000);
  g.offsetX = clamp(Number(g.offsetX) || 0, -1000, 1000);
  g.offsetY = clamp(Number(g.offsetY) || 0, -1000, 1000);
  g.feet = clamp(int(g.feet, 5), 1, 100);
  g.color = text(g.color, 40) || base.color;
  return g;
}

/** Normalise a token. HP is null for markers (or when maxHp is 0 and the token is not linked to a character). */
export function normalizeToken(raw = {}) {
  const kind = TOKEN_KINDS[raw.kind] ? raw.kind : 'enemy';
  const marker = kind === 'marker';
  const hasHp = !marker && raw.hp !== null && raw.hp !== undefined;
  const max = hasHp ? Math.max(0, int(raw.hp.max, 0)) : 0;
  return {
    id: text(raw.id, 60) || newId('t'),
    name: text(raw.name, 60) || TOKEN_KINDS[kind].label,
    kind,
    color: /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : TOKEN_KINDS[kind].color,
    label: text(raw.label, 4),
    x: Number.isFinite(Number(raw.x)) ? Number(raw.x) : 0,
    y: Number.isFinite(Number(raw.y)) ? Number(raw.y) : 0,
    size: TOKEN_SIZES.some((s) => s.value === Number(raw.size)) ? Number(raw.size) : 1,
    hp: hasHp ? { max, current: clamp(int(raw.hp.current, max), 0, Math.max(max, 0)), temp: Math.max(0, int(raw.hp.temp, 0)) } : null,
    ac: raw.ac === null || raw.ac === undefined || raw.ac === '' ? null : clamp(int(raw.ac, 10), 0, 40),
    init: raw.init === null || raw.init === undefined || raw.init === '' ? null : clamp(int(raw.init, 0), -10, 50),
    initBonus: clamp(int(raw.initBonus, 0), -10, 20),
    conditions: Array.isArray(raw.conditions) ? [...new Set(raw.conditions.map((c) => text(c, 30)).filter(Boolean))] : [],
    note: String(raw.note ?? '').slice(0, 2000),
    characterId: text(raw.characterId, 60) || null,
    memberId: text(raw.memberId, 60) || null, // a party member who joined a live session
    hidden: raw.hidden === true,
  };
}

export function newEncounter({ name = 'New map', imageId = null, width = 1000, height = 1000, parentId = null } = {}) {
  const now = Date.now();
  return {
    id: newId('m'), name: text(name, 80) || 'New map', imageId, width, height, grid: defaultGrid(width), tokens: [], links: [],
    parentId, isMain: false, turn: { activeId: null, round: 1 }, createdAt: now, updatedAt: now,
  };
}

/** A clickable area on a map that opens another map (e.g. an island on the world map). Rectangle in image pixels. */
export function normalizeLink(raw = {}, width = 1e6, height = 1e6) {
  const x = clamp(Number(raw.x) || 0, 0, width);
  const y = clamp(Number(raw.y) || 0, 0, height);
  return {
    id: text(raw.id, 60) || newId('l'),
    x, y,
    w: clamp(Number(raw.w) || 0, 1, width - x || 1),
    h: clamp(Number(raw.h) || 0, 1, height - y || 1),
    targetId: text(raw.targetId, 60) || null,
    label: text(raw.label, 60),
  };
}

/** Rectangle from two drag corners, in any direction. */
export const rectFromPoints = (a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) });

/** View transform { scale, x, y } that shows `rect` (image px) centred in a viewport of vw x vh, with some margin. */
export function viewForRect(rect, vw, vh, margin = 0.92) {
  const scale = Math.min(vw / Math.max(1, rect.w), vh / Math.max(1, rect.h)) * margin;
  return { scale, x: vw / 2 - (rect.x + rect.w / 2) * scale, y: vh / 2 - (rect.y + rect.h / 2) * scale };
}

export function normalizeEncounter(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Not a map.');
  const width = clamp(int(raw.width, 1000), 1, 20000);
  const height = clamp(int(raw.height, 1000), 1, 20000);
  const tokens = (Array.isArray(raw.tokens) ? raw.tokens : []).map(normalizeToken);
  const activeId = raw.turn && tokens.some((t) => t.id === raw.turn.activeId) ? raw.turn.activeId : null;
  return {
    id: text(raw.id, 60) || newId('m'), name: text(raw.name, 80) || 'Map', imageId: raw.imageId || null, width, height,
    grid: normalizeGrid(raw.grid, width), tokens,
    links: (Array.isArray(raw.links) ? raw.links : []).map((l) => normalizeLink(l, width, height)).filter((l) => l.w >= 1 && l.h >= 1),
    parentId: text(raw.parentId, 60) || null,
    isMain: raw.isMain === true,
    turn: { activeId, round: Math.max(1, int(raw.turn && raw.turn.round, 1)) },
    createdAt: int(raw.createdAt, Date.now()), updatedAt: int(raw.updatedAt, Date.now()),
  };
}

// ---------------------------------------------------------------- hit points (tokens that are not linked to a sheet)

export function damageToken(token, amount) {
  if (!token.hp) return token;
  const dmg = Math.max(0, Math.floor(Number(amount) || 0));
  const absorbed = Math.min(token.hp.temp, dmg);
  return { ...token, hp: { ...token.hp, temp: token.hp.temp - absorbed, current: Math.max(0, token.hp.current - (dmg - absorbed)) } };
}

export function healToken(token, amount) {
  if (!token.hp) return token;
  const heal = Math.max(0, Math.floor(Number(amount) || 0));
  return { ...token, hp: { ...token.hp, current: Math.min(token.hp.max, token.hp.current + heal) } };
}

/** 'healthy' | 'bloodied' (half HP or less) | 'down' (0 HP) | null (no HP). */
export function hpState(hp) {
  if (!hp || !hp.max) return null;
  if (hp.current <= 0) return 'down';
  return hp.current * 2 <= hp.max ? 'bloodied' : 'healthy';
}

// ---------------------------------------------------------------- grid, movement and distance

/** Snap a token centre so the token sits exactly on grid cells (a 2×2 token's centre lands on a grid corner). */
export function snapToGrid(x, y, grid, size = 1) {
  const cells = Math.max(1, size);
  const step = grid.size;
  const half = (cells * step) / 2;
  const sx = Math.round((x - half - grid.offsetX) / step) * step + grid.offsetX + half;
  const sy = Math.round((y - half - grid.offsetY) / step) * step + grid.offsetY + half;
  return { x: sx, y: sy };
}

/** Distance in feet between two points: squares counted the 2024 way (every square, also diagonal, is one move). */
export function distanceFeet(a, b, grid) {
  const squares = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) / grid.size;
  return Math.round(squares) * grid.feet;
}

// ---------------------------------------------------------------- initiative and turns

/** Tokens in initiative order (highest first; ties by initiative bonus, then name). Markers and tokens without initiative are left out. */
export function initiativeOrder(tokens) {
  return tokens.filter((t) => t.kind !== 'marker' && t.init !== null)
    .sort((a, b) => b.init - a.init || b.initBonus - a.initBonus || a.name.localeCompare(b.name));
}

/** Advance (dir = 1) or go back (dir = -1) one turn. Passing the end of the order starts the next round. */
export function stepTurn(encounter, dir = 1) {
  const order = initiativeOrder(encounter.tokens);
  if (!order.length) return { ...encounter, turn: { activeId: null, round: encounter.turn.round } };
  const idx = order.findIndex((t) => t.id === encounter.turn.activeId);
  let round = encounter.turn.round;
  let next;
  if (idx === -1) next = dir > 0 ? 0 : order.length - 1;
  else {
    next = idx + dir;
    if (next >= order.length) { next = 0; round += 1; }
    if (next < 0) { next = order.length - 1; round = Math.max(1, round - 1); }
  }
  return { ...encounter, turn: { activeId: order[next].id, round } };
}

/** Copy a token next to the original, numbering the name ("Goblin" -> "Goblin 2"). */
export function duplicateToken(token, tokens, grid) {
  const base = token.name.replace(/\s+\d+$/, '');
  const used = new Set(tokens.map((t) => t.name));
  let n = 2;
  while (used.has(`${base} ${n}`)) n++;
  return normalizeToken({
    ...token, id: newId('t'), name: `${base} ${n}`, x: token.x + grid.size * Math.max(1, token.size), init: null,
    hp: token.hp ? { ...token.hp, current: token.hp.max, temp: 0 } : null, conditions: [],
  });
}

/** Initials for a token without a custom label ("Goblin Boss" -> "GB"). */
export const initials = (name) => text(name, 60).split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

// ---------------------------------------------------------------- live sessions (party play)

export const LIVE_DEFAULTS = { playersMove: true, showEnemyHp: false, autoPlace: true };

/**
 * What players see of an encounter: hidden tokens and DM notes are removed, and unless the DM allows it enemy and
 * neutral hit points are reduced to a state ("bloodied", "down") without numbers. Party members always see their own HP.
 */
export function publicState(enc, settings = LIVE_DEFAULTS) {
  const s = { ...LIVE_DEFAULTS, ...(settings || {}) };
  const tokens = enc.tokens.filter((t) => !t.hidden).map((t) => {
    const out = { ...t, note: '' };
    const secret = (t.kind === 'enemy' || t.kind === 'neutral') && !s.showEnemyHp;
    if (secret) { out.hp = t.hp ? { state: hpState(t.hp) } : null; out.ac = null; }
    return out;
  });
  const activeVisible = tokens.some((t) => t.id === enc.turn.activeId);
  return {
    id: enc.id, name: enc.name, imageId: enc.imageId, width: enc.width, height: enc.height, grid: enc.grid, tokens,
    turn: { activeId: activeVisible ? enc.turn.activeId : null, round: enc.turn.round }, settings: s,
  };
}

/** Can this party member move this token? Only their own token, and only when the DM allows it. */
export const memberMayMove = (token, memberId, settings) => !!token && !!memberId && token.memberId === memberId && ({ ...LIVE_DEFAULTS, ...(settings || {}) }).playersMove;

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
/** Short, easy-to-type party code (no 0/O, 1/I/L). */
export function partyCode(rand = Math.random) {
  let out = '';
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  return out;
}
export const normalizeCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
