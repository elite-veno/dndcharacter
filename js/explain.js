// "How it is calculated": pure explanations of every number on the sheet, with this character's real values.
// No DOM. Every figure comes from rules.js / the derived data `d` (character.js), never re-derived here, so the
// text cannot drift from the sheet. Rows carry a numeric `value` that tests cross-check against `d`.

import * as R from './rules.js';
import { ABILITIES, WEAPON_MASTERY, SUBCLASS_LABELS } from './data/index.js';
import { levelSlots } from './choices.js';
import { concentrationDC } from './sheet-state.js';

const fmt = R.formatMod;
const ABILITY_NAME = Object.fromEntries(ABILITIES.map((a) => [a.id, a.name]));
const ABBR = (id) => id.charAt(0).toUpperCase() + id.slice(1);
const FIXED_HIT_DIE_NOTE = (die) => `${die}/2 + 1 = ${Math.floor(die / 2) + 1}`;

/** "Chain Shirt 13 + Dex 2 (max 2) + Shield 2" from term objects { label, value, note? }. */
export function joinTerms(terms) {
  return terms.map((t, i) => {
    const body = `${t.label} ${i === 0 ? t.value : Math.abs(t.value)}${t.note ? ` (${t.note})` : ''}`;
    if (i === 0) return body;
    return `${t.value < 0 ? '-' : '+'} ${body}`;
  }).join(' ');
}

const row = (id, label, value, result, formula, note = null) => ({ id, label, value, result, formula, note });

// ---------------------------------------------------------------- groups

function basics(d) {
  const next = [5, 9, 13, 17].find((l) => l > d.level);
  return {
    id: 'basics', title: 'Level and Proficiency Bonus',
    why: 'Your level sets a Proficiency Bonus that you add to everything you are trained in: attacks, saves, skills and spell DCs.',
    rows: [
      row('pb', 'Proficiency Bonus', d.pb, fmt(d.pb), `2 + floor((${d.level} - 1) / 4) = 2 + ${Math.floor((d.level - 1) / 4)} = ${fmt(d.pb)}`,
        next ? `It rises by 1 at levels 5, 9, 13 and 17. Next increase: level ${next}.` : 'You are at the maximum of +6.'),
    ],
  };
}

function abilities(c, d) {
  const b = d.breakdown;
  const method = { standard: 'Standard Array', pointBuy: 'Point Buy', manual: 'Manual/rolled' }[c.abilityMethod] || 'Base';
  return {
    id: 'abilities', title: 'Ability scores and modifiers',
    why: 'A score is built from your base score, your background bonus and later improvements (level-up increases and feats), capped at 20. The modifier is floor((score - 10) / 2).',
    rows: ABILITIES.map((a) => {
      const parts = [`${method} ${b.base[a.id]}`];
      if (b.background[a.id]) parts.push(`+ ${b.background[a.id]} background`);
      if (b.advancement[a.id]) parts.push(`+ ${b.advancement[a.id]} level increases / feats`);
      const raw = b.base[a.id] + b.background[a.id] + b.advancement[a.id];
      const sum = parts.length > 1 ? `${parts.join(' ')} = ${d.scores[a.id]}${raw !== d.scores[a.id] ? ` (capped from ${raw})` : ''}` : `${parts[0]} = ${d.scores[a.id]}`;
      return row(`ability-${a.id}`, a.name, d.mods[a.id], `${d.scores[a.id]} (${fmt(d.mods[a.id])})`,
        `${sum}; modifier floor((${d.scores[a.id]} - 10) / 2) = ${fmt(d.mods[a.id])}`);
    }),
  };
}

