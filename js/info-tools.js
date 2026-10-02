// Interactive worked examples for the Info tab. All maths comes from rules.js.

import { h, mount } from './ui.js';
import { abilityMod, formatMod, proficiencyBonus, calculateAC, applyDamageModifiers, abilityMods } from './rules.js';
import { ARMOR, DAMAGE_TYPES } from './data/index.js';

const num = (value, fallback = 0) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

function field(label, control, id) {
  return h('div', { class: 'field' }, h('label', { for: id }, label), control);
}

function check(label, id, onchange) {
  return h('div', { class: 'field inline' }, h('input', { type: 'checkbox', id, onchange }), h('label', { for: id }, label));
}

let toolCount = 0;
const nextId = (prefix) => `${prefix}-${++toolCount}`;

/** Armor Class calculator: armor formula, Dex cap, shield, Unarmored Defense, Defense style, cover. */
export function acCalculator() {
  const id = nextId('ac');
  const armorSelect = h('select', { id: `${id}-armor`, onchange: update },
    h('option', { value: '' }, 'No armor'),
    ARMOR.map((a) => h('option', { value: a.id }, `${a.name} (${a.category}, AC ${a.baseAC})`)));
  const dex = h('input', { type: 'number', id: `${id}-dex`, min: 1, max: 30, value: 14, oninput: update });
  const con = h('input', { type: 'number', id: `${id}-con`, min: 1, max: 30, value: 14, oninput: update });
  const wis = h('input', { type: 'number', id: `${id}-wis`, min: 1, max: 30, value: 14, oninput: update });
  const unarmored = h('select', { id: `${id}-ud`, onchange: update },
    h('option', { value: '' }, 'None'),
    h('option', { value: 'barbarian' }, 'Barbarian: 10 + Dex + Con'),
    h('option', { value: 'monk' }, 'Monk: 10 + Dex + Wis (no shield)'));
  const cover = h('select', { id: `${id}-cover`, onchange: update },
    h('option', { value: '0' }, 'No cover'),
    h('option', { value: '2' }, 'Half cover (+2)'),
    h('option', { value: '5' }, 'Three-quarters cover (+5)'));
  const shield = check('Carrying a Shield (+2)', `${id}-shield`, update);
  const defense = check('Defense fighting style (+1 while wearing armor)', `${id}-def`, update);
  const result = h('div', { class: 'info-result', 'aria-live': 'polite' });

  function update() {
    const armor = ARMOR.find((a) => a.id === armorSelect.value) || null;
    const mods = abilityMods({ str: 10, dex: num(dex.value, 10), con: num(con.value, 10), int: 10, wis: num(wis.value, 10), cha: 10 });
    const { ac, formula } = calculateAC({
      armor,
      shield: shield.querySelector('input').checked,
      mods,
      unarmoredDefense: unarmored.value || null,
      defenseStyle: defense.querySelector('input').checked,
    });
    const coverBonus = num(cover.value);
    const notes = [];
    if (armor && armor.dexCap !== null) {
      notes.push(armor.dexCap === 0 ? 'Heavy armor ignores your Dex modifier.' : `Dex bonus is capped at +${armor.dexCap} in ${armor.category} armor.`);
    }
    if (armor && unarmored.value) notes.push('Unarmored Defense only applies when you wear no armor.');
    if (armor && armor.strength) notes.push(`Needs Strength ${armor.strength}, or your Speed drops by 10 ft.`);
    mount(result,
      h('p', { class: 'info-big' }, h('strong', {}, `AC ${ac + coverBonus}`), coverBonus ? ` (${ac} base ${formatMod(coverBonus)} cover)` : ''),
      h('p', { class: 'hint' }, `${formula}${coverBonus ? ` ${formatMod(coverBonus)} cover` : ''}`),
      notes.length ? h('ul', { class: 'hint' }, notes.map((n) => h('li', {}, n))) : null,
      h('p', { class: 'hint' }, `An attacker needs to roll ${ac + coverBonus} or higher on a d20 plus their attack bonus (a natural 20 always hits, a natural 1 always misses).`));
  }

  update();
  return h('div', { class: 'info-tool' },
    h('h4', {}, 'Armor Class calculator'),
    h('div', { class: 'form-grid' },
      field('Armor', armorSelect, `${id}-armor`),
      field('Dexterity score', dex, `${id}-dex`),
      field('Constitution score', con, `${id}-con`),
      field('Wisdom score', wis, `${id}-wis`),
      field('Unarmored Defense', unarmored, `${id}-ud`),
      field('Cover', cover, `${id}-cover`)),
    shield, defense, result);
}

