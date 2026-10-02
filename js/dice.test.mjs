// Run with: node js/dice.test.mjs
import assert from 'node:assert/strict';
import * as D from './dice.js';
import * as S from './sheet-state.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`ok - ${name}`); };
// Deterministic RNG replaying values in [0, 1). A value v on a die of n sides yields floor(v * n) + 1.
const seq = (...vals) => { let i = 0; return () => vals[i++ % vals.length]; };
// RNG that produces the given face on a die with `sides` faces.
const faces = (sides, ...values) => seq(...values.map((v) => (v - 0.5) / sides));

test('rollDie covers 1..sides and clamps an rng that returns 1', () => {
  assert.equal(D.rollDie(6, () => 0), 1);
  assert.equal(D.rollDie(6, () => 0.9999), 6);
  assert.equal(D.rollDie(20, () => 1), 20);
  assert.throws(() => D.rollDie(0));
  const counts = new Array(7).fill(0);
  for (let i = 0; i < 6000; i++) counts[D.rollDie(6)]++;
  assert.equal(counts[0], 0);
  for (let f = 1; f <= 6; f++) assert.ok(counts[f] > 800, `face ${f} appears`);
});

test('parseExpression accepts common expressions', () => {
  assert.deepEqual(D.parseExpression('2d6+3').terms, [{ type: 'dice', sign: 1, count: 2, sides: 6 }, { type: 'flat', sign: 1, value: 3 }]);
  assert.deepEqual(D.parseExpression(' D20 - 1 ').terms, [{ type: 'dice', sign: 1, count: 1, sides: 20 }, { type: 'flat', sign: -1, value: 1 }]);
  assert.equal(D.parseExpression('1d8+1d6+2').terms.length, 3);
  assert.deepEqual(D.parseExpression('4d6kh3').terms[0].keep, { mode: 'highest', count: 3 });
  assert.deepEqual(D.parseExpression('2d20kl1').terms[0].keep, { mode: 'lowest', count: 1 });
  assert.equal(D.parseExpression('-1d4+10').terms[0].sign, -1);
});

test('parseExpression rejects bad input with readable errors', () => {
  assert.throws(() => D.parseExpression(''), /Enter a dice expression/);
  assert.throws(() => D.parseExpression('hello'), /not valid/);
  assert.throws(() => D.parseExpression('5'), /at least one die/);
  assert.throws(() => D.parseExpression('0d6'), /between 1 and/);
  assert.throws(() => D.parseExpression('101d6'), /between 1 and/);
  assert.throws(() => D.parseExpression('1d1'), /sides/);
  assert.throws(() => D.parseExpression('2d6kh3'), /Cannot keep/);
  assert.throws(() => D.parseExpression('2d6++3'), /not valid/);
});

test('rollExpression sums dice and modifiers', () => {
  const r = D.rollExpression('2d6+3', { rng: faces(6, 3, 5) });
  assert.deepEqual(r.terms[0].rolls, [3, 5]);
  assert.equal(r.flat, 3);
  assert.equal(r.total, 11);
  assert.equal(D.rollExpression('1d8-2', { rng: faces(8, 1) }).total, -1);
  assert.equal(D.rollExpression('1d4+1d6', { rng: seq(0.99, 0.99) }).total, 10);
  assert.equal(D.rollExpression('-1d4+10', { rng: faces(4, 4) }).total, 6);
});

test('critical hits double the dice but not the modifier', () => {
  const r = D.rollExpression('1d8+3', { crit: true, rng: faces(8, 4, 6) });
  assert.equal(r.terms[0].count, 2);
  assert.deepEqual(r.terms[0].rolls, [4, 6]);
  assert.equal(r.total, 13);
  assert.equal(D.rollExpression('2d6+5', { crit: true, rng: () => 0 }).total, 4 + 5);
});

