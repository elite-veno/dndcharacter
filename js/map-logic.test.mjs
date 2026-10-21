// Run with: node js/map-logic.test.mjs
import assert from 'node:assert/strict';
import {
  normalizeToken, normalizeEncounter, newEncounter, damageToken, healToken, hpState, snapToGrid, distanceFeet,
  initiativeOrder, stepTurn, duplicateToken, initials, normalizeLink, rectFromPoints, viewForRect,
  publicState, memberMayMove, memberMayEditHp, memberPermissions, partyCode, normalizeCode,
} from './map-logic.js';

let groups = 0;
const group = (name, fn) => { fn(); groups++; };
const grid = { size: 50, offsetX: 0, offsetY: 0, feet: 5 };

group('tokens normalise safely', () => {
  const t = normalizeToken({ name: '  Goblin ', kind: 'enemy', hp: { max: 7, current: 99 }, ac: '15', size: 3, color: 'red' });
  assert.equal(t.name, 'Goblin'); assert.equal(t.hp.current, 7); assert.equal(t.ac, 15); assert.equal(t.size, 3); assert.equal(t.color, '#b8324a');
  assert.equal(normalizeToken({ kind: 'marker', hp: { max: 5 } }).hp, null);
  assert.equal(normalizeToken({ kind: 'nope' }).kind, 'enemy');
  assert.equal(normalizeToken({ size: 7 }).size, 1);
  assert.equal(normalizeToken({ init: '' }).init, null);
});

group('damage uses temp HP first, never below 0; healing caps at max', () => {
  let t = normalizeToken({ hp: { max: 20, current: 20, temp: 5 } });
  t = damageToken(t, 8); assert.deepEqual(t.hp, { max: 20, current: 17, temp: 0 });
  t = damageToken(t, 50); assert.equal(t.hp.current, 0); assert.equal(hpState(t.hp), 'down');
  t = healToken(t, 9); assert.equal(t.hp.current, 9); assert.equal(hpState(t.hp), 'bloodied');
  t = healToken(t, 100); assert.equal(t.hp.current, 20); assert.equal(hpState(t.hp), 'healthy');
  assert.equal(hpState(null), null);
});

group('snapping puts 1x1 tokens in cell centres and 2x2 tokens on corners', () => {
  assert.deepEqual(snapToGrid(60, 140, grid, 1), { x: 75, y: 125 });
  assert.deepEqual(snapToGrid(60, 140, grid, 2), { x: 50, y: 150 });
  assert.deepEqual(snapToGrid(10, 10, { ...grid, offsetX: 20, offsetY: 20 }, 1), { x: -5, y: -5 });
});

group('distance counts diagonals as one square (2024 rules)', () => {
  assert.equal(distanceFeet({ x: 25, y: 25 }, { x: 175, y: 125 }, grid), 15);
  assert.equal(distanceFeet({ x: 0, y: 0 }, { x: 0, y: 0 }, grid), 0);
  assert.equal(distanceFeet({ x: 0, y: 0 }, { x: 500, y: 0 }, { ...grid, feet: 10 }), 100);
});

group('initiative order and turns wrap into the next round', () => {
  const enc = normalizeEncounter({ ...newEncounter(), tokens: [
    { id: 'a', name: 'Ann', kind: 'player', init: 12 }, { id: 'b', name: 'Bob', kind: 'enemy', init: 18 },
    { id: 'c', name: 'Cat', kind: 'enemy', init: 12, initBonus: 3 }, { id: 'm', name: 'Door', kind: 'marker', init: 30 },
    { id: 'n', name: 'Nobody', kind: 'enemy' }] });
  assert.deepEqual(initiativeOrder(enc.tokens).map((t) => t.id), ['b', 'c', 'a']);
  let e = stepTurn(enc); assert.equal(e.turn.activeId, 'b'); assert.equal(e.turn.round, 1);
  e = stepTurn(e); e = stepTurn(e); assert.equal(e.turn.activeId, 'a');
  e = stepTurn(e); assert.equal(e.turn.activeId, 'b'); assert.equal(e.turn.round, 2);
  e = stepTurn(e, -1); assert.equal(e.turn.activeId, 'a'); assert.equal(e.turn.round, 1);
  assert.equal(stepTurn(normalizeEncounter(newEncounter())).turn.activeId, null);
});

group('duplicates are numbered, offset and fresh', () => {
  const g = normalizeToken({ name: 'Goblin', hp: { max: 7, current: 2 }, x: 100, y: 100, init: 14, conditions: ['prone'] });
  const g2 = duplicateToken(g, [g], grid);
  assert.equal(g2.name, 'Goblin 2'); assert.equal(g2.x, 150); assert.equal(g2.hp.current, 7); assert.equal(g2.init, null); assert.deepEqual(g2.conditions, []);
  assert.notEqual(g2.id, g.id);
  assert.equal(duplicateToken(g2, [g, g2], grid).name, 'Goblin 3');
  assert.equal(initials('Goblin Boss'), 'GB'); assert.equal(initials(''), '?');
});