/** Damage calculator: resistance, vulnerability, immunity and temporary Hit Points. */
export function damageCalculator() {
  const id = nextId('dmg');
  const amount = h('input', { type: 'number', id: `${id}-amt`, min: 0, max: 999, value: 13, oninput: update });
  const type = h('select', { id: `${id}-type`, onchange: update }, DAMAGE_TYPES.map((t) => h('option', { value: t }, t)));
  const hp = h('input', { type: 'number', id: `${id}-hp`, min: 0, max: 999, value: 20, oninput: update });
  const maxHp = h('input', { type: 'number', id: `${id}-max`, min: 1, max: 999, value: 30, oninput: update });
  const temp = h('input', { type: 'number', id: `${id}-temp`, min: 0, max: 999, value: 5, oninput: update });
  const mode = h('select', { id: `${id}-mode`, onchange: update },
    h('option', { value: 'none' }, 'Normal damage'),
    h('option', { value: 'resistance' }, 'Resistance (halve)'),
    h('option', { value: 'vulnerability' }, 'Vulnerability (double)'),
    h('option', { value: 'both' }, 'Resistance and Vulnerability'),
    h('option', { value: 'immunity' }, 'Immunity'));
  const result = h('div', { class: 'info-result', 'aria-live': 'polite' });

  function update() {
    const dmg = applyDamageModifiers({
      amount: Math.max(0, num(amount.value)),
      resistance: mode.value === 'resistance' || mode.value === 'both',
      vulnerability: mode.value === 'vulnerability' || mode.value === 'both',
      immunity: mode.value === 'immunity',
    });
    const startHp = Math.min(Math.max(0, num(hp.value)), Math.max(1, num(maxHp.value, 1)));
    const max = Math.max(1, num(maxHp.value, 1));
    const startTemp = Math.max(0, num(temp.value));
    const absorbed = Math.min(startTemp, dmg.final);
    const toHp = dmg.final - absorbed;
    const left = Math.max(0, startHp - toHp);
    const overflow = Math.max(0, toHp - startHp);
    let outcome;
    if (toHp === 0) outcome = `You stay at ${startHp} HP.`;
    else if (left > 0) outcome = `You drop to ${left} HP.`;
    else if (overflow >= max) outcome = `Instant death: the ${overflow} damage left over at 0 HP is at least your maximum (${max}).`;
    else outcome = 'You drop to 0 HP and fall Unconscious. Start making death saving throws.';
    mount(result,
      h('p', { class: 'info-big' }, h('strong', {}, `${dmg.final} ${type.value} damage taken`)),
      h('ol', { class: 'hint' }, dmg.steps.map((s) => h('li', {}, s))),
      h('p', { class: 'hint' }, `Temporary HP absorbs ${absorbed} first (${startTemp - absorbed} left). ${outcome}`));
  }

  update();
  return h('div', { class: 'info-tool' },
    h('h4', {}, 'Damage calculator'),
    h('div', { class: 'form-grid' },
      field('Damage rolled', amount, `${id}-amt`),
      field('Damage type', type, `${id}-type`),
      field('Target modifier', mode, `${id}-mode`),
      field('Current HP', hp, `${id}-hp`),
      field('Maximum HP', maxHp, `${id}-max`),
      field('Temporary HP', temp, `${id}-temp`)),
    result);
}

/** Ability score to modifier, with proficiency bonus, saving throw / skill / attack / spell DC for a chosen level. */
export function modifierCalculator() {
  const id = nextId('mod');
  const score = h('input', { type: 'number', id: `${id}-score`, min: 1, max: 30, value: 16, oninput: update });
  const level = h('input', { type: 'number', id: `${id}-level`, min: 1, max: 20, value: 3, oninput: update });
  const result = h('div', { class: 'info-result', 'aria-live': 'polite' });

  function update() {
    const s = Math.min(30, Math.max(1, num(score.value, 10)));
    const l = Math.min(20, Math.max(1, num(level.value, 1)));
    const mod = abilityMod(s);
    const pb = proficiencyBonus(l);
    mount(result,
      h('ul', { class: 'info-list-plain' },
        h('li', {}, `Modifier: (${s} - 10) / 2, rounded down = `, h('strong', {}, formatMod(mod))),
        h('li', {}, `Proficiency Bonus at level ${l}: `, h('strong', {}, formatMod(pb))),
        h('li', {}, 'Ability check or save without proficiency: d20 ', h('strong', {}, formatMod(mod))),
        h('li', {}, 'Skill check or save with proficiency: d20 ', h('strong', {}, formatMod(mod + pb))),
        h('li', {}, 'Expertise (double proficiency): d20 ', h('strong', {}, formatMod(mod + 2 * pb))),
        h('li', {}, 'Attack roll (proficient): d20 ', h('strong', {}, formatMod(mod + pb))),
        h('li', {}, 'Spell save DC: 8 + ', `${pb} + ${mod} = `, h('strong', {}, 8 + pb + mod))));
  }

  update();
  return h('div', { class: 'info-tool' },
    h('h4', {}, 'Modifier and bonus calculator'),
    h('div', { class: 'form-grid' },
      field('Ability score (1-30)', score, `${id}-score`),
      field('Character level (1-20)', level, `${id}-level`)),
    result);
}
