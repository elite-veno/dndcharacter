// Run with: node js/ddb-import.test.mjs  (fixture mimics the unofficial D&D Beyond v5 character JSON layout)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ddbToCharacter, parseDdbId, ddbApiUrl } from './ddb-import.js';
import { deriveCharacter } from './character.js';

let groups = 0;
const group = (name, fn) => { fn(); groups++; };

const fixture = JSON.parse(readFileSync(new URL('./ddb-sample.json', import.meta.url), 'utf8'));

group('maps a fighter end to end', () => {
  const { character: c, warnings, summary } = ddbToCharacter(fixture);
  assert.equal(c.name, 'Thessa Brightblade');
  assert.equal(c.classId, 'fighter'); assert.equal(c.level, 5);
  assert.equal(c.speciesId, 'dwarf'); assert.equal(c.backgroundId, 'soldier');
  assert.ok(c.subclassId && /champion/.test(c.subclassId));
  assert.deepEqual(c.manual, { str: 16, dex: 13, con: 16, int: 8, wis: 12, cha: 10 });
  assert.ok(c.classSkills.includes('athletics') && c.classSkills.includes('intimidation') && !c.classSkills.includes('strength-saving-throws'));
  assert.deepEqual(c.languages, ['Dwarvish']);
  assert.ok(c.equipment.items.find((i) => i.id === 'chain-mail' && i.equipped));
  assert.ok(c.equipment.items.find((i) => i.id === 'shield' && i.equipped));
  assert.ok(warnings.some((w) => /Vorpal Spoon/.test(w)));
  assert.equal(c.details.alignment, 'Lawful Good');
  assert.equal(c.details.backstory, 'Served in the war.');
  assert.match(summary, /Fighter 5/);
  const d = deriveCharacter(c);   // must derive without throwing
  assert.equal(d.scores.str, 16); assert.ok(d.ac.ac >= 18);
});

group('accepts the inner data object and warns about multiclass and unknown species', () => {
  const inner = JSON.parse(JSON.stringify(fixture.data));
  inner.race = { fullName: 'Half-Elf' };
  inner.classes.push({ level: 2, definition: { name: 'Wizard' } });
  const { character, warnings } = ddbToCharacter(inner);
  assert.equal(character.speciesId, null);
  assert.ok(warnings.some((w) => /Multiclass/.test(w)) && warnings.some((w) => /Half-Elf/.test(w)));
});

group('maps spells for a wizard and rejects non-characters', () => {
  const inner = JSON.parse(JSON.stringify(fixture.data));
  inner.classes = [{ level: 3, definition: { name: 'Wizard' }, subclassDefinition: { name: 'School of Evocation' } }];
  inner.classSpells = [{ spells: [{ prepared: true, definition: { name: 'Magic Missile', level: 1 } }, { prepared: false, definition: { name: 'Shield', level: 1 } }, { definition: { name: 'Fire Bolt', level: 0 } }, { definition: { name: 'Nonexistent Spell', level: 2 } }] }];
  const { character: c, warnings } = ddbToCharacter(inner);
  assert.ok(c.cantrips.includes('fire-bolt'));
  assert.deepEqual(c.spellbook.sort(), ['magic-missile', 'shield']);
  assert.deepEqual(c.spells, ['magic-missile']);
  assert.equal(c.subclassId, 'school-of-evocation');
  assert.ok(warnings.some((w) => /Nonexistent Spell/.test(w)));
  assert.throws(() => ddbToCharacter({ hello: 'world' }), /does not look like/);
});

group('parses ids and urls', () => {
  assert.equal(parseDdbId('https://www.dndbeyond.com/characters/12345678'), '12345678');
  assert.equal(parseDdbId('https://www.dndbeyond.com/profile/someone/characters/98765432'), '98765432');
  assert.equal(parseDdbId('12345678'), '12345678');
  assert.equal(parseDdbId('abc'), null);
  assert.match(ddbApiUrl('1234567'), /character-service\.dndbeyond\.com\/character\/v5\/character\/1234567/);
});

console.log(`${groups} test groups passed`);
