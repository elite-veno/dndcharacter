// Character model: defaults, derived statistics (via rules.js) and per-step validation.
// A character is plain JSON (see newCharacter) so it can be stored in localStorage and used by the sheet.

import {
  CLASS_BY_ID, BACKGROUND_BY_ID, SPECIES_BY_ID, FEAT_BY_ID, ABILITY_IDS, SKILLS, SKILL_BY_ID, LANGUAGES, WEAPON_BY_ID,
  SPELL_BY_ID, INVOCATION_BY_ID, TOOL_BY_ID,
} from './data/index.js';
import { SUBCLASS_LABELS } from './data/subclasses.js';
import * as R from './rules.js';
import {
  FIGHTING_STYLE_LEVEL, ORDERS, expertiseSlots, masteryOptions, spellCounts, classSpellOptions, classToolChoice,
  classFixedTools, featChoiceSpec, featAbilityOptions, featAbilityCap, magicInitiateOptions, levelSlots, armorTrainingOf,
  weaponProficiencyOf, extraSkillPicks, chosenSubclass, subclassToolList,
} from './choices.js';
import { equippedArmor, hasShieldEquipped, choiceSlots, slotValue, goldLeft } from './inventory.js';

export const STEP_IDS = ['preferences', 'class', 'background', 'species', 'abilities', 'equipment', 'details'];
export const ABILITY_METHODS = ['standard', 'manual', 'pointBuy'];

const blankAbilities = (v) => Object.fromEntries(ABILITY_IDS.map((id) => [id, v]));

/** A fresh, empty character (the builder's draft). */
export function newCharacter() {
  return {
    id: null,
    version: 1,
    // 1 Preferences
    name: '',
    level: 1,
    // 2 Class
    classId: null,
    classSkills: [],
    classTools: [],
    masteries: [],
    subclassId: null,
    subclassChoice: null,
    divineOrder: null,
    primalOrder: null,
    fightingStyle: null,
    expertise: [],
    cantrips: [],
    spells: [],
    spellbook: [],
    invocations: [],
    extraSkills: {},
    levelAsi: [],
    // 3 Background
    backgroundId: null,
    bgAsi: { mode: 'plus2-plus1', plus2: null, plus1: null },
    bgToolChoice: null,
    bgFeatChoices: {},
    // 4 Species
    speciesId: null,
    speciesChoices: {},
    speciesFeatId: null,
    speciesFeatChoices: {},
    languages: [],
    // 5 Ability scores
    abilityMethod: 'standard',
    standard: blankAbilities(null),
    manual: blankAbilities(10),
    pointBuy: blankAbilities(8),
    // 6 Equipment
    equipment: { classOption: null, bgOption: null, added: false, choices: {}, items: [] },
    // 7 Details
    details: {
      alignment: '', age: '', height: '', weight: '', eyes: '', hair: '', skin: '', gender: '', faith: '',
      traits: '', ideals: '', bonds: '', flaws: '', appearance: '', backstory: '',
    },
    portrait: null,
  };
}

/** Merge a stored object over the defaults so older saves keep working. */
export function normalizeCharacter(raw) {
  const base = newCharacter();
  const c = { ...base, ...raw };
  c.details = { ...base.details, ...(raw?.details || {}) };
  c.equipment = { ...base.equipment, ...(raw?.equipment || {}) };
  c.bgAsi = { ...base.bgAsi, ...(raw?.bgAsi || {}) };
  c.standard = { ...base.standard, ...(raw?.standard || {}) };
  c.manual = { ...base.manual, ...(raw?.manual || {}) };
  c.pointBuy = { ...base.pointBuy, ...(raw?.pointBuy || {}) };
  // Older saves have no subclass: use the class's original SRD subclass from level 3, otherwise none.
  const valid = R.getSubclass(c.classId, c.subclassId);
  if (!valid) {
    c.subclassId = Number(c.level) >= 3 ? R.defaultSubclassId(c.classId) : null;
    c.subclassChoice = null;
  }
  const sub = R.getSubclass(c.classId, c.subclassId);
  const opts = R.subclassChoices(sub);
  if (!opts.includes(c.subclassChoice)) c.subclassChoice = opts[0] || null;
  return c;
}

// ---------------------------------------------------------------- ability scores

/** Base scores from the active generation method (unset Standard Array entries fall back to 10). */
export function baseScores(c) {
  const src = c[c.abilityMethod] || c.standard;
  return Object.fromEntries(ABILITY_IDS.map((id) => [id, src[id] ?? 10]));
}

