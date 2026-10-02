// Small UI building blocks shared by the sheet panels.

import { h } from '../ui.js';
import { formatMod } from '../rules.js';

/** A button that rolls something when clicked. `onRoll(event)` gets the click event (Shift = Advantage, Ctrl/Alt = Disadvantage). */
export function rollButton(text, onRoll, { label = null, cls = '', title = null } = {}) {
  return h('button', {
    type: 'button', class: `roll-btn ${cls}`.trim(), onclick: onRoll,
    'aria-label': label, title: title || 'Click to roll. Shift-click: Advantage. Ctrl/Alt-click: Disadvantage.',
  }, text);
}

/** Signed bonus text for roll buttons. */
export const bonusText = (n) => formatMod(n);

/** A titled card used for every sheet section. */
export function panel(title, ...children) {
  return h('section', { class: 'sheet-panel' }, title ? h('h2', { class: 'panel-title' }, title) : null, ...children);
}

/** Row of toggleable pips (spell slots, uses, death saves). `onToggle(index)` fires when a pip is clicked. */
export function pips({ total, filled, label, onToggle, cls = '' }) {
  return h('span', { class: `pips ${cls}`, role: 'group', 'aria-label': label },
    Array.from({ length: total }, (_, i) => h('button', {
      type: 'button', class: `pip${i < filled ? ' on' : ''}`, 'aria-pressed': String(i < filled),
      'aria-label': `${label}: ${i + 1} of ${total}`, onclick: () => onToggle(i),
    })));
}

/** Proficiency marker: 0 none, 1 proficient, 2 expertise. */
export function profDot(level) {
  return h('span', {
    class: `prof-dot p${level}`, role: 'img',
    'aria-label': level === 2 ? 'Expertise' : level === 1 ? 'Proficient' : 'Not proficient',
  });
}

/** Collapsible text block. */
export function disclosure(summary, ...content) {
  return h('details', { class: 'disclosure' }, h('summary', {}, summary), h('div', { class: 'disclosure-body' }, ...content));
}

/** Titlecase an id like 'two-handed'. */
export const titleCase = (s) => String(s).replace(/(^|[-\s])(\w)/g, (_, a, b) => `${a === '-' ? ' ' : a}${b.toUpperCase()}`);
