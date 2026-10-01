// Import / export of characters as JSON files.

import { h } from './ui.js';
import { normalizeCharacter, newCharacter } from './character.js';
import { saveCharacter } from './store.js';

const FORMAT = 'character-forge';

/** Download a character as a JSON file. */
export function exportCharacter(c) {
  const payload = { format: FORMAT, version: 1, character: c };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const name = (c.name || 'character').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'character';
  const a = h('a', { href: url, download: `${name}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parse exported JSON text into a normalised character (new id). Throws an Error with a readable message. */
export function parseCharacter(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  const raw = data && data.format === FORMAT ? data.character : data;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !('abilityMethod' in raw || 'name' in raw)) {
    throw new Error('That file does not look like a Character Forge character.');
  }
  const c = normalizeCharacter({ ...raw, id: undefined });
  if (!Array.isArray(c.equipment?.items)) c.equipment = newCharacter().equipment;
  return c;
}

/** Read a File, validate it and save it as a new character. Resolves to the saved character. */
export async function importCharacterFile(file) {
  const saved = saveCharacter(parseCharacter(await file.text()));
  if (!saved) throw new Error('Could not save: browser storage is full or unavailable.');
  return saved;
}
