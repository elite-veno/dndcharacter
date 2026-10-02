// Species (SRD 5.2, CC-BY-4.0). In the 2024 rules species grant NO ability score increases.
// Every character knows Common plus two other languages of choice.

function trait(name, desc, level = 1) { return { name, desc, level }; }

export const SPECIES = [
  {
    id: 'dragonborn', name: 'Dragonborn', size: ['Medium'], speed: 30, darkvision: 60,
    desc: 'Descendants of dragons, with draconic ancestry, a breath weapon, and scaled hides.',
    choices: { ancestry: ['Black', 'Blue', 'Brass', 'Bronze', 'Copper', 'Gold', 'Green', 'Red', 'Silver', 'White'] },
    ancestryDamage: { Black: 'acid', Blue: 'lightning', Brass: 'fire', Bronze: 'lightning', Copper: 'acid', Gold: 'fire', Green: 'poison', Red: 'fire', Silver: 'cold', White: 'cold' },
    traits: [
      trait('Draconic Ancestry', 'Choose a dragon type; it determines your Breath Weapon and Damage Resistance damage type.'),
      trait('Breath Weapon', 'When you take the Attack action you can replace one attack with a breath weapon: 15-ft cone or 30-ft line (5 ft wide). Dex save (DC 8 + Con mod + Proficiency Bonus) or 1d10 damage of your ancestry type (half on success). Damage becomes 2d10 at level 5, 3d10 at 11, 4d10 at 17. Uses equal to Proficiency Bonus per Long Rest.'),
      trait('Damage Resistance', 'Resistance to the damage type of your Draconic Ancestry.'),
      trait('Darkvision', 'Darkvision with a range of 60 feet.'),
      trait('Draconic Flight', 'Bonus Action: sprout spectral wings for 10 minutes; Fly Speed equal to your Speed. Once per Long Rest.', 5),
    ],
  },
  {
    id: 'dwarf', name: 'Dwarf', size: ['Medium'], speed: 30, darkvision: 120,
    desc: 'Stout, resilient folk of stone and forge.',
    hpPerLevelBonus: 1,
    traits: [
      trait('Darkvision', 'Darkvision with a range of 120 feet.'),
      trait('Dwarven Resilience', 'Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition.'),
      trait('Dwarven Toughness', 'Your Hit Point maximum increases by 1, and increases by 1 again whenever you gain a level.'),
      trait('Stonecunning', 'Bonus Action: gain Tremorsense (60 ft) for 10 minutes while on or touching a stone surface. Uses equal to Proficiency Bonus per Long Rest.'),
    ],
  },
  {
    id: 'elf', name: 'Elf', size: ['Medium'], speed: 30, darkvision: 60,
    desc: 'Graceful, long-lived fey-touched people.',
    choices: { lineage: ['Drow', 'High Elf', 'Wood Elf'], spellcastingAbility: ['int', 'wis', 'cha'], keenSenses: ['insight', 'perception', 'survival'] },
    lineages: {
      Drow: 'Darkvision increases to 120 ft. Dancing Lights cantrip; Faerie Fire at level 3; Darkness at level 5.',
      'High Elf': 'Prestidigitation cantrip (swappable on Long Rest for another Wizard cantrip); Detect Magic at level 3; Misty Step at level 5.',
      'Wood Elf': 'Speed increases to 35 ft. Druidcraft cantrip; Longstrider at level 3; Pass without Trace at level 5.',
    },
    traits: [
      trait('Darkvision', 'Darkvision with a range of 60 feet.'),
      trait('Elven Lineage', 'Choose Drow, High Elf, or Wood Elf for lasting benefits and spells. Spellcasting ability is Intelligence, Wisdom, or Charisma (your choice).'),
      trait('Fey Ancestry', 'Advantage on saving throws to avoid or end the Charmed condition.'),
      trait('Keen Senses', 'Proficiency in Insight, Perception, or Survival (your choice).'),
      trait('Trance', 'You do not need to sleep; you meditate for 4 hours to gain the benefit of a Long Rest and are not magically put to sleep.'),
    ],
  },
  {
    id: 'gnome', name: 'Gnome', size: ['Small'], speed: 30, darkvision: 60,
    desc: 'Small, curious tinkerers and illusionists.',
    choices: { lineage: ['Forest Gnome', 'Rock Gnome'], spellcastingAbility: ['int', 'wis', 'cha'] },
    lineages: {
      'Forest Gnome': 'Minor Illusion cantrip; Speak with Animals always prepared (Proficiency Bonus times per Long Rest).',
      'Rock Gnome': 'Mending and Prestidigitation cantrips; you can craft tiny clockwork devices.',
    },
    traits: [
      trait('Darkvision', 'Darkvision with a range of 60 feet.'),
      trait('Gnomish Cunning', 'Advantage on Intelligence, Wisdom, and Charisma saving throws.'),
      trait('Gnomish Lineage', 'Choose Forest Gnome or Rock Gnome. Spellcasting ability is Intelligence, Wisdom, or Charisma.'),
    ],
  },
  {
    id: 'goliath', name: 'Goliath', size: ['Medium'], speed: 35, darkvision: 0,
    desc: 'Towering folk descended from giants, at home in the mountains.',
    choices: { ancestry: ["Cloud's Jaunt", "Fire's Burn", "Frost's Chill", "Hill's Tumble", "Stone's Endurance", "Storm's Thunder"] },
    traits: [
      trait('Giant Ancestry', "Choose a boon (Proficiency Bonus uses per Long Rest): Cloud's Jaunt (teleport 30 ft), Fire's Burn (+1d10 fire on hit), Frost's Chill (+1d6 cold and -10 ft Speed), Hill's Tumble (knock Large or smaller Prone), Stone's Endurance (Reaction: reduce damage by 1d12 + Con mod), Storm's Thunder (Reaction: 1d8 thunder to attacker)."),
      trait('Large Form', 'Bonus Action: become Large for 10 minutes, with Advantage on Strength checks and +10 ft Speed. Once per Long Rest.', 5),
      trait('Powerful Build', 'Advantage on any ability check to end the Grappled condition, and you count as one size larger when determining carrying capacity.'),
    ],
  },
  {
    id: 'halfling', name: 'Halfling', size: ['Small'], speed: 30, darkvision: 0,
    desc: 'Small, nimble, and famously lucky.',
    traits: [
      trait('Brave', 'Advantage on saving throws to avoid or end the Frightened condition.'),
      trait('Halfling Nimbleness', 'You can move through the space of any creature that is a size larger than you, but you cannot stop there.'),
      trait('Luck', 'When you roll a 1 on the d20 of a D20 Test, you can reroll the die and must use the new roll.'),
      trait('Naturally Stealthy', 'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.'),
    ],
  },
  {
    id: 'human', name: 'Human', size: ['Medium', 'Small'], speed: 30, darkvision: 0,
    desc: 'Adaptable, ambitious people found everywhere.',
    choices: { skill: 'any' },
    traits: [
      trait('Resourceful', 'You gain Heroic Inspiration whenever you finish a Long Rest.'),
      trait('Skillful', 'Proficiency in one skill of your choice.'),
      trait('Versatile', 'You gain an Origin feat of your choice (in addition to your Background feat).'),
    ],
    extraOriginFeat: true,
  },
  {
    id: 'orc', name: 'Orc', size: ['Medium'], speed: 30, darkvision: 120,
    desc: 'Strong, relentless people with a fierce endurance.',
    traits: [
      trait('Adrenaline Rush', 'Take the Dash action as a Bonus Action; you gain Temporary Hit Points equal to your Proficiency Bonus. Uses equal to Proficiency Bonus per Short or Long Rest.'),
      trait('Darkvision', 'Darkvision with a range of 120 feet.'),
      trait('Relentless Endurance', 'When reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead. Once per Long Rest.'),
    ],
  },
  {
    id: 'tiefling', name: 'Tiefling', size: ['Medium', 'Small'], speed: 30, darkvision: 60,
    desc: 'Touched by the Lower Planes, with a fiendish legacy.',
    choices: { legacy: ['Abyssal', 'Chthonic', 'Infernal'], spellcastingAbility: ['int', 'wis', 'cha'] },
    legacies: {
      Abyssal: { resistance: 'poison', cantrip: 'Poison Spray', level3: 'Ray of Sickness', level5: 'Hold Person' },
      Chthonic: { resistance: 'necrotic', cantrip: 'Chill Touch', level3: 'False Life', level5: 'Ray of Enfeeblement' },
      Infernal: { resistance: 'fire', cantrip: 'Fire Bolt', level3: 'Hellish Rebuke', level5: 'Darkness' },
    },
    traits: [
      trait('Darkvision', 'Darkvision with a range of 60 feet.'),
      trait('Fiendish Legacy', 'Choose Abyssal, Chthonic, or Infernal: grants a damage Resistance, a cantrip, and spells at levels 3 and 5. Spellcasting ability is Intelligence, Wisdom, or Charisma.'),
      trait('Otherworldly Presence', 'You know the Thaumaturgy cantrip (uses the same spellcasting ability as your Fiendish Legacy).'),
    ],
  },
];

export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
