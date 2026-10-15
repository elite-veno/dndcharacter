// Homebrew page (#/homebrew): create, edit, delete, export and import custom spells. Changes apply live and persist in localStorage.

import { h, toast, confirmDialog } from './ui.js';
import { field, nextId } from './steps/shared.js';
import { SPELLS, SPELL_BY_ID, BUILT_IN_SPELL_IDS, syncCustomSpells, syncSpellOverrides } from './data/spells.js';
import { ABILITIES } from './data/index.js';
import {
  SPELL_CASTER_CLASSES, SCHOOLS, SAVE_ABILITIES, normalizeSpell, loadCustomSpells, saveCustomSpells, componentsText,
  parseSpellJson, mergeSpellLists, summarize, exportSpellsJson,
  normalizeOverride, loadSpellOverrides, saveSpellOverrides, exportOverridesJson, parseOverridesJson,
} from './custom-spells.js';

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const ABILITY_NAME = Object.fromEntries(ABILITIES.map((a) => [a.id, a.name]));
const TIMES = ['Action', 'Bonus Action', 'Reaction', '1 minute', '10 minutes', '1 hour'];
const levelLabel = (n) => (n === 0 ? 'Cantrip' : `Level ${n}`);

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Read-only spell card used for the live preview and the list. */
export function spellPreview(spell) {
  const roll = spell.roll;
  const rollText = !roll ? null
    : roll.kind === 'attack' ? `Spell attack, ${roll.dice} ${roll.type || ''} damage`
      : roll.kind === 'save' ? `${ABILITY_NAME[roll.save] || roll.save} saving throw, ${roll.dice} ${roll.type || ''} damage`
        : `Heals ${roll.dice}`;
  return h('article', { class: 'spell-card preview-card' },
    h('div', { class: 'spell-head' },
      h('h3', {}, spell.name || 'Unnamed spell'),
      h('div', { class: 'tag-row' },
        h('span', { class: 'tag' }, levelLabel(spell.level)),
        h('span', { class: 'tag' }, spell.school),
        spell.concentration ? h('span', { class: 'tag sub' }, 'Concentration') : null,
        spell.ritual ? h('span', { class: 'tag sub' }, 'Ritual') : null,
        h('span', { class: 'tag custom-tag' }, spell.modified ? 'Modified' : 'Custom'))),
    h('p', { class: 'hint' }, [`Casting time ${spell.castingTime}`, `Range ${spell.range}`, `Duration ${spell.duration}`, componentsText(spell)].filter(Boolean).join(' · ')),
    rollText ? h('p', {}, h('strong', {}, 'Roll: '), rollText.replace(/\s+/g, ' ').trim()) : null,
    spell.classes.length ? h('p', { class: 'hint' }, `Classes: ${spell.classes.map(cap).join(', ')}`) : h('p', { class: 'hint' }, 'No class list: add it to a character as an extra spell.'),
    h('p', {}, spell.description || spell.summary),
    spell.higher ? h('p', {}, h('strong', {}, 'At higher levels. '), spell.higher) : null,
    spell.upcast ? h('p', { class: 'hint' }, `+${spell.upcast} per slot level above ${levelLabel(spell.level).toLowerCase()}.`) : null);
}

