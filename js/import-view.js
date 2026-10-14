// Import page: PDF -> JSON, and JSON -> custom subclasses for this site. Everything stays in the browser.

import { h, toast, confirmDialog } from './ui.js';
import { extractPdf, draftSubclass, explainPdfError } from './pdf-import.js';
import { CLASS_IDS, parseSubclassJson, loadCustomSubclasses, saveCustomSubclasses, slugify } from './custom-content.js';
import { SUBCLASSES } from './data/subclasses.js';
import { ddbToCharacter, parseDdbId, ddbApiUrl } from './ddb-import.js';
import { saveCharacter } from './store.js';

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const PREVIEW_MAX = 200000; // a multi-MB textarea freezes phones; the full JSON stays in memory for download/copy/draft

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function renderImport(root) {
  let extracted = null;
  const status = h('p', { class: 'hint', role: 'status' }, 'Choose a PDF. It is read inside your browser and never uploaded.');
  const jsonOut = h('textarea', { id: 'pdf-json', rows: 10, readOnly: true, 'aria-label': 'Extracted JSON', placeholder: 'The extracted JSON appears here.' });
  const dlBtn = h('button', { type: 'button', class: 'btn primary', disabled: true }, 'Download .json');
  const copyBtn = h('button', { type: 'button', class: 'btn', disabled: true }, 'Copy');
  const draftBtn = h('button', { type: 'button', class: 'btn', disabled: true }, 'Draft a subclass from this PDF');

  const classSel = h('select', { id: 'imp-class', 'aria-label': 'Class' }, CLASS_IDS.map((c) => h('option', { value: c }, cap(c))));
  const nameIn = h('input', { id: 'imp-name', type: 'text', placeholder: 'Subclass name (optional, guessed from the PDF)' });
  const srcIn = h('input', { id: 'imp-source', type: 'text', placeholder: 'Source label, e.g. My homebrew PDF' });
  const editor = h('textarea', { id: 'imp-editor', rows: 14, spellcheck: false, 'aria-label': 'Subclass JSON', placeholder: '[{ "classId": "fighter", "name": "...", "features": [{ "level": 3, "name": "...", "desc": "..." }] }]' });
  const problems = h('ul', { class: 'import-errors', 'aria-live': 'polite' });
  const installed = h('div', { class: 'import-installed' });

  const refreshInstalled = () => {
    const list = loadCustomSubclasses();
    installed.replaceChildren(
      h('h3', {}, `Installed custom subclasses (${list.length})`),
      list.length ? h('ul', { class: 'import-list' }, list.map((s) => h('li', {},
        h('span', {}, `${s.name} · ${cap(s.classId)} · ${s.features.length} features`),
        h('button', { type: 'button', class: 'btn danger', 'aria-label': `Remove ${s.name}`, onclick: async () => {
          if (!(await confirmDialog('Remove subclass', `Remove ${s.name} from this browser?`, 'Remove'))) return;
          saveCustomSubclasses(loadCustomSubclasses().filter((x) => x.id !== s.id));
          toast('Removed. Reloading…');
          setTimeout(() => location.reload(), 500);
        } }, 'Remove')))) : h('p', { class: 'hint' }, 'None yet.'));
  };

  async function handleFile(file) {
    if (!file) return;
    status.textContent = `Reading ${file.name}…`;
    dlBtn.disabled = copyBtn.disabled = draftBtn.disabled = true;
    try {
      extracted = await extractPdf(file, (n, total) => { status.textContent = `Reading page ${n} of ${total}…`; }, (msg) => Promise.resolve(window.prompt(msg)));
      const words = extracted.pages.reduce((n, p) => n + p.text.split(/\s+/).filter(Boolean).length, 0);
      const full = JSON.stringify(extracted, null, 2);
      jsonOut.value = full.length > PREVIEW_MAX ? `${full.slice(0, PREVIEW_MAX)}\n… (preview only: ${Math.round(full.length / 1024)} KB in total; use Download .json or Copy for everything)` : full;
      status.textContent = words ? `Done: ${extracted.pages.length} pages, ${words} words.` : 'No text found. This looks like a scanned PDF (images only); text extraction cannot read it.';
      dlBtn.disabled = copyBtn.disabled = false;
      draftBtn.disabled = !words;
    } catch (err) {
      extracted = null;
      jsonOut.value = '';
      status.textContent = `Could not read that PDF: ${explainPdfError(err)}`;
      status.classList.add('bad');
      console.error(err);
    }
  }
  const fileIn = h('input', { id: 'pdf-file', type: 'file', accept: 'application/pdf,.pdf', onchange: async (e) => {
    status.classList.remove('bad');
    const file = e.target.files && e.target.files[0];
    await handleFile(file);
    e.target.value = ''; // allow choosing the same file again
  } });
  const dropZone = h('div', { class: 'import-drop', tabindex: 0, role: 'button', 'aria-label': 'Drop a PDF here or press Enter to choose one',
    onclick: () => fileIn.click(), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileIn.click(); } },
    ondragover: (e) => { e.preventDefault(); dropZone.classList.add('over'); }, ondragleave: () => dropZone.classList.remove('over'),
    ondrop: (e) => { e.preventDefault(); dropZone.classList.remove('over'); status.classList.remove('bad'); handleFile(e.dataTransfer.files && e.dataTransfer.files[0]); } },
    'Drop a PDF here, or click to choose one');

  dlBtn.addEventListener('click', () => download(`${slugify((extracted.source.fileName || 'pdf').replace(/\.pdf$/i, '')) || 'pdf'}.json`, JSON.stringify(extracted, null, 2)));
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(extracted, null, 2)); toast('JSON copied.'); } catch { jsonOut.select(); toast('Copy failed: use Download .json instead.'); }
  });
  draftBtn.addEventListener('click', () => {
    const d = draftSubclass(extracted, { classId: classSel.value, name: nameIn.value.trim(), source: srcIn.value.trim() });
    editor.value = JSON.stringify([d], null, 2);
    problems.replaceChildren(h('li', {}, `Draft with ${d.features.length} feature(s). Check names, levels and descriptions, then add it.`));
    editor.scrollIntoView({ block: 'center' });
  });

  const jsonFile = h('input', { id: 'json-file', type: 'file', accept: 'application/json,.json', onchange: async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) editor.value = await file.text();
  } });

  const addBtn = h('button', { type: 'button', class: 'btn cta', onclick: () => {
    const taken = new Set(SUBCLASSES.map((s) => s.id));
    const { entries, errors } = parseSubclassJson(editor.value, taken);
    problems.replaceChildren(...errors.map((m) => h('li', { class: 'bad' }, m)));
    if (!entries.length) { if (!errors.length) problems.append(h('li', { class: 'bad' }, 'Nothing to add.')); return; }
    const customTaken = loadCustomSubclasses();
    saveCustomSubclasses([...customTaken, ...entries]);
    toast(`${entries.length} subclass(es) added. Reloading…`);
    setTimeout(() => location.reload(), 600);
  } }, 'Add to site');


  // ---- D&D Beyond character import
  const ddbId = h('input', { id: 'ddb-id', type: 'text', inputmode: 'url', placeholder: 'https://www.dndbeyond.com/characters/12345678 or just the number', 'aria-label': 'D&D Beyond character link or id' });
  const ddbLink = h('a', { class: 'btn', href: '#', target: '_blank', rel: 'noopener', 'aria-disabled': 'true' }, 'Open data link');
  const ddbText = h('textarea', { id: 'ddb-json', rows: 8, spellcheck: false, 'aria-label': 'D&D Beyond character JSON', placeholder: 'Paste the JSON text of your character here.' });
  const ddbStatus = h('p', { class: 'hint', role: 'status' });
  const ddbResult = h('div', { class: 'import-result', 'aria-live': 'polite' });
  const updateLink = () => {
    const id = parseDdbId(ddbId.value);
    ddbLink.href = id ? ddbApiUrl(id) : '#';
    ddbLink.setAttribute('aria-disabled', id ? 'false' : 'true');
  };
  ddbId.addEventListener('input', updateLink);
  ddbLink.addEventListener('click', (e) => { if (!parseDdbId(ddbId.value)) { e.preventDefault(); ddbStatus.textContent = 'Enter your character link or id first.'; } });
  const fetchBtn = h('button', { type: 'button', class: 'btn', onclick: async () => {
    const id = parseDdbId(ddbId.value);
    if (!id) { ddbStatus.textContent = 'Enter your character link or id first.'; return; }
    ddbStatus.textContent = 'Trying to fetch…';
    try {
      const res = await fetch(ddbApiUrl(id));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      ddbText.value = JSON.stringify(await res.json());
      ddbStatus.textContent = 'Fetched. Press "Import character".';
    } catch (err) {
      ddbStatus.textContent = 'D&D Beyond does not allow websites to fetch this directly (browser security). Use "Open data link", copy all the text on that page and paste it below. The character must be set to Public in D&D Beyond.';
    }
  } }, 'Try to fetch directly');
  const ddbFile = h('input', { id: 'ddb-file', type: 'file', accept: 'application/json,.json,text/plain,.txt', onchange: async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) { ddbText.value = await file.text(); ddbStatus.textContent = `Loaded ${file.name}. Press "Import character".`; }
    e.target.value = '';
  } });
  const ddbImport = h('button', { type: 'button', class: 'btn cta', onclick: () => {
    ddbResult.replaceChildren();
    let result;
    try {
      const raw = ddbText.value.trim();
      if (!raw) throw new Error('Paste the JSON text first.');
      result = ddbToCharacter(JSON.parse(raw));
    } catch (err) {
      ddbStatus.textContent = err instanceof SyntaxError ? 'That text is not valid JSON. Copy the complete text of the data page (it starts with { and ends with }).' : err.message;
      ddbStatus.classList.add('bad');
      return;
    }
    const saved = saveCharacter(result.character);
    if (!saved) { ddbStatus.textContent = 'Could not save (browser storage is full or blocked).'; ddbStatus.classList.add('bad'); return; }
    ddbStatus.classList.remove('bad');
    ddbStatus.textContent = `Imported: ${result.summary}`;
    ddbResult.append(
      h('a', { class: 'btn primary', href: `#/sheet/${saved.id}` }, 'Open the sheet'),
      result.warnings.length ? h('ul', { class: 'import-warnings' }, result.warnings.map((w) => h('li', {}, w))) : null);
  } }, 'Import character');

  root.append(
    h('section', { class: 'import-page' },
      h('h1', {}, 'Import'),
      h('p', { class: 'lead' }, 'Import a D&D Beyond character, or turn a PDF into JSON and add it to the site as a custom subclass. Everything happens in this browser; nothing is uploaded.'),
      h('h2', {}, 'D&D Beyond character'),
      h('p', { class: 'hint' }, 'Bring in a character you made on D&D Beyond (it must be set to Public there). D&D Beyond has no official export, so this reads the character data page: 1) enter your link or id, 2) open the data link, 3) select all text on that page (Ctrl+A) and copy it, 4) paste below and import.'),
      h('div', { class: 'field' }, h('label', { for: 'ddb-id' }, 'Character link or id'), ddbId),
      h('div', { class: 'import-actions' }, ddbLink, fetchBtn),
      h('div', { class: 'field' }, h('label', { for: 'ddb-json' }, 'Character JSON'), ddbText),
      h('div', { class: 'field' }, h('label', { for: 'ddb-file' }, 'Or load a saved .json/.txt file'), ddbFile),
      h('div', { class: 'import-actions' }, ddbImport),
      ddbStatus,
      ddbResult,
      h('h2', {}, '1. PDF to JSON'),
      dropZone,
      h('div', { class: 'field' }, h('label', { for: 'pdf-file' }, 'PDF file'), fileIn),
      status,
      jsonOut,
      h('div', { class: 'import-actions' }, dlBtn, copyBtn),
      h('h2', {}, '2. Add as a subclass'),
      h('p', { class: 'hint' }, 'Draft one from the PDF (a rough guess from headings and level markers) or paste/load subclass JSON. Edit freely before adding.'),
      h('div', { class: 'import-grid' },
        h('div', { class: 'field' }, h('label', { for: 'imp-class' }, 'Class'), classSel),
        h('div', { class: 'field' }, h('label', { for: 'imp-name' }, 'Subclass name'), nameIn),
        h('div', { class: 'field' }, h('label', { for: 'imp-source' }, 'Source label'), srcIn)),
      h('div', { class: 'import-actions' }, draftBtn),
      h('div', { class: 'field' }, h('label', { for: 'json-file' }, 'Or load a subclass .json'), jsonFile),
      editor,
      problems,
      h('div', { class: 'import-actions' }, addBtn),
      h('p', { class: 'hint' }, 'Subclass JSON: { classId, name, source, summary, features: [{ level, name, desc }], grantedSpells?: [{ level, spells[], kind }], grantedProficiencies?: [] }. Imported subclasses are stored in this browser only; copyrighted material stays your own responsibility.'),
      installed));
  refreshInstalled();
}
