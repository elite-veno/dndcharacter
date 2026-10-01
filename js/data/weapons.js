// Weapons, weapon properties and Weapon Mastery (SRD 5.2, CC-BY-4.0).
// cost is in gold pieces (1 sp = 0.1, 1 cp = 0.01); weight in pounds.

export const WEAPON_PROPERTIES = {
  ammunition: 'Needs ammunition to make a ranged attack; drawing it is part of the attack. Ammunition is spent on a hit or miss; half can be recovered after a fight.',
  finesse: 'Use your choice of Strength or Dexterity for the attack and damage rolls (same modifier for both).',
  heavy: 'You have Disadvantage on attack rolls with this weapon if it is a melee weapon and your Strength is below 13, or a ranged weapon and your Dexterity is below 13.',
  light: 'When you take the Attack action with a Light weapon, you can make one extra attack as a Bonus Action with a different Light weapon (no ability modifier to damage unless negative).',
  loading: 'You can fire only one piece of ammunition from it when you use an action, Bonus Action, or Reaction to fire it, regardless of attacks you can normally make.',
  range: 'Range is shown as normal/long in feet. Attacks beyond normal range have Disadvantage; you cannot attack beyond long range.',
  reach: 'Adds 5 feet to your reach when attacking with it (and for Opportunity Attacks).',
  thrown: 'You can throw the weapon to make a ranged attack, using the same ability modifier as for a melee attack with it.',
  'two-handed': 'Requires two hands to make attacks with it.',
  versatile: 'Can be used with one or two hands. A different damage value in parentheses applies when used with two hands.',
};

export const WEAPON_MASTERY = {
  cleave: { name: 'Cleave', desc: 'If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with it against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon damage without your ability modifier (unless negative). Once per turn.' },
  graze: { name: 'Graze', desc: 'If your attack roll with this weapon misses a creature, you can deal damage to it equal to the ability modifier you used for the attack roll. This damage is the weapon\'s type and can be increased only by raising the ability modifier.' },
  nick: { name: 'Nick', desc: 'When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.' },
  push: { name: 'Push', desc: 'If you hit a creature with this weapon, you can push it up to 10 feet straight away from you if it is Large or smaller.' },
  sap: { name: 'Sap', desc: 'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.' },
  slow: { name: 'Slow', desc: 'If you hit a creature with this weapon and deal damage, you can reduce its Speed by 10 feet until the start of your next turn (no stacking; the greatest reduction applies).' },
  topple: { name: 'Topple', desc: 'If you hit a creature with this weapon, you can force it to make a Constitution saving throw (DC 8 + the ability modifier used for the attack + your Proficiency Bonus). On a failure, it has the Prone condition.' },
  vex: { name: 'Vex', desc: 'If you hit a creature with this weapon and deal damage, you have Advantage on your next attack roll against that creature before the end of your next turn.' },
};

function w(name, category, type, damage, damageType, mastery, cost, weight, extra = {}) {
  return {
    id: name.toLowerCase().replace(/[^a-z]+/g, '-'),
    name,
    category, // 'simple' | 'martial'
    type, // 'melee' | 'ranged'
    damage,
    damageType,
    mastery,
    cost,
    weight,
    properties: extra.props || [],
    versatile: extra.versatile || null, // two-handed damage die
    range: extra.range || null, // [normal, long] for ranged / ammunition weapons
    thrown: extra.thrown || null, // [normal, long]
  };
}

