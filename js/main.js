// App shell: hash router (#/ characters, #/build wizard, #/sheet/<id>, #/info) and the characters list.

import { h, mount, toast, confirmDialog } from './ui.js';
import { listCharacters, getCharacter, deleteCharacter, loadDraft, clearDraft, lastSheetCharacter } from './store.js';
import { exportCharacter, importCharacterFile } from './transfer.js';
import { renderSheet } from './sheet.js';
import { renderInfo } from './info.js';
import { renderBuilder } from './builder.js';
import { renderImport } from './import-view.js';
import { deriveCharacter } from './character.js';

const app = document.getElementById('app');
let teardown = null;

const routes = [
  { name: 'home', match: /^\/?$/, render: renderHome, title: 'My Characters' },
  { name: 'build', match: /^\/build$/, render: renderBuild, title: 'Character Builder' },
  { name: 'sheet', match: /^\/sheet(?:\/([\w-]+))?$/, render: renderSheetRoute, title: 'Character Sheet' },
  { name: 'info', match: /^\/info$/, render: renderInfo, title: 'How to Play' },
  { name: 'import', match: /^\/import$/, render: renderImport, title: 'Import' },
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
  found.render(app, ...params);
  window.scrollTo({ top: 0 });
  app.focus({ preventScroll: true });
}

window.addEventListener('hashchange', route);
route();

// ---------------------------------------------------------------- home: characters list

function characterCard(character) {
  const d = deriveCharacter(character);
  const line = `Level ${d.level} ${[d.species?.name, d.cls?.name].filter(Boolean).join(' ')}`;
  return h('li', { class: 'char-card' },
    h('div', { class: 'portrait-mini' }, character.portrait ? h('img', { src: character.portrait, alt: '' }) : h('span', { 'aria-hidden': 'true' }, '⚔')),
    h('div', { class: 'char-info' },
      h('h3', {}, character.name || 'Unnamed hero'),
      h('p', {}, line),
      h('p', { class: 'hint' }, `AC ${d.ac.ac} · HP ${d.hp} · ${d.bg ? d.bg.name : 'No background'}`)),
    h('div', { class: 'char-actions' },
      h('a', { class: 'btn primary', href: `#/sheet/${character.id}`, 'aria-label': `Open sheet for ${character.name}` }, 'Open sheet'),
      h('button', { type: 'button', class: 'btn', 'aria-label': `Export ${character.name}`, onclick: () => exportCharacter(character) }, 'Export'),
      h('button', {
        type: 'button', class: 'btn danger', 'aria-label': `Delete ${character.name}`,
        onclick: async () => {
          if (await confirmDialog('Delete character', `Delete ${character.name || 'this character'}? This cannot be undone.`, 'Delete')) {
            deleteCharacter(character.id);
            toast('Character deleted.');
            route();
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
        const saved = await importCharacterFile(file);
        toast(`Imported ${saved.name || 'character'}.`);
        go(`/sheet/${saved.id}`);
      } catch (err) {
        toast(err.message);
      }
      input.value = '';
    },
  });
  return h('span', {}, input, h('button', { type: 'button', class: 'btn', onclick: () => input.click() }, 'Import from JSON'));
}

function renderHome(root) {
  const characters = listCharacters();
  const draft = loadDraft();
  mount(root, h('div', { class: 'page home' },
    h('section', { class: 'hero' },
      h('h1', {}, 'Forge your hero'),
      h('p', { class: 'lead' }, 'Build a character step by step with the 2024 fifth edition rules, then play from an interactive sheet with built-in dice.'),
      h('div', { class: 'row gap' },
        h('a', { class: 'btn cta', href: '#/build', onclick: () => clearDraft() }, 'Create a new character'),
        draft ? h('a', { class: 'btn', href: '#/build' }, `Resume "${draft.character.name || 'unnamed draft'}"`) : null,
        importButton())),
    h('section', {},
      h('h2', {}, 'My characters'),
      characters.length
        ? h('ul', { class: 'char-list' }, characters.map(characterCard))
        : h('p', { class: 'empty' }, 'No characters yet. Create your first one, or import one from a JSON file.'))));
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
  renderSheet(root, character);
}
