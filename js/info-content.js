// Content for the Info tab (2024 / 5.5e rules, SRD 5.2 CC-BY-4.0). Each section builds its own DOM.
// Elements with class "info-item" are filtered individually by the search box.

import { h } from './ui.js';
import { abilityMod, formatMod, proficiencyBonus, MAX_LEVEL, calculateAC, abilityMods } from './rules.js';
import {
  ABILITIES, SKILLS, CONDITIONS, ACTIONS, DAMAGE_TYPES, REST_RULES, WEAPON_MASTERY, WEAPON_PROPERTIES,
  ARMOR, ARMOR_BY_ID, ARMOR_RULES, XP_THRESHOLDS, FULL_CASTER_SLOTS,
} from './data/index.js';
import { acCalculator, damageCalculator, modifierCalculator } from './info-tools.js';

const p = (html) => h('p', { html });
const ul = (items) => h('ul', {}, items.map((i) => h('li', { html: i })));
const ol = (items) => h('ol', {}, items.map((i) => h('li', { html: i })));
const item = (title, html) => h('div', { class: 'info-item' }, h('h4', {}, title), h('p', { html }));
const tip = (html) => h('p', { class: 'info-tip', html });
const table = (head, rows, caption) => h('div', { class: 'table-wrap info-item' },
  h('table', { class: 'info-table' },
    caption ? h('caption', {}, caption) : null,
    h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => h(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : {}, c)))))));

/** One or two short worked examples per action (shown under the rules text). */
const ACTION_EXAMPLES = {
  Attack: [
    'A level 5 Fighter (Str +3, Proficiency +3) swings a longsword: d20 + 6 against the goblin\'s AC 15. A total of 15 or more hits, and a hit deals 1d8 + 3 damage. With Extra Attack she makes two such swings.',
    'Throwing a handaxe from 20 feet is also an Attack action: use the same bonus (Str or Dex per the weapon), and a thrown weapon uses its normal range.',
  ],
  Dash: [
    'Speed 30 ft. Using Dash gives you 30 ft. extra movement, so you can move up to 60 ft. this turn: running to the far side of a room to reach the archer.',
    'In difficult terrain every foot still costs double, so with Speed 30 and Dash you cross only 30 ft. of rubble (60 ft. of movement / 2).',
  ],
  Disengage: [
    'You are in melee with an ogre and want to retreat to the cleric. Take Disengage, then walk away: the ogre cannot use its Reaction for an Opportunity Attack when you leave its reach.',
    'It only protects your own movement this turn; allies next to the ogre are not affected.',
  ],
  Dodge: [
    'Three bandits are shooting at your Rogue, who has no good attack this turn. She takes Dodge: until her next turn every attack roll against her has Disadvantage (if the attacker can see her), and she has Advantage on Dexterity saves such as against a Fireball.',
    'If you are Incapacitated or your Speed drops to 0, the benefit ends.',
  ],
  Help: [
    'Ability check: the Rogue is proficient in Thieves\' Tools and picks a lock. The Wizard uses Help (he must be proficient too) so the Rogue rolls the check with Advantage.',
    'Attack: the Barbarian stands next to a troll and uses Help to distract it. The Paladin\'s next attack against the troll before the start of the Barbarian\'s next turn has Advantage.',
  ],
  Hide: [
    'Standing behind a stone pillar (Three-Quarters Cover) your Ranger rolls Dexterity (Stealth): d20 + 5 = 17 against DC 15. She is Invisible until she attacks, casts a spell or is found.',
    'Hiding in plain sight with no cover or heavy obscurement is not possible: the DM will not allow the action.',
  ],
  Influence: [
    'The Bard tries to convince the guard to let the party in: Charisma (Persuasion), d20 + 5 against a DM-set DC (for example 15 for a bribable guard).',
    'The Barbarian growls at a thug: Charisma (Intimidation). The Druid calms a wild boar with Wisdom (Animal Handling).',
  ],
  Magic: [
    'The Wizard casts Fire Bolt (casting time: Action): a ranged spell attack, d20 + 6 against AC, dealing 2d10 fire damage at level 5.',
    'Activating a magic item whose description says it uses the Magic action (for example a wand) also uses this action. Drinking a potion is different: that is a Bonus Action.',
  ],
  Ready: [
    '"If the cultist steps through the door, I shoot him." Take Ready with the trigger "a cultist steps through the door". When it happens (before your next turn) you use your Reaction to attack. You do not get the attack if the trigger never occurs.',
    'Readying a spell: the Wizard readies Magic Missile with the same trigger. She casts it when the trigger happens, uses the slot immediately, and must keep Concentration until then.',
  ],
  Search: [
    'The party hears something in the corridor. The Ranger uses Search: Wisdom (Perception) d20 + 5 against the DM\'s DC to spot the hidden tripwire.',
    'Tracking footprints in mud is Wisdom (Survival); working out what poison killed a guard is Wisdom (Medicine).',
  ],
  Study: [
    'The Wizard examines a strange rune: Intelligence (Arcana) d20 + 5, DC 15, to recall what it does.',
    'Looking through the library for a clue about the baron\'s family is Intelligence (History) or (Investigation), depending on whether he remembers or deduces.',
  ],
  Utilize: [
    'Pulling a lever, lighting a torch with a tinderbox or tying a rope around a post are done with Utilize. Opening an unlocked door or drawing a weapon is instead your free object interaction.',
    'Donning or doffing a Shield also costs the Utilize action.',
  ],
};
const exampleBlock = (name) => {
  const list = ACTION_EXAMPLES[name];
  if (!list) return null;
  return h('div', { class: 'info-example' }, h('strong', {}, list.length > 1 ? 'Examples' : 'Example'), h('ul', {}, list.map((t) => h('li', { html: t }))));
};

