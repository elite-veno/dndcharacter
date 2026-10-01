// Spells tab: spellcasting stats, slot tracker, cast / attack / damage / healing rolls, spell list manager.

import { h, openModal } from '../ui.js';
import * as R from '../rules.js';
import { SPELL_BY_ID, ABILITIES, FEAT_BY_ID, BACKGROUND_BY_ID } from '../data/index.js';
import { spellCounts, classSpellOptions } from '../choices.js';
import { withModifier } from '../dice.js';
import { spendSlot, upcastDice } from '../sheet-state.js';
import { rollButton, panel, pips, disclosure } from './widgets.js';
import { checkList, counter, spellDetail } from '../steps/shared.js';

const fmt = R.formatMod;
const ABILITY_NAME = Object.fromEntries(ABILITIES.map((a) => [a.id, a.name]));

/** Extra dice added per slot level above the spell's own level (SRD "Using a Higher-Level Spell Slot"). */
const UPCAST = {
  'arms-of-hadar': '1d6', 'burning-hands': '1d6', 'chromatic-orb': '1d8', 'cure-wounds': '2d8', 'dissonant-whispers': '1d6',
  'guiding-bolt': '1d6', 'healing-word': '2d4', 'hellish-rebuke': '1d10', 'inflict-wounds': '1d10', 'ray-of-sickness': '1d8',
  thunderwave: '1d8', 'witch-bolt': '1d12', 'acid-arrow': '1d4', moonbeam: '1d10', shatter: '1d8', 'call-lightning': '1d10',
  fireball: '1d6', 'lightning-bolt': '1d6', 'spirit-guardians': '1d8', 'vampiric-touch': '1d6', 'mass-healing-word': '1d4',
  blight: '1d8', 'ice-storm': '1d8', 'cone-of-cold': '1d8', 'flame-strike': '1d6', 'mass-cure-wounds': '1d8',
  'flaming-sphere': '1d6', 'flame-blade': '1d6', 'spiritual-weapon': '1d8', 'aura-of-vitality': '1d6',
};

/** Healing spells that add the spellcasting ability modifier to the roll. */
const HEAL_ADDS_MOD = new Set(['cure-wounds', 'healing-word', 'mass-cure-wounds', 'mass-healing-word']);

/** Spells that make several attacks / darts. `count(characterLevel, castLevel)` is how many. */
const MULTI = {
  'eldritch-blast': { noun: 'beam', count: (lvl) => R.cantripDice(lvl) },
  'scorching-ray': { noun: 'ray', count: (lvl, cast) => 3 + Math.max(0, cast - 2) },
  'magic-missile': { noun: 'dart', count: (lvl, cast) => 3 + Math.max(0, cast - 1), auto: '1d4+1' },
};

// ---------------------------------------------------------------- spell sources

/** Everything the character can cast: [{ spell, source, ability, kind: 'cantrip'|'prepared'|'feat'|'feat-free' }]. */
export function spellEntries(c, d) {
  const out = [];
  const sc = d.spellcasting;
  if (sc) {
    c.cantrips.forEach((id) => SPELL_BY_ID[id] && out.push({ spell: SPELL_BY_ID[id], source: d.cls.name, ability: sc.ability, kind: 'cantrip' }));
    c.spells.forEach((id) => SPELL_BY_ID[id] && out.push({ spell: SPELL_BY_ID[id], source: d.cls.name, ability: sc.ability, kind: 'prepared' }));
  }
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const featSources = [
    bg && { featId: bg.feat, choices: c.bgFeatChoices },
    c.speciesFeatId && { featId: c.speciesFeatId, choices: c.speciesFeatChoices },
  ].filter(Boolean);
  for (const { featId, choices } of featSources) {
    if (!featId.startsWith('magic-initiate') || !choices?.ability) continue;
    const name = FEAT_BY_ID[featId].name;
    (choices.cantrips || []).forEach((id) => SPELL_BY_ID[id] && out.push({ spell: SPELL_BY_ID[id], source: name, ability: choices.ability, kind: 'cantrip' }));
    if (choices.spell && SPELL_BY_ID[choices.spell]) out.push({ spell: SPELL_BY_ID[choices.spell], source: name, ability: choices.ability, kind: 'feat-free', useKey: `fc:${featId}:${choices.spell}` });
  }
  return out;
}

/** Slot table: [{ level, max, used, pact }]. Pact Magic slots are tracked separately and refresh on a Short Rest. */
function slotTable(d, s) {
  const sc = d.spellcasting;
  if (!sc) return [];
  if (sc.pact) return [{ level: sc.pact.slotLevel, max: sc.pact.count, used: s.pactUsed, pact: true }];
  return sc.slots.map((max, i) => ({ level: i + 1, max, used: s.slotsUsed[i] || 0, pact: false })).filter((row) => row.max > 0);
}

