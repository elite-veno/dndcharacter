// Pure rules engine for the 2024 (5.5e) rules. No DOM, no side effects.
// Every function takes plain data in and returns plain data out; randomness is injectable via `rng`.

import { ABILITY_IDS, SKILLS, SIZES } from './data/skills.js';
import { CLASS_BY_ID, FULL_CASTER_SLOTS, HALF_CASTER_SLOTS, PACT_SLOTS, XP_THRESHOLDS } from './data/classes.js';
import { ASI_LEVELS, ASI_LEVELS_BY_CLASS } from './data/feats.js';

export const MAX_LEVEL = 20;

// ---------------------------------------------------------------- basics

/** Ability modifier: floor((score - 10) / 2). */
export const abilityMod = (score) => Math.floor((score - 10) / 2);

/** Format a modifier with an explicit sign, e.g. +3 / -1 / +0. */
export const formatMod = (n) => (n >= 0 ? `+${n}` : `${n}`);

/** Proficiency bonus by character level: +2 at 1-4, +3 at 5-8, ... +6 at 17-20. */
export function proficiencyBonus(level) {
  assertLevel(level);
  return 2 + Math.floor((level - 1) / 4);
}

export function levelForXp(xp) {
  let level = 1;
  XP_THRESHOLDS.forEach((t, i) => { if (xp >= t) level = i + 1; });
  return level;
}

function assertLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    throw new RangeError(`Level must be an integer from 1 to ${MAX_LEVEL}, got ${level}`);
  }
}

/** Convert a scores object into modifiers. */
export function abilityMods(scores) {
  return Object.fromEntries(ABILITY_IDS.map((id) => [id, abilityMod(scores[id])]));
}

// ---------------------------------------------------------------- dice

const defaultRng = Math.random;

/** Roll one die with `sides` faces (1..sides). */
export function rollDie(sides, rng = defaultRng) {
  return Math.floor(rng() * sides) + 1;
}

/** Parse '2d6+3', '1d8', 'd20-1' or '5' into { count, sides, mod }. */
export function parseDice(expr) {
  const m = String(expr).replace(/\s+/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$|^([+-]?\d+)$/i);
  if (!m) throw new Error(`Invalid dice expression: ${expr}`);
  if (m[4] !== undefined) return { count: 0, sides: 0, mod: Number(m[4]) };
  return { count: m[1] === '' ? 1 : Number(m[1]), sides: Number(m[2]), mod: m[3] ? Number(m[3]) : 0 };
}

/** Roll a dice expression. On a critical hit the dice (not the modifier) are doubled. */
export function rollDice(expr, { rng = defaultRng, crit = false } = {}) {
  const { count, sides, mod } = parseDice(expr);
  const n = crit ? count * 2 : count;
  const rolls = Array.from({ length: n }, () => rollDie(sides, rng));
  return { expression: expr, rolls, mod, total: rolls.reduce((a, b) => a + b, 0) + mod };
}

/**
 * Roll a d20 test. mode: 'normal' | 'advantage' | 'disadvantage'.
 * Returns the kept natural roll, total, and whether it is a natural 20 / natural 1.
 */
export function rollD20({ bonus = 0, mode = 'normal', rng = defaultRng } = {}) {
  const first = rollDie(20, rng);
  const rolls = mode === 'normal' ? [first] : [first, rollDie(20, rng)];
  const natural = mode === 'advantage' ? Math.max(...rolls) : mode === 'disadvantage' ? Math.min(...rolls) : first;
  return { rolls, natural, bonus, total: natural + bonus, mode, crit: natural === 20, fumble: natural === 1 };
}

// ---------------------------------------------------------------- ability score generation

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;
export const POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

/** Cost of raising a single score from 8 to `score` under Point Buy (throws outside 8-15). */
export function pointBuyCost(score) {
  if (!(score in POINT_BUY_COSTS)) throw new RangeError(`Point Buy scores must be ${POINT_BUY_MIN}-${POINT_BUY_MAX}, got ${score}`);
  return POINT_BUY_COSTS[score];
}

