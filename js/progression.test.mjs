// Run with: node js/progression.test.mjs
import assert from 'node:assert/strict';
import * as R from './rules.js';
import { CLASSES } from './data/index.js';
import {
  progressionTable, progressionColumns, nextUnlock, subclassTimeline, subclassOverview, subclassOptions, scalingSteps, stepAt,
  scalingItems, attacksPerAction,
} from './progression.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`ok - ${name}`); };
const scores = { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 10 };
const names = (row) => row.features.map((f) => f.name);

test('table has 20 rows and marks past, current and future', () => {
  const rows = progressionTable('fighter', { subclassId: 'champion', level: 5 });
  assert.equal(rows.length, 20);
  assert.deepEqual([rows[3].state, rows[4].state, rows[5].state], ['past', 'current', 'future']);
  assert.equal(rows.filter((r) => r.state === 'current').length, 1);
});

test('table numbers match rules.js for every class and level', () => {
  for (const cls of CLASSES) {
    const rows = progressionTable(cls.id, { subclassId: cls.subclass[0].id, level: 20 });
    rows.forEach((r) => {
      assert.equal(r.pb, R.proficiencyBonus(r.level));
      assert.equal(r.hitDice, r.level);
      const sc = cls.spellcasting;
      if (sc && sc.type !== 'pact') assert.deepEqual(r.slots, R.spellSlots(sc.type, r.level));
      if (sc && sc.type === 'pact') assert.deepEqual(r.pact, R.pactSlot(r.level));
      if (!sc) assert.equal(r.prepared, null);
    });
    assert.equal(rows.filter((r) => r.asi === 'asi').length, R.asiCount(cls.id, 20));
  }
});

test('ASI and Epic Boon levels', () => {
  const asi = (id) => progressionTable(id, { level: 20 }).filter((r) => r.asi).map((r) => `${r.level}${r.asi === 'boon' ? 'b' : ''}`);
  assert.deepEqual(asi('wizard'), ['4', '8', '12', '16', '19b']);
  assert.deepEqual(asi('fighter'), ['4', '6', '8', '12', '14', '16', '19b']);
  assert.deepEqual(asi('rogue'), ['4', '8', '10', '12', '16', '19b']);
});

test('subclass features appear once chosen, placeholders before', () => {
  const none = progressionTable('barbarian', { level: 3 });
  assert.deepEqual(names(none[2]).includes('Choose your Primal Path'), true);
  assert.ok(names(none[5]).includes('Subclass feature'));
  const chosen = progressionTable('barbarian', { subclassId: 'path-of-the-berserker', level: 10 });
  assert.ok(names(chosen[2]).includes('Path of the Berserker'));
  assert.ok(names(chosen[2]).includes('Frenzy'));
  assert.ok(names(chosen[5]).includes('Mindless Rage'));
  assert.ok(!names(chosen[5]).includes('Subclass feature'));
  // below level 3 the subclass is not chosen yet, so future rows stay generic
  assert.ok(names(progressionTable('barbarian', { subclassId: 'path-of-the-berserker', level: 2 })[2]).includes('Choose your Primal Path'));
});

test('columns: caster types and non-casters', () => {
  assert.deepEqual(progressionColumns('fighter'), { cantrips: false, prepared: false, slotType: null, maxSlot: 0 });
  assert.deepEqual(progressionColumns('wizard'), { cantrips: true, prepared: true, slotType: 'full', maxSlot: 9 });
  assert.equal(progressionColumns('paladin').maxSlot, 5);
  assert.equal(progressionColumns('paladin').cantrips, false);
  assert.equal(progressionColumns('warlock').slotType, 'pact');
});

test('new spell level markers', () => {
  const rows = progressionTable('wizard', { level: 1 });
  assert.deepEqual(rows.filter((r) => r.newSpellLevel).map((r) => [r.level, r.newSpellLevel]), [[1, 1], [3, 2], [5, 3], [7, 4], [9, 5], [11, 6], [13, 7], [15, 8], [17, 9]]);
});

test('next unlock', () => {
  assert.deepEqual(nextUnlock({ classId: 'fighter', level: 2 }), { level: 3, text: 'Choose your Martial Archetype', now: false });
  assert.deepEqual(nextUnlock({ classId: 'fighter', level: 3 }), { level: 3, text: 'Choose your Martial Archetype', now: true });
  assert.equal(nextUnlock({ classId: 'fighter', level: 4, subclassId: 'champion' }).level, 5);
  assert.match(nextUnlock({ classId: 'fighter', level: 4, subclassId: 'champion' }).text, /Extra Attack/);
  assert.equal(nextUnlock({ classId: 'barbarian', level: 4, subclassId: 'path-of-the-berserker' }).text.split(',')[0], 'Extra Attack');
  assert.equal(nextUnlock({ classId: 'wizard', level: 20, subclassId: 'school-of-evocation' }), null);
  // a level with only an ASI still counts
  assert.equal(nextUnlock({ classId: 'wizard', level: 11, subclassId: 'school-of-evocation' }).level, 12);
});