test('keep highest / lowest drop the other dice', () => {
  const hi = D.rollExpression('4d6kh3', { rng: faces(6, 2, 6, 3, 5) });
  assert.deepEqual(hi.terms[0].kept, [false, true, true, true]);
  assert.equal(hi.total, 14);
  const lo = D.rollExpression('2d20kl1', { rng: faces(20, 14, 7) });
  assert.equal(lo.total, 7);
});

test('minDie (Great Weapon Fighting) raises low dice but keeps the raw roll', () => {
  const r = D.rollExpression('2d6+4', { rng: faces(6, 1, 2), minDie: 3 });
  assert.deepEqual(r.terms[0].rolls, [3, 3]);
  assert.deepEqual(r.terms[0].raw, [1, 2]);
  assert.equal(r.total, 10);
  assert.deepEqual(D.rollExpression('1d4', { rng: faces(4, 1), minDie: 3 }).terms[0].rolls, [3]);
});

test('formatRoll and withModifier and averageOf', () => {
  assert.equal(D.formatRoll(D.rollExpression('2d6+3', { rng: faces(6, 3, 5) })), '2d6 [3, 5] + 3 = 11');
  assert.equal(D.formatRoll(D.rollExpression('4d6kh3', { rng: faces(6, 2, 6, 3, 5) })), '4d6 [(2), 6, 3, 5] = 14');
  assert.equal(D.formatRoll(D.rollExpression('1d8-2', { rng: faces(8, 5) })), '1d8 [5] - 2 = 3');
  assert.equal(D.withModifier('1d8', 3), '1d8+3');
  assert.equal(D.withModifier('1d8', -1), '1d8-1');
  assert.equal(D.withModifier('1d8', 0), '1d8');
  assert.equal(D.averageOf('2d6+3'), 10);
});

test('d20 tests: normal, advantage, disadvantage', () => {
  const normal = D.rollD20Test({ bonus: 5, rng: faces(20, 12) });
  assert.equal(normal.natural, 12);
  assert.equal(normal.total, 17);
  assert.equal(normal.rolls.length, 1);
  const adv = D.rollD20Test({ bonus: 2, mode: 'advantage', rng: faces(20, 4, 15) });
  assert.deepEqual(adv.rolls, [4, 15]);
  assert.equal(adv.natural, 15);
  assert.equal(adv.keptIndex, 1);
  assert.equal(adv.total, 17);
  const dis = D.rollD20Test({ bonus: 2, mode: 'disadvantage', rng: faces(20, 4, 15) });
  assert.equal(dis.natural, 4);
  assert.equal(dis.keptIndex, 0);
});

test('natural 20 and natural 1 are flagged; exhaustion penalty is applied', () => {
  const crit = D.rollD20Test({ bonus: -3, rng: faces(20, 20) });
  assert.ok(crit.crit);
  assert.ok(!crit.fumble);
  assert.equal(crit.total, 17);
  const fumble = D.rollD20Test({ bonus: 10, rng: faces(20, 1) });
  assert.ok(fumble.fumble);
  assert.equal(D.rollD20Test({ bonus: 4, penalty: 4, rng: faces(20, 10) }).total, 10);
  // Advantage keeps a natural 20 even when the other die is low.
  assert.ok(D.rollD20Test({ mode: 'advantage', rng: faces(20, 3, 20) }).crit);
});

test('attackOutcome: crit always hits, fumble always misses', () => {
  const t = (n, bonus) => D.rollD20Test({ bonus, rng: faces(20, n) });
  assert.equal(D.attackOutcome(t(20, -10), 30), 'crit');
  assert.equal(D.attackOutcome(t(1, 20), 5), 'fumble');
  assert.equal(D.attackOutcome(t(10, 5), 15), 'hit');
  assert.equal(D.attackOutcome(t(9, 5), 15), 'miss');
  assert.equal(D.attackOutcome(t(9, 5)), 'unknown');
});

