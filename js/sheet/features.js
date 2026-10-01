// Features & traits tab (class, subclass, species, background, feats, proficiencies) and the Notes tab.

import { h } from '../ui.js';
import { FEAT_BY_ID } from '../data/index.js';
import { panel, disclosure, titleCase } from './widgets.js';

const featureItem = (f) => disclosure(`${f.name} (level ${f.level}${f.source ? `, ${f.source}` : ''})`, h('p', {}, f.desc || 'See the SRD 5.2 for the full text.'));

export function featuresTab(ctx) {
  const { c, d } = ctx;
  const speciesTraits = d.species ? d.species.traits.filter((t) => t.level <= d.level) : [];
  const lockedTraits = d.species ? d.species.traits.filter((t) => t.level > d.level) : [];
  const choice = [d.lineage && `Lineage/ancestry: ${d.lineage}`].filter(Boolean);

  return h('div', { class: 'tab-body' },
    panel('Proficiencies and senses',
      h('dl', { class: 'facts' },
        fact('Armor training', d.armorTraining.length ? d.armorTraining.map(titleCase).join(', ') : 'None'),
        fact('Weapons', d.weaponProficiency.categories.map(titleCase).join(', ') + (d.weaponProficiency.martialWith ? ` (+ Martial with ${d.weaponProficiency.martialWith.join(', ')})` : '')),
        fact('Tools', d.tools.length ? d.tools.join(', ') : 'None'),
        fact('Languages', d.languages.join(', ')),
        fact('Darkvision', d.darkvision ? `${d.darkvision} ft` : 'None'),
        fact('Resistances', d.resistances.length ? d.resistances.map(titleCase).join(', ') : 'None'),
        fact('Size', d.size))),
    panel(d.cls ? `${d.cls.name} features` : 'Class features',
      d.features.length ? h('div', { class: 'disclosure-list' }, d.features.map(featureItem)) : h('p', { class: 'empty' }, 'No features yet.')),
    d.species ? panel(`${d.species.name} traits`,
      choice.length ? h('p', { class: 'hint' }, choice.join(' · ')) : null,
      h('div', { class: 'disclosure-list' }, speciesTraits.map((t) => disclosure(t.name, h('p', {}, t.desc)))),
      lockedTraits.length ? h('p', { class: 'hint' }, `Later traits: ${lockedTraits.map((t) => `${t.name} (level ${t.level})`).join(', ')}.`) : null) : null,
    d.bg ? panel(`Background: ${d.bg.name}`, h('p', {}, d.bg.desc), h('p', { class: 'hint' }, `Origin feat: ${FEAT_BY_ID[d.bg.feat]?.name || d.bg.feat}`)) : null,
    d.feats.length ? panel('Feats', h('div', { class: 'disclosure-list' }, d.feats.map((f) => {
      const feat = FEAT_BY_ID[f.id];
      return disclosure(`${feat.name} (${f.source})`, h('p', {}, feat.desc), feat.benefits.length ? h('ul', { class: 'bullets' }, feat.benefits.map((b) => h('li', {}, b))) : null);
    }))) : null,
    c.invocations.length ? panel('Eldritch Invocations', h('p', {}, c.invocations.join(', ').replace(/-/g, ' '))) : null);
}

const fact = (label, value) => h('div', {}, h('dt', {}, label), h('dd', {}, value));

const DETAIL_FIELDS = [
  ['traits', 'Personality traits'], ['ideals', 'Ideals'], ['bonds', 'Bonds'], ['flaws', 'Flaws'], ['appearance', 'Appearance'], ['backstory', 'Backstory'],
];

export function notesTab(ctx) {
  const { c, s } = ctx;
  const timers = {};
  const later = (key, fn) => { clearTimeout(timers[key]); timers[key] = setTimeout(() => ctx.save(fn), 250); };
  return h('div', { class: 'tab-body' },
    panel('Notes',
      h('label', { class: 'visually-hidden', for: 'notes-text' }, 'Notes'),
      h('textarea', { id: 'notes-text', rows: 10, maxLength: 20000, placeholder: 'Session notes, quest log, NPC names...', oninput: (e) => { const v = e.target.value; later('notes', (x) => { x.sheet.notes = v; }); } }, s.notes)),
    panel('Character details',
      h('div', { class: 'form-grid' }, DETAIL_FIELDS.map(([key, label]) => {
        const id = `detail-${key}`;
        return h('div', { class: 'field' }, h('label', { for: id }, label),
          h('textarea', { id, rows: key === 'backstory' ? 6 : 3, maxLength: 4000, oninput: (e) => { const v = e.target.value; later(key, (x) => { x.details[key] = v; }); } }, c.details[key] || ''));
      }))));
}