function combat(c, d, sheet) {
  const hasAlert = d.feats.some((f) => f.id === 'alert');
  const ac = d.calc.ac;
  const acNotes = [];
  if (ac.mode === 'armor') {
    acNotes.push(`${d.calc.armor.name} is ${d.calc.armor.category} armor: base ${d.calc.armor.baseAC}, ${d.calc.armor.dexCap === null ? 'full Dexterity modifier' : d.calc.armor.dexCap > 0 ? `Dexterity modifier up to +${d.calc.armor.dexCap}` : 'no Dexterity modifier'}.`);
    if (!d.armorTraining.includes(d.calc.armor.category)) acNotes.push('You are not trained with this armor: Disadvantage on Strength and Dexterity D20 Tests and no spellcasting.');
  } else if (ac.mode === 'barbarian') acNotes.push('Barbarian Unarmored Defense: 10 + Dex + Con while wearing no armor (a Shield still counts).');
  else if (ac.mode === 'monk') acNotes.push('Monk Unarmored Defense: 10 + Dex + Wis while wearing no armor and no Shield.');
  else acNotes.push('No armor: 10 + Dex.');
  const sp = d.calc.speed;
  const speedParts = [{ label: 'Base speed', value: sp.base }];
  if (sp.classBonus) speedParts.push({ label: 'Class bonus', value: sp.classBonus });
  if (sp.strengthPenalty) speedParts.push({ label: 'Armor Strength requirement not met', value: -sp.strengthPenalty });
  const exh = sheet?.exhaustion || 0;
  return {
    id: 'combat', title: 'Initiative, Armor Class and Speed',
    why: 'Initiative is your Dexterity modifier. Armor Class depends on what you wear; Speed starts from your species and is changed by class features and armor.',
    rows: [
      row('initiative', 'Initiative', d.initiative, fmt(d.initiative),
        `Dex ${fmt(d.mods.dex)}${hasAlert ? ` + Alert (Proficiency Bonus) ${fmt(d.pb)}` : ''} = ${fmt(d.initiative)}`),
      row('ac', 'Armor Class', d.ac.ac, String(d.ac.ac), `${joinTerms(ac.terms)} = ${ac.total}`, acNotes.join(' ')),
      row('speed', 'Speed', d.speed, `${d.speed} ft`, `${joinTerms(speedParts)} = ${d.speed} ft`,
        `${d.species ? `${d.species.name} base speed. ` : ''}${exh ? `The Speed tile shows less while you have Exhaustion (-5 ft per level, currently ${exh}). ` : ''}Conditions such as Grappled or Restrained reduce it to 0.`),
    ],
  };
}

function hitPoints(d) {
  const prog = R.hpProgression({ hitDie: d.hitDie, level: d.level, conMod: d.mods.con, bonusPerLevel: d.calc.hpBonusPerLevel });
  const bonus = d.calc.hpBonusPerLevel;
  const running = prog.levels.map((l) => `L${l.level} ${l.running}`).join(' → ');
  return {
    id: 'hp', title: 'Hit Points and Hit Dice',
    why: 'Level 1 gives the maximum of your Hit Die. Every later level adds the fixed average of the die. Your Constitution modifier is added every level.',
    rows: [
      row('hp', 'Hit Point maximum', d.hp, `${d.hp} HP`,
        `Level 1: d${d.hitDie} max ${d.hitDie} ${fmt(d.mods.con)} Con${bonus ? ` ${fmt(bonus)} species` : ''} = ${prog.levels[0].gain}`
        + (d.level > 1 ? `; levels 2-${d.level}: (${FIXED_HIT_DIE_NOTE(d.hitDie)}) ${fmt(d.mods.con)} Con${bonus ? ` ${fmt(bonus)} species` : ''} = ${prog.levels[1].gain} each, x ${d.level - 1} = ${prog.total - prog.levels[0].gain}` : '')
        + `; total ${prog.total}`,
        `A level never gives less than 1 HP before bonuses.${bonus ? ' Your species adds +1 HP per level.' : ''}`),
      row('hp-running', 'HP running total', d.hp, `${d.hp} HP`, running, 'Total after each level. Lowering your level removes the newest levels again.'),
      row('hitdice', 'Hit Dice', d.level, `${d.level}d${d.hitDie}`, `One d${d.hitDie} per level = ${d.level}`,
        `Short Rest: spend dice, each heals d${d.hitDie} ${fmt(d.mods.con)} Con. Long Rest: regain half your total Hit Dice (minimum 1), rounded down.`),
    ],
  };
}

