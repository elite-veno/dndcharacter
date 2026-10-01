// Conditions, actions and core combat vocabulary (SRD 5.2, CC-BY-4.0).

export const CONDITIONS = [
  { id: 'blinded', name: 'Blinded', desc: "You can't see and automatically fail any ability check that requires sight. Attack rolls against you have Advantage, and your attack rolls have Disadvantage." },
  { id: 'charmed', name: 'Charmed', desc: "You can't attack the charmer or target them with damaging abilities or magical effects. The charmer has Advantage on any ability check to interact with you socially." },
  { id: 'deafened', name: 'Deafened', desc: "You can't hear and automatically fail any ability check that requires hearing." },
  { id: 'exhaustion', name: 'Exhaustion', desc: "Cumulative levels (max 6). Your D20 Tests are reduced by 2 times your Exhaustion level, and your Speed is reduced by 5 feet times your level. You die at level 6. A Long Rest removes 1 level." },
  { id: 'frightened', name: 'Frightened', desc: "You have Disadvantage on ability checks and attack rolls while the source of fear is in line of sight, and you can't willingly move closer to it." },
  { id: 'grappled', name: 'Grappled', desc: "Your Speed is 0 and can't increase. You have Disadvantage on attack rolls against any target other than the grappler. The grappler can drag or carry you, but its movement is costlier unless you are Tiny or two sizes smaller." },
  { id: 'incapacitated', name: 'Incapacitated', desc: "You can't take Actions, Bonus Actions, or Reactions. Your concentration is broken, you can't speak, and you have Disadvantage on Initiative rolls." },
  { id: 'invisible', name: 'Invisible', desc: "You aren't affected by effects requiring sight. Attack rolls against you have Disadvantage, and your attack rolls have Advantage. You have Advantage on Initiative rolls." },
  { id: 'paralyzed', name: 'Paralyzed', desc: "You are Incapacitated, your Speed is 0, and you automatically fail Strength and Dexterity saves. Attack rolls against you have Advantage, and any attack that hits you is a Critical Hit if the attacker is within 5 feet." },
  { id: 'petrified', name: 'Petrified', desc: "You are turned to stone and have the Incapacitated condition. Your Speed is 0 and can't increase. Attack rolls against you have Advantage. You automatically fail Strength and Dexterity saving throws. You have Resistance to all damage and are immune to the Poisoned condition. Weight is multiplied by ten and you stop aging." },
  { id: 'poisoned', name: 'Poisoned', desc: "You have Disadvantage on attack rolls and ability checks." },
  { id: 'prone', name: 'Prone', desc: "Your only movement options are crawling or standing up (costs half your Speed). You have Disadvantage on attack rolls. Attacks against you have Advantage if the attacker is within 5 feet; otherwise they have Disadvantage." },
  { id: 'restrained', name: 'Restrained', desc: "Your Speed is 0. Attack rolls against you have Advantage, and your attack rolls have Disadvantage. You have Disadvantage on Dexterity saving throws." },
  { id: 'stunned', name: 'Stunned', desc: "You are Incapacitated and automatically fail Strength and Dexterity saves. Attack rolls against you have Advantage." },
  { id: 'unconscious', name: 'Unconscious', desc: "You are Incapacitated, Prone, and unaware of your surroundings. Your Speed is 0, you automatically fail Strength and Dexterity saves, and attacks against you have Advantage. Any hit from within 5 feet is a Critical Hit." },
];

// Actions available on your turn (2024 rules).
export const ACTIONS = [
  { id: 'attack', name: 'Attack', desc: "Make one attack with a weapon or an Unarmed Strike. Some features (Extra Attack) let you make more." },
  { id: 'dash', name: 'Dash', desc: "Gain extra movement equal to your Speed for the turn." },
  { id: 'disengage', name: 'Disengage', desc: "Your movement doesn't provoke Opportunity Attacks for the rest of the turn." },
  { id: 'dodge', name: 'Dodge', desc: "Until the start of your next turn, attack rolls against you have Disadvantage (if you can see the attacker) and you have Advantage on Dexterity saves. Lost if Incapacitated or Speed is 0." },
  { id: 'help', name: 'Help', desc: "Assist an ability check: choose a skill or tool you are proficient in; an ally who makes a check with it (before your next turn) has Advantage. Assist an attack: distract an enemy within 5 ft of you; the next attack roll against it by an ally has Advantage if made before the start of your next turn. You can also use Help to stabilize a creature at 0 HP (DC 10 Wisdom (Medicine))." },
  { id: 'hide', name: 'Hide', desc: "Make a DC 15 Dexterity (Stealth) check while Heavily Obscured or behind Three-Quarters/Total Cover. On a success you have the Invisible condition until discovered." },
  { id: 'influence', name: 'Influence', desc: "Make a Charisma (Deception, Intimidation, Performance, or Persuasion) or Wisdom (Animal Handling) check to alter a creature's attitude." },
  { id: 'magic', name: 'Magic', desc: "Cast a spell with a casting time of an action, use a magic item, or use a feature that requires the Magic action." },
  { id: 'ready', name: 'Ready', desc: "Prepare a Reaction triggered by a circumstance you define; you take it when the trigger occurs before your next turn. Readying a spell requires Concentration." },
  { id: 'search', name: 'Search', desc: "Make a Wisdom check (Insight, Medicine, Perception, or Survival) to find something." },
  { id: 'study', name: 'Study', desc: "Make an Intelligence check (Arcana, History, Investigation, Nature, or Religion) to recall or analyze information." },
  { id: 'utilize', name: 'Utilize', desc: "Use a nonmagical object (including donning or doffing a Shield)." },
];

export const COVER = [
  { id: 'half', name: 'Half Cover', desc: '+2 bonus to AC and Dexterity saving throws.' },
  { id: 'three-quarters', name: 'Three-Quarters Cover', desc: '+5 bonus to AC and Dexterity saving throws.' },
  { id: 'total', name: 'Total Cover', desc: "Can't be targeted directly by attacks or most spells." },
];

export const DAMAGE_TYPES = [
  'Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic',
  'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder',
];

export const REST_RULES = {
  short: 'A Short Rest is at least 1 hour. Spend Hit Point Dice to heal (roll the die + Constitution modifier per die). Some features recharge.',
  long: 'A Long Rest is at least 8 hours. Regain all HP and half your total Hit Point Dice (minimum 1); most features recharge; Exhaustion decreases by 1. You can benefit from only one Long Rest per 24 hours.',
};
