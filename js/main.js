// App shell: hash router (#/ characters, #/build wizard, #/sheet/<id>, #/info) and the characters list.

import { h, mount, toast, confirmDialog, uid } from './ui.js';
import { listCharacters, getCharacter, deleteCharacter, loadDraft, clearDraft, lastSheetCharacter, storageHealth, requestPersistence, saveCharacter, patchCharacter, lastPlayedMap } from './store.js';
import { exportCharacter, exportAllCharacters, importFile } from './transfer.js';
import { renderSheet } from './sheet.js';
import { renderInfo } from './info.js';
import { renderBuilder } from './builder.js';
import { renderImport } from './import-view.js';
import { renderHomebrew } from './homebrew-view.js';
import { renderMap } from './map-view.js';
import { deriveCharacter } from './character.js';
import { duplicateCharacter } from './custom-sheet.js';
import { matchesQuery, characterSearchText, sortCharacters, SORT_MODES, relativeTime, cleanName } from './list-tools.js';
import { initHelp } from './help.js';
import { isTypingTarget } from './history.js';

const app = document.getElementById('app');
let teardown = null;
/** Home-page view state; lives for the page session only. */
const homeView = { q: '', sort: 'recent' };

const routes = [
  { name: 'home', match: /^\/?$/, render: renderHome, title: 'My Characters' },
  { name: 'build', match: /^\/build$/, render: renderBuild, title: 'Character Builder' },
  { name: 'sheet', match: /^\/sheet(?:\/([\w-]+))?$/, render: renderSheetRoute, title: 'Character Sheet' },
  { name: 'info', match: /^\/info(?:\/([\w-]+))?$/, render: renderInfo, title: 'How to Play' },
  { name: 'import', match: /^\/import$/, render: renderImport, title: 'Import' },
  { name: 'homebrew', match: /^\/homebrew(?:\/([\w-]+))?$/, render: renderHomebrew, title: 'Homebrew' },
  { name: 'map', match: /^\/map(?:\/([\w-]+))?$/, render: renderMap, title: 'Battle map' },
];

/** Navigate to a hash route. */
export const go = (path) => { location.hash = `#${path}`; };

