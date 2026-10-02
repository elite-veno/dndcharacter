// Feats (SRD 5.2, CC-BY-4.0): Origin, General, Fighting Style and Epic Boon.

function f(id, name, category, prerequisite, repeatable, desc, benefits = []) {
  return { id, name, category, prerequisite, repeatable, desc, benefits };
}

export const FEATS = [
  // ---- Origin feats (granted by Background at level 1) ----
  f('alert', 'Alert', 'origin', null, false,
    'You are always on the lookout for danger.', [
      'Initiative Proficiency: you add your Proficiency Bonus to your Initiative rolls.',
      'Initiative Swap: immediately after rolling Initiative, you can swap your Initiative with a willing ally (if neither is Incapacitated).',
    ]),
  f('magic-initiate-cleric', 'Magic Initiate (Cleric)', 'origin', null, true,
    'You learn magic from the Cleric spell list.', [
      'Two Cantrips: learn two cantrips of your choice from the Cleric spell list.',
      'Level 1 Spell: choose a level 1 Cleric spell. You always have it prepared, and can cast it once per Long Rest without a slot (or with any slots you have).',
      'Spellcasting Ability: Intelligence, Wisdom, or Charisma (choose when you take the feat).',
      'Spell Change: when you gain a level, you can swap one of the chosen spells for another of the same level from the list.',
    ]),
  f('magic-initiate-druid', 'Magic Initiate (Druid)', 'origin', null, true,
    'You learn magic from the Druid spell list.', [
      'Two Cantrips: learn two cantrips of your choice from the Druid spell list.',
      'Level 1 Spell: choose a level 1 Druid spell. You always have it prepared, and can cast it once per Long Rest without a slot.',
      'Spellcasting Ability: Intelligence, Wisdom, or Charisma (choose when you take the feat).',
    ]),
  f('magic-initiate-wizard', 'Magic Initiate (Wizard)', 'origin', null, true,
    'You learn magic from the Wizard spell list.', [
      'Two Cantrips: learn two cantrips of your choice from the Wizard spell list.',
      'Level 1 Spell: choose a level 1 Wizard spell. You always have it prepared, and can cast it once per Long Rest without a slot.',
      'Spellcasting Ability: Intelligence, Wisdom, or Charisma (choose when you take the feat).',
    ]),
  f('savage-attacker', 'Savage Attacker', 'origin', null, false,
    'You have trained to deal particularly damaging strikes.', [
      'Once per turn when you hit a target with a weapon, you can roll the weapon\'s damage dice twice and use either roll.',
    ]),
  f('skilled', 'Skilled', 'origin', null, true,
    'You are proficient in a broad set of skills and tools.', [
      'Gain proficiency in any combination of three skills or tools of your choice.',
    ]),

  // ---- General feats (level 4+) ----
  f('ability-score-improvement', 'Ability Score Improvement', 'general', 'Level 4+', true,
    'You increase your abilities.', [
      'Increase one ability score of your choice by 2, or two ability scores by 1 each. This feat cannot raise a score above 20.',
    ]),
  f('grappler', 'Grappler', 'general', 'Level 4+, Strength or Dexterity 13+', false,
    'You are an adept wrestler.', [
      'Ability Score Increase: +1 to Strength or Dexterity (max 20).',
      'Punch and Grab: when you hit with an Unarmed Strike as part of the Attack action, you can deal damage and also apply the Grappled condition (once per turn).',
      'Attack Advantage: you have Advantage on attack rolls against a creature Grappled by you.',
      'Fast Wrestler: you do not need to spend extra movement to move a creature Grappled by you if it is your size or smaller.',
    ]),

  // ---- Fighting Style feats ----
  f('archery', 'Archery', 'fighting-style', 'Fighting Style feature', false,
    'You gain a +2 bonus to attack rolls you make with ranged weapons.', ['+2 to attack rolls with Ranged weapons.']),
  f('defense', 'Defense', 'fighting-style', 'Fighting Style feature', false,
    'While you are wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.', ['+1 AC while wearing armor.']),
  f('great-weapon-fighting', 'Great Weapon Fighting', 'fighting-style', 'Fighting Style feature', false,
    'When you roll a 1 or 2 on a damage die of an attack with a Melee weapon you are wielding with two hands, you can treat the roll as a 3. The weapon must have the Two-Handed or Versatile property.', ['Damage dice 1 or 2 count as 3 (two-handed melee).']),
  f('two-weapon-fighting', 'Two-Weapon Fighting', 'fighting-style', 'Fighting Style feature', false,
    'When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack.', ['Add ability modifier to the damage of the Light-weapon extra attack.']),

  // ---- Epic Boon feats (level 19+) ----
  f('boon-of-combat-prowess', 'Boon of Combat Prowess', 'epic-boon', 'Level 19+', false,
    'Increase one ability score by 1 (max 30). Peerless Aim: when you miss with an attack roll, you can hit instead (once per Initiative).'),
  f('boon-of-dimensional-travel', 'Boon of Dimensional Travel', 'epic-boon', 'Level 19+', false,
    'Increase one ability score by 1 (max 30). Blink Steps: after the Attack or Magic action, teleport up to 30 feet.'),
  f('boon-of-fate', 'Boon of Fate', 'epic-boon', 'Level 19+', false,
    'Increase one ability score by 1 (max 30). Improve Fate: add or subtract 2d4 from a nearby creature\'s D20 Test (once per Initiative).'),
  f('boon-of-irresistible-offense', 'Boon of Irresistible Offense', 'epic-boon', 'Level 19+', false,
    'Increase Strength or Dexterity by 1 (max 30). Your attacks ignore Resistance to Bludgeoning, Piercing, and Slashing; natural 20s deal extra damage.'),
  f('boon-of-spell-recall', 'Boon of Spell Recall', 'epic-boon', 'Level 19+, Spellcasting', false,
    'Increase your spellcasting ability by 1 (max 30). Free Casting: when you cast a spell using a slot of levels 1-4, roll a d4; on a 4 the slot is not expended.'),
  f('boon-of-the-night-spirit', 'Boon of the Night Spirit', 'epic-boon', 'Level 19+', false,
    'Increase one ability score by 1 (max 30). Merge with Shadows and Shadowy Form while in dim light or darkness.'),
  f('boon-of-skill', 'Boon of Skill', 'epic-boon', 'Level 19+', false,
    'Increase one ability score by 1 (max 30). Gain proficiency in all skills.'),
  f('boon-of-speed', 'Boon of Speed', 'epic-boon', 'Level 19+', false,
    'Increase Dexterity by 1 (max 30). Escape Artist: Bonus Action Disengage; Speed increases by 30 feet.'),
];

export const FEAT_BY_ID = Object.fromEntries(FEATS.map((x) => [x.id, x]));
export const featsByCategory = (category) => FEATS.filter((x) => x.category === category);

export const FEAT_CATEGORIES = {
  origin: 'Origin Feats (gained at level 1 from your Background)',
  general: 'General Feats (level 4+)',
  'fighting-style': 'Fighting Style Feats',
  'epic-boon': 'Epic Boon Feats (level 19+)',
};

// Levels at which most classes gain an Ability Score Improvement (or another feat).
export const ASI_LEVELS = [4, 8, 12, 16];
export const ASI_LEVELS_BY_CLASS = {
  fighter: [4, 6, 8, 12, 14, 16],
  rogue: [4, 8, 10, 12, 16],
};
