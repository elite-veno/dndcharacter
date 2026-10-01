// Run with: node js/rules.test.mjs
import assert from 'node:assert/strict';
import * as R from './rules.js';
import {
  CLASSES, CLASS_BY_ID, SPECIES, BACKGROUNDS, BACKGROUND_BY_ID, FEAT_BY_ID, WEAPON_BY_ID, ARMOR_BY_ID,
  SHIELD, SKILLS, SPELLS, SPELL_BY_ID, spellsForClass, CONDITIONS, TOOL_BY_ID, WEAPON_MASTERY,
} from './data/index.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`ok - ${name}`); };
// Deterministic RNG that replays a list of values in [0,1).
const seq = (...vals) => { let i = 0; return () => vals[i++ % vals.length]; };
const scores = (str, dex, con, int, wis, cha) => ({ str, dex, con, int, wis, cha });

test('ability modifiers', () => {
  assert.equal(R.abilityMod(10), 0);
  assert.equal(R.abilityMod(11), 0);
  assert.equal(R.abilityMod(8), -1);
  assert.equal(R.abilityMod(9), -1);
  assert.equal(R.abilityMod(15), 2);
  assert.equal(R.abilityMod(20), 5);
  assert.equal(R.abilityMod(1), -5);
  assert.equal(R.formatMod(2), '+2');
  assert.equal(R.formatMod(-1), '-1');
});

test('proficiency bonus by level', () => {
  const expected = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];
  expected.forEach((pb, i) => assert.equal(R.proficiencyBonus(i + 1), pb, `level ${i + 1}`));
  assert.throws(() => R.proficiencyBonus(0));
  assert.throws(() => R.proficiencyBonus(21));
});

test('XP to level', () => {
  assert.equal(R.levelForXp(0), 1);
  assert.equal(R.levelForXp(299), 1);
  assert.equal(R.levelForXp(300), 2);
  assert.equal(R.levelForXp(355000), 20);
});

test('point buy costs and validation (27 points, 8-15)', () => {
  assert.equal(R.pointBuyCost(8), 0);
  assert.equal(R.pointBuyCost(13), 5);
  assert.equal(R.pointBuyCost(14), 7);
  assert.equal(R.pointBuyCost(15), 9);
  assert.throws(() => R.pointBuyCost(16));
  assert.throws(() => R.pointBuyCost(7));
  const ok = R.validatePointBuy(scores(15, 15, 15, 8, 8, 8)); // 27 exactly
  assert.equal(ok.spent, 27);
  assert.ok(ok.valid);
  assert.equal(ok.remaining, 0);
  const over = R.validatePointBuy(scores(15, 15, 15, 10, 8, 8));
  assert.ok(!over.valid);
  const bad = R.validatePointBuy(scores(16, 8, 8, 8, 8, 8));
  assert.ok(!bad.valid);
  assert.equal(R.validatePointBuy(scores(8, 8, 8, 8, 8, 8)).remaining, 27);
  assert.ok(R.canIncreasePointBuy(scores(8, 8, 8, 8, 8, 8), 'str'));
  assert.ok(!R.canIncreasePointBuy(scores(15, 15, 15, 8, 8, 8), 'int'));
});

test('standard array', () => {
  assert.deepEqual(R.STANDARD_ARRAY, [15, 14, 13, 12, 10, 8]);
  assert.ok(R.validateStandardArray(scores(15, 14, 13, 12, 10, 8)).valid);
  assert.ok(R.validateStandardArray(scores(8, 10, 12, 13, 14, 15)).valid);
  assert.ok(!R.validateStandardArray(scores(15, 15, 13, 12, 10, 8)).valid);
});

test('4d6 drop lowest', () => {
  // rng 0.0 -> 1, 0.99 -> 6; dice 1,6,6,6 -> drop 1 -> 18
  const r = R.roll4d6DropLowest(seq(0, 0.99, 0.99, 0.99));
  assert.deepEqual(r.dice, [1, 6, 6, 6]);
  assert.equal(r.dropped, 1);
  assert.equal(r.total, 18);
  const low = R.roll4d6DropLowest(seq(0)); // 1,1,1,1 -> 3
  assert.equal(low.total, 3);
  assert.equal(R.rollAbilityScores(Math.random).length, 6);
  for (let i = 0; i < 200; i++) {
    const t = R.roll4d6DropLowest().total;
    assert.ok(t >= 3 && t <= 18);
  }
});

