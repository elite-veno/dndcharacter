// Progression tab: the level 1-20 table of the class, how key numbers scale with level, and the subclass (locked preview,
// call to choose, or the unlocked timeline). All data comes from js/progression.js, which reuses rules.js.

import { h } from '../ui.js';
import { SUBCLASS_LEVEL } from '../data/index.js';
import { progressionTable, progressionColumns, scalingItems, subclassLabel, subclassOptions, subclassTimeline } from '../progression.js';
import { subclassPicker, subclassChoiceField, setSubclass } from './features.js';
import { subclassOtherProficiencies } from '../choices.js';
import { panel } from './widgets.js';

const SLOT_NAMES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
const num = (n) => (n ? n : '—');

function featureChip(f) {
  return h('li', { class: `prog-feature ${f.kind}` }, f.name);
}

function levelTable(ctx) {
  const { c, d } = ctx;
  const rows = progressionTable(c.classId, { subclassId: c.subclassId, level: d.level });
  const cols = progressionColumns(c.classId);
  const slotHeads = cols.slotType === 'pact' ? ['Pact slots', 'Slot level'] : cols.slotType ? SLOT_NAMES.slice(0, cols.maxSlot) : [];
  const head = ['Level', 'Prof.', 'Features', 'ASI / feat', cols.cantrips && 'Cantrips', cols.prepared && 'Prepared', ...slotHeads, 'Hit Dice'].filter(Boolean);
  const cell = (r) => [
    h('th', { scope: 'row', class: 'prog-level' }, r.level, r.state === 'current' ? h('span', { class: 'prog-here' }, 'you') : null),
    h('td', {}, `+${r.pb}`),
    h('td', { class: 'prog-features' }, r.features.length ? h('ul', {}, r.features.map(featureChip)) : '—'),
    h('td', {}, r.asi === 'boon' ? 'Epic Boon' : r.asi ? 'Yes' : '—'),
    cols.cantrips ? h('td', {}, num(r.cantrips)) : null,
    cols.prepared ? h('td', {}, num(r.prepared)) : null,
    cols.slotType === 'pact' ? [h('td', {}, r.pact.count), h('td', {}, SLOT_NAMES[r.pact.slotLevel - 1])]
      : cols.slotType ? r.slots.slice(0, cols.maxSlot).map((n) => h('td', {}, num(n))) : null,
    h('td', {}, `${r.hitDice}d${d.hitDie}`),
  ];
  return panel('Level by level',
    h('p', { class: 'hint' }, `${d.cls.name} levels 1 to 20. Your current level is highlighted; levels you have not reached yet are dimmed.${cols.cantrips || cols.prepared ? ' Spell counts are the class table values (a species or feature may add more).' : ''}`),
    h('div', { class: 'prog-scroll', tabindex: '0', role: 'region', 'aria-label': `${d.cls.name} level table` },
      h('table', { class: 'prog-table' },
        h('thead', {}, h('tr', {}, head.map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, rows.map((r) => h('tr', { class: `prog-row ${r.state}`, 'aria-current': r.state === 'current' ? 'true' : null }, cell(r)))))));
}

function scalingPanel(ctx) {
  const { c, d } = ctx;
  const items = scalingItems(c.classId, { level: d.level, subclassId: c.subclassId, scores: d.scores });
  return panel('How things scale',
    h('p', { class: 'hint' }, 'These numbers are worked out from the same class tables the sheet uses. Each chip is the level where the value changes; the highlighted one is yours now.'),
    h('ul', { class: 'scale-list' }, items.map((it) => h('li', { class: 'scale-item' },
      h('div', { class: 'scale-head' }, h('span', { class: 'scale-label' }, it.label), h('strong', { class: 'scale-now' }, it.current)),
      h('ol', { class: 'scale-steps' }, it.steps.map((s, i) => {
        const next = it.steps[i + 1];
        const state = s.level > d.level ? 'future' : (!next || next.level > d.level) ? 'current' : 'past';
        return h('li', { class: `scale-step ${state}`, 'aria-current': state === 'current' ? 'step' : null }, h('small', {}, `Level ${s.level}`), h('b', {}, s.value));
      })),
      it.note ? h('p', { class: 'hint' }, it.note) : null))));
}

function optionCard(opt, action) {
  return h('li', { class: 'sub-card' },
    h('h4', {}, opt.name),
    h('p', {}, opt.summary),
    h('p', { class: 'hint' }, h('strong', {}, 'Grants: '), opt.features.map((f) => `${f.name} (level ${f.level})`).join(', ')),
    opt.spells.length ? h('p', { class: 'hint' }, h('strong', {}, 'Spells: '), opt.spells.join(', ')) : null,
    opt.proficiencies.length ? h('p', { class: 'hint' }, h('strong', {}, 'Proficiencies: '), opt.proficiencies.join(', ')) : null,
    action || null);
}

function subclassPanel(ctx) {
  const { c, d } = ctx;
  const label = subclassLabel(c.classId);
  const sub = d.subclass;
  if (d.level < SUBCLASS_LEVEL) {
    return h('section', { class: 'sheet-panel sub-locked' },
      h('h2', { class: 'panel-title' }, h('span', { 'aria-hidden': 'true' }, '🔒 '), `Choose your ${label} at level ${SUBCLASS_LEVEL}`),
      h('p', {}, `At level ${SUBCLASS_LEVEL} you pick one ${label} that shapes the rest of your career. You are level ${d.level}, so this is a preview of every option and what it grants (read-only).`),
      h('ul', { class: 'sub-grid' }, subclassOptions(c.classId).map((o) => optionCard(o))));
  }
  if (!sub) {
    return h('section', { class: 'sheet-panel sub-cta' },
      h('h2', { class: 'panel-title' }, `Choose your ${label}`),
      h('p', { class: 'notice warn' }, `You have reached level ${SUBCLASS_LEVEL} but have not chosen a ${label} yet. Pick one to gain its features.`),
      h('ul', { class: 'sub-grid' }, subclassOptions(c.classId).map((o) => optionCard(o,
        h('button', { type: 'button', class: 'btn primary small', onclick: () => setSubclass(ctx, o.id) }, `Choose ${o.name}`)))));
  }
  const timeline = subclassTimeline(sub, d.level);
  const spells = d.subclassSpells || [];
  const other = subclassOtherProficiencies(c);
  return panel(`${label}: ${sub.name}`,
    h('p', {}, sub.summary),
    h('ol', { class: 'sub-timeline' }, timeline.map((f) => h('li', { class: `sub-step ${f.unlocked ? 'unlocked' : 'locked'}` },
      h('span', { class: 'sub-level' }, `Level ${f.level}`),
      h('div', {}, h('strong', {}, f.name), h('span', { class: 'tag' }, f.unlocked ? 'Unlocked' : `Unlocks at level ${f.level}`), h('p', {}, f.desc))))),
    spells.length ? h('p', {}, h('strong', {}, 'Granted spells: '), spells.map((g) => g.name).join(', ')) : null,
    other.length ? h('p', {}, h('strong', {}, 'Other proficiencies: '), other.join('; ')) : null,
    h('div', { class: 'sub-change' }, h('h3', { class: 'section-title' }, `Change ${label}`), subclassPicker(ctx, 'prog-subclass'), subclassChoiceField(ctx),
      h('p', { class: 'hint' }, 'Switching changes your features, granted spells and proficiencies immediately.')));
}

export function progressionTab(ctx) {
  return h('div', { class: 'tab-body prog-tab' }, subclassPanel(ctx), levelTable(ctx), scalingPanel(ctx));
}