const skillsByAbility = (id) => SKILLS.filter((s) => s.ability === id).map((s) => s.name).join(', ') || 'None';

/** Worked AC examples are computed with the real rules engine so they never drift from the sheet. */
function acExample(label, { armor = null, shield = false, scores, unarmoredDefense = null, defenseStyle = false }) {
  const mods = abilityMods({ str: 10, int: 10, cha: 10, ...scores });
  const { ac, formula } = calculateAC({ armor: armor ? ARMOR_BY_ID[armor] : null, shield, mods, unarmoredDefense, defenseStyle });
  return [label, formula, h('strong', {}, String(ac))];
}

const GLOSSARY = [
  ['Advantage / Disadvantage', 'Roll two d20s and take the higher (Advantage) or lower (Disadvantage). Multiple sources never stack, and if you have both, they cancel out.'],
  ['Armor Class (AC)', 'The number an attack roll must meet or beat to hit you.'],
  ['Bloodied', 'A common shorthand for a creature at half its Hit Points or fewer. Not a formal condition.'],
  ['Bonus Action', 'A quick action available only when a feature or spell grants one. At most one per turn.'],
  ['Concentration', 'Keeping a spell active. Only one concentration spell at a time; damage or Incapacitated can break it.'],
  ['Critical Hit', 'A natural 20 on an attack roll. Roll the attack\'s damage dice twice and add modifiers once.'],
  ['d20 Test', 'An ability check, saving throw or attack roll.'],
  ['DC (Difficulty Class)', 'The target number for an ability check or saving throw.'],
  ['Expertise', 'Double your Proficiency Bonus on a chosen skill or tool.'],
  ['Heroic Inspiration', 'A reward that lets you reroll one die (and keep the new roll). You can hold only one.'],
  ['Hit Point Dice', 'Dice spent during a Short Rest to heal. You have one per level, of your class\'s Hit Die type.'],
  ['Initiative', 'A Dexterity check made at the start of combat to set turn order.'],
  ['Modifier', 'The number added to a d20 Test, derived from an ability score: (score - 10) / 2, rounded down.'],
  ['Opportunity Attack', 'A Reaction melee attack when a creature you can see leaves your reach.'],
  ['Passive Perception', '10 + your Wisdom (Perception) bonus. Used when you are not actively searching.'],
  ['Proficiency Bonus', 'A bonus tied to character level (+2 to +6) added to things you are proficient with.'],
  ['Reaction', 'An instant response to a trigger, usable once per round. It refreshes at the start of your turn.'],
  ['Round', 'Everyone in the fight takes one turn. A round lasts about 6 seconds in the world.'],
  ['Saving Throw', 'A d20 roll to avoid or reduce an effect. Roll d20 + ability modifier (+ Proficiency Bonus if proficient).'],
  ['Speed', 'How many feet you can move on your turn, normally 30.'],
  ['Spell Slot', 'A resource spent to cast a spell of 1st level or higher.'],
  ['Temporary Hit Points', 'A buffer that absorbs damage first. They don\'t stack, and healing can\'t restore them.'],
  ['Unarmed Strike', 'Punch, kick or headbutt: 1 + Strength modifier Bludgeoning damage (attack, grapple or shove).'],
  ['Weapon Mastery', 'A special property unlocked on specific weapons by classes that have the feature.'],
];