test('combineModes cancels advantage with disadvantage', () => {
  assert.equal(D.combineModes('normal'), 'normal');
  assert.equal(D.combineModes('advantage', 'normal'), 'advantage');
  assert.equal(D.combineModes('disadvantage'), 'disadvantage');
  assert.equal(D.combineModes('advantage', 'disadvantage'), 'normal');
  assert.equal(D.combineModes('advantage', 'advantage', 'disadvantage'), 'normal');
});

test('death saves', () => {
  assert.deepEqual(D.rollDeathSave(faces(20, 10)), { natural: 10, successes: 1, failures: 0, revive: false });
  assert.deepEqual(D.rollDeathSave(faces(20, 9)), { natural: 9, successes: 0, failures: 1, revive: false });
  assert.equal(D.rollDeathSave(faces(20, 1)).failures, 2);
  assert.ok(D.rollDeathSave(faces(20, 20)).revive);
});

// ---------------------------------------------------------------- sheet state

const fresh = () => S.defaultSheet({ gold: 12.5 });

test('default sheet and normalisation', () => {
  const s = fresh();
  assert.equal(s.coins.gp, 12);
  assert.equal(s.coins.sp, 5);
  assert.equal(S.currentHp(s.hp, 20), 20);
  const n = S.normalizeSheet({ hp: { current: 3 }, exhaustion: 99, slotsUsed: [1] }, { gold: 0 });
  assert.equal(n.hp.current, 3);
  assert.equal(n.hp.temp, 0);
  assert.equal(n.exhaustion, 6);
  assert.equal(n.slotsUsed.length, 9);
  assert.equal(n.slotsUsed[0], 1);
});

test('damage: temp HP absorb first, then HP, never below 0', () => {
  let hp = { ...fresh().hp, temp: 5 };
  let r = S.applyDamage(hp, 3, 20);
  assert.equal(r.hp.temp, 2);
  assert.equal(r.hp.current, 20);
  assert.equal(r.absorbed, 3);
  r = S.applyDamage(r.hp, 6, 20);
  assert.equal(r.hp.temp, 0);
  assert.equal(r.hp.current, 16);
  r = S.applyDamage(r.hp, 100, 20);
  assert.equal(r.hp.current, 0);
  assert.ok(r.downed);
  assert.ok(r.died, 'overflow of 80 >= max HP is instant death');
});

test('damage that drops to 0 without overflow leaves the character dying, not dead', () => {
  const r = S.applyDamage({ ...fresh().hp, current: 5 }, 12, 20);
  assert.equal(r.hp.current, 0);
  assert.ok(r.downed);
  assert.ok(!r.died);
  assert.equal(r.hp.failures, 0);
});

test('damage at 0 HP is a death save failure (two on a crit) and three failures kill', () => {
  let hp = { ...fresh().hp, current: 0 };
  hp = S.applyDamage(hp, 4, 20).hp;
  assert.equal(hp.failures, 1);
  hp = S.applyDamage(hp, 4, 20, { crit: true }).hp;
  assert.equal(hp.failures, 3);
  assert.ok(hp.dead);
  assert.ok(S.applyDamage({ ...fresh().hp, current: 0 }, 20, 20).hp.dead, 'massive damage at 0 HP');
});

test('healing is capped, wakes the dying and does nothing for the dead', () => {
  let hp = S.applyHealing({ ...fresh().hp, current: 5 }, 100, 20);
  assert.equal(hp.current, 20);
  hp = S.applyHealing({ ...fresh().hp, current: 0, successes: 2, failures: 1 }, 4, 20);
  assert.equal(hp.current, 4);
  assert.equal(hp.successes, 0);
  assert.equal(hp.failures, 0);
  const dead = S.applyHealing({ ...fresh().hp, current: 0, dead: true }, 9, 20);
  assert.equal(dead.current, 0);
});

test('temporary HP do not stack', () => {
  assert.equal(S.grantTempHp({ temp: 5 }, 3).temp, 5);
  assert.equal(S.grantTempHp({ temp: 5 }, 8).temp, 8);
});

