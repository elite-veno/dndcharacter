// Run with: node js/explain.test.mjs
// Cross-checks the Calculations explanations against the numbers the sheet actually shows.
import assert from 'node:assert/strict';
import * as R from './rules.js';
import { ARMOR_BY_ID, CLASSES, SUBCLASS_BY_ID } from './data/index.js';
import { deriveCharacter, normalizeCharacter } from './character.js';
import { explainCharacter, groupOfRow, joinTerms, classResourceRows } from './explain.js';
import { buildAttacks } from './sheet/combat.js';
import { totalWeight } from './inventory.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`ok - ${name}`); };
const scores = (str, dex, con, int, wis, cha) => ({ str, dex, con, int, wis, cha });

const make = (over) => normalizeCharacter({
  id: 'x', name: 'Test', level: 6, backgroundId: 'acolyte', speciesId: 'human', classId: 'fighter', subclassId: 'champion',
  abilityMethod: 'manual', manual: scores(15, 14, 13, 10, 12, 8), bgAsi: { mode: 'plus2-plus1', plus2: 'str', plus1: 'con' },
  levelAsi: [{ type: 'asi', mode: 'plus2', a: 'str' }], classSkills: ['athletics', 'perception'], expertise: [],
  equipment: { items: [{ id: 'chain-shirt', qty: 1, equipped: true }, { id: 'shield', qty: 1, equipped: true }, { id: 'longsword', qty: 1, equipped: true }, { id: 'shortbow', qty: 1 }] },
  sheet: undefined, ...over,
});

function explain(c) {
  c.sheet = { weaponOpts: {}, conditions: [], exhaustion: 0 };
  const d = deriveCharacter(c);
  const groups = explainCharacter({ c, d, attacks: buildAttacks(c, d), weight: totalWeight(c.equipment.items), sheet: c.sheet });
  const rows = Object.fromEntries(groups.flatMap((g) => g.rows).map((r) => [r.id, r]));
  return { c, d, groups, rows };
}

test('joinTerms formats signs and notes', () => {
  assert.equal(joinTerms([{ label: 'Chain Shirt', value: 13 }, { label: 'Dex', value: 2, note: 'max 2' }, { label: 'Shield', value: 2 }]), 'Chain Shirt 13 + Dex 2 (max 2) + Shield 2');
  assert.equal(joinTerms([{ label: 'Base', value: 10 }, { label: 'Dex', value: -1 }]), 'Base 10 - Dex 1');
});

test('acTerms total always equals calculateAC', () => {
  const armors = [null, ARMOR_BY_ID['leather-armor'], ARMOR_BY_ID['chain-shirt'], ARMOR_BY_ID['plate-armor']];
  for (const armor of armors) for (const shield of [false, true]) for (const ud of [null, 'barbarian', 'monk']) for (const defenseStyle of [false, true]) {
    for (const dex of [-1, 2, 4]) {
      const args = { armor, shield, mods: { str: 0, dex, con: 2, int: 0, wis: 3, cha: 0 }, unarmoredDefense: ud, defenseStyle: defenseStyle && !!armor, bonus: 1 };
      assert.equal(R.acTerms(args).total, R.calculateAC(args).ac);
    }
  }
  const chain = R.acTerms({ armor: ARMOR_BY_ID['chain-shirt'], shield: true, mods: { dex: 4, con: 0, wis: 0 } });
  assert.deepEqual(chain.terms.map((t) => t.value), [13, 2, 2]);
  assert.equal(chain.terms[1].note, 'max 2');
  assert.equal(R.acTerms({ armor: ARMOR_BY_ID['plate-armor'], mods: { dex: 4 } }).terms[1].value, 0);
});

test('hpProgression matches maxHitPoints and the running sum', () => {
  for (const hitDie of [6, 8, 10, 12]) for (const conMod of [-2, 0, 3]) for (const level of [1, 2, 7, 20]) for (const bonusPerLevel of [0, 1]) {
    const p = R.hpProgression({ hitDie, level, conMod, bonusPerLevel });
    assert.equal(p.total, R.maxHitPoints({ hitDie, level, conMod, bonusPerLevel }));
    assert.equal(p.levels.length, level);
    assert.equal(p.levels.at(-1).running, p.total);
  }
  assert.equal(R.hpProgression({ hitDie: 10, level: 3, conMod: 2 }).levels.map((l) => l.running).join(), '12,20,28');
});

test('every numeric row agrees with the derived sheet values', () => {
  const { d, rows } = explain(make({}));
  assert.equal(rows.pb.value, d.pb);
  assert.equal(rows.initiative.value, d.initiative);
  assert.equal(rows.ac.value, d.ac.ac);
  assert.equal(rows.speed.value, d.speed);
  assert.equal(rows.hp.value, d.hp);
  assert.equal(rows['hp-running'].value, d.hp);
  assert.equal(rows.hitdice.value, d.level);
  assert.equal(rows['passive-perception'].value, d.passivePerception);
  for (const sv of d.saves) assert.equal(rows[`save-${sv.ability}`].value, sv.bonus);
  for (const sk of d.skills) assert.equal(rows[`skill-${sk.id}`].value, sk.bonus);
  for (const id of Object.keys(d.scores)) { assert.equal(rows[`ability-${id}`].value, d.mods[id]); assert.match(rows[`ability-${id}`].result, new RegExp(`^${d.scores[id]} `)); }
  assert.equal(rows.capacity.value, d.scores.str * 15);
});

