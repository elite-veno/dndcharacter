// Pure dice engine: no DOM, no clock, no globals. Randomness is injectable via `rng` (a function returning [0, 1)),
// so every function here is deterministic under test. See dice.test.mjs.

export const DIE_SIZES = [4, 6, 8, 10, 12, 20, 100];
export const MAX_DICE = 100;
export const MAX_SIDES = 1000;

const defaultRng = Math.random;

/** Roll one die with `sides` faces: an integer from 1 to sides. */
export function rollDie(sides, rng = defaultRng) {
  if (!Number.isInteger(sides) || sides < 1) throw new RangeError(`A die needs a whole number of sides, got ${sides}`);
  // Clamp so a misbehaving rng that returns exactly 1 can never yield sides + 1.
  return Math.min(sides, Math.floor(rng() * sides) + 1);
}

// ---------------------------------------------------------------- expressions

const DICE_TERM = /^([+-]?)(\d*)d(\d+)(?:k([hl])(\d+))?$/i;
const FLAT_TERM = /^([+-]?)(\d+)$/;

/**
 * Parse an expression such as '2d6+3', 'd20-1', '1d8+1d6+2', '4d6kh3' (keep highest 3) or '2d20kl1' (keep lowest 1).
 * Returns { terms: [{ type: 'dice', sign, count, sides, keep? } | { type: 'flat', sign, value }] }.
 * Throws an Error with a readable message when the text is not a valid expression.
 */
export function parseExpression(expr) {
  const text = String(expr ?? '').replace(/\s+/g, '').toLowerCase();
  if (!text) throw new Error('Enter a dice expression, for example 2d6+3.');
  const parts = text.split(/(?=[+-])/);
  const terms = [];
  for (const part of parts) {
    let m = part.match(DICE_TERM);
    if (m) {
      const sign = m[1] === '-' ? -1 : 1;
      const count = m[2] === '' ? 1 : Number(m[2]);
      const sides = Number(m[3]);
      if (count < 1 || count > MAX_DICE) throw new Error(`Roll between 1 and ${MAX_DICE} dice at a time.`);
      if (sides < 2 || sides > MAX_SIDES) throw new Error(`Dice need between 2 and ${MAX_SIDES} sides.`);
      const term = { type: 'dice', sign, count, sides };
      if (m[4]) {
        const n = Number(m[5]);
        if (n < 1 || n > count) throw new Error(`Cannot keep ${n} of ${count} dice.`);
        term.keep = { mode: m[4] === 'h' ? 'highest' : 'lowest', count: n };
      }
      terms.push(term);
      continue;
    }
    m = part.match(FLAT_TERM);
    if (m) {
      terms.push({ type: 'flat', sign: m[1] === '-' ? -1 : 1, value: Number(m[2]) });
      continue;
    }
    throw new Error(`"${part}" is not valid. Use something like 2d6+3.`);
  }
  if (!terms.some((t) => t.type === 'dice')) throw new Error('Include at least one die, for example 1d20+2.');
  return { terms };
}

/**
 * Roll an expression.
 *  - crit: double the NUMBER of dice (never the flat modifiers), as for a critical hit.
 *  - minDie: treat any rolled value below this as this value (Great Weapon Fighting uses 3); the raw roll is kept in `raw`.
 * Returns { expression, terms: [{ sign, count, sides, rolls, raw, kept, subtotal }], flat, total, diceTotal }.
 * `kept[i]` is false for dice dropped by a keep-highest / keep-lowest term.
 */
export function rollExpression(expr, { rng = defaultRng, crit = false, minDie = 0 } = {}) {
  const parsed = parseExpression(expr);
  const terms = [];
  let flat = 0;
  let diceTotal = 0;
  for (const term of parsed.terms) {
    if (term.type === 'flat') {
      flat += term.sign * term.value;
      continue;
    }
    const count = crit && !term.keep ? term.count * 2 : term.count;
    const raw = Array.from({ length: count }, () => rollDie(term.sides, rng));
    const rolls = minDie > 1 ? raw.map((v) => Math.max(v, Math.min(minDie, term.sides))) : raw.slice();
    const kept = rolls.map(() => true);
    if (term.keep) {
      const order = rolls.map((v, i) => [v, i]).sort((a, b) => (term.keep.mode === 'highest' ? b[0] - a[0] : a[0] - b[0]));
      order.slice(term.keep.count).forEach(([, i]) => { kept[i] = false; });
    }
    const subtotal = term.sign * rolls.reduce((sum, v, i) => sum + (kept[i] ? v : 0), 0);
    diceTotal += subtotal;
    terms.push({ sign: term.sign, count, sides: term.sides, rolls, raw, kept, subtotal });
  }
  return { expression: String(expr), terms, flat, diceTotal, total: diceTotal + flat };
}