function saves(d) {
  return {
    id: 'saves', title: 'Saving throws',
    why: 'A saving throw is your ability modifier, plus your Proficiency Bonus for the two abilities your class is trained in.',
    rows: d.saves.map((sv) => {
      const mod = d.mods[sv.ability];
      return row(`save-${sv.ability}`, `${ABILITY_NAME[sv.ability]} save`, sv.bonus, fmt(sv.bonus),
        `${ABBR(sv.ability)} ${fmt(mod)}${sv.proficient ? ` + proficiency ${fmt(d.pb)}` : ' (not proficient)'} = ${fmt(sv.bonus)}`);
    }),
  };
}

export function skillTerms(sk, d) {
  const mod = d.mods[sk.ability];
  const terms = [{ label: ABBR(sk.ability), value: mod }];
  if (sk.proficiency === 2) terms.push({ label: 'expertise (double proficiency)', value: d.pb * 2 });
  else if (sk.proficiency === 1) terms.push({ label: 'proficiency', value: d.pb });
  else if (d.calc.jackOfAllTrades) terms.push({ label: 'Jack of All Trades (half proficiency)', value: Math.floor(d.pb / 2) });
  return terms;
}

function skills(d) {
  const perception = d.skills.find((s) => s.id === 'perception');
  const passive = (id, label) => {
    const sk = d.skills.find((s) => s.id === id);
    return row(`passive-${id}`, `Passive ${label}`, R.passiveScore(sk.bonus), String(R.passiveScore(sk.bonus)), `10 + ${label} ${fmt(sk.bonus)} = ${R.passiveScore(sk.bonus)}`);
  };
  return {
    id: 'skills', title: 'Skills and passive scores',
    why: 'A skill check adds the linked ability modifier, plus your Proficiency Bonus if trained (doubled with Expertise). A passive score is 10 + the skill bonus, as if you had rolled a 10.',
    rows: [
      row('passive-perception', 'Passive Perception', d.passivePerception, String(d.passivePerception), `10 + Perception ${fmt(perception.bonus)} = ${d.passivePerception}`),
      passive('insight', 'Insight'),
      passive('investigation', 'Investigation'),
      ...d.skills.map((sk) => {
        const terms = skillTerms(sk, d);
        return row(`skill-${sk.id}`, `${sk.name} (${sk.ability.toUpperCase()})`, sk.bonus, fmt(sk.bonus),
          `${joinTerms(terms)} = ${fmt(sk.bonus)}`);
      }),
    ],
  };
}

function abilityReason(a, d) {
  if (!a.weapon) return d.cls?.id === 'monk' ? 'Monk Martial Arts: the better of Strength and Dexterity.' : 'Unarmed Strikes use Strength.';
  const p = a.weapon.properties;
  if (p.includes('finesse')) return 'Finesse: you use the better of Strength and Dexterity.';
  if (d.cls?.id === 'monk' && a.ability !== (a.weapon.type === 'ranged' ? 'dex' : 'str')) return 'Monk Martial Arts: a Simple or Light melee weapon may use Dexterity.';
  return a.weapon.type === 'ranged' ? 'Ranged weapons use Dexterity.' : 'Melee weapons use Strength.';
}

