// Run with: node js/custom-sheet.test.mjs
import assert from 'node:assert/strict';
import {
  validateCounter, normalizeCounters, adjustCounter, restCounters, parseDiceString, validateFeature, normalizeFeatures,
  validateAttack, normalizeAttacks, customAttackToAttack, validateCustomItem, customItemWeight, duplicateCharacter, LIMITS,
} from './custom-sheet.js';
import { createHistory, snapshotOf, restoreInto, isTypingTarget, HISTORY_LIMIT } from './history.js';
import { normalizeSheet, shortRest, longRest, defaultSheet } from './sheet-state.js';
import { totalWeight } from './inventory.js';
import { rollExpression } from './dice.js';

let groups = 0;
const group = (name, fn) => { try { fn(); groups++; } catch (e) { console.error(`FAIL: ${name}`); throw e; } };

group('counter validation', () => {
  const ok = validateCounter({ name: ' Potion ', max: '3', recharge: 'long', dice: '2d4+2' });
  assert.ok(ok.ok);
  assert.deepEqual(ok.value, { name: 'Potion', current: 3, max: 3, recharge: 'long', dice: '2d4+2' });
  assert.equal(validateCounter({ name: '', max: 3 }).errors.name.length > 0, true);
  assert.ok(validateCounter({ name: 'x', max: 0 }).errors.max);
  assert.ok(validateCounter({ name: 'x', max: 20000 }).errors.max);
  assert.ok(validateCounter({ name: 'x', max: 3, current: -1 }).errors.current);
  assert.equal(validateCounter({ name: 'x', max: 3, current: 9 }).value.current, 3);
  assert.equal(validateCounter({ name: 'x', max: 3, recharge: 'bogus' }).value.recharge, 'none');
  assert.equal(validateCounter({ name: 'x', max: 3, current: 0 }).value.current, 0);
});

group('counter normalisation drops junk and keeps ids', () => {
  const list = normalizeCounters([{ id: 'a', name: 'A', max: 2, current: 1 }, null, 5, { name: '' }, { name: 'B', max: 4 }]);
  assert.equal(list.length, 2);
  assert.equal(list[0].id, 'a');
  assert.ok(list[1].id.startsWith('ctr-'));
  assert.deepEqual(normalizeCounters(undefined), []);
  assert.equal(normalizeCounters(Array.from({ length: 80 }, (_, i) => ({ name: `n${i}`, max: 1 }))).length, LIMITS.counters);
});

group('adjustCounter clamps', () => {
  const c = { id: 'a', name: 'A', max: 3, current: 3, recharge: 'none', dice: '' };
  assert.equal(adjustCounter(c, 1).current, 3);
  assert.equal(adjustCounter(c, -1).current, 2);
  assert.equal(adjustCounter({ ...c, current: 0 }, -1).current, 0);
  assert.equal(c.current, 3, 'pure');
});

group('rest handling', () => {
  const mk = (recharge) => ({ id: recharge, name: recharge, max: 4, current: 1, recharge, dice: '' });
  const list = [mk('none'), mk('short'), mk('long')];
  const s = restCounters(list, 'short');
  assert.deepEqual(s.map((c) => c.current), [1, 4, 1]);
  const l = restCounters(list, 'long');
  assert.deepEqual(l.map((c) => c.current), [1, 4, 4]);
  assert.deepEqual(restCounters(list, 'nonsense').map((c) => c.current), [1, 1, 1]);
  assert.deepEqual(list.map((c) => c.current), [1, 1, 1], 'input untouched');
  assert.deepEqual(restCounters(undefined, 'long'), []);
});

group('sheet rests reset counters', () => {
  const sheet = normalizeSheet({ counters: [
    { id: 'n', name: 'N', max: 2, current: 0, recharge: 'none' },
    { id: 's', name: 'S', max: 2, current: 0, recharge: 'short' },
    { id: 'l', name: 'L', max: 2, current: 0, recharge: 'long' },
  ] });
  assert.deepEqual(shortRest(sheet, []).counters.map((c) => c.current), [0, 2, 0]);
  assert.deepEqual(longRest(sheet, { level: 5, maxHp: 30 }).counters.map((c) => c.current), [0, 2, 2]);
});