function route() {
  const path = location.hash.replace(/^#/, '') || '/';
  const found = routes.find((r) => r.match.test(path)) || routes[0];
  const params = path.match(found.match).slice(1);
  if (teardown) { teardown(); teardown = null; }
  document.title = `${found.title} · Character Forge`;
  document.querySelectorAll('.main-nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === found.name));
  mount(app);
  const r = found.render(app, ...params);
  teardown = typeof r === 'function' ? r : null;
  window.scrollTo({ top: 0 });
  app.focus({ preventScroll: true });
}

// Saving relies on localStorage: warn loudly when it is blocked, and ask the browser to keep our data.
const health = storageHealth();
if (health.ok) requestPersistence();
else {
  document.getElementById('app').before(h('div', { class: 'storage-warning', role: 'alert' },
    h('strong', {}, 'Your characters cannot be saved in this window. '),
    'This browser is blocking site storage (a private window, a preview pane or strict privacy settings), so everything will be lost on refresh. Open the site in a normal browser tab, or allow site data for it. Use "Back up all characters" on the home page to keep a copy.'));
}

window.addEventListener('hashchange', route);
route();
initHelp(isTypingTarget);

// ---------------------------------------------------------------- home: characters list

function characterCard(character, { played, refresh }) {
  const d = deriveCharacter(character);
  const line = `Level ${d.level} ${[d.species?.name, d.cls?.name].filter(Boolean).join(' ')}`;
  const name = character.name || 'Unnamed hero';
  const title = h('h3', {}, name);
  const info = h('div', { class: 'char-info' }, title,
    h('p', {}, line),
    h('p', { class: 'hint' }, `AC ${d.ac.ac} · HP ${d.hp} · ${d.bg ? d.bg.name : 'No background'}`),
    played ? h('p', { class: 'played' }, `Last played ${relativeTime(played)}`) : null);

  function startRename() {
    const id = `rename-${character.id}`;
    const input = h('input', { id, type: 'text', value: character.name || '', maxlength: 80, 'aria-label': `New name for ${name}` });
    const done = (save) => {
      if (save) {
        const next = cleanName(input.value);
        if (!next) { toast('A name cannot be empty.'); input.focus(); return; }
        if (next !== character.name) {
          if (!patchCharacter(character.id, { name: next })) { toast('Could not save: browser storage is full or unavailable.'); return; }
          toast(`Renamed to ${next}.`);
        }
      }
      refresh(`[data-char="${character.id}"] [data-act="rename"]`);
    };
    const form = h('form', { class: 'rename-form', onsubmit: (e) => { e.preventDefault(); done(true); } },
      input,
      h('button', { type: 'submit', class: 'btn small primary' }, 'Save'),
      h('button', { type: 'button', class: 'btn small', onclick: () => done(false) }, 'Cancel'));
    form.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } });
    title.replaceWith(form);
    input.focus();
    input.select();
  }

  return h('li', { class: 'char-card', 'data-char': character.id },
    h('div', { class: 'portrait-mini' }, character.portrait ? h('img', { src: character.portrait, alt: '' }) : h('span', { 'aria-hidden': 'true' }, '⚔')),
    info,
    h('div', { class: 'char-actions' },
      h('a', { class: 'btn primary', href: `#/sheet/${character.id}`, 'data-act': 'open', 'aria-label': `Open sheet for ${name}` }, 'Open sheet'),
      h('button', { type: 'button', class: 'btn', 'data-act': 'rename', 'aria-label': `Rename ${name}`, onclick: startRename }, 'Rename'),
      h('button', {
        type: 'button', class: 'btn', 'aria-label': `Duplicate ${name}`,
        onclick: () => {
          const saved = saveCharacter(duplicateCharacter(character, uid));
          if (!saved) { toast('Could not save the copy: browser storage is full or unavailable.'); return; }
          toast(`Created ${saved.name}. Focus moved to the new copy.`);
          refresh(`[data-char="${saved.id}"] [data-act="open"]`);
        },
      }, 'Duplicate'),
      h('button', { type: 'button', class: 'btn', 'aria-label': `Export ${name}`, onclick: () => exportCharacter(character) }, 'Export'),
      h('button', {
        type: 'button', class: 'btn danger', 'aria-label': `Delete ${name}`,
        onclick: async () => {
          if (await confirmDialog('Delete character', `Delete ${character.name || 'this character'}? This cannot be undone.`, 'Delete')) {
            const li = document.querySelector(`[data-char="${character.id}"]`);
            const sib = li && (li.nextElementSibling || li.previousElementSibling);
            const nextId = sib && sib.getAttribute('data-char');
            deleteCharacter(character.id);
            toast('Character deleted.');
            route();
            const target = (nextId && document.querySelector(`[data-char="${nextId}"] [data-act="open"]`)) || document.getElementById('char-search');
            if (target) target.focus();
          }
        },
      }, 'Delete')));
}

function importButton() {
  const input = h('input', {
    type: 'file', accept: 'application/json,.json', hidden: true, 'aria-label': 'Import character JSON file',
    onchange: async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const saved = await importFile(file);
        toast(saved.length === 1 ? `Imported ${saved[0].name || 'character'}.` : `Imported ${saved.length} characters.`);
        if (saved.length === 1) go(`/sheet/${saved[0].id}`); else route();
      } catch (err) {
        toast(err.message);
      }
      input.value = '';
    },
  });
  return h('span', {}, input, h('button', { type: 'button', class: 'btn', onclick: () => input.click() }, 'Import from JSON'), ' ', h('a', { class: 'btn', href: '#/import' }, 'Import from D&D Beyond'));
}

