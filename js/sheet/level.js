// Level up / level down: HP and Hit Dice adjustment, Ability Score Improvement / feat choices and spell trimming.

import { h, openModal, confirmDialog } from '../ui.js';
import { ABILITIES, FEAT_BY_ID, featsByCategory } from '../data/index.js';
import * as R from '../rules.js';
import { levelSlots, featAbilityOptions, spellCounts } from '../choices.js';
import { deriveCharacter, featList } from '../character.js';
import { adjustForLevelChange } from '../sheet-state.js';
import { field, select } from '../steps/shared.js';

/** ASI / Epic Boon slots earned but not yet chosen: [{ index, slot }]. */
export function pendingAsi(c, level) {
  return levelSlots(c.classId, level).map((slot, index) => ({ slot, index })).filter(({ index }) => !c.levelAsi[index]);
}

/** Level up or down by `delta` (+1 / -1). Resolves once any prompt has finished. */
export async function changeLevel(ctx, delta) {
  const { c, d } = ctx;
  const next = Math.min(R.MAX_LEVEL, Math.max(1, d.level + delta));
  if (next === d.level) return;
  if (delta < 0) {
    const ok = await confirmDialog('Lower level', `Go down to level ${next}? You lose the features, spell slots and improvements of level ${d.level}. You can level up again at any time.`, 'Lower level');
    if (!ok) return;
  }
  const oldMax = d.hp;
  ctx.update((x) => {
    x.level = next;
    x.levelAsi = x.levelAsi.slice(0, levelSlots(x.classId, next).length);
    const counts = spellCounts(x);
    if (counts) {
      x.cantrips = x.cantrips.slice(0, counts.cantrips);
      if (counts.spellbook) x.spellbook = x.spellbook.slice(0, counts.spellbook);
      x.spells = x.spells.slice(0, counts.prepared);
    }
    x.masteries = x.masteries.slice(0, R.weaponMasteryCount(x.classId, next));
    const newMax = deriveCharacter(x).hp;
    x.sheet = adjustForLevelChange(x.sheet, { oldMax, newMax, newLevel: next });
  });
  if (delta > 0) {
    const gained = R.featuresAtLevel(c.classId, next).filter((f) => f.level === next).map((f) => f.name);
    ctx.toast(`Level ${next}!${gained.length ? ` New: ${gained.join(', ')}.` : ''}`);
    if (pendingAsi(c, next).length) openAsiModal(ctx);
  }
}

/** Dialog to choose an Ability Score Improvement or a feat for the first pending slot. */
export function openAsiModal(ctx) {
  const { c } = ctx;
  const pending = pendingAsi(c, c.level);
  if (!pending.length) return;
  const { slot, index } = pending[0];
  const boon = slot.kind === 'boon';
  const state = { type: boon ? 'feat' : 'asi', mode: 'plus2', a: 'str', b: 'dex', featId: null, ability: null };
  const body = h('div', {});
  const owned = new Set(featList(c).map((f) => f.id));
  const feats = featsByCategory(boon ? 'epic-boon' : 'general').filter((f) => f.repeatable || !owned.has(f.id));
  const abilityOptions = ABILITIES.map((a) => ({ value: a.id, label: `${a.name} (${a.abbr})` }));

  const draw = () => {
    const featSpec = state.featId ? featAbilityOptions(state.featId, c.classId) : [];
    body.replaceChildren(
      h('p', {}, `Level ${slot.level}: ${boon ? 'choose an Epic Boon feat.' : 'increase your ability scores or take a feat.'}`),
      boon ? null : h('div', { class: 'row gap', role: 'radiogroup', 'aria-label': 'Improvement type' },
        ['asi', 'feat'].map((t) => h('label', { class: 'inline-check' },
          h('input', { type: 'radio', name: 'asi-type', checked: state.type === t, onchange: () => { state.type = t; draw(); } }),
          t === 'asi' ? 'Ability Score Improvement' : 'Feat'))),
      state.type === 'asi'
        ? h('div', {},
          field('Increase', select({
            id: 'asi-mode', value: state.mode, options: [{ value: 'plus2', label: '+2 to one ability' }, { value: 'plus1plus1', label: '+1 to two abilities' }],
            onChange: (v) => { state.mode = v; draw(); },
          })),
          field(state.mode === 'plus2' ? 'Ability' : 'First ability', select({ id: 'asi-a', value: state.a, options: abilityOptions, onChange: (v) => { state.a = v; } })),
          state.mode === 'plus1plus1' ? field('Second ability', select({ id: 'asi-b', value: state.b, options: abilityOptions, onChange: (v) => { state.b = v; } })) : null,
          h('p', { class: 'hint' }, 'Scores cannot go above 20.'))
        : h('div', {},
          field('Feat', select({
            id: 'asi-feat', value: state.featId, placeholder: 'Choose a feat', options: feats.map((f) => ({ value: f.id, label: f.prerequisite ? `${f.name} (${f.prerequisite})` : f.name })),
            onChange: (v) => { state.featId = v; state.ability = featAbilityOptions(v, c.classId)[0] || null; draw(); },
          })),
          state.featId ? h('p', { class: 'hint' }, FEAT_BY_ID[state.featId].desc) : null,
          featSpec.length ? field('Ability increase (+1)', select({
            id: 'asi-feat-ability', value: state.ability, options: featSpec.map((id) => ({ value: id, label: ABILITIES.find((a) => a.id === id).name })), onChange: (v) => { state.ability = v; },
          })) : null),
      h('div', { class: 'row end' },
        h('button', { type: 'button', class: 'btn', onclick: () => modal.close() }, 'Decide later'),
        h('button', {
          type: 'button', class: 'btn primary',
          disabled: state.type === 'feat' && !state.featId || (state.type === 'asi' && state.mode === 'plus1plus1' && state.a === state.b),
          onclick: () => {
            const pick = state.type === 'asi'
              ? (state.mode === 'plus2' ? { type: 'asi', mode: 'plus2', a: state.a } : { type: 'asi', mode: 'plus1plus1', a: state.a, b: state.b })
              : { type: 'feat', featId: state.featId, ability: state.ability };
            ctx.update((x) => { x.levelAsi[index] = pick; });
            modal.close();
            ctx.toast('Improvement saved.');
            if (pendingAsi(c, c.level).length) openAsiModal(ctx);
          },
        }, 'Save')));
  };
  const modal = openModal(boon ? 'Epic Boon' : 'Ability Score Improvement', body);
  draw();
}