test('dice parsing and rolling', () => {
  assert.deepEqual(R.parseDice('2d6+3'), { count: 2, sides: 6, mod: 3 });
  assert.deepEqual(R.parseDice('d20-1'), { count: 1, sides: 20, mod: -1 });
  assert.deepEqual(R.parseDice('5'), { count: 0, sides: 0, mod: 5 });
  const r = R.rollDice('2d6+3', { rng: seq(0.99, 0) });
  assert.equal(r.total, 6 + 1 + 3);
  const crit = R.rollDice('1d8+2', { rng: seq(0.99), crit: true });
  assert.equal(crit.rolls.length, 2);
  assert.equal(crit.total, 8 + 8 + 2);
  const adv = R.rollD20({ bonus: 5, mode: 'advantage', rng: seq(0.0, 0.99) });
  assert.equal(adv.natural, 20);
  assert.equal(adv.total, 25);
  assert.ok(adv.crit);
  const dis = R.rollD20({ bonus: 5, mode: 'disadvantage', rng: seq(0.0, 0.99) });
  assert.equal(dis.natural, 1);
  assert.ok(dis.fumble);
});

test('background ASI +2/+1 and +1/+1/+1', () => {
  const soldier = BACKGROUND_BY_ID.soldier;
  const base = scores(15, 14, 13, 12, 10, 8);
  const a = R.applyBackgroundASI(base, soldier, { mode: 'plus2-plus1', plus2: 'str', plus1: 'con' });
  assert.deepEqual(a, scores(17, 14, 14, 12, 10, 8));
  const b = R.applyBackgroundASI(base, soldier, { mode: 'plus1-plus1-plus1' });
  assert.deepEqual(b, scores(16, 15, 14, 12, 10, 8));
  assert.throws(() => R.applyBackgroundASI(base, soldier, { mode: 'plus2-plus1', plus2: 'int', plus1: 'str' }));
  assert.throws(() => R.applyBackgroundASI(base, soldier, { mode: 'plus2-plus1', plus2: 'str', plus1: 'str' }));
  // cap at 20
  const capped = R.applyBackgroundASI(scores(19, 10, 10, 10, 10, 10), soldier, { mode: 'plus2-plus1', plus2: 'str', plus1: 'dex' });
  assert.equal(capped.str, 20);
  assert.equal(base.str, 15, 'input must not be mutated');
});

test('hit points: level 1 and fixed per-level', () => {
  assert.equal(R.hpAtLevel1(12, 2), 14); // barbarian Con +2
  assert.equal(R.hpAtLevel1(6, -1), 5);  // wizard Con -1
  assert.equal(R.hpPerLevelFixed(12, 2), 9); // 7 + 2
  assert.equal(R.hpPerLevelFixed(10, 2), 8);
  assert.equal(R.hpPerLevelFixed(8, 2), 7);
  assert.equal(R.hpPerLevelFixed(6, 2), 6);
  assert.equal(R.maxHitPoints({ hitDie: 10, level: 1, conMod: 2 }), 12);
  assert.equal(R.maxHitPoints({ hitDie: 10, level: 5, conMod: 2 }), 12 + 4 * 8);
  assert.equal(R.maxHitPoints({ hitDie: 6, level: 3, conMod: -5 }), 1 + 1 + 1); // minimum 1 per level
  // Dwarven Toughness: +1 per level
  assert.equal(R.maxHitPoints({ hitDie: 8, level: 3, conMod: 1, bonusPerLevel: 1 }), 9 + 2 * 6 + 3);
});

