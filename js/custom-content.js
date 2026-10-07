// Custom content installed by the user (for example subclasses built from a PDF on the Import page).
// Stored in localStorage and merged into the built-in data when the app loads. Pure helpers, no DOM.

export const CUSTOM_SUBCLASSES_KEY = 'characterforge.custom.subclasses.v1';
export const CLASS_IDS = ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'];
export const CLASS_SUBCLASS_LABELS = {
  barbarian: 'Primal Path', bard: 'Bard College', cleric: 'Divine Domain', druid: 'Druid Circle', fighter: 'Martial Archetype', monk: 'Monastic Tradition',
  paladin: 'Sacred Oath', ranger: 'Ranger Archetype', rogue: 'Roguish Archetype', sorcerer: 'Sorcerous Origin', warlock: 'Otherworldly Patron', wizard: 'Arcane Tradition',
};

export const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const str = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/**
 * Validate and normalise one subclass object into the shape used by js/data/subclasses.js.
 * Returns { ok: true, entry } or { ok: false, errors: [...] }.
 */
export function normalizeSubclass(raw, takenIds = new Set()) {
  const errors = [];
  if (!raw || typeof raw !== 'object') return { ok: false, errors: ['Not an object.'] };
  const name = str(raw.name, 80);
  if (!name) errors.push('Missing "name".');
  const classId = str(raw.classId, 20).toLowerCase();
  if (!CLASS_IDS.includes(classId)) errors.push(`"classId" must be one of: ${CLASS_IDS.join(', ')}.`);
  const features = (Array.isArray(raw.features) ? raw.features : [])
    .map((f) => ({ level: Math.round(Number(f && f.level)), name: str(f && f.name, 80), desc: str(f && (f.desc ?? f.summary), 4000) }))
    .filter((f) => f.name && f.level >= 1 && f.level <= 20)
    .sort((a, b) => a.level - b.level);
  if (!features.length) errors.push('At least one feature with a name and a level between 1 and 20 is required.');
  if (errors.length) return { ok: false, errors };
  let id = slugify(raw.id || name) || 'custom-subclass';
  if (takenIds.has(id)) { let n = 2; while (takenIds.has(`${id}-${n}`)) n++; id = `${id}-${n}`; }
  const spells = (Array.isArray(raw.grantedSpells) ? raw.grantedSpells : [])
    .map((g) => ({ level: Math.round(Number(g && g.level)) || 3, spells: (Array.isArray(g && g.spells) ? g.spells : []).map((s) => str(s, 60)).filter(Boolean), kind: ['prepared', 'ritual', 'expanded'].includes(g && g.kind) ? g.kind : 'prepared' }))
    .filter((g) => g.spells.length);
  return {
    ok: true,
    entry: {
      id, classId, name, source: str(raw.source, 80) || 'Custom (imported)', label: str(raw.label, 40) || CLASS_SUBCLASS_LABELS[classId], sourceLevel: 3,
      summary: str(raw.summary, 600), features, grantedSpells: spells,
      grantedProficiencies: (Array.isArray(raw.grantedProficiencies) ? raw.grantedProficiencies : []).map((s) => str(s, 80)).filter(Boolean),
      notes2024: str(raw.notes2024, 400), custom: true,
    },
  };
}

/** Accept a subclass object, an array of them, or { subclasses: [...] }. */
export function parseSubclassJson(text, takenIds = new Set()) {
  let data;
  try { data = JSON.parse(text); } catch (e) { return { entries: [], errors: [`Invalid JSON: ${e.message}`] }; }
  const list = Array.isArray(data) ? data : Array.isArray(data && data.subclasses) ? data.subclasses : [data];
  const entries = [];
  const errors = [];
  const taken = new Set(takenIds);
  list.forEach((raw, i) => {
    const r = normalizeSubclass(raw, taken);
    if (r.ok) { entries.push(r.entry); taken.add(r.entry.id); } else errors.push(`Item ${i + 1}${raw && raw.name ? ` (${raw.name})` : ''}: ${r.errors.join(' ')}`);
  });
  return { entries, errors };
}

const storage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

export function loadCustomSubclasses() {
  const ls = storage();
  if (!ls) return [];
  try {
    const raw = JSON.parse(ls.getItem(CUSTOM_SUBCLASSES_KEY) || '[]');
    const taken = new Set();
    return (Array.isArray(raw) ? raw : []).map((r) => normalizeSubclass(r, taken)).filter((r) => r.ok).map((r) => { taken.add(r.entry.id); return r.entry; });
  } catch { return []; }
}

export function saveCustomSubclasses(list) {
  const ls = storage();
  if (!ls) return false;
  try { ls.setItem(CUSTOM_SUBCLASSES_KEY, JSON.stringify(list)); return true; } catch { return false; }
}
