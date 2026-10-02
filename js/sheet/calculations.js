// Calculations tab: explains how every number on the sheet is computed for THIS character (js/explain.js builds the
// text from the same rules.js functions the sheet uses). Groups are collapsible; "Show calculation" links elsewhere
// on the sheet jump here through ctx.showCalc(rowId).

import { h } from '../ui.js';
import { explainCharacter, groupOfRow } from '../explain.js';
import { totalWeight } from '../inventory.js';
import { buildAttacks } from './combat.js';
import { panel } from './widgets.js';

function calcRow(r) {
  return h('li', { class: 'calc-row', id: `calc-${r.id}`, dataset: { row: r.id } },
    h('div', { class: 'calc-head' }, h('span', { class: 'calc-label' }, r.label), h('strong', { class: 'calc-result' }, r.result)),
    h('p', { class: 'calc-formula' }, r.formula),
    r.note ? h('p', { class: 'hint calc-note' }, r.note) : null);
}

export function calculationsTab(ctx) {
  const { c, d, s, view } = ctx;
  const groups = explainCharacter({ c, d, attacks: buildAttacks(c, d), weight: totalWeight(c.equipment.items), sheet: s });
  if (!view.calcOpen) view.calcOpen = new Set(['basics']);
  const target = view.calcFocus || null;
  const targetGroup = target ? groupOfRow(groups, target) : null;
  if (targetGroup) view.calcOpen.add(targetGroup);

  const body = h('div', { class: 'tab-body calc-tab' },
    panel('How it is calculated',
      h('p', {}, 'Every number on your sheet, worked out with your own scores. Open a group to see the formula, the terms that went into it and the result. These explanations are generated from the same rules the sheet uses, so they always match.'),
      h('div', { class: 'row gap' },
        h('button', { type: 'button', class: 'btn small', onclick: () => { groups.forEach((g) => view.calcOpen.add(g.id)); ctx.rerender(); } }, 'Expand all'),
        h('button', { type: 'button', class: 'btn small', onclick: () => { view.calcOpen.clear(); ctx.rerender(); } }, 'Collapse all'))),
    groups.map((g) => h('details', {
      class: 'sheet-panel calc-group', id: `calc-group-${g.id}`, open: view.calcOpen.has(g.id),
      ontoggle: (e) => { if (e.target.open) view.calcOpen.add(g.id); else view.calcOpen.delete(g.id); },
    },
    h('summary', {}, g.title, h('span', { class: 'calc-count' }, `${g.rows.length}`)),
    h('p', { class: 'calc-why' }, g.why),
    h('ul', { class: 'calc-list' }, g.rows.map(calcRow)))));

  if (target) {
    view.calcFocus = null;
    setTimeout(() => {
      const el = document.getElementById(`calc-${target}`);
      if (!el) return;
      el.scrollIntoView({ block: 'center' });
      el.classList.add('flash');
      setTimeout(() => el.classList.remove('flash'), 1800);
    }, 0);
  }
  return body;
}