test('armor class', () => {
  const mods = R.abilityMods(scores(10, 16, 14, 10, 12, 8)); // dex +3, con +2, wis +1
  assert.equal(R.calculateAC({ mods }).ac, 13);
  assert.equal(R.calculateAC({ mods, armor: ARMOR_BY_ID['leather-armor'] }).ac, 14);
  assert.equal(R.calculateAC({ mods, armor: ARMOR_BY_ID['studded-leather-armor'] }).ac, 15);
  assert.equal(R.calculateAC({ mods, armor: ARMOR_BY_ID['chain-shirt'] }).ac, 15); // 13 + max 2
  assert.equal(R.calculateAC({ mods, armor: ARMOR_BY_ID['breastplate'] }).ac, 16);
  assert.equal(R.calculateAC({ mods, armor: ARMOR_BY_ID['chain-mail'] }).ac, 16); // heavy: no Dex
  assert.equal(R.calculateAC({ mods, armor: ARMOR_BY_ID['plate-armor'], shield: true }).ac, 20);
  assert.equal(R.calculateAC({ mods, shield: true }).ac, 15);
  assert.equal(R.calculateAC({ mods, armor: ARMOR_BY_ID['chain-mail'], defenseStyle: true }).ac, 17);
  assert.equal(R.calculateAC({ mods, unarmoredDefense: 'barbarian' }).ac, 15); // 10+3+2
  assert.equal(R.calculateAC({ mods, unarmoredDefense: 'barbarian', shield: true }).ac, 17);
  assert.equal(R.calculateAC({ mods, unarmoredDefense: 'monk' }).ac, 14); // 10+3+1
  assert.equal(R.calculateAC({ mods, unarmoredDefense: 'monk', shield: true }).ac, 15); // falls back to 10+dex, +2
  // Negative Dex with heavy armor is ignored; with medium it applies up to cap
  const clumsy = R.abilityMods(scores(10, 6, 10, 10, 10, 10)); // dex -2
  assert.equal(R.calculateAC({ mods: clumsy, armor: ARMOR_BY_ID['chain-mail'] }).ac, 16);
  assert.equal(R.calculateAC({ mods: clumsy, armor: ARMOR_BY_ID['breastplate'] }).ac, 12);
  assert.equal(SHIELD.acBonus, 2);
  assert.ok(R.meetsArmorStrength(ARMOR_BY_ID['chain-mail'], 13));
  assert.ok(!R.meetsArmorStrength(ARMOR_BY_ID['plate-armor'], 14));
});

test('saving throws, skills, passive perception, initiative', () => {
  const s = scores(8, 14, 13, 10, 15, 12); // fighter-ish wis 15
  const saves = R.savingThrows({ scores: s, level: 1, proficientSaves: ['str', 'con'] });
  assert.equal(saves.find((x) => x.ability === 'str').bonus, -1 + 2);
  assert.equal(saves.find((x) => x.ability === 'con').bonus, 1 + 2);
  assert.equal(saves.find((x) => x.ability === 'dex').bonus, 2);
  const percep = R.skillBonus({ skill: 'perception', scores: s, level: 5, proficiency: 1 });
  assert.equal(percep, 2 + 3);
  assert.equal(R.passiveScore(percep), 15);
  assert.equal(R.skillBonus({ skill: 'stealth', scores: s, level: 5, proficiency: 2 }), 2 + 6); // expertise
  assert.equal(R.skillBonus({ skill: 'arcana', scores: s, level: 5, proficiency: 0, jackOfAllTrades: true }), 0 + 1);
  assert.equal(R.allSkills({ scores: s, level: 1 }).length, 18);
  assert.equal(R.initiativeBonus({ scores: s, level: 1 }), 2);
  assert.equal(R.initiativeBonus({ scores: s, level: 5, alert: true }), 2 + 3);
});

test('speed', () => {
  assert.equal(R.walkingSpeed({ base: 30 }), 30);
  assert.equal(R.walkingSpeed({ base: 30, armor: ARMOR_BY_ID['plate-armor'], strength: 13 }), 20);
  assert.equal(R.walkingSpeed({ base: 30, armor: ARMOR_BY_ID['plate-armor'], strength: 15 }), 30);
  assert.equal(R.walkingSpeed({ base: 30, exhaustion: 2 }), 20);
  assert.equal(R.classSpeedBonus('barbarian', 5), 10);
  assert.equal(R.classSpeedBonus('barbarian', 4), 0);
  assert.equal(R.classSpeedBonus('barbarian', 5, { armor: ARMOR_BY_ID['plate-armor'] }), 0);
  assert.equal(R.classSpeedBonus('monk', 2), 10);
  assert.equal(R.classSpeedBonus('monk', 18), 30);
  assert.equal(R.classSpeedBonus('monk', 6, { shield: true }), 0);
});

