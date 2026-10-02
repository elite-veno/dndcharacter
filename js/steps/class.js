// Step 2: class, class choices, spells (Spells tab for casters) and level advancement.

import { h } from '../ui.js';
import {
  CLASSES, CLASS_BY_ID, SKILLS, WEAPON_BY_ID, WEAPON_MASTERY, FEATS, FEAT_BY_ID, ABILITIES, INVOCATIONS,
  SPELL_BY_ID,
} from '../data/index.js';
import { weaponMasteryCount, featuresAtLevel, subclassChoices, subclassGrantLevel } from '../rules.js';
import { SUBCLASS_LABELS, SUBCLASS_LEVEL } from '../data/subclasses.js';
import {
  ORDERS, FIGHTING_STYLE_LEVEL, expertiseSlots, masteryOptions, spellCounts, classSpellOptions, classToolChoice, classFixedTools,
  extraSkillPicks, levelSlots, featAbilityOptions, chosenOrder,
} from '../choices.js';
import { skillGrants } from '../character.js';
import { resetEquipment } from '../inventory.js';
import {
  field, select, sectionTitle, notice, tag, cardGrid, checkList, counter, featCard, spellOptions, skillLabel,
} from './shared.js';

let tab = 'class';
const spellFilters = {};

const FIGHTING_STYLES = ['archery', 'defense', 'great-weapon-fighting', 'two-weapon-fighting'];
const titleCase = (s) => s.replace(/(^|[ -])(\w)/g, (m, a, b) => a + b.toUpperCase());
const joinNames = (list) => list.map((x) => titleCase(x)).join(', ');

/** Reset everything that depends on the class when a new class is picked. */
function chooseClass(c, classId) {
  if (c.classId === classId) return;
  c.classId = classId;
  Object.assign(c, {
    subclassId: null, subclassChoice: null,
    classSkills: [], classTools: [], masteries: [], divineOrder: null, primalOrder: null, fightingStyle: null,
    expertise: [], cantrips: [], spells: [], spellbook: [], invocations: [], extraSkills: {}, levelAsi: [],
  });
  resetEquipment(c);
  tab = 'class';
}

export default {
  id: 'class',
  title: 'Class',
  blurb: 'Pick a class and make its choices.',
  render(ctx) {
    const { c } = ctx;
    const cls = CLASS_BY_ID[c.classId];
    const counts = spellCounts(c);
    const slots = cls ? levelSlots(cls.id, c.level) : [];
    const tabs = [{ id: 'class', label: 'Class' }];
    if (counts) tabs.push({ id: 'spells', label: 'Spells' });
    if (slots.length) tabs.push({ id: 'advancement', label: 'Level-Up Choices' });
    if (!tabs.some((t) => t.id === tab)) tab = 'class';

    const tabBar = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Class sections' },
      tabs.map((t) => h('button', {
        type: 'button', role: 'tab', id: `tab-${t.id}`, 'aria-selected': t.id === tab ? 'true' : 'false', class: `tab${t.id === tab ? ' active' : ''}`,
        onclick: () => { tab = t.id; ctx.rerender(); },
      }, t.label)));

    let body;
    if (tab === 'spells') body = spellsTab(ctx, cls, counts);
    else if (tab === 'advancement') body = advancementTab(ctx, cls, slots);
    else body = classTab(ctx, cls);

    return h('section', { class: 'step-panel' },
      h('h2', {}, 'Choose a Class'),
      cls ? tabBar : null,
      body);
  },
};

// ---------------------------------------------------------------- class tab

function classTab(ctx, cls) {
  const { c } = ctx;
  const grid = cardGrid({
    label: 'Classes', idPrefix: 'class',
    options: CLASSES.map((k) => ({ id: k.id, title: k.name, subtitle: `d${k.hitDie} · ${joinNames(k.primaryAbility.map((a) => a.toUpperCase()))}`, badge: k.spellcasting ? 'Caster' : null })),
    value: c.classId,
    onSelect: (id) => ctx.update((x) => chooseClass(x, id)),
  });
  const root = h('div', {}, h('p', { class: 'lead' }, 'Your class defines how you fight, cast and survive. All 12 SRD classes are available.'), grid);
  if (!cls) {
    root.append(notice('Select a class to see its details and choices.'));
    return root;
  }
  root.append(classDetails(ctx, cls), subclassPicker(ctx, cls), classChoices(ctx, cls));
  return root;
}

