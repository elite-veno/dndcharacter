// Step 3: background (ability score increases, Origin feat, skills, tool).

import { h } from '../ui.js';
import { BACKGROUNDS, BACKGROUND_BY_ID, BACKGROUND_ASI_RULES, ABILITIES, FEAT_BY_ID, SKILL_BY_ID, GAMING_SETS } from '../data/index.js';
import { itemName, resetEquipment } from '../inventory.js';
import { skillGrants } from '../character.js';
import { field, select, notice, tag, cardGrid, featCard, featChoicesUI, sectionTitle } from './shared.js';

const abilityName = (id) => ABILITIES.find((a) => a.id === id).name;

function chooseBackground(c, id) {
  if (c.backgroundId === id) return;
  c.backgroundId = id;
  c.bgAsi = { mode: c.bgAsi.mode, plus2: null, plus1: null };
  c.bgToolChoice = null;
  c.bgFeatChoices = {};
  resetEquipment(c);
}

export default {
  id: 'background',
  title: 'Background',
  blurb: 'Where you came from: ability scores, a feat and proficiencies.',
  render(ctx) {
    const { c } = ctx;
    const bg = BACKGROUND_BY_ID[c.backgroundId];
    const root = h('section', { class: 'step-panel' },
      h('h2', {}, 'Choose a Background'),
      h('p', { class: 'lead' }, 'In the 2024 rules your background provides your ability score increases, an Origin feat, two skill proficiencies and a tool proficiency.'),
      cardGrid({
        label: 'Backgrounds', idPrefix: 'bg', value: c.backgroundId,
        options: BACKGROUNDS.map((b) => ({ id: b.id, title: b.name, subtitle: `${FEAT_BY_ID[b.feat].name} · ${b.skills.map((s) => SKILL_BY_ID[s].name).join(', ')}` })),
        onSelect: (id) => ctx.update((x) => chooseBackground(x, id)),
      }));
    if (!bg) { root.append(notice('Select a background to continue.')); return root; }

    root.append(h('div', { class: 'info-card' },
      h('h3', {}, bg.name),
      h('p', {}, bg.desc),
      h('dl', { class: 'facts' },
        h('div', {}, h('dt', {}, 'Ability scores'), h('dd', {}, bg.abilities.map(abilityName).join(', '))),
        h('div', {}, h('dt', {}, 'Origin feat'), h('dd', {}, FEAT_BY_ID[bg.feat].name)),
        h('div', {}, h('dt', {}, 'Skills'), h('dd', {}, bg.skills.map((s) => SKILL_BY_ID[s].name).join(', '))),
        h('div', {}, h('dt', {}, 'Tool'), h('dd', {}, bg.tool))),
      h('p', { class: 'hint' }, `Equipment Option A: ${bg.equipmentA.map((e) => (e.choice ? 'one gaming set' : itemName(e))).join(', ')}, and ${bg.goldA} GP. Option B: ${bg.goldB} GP.`)));

    root.append(asiPanel(ctx, bg));

    if (bg.toolChoice === 'gaming') {
      root.append(h('div', { class: 'sub-panel' }, h('h4', {}, 'Tool proficiency'),
        field('Gaming Set', select({
          id: 'bg-tool', options: GAMING_SETS.map((t) => ({ value: t.id, label: t.name })), value: c.bgToolChoice, placeholder: 'Choose a Gaming Set',
          onChange: (v) => ctx.update((x) => { x.bgToolChoice = v; x.equipment.items = []; x.equipment.added = false; x.equipment.choices = {}; }),
        }))));
    }

    root.append(sectionTitle(`Origin feat: ${FEAT_BY_ID[bg.feat].name}`), featCard(bg.feat));
    const takenSkills = () => skillGrants(c).filter((g) => !(g.step === 'background' && g.source === 'Skilled feat')).map((g) => `skill:${g.skill}`);
    const featUi = featChoicesUI(bg.feat, c.bgFeatChoices, (fn) => ctx.update((x) => fn(x.bgFeatChoices)), { ...ctx, takenSkills });
    if (featUi) root.append(featUi);
    return root;
  },
};

function asiPanel(ctx, bg) {
  const { c } = ctx;
  const asi = c.bgAsi;
  const opts = bg.abilities.map((id) => ({ value: id, label: abilityName(id) }));
  const mode = (m) => ctx.update((x) => { x.bgAsi = { mode: m, plus2: null, plus1: null }; });
  const panel = h('div', { class: 'sub-panel' },
    h('h4', {}, 'Ability score increases'),
    h('p', { class: 'hint' }, BACKGROUND_ASI_RULES.desc),
    cardGrid({
      label: 'Increase distribution', idPrefix: 'bgasi', value: asi.mode,
      options: [{ id: 'plus2-plus1', title: '+2 and +1', subtitle: 'One ability +2, another +1' }, { id: 'plus1-plus1-plus1', title: '+1 / +1 / +1', subtitle: 'All three listed abilities +1' }],
      onSelect: mode,
    }));
  if (asi.mode === 'plus2-plus1') {
    panel.append(h('div', { class: 'form-grid' },
      field('+2 to', select({ id: 'bg-plus2', options: opts, value: asi.plus2, placeholder: 'Choose', disabledValues: asi.plus1 ? [asi.plus1] : [], onChange: (v) => ctx.update((x) => { x.bgAsi.plus2 = v; }) })),
      field('+1 to', select({ id: 'bg-plus1', options: opts, value: asi.plus1, placeholder: 'Choose', disabledValues: asi.plus2 ? [asi.plus2] : [], onChange: (v) => ctx.update((x) => { x.bgAsi.plus1 = v; }) }))));
  } else {
    panel.append(h('p', {}, bg.abilities.map((id) => tag(`${abilityName(id)} +1`, 'good'))));
  }
  return panel;
}