group('old saves get defaults', () => {
  const s = normalizeSheet({ notes: 'hi', hp: { current: 5 } });
  assert.deepEqual([s.counters, s.customFeatures, s.customAttacks], [[], [], []]);
  assert.deepEqual(defaultSheet().counters, []);
  const t = normalizeSheet({ counters: 'bad', customFeatures: {}, customAttacks: [{ name: 'x', damage: 'nope' }] });
  assert.deepEqual([t.counters, t.customFeatures, t.customAttacks], [[], [], []]);
});

group('dice strings reuse the dice parser', () => {
  assert.deepEqual(parseDiceString(' 1D8 + 3 '), { ok: true, expr: '1d8+3' });
  assert.ok(parseDiceString('2d6+1d4+2').ok);
  assert.equal(parseDiceString('abc').ok, false);
  assert.equal(parseDiceString('').ok, false);
  assert.equal(parseDiceString('5').ok, false);
  assert.equal(parseDiceString('500d6').ok, false);
});

group('feature validation', () => {
  assert.deepEqual(validateFeature({ title: ' Boon ', text: ' text ' }).value, { title: 'Boon', text: 'text' });
  assert.ok(validateFeature({ title: ' ' }).errors.title);
  assert.equal(normalizeFeatures([{ title: 'A' }, { title: '' }]).length, 1);
});

group('attack validation and conversion', () => {
  const r = validateAttack({ name: 'Flame Tongue', toHit: '+7', damage: '1d8 + 3', damageType: ' Fire ' });
  assert.ok(r.ok);
  assert.deepEqual(r.value, { name: 'Flame Tongue', toHit: 7, damage: '1d8+3', damageType: 'fire' });
  assert.ok(validateAttack({ name: 'x', toHit: 100, damage: '1d4' }).errors.toHit);
  assert.ok(validateAttack({ name: 'x', toHit: 1, damage: 'oops' }).errors.damage);
  assert.ok(validateAttack({ name: 'x', toHit: 1, damage: '' }).errors.damage);
  assert.ok(validateAttack({ name: '', toHit: 1, damage: '1d4' }).errors.name);
  assert.equal(validateAttack({ name: 'x', toHit: '', damage: '1d4' }).value.toHit, 0);
  assert.equal(normalizeAttacks([{ id: 'q', ...r.value }, { name: 'bad' }]).length, 1);
  const a = customAttackToAttack({ id: 'q', ...r.value });
  assert.equal(a.key, 'custom-q');
  assert.equal(a.attackBonus, 7);
  assert.equal(a.damageDice, '1d8+3');
  assert.equal(a.damageBonus, 0);
  assert.equal(a.flat, false);
  // crit doubles dice but not the flat bonus
  const crit = rollExpression(a.damageDice, { crit: true, rng: () => 0.5 });
  assert.equal(crit.terms[0].count, 2);
  assert.equal(crit.flat, 3);
});

group('custom items count toward carried weight and never need catalog data', () => {
  const r = validateCustomItem({ name: 'Rope of climbing', qty: '2', weight: '3.5', note: 'x', equipped: true });
  assert.ok(r.ok);
  assert.deepEqual(r.value, { name: 'Rope of climbing', qty: 2, weight: 3.5, note: 'x', equipped: true });
  assert.ok(validateCustomItem({ name: 'x', qty: 0 }).errors.qty);
  assert.ok(validateCustomItem({ name: 'x', qty: 1, weight: -2 }).errors.weight);
  assert.ok(validateCustomItem({ name: '', qty: 1 }).errors.name);
  assert.equal(validateCustomItem({ name: 'x', qty: 1 }).value.weight, 0);
  assert.equal(customItemWeight({ qty: 3, weight: 2 }), 6);
  assert.equal(customItemWeight({ qty: 3 }), 0);
  const items = [{ id: 'custom-1', custom: true, qty: 2, weight: 3.5, equipped: true }, { id: 'rope-hempen', qty: 1 }, { id: 'custom-2', custom: true, qty: 1 }];
  const base = totalWeight(items.slice(1, 2));
  assert.equal(totalWeight(items), base + 7);
});

