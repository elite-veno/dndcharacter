// Step 6: starting equipment (class option A/B, background option A/B), the "Add Starting Equipment" button, a small shop.

import { h } from '../ui.js';
import {
  CLASS_BY_ID, BACKGROUND_BY_ID, resolveItem, WEAPONS, ARMOR, SHIELD, GEAR, PACKS, TOOLS, AMMUNITION, FOCUSES,
} from '../data/index.js';
import {
  itemName, choiceSlots, slotValue, startingGold, goldLeft, totalWeight, buildInventory, invalidateStarting, buyItem, removeItem,
  toggleEquipped, formatCost,
} from '../inventory.js';
import { armorTrainingOf } from '../choices.js';
import { field, select, notice, tag, cardGrid } from './shared.js';

const shop = { category: 'weapons', q: '', open: false };

const SHOP_CATEGORIES = {
  weapons: { label: 'Weapons', items: () => WEAPONS },
  armor: { label: 'Armor & Shields', items: () => [...ARMOR, SHIELD] },
  gear: { label: 'Adventuring Gear', items: () => [...GEAR, ...AMMUNITION] },
  packs: { label: 'Equipment Packs', items: () => PACKS },
  tools: { label: 'Tools', items: () => TOOLS },
};

/** Default variant for focus items so they can be bought directly. */
function defaultVariant(id) {
  if (id === 'arcane-focus') return FOCUSES.arcane[0];
  if (id === 'druidic-focus') return FOCUSES.druidic[0];
  if (id === 'holy-symbol') return FOCUSES.holy[0];
  return null;
}

function optionList(entries) {
  return entries.map((e) => (e.choice ? 'one item of your choice' : itemName(e))).join(', ');
}

export default {
  id: 'equipment',
  title: 'Equipment',
  blurb: 'Starting gear from your class and background.',
  render(ctx) {
    const { c } = ctx;
    const cls = CLASS_BY_ID[c.classId];
    const bg = BACKGROUND_BY_ID[c.backgroundId];
    const root = h('section', { class: 'step-panel' },
      h('h2', {}, 'Starting Equipment'),
      h('p', { class: 'lead' }, 'Your class and your background each offer a choice: take the listed equipment (Option A) or its gold value instead (Option B).'));
    if (!cls || !bg) { root.append(notice('Choose a class and a background first; their equipment options appear here.', 'warn')); return root; }

    const eq = c.equipment;
    const setOption = (key, value) => ctx.update((x) => { x.equipment[key] = value; x.equipment.choices = {}; invalidateStarting(x); });
    const optionCards = (key, title, source, a, goldA, goldB) => h('div', { class: 'sub-panel' }, h('h4', {}, title),
      cardGrid({
        label: title, idPrefix: `eq-${key}`, value: eq[key], onSelect: (id) => setOption(key, id),
        options: [
          { id: 'A', title: 'Option A', subtitle: `${optionList(a)}; ${goldA} gp` },
          { id: 'B', title: 'Option B', subtitle: `${goldB} gp` },
        ],
      }));
    root.append(
      optionCards('classOption', `${cls.name} equipment`, 'class', cls.startingEquipment.a, cls.startingEquipment.goldA, cls.startingEquipment.goldB),
      optionCards('bgOption', `${bg.name} equipment`, 'background', bg.equipmentA, bg.goldA, bg.goldB));

    const slots = choiceSlots(c);
    if (slots.length) {
      root.append(h('div', { class: 'sub-panel' }, h('h4', {}, 'Item choices'), slots.map((slot) => {
        if (slot.auto) return h('p', {}, h('strong', {}, `${slot.label}: `), resolveItem(slot.auto)?.item.name || slot.auto);
        return field(slot.label, select({
          id: `slot-${slot.key.replace(':', '-')}`, value: slotValue(c, slot), placeholder: 'Choose',
          options: slot.options.map((t) => ({ value: t.id, label: t.name })),
          onChange: (v) => ctx.update((x) => { x.equipment.choices[slot.key] = v; invalidateStarting(x); }),
        }));
      })));
    }
    if (c.backgroundId === 'soldier' && eq.bgOption === 'A' && !c.bgToolChoice) root.append(notice('Choose a Gaming Set on the Background step; your starting set matches it.', 'warn'));

    const ready = eq.classOption && eq.bgOption && slots.every((s) => slotValue(c, s));
    root.append(h('div', { class: 'row gap' },
      h('button', { type: 'button', class: 'btn cta', id: 'add-equipment', disabled: !ready, onclick: () => ctx.update((x) => { x.equipment.items = buildInventory(x); x.equipment.added = true; }) }, eq.added ? 'Refresh Starting Equipment' : 'Add Starting Equipment'),
      h('p', { class: 'gold-line' }, 'Starting gold: ', h('strong', {}, `${startingGold(c)} gp`))));
    if (eq.added) root.append(inventoryPanel(ctx));
    root.append(shopPanel(ctx));
    return root;
  },
};