function classDetails(ctx, cls) {
  const { c } = ctx;
  const features = featuresAtLevel(cls.id, c.level, { subclassId: c.subclassId });
  const later = cls.features.filter((f) => f.level > c.level);
  const proficiencyTags = [
    ...cls.armorTraining.map((a) => tag(`${titleCase(a)} ${a === 'shield' ? '' : 'armor'}`.trim())),
    ...cls.weaponProficiency.categories.map((w) => tag(`${titleCase(w)} weapons`)),
  ];
  if (cls.weaponProficiency.martialWith) proficiencyTags.push(tag(`Martial weapons with ${cls.weaponProficiency.martialWith.join(' or ')}`));
  return h('div', { class: 'info-card' },
    h('h3', {}, cls.name),
    h('p', {}, cls.desc),
    h('dl', { class: 'facts' },
      h('div', {}, h('dt', {}, 'Hit Die'), h('dd', {}, `d${cls.hitDie}`)),
      h('div', {}, h('dt', {}, 'Primary ability'), h('dd', {}, cls.primaryAbility.map((a) => a.toUpperCase()).join(' or '))),
      h('div', {}, h('dt', {}, 'Saving throws'), h('dd', {}, cls.savingThrows.map((a) => a.toUpperCase()).join(', '))),
      h('div', {}, h('dt', {}, 'Spellcasting'), h('dd', {}, cls.spellcasting ? `${cls.spellcasting.ability.toUpperCase()} (${titleCase(cls.spellcasting.type)})` : 'None'))),
    h('div', { class: 'tag-row' }, proficiencyTags),
    c.level < SUBCLASS_LEVEL ? h('p', { class: 'hint' }, `Your ${SUBCLASS_LABELS[cls.id] || 'subclass'} is chosen at level ${SUBCLASS_LEVEL}.`) : null,
    h('h4', {}, `Features up to level ${c.level}`),
    h('ul', { class: 'feature-list' }, features.map((f) => h('li', {}, h('strong', {}, `L${f.level} ${f.name}`), f.source !== cls.name ? tag(f.source, 'sub') : null, ' ', f.desc))),
    later.length ? h('details', {}, h('summary', {}, `Higher-level class features (${later.length})`),
      h('ul', { class: 'feature-list' }, later.map((f) => h('li', {}, h('strong', {}, `L${f.level} ${f.name}`), ' ', f.desc)))) : null);
}

function subclassPicker(ctx, cls) {
  const { c } = ctx;
  if (c.level < SUBCLASS_LEVEL) return null;
  const label = SUBCLASS_LABELS[cls.id] || 'Subclass';
  const chosen = cls.subclass.find((x) => x.id === c.subclassId) || null;
  const wrap = h('div', { class: 'choices' }, sectionTitle(`${label} (subclass)`, 3),
    notice(`These subclasses come from the 2014 Player's Handbook. The 2024 rules choose every subclass at level ${SUBCLASS_LEVEL}, so features, spells and proficiencies the 2014 book grants earlier are granted at level ${SUBCLASS_LEVEL} when you select one.`));
  const group = h('div', { class: 'card-grid subclass-grid', role: 'radiogroup', 'aria-label': label });
  cls.subclass.forEach((sub) => {
    const on = sub.id === c.subclassId;
    group.append(h('button', {
      type: 'button', id: `subclass-${sub.id}`, class: `choice-card subclass-card${on ? ' selected' : ''}`, role: 'radio', 'aria-checked': on ? 'true' : 'false',
      onclick: () => ctx.update((x) => { x.subclassId = sub.id; x.subclassChoice = subclassChoices(sub)[0] || null; }),
    },
    h('span', { class: 'choice-title' }, sub.name),
    h('span', { class: 'choice-badge' }, sub.source),
    h('span', { class: 'choice-sub' }, sub.summary),
    h('ul', { class: 'subclass-features' }, sub.features.map((f) => h('li', { class: subclassGrantLevel(f.level) <= c.level ? '' : 'locked' }, `L${subclassGrantLevel(f.level)} ${f.name}`)))));
  });
  wrap.append(group);
  if (!chosen) {
    wrap.append(h('p', { class: 'notice warn' }, `Choose a ${label} to continue.`));
    return wrap;
  }
  const choices = subclassChoices(chosen);
  if (choices.length) {
    wrap.append(field('Terrain (determines your circle spells)', select({
      options: choices.map((o) => ({ value: o, label: o })), value: c.subclassChoice,
      onChange: (v) => ctx.update((x) => { x.subclassChoice = v; }),
    })));
  }
  const grantedProfs = chosen.grantedProficiencies;
  wrap.append(h('div', { class: 'info-card' },
    h('h4', {}, `${chosen.name} at level ${c.level}`),
    h('ul', { class: 'feature-list' }, featuresAtLevel(cls.id, c.level, { subclassId: chosen.id }).filter((f) => f.source === chosen.name)
      .map((f) => h('li', {}, h('strong', {}, `L${f.level} ${f.name}`), ' ', f.desc))),
    grantedProfs.length ? h('p', {}, h('strong', {}, 'Proficiencies: '), grantedProfs.join('; ')) : null,
    chosen.notes2024 ? h('p', { class: 'hint' }, h('strong', {}, '2024 note: '), chosen.notes2024) : null));
  return wrap;
}

