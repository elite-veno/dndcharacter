// Class-, feat- and level-dependent choice definitions for the builder. Pure data/logic, no DOM.

import {
  CLASS_BY_ID, SKILLS, WEAPONS, FEAT_BY_ID, ASI_LEVELS, ASI_LEVELS_BY_CLASS, spellsForClass, MUSICAL_INSTRUMENTS,
  ARTISANS_TOOLS, GAMING_SETS, TOOL_BY_ID,
} from './data/index.js';
import { highestSpellLevel, getSubclass } from './rules.js';
import { SUBCLASS_LEVEL } from './data/subclasses.js';

/** Level at which classes gain a Fighting Style feat (Fighter at 1, Paladin and Ranger at 2). */
export const FIGHTING_STYLE_LEVEL = { fighter: 1, paladin: 2, ranger: 2 };

/** Level-1 "Order" choices of Cleric and Druid (SRD 5.2). */
export const ORDERS = {
  cleric: {
    key: 'divineOrder', label: 'Divine Order',
    options: [
      { id: 'protector', name: 'Protector', desc: 'Trained with Martial weapons and Heavy armor.' },
      { id: 'thaumaturge', name: 'Thaumaturge', desc: 'Learn one extra cantrip, and add your Wisdom modifier (minimum +1) to Intelligence (Arcana or Religion) checks.' },
    ],
  },
  druid: {
    key: 'primalOrder', label: 'Primal Order',
    options: [
      { id: 'magician', name: 'Magician', desc: 'Learn one extra Druid cantrip, and add your Wisdom modifier (minimum +1) to Intelligence (Arcana or Nature) checks.' },
      { id: 'warden', name: 'Warden', desc: 'Trained with Martial weapons and Medium armor.' },
    ],
  },
};

/** The order option chosen by a character, or null. */
export function chosenOrder(c) {
  const spec = ORDERS[c.classId];
  return spec ? c[spec.key] : null;
}

/** The subclass chosen by a character (null below level 3, when unset, or when it belongs to another class). */
export function chosenSubclass(c) {
  return c.level >= SUBCLASS_LEVEL ? getSubclass(c.classId, c.subclassId) : null;
}

/** Granted proficiency strings of the chosen subclass (e.g. 'Heavy armor', 'Martial weapons'). */
const subclassGrants = (c) => (chosenSubclass(c)?.grantedProficiencies || []).map((g) => g.toLowerCase());

/** Subclass-granted proficiencies that are not armor, weapons or concrete tools (shown as text on the sheet). */
export function subclassOtherProficiencies(c) {
  return (chosenSubclass(c)?.grantedProficiencies || []).filter((g) => !/armor|^shields?$|weapons/i.test(g) && !subclassToolName(g) && !SKILL_BY_NAME[g.toLowerCase()]);
}

const SKILL_BY_NAME = Object.fromEntries(SKILLS.map((s) => [s.name.toLowerCase(), s]));

/** Fixed skill proficiencies a subclass grants outright (a grant that is exactly a skill name, e.g. Scout: Nature, Survival). */
export function subclassFixedSkills(c) {
  return (chosenSubclass(c)?.grantedProficiencies || []).map((g) => SKILL_BY_NAME[g.toLowerCase()]?.id).filter(Boolean);
}

/** A concrete tool proficiency granted by a subclass (kit / tools), or null for open choices and other grants. */
export function subclassToolName(g) {
  return /(kit|tools?|supplies)$/i.test(g) && !/\b(one|any|your choice)\b/i.test(g) ? g : null;
}

export function subclassToolList(c) {
  return (chosenSubclass(c)?.grantedProficiencies || []).map(subclassToolName).filter(Boolean);
}

const SCHOLAR_SKILLS = ['arcana', 'history', 'investigation', 'medicine', 'nature', 'religion'];

