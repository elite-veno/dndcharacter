// Reusable form pieces for the builder steps. Each step receives `ctx`:
//   ctx.c                the character being built (mutated in place)
//   ctx.update(fn, {rerender})  run fn(c), save the draft, refresh summary (and re-render the step by default)

import { h } from '../ui.js';
import { FEAT_BY_ID, SPELL_BY_ID, SKILL_BY_ID } from '../data/index.js';
import { featChoiceSpec, magicInitiateOptions, skilledOptions } from '../choices.js';
import { formatMod } from '../rules.js';

let idCounter = 0;
/** Unique DOM id for label/control association. */
export const nextId = (prefix = 'f') => `${prefix}-${++idCounter}`;

/** A labelled form field. `control` must already carry `id`. */
export function field(label, control, hint = null, id = null) {
  return h('div', { class: 'field' },
    h('label', { for: id || control.id }, label),
    control,
    hint ? h('p', { class: 'hint' }, hint) : null);
}

/** <select> from [{ value, label }] with an optional placeholder. */
export function select({ id = nextId('sel'), options, value, onChange, placeholder = null, disabledValues = [] }) {
  const el = h('select', { id, onchange: (e) => onChange(e.target.value || null) },
    placeholder !== null ? h('option', { value: '' }, placeholder) : null,
    options.map((o) => h('option', { value: o.value, selected: o.value === value, disabled: disabledValues.includes(o.value) }, o.label)));
  el.value = value ?? '';
  return el;
}

/** Section heading inside a panel. */
export const sectionTitle = (text, level = 3) => h(`h${level}`, { class: 'section-title' }, text);

/** Notice box. kind: 'info' | 'warn'. */
export const notice = (text, kind = 'info') => h('p', { class: `notice ${kind}`, role: kind === 'warn' ? 'alert' : null }, text);

/** Pill/tag. */
export const tag = (text, kind = '') => h('span', { class: `tag ${kind}` }, text);

/**
 * Single-choice card grid (radio semantics). options: [{ id, title, subtitle?, badge? }].
 */
export function cardGrid({ options, value, onSelect, label, idPrefix = 'card' }) {
  const group = h('div', { class: 'card-grid', role: 'radiogroup', 'aria-label': label });
  options.forEach((o) => {
    group.append(h('button', {
      type: 'button', id: `${idPrefix}-${o.id}`, class: `choice-card${o.id === value ? ' selected' : ''}`, role: 'radio', 'aria-checked': o.id === value ? 'true' : 'false',
      onclick: () => onSelect(o.id),
    },
    h('span', { class: 'choice-title' }, o.title),
    o.subtitle ? h('span', { class: 'choice-sub' }, o.subtitle) : null,
    o.badge ? h('span', { class: 'choice-badge' }, o.badge) : null));
  });
  return group;
}

/**
 * Multi-select checkbox list limited to `max` picks.
 * options: [{ id, label, detail?, disabled?, disabledReason? }]
 */
export function checkList({ options, selected, max, onChange, columns = true, legend, idPrefix = nextId('chk') }) {
  const wrap = h('fieldset', { class: `check-list${columns ? ' cols' : ''}` }, legend ? h('legend', {}, legend) : null);
  const full = selected.length >= max;
  options.forEach((o) => {
    const checked = selected.includes(o.id);
    const id = `${idPrefix}-${String(o.id).replace(/[^a-z0-9-]/gi, '_')}`;
    const input = h('input', {
      type: 'checkbox', id, checked, disabled: o.disabled || (!checked && full),
      onchange: (e) => {
        const next = e.target.checked ? [...selected, o.id] : selected.filter((x) => x !== o.id);
        onChange(next);
      },
    });
    wrap.append(h('div', { class: `check-item${checked ? ' on' : ''}${o.disabled ? ' off' : ''}` },
      input,
      h('label', { for: id }, h('span', { class: 'check-label' }, o.label), o.detail ? h('span', { class: 'check-detail' }, o.detail) : null),
      o.disabledReason && o.disabled ? h('span', { class: 'check-note' }, o.disabledReason) : null));
  });
  return wrap;
}

