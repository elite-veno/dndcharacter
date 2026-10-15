// Sheet extras you add yourself: resource counters ("Trackers"), freeform features, quick attacks and custom items.
// The data rules live in ../custom-sheet.js; this file is the panels and the add/edit dialogs.

import { h } from '../ui.js';
import {
  RECHARGES, DAMAGE_TYPES, LIMITS, newId, validateCounter, validateFeature, validateAttack, validateCustomItem,
  adjustCounter, parseDiceString, rechargeText,
} from '../custom-sheet.js';
import { panel, rollButton } from './widgets.js';
import { openFormModal } from './forms.js';

const undoHint = 'Press Ctrl+Z to undo.';

// ---------------------------------------------------------------- trackers (custom resource counters)

export function openCounterForm(ctx, existing = null) {
  openFormModal({
    title: existing ? `Edit ${existing.name}` : 'Add tracker',
    values: existing || { max: 3, recharge: 'long' },
    fields: [
      { name: 'name', label: 'Name', type: 'text', maxLength: 60, placeholder: 'e.g. Bardic Inspiration, Potion charges' },
      { name: 'max', label: 'Maximum', type: 'number', min: 1, max: 9999, step: 1, half: true },
      { name: 'current', label: 'Current', type: 'number', min: 0, max: 9999, step: 1, half: true, hint: existing ? null : 'Leave empty to start full.' },
      { name: 'recharge', label: 'Recharges on', type: 'select', options: RECHARGES.map((r) => ({ value: r.id, label: r.label })), half: true,
        hint: 'A Long Rest also refills Short Rest trackers.' },
      { name: 'dice', label: 'Dice note (optional)', type: 'text', maxLength: 60, placeholder: 'e.g. 1d6', half: true, hint: 'A valid dice expression gets a roll button.' },
    ],
    validate: (v) => validateCounter(v),
    submitLabel: existing ? 'Save' : 'Add tracker',
    onSave: (value) => ctx.update((x) => {
      const list = x.sheet.counters;
      if (existing) { const i = list.findIndex((y) => y.id === existing.id); if (i >= 0) list[i] = { ...list[i], ...value }; }
      else if (list.length < LIMITS.counters) list.push({ id: newId('ctr'), ...value });
    }),
  });
}

function trackerRow(ctx, ctr) {
  const set = (delta) => ctx.update((x) => {
    const i = x.sheet.counters.findIndex((y) => y.id === ctr.id);
    if (i >= 0) x.sheet.counters[i] = adjustCounter(x.sheet.counters[i], delta);
  });
  const rollable = ctr.dice && parseDiceString(ctr.dice).ok;
  return h('li', { class: 'tracker-row' },
    h('span', { class: 'resource-name' }, ctr.name,
      h('small', {}, [ctr.recharge !== 'none' ? `Recharges: ${rechargeText(ctr.recharge)}` : 'Manual reset', ctr.dice ? `Dice: ${ctr.dice}` : null].filter(Boolean).join(' · '))),
    h('span', { class: 'counter-ctl' },
      h('button', { type: 'button', class: 'btn small', disabled: ctr.current <= 0, 'aria-label': `Use one ${ctr.name}`, onclick: () => set(-1) }, '−'),
      h('strong', { 'aria-label': `${ctr.name}: ${ctr.current} of ${ctr.max}` }, `${ctr.current} / ${ctr.max}`),
      h('button', { type: 'button', class: 'btn small', disabled: ctr.current >= ctr.max, 'aria-label': `Restore one ${ctr.name}`, onclick: () => set(1) }, '+'),
      rollable ? rollButton(ctr.dice, () => ctx.tray.rollExpr(ctr.name, parseDiceString(ctr.dice).expr), { cls: 'small', label: `Roll ${ctr.name} ${ctr.dice}` }) : null,
      h('button', { type: 'button', class: 'btn small', 'aria-label': `Edit ${ctr.name}`, onclick: () => openCounterForm(ctx, ctr) }, 'Edit'),
      h('button', {
        type: 'button', class: 'btn small danger', 'aria-label': `Remove ${ctr.name}`,
        onclick: () => { ctx.update((x) => { x.sheet.counters = x.sheet.counters.filter((y) => y.id !== ctr.id); }); ctx.toast(`Removed ${ctr.name}. ${undoHint}`); },
      }, 'Remove')));
}

/** Compact always-visible panel of custom counters. */
export function trackersPanel(ctx) {
  const list = ctx.s.counters;
  return panel('Trackers',
    list.length ? h('ul', { class: 'resource-list tracker-list' }, list.map((ctr) => trackerRow(ctx, ctr)))
      : h('p', { class: 'hint' }, 'Track anything with uses: potion charges, ki, a magic item, inspiration dice. Short and Long Rest refill them.'),
    h('div', { class: 'row gap' },
      h('button', { type: 'button', class: 'btn small primary', disabled: list.length >= LIMITS.counters, onclick: () => openCounterForm(ctx) }, 'Add tracker')));
}

// ---------------------------------------------------------------- custom features and notes