test('applying death saves', () => {
  let hp = { ...fresh().hp, current: 0 };
  hp = S.applyDeathSave(hp, D.rollDeathSave(faces(20, 12)));
  hp = S.applyDeathSave(hp, D.rollDeathSave(faces(20, 15)));
  assert.equal(hp.successes, 2);
  hp = S.applyDeathSave(hp, D.rollDeathSave(faces(20, 11)));
  assert.ok(hp.stable);
  let dying = { ...fresh().hp, current: 0 };
  dying = S.applyDeathSave(dying, D.rollDeathSave(faces(20, 1)));
  assert.equal(dying.failures, 2);
  dying = S.applyDeathSave(dying, D.rollDeathSave(faces(20, 5)));
  assert.ok(dying.dead);
  const revived = S.applyDeathSave({ ...fresh().hp, current: 0, failures: 2 }, D.rollDeathSave(faces(20, 20)));
  assert.equal(revived.current, 1);
  assert.equal(revived.failures, 0);
});

test('hit dice: spend heals roll + Con and is limited by level', () => {
  let sheet = { ...fresh(), hp: { ...fresh().hp, current: 5 } };
  const r = S.spendHitDie(sheet, { level: 3, roll: 4, conMod: 2, maxHp: 30 });
  assert.equal(r.healed, 6);
  assert.equal(r.sheet.hp.current, 11);
  assert.equal(r.sheet.hitDiceUsed, 1);
  assert.equal(S.hitDiceLeft(3, 1), 2);
  const none = S.spendHitDie({ ...sheet, hitDiceUsed: 3 }, { level: 3, roll: 6, conMod: 0, maxHp: 30 });
  assert.equal(none.healed, 0);
  assert.equal(none.sheet.hitDiceUsed, 3);
  // A negative Con modifier never makes a Hit Die hurt.
  assert.equal(S.spendHitDie(sheet, { level: 3, roll: 1, conMod: -3, maxHp: 30 }).healed, 0);
});

test('spell slots: spend, restore, lowest available', () => {
  const slots = [4, 3, 0, 0, 0, 0, 0, 0, 0];
  let s = fresh();
  assert.equal(S.slotsLeft(s, slots, 1), 4);
  s = S.spendSlot(s, slots, 2);
  s = S.spendSlot(s, slots, 2);
  s = S.spendSlot(s, slots, 2);
  assert.equal(S.slotsLeft(s, slots, 2), 0);
  assert.equal(S.spendSlot(s, slots, 2), null);
  assert.equal(S.lowestAvailableSlot(s, slots, 2), null);
  assert.equal(S.lowestAvailableSlot(s, slots, 1), 1);
  s = S.restoreSlot(s, 2);
  assert.equal(S.slotsLeft(s, slots, 2), 1);
  assert.equal(S.restoreSlot(fresh(), 1).slotsUsed[0], 0);
});

test('upcast dice scale per slot level', () => {
  assert.equal(S.upcastDice('3d6', '1d6', 1, 1), '3d6');
  assert.equal(S.upcastDice('3d6', '1d6', 1, 3), '5d6');
  assert.equal(S.upcastDice('2d8', '2d8', 1, 2), '4d8');
  assert.equal(S.upcastDice('3d4+3', '1d4+1', 1, 2), '3d4+3+1d4+1');
  assert.equal(S.upcastDice('3d6', null, 1, 4), '3d6');
});

