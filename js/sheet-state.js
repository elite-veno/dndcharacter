// Pure play-state logic for the character sheet: hit points, death saves, hit dice, rests, spell slots and
// limited-use resources. No DOM and no storage; every function returns new objects (or a fresh value) so it is
// easy to test. The sheet keeps this state in `character.sheet`.

import * as R from './rules.js';

export const COIN_TYPES = ['pp', 'gp', 'ep', 'sp', 'cp'];

/** A fresh play state. `gold` seeds the coin purse from the gold left after character creation. */
export function defaultSheet({ gold = 0 } = {}) {
  return {
    hp: { current: null, temp: 0, successes: 0, failures: 0, stable: false, dead: false },
    hitDiceUsed: 0,
    slotsUsed: new Array(9).fill(0),
    pactUsed: 0,
    resUsed: {},
    conditions: [],
    exhaustion: 0,
    inspiration: false,
    raging: false,
    concentration: null,
    coins: { pp: 0, gp: Math.floor(gold), ep: 0, sp: Math.round((gold % 1) * 10), cp: 0 },
    weaponOpts: {},
    attackMode: 'normal',
    appearance: { frame: 'gold', backdrop: 'dusk', theme: 'gold', presetPortrait: null },
    notes: '',
  };
}

/** Merge stored play state over the defaults (older saves, partial objects). */
export function normalizeSheet(raw, opts = {}) {
  const base = defaultSheet(opts);
  const s = { ...base, ...(raw || {}) };
  s.hp = { ...base.hp, ...(raw?.hp || {}) };
  s.coins = { ...base.coins, ...(raw?.coins || {}) };
  s.appearance = { ...base.appearance, ...(raw?.appearance || {}) };
  s.resUsed = { ...(raw?.resUsed || {}) };
  s.weaponOpts = { ...(raw?.weaponOpts || {}) };
  s.slotsUsed = base.slotsUsed.map((_, i) => Math.max(0, Number(raw?.slotsUsed?.[i]) || 0));
  s.conditions = Array.isArray(raw?.conditions) ? raw.conditions.slice() : [];
  s.exhaustion = clamp(Number(raw?.exhaustion) || 0, 0, 6);
  return s;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// ---------------------------------------------------------------- hit points and death saves

/** Current HP with the "never set yet" case (null) meaning full health. */
export const currentHp = (hp, maxHp) => (hp.current === null || hp.current === undefined ? maxHp : clamp(hp.current, 0, maxHp));

/**
 * Take damage. Temporary HP absorb first; the rest reduces current HP. Damage left over at 0 HP equal to or above
 * the HP maximum kills outright. Taking damage while at 0 HP is a failed death save (two on a critical hit).
 * Returns { hp, absorbed, lost, downed, died }.
 */
export function applyDamage(hp, amount, maxHp, { crit = false } = {}) {
  const dmg = Math.max(0, Math.floor(amount));
  const out = { ...hp, current: currentHp(hp, maxHp) };
  if (dmg === 0 || out.dead) return { hp: out, absorbed: 0, lost: 0, downed: false, died: false };
  const absorbed = Math.min(out.temp, dmg);
  out.temp -= absorbed;
  const rest = dmg - absorbed;
  if (rest === 0) return { hp: out, absorbed, lost: 0, downed: false, died: false };

  const before = out.current;
  let downed = false;
  if (before === 0) {
    out.failures += crit ? 2 : 1;
    out.stable = false;
    if (rest >= maxHp) out.dead = true;
  } else {
    const overflow = rest - before;
    out.current = Math.max(0, before - rest);
    if (out.current === 0) {
      downed = true;
      out.successes = 0;
      out.failures = 0;
      out.stable = false;
      if (overflow >= maxHp) out.dead = true;
    }
  }
  if (out.failures >= 3) out.dead = true;
  return { hp: out, absorbed, lost: before - out.current, downed, died: out.dead };
}

/** Heal (cannot exceed the HP maximum; healing a creature at 0 HP wakes it and resets death saves). */
export function applyHealing(hp, amount, maxHp) {
  const heal = Math.max(0, Math.floor(amount));
  const out = { ...hp, current: currentHp(hp, maxHp) };
  if (heal === 0 || out.dead) return out;
  if (out.current === 0) { out.successes = 0; out.failures = 0; out.stable = false; }
  out.current = Math.min(maxHp, out.current + heal);
  return out;
}

/** Temporary HP do not stack: keep the larger of the old and new amounts. */
export const grantTempHp = (hp, amount) => ({ ...hp, temp: Math.max(hp.temp, Math.max(0, Math.floor(amount))) });

/**
 * Record a death saving throw result from dice.rollDeathSave.
 * 3 successes stabilise, 3 failures kill, a natural 20 returns the character to 1 HP.
 */
export function applyDeathSave(hp, save) {
  if (hp.dead) return hp;
  if (save.revive) return { ...hp, current: 1, successes: 0, failures: 0, stable: false };
  const out = { ...hp, successes: hp.successes + save.successes, failures: hp.failures + save.failures };
  if (out.successes >= 3) { out.successes = 3; out.stable = true; }
  if (out.failures >= 3) { out.failures = 3; out.dead = true; }
  return out;
}

/** Clear all death save progress (used by stabilising with Medicine or a revive effect). */
export const resetDeathSaves = (hp) => ({ ...hp, successes: 0, failures: 0, stable: false, dead: false });

// ---------------------------------------------------------------- hit dice

/** Hit Dice still available (a character has one per level). */
export const hitDiceLeft = (level, used) => Math.max(0, level - used);

/** Spend one Hit Die during a Short Rest: heal the rolled value plus Constitution modifier (never below 0). */
export function spendHitDie(sheet, { level, roll, conMod, maxHp }) {
  if (hitDiceLeft(level, sheet.hitDiceUsed) <= 0) return { sheet, healed: 0 };
  const healed = Math.max(0, roll + conMod);
  const before = currentHp(sheet.hp, maxHp);
  const hp = applyHealing(sheet.hp, healed, maxHp);
  return { sheet: { ...sheet, hp, hitDiceUsed: sheet.hitDiceUsed + 1 }, healed: hp.current - before };
}

// ---------------------------------------------------------------- limited-use resources

/**
 * Limited-use class and species resources for the sheet.
 * Each: { key, label, max, short, note } where `short` is how many uses a Short Rest restores ('all' or a number);
 * every resource refreshes completely on a Long Rest.
 */
export function resourceDefs({ classId, speciesId, level, scores }) {
  const r = R.classResources(classId, level, scores);
  const pb = R.proficiencyBonus(level);
  const out = [];
  const add = (key, label, max, short = 0, note = '') => { if (max > 0 && Number.isFinite(max)) out.push({ key, label, max, short, note }); };
  switch (classId) {
    case 'barbarian': add('rage', 'Rage', r.rages === 'Unlimited' ? 0 : r.rages, 1, 'Short Rest: regain one use.'); break;
    case 'bard': add('bardic', `Bardic Inspiration (d${r.inspirationDie})`, r.inspirationUses, level >= 5 ? 'all' : 0, 'Charisma modifier uses.'); break;
    case 'cleric': add('channel', 'Channel Divinity', r.channelDivinity, 1, 'Short Rest: regain one use.'); break;
    case 'druid': add('wildshape', 'Wild Shape', r.wildShape, 1, 'Short Rest: regain one use.'); break;
    case 'fighter':
      add('secondwind', 'Second Wind', r.secondWind, 1, 'Short Rest: regain one use.');
      add('actionsurge', 'Action Surge', r.actionSurge, 'all');
      add('indomitable', 'Indomitable', r.indomitable);
      break;
    case 'monk': add('focus', 'Focus Points', r.focusPoints, 'all'); break;
    case 'paladin':
      add('layonhands', 'Lay on Hands (HP pool)', r.layOnHands);
      add('channel', 'Channel Divinity', r.channelDivinity, 1, 'Short Rest: regain one use.');
      break;
    case 'ranger': add('hunters', "Favored Enemy (free Hunter's Mark)", r.favoredEnemy, 0); break;
    case 'sorcerer': add('sorcery', 'Sorcery Points', r.sorceryPoints); break;
    case 'wizard': add('arcrecovery', 'Arcane Recovery', 1, 0, 'Once per day on a Short Rest.'); break;
    default: break;
  }
  if (speciesId === 'dragonborn') add('breath', 'Breath Weapon', pb);
  if (speciesId === 'dwarf') add('stonecunning', 'Stonecunning', pb);
  return out;
}

/** Number of uses left of a resource. */
export const usesLeft = (sheet, def) => Math.max(0, def.max - (sheet.resUsed[def.key] || 0));

// ---------------------------------------------------------------- spell slots

/** Slots left at a spell level (1-9). */
export const slotsLeft = (sheet, slots, level) => Math.max(0, (slots[level - 1] || 0) - (sheet.slotsUsed[level - 1] || 0));

/** Spend one slot at `level`. Returns the new sheet, or null when none are left. */
export function spendSlot(sheet, slots, level) {
  if (slotsLeft(sheet, slots, level) <= 0) return null;
  const slotsUsed = sheet.slotsUsed.slice();
  slotsUsed[level - 1] += 1;
  return { ...sheet, slotsUsed };
}

/** Give one slot back at `level` (undo / feature recovery). */
export function restoreSlot(sheet, level) {
  const slotsUsed = sheet.slotsUsed.slice();
  slotsUsed[level - 1] = Math.max(0, slotsUsed[level - 1] - 1);
  return { ...sheet, slotsUsed };
}

/** Lowest slot level at or above `minLevel` that still has a slot, or null. */
export function lowestAvailableSlot(sheet, slots, minLevel) {
  for (let lvl = Math.max(1, minLevel); lvl <= 9; lvl++) if (slotsLeft(sheet, slots, lvl) > 0) return lvl;
  return null;
}

/**
 * Damage/healing dice for a spell cast at `castLevel`: base dice plus the per-level scaling dice for each level above
 * the spell's own. `upcast` is an expression such as '1d6' (added once per extra level).
 */
export function upcastDice(baseDice, upcast, baseLevel, castLevel) {
  const extra = Math.max(0, castLevel - baseLevel);
  if (!upcast || extra === 0) return baseDice;
  const m = upcast.match(/^(\d+)d(\d+)$/);
  const b = baseDice.match(/^(\d+)d(\d+)$/);
  if (m && b && m[2] === b[2]) return `${Number(b[1]) + Number(m[1]) * extra}d${b[2]}`;
  return `${baseDice}${`+${upcast}`.repeat(extra)}`;
}

// ---------------------------------------------------------------- rests

/** Short Rest: resources with a `short` value recharge, Pact Magic slots return. HP and Hit Dice are spent separately. */
export function shortRest(sheet, defs) {
  const resUsed = { ...sheet.resUsed };
  for (const def of defs) {
    if (!def.short) continue;
    const used = resUsed[def.key] || 0;
    resUsed[def.key] = def.short === 'all' ? 0 : Math.max(0, used - def.short);
  }
  return { ...sheet, resUsed, pactUsed: 0, raging: false };
}

/**
 * Long Rest: full HP, no temporary HP, death saves cleared, half the Hit Dice back (minimum 1), all slots and
 * resources restored, Exhaustion down by 1, rage and concentration ended.
 */
export function longRest(sheet, { level, maxHp }) {
  return {
    ...sheet,
    hp: { current: maxHp, temp: 0, successes: 0, failures: 0, stable: false, dead: false },
    hitDiceUsed: Math.max(0, sheet.hitDiceUsed - Math.max(1, Math.floor(level / 2))),
    slotsUsed: new Array(9).fill(0),
    pactUsed: 0,
    resUsed: {},
    exhaustion: Math.max(0, sheet.exhaustion - 1),
    raging: false,
    concentration: null,
  };
}

/** After a level change keep the current HP and Hit Dice within the new limits. */
export function adjustForLevelChange(sheet, { oldMax, newMax, newLevel }) {
  const cur = currentHp(sheet.hp, oldMax);
  const gained = newMax - oldMax;
  const current = clamp(cur === 0 ? 0 : cur + Math.max(0, gained), cur === 0 ? 0 : 1, newMax);
  return {
    ...sheet,
    hp: { ...sheet.hp, current },
    hitDiceUsed: Math.min(sheet.hitDiceUsed, newLevel),
  };
}

// ---------------------------------------------------------------- coins

const COPPER_VALUE = { pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 };

/** Total worth of a purse in gold pieces. */
export const coinsToGold = (coins) => COIN_TYPES.reduce((sum, t) => sum + (coins[t] || 0) * COPPER_VALUE[t], 0) / 100;

/**
 * Pay `costGp` from a purse. Uses gp, sp and cp first (making change in those coins); only if that is not enough
 * does it break electrum and platinum. Returns the new purse, or null when the character cannot afford it.
 */
export function spendCoins(coins, costGp) {
  const cost = Math.round(costGp * 100);
  if (cost <= 0) return { ...coins };
  const low = (coins.gp || 0) * 100 + (coins.sp || 0) * 10 + (coins.cp || 0);
  if (low >= cost) {
    const left = low - cost;
    return { ...coins, gp: Math.floor(left / 100), sp: Math.floor((left % 100) / 10), cp: left % 10 };
  }
  const total = Math.round(coinsToGold(coins) * 100);
  if (total < cost) return null;
  const left = total - cost;
  return { pp: Math.floor(left / 1000), gp: Math.floor((left % 1000) / 100), ep: 0, sp: Math.floor((left % 100) / 10), cp: left % 10 };
}

// ---------------------------------------------------------------- misc

/** Exhaustion: D20 Tests are reduced by 2 x level, Speed by 5 ft x level. */
export const d20Penalty = (exhaustion) => 2 * clamp(exhaustion, 0, 6);

/** Concentration saving throw DC after taking damage: the higher of 10 and half the damage (rounded down). */
export const concentrationDC = (damage) => Math.max(10, Math.floor(damage / 2));
