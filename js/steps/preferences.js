// Step 1: character preferences (name, level, allowed sources).

import { h } from '../ui.js';
import { field, select, sectionTitle, notice, nextId } from './shared.js';
import { proficiencyBonus, MAX_LEVEL } from '../rules.js';
import { XP_THRESHOLDS } from '../data/index.js';
import { levelSlots, expertiseSlots, spellCounts, FIGHTING_STYLE_LEVEL } from '../choices.js';

const FIRST = ['Ael', 'Bran', 'Cora', 'Dar', 'Eli', 'Fen', 'Gund', 'Hale', 'Isol', 'Jor', 'Kell', 'Lyra', 'Mir', 'Nor', 'Orin', 'Pell', 'Quin', 'Rhea', 'Sera', 'Thane', 'Ulf', 'Vesper', 'Wren', 'Yara', 'Zeph'];
const LAST = ['ashford', 'brightwater', 'coldmere', 'dawnstrider', 'embervale', 'frostbane', 'greywind', 'hollowtree', 'ironhand', 'junipers', 'kestrel', 'lightfoot', 'moonwhisper', 'nightbloom', 'oakenshield', 'proudmoor', 'quickblade', 'ravenscar', 'stormborn', 'thornwood'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const randomName = () => `${pick(FIRST)} ${pick(LAST).replace(/^./, (m) => m.toUpperCase())}`;

export default {
  id: 'preferences',
  title: 'Preferences',
  blurb: 'Name your hero and choose a starting level.',
  render(ctx) {
    const { c } = ctx;
    const nameId = nextId('name');
    const nameInput = h('input', {
      id: nameId, type: 'text', maxLength: 60, value: c.name, autocomplete: 'off', placeholder: 'e.g. Aelindra Brightwater',
      oninput: (e) => ctx.update((x) => { x.name = e.target.value; }, { rerender: false }),
    });
    const levelOptions = Array.from({ length: MAX_LEVEL }, (_, i) => ({ value: String(i + 1), label: `Level ${i + 1}` }));
    const levelSelect = select({
      id: nextId('level'), options: levelOptions, value: String(c.level),
      onChange: (v) => ctx.update((x) => {
        x.level = Number(v);
        x.levelAsi = x.levelAsi.slice(0, levelSlots(x.classId, x.level).length);
        // Prune picks that no longer fit the lower level.
        x.expertise = x.expertise.slice(0, expertiseSlots(x.classId, x.level).count);
        if (x.level < (FIGHTING_STYLE_LEVEL[x.classId] || 0)) x.fightingStyle = null;
        const counts = spellCounts(x);
        if (counts) {
          x.cantrips = x.cantrips.slice(0, counts.cantrips);
          if (counts.spellbook) x.spellbook = x.spellbook.slice(0, counts.spellbook);
          x.spells = x.spells.slice(0, counts.prepared);
          if (counts.spellbook) x.spells = x.spells.filter((id) => x.spellbook.includes(id));
        }
      }),
    });
    return h('section', { class: 'step-panel' },
      h('h2', {}, 'Character Preferences'),
      h('p', { class: 'lead' }, 'Start with the basics. You can change these at any time; later steps adapt to your level.'),
      h('div', { class: 'form-grid' },
        field('Character name', h('div', { class: 'input-row' }, nameInput,
          h('button', { type: 'button', class: 'btn', onclick: () => { const n = randomName(); nameInput.value = n; ctx.update((x) => { x.name = n; }, { rerender: false }); nameInput.focus(); } }, 'Random name')),
        'A name is required to finish.', nameId),
        field('Starting level', levelSelect,
          `Proficiency Bonus +${proficiencyBonus(c.level)}. Level ${c.level} needs ${XP_THRESHOLDS[c.level - 1].toLocaleString('en-US')} XP; higher levels unlock subclasses, spells, feats and more choices.`)),
      sectionTitle('Allowed sources'),
      notice('Character Forge uses only the System Reference Document 5.2 (SRD 5.2, CC-BY-4.0): 12 classes, the SRD species, backgrounds, feats, spells and equipment of the 2024 rules. Subclasses are the 2014 Player\'s Handbook subclasses (paraphrased), chosen at level 3.'),
      h('ul', { class: 'bullets' },
        h('li', {}, 'Ability scores come from your Background (+2/+1 or +1/+1/+1), not your species.'),
        h('li', {}, 'Every Background grants an Origin feat, two skills and a tool proficiency.'),
        h('li', {}, 'Weapon Mastery is available to Barbarian, Fighter, Paladin, Ranger and Rogue.')));
  },
};