// ---------------------------------------------------------------- slots panel

function slotsPanel(ctx, table) {
  if (!table.length) return null;
  return panel('Spell slots',
    h('ul', { class: 'slot-list' }, table.map((row) => h('li', { class: 'slot-row' },
      h('span', { class: 'slot-level' }, row.pact ? `Pact Magic (level ${row.level})` : `Level ${row.level}`),
      pips({
        total: row.max, filled: row.max - row.used, label: `Level ${row.level} slots`, cls: 'slots',
        onToggle: (i) => ctx.update((x) => {
          const left = row.max - row.used;
          const nextLeft = i < left ? i : i + 1; // click a filled pip to spend, an empty one to restore
          const used = row.max - nextLeft;
          if (row.pact) x.sheet.pactUsed = used; else x.sheet.slotsUsed[row.level - 1] = used;
        }),
      })))),
    h('p', { class: 'hint' }, 'Filled pips are available slots. Click a pip to spend or restore a slot; a Long Rest restores them all.'));
}

// ---------------------------------------------------------------- one spell

function spellCard(ctx, entry, table) {
  const { spell, source, ability, kind } = entry;
  const { c, d, s, view, tray } = ctx;
  const abilityMod = d.mods[ability];
  const atk = d.pb + abilityMod;
  const dc = 8 + d.pb + abilityMod;
  const isCantrip = spell.level === 0;
  const key = `${source}:${spell.id}`;

  // Slot choice (leveled spells only).
  const options = table.filter((row) => row.level >= spell.level && row.max - row.used > 0);
  const chosen = () => {
    const wanted = view.castLevel[key];
    return options.some((r) => r.level === wanted) ? wanted : (options[0]?.level || spell.level);
  };
  const castLevel = isCantrip ? 0 : chosen();
  const freeUsed = entry.useKey ? (s.resUsed[entry.useKey] || 0) > 0 : false;

  const roll = spell.roll;
  const rollKind = roll?.kind || (MULTI[spell.id]?.auto ? 'auto' : null);
  const rollType = roll?.type || (rollKind === 'auto' ? 'force' : null);
  const multi = MULTI[spell.id];
  const count = multi ? multi.count(d.level, castLevel || spell.level) : 1;
  let dice = null;
  if (multi?.auto) dice = `${count}d${multi.auto.match(/d(\d+)/)[1]}+${count}`; // Magic Missile: each dart 1d4 + 1
  else if (roll) {
    if (isCantrip) dice = multi ? roll.dice : R.scaleCantripDice(roll.dice, d.level);
    else dice = multi ? roll.dice : upcastDice(roll.dice, UPCAST[spell.id], spell.level, castLevel);
  }
  let bonus = 0;
  if (rollKind === 'heal' && HEAL_ADDS_MOD.has(spell.id)) bonus = abilityMod;
  if (spell.id === 'regenerate') bonus = 15;
  if (spell.id === 'eldritch-blast' && c.invocations.includes('agonizing-blast')) bonus = abilityMod;
  const expr = dice ? withModifier(dice, bonus) : null;
  const critKey = `spell:${key}`;
  const crit = () => view.lastCrit[critKey] === true;

  const dmgBtn = expr && rollKind !== 'heal' ? rollButton(`Damage ${expr}`, () => {
    tray.rollDamage({ label: `${spell.name} damage${rollType ? ` (${rollType})` : ''}`, expr, crit: crit() });
    view.lastCrit[critKey] = false;
    dmgBtn.classList.remove('crit-ready');
  }, { cls: 'damage', title: 'Roll damage. If your last spell attack was a natural 20 the dice are doubled.' }) : null;

  function cast() {
    if (kind === 'feat-free' && !freeUsed) {
      ctx.update((x) => { x.sheet.resUsed[entry.useKey] = 1; });
      announce(`Cast ${spell.name} (free cast from ${source})`);
      return;
    }
    if (isCantrip) { announce(`Cast ${spell.name}`); return; }
    const row = table.find((r) => r.level === castLevel && r.max - r.used > 0);
    if (!row) { ctx.toast(`No spell slot of level ${spell.level} or higher left.`); return; }
    ctx.update((x) => {
      if (row.pact) x.sheet.pactUsed += 1;
      else { const next = spendSlot(x.sheet, d.spellcasting.slots, row.level); if (next) x.sheet.slotsUsed = next.slotsUsed; }
    });
    announce(`Cast ${spell.name} using a level ${row.level} ${row.pact ? 'Pact Magic ' : ''}slot`);
  }

  function announce(text) {
    if (spell.concentration) {
      ctx.update((x) => { x.sheet.concentration = spell.name; });
      tray.note(text, `Concentrating on ${spell.name}.`);
    } else tray.note(text, spell.summary);
  }

  const rollControls = [];
  if (roll?.kind === 'attack') {
    rollControls.push(rollButton(`Attack ${fmt(atk)}`, (e) => {
      const res = ctx.d20({ label: `${spell.name} spell attack`, bonus: atk, e, attack: true });
      view.lastCrit[critKey] = !!res.crit;
      dmgBtn?.classList.toggle('crit-ready', !!res.crit);
    }, { cls: 'attack' }));
  }
  if (roll?.kind === 'save') rollControls.push(h('span', { class: 'tag', title: 'Targets make this saving throw' }, `DC ${dc} ${roll.save.toUpperCase()} save`));
  if (dmgBtn) rollControls.push(dmgBtn);
  if (rollKind === 'heal') {
    rollControls.push(rollButton(`Heal ${expr}`, () => { tray.rollExpr(`${spell.name} healing`, expr, { kind: 'heal' }); }, { cls: 'heal' }));
    rollControls.push(rollButton('Heal myself', () => { const res = tray.rollExpr(`${spell.name} healing`, expr, { kind: 'heal' }); ctx.heal(res.total, spell.name); }, { cls: 'heal small' }));
  }

  const castControls = [];
  const freeReady = kind === 'feat-free' && !freeUsed;
  if (!isCantrip && !freeReady && options.length) {
    const id = `cast-${spell.id}-${source.replace(/\W/g, '')}`;
    castControls.push(h('label', { class: 'visually-hidden', for: id }, `Slot level for ${spell.name}`));
    castControls.push(h('select', {
      id, class: 'slot-select', onchange: (e) => { view.castLevel[key] = Number(e.target.value); ctx.rerender(); },
    }, options.map((r) => h('option', { value: r.level, selected: r.level === castLevel }, `Level ${r.level}${r.pact ? ' (pact)' : ''}`))));
  }
  const canCast = isCantrip || freeReady || options.length > 0;
  castControls.push(h('button', {
    type: 'button', class: 'btn small', disabled: !canCast, onclick: cast,
    title: freeReady ? 'Free cast once per Long Rest' : isCantrip ? 'Cast the cantrip' : canCast ? 'Cast the spell and spend a slot' : 'No spell slots left',
  }, freeReady ? 'Cast (free)' : isCantrip ? 'Cast' : canCast ? 'Cast' : 'No slots'));

  const tags = [
    h('span', { class: 'tag' }, isCantrip ? 'Cantrip' : `Level ${spell.level}`),
    spell.concentration ? h('span', { class: 'tag sub', title: 'Requires Concentration' }, 'Concentration') : null,
    spell.ritual ? h('span', { class: 'tag sub' }, 'Ritual') : null,
    h('span', { class: 'tag' }, source),
    kind === 'feat-free' ? h('span', { class: freeUsed ? 'tag bad' : 'tag good' }, freeUsed ? 'Free cast used' : 'Free cast ready') : null,
  ];
  const multiNote = multi ? `${count} ${multi.noun}${count > 1 ? 's' : ''}: ${multi.auto ? 'all darts hit automatically; the roll adds them together.' : 'roll an attack and damage for each.'}` : null;

  return h('li', { class: 'spell-card' },
    h('div', { class: 'spell-head' },
      h('h3', {}, spell.name),
      h('div', { class: 'tag-row' }, tags)),
    h('div', { class: 'spell-actions' }, rollControls, h('span', { class: 'btn-pair' }, castControls)),
    multiNote ? h('p', { class: 'hint' }, multiNote) : null,
    disclosure(`${spellDetail(spell)}`, h('p', {}, spell.summary), h('p', { class: 'hint' }, `Duration: ${spell.duration} · ${spell.school}`)));
}