/** Human readable breakdown: '2d6 [3, 5] + 3 = 11'. Dropped dice are shown in parentheses. */
export function formatRoll(result) {
  const pieces = result.terms.map((t, i) => {
    const faces = t.rolls.map((v, j) => (t.kept[j] ? String(v) : `(${v})`)).join(', ');
    const prefix = i === 0 ? (t.sign < 0 ? '-' : '') : t.sign < 0 ? ' - ' : ' + ';
    return `${prefix}${t.count}d${t.sides} [${faces}]`;
  });
  let text = pieces.join('');
  if (result.flat) text += `${result.flat < 0 ? ' - ' : ' + '}${Math.abs(result.flat)}`;
  return `${text} = ${result.total}`;
}

/** Add a flat modifier to an expression string: ('1d8', 3) -> '1d8+3', ('1d8', -1) -> '1d8-1', ('1d8', 0) -> '1d8'. */
export function withModifier(expr, mod) {
  if (!mod) return expr;
  return `${expr}${mod > 0 ? '+' : '-'}${Math.abs(mod)}`;
}

/** Average of an expression (dice at their mean, crit not considered). */
export function averageOf(expr) {
  const { terms } = parseExpression(expr);
  return terms.reduce((sum, t) => sum + (t.type === 'flat' ? t.sign * t.value : t.sign * (t.keep ? t.keep.count : t.count) * (t.sides + 1) / 2), 0);
}

// ---------------------------------------------------------------- d20 tests

/** Combine an advantage source and a disadvantage source: both (or neither) cancel to 'normal'. */
export function combineModes(...modes) {
  const adv = modes.includes('advantage');
  const dis = modes.includes('disadvantage');
  if (adv && !dis) return 'advantage';
  if (dis && !adv) return 'disadvantage';
  return 'normal';
}

/**
 * Roll a d20 test (attack roll, ability check or saving throw).
 * mode: 'normal' | 'advantage' | 'disadvantage'. `bonus` is the total modifier, `penalty` is subtracted afterwards
 * (Exhaustion: 2 x level). A natural 20 is `crit`, a natural 1 is `fumble`; callers decide what those mean
 * (attack rolls: crit always hits, fumble always misses; checks and saves are unaffected).
 */
export function rollD20Test({ bonus = 0, mode = 'normal', penalty = 0, rng = defaultRng } = {}) {
  const first = rollDie(20, rng);
  const rolls = mode === 'normal' ? [first] : [first, rollDie(20, rng)];
  const natural = mode === 'advantage' ? Math.max(...rolls) : mode === 'disadvantage' ? Math.min(...rolls) : first;
  const keptIndex = rolls.indexOf(natural);
  return {
    mode, rolls, natural, keptIndex, bonus, penalty,
    total: natural + bonus - penalty,
    crit: natural === 20,
    fumble: natural === 1,
  };
}

/** Result of an attack roll against an optional target AC: 'crit' | 'hit' | 'miss' | 'fumble' | 'unknown'. */
export function attackOutcome(test, targetAC = null) {
  if (test.crit) return 'crit';
  if (test.fumble) return 'fumble';
  if (targetAC === null || targetAC === undefined) return 'unknown';
  return test.total >= targetAC ? 'hit' : 'miss';
}

// ---------------------------------------------------------------- death saving throws

/**
 * Roll a death saving throw (no modifiers): 10+ is a success, 9 or less a failure,
 * a natural 1 counts as two failures, a natural 20 regains 1 hit point.
 * Returns { natural, successes, failures, revive } where successes/failures are the amounts to add.
 */
export function rollDeathSave(rng = defaultRng) {
  const natural = rollDie(20, rng);
  if (natural === 20) return { natural, successes: 0, failures: 0, revive: true };
  if (natural === 1) return { natural, successes: 0, failures: 2, revive: false };
  return natural >= 10
    ? { natural, successes: 1, failures: 0, revive: false }
    : { natural, successes: 0, failures: 1, revive: false };
}