/** How many Expertise picks a class has at a level, and which skills they may target. */
export function expertiseSlots(classId, level) {
  switch (classId) {
    case 'rogue': return { count: 2 + (level >= 6 ? 2 : 0), from: null, source: 'Expertise' };
    case 'bard': return { count: level >= 9 ? 4 : level >= 2 ? 2 : 0, from: null, source: 'Expertise' };
    case 'ranger': return { count: level >= 2 ? 1 : 0, from: null, source: 'Deft Explorer' };
    case 'wizard': return { count: level >= 2 ? 1 : 0, from: SCHOLAR_SKILLS, source: 'Scholar' };
    default: return { count: 0, from: null, source: '' };
  }
}

/** Weapons whose Mastery property a class may choose. */
export function masteryOptions(classId) {
  switch (classId) {
    case 'barbarian': return WEAPONS.filter((w) => w.type === 'melee');
    case 'rogue': return WEAPONS.filter((w) => w.properties.includes('finesse') || w.properties.includes('light'));
    case 'fighter': case 'paladin': case 'ranger': return WEAPONS;
    default: return [];
  }
}

/** Spell picks required at a level: cantrips, prepared spells, wizard spellbook, and the highest spell level. */
export function spellCounts(c) {
  const cls = CLASS_BY_ID[c.classId];
  const sc = cls && cls.spellcasting;
  if (!sc) return null;
  const order = chosenOrder(c);
  const extraCantrip = order === 'thaumaturge' || order === 'magician' ? 1 : 0;
  return {
    cantrips: (sc.cantrips ? sc.cantrips[c.level - 1] : 0) + extraCantrip,
    prepared: sc.prepared[c.level - 1],
    spellbook: sc.spellbookStart ? sc.spellbookStart + sc.spellbookPerLevel * (c.level - 1) : 0,
    maxSpellLevel: Math.max(1, highestSpellLevel(sc.type, c.level)),
    ability: sc.ability,
    list: sc.spellList,
  };
}

/** Spells a class can pick, split by cantrips and leveled spells (up to maxSpellLevel). */
export function classSpellOptions(classId, maxSpellLevel) {
  const all = spellsForClass(classId);
  return {
    cantrips: all.filter((s) => s.level === 0),
    leveled: all.filter((s) => s.level >= 1 && s.level <= maxSpellLevel),
  };
}

/** Tool proficiency choices a class requires: { count, pool } or null. Fixed tools need no choice. */
export function classToolChoice(classId) {
  if (classId === 'bard') return { count: 3, pool: MUSICAL_INSTRUMENTS, label: 'Musical Instruments' };
  if (classId === 'monk') return { count: 1, pool: [...ARTISANS_TOOLS, ...MUSICAL_INSTRUMENTS], label: "Artisan's Tools or a Musical Instrument" };
  return null;
}

/** Fixed tool proficiencies (names) for classes that do not choose. */
export function classFixedTools(classId) {
  const cls = CLASS_BY_ID[classId];
  if (!cls || classToolChoice(classId)) return [];
  return cls.toolProficiencies;
}

/** Gaming sets a Soldier (or any "Gaming Set" proficiency) can pick. */
export const gamingSetOptions = () => GAMING_SETS;

// ---------------------------------------------------------------- feats

const ALL = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

/** Ability options for the +1 a feat grants. 'casting' resolves to the class spellcasting ability. null = no increase. */
export const FEAT_ABILITY = {
  grappler: ['str', 'dex'],
  'boon-of-combat-prowess': ALL,
  'boon-of-dimensional-travel': ALL,
  'boon-of-fate': ALL,
  'boon-of-irresistible-offense': ['str', 'dex'],
  'boon-of-spell-recall': 'casting',
  'boon-of-the-night-spirit': ALL,
  'boon-of-skill': ALL,
  'boon-of-speed': ['dex'],
};

/** Ability ids a feat's +1 may go to for this class (empty when the feat has no increase). */
export function featAbilityOptions(featId, classId) {
  const opt = FEAT_ABILITY[featId];
  if (!opt) return [];
  if (opt === 'casting') {
    const sc = CLASS_BY_ID[classId]?.spellcasting;
    return sc ? [sc.ability] : ALL;
  }
  return opt;
}

/** The ability cap for the feat's increase (Epic Boons raise the cap to 30). */
export const featAbilityCap = (featId) => (FEAT_BY_ID[featId]?.category === 'epic-boon' ? 30 : 20);