function attacksGroup(c, d, attacks) {
  const rows = [];
  for (const a of attacks) {
    const mod = d.mods[a.ability];
    const prof = a.proficient ? d.pb : 0;
    const magic = a.magic || 0;
    const style = a.attackBonus - mod - prof - magic;
    const attackTerms = [{ label: ABBR(a.ability), value: mod }];
    attackTerms.push({ label: a.proficient ? 'proficiency' : 'proficiency (not proficient, so 0)', value: prof });
    if (magic) attackTerms.push({ label: 'magic bonus', value: magic });
    if (style) attackTerms.push({ label: 'Archery style', value: style });
    rows.push(row(`atk-${a.key}`, `${a.name}: attack bonus`, a.attackBonus, fmt(a.attackBonus),
      `${joinTerms(attackTerms)} = ${fmt(a.attackBonus)}`, abilityReason(a, d)));

    const rage = a.rage || 0;
    const abilityPart = a.damageBonus - magic - rage;
    const dmgTerms = [];
    if (a.flat) dmgTerms.push({ label: 'Unarmed base', value: 1 });
    dmgTerms.push({ label: ABBR(a.ability), value: abilityPart });
    if (magic) dmgTerms.push({ label: 'magic bonus', value: magic });
    if (rage) dmgTerms.push({ label: 'Rage', value: rage });
    const dmgNotes = [];
    if (a.offhand) dmgNotes.push(abilityPart === 0 ? 'Off-hand attack: the ability modifier is not added to damage (it would be if it were negative, or with Two-Weapon Fighting).' : 'Off-hand attack: the modifier is still added (negative, or Two-Weapon Fighting).');
    if (a.twoHanded) dmgNotes.push('Held in two hands (Versatile damage die).');
    if (a.greatWeapon) dmgNotes.push('Great Weapon Fighting: damage dice that roll 1 or 2 count as 3.');
    if (a.weapon) dmgNotes.push(`Damage type: ${a.damageType}. A critical hit doubles the dice, not the modifier.`);
    const dmgValue = a.flat ? Math.max(0, 1 + abilityPart + magic + rage) : a.damageBonus;
    rows.push(row(`dmg-${a.key}`, `${a.name}: damage`, dmgValue,
      a.flat ? `${dmgValue} ${a.damageType}` : `${a.damageBonus === 0 ? a.damageDice : `${a.damageDice}${fmt(a.damageBonus)}`} ${a.damageType}`,
      a.flat ? `${joinTerms(dmgTerms)} = ${dmgValue}` : `${a.damageDice} + ${joinTerms(dmgTerms)}`,
      dmgNotes.join(' ') || null));

    if (a.weapon && a.masteryActive) {
      const m = WEAPON_MASTERY[a.weapon.mastery];
      const dc = 8 + mod + d.pb;
      rows.push(row(`mastery-${a.key}`, `${a.name}: ${m.name} (mastery)`, a.masteryDC, `DC ${dc}`,
        `8 + ${ABBR(a.ability)} ${fmt(mod)} + proficiency ${fmt(d.pb)} = ${dc}`, `${m.desc} The DC applies only when the mastery forces a saving throw.`));
    }
  }
  return {
    id: 'attacks', title: 'Weapon attacks and damage',
    why: 'An attack roll adds an ability modifier (Finesse and Monk weapons may use Dexterity, ranged weapons use Dexterity, others use Strength) and your Proficiency Bonus if you are trained with the weapon. Damage adds the same modifier. Mastery needs the weapon to be unlocked.',
    rows,
  };
}

