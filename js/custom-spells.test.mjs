// Run with: node js/custom-spells.test.mjs
import assert from 'node:assert/strict';
import {
  normalizeSpell, parseSpellJson, mergeSpellLists, mergeIntoSpellData, exportSpellsJson, normalizeSpellList,
  loadCustomSpells, saveCustomSpells, uniqueId, summarize, CUSTOM_SPELLS_KEY,
} from './custom-spells.js';
import { SPELLS, SPELL_BY_ID, spellsForClass, syncCustomSpells, BUILT_IN_SPELL_IDS } from './data/spells.js';
import { upcastDice } from './sheet-state.js';
import { normalizeSheet } from './sheet-state.js';

let groups = 0;
const group = (name, fn) => { fn(); groups++; };
const base = { name: 'Frost Lance', level: 2, school: 'evocation', classes: ['wizard', 'Sorcerer'], castingTime: '1 bonus action', description: 'A lance of ice. It hits hard.' };

group('normalizeSpell fills defaults and the built-in shape', () => {
  const r = normalizeSpell(base, BUILT_IN_SPELL_IDS);
  assert.ok(r.ok, JSON.stringify(r));
  const e = r.entry;
  assert.equal(e.id, 'frost-lance');
  assert.equal(e.school, 'Evocation');
  assert.deepEqual(e.classes, ['wizard', 'sorcerer']);
  assert.equal(e.custom, true);
  assert.equal(e.roll, null);
  assert.equal(e.range, 'Self');
  assert.equal(e.summary, 'A lance of ice. It hits hard.');
  for (const k of ['id', 'name', 'level', 'school', 'classes', 'concentration', 'ritual', 'castingTime', 'range', 'duration', 'summary', 'roll']) assert.ok(k in e, k);
  assert.deepEqual(Object.keys(SPELLS[0]).filter((k) => !(k in e)), []);
});

group('normalizeSpell validates fields', () => {
  assert.equal(normalizeSpell({}).ok, false);
  assert.equal(normalizeSpell({ ...base, level: 10 }).ok, false);
  assert.equal(normalizeSpell({ ...base, level: 1.5 }).ok, false);
  assert.equal(normalizeSpell({ ...base, school: 'Fire' }).ok, false);
  assert.equal(normalizeSpell({ ...base, classes: ['barbarian'] }).ok, false);
  assert.equal(normalizeSpell({ ...base, roll: { kind: 'attack', dice: 'lots' } }).ok, false);
  assert.equal(normalizeSpell({ ...base, roll: { kind: 'save', dice: '2d6', save: 'luck' } }).ok, false);
  assert.equal(normalizeSpell({ ...base, roll: { kind: 'zap', dice: '2d6' } }).ok, false);
  assert.equal(normalizeSpell({ ...base, upcast: 'x' }).ok, false);
  assert.equal(normalizeSpell(null).ok, false);
});

group('roll data matches what the sheet reads', () => {
  const a = normalizeSpell({ ...base, roll: { kind: 'attack', dice: '3D6', type: 'Cold' }, upcast: '1d6' }).entry;
  assert.deepEqual(a.roll, { kind: 'attack', save: null, dice: '3d6', type: 'cold' });
  assert.equal(upcastDice(a.roll.dice, a.upcast, 2, 4), '5d6');
  const s = normalizeSpell({ ...base, roll: { kind: 'save', dice: '2d8', save: 'CON', type: 'acid' } }).entry;
  assert.equal(s.roll.save, 'con');
  const hl = normalizeSpell({ ...base, roll: { kind: 'heal', dice: '1d8', type: 'ignored', save: 'dex' } }).entry;
  assert.deepEqual(hl.roll, { kind: 'heal', save: null, dice: '1d8', type: null });
});

group('ids are unique and never collide with built-ins', () => {
  assert.ok(SPELL_BY_ID.fireball);
  const r = normalizeSpell({ ...base, name: 'Fireball', id: 'fireball' }, BUILT_IN_SPELL_IDS);
  assert.equal(r.entry.id, 'fireball-2');
  assert.equal(uniqueId('Fireball', new Set(['fireball', 'fireball-2'])), 'fireball-3');
  const { entries } = normalizeSpellList([base, base, { ...base, name: 'Frost  Lance!' }], BUILT_IN_SPELL_IDS);
  assert.deepEqual(entries.map((x) => x.id), ['frost-lance', 'frost-lance-2', 'frost-lance-3']);
  assert.equal(normalizeSpell({ ...base, id: 'frost-lance' }, new Set(['frost-lance'])).entry.id, 'frost-lance-2');
});