/**
 * Extra choices an Origin feat needs: Magic Initiate (two cantrips, one level 1 spell, casting ability)
 * and Skilled (three skills or tools). Returns null for feats without choices.
 */
export function featChoiceSpec(featId) {
  const mi = featId.match(/^magic-initiate-(\w+)$/);
  if (mi) return { type: 'magic-initiate', list: mi[1] };
  if (featId === 'skilled') return { type: 'skilled', count: 3 };
  return null;
}

/** Spell options for a Magic Initiate list. */
export function magicInitiateOptions(list) {
  const all = spellsForClass(list);
  return { cantrips: all.filter((s) => s.level === 0), spells: all.filter((s) => s.level === 1) };
}

/** Skilled feat options as { value, label } with 'skill:id' / 'tool:id' values. */
export function skilledOptions() {
  return [
    ...SKILLS.map((s) => ({ value: `skill:${s.id}`, label: s.name, group: 'Skills' })),
    ...[...ARTISANS_TOOLS, ...GAMING_SETS, ...MUSICAL_INSTRUMENTS].map((t) => ({ value: `tool:${t.id}`, label: t.name, group: 'Tools' })),
  ];
}

export const toolName = (id) => TOOL_BY_ID[id]?.name || id;

// ---------------------------------------------------------------- level advancement

/** Ability Score Improvement / Epic Boon slots earned up to the character's level. */
export function levelSlots(classId, level) {
  const levels = ASI_LEVELS_BY_CLASS[classId] || ASI_LEVELS;
  const slots = levels.filter((l) => l <= level).map((l) => ({ level: l, kind: 'asi' }));
  if (level >= 19) slots.push({ level: 19, kind: 'boon' });
  return slots;
}

// ---------------------------------------------------------------- training

/** Armor categories a character is trained with (class training plus Protector / Warden order). */
export function armorTrainingOf(c) {
  const cls = CLASS_BY_ID[c.classId];
  if (!cls) return [];
  const out = [...cls.armorTraining];
  const order = chosenOrder(c);
  if (order === 'protector' && !out.includes('heavy')) out.push('heavy');
  if (order === 'warden' && !out.includes('medium')) out.push('medium');
  const grants = subclassGrants(c);
  if (grants.some((g) => g.includes('heavy armor')) && !out.includes('heavy')) out.push('heavy');
  if (grants.some((g) => g.includes('medium armor')) && !out.includes('medium')) out.push('medium');
  if (grants.some((g) => /^shields?$/.test(g)) && !out.includes('shield')) out.push('shield');
  return out;
}

/** Weapon proficiency object { categories, martialWith? } including Protector / Warden. */
export function weaponProficiencyOf(c) {
  const cls = CLASS_BY_ID[c.classId];
  if (!cls) return { categories: [] };
  const prof = { ...cls.weaponProficiency, categories: [...cls.weaponProficiency.categories] };
  const order = chosenOrder(c);
  if ((order === 'protector' || order === 'warden') && !prof.categories.includes('martial')) prof.categories.push('martial');
  if (subclassGrants(c).some((g) => g.includes('martial weapons')) && !prof.categories.includes('martial')) prof.categories.push('martial');
  return prof;
}

// ---------------------------------------------------------------- bonus skill picks (subclass / class features)

/**
 * Extra skill proficiency picks from class features at the character's level:
 * Barbarian Primal Knowledge (level 3) and Bard College of Lore Bonus Proficiencies (level 3).
 */
export function extraSkillPicks(c) {
  const picks = [];
  const cls = CLASS_BY_ID[c.classId];
  if (!cls) return picks;
  if (c.classId === 'barbarian' && c.level >= 3) {
    picks.push({ key: 'primal-knowledge', label: 'Primal Knowledge', count: 1, from: cls.skillChoices.from });
  }
  if (c.classId === 'bard' && c.level >= 3 && c.subclassId === 'college-of-lore') {
    picks.push({ key: 'lore-proficiencies', label: 'College of Lore: Bonus Proficiencies', count: 3, from: SKILLS.map((s) => s.id) });
  }
  return picks;
}