function spellcasting(c, d) {
  const sc = d.spellcasting;
  if (!sc) return null;
  const mod = d.mods[sc.ability];
  const label = { full: 'full caster', half: 'half caster', pact: 'Pact Magic' }[sc.type] || sc.type;
  const slotText = sc.pact ? `${sc.pact.count} x level ${sc.pact.slotLevel} slot${sc.pact.count > 1 ? 's' : ''}`
    : sc.slots.map((n, i) => (n ? `${n} x level ${i + 1}` : null)).filter(Boolean).join(', ') || 'none yet';
  const slotTotal = sc.pact ? sc.pact.count : sc.slots.reduce((a, b) => a + b, 0);
  const rows = [
    row('spell-ability', 'Spellcasting ability', mod, `${ABILITY_NAME[sc.ability]} (${fmt(mod)})`, `${d.cls.name} casts with ${ABILITY_NAME[sc.ability]}: modifier ${fmt(mod)}`),
    row('spell-dc', 'Spell save DC', sc.saveDC, String(sc.saveDC), `8 + proficiency ${fmt(d.pb)} + ${ABBR(sc.ability)} ${fmt(mod)} = ${sc.saveDC}`, 'Targets of your spells roll a saving throw against this number.'),
    row('spell-attack', 'Spell attack bonus', sc.attackBonus, fmt(sc.attackBonus), `proficiency ${fmt(d.pb)} + ${ABBR(sc.ability)} ${fmt(mod)} = ${fmt(sc.attackBonus)}`),
    row('spell-slots', 'Spell slots', slotTotal, slotText,
      `${d.cls.name} level ${d.level} on the ${label} table: ${slotText}`,
      sc.type === 'half' ? 'Half casters start casting at level 2 and reach 5th-level slots at 17.'
        : sc.type === 'pact' ? 'Pact Magic slots are few but always at your highest slot level, and they refresh on a Short Rest.'
          : 'Full casters gain new slot levels as they level; slots refresh on a Long Rest.'),
    row('spell-prepared', 'Prepared spells', sc.preparedSpells, String(sc.preparedSpells), `${d.cls.name} level ${d.level} prepared-spell table = ${sc.preparedSpells}${sc.cantripsKnown ? `; cantrips known = ${sc.cantripsKnown}` : ''}`,
      'You can swap prepared spells after a Long Rest.'),
  ];
  if (sc.cantripsKnown || c.cantrips.length) {
    const dice = R.cantripDice(d.level);
    rows.push(row('cantrip-dice', 'Cantrip damage dice', dice, `${dice}x dice`, `1 + (level 5: +1) + (level 11: +1) + (level 17: +1) at level ${d.level} = ${dice}`, `A 1d10 cantrip becomes ${R.scaleCantripDice('1d10', d.level)}.`));
  }
  return {
    id: 'spells', title: 'Spellcasting',
    why: 'Your spellcasting ability sets how hard your spells are to resist and how well your spell attacks hit. Your class and level decide your slots and how many spells you can prepare.',
    rows,
  };
}

function carrying(d, weight) {
  const cap = R.carryingCapacity({ strength: d.scores.str, size: d.size });
  const mult = cap.capacity / (d.scores.str * 15);
  const jump = R.jumpDistances(d.scores.str);
  const pct = cap.capacity ? Math.round((weight / cap.capacity) * 100) : 0;
  return {
    id: 'carry', title: 'Carrying capacity and jumping',
    why: 'You can carry 15 pounds for every point of Strength (more for larger creatures). You can push, drag or lift double that.',
    rows: [
      row('capacity', 'Carrying capacity', cap.capacity, `${cap.capacity} lb`, `Strength ${d.scores.str} x 15${mult !== 1 ? ` x ${mult} (${d.size})` : ''} = ${cap.capacity} lb`),
      row('lift', 'Push, drag or lift', cap.pushDragLift, `${cap.pushDragLift} lb`, `${cap.capacity} x 2 = ${cap.pushDragLift} lb`),
      row('encumbrance', 'Carried weight', Math.round(weight * 100) / 100, `${Math.round(weight * 100) / 100} lb`,
        `${Math.round(weight * 100) / 100} of ${cap.capacity} lb carried (${pct}%)`,
        weight > cap.capacity ? 'You carry more than your capacity: your DM decides the effect (this sheet only compares the weights).' : 'Within your capacity, so nothing slows you down.'),
      row('long-jump', 'Long jump', jump.longJump, `${jump.longJump} ft`, `Strength score ${d.scores.str} ft (with a 10 ft running start)`),
      row('high-jump', 'High jump', jump.highJump, `${jump.highJump} ft`, `3 + Str ${fmt(d.mods.str)} = ${jump.highJump} ft (minimum 0)`),
    ],
  };
}

