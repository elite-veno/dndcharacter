// Inventory tab: coins, items with equip toggles (armor and shield change AC), weight and an item catalog.

import { h, openModal } from '../ui.js';
import * as R from '../rules.js';
import { resolveItem, WEAPONS, ARMOR, SHIELD, GEAR, PACKS, TOOLS, AMMUNITION } from '../data/index.js';
import { itemName, toggleEquipped, totalWeight, formatCost } from '../inventory.js';
import { spendCoins, coinsToGold, COIN_TYPES } from '../sheet-state.js';
import { panel, titleCase } from './widgets.js';

const CATALOG = [
  { id: 'weapons', label: 'Weapons', items: WEAPONS },
  { id: 'armor', label: 'Armor and shields', items: [...ARMOR, SHIELD] },
  { id: 'gear', label: 'Adventuring gear', items: GEAR },
  { id: 'packs', label: 'Equipment packs', items: PACKS },
  { id: 'tools', label: 'Tools', items: TOOLS },
  { id: 'ammo', label: 'Ammunition', items: AMMUNITION },
];

/** Display name for any inventory entry (catalog item or custom). */
export const entryName = (it) => (it.custom ? `${it.name}${it.qty > 1 ? ` x${it.qty}` : ''}` : itemName(it));

function addItem(c, id) {
  const items = c.equipment.items;
  const same = items.find((x) => x.id === id && !x.variant && !x.custom);
  if (same) same.qty += 1;
  else items.push({ id, qty: 1, variant: null, equipped: false, paid: 0 });
}

function catalogModal(ctx) {
  const { c, s } = ctx;
  let cat = CATALOG[0].id;
  let query = '';
  const body = h('div', { class: 'catalog' });
  const draw = () => {
    const entries = CATALOG.find((x) => x.id === cat).items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
    body.replaceChildren(
      h('div', { class: 'row gap' },
        h('div', { class: 'field inline' }, h('label', { for: 'cat-select' }, 'Category'),
          h('select', { id: 'cat-select', onchange: (e) => { cat = e.target.value; draw(); } }, CATALOG.map((x) => h('option', { value: x.id, selected: x.id === cat }, x.label)))),
        h('div', { class: 'field inline' }, h('label', { for: 'cat-search' }, 'Search'),
          h('input', { id: 'cat-search', type: 'search', value: query, oninput: (e) => { query = e.target.value; draw(); document.getElementById('cat-search')?.focus(); } }))),
      h('p', { class: 'hint' }, `Purse: ${coinsToGold(s.coins)} gp total. "Buy" pays the listed price; "Add" gives the item for free (loot, gifts).`),
      h('ul', { class: 'shop-list catalog-list' }, entries.map((item) => h('li', { class: 'shop-row' },
        h('span', {}, item.name, h('small', {}, `${formatCost(item.cost)} · ${item.weight} lb`)),
        h('button', {
          type: 'button', class: 'btn small',
          onclick: () => {
            const paid = spendCoins(s.coins, item.cost);
            if (!paid) { ctx.toast(`Not enough coin for ${item.name}.`); return; }
            ctx.update((x) => { x.sheet.coins = paid; addItem(x, item.id); });
            ctx.toast(`Bought ${item.name}.`);
          },
        }, 'Buy'),
        h('button', { type: 'button', class: 'btn small', onclick: () => { ctx.update((x) => addItem(x, item.id)); ctx.toast(`Added ${item.name}.`); } }, 'Add')))),
      h('form', {
        class: 'row gap custom-item',
        onsubmit: (e) => {
          e.preventDefault();
          const name = e.target.elements.name.value.trim();
          if (!name) return;
          ctx.update((x) => x.equipment.items.push({ id: `custom-${Date.now().toString(36)}`, custom: true, name, qty: Math.max(1, Number(e.target.elements.qty.value) || 1), equipped: false, paid: 0 }));
          e.target.reset();
          ctx.toast(`Added ${name}.`);
        },
      },
      h('div', { class: 'field inline' }, h('label', { for: 'custom-name' }, 'Custom item'), h('input', { id: 'custom-name', name: 'name', type: 'text', maxLength: 60, placeholder: 'e.g. Ruby ring' })),
      h('div', { class: 'field inline' }, h('label', { for: 'custom-qty' }, 'Qty'), h('input', { id: 'custom-qty', name: 'qty', type: 'number', min: 1, max: 999, value: 1 })),
      h('button', { type: 'submit', class: 'btn small' }, 'Add custom item')));
  };
  openModal('Add items', body, { wide: true });
  draw();
}

