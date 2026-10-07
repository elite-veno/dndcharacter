// Run with: node js/import.test.mjs
import assert from 'node:assert/strict';
import { groupLines, draftSubclass } from './pdf-import.js';
import { normalizeSubclass, parseSubclassJson, slugify, loadCustomSubclasses, saveCustomSubclasses } from './custom-content.js';

let groups = 0;
const group = (name, fn) => { fn(); groups++; };

group('groupLines joins items on a baseline and orders top to bottom', () => {
  const it = (str, x, y, h = 10) => ({ str, transform: [h, 0, 0, h, x, y], height: h });
  const lines = groupLines([it('world', 60, 700), it('Hello', 10, 700), it('Second line', 10, 680), it(' ', 5, 650)]);
  assert.deepEqual(lines.map((l) => l.text), ['Hello world', 'Second line']);
});

group('draftSubclass finds name, levels and features', () => {
  const L = (text, size = 10, page = 1) => ({ text, size });
  const extracted = { source: { title: '' }, pages: [{ page: 1, lines: [
    ['Path of the Test', 24], ['A short test subclass for fighters.', 10],
    ['3rd-level Test feature', 12], ['Battle Cry', 14], ['You shout and allies gain a bonus.', 10],
    ['7th-level Test feature', 12], ['Second Wind Again', 14], ['You recover some hit points.', 10],
  ] }] };
  const d = draftSubclass(extracted, { classId: 'fighter' });
  assert.equal(d.name, 'Path of the Test');
  assert.equal(draftSubclass({ ...extracted, source: { title: 'about:blank', fileName: 'my-homebrew_pack.pdf' } }).source, 'my homebrew pack');
  assert.deepEqual(d.features.map((f) => [f.level, f.name]), [[3, 'Battle Cry'], [7, 'Second Wind Again']]);
  assert.match(d.features[0].desc, /allies gain/);
  const n = normalizeSubclass(d);
  assert.ok(n.ok, JSON.stringify(n));
});

group('normalizeSubclass validates and makes unique ids', () => {
  assert.equal(normalizeSubclass({ name: 'X', classId: 'dragon', features: [] }).ok, false);
  const r = normalizeSubclass({ name: 'Path of Fire!', classId: 'Barbarian', features: [{ level: 3, name: 'Burn', summary: 'Hot.' }, { level: 99, name: 'Bad' }] }, new Set(['path-of-fire']));
  assert.ok(r.ok);
  assert.equal(r.entry.id, 'path-of-fire-2');
  assert.equal(r.entry.features.length, 1);
  assert.equal(r.entry.features[0].desc, 'Hot.');
  assert.equal(r.entry.label, 'Primal Path');
});

group('parseSubclassJson accepts arrays, objects and wrappers, and reports errors', () => {
  const one = { name: 'A', classId: 'bard', features: [{ level: 3, name: 'F', desc: 'd' }] };
  assert.equal(parseSubclassJson(JSON.stringify(one)).entries.length, 1);
  assert.equal(parseSubclassJson(JSON.stringify([one, one])).entries.length, 2);
  assert.equal(parseSubclassJson(JSON.stringify({ subclasses: [one] })).entries.length, 1);
  assert.equal(parseSubclassJson('{nope').errors.length, 1);
  assert.equal(parseSubclassJson(JSON.stringify([one, { name: 'B' }])).errors.length, 1);
});

group('custom storage round-trips (no localStorage in node: safe no-op)', () => {
  assert.equal(slugify("Hero's Path"), 'heros-path');
  assert.deepEqual(loadCustomSubclasses(), []);
  assert.equal(saveCustomSubclasses([]), false);
});

console.log(`${groups} test groups passed`);