function classChoices(ctx, cls) {
  const { c } = ctx;
  const wrap = h('div', { class: 'choices' }, sectionTitle(`${cls.name} choices`, 3));
  const grants = skillGrants(c);
  const classOwned = new Set([...c.classSkills, ...Object.values(c.extraSkills).flat()]);
  const outside = (skill) => grants.find((g) => g.skill === skill && g.step !== 'class');

  // Skills
  const allowed = cls.skillChoices.from === 'any' ? SKILLS.map((s) => s.id) : cls.skillChoices.from;
  wrap.append(h('div', { class: 'sub-panel' },
    h('h4', {}, `Skill proficiencies (choose ${cls.skillChoices.count})`),
    counter(c.classSkills.length, cls.skillChoices.count),
    checkList({
      idPrefix: 'cskill', selected: c.classSkills, max: cls.skillChoices.count,
      options: allowed.map((id) => ({
        id, label: skillLabel(id),
        disabled: !c.classSkills.includes(id) && (!!outside(id) || classOwned.has(id)),
        disabledReason: outside(id) ? `From ${outside(id).source}` : 'Already chosen',
      })),
      onChange: (next) => ctx.update((x) => { x.classSkills = next; x.expertise = x.expertise.filter((e) => skillGrantsAfter(x).has(e)); }),
    })));

  // Extra skill picks (Primal Knowledge, Lore bonus proficiencies)
  extraSkillPicks(c).forEach((pick) => {
    const got = c.extraSkills[pick.key] || [];
    wrap.append(h('div', { class: 'sub-panel' }, h('h4', {}, `${pick.label} (choose ${pick.count})`), counter(got.length, pick.count),
      checkList({
        idPrefix: `xskill-${pick.key}`, selected: got, max: pick.count,
        options: pick.from.map((id) => ({
          id, label: skillLabel(id),
          disabled: !got.includes(id) && (!!outside(id) || classOwned.has(id)), disabledReason: 'Already granted',
        })),
        onChange: (next) => ctx.update((x) => { x.extraSkills = { ...x.extraSkills, [pick.key]: next }; }),
      })));
  });

  // Tools
  const toolSpec = classToolChoice(cls.id);
  if (toolSpec) {
    wrap.append(h('div', { class: 'sub-panel' }, h('h4', {}, `Tool proficiency: ${toolSpec.label} (choose ${toolSpec.count})`), counter(c.classTools.length, toolSpec.count),
      checkList({
        idPrefix: 'ctool', selected: c.classTools, max: toolSpec.count,
        options: toolSpec.pool.map((t) => ({ id: t.id, label: t.name, detail: t.category === 'instrument' ? 'Musical Instrument' : 'Artisan\'s Tools' })),
        onChange: (next) => ctx.update((x) => { x.classTools = next; }),
      })));
  } else if (classFixedTools(cls.id).length) {
    wrap.append(h('p', {}, h('strong', {}, 'Tool proficiencies: '), classFixedTools(cls.id).join(', ')));
  }

  // Orders (Cleric Divine Order, Druid Primal Order)
  const order = ORDERS[cls.id];
  if (order) {
    wrap.append(h('div', { class: 'sub-panel' }, h('h4', {}, order.label),
      cardGrid({
        label: order.label, idPrefix: 'order', value: c[order.key],
        options: order.options.map((o) => ({ id: o.id, title: o.name, subtitle: o.desc })),
        onSelect: (id) => ctx.update((x) => { x[order.key] = id; x.cantrips = []; x.expertise = x.expertise.filter((e) => skillGrantsAfter(x).has(e)); }),
      })));
  }

  // Fighting style
  if (FIGHTING_STYLE_LEVEL[cls.id] && c.level >= FIGHTING_STYLE_LEVEL[cls.id]) {
    wrap.append(h('div', { class: 'sub-panel' }, h('h4', {}, 'Fighting Style'),
      cardGrid({
        label: 'Fighting Style', idPrefix: 'style', value: c.fightingStyle,
        options: FIGHTING_STYLES.map((id) => ({ id, title: FEAT_BY_ID[id].name, subtitle: FEAT_BY_ID[id].desc })),
        onSelect: (id) => ctx.update((x) => { x.fightingStyle = id; }),
      })));
  }

  // Weapon mastery
  const mastery = weaponMasteryCount(cls.id, c.level);
  if (mastery) {
    const options = masteryOptions(cls.id);
    const picked = c.masteries.map((id) => WEAPON_BY_ID[id]).filter(Boolean);
    wrap.append(h('div', { class: 'sub-panel' },
      h('h4', {}, `Weapon Mastery (choose ${mastery})`),
      h('p', { class: 'hint' }, cls.id === 'rogue' ? 'Rogues may choose Simple or Martial weapons with the Finesse or Light property.' : cls.id === 'barbarian' ? 'Barbarians choose Simple or Martial melee weapons.' : 'Choose Simple or Martial weapons.'),
      counter(c.masteries.length, mastery),
      checkList({
        idPrefix: 'mastery', selected: c.masteries, max: mastery,
        options: options.map((w) => ({ id: w.id, label: w.name, detail: `${titleCase(w.category)} ${w.type} · ${w.damage} ${w.damageType} · Mastery: ${WEAPON_MASTERY[w.mastery].name}` })),
        onChange: (next) => ctx.update((x) => { x.masteries = next; }),
      }),
      picked.length ? h('dl', { class: 'defs' }, [...new Set(picked.map((w) => w.mastery))].map((m) => [h('dt', {}, WEAPON_MASTERY[m].name), h('dd', {}, WEAPON_MASTERY[m].desc)])) : null));
  }

  // Expertise
  const exp = expertiseSlots(cls.id, c.level);
  if (exp.count) {
    const proficient = [...new Set(grants.map((g) => g.skill))].filter((id) => !exp.from || exp.from.includes(id));
    wrap.append(h('div', { class: 'sub-panel' }, h('h4', {}, `${exp.source}: Expertise (choose ${exp.count})`),
      h('p', { class: 'hint' }, 'Your Proficiency Bonus is doubled for the chosen skills. Choose skills you are proficient in.'),
      counter(c.expertise.length, exp.count),
      proficient.length ? checkList({
        idPrefix: 'expert', selected: c.expertise, max: exp.count,
        options: proficient.map((id) => ({ id, label: skillLabel(id) })),
        onChange: (next) => ctx.update((x) => { x.expertise = next; }),
      }) : notice('Choose your skill proficiencies first (class, background, species).', 'warn')));
  }

  // Warlock invocations
  if (cls.id === 'warlock') {
    const need = cls.invocations[c.level - 1];
    wrap.append(h('div', { class: 'sub-panel' }, h('h4', {}, `Eldritch Invocations (choose ${need})`), counter(c.invocations.length, need),
      checkList({
        idPrefix: 'invoc', selected: c.invocations, max: need,
        options: INVOCATIONS.map((i) => ({ id: i.id, label: i.name, detail: `${i.prerequisite ? `Prerequisite: ${i.prerequisite}. ` : ''}${i.desc}` })),
        onChange: (next) => ctx.update((x) => { x.invocations = next; }),
      })));
  }

  if (cls.id === 'sorcerer' && c.level >= 2) wrap.append(notice('Metamagic options are chosen on the character sheet.'));
  return wrap;
}

