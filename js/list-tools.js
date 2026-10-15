// Pure helpers for list quality of life: character search / sort / relative time, spell filtering and the small
// Info-page state kept in sessionStorage. No DOM and no storage access here, so everything is easy to test.

// ---------------------------------------------------------------- characters

/** Case-insensitive "all words match" test against a haystack string. */
export function matchesQuery(haystack, query) {
  const terms = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const text = String(haystack || '').toLowerCase();
  return terms.every((t) => text.includes(t));
}

/** Text searched on the home page: name, class, subclass, species and background. */
export function characterSearchText(c, d) {
  return [c.name, d?.cls?.name, d?.subclass?.name, d?.species?.name, d?.bg?.name].filter(Boolean).join(' ');
}

export const SORT_MODES = [
  { value: 'recent', label: 'Recently played' },
  { value: 'name', label: 'Name (A to Z)' },
  { value: 'level', label: 'Level (high to low)' },
];

/** Sort rows of { name, level, lastPlayed } into a new array. Unknown modes behave like "recent". */
export function sortCharacters(rows, mode) {
  const byName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
  const copy = rows.slice();
  if (mode === 'name') return copy.sort(byName);
  if (mode === 'level') return copy.sort((a, b) => (b.level || 0) - (a.level || 0) || byName(a, b));
  return copy.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0) || byName(a, b));
}

/** "just now", "5 minutes ago", "yesterday", "3 days ago", else a short date. Returns '' for a missing time. */
export function relativeTime(ts, now = Date.now()) {
  if (!ts || !Number.isFinite(ts)) return '';
  const sec = Math.max(0, Math.round((now - ts) / 1000));
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'yesterday';
  if (day < 14) return `${day} days ago`;
  return new Date(ts).toISOString().slice(0, 10);
}

/** Trim a new character name; empty becomes null (callers keep the old name). */
export function cleanName(name) {
  const t = String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
  return t || null;
}

// ---------------------------------------------------------------- spells

export const defaultSpellFilter = () => ({ q: '', level: 'all', school: 'all', flag: 'all', customOnly: false });

/** Has the user narrowed the list at all? */
export function spellFilterActive(f) {
  return !!(f.q.trim() || f.level !== 'all' || f.school !== 'all' || f.flag !== 'all' || f.customOnly);
}

/** Does one spell pass the filter? flag: 'all' | 'concentration' | 'ritual'. */
export function spellMatches(spell, f) {
  if (f.q.trim() && !matchesQuery(spell.name, f.q)) return false;
  if (f.level !== 'all' && spell.level !== Number(f.level)) return false;
  if (f.school !== 'all' && String(spell.school).toLowerCase() !== String(f.school).toLowerCase()) return false;
  if (f.flag === 'concentration' && !spell.concentration) return false;
  if (f.flag === 'ritual' && !spell.ritual) return false;
  if (f.customOnly && !spell.custom) return false;
  return true;
}

export const filterSpells = (spells, f) => spells.filter((s) => spellMatches(s, f));

/** "12 of 40 spells" style count text. */
export const countText = (shown, total) => (shown === total ? `${total} spell${total === 1 ? '' : 's'}` : `${shown} of ${total} spells`);

// ---------------------------------------------------------------- Info page session state

/** Parse the stored Info state defensively: { q: string, closed: string[] }. */
export function parseInfoState(raw) {
  try {
    const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      q: typeof o?.q === 'string' ? o.q.slice(0, 200) : '',
      closed: Array.isArray(o?.closed) ? [...new Set(o.closed.filter((x) => typeof x === 'string'))] : [],
    };
  } catch {
    return { q: '', closed: [] };
  }
}

export const serializeInfoState = (q, closed) => JSON.stringify({ q: String(q || ''), closed: [...closed] });

/** Absolute link to an Info section, built from the current page URL. */
export function infoSectionLink(href, id) {
  return `${String(href).split('#')[0]}#/info/${id}`;
}
