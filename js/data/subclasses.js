// Subclasses (paraphrased summaries of 2014 subclasses from the Player's Handbook, Xanathar's, Tasha's and Fizban's; each entry's source field names its book).
// The base rules of this app are 2024, so every class chooses its subclass at level 3; features, granted spells and
// proficiencies that the 2014 book grants earlier (Cleric, Sorcerer, Warlock, Druid, Wizard) are granted at level 3.
// Generated from data-src/subclasses/*.json. grantedSpells kinds: 'prepared' (always prepared from the given level),
// 'ritual' (ritual-only access), 'expanded' (added to the class spell list; level = spell level, not character level).

export const SUBCLASS_LEVEL = 3;
export const SUBCLASS_SOURCE = '2014 PHB'; // default source; individual subclasses carry their own source field

export const SUBCLASSES = [
 {
  "id": "path-of-the-berserker",
  "classId": "barbarian",
  "name": "Path of the Berserker",
  "source": "2014 PHB",
  "label": "Primal Path",
  "sourceLevel": 3,
  "summary": "Rage becomes an end in itself: a blood-soaked, reckless fury that trades bodily well-being for relentless violence.",
  "features": [
   {
    "level": 3,
    "name": "Frenzy",
    "desc": "When you rage you may choose to frenzy; for the rage's duration you can make one melee weapon attack as a bonus action each turn (after the turn you start raging). When the rage ends you gain one level of exhaustion."
   },
   {
    "level": 6,
    "name": "Mindless Rage",
    "desc": "While raging you cannot be charmed or frightened; if already affected when you start raging, the effect is suspended until the rage ends."
   },
   {
    "level": 10,
    "name": "Intimidating Presence",
    "desc": "As an action, target a creature within 30 ft that can see or hear you; it must succeed on a Wisdom save (DC 8 + proficiency + Charisma modifier) or be frightened until the end of your next turn. You can use your action on later turns to extend it. The effect lapses if the target finishes a turn without line of sight to you or more than 60 ft from you. If the target saves, you can't use this on it again for 24 hours."
   },
   {
    "level": 14,
    "name": "Retaliation",
    "desc": "Once a creature within 5 ft hurts you, you may spend your reaction to strike back at it with a melee weapon."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "2024 PHB Berserker: Frenzy (3) adds extra damage dice (d6s equal to Rage Damage bonus) on the first target hit each turn while raging, with no exhaustion; Mindless Rage (6) also ends charm/frighten; Retaliation (10); Intimidating Presence (14) is a once-per-long-rest area effect (or Rage use)."
 },
 {
  "id": "path-of-the-totem-warrior",
  "classId": "barbarian",
  "name": "Path of the Totem Warrior",
  "source": "2014 PHB",
  "label": "Primal Path",
  "sourceLevel": 3,
  "summary": "A spiritual journey in which the barbarian takes a spirit animal as guide and protector, its power fueling the rage with supernatural might.",
  "features": [
   {
    "level": 3,
    "name": "Spirit Seeker",
    "desc": "You can cast beast sense and speak with animals, but only as rituals."
   },
   {
    "level": 3,
    "name": "Totem Spirit",
    "desc": "Choose a totem animal and gain its rage benefit. Bear: while raging you resist all damage except psychic. Eagle: while raging and not in heavy armor, opportunity attacks against you have disadvantage and you can Dash as a bonus action. Wolf: while raging, allies have advantage on melee attacks against hostile creatures within 5 ft of you."
   },
   {
    "level": 6,
    "name": "Aspect of the Beast",
    "desc": "Gain a passive benefit from a totem animal of your choice (same or different). Bear: carrying capacity doubled and advantage on Strength checks to push, pull, lift or break objects. Eagle: see up to 1 mile clearly (as if 100 ft away) and dim light does not impose disadvantage on Perception checks. Wolf: can track while traveling at a fast pace and move stealthily at a normal pace."
   },
   {
    "level": 10,
    "name": "Spirit Walker",
    "desc": "You can cast commune with nature as a ritual; a spirit version of one of your chosen totem animals appears to relay the information."
   },
   {
    "level": 14,
    "name": "Totemic Attunement",
    "desc": "Choose a totem animal for a rage-only benefit. Bear: hostile creatures within 5 ft have disadvantage on attacks against anyone other than you or another character with this feature (enemies that can't see/hear you or can't be frightened are immune). Eagle: while raging you gain a flying speed equal to your walking speed, but only in bursts; ending your turn airborne with no support makes you drop. Wolf: when you hit with a melee weapon attack, you can spend a bonus action to topple a creature of Large size or smaller."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "Beast Sense",
     "Speak with Animals"
    ],
    "kind": "ritual"
   },
   {
    "level": 10,
    "spells": [
     "Commune with Nature"
    ],
    "kind": "ritual"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "2024 PHB renamed it Path of the Wild Heart: Rage of the Wilds (3: Bear/Eagle/Wolf), Aspect of the Wilds (6: Owl/Panther/Salmon, plus Speak with Animals as a ritual), Nature Speaker (10: Commune with Nature), Power of the Wilds (14: Falcon/Lion/Ram). Totem Warrior itself is not in the 2024 PHB."
 },
 {
  "id": "path-of-the-ancestral-guardian",
  "classId": "barbarian",
  "name": "Path of the Ancestral Guardian",
  "source": "2014 Xanathar's",
  "label": "Primal Path",
  "sourceLevel": 3,
  "summary": "Barbarians of this path call on spectral ancestor warriors to shield their allies. While raging, you draw enemy attention onto yourself, blunt damage dealt to nearby creatures, and later gain spirit divination and retaliatory force damage.",
  "features": [
   {
    "level": 3,
    "name": "Ancestral Protectors",
    "desc": "While raging, the first creature you hit with an attack on your turn is haunted by spectral warriors until the start of your next turn. The haunted creature has disadvantage on attack rolls against anyone other than you, and any creature other than you that it damages has resistance to that damage."
   },
   {
    "level": 6,
    "name": "Spirit Shield",
    "desc": "While raging, when you see a creature within 30 feet of you take damage, you can use your reaction to have your ancestor spirits reduce that damage by 2d6. The reduction becomes 3d6 at 10th level and 4d6 at 14th level."
   },
   {
    "level": 10,
    "name": "Consult the Spirits",
    "desc": "You can cast augury or clairvoyance without a spell slot or material components, by asking your ancestral spirits for guidance (for clairvoyance, the sensor is created by the spirits). Wisdom is your spellcasting ability for it. Once used, you must finish a short or long rest before using it again."
   },
   {
    "level": 14,
    "name": "Vengeful Ancestors",
    "desc": "When your Spirit Shield reduces damage, the attacker who dealt that damage takes force damage equal to the amount your spirits prevented."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "path-of-the-storm-herald",
  "classId": "barbarian",
  "name": "Path of the Storm Herald",
  "source": "2014 Xanathar's",
  "label": "Primal Path",
  "sourceLevel": 3,
  "summary": "A raging barbarian who radiates a 10-foot storm aura themed on desert, sea, or tundra, choosing the environment each time they rage. The aura deals damage or grants temporary hit points, and later grants resistances to you and allies plus a stronger environment-specific strike.",
  "features": [
   {
    "level": 3,
    "name": "Storm Aura",
    "desc": "Pick Desert, Sea, or Tundra when you enter your rage; as a bonus action while raging you create a 10-foot-radius aura around you that lasts until the rage ends and moves with you. When it is created and at the start of each of your turns, it triggers. The aura's number is 2 at level 3, 3 at level 10, 4 at level 15, and 5 at level 20. Desert: every creature of your choice in the aura takes fire damage equal to the number. Sea: choose one creature you can see in the aura; it makes a Dexterity save (DC 8 + proficiency bonus + Constitution modifier) and takes lightning damage equal to the number on a failure, or half on a success. Tundra: each creature of your choice in the aura, including you, gains temporary hit points equal to the number."
   },
   {
    "level": 6,
    "name": "Storm Soul",
    "desc": "Gain a benefit based on your chosen environment, active whenever you are not wearing heavy armor. Desert: fire resistance, and as an action you can ignite flammable objects in reach that nobody is wearing or carrying. Sea: lightning resistance, the ability to breathe underwater, and a 30-foot swim speed. Tundra: cold resistance, and as an action you can turn water within 5 feet into a 5-foot cube of ice that is not occupied by creatures or objects (it melts after 1 minute); it affects only still water."
   },
   {
    "level": 10,
    "name": "Shielding Storm",
    "desc": "Allies of your choice within your storm aura also gain the damage resistance granted by your Storm Soul feature for your chosen environment."
   },
   {
    "level": 14,
    "name": "Raging Storm",
    "desc": "Your environment gains a powerful effect. Desert: when a creature within 10 feet hits you with an attack, you can use your reaction to deal fire damage to it equal to half your barbarian level. Sea: when you hit a creature in your aura with an attack, you can force it to make a Strength save (DC 8 + proficiency bonus + Constitution modifier); on a failure it is knocked prone. Tundra: when you activate your aura, you may choose one creature you can see in it; it makes a Strength save (same DC) or its speed becomes 0 until the start of your next turn, as magical frost covers it."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "path-of-the-zealot",
  "classId": "barbarian",
  "name": "Path of the Zealot",
  "source": "2014 Xanathar's",
  "label": "Primal Path",
  "sourceLevel": 3,
  "summary": "A divinely driven rager whose weapon hits carry bonus radiant or necrotic damage, who can heal from a pool of d12s, resist failed saves, inspire allies, and keep fighting past 0 hit points while raging.",
  "features": [
   {
    "level": 3,
    "name": "Divine Fury",
    "desc": "While raging, the first creature you hit with a weapon attack on each of your turns takes extra damage equal to 1d6 plus half your barbarian level (rounded down). You choose radiant or necrotic as the damage type when you take this path."
   },
   {
    "level": 3,
    "name": "Warrior of the Gods",
    "desc": "You have a pool of four d12s used for self-healing. As a bonus action, spend any number of dice from the pool, roll them, and regain that many hit points total. The pool refills on a long rest. The pool grows to 5d12 at 6th level, 6d12 at 12th level, and 7d12 at 17th level. Spells that restore a dead creature to life (such as raise dead) cast on you need no material components."
   },
   {
    "level": 6,
    "name": "Fanatical Focus",
    "desc": "Once per rage, when you fail a saving throw, you may reroll it and add your Rage damage bonus to the new roll. You must use the new result."
   },
   {
    "level": 10,
    "name": "Zealous Presence",
    "desc": "As a bonus action, choose up to ten other creatures within 60 feet; until the start of your next turn they have advantage on attack rolls and saving throws. Once used, it cannot be used again until a long rest, unless you expend a use of your Rage to restore it."
   },
   {
    "level": 14,
    "name": "Rage Beyond Death",
    "desc": "While raging, dropping to 0 hit points does not make you unconscious. You still make death saving throws and suffer the normal effects of taking damage at 0 hit points. If you would die from failed death saves, you instead stay alive until your rage ends, and you die then only if you still have 0 hit points."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "The 2024 Player's Handbook reprints the Zealot revised: Divine Fury (1d6 + half level), Warrior of the Gods (4d12 pool), Fanatical Focus, Zealous Presence, and Rage of the Gods at 14 in place of Rage Beyond Death."
 },
 {
  "id": "college-of-lore",
  "classId": "bard",
  "name": "College of Lore",
  "source": "2014 PHB",
  "label": "Bard College",
  "sourceLevel": 3,
  "summary": "Scholarly and irreverent performers who gather stories and knowledge from every source, loyal to truth and beauty rather than crowns or gods. They puncture pretension and are broadly skilled.",
  "features": [
   {
    "level": 3,
    "name": "Bonus Proficiencies",
    "desc": "Gain proficiency in any three skills of your choice."
   },
   {
    "level": 3,
    "name": "Cutting Words",
    "desc": "As a reaction, spend a Bardic Inspiration use to roll the die and subtract it from an attack roll, ability check, or damage roll of a creature you can see within 60 feet. Can be used after the roll but before the outcome is declared (or before damage is dealt). Fails against creatures that can't hear you or are immune to charm."
   },
   {
    "level": 6,
    "name": "Additional Magical Secrets",
    "desc": "Learn two spells of your choice from any class's list, of a level you can cast or cantrips. They count as bard spells but do not count against spells known."
   },
   {
    "level": 14,
    "name": "Peerless Skill",
    "desc": "When you make an ability check, you may spend a Bardic Inspiration use, roll the die, and add it to the check, even after seeing the d20 result but before learning success or failure."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Any three skills"
  ],
  "notes2024": ""
 },
 {
  "id": "college-of-valor",
  "classId": "bard",
  "name": "College of Valor",
  "source": "2014 PHB",
  "label": "Bard College",
  "sourceLevel": 3,
  "summary": "Daring skalds who sing the deeds of past and present heroes at mead halls and bonfires, inspiring others to heroism while joining the fight themselves.",
  "features": [
   {
    "level": 3,
    "name": "Bonus Proficiencies",
    "desc": "Training with medium armor, shields, and martial weapons is added to your proficiencies."
   },
   {
    "level": 3,
    "name": "Combat Inspiration",
    "desc": "A creature holding your Bardic Inspiration die can add it to a weapon damage roll it just made, or use its reaction to add it to its AC against one attack, after seeing the roll but before the result is known."
   },
   {
    "level": 6,
    "name": "Extra Attack",
    "desc": "Attack twice instead of once when you take the Attack action."
   },
   {
    "level": 14,
    "name": "Battle Magic",
    "desc": "Once you cast a bard spell using your action, you may follow it with a single weapon attack made as a bonus action."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Medium armor",
   "Shields",
   "Martial weapons"
  ],
  "notes2024": ""
 },
 {
  "id": "college-of-glamour",
  "classId": "bard",
  "name": "College of Glamour",
  "source": "2014 Xanathar's",
  "label": "Bard College",
  "sourceLevel": 3,
  "summary": "Fey-touched bards who weave enchanting magic to inspire allies with temporary hit points and free movement, charm crowds with a performance, and radiate a commanding presence that compels obedience and deters attackers.",
  "features": [
   {
    "level": 3,
    "name": "Mantle of Inspiration",
    "desc": "As a bonus action, you spend one use of Bardic Inspiration and choose a number of creatures within 60 feet equal to your Charisma modifier (minimum 1). You roll your Bardic Inspiration die, and each chosen creature gains temporary hit points equal to twice the number rolled. Each of them can also use its reaction to move up to its speed without provoking opportunity attacks."
   },
   {
    "level": 3,
    "name": "Enthralling Performance",
    "desc": "If you perform for at least 1 minute (song, speech, dance, etc.), then when you finish you may target a number of humanoids within 60 feet equal to your Charisma modifier (minimum 1) that watched and listened and can see you. Each must succeed on a Wisdom save against your spell save DC or be charmed by you. A charmed target idolizes you, praises you, and obeys reasonable requests that are not harmful to it, for 1 hour. The charm ends early on a target if you or your companions harm it. Once used, it recharges after a short or long rest."
   },
   {
    "level": 6,
    "name": "Mantle of Majesty",
    "desc": "As a bonus action, you cast Command (using no spell slot) and take on an unearthly appearance for 1 minute. During that time, you can cast Command as a bonus action on each of your turns without using a slot. Creatures charmed by you automatically fail their saving throw against these castings. The effect ends early if you are incapacitated or die. Once used, it recharges after a long rest."
   },
   {
    "level": 14,
    "name": "Unbreakable Majesty",
    "desc": "As a bonus action, you assume a magnificent presence for 1 minute or until you are incapacitated. While active, the first time on a turn that a creature attacks you, it must make a Charisma save against your spell save DC. On a failure, it cannot attack you this turn and must pick another target or forfeit the attack. On a success, it may attack, but it has disadvantage on saving throws against your spells and bard features until the end of its next turn. Once used, it recharges after a short or long rest."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "The 2024 Player's Handbook reprints College of Glamour revised, adding Beguiling Magic at level 3 and reworking Mantle of Inspiration, Mantle of Majesty and Unbreakable Majesty."
 },
 {
  "id": "college-of-swords",
  "classId": "bard",
  "name": "College of Swords",
  "source": "2014 Xanathar's",
  "label": "Bard College",
  "sourceLevel": 3,
  "summary": "A martial bard college of dueling performers who fight with blades as a show. They gain medium armor, scimitars, a fighting style, an extra attack, and spend Bardic Inspiration dice on showy weapon flourishes.",
  "features": [
   {
    "level": 3,
    "name": "Bonus Proficiencies",
    "desc": "You gain proficiency with medium armor and the scimitar. Any melee weapon you are proficient with can serve as your spellcasting focus for bard spells."
   },
   {
    "level": 3,
    "name": "Fighting Style",
    "desc": "Choose either the Dueling or the Two-Weapon Fighting fighting style."
   },
   {
    "level": 3,
    "name": "Blade Flourish",
    "desc": "When you take the Attack action on your turn, your walking speed rises by 10 feet until the end of that turn. If a weapon attack you make as part of that action hits a creature, you may spend one Bardic Inspiration die to perform one flourish of your choice, rolling the die for its effect. You can use only one flourish per turn. Defensive Flourish: add the die roll to the weapon's damage and also to your AC until the start of your next turn. Slashing Flourish: add the die roll to the damage dealt to the target and to the damage dealt to every other creature of your choice you can see within 5 feet of you (the same rolled amount to each). Mobile Flourish: add the die roll to the damage, and shove the target up to 5 feet plus the die roll in a straight line away from you; you can then use your reaction to move to an unoccupied space within 5 feet of the target using your walking speed."
   },
   {
    "level": 6,
    "name": "Extra Attack",
    "desc": "You can attack twice, rather than once, whenever you take the Attack action on your turn."
   },
   {
    "level": 14,
    "name": "Master's Flourish",
    "desc": "Whenever you use a Blade Flourish option, you can roll a d6 and use that result in place of spending a Bardic Inspiration die."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Medium armor",
   "Scimitar"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "college-of-whispers",
  "classId": "bard",
  "name": "College of Whispers",
  "source": "2014 Xanathar's",
  "label": "Bard College",
  "sourceLevel": 3,
  "summary": "Bards of this college are spies and manipulators who deal in secrets, fear and stolen identities. They turn Bardic Inspiration into psychic weapon damage, terrify lone targets, impersonate the dead, and eventually bend foes to their will with the secrets they hold.",
  "features": [
   {
    "level": 3,
    "name": "Psychic Blades",
    "desc": "When you hit a creature with a weapon attack, you may spend one use of Bardic Inspiration to add extra psychic damage. The bonus is 2d6, rising to 3d6 at 5th level, 5d6 at 10th level and 8d6 at 15th level. You choose after seeing the hit but before damage is rolled, and you can do this at most once per turn."
   },
   {
    "level": 3,
    "name": "Words of Terror",
    "desc": "If you spend at least 1 minute talking privately with a humanoid, it must make a Wisdom save against your spell save DC or become frightened of you or of another creature you name. The fear lasts 1 hour, or ends early if the target is attacked or harmed, or sees its allies attacked or harmed. A target that fails the save forgets you tried this. Once used, you must finish a short or long rest before using it again."
   },
   {
    "level": 6,
    "name": "Mantle of Whispers",
    "desc": "As a reaction when a humanoid dies within 30 feet of you, you capture its shadow. As an action you can wear that shadow like a disguise, taking on the dead creature's appearance and gaining access to its surface thoughts and general knowledge, and you can imitate its speech and mannerisms. The disguise lasts 1 hour or until you end it as a bonus action. Once used, you must finish a short or long rest before capturing another shadow."
   },
   {
    "level": 14,
    "name": "Shadow Lore",
    "desc": "As an action, choose a creature within 30 feet that can understand you. It must make a Wisdom save against your spell save DC or be charmed by you for 8 hours, or until you or your allies harm it. Believing you know its dark secrets, the charmed creature obeys your commands out of fear, though it will not take actions that are plainly self-destructive. A creature that succeeds is unaware you tried to affect it. Once used, you must finish a long rest before using it again."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "knowledge",
  "classId": "cleric",
  "name": "Knowledge",
  "source": "2014 PHB",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "Clerics of gods of learning and lore who collect secrets, study esoteric knowledge, and read minds and the past.",
  "features": [
   {
    "level": 1,
    "name": "Blessings of Knowledge",
    "desc": "Learn two languages and gain proficiency in two of Arcana, History, Nature, Religion; proficiency bonus is doubled for checks with those two skills."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Knowledge of the Ages",
    "desc": "Action: gain proficiency with one chosen skill or tool for 10 minutes."
   },
   {
    "level": 6,
    "name": "Channel Divinity: Read Thoughts",
    "desc": "Action: a creature within 60 ft makes a Wisdom save. On a failure you read its surface thoughts for 1 minute while within 60 ft, and may use your action to end this and cast suggestion on it without a slot (it automatically fails). On a success, you cannot use this on it again until a long rest."
   },
   {
    "level": 8,
    "name": "Potent Spellcasting",
    "desc": "Add your Wisdom modifier to damage of any cleric cantrip."
   },
   {
    "level": 17,
    "name": "Visions of the Past",
    "desc": "Meditate at least 1 minute (up to minutes equal to your Wisdom score, concentration) to see a held object's history (previous owners, recent significant events) or the recent events of the area (up to a 50-ft cube, going back days equal to Wisdom score). Recharges on short or long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "command",
     "identify"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "augury",
     "suggestion"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "nondetection",
     "speak with dead"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "arcane eye",
     "confusion"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "legend lore",
     "scrying"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "Two skills from Arcana, History, Nature, Religion (expertise-style doubling)",
   "Two languages"
  ],
  "notes2024": ""
 },
 {
  "id": "life",
  "classId": "cleric",
  "name": "Life",
  "source": "2014 PHB",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "Servants of gods of vitality and healing who sustain the living and drive back death.",
  "features": [
   {
    "level": 1,
    "name": "Bonus Proficiency",
    "desc": "Gain heavy armor proficiency."
   },
   {
    "level": 1,
    "name": "Disciple of Life",
    "desc": "Healing spells of 1st level or higher restore an extra 2 + spell level hit points."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Preserve Life",
    "desc": "Action: distribute a pool of healing equal to 5 x cleric level among creatures within 30 ft, restoring each to at most half its hit point maximum; not usable on undead or constructs."
   },
   {
    "level": 6,
    "name": "Blessed Healer",
    "desc": "When you cast a 1st-level or higher spell that heals another creature, you regain 2 + spell level hit points."
   },
   {
    "level": 8,
    "name": "Divine Strike",
    "desc": "Once per turn when you hit with a weapon attack, add 1d8 radiant damage; rises to 2d8 at level 14."
   },
   {
    "level": 17,
    "name": "Supreme Healing",
    "desc": "When healing dice would be rolled for a spell, use the maximum value of each die instead."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "bless",
     "cure wounds"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "lesser restoration",
     "spiritual weapon"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "beacon of hope",
     "revivify"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "death ward",
     "guardian of faith"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "mass cure wounds",
     "raise dead"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "Heavy armor"
  ],
  "notes2024": ""
 },
 {
  "id": "light",
  "classId": "cleric",
  "name": "Light",
  "source": "2014 PHB",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "Priests of sun, truth, and vigilance who burn away darkness and deception with radiance.",
  "features": [
   {
    "level": 1,
    "name": "Bonus Cantrip",
    "desc": "Learn the light cantrip if you do not know it."
   },
   {
    "level": 1,
    "name": "Warding Flare",
    "desc": "Reaction when a creature you see within 30 ft attacks you: impose disadvantage on the roll (attackers immune to blinding are unaffected). Uses equal to Wisdom modifier (min 1), recharge on long rest."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Radiance of the Dawn",
    "desc": "Action: dispel magical darkness within 30 ft; hostile creatures within 30 ft make a Constitution save, taking 2d10 + cleric level radiant damage on a failure, half on success (total cover protects)."
   },
   {
    "level": 6,
    "name": "Improved Flare",
    "desc": "Warding Flare can also protect a creature other than you."
   },
   {
    "level": 8,
    "name": "Potent Spellcasting",
    "desc": "Add your Wisdom modifier to damage of any cleric cantrip."
   },
   {
    "level": 17,
    "name": "Corona of Light",
    "desc": "Action: for 1 minute, emit bright light in 60 ft and dim light 30 ft beyond; enemies in the bright light have disadvantage on saves against your fire or radiant spells."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "burning hands",
     "faerie fire"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "flaming sphere",
     "scorching ray"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "daylight",
     "fireball"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "guardian of faith",
     "wall of fire"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "flame strike",
     "scrying"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "nature",
  "classId": "cleric",
  "name": "Nature",
  "source": "2014 PHB",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "Champions of wild gods who hunt despoilers, bless harvests, and command beasts and plants.",
  "features": [
   {
    "level": 1,
    "name": "Acolyte of Nature",
    "desc": "Learn one druid cantrip and gain proficiency in Animal Handling, Nature, or Survival."
   },
   {
    "level": 1,
    "name": "Bonus Proficiency",
    "desc": "Gain heavy armor proficiency."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Charm Animals and Plants",
    "desc": "Action: beasts and plants that can see you within 30 ft make a Wisdom save or are charmed for 1 minute or until damaged, friendly to you and your designees."
   },
   {
    "level": 6,
    "name": "Dampen Elements",
    "desc": "Reaction: grant yourself or a creature within 30 ft resistance to one instance of acid, cold, fire, lightning, or thunder damage."
   },
   {
    "level": 8,
    "name": "Divine Strike",
    "desc": "Once per turn on a weapon hit, add 1d8 cold, fire, or lightning damage (your choice); 2d8 at level 14."
   },
   {
    "level": 17,
    "name": "Master of Nature",
    "desc": "While creatures are charmed by Charm Animals and Plants, you can use a bonus action to verbally command them."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "animal friendship",
     "speak with animals"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "barkskin",
     "spike growth"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "plant growth",
     "wind wall"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "dominate beast",
     "grasping vine"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "insect plague",
     "tree stride"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "Heavy armor",
   "One of Animal Handling, Nature, Survival"
  ],
  "notes2024": ""
 },
 {
  "id": "tempest",
  "classId": "cleric",
  "name": "Tempest",
  "source": "2014 PHB",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "Wielders of storm, sea, and sky who strike with thunder and lightning and inspire fear.",
  "features": [
   {
    "level": 1,
    "name": "Bonus Proficiencies",
    "desc": "Gain martial weapon and heavy armor proficiency."
   },
   {
    "level": 1,
    "name": "Wrath of the Storm",
    "desc": "Reaction when a creature within 5 ft hits you: it makes a Dexterity save or takes 2d8 lightning or thunder damage (half on success). Uses equal to Wisdom modifier (min 1), recharge on long rest."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Destructive Wrath",
    "desc": "When rolling lightning or thunder damage, use Channel Divinity to deal maximum damage instead."
   },
   {
    "level": 6,
    "name": "Thunderbolt Strike",
    "desc": "When you deal lightning damage to a Large or smaller creature, you can push it up to 10 ft away."
   },
   {
    "level": 8,
    "name": "Divine Strike",
    "desc": "Once per turn on a weapon hit, add 1d8 thunder damage; 2d8 at level 14."
   },
   {
    "level": 17,
    "name": "Stormborn",
    "desc": "Gain a flying speed equal to your walking speed while outdoors and not underground."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "fog cloud",
     "thunderwave"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "gust of wind",
     "shatter"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "call lightning",
     "sleet storm"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "control water",
     "ice storm"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "destructive wave",
     "insect plague"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "Martial weapons",
   "Heavy armor"
  ],
  "notes2024": ""
 },
 {
  "id": "trickery",
  "classId": "cleric",
  "name": "Trickery",
  "source": "2014 PHB",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "Mischief-makers serving gods of thieves and rebels who prefer deception and pranks to open confrontation.",
  "features": [
   {
    "level": 1,
    "name": "Blessing of the Trickster",
    "desc": "Action: touch a willing creature other than you to grant advantage on Dexterity (Stealth) checks for 1 hour or until you use this again."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Invoke Duplicity",
    "desc": "Action: create an illusory duplicate within 30 ft for 1 minute (concentration). Move it 30 ft as a bonus action (stays within 120 ft), cast spells as if from its space, and gain advantage on attacks against a creature that can see it when you and the duplicate are both within 5 ft of it."
   },
   {
    "level": 6,
    "name": "Channel Divinity: Cloak of Shadows",
    "desc": "Action: turn invisible for a short time (until your next turn ends); you reappear if you attack or cast a spell."
   },
   {
    "level": 8,
    "name": "Divine Strike",
    "desc": "Once per turn on a weapon hit, add 1d8 poison damage; 2d8 at level 14."
   },
   {
    "level": 17,
    "name": "Improved Duplicity",
    "desc": "Invoke Duplicity creates up to four duplicates; you can move any number of them as one bonus action."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "charm person",
     "disguise self"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "mirror image",
     "pass without trace"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "blink",
     "dispel magic"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "dimension door",
     "polymorph"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "dominate person",
     "modify memory"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "war",
  "classId": "cleric",
  "name": "War",
  "source": "2014 PHB",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "Battle-priests of gods of war who fight on the front line and bless warriors.",
  "features": [
   {
    "level": 1,
    "name": "Bonus Proficiencies",
    "desc": "Gain martial weapon and heavy armor proficiency."
   },
   {
    "level": 1,
    "name": "War Priest",
    "desc": "When you take the Attack action, make one weapon attack as a bonus action. Uses equal to Wisdom modifier (min 1), recharge on long rest."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Guided Strike",
    "desc": "After seeing an attack roll but before the result is declared, gain +10 to that roll."
   },
   {
    "level": 6,
    "name": "Channel Divinity: War God's Blessing",
    "desc": "Reaction: grant +10 to an attack roll of a creature within 30 ft, chosen after the roll but before the result is declared."
   },
   {
    "level": 8,
    "name": "Divine Strike",
    "desc": "Once per turn on a weapon hit, add 1d8 damage of the same type as the weapon; 2d8 at level 14."
   },
   {
    "level": 17,
    "name": "Avatar of Battle",
    "desc": "Gain resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "divine favor",
     "shield of faith"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "magic weapon",
     "spiritual weapon"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "crusader's mantle",
     "spirit guardians"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "freedom of movement",
     "stoneskin"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "flame strike",
     "hold monster"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "Martial weapons",
   "Heavy armor"
  ],
  "notes2024": ""
 },
 {
  "id": "forge-domain",
  "classId": "cleric",
  "name": "Forge Domain",
  "source": "2014 Xanathar's",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "A smith-god cleric who wears heavy armor, empowers mundane gear, and crafts metal items with divine rituals. Gains fire resistance, extra armor class, fiery weapon strikes, and eventually fire immunity and tough physical resistances.",
  "features": [
   {
    "level": 1,
    "name": "Bonus Proficiencies",
    "desc": "You gain proficiency with heavy armor and with smith's tools."
   },
   {
    "level": 1,
    "name": "Blessing of the Forge",
    "desc": "At the end of a long rest, touch one nonmagical suit of armor or one nonmagical simple or martial weapon. Until your next long rest or until you die, it becomes a magic item with a +1 bonus to AC (armor) or to attack and damage rolls (weapon)."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Artisan's Blessing",
    "desc": "Perform a 1-hour ritual (which can be done during a short rest) using a Channel Divinity use, at a forge or similar workspace, to create a nonmagical metal item worth up to 100 gp, such as a weapon, armor, ammunition, tools or another metal object. The item appears in an unoccupied space within 60 feet of you and the work consumes the ritual's time rather than materials."
   },
   {
    "level": 6,
    "name": "Soul of the Forge",
    "desc": "You gain resistance to fire damage, and while wearing heavy armor you gain a +1 bonus to your Armor Class."
   },
   {
    "level": 8,
    "name": "Divine Strike",
    "desc": "Once on each of your turns when you hit a creature with a weapon attack, you deal an extra 1d8 fire damage. At 14th level the extra damage becomes 2d8."
   },
   {
    "level": 17,
    "name": "Saint of Forge and Fire",
    "desc": "You become immune to fire damage. While wearing heavy armor, you also have resistance to nonmagical bludgeoning, piercing and slashing damage."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "Identify",
     "Searing Smite"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "Heat Metal",
     "Magic Weapon"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "Elemental Weapon",
     "Protection from Energy"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "Fabricate",
     "Wall of Fire"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "Animate Objects",
     "Creation"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "Heavy armor",
   "Smith's Tools"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "grave-domain",
  "classId": "cleric",
  "name": "Grave Domain",
  "source": "2014 Xanathar's",
  "label": "Divine Domain",
  "sourceLevel": 1,
  "summary": "A cleric domain about the line between life and death: it protects the dying, senses undead, and punishes foes by making them easier to hurt. It also boosts cantrip damage and heals allies when enemies fall.",
  "features": [
   {
    "level": 1,
    "name": "Circle of Mortality",
    "desc": "When you cast a healing spell that restores hit points to a creature at 0 hit points, the healing dice count as their maximum possible result. You also learn the spare the dying cantrip, and it does not count against your cleric cantrips known. Spare the dying has a range of 30 feet when you cast it."
   },
   {
    "level": 1,
    "name": "Eyes of the Grave",
    "desc": "As an action, you sense the location of any undead within 60 feet that is not behind total cover and is not protected from divination magic. This lasts until the end of your next turn. You learn only where they are, not what they are. You can use this a number of times equal to your Wisdom modifier (minimum 1), regaining all uses after a long rest."
   },
   {
    "level": 2,
    "name": "Channel Divinity: Path to the Grave",
    "desc": "As an action, you use Channel Divinity to curse a creature you can see within 30 feet. The next time you or an ally hits that creature with an attack before the end of your next turn, the creature is vulnerable to all of that attack's damage, and the curse then ends. The curse has no effect on a creature that is immune to the damage of that attack."
   },
   {
    "level": 6,
    "name": "Sentinel at Death's Door",
    "desc": "As a reaction, when you or a creature you can see within 30 feet suffers a critical hit, you can turn that hit into a normal hit. Any other effects triggered by the critical hit are negated as well. You can do this a number of times equal to your Wisdom modifier (minimum 1), regaining all uses after a long rest."
   },
   {
    "level": 8,
    "name": "Potent Spellcasting",
    "desc": "You add your Wisdom modifier to the damage you deal with any cleric cantrip."
   },
   {
    "level": 17,
    "name": "Keeper of Souls",
    "desc": "Once per turn, when an enemy you can see dies within 60 feet of you, you or one ally within 60 feet of you regains hit points equal to the number of hit dice that enemy had (or its level, if it has one). You must not be incapacitated to use this."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "bane",
     "false life"
    ],
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "gentle repose",
     "ray of enfeeblement"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "revivify",
     "vampiric touch"
    ],
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "blight",
     "death ward"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "antimagic field",
     "raise dead"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "circle-of-the-land",
  "classId": "druid",
  "name": "Circle of the Land",
  "source": "2014 PHB",
  "label": "Druid Circle",
  "sourceLevel": 2,
  "summary": "Mystics and sages who guard ancient oral lore and hold rites in sacred groves and stone circles. Their magic is colored by the terrain where they were initiated.",
  "features": [
   {
    "level": 2,
    "name": "Bonus Cantrip",
    "desc": "Learn one extra druid cantrip."
   },
   {
    "level": 2,
    "name": "Natural Recovery",
    "desc": "Once per long rest, during a short rest, recover expended spell slots whose combined level is at most half druid level (rounded up); no slot of 6th level or higher."
   },
   {
    "level": 3,
    "name": "Circle Spells",
    "desc": "Choose a land type (arctic, coast, desert, forest, grassland, mountain, swamp, Underdark). At druid levels 3, 5, 7, 9 gain the listed spells as always-prepared that don't count against prepared limit."
   },
   {
    "level": 6,
    "name": "Land's Stride",
    "desc": "Nonmagical difficult terrain costs no extra movement; pass through nonmagical plants unharmed and unslowed; advantage on saves against magically created or manipulated plants that impede movement."
   },
   {
    "level": 10,
    "name": "Nature's Ward",
    "desc": "Elementals and fey cannot charm or frighten you, and you have immunity to poison and to disease."
   },
   {
    "level": 14,
    "name": "Nature's Sanctuary",
    "desc": "When a beast or plant attacks you, it makes a Wisdom save against your spell save DC; on a failure it must pick another target or the attack misses automatically; on a success it is immune for 24 hours. Creature knows of the effect beforehand."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "hold person",
     "spike growth"
    ],
    "choice": "Arctic",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "sleet storm",
     "slow"
    ],
    "choice": "Arctic",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "freedom of movement",
     "ice storm"
    ],
    "choice": "Arctic",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "commune with nature",
     "cone of cold"
    ],
    "choice": "Arctic",
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "mirror image",
     "misty step"
    ],
    "choice": "Coast",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "water breathing",
     "water walk"
    ],
    "choice": "Coast",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "control water",
     "freedom of movement"
    ],
    "choice": "Coast",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "conjure elemental",
     "scrying"
    ],
    "choice": "Coast",
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "blur",
     "silence"
    ],
    "choice": "Desert",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "create food and water",
     "protection from energy"
    ],
    "choice": "Desert",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "blight",
     "hallucinatory terrain"
    ],
    "choice": "Desert",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "insect plague",
     "wall of stone"
    ],
    "choice": "Desert",
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "barkskin",
     "spider climb"
    ],
    "choice": "Forest",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "call lightning",
     "plant growth"
    ],
    "choice": "Forest",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "divination",
     "freedom of movement"
    ],
    "choice": "Forest",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "commune with nature",
     "tree stride"
    ],
    "choice": "Forest",
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "invisibility",
     "pass without trace"
    ],
    "choice": "Grassland",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "daylight",
     "haste"
    ],
    "choice": "Grassland",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "divination",
     "freedom of movement"
    ],
    "choice": "Grassland",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "dream",
     "insect plague"
    ],
    "choice": "Grassland",
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "spider climb",
     "spike growth"
    ],
    "choice": "Mountain",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "lightning bolt",
     "meld into stone"
    ],
    "choice": "Mountain",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "stone shape",
     "stoneskin"
    ],
    "choice": "Mountain",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "passwall",
     "wall of stone"
    ],
    "choice": "Mountain",
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "darkness",
     "Melf's acid arrow"
    ],
    "choice": "Swamp",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "water walk",
     "stinking cloud"
    ],
    "choice": "Swamp",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "freedom of movement",
     "locate creature"
    ],
    "choice": "Swamp",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "insect plague",
     "scrying"
    ],
    "choice": "Swamp",
    "kind": "prepared"
   },
   {
    "level": 3,
    "spells": [
     "spider climb",
     "web"
    ],
    "choice": "Underdark",
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "gaseous form",
     "stinking cloud"
    ],
    "choice": "Underdark",
    "kind": "prepared"
   },
   {
    "level": 7,
    "spells": [
     "greater invisibility",
     "stone shape"
    ],
    "choice": "Underdark",
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "cloudkill",
     "insect plague"
    ],
    "choice": "Underdark",
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "2024 PHB: chosen at level 3; land types are arid, polar, temperate, tropical; Land's Aid at 3, Natural Recovery moves to 6 and also allows a free Circle spell cast once per long rest; Nature's Ward at 10 and Nature's Sanctuary at 14 are kept; Land's Stride is replaced."
 },
 {
  "id": "circle-of-the-moon",
  "classId": "druid",
  "name": "Circle of the Moon",
  "source": "2014 PHB",
  "label": "Druid Circle",
  "sourceLevel": 2,
  "summary": "Fierce guardians of the deep wilds who gather under the full moon. They shift between beast forms as readily as the moon changes phase.",
  "features": [
   {
    "level": 2,
    "name": "Combat Wild Shape",
    "desc": "Use Wild Shape as a bonus action. While in beast form, use a bonus action to expend a spell slot and heal 1d8 HP per level of the slot."
   },
   {
    "level": 2,
    "name": "Circle Forms",
    "desc": "Wild Shape into beasts up to CR 1, ignoring the Max. CR column of the Beast Shapes table (other limits still apply). At 6th level the cap becomes druid level divided by 3, rounded down."
   },
   {
    "level": 6,
    "name": "Primal Strike",
    "desc": "Your beast-form attacks count as magical for overcoming resistance and immunity to nonmagical damage."
   },
   {
    "level": 10,
    "name": "Elemental Wild Shape",
    "desc": "Spend two Wild Shape uses at once to become an air, earth, fire, or water elemental."
   },
   {
    "level": 14,
    "name": "Thousand Forms",
    "desc": "Cast alter self at will."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "2024 PHB: chosen at level 3; gains Circle Forms (Moon stat blocks, AC 13+Wis, temporary HP), Circle Spells, Improved Circle Forms at 6, Moonlight Step at 10, Lunar Form at 14; Combat Wild Shape, Primal Strike, Elemental Wild Shape and Thousand Forms are gone."
 },
 {
  "id": "circle-of-dreams",
  "classId": "druid",
  "name": "Circle of Dreams",
  "source": "2014 Xanathar's",
  "label": "Druid Circle",
  "sourceLevel": 2,
  "summary": "A fey-touched druid circle tied to the Summer Court that focuses on healing allies from a distance, creating hidden resting places, and teleporting around the battlefield and beyond.",
  "features": [
   {
    "level": 2,
    "name": "Balm of the Summer Court",
    "desc": "You gain a pool of d6s equal to your druid level, refreshed on a long rest. As a bonus action, pick a creature you can see within 120 feet and spend up to half your druid level (rounded up) of the dice from the pool. Roll them: the target heals the rolled total plus one extra hit point per die spent, and also gains one temporary hit point per die spent."
   },
   {
    "level": 6,
    "name": "Hearth of Moonlight and Shadow",
    "desc": "When you take a short or long rest, you can spend the first 10 minutes ritually creating a 30-foot-radius sphere of protection centered on you. For the rest's duration, everyone inside gains a +5 bonus to Wisdom (Perception) and Dexterity (Stealth) checks, and light from fires inside the sphere cannot be seen from outside it."
   },
   {
    "level": 10,
    "name": "Hidden Paths",
    "desc": "As a bonus action, you can teleport up to 60 feet to an unoccupied space you can see. Alternatively, as an action you can teleport a willing creature you touch up to 30 feet to an unoccupied space you can see. You have a number of uses equal to your Wisdom modifier (minimum 1), regained on a long rest."
   },
   {
    "level": 14,
    "name": "Walker in Dreams",
    "desc": "After finishing a short rest, you can cast dream, scrying, or teleportation circle without a slot or components. When cast this way, teleportation circle opens a portal whose destination is the place where you most recently completed a long rest. Once used, this must wait until you finish a long rest."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "circle-of-the-shepherd",
  "classId": "druid",
  "name": "Circle of the Shepherd",
  "source": "2014 Xanathar's",
  "label": "Druid Circle",
  "sourceLevel": 2,
  "summary": "Druids who commune with animal spirits and guard beasts and fey. They talk with woodland creatures, call a protective spirit aura, and make their summoned allies tougher and longer-lasting.",
  "features": [
   {
    "level": 2,
    "name": "Speech of the Woods",
    "desc": "You learn the Sylvan language. You can also speak with beasts as a natural ability, understanding them and being understood in return."
   },
   {
    "level": 2,
    "name": "Spirit Totem",
    "desc": "As a bonus action, you call a spirit of nature to a point you can see within 60 feet. It creates a 30-foot-radius aura around that point that lasts 1 minute (it ends early if you die). It can be used once, regaining on a short or long rest. When you call it, pick one spirit. Bear Spirit: you and each creature of your choice in the aura gain temporary hit points equal to 5 + your druid level, and while in the aura have advantage on Strength checks and Strength saving throws. Hawk Spirit: as a reaction when a creature you can see in the aura makes an attack roll, you may give it advantage on that roll; creatures of your choice in the aura also have advantage on Wisdom (Perception) checks. Unicorn Spirit: you and your allies in the aura have advantage on ability checks to detect other creatures; also, whenever you cast a healing spell with a spell slot, each creature of your choice in the aura regains hit points equal to your druid level."
   },
   {
    "level": 6,
    "name": "Mighty Summoner",
    "desc": "Beasts and fey that you conjure with any spell gain 2 extra hit points per Hit Die, and their natural weapon attacks count as magical for overcoming resistance and immunity to nonmagical damage."
   },
   {
    "level": 10,
    "name": "Guardian Spirit",
    "desc": "When a beast or fey that you summoned or created with a spell ends its turn inside your Spirit Totem aura, it regains hit points equal to half your druid level."
   },
   {
    "level": 14,
    "name": "Faithful Summons",
    "desc": "If you drop to 0 hit points or are incapacitated against your will, you can immediately cast Conjure Animals as if using a 9th-level slot, with no slot, components or concentration cost to you. The summoned creatures appear near you, last 1 hour (or until you dismiss them), and act to protect you. Usable once per long rest."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Sylvan (language)"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "champion",
  "classId": "fighter",
  "name": "Champion",
  "source": "2014 PHB",
  "label": "Martial Archetype",
  "sourceLevel": 3,
  "summary": "A fighter who relies on honed physical excellence and relentless training to hit harder, more reliably and endure longer.",
  "features": [
   {
    "level": 3,
    "name": "Improved Critical",
    "desc": "Your weapon attacks crit on a d20 roll of 19 or 20."
   },
   {
    "level": 7,
    "name": "Remarkable Athlete",
    "desc": "Add half your proficiency bonus (rounded up) to Strength, Dexterity or Constitution checks that don't already include proficiency. Running long jumps go extra feet equal to your Strength modifier."
   },
   {
    "level": 10,
    "name": "Additional Fighting Style",
    "desc": "Pick a second option from the Fighting Style feature."
   },
   {
    "level": 15,
    "name": "Superior Critical",
    "desc": "Weapon attacks crit on a roll of 18-20."
   },
   {
    "level": 18,
    "name": "Survivor",
    "desc": "Each turn, when your hit points are at or below half (but not 0), you regain 5 + your Constitution modifier hit points at the start of that turn."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "battle-master",
  "classId": "fighter",
  "name": "Battle Master",
  "source": "2014 PHB",
  "label": "Martial Archetype",
  "sourceLevel": 3,
  "summary": "A scholar of war who uses inherited tactical techniques, powered by superiority dice, to control the battlefield and aid allies.",
  "features": [
   {
    "level": 3,
    "name": "Combat Superiority",
    "desc": "Learn 3 maneuvers (2 more at levels 7, 10 and 15; you may swap one known maneuver whenever you learn new ones). You have four d8 superiority dice, one is spent per use, all return on a short or long rest. Gain a 5th die at level 7 and a 6th at level 15. One maneuver per attack. Maneuver save DC = 8 + proficiency bonus + Strength or Dexterity modifier (your choice)."
   },
   {
    "level": 3,
    "name": "Student of War",
    "desc": "Gain proficiency with one type of artisan's tools of your choice."
   },
   {
    "level": 3,
    "name": "Maneuvers",
    "desc": "Available maneuvers: Commander's Strike (forgo one attack, bonus action; an ally uses its reaction to attack, adding the die to damage); Disarming Attack (add die to damage; target makes Strength save or drops an item); Distracting Strike (add die to damage; next attack by someone else against the target before your next turn has advantage); Evasive Footwork (when moving, add the roll to AC until you stop); Feinting Attack (bonus action, target within 5 ft; advantage on your next attack against it, and on a hit add the die to damage); Goading Attack (add die to damage; Wisdom save or target has disadvantage on attacks against anyone but you until end of your next turn); Lunging Attack (+5 ft reach for one melee attack, add die to damage on hit); Maneuvering Attack (add die to damage; an ally uses its reaction to move up to half speed without provoking opportunity attacks from the target); Menacing Attack (add die to damage; Wisdom save or frightened of you until end of your next turn); Parry (reaction; reduce melee damage by die + Dexterity modifier); Precision Attack (add die to an attack roll, before or after rolling but before effects apply); Pushing Attack (add die to damage; Large or smaller target makes Strength save or is pushed up to 15 ft); Rally (bonus action; ally who sees or hears you gains temporary hit points equal to die + Charisma modifier); Riposte (reaction when a creature misses you in melee; make a melee attack, add die to damage on hit); Sweeping Attack (on a melee hit, a second creature within 5 ft of the target and in your reach takes damage equal to the die roll if the original attack roll would hit it); Trip Attack (add die to damage; Large or smaller target makes Strength save or is knocked prone)."
   },
   {
    "level": 7,
    "name": "Know Your Enemy",
    "desc": "After at least 1 minute observing or interacting with a creature outside combat, the DM tells you whether it is equal, superior or inferior to you in two characteristics of your choice from: Strength, Dexterity, Constitution, Armor Class, current hit points, total class levels, fighter levels."
   },
   {
    "level": 10,
    "name": "Improved Combat Superiority",
    "desc": "Superiority dice become d10s; they become d12s at level 18."
   },
   {
    "level": 15,
    "name": "Relentless",
    "desc": "When you roll initiative with no superiority dice left, you regain 1."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "One type of artisan's tools (your choice)"
  ],
  "notes2024": "The 2024 Battle Master starts with more maneuvers and dice, adds new maneuvers, and Know Your Enemy and Relentless are reworked."
 },
 {
  "id": "eldritch-knight",
  "classId": "fighter",
  "name": "Eldritch Knight",
  "source": "2014 PHB",
  "label": "Martial Archetype",
  "sourceLevel": 3,
  "summary": "A fighter who pairs martial skill with abjuration and evocation wizard magic, learned by study and memorized rather than kept in a spellbook.",
  "features": [
   {
    "level": 3,
    "name": "Spellcasting",
    "desc": "Intelligence-based wizard spellcasting; spell save DC = 8 + proficiency + Int modifier, spell attack = proficiency + Int modifier. Slots recover on a long rest. Cantrips: 2 known, 3 at level 10. Spells known: 3 at level 3, rising to 4 (L4), 5 (L7), 6 (L8), 7 (L10), 8 (L11), 9 (L13), 10 (L14), 11 (L16), 12 (L19), 13 (L20). Slots: L3 two 1st; L4 three 1st; L7 four 1st, two 2nd; L10 four 1st, three 2nd; L13 adds two 3rd; L16 three 3rd; 4th-level slots appear at L19; at level 19 you have four 1st, three 2nd, three 3rd and one 4th-level slot. Spells learned must be abjuration or evocation (the first-level choice allows one free-school spell among three), except those gained at levels 8, 14 and 20, which may be any school. You can swap one known spell on each level up, observing the same restrictions."
   },
   {
    "level": 3,
    "name": "Weapon Bond",
    "desc": "A 1-hour ritual (done in a short rest) bonds you to a weapon. You can't be disarmed of it unless incapacitated, and as a bonus action you can teleport it to your hand if on the same plane. Up to two bonded weapons, only one summoned per bonus action; bonding a third breaks one earlier bond."
   },
   {
    "level": 7,
    "name": "War Magic",
    "desc": "When you cast a cantrip with your action, you may make one weapon attack as a bonus action."
   },
   {
    "level": 10,
    "name": "Eldritch Strike",
    "desc": "A creature you hit with a weapon attack has disadvantage on its next saving throw against any spell you cast on or before your following turn ends."
   },
   {
    "level": 15,
    "name": "Arcane Charge",
    "desc": "When you use Action Surge, you can also teleport 30 feet to any open space you can see, either before or after taking the extra action."
   },
   {
    "level": 18,
    "name": "Improved War Magic",
    "desc": "When you cast a spell (any spell) with your action, you may make one weapon attack as a bonus action."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "The 2024 version lets you pick spells from the wizard list more flexibly and reworks Eldritch Strike and War Magic."
 },
 {
  "id": "arcane-archer",
  "classId": "fighter",
  "name": "Arcane Archer",
  "source": "2014 Xanathar's",
  "label": "Martial Archetype",
  "sourceLevel": 3,
  "summary": "A fighter who studies an elven archery tradition and infuses shortbow or longbow arrows with magic. You pick a growing list of Arcane Shot effects (a couple of uses per rest), gain a little nature or arcane lore, and later get magical arrows and the ability to redirect missed shots.",
  "features": [
   {
    "level": 3,
    "name": "Arcane Archer Lore",
    "desc": "Gain proficiency in either Arcana or Nature (your choice). You also learn the prestidigitation or druidcraft cantrip (your choice); Intelligence is its spellcasting ability."
   },
   {
    "level": 3,
    "name": "Arcane Shot",
    "desc": "You learn two Arcane Shot options, and learn another at levels 7, 10, 15 and 18 (you may swap one known option for another whenever you gain a fighter level). Once per turn, when you fire an arrow from a shortbow or longbow as part of the Attack action, you may apply one option to that attack, deciding after the attack hits (except for Seeking and Piercing Arrow, which replace the attack roll). You have two uses, regained on a short or long rest. Save DC = 8 + proficiency bonus + Intelligence modifier. The option damage dice rise (2d6 to 4d6, 1d6 to 2d6) at 18th level."
   },
   {
    "level": 3,
    "name": "Arcane Shot Options (1)",
    "desc": "Banishing Arrow: extra 2d6 force; target makes a Charisma save or is banished to a harmless demiplane (incapacitated, speed 0) until the end of your next turn, then returns. Beguiling Arrow: extra 2d6 psychic; target makes a Wisdom save or becomes charmed by a creature of your choice within 30 ft of it until the start of your next turn. Bursting Arrow: extra 2d6 force to the target and to each creature within 10 ft of it, no save. Enfeebling Arrow: extra 2d6 necrotic; target makes a Constitution save or its weapon attack damage is halved until the start of your next turn."
   },
   {
    "level": 3,
    "name": "Arcane Shot Options (2)",
    "desc": "Grasping Arrow: extra 2d6 poison, and the target's speed drops by 10 ft; it also takes 2d6 slashing the first time each turn it moves 1+ ft without teleporting, for 1 minute, unless it uses an action to make an Athletics check against your save DC to remove the effect. Piercing Arrow: no attack roll; the arrow forms a 1-ft-wide line out to the weapon's normal range and each creature in it makes a Dexterity save, taking normal weapon damage plus 1d6 piercing on a failure and half that on a success. Seeking Arrow: no attack roll; pick a creature you have seen within the last minute, and the arrow curves around obstacles (ignoring half and three-quarters cover) toward it; if there is a path and it is in range, the target makes a Dexterity save and on a failure takes the arrow's damage plus 1d6 force (nothing on a success), and you learn where it is. Shadow Arrow: extra 2d6 psychic; target makes a Wisdom save or cannot see beyond 5 ft until the start of your next turn."
   },
   {
    "level": 7,
    "name": "Magic Arrow",
    "desc": "Any nonmagical arrow you fire from a shortbow or longbow counts as magical for the purpose of overcoming resistance and immunity to nonmagical attacks."
   },
   {
    "level": 7,
    "name": "Curving Shot",
    "desc": "When an attack with an arcane-shot-capable bow misses a target, you may use a bonus action to redirect the arrow and reroll the attack against a different target within 60 ft of the original target."
   },
   {
    "level": 15,
    "name": "Ever-Ready Shot",
    "desc": "If you roll initiative and have no Arcane Shot uses left, you regain one use."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Arcana or Nature (choose one skill)"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "cavalier",
  "classId": "fighter",
  "name": "Cavalier",
  "source": "2014 Xanathar's",
  "label": "Martial Archetype",
  "sourceLevel": 3,
  "summary": "A mounted-combat and battlefield-control fighter who marks foes to draw their attention, shields allies, and punishes enemies that try to slip past. Strong on a mount but effective on foot as a defender.",
  "features": [
   {
    "level": 3,
    "name": "Bonus Proficiency",
    "desc": "Gain proficiency in one of these skills: Animal Handling, History, Insight, Performance, or Persuasion. Alternatively, learn one language of your choice."
   },
   {
    "level": 3,
    "name": "Born to the Saddle",
    "desc": "You have advantage on saving throws made to avoid falling off your mount. If you fall off and the drop is 10 feet or less, you land on your feet unless incapacitated. Mounting or dismounting costs you only 5 feet of movement instead of half your speed."
   },
   {
    "level": 3,
    "name": "Unwavering Mark",
    "desc": "When you hit a creature with a melee weapon attack, you can mark it until the end of your next turn. While a marked creature is within 5 feet of you, it has disadvantage on attack rolls against any target other than you. If a marked creature deals damage to someone other than you, you can use a bonus action on your next turn to make a special melee weapon attack against it with advantage; on a hit it takes extra damage equal to half your fighter level. The mark ends early if you are incapacitated or die, or if another creature marks the target. You can use this a number of times equal to your Strength modifier (minimum 1) and regain all uses on a long rest."
   },
   {
    "level": 7,
    "name": "Warding Maneuver",
    "desc": "As a reaction when you or an ally within 5 feet of you that you can see is hit by an attack, roll a d8 and add it to the target's AC against that attack, possibly turning the hit into a miss. If the attack still hits, the target has resistance to the attack's damage. You can use this a number of times equal to your Constitution modifier (minimum 1) and regain all uses on a long rest. You cannot use it while incapacitated."
   },
   {
    "level": 10,
    "name": "Hold the Line",
    "desc": "Creatures provoke an opportunity attack from you when they move 5 feet or more while within your reach. When you hit a creature with an opportunity attack, its speed becomes 0 for the rest of the current turn."
   },
   {
    "level": 15,
    "name": "Ferocious Charger",
    "desc": "Once per turn, when you hit a creature with a melee attack after moving at least 10 feet in a straight line toward it immediately beforehand, you can force it to make a Strength saving throw (DC 8 + your proficiency bonus + your Strength modifier) or be knocked prone."
   },
   {
    "level": 18,
    "name": "Vigilant Defender",
    "desc": "In combat, you get a special extra reaction on each creature's turn, including your own. You can use it only for opportunity attacks, and it does not use up your normal reaction."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "One skill from Animal Handling, History, Insight, Performance, or Persuasion (or one language of your choice)"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "samurai",
  "classId": "fighter",
  "name": "Samurai",
  "source": "2014 Xanathar's",
  "label": "Martial Archetype",
  "sourceLevel": 3,
  "summary": "A fighter built on unyielding resolve who channels a burst of focus to attack with advantage and shrug off blows. Gains social poise, sturdier mental saves, extra attacks when attacking with advantage, and a last-ditch extra turn when near death.",
  "features": [
   {
    "level": 3,
    "name": "Bonus Proficiency",
    "desc": "You gain proficiency in one of these skills of your choice: History, Insight, Performance, or Persuasion. Alternatively, you may learn one language of your choice instead."
   },
   {
    "level": 3,
    "name": "Fighting Spirit",
    "desc": "As a bonus action on your turn, you can enter a state of heightened focus. Until the end of the current turn, you have advantage on weapon attack rolls, and you gain 5 temporary hit points. The temporary hit points rise to 10 at 10th level and 15 at 15th level. You can use this feature three times, and all expended uses return when you finish a long rest."
   },
   {
    "level": 7,
    "name": "Elegant Courtier",
    "desc": "Whenever you make a Charisma (Persuasion) check, add your Wisdom modifier to the roll. You also gain proficiency in Wisdom saving throws; if you already had that proficiency, you instead gain proficiency in either Intelligence or Charisma saving throws (your choice)."
   },
   {
    "level": 10,
    "name": "Tireless Spirit",
    "desc": "When you roll initiative and have no uses of Fighting Spirit remaining, you regain one use of it."
   },
   {
    "level": 15,
    "name": "Rapid Strike",
    "desc": "Once per turn, if you have advantage on a weapon attack roll, you may give up that advantage to make one extra attack with the same weapon as part of the same Attack action."
   },
   {
    "level": 18,
    "name": "Strength Before Death",
    "desc": "When damage would reduce you to 0 hit points, you can use your reaction to delay falling unconscious and immediately take an extra turn, interrupting the current one. While you have 0 hit points during that extra turn, damage causes death saving throw failures as normal (you die if you accumulate three); when the extra turn ends, you fall unconscious if you are still at 0 hit points. Once used, you must finish a long rest before using it again."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "One skill from History, Insight, Performance, or Persuasion (or one language of your choice)",
   "Wisdom saving throws (from 7th level; Intelligence or Charisma instead if already proficient in Wisdom)"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "way-of-the-open-hand",
  "classId": "monk",
  "name": "Way of the Open Hand",
  "source": "2014 PHB",
  "label": "Monastic Tradition",
  "sourceLevel": 3,
  "summary": "Masters of armed and unarmed martial arts who unbalance foes, mend their own wounds with ki, and use deep meditation for protection.",
  "features": [
   {
    "level": 3,
    "name": "Open Hand Technique",
    "desc": "When you hit with a Flurry of Blows attack, choose one rider: target makes a Dexterity save or falls prone; target makes a Strength save or is pushed up to 15 ft; or the target loses its reactions until your next turn ends."
   },
   {
    "level": 6,
    "name": "Wholeness of Body",
    "desc": "As an action, heal hit points equal to 3 times your monk level. Usable once per long rest."
   },
   {
    "level": 11,
    "name": "Tranquility",
    "desc": "At the end of a long rest you gain the effect of sanctuary lasting until your next long rest (ends early as normal). Save DC is 8 + Wisdom modifier + proficiency bonus."
   },
   {
    "level": 17,
    "name": "Quivering Palm",
    "desc": "When you hit with an unarmed strike, spend 3 ki to start imperceptible vibrations lasting for as many days as your monk level. Later, as an action while on the same plane, end them: the target makes a Constitution save, dropping to 0 hit points on a failure or taking 10d10 necrotic damage on a success. Only one creature affected at a time; you can end the vibrations harmlessly without an action."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "way-of-shadow",
  "classId": "monk",
  "name": "Way of Shadow",
  "source": "2014 PHB",
  "label": "Monastic Tradition",
  "sourceLevel": 3,
  "summary": "A tradition of stealth and subterfuge, producing ninja-like spies and assassins who work in clans or as hired agents.",
  "features": [
   {
    "level": 3,
    "name": "Shadow Arts",
    "desc": "As an action, spend 2 ki to cast one of silence, pass without trace, darkvision or darkness (no material components needed). You also learn the minor illusion cantrip if you don't know it."
   },
   {
    "level": 6,
    "name": "Shadow Step",
    "desc": "As a bonus action while in dim light or darkness, teleport up to 60 ft to any unoccupied dim or dark spot you can see; your next melee attack this turn, the first you make, has advantage."
   },
   {
    "level": 11,
    "name": "Cloak of Shadows",
    "desc": "While in dim light or darkness, use an action to become invisible. You stay invisible until you attack, cast a spell, or enter bright light."
   },
   {
    "level": 17,
    "name": "Opportunist",
    "desc": "When an ally or anyone other than you hits a creature within 5 ft of you, you can spend your reaction to strike that creature in melee."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "way-of-the-four-elements",
  "classId": "monk",
  "name": "Way of the Four Elements",
  "source": "2014 PHB",
  "label": "Monastic Tradition",
  "sourceLevel": 3,
  "summary": "Monks who channel ki into elemental power, bending air, earth, fire and water as an extension of the body; some specialize in one element, others blend several.",
  "features": [
   {
    "level": 3,
    "name": "Disciple of the Elements",
    "desc": "You know Elemental Attunement plus one other elemental discipline, and learn one more at 6th, 11th and 17th level (you can swap one known discipline when you learn a new one). Disciplines cost ki. Spells cast through them need no material components. From 5th level you can spend extra ki to raise a spell's level by 1 per point if it scales; total ki per spell is capped at 3 (monk levels 5-8), 4 (9-12), 5 (13-16), 6 (17-20)."
   },
   {
    "level": 3,
    "name": "Elemental Attunement",
    "desc": "Action: minor elemental effect such as a harmless sensory display, lighting or snuffing a small flame, chilling or warming 1 lb of material for an hour, or shaping a 1-ft cube of earth/fire/water/mist crudely for 1 minute."
   },
   {
    "level": 3,
    "name": "Fangs of the Fire Snake",
    "desc": "When taking the Attack action, spend 1 ki: unarmed reach +10 ft that turn and unarmed hits deal fire damage; spending 1 more ki on a hit adds 1d10 fire damage."
   },
   {
    "level": 3,
    "name": "Fist of Four Thunders",
    "desc": "Spend 2 ki to cast thunderwave."
   },
   {
    "level": 3,
    "name": "Fist of Unbroken Air",
    "desc": "Action, 2 ki: creature within 30 ft makes a Strength save, taking 3d10 bludgeoning (plus 1d10 per extra ki) and being pushed up to 20 ft and knocked prone on a failure; half damage and no push/prone on a success."
   },
   {
    "level": 3,
    "name": "Rush of the Gale Spirits",
    "desc": "Spend 2 ki to cast gust of wind."
   },
   {
    "level": 3,
    "name": "Shape the Flowing River",
    "desc": "Action, 1 ki: reshape or convert water to ice (or ice to water) in an area up to 30 ft on a side within 120 ft; changes up to half the area's largest dimension; can't be used to trap or injure creatures."
   },
   {
    "level": 3,
    "name": "Sweeping Cinder Strike",
    "desc": "Spend 2 ki to cast burning hands."
   },
   {
    "level": 3,
    "name": "Water Whip",
    "desc": "Bonus action, 2 ki: creature within 30 ft makes a Dexterity save, taking 3d10 bludgeoning (plus 1d10 per extra ki) and being knocked prone or pulled up to 25 ft closer on a failure; half damage and no effect on movement on a success."
   },
   {
    "level": 6,
    "name": "Clench of the North Wind",
    "desc": "Requires 6th level. Spend 3 ki to cast hold person."
   },
   {
    "level": 6,
    "name": "Gong of the Summit",
    "desc": "Requires 6th level. Spend 3 ki to cast shatter."
   },
   {
    "level": 11,
    "name": "Eternal Mountain Defense",
    "desc": "Requires 11th level. Spend 5 ki to cast stoneskin on yourself."
   },
   {
    "level": 11,
    "name": "Flames of the Phoenix",
    "desc": "Requires 11th level. Spend 4 ki to cast fireball."
   },
   {
    "level": 11,
    "name": "Mist Stance",
    "desc": "Requires 11th level. Spend 4 ki to cast gaseous form on yourself."
   },
   {
    "level": 11,
    "name": "Ride the Wind",
    "desc": "Requires 11th level. Spend 4 ki to cast fly on yourself."
   },
   {
    "level": 17,
    "name": "Breath of Winter",
    "desc": "Requires 17th level. Spend 6 ki to cast cone of cold."
   },
   {
    "level": 17,
    "name": "River of Hungry Flame",
    "desc": "Requires 17th level. Spend 5 ki to cast wall of fire."
   },
   {
    "level": 17,
    "name": "Wave of Rolling Earth",
    "desc": "Requires 17th level. Spend 6 ki to cast wall of stone."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Renamed Warrior of the Elements in the 2024 PHB, with a different, simplified design (Elemental Attunement toggle, elemental damage on strikes, Elemental Burst), and the discipline list is gone."
 },
 {
  "id": "way-of-the-drunken-master",
  "classId": "monk",
  "name": "Way of the Drunken Master",
  "source": "2014 Xanathar's",
  "label": "Monastic Tradition",
  "sourceLevel": 3,
  "summary": "A monk who fights with a seemingly sloppy, stumbling style that is actually precise, staying mobile and slipping out of harm's way. Flurry of Blows grants free disengaging and extra speed, and ki powers redirect misses and shrug off disadvantage.",
  "features": [
   {
    "level": 3,
    "name": "Bonus Proficiencies",
    "desc": "You gain proficiency in the Performance skill and in brewer's supplies."
   },
   {
    "level": 3,
    "name": "Drunken Technique",
    "desc": "Whenever you use Flurry of Blows, you also gain the benefit of the Disengage action and your walking speed increases by 10 feet until the end of the current turn."
   },
   {
    "level": 6,
    "name": "Tipsy Sway",
    "desc": "You gain two defensive movement tricks. Leap to Your Feet: standing up from prone costs you only 5 feet of movement. Redirect Attack: when a creature misses you with a melee attack, you can spend 1 ki point as a reaction to make that attack hit a different creature of your choice within 5 feet of you instead."
   },
   {
    "level": 11,
    "name": "Drunkard's Luck",
    "desc": "When you make an ability check, attack roll, or saving throw with disadvantage, you can spend 2 ki points to cancel the disadvantage for that roll."
   },
   {
    "level": 17,
    "name": "Intoxicated Frenzy",
    "desc": "When you use Flurry of Blows, you can make up to three additional attacks with it, for a total of five, as long as each attack in that Flurry targets a different creature (unless fewer creatures are available)."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Performance",
   "Brewer's Supplies"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "way-of-the-kensei",
  "classId": "monk",
  "name": "Way of the Kensei",
  "source": "2014 Xanathar's",
  "label": "Monastic Tradition",
  "sourceLevel": 3,
  "summary": "Monks of this tradition treat chosen weapons as an extension of their martial art, using them with monk features, defending with them and, later, empowering them with ki. They also practice a refined craft such as calligraphy or painting.",
  "features": [
   {
    "level": 3,
    "name": "Path of the Kensei",
    "desc": "Choose two kensei weapons: one melee and one ranged, each a simple or martial weapon lacking the heavy and special properties (a longsword and a longbow are the sample picks). You become proficient with them, and they count as monk weapons for you while you wield them. You pick one more kensei weapon (any type meeting the same limits) at 6th, 11th and 17th level. Three benefits apply while using them. Agile Parry: if you make an unarmed strike as part of the Attack action while holding a kensei melee weapon, you gain +2 AC until the start of your next turn. Kensei's Shot: as a bonus action on your turn, make ranged attacks with a kensei weapon deal an extra 1d4 damage on a hit until the turn ends. Way of the Brush: gain proficiency with your choice of calligrapher's supplies or painter's supplies."
   },
   {
    "level": 6,
    "name": "One with the Blade",
    "desc": "Magic Kensei Weapons: your kensei weapon attacks count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks. Deft Strike: when you hit a target with a kensei weapon, you may spend 1 ki point to add your Martial Arts die to the damage; usable once per turn."
   },
   {
    "level": 11,
    "name": "Sharpen the Blade",
    "desc": "As a bonus action, spend up to 3 ki points to give one kensei weapon you touch a bonus to attack and damage rolls equal to the ki spent. The bonus lasts 1 minute, requires no concentration, and ends early if you use this feature again."
   },
   {
    "level": 17,
    "name": "Unerring Accuracy",
    "desc": "Once on each of your turns, if you miss with an attack using a monk weapon, you can reroll the attack roll."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "One melee and one ranged kensei weapon (one more at levels 6, 11 and 17)",
   "Calligrapher's supplies or painter's supplies (choose one)"
  ],
  "notes2024": ""
 },
 {
  "id": "way-of-the-sun-soul",
  "classId": "monk",
  "name": "Way of the Sun Soul",
  "source": "2014 Xanathar's",
  "label": "Monastic Tradition",
  "sourceLevel": 3,
  "summary": "Sun Soul monks channel ki into radiant energy, hurling bolts of light at range, blasting areas with fire and radiance, and eventually glowing with a protective solar aura that scorches attackers.",
  "features": [
   {
    "level": 3,
    "name": "Radiant Sun Bolt",
    "desc": "You gain a ranged spell attack, range 30 ft, that you are proficient with. It deals radiant damage equal to your Martial Arts die plus your Dexterity modifier. When you take the Attack action, you can replace one of your attacks with a sun bolt. In addition, if you use the Attack action and make a sun bolt attack as part of it, you can spend 1 ki point to make two more sun bolt attacks as a bonus action that turn."
   },
   {
    "level": 6,
    "name": "Searing Arc Strike",
    "desc": "Right after taking the Attack action on your turn, you can spend 2 ki points to cast burning hands as a bonus action, without expending a spell slot. You can pay extra ki points to cast it at a higher level, +1 spell level per extra ki point. The total ki spent on the spell (the 2 base plus extras) cannot exceed half your monk level, rounded down."
   },
   {
    "level": 11,
    "name": "Searing Sunburst",
    "desc": "As an action, you create a 20-foot-radius sphere of burning radiant light centered on a point within 150 feet. Each creature in it must succeed on a Constitution saving throw (your ki save DC) or take 2d6 radiant damage; creatures with total cover are unaffected. You can spend up to 3 ki points to add 2d6 radiant damage for each point spent."
   },
   {
    "level": 17,
    "name": "Sun Shield",
    "desc": "You constantly shed bright light in a 30-foot radius and dim light for another 30 feet. When a creature within 5 feet hits you with a melee attack, you can use your reaction to deal radiant damage to it equal to 5 + your Wisdom modifier."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "oath-of-devotion",
  "classId": "paladin",
  "name": "Oath of Devotion",
  "source": "2014 PHB",
  "label": "Sacred Oath",
  "sourceLevel": 3,
  "summary": "The knight-in-shining-armor path, dedicated to justice, honesty and order. Followers hold themselves to the strictest standards and often model themselves on angels.",
  "features": [
   {
    "level": 3,
    "name": "Channel Divinity: Sacred Weapon",
    "desc": "As an action, spend a Channel Divinity use to empower a held weapon for 1 minute: add your Charisma modifier (min +1) to its attack rolls, it sheds bright light 20 ft and dim light another 20 ft, and it counts as magical if it wasn't. Ends early if you drop it, fall unconscious, or choose to end it on your turn."
   },
   {
    "level": 3,
    "name": "Channel Divinity: Turn the Unholy",
    "desc": "As an action, present your holy symbol; each fiend or undead within 30 ft that sees or hears you makes a Wisdom save or is turned for a minute, or until it is damaged. A turned creature must flee, can't move within 30 ft of you, can't take reactions, and can only Dash, escape a movement-blocking effect, or Dodge if it has nowhere to go."
   },
   {
    "level": 7,
    "name": "Aura of Devotion",
    "desc": "You and friendly creatures within 10 ft can't be charmed while you are conscious; range becomes 30 ft at 18th level."
   },
   {
    "level": 15,
    "name": "Purity of Spirit",
    "desc": "You are permanently under the effect of protection from evil and good."
   },
   {
    "level": 20,
    "name": "Holy Nimbus",
    "desc": "As an action, radiate sunlight for 1 minute: bright light 30 ft plus 30 ft dim; enemies that start their turn in the bright light take 10 radiant damage; you have advantage on saves against spells from fiends and undead. Once per long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "protection from evil and good",
     "sanctuary"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "lesser restoration",
     "zone of truth"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "beacon of hope",
     "dispel magic"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "freedom of movement",
     "guardian of faith"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "commune",
     "flame strike"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "oath-of-the-ancients",
  "classId": "paladin",
  "name": "Oath of the Ancients",
  "source": "2014 PHB",
  "label": "Sacred Oath",
  "sourceLevel": 3,
  "summary": "An oath rooted in elven and druidic tradition, favoring the preservation of light, life and beauty over rigid law. Its knights wear leaf, antler and flower motifs.",
  "features": [
   {
    "level": 3,
    "name": "Channel Divinity: Nature's Wrath",
    "desc": "As an action, conjure spectral vines against a creature you can see within 10 ft; it must succeed on a Strength or Dexterity save (its choice) or be restrained, repeating the save at the end of each of its turns to break free."
   },
   {
    "level": 3,
    "name": "Channel Divinity: Turn the Faithless",
    "desc": "As an action, present your holy symbol; each fey or fiend within 30 ft that can hear you makes a Wisdom save or is turned for a minute, or until it is damaged (flees, can't take reactions, limited to Dash/escape/Dodge). Illusions or shapechanging hiding its true form are revealed while it is turned."
   },
   {
    "level": 7,
    "name": "Aura of Warding",
    "desc": "You and friendly creatures within 10 ft have resistance to damage from spells; range becomes 30 ft at 18th level."
   },
   {
    "level": 15,
    "name": "Undying Sentinel",
    "desc": "When reduced to 0 hit points without being killed outright, you can drop to 1 hit point instead, once per long rest. You also take no penalties of aging and can't be magically aged."
   },
   {
    "level": 20,
    "name": "Elder Champion",
    "desc": "As an action, transform into a primal force for 1 minute: regain 10 hit points at the start of each of your turns; paladin spells with a 1-action casting time can be cast as a bonus action; enemies within 10 ft have disadvantage on saves against your paladin spells and Channel Divinity. Once per long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "ensnaring strike",
     "speak with animals"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "moonbeam",
     "misty step"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "plant growth",
     "protection from energy"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "ice storm",
     "stoneskin"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "commune with nature",
     "tree stride"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "Oath of the Ancients returns in the 2024 PHB with a reworked Channel Divinity (Nature's Wrath); Aura of Warding and Undying Sentinel are broadly similar."
 },
 {
  "id": "oath-of-vengeance",
  "classId": "paladin",
  "name": "Oath of Vengeance",
  "source": "2014 PHB",
  "label": "Sacred Oath",
  "sourceLevel": 3,
  "summary": "A grim commitment to hunt down and punish those guilty of grave wrongs, putting justice ahead of personal purity. Its knights are often neutral or lawful neutral.",
  "features": [
   {
    "level": 3,
    "name": "Channel Divinity: Abjure Enemy",
    "desc": "As an action, present your holy symbol and target a creature within 60 ft that you can see; it makes a Wisdom save (fiends and undead have disadvantage; creatures immune to fright are unaffected). On a failure it is frightened for 1 minute or until damaged, with speed 0; on a success its speed is halved for 1 minute or until damaged."
   },
   {
    "level": 3,
    "name": "Channel Divinity: Vow of Enmity",
    "desc": "As a bonus action, swear enmity against a creature you can see within 10 ft; you have advantage on attack rolls against it for the next minute, ending early if it falls to 0 hit points or goes unconscious."
   },
   {
    "level": 7,
    "name": "Relentless Avenger",
    "desc": "When you hit with an opportunity attack, you may immediately move up to half your speed as part of the same reaction, without provoking opportunity attacks."
   },
   {
    "level": 15,
    "name": "Soul of Vengeance",
    "desc": "Whenever a creature under your Vow of Enmity makes an attack, you may spend your reaction to strike back at it with a melee weapon attack, provided it is within reach."
   },
   {
    "level": 20,
    "name": "Avenging Angel",
    "desc": "As an action, become an angelic avenger for 1 hour: gain a 60 ft flying speed from wings, and emit a 30 ft aura of menace; the first time an enemy enters it or starts its turn there in a battle, it makes a Wisdom save or is frightened for 1 minute or until it takes damage, and attacks against frightened creatures have advantage. Once per long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "bane",
     "hunter's mark"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "hold person",
     "misty step"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "haste",
     "protection from energy"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "banishment",
     "dimension door"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "hold monster",
     "scrying"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "oath-of-conquest",
  "classId": "paladin",
  "name": "Oath of Conquest",
  "source": "2014 Xanathar's",
  "label": "Sacred Oath",
  "sourceLevel": 3,
  "summary": "A paladin sworn to crush chaos and impose order through strength, who terrifies enemies, pins frightened foes in place with a damaging aura, and punishes those who strike them. Their capstone turns them into a near-unstoppable war leader for a minute.",
  "features": [
   {
    "level": 3,
    "name": "Oath Spells",
    "desc": "You always have certain spells prepared once you reach the listed paladin levels; they do not count against your prepared spell total."
   },
   {
    "level": 3,
    "name": "Channel Divinity: Conquering Presence",
    "desc": "As an action, you spend a Channel Divinity use to project dread. Each creature of your choice within 30 feet that can see you must succeed on a Wisdom save against your spell save DC or be frightened of you for 1 minute. A frightened creature repeats the save at the end of each of its turns, ending the effect on a success."
   },
   {
    "level": 3,
    "name": "Channel Divinity: Guided Strike",
    "desc": "When you make an attack roll, you can spend a Channel Divinity use to add +10 to that roll. You decide after seeing the d20 result but before the DM says whether the attack hits or misses."
   },
   {
    "level": 7,
    "name": "Aura of Conquest",
    "desc": "While you are conscious, you project a 10-foot aura (30 feet at paladin level 18). Any frightened creature in the aura has its speed reduced to 0 and takes psychic damage equal to half your paladin level at the start of each of its turns."
   },
   {
    "level": 15,
    "name": "Scornful Rebuke",
    "desc": "Whenever a creature hits you with an attack, it takes psychic damage equal to your Charisma modifier (minimum 1), provided you are not incapacitated."
   },
   {
    "level": 20,
    "name": "Invincible Conqueror",
    "desc": "As an action, you gain a 1-minute transformation: you have resistance to all damage; when you take the Attack action you can make one extra attack as part of it; and your weapon attacks score a critical hit on a roll of 19 or 20. Usable once per long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "Armor of Agathys",
     "Command"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "Hold Person",
     "Spiritual Weapon"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "Bestow Curse",
     "Fear"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "Dominate Beast",
     "Stoneskin"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "Cloudkill",
     "Dominate Person"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "oath-of-redemption",
  "classId": "paladin",
  "name": "Oath of Redemption",
  "source": "2014 Xanathar's",
  "label": "Sacred Oath",
  "sourceLevel": 3,
  "summary": "A pacifist-leaning oath that favors talking down conflict and shielding others, even at personal cost, believing almost anyone can be redeemed. Its paladins turn aside violence, absorb harm meant for allies, and punish only those who strike first.",
  "features": [
   {
    "level": 3,
    "name": "Tenets of Redemption",
    "desc": "The oath asks you to seek peace first, to protect others by taking harm on yourself, to give foes the chance to change, and to use force only as a last resort. Sparing and guiding the wicked is valued over killing them."
   },
   {
    "level": 3,
    "name": "Channel Divinity: Emissary of Peace",
    "desc": "As a bonus action, use Channel Divinity to gain a +5 bonus to Charisma (Persuasion) checks for 10 minutes."
   },
   {
    "level": 3,
    "name": "Channel Divinity: Rebuke the Violent",
    "desc": "As a reaction when a creature within 30 feet that you can see deals damage to someone other than itself, use Channel Divinity to force the attacker to make a Wisdom save. On a failure it takes radiant damage equal to the damage it just dealt; on a success it takes half that amount."
   },
   {
    "level": 7,
    "name": "Aura of the Guardian",
    "desc": "As a reaction when an ally within 10 feet takes damage, you magically take that damage instead. This transfer ignores any resistance or immunity you have and the damage cannot be reduced in any way. The range grows to 30 feet at 18th level."
   },
   {
    "level": 15,
    "name": "Protective Spirit",
    "desc": "A holy presence guards you. At the end of each of your turns, if you are below half your hit point maximum and not incapacitated, you regain 1d6 + half your paladin level hit points."
   },
   {
    "level": 20,
    "name": "Emissary of Redemption",
    "desc": "You become an embodiment of peace. You have resistance to all damage dealt by other creatures, and whenever a creature damages you, it takes radiant damage equal to half the damage you took after resistance. This protection ends until you finish a long rest if you make an attack, cast a spell, or deal damage to any creature other than yourself."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "Sanctuary",
     "Sleep"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "Calm Emotions",
     "Hold Person"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "Counterspell",
     "Hypnotic Pattern"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "Otiluke's Resilient Sphere",
     "Stoneskin"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "Hold Monster",
     "Wall of Force"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "hunter",
  "classId": "ranger",
  "name": "Hunter",
  "source": "2014 PHB",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "A ranger who stands as a shield between civilization and wilderness threats, learning specialised tactics against everything from ogre packs to dragons.",
  "features": [
   {
    "level": 3,
    "name": "Hunter's Prey",
    "desc": "Choose one: Colossus Slayer (once per turn, a weapon hit on a creature below its max HP adds 1d8 damage); Giant Killer (reaction: attack a Large or larger creature within 5 ft that just hit or missed you); Horde Breaker (once per turn, make an extra attack with the same weapon on a different creature within 5 ft of the first target)."
   },
   {
    "level": 7,
    "name": "Defensive Tactics",
    "desc": "Choose one: Escape the Horde (opportunity attacks against you have disadvantage); Multiattack Defense (after a creature hits you, gain +4 AC against its further attacks that turn); Steel Will (advantage on saves against being frightened)."
   },
   {
    "level": 11,
    "name": "Multiattack",
    "desc": "Choose one: Volley (action: ranged attack against every creature within 10 ft of a point you see in weapon range, separate roll and ammunition for each); Whirlwind Attack (action: melee attack against every creature within 5 ft of you, separate roll for each)."
   },
   {
    "level": 15,
    "name": "Superior Hunter's Defense",
    "desc": "Choose one: Evasion (Dexterity saves for half damage become no damage on success, half on failure); Stand Against the Tide (reaction: when a hostile misses you in melee, force it to repeat that attack against another creature of your choice, not itself); Uncanny Dodge (reaction: halve the damage of an attack from a visible attacker that hits you)."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "The 2024 Hunter is rebuilt: Hunter's Lore, Hunter's Prey (Colossus Slayer or Horde Breaker), Defensive Tactics, Superior Hunter's Prey and Superior Hunter's Defense, with Hunter's Mark spells tied in."
 },
 {
  "id": "beast-master",
  "classId": "ranger",
  "name": "Beast Master",
  "source": "2014 PHB",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "A ranger bonded in friendship with a beast, the two fighting as a single team against threats to both the civilised world and the wild.",
  "features": [
   {
    "level": 3,
    "name": "Ranger's Companion",
    "desc": "Gain a beast companion of size Medium or smaller and CR 1/4 or lower (hawk, mastiff, panther as examples). It adds your proficiency bonus to AC, attack rolls, damage rolls, and proficient saves and skills; its HP is the greater of its usual maximum or 4 x your ranger level. It acts on your initiative; you move it freely by voice, and use your action to have it Attack, Dash, Disengage, Dodge, or Help (with Extra Attack you may also attack when commanding Attack). You move stealthily at normal pace in favored terrain when travelling with only the beast. If it dies, 8 hours of magical bonding with a non-hostile beast gets a replacement."
   },
   {
    "level": 7,
    "name": "Exceptional Training",
    "desc": "On a turn when the beast doesn't attack, you may use a bonus action to command it to Dash, Disengage, Dodge, or Help."
   },
   {
    "level": 11,
    "name": "Bestial Fury",
    "desc": "When you order the beast to Attack, it strikes twice."
   },
   {
    "level": 15,
    "name": "Share Spells",
    "desc": "When you cast a spell that targets you, it can also affect your companion if it is within 30 ft.."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "The 2024 Beast Master has a Primal Companion (Beast of the Land, Sea, or Sky stat block that scales with level), Exceptional Training, Bestial Fury, and Share Spells."
 },
 {
  "id": "drakewarden",
  "classId": "ranger",
  "name": "Drakewarden",
  "source": "2014 Fizban's",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "A ranger who forms a bond with a draconic spirit that manifests as a drake. The drake fights beside you, later grows wings and becomes a rideable mount, and the pair gain elemental damage, breath attacks and resistances tied to a chosen damage type.",
  "features": [
   {
    "level": 3,
    "name": "Draconic Gift",
    "desc": "You learn the Thaumaturgy cantrip (it does not count against your cantrips known; Wisdom is its casting ability) and you learn the Draconic language."
   },
   {
    "level": 3,
    "name": "Drake Companion",
    "desc": "As an action you can summon a drake companion in an unoccupied space within 30 feet, once per long rest or by expending a spell slot of 1st level or higher. When summoning it you choose a Draconic Essence damage type: acid, cold, fire, lightning or poison. The drake is a Small creature friendly to you and your allies that acts on your initiative, obeys your commands, and uses your proficiency bonus for its stats; its hit points and bite damage scale with your ranger level and proficiency bonus. It stays until reduced to 0 hit points, you dismiss it, or you summon it again, and it vanishes if you die. If it is killed you can bring it back with a long rest or by summoning it again."
   },
   {
    "level": 7,
    "name": "Bond of Fang and Scale",
    "desc": "Your bond deepens. You gain resistance to the damage type of your Draconic Essence, and the drake's bite deals an extra 1d6 damage of that type. When you summon the drake, choose one benefit: it gains a swim speed equal to its walking speed and can breathe air and water, or it grows wings and gains a flying speed equal to your walking speed. The drake also becomes Medium and can serve as your mount; while you ride it, it cannot use the flying speed from this feature."
   },
   {
    "level": 11,
    "name": "Drake's Breath",
    "desc": "As an action, you or your drake can exhale a 30-foot cone of destructive energy, dealing 8d6 damage (10d6 at 15th level) of acid, cold, fire, lightning or poison (chosen each use, not tied to the Draconic Essence); Dexterity save against your spell save DC for half. Usable once per long rest, or again by expending a spell slot of 3rd level or higher."
   },
   {
    "level": 15,
    "name": "Perfected Bond",
    "desc": "The drake's bite deals another extra 1d6 of its essence damage type (2d6 extra in total), and it grows to Large. It can now use the flying speed from Bond of Fang and Scale while you ride it. Also, when you or the drake take damage while within 30 feet of each other, you can use your reaction to give yourself or the drake resistance to that instance of damage."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Draconic (language)"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook; the 2024 ranger subclasses are Beast Master, Fey Wanderer, Gloom Stalker and Hunter."
 },
 {
  "id": "fey-wanderer",
  "classId": "ranger",
  "name": "Fey Wanderer",
  "source": "2014 Tasha's",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "A Ranger touched by the Feywild who blends fey magic with woodland skill. Fey Wanderers add psychic damage to weapon hits, are charming and persuasive, resist and redirect charm and fear effects, call fey allies, and teleport with Misty Step.",
  "features": [
   {
    "level": 3,
    "name": "Dreadful Strikes",
    "desc": "Once on each of your turns, when you hit a creature with a weapon attack, you deal an extra 1d4 psychic damage. This extra damage increases to 1d6 at 11th level."
   },
   {
    "level": 3,
    "name": "Fey Wanderer Magic",
    "desc": "You always have certain spells prepared; they do not count against your number of prepared Ranger spells. Charm Person at 3rd level, Misty Step at 5th, Summon Fey at 9th, Dimension Door at 13th, and Mislead at 17th."
   },
   {
    "level": 3,
    "name": "Otherworldly Glamour",
    "desc": "Add your Wisdom modifier (minimum +1) to any Charisma check you make. You also gain proficiency in one of these skills of your choice: Deception, Performance, or Persuasion."
   },
   {
    "level": 7,
    "name": "Beguiling Twist",
    "desc": "You have advantage on saving throws against being charmed or frightened. In addition, when you or a creature you can see within 120 feet succeeds on a saving throw against being charmed or frightened, you can use your reaction to force a different creature you can see within 120 feet to make a Wisdom saving throw against your spell save DC. On a failure, it is charmed or frightened (your choice, matching the condition that was resisted) for 1 minute. It can repeat the save at the end of each of its turns, ending the effect on a success."
   },
   {
    "level": 11,
    "name": "Fey Reinforcements",
    "desc": "You learn Summon Fey (if not already known) and can cast it without a material component. You can also cast it once without expending a spell slot, regaining that use after a long rest. When you cast it this way (or any time you cast it), you may choose to have it not require concentration, in which case its duration becomes 1 minute. Casting it with a spell slot still works normally."
   },
   {
    "level": 15,
    "name": "Misty Wanderer",
    "desc": "You can cast Misty Step a number of times equal to your Wisdom modifier (minimum once) without expending a spell slot, regaining all uses after a long rest. When you cast it, you can bring along one willing creature you can see within 5 feet of you; it appears in an unoccupied space within 5 feet of your destination."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "Charm Person"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "Misty Step"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "Summon Fey"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "Dimension Door"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "Mislead"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "One skill of your choice from: Deception, Performance, Persuasion"
  ],
  "notes2024": "The 2024 Player's Handbook reprints the Fey Wanderer with revised features."
 },
 {
  "id": "gloom-stalker",
  "classId": "ranger",
  "name": "Gloom Stalker",
  "source": "2014 Xanathar's",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "An ambush specialist who thrives in darkness. Gloom Stalkers strike hard on the opening turn of a fight, see in the dark better than most, hide from creatures that rely on darkvision, and gain protection against mental effects and incoming attacks as they level.",
  "features": [
   {
    "level": 3,
    "name": "Gloom Stalker Magic",
    "desc": "You gain extra spells that are always prepared at certain Ranger levels: disguise self (3rd), rope trick (5th), fear (9th), greater invisibility (13th), seeming (17th). They do not count against your number of prepared spells."
   },
   {
    "level": 3,
    "name": "Dread Ambusher",
    "desc": "Add your Wisdom modifier to your initiative rolls. On the first turn of any combat, your walking speed rises by 10 feet until that turn ends. If you take the Attack action on that first turn, you make one additional weapon attack as part of it, and if that extra attack hits, it deals an extra 1d8 damage of the weapon's damage type."
   },
   {
    "level": 3,
    "name": "Umbral Sight",
    "desc": "You gain darkvision out to 60 feet, or extend your existing darkvision by 30 feet. While you are in darkness, creatures that rely on darkvision to perceive you cannot see you; you are effectively invisible to them in the dark."
   },
   {
    "level": 7,
    "name": "Iron Mind",
    "desc": "You gain proficiency in Wisdom saving throws. If you already have it, you instead gain proficiency in Intelligence or Charisma saving throws (your choice)."
   },
   {
    "level": 11,
    "name": "Stalker's Flurry",
    "desc": "Once on each of your turns, when you miss with a weapon attack, you can immediately make another weapon attack as part of the same action."
   },
   {
    "level": 15,
    "name": "Shadowy Dodge",
    "desc": "As a reaction when a creature makes an attack roll against you without having advantage on it, you can impose disadvantage on that roll. You must decide this before the outcome of the attack is known."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "disguise self"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "rope trick"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "fear"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "greater invisibility"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "seeming"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [
   "Wisdom saving throws (level 7; Intelligence or Charisma instead if already proficient in Wisdom)"
  ],
  "notes2024": "The 2024 Player's Handbook reprints the Gloom Stalker with the same theme and a reworked Dread Ambusher (an Ambusher's Leap burst of speed and extra damage in place of the first-turn bonus attack) alongside Umbral Sight, Iron Mind, Stalker's Flurry and Shadowy Dodge."
 },
 {
  "id": "horizon-walker",
  "classId": "ranger",
  "name": "Horizon Walker",
  "source": "2014 Xanathar's",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "A ranger who guards the world against threats from other planes. Horizon Walkers sense planar portals, hit foes with bonus force damage, slip into the Ethereal Plane, teleport mid-combat, and shrug off damage by phasing partly out of reality.",
  "features": [
   {
    "level": 3,
    "name": "Horizon Walker Magic",
    "desc": "You always have certain spells prepared once you reach the listed ranger levels: protection from evil and good at 3, misty step at 5, haste at 9, banishment at 13 and teleportation circle at 17. They do not count against your number of prepared spells."
   },
   {
    "level": 3,
    "name": "Detect Portal",
    "desc": "As an action, you sense the direction and distance to the closest planar portal within 1 mile of you. After using this, you must finish a short or long rest before using it again."
   },
   {
    "level": 3,
    "name": "Planar Warrior",
    "desc": "As a bonus action, pick one creature you can see within 30 feet. The next time you hit it with a ranged or melee weapon attack this turn, all of the attack's damage becomes force damage, and it takes an extra 1d8 force damage. The extra damage rises to 2d8 when you reach 11th level."
   },
   {
    "level": 7,
    "name": "Ethereal Step",
    "desc": "As a bonus action, you cast the etherealness spell with this feature, without a spell slot or components. The effect ends at the end of the current turn. You must finish a short or long rest before using it again."
   },
   {
    "level": 11,
    "name": "Distant Strike",
    "desc": "When you take the Attack action, you may teleport up to 10 feet to an unoccupied space you can see before each attack you make. If you attack at least two different creatures with the action, you make one additional attack, against a third creature."
   },
   {
    "level": 15,
    "name": "Spectral Defense",
    "desc": "As a reaction when you take damage from an attack, you gain resistance to all of the damage from that instance of damage."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "protection from evil and good"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "misty step"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "haste"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "banishment"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "teleportation circle"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "The 2024 Player's Handbook does not include Horizon Walker; it remains a 2014 Xanathar's subclass without an official 2024 revision."
 },
 {
  "id": "monster-slayer",
  "classId": "ranger",
  "name": "Monster Slayer",
  "source": "2014 Xanathar's",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "A Ranger archetype built to hunt down dangerous individual foes such as fiends, undead and rogue spellcasters. It reveals a target's defenses, marks prey for bonus damage, shores up your saves against that prey, and can shut down enemy spells and teleportation.",
  "features": [
   {
    "level": 3,
    "name": "Monster Slayer Magic",
    "desc": "You always have certain spells prepared, and they do not count against your prepared-spell total: protection from evil and good at 3rd level, zone of truth at 5th, magic circle at 9th, banishment at 13th, and hold monster at 17th."
   },
   {
    "level": 3,
    "name": "Hunter's Sense",
    "desc": "As an action, pick a creature within 60 feet and learn whether it has any damage immunities, resistances or vulnerabilities, and which ones. You can do this a number of times equal to your Wisdom modifier (minimum once), regaining all uses on a long rest."
   },
   {
    "level": 3,
    "name": "Slayer's Prey",
    "desc": "As a bonus action, designate a creature you can see within 60 feet as your prey. The first time on each of your turns that you hit it with a weapon attack, it takes an extra 1d6 damage. The designation lasts until you finish a short or long rest, or until you designate a different creature."
   },
   {
    "level": 7,
    "name": "Supernatural Defense",
    "desc": "Whenever your Slayer's Prey target forces you to make a saving throw or tries to escape your grapple, add 1d6 to your roll (the save or the ability check)."
   },
   {
    "level": 11,
    "name": "Magic-User's Nemesis",
    "desc": "As a reaction, when you see a creature within 60 feet casting a spell or teleporting, force it to make a Wisdom save against your spell save DC. On a failure, the spell fails and is wasted, or the teleportation fails. Once used, it recharges after a short or long rest."
   },
   {
    "level": 15,
    "name": "Slayer's Counter",
    "desc": "If your Slayer's Prey target makes you roll a saving throw, you can use your reaction to make a weapon attack against it before you roll. If the attack hits, your save automatically succeeds, and the attack's damage still applies as normal."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "protection from evil and good"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "zone of truth"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "magic circle"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "banishment"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "hold monster"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook; the 2024 ranger subclasses are Beast Master, Fey Wanderer, Gloom Stalker and Hunter."
 },
 {
  "id": "swarmkeeper",
  "classId": "ranger",
  "name": "Swarmkeeper",
  "source": "2014 Tasha's",
  "label": "Ranger Archetype",
  "sourceLevel": 3,
  "summary": "A ranger who fights alongside a swarm of tiny nature spirits (sprites, pixies or insects). The swarm shoves enemies around, repositions you, lets you fly briefly and teleports you away when you are hurt, and it grants a small suite of control spells.",
  "features": [
   {
    "level": 3,
    "name": "Swarmkeeper Magic",
    "desc": "You learn the Mage Hand cantrip; when you cast it, the hand appears as a cluster of nature spirits. You also always have certain spells prepared at the ranger levels shown (Faerie Fire and Sleep at 3, Hold Person at 5, Gaseous Form at 9, Arcane Eye at 13, Insect Plague at 17); they do not count against your prepared-spell total."
   },
   {
    "level": 3,
    "name": "Gathered Swarm",
    "desc": "Once per turn, when you hit a creature with an attack, your swarm can add one effect of your choice. (1) The target takes an extra 1d6 piercing damage. (2) The target must succeed on a Strength saving throw against your spell save DC or be moved up to 15 feet horizontally in a direction you choose. (3) You move up to 5 feet horizontally without provoking opportunity attacks."
   },
   {
    "level": 7,
    "name": "Writhing Tide",
    "desc": "As a bonus action, the swarm lifts you, granting a flying speed of 10 feet and the ability to hover for 1 minute. You can use this a number of times equal to your proficiency bonus, regaining all uses on a long rest."
   },
   {
    "level": 11,
    "name": "Mighty Swarm",
    "desc": "Gathered Swarm improves: the damage option becomes 1d8 instead of 1d6; a target that fails the Strength save is also knocked prone; and when you choose the self-movement option, the swarm gives you half cover until the start of your next turn."
   },
   {
    "level": 15,
    "name": "Swarming Dispersal",
    "desc": "When you take damage, you can use your reaction to gain resistance to that damage type against the triggering damage and teleport up to 30 feet to an unoccupied space you can see, as the swarm scatters and reforms. You can do this a number of times equal to your proficiency bonus, regaining all uses on a long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "Faerie Fire",
     "Sleep"
    ],
    "kind": "prepared"
   },
   {
    "level": 5,
    "spells": [
     "Hold Person"
    ],
    "kind": "prepared"
   },
   {
    "level": 9,
    "spells": [
     "Gaseous Form"
    ],
    "kind": "prepared"
   },
   {
    "level": 13,
    "spells": [
     "Arcane Eye"
    ],
    "kind": "prepared"
   },
   {
    "level": 17,
    "spells": [
     "Insect Plague"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook; the 2024 ranger subclasses are Beast Master, Fey Wanderer, Gloom Stalker and Hunter."
 },
 {
  "id": "thief",
  "classId": "rogue",
  "name": "Thief",
  "source": "2014 PHB",
  "label": "Roguish Archetype",
  "sourceLevel": 3,
  "summary": "A specialist in burglary, delving and treasure-hunting who gains extra agility, climbing prowess and the knack of using any magic item.",
  "features": [
   {
    "level": 3,
    "name": "Fast Hands",
    "desc": "Your Cunning Action bonus action can also be used for a Sleight of Hand check, to disarm a trap or pick a lock with thieves' tools, or to take the Use an Object action."
   },
   {
    "level": 3,
    "name": "Second-Story Work",
    "desc": "Climbing no longer costs extra movement, and your running jump distance increases by feet equal to your Dexterity modifier."
   },
   {
    "level": 9,
    "name": "Supreme Sneak",
    "desc": "You have advantage on Dexterity (Stealth) checks if you move no more than half your speed that turn."
   },
   {
    "level": 13,
    "name": "Use Magic Device",
    "desc": "You ignore all class, race and level requirements for using magic items."
   },
   {
    "level": 17,
    "name": "Thief's Reflexes",
    "desc": "You take two turns in the first round of any combat: one at your normal initiative and one at initiative minus 10. Doesn't work if you are surprised."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "assassin",
  "classId": "rogue",
  "name": "Assassin",
  "source": "2014 PHB",
  "label": "Roguish Archetype",
  "sourceLevel": 3,
  "summary": "A killer, spy or bounty hunter who relies on ambush, poison and disguise to eliminate targets swiftly.",
  "features": [
   {
    "level": 3,
    "name": "Bonus Proficiencies",
    "desc": "You gain proficiency with the disguise kit and the poisoner's kit."
   },
   {
    "level": 3,
    "name": "Assassinate",
    "desc": "You have advantage on attack rolls against creatures that haven't yet acted in combat, and any hit against a surprised creature is a critical hit."
   },
   {
    "level": 9,
    "name": "Infiltration Expertise",
    "desc": "By spending 7 days and 25 gp you can build a false identity (not someone else's real one) with history, profession and affiliations; others take it at face value unless something clearly gives you away."
   },
   {
    "level": 13,
    "name": "Impostor",
    "desc": "After at least 3 hours studying a person's speech, handwriting and behavior, you can mimic them flawlessly; if a wary creature suspects you, you have advantage on Charisma (Deception) checks to avoid detection."
   },
   {
    "level": 17,
    "name": "Death Strike",
    "desc": "When you hit a surprised creature, it makes a Constitution save (DC 8 + Dexterity modifier + proficiency bonus); on a failure your attack damage is doubled."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Disguise kit",
   "Poisoner's kit"
  ],
  "notes2024": ""
 },
 {
  "id": "arcane-trickster",
  "classId": "rogue",
  "name": "Arcane Trickster",
  "source": "2014 PHB",
  "label": "Roguish Archetype",
  "sourceLevel": 3,
  "summary": "A rogue who adds enchantment and illusion magic to stealth and agility, favoring pranks, pickpocketing and burglary.",
  "features": [
   {
    "level": 3,
    "name": "Spellcasting",
    "desc": "You cast wizard spells using Intelligence (save DC 8 + proficiency + Int mod; attack = proficiency + Int mod). You know 3 cantrips (mage hand plus two wizard cantrips; a 4th at level 10) and spells known rise from 3 at level 3 to 13 at level 20. Slots: 2 first-level at 3rd, up to 4 first, 3 second, 3 third, and 1 fourth-level slot at 19th. At 3rd level you know three 1st-level wizard spells, two of which must be enchantment or illusion. Each later spell you learn must be enchantment or illusion, except those gained at 8th, 14th and 20th level, which can be from any school. Slots return on a long rest, and you may swap one known spell on each level gained."
   },
   {
    "level": 3,
    "name": "Mage Hand Legerdemain",
    "desc": "Your mage hand can be invisible and can stow or retrieve objects in containers worn or carried by others, and use thieves' tools at range. Doing so unnoticed requires a Sleight of Hand check contested by the target's Perception. You can control the hand with Cunning Action."
   },
   {
    "level": 9,
    "name": "Magical Ambush",
    "desc": "Casting a spell at a creature that can't see you where you hide forces it to have disadvantage on any save against that spell until the end of the turn."
   },
   {
    "level": 13,
    "name": "Versatile Trickster",
    "desc": "As a bonus action, mark a creature within 5 feet of your mage hand to gain advantage on attack rolls against it until the end of the turn."
   },
   {
    "level": 17,
    "name": "Spell Thief",
    "desc": "As a reaction right after a creature casts a spell that targets you or includes you in its area, it makes a save against your spell save DC using its spellcasting modifier. On a failure the spell is negated against you and you learn it (must be 1st level or higher and of a level you can cast) for 8 hours, during which the caster can't cast it. Usable once per long rest."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "inquisitive",
  "classId": "rogue",
  "name": "Inquisitive",
  "source": "2014 Xanathar's",
  "label": "Roguish Archetype",
  "sourceLevel": 3,
  "summary": "A rogue detective who reads people and spots clues better than anyone, seeing through lies and illusions. Studying a foe's behavior lets you land Sneak Attacks without needing an ally or advantage.",
  "features": [
   {
    "level": 3,
    "name": "Ear for Deceit",
    "desc": "When you make a Wisdom (Insight) check to tell whether someone is lying, any d20 roll of 7 or lower counts as an 8."
   },
   {
    "level": 3,
    "name": "Eye for Detail",
    "desc": "As a bonus action, you can make a Wisdom (Perception) check to spot a hidden creature or object, or an Intelligence (Investigation) check to uncover or decipher clues."
   },
   {
    "level": 3,
    "name": "Insightful Fighting",
    "desc": "As a bonus action, make a Wisdom (Insight) check against a creature you can see and that can see or hear you, contested by its Charisma (Deception). On a success, for the next minute (or until you successfully use this again) you can Sneak Attack that creature even without advantage on the attack, provided you don't have disadvantage and aren't ruled out by other Sneak Attack conditions. On a failure, you can't try again on that creature until a long rest."
   },
   {
    "level": 9,
    "name": "Steady Eye",
    "desc": "You have advantage on Wisdom (Perception) and Intelligence (Investigation) checks if you moved no more than half your speed during the turn."
   },
   {
    "level": 13,
    "name": "Unerring Eye",
    "desc": "As an action, you sense whether illusions, shapechangers, or other magic meant to deceive is within 30 feet of you, provided you aren't blinded or deafened. This reveals only that such magic is present, not what it is. You can use it a number of times equal to your Wisdom modifier (minimum 1), regaining all uses on a long rest."
   },
   {
    "level": 17,
    "name": "Eye for Weakness",
    "desc": "While Insightful Fighting is active against a creature, your Sneak Attack deals an extra 3d6 damage to it."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "mastermind",
  "classId": "rogue",
  "name": "Mastermind",
  "source": "2014 Xanathar's",
  "label": "Roguish Archetype",
  "sourceLevel": 3,
  "summary": "A spymaster-style rogue who excels at deception, reading people and coordinating allies. Gains disguise and forgery skills, a long-range bonus-action Help, insight into foes' relative strength, and eventually mind-reading immunity.",
  "features": [
   {
    "level": 3,
    "name": "Master of Intrigue",
    "desc": "You gain proficiency with the disguise kit, the forgery kit, and one gaming set of your choice, and you learn two languages of your choice. You can also copy another person's speech patterns and accent after listening to them speak for at least 1 minute; a listener who hears the imitation notices nothing amiss unless a Wisdom (Insight) check says otherwise."
   },
   {
    "level": 3,
    "name": "Master of Tactics",
    "desc": "You can take the Help action as a bonus action. When you use Help to distract an enemy so an ally's attack gets advantage, the enemy can be up to 30 feet from you instead of the normal 5 feet."
   },
   {
    "level": 9,
    "name": "Insightful Manipulator",
    "desc": "After spending at least 1 minute observing or talking with a creature outside of combat, you can ask the DM to compare it to you in two of these areas: Intelligence score, Wisdom score, Charisma score, and class levels (if any). The DM tells you whether the creature is your equal, superior, or inferior in each of the two chosen areas."
   },
   {
    "level": 13,
    "name": "Misdirection",
    "desc": "When a creature makes an attack against you while another creature within 5 feet of you is giving you at least three-quarters cover from the attacker, you can use your reaction to make the attack hit that other creature instead of you."
   },
   {
    "level": 17,
    "name": "Soul of Deceit",
    "desc": "Your mind can't be read by telepathy or any other means unless you allow it. You can show false surface thoughts by making a Charisma (Deception) check contested by the reader's Wisdom (Insight) check. Magic that would force you to speak the truth, such as zone of truth, doesn't compel you, and magical means can't determine whether you are lying."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Disguise Kit",
   "Forgery Kit",
   "One gaming set of your choice",
   "Two languages of your choice"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "scout",
  "classId": "rogue",
  "name": "Scout",
  "source": "2014 Xanathar's",
  "label": "Roguish Archetype",
  "sourceLevel": 3,
  "summary": "A wilderness-savvy rogue who skirmishes across the battlefield, excels at Nature and Survival, and grows steadily faster. Late features let the Scout set up allies with an opening strike and squeeze in an extra Sneak Attack.",
  "features": [
   {
    "level": 3,
    "name": "Skirmisher",
    "desc": "As a reaction when an enemy finishes its turn within 5 feet of you, you may move up to half your speed. This movement does not provoke opportunity attacks."
   },
   {
    "level": 3,
    "name": "Survivalist",
    "desc": "You gain proficiency in Nature and Survival. Your proficiency bonus is doubled for ability checks using either skill (expertise)."
   },
   {
    "level": 9,
    "name": "Superior Mobility",
    "desc": "Your walking speed increases by 10 feet. If you have a climbing or swimming speed, it increases by the same amount."
   },
   {
    "level": 13,
    "name": "Ambush Master",
    "desc": "You have advantage on initiative rolls. In addition, the first creature you hit during the first round of a combat becomes vulnerable to your allies: until the start of your next turn, attack rolls against that creature have advantage."
   },
   {
    "level": 17,
    "name": "Sudden Strike",
    "desc": "When you take the Attack action, you can make one extra attack as a bonus action. That extra attack may benefit from Sneak Attack even if you already used Sneak Attack this turn, but you still cannot Sneak Attack the same target more than once in a turn."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Nature",
   "Survival"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "swashbuckler",
  "classId": "rogue",
  "name": "Swashbuckler",
  "source": "2014 Xanathar's",
  "label": "Roguish Archetype",
  "sourceLevel": 3,
  "summary": "A charismatic, mobile duelist who slips away from melee foes without provoking, fights well one-on-one, and wins fights through charm, taunting and flair.",
  "features": [
   {
    "level": 3,
    "name": "Fancy Footwork",
    "desc": "On your turn, any creature you make a melee attack against cannot make opportunity attacks against you for the remainder of that turn, whether or not the attack hits."
   },
   {
    "level": 3,
    "name": "Rakish Audacity",
    "desc": "You add your Charisma modifier to your initiative rolls. You can also use Sneak Attack without advantage on the attack roll when the target is the only creature within 5 feet of you, provided you have no disadvantage on the roll and all other Sneak Attack requirements are met."
   },
   {
    "level": 9,
    "name": "Panache",
    "desc": "As an action, make a Charisma (Persuasion) check contested by a creature's Wisdom (Insight) check; the creature must be able to hear you and share a language with you. If you win against a hostile creature, it has disadvantage on attack rolls against anyone but you and cannot make opportunity attacks against anyone but you. This lasts 1 minute, and ends early if an ally of yours attacks it or casts a spell on it, or if you and it are more than 60 feet apart. If you win against a non-hostile creature, it is charmed by you for 1 minute and treats you as a friendly acquaintance; the charm ends immediately if you or your allies do something harmful to it."
   },
   {
    "level": 13,
    "name": "Elegant Maneuver",
    "desc": "As a bonus action, you gain advantage on the next Dexterity (Acrobatics) or Strength (Athletics) check you make during the same turn."
   },
   {
    "level": 17,
    "name": "Master Duelist",
    "desc": "When you miss with an attack roll, you can roll it again with advantage. Once you use this, you must finish a short or long rest before using it again."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "draconic-bloodline",
  "classId": "sorcerer",
  "name": "Draconic Bloodline",
  "source": "2014 PHB",
  "label": "Sorcerous Origin",
  "sourceLevel": 1,
  "summary": "Your magic stems from dragon blood, inherited from an ancestor or gained through a pact, and it slowly gives you draconic traits.",
  "features": [
   {
    "level": 1,
    "name": "Dragon Ancestor",
    "desc": "Pick a dragon type; its damage type (acid, lightning, fire, poison or cold) powers later features. You speak, read and write Draconic, and your proficiency bonus is doubled on Charisma checks made when dealing with dragons."
   },
   {
    "level": 1,
    "name": "Draconic Resilience",
    "desc": "Hit point maximum rises by 1 at level 1 and by 1 each further sorcerer level. Unarmored AC is 13 + Dexterity modifier."
   },
   {
    "level": 6,
    "name": "Elemental Affinity",
    "desc": "Spells dealing your ancestry's damage type gain your Charisma modifier as extra damage. You may spend 1 sorcery point to become resistant to that damage type for an hour."
   },
   {
    "level": 14,
    "name": "Dragon Wings",
    "desc": "As a bonus action, sprout wings for a flying speed equal to your current speed; dismiss them as a bonus action. You can't manifest the wings while wearing armor unless it is made to accommodate them, and ill-fitting clothing may be destroyed when they appear."
   },
   {
    "level": 18,
    "name": "Draconic Presence",
    "desc": "As an action, spend 5 sorcery points to create a 60-foot aura of awe or fear for 1 minute (concentration). Hostile creatures starting their turn in it must succeed on a Wisdom save or be charmed (awe) or frightened (fear); a successful save grants immunity for 24 hours."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "wild-magic",
  "classId": "sorcerer",
  "name": "Wild Magic",
  "source": "2014 PHB",
  "label": "Sorcerous Origin",
  "sourceLevel": 1,
  "summary": "Your power arises from the chaotic forces beneath creation, so your spellcasting is unpredictable and can trigger random surges.",
  "features": [
   {
    "level": 1,
    "name": "Wild Magic Surge",
    "desc": "After casting a sorcerer spell of 1st level or higher, the DM may have you roll a d20; on a 1 you roll on the Wild Magic Surge table for a random effect."
   },
   {
    "level": 1,
    "name": "Tides of Chaos",
    "desc": "Gain advantage on one attack roll, ability check or saving throw; usable again after a long rest. Until then, the DM may trigger a surge after a sorcerer spell of 1st level or higher, which also restores this use."
   },
   {
    "level": 6,
    "name": "Bend Luck",
    "desc": "Reaction plus 2 sorcery points: when a creature you can see makes an attack, check or save, roll 1d4 and add or subtract it from the roll, after the roll but before its effects."
   },
   {
    "level": 14,
    "name": "Controlled Chaos",
    "desc": "Each time a Wild Magic Surge is triggered, you may roll twice and take whichever result you prefer."
   },
   {
    "level": 18,
    "name": "Spell Bombardment",
    "desc": "When a damage die of a spell shows its maximum value, choose one such die and roll it again, adding the result. Once per turn."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "divine-soul",
  "classId": "sorcerer",
  "name": "Divine Soul",
  "source": "2014 Xanathar's",
  "label": "Sorcerous Origin",
  "sourceLevel": 1,
  "summary": "Your magic springs from a divine spark, giving you access to the cleric spell list alongside sorcerer spells. You gain an alignment-based bonus spell, a once-per-rest die boost, better healing, angelic or bat-like wings, and a powerful self-heal.",
  "features": [
   {
    "level": 1,
    "name": "Divine Magic Affinity",
    "desc": "Pick an affinity (Good, Evil, Law, Chaos or Neutrality) when you take this subclass; you learn a matching bonus spell that does not count against your spells known: Good = cure wounds, Evil = inflict wounds, Law = bless, Chaos = bane, Neutrality = protection from evil and good. You may also learn sorcerer spells from the cleric spell list as if they were on the sorcerer list."
   },
   {
    "level": 1,
    "name": "Favored by the Gods",
    "desc": "When you fail a saving throw or miss with an attack roll, you can roll 2d4 and add it to the total, possibly turning the failure into a success. Once used, it recharges after a short or long rest."
   },
   {
    "level": 6,
    "name": "Empowered Healing",
    "desc": "Once on each of your turns, when you or an ally within 5 feet of you rolls dice to determine healing from a spell, you can spend 1 sorcery point to reroll any number of those dice once."
   },
   {
    "level": 14,
    "name": "Otherworldly Wings",
    "desc": "As a bonus action you manifest a pair of spectral wings on your back, either feathered (eagle-like) or leathery (bat-like). You gain a flying speed of 30 feet while they are out. They remain until you dismiss them as a bonus action, or you die or become incapacitated."
   },
   {
    "level": 18,
    "name": "Unearthly Recovery",
    "desc": "As a bonus action when you are at half your hit point maximum or fewer, you regain hit points equal to half your hit point maximum. Once used, you must finish a long rest before using it again."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "shadow-magic",
  "classId": "sorcerer",
  "name": "Shadow Magic",
  "source": "2014 Xanathar's",
  "label": "Sorcerous Origin",
  "sourceLevel": 1,
  "summary": "A sorcerer whose power comes from the Shadowfell, gaining superior darkvision, a darkness-based edge in spellcasting, a spectral hound that hinders foes, a pseudo-resurrection, shadow teleportation and finally a damage-resistant shadow form.",
  "features": [
   {
    "level": 1,
    "name": "Eyes of the Dark",
    "desc": "You gain darkvision out to 120 feet. Once you reach sorcerer level 3, you also learn the darkness spell, which does not count against your spells known. You can cast it by spending 2 sorcery points, and when cast that way it needs no components and you can see through the darkness it creates."
   },
   {
    "level": 1,
    "name": "Strength of the Grave",
    "desc": "When damage would drop you to 0 hit points, you can make a Charisma saving throw against DC 5 + the damage taken. On a success you are reduced to 1 hit point instead. This does not work against radiant damage or critical hits. After one success, you cannot use it again until you finish a long rest."
   },
   {
    "level": 6,
    "name": "Hound of Ill Omen",
    "desc": "As a bonus action, spend 3 sorcery points to call a spectral hound that targets a creature you can see within 120 feet. The hound appears within 30 feet of that target, uses a dire wolf's statistics but is a Medium monstrosity, and has temporary hit points equal to half your sorcerer level. It uses your spell attack modifier for its bite, and while it is within 5 feet of its target, that target has disadvantage on saving throws against your spells. The hound can move through creatures and objects as if difficult terrain, taking 5 force damage if it ends its turn inside one. It lasts for 5 minutes, or until it or its target is reduced to 0 hit points or the target is no longer within range."
   },
   {
    "level": 14,
    "name": "Shadow Walk",
    "desc": "While you are in dim light or darkness, you can use a bonus action to teleport up to 120 feet to an unoccupied space you can see that is also in dim light or darkness."
   },
   {
    "level": 18,
    "name": "Umbral Form",
    "desc": "As a bonus action, spend 6 sorcery points to turn into a shadowy form for 1 minute. In this form you have resistance to all damage except force and radiant damage, and you can move through other creatures and objects as if they were difficult terrain, taking 5 force damage if you end your turn inside one. The form ends early if you are incapacitated or die, or if you end it as a bonus action."
   }
  ],
  "grantedSpells": [
   {
    "level": 3,
    "spells": [
     "darkness"
    ],
    "kind": "prepared"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "storm-sorcery",
  "classId": "sorcerer",
  "name": "Storm Sorcery",
  "source": "2014 Xanathar's",
  "label": "Sorcerous Origin",
  "sourceLevel": 1,
  "summary": "Your magic is tied to wind and weather. You gain a short burst of flight after casting, deal storm damage around you with lightning and thunder spells, resist those damage types, and eventually become immune and gain a magical flying speed.",
  "features": [
   {
    "level": 1,
    "name": "Wind Speaker",
    "desc": "You can speak, read and write Primordial, which also lets you understand its dialects: Aquan, Auran, Ignan and Terran."
   },
   {
    "level": 1,
    "name": "Tempestuous Magic",
    "desc": "As a bonus action, right after you cast a spell of 1st level or higher, you can fly up to 10 feet. This movement does not provoke opportunity attacks. No resource is spent; you can do this whenever you cast such a spell."
   },
   {
    "level": 6,
    "name": "Heart of the Storm",
    "desc": "You have resistance to lightning and thunder damage. When you cast a spell of 1st level or higher that deals lightning or thunder damage, a storm erupts around you right after the spell resolves. Each creature of your choice within 10 feet of you takes lightning or thunder damage (your choice) equal to half your sorcerer level."
   },
   {
    "level": 6,
    "name": "Storm Guide",
    "desc": "You gain control over local weather effects. As an action, you can halt rain falling in a 20-foot-radius sphere centered on you (ended with a bonus action). As a bonus action, you can pick the direction of wind within 100 feet of you; it holds until the end of your next turn. This does not change wind speed."
   },
   {
    "level": 14,
    "name": "Storm's Fury",
    "desc": "When a creature hits you with a melee attack, you can use your reaction to blast it with lightning for damage equal to your sorcerer level. The attacker must also make a Strength saving throw against your spell save DC or be pushed in a straight line up to 20 feet away from you."
   },
   {
    "level": 18,
    "name": "Wind Soul",
    "desc": "You become immune to lightning and thunder damage and gain a magical flying speed of 60 feet. As an action, you can lower your own flying speed to 30 feet for 1 hour and give a flying speed of 30 feet for 1 hour to a number of creatures within 30 feet of you equal to 3 + your Charisma modifier. Once used, this ability is unavailable until you finish a short or long rest."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [
   "Primordial (language, plus Aquan, Auran, Ignan, Terran dialects)"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "the-archfey",
  "classId": "warlock",
  "name": "The Archfey",
  "source": "2014 PHB",
  "label": "Otherworldly Patron",
  "sourceLevel": 1,
  "summary": "Your patron is a powerful lord or lady of the Feywild whose goals are whimsical and hard to read. Its gifts center on enchantment, charm, fear and slipping away in mist.",
  "features": [
   {
    "level": 1,
    "name": "Fey Presence",
    "desc": "Action: every creature within a 10-foot cube centred on you must make a Wisdom save against your warlock spell save DC. Each one that fails is charmed or scared (your pick) until your next turn ends. Recharges on a short or long rest."
   },
   {
    "level": 6,
    "name": "Misty Escape",
    "desc": "Reaction when you take damage: vanish and reappear as an invisible figure up to 60 ft away in any open spot you can see. The invisibility lasts until your next turn begins, or until you make an attack or cast a spell. Recharges on a short or long rest."
   },
   {
    "level": 10,
    "name": "Beguiling Defenses",
    "desc": "You cannot be charmed. When someone tries to charm you, you can use your reaction to force a Wisdom save against your spell save DC; on a failed save it becomes charmed by you for a minute, ending early if it takes damage."
   },
   {
    "level": 14,
    "name": "Dark Delirium",
    "desc": "Action: target a creature you see within 60 feet; Wisdom save vs your spell save DC. On a failure it is charmed or frightened (your choice) for 1 minute, requiring your concentration, ending early if it takes damage. It believes it is in an illusory misty realm you design and perceives only itself, you and the illusion. Recharges on a short or long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "faerie fire",
     "sleep"
    ],
    "kind": "expanded"
   },
   {
    "level": 2,
    "spells": [
     "calm emotions",
     "phantasmal force"
    ],
    "kind": "expanded"
   },
   {
    "level": 3,
    "spells": [
     "blink",
     "plant growth"
    ],
    "kind": "expanded"
   },
   {
    "level": 4,
    "spells": [
     "dominate beast",
     "greater invisibility"
    ],
    "kind": "expanded"
   },
   {
    "level": 5,
    "spells": [
     "dominate person",
     "seeming"
    ],
    "kind": "expanded"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "the-fiend",
  "classId": "warlock",
  "name": "The Fiend",
  "source": "2014 PHB",
  "label": "Otherworldly Patron",
  "sourceLevel": 1,
  "summary": "You have bargained with a being from the lower planes whose aims are evil. It rewards you with fire magic, durability and the ability to hurl foes into hell.",
  "features": [
   {
    "level": 1,
    "name": "Dark One's Blessing",
    "desc": "Dropping a hostile creature to 0 HP grants you temp HP equal to your Charisma modifier plus warlock level (at least 1)."
   },
   {
    "level": 6,
    "name": "Dark One's Own Luck",
    "desc": "When you make an ability check or saving throw, add 1d10 to the roll, even after seeing it but before the outcome. Recharges on a short or long rest."
   },
   {
    "level": 10,
    "name": "Fiendish Resilience",
    "desc": "After a short or long rest, choose one damage type to gain resistance to, until you choose another. Damage from magical or silver weapons ignores this resistance."
   },
   {
    "level": 14,
    "name": "Hurl Through Hell",
    "desc": "When you hit a creature with an attack, you can send it through the lower planes; it vanishes and returns at the end of your next turn to its space or nearest open one. A non-fiend takes 10d10 psychic damage. Recharges on a long rest."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "burning hands",
     "command"
    ],
    "kind": "expanded"
   },
   {
    "level": 2,
    "spells": [
     "blindness/deafness",
     "scorching ray"
    ],
    "kind": "expanded"
   },
   {
    "level": 3,
    "spells": [
     "fireball",
     "stinking cloud"
    ],
    "kind": "expanded"
   },
   {
    "level": 4,
    "spells": [
     "fire shield",
     "wall of fire"
    ],
    "kind": "expanded"
   },
   {
    "level": 5,
    "spells": [
     "flame strike",
     "hallow"
    ],
    "kind": "expanded"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "In the 2024 PHB the Fiend patron is renamed Fiend Patron; Dark One's Blessing and Hurl Through Hell are reworked (Hurl Through Hell costs a Pact Magic slot rather than a rest use)."
 },
 {
  "id": "the-great-old-one",
  "classId": "warlock",
  "name": "The Great Old One",
  "source": "2014 PHB",
  "label": "Otherworldly Patron",
  "sourceLevel": 1,
  "summary": "Your patron is an alien entity from beyond reality, indifferent or unaware of you, whose vast knowledge grants psychic and mind-bending powers.",
  "features": [
   {
    "level": 1,
    "name": "Awakened Mind",
    "desc": "You can speak telepathically to any creature you see within 30 feet, with no shared language needed, though it must understand at least one language."
   },
   {
    "level": 6,
    "name": "Entropic Ward",
    "desc": "Reaction when a creature attacks you: impose disadvantage on that roll. If it misses, your next attack roll against that creature before the end of your next turn has advantage. Recharges on a short or long rest."
   },
   {
    "level": 10,
    "name": "Thought Shield",
    "desc": "Your thoughts cannot be read by telepathy or other means unless you allow it. You resist psychic damage, and any creature that deals psychic damage to you takes the same amount."
   },
   {
    "level": 14,
    "name": "Create Thrall",
    "desc": "Action: touch an incapacitated humanoid to charm it until remove curse is cast on it, the charmed condition is removed, or you use this feature again. You can communicate telepathically with it while on the same plane."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "dissonant whispers",
     "Tasha's hideous laughter"
    ],
    "kind": "expanded"
   },
   {
    "level": 2,
    "spells": [
     "detect thoughts",
     "phantasmal force"
    ],
    "kind": "expanded"
   },
   {
    "level": 3,
    "spells": [
     "clairvoyance",
     "sending"
    ],
    "kind": "expanded"
   },
   {
    "level": 4,
    "spells": [
     "dominate beast",
     "Evard's black tentacles"
    ],
    "kind": "expanded"
   },
   {
    "level": 5,
    "spells": [
     "dominate person",
     "telekinesis"
    ],
    "kind": "expanded"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "In the 2024 PHB this is the Great Old One Patron with reworked features (e.g. Psychic Spells, Clairvoyant Combatant)."
 },
 {
  "id": "the-celestial",
  "classId": "warlock",
  "name": "The Celestial",
  "source": "2014 Xanathar's",
  "label": "Otherworldly Patron",
  "sourceLevel": 1,
  "summary": "Your patron is a being of the Upper Planes, and your magic leans toward healing and radiant fire. You gain a pool of healing dice, extra light-themed cantrips, and a spell list full of restorative and fiery spells.",
  "features": [
   {
    "level": 1,
    "name": "Expanded Spell List",
    "desc": "The Celestial adds extra spells to the warlock spell list for you, from 1st through 5th spell level (see granted spells)."
   },
   {
    "level": 1,
    "name": "Bonus Cantrips",
    "desc": "You learn the light and sacred flame cantrips. They do not count against your number of cantrips known."
   },
   {
    "level": 1,
    "name": "Healing Light",
    "desc": "You have a pool of d6s equal to 1 + your warlock level. As a bonus action, pick a creature you can see within 60 feet and spend up to your Charisma modifier (minimum 1) dice from the pool; roll them and the creature regains that many hit points. You regain all spent dice when you finish a long rest."
   },
   {
    "level": 6,
    "name": "Radiant Soul",
    "desc": "You gain resistance to radiant damage. When you cast a spell that deals radiant or fire damage, you add your Charisma modifier to one damage roll of that spell against one of its targets."
   },
   {
    "level": 10,
    "name": "Celestial Resilience",
    "desc": "Whenever you finish a short or long rest, you gain temporary hit points equal to your warlock level + your Charisma modifier. In addition, choose up to five creatures you can see at the end of that rest; each gains temporary hit points equal to half your warlock level + your Charisma modifier."
   },
   {
    "level": 14,
    "name": "Searing Vengeance",
    "desc": "When you would make a death saving throw at the start of your turn, you can instead spring back up: you regain hit points equal to half your hit point maximum and may stand without spending movement. Each creature of your choice within 30 feet then takes radiant damage equal to 2d8 + your Charisma modifier and is blinded until the end of the current turn. Once used, you must finish a long rest before using it again."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "Cure Wounds",
     "Guiding Bolt"
    ],
    "kind": "expanded"
   },
   {
    "level": 2,
    "spells": [
     "Flaming Sphere",
     "Lesser Restoration"
    ],
    "kind": "expanded"
   },
   {
    "level": 3,
    "spells": [
     "Daylight",
     "Revivify"
    ],
    "kind": "expanded"
   },
   {
    "level": 4,
    "spells": [
     "Guardian of Faith",
     "Wall of Fire"
    ],
    "kind": "expanded"
   },
   {
    "level": 5,
    "spells": [
     "Flame Strike",
     "Greater Restoration"
    ],
    "kind": "expanded"
   }
  ],
  "grantedProficiencies": [],
  "notes2024": "The 2024 Player's Handbook reprints this patron as the Celestial Patron with revised features (Healing Light, Radiant Soul, Celestial Resilience, Searing Vengeance)."
 },
 {
  "id": "the-hexblade",
  "classId": "warlock",
  "name": "The Hexblade",
  "source": "2014 Xanathar's",
  "label": "Otherworldly Patron",
  "sourceLevel": 1,
  "summary": "A warlock who pacts with a mysterious force from the Shadowfell, the Hexblade fights as a martial caster in medium armor, using Charisma for weapon attacks. They brand foes with a curse that boosts damage and crit chances, and later raise spectral minions from slain humanoids.",
  "features": [
   {
    "level": 1,
    "name": "Hexblade's Curse",
    "desc": "As a bonus action, curse a creature you can see within 30 feet for 1 minute. The curse ends early if the target dies, you die, or you are incapacitated. While it lasts: you add your proficiency bonus to damage rolls against the cursed target; your attack rolls against it score a critical hit on a 19 or 20; and if it dies, you regain hit points equal to your warlock level + your Charisma modifier (minimum 1). Once used, it must be recharged with a short or long rest."
   },
   {
    "level": 1,
    "name": "Hex Warrior",
    "desc": "You gain proficiency with medium armor, shields and martial weapons. At the end of a long rest you may touch one weapon you are proficient with that lacks the two-handed property; until your next long rest, you use your Charisma modifier instead of Strength or Dexterity for its attack and damage rolls. If you later take Pact of the Blade, this extends to every pact weapon you create, whatever its type."
   },
   {
    "level": 6,
    "name": "Accursed Specter",
    "desc": "When you slay a humanoid, you can have its spirit rise as a specter under your control. It appears in an unoccupied space within 30 feet of the corpse, uses the standard Specter stat block, gains temporary hit points equal to half your warlock level, and adds your Charisma modifier (minimum +0) to its attack rolls. It acts on its own initiative count, obeys your commands, and vanishes at the end of your next long rest. Once used, you must finish a long rest before using it again."
   },
   {
    "level": 10,
    "name": "Armor of Hexes",
    "desc": "If the target of your Hexblade's Curse hits you with an attack roll, roll a d6. On a 4 or higher, the attack instead misses you, regardless of its roll."
   },
   {
    "level": 14,
    "name": "Master of Hexes",
    "desc": "When a creature cursed by your Hexblade's Curse dies, you can immediately apply the curse to a different creature you can see within 30 feet of the dead one, without expending a use of the feature. You cannot do this if you are incapacitated, and the new curse works normally for the remainder of its duration."
   }
  ],
  "grantedSpells": [
   {
    "level": 1,
    "spells": [
     "Shield",
     "Wrathful Smite"
    ],
    "kind": "expanded"
   },
   {
    "level": 2,
    "spells": [
     "Blur",
     "Branding Smite"
    ],
    "kind": "expanded"
   },
   {
    "level": 3,
    "spells": [
     "Blink",
     "Elemental Weapon"
    ],
    "kind": "expanded"
   },
   {
    "level": 4,
    "spells": [
     "Phantasmal Killer",
     "Staggering Smite"
    ],
    "kind": "expanded"
   },
   {
    "level": 5,
    "spells": [
     "Banishing Smite",
     "Cone of Cold"
    ],
    "kind": "expanded"
   }
  ],
  "grantedProficiencies": [
   "Medium armor",
   "Shields",
   "Martial weapons"
  ],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 },
 {
  "id": "school-of-abjuration",
  "classId": "wizard",
  "name": "School of Abjuration",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Abjurers specialize in magic that protects, blocks, and banishes, guarding people and places and sealing away harmful influences.",
  "features": [
   {
    "level": 2,
    "name": "Abjuration Savant",
    "desc": "Copying an abjuration spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Arcane Ward",
    "desc": "When you cast an abjuration spell of 1st level or higher, you can also create a ward on yourself that lasts until a long rest. It has hit points equal to twice your wizard level plus Intelligence modifier and absorbs your damage first, spillover going to you. It regains 2 HP per level of each abjuration spell you cast with a slot. You can create it once per long rest."
   },
   {
    "level": 6,
    "name": "Projected Ward",
    "desc": "As a reaction, when a creature you can see within 30 feet takes damage, your Arcane Ward absorbs that damage instead; any excess passes to the creature."
   },
   {
    "level": 10,
    "name": "Improved Abjuration",
    "desc": "Add your proficiency bonus to ability checks required by your abjuration spells (such as counterspell and dispel magic)."
   },
   {
    "level": 14,
    "name": "Spell Resistance",
    "desc": "Spells have a harder time affecting you: saving throws against spells are made with advantage, and you resist damage from spells."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "school-of-conjuration",
  "classId": "wizard",
  "name": "School of Conjuration",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Conjurers favor spells that create objects and creatures from nothing, later mastering summoning and teleportation.",
  "features": [
   {
    "level": 2,
    "name": "Conjuration Savant",
    "desc": "Copying a conjuration spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Minor Conjuration",
    "desc": "As an action, conjure a nonmagical inanimate object (max 3 ft per side, 10 lb) within 10 feet; it sheds dim light 5 ft, and vanishes after 1 hour, on reuse, or if damaged."
   },
   {
    "level": 6,
    "name": "Benign Transposition",
    "desc": "As an action, teleport up to 30 feet to a visible unoccupied space, or swap places with a willing Small or Medium creature. Recharges on a long rest or when you cast a conjuration spell of 1st level or higher."
   },
   {
    "level": 10,
    "name": "Focused Conjuration",
    "desc": "Damage can't break your concentration on a conjuration spell."
   },
   {
    "level": 14,
    "name": "Durable Summons",
    "desc": "Creatures you summon or create with conjuration spells gain 30 temporary hit points."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "school-of-divination",
  "classId": "wizard",
  "name": "School of Divination",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Diviners seek clarity about past, present, and future through foresight, remote viewing, and supernatural knowledge.",
  "features": [
   {
    "level": 2,
    "name": "Divination Savant",
    "desc": "Copying a divination spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Portent",
    "desc": "After a long rest, roll two d20s and record them. Before a roll, you can replace an attack roll, saving throw, or ability check by you or a creature you can see with one recorded die, once per turn. Each die is used once; unused dice are lost at the next long rest."
   },
   {
    "level": 6,
    "name": "Expert Divination",
    "desc": "When you cast a divination spell of 2nd level or higher with a slot, regain an expended slot of lower level than the spell, max 5th level."
   },
   {
    "level": 10,
    "name": "The Third Eye",
    "desc": "As an action, pick one benefit lasting until incapacitated or a short/long rest (once per rest): darkvision 60 ft; see into the Ethereal Plane 60 ft; read any language; or see invisible creatures/objects within 10 feet in line of sight."
   },
   {
    "level": 14,
    "name": "Greater Portent",
    "desc": "You roll three d20s for Portent instead of two."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "school-of-enchantment",
  "classId": "wizard",
  "name": "School of Enchantment",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Enchanters beguile and entrance people and monsters, whether to make peace, command, or something in between.",
  "features": [
   {
    "level": 2,
    "name": "Enchantment Savant",
    "desc": "Copying an enchantment spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Hypnotic Gaze",
    "desc": "As an action, target a creature within 5 feet that can see or hear you; it must make a Wisdom save against your spell save DC or be charmed until the end of your next turn, with speed 0 and incapacitated. You can keep it going with your action each turn, but it ends if you move over 5 feet away, the creature can't see or hear you, or it takes damage. After it ends or on a successful save, you can't target that creature again until a long rest."
   },
   {
    "level": 6,
    "name": "Instinctive Charm",
    "desc": "As a reaction when a creature you can see within 30 feet attacks you, force a Wisdom save vs your spell DC; on a failure it must redirect the attack to the nearest other creature (attacker's choice on ties) within range. On a success you can't use this on that attacker until a long rest. Declare before knowing if it hits; creatures immune to charm are unaffected."
   },
   {
    "level": 10,
    "name": "Split Enchantment",
    "desc": "An enchantment spell of 1st level or higher that targets one creature can target a second creature too."
   },
   {
    "level": 14,
    "name": "Alter Memories",
    "desc": "When you charm creatures with an enchantment spell, one can be left unaware it was charmed. Later, once before the spell ends, you can use an action to make it forget time: it makes an Intelligence save vs your spell DC or loses 1 + your Charisma modifier hours (min 1), not more than the spell's duration."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "school-of-evocation",
  "classId": "wizard",
  "name": "School of Evocation",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Evokers shape destructive and elemental energy such as fire, frost, lightning, and acid, as soldiers, protectors, or opportunists.",
  "features": [
   {
    "level": 2,
    "name": "Evocation Savant",
    "desc": "Copying an evocation spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Sculpt Spells",
    "desc": "When you cast an evocation spell affecting creatures you can see, choose 1 + the spell's level of them; they automatically succeed on their saves and take no damage if they would take half on a success."
   },
   {
    "level": 6,
    "name": "Potent Cantrip",
    "desc": "When a creature succeeds on a save against your damaging cantrip, it still takes half the cantrip's damage but suffers no other effect."
   },
   {
    "level": 10,
    "name": "Empowered Evocation",
    "desc": "Your wizard evocation spells deal extra damage equal to your Intelligence modifier."
   },
   {
    "level": 14,
    "name": "Overchannel",
    "desc": "When you cast a wizard spell of 5th level or lower that deals damage, you can deal its maximum damage. The first use per long rest is free; each later use before a long rest deals 2d12 necrotic damage per spell level to you (increasing by 1d12 per level for each further use), ignoring resistance and immunity."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "school-of-illusion",
  "classId": "wizard",
  "name": "School of Illusion",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Illusionists dazzle senses and deceive minds with subtle, convincing illusions, whether for entertainment or deception.",
  "features": [
   {
    "level": 2,
    "name": "Illusion Savant",
    "desc": "Copying an illusion spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Improved Minor Illusion",
    "desc": "You learn minor illusion (or another wizard cantrip if you already know it) without it counting against cantrips known. A single casting can create both a sound and an image."
   },
   {
    "level": 6,
    "name": "Malleable Illusions",
    "desc": "When you cast an illusion spell lasting 1 minute or longer, you can use an action to change its nature within the spell's normal parameters, if you can see it."
   },
   {
    "level": 10,
    "name": "Illusory Self",
    "desc": "As a reaction when a creature attacks you, an illusory duplicate makes the attack automatically miss, then vanishes. Recharges on a short or long rest."
   },
   {
    "level": 14,
    "name": "Illusory Reality",
    "desc": "When you cast an illusion spell of 1st level or higher, you can use a bonus action to make one inanimate, nonmagical object in the illusion real for 1 minute. It can't deal damage or directly harm anyone."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "school-of-necromancy",
  "classId": "wizard",
  "name": "School of Necromancy",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Necromancers study life, death, and undeath, harvesting life energy and commanding the dead.",
  "features": [
   {
    "level": 2,
    "name": "Necromancy Savant",
    "desc": "Copying a necromancy spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Grim Harvest",
    "desc": "Once per turn, when you kill one or more creatures with a spell of 1st level or higher, you regain HP equal to twice the spell's level (three times if it's a necromancy spell). Doesn't work on constructs or undead."
   },
   {
    "level": 6,
    "name": "Undead Thralls",
    "desc": "You add animate dead to your spellbook if absent. When you cast it, you can target one additional corpse or bones. Undead you create with necromancy spells gain extra HP maximum equal to your wizard level and add your proficiency bonus to weapon damage."
   },
   {
    "level": 10,
    "name": "Inured to Undeath",
    "desc": "You resist necrotic damage, and nothing can lower your hit point maximum."
   },
   {
    "level": 14,
    "name": "Command Undead",
    "desc": "As an action, target an undead within 60 feet; it makes a Charisma save vs your spell DC. On success you can't use this on it again. On failure it is friendly and obeys you until you use this feature again. Targets with Intelligence 8+ have advantage; if it fails and has Intelligence 12+, it repeats the save hourly until it succeeds."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "school-of-transmutation",
  "classId": "wizard",
  "name": "School of Transmutation",
  "source": "2014 PHB",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "Transmuters alter matter and energy, changing both physical forms and mental qualities, whether as pranksters or world-shapers.",
  "features": [
   {
    "level": 2,
    "name": "Transmutation Savant",
    "desc": "Copying a transmutation spell into your spellbook costs half the usual gold and time."
   },
   {
    "level": 2,
    "name": "Minor Alchemy",
    "desc": "Temporarily change one nonmagical object made entirely of wood, stone (not gems), iron, copper, or silver into another of those materials. Each 10 minutes of work transforms up to 1 cubic foot; it reverts after 1 hour or when concentration lapses."
   },
   {
    "level": 6,
    "name": "Transmuter's Stone",
    "desc": "Spend 8 hours making a stone that gives its holder one benefit of your choice: darkvision 60 ft; +10 ft speed while unencumbered; Constitution saving throw proficiency; or resistance to acid, cold, fire, lightning, or thunder (chosen when selected). When you cast a transmutation spell of 1st level or higher you can change the benefit if the stone is on you. A new stone ends the old one."
   },
   {
    "level": 10,
    "name": "Shapechanger",
    "desc": "You add polymorph to your spellbook and can cast it without a slot, only on yourself and only into a beast of CR 1 or lower. Once per short or long rest this way."
   },
   {
    "level": 14,
    "name": "Master Transmuter",
    "desc": "As an action, destroy your transmuter's stone for one effect (it can't be remade until a long rest): Major Transformation (turn a nonmagical object up to 5-ft cube into another of similar size and mass and equal or lesser value, over 10 minutes); Panacea (remove curses, diseases, poisons from a touched creature and restore all its HP); Restore Life (cast raise dead on a touched creature without a slot or having it prepared); Restore Youth (a willing touched creature appears 3d10 years younger, minimum 13, without extending lifespan)."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": ""
 },
 {
  "id": "war-magic",
  "classId": "wizard",
  "name": "War Magic",
  "source": "2014 Xanathar's",
  "label": "Arcane Tradition",
  "sourceLevel": 2,
  "summary": "The Wizard tradition that blends defensive and offensive magic on the battlefield. War mages react to danger with magical protection, act fast in combat, and channel stored energy into extra force damage.",
  "features": [
   {
    "level": 2,
    "name": "Arcane Deflection",
    "desc": "As a reaction when you are hit by an attack or fail a saving throw, you gain +2 AC against that attack or +4 on that saving throw, potentially changing the result. After using it, you can cast only cantrips (no leveled spells) until the end of your next turn."
   },
   {
    "level": 2,
    "name": "Tactical Wit",
    "desc": "You add your Intelligence modifier to your initiative rolls."
   },
   {
    "level": 6,
    "name": "Power Surge",
    "desc": "You keep a pool of surges, with a maximum equal to your Intelligence modifier (minimum 1). You start each long rest with one surge (if you have none, you gain one), and you gain one whenever you successfully end a spell with dispel magic or counterspell. Once per turn, when you damage a creature or object with a wizard spell, you can spend one surge to deal extra force damage equal to half your wizard level."
   },
   {
    "level": 10,
    "name": "Durable Magic",
    "desc": "While you are concentrating on a spell, you gain a +2 bonus to AC and to all saving throws."
   },
   {
    "level": 14,
    "name": "Deflecting Shroud",
    "desc": "Whenever you use Arcane Deflection, magical energy arcs out to up to three creatures of your choice within 60 feet of you, each taking force damage equal to half your wizard level."
   }
  ],
  "grantedSpells": [],
  "grantedProficiencies": [],
  "notes2024": "Not reprinted in the 2024 Player's Handbook."
 }
];

export const SUBCLASS_BY_ID = Object.fromEntries(SUBCLASSES.map((s) => [s.id, s]));
export const SUBCLASS_LABELS = {"barbarian":"Primal Path","bard":"Bard College","cleric":"Divine Domain","druid":"Druid Circle","fighter":"Martial Archetype","monk":"Monastic Tradition","paladin":"Sacred Oath","ranger":"Ranger Archetype","rogue":"Roguish Archetype","sorcerer":"Sorcerous Origin","warlock":"Otherworldly Patron","wizard":"Arcane Tradition"};

export function subclassesFor(classId) {
  return SUBCLASSES.filter((s) => s.classId === classId);
}
