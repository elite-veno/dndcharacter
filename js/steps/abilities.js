// Step 5: ability scores (Standard Array / Manual-Rolled with a 4d6 roller / Point Buy with live cost).

import { h } from '../ui.js';
import { ABILITIES, ABILITY_IDS, CLASS_BY_ID } from '../data/index.js';
import {
  STANDARD_ARRAY, POINT_BUY_BUDGET, POINT_BUY_COSTS, POINT_BUY_MIN, POINT_BUY_MAX, abilityMod, formatMod, validatePointBuy,
  canIncreasePointBuy, roll4d6DropLowest,
} from '../rules.js';
import { abilityBreakdown, validateAbilities } from '../character.js';
import { notice, tag, cardGrid } from './shared.js';

/** Last 4d6 roll per ability, shown to the player (not persisted). */
const rolled = {};

const METHODS = [
  { id: 'standard', title: 'Standard Array', subtitle: '15, 14, 13, 12, 10, 8' },
  { id: 'manual', title: 'Manual / Rolled', subtitle: 'Roll 4d6 (drop lowest) or type scores' },
  { id: 'pointBuy', title: 'Point Buy', subtitle: `${POINT_BUY_BUDGET} points, scores 8 to 15` },
];

export default {
  id: 'abilities',
  title: 'Ability Scores',
  blurb: 'Generate your six ability scores.',
  render(ctx) {
    const { c } = ctx;
    const root = h('section', { class: 'step-panel' },
      h('h2', {}, 'Ability Scores'),
      h('p', { class: 'lead' }, 'Choose how to generate your scores. Your Background bonuses (and any level-up increases) are added automatically.'),
      cardGrid({ label: 'Generation method', idPrefix: 'method', value: c.abilityMethod, options: METHODS, onSelect: (id) => ctx.update((x) => { x.abilityMethod = id; }) }));

    const body = c.abilityMethod === 'standard' ? standardBody(ctx) : c.abilityMethod === 'manual' ? manualBody(ctx) : pointBuyBody(ctx);
    root.append(body.extra || '', table(ctx, body.cell));
    const errors = validateAbilities(c);
    if (errors.length) root.append(notice(errors[0], 'warn'));
    if (!c.backgroundId) root.append(notice('Pick a Background to see its +2/+1 bonuses applied to these scores.'));
    return root;
  },
};

/** The score table; `cell(id)` renders the method-specific input for the base score. */
function table(ctx, cell) {
  const { c } = ctx;
  const bd = abilityBreakdown(c);
  const primary = CLASS_BY_ID[c.classId]?.primaryAbility || [];
  const head = h('div', { class: 'score-row head', role: 'row' }, ['Ability', 'Base score', 'Background', 'Level-ups', 'Total', 'Modifier'].map((t) => h('span', { role: 'columnheader' }, t)));
  const rows = ABILITIES.map((a) => h('div', { class: 'score-row', role: 'row' },
    h('span', { class: 'score-name', role: 'rowheader' }, h('strong', {}, a.name), ' ', primary.includes(a.id) ? tag('Primary', 'good') : null, h('small', {}, a.desc)),
    h('span', { class: 'score-base', role: 'cell', 'data-label': 'Base' }, cell(a.id)),
    h('span', { role: 'cell', 'data-label': 'Background' }, bd.background[a.id] ? `+${bd.background[a.id]}` : '–'),
    h('span', { role: 'cell', 'data-label': 'Level-ups' }, bd.advancement[a.id] ? `+${bd.advancement[a.id]}` : '–'),
    h('span', { class: 'score-total', role: 'cell', 'data-label': 'Total' }, c[c.abilityMethod][a.id] === null && c.abilityMethod === 'standard' ? '–' : bd.total[a.id]),
    h('span', { class: 'score-mod', role: 'cell', 'data-label': 'Mod' }, c[c.abilityMethod][a.id] === null && c.abilityMethod === 'standard' ? '–' : formatMod(abilityMod(bd.total[a.id])))));
  return h('div', { class: 'score-table', role: 'table', 'aria-label': 'Ability scores' }, head, rows);
}

// ---------------------------------------------------------------- Standard Array

function standardBody(ctx) {
  const { c } = ctx;
  const used = ABILITY_IDS.map((id) => c.standard[id]).filter((v) => v !== null);
  const cell = (id) => {
    const el = h('select', {
      id: `std-${id}`, 'aria-label': `${id.toUpperCase()} base score`,
      onchange: (e) => ctx.update((x) => { x.standard[id] = e.target.value ? Number(e.target.value) : null; }),
    }, h('option', { value: '' }, '—'), STANDARD_ARRAY.map((v) => {
      const taken = used.includes(v) && c.standard[id] !== v;
      return h('option', { value: v, disabled: taken }, v);
    }));
    el.value = c.standard[id] === null ? '' : String(c.standard[id]);
    return el;
  };
  return {
    cell,
    extra: h('div', { class: 'row gap' },
      h('p', { class: 'hint' }, 'Assign each value 15, 14, 13, 12, 10 and 8 to exactly one ability.'),
      h('button', { type: 'button', class: 'btn', onclick: () => ctx.update((x) => { ABILITY_IDS.forEach((id) => { x.standard[id] = null; }); }) }, 'Clear'),
      h('button', { type: 'button', class: 'btn', onclick: () => ctx.update((x) => { applyRecommended(x); }) }, 'Recommended for class')),
  };
}