function restRules(d) {
  return {
    id: 'rules', title: 'Inspiration, death saves and rests',
    why: 'Short reminders of the rules the sheet applies for you.',
    rows: [
      row('inspiration', 'Heroic Inspiration', null, 'Reroll one die', 'Spend it to reroll any die right after you roll it, and use the new roll.', 'You can hold only one at a time. Your DM awards it for heroic play.'),
      row('death', 'Death saving throws', null, 'DC 10', 'At 0 HP roll a d20 on your turn: 10+ is a success, 9 or less a failure. Three successes: stable. Three failures: dead.', 'A natural 20 returns you to 1 HP; a natural 1 counts as two failures. Damage at 0 HP is a failure (two on a critical hit).'),
      row('short-rest', 'Short Rest', null, '1 hour', `Spend Hit Dice to heal: each die heals d${d.hitDie} ${fmt(d.mods.con)} Con.`, 'Also recharges short-rest features and Pact Magic slots.'),
      row('long-rest', 'Long Rest', null, '8 hours', `Regain all HP (${d.hp}), half your Hit Dice (${Math.max(1, Math.floor(d.level / 2))}), all spell slots and features, and lose 1 Exhaustion.`),
      row('concentration', 'Concentration save', null, 'DC 10 or more', `Constitution save DC = higher of 10 and half the damage (e.g. 30 damage: DC ${concentrationDC(30)}); your Con save is ${fmt(d.saves.find((s) => s.ability === 'con').bonus)}.`),
      row('exhaustion', 'Exhaustion', null, '-2 per level', 'Each level: D20 Tests -2 and Speed -5 ft. At level 6 you die.'),
    ],
  };
}

/** One row per class resource that scales with level, with the numbers for this character. */
export function classResourceRows(c, d) {
  const r = d.classResources || {};
  const L = d.level;
  const rows = [];
  const add = (id, label, value, formula) => rows.push(row(`scale-${id}`, label, typeof value === 'number' ? value : null, String(value), formula));
  switch (c.classId) {
    case 'barbarian':
      add('rages', 'Rages per Long Rest', r.rages, 'Class table: 2 at level 1, 3 at 3, 4 at 6, 5 at 12, 6 at 17, unlimited at 20.');
      add('rage-damage', 'Rage damage bonus', r.rageDamage, `Class table: +2 from level 1, +3 at 9, +4 at 16 (level ${L}: +${r.rageDamage}).`);
      break;
    case 'bard':
      add('inspiration-die', 'Bardic Inspiration die', `d${r.inspirationDie}`, 'd6, d8 at level 5, d10 at level 10, d12 at level 15.');
      add('inspiration-uses', 'Bardic Inspiration uses', r.inspirationUses, `Charisma modifier ${fmt(d.mods.cha)}, minimum 1 = ${r.inspirationUses}.`);
      break;
    case 'fighter':
      add('second-wind', 'Second Wind uses', r.secondWind, '2 uses, 3 at level 4, 4 at level 10. Heals 1d10 + fighter level.');
      add('action-surge', 'Action Surge uses', r.actionSurge, '1 use from level 2, 2 uses at level 17.');
      add('extra-attacks', 'Extra Attacks', r.extraAttacks, '1 extra at level 5, 2 at level 11, 3 at level 20.');
      break;
    case 'monk':
      add('martial-arts', 'Martial Arts die', `d${r.martialArtsDie}`, 'd6, d8 at level 5, d10 at level 11, d12 at level 17.');
      add('focus', 'Focus Points', r.focusPoints, `Equal to your Monk level from level 2 = ${r.focusPoints}.`);
      add('focus-dc', 'Focus save DC', r.focusSaveDC, `8 + proficiency ${fmt(d.pb)} + Wis ${fmt(d.mods.wis)} = ${r.focusSaveDC}.`);
      break;
    case 'paladin':
      add('lay-on-hands', 'Lay on Hands pool', r.layOnHands, `5 x level ${L} = ${r.layOnHands} HP.`);
      add('channel', 'Channel Divinity uses', r.channelDivinity, '2 uses from level 3, 3 uses at level 11.');
      break;
    case 'rogue':
      add('sneak', 'Sneak Attack', r.sneakAttack, `ceil(${L} / 2) = ${Math.ceil(L / 2)} d6.`);
      break;
    case 'sorcerer':
      add('sorcery', 'Sorcery Points', r.sorceryPoints, `Equal to your Sorcerer level from level 2 = ${r.sorceryPoints}.`);
      break;
    case 'warlock':
      add('invocations', 'Eldritch Invocations', r.invocations, 'Class table: more invocations at higher levels.');
      break;
    case 'wizard':
      add('spellbook', 'Spells in your spellbook', r.spellbookSpells, `6 at level 1, +2 each later level: 6 + 2 x (${L} - 1) = ${r.spellbookSpells}.`);
      add('arcane-recovery', 'Arcane Recovery', r.arcaneRecoveryLevels, `Recover slots totaling ceil(${L} / 2) = ${r.arcaneRecoveryLevels} spell levels on a Short Rest.`);
      break;
    default: break;
  }
  return rows;
}