/** "x of n chosen" counter. */
export const counter = (have, need, label = 'chosen') => h('p', { class: `counter${have === need ? ' ok' : ''}`, 'aria-live': 'polite' }, `${have} of ${need} ${label}`);

/** Expandable details list for a feat (name, prerequisite, benefits). */
export function featCard(featId) {
  const feat = FEAT_BY_ID[featId];
  if (!feat) return null;
  return h('div', { class: 'info-card' },
    h('h4', {}, feat.name, ' ', tag(feat.category === 'origin' ? 'Origin feat' : feat.category.replace('-', ' '))),
    h('p', {}, feat.desc),
    feat.benefits.length ? h('ul', { class: 'bullets' }, feat.benefits.map((b) => h('li', {}, b))) : null);
}

/** Compact spell label with school/level. */
export const spellLabel = (s) => `${s.name}`;
export const spellDetail = (s) => `${s.level === 0 ? 'Cantrip' : `Level ${s.level}`} ${s.school}${s.concentration ? ', Concentration' : ''}${s.ritual ? ', Ritual' : ''} · ${s.castingTime} · ${s.range}`;

/** Spell card used in pickers: checkbox options with a detail line. */
export function spellOptions(spells, extra = () => ({})) {
  return spells.map((s) => ({ id: s.id, label: spellLabel(s), detail: spellDetail(s), ...extra(s) }));
}

/**
 * Choices required by an Origin feat (Magic Initiate / Skilled). `choices` is the stored object, mutated through `commit`.
 */
export function featChoicesUI(featId, choices, commit, ctx) {
  const spec = featChoiceSpec(featId);
  if (!spec) return null;
  const box = h('div', { class: 'sub-panel' }, h('h4', {}, `${FEAT_BY_ID[featId].name}: choices`));
  if (spec.type === 'magic-initiate') {
    const opts = magicInitiateOptions(spec.list);
    const cantrips = choices.cantrips || [];
    box.append(
      counter(cantrips.length, 2, 'cantrips chosen'),
      checkList({
        options: spellOptions(opts.cantrips), selected: cantrips, max: 2, legend: 'Two cantrips', idPrefix: `${featId}-cantrip`,
        onChange: (next) => commit((x) => { x.cantrips = next; }),
      }),
      field('Level 1 spell', select({
        id: `${featId}-spell`,        options: opts.spells.map((s) => ({ value: s.id, label: s.name })), value: choices.spell || null, placeholder: 'Choose a spell',
        onChange: (v) => commit((x) => { x.spell = v; }),
      }), choices.spell ? SPELL_BY_ID[choices.spell]?.summary : 'You can cast it once per Long Rest without a slot.'),
      field('Spellcasting ability', select({
        id: `${featId}-ability`,        options: [{ value: 'int', label: 'Intelligence' }, { value: 'wis', label: 'Wisdom' }, { value: 'cha', label: 'Charisma' }],
        value: choices.ability || null, placeholder: 'Choose an ability', onChange: (v) => commit((x) => { x.ability = v; }),
      })));
  } else if (spec.type === 'skilled') {
    const picks = choices.skills || [];
    const options = skilledOptions();
    const taken = new Set(ctx.takenSkills ? ctx.takenSkills(featId) : []);
    box.append(
      counter(picks.length, spec.count, 'skills or tools chosen'),
      checkList({
        options: options.map((o) => ({ id: o.value, label: `${o.label}`, detail: o.group, disabled: !picks.includes(o.value) && taken.has(o.value), disabledReason: 'Already granted' })),
        selected: picks, max: spec.count, legend: 'Three skills or tools', idPrefix: `${featId}-skilled`,
        onChange: (next) => commit((x) => { x.skills = next; }),
      }));
  }
  return box;
}

/** Skill label with ability abbreviation, e.g. "Athletics (STR)". */
export const skillLabel = (id) => {
  const s = SKILL_BY_ID[id];
  return s ? `${s.name} (${s.ability.toUpperCase()})` : id;
};

export { formatMod };