export const WEAPONS = [
  // Simple melee
  w('Club', 'simple', 'melee', '1d4', 'bludgeoning', 'slow', 0.1, 2, { props: ['light'] }),
  w('Dagger', 'simple', 'melee', '1d4', 'piercing', 'nick', 2, 1, { props: ['finesse', 'light', 'thrown'], thrown: [20, 60] }),
  w('Greatclub', 'simple', 'melee', '1d8', 'bludgeoning', 'push', 0.2, 10, { props: ['two-handed'] }),
  w('Handaxe', 'simple', 'melee', '1d6', 'slashing', 'vex', 5, 2, { props: ['light', 'thrown'], thrown: [20, 60] }),
  w('Javelin', 'simple', 'melee', '1d6', 'piercing', 'slow', 0.5, 2, { props: ['thrown'], thrown: [30, 120] }),
  w('Light Hammer', 'simple', 'melee', '1d4', 'bludgeoning', 'nick', 2, 2, { props: ['light', 'thrown'], thrown: [20, 60] }),
  w('Mace', 'simple', 'melee', '1d6', 'bludgeoning', 'sap', 5, 4),
  w('Quarterstaff', 'simple', 'melee', '1d6', 'bludgeoning', 'topple', 0.2, 4, { props: ['versatile'], versatile: '1d8' }),
  w('Sickle', 'simple', 'melee', '1d4', 'slashing', 'nick', 1, 2, { props: ['light'] }),
  w('Spear', 'simple', 'melee', '1d6', 'piercing', 'sap', 1, 3, { props: ['thrown', 'versatile'], versatile: '1d8', thrown: [20, 60] }),
  // Simple ranged
  w('Dart', 'simple', 'ranged', '1d4', 'piercing', 'vex', 0.05, 0.25, { props: ['finesse', 'thrown'], range: [20, 60], thrown: [20, 60] }),
  w('Light Crossbow', 'simple', 'ranged', '1d8', 'piercing', 'slow', 25, 5, { props: ['ammunition', 'loading', 'two-handed'], range: [80, 320] }),
  w('Shortbow', 'simple', 'ranged', '1d6', 'piercing', 'vex', 25, 2, { props: ['ammunition', 'two-handed'], range: [80, 320] }),
  w('Sling', 'simple', 'ranged', '1d4', 'bludgeoning', 'slow', 1, 0, { props: ['ammunition'], range: [30, 120] }),
  // Martial melee
  w('Battleaxe', 'martial', 'melee', '1d8', 'slashing', 'topple', 10, 4, { props: ['versatile'], versatile: '1d10' }),
  w('Flail', 'martial', 'melee', '1d8', 'bludgeoning', 'sap', 10, 2),
  w('Glaive', 'martial', 'melee', '1d10', 'slashing', 'graze', 20, 6, { props: ['heavy', 'reach', 'two-handed'] }),
  w('Greataxe', 'martial', 'melee', '1d12', 'slashing', 'cleave', 30, 7, { props: ['heavy', 'two-handed'] }),
  w('Greatsword', 'martial', 'melee', '2d6', 'slashing', 'graze', 50, 6, { props: ['heavy', 'two-handed'] }),
  w('Halberd', 'martial', 'melee', '1d10', 'slashing', 'cleave', 20, 6, { props: ['heavy', 'reach', 'two-handed'] }),
  w('Lance', 'martial', 'melee', '1d10', 'piercing', 'topple', 10, 6, { props: ['heavy', 'reach'] }),
  w('Longsword', 'martial', 'melee', '1d8', 'slashing', 'sap', 15, 3, { props: ['versatile'], versatile: '1d10' }),
  w('Maul', 'martial', 'melee', '2d6', 'bludgeoning', 'topple', 10, 10, { props: ['heavy', 'two-handed'] }),
  w('Morningstar', 'martial', 'melee', '1d8', 'piercing', 'sap', 15, 4),
  w('Pike', 'martial', 'melee', '1d10', 'piercing', 'push', 5, 18, { props: ['heavy', 'reach', 'two-handed'] }),
  w('Rapier', 'martial', 'melee', '1d8', 'piercing', 'vex', 25, 2, { props: ['finesse'] }),
  w('Scimitar', 'martial', 'melee', '1d6', 'slashing', 'nick', 25, 3, { props: ['finesse', 'light'] }),
  w('Shortsword', 'martial', 'melee', '1d6', 'piercing', 'vex', 10, 2, { props: ['finesse', 'light'] }),
  w('Trident', 'martial', 'melee', '1d8', 'piercing', 'topple', 5, 4, { props: ['thrown', 'versatile'], versatile: '1d10', thrown: [20, 60] }),
  w('War Pick', 'martial', 'melee', '1d8', 'piercing', 'sap', 5, 2, { props: ['versatile'], versatile: '1d10' }),
  w('Warhammer', 'martial', 'melee', '1d8', 'bludgeoning', 'push', 15, 5, { props: ['versatile'], versatile: '1d10' }),
  w('Whip', 'martial', 'melee', '1d4', 'slashing', 'slow', 2, 3, { props: ['finesse', 'reach'] }),
  // Martial ranged
  w('Blowgun', 'martial', 'ranged', '1', 'piercing', 'vex', 10, 1, { props: ['ammunition', 'loading'], range: [25, 100] }),
  w('Hand Crossbow', 'martial', 'ranged', '1d6', 'piercing', 'vex', 75, 3, { props: ['ammunition', 'light', 'loading'], range: [30, 120] }),
  w('Heavy Crossbow', 'martial', 'ranged', '1d10', 'piercing', 'push', 50, 18, { props: ['ammunition', 'heavy', 'loading', 'two-handed'], range: [100, 400] }),
  w('Longbow', 'martial', 'ranged', '1d8', 'piercing', 'slow', 50, 2, { props: ['ammunition', 'heavy', 'two-handed'], range: [150, 600] }),
];

export const WEAPON_BY_ID = Object.fromEntries(WEAPONS.map((x) => [x.id, x]));

export const AMMUNITION = [
  { id: 'arrows', name: 'Arrows (20)', cost: 1, weight: 1 },
  { id: 'bolts', name: 'Crossbow Bolts (20)', cost: 1, weight: 1.5 },
  { id: 'bullets', name: 'Sling Bullets (20)', cost: 0.04, weight: 1.5 },
  { id: 'needles', name: 'Blowgun Needles (50)', cost: 1, weight: 1 },
];
