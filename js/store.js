// localStorage persistence: saved characters (multiple) and the in-progress builder draft.
// Every access is wrapped in try/catch; storage can be unavailable (private mode, quota, blocked).

import { normalizeCharacter } from './character.js';
import { uid } from './ui.js';

const CHARACTERS_KEY = 'characterforge.characters.v1';
const DRAFT_KEY = 'characterforge.draft.v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** All saved characters, newest first. */
export function listCharacters() {
  const list = read(CHARACTERS_KEY, []);
  return Array.isArray(list) ? list.map(normalizeCharacter).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)) : [];
}

export function getCharacter(id) {
  return listCharacters().find((c) => c.id === id) || null;
}

/** Save (insert or replace) a character. Returns the saved character, or null if storage failed. */
export function saveCharacter(character) {
  const list = read(CHARACTERS_KEY, []);
  const now = Date.now();
  const saved = { ...character, id: character.id || uid(), updatedAt: now, createdAt: character.createdAt || now };
  const idx = list.findIndex((c) => c.id === saved.id);
  if (idx >= 0) list[idx] = saved; else list.push(saved);
  return write(CHARACTERS_KEY, list) ? saved : null;
}

export function deleteCharacter(id) {
  return write(CHARACTERS_KEY, read(CHARACTERS_KEY, []).filter((c) => c.id !== id));
}

/** The unfinished builder draft: { character, step } or null. */
export function loadDraft() {
  const draft = read(DRAFT_KEY, null);
  return draft && draft.character ? { character: normalizeCharacter(draft.character), step: draft.step || 0 } : null;
}

export function saveDraft(character, step) {
  return write(DRAFT_KEY, { character, step });
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

const LAST_SHEET_KEY = 'characterforge.lastSheet.v1';

/** Remember which sheet was opened last (used by the "Sheet" nav link). */
export function setLastSheet(id) {
  try { localStorage.setItem(LAST_SHEET_KEY, id); } catch { /* ignore */ }
}

/** The last opened character, else the most recently edited one, else null. */
export function lastSheetCharacter() {
  let id = null;
  try { id = localStorage.getItem(LAST_SHEET_KEY); } catch { /* ignore */ }
  return (id && getCharacter(id)) || listCharacters()[0] || null;
}