/** Validate a Point Buy allocation { str, dex, ... }. */
export function validatePointBuy(scores) {
  const errors = [];
  let spent = 0;
  for (const id of ABILITY_IDS) {
    const s = scores[id];
    if (!Number.isInteger(s) || s < POINT_BUY_MIN || s > POINT_BUY_MAX) {
      errors.push(`${id.toUpperCase()} must be between ${POINT_BUY_MIN} and ${POINT_BUY_MAX}`);
    } else spent += POINT_BUY_COSTS[s];
  }
  if (spent > POINT_BUY_BUDGET) errors.push(`Spent ${spent} points, budget is ${POINT_BUY_BUDGET}`);
  return { valid: errors.length === 0, spent, remaining: POINT_BUY_BUDGET - spent, errors };
}

/** Can this score be raised by one under the remaining Point Buy budget? */
export function canIncreasePointBuy(scores, id) {
  const s = scores[id];
  if (s >= POINT_BUY_MAX) return false;
  return validatePointBuy({ ...scores, [id]: s + 1 }).valid;
}

/** Validate Standard Array assignment { str: 15, ... }: each array value used exactly once. */
export function validateStandardArray(scores) {
  const used = ABILITY_IDS.map((id) => scores[id]).sort((a, b) => b - a);
  const valid = used.length === STANDARD_ARRAY.length && used.every((v, i) => v === STANDARD_ARRAY[i]);
  return { valid, errors: valid ? [] : ['Assign each of 15, 14, 13, 12, 10, 8 to exactly one ability'] };
}

/** Roll 4d6 and drop the lowest die. */
export function roll4d6DropLowest(rng = defaultRng) {
  const dice = Array.from({ length: 4 }, () => rollDie(6, rng));
  const lowestIndex = dice.indexOf(Math.min(...dice));
  const kept = dice.filter((_, i) => i !== lowestIndex);
  return { dice, dropped: dice[lowestIndex], kept, total: kept.reduce((a, b) => a + b, 0) };
}

/** Roll six ability scores with 4d6-drop-lowest. */
export function rollAbilityScores(rng = defaultRng) {
  return Array.from({ length: 6 }, () => roll4d6DropLowest(rng));
}

// ---------------------------------------------------------------- background ability score increases

/**
 * Validate a background ASI choice.
 *   { mode: 'plus2-plus1', plus2: 'int', plus1: 'wis' }  or  { mode: 'plus1-plus1-plus1' }
 * Both abilities must come from the background's list of three.
 */
export function validateBackgroundASI(background, choice) {
  const errors = [];
  const allowed = background.abilities;
  if (choice.mode === 'plus2-plus1') {
    if (!allowed.includes(choice.plus2)) errors.push('+2 must go to one of the background abilities');
    if (!allowed.includes(choice.plus1)) errors.push('+1 must go to one of the background abilities');
    if (choice.plus2 === choice.plus1) errors.push('+2 and +1 must go to different abilities');
  } else if (choice.mode !== 'plus1-plus1-plus1') {
    errors.push('Unknown background ASI mode');
  }
  return { valid: errors.length === 0, errors };
}

/** Apply the background ASI to base scores. Scores are capped at 20. Returns a new object. */
export function applyBackgroundASI(base, background, choice) {
  const check = validateBackgroundASI(background, choice);
  if (!check.valid) throw new Error(check.errors.join('; '));
  const out = { ...base };
  const bump = (id, n) => { out[id] = Math.min(20, out[id] + n); };
  if (choice.mode === 'plus2-plus1') {
    bump(choice.plus2, 2);
    bump(choice.plus1, 1);
  } else {
    background.abilities.forEach((id) => bump(id, 1));
  }
  return out;
}

// ---------------------------------------------------------------- hit points

/** Level 1 HP: maximum of the Hit Die + Constitution modifier (minimum 1). */
export const hpAtLevel1 = (hitDie, conMod) => Math.max(1, hitDie + conMod);

/** Fixed (average) HP gained per level after 1st: floor(die / 2) + 1 + Con mod (minimum 1). */
export const hpPerLevelFixed = (hitDie, conMod) => Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);

/**
 * Maximum HP using the fixed average method.
 * bonusPerLevel covers effects like Dwarven Toughness (+1 per level); flatBonus is a one-time bonus.
 */
