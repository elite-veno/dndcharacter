# Character Forge

A static website that recreates the idea of a step-by-step character builder for the **2024 (5.5e) fifth edition rules**, followed by an interactive character sheet with built-in dice and a "How to Play" guide. Plain HTML, CSS and JavaScript (ES modules): no build step, no dependencies, no server code. Characters are stored in your browser (`localStorage`).

## Features

- **Builder**: Preferences, Class, Background, Species, Ability Scores (Standard Array, Manual/Rolled, Point Buy), Equipment, Details. Backgrounds grant +2/+1 or +1/+1/+1 and an Origin feat; species give no ability bonuses.
- **Sheet**: ability checks, saves, skills, attacks and damage with Weapon Mastery, spells and slots, hit points, death saves, rests, conditions, inventory and coins, level up with Ability Score Improvements, and sheet appearance (portrait, frame, backdrop, theme). A dice tray rolls d20s (Shift: Advantage, Ctrl/Alt: Disadvantage) and any dice expression.
- **Info**: how to play, from movement to armor class, attacks, saves, resting and spellcasting, with small calculators.
- **My Characters**: several characters, import/export as JSON, print-friendly sheet (Print button, or save as PDF).

## Run it

ES modules need an HTTP server (opening `index.html` via `file://` is blocked by browsers):

```
cd dndcharacter
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works.

## Tests

```
node js/dice.test.mjs
node js/rules.test.mjs
```

## Structure

```
index.html            app shell: header navigation, footer, module entry
css/style.css         theme, layout, builder, print rules
css/sheet.css         sheet, dice tray, appearance panel
css/info.css          Info page
js/main.js            hash router (#/, #/build, #/sheet[/id], #/info) and the characters list
js/store.js           localStorage persistence (characters, draft, last sheet)
js/transfer.js        JSON import/export
js/character.js       character model, derived stats, step validation
js/rules.js           pure rules maths (proficiency, modifiers, AC, spell slots, ...)
js/dice.js            dice parsing and rolling
js/builder.js, js/steps/   the builder wizard and its seven steps
js/sheet.js, js/sheet/     the interactive sheet and its panels
js/sheet-state.js     pure play-state logic (HP, rests, slots)
js/dicetray.js        dice tray UI
js/info*.js           the Info page
js/data/              classes, species, backgrounds, feats, spells, equipment (SRD 5.2)
data-src/             source data used to author the subclass data
```

## Rules sources

Rules content comes only from the **System Reference Document 5.2**, licensed under Creative Commons Attribution 4.0 (CC-BY-4.0). Background notes are in `dnd-regels-actueel.md` and `dndbeyond-character-creatie.md`.

## Limitations

- Only SRD 5.2 content is included (a subset of the classes, species, backgrounds and spells in the full books).
- Data lives in one browser's `localStorage`; use Export to back up or move characters.
- Portraits are downscaled and stored in the character, so very large collections can fill browser storage.
- Not a legal-grade rules engine: choices are validated, but table rulings remain yours.

## Attribution

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd, licensed under CC-BY-4.0 (https://creativecommons.org/licenses/by/4.0/legalcode). Character Forge is an unofficial fan project, not affiliated with or endorsed by Wizards of the Coast.

## Import (PDF to JSON)

The **Import** page reads a PDF in your browser (bundled pdf.js in `vendor/pdfjs`, Apache-2.0, nothing is uploaded), shows/downloads the extracted text as JSON, can draft a custom subclass from it, and installs subclass JSON into this browser (localStorage). Custom subclasses appear in the class step like built-in ones. Scanned PDFs (images only) have no text to extract.
