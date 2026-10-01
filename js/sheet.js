// Interactive character sheet. renderSheet() builds the whole view from a saved character; every change mutates the
// character, autosaves to localStorage and re-renders. The dice tray lives outside the re-rendered area so rolls,
// the result animation and the log survive every update. Panels live in js/sheet/*.js.

import { h, mount, toast, openModal, confirmDialog } from './ui.js';
import { deriveCharacter } from './character.js';
import { saveCharacter, setLastSheet } from './store.js';
import { exportCharacter } from './transfer.js';
import * as R from './rules.js';
import { ABILITIES, CONDITIONS, ARMOR_BY_ID } from './data/index.js';
import { withModifier, combineModes } from './dice.js';
import { createDiceTray } from './dicetray.js';
import {
  normalizeSheet, currentHp, applyDamage, applyHealing, grantTempHp, applyDeathSave, resetDeathSaves, hitDiceLeft,
  spendHitDie, shortRest, longRest, d20Penalty, concentrationDC,
} from './sheet-state.js';
import { rollButton, panel, pips, profDot } from './sheet/widgets.js';
import { actionsTab, resourcesFor } from './sheet/combat.js';
import { spellsTab, spellEntries } from './sheet/spells.js';
import { inventoryTab } from './sheet/inventory.js';
import { featuresTab, notesTab } from './sheet/features.js';
import { changeLevel, openAsiModal, pendingAsi } from './sheet/level.js';
import { openAppearancePanel, portraitSrc } from './sheet/appearance.js';

const fmt = R.formatMod;
const DISADVANTAGE_ATTACK = ['blinded', 'frightened', 'poisoned', 'prone', 'restrained'];
const DISADVANTAGE_CHECK = ['poisoned', 'frightened'];
const ARMOR_CATEGORY = (id) => ARMOR_BY_ID[id]?.category || null;

