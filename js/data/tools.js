// Tools (SRD 5.2, CC-BY-4.0). cost in gold pieces.

function t(name, category, ability, cost, weight, utilize = '') {
  return { id: name.toLowerCase().replace(/'/g, '').replace(/[^a-z]+/g, '-'), name, category, ability, cost, weight, utilize };
}

export const ARTISANS_TOOLS = [
  t("Alchemist's Supplies", 'artisan', 'int', 50, 8, 'Identify a substance (DC 15), or start a fire (DC 15).'),
  t("Brewer's Supplies", 'artisan', 'int', 20, 9, 'Detect poisoned drink (DC 15), or identify alcohol (DC 10).'),
  t("Calligrapher's Supplies", 'artisan', 'dex', 10, 5, 'Write with impressive flourish that guards against forgery (DC 15).'),
  t("Carpenter's Tools", 'artisan', 'str', 8, 6, 'Seal or pry open a door or container (DC 20).'),
  t("Cartographer's Tools", 'artisan', 'wis', 15, 6, 'Draft a map of a small area (DC 15).'),
  t("Cobbler's Tools", 'artisan', 'dex', 5, 5, 'Modify footwear to give Advantage on the wearer\'s next Dexterity (Acrobatics) check (DC 10).'),
  t("Cook's Utensils", 'artisan', 'wis', 1, 8, 'Improve food\'s flavor (DC 10), or fix food-borne illness (DC 15).'),
  t("Glassblower's Tools", 'artisan', 'int', 30, 5, 'Discern what a glass object held in the past 24 hours (DC 15).'),
  t("Jeweler's Tools", 'artisan', 'int', 25, 2, 'Discern a gem\'s value (DC 15).'),
  t("Leatherworker's Tools", 'artisan', 'dex', 5, 5, 'Add a design to leather (DC 10).'),
  t("Mason's Tools", 'artisan', 'str', 10, 8, 'Chisel a symbol or hole in stone (DC 10).'),
  t("Painter's Supplies", 'artisan', 'wis', 10, 5, 'Paint a recognizable image (DC 10).'),
  t("Potter's Tools", 'artisan', 'int', 10, 3, 'Discern what a ceramic object held in the past 24 hours (DC 15).'),
  t("Smith's Tools", 'artisan', 'str', 20, 8, 'Pry open a door or container (DC 20).'),
  t("Tinker's Tools", 'artisan', 'dex', 50, 10, 'Assemble a Tiny item from scrap (DC 20).'),
  t("Weaver's Tools", 'artisan', 'dex', 1, 5, 'Mend a tear in clothing (DC 10), or sew a Tiny design (DC 10).'),
  t("Woodcarver's Tools", 'artisan', 'dex', 1, 5, 'Carve a pattern in wood (DC 10).'),
];

export const OTHER_TOOLS = [
  t('Disguise Kit', 'kit', 'cha', 25, 3, 'Apply makeup to change your appearance (DC 10).'),
  t('Forgery Kit', 'kit', 'dex', 15, 5, 'Mimic 10 or fewer words of someone\'s handwriting (DC 15).'),
  t('Herbalism Kit', 'kit', 'wis', 5, 3, 'Identify a plant (DC 10).'),
  t('Navigator\'s Tools', 'kit', 'wis', 25, 2, 'Plot a course (DC 10).'),
  t("Poisoner's Kit", 'kit', 'int', 50, 2, 'Detect a poisoned object (DC 10).'),
  t("Thieves' Tools", 'kit', 'dex', 25, 1, 'Pick a lock (DC 15), or disarm a trap (DC 15).'),
];

export const GAMING_SETS = [
  t('Dice Set', 'gaming', 'wis', 0.1, 0), t('Dragonchess Set', 'gaming', 'wis', 1, 0.5),
  t('Playing Card Set', 'gaming', 'wis', 0.5, 0), t('Three-Dragon Ante Set', 'gaming', 'wis', 1, 0),
];

export const MUSICAL_INSTRUMENTS = [
  t('Bagpipes', 'instrument', 'cha', 30, 6), t('Drum', 'instrument', 'cha', 6, 3),
  t('Dulcimer', 'instrument', 'cha', 25, 10), t('Flute', 'instrument', 'cha', 2, 1),
  t('Horn', 'instrument', 'cha', 3, 2), t('Lute', 'instrument', 'cha', 35, 2),
  t('Lyre', 'instrument', 'cha', 30, 2), t('Pan Flute', 'instrument', 'cha', 12, 2),
  t('Shawm', 'instrument', 'cha', 2, 1), t('Viol', 'instrument', 'cha', 30, 1),
];

export const TOOLS = [...ARTISANS_TOOLS, ...OTHER_TOOLS, ...GAMING_SETS, ...MUSICAL_INSTRUMENTS];
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((x) => [x.id, x]));

export const TOOL_RULES = 'Proficiency with a tool lets you add your Proficiency Bonus to ability checks that use it (the DM picks the ability). A tool check can also be combined with a skill via Help or a relevant action. You can use a tool you are not proficient with, but you do not add your Proficiency Bonus.';
