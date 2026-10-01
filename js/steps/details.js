// Step 7: details (appearance, personality, alignment, backstory, portrait upload).

import { h, imageToDataUrl, toast } from '../ui.js';
import { ALIGNMENTS } from '../data/index.js';
import { field, select, sectionTitle, nextId } from './shared.js';

const APPEARANCE = [
  ['gender', 'Gender / pronouns'], ['age', 'Age'], ['height', 'Height'], ['weight', 'Weight'], ['eyes', 'Eyes'], ['hair', 'Hair'], ['skin', 'Skin'], ['faith', 'Faith'],
];
const PERSONALITY = [
  ['traits', 'Personality traits'], ['ideals', 'Ideals'], ['bonds', 'Bonds'], ['flaws', 'Flaws'],
];

export default {
  id: 'details',
  title: 'Details',
  blurb: 'Appearance, personality and story.',
  render(ctx) {
    const { c } = ctx;
    const setDetail = (key, value) => ctx.update((x) => { x.details[key] = value; }, { rerender: false });
    const text = (key, label) => {
      const id = nextId(`d-${key}`);
      return field(label, h('input', { id, type: 'text', maxLength: 60, value: c.details[key], oninput: (e) => setDetail(key, e.target.value) }), null, id);
    };
    const area = (key, label, rows = 3) => {
      const id = nextId(`d-${key}`);
      return field(label, h('textarea', { id, rows, maxLength: 2000, oninput: (e) => setDetail(key, e.target.value) }, c.details[key]), null, id);
    };

    return h('section', { class: 'step-panel' },
      h('h2', {}, 'Character Details'),
      h('p', { class: 'lead' }, 'Everything here is optional, but it brings your character to life. You can edit it later on the character sheet.'),
      h('div', { class: 'details-top' },
        portraitBox(ctx),
        h('div', { class: 'form-grid' },
          field('Alignment', select({ id: 'd-alignment', value: c.details.alignment || null, placeholder: 'Choose an alignment', options: ALIGNMENTS.map((a) => ({ value: a, label: a })), onChange: (v) => setDetail('alignment', v || '') })),
          APPEARANCE.map(([k, l]) => text(k, l)))),
      sectionTitle('Personality'),
      h('div', { class: 'form-grid' }, PERSONALITY.map(([k, l]) => area(k, l, 3))),
      sectionTitle('Story'),
      area('appearance', 'Appearance notes', 3),
      area('backstory', 'Backstory', 7));
  },
};

function portraitBox(ctx) {
  const { c } = ctx;
  const fileId = 'portrait-file';
  const input = h('input', {
    id: fileId, type: 'file', accept: 'image/*', class: 'visually-hidden',
    onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const url = await imageToDataUrl(file);
        ctx.update((x) => { x.portrait = url; });
      } catch (err) { toast(err.message); }
    },
  });
  return h('div', { class: 'portrait-box' },
    h('div', { class: 'portrait-frame' }, c.portrait ? h('img', { src: c.portrait, alt: 'Character portrait preview' }) : h('span', { class: 'portrait-empty', 'aria-hidden': 'true' }, '⚔')),
    input,
    h('label', { for: fileId, class: 'btn', tabindex: 0, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } } }, c.portrait ? 'Change portrait' : 'Upload portrait'),
    c.portrait ? h('button', { type: 'button', class: 'btn small', onclick: () => ctx.update((x) => { x.portrait = null; }) }, 'Remove') : null,
    h('p', { class: 'hint' }, 'Images are resized and stored only in your browser.'));
}
