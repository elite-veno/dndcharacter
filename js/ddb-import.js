// D&D Beyond character JSON -> Character Forge character. Pure functions, no DOM, no network.
// D&D Beyond has no documented public API; the JSON this reads is what the character page itself uses
// (https://character-service.dndbeyond.com/character/v5/character/<id>, public characters only). The layout is
// unofficial and can change, so every field is read defensively and anything not understood becomes a warning.

import {
  CLASS_BY_ID, SPECIES, BACKGROUNDS, SKILL_BY_ID, SPELL_BY_ID, FEAT_BY_ID, ALIGNMENTS, LANGUAGES, SUBCLASSES,
  WEAPONS, ARMOR, GEAR, PACKS, AMMUNITION, SHIELD,
} from './data/index.js';
import { newCharacter, normalizeCharacter } from './character.js';

const ABILITY_BY_DDB_ID = { 1: 'str', 2: 'dex', 3: 'con', 4: 'int', 5: 'wis', 6: 'cha' };
const ABILITY_BY_NAME = { strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha' };
const ALIGNMENT_BY_DDB_ID = { 1: 'Lawful Good', 2: 'Neutral Good', 3: 'Chaotic Good', 4: 'Lawful Neutral', 5: 'Neutral', 6: 'Chaotic Neutral', 7: 'Lawful Evil', 8: 'Neutral Evil', 9: 'Chaotic Evil' };

const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const core = (s) => slug(s).replace(/\b(path|of|the|college|circle|school|oath|way|domain|archetype|patron|origin|tradition|bloodline)\b/g, ' ').replace(/[\s-]+/g, '-').replace(/^-|-$/g, '');
const text = (v, max = 4000) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim().slice(0, max) : '');
const arr = (v) => (Array.isArray(v) ? v : []);
/** Number or null: D&D Beyond uses null for "not set" and Number(null) would be 0. */
const num = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

/** Pull the numeric id out of a D&D Beyond character URL or a bare id. Returns null if none found. */
export function parseDdbId(input) {
  const m = String(input || '').match(/(\d{5,})/);
  return m ? m[1] : null;
}
export const ddbApiUrl = (id) => `https://character-service.dndbeyond.com/character/v5/character/${id}?includeCustomItems=true`;

const itemIndex = (() => {
  const map = new Map();
  const add = (list) => arr(list).forEach((i) => { if (i && i.name) map.set(slug(i.name), i.id); });
  add(WEAPONS); add(ARMOR); add(GEAR); add(PACKS); add(AMMUNITION); add([SHIELD]);
  return map;
})();

function allModifiers(data) {
  const groups = data.modifiers && typeof data.modifiers === 'object' ? Object.values(data.modifiers) : [];
  return groups.flatMap((g) => arr(g)).filter((m) => m && typeof m === 'object');
}

function pickClass(data) {
  const classes = arr(data.classes).filter((c) => c && c.definition);
  if (!classes.length) return { main: null, others: [] };
  const sorted = [...classes].sort((a, b) => (b.level || 0) - (a.level || 0));
  return { main: sorted[0], others: sorted.slice(1) };
}

function mapSpecies(data, warnings) {
  const race = data.race || {};
  const names = [race.baseRaceName, race.baseName, race.fullName].map((n) => slug(n)).filter(Boolean);
  const label = race.fullName || race.baseRaceName || '';
  if (!names.length) return null;
  if (names.some((n) => n.includes('half-elf') || n.includes('aasimar') || n.includes('genasi') || n.includes('tabaxi') || n.includes('kenku'))) {
    warnings.push(`Species "${label}" does not exist in Character Forge, so the species was left empty.`);
    return null;
  }
  if (names.some((n) => n.includes('half-orc'))) return 'orc';
  const hit = SPECIES.find((s) => names.some((n) => n === s.id || n.includes(s.id)));
  if (hit) return hit.id;
  warnings.push(`Species "${label}" does not exist in Character Forge, so the species was left empty.`);
  return null;
}