export function renderSheet(root, character) {
  const c = character;
  c.sheet = normalizeSheet(c.sheet, { gold: deriveCharacter(c).gold });
  setLastSheet(c.id);
  const view = { tab: 'actions', targetAC: null, lastCrit: {}, castLevel: {}, hpAmount: '', concDC: null };
  const tray = createDiceTray();
  const host = h('div', { class: 'sheet-host' });
  mount(root, host, tray.el);
  let d = deriveCharacter(c);

  // ---------------------------------------------------------------- persistence

  let warned = false;
  function persist() {
    if (!saveCharacter(c) && !warned) { warned = true; toast('Could not save: browser storage is full or unavailable. Changes are kept until you leave this page.'); }
  }

  /** Mutate the character, save, and redraw. */
  function update(fn) {
    fn(c);
    persist();
    render();
  }

  /** Mutate and save without redrawing (text fields). */
  function save(fn) {
    fn(c);
    persist();
  }

  // ---------------------------------------------------------------- shared roll helpers

  const armorUntrained = () => c.equipment.items.some((it) => it.equipped && (
    (it.id === 'shield' && !d.armorTraining.includes('shield'))
    || (it.id !== 'shield' && ARMOR_CATEGORY(it.id) && !d.armorTraining.includes(ARMOR_CATEGORY(it.id)))));

  function autoMode({ attack, kind, ability }) {
    const cond = c.sheet.conditions;
    const modes = [];
    if (attack && DISADVANTAGE_ATTACK.some((x) => cond.includes(x))) modes.push('disadvantage');
    if (!attack && kind === 'check' && DISADVANTAGE_CHECK.some((x) => cond.includes(x))) modes.push('disadvantage');
    if (kind === 'save' && ability === 'dex' && cond.includes('restrained')) modes.push('disadvantage');
    if (armorUntrained() && (attack || ((kind === 'check' || kind === 'save') && (ability === 'str' || ability === 'dex')))) modes.push('disadvantage');
    return combineModes(...modes);
  }

  function d20({ label, bonus, e = null, attack = false, extraMode = 'normal', kind = 'check', ability = null }) {
    const mode = combineModes(tray.modeFromEvent(e), extraMode, autoMode({ attack, kind, ability }));
    return tray.rollD20({ label, bonus, mode, penalty: d20Penalty(c.sheet.exhaustion), attack, targetAC: view.targetAC });
  }

  // ---------------------------------------------------------------- hit points

  const maxHp = () => d.hp;

  function takeDamage(amount, { crit = false } = {}) {
    if (!(amount > 0)) { toast('Enter an amount of damage first.'); return; }
    const result = applyDamage(c.sheet.hp, amount, maxHp(), { crit });
    const wasConcentrating = !!c.sheet.concentration;
    update((x) => {
      x.sheet.hp = result.hp;
      if (result.downed || result.died) x.sheet.concentration = null;
    });
    tray.note(`Took ${amount} damage`, `${result.absorbed ? `${result.absorbed} absorbed by temporary HP, ` : ''}${result.lost} HP lost${result.died ? ' · you have died' : result.downed ? ' · dropped to 0 HP' : ''}.`);
    if (result.died) toast('Your character has died.');
    else if (result.downed) toast('Down to 0 HP. Make death saving throws on your turn.');
    if (wasConcentrating && !result.downed && !result.died) {
      view.concDC = concentrationDC(amount);
      render();
    }
  }

  function heal(amount, label = 'Healing') {
    if (!(amount > 0)) { toast('Enter an amount to heal first.'); return; }
    const before = currentHp(c.sheet.hp, maxHp());
    update((x) => { x.sheet.hp = applyHealing(x.sheet.hp, amount, maxHp()); });
    tray.note(`${label}: +${currentHp(c.sheet.hp, maxHp()) - before} HP`, `Now at ${currentHp(c.sheet.hp, maxHp())} / ${maxHp()}.`);
  }

  function rollDeath(e) {
    const t = d20({ label: 'Death saving throw', bonus: 0, e, kind: 'death' });
    const save = t.natural === 20 ? { revive: true, successes: 0, failures: 0 }
      : t.natural === 1 ? { revive: false, successes: 0, failures: 2 }
        : t.total >= 10 ? { revive: false, successes: 1, failures: 0 } : { revive: false, successes: 0, failures: 1 };
    update((x) => { x.sheet.hp = applyDeathSave(x.sheet.hp, save); });
    const hp = c.sheet.hp;
    if (save.revive) toast('Natural 20! You regain 1 hit point.');
    else if (hp.dead) toast('Three failures. Your character has died.');
    else if (hp.stable) toast('Three successes. You are stable at 0 HP.');
  }

  // ---------------------------------------------------------------- rests

  function shortRestModal() {
    const body = h('div', {});
    const draw = () => {
      const left = hitDiceLeft(d.level, c.sheet.hitDiceUsed);
      body.replaceChildren(
        h('p', {}, `HP ${currentHp(c.sheet.hp, maxHp())} / ${maxHp()} · Hit Dice left: ${left} of ${d.level} (d${d.hitDie})`),
        h('p', { class: 'hint' }, `Spend Hit Dice to heal: roll d${d.hitDie} and add your Constitution modifier (${fmt(d.mods.con)}) for each die.`),
        h('div', { class: 'row gap' },
          h('button', {
            type: 'button', class: 'btn primary', disabled: left <= 0,
            onclick: () => {
              const res = tray.rollExpr(`Hit Die (d${d.hitDie})`, withModifier(`1d${d.hitDie}`, d.mods.con), { kind: 'heal' });
              const spent = spendHitDie(c.sheet, { level: d.level, roll: res.terms[0].rolls[0], conMod: d.mods.con, maxHp: maxHp() });
              update((x) => { x.sheet = spent.sheet; });
              tray.note('Short Rest', `Spent a Hit Die and healed ${spent.healed} HP.`);
              draw();
            },
          }, 'Spend a Hit Die'),
          h('button', {
            type: 'button', class: 'btn',
            onclick: () => { update((x) => { x.sheet = shortRest(x.sheet, resourcesFor({ c, d })); }); tray.note('Short Rest finished', 'Short-rest features and Pact Magic slots recharged.'); modal.close(); toast('Short Rest finished.'); },
          }, 'Finish Short Rest')),
        h('p', { class: 'hint' }, 'A Short Rest lasts at least 1 hour. Finishing it recharges features that refresh on a Short Rest.'));
    };
    const modal = openModal('Short Rest', body);
    draw();
  }

  async function doLongRest() {
    const ok = await confirmDialog('Long Rest', 'Regain all hit points, half your Hit Dice, all spell slots and features, and lose 1 level of Exhaustion?', 'Take Long Rest');
    if (!ok) return;
    update((x) => { x.sheet = longRest(x.sheet, { level: d.level, maxHp: maxHp() }); });
    view.concDC = null;
    tray.note('Long Rest finished', 'HP, Hit Dice, spell slots and features restored.');
    toast('Long Rest finished.');
  }

  // ---------------------------------------------------------------- context handed to panels

  function makeCtx() {
    return {
      c, d, s: c.sheet, view, tray, update, save, rerender: render, toast, d20, heal,
      weaponOpts: (key) => { c.sheet.weaponOpts[key] = c.sheet.weaponOpts[key] || {}; return c.sheet.weaponOpts[key]; },
    };
  }

  // ---------------------------------------------------------------- render

  function render() {
    const scrollY = window.scrollY;
    const focusIndex = focusables().indexOf(document.activeElement);
    const openDetails = [...host.querySelectorAll('details')].map((el) => el.open);
    d = deriveCharacter(c);
    if (c.sheet.hp.current !== null && c.sheet.hp.current > d.hp) c.sheet.hp.current = d.hp;
    mount(host, buildSheet(makeCtx()));
    host.querySelectorAll('details').forEach((el, i) => { if (openDetails[i]) el.open = true; });
    if (focusIndex >= 0) focusables()[focusIndex]?.focus({ preventScroll: true });
    window.scrollTo({ top: scrollY });
  }

  function focusables() { return [...host.querySelectorAll('button, input, select, textarea, summary, a[href]')]; }

  function buildSheet(ctx) {
    return h('div', { class: 'sheet', dataset: { theme: ctx.s.appearance.theme, frame: ctx.s.appearance.frame } },
      headerView(ctx),
      bannerView(ctx),
      h('div', { class: 'sheet-grid' },
        h('div', { class: 'sheet-col left' }, abilitiesPanel(ctx), savesPanel(ctx), skillsPanel(ctx)),
        h('div', { class: 'sheet-col main' }, vitalsPanel(ctx), conditionsPanel(ctx), tabsView(ctx))));
  }

  render();
  return () => { /* nothing global to tear down: the tray and sheet live inside the route root */ };

  // ================================================================ views (closures over ctx)

  function headerView(ctx) {
    const { s } = ctx;
    const src = portraitSrc(c);
    const subtitle = [d.species?.name, d.cls?.name].filter(Boolean).join(' ');
    const open = (section) => openAppearancePanel({ c, persist, refresh: render }, section);
    return h('header', { class: 'sheet-head', dataset: { backdrop: s.appearance.backdrop } },
      h('button', { type: 'button', class: 'portrait-wrap', dataset: { frame: s.appearance.frame }, 'aria-label': 'Change portrait', onclick: () => open('portrait') },
        src ? h('img', { src, alt: `Portrait of ${c.name || 'your character'}` }) : h('span', { class: 'portrait-empty', 'aria-hidden': 'true' }, '⚔')),
      h('div', { class: 'head-main' },
        h('h1', {}, h('button', { type: 'button', class: 'name-btn', onclick: () => open('portrait'), title: 'Change name and appearance' }, c.name || 'Unnamed hero')),
        h('p', { class: 'head-sub' }, `Level ${d.level} ${subtitle}${d.bg ? ` · ${d.bg.name}` : ''}${d.subclass ? ` · ${d.subclass.name}` : ''}`),
        h('div', { class: 'row gap head-actions' },
          h('div', { class: 'level-ctl', role: 'group', 'aria-label': 'Character level' },
            h('button', { type: 'button', class: 'btn small', disabled: d.level <= 1, 'aria-label': 'Level down', onclick: () => changeLevel(ctx, -1) }, '−'),
            h('strong', {}, `Level ${d.level}`),
            h('button', { type: 'button', class: 'btn small', disabled: d.level >= R.MAX_LEVEL, 'aria-label': 'Level up', onclick: () => changeLevel(ctx, 1) }, '+')),
          h('button', {
            type: 'button', class: `btn small${s.inspiration ? ' primary' : ''}`, 'aria-pressed': String(s.inspiration), title: 'Heroic Inspiration: reroll one die and use the new roll',
            onclick: () => update((x) => { x.sheet.inspiration = !x.sheet.inspiration; }),
          }, s.inspiration ? 'Inspired' : 'Heroic Inspiration'),
          h('button', { type: 'button', class: 'btn small', onclick: () => open('portrait') }, 'Change Sheet Appearance'),
          h('button', { type: 'button', class: 'btn small', onclick: () => exportCharacter(c), title: 'Download this character as a JSON file' }, 'Export'),
          h('button', { type: 'button', class: 'btn small', onclick: () => window.print(), title: 'Print this sheet (or save as PDF)' }, 'Print'),
          h('a', { class: 'btn small', href: '#/' }, 'All characters'))),
      h('div', { class: 'head-stats' },
        h('div', { class: 'stat' }, h('span', { class: 'stat-label' }, 'Proficiency'), h('span', { class: 'stat-value' }, fmt(d.pb))),
        h('div', { class: 'stat' }, h('span', { class: 'stat-label' }, 'Roll next d20'), tray.modeControl())));
  }

  function bannerView(ctx) {
    const notes = [];
    const asi = pendingAsi(c, d.level);
    if (asi.length) {
      notes.push(h('p', { class: 'notice' }, `You have ${asi.length} unspent ${asi[0].slot.kind === 'boon' ? 'Epic Boon' : 'Ability Score Improvement'}${asi.length > 1 ? 's' : ''}. `,
        h('button', { type: 'button', class: 'btn small', onclick: () => openAsiModal(ctx) }, 'Choose now')));
    }
    if (ctx.s.concentration) {
      notes.push(h('p', { class: 'notice' }, `Concentrating on ${ctx.s.concentration}. `,
        view.concDC ? [`You took damage: Constitution saving throw DC ${view.concDC} to keep concentrating. `,
          rollButton(`Roll Con save ${fmt(d.saves.find((x) => x.ability === 'con').bonus)}`, (e) => {
            const bonus = d.saves.find((x) => x.ability === 'con').bonus;
            const res = d20({ label: `Concentration (DC ${view.concDC})`, bonus, e, kind: 'save', ability: 'con' });
            if (res.total < view.concDC && !res.crit) { update((x) => { x.sheet.concentration = null; }); toast('Concentration broken.'); }
            view.concDC = null;
            render();
          }, { cls: 'small' })] : null,
        h('button', { type: 'button', class: 'btn small', onclick: () => { view.concDC = null; update((x) => { x.sheet.concentration = null; }); } }, 'End concentration')));
    }
    if (ctx.s.hp.dead) notes.push(h('p', { class: 'notice warn' }, 'Your character is dead. A Revivify-style effect or your DM can bring them back. ',
      h('button', { type: 'button', class: 'btn small', onclick: () => update((x) => { x.sheet.hp = { ...resetDeathSaves(x.sheet.hp), current: 1 }; }) }, 'Revive at 1 HP')));
    return notes.length ? h('div', { class: 'banners' }, notes) : null;
  }

  // ---------------------------------------------------------------- left column

  function abilitiesPanel(ctx) {
    return panel('Abilities',
      h('ul', { class: 'ability-list' }, ABILITIES.map((a) => {
        const mod = d.mods[a.id];
        return h('li', { class: 'ability-card' },
          h('span', { class: 'ability-name' }, a.name),
          rollButton(fmt(mod), (e) => d20({ label: `${a.name} check`, bonus: mod, e, kind: 'check', ability: a.id }), { cls: 'big', label: `Roll ${a.name} check ${fmt(mod)}` }),
          h('span', { class: 'ability-score-box', title: ctx.d.breakdown && breakdownTitle(a.id) }, d.scores[a.id]));
      })));
  }

  function breakdownTitle(id) {
    const b = d.breakdown;
    return `Base ${b.base[id]}${b.background[id] ? ` + ${b.background[id]} background` : ''}${b.advancement[id] ? ` + ${b.advancement[id]} improvements` : ''}`;
  }

  function savesPanel() {
    return panel('Saving throws',
      h('ul', { class: 'row-list' }, d.saves.map((sv) => {
        const name = ABILITIES.find((a) => a.id === sv.ability).name;
        return h('li', {}, h('button', {
          type: 'button', class: 'row-roll', 'aria-label': `Roll ${name} saving throw ${fmt(sv.bonus)}`,
          title: 'Click to roll. Shift: Advantage. Ctrl/Alt: Disadvantage.',
          onclick: (e) => d20({ label: `${name} saving throw`, bonus: sv.bonus, e, kind: 'save', ability: sv.ability }),
        }, profDot(sv.proficient ? 1 : 0), h('span', { class: 'row-name' }, name), h('strong', {}, fmt(sv.bonus))));
      })));
  }

  function skillsPanel() {
    const pen = d20Penalty(c.sheet.exhaustion);
    return panel('Skills',
      h('ul', { class: 'row-list skills' }, d.skills.map((sk) => h('li', {}, h('button', {
        type: 'button', class: 'row-roll', 'aria-label': `Roll ${sk.name} ${fmt(sk.bonus)}`,
        title: 'Click to roll. Shift: Advantage. Ctrl/Alt: Disadvantage.',
        onclick: (e) => d20({ label: `${sk.name} check`, bonus: sk.bonus, e, kind: 'check', ability: sk.ability }),
      }, profDot(sk.proficiency), h('span', { class: 'row-name' }, sk.name, h('small', {}, ` ${sk.ability.toUpperCase()}`)), h('strong', {}, fmt(sk.bonus)))))),
      h('p', { class: 'hint' }, `Passive Perception ${d.passivePerception} · Insight ${R.passiveScore(d.skills.find((x) => x.id === 'insight').bonus)} · Investigation ${R.passiveScore(d.skills.find((x) => x.id === 'investigation').bonus)}`),
      h('p', { class: 'hint' }, '● proficient · ◆ expertise (double proficiency).'),
      pen ? h('p', { class: 'notice warn' }, `Exhaustion ${c.sheet.exhaustion}: every d20 roll is reduced by ${pen}.`) : null);
  }

  // ---------------------------------------------------------------- vitals

  function vitalsPanel(ctx) {
    const { s } = ctx;
    const hp = s.hp;
    const now = currentHp(hp, maxHp());
    const pct = Math.max(0, Math.min(100, Math.round((now / maxHp()) * 100)));
    const speed = ['grappled', 'restrained', 'paralyzed', 'stunned', 'unconscious', 'petrified'].some((x) => s.conditions.includes(x))
      ? 0 : Math.max(0, d.speed - 5 * s.exhaustion);
    const untrained = armorUntrained();
    const amountId = 'hp-amount';
    const amount = () => Math.floor(Number(view.hpAmount) || 0);
    const clear = () => { view.hpAmount = ''; };

    const stat = (label, value, sub, extra) => h('div', { class: 'stat vital' }, h('span', { class: 'stat-label' }, label), value, sub ? h('span', { class: 'stat-sub' }, sub) : null, extra || null);

    return panel(null,
      h('div', { class: 'vitals' },
        stat('Armor Class', h('span', { class: 'stat-value big' }, d.ac.ac), d.ac.formula, untrained ? h('span', { class: 'tag bad' }, 'Untrained armor') : null),
        stat('Initiative', rollButton(fmt(d.initiative), (e) => d20({ label: 'Initiative', bonus: d.initiative, e, kind: 'check', ability: 'dex' }), { cls: 'big', label: `Roll initiative ${fmt(d.initiative)}` }), 'Dexterity'),
        stat('Speed', h('span', { class: 'stat-value big' }, `${speed} ft`), s.exhaustion ? `Exhaustion -${5 * s.exhaustion} ft` : (speed === 0 && d.speed ? 'Condition' : d.darkvision ? `Darkvision ${d.darkvision} ft` : null)),
        stat('Hit Dice', h('span', { class: 'stat-value big' }, `${hitDiceLeft(d.level, s.hitDiceUsed)}/${d.level}`), `d${d.hitDie}`)),
      h('div', { class: 'hp-block' },
        h('div', { class: 'hp-numbers', 'aria-live': 'polite' },
          h('span', { class: 'hp-label' }, 'Hit Points'),
          h('strong', { class: `hp-now${now === 0 ? ' zero' : ''}` }, now), h('span', { class: 'hp-max' }, `/ ${maxHp()}`),
          hp.temp ? h('span', { class: 'tag good' }, `+${hp.temp} temp`) : null),
        h('div', { class: 'hp-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': maxHp(), 'aria-valuenow': now, 'aria-label': 'Hit points' },
          h('span', { class: `hp-fill${pct <= 25 ? ' low' : ''}`, style: `width:${pct}%` })),
        h('div', { class: 'hp-controls' },
          h('label', { class: 'visually-hidden', for: amountId }, 'Amount of damage or healing'),
          h('input', { id: amountId, type: 'number', min: 0, max: 999, value: view.hpAmount, placeholder: 'Amount', oninput: (e) => { view.hpAmount = e.target.value; } }),
          h('button', { type: 'button', class: 'btn danger', onclick: () => { const n = amount(); clear(); takeDamage(n); } }, 'Damage'),
          h('button', { type: 'button', class: 'btn', title: 'Damage from a critical hit while at 0 HP counts as two death save failures', onclick: () => { const n = amount(); clear(); takeDamage(n, { crit: true }); } }, 'Crit damage'),
          h('button', { type: 'button', class: 'btn primary', onclick: () => { const n = amount(); clear(); heal(n); } }, 'Heal'),
          h('button', {
            type: 'button', class: 'btn', title: 'Temporary hit points do not stack; keep the higher number',
            onclick: () => { const n = amount(); clear(); if (n > 0) update((x) => { x.sheet.hp = grantTempHp(x.sheet.hp, n); }); else toast('Enter an amount first.'); },
          }, 'Temp HP')),
        now === 0 && !hp.dead ? deathSaves(hp) : null,
        h('div', { class: 'row gap rests' },
          h('button', { type: 'button', class: 'btn', onclick: shortRestModal }, 'Short Rest'),
          h('button', { type: 'button', class: 'btn', onclick: doLongRest }, 'Long Rest'))));
  }

  function deathSaves(hp) {
    const set = (key, i) => update((x) => { const h2 = x.sheet.hp; h2[key] = h2[key] > i ? i : i + 1; if (h2.successes >= 3) h2.stable = true; if (h2.failures >= 3) h2.dead = true; });
    return h('div', { class: 'death-saves' },
      h('h3', {}, 'Death Saving Throws'),
      hp.stable ? h('p', { class: 'tag good' }, 'Stable at 0 HP') : null,
      h('div', { class: 'ds-row' }, h('span', {}, 'Successes'), pips({ total: 3, filled: hp.successes, label: 'Death save successes', cls: 'good', onToggle: (i) => set('successes', i) })),
      h('div', { class: 'ds-row' }, h('span', {}, 'Failures'), pips({ total: 3, filled: hp.failures, label: 'Death save failures', cls: 'bad', onToggle: (i) => set('failures', i) })),
      h('div', { class: 'row gap' },
        rollButton('Roll death save', rollDeath, { cls: 'attack' }),
        h('button', { type: 'button', class: 'btn small', onclick: () => update((x) => { x.sheet.hp = { ...x.sheet.hp, stable: true, successes: 0, failures: 0 }; }) }, 'Stabilize')),
      h('p', { class: 'hint' }, '10 or higher succeeds, 9 or lower fails. A natural 1 is two failures; a natural 20 returns you to 1 HP.'));
  }

  // ---------------------------------------------------------------- conditions

  function conditionsPanel(ctx) {
    const { s } = ctx;
    const active = s.conditions.map((id) => CONDITIONS.find((x) => x.id === id)).filter(Boolean);
    const toggleId = (id) => update((x) => {
      const list = x.sheet.conditions;
      x.sheet.conditions = list.includes(id) ? list.filter((y) => y !== id) : [...list, id];
    });
    return h('details', { class: 'sheet-panel conditions' },
      h('summary', {}, `Conditions${active.length || s.exhaustion ? ` (${active.length + (s.exhaustion ? 1 : 0)} active)` : ''}`),
      h('div', { class: 'chip-row' }, CONDITIONS.filter((x) => x.id !== 'exhaustion').map((cond) => h('button', {
        type: 'button', class: `chip${s.conditions.includes(cond.id) ? ' on' : ''}`, 'aria-pressed': String(s.conditions.includes(cond.id)), title: cond.desc, onclick: () => toggleId(cond.id),
      }, cond.name))),
      h('div', { class: 'row gap exhaustion' },
        h('span', {}, 'Exhaustion'),
        h('button', { type: 'button', class: 'btn small', disabled: s.exhaustion <= 0, 'aria-label': 'Remove a level of Exhaustion', onclick: () => update((x) => { x.sheet.exhaustion -= 1; }) }, '−'),
        h('strong', {}, s.exhaustion),
        h('button', { type: 'button', class: 'btn small', disabled: s.exhaustion >= 6, 'aria-label': 'Add a level of Exhaustion', onclick: () => update((x) => { x.sheet.exhaustion += 1; }) }, '+'),
        h('small', {}, s.exhaustion ? `D20 Tests -${2 * s.exhaustion}, Speed -${5 * s.exhaustion} ft${s.exhaustion >= 6 ? ' · you die at level 6' : ''}` : 'None')),
      active.length ? h('ul', { class: 'condition-list' }, active.map((cond) => h('li', {}, h('strong', {}, `${cond.name}. `), cond.desc))) : null,
      d.resistances.length ? h('p', { class: 'hint' }, `Resistances: ${d.resistances.join(', ')}`) : null);
  }

  // ---------------------------------------------------------------- tabs

  function tabsView(ctx) {
    const hasSpells = !!d.spellcasting || spellEntries(c, d).length > 0;
    const tabs = [
      { id: 'actions', label: 'Actions', render: actionsTab },
      hasSpells && { id: 'spells', label: 'Spells', render: spellsTab },
      { id: 'inventory', label: 'Inventory', render: inventoryTab },
      { id: 'features', label: 'Features', render: featuresTab },
      { id: 'notes', label: 'Notes', render: notesTab },
    ].filter(Boolean);
    if (!tabs.some((t) => t.id === view.tab)) view.tab = 'actions';
    const current = tabs.find((t) => t.id === view.tab);
    return h('div', { class: 'sheet-tabs' },
      h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Sheet sections' }, tabs.map((t) => h('button', {
        type: 'button', role: 'tab', id: `tab-${t.id}`, class: `tab${t.id === view.tab ? ' active' : ''}`, 'aria-selected': String(t.id === view.tab), 'aria-controls': 'tab-panel',
        onclick: () => { view.tab = t.id; render(); },
      }, t.label))),
      h('div', { id: 'tab-panel', role: 'tabpanel', 'aria-labelledby': `tab-${current.id}` }, current.render(ctx)));
  }
}
