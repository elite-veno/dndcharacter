// SRD 5.2 spells (CC-BY-4.0) with class spell lists. Descriptions are short summaries, not full SRD text.
// Row format: Name|level|School|Classes|Flags|Casting Time|Range|Duration|Summary|Roll
//  Classes: B Bard, C Cleric, D Druid, P Paladin, R Ranger, S Sorcerer, L Warlock, W Wizard
//  Flags:   C = Concentration, R = Ritual
//  Roll:    A:<dice> <type> = spell attack, S:<abil>:<dice> <type> = saving throw (half on save unless noted),
//           H:<dice> = healing. Cantrip damage scales at character levels 5, 11 and 17.

export const SPELL_CLASS_CODES = { B: 'bard', C: 'cleric', D: 'druid', P: 'paladin', R: 'ranger', S: 'sorcerer', L: 'warlock', W: 'wizard' };

const ROWS = `
Acid Splash|0|Evocation|SW||Action|60 ft|Instant|One or two creatures within 5 ft of each other make a Dex save or take 1d6 acid damage.|S:dex:1d6 acid
Chill Touch|0|Necromancy|SLW||Action|120 ft|1 round|Ranged spell attack for 1d10 necrotic; target cannot regain HP until your next turn.|A:1d10 necrotic
Dancing Lights|0|Illusion|BSW|C|Action|120 ft|1 minute|Create up to four torch-sized lights that you can move.|
Druidcraft|0|Transmutation|D||Action|30 ft|Instant|Minor nature effects: predict weather, bloom a flower, make a sensory effect, light or snuff a flame.|
Eldritch Blast|0|Evocation|L||Action|120 ft|Instant|Ranged spell attack for 1d10 force; more beams at levels 5, 11 and 17.|A:1d10 force
Elementalism|0|Transmutation|DSW||Action|30 ft|Instant|Create a minor elemental effect: breeze, flame, tremor, or water.|
Fire Bolt|0|Evocation|SW||Action|120 ft|Instant|Ranged spell attack for 1d10 fire; ignites flammable objects.|A:1d10 fire
Guidance|0|Divination|CD|C|Action|Touch|1 minute|Target adds 1d4 to one ability check of its choice before the spell ends.|
Light|0|Evocation|BCSW||Action|Touch|1 hour|An object glows with bright light in a 20-ft radius.|
Mage Hand|0|Conjuration|BSLW||Action|30 ft|1 minute|A spectral hand manipulates objects up to 10 lb.|
Mending|0|Transmutation|BCDSW||1 minute|Touch|Instant|Repair a single break or tear in an object.|
Message|0|Transmutation|BSW||Action|120 ft|1 round|Whisper a message to a creature within range; it can whisper back.|
Minor Illusion|0|Illusion|BSLW||Action|30 ft|1 minute|Create a sound or an image of an object.|
Poison Spray|0|Necromancy|DSLW||Action|30 ft|Instant|Target makes a Con save or takes 1d12 poison damage.|S:con:1d12 poison
Prestidigitation|0|Transmutation|BSLW||Action|10 ft|1 hour|Minor magical tricks: sensory effect, clean, soil, warm, chill, flavor, small mark, trinket.|
Produce Flame|0|Conjuration|D||Bonus Action|Self|10 minutes|A flame in your hand sheds light; hurl it as a ranged spell attack for 1d8 fire.|A:1d8 fire
Ray of Frost|0|Evocation|SW||Action|60 ft|Instant|Ranged spell attack for 1d8 cold and -10 ft Speed until your next turn.|A:1d8 cold
Resistance|0|Abjuration|CD|C|Action|Touch|1 minute|Target adds 1d4 to one saving throw of its choice.|
Sacred Flame|0|Evocation|C||Action|60 ft|Instant|Target makes a Dex save (no cover bonus) or takes 1d8 radiant damage.|S:dex:1d8 radiant
Shillelagh|0|Transmutation|D||Bonus Action|Self|1 minute|Club or Quarterstaff uses your spellcasting ability for attacks and damage, damage die becomes d8.|
Shocking Grasp|0|Evocation|SW||Action|Touch|Instant|Melee spell attack (Advantage vs. metal armor) for 1d8 lightning; target cannot take Reactions.|A:1d8 lightning
Sorcerous Burst|0|Evocation|S||Action|120 ft|Instant|Ranged spell attack for 1d8 damage of a type you choose; rolling max adds another die.|A:1d8 force
Spare the Dying|0|Necromancy|CD||Action|15 ft|Instant|A creature with 0 HP becomes Stable.|
Starry Wisp|0|Evocation|BD||Action|60 ft|Instant|Ranged spell attack for 1d8 radiant; target sheds light and cannot be Invisible.|A:1d8 radiant
Thaumaturgy|0|Transmutation|C||Action|30 ft|1 minute|Minor wonders: booming voice, flickering flames, tremors, eerie sounds, and similar effects.|
Thorn Whip|0|Transmutation|D||Action|30 ft|Instant|Melee spell attack for 1d6 piercing; pull a Large or smaller target 10 ft closer.|A:1d6 piercing
Toll the Dead|0|Necromancy|CLW||Action|60 ft|Instant|Wis save or take 1d8 necrotic (1d12 if missing HP).|S:wis:1d8 necrotic
True Strike|0|Divination|BSLW||Action|Self|Instant|Make a weapon attack using your spellcasting ability; it may deal radiant damage.|
Vicious Mockery|0|Enchantment|B||Action|60 ft|Instant|Wis save or take 1d6 psychic damage and have Disadvantage on its next attack roll.|S:wis:1d6 psychic
Word of Radiance|0|Evocation|C||Action|5 ft|Instant|Each creature of your choice within 5 ft makes a Con save or takes 1d6 radiant damage.|S:con:1d6 radiant
Alarm|1|Abjuration|RW|R|1 minute|30 ft|8 hours|Set a mental or audible alarm against intrusion in a 20-ft cube.|
Animal Friendship|1|Enchantment|BDR||Action|30 ft|24 hours|A Beast makes a Wis save or is Charmed by you.|
Armor of Agathys|1|Abjuration|L||Action|Self|1 hour|Gain 5 Temporary HP; melee attackers take 5 cold damage while they last.|
Arms of Hadar|1|Conjuration|L||Action|Self (10-ft emanation)|Instant|Creatures make a Str save or take 2d6 necrotic and cannot take Reactions.|S:str:2d6 necrotic
Bane|1|Enchantment|BC|C|Action|30 ft|1 minute|Up to three creatures make a Cha save or subtract 1d4 from attack rolls and saves.|
Bless|1|Enchantment|CP|C|Action|30 ft|1 minute|Up to three creatures add 1d4 to attack rolls and saving throws.|
Burning Hands|1|Evocation|SW||Action|Self (15-ft cone)|Instant|Dex save or take 3d6 fire damage (half on success).|S:dex:3d6 fire
Charm Person|1|Enchantment|BDSLW||Action|30 ft|1 hour|A Humanoid makes a Wis save or is Charmed by you.|
Chromatic Orb|1|Evocation|SW||Action|90 ft|Instant|Ranged spell attack for 3d8 acid, cold, fire, lightning, poison, or thunder.|A:3d8 fire
Color Spray|1|Illusion|SW||Action|Self (15-ft cone)|1 round|Creatures within the cone are Blinded depending on their HP.|
Command|1|Enchantment|BCP||Action|60 ft|1 round|Speak a one-word command; Wis save or the target obeys.|
Comprehend Languages|1|Divination|BSLW|R|Action|Self|1 hour|Understand spoken language and read written language.|
Create or Destroy Water|1|Transmutation|CD||Action|30 ft|Instant|Create up to 10 gallons of water or destroy a 30-ft cube of fog.|
Cure Wounds|1|Abjuration|BCDPR||Action|Touch|Instant|A creature you touch regains 2d8 + spellcasting modifier HP.|H:2d8
Detect Evil and Good|1|Divination|CP|C|Action|Self|10 minutes|Sense aberrations, celestials, elementals, fey, fiends, and undead within 30 ft.|
Detect Magic|1|Divination|BCDPRSW|CR|Action|Self|10 minutes|Sense magic within 30 ft and see an aura around magical objects or creatures.|
Detect Poison and Disease|1|Divination|CDPR|CR|Action|Self|10 minutes|Sense poisons, poisonous creatures, and diseases within 30 ft.|
Disguise Self|1|Illusion|BSW||Bonus Action|Self|1 hour|Change your appearance.|
Dissonant Whispers|1|Enchantment|B||Action|60 ft|Instant|Wis save or take 3d6 psychic damage and flee (half damage on success).|S:wis:3d6 psychic
Divine Favor|1|Evocation|P|C|Bonus Action|Self|1 minute|Your weapon attacks deal an extra 1d4 radiant damage.|
Divine Smite|1|Evocation|P||Bonus Action|Self|Instant|After hitting with a melee weapon, deal an extra 2d8 radiant damage (+1d8 per slot level above 1).|
Ensnaring Strike|1|Conjuration|R|C|Bonus Action|Self|1 minute|Hit with a weapon and the target is Restrained by vines (Str save).|
Entangle|1|Conjuration|D|C|Action|90 ft|1 minute|Grasping plants Restrain creatures in a 20-ft square (Str save).|
Expeditious Retreat|1|Transmutation|SLW|C|Bonus Action|Self|10 minutes|Take the Dash action as a Bonus Action each turn.|
Faerie Fire|1|Evocation|BD|C|Action|60 ft|1 minute|Creatures in a 20-ft cube make a Dex save or glow; attacks against them have Advantage.|
False Life|1|Necromancy|SW||Action|Self|Instant|Gain 2d4 + 4 Temporary HP.|
Feather Fall|1|Transmutation|BSW||Reaction|60 ft|1 minute|Up to five falling creatures descend slowly and take no falling damage.|
Find Familiar|1|Conjuration|W|R|1 hour|10 ft|Instant|Summon a spirit that takes the form of an animal as your familiar.|
Fog Cloud|1|Conjuration|DRSW|C|Action|120 ft|1 hour|Create a 20-ft-radius sphere of fog that Heavily Obscures the area.|
Goodberry|1|Conjuration|DR||Action|Self|24 hours|Create up to ten berries; each restores 1 HP and provides a day's nourishment.|
Grease|1|Conjuration|W||Action|60 ft|1 minute|Slick grease covers a 10-ft square; creatures make a Dex save or fall Prone.|
Guiding Bolt|1|Evocation|C||Action|120 ft|1 round|Ranged spell attack for 4d6 radiant; the next attack against the target has Advantage.|A:4d6 radiant
Healing Word|1|Abjuration|BCD||Bonus Action|60 ft|Instant|A creature you can see regains 2d4 + spellcasting modifier HP.|H:2d4
Hellish Rebuke|1|Evocation|L||Reaction|60 ft|Instant|When damaged, the attacker makes a Dex save or takes 2d10 fire damage.|S:dex:2d10 fire
Heroism|1|Enchantment|BP|C|Action|Touch|1 minute|Target is immune to Frightened and gains Temporary HP each turn.|
Hex|1|Enchantment|L|C|Bonus Action|90 ft|1 hour|Deal an extra 1d6 necrotic damage to a cursed target; its checks with one ability have Disadvantage.|
Hunter's Mark|1|Divination|R|C|Bonus Action|90 ft|1 hour|Deal an extra 1d6 force damage to the marked target and track it easily.|
Ice Knife|1|Conjuration|DSW||Action|60 ft|Instant|Ranged spell attack for 1d10 piercing, then a burst for 2d6 cold (Dex save).|A:1d10 piercing
Identify|1|Divination|BW|R|1 minute|Touch|Instant|Learn the properties of a magic item or the spells affecting a creature.|
Inflict Wounds|1|Necromancy|C||Action|Touch|Instant|Melee spell attack for 2d10 necrotic damage.|A:2d10 necrotic
Jump|1|Transmutation|DRSW||Action|Touch|1 minute|Target's jump distance triples.|
Longstrider|1|Transmutation|BDRW||Action|Touch|1 hour|Target's Speed increases by 10 ft.|
Mage Armor|1|Abjuration|SW||Action|Touch|8 hours|Target's base AC becomes 13 + Dex modifier (while unarmored).|
Magic Missile|1|Evocation|SW||Action|120 ft|Instant|Three darts each deal 1d4 + 1 force damage and always hit.|
Protection from Evil and Good|1|Abjuration|CPLW|C|Action|Touch|10 minutes|Protect a creature from aberrations, celestials, elementals, fey, fiends, and undead.|
Purify Food and Drink|1|Transmutation|CDP|R|Action|10 ft|Instant|Remove poison and disease from food and drink.|
Ray of Sickness|1|Necromancy|SW||Action|60 ft|Instant|Ranged spell attack for 2d8 poison and the target is Poisoned.|A:2d8 poison
Sanctuary|1|Abjuration|C||Bonus Action|30 ft|1 minute|Attackers must make a Wis save to target the warded creature.|
Searing Smite|1|Evocation|P|C|Bonus Action|Self|1 minute|Your next weapon hit deals extra 1d6 fire and ignites the target.|
Shield|1|Abjuration|SW||Reaction|Self|1 round|+5 AC until your next turn and you take no damage from Magic Missile.|
Shield of Faith|1|Abjuration|CP|C|Bonus Action|60 ft|10 minutes|Target gains a +2 bonus to AC.|
Silent Image|1|Illusion|BSW|C|Action|60 ft|10 minutes|Create an illusory image of an object, creature, or phenomenon.|
Sleep|1|Enchantment|BSW|C|Action|60 ft|1 minute|Creatures in a 5-ft-radius sphere make a Wis save or become Incapacitated, then Unconscious.|
Speak with Animals|1|Divination|BDR|R|Action|Self|10 minutes|Communicate with Beasts.|
Thunderous Smite|1|Evocation|P|C|Bonus Action|Self|1 minute|Your next hit deals extra 2d6 thunder and may push the target.|
Thunderwave|1|Evocation|BDSW||Action|Self (15-ft cube)|Instant|Con save or take 2d8 thunder damage and be pushed 10 ft.|S:con:2d8 thunder
Unseen Servant|1|Conjuration|BLW|R|Action|60 ft|1 hour|Create an invisible, mindless servant that performs simple tasks.|
Witch Bolt|1|Evocation|SLW|C|Action|30 ft|1 minute|Ranged spell attack for 2d12 lightning, then deal 1d12 each turn while in range.|A:2d12 lightning
Wrathful Smite|1|Necromancy|P|C|Bonus Action|Self|1 minute|Your next hit deals extra 1d6 psychic damage and may Frighten the target.|
Acid Arrow|2|Evocation|W||Action|90 ft|Instant|Ranged spell attack for 4d4 acid now and 2d4 at the end of its next turn.|A:4d4 acid
Aid|2|Abjuration|CPR||Action|30 ft|8 hours|Up to three creatures gain +5 HP maximum and current HP.|
Alter Self|2|Transmutation|SW|C|Action|Self|1 hour|Change your body: aquatic adaptation, change appearance, or natural weapons.|
Animal Messenger|2|Enchantment|BDR|R|Action|30 ft|24 hours|A Tiny Beast carries a message to a location.|
Arcane Lock|2|Abjuration|W||Action|Touch|Until dispelled|Lock a door, window, or container magically.|
Augury|2|Divination|C|R|1 minute|Self|Instant|Receive an omen about the results of a course of action in the next 30 minutes.|
Barkskin|2|Transmutation|D|C|Bonus Action|Touch|1 hour|Target's AC cannot be lower than 17.|
Blindness/Deafness|2|Transmutation|BCSW||Action|120 ft|1 minute|Con save or be Blinded or Deafened.|
Blur|2|Illusion|SW|C|Action|Self|1 minute|Attack rolls against you have Disadvantage.|
Calm Emotions|2|Enchantment|BC|C|Action|60 ft|1 minute|Suppress strong emotions in a 20-ft-radius sphere (Cha save).|
Darkness|2|Evocation|SLW|C|Action|60 ft|10 minutes|Create a 15-ft-radius sphere of magical darkness.|
Darkvision|2|Transmutation|DRSW||Action|Touch|8 hours|Target gains Darkvision 150 ft.|
Detect Thoughts|2|Divination|BSLW|C|Action|Self|1 minute|Read surface thoughts of creatures within 30 ft.|
Enhance Ability|2|Transmutation|BCDS|C|Action|Touch|1 hour|Target has Advantage on checks with one ability and a related benefit.|
Enlarge/Reduce|2|Transmutation|BDSW|C|Action|30 ft|1 minute|Make a creature or object larger or smaller.|
Find Steed|2|Conjuration|P||10 minutes|30 ft|Instant|Summon a spirit that appears as a loyal steed.|
Find Traps|2|Divination|CDR||Action|120 ft|Instant|Sense the presence of traps in line of sight.|
Flame Blade|2|Evocation|D|C|Bonus Action|Self|10 minutes|Create a fiery blade; melee spell attack for 3d6 fire.|A:3d6 fire
Flaming Sphere|2|Conjuration|DSW|C|Action|60 ft|1 minute|A 5-ft sphere of fire; Dex save or take 2d6 fire damage.|S:dex:2d6 fire
Gentle Repose|2|Necromancy|CW|R|Action|Touch|10 days|Protect a corpse from decay and undeath.|
Gust of Wind|2|Evocation|DSW|C|Action|Self (60-ft line)|1 minute|A strong wind pushes creatures and disperses gas.|
Heat Metal|2|Transmutation|BD|C|Action|60 ft|1 minute|Make metal glow red hot, dealing 2d8 fire damage each turn.|
Hold Person|2|Enchantment|BCDSLW|C|Action|60 ft|1 minute|A Humanoid makes a Wis save or is Paralyzed.|
Invisibility|2|Illusion|BSLW|C|Action|Touch|1 hour|Target becomes Invisible until it attacks or casts a spell.|
Knock|2|Transmutation|BSW||Action|60 ft|Instant|Open a locked or stuck object.|
Lesser Restoration|2|Abjuration|BCDPR||Bonus Action|Touch|Instant|End one condition: Blinded, Deafened, Paralyzed, or Poisoned.|
Levitate|2|Transmutation|SW|C|Action|60 ft|10 minutes|A creature or object rises up to 20 ft.|
Locate Object|2|Divination|BCDPRW|C|Action|Self|10 minutes|Sense the direction of a specific object within 1,000 ft.|
Magic Mouth|2|Illusion|BW|R|1 minute|30 ft|Until dispelled|Implant a message in an object to be spoken on a trigger.|
Magic Weapon|2|Transmutation|PSW|C|Bonus Action|Touch|1 hour|A weapon becomes magical with a +1 bonus.|
Mirror Image|2|Illusion|SLW||Action|Self|1 minute|Create three illusory duplicates that draw attacks.|
Misty Step|2|Conjuration|SLW||Bonus Action|Self|Instant|Teleport up to 30 ft to an unoccupied space you can see.|
Moonbeam|2|Evocation|D|C|Action|120 ft|1 minute|A beam of light deals 2d10 radiant damage (Con save).|S:con:2d10 radiant
Pass without Trace|2|Abjuration|DR|C|Action|Self (30-ft emanation)|1 hour|Allies gain +10 to Dexterity (Stealth) checks.|
Prayer of Healing|2|Abjuration|C||10 minutes|30 ft|Instant|Up to five creatures regain 2d8 + modifier HP.|
Protection from Poison|2|Abjuration|CDPR||Action|Touch|1 hour|Neutralize a poison and give resistance to Poison damage.|
Ray of Enfeeblement|2|Necromancy|LW|C|Action|60 ft|1 minute|Ranged spell attack; target's Strength damage is halved.|
Rope Trick|2|Transmutation|W||Action|Touch|1 hour|Create an extradimensional space reached by a rope.|
Scorching Ray|2|Evocation|SW||Action|120 ft|Instant|Three ranged spell attacks, each dealing 2d6 fire damage.|A:2d6 fire
See Invisibility|2|Divination|BSW||Action|Self|1 hour|See Invisible creatures and objects, and into the Ethereal Plane.|
Shatter|2|Evocation|BSLW||Action|60 ft|Instant|A loud noise deals 3d8 thunder damage in a 10-ft-radius sphere (Con save).|S:con:3d8 thunder
Silence|2|Illusion|BCR|CR|Action|120 ft|10 minutes|No sound can be created in a 20-ft-radius sphere.|
Spider Climb|2|Transmutation|SLW|C|Action|Touch|1 hour|Target can climb surfaces, including ceilings.|
Spike Growth|2|Transmutation|DR|C|Action|150 ft|10 minutes|Spiky ground deals 2d4 piercing per 5 ft moved.|
Spiritual Weapon|2|Evocation|C||Bonus Action|60 ft|1 minute|Spectral weapon; melee spell attack for 1d8 + modifier force damage.|A:1d8 force
Suggestion|2|Enchantment|BSLW|C|Action|30 ft|8 hours|Suggest a course of action; Wis save or the target pursues it.|
Warding Bond|2|Abjuration|P||Action|Touch|1 hour|Target gains +1 AC and saves, resistance to all damage; you take the damage it takes.|
Web|2|Conjuration|SW|C|Action|60 ft|1 hour|Create a 20-ft cube of sticky webs that Restrain creatures (Dex save).|
Zone of Truth|2|Enchantment|BCP||Action|60 ft|10 minutes|Creatures in a 15-ft-radius sphere cannot speak deliberate lies.|
Animate Dead|3|Necromancy|CW||1 minute|10 ft|Instant|Raise a skeleton or zombie under your control.|
Aura of Vitality|3|Abjuration|CP|C|Action|Self (30-ft emanation)|1 minute|Heal 2d6 HP to a creature in the aura as a Bonus Action each turn.|H:2d6
Beacon of Hope|3|Abjuration|C|C|Action|30 ft|1 minute|Allies have Advantage on Wis and Death saves and maximize healing.|
Bestow Curse|3|Necromancy|BCW|C|Action|Touch|1 minute|Curse a creature with Disadvantage, extra damage, or a loss of actions.|
Blink|3|Transmutation|SW||Action|Self|1 minute|Each turn you may vanish to the Ethereal Plane.|
Call Lightning|3|Conjuration|D|C|Action|120 ft|10 minutes|A storm cloud calls bolts that deal 3d10 lightning damage (Dex save).|S:dex:3d10 lightning
Clairvoyance|3|Divination|BCSW|C|10 minutes|1 mile|10 minutes|Create an invisible sensor to see or hear a location.|
Conjure Animals|3|Conjuration|DR|C|Action|60 ft|1 hour|Summon spirits in the form of Beasts.|
Counterspell|3|Abjuration|SLW||Reaction|60 ft|Instant|Interrupt a creature casting a spell; it makes a Con save or the spell fails.|
Create Food and Water|3|Conjuration|CP||Action|30 ft|Instant|Create 45 pounds of food and 30 gallons of water.|
Daylight|3|Evocation|CDPRS||Action|60 ft|1 hour|A 60-ft-radius sphere of bright light.|
Dispel Magic|3|Abjuration|BCDPRSLW||Action|120 ft|Instant|End spells of up to level 3 on a target; higher-level ones require a check.|
Elemental Weapon|3|Transmutation|P|C|Action|Touch|1 hour|A weapon gains +1 and deals an extra 1d4 elemental damage.|
Fear|3|Illusion|BSLW|C|Action|Self (30-ft cone)|1 minute|Creatures make a Wis save or become Frightened.|
Fireball|3|Evocation|SW||Action|150 ft|Instant|20-ft-radius sphere of flame; Dex save or take 8d6 fire damage (half on success).|S:dex:8d6 fire
Fly|3|Transmutation|SLW|C|Action|Touch|10 minutes|Target gains a Fly Speed of 60 ft.|
Gaseous Form|3|Transmutation|SLW|C|Action|Touch|1 hour|Target becomes a misty cloud.|
Glyph of Warding|3|Abjuration|BCW||1 hour|Touch|Until dispelled|Inscribe a glyph that triggers an explosion or stored spell.|
Haste|3|Transmutation|SW|C|Action|30 ft|1 minute|Double Speed, +2 AC, Advantage on Dex saves, and an extra action.|
Hunger of Hadar|3|Conjuration|L|C|Action|150 ft|1 minute|A void of darkness deals cold and acid damage.|
Hypnotic Pattern|3|Illusion|BSLW|C|Action|120 ft|1 minute|Creatures in a 30-ft cube make a Wis save or be Charmed and Incapacitated.|
Lightning Bolt|3|Evocation|SW||Action|Self (100-ft line)|Instant|Dex save or take 8d6 lightning damage (half on success).|S:dex:8d6 lightning
Magic Circle|3|Abjuration|CLW||1 minute|10 ft|1 hour|Create a 10-ft-radius, 20-ft-tall cylinder that guards against certain creatures.|
Major Image|3|Illusion|BLSW|C|Action|120 ft|10 minutes|Create an illusion with sound, smell, and temperature.|
Mass Healing Word|3|Abjuration|C||Bonus Action|60 ft|Instant|Up to six creatures regain 2d4 + modifier HP.|H:2d4
Meld into Stone|3|Transmutation|CD|R|Action|Touch|8 hours|Merge into a stone object or surface.|
Nondetection|3|Abjuration|BRW||Action|Touch|8 hours|Hide a target from divination magic.|
Phantom Steed|3|Illusion|W|R|1 minute|30 ft|1 hour|Create a quasi-real horse-like creature.|
Plant Growth|3|Transmutation|BDR||Action|150 ft|Instant|Enrich plants or make an area overgrown.|
Protection from Energy|3|Abjuration|CDRSW|C|Action|Touch|1 hour|Target has Resistance to one damage type.|
Remove Curse|3|Abjuration|CPLW||Action|Touch|Instant|End all curses affecting a creature or object.|
Revivify|3|Necromancy|CP||Action|Touch|Instant|Return a creature that died within the last minute to life with 1 HP.|
Sending|3|Divination|BCW||Action|Unlimited|1 round|Send a 25-word message to a known creature.|
Sleet Storm|3|Conjuration|DSW|C|Action|150 ft|1 minute|Heavy sleet makes the ground slippery and obscures vision.|
Slow|3|Transmutation|SW|C|Action|120 ft|1 minute|Up to six creatures make a Wis save or are slowed.|
Speak with Dead|3|Necromancy|BC||Action|10 ft|10 minutes|Ask a corpse up to five questions.|
Speak with Plants|3|Transmutation|BDR||Action|Self (30-ft emanation)|10 minutes|Communicate with plants.|
Spirit Guardians|3|Conjuration|C|C|Action|Self (15-ft emanation)|10 minutes|Spirits deal 3d8 radiant or necrotic damage to enemies (Wis save).|S:wis:3d8 radiant
Stinking Cloud|3|Conjuration|BSW|C|Action|90 ft|1 minute|A 20-ft-radius cloud of nauseating gas Poisons creatures.|
Tongues|3|Divination|BCSLW||Action|Touch|1 hour|Target understands and speaks any language.|
Vampiric Touch|3|Necromancy|LW|C|Action|Self|1 minute|Melee spell attack for 3d6 necrotic; you regain half the damage dealt.|A:3d6 necrotic
Water Breathing|3|Transmutation|DRSW|R|Action|30 ft|24 hours|Up to ten creatures can breathe underwater.|
Water Walk|3|Transmutation|CDRS|R|Action|30 ft|1 hour|Up to ten creatures can walk on liquid surfaces.|
Wind Wall|3|Evocation|DR|C|Action|120 ft|1 minute|A wall of strong wind blocks projectiles and gas.|
Arcane Eye|4|Divination|W|C|Action|30 ft|1 hour|Create an invisible magical eye that you can see through.|
Aura of Life|4|Abjuration|P|C|Action|Self (30-ft emanation)|10 minutes|Allies gain resistance to necrotic damage and cannot have their max HP reduced.|
Aura of Purity|4|Abjuration|P|C|Action|Self (30-ft emanation)|10 minutes|Allies gain resistance to Poison damage and Advantage vs. several conditions.|
Banishment|4|Abjuration|CPSLW|C|Action|60 ft|1 minute|Cha save or be banished to another plane.|
Blight|4|Necromancy|DSLW||Action|30 ft|Instant|Con save or take 8d8 necrotic damage (half on success).|S:con:8d8 necrotic
Confusion|4|Enchantment|BDSLW|C|Action|90 ft|1 minute|Creatures in a 10-ft-radius sphere act randomly (Wis save).|
Conjure Minor Elementals|4|Conjuration|DW|C|Action|90 ft|1 hour|Summon elemental spirits.|
Death Ward|4|Abjuration|CP||Action|Touch|8 hours|The first time the target would drop to 0 HP, it drops to 1 HP instead.|
Dimension Door|4|Conjuration|BSLW||Action|500 ft|Instant|Teleport yourself and one creature up to 500 ft.|
Divination|4|Divination|CDR|R|Action|Self|Instant|Receive an omen about events in the next 7 days.|
Dominate Beast|4|Enchantment|DS|C|Action|60 ft|1 minute|A Beast makes a Wis save or is Charmed and controlled.|
Fire Shield|4|Evocation|W||Action|Self|10 minutes|Flames shield you and damage melee attackers.|
Freedom of Movement|4|Abjuration|BCDR||Action|Touch|1 hour|Target ignores difficult terrain and cannot be paralyzed or restrained.|
Greater Invisibility|4|Illusion|BSW|C|Action|Touch|1 minute|Target is Invisible and stays Invisible when it attacks.|
Guardian of Faith|4|Conjuration|C||Action|30 ft|8 hours|A spectral guardian deals 20 radiant damage to enemies that approach.|
Ice Storm|4|Evocation|DSW||Action|300 ft|Instant|Hail deals 2d10 bludgeoning plus 4d6 cold in a 20-ft radius (Dex save).|S:dex:4d6 cold
Locate Creature|4|Divination|BCDPRW|C|Action|Self|1 hour|Sense the direction of a familiar creature within 1,000 ft.|
Phantasmal Killer|4|Illusion|BW|C|Action|120 ft|1 minute|Wis save or take 4d10 psychic damage each turn while Frightened.|
Polymorph|4|Transmutation|BDSW|C|Action|60 ft|1 hour|Transform a creature into a Beast (Wis save).|
Stone Shape|4|Transmutation|CDW||Action|Touch|Instant|Reshape a stone object up to Medium size.|
Stoneskin|4|Transmutation|DRSW|C|Action|Touch|1 hour|Target has Resistance to nonmagical Bludgeoning, Piercing, and Slashing damage.|
Wall of Fire|4|Evocation|DSW|C|Action|120 ft|1 minute|A wall of fire deals 5d8 fire damage (Dex save).|S:dex:5d8 fire
Animate Objects|5|Transmutation|BSW|C|Action|120 ft|1 minute|Animate up to ten nonmagical objects.|
Awaken|5|Transmutation|BD||8 hours|Touch|Instant|Awaken a Beast or plant to sentience.|
Cloudkill|5|Conjuration|SW|C|Action|120 ft|10 minutes|20-ft-radius poison cloud deals 5d8 poison damage (Con save).|S:con:5d8 poison
Commune|5|Divination|C|R|1 minute|Self|1 minute|Ask your deity three yes-or-no questions.|
Cone of Cold|5|Evocation|SW||Action|Self (60-ft cone)|Instant|Con save or take 8d8 cold damage (half on success).|S:con:8d8 cold
Conjure Elemental|5|Conjuration|DW|C|Action|90 ft|1 hour|Summon an elemental spirit.|
Contagion|5|Necromancy|CD||Action|Touch|7 days|Melee spell attack to inflict a disease.|
Dispel Evil and Good|5|Abjuration|CP|C|Action|Self|1 minute|Protect against celestials, elementals, fey, fiends, and undead.|
Dominate Person|5|Enchantment|BSW|C|Action|60 ft|1 minute|A Humanoid makes a Wis save or is Charmed and controlled.|
Flame Strike|5|Evocation|C||Action|60 ft|Instant|A column of fire deals 4d6 fire and 4d6 radiant damage (Dex save).|S:dex:4d6 fire
Geas|5|Enchantment|BCDPW||1 minute|60 ft|30 days|Command a creature to carry out a task (Wis save).|
Greater Restoration|5|Abjuration|BCD||Action|Touch|Instant|End a powerful condition or reduction on a creature.|
Hold Monster|5|Enchantment|BSLW|C|Action|90 ft|1 minute|A creature makes a Wis save or is Paralyzed.|
Insect Plague|5|Conjuration|CDS|C|Action|300 ft|10 minutes|Swarming locusts deal 4d10 piercing damage (Con save).|S:con:4d10 piercing
Legend Lore|5|Divination|BCW||10 minutes|Self|Instant|Learn lore about a notable person, place, or object.|
Mass Cure Wounds|5|Abjuration|BCD||Action|60 ft|Instant|Up to six creatures regain 5d8 + modifier HP.|H:5d8
Modify Memory|5|Enchantment|BW|C|Action|30 ft|1 minute|Reshape a creature's memories (Wis save).|
Planar Binding|5|Abjuration|BCDW||1 hour|60 ft|24 hours|Bind a creature from another plane (Cha save).|
Raise Dead|5|Necromancy|BCP||1 hour|Touch|Instant|Return a creature that died within 10 days to life.|
Scrying|5|Divination|BCDLW|C|10 minutes|Self|10 minutes|Observe a creature on the same plane.|
Telekinesis|5|Transmutation|SW|C|Action|60 ft|10 minutes|Move creatures or objects with your mind.|
Teleportation Circle|5|Conjuration|BSW||1 minute|10 ft|1 round|Open a portal to a permanent circle.|
Tree Stride|5|Conjuration|DR|C|Action|Self|1 minute|Step into one tree and out of another.|
Wall of Force|5|Evocation|W|C|Action|120 ft|10 minutes|An invisible, indestructible wall of force.|
Wall of Stone|5|Evocation|DSW|C|Action|120 ft|10 minutes|A solid wall of stone.|
Chain Lightning|6|Evocation|SW||Action|150 ft|Instant|Lightning arcs between targets for 10d8 lightning damage (Dex save).|S:dex:10d8 lightning
Circle of Death|6|Necromancy|SLW||Action|150 ft|Instant|60-ft-radius sphere; Con save or take 8d6 necrotic damage.|S:con:8d6 necrotic
Contingency|6|Abjuration|W||10 minutes|Self|10 days|Set a trigger for another spell to cast on you.|
Create Undead|6|Necromancy|CLW||1 minute|10 ft|Instant|Raise ghouls or other undead.|
Disintegrate|6|Transmutation|SW||Action|60 ft|Instant|Dex save or take 10d6 + 40 force damage and may be reduced to dust.|S:dex:10d6 force
Eyebite|6|Necromancy|BLW|C|Action|Self|1 minute|Each turn, make a creature Asleep, Panicked, or Sickened (Wis save).|
Find the Path|6|Divination|BCD|C|1 minute|Self|1 day|Learn the shortest route to a known location.|
Globe of Invulnerability|6|Abjuration|SW|C|Action|Self (10-ft emanation)|1 minute|Block spells of level 5 or lower.|
Harm|6|Necromancy|C||Action|60 ft|Instant|Con save or take 14d6 necrotic damage and reduce HP maximum.|S:con:14d6 necrotic
Heal|6|Abjuration|C||Action|60 ft|Instant|Restore 70 HP and end blindness, disease, and deafness.|H:70
Heroes' Feast|6|Conjuration|BCD||10 minutes|30 ft|Instant|A feast grants resistance to poison and extra HP.|
Mass Suggestion|6|Enchantment|BSW||Action|60 ft|24 hours|Suggest a course of action to up to twelve creatures.|
Move Earth|6|Transmutation|DSW|C|Action|120 ft|2 hours|Reshape terrain.|
Sunbeam|6|Evocation|DS|C|Action|Self (60-ft line)|1 minute|Beams of radiant light deal 6d8 radiant damage (Con save).|S:con:6d8 radiant
True Seeing|6|Divination|BCLSW||Action|Touch|1 hour|Target gains Truesight 120 ft.|
Wall of Thorns|6|Conjuration|D|C|Action|120 ft|10 minutes|A wall of thorny brush deals 7d8 piercing damage.|
Word of Recall|6|Conjuration|C||Action|5 ft|Instant|Teleport up to six creatures to a designated sanctuary.|
Delayed Blast Fireball|7|Evocation|SW|C|Action|150 ft|1 minute|Fiery orb deals 12d6 fire damage (Dex save), growing over time.|S:dex:12d6 fire
Etherealness|7|Conjuration|BCLSW||Action|Self|8 hours|Step into the Border Ethereal.|
Finger of Death|7|Necromancy|LSW||Action|60 ft|Instant|Con save or take 7d8 + 30 necrotic damage; slain humanoids rise as zombies.|S:con:7d8 necrotic
Fire Storm|7|Evocation|CDS||Action|150 ft|Instant|Sheets of flame deal 7d10 fire damage (Dex save).|S:dex:7d10 fire
Forcecage|7|Evocation|BLW||Action|100 ft|1 hour|An immobile, invisible cage of force.|
Plane Shift|7|Conjuration|CDLSW||Action|Touch|Instant|Transport up to eight creatures to another plane.|
Prismatic Spray|7|Evocation|BSW||Action|Self (60-ft cone)|Instant|Rays of varied colors with varied effects.|
Regenerate|7|Transmutation|BCD||1 minute|Touch|1 hour|Target regains 4d8 + 15 HP and regrows lost limbs.|H:4d8
Resurrection|7|Necromancy|BC||1 hour|Touch|Instant|Return a creature dead up to a century to life.|
Reverse Gravity|7|Transmutation|DSW|C|Action|100 ft|1 minute|Invert gravity in a 50-ft-radius cylinder.|
Teleport|7|Conjuration|BSW||Action|10 ft|Instant|Instantly transport yourself and up to eight others.|
Antimagic Field|8|Abjuration|CW|C|Action|Self (10-ft emanation)|1 hour|Suppress magic in a sphere around you.|
Control Weather|8|Transmutation|CDW|C|10 minutes|Self|8 hours|Change the weather within 5 miles.|
Dominate Monster|8|Enchantment|BSLW|C|Action|60 ft|1 hour|A creature makes a Wis save or is Charmed and controlled.|
Earthquake|8|Transmutation|CDS|C|Action|500 ft|1 minute|Violent shaking in a 100-ft radius.|
Feeblemind|8|Enchantment|BDLW||Action|150 ft|Instant|Int save or take 4d6 psychic damage and have Int and Cha reduced to 1.|S:int:4d6 psychic
Holy Aura|8|Abjuration|C|C|Action|Self|1 minute|Allies have Advantage on saves; attackers may be Blinded.|
Incendiary Cloud|8|Conjuration|DSW|C|Action|150 ft|1 minute|A cloud of smoke and flame deals 10d8 fire damage (Dex save).|S:dex:10d8 fire
Maze|8|Conjuration|W|C|Action|60 ft|10 minutes|Banish a creature to a labyrinth.|
Mind Blank|8|Abjuration|BW||Action|Touch|24 hours|Target is immune to psychic damage and mind-reading.|
Power Word Stun|8|Enchantment|BSLW||Action|60 ft|Instant|Stun a creature with 150 HP or fewer.|
Sunburst|8|Evocation|DSW||Action|150 ft|Instant|Sunlight deals 12d6 radiant damage and Blinds (Con save).|S:con:12d6 radiant
Astral Projection|9|Necromancy|CLW||1 hour|10 ft|Until dispelled|Project yourself and companions into the Astral Plane.|
Foresight|9|Divination|BDLW||1 minute|Touch|8 hours|Target has Advantage on D20 Tests and cannot be surprised.|
Gate|9|Conjuration|CSLW|C|Action|60 ft|1 minute|Open a portal to another plane.|
Imprisonment|9|Abjuration|LW||1 minute|30 ft|Until dispelled|Imprison a creature using one of several forms.|
Mass Heal|9|Abjuration|C||Action|60 ft|Instant|Restore up to 700 HP divided among creatures.|H:700
Meteor Swarm|9|Evocation|SW||Action|1 mile|Instant|Four meteors deal 20d6 fire and 20d6 bludgeoning damage (Dex save).|S:dex:20d6 fire
Power Word Heal|9|Enchantment|BC||Action|Touch|Instant|Restore all HP and end conditions.|
Power Word Kill|9|Enchantment|BSLW||Action|60 ft|Instant|Kill a creature with 100 HP or fewer.|
Prismatic Wall|9|Abjuration|BW||Action|60 ft|10 minutes|A multicolored shimmering wall.|
Shapechange|9|Transmutation|DW|C|Action|Self|1 hour|Assume the form of another creature.|
Storm of Vengeance|9|Conjuration|D|C|Action|Sight|1 minute|A raging storm with escalating effects.|
Time Stop|9|Transmutation|SW||Action|Self|Instant|Take 1d4 + 1 turns while time is frozen for others.|
True Polymorph|9|Transmutation|BLW|C|Action|30 ft|1 hour|Transform a creature or object into another.|
True Resurrection|9|Necromancy|CD||1 hour|Touch|Instant|Restore a creature to life even without a body.|
Weird|9|Illusion|BLW|C|Action|120 ft|1 minute|Creatures make a Wis save or take 4d10 psychic damage each turn while Frightened.|S:wis:4d10 psychic
Wish|9|Conjuration|SW||Action|Self|Instant|The mightiest spell: duplicate any spell of level 8 or lower, or reshape reality.|
`;

