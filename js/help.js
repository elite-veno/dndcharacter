// Help & shortcuts dialog: opened from the header / footer button or the "?" key.

import { h, openModal } from './ui.js';

const isMac = /Mac|iPhone|iPad/.test(globalThis.navigator?.platform || '');
const MOD = isMac ? 'Cmd' : 'Ctrl';

const SHORTCUTS = [
  [['?'], 'Open this help'],
  [['D'], 'Open or close the dice tray (sheet)'],
  [['Esc'], 'Close the dice tray or a dialog'],
  [[MOD, 'Z'], 'Undo the last sheet change (remembers 30)'],
  [[MOD, 'Shift', 'Z'], 'Redo (also ' + MOD + '+Y)'],
  [['Shift', 'click'], 'Roll with advantage'],
  [[MOD + ' / Alt', 'click'], 'Roll with disadvantage'],
];

const keys = (list) => h('span', {}, list.flatMap((k, i) => [i ? ' + ' : null, h('kbd', {}, k)]));

let current = null;

/** Open the help dialog (once; calling it again while open does nothing). */
export function openHelp() {
  if (current) return;
  const body = h('div', { class: 'help-dialog' },
    h('h3', {}, 'Keyboard shortcuts'),
    h('dl', { class: 'help-keys' }, SHORTCUTS.flatMap(([k, text]) => [h('dt', {}, keys(k)), h('dd', {}, text)])),
    h('h3', {}, 'Tips'),
    h('ul', { class: 'bullets' },
      h('li', {}, 'On the sheet, click any check, save, attack or spell to roll it. The dice tray keeps a log of your rolls.'),
      h('li', {}, 'Spell lists can be searched and filtered by level, school, concentration, ritual and custom spells.'),
      h('li', {}, 'Make your own spells, subclasses and more on the Homebrew page; add any spell to a sheet with "Add a spell".'),
      h('li', {}, 'Battle map (Map in the menu): upload a .png or .jpg, place your character and enemies, drag tokens, track HP, conditions and initiative. On the map: arrow keys move the selected token, N = next turn, + and - zoom.'),
      h('li', {}, 'On My Characters you can search, sort, rename and duplicate heroes. The Info page remembers what you opened.')),
    h('h3', {}, 'Saving and back-ups'),
    h('ul', { class: 'bullets' },
      h('li', {}, 'Everything is saved automatically in this browser (local storage). Nothing is sent to a server.'),
      h('li', {}, 'Clearing site data, using a private window or switching browsers or devices means your characters are not there. Use "Back up all characters" on My Characters, or Export on a single sheet, and keep the file somewhere safe.'),
      h('li', {}, 'Import a backup with "Import from JSON" on the home page.')));
  const modal = openModal('Help and shortcuts', body, { onClose: () => { current = null; } });
  current = modal;
}

/** Wire the global "?" shortcut and any element marked data-help. Call once at start-up. */
export function initHelp(isTypingTarget) {
  document.addEventListener('keydown', (e) => {
    if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(e.target) || document.querySelector('dialog[open]')) return;
    e.preventDefault();
    openHelp();
  });
  document.querySelectorAll('[data-help]').forEach((el) => el.addEventListener('click', openHelp));
}