export function maxHitPoints({ hitDie, level, conMod, bonusPerLevel = 0, flatBonus = 0 }) {
  assertLevel(level);
  return hpAtLevel1(hitDie, conMod) + (level - 1) * hpPerLevelFixed(hitDie, conMod) + bonusPerLevel * level + flatBonus;
}

/** Total Hit Point Dice equal character level. */
export const hitDiceTotal = (level) => level;

// ---------------------------------------------------------------- armor class

/**
 * Compute Armor Class.
 * armor: an armor object from the data (or null), shield: boolean,
 * unarmoredDefense: 'barbarian' | 'monk' | null, defenseStyle: Defense fighting style, bonus: other flat bonuses.
 * Returns { ac, formula }.
 */
export function calculateAC({ armor = null, shield = false, mods, unarmoredDefense = null, defenseStyle = false, bonus = 0 }) {
  let ac;
  let formula;
  if (armor && armor.category !== 'shield') {
    let dex = 0;
    if (armor.dexCap === null) dex = mods.dex;
    else if (armor.dexCap > 0) dex = Math.min(mods.dex, armor.dexCap);
    ac = armor.baseAC + dex;
    formula = `${armor.name}: ${armor.baseAC}${dex ? ` ${formatMod(dex)} Dex` : ''}`;
    if (defenseStyle) { ac += 1; formula += ' +1 Defense'; }
  } else if (unarmoredDefense === 'barbarian') {
    ac = 10 + mods.dex + mods.con;
    formula = '10 + Dex + Con (Unarmored Defense)';
  } else if (unarmoredDefense === 'monk' && !shield) {
    ac = 10 + mods.dex + mods.wis;
    formula = '10 + Dex + Wis (Unarmored Defense)';
  } else {
    ac = 10 + mods.dex;
    formula = '10 + Dex (unarmored)';
  }
  if (shield) { ac += 2; formula += ' +2 Shield'; }
  if (bonus) { ac += bonus; formula += ` ${formatMod(bonus)}`; }
  return { ac, formula };
}

/** True if the wearer meets the armor's Strength requirement (else Speed is reduced by 10 ft). */
export const meetsArmorStrength = (armor, strength) => !armor || !armor.strength || strength >= armor.strength;

/** Armor training check against a class's armorTraining list ('light', 'medium', 'heavy', 'shield'). */
export function isArmorTrained(armorTraining, armor) {
  if (!armor) return true;
  return armorTraining.includes(armor.category);
}

// ---------------------------------------------------------------- saves, skills, perception, initiative, speed

export function savingThrowBonus({ ability, scores, level, proficient = false, bonus = 0 }) {
  return abilityMod(scores[ability]) + (proficient ? proficiencyBonus(level) : 0) + bonus;
}

/** All six saving throws. proficientSaves: array of ability ids. */
export function savingThrows({ scores, level, proficientSaves = [], bonus = 0 }) {
  return ABILITY_IDS.map((id) => {
    const proficient = proficientSaves.includes(id);
    return { ability: id, proficient, bonus: savingThrowBonus({ ability: id, scores, level, proficient, bonus }) };
  });
}

/**
 * Skill bonus. proficiency: 0 = none, 1 = proficient, 2 = expertise.
 * jackOfAllTrades adds half proficiency (rounded down) to non-proficient checks.
 */
export function skillBonus({ skill, scores, level, proficiency = 0, jackOfAllTrades = false, bonus = 0 }) {
  const def = typeof skill === 'string' ? SKILLS.find((s) => s.id === skill) : skill;
  if (!def) throw new Error(`Unknown skill: ${skill}`);
  const pb = proficiencyBonus(level);
  let prof = pb * proficiency;
  if (proficiency === 0 && jackOfAllTrades) prof = Math.floor(pb / 2);
  return abilityMod(scores[def.ability]) + prof + bonus;
}

/** Bonuses for all 18 skills. proficiencies: { skillId: 1 | 2 }. */
export function allSkills({ scores, level, proficiencies = {}, jackOfAllTrades = false }) {
  return SKILLS.map((s) => {
    const proficiency = proficiencies[s.id] || 0;
    return { ...s, proficiency, bonus: skillBonus({ skill: s, scores, level, proficiency, jackOfAllTrades }) };
  });
}