group('encounters normalise and drop a stale active turn', () => {
  const e = normalizeEncounter({ name: 'Cave', width: 800, height: 600, tokens: [{ id: 'x' }], turn: { activeId: 'gone', round: 0 }, grid: { size: 2 } });
  assert.equal(e.turn.activeId, null); assert.equal(e.turn.round, 1); assert.equal(e.grid.size, 8);
  assert.throws(() => normalizeEncounter(null));
});

group('links between maps: rectangles, clamping and zoom target', () => {
  assert.deepEqual(rectFromPoints({ x: 300, y: 50 }, { x: 100, y: 250 }), { x: 100, y: 50, w: 200, h: 200 });
  const l = normalizeLink({ x: -20, y: 10, w: 5000, h: 40, targetId: 'm_island', label: '  Isle ' }, 1000, 800);
  assert.equal(l.x, 0); assert.equal(l.w, 1000); assert.equal(l.label, 'Isle'); assert.equal(l.targetId, 'm_island');
  const v = viewForRect({ x: 100, y: 100, w: 200, h: 100 }, 800, 400, 1);
  assert.equal(v.scale, 4); assert.equal(v.x, 800 / 2 - 200 * 4); assert.equal(v.y, 400 / 2 - 150 * 4);
  const e = normalizeEncounter({ width: 500, height: 500, links: [{ x: 10, y: 10, w: 50, h: 50, targetId: 'a' }], parentId: 'p', isMain: true });
  assert.equal(e.links.length, 1); assert.equal(e.parentId, 'p'); assert.equal(e.isMain, true);
  assert.deepEqual(normalizeEncounter({}).links, []);
});

group('live sessions: players see a filtered map', () => {
  const enc = normalizeEncounter({ ...newEncounter(), tokens: [
    { id: 'p', name: 'Ann', kind: 'player', memberId: 'mem1', hp: { max: 20, current: 12 }, ac: 15, note: 'secret' },
    { id: 'g', name: 'Goblin', kind: 'enemy', hp: { max: 10, current: 4 }, ac: 13, note: 'has the key' },
    { id: 'h', name: 'Hidden trap', kind: 'marker', hidden: true }], turn: { activeId: 'h', round: 2 } });
  const pub = publicState(enc);
  assert.equal(pub.tokens.length, 2);
  assert.deepEqual(pub.tokens.find((t) => t.id === 'g').hp, { state: 'bloodied' });
  assert.equal(pub.tokens.find((t) => t.id === 'g').ac, null);
  assert.equal(pub.tokens.find((t) => t.id === 'p').hp.current, 12);
  assert.ok(pub.tokens.every((t) => t.note === ''));
  assert.equal(pub.turn.activeId, null); assert.equal(pub.turn.round, 2);
  assert.equal(publicState(enc, { showEnemyHp: true }).tokens.find((t) => t.id === 'g').hp.current, 4);
  assert.equal(normalizeToken({ memberId: 'mem1' }).memberId, 'mem1');
});

group('only the owner may move their token, when allowed', () => {
  const t = normalizeToken({ kind: 'player', memberId: 'mem1' });
  assert.equal(memberMayMove(t, 'mem1', {}), true);
  assert.equal(memberMayMove(t, 'mem2', {}), false);
  assert.equal(memberMayMove(t, 'mem1', { playersMove: false }), false);
  assert.equal(memberMayMove(null, 'mem1', {}), false);
});

group('party codes are 6 easy characters', () => {
  const c = partyCode(() => 0.5);
  assert.match(c, /^[A-Z2-9]{6}$/);
  assert.ok(!/[01OIL]/.test(partyCode()));
  assert.equal(normalizeCode(' ab-c 12x9 '), 'ABC12X');
});

group('DM permissions: defaults for everyone, overrides per player', () => {
  const t = normalizeToken({ kind: 'player', memberId: 'a' });
  const u = normalizeToken({ kind: 'player', memberId: 'b' });
  const s = { playersMove: false, playersHp: true, perMember: { b: { move: true, hp: false } } };
  assert.deepEqual(memberPermissions('a', s), { move: false, hp: true });
  assert.deepEqual(memberPermissions('b', s), { move: true, hp: false });
  assert.equal(memberMayMove(t, 'a', s), false);
  assert.equal(memberMayMove(u, 'b', s), true);
  assert.equal(memberMayEditHp(u, 'b', s), false);
  assert.equal(memberMayEditHp(t, 'a', s), true);
  assert.equal(memberMayEditHp(u, 'a', s), false);          // never someone else's token
  assert.deepEqual(memberPermissions('x', {}), { move: true, hp: true });
  assert.equal(memberMayMove(u, 'b', { ...s, movementLocked: true }), false); // the lock beats every override
});

console.log(`${groups} test groups passed`);
