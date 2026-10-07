// Import page: PDF -> JSON, and JSON -> custom subclasses for this site. Everything stays in the browser.

import { h, toast, confirmDialog } from './ui.js';
import { extractPdf, draftSubclass } from './pdf-import.js';
import { CLASS_IDS, parseSubclassJson, loadCustomSubclasses, saveCustomSubclasses, slugify } from './custom-content.js';
import { SUBCLASSES } from './data/subclasses.js';

const cap = (s) => s[0].toUpperCase() + s.slice(1);

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

  const fileIn = h('input', { id: 'pdf-file', type: 'file', accept: 'application/pdf,.pdf', onchange: async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    status.textContent = `Reading ${file.name}…`;
    dlBtn.disabled = copyBtn.disabled = draftBtn.disabled = true;
    try {
      extracted = await extractPdf(file, (n, total) => { status.textContent = `Reading page ${n} of ${total}…`; });
      const words = extracted.pages.reduce((n, p) => n + p.text.split(/\s+/).filter(Boolean).length, 0);
      jsonOut.value = JSON.stringify(extracted, null, 2);
      status.textContent = words ? `Done: ${extracted.pages.length} pages, ${words} words.` : 'No text found. This looks like a scanned PDF (images only); text extraction cannot read it.';
      dlBtn.disabled = copyBtn.disabled = false;
      draftBtn.disabled = !words;
    } catch (err) {
      extracted = null;
      status.textContent = `Could not read that PDF: ${err.message || err}`;
    }
  } });

  dlBtn.addEventListener('click', () => download(`${slugify((extracted.source.fileName || 'pdf').replace(/\.pdf$/i, '')) || 'pdf'}.json`, JSON.stringify(extracted, null, 2)));
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(jsonOut.value); toast('JSON copied.'); } catch { jsonOut.select(); toast('Press Ctrl+C to copy.'); }
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

  root.append(
    h('section', { class: 'import-page' },
      h('h1', {}, 'Import'),
      h('p', { class: 'lead' }, 'Turn a PDF into JSON, then add it to the site as a custom subclass. Everything happens in this browser; your PDF is never uploaded.'),
      h('h2', {}, '1. PDF to JSON'),
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