/** Passive score = 10 + the skill bonus (Passive Perception, Insight, Investigation). */
export const passiveScore = (skillBonusValue) => 10 + skillBonusValue;

/** Initiative: Dexterity modifier, plus Proficiency Bonus with the Alert feat. */
export function initiativeBonus({ scores, level, alert = false, bonus = 0 }) {
  return abilityMod(scores.dex) + (alert ? proficiencyBonus(level) : 0) + bonus;
}

/**
 * Walking speed in feet.
 * Penalty of 10 ft for unmet armor Strength requirement; Exhaustion subtracts 5 ft per level.
 */
export function walkingSpeed({ base = 30, armor = null, strength = 10, bonus = 0, exhaustion = 0 }) {
  let speed = base + bonus;
  if (armor && !meetsArmorStrength(armor, strength)) speed -= 10;
  speed -= 5 * exhaustion;
  return Math.max(0, speed);
}

/** Speed bonus from class features: Barbarian Fast Movement, Monk Unarmored Movement. */
export function classSpeedBonus(classId, level, { armor = null, shield = false } = {}) {
  if (classId === 'barbarian' && level >= 5 && !(armor && armor.category === 'heavy')) return 10;
  if (classId === 'monk' && level >= 2 && !armor && !shield) {
    if (level >= 18) return 30;
    if (level >= 14) return 25;
    if (level >= 10) return 20;
    if (level >= 6) return 15;
    return 10;
  }
  return 0;
}

// ---------------------------------------------------------------- spellcasting

const CASTER_TABLES = { full: FULL_CASTER_SLOTS, half: HALF_CASTER_SLOTS };

/**
 * Spell slots by level 1..9 as an array of nine counts.
 * casterType: 'full' | 'half' | 'pact' | null. Pact Magic returns its slots at the slot level.
 */
export function spellSlots(casterType, level) {
  assertLevel(level);
  const out = new Array(9).fill(0);
  if (casterType === 'pact') {
    const [count, slotLevel] = PACT_SLOTS[level - 1];
    out[slotLevel - 1] = count;
    return out;
  }
  const table = CASTER_TABLES[casterType];
  if (!table) return out;
  table[level - 1].forEach((n, i) => { out[i] = n; });
  return out;
}

/** Pact Magic slot info: { count, slotLevel }. */
export function pactSlot(level) {
  assertLevel(level);
  const [count, slotLevel] = PACT_SLOTS[level - 1];
  return { count, slotLevel };
}

/** Highest spell level the character can cast (0 if none). */
export function highestSpellLevel(casterType, level) {
  const slots = spellSlots(casterType, level);
  for (let i = 8; i >= 0; i--) if (slots[i] > 0) return i + 1;
  return 0;
}

/** Spellcasting summary for a class at a level, or null for non-casters. */
export function classSpellcasting(classId, level, scores) {
  const cls = CLASS_BY_ID[classId];
  const sc = cls && cls.spellcasting;
  if (!sc) return null;
  const pb = proficiencyBonus(level);
  const mod = abilityMod(scores[sc.ability]);
  return {
    type: sc.type,
    ability: sc.ability,
    saveDC: spellSaveDC(pb, mod),
    attackBonus: spellAttackBonus(pb, mod),
    cantripsKnown: sc.cantrips ? sc.cantrips[level - 1] : 0,
    preparedSpells: sc.prepared[level - 1],
    slots: spellSlots(sc.type, level),
    maxSpellLevel: highestSpellLevel(sc.type, level),
    pact: sc.type === 'pact' ? pactSlot(level) : null,
  };
}

/** Spell save DC = 8 + Proficiency Bonus + spellcasting ability modifier. */
export const spellSaveDC = (profBonus, abilityModifier) => 8 + profBonus + abilityModifier;

/** Spell attack bonus = Proficiency Bonus + spellcasting ability modifier. */
export const spellAttackBonus = (profBonus, abilityModifier) => profBonus + abilityModifier;

/** Cantrip damage dice multiplier: 1 at levels 1-4, 2 at 5, 3 at 11, 4 at 17. */
export function cantripDice(level) {
  return 1 + (level >= 5 ? 1 : 0) + (level >= 11 ? 1 : 0) + (level >= 17 ? 1 : 0);
}