export function openFeatureForm(ctx, existing = null) {
  openFormModal({
    title: existing ? `Edit ${existing.title}` : 'Add feature or note',
    values: existing || {},
    fields: [
      { name: 'title', label: 'Title', type: 'text', maxLength: 80, placeholder: 'e.g. Boon of the Moonlit Grove' },
      { name: 'text', label: 'Text', type: 'textarea', maxLength: 4000, placeholder: 'What it does, where it came from, how often you can use it...' },
    ],
    validate: (v) => validateFeature(v),
    submitLabel: existing ? 'Save' : 'Add',
    onSave: (value) => ctx.update((x) => {
      const list = x.sheet.customFeatures;
      if (existing) { const i = list.findIndex((y) => y.id === existing.id); if (i >= 0) list[i] = { ...list[i], ...value }; }
      else if (list.length < LIMITS.features) list.push({ id: newId('feat'), ...value });
    }),
  });
}

export function customFeaturesPanel(ctx) {
  const list = ctx.s.customFeatures;
  return panel('My features and notes',
    list.length ? h('ul', { class: 'custom-feature-list' }, list.map((f) => h('li', { class: 'custom-feature' },
      h('div', { class: 'custom-feature-head' },
        h('h3', {}, f.title),
        h('span', { class: 'btn-pair' },
          h('button', { type: 'button', class: 'btn small', 'aria-label': `Edit ${f.title}`, onclick: () => openFeatureForm(ctx, f) }, 'Edit'),
          h('button', {
            type: 'button', class: 'btn small danger', 'aria-label': `Remove ${f.title}`,
            onclick: () => { ctx.update((x) => { x.sheet.customFeatures = x.sheet.customFeatures.filter((y) => y.id !== f.id); }); ctx.toast(`Removed ${f.title}. ${undoHint}`); },
          }, 'Remove'))),
      f.text ? h('p', { class: 'custom-feature-text' }, f.text) : null)))
      : h('p', { class: 'hint' }, 'Add feats from a DM, magic item properties, boons or any trait the builder does not know about.'),
    h('div', { class: 'row gap' }, h('button', { type: 'button', class: 'btn small primary', disabled: list.length >= LIMITS.features, onclick: () => openFeatureForm(ctx) }, 'Add feature or note')));
}

// ---------------------------------------------------------------- quick attacks

export function openAttackForm(ctx, existing = null) {
  openFormModal({
    title: existing ? `Edit ${existing.name}` : 'Add quick attack',
    values: existing ? { ...existing, toHit: existing.toHit } : { toHit: 0 },
    fields: [
      { name: 'name', label: 'Name', type: 'text', maxLength: 60, placeholder: 'e.g. Flame Tongue, Eldritch Blast' },
      { name: 'toHit', label: 'To-hit bonus', type: 'number', min: -20, max: 40, step: 1, half: true },
      { name: 'damage', label: 'Damage dice', type: 'text', maxLength: 60, placeholder: '1d8+3', half: true, hint: 'Like 1d8+3 or 2d6+1d4+2.' },
      { name: 'damageType', label: 'Damage type', type: 'text', maxLength: 30, placeholder: 'fire', suggestions: DAMAGE_TYPES },
    ],
    validate: (v) => validateAttack(v),
    submitLabel: existing ? 'Save' : 'Add attack',
    onSave: (value) => ctx.update((x) => {
      const list = x.sheet.customAttacks;
      if (existing) { const i = list.findIndex((y) => y.id === existing.id); if (i >= 0) list[i] = { ...list[i], ...value }; }
      else if (list.length < LIMITS.attacks) list.push({ id: newId('atk'), ...value });
    }),
  });
}

/** Edit / Remove buttons shown inside a custom attack's card. */
export function customAttackControls(ctx, a) {
  const saved = ctx.s.customAttacks.find((x) => x.id === a.id);
  return h('span', { class: 'btn-pair' },
    h('button', { type: 'button', class: 'btn small', 'aria-label': `Edit ${a.name}`, onclick: () => saved && openAttackForm(ctx, saved) }, 'Edit'),
    h('button', {
      type: 'button', class: 'btn small danger', 'aria-label': `Remove ${a.name}`,
      onclick: () => { ctx.update((x) => { x.sheet.customAttacks = x.sheet.customAttacks.filter((y) => y.id !== a.id); }); ctx.toast(`Removed ${a.name}. ${undoHint}`); },
    }, 'Remove'));
}

// ---------------------------------------------------------------- custom inventory items

export function openItemForm(ctx, index = null) {
  const existing = index === null ? null : ctx.c.equipment.items[index];
  openFormModal({
    title: existing ? `Edit ${existing.name}` : 'Add custom item',
    values: existing || { qty: 1, weight: 0 },
    fields: [
      { name: 'name', label: 'Name', type: 'text', maxLength: 60, placeholder: 'e.g. Ruby ring, Rope of climbing' },
      { name: 'qty', label: 'Quantity', type: 'number', min: 1, max: 9999, step: 1, half: true },
      { name: 'weight', label: 'Weight each (lb)', type: 'number', min: 0, step: 0.01, half: true, hint: 'Counts toward the weight you carry.' },
      { name: 'note', label: 'Note (optional)', type: 'text', maxLength: 300, placeholder: 'Properties, where you found it...' },
      { name: 'equipped', label: 'Equipped / worn', type: 'checkbox', hint: 'A reminder only: custom items never change your Armor Class.' },
    ],
    validate: (v) => validateCustomItem(v),
    submitLabel: existing ? 'Save' : 'Add item',
    onSave: (value) => ctx.update((x) => {
      const items = x.equipment.items;
      if (existing) { const it = items[index]; if (it) Object.assign(it, value); }
      else items.push({ id: newId('custom'), custom: true, paid: 0, ...value });
    }),
  });
}
