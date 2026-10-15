// Battle map storage. Map images can be several MB, too big for localStorage, so maps live in IndexedDB:
// store "images" holds { id, blob }, store "maps" holds the encounter objects (see js/map-logic.js).

import { normalizeEncounter, newId } from './map-logic.js';

const DB_NAME = 'characterforge-maps';
const PRESETS_KEY = 'characterforge.map.presets.v1';
const MAX_SIDE = 4096; // larger images are scaled down on upload to keep the browser responsive

let dbPromise = null;
function db() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error('This browser has no IndexedDB, so maps cannot be saved.')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('images')) d.createObjectStore('images', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('maps')) d.createObjectStore('maps', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { dbPromise = null; reject(new Error('Could not open map storage (private window or blocked site data?).')); };
  });
  return dbPromise;
}

function run(storeName, mode, fn) {
  return db().then((d) => new Promise((resolve, reject) => {
    const tx = d.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    const req = fn(store);
    if (req) req.onsuccess = () => { result = req.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error || new Error('Storage error'));
    tx.onabort = () => reject(tx.error || new Error('Storage full or blocked'));
  }));
}

export async function listEncounters() {
  const all = (await run('maps', 'readonly', (s) => s.getAll())) || [];
  return all.map((raw) => { try { return normalizeEncounter(raw); } catch { return null; } }).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getEncounter(id) {
  const raw = await run('maps', 'readonly', (s) => s.get(id));
  return raw ? normalizeEncounter(raw) : null;
}

export const saveEncounter = (enc) => run('maps', 'readwrite', (s) => s.put({ ...enc, updatedAt: Date.now() }));

export async function deleteEncounter(enc) {
  await run('maps', 'readwrite', (s) => s.delete(enc.id));
  if (enc.imageId) await run('images', 'readwrite', (s) => s.delete(enc.imageId));
}

export const putImage = (blob, id = newId('img')) => run('images', 'readwrite', (s) => s.put({ id, blob })).then(() => id);

export async function getImageBlob(id) {
  const rec = id ? await run('images', 'readonly', (s) => s.get(id)) : null;
  return rec ? rec.blob : null;
}

/** Decode an uploaded image, scale it down when huge, and return { blob, width, height }. */
export async function prepareImage(file) {
  if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type) && !/\.(png|jpe?g|webp)$/i.test(file.name)) throw new Error('Choose a .png or .jpg image.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('That image could not be read.'));
      el.src = url;
    });
    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) throw new Error('That image is empty.');
    if (Math.max(w, h) <= MAX_SIDE) return { blob: file, width: w, height: h };
    const scale = MAX_SIDE / Math.max(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});

/** One self-contained JSON file (image embedded) so a map can be moved to another browser. */
export async function exportEncounterJson(enc) {
  const blob = await getImageBlob(enc.imageId);
  return JSON.stringify({ app: 'characterforge', kind: 'battle-map', version: 1, map: enc, image: blob ? await blobToDataUrl(blob) : null });
}

export async function importEncounterJson(textValue) {
  let data;
  try { data = JSON.parse(textValue); } catch { throw new Error('That file is not valid JSON.'); }
  if (!data || data.kind !== 'battle-map' || !data.map) throw new Error('That file is not a Character Forge battle map.');
  const enc = normalizeEncounter({ ...data.map, id: newId('m') });
  if (data.image) {
    const blob = await (await fetch(data.image)).blob();
    enc.imageId = await putImage(blob);
  } else enc.imageId = null;
  await saveEncounter(enc);
  return enc;
}

// ---------------------------------------------------------------- reusable custom tokens ("presets"), shared by all maps

export function loadPresets() {
  try {
    const list = JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]');
    return Array.isArray(list) ? list.filter((p) => p && p.name) : [];
  } catch { return []; }
}

export function savePresets(list) {
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(list)); return true; } catch { return false; }
}