test('AC row spells out the exact terms in use', () => {
  const { d, rows } = explain(make({}));
  assert.equal(d.ac.ac, 13 + 2 + 2);
  assert.equal(rows.ac.formula, 'Chain Shirt 13 + Dex 2 (max 2) + Shield 2 = 17');
});

test('HP formula lists level 1 and per-level gains', () => {
  const { d, rows } = explain(make({}));
  assert.equal(d.hp, 10 + 1 + 5 * (6 + 1));
  assert.match(rows.hp.formula, /Level 1: d10 max 10 \+1 Con = 11/);
  assert.match(rows.hp.formula, /levels 2-6: \(10\/2 \+ 1 = 6\) \+1 Con = 7 each, x 5 = 35; total 46/);
  assert.match(rows['hp-running'].formula, /^L1 11 → L2 18/);
});

test('attack and damage rows match buildAttacks', () => {
  const c = make({});
  const { d, rows } = explain(c);
  const attacks = buildAttacks(c, d);
  for (const a of attacks) {
    assert.equal(rows[`atk-${a.key}`].value, a.attackBonus, a.key);
    assert.match(rows[`atk-${a.key}`].formula, new RegExp(`= ${R.formatMod(a.attackBonus).replace('+', '\\+')}$`));
    assert.equal(rows[`dmg-${a.key}`].value, a.flat ? Math.max(0, 1 + a.damageBonus) : a.damageBonus);
  }
  assert.equal(rows['atk-longsword'].value, d.mods.str + d.pb);
});

test('finesse, off-hand and Archery reasons show in the weapon notes', () => {
  const c = make({ fightingStyle: 'archery', equipment: { items: [{ id: 'rapier', qty: 1, equipped: true }, { id: 'longbow', qty: 1 }] }, sheet: undefined });
  const { rows } = explain(c);
  assert.match(rows['atk-rapier'].note, /Finesse/);
  assert.match(rows['atk-longbow'].formula, /Archery style 2/);
});

test('spell rows reuse the class spellcasting numbers', () => {
  const c = make({ classId: 'wizard', subclassId: 'school-of-evocation', abilityMethod: 'manual', manual: scores(8, 14, 13, 15, 12, 10), cantrips: [], spells: [] });
  const { d, rows } = explain(c);
  assert.equal(rows['spell-dc'].value, 8 + d.pb + d.mods.int);
  assert.equal(rows['spell-dc'].value, d.spellcasting.saveDC);
  assert.equal(rows['spell-attack'].value, d.spellcasting.attackBonus);
  assert.equal(rows['spell-dc'].formula, `8 + proficiency +${d.pb} + Int ${R.formatMod(d.mods.int)} = ${d.spellcasting.saveDC}`);
  assert.equal(rows['cantrip-dice'].value, R.cantripDice(d.level));
});

test('non-casters have no spell group; groupOfRow finds rows', () => {
  const { groups } = explain(make({}));
  assert.ok(!groups.some((g) => g.id === 'spells'));
  assert.equal(groupOfRow(groups, 'ac'), 'combat');
  assert.equal(groupOfRow(groups, 'hp'), 'hp');
  assert.equal(groupOfRow(groups, 'nope'), null);
});

test('unarmored defense, expertise and Jack of All Trades are explained', () => {
  const bar = explain(make({ classId: 'barbarian', subclassId: 'path-of-the-berserker', equipment: { items: [] } }));
  assert.match(bar.rows.ac.formula, /^Base 10 \+ Dex 2 \+ Con \d = /);
  assert.equal(bar.rows.ac.value, bar.d.ac.ac);
  const bard = explain(make({ classId: 'bard', subclassId: 'college-of-lore', equipment: { items: [] }, level: 6 }));
  const nonProf = bard.d.skills.find((s) => s.proficiency === 0);
  assert.match(bard.rows[`skill-${nonProf.id}`].formula, /Jack of All Trades/);
  assert.equal(bard.rows[`skill-${nonProf.id}`].value, nonProf.bonus);
});

test('scaling group: ASI levels and subclass unlock', () => {
  const lvl2 = explain(make({ level: 2, subclassId: null }));
  assert.match(lvl2.rows['scale-subclass'].result, /Unlocks at level 3/);
  const lvl6 = explain(make({}));
  assert.equal(lvl6.rows['scale-asi'].value, 2);
  assert.match(lvl6.rows['scale-asi'].formula, /4, 6, 8, 12, 14, 16/);
  assert.equal(lvl6.rows['scale-subclass'].result, SUBCLASS_BY_ID.champion.name);
  assert.ok(classResourceRows(lvl6.c, lvl6.d).length >= 3);
});

test('every class and level 1-20 explains without errors', () => {
  for (const cls of CLASSES) for (const level of [1, 3, 5, 11, 20]) {
    const c = make({ classId: cls.id, subclassId: cls.subclass?.[0]?.id, level, levelAsi: [], equipment: { items: [] } });
    const { d, rows } = explain(c);
    assert.equal(rows.hp.value, d.hp);
    assert.equal(rows.ac.value, d.ac.ac);
  }
});

console.log(`${passed} test groups passed`);