test('spell slots: full, half, pact', () => {
  assert.deepEqual(R.spellSlots('full', 1), [2, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('full', 5), [4, 3, 2, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('full', 11), [4, 3, 3, 3, 2, 1, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('full', 20), [4, 3, 3, 3, 3, 2, 2, 1, 1]);
  assert.deepEqual(R.spellSlots('half', 1), [2, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('half', 5), [4, 2, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('half', 9), [4, 3, 2, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('half', 17), [4, 3, 3, 3, 1, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('half', 20), [4, 3, 3, 3, 2, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('pact', 1), [1, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('pact', 5), [0, 0, 2, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots('pact', 17), [0, 0, 0, 0, 4, 0, 0, 0, 0]);
  assert.deepEqual(R.spellSlots(null, 5), new Array(9).fill(0));
  assert.equal(R.highestSpellLevel('full', 9), 5);
  assert.equal(R.highestSpellLevel('half', 9), 3);
  assert.deepEqual(R.pactSlot(11), { count: 3, slotLevel: 5 });
  // Every table row is within caps
  for (let l = 1; l <= 20; l++) {
    assert.ok(R.spellSlots('full', l).reduce((a, b) => a + b, 0) >= 2);
  }
});

test('spell save DC, attack bonus, cantrip scaling', () => {
  const s = scores(8, 14, 14, 17, 12, 10); // wizard int 17 -> +3
  const sc = R.classSpellcasting('wizard', 1, s);
  assert.equal(sc.saveDC, 8 + 2 + 3);
  assert.equal(sc.attackBonus, 2 + 3);
  assert.equal(sc.cantripsKnown, 3);
  assert.equal(sc.preparedSpells, 4);
  assert.deepEqual(sc.slots, [2, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(R.classSpellcasting('fighter', 5, s), null);
  const pal = R.classSpellcasting('paladin', 1, scores(16, 10, 12, 8, 10, 14));
  assert.equal(pal.saveDC, 8 + 2 + 2);
  assert.equal(pal.preparedSpells, 2);
  assert.equal(pal.cantripsKnown, 0);
  const wl = R.classSpellcasting('warlock', 5, scores(8, 14, 14, 10, 12, 16));
  assert.deepEqual(wl.pact, { count: 2, slotLevel: 3 });
  assert.equal(R.cantripDice(1), 1);
  assert.equal(R.cantripDice(5), 2);
  assert.equal(R.cantripDice(11), 3);
  assert.equal(R.cantripDice(17), 4);
  assert.equal(R.scaleCantripDice('1d10', 11), '3d10');
});

test('weapon attacks: finesse, ranged, versatile, mastery, archery', () => {
  const s = scores(10, 16, 12, 10, 10, 10); // dex +3
  const rapier = WEAPON_BY_ID.rapier;
  const r = R.weaponAttack({ weapon: rapier, scores: s, level: 1, masteryActive: true });
  assert.equal(r.ability, 'dex');
  assert.equal(r.attackBonus, 3 + 2);
  assert.equal(r.damage, '1d8+3');
  assert.equal(r.mastery, 'vex');
  const strong = scores(18, 10, 12, 10, 10, 10);
  const gs = R.weaponAttack({ weapon: WEAPON_BY_ID.greatsword, scores: strong, level: 1 });
  assert.equal(gs.damage, '2d6+4');
  assert.equal(gs.attackBonus, 4 + 2);
  assert.equal(gs.mastery, null);
  const ls1 = R.weaponAttack({ weapon: WEAPON_BY_ID.longsword, scores: strong, level: 1 });
  const ls2 = R.weaponAttack({ weapon: WEAPON_BY_ID.longsword, scores: strong, level: 1, twoHanded: true });
  assert.equal(ls1.damage, '1d8+4');
  assert.equal(ls2.damage, '1d10+4');
  // Ranged uses Dex; Archery adds +2 to ranged only
  const lb = R.weaponAttack({ weapon: WEAPON_BY_ID.longbow, scores: s, level: 1, archery: true });
  assert.equal(lb.ability, 'dex');
  assert.equal(lb.attackBonus, 3 + 2 + 2);
  const sword = R.weaponAttack({ weapon: WEAPON_BY_ID.longsword, scores: strong, level: 1, archery: true });
  assert.equal(sword.attackBonus, 4 + 2);
  // Not proficient: no proficiency bonus
  assert.equal(R.weaponAttack({ weapon: rapier, scores: s, level: 1, proficient: false }).attackBonus, 3);
  // Thrown non-finesse melee weapon uses Str
  assert.equal(R.weaponAttack({ weapon: WEAPON_BY_ID.handaxe, scores: strong, level: 1 }).ability, 'str');
  // Off-hand: no modifier to damage unless Two-Weapon Fighting
  const off = R.weaponAttack({ weapon: WEAPON_BY_ID.shortsword, scores: s, level: 1, offhand: true });
  assert.equal(off.damage, '1d6');
  const offTwf = R.weaponAttack({ weapon: WEAPON_BY_ID.shortsword, scores: s, level: 1, offhand: true, twoWeaponFighting: true });
  assert.equal(offTwf.damage, '1d6+3');
  // Mastery DC
  assert.equal(gs.masteryDC, 8 + 4 + 2);
});

test('unarmed strikes and martial arts', () => {
  const s = scores(10, 16, 12, 10, 14, 8);
  assert.equal(R.martialArtsDieSize(1), 6);
  assert.equal(R.martialArtsDieSize(5), 8);
  assert.equal(R.martialArtsDieSize(11), 10);
  assert.equal(R.martialArtsDieSize(17), 12);
  const monk = R.unarmedStrike({ scores: s, level: 1, monkLevel: 1 });
  assert.equal(monk.damage, '1d6+3');
  assert.equal(monk.attackBonus, 3 + 2);
  const plain = R.unarmedStrike({ scores: scores(14, 10, 10, 10, 10, 10), level: 1 });
  assert.equal(plain.damage, '3'); // 1 + Str
  const staff = R.weaponAttack({ weapon: WEAPON_BY_ID.quarterstaff, scores: s, level: 5, martialArtsDie: 8 });
  assert.equal(staff.ability, 'dex');
  assert.equal(staff.damageDice, '1d8');
});

test('weapon proficiency and mastery counts', () => {
  assert.ok(R.isWeaponProficient(CLASS_BY_ID.fighter.weaponProficiency, WEAPON_BY_ID.greatsword));
  assert.ok(!R.isWeaponProficient(CLASS_BY_ID.wizard.weaponProficiency, WEAPON_BY_ID.longsword));
  assert.ok(R.isWeaponProficient(CLASS_BY_ID.wizard.weaponProficiency, WEAPON_BY_ID.dagger));
  assert.ok(R.isWeaponProficient(CLASS_BY_ID.monk.weaponProficiency, WEAPON_BY_ID.shortsword));
  assert.ok(!R.isWeaponProficient(CLASS_BY_ID.monk.weaponProficiency, WEAPON_BY_ID.longsword));
  assert.ok(R.isWeaponProficient(CLASS_BY_ID.rogue.weaponProficiency, WEAPON_BY_ID.rapier));
  assert.ok(!R.isWeaponProficient(CLASS_BY_ID.rogue.weaponProficiency, WEAPON_BY_ID.greatsword));
  assert.equal(R.weaponMasteryCount('fighter', 1), 3);
  assert.equal(R.weaponMasteryCount('fighter', 4), 4);
  assert.equal(R.weaponMasteryCount('barbarian', 1), 2);
  assert.equal(R.weaponMasteryCount('barbarian', 10), 4);
  assert.equal(R.weaponMasteryCount('wizard', 20), 0);
  assert.ok(R.isArmorTrained(CLASS_BY_ID.fighter.armorTraining, ARMOR_BY_ID['plate-armor']));
  assert.ok(!R.isArmorTrained(CLASS_BY_ID.wizard.armorTraining, ARMOR_BY_ID['leather-armor']));
});

test('carrying capacity and jumping', () => {
  assert.deepEqual(R.carryingCapacity({ strength: 10 }), { capacity: 150, pushDragLift: 300 });
  assert.deepEqual(R.carryingCapacity({ strength: 16, size: 'Medium', sizeSteps: 1 }), { capacity: 480, pushDragLift: 960 }); // Powerful Build
  assert.deepEqual(R.carryingCapacity({ strength: 10, size: 'Small' }), { capacity: 150, pushDragLift: 300 });
  assert.equal(R.jumpDistances(16).longJump, 16);
  assert.equal(R.jumpDistances(16).highJump, 6);
});

test('class progression helpers', () => {
  assert.equal(R.asiCount('wizard', 3), 0);
  assert.equal(R.asiCount('wizard', 4), 1);
  assert.equal(R.asiCount('wizard', 16), 4);
  assert.equal(R.asiCount('fighter', 14), 5);
  assert.equal(R.asiCount('rogue', 10), 3);
  const f = R.featuresAtLevel('fighter', 3).map((x) => x.name);
  assert.ok(f.includes('Second Wind') && f.includes('Improved Critical'));
  assert.ok(!R.featuresAtLevel('fighter', 2).some((x) => x.name === 'Improved Critical'));
  assert.equal(R.classResources('rogue', 5, scores(10, 16, 10, 10, 10, 10)).sneakAttack, '3d6');
  assert.equal(R.classResources('barbarian', 9, scores(16, 10, 14, 10, 10, 10)).rageDamage, 3);
  assert.equal(R.classResources('paladin', 5, scores(16, 10, 14, 10, 10, 14)).layOnHands, 25);
});

test('data integrity', () => {
  assert.equal(CLASSES.length, 12);
  assert.equal(SPECIES.length, 9);
  assert.equal(BACKGROUNDS.length, 4);
  assert.equal(SKILLS.length, 18);
  assert.equal(CONDITIONS.length, 15);
  assert.equal(Object.keys(WEAPON_MASTERY).length, 8);
  for (const c of CLASSES) {
    assert.ok([6, 8, 10, 12].includes(c.hitDie), c.id);
    assert.equal(c.savingThrows.length, 2, c.id);
    assert.ok(c.features.length > 10, c.id);
    assert.ok(c.subclass && c.subclass.level === 3, c.id);
    if (c.skillChoices.from !== 'any') for (const sk of c.skillChoices.from) assert.ok(SKILLS.some((x) => x.id === sk), `${c.id}:${sk}`);
    if (c.spellcasting) {
      assert.equal(c.spellcasting.prepared.length, 20, c.id);
      assert.ok(SPELLS.some((sp) => sp.classes.includes(c.spellcasting.spellList)), c.id);
    }
  }
  for (const b of BACKGROUNDS) {
    assert.equal(b.abilities.length, 3);
    assert.ok(FEAT_BY_ID[b.feat], `feat of ${b.id}`);
    assert.equal(FEAT_BY_ID[b.feat].category, 'origin');
    assert.equal(b.skills.length, 2);
    b.skills.forEach((sk) => assert.ok(SKILLS.some((x) => x.id === sk)));
    if (b.toolId) assert.ok(TOOL_BY_ID[b.toolId], b.toolId);
  }
  for (const sp of SPECIES) assert.ok(!('abilityBonuses' in sp), 'species must not grant ASI in 2024 rules');
  for (const w of Object.values(WEAPON_BY_ID)) assert.ok(WEAPON_MASTERY[w.mastery], `${w.id} mastery`);
  assert.ok(SPELL_BY_ID.fireball.level === 3 && SPELL_BY_ID.fireball.classes.includes('wizard'));
  assert.ok(spellsForClass('wizard', 0).length >= 10);
});

console.log(`\n${passed} test groups passed`);
