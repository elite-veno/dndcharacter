// Pure logic for the sheet's "quality of life" extras: custom resource counters, custom features, quick attacks and
// custom inventory items. No DOM and no storage, so it is easy to test. State lives in `character.sheet`
// (counters, customFeatures, customAttacks) and in `character.equipment.items` (entries with `custom: true`).

import { parseExpression } from './dice.js';

export const RECHARGES = [
  { id: 'none', label: 'Never (manual)' },
  { id: 'short', label: 'Short Rest' },
  { id: 'long', label: 'Long Rest' },
];
const RECHARGE_IDS = RECHARGES.map((r) => r.id);

export const DAMAGE_TYPES = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'];

export const LIMITS = { counters: 40, features: 100, attacks: 30 };

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const toInt = (v, fallback = 0) => { const n = Math.trunc(Number(v)); return Number.isFinite(n) ? n : fallback; };

let counter = 0;
/** A short unique id such as 'ctr-lq3x9a2'. */
export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${(counter++ % 1296).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const fail = (errors) => ({ ok: false, errors });

// ---------------------------------------------------------------- dice strings

/**
 * Validate a damage / dice string such as '1d8+3' or '2d6 + 1d4 + 2'. Reuses the dice parser, so anything the dice tray
 * rolls is accepted. Returns { ok: true, expr } with whitespace removed, or { ok: false, error }.
 */
export function parseDiceString(text) {
  const expr = String(text ?? '').replace(/\s+/g, '').toLowerCase();
  try {
    parseExpression(expr);
    return { ok: true, expr };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ---------------------------------------------------------------- counters

/**
 * Validate form input for a counter. `current` defaults to `max`.
 * Returns { ok: true, value } with a clean counter (no id), or { ok: false, errors: { field: message } }.
 */
export function validateCounter(input) {
  const errors = {};
  const name = clean(input.name, 60);
  if (!name) errors.name = 'Give the counter a name.';
  const max = toInt(input.max, NaN);
  if (!Number.isFinite(max) || max < 1 || max > 9999) errors.max = 'Maximum must be a whole number from 1 to 9999.';
  const hasCurrent = input.current !== undefined && input.current !== null && String(input.current).trim() !== '';
  const cur = hasCurrent ? toInt(input.current, NaN) : max;
  if (!Number.isFinite(cur) || cur < 0) errors.current = 'Current must be 0 or more.';
  const recharge = RECHARGE_IDS.includes(input.recharge) ? input.recharge : 'none';
  const dice = clean(input.dice, 60);
  if (Object.keys(errors).length) return fail(errors);
  return { ok: true, value: { name, current: clamp(cur, 0, max), max, recharge, dice } };
}

/** Normalise a stored counter (older/corrupt saves); null when it is unusable. */
export function normalizeCounter(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const res = validateCounter(raw);
  if (!res.ok) return null;
  return { id: typeof raw.id === 'string' && raw.id ? raw.id : newId('ctr'), ...res.value };
}

export const normalizeCounters = (list) => (Array.isArray(list) ? list.map(normalizeCounter).filter(Boolean).slice(0, LIMITS.counters) : []);

/** Change a counter's current value by `delta`, staying within 0..max. Returns a new counter. */
export const adjustCounter = (ctr, delta) => ({ ...ctr, current: clamp(ctr.current + delta, 0, ctr.max) });

/**
 * Apply a rest to all counters. A Short Rest refills counters that recharge on a Short Rest; a Long Rest refills
 * those that recharge on a Short or a Long Rest. Counters set to 'none' are never touched.
 */
export function restCounters(counters, kind) {
  const resets = kind === 'long' ? ['short', 'long'] : kind === 'short' ? ['short'] : [];
  return (counters || []).map((c) => (resets.includes(c.recharge) && c.current !== c.max ? { ...c, current: c.max } : c));
}

/** Short summary for the UI and tests: 'Recharges on a Short Rest'. */
export const rechargeText = (r) => (r === 'short' ? 'Short Rest' : r === 'long' ? 'Long Rest' : 'Manual');

// ---------------------------------------------------------------- custom features

export function validateFeature(input) {
  const errors = {};
  const title = clean(input.title, 80);
  const text = String(input.text ?? '').trim().slice(0, 4000);
  if (!title) errors.title = 'Give the feature a title.';
  if (Object.keys(errors).length) return fail(errors);
  return { ok: true, value: { title, text } };
}

export function normalizeFeature(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const res = validateFeature(raw);
  return res.ok ? { id: typeof raw.id === 'string' && raw.id ? raw.id : newId('feat'), ...res.value } : null;
}

export const normalizeFeatures = (list) => (Array.isArray(list) ? list.map(normalizeFeature).filter(Boolean).slice(0, LIMITS.features) : []);

// ---------------------------------------------------------------- quick attacks

export function validateAttack(input) {
  const errors = {};
  const name = clean(input.name, 60);
  if (!name) errors.name = 'Give the attack a name.';
  const hitText = String(input.toHit ?? '').trim().replace(/^\+/, '');
  const toHit = hitText === '' ? 0 : toInt(hitText, NaN);
  if (!Number.isFinite(toHit) || toHit < -20 || toHit > 40) errors.toHit = 'To-hit bonus must be a whole number from -20 to +40.';
  const dmg = parseDiceString(input.damage);
  if (!dmg.ok) errors.damage = String(input.damage ?? '').trim() ? dmg.error : 'Enter the damage dice, for example 1d8+3.';
  const damageType = clean(input.damageType, 30).toLowerCase();
  if (Object.keys(errors).length) return fail(errors);
  return { ok: true, value: { name, toHit, damage: dmg.expr, damageType } };
}

export function normalizeAttack(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const res = validateAttack(raw);
  return res.ok ? { id: typeof raw.id === 'string' && raw.id ? raw.id : newId('atk'), ...res.value } : null;
}

export const normalizeAttacks = (list) => (Array.isArray(list) ? list.map(normalizeAttack).filter(Boolean).slice(0, LIMITS.attacks) : []);

/**
 * Convert a saved quick attack into the attack object the Actions tab draws (same shape as buildAttacks entries), so it
 * uses the same roll buttons, Advantage / Disadvantage handling and critical-hit rules as weapon attacks.
 */
export function customAttackToAttack(a) {
  return {
    key: `custom-${a.id}`, id: a.id, custom: true, name: a.name, weapon: null, proficient: true, masteryActive: false,
    attackBonus: a.toHit, ability: null, damageDice: a.damage, damageBonus: 0, damageType: a.damageType,
    flat: false, autoMode: 'normal',
  };
}

// ---------------------------------------------------------------- custom inventory items

export function validateCustomItem(input) {
  const errors = {};
  const name = clean(input.name, 60);
  if (!name) errors.name = 'Give the item a name.';
  const qty = toInt(input.qty, NaN);
  if (!Number.isFinite(qty) || qty < 1 || qty > 9999) errors.qty = 'Quantity must be a whole number from 1 to 9999.';
  const weightText = String(input.weight ?? '').trim();
  const weight = weightText === '' ? 0 : Number(weightText);
  if (!Number.isFinite(weight) || weight < 0 || weight > 100000) errors.weight = 'Weight must be 0 or more (pounds, per item).';
  if (Object.keys(errors).length) return fail(errors);
  return {
    ok: true,
    value: { name, qty, weight: Math.round(weight * 100) / 100, note: clean(input.note, 300), equipped: !!input.equipped },
  };
}

/** Weight in pounds of one inventory entry that is a custom item (weight is per piece). */
export const customItemWeight = (it) => Math.max(0, Number(it.weight) || 0) * Math.max(0, Number(it.qty) || 0);

// ---------------------------------------------------------------- duplicating a character

/**
 * A deep copy of a character with a new id and " (copy)" appended to the name. Timestamps are reset so the copy
 * sorts as newly created. `makeId` supplies the new id (injected for tests).
 */
export function duplicateCharacter(c, makeId) {
  const copy = JSON.parse(JSON.stringify(c));
  const now = Date.now();
  copy.id = makeId();
  copy.name = `${(c.name || 'Unnamed hero').replace(/\s+$/, '')} (copy)`;
  copy.createdAt = now;
  copy.updatedAt = now;
  return copy;
}