function itemRow(ctx, it, index) {
  const { c, d } = ctx;
  const found = it.custom ? null : resolveItem(it.id);
  const kind = found?.kind;
  const wearable = kind === 'armor' || kind === 'shield';
  const tags = [];
  if (found && kind === 'weapon') tags.push(h('span', { class: 'tag' }, `${titleCase(found.item.category)} weapon`));
  if (kind === 'armor') {
    const a = found.item;
    tags.push(h('span', { class: 'tag' }, `${titleCase(a.category)} armor · AC ${a.baseAC}${a.dexCap === null ? ' + Dex' : a.dexCap ? ' + Dex (max 2)' : ''}`));
    if (!d.armorTraining.includes(a.category)) tags.push(h('span', { class: 'tag bad', title: 'Without training you have Disadvantage on D20 Tests using Strength or Dexterity and cannot cast spells.' }, 'Not trained'));
    if (!R.meetsArmorStrength(a, d.scores.str)) tags.push(h('span', { class: 'tag bad', title: 'Speed is reduced by 10 feet.' }, `Needs Str ${a.strength}`));
    if (a.stealthDisadvantage) tags.push(h('span', { class: 'tag', title: 'Disadvantage on Dexterity (Stealth) checks.' }, 'Stealth Disadvantage'));
  }
  if (kind === 'shield') {
    tags.push(h('span', { class: 'tag' }, 'Shield · +2 AC'));
    if (!d.armorTraining.includes('shield')) tags.push(h('span', { class: 'tag bad' }, 'Not trained'));
  }
  const weight = (found?.item.weight || 0) * it.qty;
  return h('li', { class: `inv-row${it.equipped ? ' equipped' : ''}` },
    h('span', { class: 'inv-name' }, entryName(it), h('span', { class: 'tag-row' }, tags)),
    h('span', { class: 'inv-weight' }, weight ? `${Math.round(weight * 100) / 100} lb` : '—'),
    wearable ? h('label', { class: 'inline-check' },
      h('input', { type: 'checkbox', checked: !!it.equipped, onchange: () => ctx.update((x) => toggleEquipped(x, index)) }),
      it.equipped ? 'Equipped' : 'Equip') : null,
    h('span', { class: 'btn-pair' },
      h('button', { type: 'button', class: 'btn small', 'aria-label': `One fewer ${found?.item.name || it.name}`, onclick: () => ctx.update((x) => { const e = x.equipment.items[index]; if (e.qty > 1) e.qty -= 1; else x.equipment.items.splice(index, 1); }) }, '−'),
      h('button', { type: 'button', class: 'btn small', 'aria-label': `One more ${found?.item.name || it.name}`, onclick: () => ctx.update((x) => { x.equipment.items[index].qty += 1; }) }, '+'),
      h('button', { type: 'button', class: 'btn small danger', 'aria-label': `Remove ${found?.item.name || it.name}`, onclick: () => ctx.update((x) => { x.equipment.items.splice(index, 1); }) }, 'Remove')));
}

export function inventoryTab(ctx) {
  const { c, d, s } = ctx;
  const items = c.equipment.items;
  const weight = Math.round(totalWeight(items) * 100) / 100;
  const cap = R.carryingCapacity({ strength: d.scores.str, size: d.size });

  const coinInputs = COIN_TYPES.map((t) => {
    const id = `coin-${t}`;
    return h('div', { class: 'coin' },
      h('label', { for: id }, t.toUpperCase()),
      h('input', {
        id, type: 'number', min: 0, step: 1, value: s.coins[t] || 0,
        onchange: (e) => ctx.save((x) => { x.sheet.coins[t] = Math.max(0, Math.floor(Number(e.target.value) || 0)); }),
      }));
  });

  return h('div', { class: 'tab-body' },
    panel('Coins', h('div', { class: 'coin-row' }, coinInputs), h('p', { class: 'hint' }, `Worth ${coinsToGold(s.coins)} gp in total.`)),
    panel('Equipment',
      h('div', { class: 'row gap' },
        h('button', { type: 'button', class: 'btn primary small', onclick: () => catalogModal(ctx) }, 'Add or buy items'),
        h('span', { class: 'hint' }, `Carrying ${weight} lb of ${cap.capacity} lb (push, drag or lift ${cap.pushDragLift} lb). Armor class: ${d.ac.ac} (${d.ac.formula}).`)),
      items.length ? h('ul', { class: 'inv-list' }, items.map((it, i) => itemRow(ctx, it, i))) : h('p', { class: 'empty' }, 'Your pack is empty.'),
      h('p', { class: 'hint' }, 'Only one suit of armor and one shield can be equipped at a time. Equipping changes your Armor Class immediately.')));
}
