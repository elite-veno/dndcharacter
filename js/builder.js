// The character builder wizard: stepper, step panels, live summary sidebar, validation and finishing.
// Order follows the 2024 Player's Handbook: Preferences, Class, Background, Species, Ability Scores, Equipment, Details.

import { h, mount, toast, openModal } from './ui.js';
import { newCharacter, deriveCharacter, validateAll, validateStep, spellName } from './character.js';
import { loadDraft, saveDraft, clearDraft, saveCharacter } from './store.js';
import { formatMod, abilityMod } from './rules.js';
import { ABILITIES } from './data/index.js';
import preferences from './steps/preferences.js';
import classStep from './steps/class.js';
import background from './steps/background.js';
import species from './steps/species.js';
import abilities from './steps/abilities.js';
import equipment from './steps/equipment.js';
import details from './steps/details.js';

const STEPS = [preferences, classStep, background, species, abilities, equipment, details];

/**
 * Mount the builder into `root`.
 * @param {HTMLElement} root
 * @param {{ onFinish: (character: object) => void }} options
 */
export function renderBuilder(root, { onFinish }) {
  const draft = loadDraft();
  const state = { c: draft ? draft.character : newCharacter(), step: draft ? Math.min(draft.step, STEPS.length - 1) : 0, visited: new Set([0]) };
  if (draft) STEPS.forEach((_, i) => { if (i <= state.step) state.visited.add(i); });
  let saveTimer = null;

  const stepper = h('nav', { class: 'stepper', 'aria-label': 'Character creation steps' });
  const host = h('div', { class: 'step-host', id: 'step-host', tabindex: -1 });
  const summary = h('aside', { class: 'summary', 'aria-label': 'Character summary' });
  const nav = h('div', { class: 'builder-nav' });
  mount(root, h('div', { class: 'builder' }, stepper, h('div', { class: 'builder-grid' }, host, summary), nav));

  const persist = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveDraft(state.c, state.step), 150);
  };

  const ctx = {
    get c() { return state.c; },
    update(fn, { rerender = true } = {}) {
      fn(state.c);
      persist();
      renderStepper();
      renderSummary();
      renderNav();
      if (rerender) drawStep();
    },
    rerender: () => drawStep(),
  };

  function drawStep() {
    const active = document.activeElement;
    const focusId = active && host.contains(active) ? active.id : null;
    const scroll = window.scrollY;
    const panel = STEPS[state.step].render(ctx);
    mount(host, panel);
    window.scrollTo({ top: scroll });
    if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
  }

  function goTo(index, { focus = true } = {}) {
    state.step = Math.max(0, Math.min(STEPS.length - 1, index));
    state.visited.add(state.step);
    persist();
    renderStepper();
    renderNav();
    drawStep();
    if (focus) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      host.querySelector('h2')?.setAttribute('tabindex', '-1');
      host.querySelector('h2')?.focus({ preventScroll: true });
    }
  }

  function renderStepper() {
    mount(stepper, h('ol', {}, STEPS.map((s, i) => {
      const errors = validateStep(state.c, s.id);
      const status = errors.length === 0 ? 'done' : state.visited.has(i) && i !== state.step ? 'todo' : '';
      return h('li', { class: `step ${status}${i === state.step ? ' current' : ''}` },
        h('button', { type: 'button', 'aria-current': i === state.step ? 'step' : null, onclick: () => goTo(i), title: s.blurb },
          h('span', { class: 'step-num', 'aria-hidden': 'true' }, status === 'done' ? '✓' : status === 'todo' ? '!' : i + 1),
          h('span', { class: 'step-label' }, s.title),
          h('span', { class: 'visually-hidden' }, status === 'done' ? ' (complete)' : status === 'todo' ? ' (needs attention)' : '')));
    })));
  }

  function renderNav() {
    const last = state.step === STEPS.length - 1;
    const errors = validateStep(state.c, STEPS[state.step].id);
    mount(nav,
      h('button', { type: 'button', class: 'btn', disabled: state.step === 0, onclick: () => goTo(state.step - 1) }, '← Back'),
      errors.length ? h('p', { class: 'nav-hint', role: 'status' }, errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} more)` : '')) : h('p', { class: 'nav-hint ok', role: 'status' }, 'This step is complete.'),
      last
        ? h('button', { type: 'button', class: 'btn cta', id: 'finish-btn', onclick: finish }, 'Finish & Open Sheet')
        : h('button', { type: 'button', class: 'btn primary', onclick: () => goTo(state.step + 1) }, 'Next →'));
  }

  function finish() {
    const all = validateAll(state.c);
    const problems = STEPS.map((s, i) => ({ s, i, errors: all[s.id] })).filter((p) => p.errors.length);
    if (problems.length) {
      const list = h('div', {},
        h('p', {}, 'Complete these choices before finishing your character:'),
        problems.map(({ s, i, errors }) => h('div', { class: 'problem' },
          h('h3', {}, s.title),
          h('ul', { class: 'bullets' }, errors.map((e) => h('li', {}, e))),
          h('button', { type: 'button', class: 'btn small', onclick: () => { modal.close(); goTo(i); } }, `Go to ${s.title}`))));
      const modal = openModal('Character is incomplete', list);
      return;
    }
    const saved = saveCharacter({ ...state.c, id: state.c.id });
    if (!saved) { toast('Could not save: browser storage is full or unavailable.'); return; }
    clearTimeout(saveTimer);
    clearDraft();
    toast(`${saved.name} was saved.`);
    onFinish(saved);
  }

  function renderSummary() {
    mount(summary, summaryView(state.c));
  }

  renderStepper();
  renderSummary();
  renderNav();
  drawStep();
  return { goTo };
}

// ---------------------------------------------------------------- summary sidebar

function stat(label, value, sub = null) {
  return h('div', { class: 'stat' }, h('span', { class: 'stat-label' }, label), h('span', { class: 'stat-value' }, value), sub ? h('span', { class: 'stat-sub' }, sub) : null);
}

/** Live character summary built from deriveCharacter (AC/HP/etc). Also reused for the sheet stub. */
export function summaryView(c) {
  const d = deriveCharacter(c);
  const subtitle = [d.species?.name, d.cls?.name, d.bg ? `(${d.bg.name})` : null].filter(Boolean).join(' ');
  const proficientSkills = d.skills.filter((s) => s.proficiency);
  const sc = d.spellcasting;
  return h('div', { class: 'summary-inner' },
    h('div', { class: 'summary-head' },
      h('div', { class: 'portrait-mini' }, c.portrait ? h('img', { src: c.portrait, alt: '' }) : h('span', { 'aria-hidden': 'true' }, '⚔')),
      h('div', {}, h('h2', {}, c.name.trim() || 'Unnamed hero'), h('p', {}, `Level ${d.level}${subtitle ? ` ${subtitle}` : ''}`))),
    h('div', { class: 'stat-grid' },
      stat('Armor Class', d.ac.ac, d.ac.formula),
      stat('Hit Points', d.hp, d.cls ? `d${d.hitDie} Hit Die` : null),
      stat('Speed', `${d.speed} ft`),
      stat('Initiative', formatMod(d.initiative)),
      stat('Proficiency', formatMod(d.pb)),
      stat('Passive Perception', d.passivePerception)),
    h('div', { class: 'ability-grid', role: 'list', 'aria-label': 'Ability scores' }, ABILITIES.map((a) => h('div', { class: 'ability', role: 'listitem' },
      h('span', { class: 'ability-abbr' }, a.abbr), h('span', { class: 'ability-score' }, d.scores[a.id]), h('span', { class: 'ability-mod' }, formatMod(abilityMod(d.scores[a.id])))))),
    d.cls ? h('p', { class: 'sum-line' }, h('strong', {}, 'Saves: '), d.saves.filter((s) => s.proficient).map((s) => `${s.ability.toUpperCase()} ${formatMod(s.bonus)}`).join(', ')) : null,
    proficientSkills.length ? h('p', { class: 'sum-line' }, h('strong', {}, 'Skills: '), proficientSkills.map((s) => `${s.name} ${formatMod(s.bonus)}${s.proficiency === 2 ? '*' : ''}`).join(', ')) : null,
    d.feats.length ? h('p', { class: 'sum-line' }, h('strong', {}, 'Feats: '), d.feats.map((f) => f.name).join(', ')) : null,
    d.tools.length ? h('p', { class: 'sum-line' }, h('strong', {}, 'Tools: '), d.tools.join(', ')) : null,
    c.languages.length ? h('p', { class: 'sum-line' }, h('strong', {}, 'Languages: '), d.languages.join(', ')) : null,
    d.resistances.length ? h('p', { class: 'sum-line' }, h('strong', {}, 'Resistances: '), d.resistances.join(', ')) : null,
    sc ? h('p', { class: 'sum-line' }, h('strong', {}, 'Spellcasting: '), `${sc.ability.toUpperCase()}, save DC ${sc.saveDC}, attack ${formatMod(sc.attackBonus)}`, c.cantrips.length || c.spells.length ? ` · ${[...c.cantrips, ...c.spells].map(spellName).join(', ')}` : '') : null,
    c.equipment.added ? h('p', { class: 'sum-line' }, h('strong', {}, 'Gold: '), `${d.gold} gp`) : null,
    h('p', { class: 'hint' }, 'Values update as you choose. Armor, AC and HP use the 2024 rules.'));
}