/** Skill ids granted after a pending change (used to drop stale expertise picks). */
function skillGrantsAfter(c) {
  return new Set(skillGrants(c).map((g) => g.skill));
}

// ---------------------------------------------------------------- spells tab

function spellPicker(ctx, { key, title, spells, selected, max, onChange, hint }) {
  const f = (spellFilters[key] ||= { q: '', level: 'all' });
  const levels = [...new Set(spells.map((s) => s.level))].sort((a, b) => a - b);
  const listBox = h('div', { class: 'picker-list' });
  const draw = () => {
    const q = f.q.trim().toLowerCase();
    const visible = spells.filter((s) => (f.level === 'all' || s.level === Number(f.level)) && (!q || s.name.toLowerCase().includes(q)));
    listBox.replaceChildren(visible.length ? checkList({
      idPrefix: `sp-${key}`, selected, max, options: spellOptions(visible), onChange,
    }) : h('p', { class: 'hint' }, 'No spells match.'));
  };
  const searchId = `search-${key}`;
  const search = h('input', { id: searchId, type: 'search', value: f.q, placeholder: 'Search spells', oninput: (e) => { f.q = e.target.value; draw(); } });
  const levelSel = select({
    id: `level-${key}`, value: f.level,
    options: [{ value: 'all', label: 'All levels' }, ...levels.map((l) => ({ value: String(l), label: l === 0 ? 'Cantrips' : `Level ${l}` }))],
    onChange: (v) => { f.level = v || 'all'; draw(); },
  });
  draw();
  const chosen = selected.map((id) => SPELL_BY_ID[id]?.name).filter(Boolean);
  return h('div', { class: 'sub-panel' },
    h('h4', {}, `${title} (choose ${max})`),
    hint ? h('p', { class: 'hint' }, hint) : null,
    counter(selected.length, max),
    chosen.length ? h('p', { class: 'chosen-line' }, h('strong', {}, 'Chosen: '), chosen.join(', ')) : null,
    h('div', { class: 'filters' }, field('Search', search, null, searchId), spells.some((s) => s.level > 0) && levels.length > 1 ? field('Spell level', levelSel, null, levelSel.id) : null),
    listBox);
}