/** Per-source breakdown: { base, background, advancement, total } objects keyed by ability id. */
export function abilityBreakdown(c) {
  const base = baseScores(c);
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const background = blankAbilities(0);
  if (bg && R.validateBackgroundASI(bg, c.bgAsi).valid) {
    if (c.bgAsi.mode === 'plus2-plus1') { background[c.bgAsi.plus2] += 2; background[c.bgAsi.plus1] += 1; }
    else bg.abilities.forEach((id) => { background[id] += 1; });
  }
  const advancement = blankAbilities(0);
  const total = {};
  // Background increases cannot push a score past 20.
  const afterBg = Object.fromEntries(ABILITY_IDS.map((id) => [id, Math.min(20, base[id] + background[id])]));
  const running = { ...afterBg };
  for (const slot of c.levelAsi.slice(0, levelSlots(c.classId, c.level).length)) {
    if (!slot) continue;
    const bump = (id, n, cap) => {
      if (!id || !(id in running)) return;
      const next = Math.min(cap, running[id] + n);
      advancement[id] += next - running[id];
      running[id] = next;
    };
    if (slot.type === 'asi' && slot.mode === 'plus2') bump(slot.a, 2, 20);
    else if (slot.type === 'asi' && slot.mode === 'plus1plus1') { bump(slot.a, 1, 20); bump(slot.b, 1, 20); }
    else if (slot.type === 'feat' && slot.featId) bump(slot.ability, 1, featAbilityCap(slot.featId));
  }
  ABILITY_IDS.forEach((id) => { total[id] = running[id]; });
  return { base, background, advancement, total };
}

// ---------------------------------------------------------------- skills, feats, tools

/** Every skill proficiency grant as { skill, source, step } (step = where the player chose it, or null if fixed). */
export function skillGrants(c) {
  const grants = [];
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  if (bg) bg.skills.forEach((skill) => grants.push({ skill, source: `${bg.name} background`, step: null }));
  c.classSkills.forEach((skill) => grants.push({ skill, source: 'Class skills', step: 'class' }));
  for (const pick of extraSkillPicks(c)) (c.extraSkills[pick.key] || []).forEach((skill) => grants.push({ skill, source: pick.label, step: 'class' }));
  const sp = c.speciesChoices;
  if (c.speciesId === 'human' && sp.skill) grants.push({ skill: sp.skill, source: 'Human Skillful', step: 'species' });
  if (c.speciesId === 'elf' && sp.keenSenses) grants.push({ skill: sp.keenSenses, source: 'Elf Keen Senses', step: 'species' });
  const skilled = (choices, step, label) => (choices.skills || []).forEach((v) => {
    if (v.startsWith('skill:')) grants.push({ skill: v.slice(6), source: label, step });
  });
  if (bg && bg.feat === 'skilled') skilled(c.bgFeatChoices, 'background', 'Skilled feat');
  if (c.speciesFeatId === 'skilled') skilled(c.speciesFeatChoices, 'species', 'Skilled feat');
  return grants.filter((g) => SKILL_BY_ID[g.skill]);
}

/** Skills that appear in more than one grant: [{ skill, grants }]. */
export function skillConflicts(c) {
  const map = new Map();
  skillGrants(c).forEach((g) => map.set(g.skill, [...(map.get(g.skill) || []), g]));
  return [...map.entries()].filter(([, list]) => list.length > 1).map(([skill, grants]) => ({ skill, grants }));
}

/** Feats the character has: [{ id, name, source }]. */
export function featList(c) {
  const feats = [];
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  if (bg) feats.push({ id: bg.feat, source: `${bg.name} background` });
  if (c.speciesId === 'human' && c.speciesFeatId) feats.push({ id: c.speciesFeatId, source: 'Human Versatile' });
  if (c.fightingStyle) feats.push({ id: c.fightingStyle, source: 'Fighting Style' });
  levelSlots(c.classId, c.level).forEach((slot, i) => {
    const pick = c.levelAsi[i];
    if (pick && pick.type === 'feat' && pick.featId) feats.push({ id: pick.featId, source: `Level ${slot.level}` });
  });
  return feats.filter((f) => FEAT_BY_ID[f.id]).map((f) => ({ ...f, name: FEAT_BY_ID[f.id].name }));
}

