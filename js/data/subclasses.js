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
 }
];

export const SUBCLASS_BY_ID = Object.fromEntries(SUBCLASSES.map((s) => [s.id, s]));
export const SUBCLASS_LABELS = {"barbarian":"Primal Path","bard":"Bard College","cleric":"Divine Domain","druid":"Druid Circle","fighter":"Martial Archetype","monk":"Monastic Tradition","paladin":"Sacred Oath","ranger":"Ranger Archetype","rogue":"Roguish Archetype","sorcerer":"Sorcerous Origin","warlock":"Otherworldly Patron","wizard":"Arcane Tradition"};

export function subclassesFor(classId) {
  return SUBCLASSES.filter((s) => s.classId === classId);
}