function parse(text) {
  return text.trim().split('\n').map((line) => {
    const [name, level, school, classes, flags, time, range, duration, summary, roll] = line.split('|');
    const spell = {
      id: name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name,
      level: Number(level),
      school,
      classes: [...classes].map((c) => SPELL_CLASS_CODES[c]),
      concentration: flags.includes('C'),
      ritual: flags.includes('R'),
      castingTime: time,
      range,
      duration,
      summary,
      roll: null,
    };
    if (roll) {
      const m = roll.match(/^(A|S|H):(?:(\w+):)?(.+)$/);
      if (m) {
        const [, kind, abil, dmg] = m;
        const [dice, ...type] = dmg.split(' ');
        spell.roll = { kind: kind === 'A' ? 'attack' : kind === 'S' ? 'save' : 'heal', save: abil || null, dice, type: type.join(' ') || null };
      }
    }
    return spell;
  });
}

export const SPELLS = parse(ROWS);
export const SPELL_BY_ID = Object.fromEntries(SPELLS.map((s) => [s.id, s]));

/** All SRD spells of a given class, optionally filtered by spell level. */
export function spellsForClass(classId, level = null) {
  return SPELLS.filter((s) => s.classes.includes(classId) && (level === null || s.level === level));
}

export const SPELL_SCHOOLS = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];