/** Tool proficiency names from background, class and Skilled feats. */
export function toolList(c) {
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const tools = [];
  if (bg) tools.push(bg.toolId ? bg.tool : TOOL_BY_ID[c.bgToolChoice]?.name);
  classFixedTools(c.classId).forEach((t) => tools.push(t));
  c.classTools.forEach((id) => tools.push(TOOL_BY_ID[id]?.name));
  subclassToolList(c).forEach((t) => tools.push(t));
  const skilled = (choices) => (choices.skills || []).forEach((v) => { if (v.startsWith('tool:')) tools.push(TOOL_BY_ID[v.slice(5)]?.name); });
  if (bg && bg.feat === 'skilled') skilled(c.bgFeatChoices);
  if (c.speciesFeatId === 'skilled') skilled(c.speciesFeatChoices);
  return [...new Set(tools.filter(Boolean))];
}

// ---------------------------------------------------------------- derived statistics

/** Everything the summary sidebar and the sheet need, computed from the stored choices. Safe on partial characters. */
export function deriveCharacter(c) {
  const cls = CLASS_BY_ID[c.classId] || null;
  const bg = BACKGROUND_BY_ID[c.backgroundId] || null;
  const species = SPECIES_BY_ID[c.speciesId] || null;
  const level = Math.min(R.MAX_LEVEL, Math.max(1, Number(c.level) || 1));
  const breakdown = abilityBreakdown(c);
  const scores = breakdown.total;
  const mods = R.abilityMods(scores);
  const pb = R.proficiencyBonus(level);
  const feats = featList(c);
  const items = c.equipment.items;
  const armor = equippedArmor(items);
  const shield = hasShieldEquipped(items);
  const armorTraining = armorTrainingOf(c);
  const defenseStyle = feats.some((f) => f.id === 'defense') && !!armor;

  const choices = c.speciesChoices || {};
  const lineage = choices.lineage || choices.legacy || choices.ancestry || null;
  let baseSpeed = species ? species.speed : 30;
  if (c.speciesId === 'elf' && choices.lineage === 'Wood Elf') baseSpeed = 35;
  let darkvision = species ? species.darkvision : 0;
  if (c.speciesId === 'elf' && choices.lineage === 'Drow') darkvision = 120;

  // Proficiencies: 1 = proficient, 2 = expertise.
  const proficiencies = {};
  skillGrants(c).forEach((g) => { proficiencies[g.skill] = 1; });
  c.expertise.slice(0, expertiseSlots(c.classId, level).count).forEach((id) => { if (proficiencies[id]) proficiencies[id] = 2; });
  const jack = c.classId === 'bard' && level >= 2;
  const skills = R.allSkills({ scores, level, proficiencies, jackOfAllTrades: jack });
  const perception = skills.find((s) => s.id === 'perception');

  const hitDie = cls ? cls.hitDie : 8;
  const hp = R.maxHitPoints({ hitDie, level, conMod: mods.con, bonusPerLevel: species?.hpPerLevelBonus || 0 });
  const ac = R.calculateAC({ armor, shield, mods, unarmoredDefense: cls?.unarmoredDefense || null, defenseStyle });
  const classBonus = cls ? R.classSpeedBonus(cls.id, level, { armor, shield }) : 0;
  const speed = R.walkingSpeed({ base: baseSpeed, armor, strength: scores.str, bonus: classBonus });

  const resistances = [];
  if (c.speciesId === 'dwarf') resistances.push('poison');
  if (c.speciesId === 'dragonborn' && choices.ancestry) resistances.push(species.ancestryDamage[choices.ancestry]);
  if (c.speciesId === 'tiefling' && choices.legacy) resistances.push(species.legacies[choices.legacy].resistance);

  return {
    level, cls, bg, species, lineage,
    subclass: chosenSubclass({ ...c, level }),
    subclassSpells: R.subclassSpellsAtLevel(chosenSubclass({ ...c, level }), level, c.subclassChoice),
    breakdown, scores, mods, pb, hitDie, hp, ac, speed, darkvision, resistances, feats, armorTraining,
    weaponProficiency: weaponProficiencyOf(c),
    initiative: R.initiativeBonus({ scores, level, alert: feats.some((f) => f.id === 'alert') }),
    saves: R.savingThrows({ scores, level, proficientSaves: cls ? cls.savingThrows : [] }),
    skills,
    passivePerception: R.passiveScore(perception.bonus),
    tools: toolList(c),
    languages: ['Common', ...c.languages],
    size: choices.size || (species ? species.size[0] : 'Medium'),
    spellcasting: cls ? R.classSpellcasting(cls.id, level, scores) : null,
    features: cls ? R.featuresAtLevel(cls.id, level, { subclassId: c.subclassId }) : [],
    gold: goldLeft(c),
    classResources: cls ? R.classResources(cls.id, level, scores) : {},
  };
}