function scaling(c, d) {
  const slots = levelSlots(c.classId, d.level);
  const allSlots = levelSlots(c.classId, R.MAX_LEVEL);
  const upcoming = allSlots.filter((s) => s.level > d.level).map((s) => s.level);
  const rows = [
    row('scale-asi', 'Ability Score Improvements and feats', slots.length, `${slots.length} earned`,
      `Levels: ${allSlots.map((s) => `${s.level}${s.kind === 'boon' ? ' (Epic Boon)' : ''}`).join(', ')}`,
      `Each one gives +2 to one score, +1 to two scores, or a feat (max 20; Epic Boons may reach 30). ${upcoming.length ? `Next at level ${upcoming[0]}.` : 'All earned.'}`),
  ];
  const cls = d.cls;
  if (cls) {
    const label = SUBCLASS_LABELS[cls.id] || 'Subclass';
    const sub = d.subclass;
    const options = cls.subclass.map((x) => x.name).join(', ');
    const features = sub ? sub.features.map((f) => `${f.name} (level ${R.subclassGrantLevel(f.level)})`).join(', ') : '';
    rows.push(row('scale-subclass', `${label} (subclass)`, d.level >= 3 ? 1 : 0,
      d.level < 3 ? 'Unlocks at level 3' : sub ? sub.name : 'Not chosen yet',
      d.level < 3 ? `At level 3 you choose a ${label}: ${options}.`
        : sub ? `Chosen at level 3. Features: ${features}.` : `Choose one of: ${options}.`,
      `Subclasses are 2014 subclasses (Player's Handbook, Xanathar's, Tasha's, Fizban's) and are chosen at level 3 under the 2024 rules; their features arrive at the levels shown.`));
  }
  if (d.spellcasting) rows.push(row('scale-slots', 'Spell slots by level', null, `${R.highestSpellLevel(d.spellcasting.type, d.level)} max slot level`,
    `The class table gives your highest slot level at level ${d.level}: ${R.highestSpellLevel(d.spellcasting.type, d.level)}.`));
  rows.push(...classResourceRows(c, d));
  return {
    id: 'scaling', title: 'How things scale with level',
    why: 'These values grow as you level up; the numbers shown are the ones you have now.',
    rows,
  };
}

/**
 * Everything the Calculations tab shows: [{ id, title, why, rows: [{ id, label, value, result, formula, note }] }].
 * `attacks` is buildAttacks(c, d) (combat.js); `weight` the carried weight in pounds; `sheet` the play state.
 */
export function explainCharacter({ c, d, attacks = [], weight = 0, sheet = null }) {
  return [
    basics(d), abilities(c, d), combat(c, d, sheet), hitPoints(d), saves(d), skills(d),
    attacksGroup(c, d, attacks), spellcasting(c, d), carrying(d, weight), scaling(c, d), restRules(d),
  ].filter(Boolean);
}

/** Id of the group holding a row, or null. */
export const groupOfRow = (groups, rowId) => groups.find((g) => g.rows.some((r) => r.id === rowId))?.id || null;