function spellsTab(ctx, cls, counts) {
  const { c } = ctx;
  const opts = classSpellOptions(cls.id, counts.maxSpellLevel);
  const root = h('div', {},
    h('p', { class: 'lead' }, `${cls.name} spellcasting uses ${counts.ability.toUpperCase()}. At level ${c.level} you can cast spells up to level ${counts.maxSpellLevel}.`));
  const order = chosenOrder(c);
  if ((order === 'thaumaturge' || order === 'magician')) root.append(notice(`Your ${titleCase(order)} order grants one extra cantrip (included below).`));
  if (counts.cantrips) {
    root.append(spellPicker(ctx, {
      key: `${cls.id}-cantrips`, title: 'Cantrips', spells: opts.cantrips, selected: c.cantrips, max: counts.cantrips,
      onChange: (next) => ctx.update((x) => { x.cantrips = next; }),
    }));
  }
  if (counts.spellbook) {
    root.append(spellPicker(ctx, {
      key: `${cls.id}-spellbook`, title: 'Spellbook', spells: opts.leveled, selected: c.spellbook, max: counts.spellbook,
      hint: 'Your spellbook holds spells you can prepare; Wizards add two spells per level.',
      onChange: (next) => ctx.update((x) => { x.spellbook = next; x.spells = x.spells.filter((id) => next.includes(id)); }),
    }));
    root.append(spellPicker(ctx, {
      key: `${cls.id}-prepared`, title: 'Prepared spells', spells: opts.leveled.filter((s) => c.spellbook.includes(s.id)), selected: c.spells, max: counts.prepared,
      hint: 'Prepare spells from your spellbook. You can change this after each Long Rest.',
      onChange: (next) => ctx.update((x) => { x.spells = next; }),
    }));
  } else {
    root.append(spellPicker(ctx, {
      key: `${cls.id}-prepared`, title: 'Prepared spells', spells: opts.leveled, selected: c.spells, max: counts.prepared,
      hint: ({
        cleric: 'You can change your prepared spells after a Long Rest.',
        druid: 'You can change your prepared spells after a Long Rest.',
        paladin: 'You can replace one prepared spell after a Long Rest.',
        ranger: 'You can replace one prepared spell after a Long Rest.',
        bard: 'You can replace one prepared spell when you gain a level.',
        sorcerer: 'You can replace one prepared spell when you gain a level.',
        warlock: 'You can replace one prepared spell when you gain a level. Pact Magic slots are all cast at the same level.',
      })[cls.id] || 'You can change your prepared spells after a Long Rest.',
      onChange: (next) => ctx.update((x) => { x.spells = next; }),
    }));
  }
  return root;
}