/** Scale a cantrip's base dice ('1d10') to the character level ('2d10' at 5). */
export function scaleCantripDice(baseDice, level) {
  const { count, sides } = parseDice(baseDice);
  return `${count * cantripDice(level)}d${sides}`;
}

// ---------------------------------------------------------------- weapons & attacks

/** Weapon proficiency from a class's weaponProficiency data. */
export function isWeaponProficient(weaponProficiency, weapon) {
  if (weaponProficiency.categories.includes(weapon.category)) return true;
  if (weapon.category === 'martial' && weaponProficiency.martialWith) {
    return weaponProficiency.martialWith.some((p) => weapon.properties.includes(p));
  }
  return false;
}

/** Number of weapon kinds whose Mastery you can use at `level` (0 if the class lacks the feature). */
export function weaponMasteryCount(classId, level) {
  const table = CLASS_BY_ID[classId] && CLASS_BY_ID[classId].weaponMastery;
  if (!table) return 0;
  let n = 0;
  Object.keys(table).map(Number).sort((a, b) => a - b).forEach((l) => { if (level >= l) n = table[l]; });
  return n;
}

/** Which ability a weapon attack uses: Finesse = better of Str/Dex, ranged = Dex, otherwise Str. */
export function weaponAbility(weapon, scores) {
  const finesse = weapon.properties.includes('finesse');
  if (finesse) return abilityMod(scores.dex) >= abilityMod(scores.str) ? 'dex' : 'str';
  return weapon.type === 'ranged' ? 'dex' : 'str';
}

const fmtDamage = (dice, bonus) => (bonus === 0 ? dice : `${dice}${formatMod(bonus)}`);

/**
 * Attack roll and damage for a weapon.
 * Options: proficient, masteryActive (character has chosen this weapon's Mastery), twoHanded (Versatile),
 * archery (Archery style: +2 with ranged weapons), offhand (extra attack with a Light weapon: no ability
 * modifier to damage unless negative or Two-Weapon Fighting), twoWeaponFighting, bonus (magic bonus),
 * martialArtsDie (monk die size) for Monk weapons.
 */
export function weaponAttack({
  weapon, scores, level, proficient = true, masteryActive = false, twoHanded = false,
  archery = false, offhand = false, twoWeaponFighting = false, bonus = 0, martialArtsDie = null,
}) {
  const monkWeapon = martialArtsDie && weapon.type === 'melee'
    && (weapon.category === 'simple' || weapon.properties.includes('light'))
    && !weapon.properties.includes('two-handed') && !weapon.properties.includes('heavy');
  let ability = weaponAbility(weapon, scores);
  if (monkWeapon) ability = abilityMod(scores.dex) >= abilityMod(scores.str) ? 'dex' : 'str';
  const mod = abilityMod(scores[ability]);
  const pb = proficiencyBonus(level);

  let attackBonus = mod + (proficient ? pb : 0) + bonus;
  if (archery && weapon.type === 'ranged') attackBonus += 2;

  let dice = twoHanded && weapon.versatile ? weapon.versatile : weapon.damage;
  if (monkWeapon) {
    const { count, sides } = parseDice(dice);
    if (count === 1 && martialArtsDie > sides) dice = `1d${martialArtsDie}`;
  }
  let damageMod = mod;
  if (offhand && !twoWeaponFighting && damageMod > 0) damageMod = 0;
  const damageBonus = damageMod + bonus;

  return {
    ability,
    abilityMod: mod,
    attackBonus,
    damageDice: dice,
    damageBonus,
    damage: fmtDamage(dice, damageBonus),
    damageType: weapon.damageType,
    mastery: masteryActive ? weapon.mastery : null,
    // Topple DC / other mastery saves: 8 + ability mod + proficiency bonus
    masteryDC: 8 + mod + pb,
    proficient,
  };
}

/** Martial Arts die size by Monk level. */
export function martialArtsDieSize(monkLevel) {
  if (monkLevel >= 17) return 12;
  if (monkLevel >= 11) return 10;
  if (monkLevel >= 5) return 8;
  return 6;
}

