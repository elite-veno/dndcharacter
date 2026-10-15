// Homebrew spells created by the user. Stored in localStorage and merged into SPELLS / SPELL_BY_ID when
// js/data/spells.js loads, so builders, sheets and the D&D Beyond importer all see them. Pure helpers, no DOM.

export const CUSTOM_SPELLS_KEY = 'characterforge.custom.spells.v1';
export const SPELL_CASTER_CLASSES = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];
export const SCHOOLS = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];
export const SAVE_ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
export const ROLL_KINDS = ['attack', 'save', 'heal'];
export const DICE_RE = /^\d{1,2}d\d{1,3}$/;

export const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const str = (v, max) => String(v ?? '').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim().slice(0, max);
const line = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const dice = (v) => String(v ?? '').toLowerCase().replace(/\s+/g, '');

/** First sentence(s) of a longer text, used as the short summary shown on spell cards. */
export function summarize(text, max = 220) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return stop > 60 ? cut.slice(0, stop + 1) : `${cut.replace(/\s+\S*$/, '')}…`;
}

/** Unique id: the slug of the name, with -2, -3 ... appended when it is taken. */
export function uniqueId(base, taken) {
  const root = slugify(base) || 'custom-spell';
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/**
 * Validate and normalise one spell into the shape used by js/data/spells.js (plus optional extras:
 * components, material, description, higher, upcast). `raw.id` is kept when it is free, otherwise a unique id is made.
 * Returns { ok: true, entry } or { ok: false, errors: [...] }.
 */
export function normalizeSpell(raw, takenIds = new Set()) {
  const errors = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, errors: ['Not an object.'] };
  const name = line(raw.name, 80);
  if (!name) errors.push('Missing "name".');
  const levelNum = Number(raw.level ?? 0);
  if (!Number.isInteger(levelNum) || levelNum < 0 || levelNum > 9) errors.push('"level" must be a whole number from 0 (cantrip) to 9.');
  const schoolRaw = line(raw.school, 30);
  const school = SCHOOLS.find((s) => s.toLowerCase() === schoolRaw.toLowerCase());
  if (!school) errors.push(`"school" must be one of: ${SCHOOLS.join(', ')}.`);
  const classList = Array.isArray(raw.classes) ? raw.classes : typeof raw.classes === 'string' ? raw.classes.split(/[,\s]+/) : [];
  const classes = [...new Set(classList.map((c) => String(c).toLowerCase().trim()).filter(Boolean))];
  const badClass = classes.filter((c) => !SPELL_CASTER_CLASSES.includes(c));
  if (badClass.length) errors.push(`Unknown class: ${badClass.join(', ')}. Use: ${SPELL_CASTER_CLASSES.join(', ')}.`);

  // Effect: attack / save / heal with dice. A bare `roll: null` (or missing) means no roll buttons.
  let roll = null;
  const r = raw.roll;
  if (r && typeof r === 'object') {
    const kind = String(r.kind || '').toLowerCase();
    if (!ROLL_KINDS.includes(kind)) errors.push(`"roll.kind" must be one of: ${ROLL_KINDS.join(', ')}.`);
    else {
      const d = dice(r.dice);
      if (!DICE_RE.test(d)) errors.push('"roll.dice" must look like 2d6.');
      const save = String(r.save || '').toLowerCase();
      if (kind === 'save' && !SAVE_ABILITIES.includes(save)) errors.push(`"roll.save" must be one of: ${SAVE_ABILITIES.join(', ')}.`);
      roll = { kind, save: kind === 'save' ? save : null, dice: d, type: kind === 'heal' ? null : (line(r.type, 30).toLowerCase() || null) };
    }
  }
  const up = dice(raw.upcast);
  if (up && !DICE_RE.test(up)) errors.push('"upcast" must look like 1d6.');
  if (errors.length) return { ok: false, errors };

  const id = (raw.id && !takenIds.has(slugify(raw.id)) && slugify(raw.id)) || uniqueId(raw.id || name, takenIds);
  const description = str(raw.description, 4000);
  const comps = raw.components && typeof raw.components === 'object' ? raw.components : {};
  return {
    ok: true,
    entry: {
      id, name, level: levelNum, school, classes,
      concentration: raw.concentration === true || raw.concentration === 'true',
      ritual: raw.ritual === true || raw.ritual === 'true',
      castingTime: line(raw.castingTime, 40) || 'Action',
      range: line(raw.range, 40) || 'Self',
      duration: line(raw.duration, 40) || 'Instant',
      components: { v: comps.v === true, s: comps.s === true, m: comps.m === true },
      material: line(raw.material, 200),
      summary: line(raw.summary, 300) || summarize(description),
      description,
      higher: str(raw.higher, 1500),
      upcast: roll ? up : '',
      roll,
      custom: true,
    },
  };
}

/** Component line such as "V, S, M (a pinch of salt)". */
export function componentsText(spell) {
  const c = spell.components || {};
  const parts = [c.v && 'V', c.s && 'S', c.m && (spell.material ? `M (${spell.material})` : 'M')].filter(Boolean);
  return parts.join(', ');
}

/** Normalise a list, giving every entry a unique id (in `takenIds` and among themselves). Invalid entries are reported. */
export function normalizeSpellList(list, takenIds = new Set()) {
  const taken = new Set(takenIds);
  const entries = [];
  const errors = [];
  (Array.isArray(list) ? list : []).forEach((raw, i) => {
    const r = normalizeSpell(raw, taken);
    if (r.ok) { entries.push(r.entry); taken.add(r.entry.id); } else errors.push(`Item ${i + 1}${raw && raw.name ? ` (${raw.name})` : ''}: ${r.errors.join(' ')}`);
  });
  return { entries, errors };
}

