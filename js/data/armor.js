// Armor and shields (SRD 5.2, CC-BY-4.0). cost in gold pieces, weight in pounds.
// baseAC: armor's base; dexCap: max Dex modifier added (null = no cap, 0 = none).

function a(name, category, baseAC, dexCap, strength, stealthDisadvantage, cost, weight, donMinutes, doffMinutes) {
  return {
    id: name.toLowerCase().replace(/[^a-z]+/g, '-'),
    name, category, baseAC, dexCap, strength, stealthDisadvantage, cost, weight, donMinutes, doffMinutes,
  };
}

export const ARMOR = [
  // Light
  a('Padded Armor', 'light', 11, null, 0, true, 5, 8, 1, 1),
  a('Leather Armor', 'light', 11, null, 0, false, 10, 10, 1, 1),
  a('Studded Leather Armor', 'light', 12, null, 0, false, 45, 13, 1, 1),
  // Medium (Dex capped at +2)
  a('Hide Armor', 'medium', 12, 2, 0, false, 10, 12, 5, 1),
  a('Chain Shirt', 'medium', 13, 2, 0, false, 50, 20, 5, 1),
  a('Scale Mail', 'medium', 14, 2, 0, true, 50, 45, 5, 1),
  a('Breastplate', 'medium', 14, 2, 0, false, 400, 20, 5, 1),
  a('Half Plate Armor', 'medium', 15, 2, 0, true, 750, 40, 5, 1),
  // Heavy (no Dex)
  a('Ring Mail', 'heavy', 14, 0, 0, true, 30, 40, 10, 5),
  a('Chain Mail', 'heavy', 16, 0, 13, true, 75, 55, 10, 5),
  a('Splint Armor', 'heavy', 17, 0, 15, true, 200, 60, 10, 5),
  a('Plate Armor', 'heavy', 18, 0, 15, true, 1500, 65, 10, 5),
];

export const SHIELD = { id: 'shield', name: 'Shield', category: 'shield', acBonus: 2, cost: 10, weight: 6 };

export const ARMOR_BY_ID = Object.fromEntries(ARMOR.map((x) => [x.id, x]));
ARMOR_BY_ID[SHIELD.id] = SHIELD;

export const ARMOR_RULES = {
  training: 'You gain the AC benefits of armor only if trained with it. Wearing armor you are not trained with gives you Disadvantage on any D20 Test involving Strength or Dexterity and you cannot cast spells.',
  strength: 'If armor lists a Strength requirement and your Strength score is lower, your Speed is reduced by 10 feet while you wear it.',
  stealth: 'Armor with Stealth Disadvantage gives you Disadvantage on Dexterity (Stealth) checks.',
  shield: 'A Shield grants +2 AC and requires training. You can wear only one Shield. Donning or doffing it takes the Utilize action.',
  unarmored: 'Without armor, your AC is 10 + your Dexterity modifier.',
};