function inventoryPanel(ctx) {
  const { c } = ctx;
  const items = c.equipment.items;
  const trained = armorTrainingOf(c);
  const rows = items.map((it, i) => {
    const found = resolveItem(it.id);
    const wearable = found && (found.kind === 'armor' || found.kind === 'shield');
    const cat = found?.item.category;
    const untrained = wearable && !trained.includes(cat);
    return h('li', { class: 'inv-row' },
      h('span', { class: 'inv-name' }, itemName({ ...it, qty: 1 }), it.qty > 1 ? ` ×${it.qty}` : '', it.paid ? tag('bought', 'sub') : null, untrained ? tag('not trained', 'bad') : null),
      wearable ? h('label', { class: 'inline-check' }, h('input', { type: 'checkbox', id: `equip-${i}`, checked: it.equipped, onchange: () => ctx.update((x) => toggleEquipped(x, i)) }), 'Equipped') : null,
      h('button', { type: 'button', class: 'btn small', 'aria-label': `Remove one ${found?.item.name || it.id}`, onclick: () => ctx.update((x) => removeItem(x, i)) }, 'Remove'));
  });
  return h('div', { class: 'sub-panel' },
    h('h4', {}, 'Your equipment'),
    items.length ? h('ul', { class: 'inv-list' }, rows) : h('p', { class: 'hint' }, 'Nothing yet.'),
    h('p', { class: 'hint' }, `Gold: ${formatCost(goldLeft(c))} · Weight: ${Math.round(totalWeight(items) * 10) / 10} lb`),
    items.some((it) => resolveItem(it.id)?.kind === 'armor' || it.id === 'shield') ? h('p', { class: 'hint' }, 'Wear only what you are trained to use; armor and shields change your AC in the sidebar.') : null);
}

function shopPanel(ctx) {
  const { c } = ctx;
  const gold = goldLeft(c);
  const listBox = h('div', { class: 'picker-list' });
  const draw = () => {
    const q = shop.q.trim().toLowerCase();
    const items = SHOP_CATEGORIES[shop.category].items().filter((i) => !q || i.name.toLowerCase().includes(q));
    listBox.replaceChildren(h('ul', { class: 'shop-list' }, items.map((item) => {
      const affordable = item.cost <= goldLeft(c);
      const extra = item.damage ? ` · ${item.damage} ${item.damageType}` : item.baseAC ? ` · AC ${item.baseAC}` : item.acBonus ? ` · +${item.acBonus} AC` : '';
      return h('li', { class: 'shop-row' },
        h('span', {}, h('strong', {}, item.name), h('small', {}, `${extra}${item.weight ? ` · ${item.weight} lb` : ''}`)),
        h('span', { class: 'price' }, formatCost(item.cost)),
        h('button', { type: 'button', class: 'btn small', id: `buy-${item.id}`, disabled: !affordable, 'aria-label': `Buy ${item.name} for ${formatCost(item.cost)}`,
          onclick: () => ctx.update((x) => { buyItem(x, item.id, defaultVariant(item.id)); }) }, 'Buy'));
    })));
  };
  draw();
  return h('details', { class: 'sub-panel shop', open: shop.open, ontoggle: (e) => { shop.open = e.target.open; } },
    h('summary', {}, `Shop (optional) · ${formatCost(gold)} available`),
    h('p', { class: 'hint' }, 'Spend your gold on extra gear. Purchases are kept when you refresh starting equipment.'),
    h('div', { class: 'filters' },
      field('Category', select({ id: 'shop-cat', value: shop.category, options: Object.entries(SHOP_CATEGORIES).map(([value, v]) => ({ value, label: v.label })), onChange: (v) => { shop.category = v || 'weapons'; draw(); } })),
      field('Search', h('input', { id: 'shop-q', type: 'search', value: shop.q, placeholder: 'Search items', oninput: (e) => { shop.q = e.target.value; draw(); } }))),
    listBox);
}