// ---------------------------------------------------------------- manage spells

function spellManager(ctx) {
  const { c } = ctx;
  const counts = spellCounts(c);
  if (!counts) return;
  const opts = classSpellOptions(c.classId, counts.maxSpellLevel);
  const draft = { cantrips: c.cantrips.slice(), spellbook: c.spellbook.slice(), spells: c.spells.slice() };
  const body = h('div', {});
  const toOptions = (list) => list.map((sp) => ({ id: sp.id, label: sp.name, detail: spellDetail(sp) }));

  const draw = () => {
    body.replaceChildren(
      h('p', { class: 'hint' }, 'Spells are limited by your class and level. Change them after a Long Rest.'),
      counts.cantrips ? h('div', {}, counter(draft.cantrips.length, counts.cantrips, 'cantrips chosen'),
        checkList({ options: toOptions(opts.cantrips), selected: draft.cantrips, max: counts.cantrips, legend: 'Cantrips', idPrefix: 'mg-can', onChange: (n) => { draft.cantrips = n; draw(); } })) : null,
      counts.spellbook ? h('div', {}, counter(draft.spellbook.length, counts.spellbook, 'spellbook spells'),
        checkList({
          options: toOptions(opts.leveled), selected: draft.spellbook, max: counts.spellbook, legend: 'Spellbook', idPrefix: 'mg-book',
          onChange: (n) => { draft.spellbook = n; draft.spells = draft.spells.filter((id) => n.includes(id)); draw(); },
        })) : null,
      h('div', {}, counter(draft.spells.length, counts.prepared, 'spells prepared'),
        checkList({
          options: toOptions(counts.spellbook ? opts.leveled.filter((sp) => draft.spellbook.includes(sp.id)) : opts.leveled),
          selected: draft.spells, max: counts.prepared, legend: 'Prepared spells', idPrefix: 'mg-prep', onChange: (n) => { draft.spells = n; draw(); },
        })),
      h('div', { class: 'row end' },
        h('button', { type: 'button', class: 'btn', onclick: () => modal.close() }, 'Cancel'),
        h('button', {
          type: 'button', class: 'btn primary',
          onclick: () => { ctx.update((x) => { x.cantrips = draft.cantrips; x.spellbook = draft.spellbook; x.spells = draft.spells; }); modal.close(); },
        }, 'Save spells')));
  };
  const modal = openModal('Manage spells', body, { wide: true });
  draw();
}