test('subclass timeline and overview', () => {
  const sub = R.getSubclass('cleric', 'life');
  const t = subclassTimeline(sub, 3);
  assert.ok(t.every((f) => f.level >= 3));
  assert.ok(t.some((f) => f.unlocked) && t.some((f) => !f.unlocked));
  assert.deepEqual(t.map((f) => f.level), [...t.map((f) => f.level)].sort((a, b) => a - b));
  assert.equal(t.every((f) => f.unlocked === (f.level <= 3)), true);
  const o = subclassOverview(sub);
  assert.equal(o.name, sub.name);
  assert.ok(o.features.length > 0);
  assert.equal(subclassOptions('cleric').length, CLASSES.find((c) => c.id === 'cleric').subclass.length);
  assert.deepEqual(subclassTimeline(null, 5), []);
});

test('scalingSteps and stepAt', () => {
  const steps = scalingSteps((l) => R.proficiencyBonus(l));
  assert.deepEqual(steps.map((s) => s.level), [1, 5, 9, 13, 17]);
  assert.equal(stepAt(steps, 8), '3');
  assert.equal(stepAt(steps, 20), '6');
});

test('scaling items come from rules', () => {
  const get = (id, opts) => Object.fromEntries(scalingItems(id, { scores, ...opts }).map((i) => [i.id, i]));
  const f = get('fighter', { level: 11, subclassId: 'champion' });
  assert.equal(f.pb.current, '+4');
  assert.deepEqual(f['extra-attack'].steps.map((s) => [s.level, s.value]), [[1, '1'], [5, '2'], [11, '3'], [20, '4']]);
  assert.equal(f.secondWind.current, '4');
  assert.equal(f.indomitable.current, '1');
  const b = get('barbarian', { level: 9 });
  assert.equal(b.rageDamage.current, '+3');
  assert.deepEqual(b.rages.steps.map((s) => s.value).slice(-1), ['Unlimited']);
  assert.equal(get('rogue', { level: 5 }).sneakAttack.current, '3d6');
  assert.equal(get('wizard', { level: 5 })['cantrip-dice'].current, '2d10');
  assert.deepEqual(get('wizard', { level: 1 })['cantrip-dice'].steps.map((s) => s.level), [1, 5, 11, 17]);
  assert.equal(get('warlock', { level: 5 }).pact.current, '2 x 3rd-level');
  assert.equal(get('cleric', { level: 6 }).channelDivinity.current, '3');
  assert.equal(get('druid', { level: 17 }).wildShape.current, '4');
  assert.equal(get('monk', { level: 5 }).martialArtsDie.current, 'd8');
  assert.equal(get('paladin', { level: 4 }).layOnHands.current, '20');
  assert.equal(get('bard', { level: 10 }).inspirationDie.current, 'd10');
  assert.equal(get('ranger', { level: 9 }).favoredEnemy.current, '4');
  assert.equal(get('fighter', { level: 3 }).superiority, undefined);
  assert.equal(get('fighter', { level: 7, subclassId: 'battle-master' }).superiority.current, '5d8');
  assert.equal(get('fighter', { level: 2, subclassId: 'battle-master' }).superiority, undefined);
  assert.equal(get('wizard', { level: 5 })['extra-attack'], undefined);
});

test('Extra Attack counts class and subclass features', () => {
  assert.equal(attacksPerAction('fighter', 4), 1);
  assert.equal(attacksPerAction('fighter', 5), 2);
  assert.equal(attacksPerAction('fighter', 20), 4);
  assert.equal(attacksPerAction('monk', 5), 2);
  assert.equal(attacksPerAction('wizard', 20), 1);
});

test('resource helpers in rules.js', () => {
  assert.equal(R.channelDivinityUses('cleric', 1), 0);
  assert.equal(R.channelDivinityUses('cleric', 18), 4);
  assert.equal(R.channelDivinityUses('paladin', 11), 3);
  assert.equal(R.wildShapeUses(1), 0);
  assert.equal(R.wildShapeUses(6), 3);
  assert.equal(R.indomitableUses(8), 0);
  assert.equal(R.indomitableUses(17), 3);
  assert.equal(R.favoredEnemyUses(1), 2);
  assert.equal(R.favoredEnemyUses(17), 6);
  assert.deepEqual(R.superiorityDice(3), { count: 4, die: 8 });
  assert.deepEqual(R.superiorityDice(18), { count: 6, die: 12 });
  assert.equal(R.classResources('cleric', 6, scores).channelDivinity, 3);
});

console.log(`${passed} test groups passed`);