/** Accept a spell object, an array of them, or { spells: [...] }. */
export function parseSpellJson(text, takenIds = new Set()) {
  let data;
  try { data = JSON.parse(text); } catch (e) { return { entries: [], errors: [`Invalid JSON: ${e.message}`] }; }
  const list = Array.isArray(data) ? data : Array.isArray(data && data.spells) ? data.spells : [data];
  return normalizeSpellList(list, takenIds);
}

/** JSON text for export. */
export const exportSpellsJson = (list) => JSON.stringify({ app: 'characterforge', kind: 'custom-spells', version: 1, spells: list }, null, 2);

/**
 * Merge imported spells into an existing list without duplicates: a spell with the same name, level and school as an
 * existing one is skipped; everything else is added (with a fresh id when its id is taken).
 * Returns { list, added, skipped }.
 */
export function mergeSpellLists(existing, incoming, builtInIds = new Set()) {
  const list = existing.slice();
  const taken = new Set([...builtInIds, ...list.map((s) => s.id)]);
  const sig = (s) => `${s.name.toLowerCase()}|${s.level}|${s.school}`;
  const seen = new Set(list.map(sig));
  let added = 0;
  let skipped = 0;
  for (const raw of incoming) {
    if (seen.has(sig(raw))) { skipped++; continue; }
    const r = normalizeSpell(raw, taken);
    if (!r.ok) { skipped++; continue; }
    list.push(r.entry);
    taken.add(r.entry.id);
    seen.add(sig(r.entry));
    added++;
  }
  return { list, added, skipped };
}

/** Add custom spells to the built-in arrays/indexes in place. Entries whose id is taken are skipped. */
export function mergeIntoSpellData(spells, byId, custom) {
  for (const sp of custom) {
    if (byId[sp.id]) continue;
    spells.push(sp);
    byId[sp.id] = sp;
  }
}

// ---------------------------------------------------------------- storage

const storage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

/** Load stored custom spells, re-validated against the built-in ids so a bad or colliding entry can never break the app. */
export function loadCustomSpells(builtInIds = new Set()) {
  const ls = storage();
  if (!ls) return [];
  try {
    const raw = JSON.parse(ls.getItem(CUSTOM_SPELLS_KEY) || '[]');
    return normalizeSpellList(raw, builtInIds).entries;
  } catch { return []; }
}

export function saveCustomSpells(list) {
  const ls = storage();
  if (!ls) return false;
  try { ls.setItem(CUSTOM_SPELLS_KEY, JSON.stringify(list)); return true; } catch { return false; }
}

// ---------------------------------------------------------------- edits to built-in spells ("overrides")

export const SPELL_OVERRIDES_KEY = 'characterforge.spell.overrides.v1';

/** Validate one edited version of a built-in spell. The id never changes. Returns { ok, entry } or { ok: false, errors }. */
export function normalizeOverride(raw, id) {
  const r = normalizeSpell({ ...(raw || {}), id }, new Set());
  if (!r.ok) return r;
  const entry = { ...r.entry, id, modified: true };
  delete entry.custom;
  return { ok: true, entry };
}

/** Load stored edits: { [builtInId]: entry }. Entries for unknown ids or that no longer validate are dropped. */
export function loadSpellOverrides(builtInIds = new Set()) {
  const ls = storage();
  if (!ls) return {};
  try {
    const raw = JSON.parse(ls.getItem(SPELL_OVERRIDES_KEY) || '{}');
    const out = {};
    for (const [id, value] of Object.entries(raw && typeof raw === 'object' ? raw : {})) {
      if (!builtInIds.has(id)) continue;
      const r = normalizeOverride(value, id);
      if (r.ok) out[id] = r.entry;
    }
    return out;
  } catch { return {}; }
}

export function saveSpellOverrides(map) {
  const ls = storage();
  if (!ls) return false;
  try { ls.setItem(SPELL_OVERRIDES_KEY, JSON.stringify(map)); return true; } catch { return false; }
}

/**
 * Apply edits in place (keeps object identity so everything already holding a spell sees the change):
 * every touched spell is first restored from `originals` (id -> pristine copy), then its override is applied.
 */
export function applySpellOverrides(byId, originals, overrides) {
  for (const [id, original] of originals) {
    const target = byId[id];
    if (!target) continue;
    const edit = overrides[id];
    if (!edit && !target.modified) continue;
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, JSON.parse(JSON.stringify(edit ? { ...original, ...edit } : original)));
  }
}

export const exportOverridesJson = (map) => JSON.stringify({ app: 'characterforge', kind: 'spell-overrides', version: 1, spells: Object.values(map) }, null, 2);

/** Parse an overrides export (or a plain spell array) into { [builtInId]: entry } for ids that exist. */
export function parseOverridesJson(text, builtInIds) {
  let data;
  try { data = JSON.parse(text); } catch (e) { return { map: {}, errors: [`Invalid JSON: ${e.message}`] }; }
  const list = Array.isArray(data) ? data : Array.isArray(data && data.spells) ? data.spells : [];
  const map = {};
  const errors = [];
  list.forEach((raw, i) => {
    const id = slugify(raw && raw.id);
    if (!builtInIds.has(id)) { errors.push(`Item ${i + 1}: "${raw && raw.id}" is not a built-in spell id.`); return; }
    const r = normalizeOverride(raw, id);
    if (r.ok) map[id] = r.entry; else errors.push(`Item ${i + 1} (${raw.name || id}): ${r.errors.join(' ')}`);
  });
  return { map, errors };
}
