// Actions tab: weapon attacks (attack and damage rolls, Weapon Mastery), class actions and limited-use resources.

import { h, openModal } from '../ui.js';
import * as R from '../rules.js';
import { resolveItem, WEAPON_PROPERTIES, WEAPON_MASTERY } from '../data/index.js';
import { masteryOptions } from '../choices.js';
import { withModifier } from '../dice.js';
import { resourceDefs, usesLeft } from '../sheet-state.js';
import { itemName } from '../inventory.js';
import { rollButton, panel, pips, disclosure, titleCase } from './widgets.js';
import { checkList, counter } from '../steps/shared.js';

const fmt = R.formatMod;

/**
 * Build every attack the character can make from the inventory, plus the Unarmed Strike.
 * Pure given the character: used by the panel and easy to inspect in the console.
 */
export function buildAttacks(c, d) {
  const s = c.sheet;
  const attacks = [];
  const monkDie = c.classId === 'monk' ? R.martialArtsDieSize(d.level) : null;
  const rageBonus = s.raging && c.classId === 'barbarian' ? d.classResources.rageDamage || 0 : 0;
  const style = c.fightingStyle;

  for (const it of c.equipment.items) {
    const found = resolveItem(it.id);
    if (!found || found.kind !== 'weapon') continue;
    const weapon = found.item;
    const opts = s.weaponOpts[it.id] || {};
    const twoHanded = !!(weapon.versatile && opts.twoHanded);
    const offhand = weapon.properties.includes('light') && !!opts.offhand;
    const magic = Math.max(0, Math.min(3, Number(opts.magic) || 0));
    const proficient = R.isWeaponProficient(d.weaponProficiency, weapon);
    const masteryActive = c.masteries.includes(weapon.id);
    const calc = R.weaponAttack({
      weapon, scores: d.scores, level: d.level, proficient, masteryActive, twoHanded, offhand, bonus: magic,
      archery: style === 'archery', twoWeaponFighting: style === 'two-weapon-fighting', martialArtsDie: monkDie,
    });
    const rage = rageBonus && calc.ability === 'str' && weapon.type === 'melee' ? rageBonus : 0;
    const damageBonus = calc.damageBonus + rage;
    const heavyDisadvantage = weapon.properties.includes('heavy')
      && (weapon.type === 'melee' ? d.scores.str < 13 : d.scores.dex < 13);
    attacks.push({
      key: it.id, name: itemName({ ...it, qty: 1 }), weapon, proficient, masteryActive, twoHanded, offhand, magic,
      attackBonus: calc.attackBonus, ability: calc.ability, damageDice: calc.damageDice, damageBonus,
      damageType: calc.damageType, masteryDC: calc.masteryDC, rage,
      greatWeapon: style === 'great-weapon-fighting' && weapon.type === 'melee' && (twoHanded || weapon.properties.includes('two-handed')),
      autoMode: heavyDisadvantage ? 'disadvantage' : 'normal',
      heavyDisadvantage,
    });
  }

  const unarmed = R.unarmedStrike({ scores: d.scores, level: d.level, monkLevel: monkDie ? d.level : 0 });
  attacks.push({
    key: 'unarmed', name: 'Unarmed Strike', weapon: null, proficient: true, masteryActive: false,
    attackBonus: unarmed.attackBonus, ability: monkDie ? (d.mods.dex >= d.mods.str ? 'dex' : 'str') : 'str',
    damageDice: unarmed.damageDice, damageBonus: unarmed.damageBonus, damageType: unarmed.damageType,
    flat: !/d/.test(unarmed.damageDice), autoMode: 'normal',
  });
  return attacks;
}

/** Damage text for display: '1d8+3 slashing'. */
export const damageText = (a) => (a.flat ? `${Math.max(0, Number(a.damageDice) + a.damageBonus)} ${a.damageType}` : `${withModifier(a.damageDice, a.damageBonus)} ${a.damageType}`);

// ---------------------------------------------------------------- attacks panel