group('summarize shortens long text on a sentence', () => {
  assert.equal(summarize('Short.'), 'Short.');
  const long = `${'Word '.repeat(30)}end. ${'More '.repeat(40)}`;
  assert.ok(summarize(long).length <= 221);
});

group('merge into SPELLS and SPELL_BY_ID, class lists follow', () => {
  const before = SPELLS.length;
  const e = normalizeSpell({ ...base, name: 'Zzz Homebrew', classes: ['druid'], level: 3 }, BUILT_IN_SPELL_IDS).entry;
  mergeIntoSpellData(SPELLS, SPELL_BY_ID, [e, { ...e, name: 'Other' }]); // second has the same id: skipped
  assert.equal(SPELLS.length, before + 1);
  assert.equal(SPELL_BY_ID['zzz-homebrew'], e);
  assert.ok(spellsForClass('druid', 3).some((s) => s.id === 'zzz-homebrew'));
  assert.ok(!spellsForClass('wizard').some((s) => s.id === 'zzz-homebrew'));
  syncCustomSpells([]);
  assert.equal(SPELLS.length, before);
  assert.equal(SPELL_BY_ID['zzz-homebrew'], undefined);
  syncCustomSpells([e]);
  assert.equal(SPELL_BY_ID['zzz-homebrew'].custom, true);
  syncCustomSpells([]);
});

group('export / import round trip is lossless and duplicate-safe', () => {
  const list = normalizeSpellList([
    { ...base, roll: { kind: 'save', dice: '2d6', save: 'dex', type: 'cold' }, upcast: '1d6', components: { v: true, s: false, m: true }, material: 'ice', higher: 'More ice.', concentration: true },
    { name: 'Calm Breeze', level: 0, school: 'Transmutation', classes: [], ritual: true },
  ], BUILT_IN_SPELL_IDS).entries;
  const json = exportSpellsJson(list);
  const back = parseSpellJson(json, BUILT_IN_SPELL_IDS);
  assert.deepEqual(back.errors, []);
  assert.deepEqual(back.entries, list);
  // Importing into an empty list adds all; importing again adds none.
  const first = mergeSpellLists([], back.entries, BUILT_IN_SPELL_IDS);
  assert.equal(first.added, 2);
  const second = mergeSpellLists(first.list, back.entries, BUILT_IN_SPELL_IDS);
  assert.equal(second.added, 0);
  assert.equal(second.skipped, 2);
  assert.equal(second.list.length, 2);
  // Same id but a different spell gets a fresh id instead of overwriting.
  const clash = mergeSpellLists(first.list, [{ ...base, name: 'Other', id: 'frost-lance' }], BUILT_IN_SPELL_IDS);
  assert.equal(clash.added, 1);
  assert.deepEqual(clash.list.map((s) => s.id), ['frost-lance', 'calm-breeze', 'frost-lance-2']);
  // Bare arrays, single objects and errors.
  assert.equal(parseSpellJson(JSON.stringify(list)).entries.length, 2);
  assert.equal(parseSpellJson(JSON.stringify(list[0])).entries.length, 1);
  assert.equal(parseSpellJson('{nope').errors.length, 1);
  assert.equal(parseSpellJson(JSON.stringify([base, { name: 'X' }])).errors.length, 1);
});

group('storage load re-validates and survives bad data', () => {
  const store = {};
  globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
  assert.deepEqual(loadCustomSpells(BUILT_IN_SPELL_IDS), []);
  const e = normalizeSpell(base, BUILT_IN_SPELL_IDS).entry;
  assert.equal(saveCustomSpells([e, { name: 'broken', level: 99 }, { ...e, name: 'Fireball', id: 'fireball' }]), true);
  const loaded = loadCustomSpells(BUILT_IN_SPELL_IDS);
  assert.deepEqual(loaded.map((s) => s.id), ['frost-lance', 'fireball-2']);
  store[CUSTOM_SPELLS_KEY] = 'not json';
  assert.deepEqual(loadCustomSpells(BUILT_IN_SPELL_IDS), []);
  delete globalThis.localStorage;
  assert.equal(saveCustomSpells([]), false);
});

group('sheet state keeps extra spells and old saves still load', () => {
  assert.deepEqual(normalizeSheet({}).extraSpells, []);
  assert.deepEqual(normalizeSheet({ extraSpells: ['a', 'a', 5, '', 'b'] }).extraSpells, ['a', 'b']);
  assert.deepEqual(normalizeSheet(undefined).extraSpells, []);
});

console.log(`${groups} test groups passed`);
