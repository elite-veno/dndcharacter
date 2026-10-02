// Sheet appearance: portrait, frame, backdrop and theme, plus the "Change Sheet Appearance" panel.
// The chosen ids live in `character.sheet.appearance`; CSS (css/sheet.css) reads them as data attributes on the sheet root.

import { h, openModal, imageToDataUrl, toast } from '../ui.js';

export const FRAMES = [
  { id: 'none', name: 'None' },
  { id: 'gold', name: 'Gilded' },
  { id: 'silver', name: 'Silver' },
  { id: 'ember', name: 'Ember' },
  { id: 'verdant', name: 'Verdant' },
  { id: 'arcane', name: 'Arcane' },
];

export const BACKDROPS = [
  { id: 'none', name: 'Plain' },
  { id: 'dusk', name: 'Dusk' },
  { id: 'forest', name: 'Forest' },
  { id: 'cavern', name: 'Cavern' },
  { id: 'ocean', name: 'Ocean' },
  { id: 'ember', name: 'Embers' },
  { id: 'parchment', name: 'Parchment' },
];

export const THEMES = [
  { id: 'gold', name: 'Gold', swatch: '#d9a441' },
  { id: 'crimson', name: 'Crimson', swatch: '#cf3a50' },
  { id: 'emerald', name: 'Emerald', swatch: '#55b98a' },
  { id: 'azure', name: 'Azure', swatch: '#5aa9e6' },
  { id: 'violet', name: 'Violet', swatch: '#a98bf0' },
  { id: 'silver', name: 'Silver', swatch: '#c3c9d6' },
];

// Simple emblem portraits drawn as SVG (no external artwork). Symbols are 64x64 paths.
const SYMBOLS = {
  sword: '<path d="M32 8l5 5-1 24-4 4-4-4-1-24z" fill="#fff"/><path d="M20 38h24v4H20zM29 42h6v12h-6z" fill="#fff"/>',
  shield: '<path d="M32 9l18 6v14c0 12-8 20-18 26C22 49 14 41 14 29V15z" fill="#fff"/>',
  star: '<path d="M32 8l7 16 17 2-13 12 4 17-15-9-15 9 4-17L8 26l17-2z" fill="#fff"/>',
  flame: '<path d="M33 7c2 9 12 13 12 26 0 9-6 16-13 16s-13-6-13-14c0-6 4-10 7-14 0 5 3 7 5 7-2-7-1-14 2-21z" fill="#fff"/>',
  moon: '<path d="M40 10a22 22 0 1 0 14 38A18 18 0 0 1 40 10z" fill="#fff"/>',
  leaf: '<path d="M14 50C14 26 28 12 52 12c0 24-12 38-32 38z" fill="#fff"/><path d="M14 50l22-22" stroke="#00000055" stroke-width="3" fill="none"/>',
};

const PRESET_DEFS = [
  { id: 'sword', name: 'Blade', from: '#8a2233', to: '#2b0d14' },
  { id: 'shield', name: 'Bulwark', from: '#35577e', to: '#101c2e' },
  { id: 'star', name: 'Star', from: '#a07a2a', to: '#2a1e08' },
  { id: 'flame', name: 'Flame', from: '#c2582a', to: '#33120a' },
  { id: 'moon', name: 'Moon', from: '#5b4a9a', to: '#171232' },
  { id: 'leaf', name: 'Grove', from: '#3d8a5e', to: '#0f2a1b' },
];

/** Data URL for a preset emblem portrait. */
export function presetPortrait(id) {
  const def = PRESET_DEFS.find((p) => p.id === id);
  if (!def) return null;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${def.from}"/><stop offset="1" stop-color="${def.to}"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><g transform="translate(8 8) scale(.75)">${SYMBOLS[id]}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** The portrait to show: uploaded image, else a chosen preset, else null (the sheet draws a default emblem). */
export const portraitSrc = (c) => c.portrait || presetPortrait(c.sheet.appearance.presetPortrait);

const SECTIONS = [
  { id: 'portrait', title: 'Portrait' },
  { id: 'frame', title: 'Frame' },
  { id: 'backdrop', title: 'Backdrop' },
  { id: 'theme', title: 'Theme' },
];

/**
 * Open the appearance panel. `api` = { c, persist(), refresh() }:
 * persist() saves the character; refresh() re-renders the sheet behind the dialog.
 */
export function openAppearancePanel({ c, persist, refresh }, startSection = 'portrait') {
  let section = startSection;
  const body = h('div', { class: 'appearance' });
  const apply = (fn) => { fn(c.sheet.appearance); persist(); refresh(); draw(); };

  const option = ({ selected, label, onPick, preview }) => h('button', {
    type: 'button', class: `appearance-option${selected ? ' selected' : ''}`, 'aria-pressed': String(selected), onclick: onPick,
  }, preview, h('span', {}, label));

  function portraitSection() {
    const fileInput = h('input', {
      type: 'file', accept: 'image/*', class: 'visually-hidden', id: 'appearance-upload',
      onchange: async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const url = await imageToDataUrl(file);
          c.portrait = url;
          persist(); refresh(); draw();
        } catch (err) { toast(err.message); }
      },
    });
    return h('div', {},
      h('div', { class: 'appearance-grid' },
        PRESET_DEFS.map((p) => option({
          selected: !c.portrait && c.sheet.appearance.presetPortrait === p.id,
          label: p.name,
          preview: h('img', { src: presetPortrait(p.id), alt: '', class: 'preset-img' }),
          onPick: () => { c.portrait = null; apply((a) => { a.presetPortrait = p.id; }); },
        }))),
      h('div', { class: 'row gap' },
        fileInput,
        h('label', { for: 'appearance-upload', class: 'btn', tabindex: 0, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } } }, 'Upload your own image'),
        c.portrait || c.sheet.appearance.presetPortrait ? h('button', { type: 'button', class: 'btn', onclick: () => { c.portrait = null; apply((a) => { a.presetPortrait = null; }); } }, 'Remove portrait') : null),
      h('p', { class: 'hint' }, 'Uploaded images are resized and stored only in your browser.'));
  }

  const swatchSection = (list, key, previewFor) => h('div', { class: 'appearance-grid' },
    list.map((item) => option({
      selected: c.sheet.appearance[key] === item.id, label: item.name,
      preview: previewFor(item), onPick: () => apply((a) => { a[key] = item.id; }),
    })));

  function draw() {
    const nameId = 'appearance-name';
    body.replaceChildren(
      h('div', { class: 'field' },
        h('label', { for: nameId }, 'Character name'),
        h('input', { id: nameId, type: 'text', maxLength: 60, value: c.name, oninput: (e) => { c.name = e.target.value; persist(); } })),
      h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Appearance options' },
        SECTIONS.map((s) => h('button', {
          type: 'button', role: 'tab', class: `tab${section === s.id ? ' active' : ''}`, 'aria-selected': String(section === s.id),
          onclick: () => { section = s.id; draw(); },
        }, s.title))),
      section === 'portrait' ? portraitSection()
        : section === 'frame' ? swatchSection(FRAMES, 'frame', (f) => h('span', { class: 'preview frame-preview', dataset: { frame: f.id } }, h('span', { class: 'frame-inner' })))
          : section === 'backdrop' ? swatchSection(BACKDROPS, 'backdrop', (b) => h('span', { class: 'preview backdrop-preview', dataset: { backdrop: b.id } }))
            : swatchSection(THEMES, 'theme', (t) => h('span', { class: 'preview theme-preview', style: `background:${t.swatch}` })));
  }

  draw();
  openModal('Change Sheet Appearance', body, { wide: true, onClose: refresh });
}