function attackCard(ctx, a) {
  const { view } = ctx;
  const crit = () => view.lastCrit[a.key] === true;
  const label = () => (crit() ? 'Damage (Crit)' : 'Damage');
  const dmgBtn = rollButton(label(), (e) => rollDamage(e, crit()), { cls: 'damage' });
  const syncDamage = () => { dmgBtn.textContent = label(); dmgBtn.classList.toggle('crit-ready', crit()); };

  function rollDamage(_e, asCrit) {
    if (a.flat) {
      const total = Math.max(0, Number(a.damageDice) + a.damageBonus);
      ctx.tray.rollFlat(`${a.name} damage`, total, `${a.damageDice}${a.damageBonus ? ` ${fmt(a.damageBonus)}` : ''} = ${total} ${a.damageType}`);
    } else {
      ctx.tray.rollDamage({
        label: `${a.name} damage (${a.damageType})`, expr: withModifier(a.damageDice, a.damageBonus), crit: asCrit, minDie: a.greatWeapon ? 3 : 0,
      });
    }
    view.lastCrit[a.key] = false;
    syncDamage();
  }

  function rollAttack(e) {
    const res = ctx.d20({ label: `${a.name} attack`, bonus: a.attackBonus, e, attack: true, extraMode: a.autoMode });
    view.lastCrit[a.key] = !!res.crit;
    syncDamage();
    if (res.outcome === 'fumble' || res.outcome === 'miss') {
      if (a.masteryActive && a.weapon.mastery === 'graze') ctx.tray.note(`${a.name}: Graze`, `On a miss you still deal ${Math.max(0, R.abilityMod(ctx.d.scores[a.ability]))} ${a.damageType} damage (the ability modifier).`);
    }
  }

  const tags = [];
  if (a.weapon) {
    tags.push(h('span', { class: 'tag' }, titleCase(a.weapon.category)));
    tags.push(h('span', { class: 'tag' }, a.weapon.type === 'ranged' ? 'Ranged' : 'Melee'));
    if (!a.proficient) tags.push(h('span', { class: 'tag bad', title: 'You lack proficiency, so you do not add your Proficiency Bonus.' }, 'Not proficient'));
    if (a.masteryActive) {
      tags.push(h('span', { class: 'tag mastery', title: WEAPON_MASTERY[a.weapon.mastery].desc }, `Mastery: ${WEAPON_MASTERY[a.weapon.mastery].name}`));
    }
    if (a.heavyDisadvantage) tags.push(h('span', { class: 'tag bad', title: 'Heavy weapon with a score below 13: Disadvantage on attack rolls.' }, 'Heavy: Disadvantage'));
    if (a.magic) tags.push(h('span', { class: 'tag good' }, `+${a.magic} weapon`));
    if (a.rage) tags.push(h('span', { class: 'tag good' }, `Rage +${a.rage}`));
    if (a.greatWeapon) tags.push(h('span', { class: 'tag good', title: 'Great Weapon Fighting: damage dice that roll 1 or 2 count as 3.' }, 'Great Weapon Fighting'));
  }

  const controls = [];
  if (a.weapon?.versatile) {
    controls.push(h('label', { class: 'inline-check' },
      h('input', { type: 'checkbox', checked: a.twoHanded, onchange: (e) => ctx.update(() => { ctx.weaponOpts(a.key).twoHanded = e.target.checked; }) }),
      `Two-handed (${a.weapon.versatile})`));
  }
  if (a.weapon?.properties.includes('light')) {
    controls.push(h('label', { class: 'inline-check', title: 'Extra attack as a Bonus Action: no ability modifier to damage unless it is negative (or you have Two-Weapon Fighting).' },
      h('input', { type: 'checkbox', checked: a.offhand, onchange: (e) => ctx.update(() => { ctx.weaponOpts(a.key).offhand = e.target.checked; }) }),
      'Off-hand attack'));
  }
  if (a.weapon) {
    const id = `magic-${a.key}`;
    controls.push(h('label', { class: 'inline-check', for: id }, 'Magic bonus',
      h('select', {
        id, onchange: (e) => ctx.update(() => { ctx.weaponOpts(a.key).magic = Number(e.target.value); }),
      }, [0, 1, 2, 3].map((n) => h('option', { value: n, selected: n === a.magic }, n ? `+${n}` : 'None')))));
  }

  const details = a.weapon ? disclosure('Properties and mastery',
    h('ul', { class: 'bullets' },
      a.weapon.properties.map((p) => h('li', {}, h('strong', {}, `${titleCase(p)}. `), WEAPON_PROPERTIES[p])),
      a.weapon.range ? h('li', {}, h('strong', {}, 'Range. '), `${a.weapon.range[0]}/${a.weapon.range[1]} ft`) : null,
      a.weapon.thrown ? h('li', {}, h('strong', {}, 'Thrown range. '), `${a.weapon.thrown[0]}/${a.weapon.thrown[1]} ft`) : null),
    h('p', {}, h('strong', {}, `Mastery: ${WEAPON_MASTERY[a.weapon.mastery].name}`), a.masteryActive ? ' (unlocked)' : ' (not unlocked: your class or choices do not give you this weapon\'s Mastery)', '. ', WEAPON_MASTERY[a.weapon.mastery].desc,
      a.masteryActive && a.weapon.mastery === 'topple' ? ` Save DC ${a.masteryDC}.` : '')) : null;

  return h('li', { class: 'attack-card' },
    h('div', { class: 'attack-main' },
      h('h3', {}, a.name),
      h('div', { class: 'tag-row' }, tags)),
    h('div', { class: 'attack-rolls' },
      h('div', { class: 'attack-roll' }, h('span', { class: 'stat-label' }, 'Attack'),
        rollButton(fmt(a.attackBonus), rollAttack, { label: `Roll ${a.name} attack ${fmt(a.attackBonus)}`, cls: 'attack' })),
      h('div', { class: 'attack-roll' }, h('span', { class: 'stat-label' }, `Damage ${damageText(a)}`),
        h('span', { class: 'btn-pair' },
          dmgBtn,
          h('button', { type: 'button', class: 'roll-btn small', title: 'Roll damage as a critical hit (doubles the dice)', onclick: () => rollDamage(null, true) }, 'Crit')))),
    controls.length ? h('div', { class: 'attack-opts' }, controls) : null,
    details);
}