/** Unarmed Strike: 1 + Str modifier bludgeoning; Monks use the Martial Arts die and may use Dex. */
export function unarmedStrike({ scores, level, monkLevel = 0 }) {
  const pb = proficiencyBonus(level);
  if (monkLevel > 0) {
    const mod = Math.max(abilityMod(scores.str), abilityMod(scores.dex));
    const dice = `1d${martialArtsDieSize(monkLevel)}`;
    return { attackBonus: mod + pb, damageDice: dice, damageBonus: mod, damage: fmtDamage(dice, mod), damageType: 'bludgeoning' };
  }
  const mod = abilityMod(scores.str);
  return { attackBonus: mod + pb, damageDice: '1', damageBonus: mod, damage: `${1 + mod}`, damageType: 'bludgeoning' };
}

// ---------------------------------------------------------------- class progression helpers

/** Number of Ability Score Improvements (or feats) earned by this class up to `level`. */
export function asiCount(classId, level) {
  const levels = ASI_LEVELS_BY_CLASS[classId] || ASI_LEVELS;
  return levels.filter((l) => l <= level).length;
}

/** Class features available at or below the level (class + subclass if level >= 3). */
export function featuresAtLevel(classId, level, { includeSubclass = true } = {}) {
  const cls = CLASS_BY_ID[classId];
  const list = cls.features.filter((f) => f.level <= level).map((f) => ({ ...f, source: cls.name }));
  if (includeSubclass && cls.subclass && level >= cls.subclass.level) {
    list.push(...cls.subclass.features.filter((f) => f.level <= level).map((f) => ({ ...f, source: cls.subclass.name })));
  }
  return list.sort((a, b) => a.level - b.level);
}

/** Level-dependent resources for the sheet. Returns only the keys relevant for the class. */
export function classResources(classId, level, scores) {
  const mods = abilityMods(scores);
  const idx = level - 1;
  const cls = CLASS_BY_ID[classId];
  switch (classId) {
    case 'barbarian': return { rages: cls.rages[idx] >= 99 ? 'Unlimited' : cls.rages[idx], rageDamage: cls.rageDamage[idx] };
    case 'bard': return { inspirationDie: cls.inspirationDie[idx], inspirationUses: Math.max(1, mods.cha) };
    case 'fighter': return { secondWind: level >= 10 ? 4 : level >= 4 ? 3 : 2, actionSurge: level >= 17 ? 2 : level >= 2 ? 1 : 0, extraAttacks: level >= 20 ? 3 : level >= 11 ? 2 : level >= 5 ? 1 : 0 };
    case 'monk': return { martialArtsDie: martialArtsDieSize(level), focusPoints: level >= 2 ? level : 0, focusSaveDC: 8 + proficiencyBonus(level) + mods.wis };
    case 'paladin': return { layOnHands: 5 * level, channelDivinity: level >= 11 ? 3 : level >= 3 ? 2 : 0 };
    case 'rogue': return { sneakAttack: `${Math.ceil(level / 2)}d6` };
    case 'sorcerer': return { sorceryPoints: level >= 2 ? level : 0 };
    case 'warlock': return { invocations: cls.invocations[idx] };
    case 'wizard': return { spellbookSpells: 6 + 2 * (level - 1), arcaneRecoveryLevels: Math.ceil(level / 2) };
    default: return {};
  }
}

// ---------------------------------------------------------------- carrying capacity

const SIZE_ORDER = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

/**
 * Carrying capacity = 15 x Strength (lb), push/drag/lift = 2x that.
 * Larger creatures multiply it; `sizeSteps` models features like Powerful Build (counts as one size larger).
 */
export function carryingCapacity({ strength, size = 'Medium', sizeSteps = 0 }) {
  const idx = Math.min(SIZE_ORDER.length - 1, Math.max(0, SIZE_ORDER.indexOf(size) + sizeSteps));
  const mult = SIZES[SIZE_ORDER[idx]].carryMultiplier;
  const capacity = strength * 15 * mult;
  return { capacity, pushDragLift: capacity * 2 };
}

/** Jump distances (feet): long jump = Strength score (with 10-ft run), high jump = 3 + Str modifier. */
export function jumpDistances(strength) {
  return { longJump: strength, highJump: Math.max(0, 3 + abilityMod(strength)) };
}