// ---------------------------------------------------------------- validation

const distinct = (list) => new Set(list).size === list.length;

/** Validate Origin feat choices (Magic Initiate / Skilled). `label` prefixes error messages. */
function validateFeatChoices(featId, choices, label) {
  const errors = [];
  const spec = featChoiceSpec(featId);
  if (!spec) return errors;
  if (spec.type === 'magic-initiate') {
    const opts = magicInitiateOptions(spec.list);
    const cantrips = choices.cantrips || [];
    if (cantrips.length !== 2 || !distinct(cantrips) || !cantrips.every((id) => opts.cantrips.some((s) => s.id === id))) errors.push(`${label}: choose two cantrips`);
    if (!choices.spell || !opts.spells.some((s) => s.id === choices.spell)) errors.push(`${label}: choose a level 1 spell`);
    if (!['int', 'wis', 'cha'].includes(choices.ability)) errors.push(`${label}: choose a spellcasting ability`);
  } else if (spec.type === 'skilled') {
    const picks = choices.skills || [];
    if (picks.length !== spec.count || !distinct(picks)) errors.push(`${label}: choose ${spec.count} skills or tools`);
  }
  return errors;
}

/** Errors for one builder step. An empty array means the step is complete. */
export function validateStep(c, stepId) {
  const errors = [];
  const cls = CLASS_BY_ID[c.classId];
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const species = SPECIES_BY_ID[c.speciesId];
  const conflicts = skillConflicts(c);

  switch (stepId) {
    case 'preferences':
      if (!c.name.trim()) errors.push('Give your character a name.');
      if (!Number.isInteger(c.level) || c.level < 1 || c.level > R.MAX_LEVEL) errors.push('Level must be between 1 and 20.');
      break;

    case 'class': {
      if (!cls) { errors.push('Choose a class.'); break; }
      const allowed = cls.skillChoices.from === 'any' ? SKILLS.map((s) => s.id) : cls.skillChoices.from;
      if (c.classSkills.length !== cls.skillChoices.count || !c.classSkills.every((s) => allowed.includes(s))) {
        errors.push(`Choose ${cls.skillChoices.count} class skill${cls.skillChoices.count > 1 ? 's' : ''}.`);
      }
      const toolSpec = classToolChoice(cls.id);
      if (toolSpec && (c.classTools.length !== toolSpec.count || !distinct(c.classTools))) errors.push(`Choose ${toolSpec.count} tool proficienc${toolSpec.count > 1 ? 'ies' : 'y'} (${toolSpec.label}).`);
      const mastery = R.weaponMasteryCount(cls.id, c.level);
      const masteryIds = masteryOptions(cls.id).map((w) => w.id);
      if (mastery && (c.masteries.length !== mastery || !distinct(c.masteries) || !c.masteries.every((id) => masteryIds.includes(id)))) {
        errors.push(`Choose ${mastery} weapons for Weapon Mastery.`);
      }
      if (c.level >= 3) {
        const sub = chosenSubclass(c);
        if (!sub) errors.push(`Choose a ${SUBCLASS_LABELS[cls.id] || 'subclass'}.`);
        else if (R.subclassChoices(sub).length && !R.subclassChoices(sub).includes(c.subclassChoice)) errors.push(`Choose a terrain for ${sub.name}.`);
      }
      const order = ORDERS[cls.id];
      if (order && !order.options.some((o) => o.id === c[order.key])) errors.push(`Choose a ${order.label}.`);
      if (FIGHTING_STYLE_LEVEL[cls.id] && c.level >= FIGHTING_STYLE_LEVEL[cls.id]) {
        if (!['archery', 'defense', 'great-weapon-fighting', 'two-weapon-fighting'].includes(c.fightingStyle)) errors.push('Choose a Fighting Style.');
      }
      const exp = expertiseSlots(cls.id, c.level);
      if (c.expertise.length > exp.count) errors.push('Remove expertise choices that your level does not grant.');
      if (exp.count) {
        const proficient = new Set(skillGrants(c).map((g) => g.skill));
        const ok = c.expertise.length === exp.count && distinct(c.expertise)
          && c.expertise.every((id) => proficient.has(id) && (!exp.from || exp.from.includes(id)));
        if (!ok) errors.push(`Choose ${exp.count} skill${exp.count > 1 ? 's' : ''} for ${exp.source} (must be skills you are proficient in).`);
      }
      for (const pick of extraSkillPicks(c)) {
        const got = c.extraSkills[pick.key] || [];
        if (got.length !== pick.count || !distinct(got) || !got.every((s) => pick.from.includes(s))) errors.push(`${pick.label}: choose ${pick.count} skill${pick.count > 1 ? 's' : ''}.`);
      }
      errors.push(...validateSpells(c, cls));
      if (cls.id === 'warlock') {
        const need = cls.invocations[c.level - 1];
        if (c.invocations.length !== need || !distinct(c.invocations) || !c.invocations.every((id) => INVOCATION_BY_ID[id])) errors.push(`Choose ${need} Eldritch Invocation${need > 1 ? 's' : ''}.`);
      }
      levelSlots(cls.id, c.level).forEach((slot, i) => {
        const pick = c.levelAsi[i];
        const label = `Level ${slot.level}`;
        if (!pick) { errors.push(`${label}: choose an ability increase or feat.`); return; }
        if (pick.type === 'asi' && slot.kind === 'asi') {
          if (pick.mode === 'plus2' && !ABILITY_IDS.includes(pick.a)) errors.push(`${label}: choose an ability for +2.`);
          else if (pick.mode === 'plus1plus1' && (!ABILITY_IDS.includes(pick.a) || !ABILITY_IDS.includes(pick.b) || pick.a === pick.b)) errors.push(`${label}: choose two different abilities for +1 each.`);
          else if (pick.mode !== 'plus2' && pick.mode !== 'plus1plus1') errors.push(`${label}: choose how to increase abilities.`);
        } else if (pick.type === 'feat') {
          const feat = FEAT_BY_ID[pick.featId];
          const wantCat = slot.kind === 'boon' ? 'epic-boon' : 'general';
          if (!feat || feat.category !== wantCat) errors.push(`${label}: choose a feat.`);
          else if (featAbilityOptions(feat.id, cls.id).length && !featAbilityOptions(feat.id, cls.id).includes(pick.ability)) errors.push(`${label}: choose the ability for ${feat.name}.`);
        } else errors.push(`${label}: choose an ability increase or feat.`);
      });
      conflicts.forEach(({ skill, grants }) => {
        if (grants.some((g) => g.step === 'class')) errors.push(`${SKILL_BY_ID[skill].name} is granted more than once (${grants.map((g) => g.source).join(', ')}). Pick a different skill.`);
      });
      break;
    }

    case 'background': {
      if (!bg) { errors.push('Choose a background.'); break; }
      const asi = R.validateBackgroundASI(bg, c.bgAsi);
      if (!asi.valid || (c.bgAsi.mode === 'plus2-plus1' && (!c.bgAsi.plus2 || !c.bgAsi.plus1))) errors.push('Assign your background ability score increases.');
      if (bg.toolChoice === 'gaming' && !c.bgToolChoice) errors.push('Choose a Gaming Set for your tool proficiency.');
      errors.push(...validateFeatChoices(bg.feat, c.bgFeatChoices, `${FEAT_BY_ID[bg.feat].name}`));
      conflicts.forEach(({ skill, grants }) => {
        if (grants.some((g) => g.step === 'background')) errors.push(`${SKILL_BY_ID[skill].name} is granted more than once. Pick a different skill.`);
      });
      break;
    }

    case 'species': {
      if (!species) { errors.push('Choose a species.'); break; }
      const ch = c.speciesChoices;
      const need = (key, label) => { if (!ch[key]) errors.push(`Choose ${label}.`); };
      if (species.choices?.ancestry) need('ancestry', species.id === 'goliath' ? 'a Giant Ancestry' : 'a Draconic Ancestry');
      if (species.choices?.lineage) need('lineage', 'a lineage');
      if (species.choices?.legacy) need('legacy', 'a Fiendish Legacy');
      if (species.choices?.spellcastingAbility && !species.choices.spellcastingAbility.includes(ch.spellcastingAbility)) errors.push('Choose a spellcasting ability.');
      if (species.choices?.keenSenses && !species.choices.keenSenses.includes(ch.keenSenses)) errors.push('Choose a Keen Senses skill.');
      if (species.choices?.skill && !SKILL_BY_ID[ch.skill]) errors.push('Choose a skill for Skillful.');
      if (species.size.length > 1 && !species.size.includes(ch.size)) errors.push('Choose a size.');
      if (species.extraOriginFeat) {
        const feat = FEAT_BY_ID[c.speciesFeatId];
        if (!feat || feat.category !== 'origin') errors.push('Choose an Origin feat for Versatile.');
        else {
          if (bg && feat.id === bg.feat && !feat.repeatable) errors.push('Choose a different Origin feat than your Background feat.');
          errors.push(...validateFeatChoices(feat.id, c.speciesFeatChoices, feat.name));
        }
      }
      const langs = c.languages;
      const standard = LANGUAGES.standard.filter((l) => l !== 'Common');
      if (langs.length !== 2 || !distinct(langs) || !langs.every((l) => standard.includes(l))) errors.push('Choose two languages (besides Common).');
      conflicts.forEach(({ skill, grants }) => {
        if (grants.some((g) => g.step === 'species')) errors.push(`${SKILL_BY_ID[skill].name} is granted more than once. Pick a different skill.`);
      });
      break;
    }

    case 'abilities':
      errors.push(...validateAbilities(c));
      break;

    case 'equipment': {
      const eq = c.equipment;
      if (!cls || !bg) { errors.push('Choose a class and background first, then pick your equipment.'); break; }
      if (!eq.classOption) errors.push('Choose class starting equipment (A or B).');
      if (!eq.bgOption) errors.push('Choose background starting equipment (A or B).');
      choiceSlots(c).forEach((slot) => { if (!slotValue(c, slot)) errors.push(`Choose: ${slot.label}.`); });
      if (!eq.added) errors.push('Click "Add Starting Equipment" to add your gear.');
      if (goldLeft(c) < 0) errors.push('You have spent more gold than you have.');
      break;
    }

    case 'details':
      break;

    default:
      break;
  }
  return errors;
}