function renderHome(root) {
  const draft = loadDraft();
  const hasAny = listCharacters().length > 0;

  const list = h('div', {});
  const status = h('p', { class: 'hint', role: 'status', 'aria-live': 'polite' });
  const search = h('input', {
    id: 'char-search', type: 'search', value: homeView.q, placeholder: 'Name, class or species', autocomplete: 'off',
    oninput: (e) => { homeView.q = e.target.value; draw(); },
  });
  const sort = h('select', { id: 'char-sort', onchange: (e) => { homeView.sort = e.target.value; draw(); } },
    SORT_MODES.map((m) => h('option', { value: m.value }, m.label)));
  sort.value = homeView.sort;

  function draw(focusSel) {
    const all = listCharacters();
    const playedAt = lastPlayedMap();
    const rows = all.map((c) => {
      const d = deriveCharacter(c);
      return { c, text: characterSearchText(c, d), name: c.name || '', level: d.level, lastPlayed: Math.max(playedAt[c.id] || 0, c.updatedAt || 0) };
    });
    const shown = sortCharacters(rows.filter((r) => matchesQuery(r.text, homeView.q)), homeView.sort);
    status.textContent = all.length && shown.length !== all.length ? `Showing ${shown.length} of ${all.length} characters.` : '';
    if (!all.length) {
      list.replaceChildren(h('p', { class: 'empty' }, 'No characters yet. Create your first one, or import one from a JSON file.'));
    } else if (!shown.length) {
      list.replaceChildren(h('p', { class: 'empty' }, `No characters match "${homeView.q.trim()}". `,
        h('button', { type: 'button', class: 'link-btn', onclick: () => { homeView.q = ''; search.value = ''; draw(); search.focus(); } }, 'Clear search')));
    } else {
      list.replaceChildren(h('ul', { class: 'char-list' }, shown.map((r) => characterCard(r.c, { played: playedAt[r.c.id] || 0, refresh: draw }))));
    }
    if (typeof focusSel === 'string') document.querySelector(focusSel)?.focus();
  }
  draw();

  mount(root, h('div', { class: 'page home' },
    h('section', { class: 'hero' },
      h('h1', {}, 'Forge your hero'),
      h('p', { class: 'lead' }, 'Build a character step by step with the 2024 fifth edition rules, then play from an interactive sheet with built-in dice.'),
      h('div', { class: 'row gap' },
        h('a', { class: 'btn cta', href: '#/build', onclick: () => clearDraft() }, 'Create a new character'),
        draft ? h('a', { class: 'btn', href: '#/build' }, `Resume "${draft.character.name || 'unnamed draft'}"`) : null,
        importButton(),
        hasAny ? h('button', { type: 'button', class: 'btn', onclick: () => exportAllCharacters(listCharacters()) }, 'Back up all characters') : null),
      h('p', { class: 'hint' }, 'Characters are saved automatically in this browser and survive refreshes. Back them up occasionally: clearing site data or switching browsers removes them.')),
    h('section', {},
      h('h2', {}, 'My characters'),
      hasAny ? h('div', { class: 'home-tools' },
        h('div', { class: 'field' }, h('label', { for: 'char-search' }, 'Search'), search),
        h('div', { class: 'field' }, h('label', { for: 'char-sort' }, 'Sort by'), sort),
        status) : null,
      list)));
}

// ---------------------------------------------------------------- builder

function renderBuild(root) {
  // Resumes the saved draft if there is one; "Create a new character" on the home page clears it first.
  renderBuilder(root, { onFinish: (saved) => go(`/sheet/${saved.id}`) });
}

// ---------------------------------------------------------------- sheet / info

function renderSheetRoute(root, id) {
  const character = id ? getCharacter(id) : lastSheetCharacter();
  if (!character) {
    mount(root, h('div', { class: 'page' },
      h('h1', {}, id ? 'Character not found' : 'No character to show'),
      h('p', { class: 'empty' }, id ? 'It may have been deleted.' : 'Create or import a character to open its sheet.'),
      h('div', { class: 'row gap' },
        h('a', { class: 'btn cta', href: '#/build', onclick: () => clearDraft() }, 'Create a character'),
        h('a', { class: 'btn', href: '#/' }, 'My characters'))));
    return;
  }
  return renderSheet(root, character);
}
