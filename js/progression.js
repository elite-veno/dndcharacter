// Level-by-level progression and scaling for a class: pure data builders for the Progression tab. No DOM.
// Every number comes from rules.js / the class data, so the tab can never drift from the sheet.

import * as R from './rules.js';
import { CLASS_BY_ID, SUBCLASS_LABELS, SUBCLASS_LEVEL } from './data/index.js';
import { levelSlots } from './choices.js';

const ASI_NAMES = new Set(['Ability Score Improvement', 'Epic Boon']);
const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`;
export const subclassLabel = (classId) => SUBCLASS_LABELS[classId] || 'Subclass';

/** The subclass that counts at `level`: none below level 3 (it is chosen then). */
const effectiveSubclass = (classId, subclassId, level) => (level >= SUBCLASS_LEVEL ? R.getSubclass(classId, subclassId) : null);

// ---------------------------------------------------------------- level table

/** Which optional columns the class table needs: { cantrips, prepared, slotType: 'full' | 'half' | 'pact' | null, maxSlot }. */
export function progressionColumns(classId) {
  const sc = CLASS_BY_ID[classId]?.spellcasting;
  if (!sc) return { cantrips: false, prepared: false, slotType: null, maxSlot: 0 };
  return {
    cantrips: !!sc.cantrips, prepared: true, slotType: sc.type,
    maxSlot: sc.type === 'pact' ? 0 : R.highestSpellLevel(sc.type, R.MAX_LEVEL),
  };
}

/**
 * Rows for levels 1-20: [{ level, pb, features: [{ name, kind }], asi, cantrips, prepared, slots, pact, newSpellLevel, hitDice, state }].
 * kind: 'class' | 'subclass' | 'choice' (pick your subclass) | 'placeholder' (an unchosen subclass feature).
 * asi: null | 'asi' | 'boon'. state: 'past' | 'current' | 'future' relative to `level`.
 */
export function progressionTable(classId, { subclassId = null, level = 1 } = {}) {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return [];
  const sub = effectiveSubclass(classId, subclassId, level);
  const label = subclassLabel(classId);
  const sc = cls.spellcasting;
  const asiAt = Object.fromEntries(levelSlots(classId, R.MAX_LEVEL).map((s) => [s.level, s.kind]));
  const subFeatures = sub ? sub.features.map((f) => ({ ...f, level: R.subclassGrantLevel(f.level) })) : [];
  let prevMax = 0;
  return Array.from({ length: R.MAX_LEVEL }, (_, i) => {
    const l = i + 1;
    const features = [];
    for (const f of cls.features.filter((x) => x.level === l && !ASI_NAMES.has(x.name))) {
      if (f.name === `${cls.name} Subclass`) features.push({ name: sub ? sub.name : `Choose your ${label}`, kind: 'choice' });
      else if (f.name === 'Subclass Feature') { if (!sub) features.push({ name: 'Subclass feature', kind: 'placeholder' }); }
      else features.push({ name: f.name, kind: 'class' });
    }
    subFeatures.filter((f) => f.level === l).forEach((f) => features.push({ name: f.name, kind: 'subclass' }));
    const maxSlot = sc && sc.type !== 'pact' ? R.highestSpellLevel(sc.type, l) : 0;
    const newSpellLevel = maxSlot > prevMax ? maxSlot : null;
    prevMax = Math.max(prevMax, maxSlot);
    return {
      level: l,
      pb: R.proficiencyBonus(l),
      features,
      asi: asiAt[l] || null,
      cantrips: sc && sc.cantrips ? sc.cantrips[i] : null,
      prepared: sc ? sc.prepared[i] : null,
      slots: sc && sc.type !== 'pact' ? R.spellSlots(sc.type, l) : null,
      pact: sc && sc.type === 'pact' ? R.pactSlot(l) : null,
      newSpellLevel,
      hitDice: R.hitDiceTotal(l),
      state: l < level ? 'past' : l === level ? 'current' : 'future',
    };
  });
}

/**
 * The next thing the character unlocks: { level, text, now } or null. `now` marks an open choice at the current level
 * (a subclass not chosen yet). text reads like "Choose your Martial Archetype" or "Extra Attack, Fast Movement".
 */
export function nextUnlock({ classId, level, subclassId = null }) {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return null;
  const label = subclassLabel(classId);
  if (level >= SUBCLASS_LEVEL && !R.getSubclass(classId, subclassId)) return { level, text: `Choose your ${label}`, now: true };
  const rows = progressionTable(classId, { subclassId, level });
  for (const row of rows.filter((r) => r.level > level)) {
    const names = row.features.map((f) => f.name);
    if (!names.length && row.asi) names.push(row.asi === 'boon' ? 'Epic Boon' : 'Ability Score Improvement');
    if (!names.length && row.newSpellLevel) names.push(`${ordinal(row.newSpellLevel)}-level spells`);
    if (!names.length) continue;
    const shown = names.slice(0, 2).join(', ');
    return { level: row.level, text: names.length > 2 ? `${shown} +${names.length - 2} more` : shown, now: false };
  }
  return null;
}

// ---------------------------------------------------------------- subclass

/** A subclass's features as a timeline: [{ level, name, desc, unlocked }] by the level each really unlocks. */
export function subclassTimeline(sub, level) {
  if (!sub) return [];
  return sub.features
    .map((f) => ({ level: R.subclassGrantLevel(f.level), name: f.name, desc: f.desc, unlocked: R.subclassGrantLevel(f.level) <= level }))
    .sort((a, b) => a.level - b.level);
}

/** Read-only summary of what a subclass grants: { id, name, summary, features: [{ level, name }], spells, proficiencies }. */
export function subclassOverview(sub) {
  return {
    id: sub.id,
    name: sub.name,
    summary: sub.summary,
    features: subclassTimeline(sub, 0).map(({ level, name }) => ({ level, name })),
    spells: [...new Set(sub.grantedSpells.flatMap((g) => g.spells))],
    proficiencies: sub.grantedProficiencies || [],
  };
}

/** Overviews of every subclass option of a class. */
export const subclassOptions = (classId) => (CLASS_BY_ID[classId]?.subclass || []).map(subclassOverview);

// ---------------------------------------------------------------- scaling

const dash = (v) => (v === 0 || v === null || v === undefined ? '—' : String(v));

/** Collapse fn(level) over 1-20 into [{ level, value }] holding only the levels where the value changes. */
export function scalingSteps(fn) {
  const out = [];
  for (let l = 1; l <= R.MAX_LEVEL; l++) {
    const value = String(fn(l));
    if (!out.length || out[out.length - 1].value !== value) out.push({ level: l, value });
  }
  return out;
}

/** The value of a step list at a level. */
export const stepAt = (steps, level) => [...steps].reverse().find((s) => s.level <= level)?.value ?? steps[0].value;

// Class resources: [classResources key, label, formatter]. Values come from R.classResources.
const RESOURCE_SPECS = {
  barbarian: [['rages', 'Rages per Long Rest'], ['rageDamage', 'Rage damage bonus', (v) => `+${v}`]],
  bard: [['inspirationDie', 'Bardic Inspiration die', (v) => `d${v}`]],
  cleric: [['channelDivinity', 'Channel Divinity uses']],
  druid: [['wildShape', 'Wild Shape uses']],
  fighter: [['secondWind', 'Second Wind uses'], ['actionSurge', 'Action Surge uses'], ['indomitable', 'Indomitable uses']],
  monk: [['martialArtsDie', 'Martial Arts die', (v) => `d${v}`], ['focusPoints', 'Focus Points (Ki)']],
  paladin: [['layOnHands', 'Lay on Hands pool (HP)'], ['channelDivinity', 'Channel Divinity uses']],
  ranger: [['favoredEnemy', "Free Hunter's Mark casts (Favored Enemy)"]],
  rogue: [['sneakAttack', 'Sneak Attack damage']],
  sorcerer: [['sorceryPoints', 'Sorcery Points']],
  warlock: [['invocations', 'Eldritch Invocations known']],
  wizard: [['spellbookSpells', 'Spells in your spellbook'], ['arcaneRecoveryLevels', 'Arcane Recovery (spell levels)']],
};

const RESOURCE_NOTES = {
  rages: 'Regained on a Long Rest (one per Short Rest). Unlimited at level 20.',
  rageDamage: 'Added to the damage of Strength-based attacks while raging.',
  inspirationDie: 'Uses per Long Rest equal to your Charisma modifier (minimum 1); from level 5 they return on a Short Rest too.',
  channelDivinity: 'One use returns on a Short Rest, all on a Long Rest.',
  wildShape: 'One use returns on a Short Rest, all on a Long Rest.',
  martialArtsDie: 'Used for unarmed strikes and Monk weapons.',
  focusPoints: 'Equal to your Monk level from level 2; they return on a Short or Long Rest.',
  layOnHands: '5 HP of healing in the pool for every Paladin level; it refills on a Long Rest.',
  sneakAttack: 'Once per turn when you hit with advantage or an ally is adjacent: +1d6 for every two Rogue levels, rounded up.',
  sorceryPoints: 'Equal to your Sorcerer level from level 2; spent on Metamagic or converted to spell slots.',
  secondWind: 'Heals 1d10 + Fighter level. One use returns on a Short Rest.',
  actionSurge: 'One extra action; returns on a Short or Long Rest.',
  favoredEnemy: 'Free Hunter\'s Mark casts without a slot, regained on a Long Rest.',
  spellbookSpells: '6 spells at level 1, then 2 more every level.',
  arcaneRecoveryLevels: 'Recover spell slots with a combined level up to half your Wizard level (rounded up) on a Short Rest, once per day.',
};

/** Number of Attack-action attacks: 1 plus one per Extra Attack feature the class (or chosen subclass) has reached. */
export function attacksPerAction(classId, level, subclassId = null) {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return 1;
  const sub = effectiveSubclass(classId, subclassId, level);
  const levels = [
    ...cls.features.filter((f) => /Extra Attack/.test(f.name)).map((f) => f.level),
    ...(sub ? sub.features.filter((f) => /^Extra Attack/.test(f.name)).map((f) => R.subclassGrantLevel(f.level)) : []),
  ];
  return 1 + levels.filter((l) => l <= level).length;
}

/**
 * How key numbers grow with level: [{ id, label, steps: [{ level, value }], current, note }].
 * `scores` feed ability-dependent values (they do not change the step levels). Only things the class actually has appear.
 */
export function scalingItems(classId, { level = 1, subclassId = null, scores = null } = {}) {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return [];
  const sc = scores || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const items = [];
  const add = (id, label, steps, note = '') => items.push({ id, label, steps, current: stepAt(steps, level), note });

  add('pb', 'Proficiency Bonus', scalingSteps((l) => R.formatMod(R.proficiencyBonus(l))),
    'Added to attacks, saving throws and skills you are proficient in, and to spell save DCs and attack bonuses. Steps up at levels 5, 9, 13 and 17.');

  const sub = effectiveSubclass(classId, subclassId, level);
  const subId = sub ? subclassId : null;
  if (attacksPerAction(classId, R.MAX_LEVEL, subId) > 1) {
    add('extra-attack', 'Attacks per Attack action', scalingSteps((l) => attacksPerAction(classId, l, subId)),
      'The number of attacks you make when you take the Attack action; other actions are unchanged.');
  }

  if (cls.spellcasting?.cantrips) {
    add('cantrip-dice', 'Cantrip damage (a 1d10 cantrip shown)', scalingSteps((l) => R.scaleCantripDice('1d10', l)),
      `Damage cantrips roll an extra die at levels 5, 11 and 17.${classId === 'warlock' ? ' Eldritch Blast fires an extra beam at the same levels.' : ''}`);
  }

  for (const [key, label, fmt = dash] of RESOURCE_SPECS[classId] || []) {
    add(key, label, scalingSteps((l) => fmt(R.classResources(classId, l, sc)[key])), RESOURCE_NOTES[key] || '');
  }

  if (classId === 'warlock') {
    add('pact', 'Pact Magic slots', scalingSteps((l) => { const p = R.pactSlot(l); return `${p.count} x ${ordinal(p.slotLevel)}-level`; }),
      'All Pact Magic slots are the same level and return on a Short or Long Rest.');
  }

  if (sub && sub.id === 'battle-master') {
    add('superiority', 'Superiority Dice (Battle Master)', scalingSteps((l) => (l < SUBCLASS_LEVEL ? '—' : `${R.superiorityDice(l).count}d${R.superiorityDice(l).die}`)),
      'Returns on a Short or Long Rest. Maneuver save DC = 8 + proficiency bonus + Strength or Dexterity modifier.');
  }
  return items;
}