// ---------------------------------------------------------------- advancement tab

function advancementTab(ctx, cls, slots) {
  const { c } = ctx;
  const root = h('div', {}, h('p', { class: 'lead' }, 'At these levels you gain an Ability Score Improvement (or a feat). Scores cannot exceed 20 (30 for Epic Boons).'));
  const abilityOpts = ABILITIES.map((a) => ({ value: a.id, label: `${a.name} (${a.abbr})` }));
  slots.forEach((slot, i) => {
    const pick = c.levelAsi[i] || { type: slot.kind === 'boon' ? 'feat' : 'asi', mode: 'plus2' };
    const set = (patch) => ctx.update((x) => { x.levelAsi[i] = { ...(x.levelAsi[i] || pick), ...patch }; });
    const box = h('div', { class: 'sub-panel' }, h('h4', {}, slot.kind === 'boon' ? `Level ${slot.level}: Epic Boon` : `Level ${slot.level}: Ability Score Improvement`));
    const kindOptions = slot.kind === 'boon'
      ? [{ id: 'feat', title: 'Epic Boon feat', subtitle: 'Choose a boon' }]
      : [{ id: 'plus2', title: '+2 to one ability' }, { id: 'plus1plus1', title: '+1 to two abilities' }, { id: 'feat', title: 'Take a feat' }];
    const kindValue = pick.type === 'feat' ? 'feat' : pick.mode;
    box.append(cardGrid({
      label: 'Advancement type', idPrefix: `adv${i}-kind`, value: c.levelAsi[i] ? kindValue : null, options: kindOptions,
      onSelect: (id) => set(id === 'feat' ? { type: 'feat', featId: null, ability: null } : { type: 'asi', mode: id, a: null, b: null }),
    }));
    if (pick.type === 'asi' && c.levelAsi[i]) {
      box.append(field(pick.mode === 'plus2' ? 'Ability (+2)' : 'First ability (+1)', select({ id: `adv${i}-a`, options: abilityOpts, value: pick.a || null, placeholder: 'Choose', onChange: (v) => set({ a: v }) })));
      if (pick.mode === 'plus1plus1') box.append(field('Second ability (+1)', select({ id: `adv${i}-b`, options: abilityOpts.filter((o) => o.value !== pick.a), value: pick.b || null, placeholder: 'Choose', onChange: (v) => set({ b: v }) })));
    } else if (pick.type === 'feat' && c.levelAsi[i]) {
      const category = slot.kind === 'boon' ? 'epic-boon' : 'general';
      const taken = c.levelAsi.filter((p, j) => j !== i && p?.type === 'feat').map((p) => p.featId);
      const feats = FEATS.filter((f) => f.category === category && f.id !== 'ability-score-improvement' && (f.repeatable || !taken.includes(f.id)));
      box.append(field('Feat', select({
        id: `adv${i}-feat`, value: pick.featId || null, placeholder: 'Choose a feat',
        options: feats.map((f) => ({ value: f.id, label: `${f.name}${f.prerequisite ? ` (${f.prerequisite})` : ''}` })),
        onChange: (v) => set({ featId: v, ability: featAbilityOptions(v, cls.id)[0] || null }),
      })));
      if (pick.featId) {
        const abil = featAbilityOptions(pick.featId, cls.id);
        if (abil.length > 1) box.append(field('Ability increase (+1)', select({ id: `adv${i}-fa`, options: abil.map((a) => ({ value: a, label: a.toUpperCase() })), value: pick.ability || null, placeholder: 'Choose', onChange: (v) => set({ ability: v }) })));
        box.append(featCard(pick.featId));
      }
    }
    root.append(box);
  });
  return root;
}