/** Put the standard array in a sensible order for the chosen class (primary first, then Con, Dex...). */
function applyRecommended(c) {
  const cls = CLASS_BY_ID[c.classId];
  const primary = cls ? cls.primaryAbility : ['str'];
  const priority = [...primary, 'con', 'dex', 'wis', 'cha', 'int', 'str'];
  const order = [...new Set(priority)].concat(ABILITY_IDS).filter((id, i, arr) => arr.indexOf(id) === i);
  order.forEach((id, i) => { c.standard[id] = STANDARD_ARRAY[i]; });
}

// ---------------------------------------------------------------- Manual / Rolled

function manualBody(ctx) {
  const { c } = ctx;
  const roll = (id) => { const r = roll4d6DropLowest(); rolled[id] = r; ctx.update((x) => { x.manual[id] = r.total; }); };
  const cell = (id) => {
    const r = rolled[id];
    const input = h('input', {
      id: `man-${id}`, type: 'number', min: 3, max: 18, step: 1, value: c.manual[id], 'aria-label': `${id.toUpperCase()} base score`,
      onchange: (e) => { const n = Math.round(Number(e.target.value)); delete rolled[id]; ctx.update((x) => { x.manual[id] = Number.isFinite(n) ? n : 10; }); },
    });
    const swap = h('select', {
      'aria-label': `Swap ${id.toUpperCase()} with another ability`, id: `swap-${id}`,
      onchange: (e) => {
        const other = e.target.value;
        if (!other) return;
        ctx.update((x) => { [x.manual[id], x.manual[other]] = [x.manual[other], x.manual[id]]; [rolled[id], rolled[other]] = [rolled[other], rolled[id]]; });
      },
    }, h('option', { value: '' }, 'Swap…'), ABILITY_IDS.filter((o) => o !== id).map((o) => h('option', { value: o }, o.toUpperCase())));
    return h('span', { class: 'manual-cell' },
      input,
      h('button', { type: 'button', class: 'btn small', onclick: () => roll(id), 'aria-label': `Roll 4d6 for ${id.toUpperCase()}` }, 'Roll 4d6'),
      swap,
      r ? h('small', { class: 'roll-log' }, 'Dice ', r.dice.map((d, i) => h('span', { class: `die${d === r.dropped && i === r.dice.indexOf(r.dropped) ? ' dropped' : ''}` }, d)), ` = ${r.total}`) : null);
  };
  return {
    cell,
    extra: h('div', { class: 'row gap' },
      h('p', { class: 'hint' }, 'Roll 4d6 and drop the lowest die for each ability, or type your own scores (3 to 18) if your DM allows it.'),
      h('button', { type: 'button', class: 'btn primary', onclick: () => ctx.update((x) => { ABILITY_IDS.forEach((id) => { const r = roll4d6DropLowest(); rolled[id] = r; x.manual[id] = r.total; }); }) }, 'Roll all six')),
  };
}

// ---------------------------------------------------------------- Point Buy

function pointBuyBody(ctx) {
  const { c } = ctx;
  const status = validatePointBuy(c.pointBuy);
  const step = (id, delta) => ctx.update((x) => { x.pointBuy[id] += delta; });
  const cell = (id) => {
    const v = c.pointBuy[id];
    return h('span', { class: 'buy-cell' },
      h('button', { type: 'button', class: 'btn small', id: `pb-dec-${id}`, disabled: v <= POINT_BUY_MIN, 'aria-label': `Decrease ${id.toUpperCase()}`, onclick: () => step(id, -1) }, '−'),
      h('output', { 'aria-label': `${id.toUpperCase()} base score` }, v),
      h('button', { type: 'button', class: 'btn small', id: `pb-inc-${id}`, disabled: v >= POINT_BUY_MAX || !canIncreasePointBuy(c.pointBuy, id), 'aria-label': `Increase ${id.toUpperCase()}`, onclick: () => step(id, 1) }, '+'),
      h('small', { class: 'cost' }, `cost ${POINT_BUY_COSTS[v]}`));
  };
  return {
    cell,
    extra: h('div', { class: 'budget', role: 'status', 'aria-live': 'polite' },
      h('span', { class: `budget-num${status.remaining === 0 ? ' full' : ''}` }, status.remaining), ' of ', POINT_BUY_BUDGET, ' points left',
      h('button', { type: 'button', class: 'btn small', onclick: () => ctx.update((x) => { ABILITY_IDS.forEach((id) => { x.pointBuy[id] = 8; }); }) }, 'Reset')),
  };
}
