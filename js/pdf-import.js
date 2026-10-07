// PDF -> JSON. Text is extracted in the browser with the bundled pdf.js (vendor/pdfjs); nothing is uploaded anywhere.
// The pure helpers (groupLines, draftSubclass) are unit tested in js/import.test.mjs.

/** Group pdf.js text items into lines by baseline. items: [{ str, transform:[a,b,c,d,x,y], height }] */
export function groupLines(items) {
  const rows = [];
  for (const it of items) {
    if (!it || typeof it.str !== 'string' || !it.str.trim()) { continue; }
    const y = it.transform ? it.transform[5] : 0;
    const x = it.transform ? it.transform[4] : 0;
    const size = Math.round((it.height || (it.transform && Math.abs(it.transform[3])) || 0) * 10) / 10;
    let row = rows.find((r) => Math.abs(r.y - y) <= Math.max(2, size * 0.35));
    if (!row) { row = { y, parts: [], size: 0 }; rows.push(row); }
    row.parts.push({ x, str: it.str, size });
    if (size > row.size) row.size = size;
  }
  rows.sort((a, b) => b.y - a.y);
  return rows.map((r) => ({
    text: r.parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim(),
    size: r.size,
  })).filter((l) => l.text);
}

let libPromise = null;
function loadLib() {
  if (globalThis.pdfjsLib) return Promise.resolve(globalThis.pdfjsLib);
  if (libPromise) return libPromise;
  libPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('../vendor/pdfjs/pdf.min.js', import.meta.url).href;
    s.onload = () => {
      globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.js', import.meta.url).href;
      resolve(globalThis.pdfjsLib);
    };
    s.onerror = () => { libPromise = null; reject(new Error('Could not load the PDF reader (vendor/pdfjs).')); };
    document.head.append(s);
  });
  return libPromise;
}

/** Extract a PDF File into a plain JSON-serialisable object. */
export async function extractPdf(file, onProgress = () => {}, askPassword = null) {
  const lib = await loadLib();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = lib.getDocument({ data });
  if (askPassword) {
    task.onPassword = async (update, reason) => {
      const pw = await askPassword(reason === 2 ? 'Wrong password. Try again:' : 'This PDF is password protected. Enter the password:');
      if (pw === null || pw === undefined) { task.destroy(); return; }
      update(pw);
    };
  }
  const pdf = await task.promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const lines = groupLines(content.items);
    pages.push({ page: n, text: lines.map((l) => l.text).join('\n'), lines: lines.map((l) => [l.text, l.size]) });
    onProgress(n, pdf.numPages);
  }
  let title = '';
  try { title = ((await pdf.getMetadata()).info || {}).Title || ''; } catch { /* ignore */ }
  return {
    format: 'character-forge-pdf', version: 1,
    source: { fileName: file.name, title, pageCount: pdf.numPages },
    pages,
  };
}

/** PDF metadata titles are often junk ("about:blank", "Microsoft Word - x.docx"); fall back to the file name. */
function usableTitle(src) {
  if (!src) return '';
  const t = String(src.title || '').trim();
  if (t.length > 2 && !/^about:|^microsoft word|\.(docx?|indd|pdf)$/i.test(t)) return t;
  return String(src.fileName || '').replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
}

const LEVEL_RE = /^(?:level\s*(\d{1,2})\b|(\d{1,2})(?:st|nd|rd|th)?[-\s]*level\b)/i;

/**
 * Heuristic draft of ONE subclass from extracted pages: bigger/Title-Case short lines become feature names, level
 * headings ("3rd-level ...", "Level 7") set the feature level. Always a draft: the user reviews it before adding.
 */
export function draftSubclass(extracted, { classId = 'fighter', name = '', source = '' } = {}) {
  const lines = (extracted.pages || []).flatMap((p) => (p.lines || []).map(([text, size]) => ({ text, size, page: p.page })));
  if (!lines.length) return { classId, name, source, summary: '', features: [] };
  const weight = new Map();
  for (const l of lines) weight.set(l.size, (weight.get(l.size) || 0) + l.text.length);
  const body = [...weight.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const firstPage = lines.filter((l) => l.page === lines[0].page);
  const biggest = [...firstPage].sort((a, b) => b.size - a.size)[0];
  const subName = name || (biggest ? biggest.text.slice(0, 80) : 'Imported subclass');
  const isHeading = (l, next) => l.text.length <= 50 && !/[.,;:]$/.test(l.text) && (l.size > body * 1.05 || (/^([A-Z][\w'’-]*)(\s+(of|the|and|to|in|a|for|with|[A-Z][\w'’-]*))*$/.test(l.text) && next && /^[A-Z]/.test(next.text) && next.size <= body * 1.05 && l.text.split(/\s+/).length <= 5));
  const features = [];
  const intro = [];
  let level = 0;
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.text === subName && !features.length && !cur) continue;
    const m = l.text.length <= 60 && l.text.match(LEVEL_RE);
    if (m) { level = Number(m[1] || m[2]); cur = null; continue; }
    if (isHeading(l, lines[i + 1])) {
      cur = { level: level || 3, name: l.text, desc: '' };
      features.push(cur);
    } else if (cur) cur.desc = `${cur.desc} ${l.text}`.trim();
    else if (!features.length) intro.push(l.text);
  }
  return {
    classId, name: subName, source: source || usableTitle(extracted.source) || 'Custom (imported)',
    summary: intro.join(' ').slice(0, 300), features: features.filter((f) => f.desc || f.name),
    grantedSpells: [], grantedProficiencies: [],
  };
}

/** Turn pdf.js errors into messages a person can act on. */
export function explainPdfError(err) {
  const name = (err && err.name) || '';
  const msg = (err && err.message) || String(err);
  if (name === 'PasswordException') return 'This PDF is password protected and no valid password was given.';
  if (name === 'InvalidPDFException') return 'This file is not a valid PDF (or it is damaged).';
  if (name === 'MissingPDFException') return 'The PDF could not be found.';
  if (/vendor\/pdfjs|Setting up fake worker|worker/i.test(msg)) return `The PDF reader could not start (${msg}). Make sure the site is opened from a web address (https://… or http://localhost), not as a local file.`;
  if (/Destroyed|destroy/i.test(msg)) return 'Cancelled.';
  return `${msg}. If this keeps happening the PDF may use an unsupported format; try re-saving it as a new PDF (print to PDF) and import that.`;
}
