// Item lookup across all equipment tables, plus the choice slots used by starting equipment.
// Starting equipment entries are structured: { id, qty?, variant? } or { choice }.
import { WEAPON_BY_ID, AMMUNITION } from './weapons.js';
import { ARMOR_BY_ID } from './armor.js';
import { GEAR, PACKS, FOCUSES } from './gear.js';
import { TOOL_BY_ID } from './tools.js';

const AMMO_BY_ID = Object.fromEntries(AMMUNITION.map((x) => [x.id, x]));
const GEAR_BY_ID = Object.fromEntries(GEAR.map((x) => [x.id, x]));
const PACK_BY_ID = Object.fromEntries(PACKS.map((x) => [x.id, x]));

// Kinds of choice slots a starting-equipment entry may reference.
export const EQUIPMENT_CHOICES = {
  'musical-instrument': 'One Musical Instrument of your choice',
  'artisan-or-instrument': "One kind of Artisan's Tools or one Musical Instrument of your choice",
  'gaming-set': 'One Gaming Set (the same kind you are proficient with)',
};

/** Resolve an item id to { kind, item } or null. */
export function resolveItem(id) {
  if (WEAPON_BY_ID[id]) return { kind: 'weapon', item: WEAPON_BY_ID[id] };
  if (ARMOR_BY_ID[id]) return { kind: id === 'shield' ? 'shield' : 'armor', item: ARMOR_BY_ID[id] };
  if (PACK_BY_ID[id]) return { kind: 'pack', item: PACK_BY_ID[id] };
  if (TOOL_BY_ID[id]) return { kind: 'tool', item: TOOL_BY_ID[id] };
  if (AMMO_BY_ID[id]) return { kind: 'ammunition', item: AMMO_BY_ID[id] };
  if (GEAR_BY_ID[id]) return { kind: 'gear', item: GEAR_BY_ID[id] };
  return null;
}

/** True if a variant (e.g. 'Crystal') is a valid option for the item. Items without variants accept none. */
export function isValidVariant(id, variant) {
  if (id === 'arcane-focus') return FOCUSES.arcane.includes(variant);
  if (id === 'druidic-focus') return FOCUSES.druidic.includes(variant);
  if (id === 'holy-symbol') return FOCUSES.holy.includes(variant);
  if (id === 'book') return typeof variant === 'string' && variant.length > 0;
  return false;
}