group('duplicateCharacter', () => {
  const c = { id: 'c_1', name: 'Mira', createdAt: 1, updatedAt: 2, sheet: { counters: [{ id: 'a' }] }, equipment: { items: [] } };
  const d = duplicateCharacter(c, () => 'c_2');
  assert.equal(d.id, 'c_2');
  assert.equal(d.name, 'Mira (copy)');
  assert.notEqual(d.sheet, c.sheet);
  d.sheet.counters[0].id = 'z';
  assert.equal(c.sheet.counters[0].id, 'a', 'deep copy');
  assert.equal(c.name, 'Mira');
  assert.equal(duplicateCharacter({ name: '' }, () => 'x').name, 'Unnamed hero (copy)');
  assert.equal(duplicateCharacter(d, () => 'y').name, 'Mira (copy) (copy)');
});

// ---------------------------------------------------------------- history

group('history basics', () => {
  const h = createHistory();
  assert.equal(h.canUndo, false);
  assert.equal(h.undo('x'), null);
  assert.equal(h.commit('a', 'a'), false);
  assert.equal(h.canUndo, false);
  h.commit('a', 'b');
  h.commit('b', 'c');
  assert.equal(h.undoCount, 2);
  assert.equal(h.undo('c'), 'b');
  assert.equal(h.undo('b'), 'a');
  assert.equal(h.undo('a'), null);
  assert.equal(h.canRedo, true);
  assert.equal(h.redo('a'), 'b');
  assert.equal(h.redo('b'), 'c');
  assert.equal(h.redo('c'), null);
});

group('a new change clears redo', () => {
  const h = createHistory();
  h.commit('a', 'b');
  h.undo('b');
  assert.equal(h.canRedo, true);
  h.commit('a', 'z');
  assert.equal(h.canRedo, false);
  assert.equal(h.undo('z'), 'a');
});

group('history is capped at 30', () => {
  const h = createHistory();
  assert.equal(HISTORY_LIMIT, 30);
  for (let i = 0; i < 50; i++) h.commit(`s${i}`, `s${i + 1}`);
  assert.equal(h.undoCount, 30);
  let cur = 's50';
  let last = null;
  for (let i = 0; i < 40; i++) { const prev = h.undo(cur); if (prev === null) break; last = prev; cur = prev; }
  assert.equal(last, 's20', 'oldest reachable state');
});

group('typing coalesces by key and time', () => {
  const h = createHistory({ coalesceMs: 1000 });
  assert.equal(h.commit('', 'a', { key: 'text', now: 0 }), true);
  assert.equal(h.commit('a', 'ab', { key: 'text', now: 400 }), false);
  assert.equal(h.commit('ab', 'abc', { key: 'text', now: 900 }), false, 'measured from the last keystroke');
  assert.equal(h.undoCount, 1);
  assert.equal(h.commit('abc', 'abcd', { key: 'text', now: 5000 }), true, 'pause starts a new step');
  assert.equal(h.commit('abcd', 'x', { now: 5100 }), true, 'keyless changes never merge');
  assert.equal(h.undo('x'), 'abcd');
  assert.equal(h.undo('abcd'), 'abc');
  assert.equal(h.undo('abc'), '');
});

group('snapshots ignore the selected tab and restore in place', () => {
  const c = { id: 'c1', name: 'A', sheet: { tab: 'actions', hp: { current: 3 }, counters: [] }, equipment: { items: [] } };
  const s1 = snapshotOf(c);
  c.sheet.tab = 'inventory';
  assert.equal(snapshotOf(c), s1, 'tab is not a mutation');
  c.sheet.hp.current = 9;
  c.name = 'B';
  c.extra = true;
  const ref = c;
  restoreInto(c, s1);
  assert.equal(ref, c);
  assert.equal(c.name, 'A');
  assert.equal(c.sheet.hp.current, 3);
  assert.equal('extra' in c, false);
  assert.equal(c.sheet.tab, 'inventory', 'current tab kept');
});

group('typing targets', () => {
  const el = (tagName, extra = {}) => ({ tagName, ...extra });
  assert.equal(isTypingTarget(el('TEXTAREA')), true);
  assert.equal(isTypingTarget(el('INPUT', { type: 'text' })), true);
  assert.equal(isTypingTarget(el('INPUT', { type: 'number' })), true);
  assert.equal(isTypingTarget(el('INPUT', { type: 'checkbox' })), false);
  assert.equal(isTypingTarget(el('BUTTON')), false);
  assert.equal(isTypingTarget(el('DIV', { isContentEditable: true })), true);
  assert.equal(isTypingTarget(null), false);
});

console.log(`custom-sheet.test.mjs: ${groups} groups passed`);