export const SECTIONS = [
  {
    id: 'd20-test', title: 'The core d20 Test',
    build: () => [
      p('Almost everything uncertain in the game is resolved with a <strong>d20 Test</strong>: roll a twenty-sided die, add modifiers, and compare the total to a target number. The Dungeon Master (DM) decides when a roll is needed.'),
      h('div', { class: 'info-formula' }, 'd20 + ability modifier + Proficiency Bonus (if proficient) + other bonuses  >=  target number'),
      item('Ability check', 'Used for tasks with an uncertain outcome. Roll d20 + the ability modifier + your Proficiency Bonus if you are proficient in the relevant skill or tool. The target is a <strong>Difficulty Class (DC)</strong>, typically 10 (easy-ish) to 20 (hard): Very Easy 5, Easy 10, Medium 15, Hard 20, Very Hard 25, Nearly Impossible 30. Meet or beat the DC to succeed. When two creatures compete, each rolls and the higher total wins (a contest).'),
      item('Saving throw', 'Used to resist or avoid a threat such as a spell, trap or poison. You roll d20 + ability modifier, plus your Proficiency Bonus only if you have proficiency in that saving throw (each class grants two). The DC is set by whatever causes the save, for example a spellcaster\'s spell save DC.'),
      item('Attack roll', 'Used to hit a target. Roll d20 + the attack\'s ability modifier + Proficiency Bonus if proficient with the weapon or spell. If the total meets or beats the target\'s Armor Class, it hits. A natural 20 always hits (a Critical Hit) and a natural 1 always misses, whatever the modifiers.'),
      item('Natural 20 and natural 1', 'On attack rolls, a natural 20 is a Critical Hit and a natural 1 is a miss. On ability checks and saving throws a natural 20 or 1 has no special effect, although the DM may note a dramatic result.'),
      item('Advantage and Disadvantage', 'Roll two d20s and use the <strong>higher</strong> with Advantage or the <strong>lower</strong> with Disadvantage. Multiple instances of Advantage do not stack; one Advantage and one Disadvantage cancel out (even if there are several of one kind), leaving a normal roll.'),
      item('Heroic Inspiration', 'The DM (or a feature) can grant you Heroic Inspiration for heroic play. Spend it to <strong>reroll any one die</strong> right after you roll it and use the new result. You can have only one at a time; some species and the Musician feat can grant it.'),
      item('Rounding and ties', 'When dividing, round down unless stated otherwise. If a roll ties the DC or Armor Class, that counts as success.'),
      tip('Tip: on the character sheet, click any check, save or attack to roll it. Advantage and Disadvantage toggles are available on the dice tray.'),
    ],
  },
  {
    id: 'proficiency', title: 'Proficiency bonus table',
    build: () => [
      p('Your <strong>Proficiency Bonus</strong> grows with character level. Add it to attack rolls with weapons you are proficient in, to saving throws and skills you are proficient in, to spell attack rolls, and to spell save DCs.'),
      table(['Level', 'Bonus'], Array.from({ length: MAX_LEVEL }, (_, i) => [String(i + 1), formatMod(proficiencyBonus(i + 1))]), 'Proficiency Bonus by level'),
      p('The bonus is added <strong>once</strong> per roll even if two sources apply. Expertise (Rogue, Bard, and others) doubles it for chosen skills.'),
      modifierCalculator(),
    ],
  },
  {
    id: 'abilities', title: 'Ability scores and modifiers',
    build: () => [
      p('Every creature has six ability scores. A score of 10 or 11 is average for a commoner; adventurers usually have at least one score of 15 or more. You rarely use the score itself: you use the <strong>modifier</strong>, calculated as (score - 10) / 2 rounded down.'),
      table(['Ability', 'Governs', 'Skills'], ABILITIES.map((a) => [`${a.name} (${a.abbr})`, a.desc, skillsByAbility(a.id)])),
      table(['Score', 'Modifier'], [[1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25], [26, 27], [28, 29], [30]]
        .map((r) => [r.length > 1 ? `${r[0]}-${r[1]}` : String(r[0]), formatMod(abilityMod(r[0]))]), 'Ability modifiers'),
      p('Scores cap at 20 for player characters unless a feature says otherwise (the absolute maximum is 30). In the 2024 rules your <strong>background</strong> raises scores (+2/+1 or +1/+1/+1) and species give no ability score bonuses. Ability Score Improvements at certain class levels add +2 split as you like or a feat.'),
    ],
  },
  {
    id: 'skills', title: 'Skills',
    build: () => [
      p('A skill is a specialisation within an ability. If you are proficient in a skill, add your Proficiency Bonus when you make an ability check that uses it. The DM may let a different ability apply (for example Strength (Intimidation)).'),
      table(['Skill', 'Default ability'], SKILLS.map((s) => [s.name, ABILITIES.find((a) => a.id === s.ability).name])),
      item('Passive checks', 'A passive check is a quiet 10 + all the modifiers that normally apply. Passive Perception (10 + Perception bonus) is how you notice hidden things without actively looking. Advantage adds 5; Disadvantage subtracts 5.'),
      item('Tool proficiency', 'Tools work like skills: if you are proficient with a tool and a check uses it, add your Proficiency Bonus. A tool can grant Advantage when the DM judges it helps.'),
      item('Working together', 'Use the <strong>Help</strong> action to give an ally Advantage on a check, but only if you are proficient in the skill or tool they are using. Advantage applies to their next check for that task before your next turn.'),
    ],
  },
  {
    id: 'turns', title: 'Turn structure and initiative',
    build: () => [
      p('Combat is played in <strong>rounds</strong>. In each round every participant takes one <strong>turn</strong> in initiative order.'),
      ol([
        '<strong>Surprise:</strong> a creature that is surprised has Disadvantage on its Initiative roll.',
        '<strong>Roll Initiative:</strong> everyone makes a Dexterity check (d20 + Dex modifier, plus any bonuses). Highest goes first. Ties between player characters are decided by the players; the DM breaks other ties.',
        '<strong>Take turns:</strong> on your turn you can <strong>move</strong> and take <strong>one action</strong>, plus a Bonus Action and a free object interaction if available. You can split movement before and after your action.',
        '<strong>Reaction:</strong> you also get one Reaction each round that you can use any time before your next turn (such as an Opportunity Attack). It resets at the start of your turn.',
        '<strong>Repeat</strong> until the fight ends: all enemies are defeated, flee or surrender.',
      ]),
      item('What you can do on your turn', '<ul><li><strong>Move</strong> up to your Speed.</li><li><strong>Action:</strong> one of the Actions listed below, or a special action from a class feature or spell.</li><li><strong>Bonus Action:</strong> only if you have a feature or spell that uses one. One per turn.</li><li><strong>Reaction:</strong> one between your turns.</li><li><strong>Free interaction:</strong> one simple object interaction, such as opening a door or drawing or stowing a weapon, as part of your move or action. More complex ones require the Utilize action.</li><li><strong>Communicate:</strong> brief speech and gestures are free.</li></ul>'),
      item('Bonus Action spells', 'If you cast a spell as a Bonus Action, you can cast only a <strong>cantrip</strong> with a casting time of one action for the rest of that turn.'),
    ],
  },
  {
    id: 'actions', title: 'The Actions list',
    build: () => [
      p('On your turn you take one of these (or a feature\'s special action). Several features give extra attacks or additional actions.'),
      ...ACTIONS.flatMap((a) => [item(a.name, a.desc), exampleBlock(a.name)]).filter(Boolean),
      tip('Not sure what to do? Attack if an enemy is close, Magic if you have a spell, otherwise Dodge, Help or Dash. You can always try improvising something and ask the DM.'),
    ],
  },
  {
    id: 'movement', title: 'Movement',
    build: () => [
      item('Speed', 'Your Speed is the distance in feet you can move each turn, usually 30 ft. You can break it up, moving before and after your action, and you can move through an ally\'s space (but not stop there) or squeeze through a space one size smaller (each foot costs 1 extra foot, with Disadvantage on attacks and Dex checks).'),
      item('Difficult terrain', 'Rubble, thick undergrowth, deep snow or similar: each foot of movement costs 1 extra foot. Moving through the space of a hostile creature is not allowed unless it is two sizes larger or smaller.'),
      item('Climbing and swimming', 'Each foot of movement costs 1 extra foot (2 extra if difficult terrain) unless you have a Climb or Swim speed. The DM may call for a Strength (Athletics) check for difficult surfaces or rough water.'),
      item('Crawling', 'While Prone you can crawl: each foot costs 1 extra foot of movement.'),
      item('Standing up', 'If you are Prone, standing up costs an amount of movement equal to <strong>half your Speed</strong>. You cannot stand if your Speed is 0.'),
      item('Jumping', 'Long jump: you cover a number of feet equal to your <strong>Strength score</strong> if you move at least 10 ft in a straight line first; otherwise half as far. High jump: <strong>3 + Strength modifier</strong> feet (minimum 0) with the 10-ft run, half otherwise. Every foot you jump costs a foot of movement. A DC 10 Strength (Athletics) check may be needed to clear a hazard. You can extend your reach on a high jump by up to 1.5 times your height.'),
      item('Falling', 'You take 1d6 Bludgeoning damage per 10 feet fallen, to a maximum of 20d6, and land Prone unless you avoid the damage.'),
      item('Flying', 'A creature with a Fly speed can move through the air. If it is knocked Prone, has its Speed reduced to 0 or becomes incapacitated while flying, it falls (unless it can hover or stay aloft).'),
      item('Speed modifiers', 'Heavy armor you lack the Strength for reduces your Speed by 10 ft. Each Exhaustion level reduces Speed by 5 ft. Grappled, Restrained and similar conditions set it to 0.'),
      item('Carrying and pushing', 'Your carrying capacity is 15 x your Strength score in pounds; you can push, drag or lift up to twice that, and your Speed drops to 5 ft while doing so.'),
    ],
  },
  {
    id: 'combat', title: 'Combat rules',
    build: () => [
      item('Attack rolls', 'd20 + ability modifier + Proficiency Bonus (if proficient) versus the target\'s AC. Melee weapons use Strength; ranged weapons use Dexterity; Finesse weapons use either. Spell attacks use your spellcasting ability. On a hit, roll the weapon\'s damage and add the same ability modifier.'),
      item('Cover', 'Obstacles between you and an attacker make you harder to hit. <strong>Half cover</strong> gives +2 to AC and Dexterity saving throws; <strong>three-quarters cover</strong> gives +5; <strong>total cover</strong> means you cannot be targeted directly. Only the highest degree applies.'),
      item('Unseen attackers and targets', 'If you attack a target you cannot see, you have Disadvantage. If a creature that you cannot see attacks you, it has Advantage. Unseen attackers reveal their position when they attack (hit or miss).'),
      item('Ranged attacks in melee', 'Making a ranged attack roll while an enemy that can see you is within 5 feet (and isn\'t Incapacitated) gives you Disadvantage. Attacking beyond normal range also has Disadvantage; you cannot attack beyond long range.'),
      item('Two-weapon fighting', 'When you take the Attack action and attack with a <strong>Light</strong> weapon in one hand, you can use a Bonus Action to attack with a different Light weapon in the other. Do not add your ability modifier to this extra attack\'s damage unless it is negative. With Weapon Mastery Nick, the extra attack can instead be part of the Attack action.'),
      item('Grappling', 'As part of the Attack action you can replace one attack with an Unarmed Strike to grapple. The target must be no more than one size larger and within reach, and you need a free hand. The target makes a <strong>Strength or Dexterity save</strong> (its choice) against DC 8 + your Strength modifier + Proficiency Bonus. On a failure it has the Grappled condition (Speed 0). It can escape with an action: Strength (Athletics) or Dexterity (Acrobatics) check against the same DC. You can drag or carry a grappled target; its movement costs you 1 extra foot per foot.'),
      item('Shoving', 'Also an Unarmed Strike option with the same size limit and DC. A failed Strength or Dexterity save lets you either <strong>push the target 5 feet</strong> or knock it <strong>Prone</strong>.'),
      item('Opportunity attacks', 'When a creature you can see leaves your reach without using the Disengage action (and without teleporting or being forced to move), you can use your <strong>Reaction</strong> to make one melee attack against it, interrupting its move.'),
      item('Mounted combat', 'Mounting or dismounting costs movement equal to half your Speed. A willing creature at least one size larger than you can be a mount. A controlled mount acts on your Initiative and can only Dash, Disengage or Dodge; an independent mount acts on its own initiative. If a mount is knocked Prone, you must make a DC 10 Dexterity save or fall off and land Prone.'),
      item('Underwater combat', 'Creatures without a Swim speed have Disadvantage on melee attack rolls unless using a dagger, javelin, shortsword, spear or trident. Ranged attacks automatically miss beyond normal range and have Disadvantage within it. Creatures and objects fully immersed have Resistance to Fire damage.'),
      item('Two-handed and Heavy weapons', 'Two-handed weapons need both hands. Heavy weapons impose Disadvantage if you have less than 13 in the relevant ability (Strength for melee, Dexterity for ranged).'),
      item('Ending combat', 'When one side is defeated or flees, the fight ends. Defeated enemies may be killed or knocked out (declare you want to knock out before dropping a target with a melee attack).'),
    ],
  },
  {
    id: 'defense', title: 'Defense calculations',
    build: () => [
      p('<strong>Armor Class (AC)</strong> is how hard you are to hit. The formula depends on what you wear:'),
      table(['Situation', 'Formula'], [
        ['No armor', '10 + Dexterity modifier'],
        ['Light armor', 'Armor base AC + Dexterity modifier'],
        ['Medium armor', 'Armor base AC + Dexterity modifier (maximum +2)'],
        ['Heavy armor', 'Armor base AC (no Dexterity)'],
        ['Shield', '+2 AC (one only; needs training)'],
        ['Barbarian Unarmored Defense', '10 + Dex + Con (no armor, shield allowed)'],
        ['Monk Unarmored Defense', '10 + Dex + Wis (no armor, no shield)'],
        ['Fighting Style: Defense', '+1 AC while wearing armor'],
        ['Cover', '+2 (half) or +5 (three-quarters) AC and Dexterity saves'],
      ]),
      table(['Armor', 'Type', 'Base AC', 'Dex bonus', 'Strength', 'Stealth'], ARMOR.map((a) => [
        a.name, a.category, String(a.baseAC),
        a.dexCap === null ? 'full' : a.dexCap === 0 ? 'none' : `max +${a.dexCap}`,
        a.strength ? String(a.strength) : '-', a.stealthDisadvantage ? 'Disadvantage' : '-',
      ]), 'Armor table'),
      h('h3', {}, 'Worked examples'),
      table(['Character', 'Calculation', 'AC'], [
        acExample('Wizard, Dex 14, no armor', { scores: { dex: 14, con: 10, wis: 10 } }),
        acExample('Rogue, Dex 16, Studded Leather', { armor: 'studded-leather-armor', scores: { dex: 16, con: 10, wis: 10 } }),
        acExample('Cleric, Dex 16, Scale Mail + Shield (Dex capped at +2)', { armor: 'scale-mail', shield: true, scores: { dex: 16, con: 10, wis: 10 } }),
        acExample('Fighter, Dex 12, Plate Armor + Shield + Defense', { armor: 'plate-armor', shield: true, defenseStyle: true, scores: { dex: 12, con: 10, wis: 10 } }),
        acExample('Barbarian, Dex 14, Con 16, no armor + Shield', { scores: { dex: 14, con: 16, wis: 10 }, unarmoredDefense: 'barbarian', shield: true }),
        acExample('Monk, Dex 16, Wis 16, no armor', { scores: { dex: 16, con: 10, wis: 16 }, unarmoredDefense: 'monk' }),
      ]),
      item('Armor rules', `${ARMOR_RULES.training} ${ARMOR_RULES.strength} ${ARMOR_RULES.stealth} ${ARMOR_RULES.shield}`),
      item('Saving throws vs. AC', 'AC defends against <strong>attack rolls</strong>: the attacker rolls d20 + bonus against your AC. A saving throw is <strong>your own roll</strong>: you roll d20 + save modifier against the effect\'s DC (for spells, 8 + caster\'s Proficiency Bonus + spellcasting modifier). Armor does not help with saving throws, but half and three-quarters cover add +2 or +5 to Dexterity saves.'),
      acCalculator(),
    ],
  },
  {
    id: 'damage', title: 'Damage, healing and dying',
    build: () => [
      item('Hit Points', 'Hit Points (HP) measure how much punishment you can take. Damage reduces HP; healing restores it up to your maximum. HP never drops below 0.'),
      item('Damage types', `The thirteen types are ${DAMAGE_TYPES.join(', ')}. Types matter for Resistance, Vulnerability and Immunity.`),
      item('Order of adjustments', 'Apply, in this order: (1) any flat bonuses or penalties to the damage, (2) <strong>Resistance</strong> (halve, round down), (3) <strong>Vulnerability</strong> (double). <strong>Immunity</strong> means no damage. Multiple instances of Resistance or Vulnerability to the same type count as one. Resistance and Vulnerability together cancel to normal damage in practice: the damage is halved then doubled.'),
      item('Critical hits', 'A natural 20 on an attack roll hits automatically. Roll all of the attack\'s damage dice twice and add the modifiers once. Features such as Sneak Attack dice double too.'),
      item('Temporary Hit Points', 'Temporary HP are a buffer: damage reduces them first. They are not real HP, cannot be healed, and do not stack: if you gain more while you already have some, keep the higher total (do not add them). They last until a Long Rest unless stated otherwise.'),
      item('Dropping to 0 HP', 'You fall <strong>Unconscious</strong> (and drop what you hold) and start making death saving throws. If the damage that brought you to 0 leaves a remainder equal to or greater than your <strong>maximum</strong> HP, you die instantly.'),
      item('Death saving throws', 'At the start of each of your turns at 0 HP, roll a d20 with no modifiers. <strong>10 or higher</strong> is a success; <strong>9 or lower</strong> is a failure. A <strong>natural 20</strong> brings you back with 1 HP; a <strong>natural 1</strong> counts as two failures. Three successes stabilise you; three failures kill you. The tallies persist until you recover or stabilise. Taking any damage while at 0 HP is one failure (two if the damage is a Critical Hit).'),
      item('Stabilising', 'A Stable creature stays Unconscious at 0 HP but stops making death saves. Another creature can stabilise you as an action with a <strong>DC 10 Wisdom (Medicine)</strong> check, by healing you, or via the Spare the Dying cantrip. A stable creature regains 1 HP after 1d4 hours.'),
      item('Healing', 'Magical healing and resting restore HP. Any healing at 0 HP brings you to consciousness at that many HP, and resets death saves. You can drink a potion of healing as a Bonus Action.'),
      item('Knocking out', 'When reducing a creature to 0 HP with a melee attack, you can choose to knock it Unconscious (and stable) instead of killing it.'),
      damageCalculator(),
    ],
  },
  {
    id: 'conditions', title: 'Conditions',
    build: () => [
      p(`There are ${CONDITIONS.length} conditions. A condition lasts until the effect ends (often a Long Rest or a duration). The same condition from multiple sources does not stack, except Exhaustion.`),
      ...CONDITIONS.map((c) => item(c.name, c.desc)),
      item('Exhaustion in the 2024 rules', 'Exhaustion is cumulative and has six levels. While you have Exhaustion, <strong>every d20 Test is reduced by 2 x your Exhaustion level</strong>, and your <strong>Speed is reduced by 5 feet x your level</strong>. Reaching level 6 kills you. A Long Rest removes one level (and requires food and drink). Example: at level 3 you take -6 on attacks, saves and checks, and lose 15 ft of Speed.'),
    ],
  },
  {
    id: 'resting', title: 'Resting',
    build: () => [
      item('Short Rest', REST_RULES.short + ' You can take as many Short Rests as you like. You cannot rest if you have done strenuous activity (such as fighting) for more than 1 hour of the rest.'),
      item('Long Rest', REST_RULES.long + ' You need at least 6 hours of sleep and up to 2 hours of light activity such as reading or keeping watch. A Long Rest is interrupted by 1 hour of strenuous activity (fighting, casting spells, or similar), after which you must start again.'),
      item('Spending Hit Point Dice', 'During a Short Rest, spend any number of your remaining Hit Point Dice. For each die roll it, add your Constitution modifier, and regain that many HP (minimum 0). Regain half your total dice on a Long Rest (minimum 1).'),
      item('Class features', 'Features say whether they recharge on a Short Rest, a Long Rest or both. Warlock Pact Magic slots return on a Short Rest; other spell slots return on a Long Rest.'),
    ],
  },
  {
    id: 'spellcasting', title: 'Spellcasting basics',
    build: () => [
      item('Cantrips and spell slots', 'Cantrips (level 0) can be cast at will. Spells of level 1+ expend a <strong>spell slot</strong> of that level or higher; casting at a higher level ("upcasting") enhances many spells. Slots are regained on a Long Rest. Level 5, 11 and 17 raise the damage dice of damaging cantrips.'),
      item('Prepared and known spells', 'All spellcasters have a list of prepared spells and can cast only those. Cleric, Druid and Wizard can change their list after a Long Rest (the Wizard prepares from the spellbook). Paladin and Ranger can replace one prepared spell after a Long Rest. Bard, Sorcerer and Warlock replace one prepared spell when they gain a level.'),
      item('Spellcasting ability, DC and attack', 'Each class uses a spellcasting ability. <strong>Spell save DC = 8 + Proficiency Bonus + spellcasting modifier.</strong> <strong>Spell attack bonus = Proficiency Bonus + spellcasting modifier.</strong>'),
      item('Components', '<strong>Verbal (V)</strong> requires speaking. <strong>Somatic (S)</strong> requires a free hand for gestures. <strong>Material (M)</strong> needs the listed items, or a spellcasting focus; a costly component must be provided exactly. You cannot cast V spells while silenced.'),
      item('Casting time', 'Most spells use an action; some a Bonus Action or Reaction. Longer casting times take minutes or hours and require focus the whole time. A Bonus Action spell leaves only cantrips as your action spell that turn.'),
      item('Concentration', 'Some spells require concentration. You can concentrate on only one spell at a time; starting another ends the first. Taking damage forces a <strong>Constitution saving throw</strong> with DC 10 or half the damage, whichever is higher (max DC 30). Becoming Incapacitated or dying also ends it.'),
      item('Rituals', 'A spell with the Ritual tag can be cast without a slot by taking 10 extra minutes, if your class has the Ritual feature and the spell is prepared or known as required.'),
      item('Range, area and targets', 'Spells list range, shape (cone, cube, cylinder, emanation, line, sphere), duration and targets. Many require a clear path (total cover blocks them).'),
      table(['Level', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'], Array.from({ length: MAX_LEVEL }, (_, i) => [String(i + 1), ...Array.from({ length: 9 }, (__, s) => String(FULL_CASTER_SLOTS[i]?.[s] ?? 0))]), 'Full caster spell slots by level'),
    ],
  },
  {
    id: 'mastery', title: 'Weapon mastery and properties',
    build: () => [
      p('Some classes (Barbarian, Fighter, Paladin, Ranger, Rogue) can <strong>master</strong> a number of weapons. Each weapon has a mastery property you can use only for weapons you have mastered and are proficient with. You can change mastered weapons after a Long Rest.'),
      ...Object.values(WEAPON_MASTERY).map((m) => item(m.name, m.desc)),
      h('h3', {}, 'Weapon properties'),
      ...Object.entries(WEAPON_PROPERTIES).map(([k, v]) => item(k[0].toUpperCase() + k.slice(1), v)),
    ],
  },
  {
    id: 'equipment', title: 'Equipment and encumbrance',
    build: () => [
      item('Coins', '10 copper (cp) = 1 silver (sp); 10 sp = 1 gold (gp); 1 gp = 100 cp; 50 coins weigh 1 lb. Electrum is no longer used; platinum (pp) = 10 gp.'),
      item('Starting equipment', 'Your class and background offer starting equipment packages (or gold instead). The builder handles this in the Equipment step.'),
      item('Weapon proficiency', 'Simple weapons are proficient for most; martial weapons for martial classes. Without proficiency you do not add your Proficiency Bonus to attack rolls.'),
      item('Armor training', 'Wearing armor you are not trained in gives Disadvantage on D20 Tests using Strength or Dexterity and prevents spellcasting. Donning and doffing takes time (light: 1 minute, medium: 5 minutes to don and 1 to doff, heavy: 10 and 5). Shields are donned and doffed with the Utilize action.'),
      item('Carrying capacity', 'Your carrying capacity is <strong>15 x your Strength score</strong> pounds. You can push, drag or lift twice that, but your Speed drops to 5 ft. Size changes it: Tiny x0.5, Large x2, Huge x4, Gargantuan x8.'),
      item('Adventuring gear', 'Rope, torches, rations, tools and packs make up most kit. Spellcasting focuses and holy symbols can replace material components without a cost.'),
    ],
  },
  {
    id: 'leveling', title: 'XP and leveling up',
    build: () => [
      p('Defeating monsters and overcoming challenges earns <strong>Experience Points (XP)</strong>. Some tables ignore XP and level up at story milestones. When your total reaches the next threshold, you level up (after a Long Rest in some games).'),
      table(['Level', 'XP required', 'Proficiency Bonus'], XP_THRESHOLDS.map((xp, i) => [String(i + 1), xp.toLocaleString('en-US'), formatMod(proficiencyBonus(i + 1))]), 'Character advancement'),
      item('When you level up', 'Gain the new class features, increase Hit Points (roll your Hit Die or take the fixed value, then add your Constitution modifier), gain a Hit Point Die, and update your Proficiency Bonus. Classes gain an Ability Score Improvement or feat at certain levels (usually 4, 8, 12, 16, 19). At 3rd level you choose a subclass.'),
      item('Multiclassing', 'Optional: you can gain a level in a new class if you have at least 13 in its primary ability (and your current class\'s). You gain proficiencies in a limited way, and your spell slots combine.'),
    ],
  },
  {
    id: 'first-turn', title: 'Your first turn walkthrough',
    build: () => [
      p('Let us walk through a typical first combat round with a Fighter who has a longsword, 30 ft Speed and a +5 attack bonus.'),
      ol([
        '<strong>The DM calls for Initiative.</strong> Roll a d20 and add your Dexterity modifier. Say you roll 14 + 1 = 15. Compare with the others to learn your order.',
        '<strong>Your turn comes.</strong> Check where the enemies are and what you can reach.',
        '<strong>Move.</strong> The goblin is 25 feet away. Move 20 feet toward it, ending next to it. Moving costs 1 ft per foot over normal ground.',
        '<strong>Take the Attack action.</strong> Roll d20 + 5. You get 12 + 5 = 17. The goblin\'s AC is 15, so it <strong>hits</strong>.',
        '<strong>Roll damage.</strong> Longsword: 1d8 + 3 Slashing. You roll 6 for 9 damage. If you had rolled a natural 20 you would roll the dice twice.',
        '<strong>Use Weapon Mastery.</strong> The longsword has Sap: the goblin has Disadvantage on its next attack roll.',
        '<strong>Use remaining movement</strong> (10 feet) or hold it to retreat. Be careful: leaving its reach lets it make an Opportunity Attack unless you Disengage.',
        '<strong>End your turn.</strong> Until your next turn you have a Reaction available for an Opportunity Attack.',
        '<strong>On the goblin\'s turn</strong> it attacks you. It rolls d20 + 4 against your AC. If the total is at least your AC, you take damage. Your AC and HP are on your sheet.',
      ]),
      tip('Open your character sheet and click an attack to try the dice, then come back here for the full rules.'),
    ],
  },
  {
    id: 'glossary', title: 'Glossary',
    build: () => GLOSSARY.map(([term, def]) => item(term, def)),
  },
];