function masteryPicker(ctx, need) {
  const { c } = ctx;
  let picks = c.masteries.slice(0, need);
  const body = h('div', {});
  const draw = () => {
    body.replaceChildren(
      h('p', {}, 'Choose the weapons whose Mastery property you can use. You can change this after a Long Rest.'),
      counter(picks.length, need, 'weapons chosen'),
      checkList({
        options: masteryOptions(c.classId).map((w) => ({ id: w.id, label: w.name, detail: `${titleCase(w.category)} · ${WEAPON_MASTERY[w.mastery].name}` })),
        selected: picks, max: need, legend: 'Weapon Mastery', idPrefix: 'mastery',
        onChange: (next) => { picks = next; draw(); },
      }),
      h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn primary', onclick: () => { ctx.update((x) => { x.masteries = picks; }); modal.close(); } }, 'Save')));
  };
  const modal = openModal('Weapon Mastery', body, { wide: true });
  draw();
}

// ---------------------------------------------------------------- class actions

/** Rollable class / species actions available at the character's level. */
export function classActions(c, d) {
  const out = [];
  const r = d.classResources;
  switch (c.classId) {
    case 'rogue': out.push({ id: 'sneak', name: 'Sneak Attack', desc: 'Once per turn with Advantage (or an adjacent ally) using a Finesse or Ranged weapon.', expr: r.sneakAttack, kind: 'damage', crit: true }); break;
    case 'fighter': out.push({ id: 'secondwind', name: 'Second Wind', desc: 'Bonus Action: regain hit points.', expr: `1d10+${d.level}`, kind: 'heal', resource: 'secondwind' }); break;
    case 'bard': out.push({ id: 'bardic', name: 'Bardic Inspiration', desc: `Bonus Action: give a creature a d${r.inspirationDie} to add to a d20 Test.`, expr: `1d${r.inspirationDie}`, kind: 'dice', resource: 'bardic' }); break;
    case 'monk': out.push({ id: 'martial', name: 'Martial Arts die', desc: 'Roll the die your Unarmed Strikes use.', expr: `1d${r.martialArtsDie}`, kind: 'damage' }); break;
    case 'barbarian': out.push({ id: 'rage', name: 'Rage', desc: `Bonus Action. +${r.rageDamage} damage with Strength attacks, Resistance to Bludgeoning, Piercing and Slashing.`, toggle: 'raging', resource: 'rage' }); break;
    default: break;
  }
  const sp = d.species;
  const ancestry = c.speciesChoices?.ancestry;
  if (sp && sp.id === 'dragonborn' && ancestry) {
    const dice = d.level >= 17 ? 4 : d.level >= 11 ? 3 : d.level >= 5 ? 2 : 1;
    const dc = 8 + d.mods.con + d.pb;
    out.push({ id: 'breath', name: 'Breath Weapon', desc: `Replaces one attack. Dexterity save DC ${dc} (half on success). ${sp.ancestryDamage[ancestry]} damage.`, expr: `${dice}d10`, kind: 'damage', resource: 'breath', save: `DC ${dc}` });
  }
  return out;
}

function actionCard(ctx, act, defs) {
  const { s, tray } = ctx;
  const def = act.resource ? defs.find((x) => x.key === act.resource) : null;
  const left = def ? usesLeft(s, def) : null;
  const spend = () => {
    if (!def) return true;
    if (usesLeft(ctx.c.sheet, def) <= 0) { ctx.toast(`No uses of ${def.label} left.`); return false; }
    ctx.update((x) => { x.sheet.resUsed[def.key] = (x.sheet.resUsed[def.key] || 0) + 1; });
    return true;
  };

  let button;
  if (act.toggle) {
    button = h('button', {
      type: 'button', class: `btn small${s[act.toggle] ? ' primary' : ''}`, 'aria-pressed': String(!!s[act.toggle]),
      onclick: () => {
        if (!s[act.toggle] && def && usesLeft(s, def) <= 0) { ctx.toast(`No uses of ${def.label} left.`); return; }
        ctx.update((x) => {
          if (!x.sheet[act.toggle] && def) x.sheet.resUsed[def.key] = (x.sheet.resUsed[def.key] || 0) + 1;
          x.sheet[act.toggle] = !x.sheet[act.toggle];
        });
      },
    }, s[act.toggle] ? 'Raging: end Rage' : 'Start Rage');
  } else {
    button = rollButton(`Roll ${act.expr}`, (e) => {
      if (!spend()) return;
      if (act.kind === 'heal') {
        const res = tray.rollExpr(act.name, act.expr, { kind: 'heal' });
        ctx.heal(res.total, act.name);
        return;
      }
      tray.rollExpr(act.name, act.expr, { kind: act.kind, crit: act.crit && e.shiftKey });
    }, { title: act.crit ? 'Shift-click to roll as a critical hit' : null });
  }

  return h('li', { class: 'action-card' },
    h('div', {}, h('h3', {}, act.name), h('p', { class: 'hint' }, act.desc), left !== null ? h('p', { class: 'hint' }, `${left} of ${def.max} uses left`) : null),
    button);
}

// ---------------------------------------------------------------- resources

/** Limited-use tracker (pips for small pools, a counter for big ones like Lay on Hands). */
function resourceRow(ctx, def) {
  const used = ctx.s.resUsed[def.key] || 0;
  const left = usesLeft(ctx.s, def);
  const set = (nextUsed) => ctx.update((x) => { x.sheet.resUsed[def.key] = Math.max(0, Math.min(def.max, nextUsed)); });
  const control = def.max <= 12
    ? pips({ total: def.max, filled: left, label: def.label, cls: 'uses', onToggle: (i) => set(def.max - (i < left ? i : i + 1)) })
    : h('span', { class: 'counter-ctl' },
      [-5, -1].map((n) => h('button', { type: 'button', class: 'btn small', onclick: () => set(used - n), 'aria-label': `Spend ${-n} from ${def.label}` }, `${n}`)),
      h('strong', {}, `${left} / ${def.max}`),
      [1, 5].map((n) => h('button', { type: 'button', class: 'btn small', onclick: () => set(used - n), 'aria-label': `Restore ${n} to ${def.label}` }, `+${n}`)));
  return h('li', { class: 'resource-row' },
    h('span', { class: 'resource-name' }, def.label, def.note ? h('small', {}, def.note) : null),
    control);
}

export function resourcesFor(ctx) {
  const { c, d } = ctx;
  return resourceDefs({ classId: c.classId, speciesId: c.speciesId, level: d.level, scores: d.scores });
}

// ---------------------------------------------------------------- panel

export function actionsTab(ctx) {
  const { c, d, view } = ctx;
  const attacks = buildAttacks(c, d);
  const defs = resourcesFor(ctx);
  const masteryNeed = R.weaponMasteryCount(c.classId, d.level);
  const masteryMissing = masteryNeed - c.masteries.length;
  const acts = classActions(c, d);
  const disadvantageNote = ['blinded', 'frightened', 'poisoned', 'prone', 'restrained'].filter((id) => c.sheet.conditions.includes(id));

  const targetId = 'target-ac';
  return h('div', { class: 'tab-body' },
    panel('Attacks',
      h('div', { class: 'row gap attack-tools' },
        h('div', { class: 'field inline' },
          h('label', { for: targetId }, 'Enemy AC (optional)'),
          h('input', {
            id: targetId, type: 'number', min: 0, max: 40, value: view.targetAC ?? '', placeholder: '—',
            oninput: (e) => { view.targetAC = e.target.value === '' ? null : Number(e.target.value); },
          })),
        h('div', { class: 'field inline' }, h('span', { class: 'stat-label' }, 'Roll mode (next d20)'), ctx.tray.modeControl())),
      h('p', { class: 'hint' }, 'A natural 20 always hits and the next Damage roll doubles the dice; a natural 1 always misses.'),
      disadvantageNote.length ? h('p', { class: 'notice warn' }, `Active conditions (${disadvantageNote.join(', ')}) usually impose Disadvantage on your attack rolls. Attack and ability check rolls apply it automatically; use Advantage to cancel it if it does not apply.`) : null,
      masteryMissing > 0 ? h('p', { class: 'notice' }, `You can choose ${masteryMissing} more weapon${masteryMissing > 1 ? 's' : ''} for Weapon Mastery. `,
        h('button', { type: 'button', class: 'btn small', onclick: () => masteryPicker(ctx, masteryNeed) }, 'Choose')) : null,
      masteryNeed > 0 ? h('p', { class: 'hint' }, `Weapon Mastery: ${c.masteries.length ? c.masteries.map((id) => resolveItem(id)?.item.name || id).join(', ') : 'none chosen'} `,
        h('button', { type: 'button', class: 'link-btn', onclick: () => masteryPicker(ctx, masteryNeed) }, 'Change')) : null,
      h('ul', { class: 'attack-list' }, attacks.map((a) => attackCard(ctx, a)))),
    acts.length ? panel('Class actions', h('ul', { class: 'action-list' }, acts.map((a) => actionCard(ctx, a, defs)))) : null,
    defs.length ? panel('Limited-use features',
      h('ul', { class: 'resource-list' }, defs.map((def) => resourceRow(ctx, def))),
      h('p', { class: 'hint' }, 'Short Rest and Long Rest buttons in the Hit Points panel restore these automatically.')) : null);
}

