// Backgrounds (SRD 5.2, CC-BY-4.0). In the 2024 rules a Background grants:
//  - ability score increases (+2 to one and +1 to another, or +1 to all three) chosen from `abilities`
//  - an Origin feat, two skill proficiencies, one tool proficiency, and starting equipment (A or 50 GP).

export const BACKGROUNDS = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    abilities: ['int', 'wis', 'cha'],
    feat: 'magic-initiate-cleric',
    skills: ['insight', 'religion'],
    tool: "Calligrapher's Supplies",
    toolId: 'calligraphers-supplies',
    equipmentA: [{ id: 'calligraphers-supplies' }, { id: 'book', variant: 'prayers' }, { id: 'holy-symbol' }, { id: 'parchment', qty: 10 }, { id: 'robe' }],
    goldA: 8,
    goldB: 50,
    desc: 'You devoted yourself to service in a temple, performing rites and tending to the faithful.',
  },
  {
    id: 'criminal',
    name: 'Criminal',
    abilities: ['dex', 'con', 'int'],
    feat: 'alert',
    skills: ['sleight-of-hand', 'stealth'],
    tool: "Thieves' Tools",
    toolId: 'thieves-tools',
    equipmentA: [{ id: 'dagger', qty: 2 }, { id: 'thieves-tools' }, { id: 'crowbar' }, { id: 'pouch', qty: 2 }, { id: 'travelers-clothes' }],
    goldA: 16,
    goldB: 50,
    desc: 'You earned your keep in the shadows, as a burglar, smuggler, or fence.',
  },
  {
    id: 'sage',
    name: 'Sage',
    abilities: ['con', 'int', 'wis'],
    feat: 'magic-initiate-wizard',
    skills: ['arcana', 'history'],
    tool: "Calligrapher's Supplies",
    toolId: 'calligraphers-supplies',
    equipmentA: [{ id: 'quarterstaff' }, { id: 'calligraphers-supplies' }, { id: 'book', variant: 'history' }, { id: 'parchment', qty: 8 }, { id: 'robe' }],
    goldA: 8,
    goldB: 50,
    desc: 'You spent your formative years among books, scrolls, and scholars.',
  },
  {
    id: 'soldier',
    name: 'Soldier',
    abilities: ['str', 'dex', 'con'],
    feat: 'savage-attacker',
    skills: ['athletics', 'intimidation'],
    tool: 'One kind of Gaming Set',
    toolId: null,
    toolChoice: 'gaming',
    equipmentA: [{ id: 'spear' }, { id: 'shortbow' }, { id: 'arrows' }, { choice: 'gaming-set' }, { id: 'healers-kit' }, { id: 'quiver' }, { id: 'travelers-clothes' }],
    goldA: 14,
    goldB: 50,
    desc: 'You trained as a soldier, learning the fundamentals of war and discipline.',
  },
];

export const BACKGROUND_BY_ID = Object.fromEntries(BACKGROUNDS.map((b) => [b.id, b]));

export const BACKGROUND_ASI_RULES = {
  options: ['plus2-plus1', 'plus1-plus1-plus1'],
  desc: 'Increase one listed ability score by 2 and another by 1, or increase all three listed scores by 1. No score can exceed 20 from this.',
};