function validateSpells(c, cls) {
  const errors = [];
  const counts = spellCounts(c);
  if (!counts) return errors;
  const opts = classSpellOptions(cls.id, counts.maxSpellLevel);
  const okCantrips = c.cantrips.length === counts.cantrips && distinct(c.cantrips) && c.cantrips.every((id) => opts.cantrips.some((s) => s.id === id));
  if (counts.cantrips && !okCantrips) errors.push(`Choose ${counts.cantrips} cantrips.`);
  if (counts.spellbook) {
    const okBook = c.spellbook.length === counts.spellbook && distinct(c.spellbook) && c.spellbook.every((id) => opts.leveled.some((s) => s.id === id));
    if (!okBook) errors.push(`Choose ${counts.spellbook} spells for your spellbook.`);
    const okPrep = c.spells.length === counts.prepared && distinct(c.spells) && c.spells.every((id) => c.spellbook.includes(id));
    if (!okPrep) errors.push(`Prepare ${counts.prepared} spells from your spellbook.`);
  } else {
    const okPrep = c.spells.length === counts.prepared && distinct(c.spells) && c.spells.every((id) => opts.leveled.some((s) => s.id === id));
    if (!okPrep) errors.push(`Choose ${counts.prepared} prepared spells.`);
  }
  return errors;
}

/** Validate the active ability-score method. */
export function validateAbilities(c) {
  const m = c.abilityMethod;
  if (m === 'standard') return R.validateStandardArray(c.standard).errors;
  if (m === 'pointBuy') return R.validatePointBuy(c.pointBuy).errors;
  const bad = ABILITY_IDS.filter((id) => !Number.isInteger(c.manual[id]) || c.manual[id] < 3 || c.manual[id] > 18);
  return bad.length ? ['Manual/Rolled scores must be whole numbers from 3 to 18 (before bonuses).'] : [];
}

/** All step errors: { stepId: [messages] }. */
export function validateAll(c) {
  return Object.fromEntries(STEP_IDS.map((id) => [id, validateStep(c, id)]));
}

/** Convenience: full name of a spell id (used for summaries). */
export const spellName = (id) => SPELL_BY_ID[id]?.name || id;
export const weaponName = (id) => WEAPON_BY_ID[id]?.name || id;
