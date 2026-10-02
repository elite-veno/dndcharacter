// Adventuring gear and equipment packs (SRD 5.2, CC-BY-4.0). cost in gold pieces.

export const PACKS = [
  { id: 'burglars-pack', name: "Burglar's Pack", cost: 16, weight: 42, contents: ['Backpack', 'Ball Bearings (1,000)', 'Bell', '10 Candles', 'Crowbar', 'Hooded Lantern', '2 Flasks of Oil', '5 days of Rations', 'Rope (50 ft)', 'Tinderbox', 'Waterskin'] },
  { id: 'diplomats-pack', name: "Diplomat's Pack", cost: 39, weight: 39, contents: ['Chest', 'Fine Clothes', 'Ink (1-ounce bottle)', 'Ink Pen', 'Lamp', '2 Map or Scroll Cases', '4 Flasks of Oil', '5 sheets of Paper', 'Perfume', 'Sealing Wax', 'Soap'] },
  { id: 'dungeoneers-pack', name: "Dungeoneer's Pack", cost: 12, weight: 55, contents: ['Backpack', 'Caltrops', 'Crowbar', '2 Flasks of Oil', '10 days of Rations', 'Rope (50 ft)', 'Tinderbox', '10 Torches', 'Waterskin'] },
  { id: 'entertainers-pack', name: "Entertainer's Pack", cost: 40, weight: 58.5, contents: ['Backpack', 'Bedroll', 'Bell', 'Bullseye Lantern', '3 Costumes', 'Mirror', '8 Flasks of Oil', '9 days of Rations', 'Waterskin'] },
  { id: 'explorers-pack', name: "Explorer's Pack", cost: 10, weight: 55, contents: ['Backpack', 'Bedroll', '2 Flasks of Oil', '10 days of Rations', 'Rope (50 ft)', 'Tinderbox', '10 Torches', 'Waterskin'] },
  { id: 'priests-pack', name: "Priest's Pack", cost: 33, weight: 29, contents: ['Backpack', 'Blanket', 'Holy Water (flask)', 'Lamp', '7 days of Rations', 'Robe', 'Tinderbox'] },
  { id: 'scholars-pack', name: "Scholar's Pack", cost: 40, weight: 22, contents: ['Backpack', 'Book', 'Ink (1-ounce bottle)', 'Ink Pen', 'Lamp', '10 Flasks of Oil', '10 sheets of Parchment', 'Tinderbox'] },
];

export const FOCUSES = {
  arcane: ['Crystal', 'Orb', 'Rod', 'Staff', 'Wand'],
  druidic: ['Sprig of Mistletoe', 'Wooden Staff', 'Yew Wand', 'Totem'],
  holy: ['Amulet', 'Emblem', 'Reliquary'],
};

export const GEAR = [
  { id: 'backpack', name: 'Backpack', cost: 2, weight: 5 },
  { id: 'bedroll', name: 'Bedroll', cost: 1, weight: 7 },
  { id: 'rations', name: 'Rations (1 day)', cost: 0.5, weight: 2 },
  { id: 'rope', name: 'Rope (50 ft)', cost: 1, weight: 5 },
  { id: 'torch', name: 'Torch', cost: 0.01, weight: 1 },
  { id: 'tinderbox', name: 'Tinderbox', cost: 0.5, weight: 1 },
  { id: 'waterskin', name: 'Waterskin', cost: 0.2, weight: 5 },
  { id: 'healers-kit', name: "Healer's Kit", cost: 5, weight: 3 },
  { id: 'crowbar', name: 'Crowbar', cost: 2, weight: 5 },
  { id: 'potion-of-healing', name: 'Potion of Healing', cost: 50, weight: 0.5 },
  { id: 'holy-symbol', name: 'Holy Symbol', cost: 5, weight: 1 },
  { id: 'arcane-focus', name: 'Arcane Focus', cost: 5, weight: 1 },
  { id: 'druidic-focus', name: 'Druidic Focus', cost: 1, weight: 0 },
  { id: 'spellbook', name: 'Spellbook', cost: 50, weight: 3 },
  { id: 'component-pouch', name: 'Component Pouch', cost: 25, weight: 2 },
  { id: 'travelers-clothes', name: "Traveler's Clothes", cost: 2, weight: 4 },
  { id: 'robe', name: 'Robe', cost: 1, weight: 4 },
  { id: 'pouch', name: 'Pouch', cost: 0.5, weight: 1 },
  { id: 'quiver', name: 'Quiver', cost: 1, weight: 1 },
  { id: 'book', name: 'Book', cost: 25, weight: 5 },
  { id: 'parchment', name: 'Parchment (sheet)', cost: 0.1, weight: 0 },
];

export const CURRENCY = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };
