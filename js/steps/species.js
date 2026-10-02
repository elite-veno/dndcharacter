// Step 4: species (filter/search, details pop-up, species choices, languages).

import { h, openModal } from '../ui.js';
import { SPECIES, SPECIES_BY_ID, SKILLS, LANGUAGES, BACKGROUND_BY_ID, featsByCategory } from '../data/index.js';
import { skillGrants } from '../character.js';
import { field, select, notice, tag, checkList, counter, featCard, featChoicesUI, sectionTitle } from './shared.js';

const view = { q: '', size: 'all', vision: false };
const ABILITY_OPTIONS = [{ value: 'int', label: 'Intelligence' }, { value: 'wis', label: 'Wisdom' }, { value: 'cha', label: 'Charisma' }];

function speciesSummary(s) {
  return `${s.size.join(' or ')} · ${s.speed} ft${s.darkvision ? ` · Darkvision ${s.darkvision} ft` : ''}`;
}

/** Pop-up with every trait of a species. */
function showDetails(species, onChoose) {
  const body = h('div', {},
    h('p', {}, species.desc),
    h('dl', { class: 'facts' },
      h('div', {}, h('dt', {}, 'Size'), h('dd', {}, species.size.join(' or '))),
      h('div', {}, h('dt', {}, 'Speed'), h('dd', {}, `${species.speed} ft`)),
      h('div', {}, h('dt', {}, 'Darkvision'), h('dd', {}, species.darkvision ? `${species.darkvision} ft` : 'None'))),
    h('ul', { class: 'feature-list' }, species.traits.map((t) => h('li', {}, h('strong', {}, t.name), t.level > 1 ? tag(`Level ${t.level}`, 'sub') : null, ' ', t.desc))),
    species.lineages ? h('div', {}, h('h4', {}, 'Lineages'), h('dl', { class: 'defs' }, Object.entries(species.lineages).map(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]))) : null,
    species.legacies ? h('div', {}, h('h4', {}, 'Legacies'), h('dl', { class: 'defs' }, Object.entries(species.legacies).map(([k, v]) => [h('dt', {}, k),
      h('dd', {}, `Resistance to ${v.resistance} damage; cantrip ${v.cantrip}; ${v.level3} at level 3; ${v.level5} at level 5.`)]))) : null,
    h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn primary', onclick: () => { modal.close(); onChoose(); } }, `Choose ${species.name}`)));
  const modal = openModal(species.name, body, { wide: true });
}

export default {
  id: 'species',
  title: 'Species',
  blurb: 'Your heritage: traits, senses and languages.',
  render(ctx) {
    const { c } = ctx;
    const species = SPECIES_BY_ID[c.speciesId];
    const choose = (id) => ctx.update((x) => {
      if (x.speciesId === id) return;
      x.speciesId = id; x.speciesChoices = {}; x.speciesFeatId = null; x.speciesFeatChoices = {};
      const sp = SPECIES_BY_ID[id];
      if (sp.size.length === 1) x.speciesChoices.size = sp.size[0];
    });

    const gridHost = h('div', { class: 'species-host' });
    const draw = () => {
      const q = view.q.trim().toLowerCase();
      const list = SPECIES.filter((s) => (!q || `${s.name} ${s.desc}`.toLowerCase().includes(q))
        && (view.size === 'all' || s.size.includes(view.size)) && (!view.vision || s.darkvision > 0));
      gridHost.replaceChildren(list.length
        ? h('div', { class: 'card-grid', role: 'radiogroup', 'aria-label': 'Species' }, list.map((s) => h('div', { class: `choice-card species-card${s.id === c.speciesId ? ' selected' : ''}` },
          h('button', { type: 'button', id: `species-${s.id}`, class: 'card-main', role: 'radio', 'aria-checked': s.id === c.speciesId ? 'true' : 'false', onclick: () => choose(s.id) },
            h('span', { class: 'choice-title' }, s.name), h('span', { class: 'choice-sub' }, speciesSummary(s))),
          h('button', { type: 'button', class: 'link-btn', 'aria-label': `View ${s.name} details`, onclick: () => showDetails(s, () => choose(s.id)) }, 'Details'))))
        : h('p', { class: 'hint' }, 'No species match your filters.'));
    };
    draw();

    const filters = h('div', { class: 'filters' },
      field('Search', h('input', { id: 'species-search', type: 'search', value: view.q, placeholder: 'Search species', oninput: (e) => { view.q = e.target.value; draw(); } })),
      field('Size', select({ id: 'species-size', value: view.size, options: [{ value: 'all', label: 'Any size' }, { value: 'Small', label: 'Small' }, { value: 'Medium', label: 'Medium' }], onChange: (v) => { view.size = v || 'all'; draw(); } })),
      h('div', { class: 'field inline' }, h('input', { id: 'species-dv', type: 'checkbox', checked: view.vision, onchange: (e) => { view.vision = e.target.checked; draw(); } }), h('label', { for: 'species-dv' }, 'Has Darkvision')));

    const root = h('section', { class: 'step-panel' },
      h('h2', {}, 'Choose a Species'),
      h('p', { class: 'lead' }, 'Species grant traits, size, speed and senses. They no longer grant ability score increases in the 2024 rules.'),
      filters, gridHost);
    if (!species) { root.append(notice('Select a species to continue.')); return root; }
    root.append(speciesPanel(ctx, species), languagePanel(ctx));
    return root;
  },
};

function speciesPanel(ctx, species) {
  const { c } = ctx;
  const ch = c.speciesChoices;
  const set = (key, value) => ctx.update((x) => { x.speciesChoices[key] = value; });
  const panel = h('div', { class: 'info-card' },
    h('h3', {}, species.name), h('p', {}, species.desc),
    h('ul', { class: 'feature-list' }, species.traits.map((t) => h('li', {}, h('strong', {}, t.name), t.level > 1 ? tag(`Level ${t.level}`, 'sub') : null, ' ', t.desc))));
  const choices = h('div', { class: 'sub-panel' }, h('h4', {}, `${species.name} choices`));
  const grants = skillGrants(c);
  const takenOutside = (skill, source) => grants.find((g) => g.skill === skill && g.source !== source);

  if (species.choices?.ancestry) {
    const isDragon = species.id === 'dragonborn';
    choices.append(field(isDragon ? 'Draconic Ancestry' : 'Giant Ancestry', select({
      id: 'sp-ancestry', value: ch.ancestry || null, placeholder: 'Choose',
      options: species.choices.ancestry.map((a) => ({ value: a, label: isDragon ? `${a} (${species.ancestryDamage[a]})` : a })),
      onChange: (v) => set('ancestry', v),
    }), isDragon ? 'Sets your Breath Weapon and Damage Resistance damage type.' : 'Choose a boon; you can use it a number of times equal to your Proficiency Bonus per Long Rest.'));
  }
  if (species.choices?.lineage) {
    choices.append(field('Lineage', select({ id: 'sp-lineage', value: ch.lineage || null, placeholder: 'Choose', options: species.choices.lineage.map((l) => ({ value: l, label: l })), onChange: (v) => set('lineage', v) }),
      ch.lineage ? species.lineages[ch.lineage] : null));
  }
  if (species.choices?.legacy) {
    const l = ch.legacy ? species.legacies[ch.legacy] : null;
    choices.append(field('Fiendish Legacy', select({ id: 'sp-legacy', value: ch.legacy || null, placeholder: 'Choose', options: species.choices.legacy.map((x) => ({ value: x, label: x })), onChange: (v) => set('legacy', v) }),
      l ? `Resistance to ${l.resistance} damage; cantrip ${l.cantrip}; ${l.level3} at level 3; ${l.level5} at level 5.` : null));
  }
  if (species.choices?.spellcastingAbility) {
    choices.append(field('Spellcasting ability', select({ id: 'sp-ability', value: ch.spellcastingAbility || null, placeholder: 'Choose', options: ABILITY_OPTIONS, onChange: (v) => set('spellcastingAbility', v) }), 'Used for the spells granted by your species.'));
  }
  if (species.choices?.keenSenses) {
    choices.append(field('Keen Senses skill', select({
      id: 'sp-keen', value: ch.keenSenses || null, placeholder: 'Choose',
      options: species.choices.keenSenses.map((s) => ({ value: s, label: SKILLS.find((k) => k.id === s).name })),
      disabledValues: species.choices.keenSenses.filter((s) => takenOutside(s, 'Elf Keen Senses')),
      onChange: (v) => set('keenSenses', v),
    }), 'Skills already granted elsewhere are disabled.'));
  }
  if (species.choices?.skill) {
    choices.append(field('Skillful: skill proficiency', select({
      id: 'sp-skill', value: ch.skill || null, placeholder: 'Choose',
      options: SKILLS.map((s) => ({ value: s.id, label: s.name })),
      disabledValues: SKILLS.map((s) => s.id).filter((s) => takenOutside(s, 'Human Skillful')),
      onChange: (v) => set('skill', v),
    }), 'Skills already granted elsewhere are disabled.'));
  }
  if (species.size.length > 1) {
    choices.append(field('Size', select({ id: 'sp-size', value: ch.size || null, placeholder: 'Choose', options: species.size.map((s) => ({ value: s, label: s })), onChange: (v) => set('size', v) })));
  }
  panel.append(choices.children.length > 1 ? choices : '');

  if (species.extraOriginFeat) {
    const bgFeat = BACKGROUND_BY_ID[c.backgroundId]?.feat;
    const feats = featsByCategory('origin').filter((f) => f.id !== bgFeat || f.repeatable);
    const featBox = h('div', { class: 'sub-panel' }, h('h4', {}, 'Versatile: extra Origin feat'),
      field('Origin feat', select({
        id: 'sp-feat', value: c.speciesFeatId, placeholder: 'Choose a feat', options: feats.map((f) => ({ value: f.id, label: f.name })),
        onChange: (v) => ctx.update((x) => { x.speciesFeatId = v; x.speciesFeatChoices = {}; }),
      }), 'It must differ from your Background feat.'));
    if (c.speciesFeatId) {
      featBox.append(featCard(c.speciesFeatId));
      const taken = () => skillGrants(c).filter((g) => !(g.step === 'species' && g.source === 'Skilled feat')).map((g) => `skill:${g.skill}`);
      const ui = featChoicesUI(c.speciesFeatId, c.speciesFeatChoices, (fn) => ctx.update((x) => fn(x.speciesFeatChoices)), { ...ctx, takenSkills: taken });
      if (ui) featBox.append(ui);
    }
    panel.append(featBox);
  }
  return panel;
}

function languagePanel(ctx) {
  const { c } = ctx;
  const standard = LANGUAGES.standard.filter((l) => l !== 'Common');
  return h('div', { class: 'sub-panel' },
    sectionTitle('Languages', 4),
    h('p', { class: 'hint' }, 'You know Common plus two standard languages of your choice.'),
    counter(c.languages.length, 2, 'languages chosen'),
    checkList({ idPrefix: 'lang', selected: c.languages, max: 2, options: standard.map((l) => ({ id: l, label: l })), onChange: (next) => ctx.update((x) => { x.languages = next; }) }));
}
