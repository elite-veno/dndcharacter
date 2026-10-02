// Abilities, skills and languages (SRD 5.2, CC-BY-4.0).

export const ABILITIES = [
  { id: 'str', name: 'Strength', abbr: 'STR', desc: 'Physical might: melee attacks, Athletics, carrying.' },
  { id: 'dex', name: 'Dexterity', abbr: 'DEX', desc: 'Agility and reflexes: AC, initiative, ranged attacks, Acrobatics, Sleight of Hand, Stealth.' },
  { id: 'con', name: 'Constitution', abbr: 'CON', desc: 'Health and stamina: hit points, concentration.' },
  { id: 'int', name: 'Intelligence', abbr: 'INT', desc: 'Reasoning and memory: Arcana, History, Investigation, Nature, Religion.' },
  { id: 'wis', name: 'Wisdom', abbr: 'WIS', desc: 'Awareness and insight: Animal Handling, Insight, Medicine, Perception, Survival.' },
  { id: 'cha', name: 'Charisma', abbr: 'CHA', desc: 'Force of personality: Deception, Intimidation, Performance, Persuasion.' },
];

export const ABILITY_IDS = ABILITIES.map((a) => a.id);

export const SKILLS = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'dex' },
  { id: 'animal-handling', name: 'Animal Handling', ability: 'wis' },
  { id: 'arcana', name: 'Arcana', ability: 'int' },
  { id: 'athletics', name: 'Athletics', ability: 'str' },
  { id: 'deception', name: 'Deception', ability: 'cha' },
  { id: 'history', name: 'History', ability: 'int' },
  { id: 'insight', name: 'Insight', ability: 'wis' },
  { id: 'intimidation', name: 'Intimidation', ability: 'cha' },
  { id: 'investigation', name: 'Investigation', ability: 'int' },
  { id: 'medicine', name: 'Medicine', ability: 'wis' },
  { id: 'nature', name: 'Nature', ability: 'int' },
  { id: 'perception', name: 'Perception', ability: 'wis' },
  { id: 'performance', name: 'Performance', ability: 'cha' },
  { id: 'persuasion', name: 'Persuasion', ability: 'cha' },
  { id: 'religion', name: 'Religion', ability: 'int' },
  { id: 'sleight-of-hand', name: 'Sleight of Hand', ability: 'dex' },
  { id: 'stealth', name: 'Stealth', ability: 'dex' },
  { id: 'survival', name: 'Survival', ability: 'wis' },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export const LANGUAGES = {
  standard: ['Common', 'Common Sign Language', 'Draconic', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc'],
  rare: ['Abyssal', 'Celestial', 'Deep Speech', 'Druidic', "Infernal", 'Primordial', 'Sylvan', "Thieves' Cant", 'Undercommon'],
};

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned',
];

export const SIZES = {
  Tiny: { space: '2.5 ft', carryMultiplier: 0.5 },
  Small: { space: '5 ft', carryMultiplier: 1 },
  Medium: { space: '5 ft', carryMultiplier: 1 },
  Large: { space: '10 ft', carryMultiplier: 2 },
  Huge: { space: '15 ft', carryMultiplier: 4 },
  Gargantuan: { space: '20 ft', carryMultiplier: 8 },
};