test('short rest restores short-rest resources and Pact slots; long rest restores everything', () => {
  const defs = S.resourceDefs({ classId: 'fighter', speciesId: 'human', level: 5, scores: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 } });
  const byKey = Object.fromEntries(defs.map((d) => [d.key, d]));
  assert.equal(byKey.secondwind.max, 3);
  assert.equal(byKey.actionsurge.max, 1);
  let s = { ...fresh(), resUsed: { secondwind: 3, actionsurge: 1 }, pactUsed: 1, hitDiceUsed: 4, slotsUsed: [2, 1, 0, 0, 0, 0, 0, 0, 0] };
  const sr = S.shortRest(s, defs);
  assert.equal(sr.resUsed.secondwind, 2, 'Second Wind returns one use');
  assert.equal(sr.resUsed.actionsurge, 0, 'Action Surge fully returns');
  assert.equal(sr.pactUsed, 0);
  assert.equal(sr.hitDiceUsed, 4, 'a short rest does not restore Hit Dice');
  const lr = S.longRest({ ...s, hp: { ...s.hp, current: 3, temp: 4 }, exhaustion: 2, raging: true }, { level: 5, maxHp: 44 });
  assert.equal(lr.hp.current, 44);
  assert.equal(lr.hp.temp, 0);
  assert.equal(lr.hitDiceUsed, 2, 'regain half of 5 (rounded down = 2) Hit Dice');
  assert.deepEqual(lr.resUsed, {});
  assert.equal(lr.slotsUsed.every((n) => n === 0), true);
  assert.equal(lr.exhaustion, 1);
  assert.equal(lr.raging, false);
  // Always regain at least one Hit Die.
  assert.equal(S.longRest({ ...s, hitDiceUsed: 1 }, { level: 1, maxHp: 10 }).hitDiceUsed, 0);
});

test('resource definitions per class', () => {
  const sc = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 16 };
  const bard = S.resourceDefs({ classId: 'bard', speciesId: 'elf', level: 5, scores: sc });
  assert.equal(bard[0].max, 3);
  assert.equal(bard[0].short, 'all', 'Font of Inspiration at level 5');
  const paladin = S.resourceDefs({ classId: 'paladin', speciesId: 'human', level: 4, scores: sc });
  assert.equal(paladin.find((d) => d.key === 'layonhands').max, 20);
  assert.equal(S.resourceDefs({ classId: 'rogue', speciesId: 'human', level: 4, scores: sc }).length, 0);
  assert.equal(S.resourceDefs({ classId: 'rogue', speciesId: 'dragonborn', level: 5, scores: sc })[0].max, 3);
});

test('level change keeps HP and Hit Dice within limits', () => {
  const s = { ...fresh(), hp: { ...fresh().hp, current: 10 }, hitDiceUsed: 3 };
  const up = S.adjustForLevelChange(s, { oldMax: 12, newMax: 20, newLevel: 4 });
  assert.equal(up.hp.current, 18, 'gains the extra maximum HP');
  const down = S.adjustForLevelChange({ ...s, hp: { ...s.hp, current: 20 }, hitDiceUsed: 4 }, { oldMax: 24, newMax: 12, newLevel: 2 });
  assert.equal(down.hp.current, 12);
  assert.equal(down.hitDiceUsed, 2);
});

test('exhaustion penalty and concentration DC', () => {
  assert.equal(S.d20Penalty(0), 0);
  assert.equal(S.d20Penalty(3), 6);
  assert.equal(S.d20Penalty(9), 12);
  assert.equal(S.concentrationDC(4), 10);
  assert.equal(S.concentrationDC(30), 15);
  assert.equal(S.concentrationDC(31), 15);
});

test('coins: pay from gp/sp/cp first, then break larger coins', () => {
  const purse = { pp: 1, gp: 5, ep: 2, sp: 3, cp: 4 };
  assert.equal(S.coinsToGold(purse), 10 + 5 + 1 + 0.3 + 0.04);
  assert.deepEqual(S.spendCoins(purse, 2), { pp: 1, gp: 3, ep: 2, sp: 3, cp: 4 });
  assert.deepEqual(S.spendCoins(purse, 0.05), { pp: 1, gp: 5, ep: 2, sp: 2, cp: 9 });
  const big = S.spendCoins(purse, 12);
  assert.equal(S.coinsToGold(big), S.coinsToGold(purse) - 12);
  assert.equal(S.spendCoins(purse, 100), null);
  assert.deepEqual(S.spendCoins(purse, 0), purse);
});

console.log(`\n${passed} tests passed`);