export function renderHomebrew(root, editParam = null) {
  let custom = loadCustomSpells(BUILT_IN_SPELL_IDS);
  let overrides = loadSpellOverrides(BUILT_IN_SPELL_IDS);
  let editingId = null; // id of the custom spell being edited
  let editingBuiltIn = null; // id of the built-in spell being edited

  const commit = (list) => {
    custom = list;
    if (!saveCustomSpells(list)) toast('Could not save: browser storage is full or unavailable.');
    syncCustomSpells(list);
    drawList();
  };

  // ---------------------------------------------------------------- form controls
  const f = {};
  const mk = (key, el) => { f[key] = el; return el; };
  const text = (key, label, opts = {}) => {
    const id = nextId('hb');
    return field(label, mk(key, h('input', { type: 'text', id, maxlength: opts.max || 80, list: opts.list || null, value: opts.value || '', required: !!opts.required, oninput: refresh })), opts.hint);
  };
  const sel = (key, label, options, value) => {
    const id = nextId('hb');
    const el = mk(key, h('select', { id, onchange: refresh }, options.map((o) => h('option', { value: o.value }, o.label))));
    el.value = value;
    return field(label, el);
  };
  const check = (key, label, extra = {}) => {
    const id = nextId('hb');
    return h('div', { class: 'field inline' }, mk(key, h('input', { type: 'checkbox', id, onchange: refresh, ...extra })), h('label', { for: id }, label));
  };
  const area = (key, label, rows, hint) => {
    const id = nextId('hb');
    return field(label, mk(key, h('textarea', { id, rows, oninput: refresh })), hint);
  };

  const classBoxes = SPELL_CASTER_CLASSES.map((cl) => {
    const id = nextId('hb-class');
    return h('div', { class: 'check-item' }, mk(`class-${cl}`, h('input', { type: 'checkbox', id, onchange: refresh })), h('label', { for: id }, cap(cl)));
  });

  const effectSel = sel('kind', 'Rolls offered on the sheet', [
    { value: '', label: 'None (no roll buttons)' }, { value: 'attack', label: 'Spell attack + damage' },
    { value: 'save', label: 'Saving throw + damage' }, { value: 'heal', label: 'Healing' }], '');
  const effectBox = h('div', { class: 'effect-box', hidden: true },
    text('dice', 'Dice', { max: 8, hint: 'For example 3d6. Cantrip dice grow at levels 5, 11 and 17.' }),
    h('div', { id: 'hb-typefield' }, text('type', 'Damage type', { max: 30, hint: 'fire, cold, radiant…' })),
    h('div', { id: 'hb-savefield' }, sel('save', 'Targets save with', SAVE_ABILITIES.map((a) => ({ value: a, label: ABILITY_NAME[a] || a.toUpperCase() })), 'dex')),
    text('upcast', 'Extra dice per slot level above the spell level', { max: 8, hint: 'Optional, for example 1d6. Used when casting with a higher slot.' }));

  const msg = h('p', { class: 'import-errors', role: 'alert', 'aria-live': 'assertive' });
  const preview = h('div', { class: 'preview-wrap', 'aria-live': 'polite' });
  const formTitle = h('h2', {}, 'New spell');
  const submitBtn = h('button', { type: 'submit', class: 'btn primary' }, 'Add spell');
  const cancelBtn = h('button', { type: 'button', class: 'btn', hidden: true, onclick: () => resetForm() }, 'Cancel edit');
  const datalist = h('datalist', { id: 'hb-times' }, TIMES.map((t) => h('option', { value: t })));

  const form = h('form', { class: 'hb-form', novalidate: true, onsubmit: (e) => { e.preventDefault(); submit(); } },
    datalist,
    text('name', 'Name', { required: true, hint: 'Required.' }),
    h('div', { class: 'row gap hb-row' },
      sel('level', 'Level', Array.from({ length: 10 }, (_, i) => ({ value: String(i), label: levelLabel(i) })), '1'),
      sel('school', 'School', SCHOOLS.map((s) => ({ value: s, label: s })), 'Evocation')),
    h('div', { class: 'row gap hb-row' },
      text('castingTime', 'Casting time', { list: 'hb-times', value: 'Action', max: 40 }),
      text('range', 'Range', { value: '60 ft', max: 40 }),
      text('duration', 'Duration', { value: 'Instant', max: 40 })),
    h('fieldset', { class: 'check-list cols' }, h('legend', {}, 'Components and tags'),
      check('v', 'Verbal (V)'), check('s', 'Somatic (S)'), check('m', 'Material (M)'),
      check('concentration', 'Concentration'), check('ritual', 'Ritual')),
    text('material', 'Material components', { max: 200, hint: 'Optional, for example "a pinch of sulfur".' }),
    h('fieldset', { class: 'check-list cols' }, h('legend', {}, 'Class spell lists'), classBoxes),
    h('p', { class: 'hint' }, 'Spells with no class are only available as extra spells on a sheet.'),
    effectSel, effectBox,
    area('description', 'Rules text', 6, 'What the spell does.'),
    area('higher', 'At higher levels', 3, 'Optional. Describes what changes with a higher slot.'),
    text('summary', 'Short summary', { max: 300, hint: 'Optional. Shown on cards; made from the rules text when empty.' }),
    msg,
    h('div', { class: 'row gap' }, submitBtn, cancelBtn));
  f.v.checked = true; f.s.checked = true;

  function read() {
    const kind = f.kind.value;
    return {
      id: editingBuiltIn || editingId || undefined,
      name: f.name.value, level: Number(f.level.value), school: f.school.value,
      castingTime: f.castingTime.value, range: f.range.value, duration: f.duration.value,
      components: { v: f.v.checked, s: f.s.checked, m: f.m.checked }, material: f.material.value,
      concentration: f.concentration.checked, ritual: f.ritual.checked,
      classes: SPELL_CASTER_CLASSES.filter((cl) => f[`class-${cl}`].checked),
      roll: kind ? { kind, dice: f.dice.value, type: f.type.value, save: f.save.value } : null,
      upcast: f.upcast.value, description: f.description.value, higher: f.higher.value, summary: f.summary.value,
    };
  }

  const takenIds = () => new Set([...BUILT_IN_SPELL_IDS, ...custom.filter((s) => s.id !== editingId).map((s) => s.id)]);

  function refresh() {
    const kind = f.kind.value;
    effectBox.hidden = !kind;
    effectBox.querySelector('#hb-typefield').hidden = kind === 'heal';
    effectBox.querySelector('#hb-savefield').hidden = kind !== 'save';
    const r = editingBuiltIn ? normalizeOverride(read(), editingBuiltIn) : normalizeSpell(read(), takenIds());
    preview.replaceChildren(h('h3', {}, 'Preview'), r.ok ? spellPreview(r.entry) : h('p', { class: 'hint' }, f.name.value.trim() ? `Not valid yet: ${r.errors.join(' ')}` : 'Give the spell a name to see a preview.'));
    return r;
  }

  function submit() {
    const r = refresh();
    if (!r.ok) { msg.textContent = r.errors.join(' '); f.name.focus(); return; }
    msg.textContent = '';
    if (editingBuiltIn) {
      overrides = { ...overrides, [editingBuiltIn]: r.entry };
      if (!saveSpellOverrides(overrides)) toast('Could not save: browser storage is full or unavailable.');
      syncSpellOverrides(overrides);
      toast(`${r.entry.name} updated. Reset it any time to get the original back.`);
      resetForm();
      drawBuiltins();
      return;
    }
    const wasEditing = editingId;
    commit(wasEditing ? custom.map((s) => (s.id === wasEditing ? r.entry : s)) : [...custom, r.entry]);
    toast(`${r.entry.name} ${wasEditing ? 'updated' : 'added'}.`);
    resetForm();
  }

  function fill(spell, builtIn = false) {
    editingBuiltIn = builtIn ? spell.id : null;
    editingId = builtIn ? null : spell.id;
    f.name.value = spell.name; f.level.value = String(spell.level); f.school.value = spell.school;
    f.castingTime.value = spell.castingTime; f.range.value = spell.range; f.duration.value = spell.duration;
    f.v.checked = !!spell.components?.v; f.s.checked = !!spell.components?.s; f.m.checked = !!spell.components?.m;
    f.material.value = spell.material || ''; f.concentration.checked = spell.concentration; f.ritual.checked = spell.ritual;
    SPELL_CASTER_CLASSES.forEach((cl) => { f[`class-${cl}`].checked = spell.classes.includes(cl); });
    f.kind.value = spell.roll?.kind || ''; f.dice.value = spell.roll?.dice || ''; f.type.value = spell.roll?.type || '';
    f.save.value = spell.roll?.save || 'dex'; f.upcast.value = spell.upcast || '';
    f.description.value = spell.description || ''; f.higher.value = spell.higher || ''; f.summary.value = spell.summary === summarize(spell.description) ? '' : spell.summary;
    formTitle.textContent = builtIn ? `Edit ${spell.name} (built-in)` : `Edit ${spell.name}`; submitBtn.textContent = 'Save changes'; cancelBtn.hidden = false;
    refresh();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    f.name.focus({ preventScroll: true });
  }

  function resetForm() {
    editingId = null;
    editingBuiltIn = null;
    form.reset();
    f.v.checked = true; f.s.checked = true;
    f.level.value = '1'; f.school.value = 'Evocation';
    f.castingTime.value = 'Action'; f.range.value = '60 ft'; f.duration.value = 'Instant';
    formTitle.textContent = 'New spell'; submitBtn.textContent = 'Add spell'; cancelBtn.hidden = true; msg.textContent = '';
    refresh();
  }

  // ---------------------------------------------------------------- list, export, import
  const listBox = h('div', {});
  const importMsg = h('ul', { class: 'import-errors', 'aria-live': 'polite' });
  const fileIn = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, 'aria-label': 'Import custom spells JSON file', onchange: async () => {
    const file = fileIn.files[0];
    fileIn.value = '';
    if (file) doImport(await file.text());
  } });
  const pasteIn = h('textarea', { id: 'hb-paste', rows: 4, 'aria-label': 'Paste spell JSON', placeholder: 'Or paste exported spell JSON here…', spellcheck: false });

  function doImport(textValue) {
    const { entries, errors } = parseSpellJson(textValue, BUILT_IN_SPELL_IDS);
    const merged = mergeSpellLists(custom, entries, BUILT_IN_SPELL_IDS);
    importMsg.replaceChildren(...errors.map((e) => h('li', {}, e)));
    if (merged.added) commit(merged.list);
    const note = `Imported ${merged.added} spell${merged.added === 1 ? '' : 's'}${merged.skipped ? `, skipped ${merged.skipped} duplicate${merged.skipped === 1 ? '' : 's'}` : ''}${errors.length ? `, ${errors.length} invalid` : ''}.`;
    toast(note);
    importMsg.append(h('li', { class: 'ok' }, note));
  }

  // ---------------------------------------------------------------- built-in spells: edit, reset
  const biSearch = h('input', { id: 'bi-search', type: 'search', placeholder: 'Search built-in spells…', 'aria-label': 'Search built-in spells', oninput: () => drawBuiltins() });
  const biLevel = h('select', { id: 'bi-level', 'aria-label': 'Filter by level', onchange: () => drawBuiltins() },
    h('option', { value: '' }, 'All levels'), Array.from({ length: 10 }, (_, i) => h('option', { value: String(i) }, levelLabel(i))));
  const biOnlyModified = h('input', { id: 'bi-mod', type: 'checkbox', onchange: () => drawBuiltins() });
  const biList = h('div', {});
  const biMsg = h('ul', { class: 'import-errors', 'aria-live': 'polite' });
  const biPaste = h('textarea', { id: 'bi-paste', rows: 3, 'aria-label': 'Paste exported spell edits', placeholder: 'Or paste exported edits JSON here…', spellcheck: false });

  async function resetOne(id) {
    const name = SPELL_BY_ID[id] ? SPELL_BY_ID[id].name : id;
    if (!(await confirmDialog('Reset spell', `Reset ${name} to the original version?`, 'Reset'))) return;
    const next = { ...overrides };
    delete next[id];
    overrides = next;
    saveSpellOverrides(overrides);
    syncSpellOverrides(overrides);
    if (editingBuiltIn === id) resetForm();
    toast(`${name} reset.`);
    drawBuiltins();
  }

  function drawBuiltins() {
    const q = biSearch.value.trim().toLowerCase();
    const lv = biLevel.value;
    const rows = SPELLS.filter((sp) => BUILT_IN_SPELL_IDS.has(sp.id) && (!q || sp.name.toLowerCase().includes(q)) && (lv === '' || sp.level === Number(lv)) && (!biOnlyModified.checked || sp.modified))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    const edits = Object.keys(overrides).length;
    const shown = rows.slice(0, 60);
    biList.replaceChildren(
      h('p', { class: 'hint', role: 'status' }, `${rows.length} spell${rows.length === 1 ? '' : 's'}${rows.length > shown.length ? ` (showing the first ${shown.length}, search to narrow down)` : ''} · ${edits} edited`),
      h('ul', { class: 'hb-builtins' }, shown.map((sp) => h('li', {},
        h('span', { class: 'bi-name' }, sp.name, ' ', h('small', { class: 'hint' }, `${levelLabel(sp.level)} · ${sp.school}`), sp.modified ? h('span', { class: 'tag custom-tag' }, 'Modified') : null),
        h('span', { class: 'row gap' },
          h('button', { type: 'button', class: 'btn small', 'aria-label': `Edit ${sp.name}`, onclick: () => fill(sp, true) }, 'Edit'),
          sp.modified ? h('button', { type: 'button', class: 'btn small danger', 'aria-label': `Reset ${sp.name} to the original`, onclick: () => resetOne(sp.id) }, 'Reset') : null)))));
  }

  function importEdits(textValue) {
    const { map, errors } = parseOverridesJson(textValue, BUILT_IN_SPELL_IDS);
    biMsg.replaceChildren(...errors.map((e) => h('li', {}, e)));
    const n = Object.keys(map).length;
    if (n) {
      overrides = { ...overrides, ...map };
      saveSpellOverrides(overrides);
      syncSpellOverrides(overrides);
      drawBuiltins();
    }
    const note = `Imported ${n} edited spell${n === 1 ? '' : 's'}.`;
    toast(note);
    biMsg.append(h('li', { class: 'ok' }, note));
  }
  const biFile = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, 'aria-label': 'Import spell edits JSON file', onchange: async () => {
    const file = biFile.files[0];
    biFile.value = '';
    if (file) importEdits(await file.text());
  } });

  function drawList() {
    listBox.replaceChildren(
      h('h2', {}, `Your custom spells (${custom.length})`),
      custom.length ? h('ul', { class: 'hb-list' }, custom.map((sp) => h('li', {},
        spellPreview(sp),
        h('div', { class: 'row gap' },
          h('button', { type: 'button', class: 'btn small', 'aria-label': `Edit ${sp.name}`, onclick: () => fill(sp) }, 'Edit'),
          h('button', { type: 'button', class: 'btn small danger', 'aria-label': `Delete ${sp.name}`, onclick: async () => {
            if (!(await confirmDialog('Delete spell', `Delete ${sp.name}? Characters that have it will no longer show it.`, 'Delete'))) return;
            if (editingId === sp.id) resetForm();
            commit(custom.filter((x) => x.id !== sp.id));
            toast(`${sp.name} deleted.`);
          } }, 'Delete')))))
        : h('p', { class: 'empty' }, 'No custom spells yet. Create one with the form.'),
      h('div', { class: 'row gap' },
        h('button', { type: 'button', class: 'btn', disabled: !custom.length, onclick: () => download('characterforge-custom-spells.json', exportSpellsJson(custom)) }, 'Export all to JSON'),
        h('button', { type: 'button', class: 'btn', onclick: () => fileIn.click() }, 'Import from JSON file'),
        h('button', { type: 'button', class: 'btn', onclick: () => { if (pasteIn.value.trim()) doImport(pasteIn.value); } }, 'Import pasted JSON')),
      fileIn, pasteIn, importMsg,
      h('p', { class: 'hint' }, `Built-in spells: ${SPELLS.filter((s) => !s.custom).length}. Importing merges with your list and skips spells you already have (same name, level and school).`));
  }

  root.replaceChildren(h('div', { class: 'page homebrew' },
    h('h1', {}, 'Homebrew'),
    h('p', { class: 'lead' }, 'Make your own spells. They appear in the character builder (for the classes you tick), on sheets as a Custom spell, and in the sheet\'s "Add a spell" list. Everything is stored in this browser; export to back it up or share.'),
    h('div', { class: 'hb-grid' },
      h('section', { 'aria-labelledby': 'hb-form-title' }, (formTitle.id = 'hb-form-title', formTitle), form),
      h('aside', {}, preview)),
    h('section', { class: 'hb-saved' }, listBox),
    h('section', { class: 'hb-builtin', 'aria-labelledby': 'hb-builtin-title' },
      h('h2', { id: 'hb-builtin-title' }, 'Edit existing spells'),
      h('p', { class: 'hint' }, 'Change any built-in spell (damage, range, classes, text…). Your version replaces the original everywhere in this browser, is marked "Modified", and can be reset at any time. Note: Magic Missile and a few special spells keep their built-in roll rules.'),
      h('div', { class: 'row gap hb-filters' },
        h('div', { class: 'field' }, h('label', { for: 'bi-search' }, 'Search'), biSearch),
        h('div', { class: 'field' }, h('label', { for: 'bi-level' }, 'Level'), biLevel),
        h('div', { class: 'field inline' }, biOnlyModified, h('label', { for: 'bi-mod' }, 'Only modified'))),
      biList,
      h('div', { class: 'row gap' },
        h('button', { type: 'button', class: 'btn', disabled: false, onclick: () => { if (!Object.keys(overrides).length) { toast('No edited spells yet.'); return; } download('characterforge-spell-edits.json', exportOverridesJson(overrides)); } }, 'Export my edits'),
        h('button', { type: 'button', class: 'btn', onclick: () => biFile.click() }, 'Import edits from file'),
        h('button', { type: 'button', class: 'btn', onclick: () => { if (biPaste.value.trim()) importEdits(biPaste.value); } }, 'Import pasted edits'),
        h('button', { type: 'button', class: 'btn danger', onclick: async () => {
          if (!Object.keys(overrides).length) { toast('Nothing to reset.'); return; }
          if (!(await confirmDialog('Reset all edits', 'Reset every edited built-in spell to its original?', 'Reset all'))) return;
          overrides = {};
          saveSpellOverrides(overrides);
          syncSpellOverrides(overrides);
          if (editingBuiltIn) resetForm();
          drawBuiltins();
          toast('All built-in spells reset.');
        } }, 'Reset all edits')),
      biFile, biPaste, biMsg)));
  refresh();
  drawList();
  drawBuiltins();
  const target = editParam && SPELL_BY_ID[editParam];
  if (target) fill(target, BUILT_IN_SPELL_IDS.has(target.id));
}
