// Starting equipment, purchases and gold. Pure logic on the character's `equipment` block:
//   equipment: { classOption: 'A'|'B'|null, bgOption: 'A'|'B'|null, added: bool, choices: {slotKey: itemId}, items: [...] }
//   item: { id, qty, variant?, equipped?, paid? }  (paid = gold paid per unit when bought in the shop)

import {
  CLASS_BY_ID, BACKGROUND_BY_ID, resolveItem, EQUIPMENT_CHOICES, MUSICAL_INSTRUMENTS, ARTISANS_TOOLS, ARMOR_BY_ID,
} from './data/index.js';
import { armorTrainingOf } from './choices.js';

const slotOptions = {
  'musical-instrument': MUSICAL_INSTRUMENTS,
  'artisan-or-instrument': [...ARTISANS_TOOLS, ...MUSICAL_INSTRUMENTS],
};

/** Display name for an inventory entry ("Arcane Focus (Crystal)"). */
export function itemName(entry) {
  const found = resolveItem(entry.id);
  const base = found ? found.item.name : entry.id;
  const qty = entry.qty > 1 ? ` x${entry.qty}` : '';
  return `${base}${entry.variant ? ` (${entry.variant})` : ''}${qty}`;
}

/** Source lists for the chosen options: [{ source, entries, gold }]. */
function chosenSources(c) {
  const out = [];
  const cls = CLASS_BY_ID[c.classId];
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const eq = c.equipment;
  if (cls) out.push({ source: 'class', option: eq.classOption, entries: cls.startingEquipment.a, goldA: cls.startingEquipment.goldA, goldB: cls.startingEquipment.goldB });
  if (bg) out.push({ source: 'background', option: eq.bgOption, entries: bg.equipmentA, goldA: bg.goldA, goldB: bg.goldB });
  return out;
}

/** Choice slots (e.g. "pick a musical instrument") required by the chosen Option A lists. */
export function choiceSlots(c) {
  const slots = [];
  for (const src of chosenSources(c)) {
    if (src.option !== 'A') continue;
    src.entries.forEach((entry, i) => {
      if (!entry.choice) return;
      const key = `${src.source}:${i}`;
      if (entry.choice === 'gaming-set') {
        slots.push({ key, kind: entry.choice, label: EQUIPMENT_CHOICES[entry.choice], auto: c.bgToolChoice || null, options: [] });
      } else {
        slots.push({ key, kind: entry.choice, label: EQUIPMENT_CHOICES[entry.choice], auto: null, options: slotOptions[entry.choice] || [] });
      }
    });
  }
  return slots;
}

/** Selected id for a choice slot (auto-resolved ones follow the Background). */
export const slotValue = (c, slot) => slot.auto || c.equipment.choices[slot.key] || null;

/** Items granted by the chosen options, with choice slots resolved. Unresolved slots are skipped. */
export function startingItems(c) {
  const items = [];
  const add = (entry) => {
    const found = items.find((x) => x.id === entry.id && (x.variant || '') === (entry.variant || ''));
    if (found) found.qty += entry.qty || 1;
    else items.push({ id: entry.id, qty: entry.qty || 1, variant: entry.variant || null, equipped: false, paid: 0 });
  };
  for (const src of chosenSources(c)) {
    if (src.option !== 'A') continue;
    src.entries.forEach((entry, i) => {
      if (entry.choice) {
        const slot = choiceSlots(c).find((s) => s.key === `${src.source}:${i}`);
        const id = slot && slotValue(c, slot);
        if (id) add({ id, qty: 1 });
      } else add(entry);
    });
  }
  return items;
}

/** Starting gold from the chosen options (Option A leftover gold, or Option B in lieu of items). */
export function startingGold(c) {
  return chosenSources(c).reduce((sum, src) => sum + (src.option === 'A' ? src.goldA : src.option === 'B' ? src.goldB : 0), 0);
}