// ---------------------------------------------------------------- tab

export function spellsTab(ctx) {
  const { c, d, s } = ctx;
  const sc = d.spellcasting;
  const entries = spellEntries(c, d);
  if (!sc && !entries.length) {
    return h('div', { class: 'tab-body' }, panel('Spellcasting', h('p', { class: 'empty' }, `${d.cls ? d.cls.name : 'This character'} does not cast spells at this level.`)));
  }
  const table = slotTable(d, s);
  const counts = spellCounts(c);

  const stat = (label, value, sub) => h('div', { class: 'stat' }, h('span', { class: 'stat-label' }, label), h('span', { class: 'stat-value' }, value), sub ? h('span', { class: 'stat-sub' }, sub) : null);
  const header = sc ? panel('Spellcasting',
    h('div', { class: 'stat-grid four' },
      stat('Ability', sc.ability.toUpperCase(), ABILITY_NAME[sc.ability]),
      stat('Spell save DC', sc.saveDC, `8 + ${d.pb} + ${fmt(d.mods[sc.ability])}`),
      h('div', { class: 'stat' }, h('span', { class: 'stat-label' }, 'Spell attack'),
        rollButton(fmt(sc.attackBonus), (e) => ctx.d20({ label: 'Spell attack', bonus: sc.attackBonus, e, attack: true }), { cls: 'big', label: `Roll spell attack ${fmt(sc.attackBonus)}` })),
      stat('Prepared', `${c.spells.length} / ${counts.prepared}`, `${c.cantrips.length} / ${counts.cantrips} cantrips`)),
    h('div', { class: 'row gap' },
      h('button', { type: 'button', class: 'btn small', onclick: () => spellManager(ctx) }, 'Manage spells'),
      s.concentration ? h('span', { class: 'tag sub' }, `Concentrating: ${s.concentration}`) : null,
      s.concentration ? h('button', { type: 'button', class: 'btn small', onclick: () => ctx.update((x) => { x.sheet.concentration = null; }) }, 'End concentration') : null),
    counts && (c.cantrips.length < counts.cantrips || c.spells.length < counts.prepared)
      ? h('p', { class: 'notice' }, 'You can know or prepare more spells at this level. Open "Manage spells" to choose them.') : null,
    c.spells.length > counts.prepared || c.cantrips.length > counts.cantrips ? h('p', { class: 'notice warn' }, 'You have more spells than your level allows. Open "Manage spells" to trim the list.') : null) : null;

  const groups = new Map();
  entries.forEach((e) => { const k = e.spell.level; groups.set(k, [...(groups.get(k) || []), e]); });
  const levels = [...groups.keys()].sort((a, b) => a - b);

  const spellbookOnly = c.spellbook.filter((id) => !c.spells.includes(id)).map((id) => SPELL_BY_ID[id]).filter(Boolean);

  return h('div', { class: 'tab-body' },
    header,
    slotsPanel(ctx, table),
    ...levels.map((lvl) => panel(lvl === 0 ? 'Cantrips' : `Level ${lvl} spells`,
      h('ul', { class: 'spell-list' }, groups.get(lvl).map((e) => spellCard(ctx, e, table))))),
    spellbookOnly.length ? panel('Spellbook (not prepared)', h('p', { class: 'hint' }, 'You can swap prepared spells after a Long Rest.'), h('p', {}, spellbookOnly.map((sp) => sp.name).join(', '))) : null,
    h('p', { class: 'hint' }, 'Cast spends a slot at the chosen level. Damage and healing dice grow when you cast at a higher level. Cantrip dice grow at character levels 5, 11 and 17.'));
}