/**
 * Convert a parsed D&D Beyond JSON (either the raw response { data: {...} } or the inner data object).
 * Returns { character, warnings, summary }. Throws Error with a readable message if it is not a character.
 */
export function ddbToCharacter(json) {
  const data = json && json.data && typeof json.data === 'object' && (json.data.stats || json.data.classes) ? json.data : json;
  if (!data || typeof data !== 'object' || (!Array.isArray(data.classes) && !Array.isArray(data.stats))) {
    throw new Error('This does not look like a D&D Beyond character (no "classes" or "stats"). Open the data link while logged in and copy the whole text.');
  }
  const warnings = [];
  const c = newCharacter();
  const mods = allModifiers(data);

  c.name = text(data.name, 80) || 'Imported character';

  // ---- class, level, subclass
  const { main, others } = pickClass(data);
  if (main) {
    const clsName = slug(main.definition.name);
    if (CLASS_BY_ID[clsName]) c.classId = clsName;
    else warnings.push(`Class "${main.definition.name}" does not exist in Character Forge.`);
    c.level = Math.min(20, Math.max(1, Number(main.level) || 1));
    if (others.length) warnings.push(`Multiclass characters are not supported: only ${main.definition.name} ${c.level} was imported (dropped: ${others.map((o) => `${o.definition.name} ${o.level}`).join(', ')}).`);
    const subName = main.subclassDefinition && main.subclassDefinition.name;
    if (subName && c.classId) {
      const sub = SUBCLASSES.find((s) => s.classId === c.classId && (slug(s.name) === slug(subName) || core(s.name) === core(subName)));
      if (sub) c.subclassId = sub.id;
      else warnings.push(`Subclass "${subName}" was not found in Character Forge.`);
    }
  } else warnings.push('No class found.');

  // ---- species and background
  c.speciesId = mapSpecies(data, warnings);
  const bgName = data.background && ((data.background.definition && data.background.definition.name) || (data.background.customBackground && data.background.customBackground.name));
  const bg = BACKGROUNDS.find((b) => slug(b.name) === slug(bgName));
  if (bg) c.backgroundId = bg.id;
  else if (bgName) warnings.push(`Background "${bgName}" does not exist in Character Forge (only ${BACKGROUNDS.map((b) => b.name).join(', ')}), so it was left empty.`);

  // ---- ability scores: base + manual bonus (or override) + "-score" bonus modifiers (racial, ASI, feats)
  const base = {};
  const overrides = {};
  arr(data.stats).forEach((s) => { const id = ABILITY_BY_DDB_ID[s && s.id]; if (id && num(s.value) !== null) base[id] = num(s.value); });
  arr(data.bonusStats).forEach((s) => { const id = ABILITY_BY_DDB_ID[s && s.id]; if (id && num(s.value) !== null) base[id] = (base[id] ?? 10) + num(s.value); });
  arr(data.overrideStats).forEach((s) => { const id = ABILITY_BY_DDB_ID[s && s.id]; if (id && num(s.value) !== null) overrides[id] = num(s.value); });
  const bonus = {};
  for (const m of mods) {
    if (m.type !== 'bonus' || typeof m.subType !== 'string' || !m.subType.endsWith('-score')) continue;
    const id = ABILITY_BY_NAME[m.subType.replace(/-score$/, '')];
    const v = num(m.fixedValue ?? m.value);
    if (id && v !== null) bonus[id] = (bonus[id] || 0) + v;
  }
  const scores = {};
  for (const id of Object.keys(ABILITY_BY_NAME).map((k) => ABILITY_BY_NAME[k])) {
    scores[id] = Math.min(30, Math.max(1, overrides[id] ?? ((base[id] ?? 10) + (bonus[id] || 0))));
  }
  c.abilityMethod = 'manual';
  c.manual = scores;

  // ---- skills, expertise, languages
  const skills = new Set();
  const expertise = new Set();
  const languages = new Set();
  const knownLang = new Set([...(LANGUAGES.standard || []), ...(LANGUAGES.rare || [])]);
  for (const m of mods) {
    const sub = slug(m.subType);
    if (m.type === 'proficiency' && SKILL_BY_ID[sub]) skills.add(sub);
    else if (m.type === 'expertise' && SKILL_BY_ID[sub]) { skills.add(sub); expertise.add(sub); }
    else if (m.type === 'language') {
      const name = [...knownLang].find((l) => slug(l) === sub);
      if (name && name !== 'Common') languages.add(name);
    }
  }
  c.classSkills = [...skills];
  c.expertise = [...expertise];
  c.languages = [...languages];

  // ---- feats (as advancement slots so they show up on the sheet)
  const featSlots = [];
  for (const f of arr(data.feats)) {
    const name = f && f.definition && f.definition.name;
    const feat = Object.values(FEAT_BY_ID).find((x) => slug(x.name) === slug(name));
    if (feat && !(bg && bg.feat === feat.id)) featSlots.push({ type: 'feat', featId: feat.id, ability: null });
    else if (name && !feat) warnings.push(`Feat "${name}" was not found in Character Forge.`);
  }
  c.levelAsi = featSlots;

  // ---- spells
  const spellDefs = [];
  arr(data.classSpells).forEach((cs) => arr(cs && cs.spells).forEach((s) => spellDefs.push(s)));
  if (data.spells && typeof data.spells === 'object') Object.values(data.spells).forEach((list) => arr(list).forEach((s) => spellDefs.push(s)));
  const seen = new Set();
  const missingSpells = [];
  for (const s of spellDefs) {
    const def = s && s.definition;
    if (!def || !def.name || seen.has(def.name)) continue;
    seen.add(def.name);
    const id = slug(def.name);
    if (!SPELL_BY_ID[id]) { missingSpells.push(def.name); continue; }
    if (Number(def.level) === 0) c.cantrips.push(id);
    else {
      if (c.classId === 'wizard') c.spellbook.push(id);
      if (c.classId !== 'wizard' || s.prepared || s.alwaysPrepared) c.spells.push(id);
    }
  }
  if (missingSpells.length) warnings.push(`${missingSpells.length} spell(s) were not found and skipped: ${missingSpells.slice(0, 8).join(', ')}${missingSpells.length > 8 ? '…' : ''}.`);

  // ---- inventory
  const items = [];
  const missingItems = [];
  for (const it of arr(data.inventory)) {
    const def = it && it.definition;
    if (!def || !def.name) continue;
    const id = itemIndex.get(slug(def.name));
    if (id) items.push({ id, qty: Math.max(1, Number(it.quantity) || 1), variant: null, equipped: !!it.equipped, paid: 0 });
    else missingItems.push(def.name);
  }
  c.equipment = { ...c.equipment, added: true, items };
  if (missingItems.length) warnings.push(`${missingItems.length} inventory item(s) have no match and were skipped: ${missingItems.slice(0, 8).join(', ')}${missingItems.length > 8 ? '…' : ''}.`);

  // ---- details
  const d = c.details;
  d.alignment = ALIGNMENTS.includes(ALIGNMENT_BY_DDB_ID[data.alignmentId]) ? ALIGNMENT_BY_DDB_ID[data.alignmentId] : '';
  ['age', 'height', 'weight', 'eyes', 'hair', 'skin', 'gender', 'faith'].forEach((k) => { d[k] = text(String(data[k] ?? ''), 80); });
  const t = data.traits || {};
  d.traits = text(t.personalityTraits); d.ideals = text(t.ideals); d.bonds = text(t.bonds); d.flaws = text(t.flaws);
  const n = data.notes || {};
  d.backstory = text(n.backstory); d.appearance = text(t.appearance || n.appearance);

  warnings.push('Hit points, Armor Class and bonuses are recalculated with Character Forge\'s 2024 rules and can differ from D&D Beyond (rolled HP, magic items, 2014 species features and custom entries are not carried over).');

  const character = normalizeCharacter(c);
  return {
    character, warnings,
    summary: `${character.name}: ${main ? `${main.definition.name} ${character.level}` : 'no class'}${character.speciesId ? `, ${SPECIES.find((s) => s.id === character.speciesId).name}` : ''}${bg ? `, ${bg.name}` : ''}`,
  };
}
