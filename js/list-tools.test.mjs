// Run with: node js/list-tools.test.mjs
import assert from 'node:assert/strict';
import {
  matchesQuery, characterSearchText, sortCharacters, relativeTime, cleanName, defaultSpellFilter, spellFilterActive,
  spellMatches, filterSpells, countText, parseInfoState, serializeInfoState, infoSectionLink,
} from './list-tools.js';

assert.ok(matchesQuery('Thorin Wizard Dwarf', 'wiz dwa'));
assert.ok(!matchesQuery('Thorin Wizard', 'rogue'));
assert.ok(matchesQuery('anything', '   '));
assert.equal(characterSearchText({ name: 'A' }, { cls: { name: 'Cleric' }, species: { name: 'Elf' } }), 'A Cleric Elf');
assert.equal(characterSearchText({ name: 'A' }, null), 'A');

const rows = [{ name: 'beta', level: 3, lastPlayed: 10 }, { name: 'Alpha', level: 5, lastPlayed: 5 }, { name: 'gamma', level: 3, lastPlayed: 20 }];
assert.deepEqual(sortCharacters(rows, 'recent').map((r) => r.name), ['gamma', 'beta', 'Alpha']);
assert.deepEqual(sortCharacters(rows, 'name').map((r) => r.name), ['Alpha', 'beta', 'gamma']);
assert.deepEqual(sortCharacters(rows, 'level').map((r) => r.name), ['Alpha', 'beta', 'gamma']);
assert.equal(rows[0].name, 'beta', 'input not mutated');

const now = Date.UTC(2026, 5, 20, 12);
assert.equal(relativeTime(now - 10_000, now), 'just now');
assert.equal(relativeTime(now - 5 * 60_000, now), '5 minutes ago');
assert.equal(relativeTime(now - 3 * 3600_000, now), '3 hours ago');
assert.equal(relativeTime(now - 24 * 3600_000, now), 'yesterday');
assert.equal(relativeTime(now - 4 * 86400_000, now), '4 days ago');
assert.equal(relativeTime(now - 40 * 86400_000, now), '2026-05-11');
assert.equal(relativeTime(0, now), '');
assert.equal(relativeTime(now + 5000, now), 'just now');

assert.equal(cleanName('  Bob   the  Bold '), 'Bob the Bold');
assert.equal(cleanName('   '), null);
assert.equal(cleanName(null), null);

const spells = [
  { name: 'Fire Bolt', level: 0, school: 'Evocation' },
  { name: 'Bless', level: 1, school: 'Enchantment', concentration: true },
  { name: 'Detect Magic', level: 1, school: 'Divination', concentration: true, ritual: true },
  { name: 'Frost Lance', level: 2, school: 'Evocation', custom: true },
];
const f = defaultSpellFilter();
assert.ok(!spellFilterActive(f));
assert.equal(filterSpells(spells, f).length, 4);
assert.deepEqual(filterSpells(spells, { ...f, q: 'bo' }).map((s) => s.name), ['Fire Bolt']);
assert.deepEqual(filterSpells(spells, { ...f, level: '1' }).map((s) => s.name), ['Bless', 'Detect Magic']);
assert.deepEqual(filterSpells(spells, { ...f, school: 'evocation' }).map((s) => s.name), ['Fire Bolt', 'Frost Lance']);
assert.deepEqual(filterSpells(spells, { ...f, flag: 'concentration' }).length, 2);
assert.deepEqual(filterSpells(spells, { ...f, flag: 'ritual' }).map((s) => s.name), ['Detect Magic']);
assert.deepEqual(filterSpells(spells, { ...f, customOnly: true }).map((s) => s.name), ['Frost Lance']);
assert.ok(!spellMatches(spells[0], { ...f, level: '0', flag: 'ritual' }));
assert.ok(spellFilterActive({ ...f, customOnly: true }));
assert.equal(countText(4, 4), '4 spells');
assert.equal(countText(1, 4), '1 of 4 spells');
assert.equal(countText(1, 1), '1 spell');

assert.deepEqual(parseInfoState(null), { q: '', closed: [] });
assert.deepEqual(parseInfoState('garbage'), { q: '', closed: [] });
assert.deepEqual(parseInfoState(serializeInfoState('cover', new Set(['a', 'b']))), { q: 'cover', closed: ['a', 'b'] });
assert.deepEqual(parseInfoState('{"q":5,"closed":[1,"x","x"]}'), { q: '', closed: ['x'] });
assert.equal(infoSectionLink('http://h/index.html#/info', 'skills'), 'http://h/index.html#/info/skills');

console.log('list-tools: all tests passed');