/** Gold spent in the shop. */
export const goldSpent = (items) => round2(items.reduce((sum, it) => sum + (it.paid || 0) * it.qty, 0));

/** Current gold = starting gold - purchases. */
export const goldLeft = (c) => round2(startingGold(c) - goldSpent(c.equipment.items));

const round2 = (n) => Math.round(n * 100) / 100;

/** Total weight in pounds of all items. */
export function totalWeight(items) {
  return items.reduce((sum, it) => sum + (resolveItem(it.id)?.item.weight || 0) * it.qty, 0);
}

/** Equip the best armor (highest base AC the character is trained in) and a shield, clearing other flags. */
export function autoEquip(c, items) {
  const trained = armorTrainingOf(c);
  let best = null;
  for (const it of items) {
    it.equipped = false;
    const found = resolveItem(it.id);
    if (found?.kind === 'armor' && trained.includes(found.item.category)) {
      if (!best || found.item.baseAC > resolveItem(best.id).item.baseAC) best = it;
    }
  }
  if (best) best.equipped = true;
  const shield = items.find((it) => it.id === 'shield');
  if (shield && trained.includes('shield')) shield.equipped = true;
  return items;
}

/**
 * Build the inventory for "Add Starting Equipment": granted items plus any shop purchases already made.
 * Marks the best armor/shield as equipped.
 */
export function buildInventory(c) {
  const items = startingItems(c);
  for (const it of c.equipment.items) if (it.paid > 0) items.push({ ...it });
  return autoEquip(c, items);
}

/** Add one purchased unit (merging with an identical purchase). Returns false when the character cannot afford it. */
export function buyItem(c, id, variant = null) {
  const found = resolveItem(id);
  if (!found) return false;
  const cost = found.item.cost;
  if (cost > goldLeft(c)) return false;
  const items = c.equipment.items;
  const same = items.find((x) => x.id === id && (x.variant || '') === (variant || '') && x.paid === cost);
  if (same) same.qty += 1;
  else items.push({ id, qty: 1, variant, equipped: false, paid: cost });
  return true;
}

/** Remove one unit of an item; purchased units are refunded automatically through `paid`. */
export function removeItem(c, index) {
  const it = c.equipment.items[index];
  if (!it) return;
  if (it.qty > 1) it.qty -= 1;
  else c.equipment.items.splice(index, 1);
}

/** Toggle equipped state; only one body armor and one shield can be worn at a time. */
export function toggleEquipped(c, index) {
  const items = c.equipment.items;
  const it = items[index];
  const found = resolveItem(it.id);
  if (!found || (found.kind !== 'armor' && found.kind !== 'shield')) return;
  const next = !it.equipped;
  if (next) items.forEach((other) => { if (resolveItem(other.id)?.kind === found.kind) other.equipped = false; });
  it.equipped = next;
}

/** Equipped armor object, or null. */
export function equippedArmor(items) {
  const it = items.find((x) => x.equipped && resolveItem(x.id)?.kind === 'armor');
  return it ? ARMOR_BY_ID[it.id] : null;
}

/** True when a shield is equipped. */
export const hasShieldEquipped = (items) => items.some((x) => x.equipped && x.id === 'shield');

/** Forget starting equipment choices and items (called when the class or background changes). */
export function resetEquipment(c) {
  c.equipment = { classOption: null, bgOption: null, added: false, choices: {}, items: [] };
}

/** Starting-equipment options changed: drop granted items (keep shop purchases) and require re-adding. */
export function invalidateStarting(c) {
  c.equipment.added = false;
  c.equipment.items = c.equipment.items.filter((it) => it.paid > 0);
}

/** Format a gold amount for display ("12 gp", "5 sp", "1 cp"). */
export function formatCost(gp) {
  if (gp >= 1 || gp === 0) return `${Math.round(gp * 100) / 100} gp`;
  if (gp >= 0.1) return `${Math.round(gp * 10)} sp`;
  return `${Math.round(gp * 100)} cp`;
}
