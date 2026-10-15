// A small reusable form dialog for the sheet's add/edit flows (trackers, features, items, attacks).

import { h, openModal } from '../ui.js';

let formCounter = 0;

/**
 * Open a modal form.
 *   fields   [{ name, label, type: 'text'|'number'|'textarea'|'select'|'checkbox', options?, min?, max?, step?,
 *             maxLength?, placeholder?, hint?, suggestions?, half? }]
 *   values   initial values by field name
 *   validate (values) -> { ok: true, value } | { ok: false, errors: { field: message } }
 *   onSave   (value) called with the validated value; the dialog then closes
 * Errors show next to the field (role="alert") and the first invalid field gets focus.
 */
export function openFormModal({ title, fields, values = {}, validate, onSave, submitLabel = 'Save' }) {
  const uid = `form${++formCounter}`;
  const idOf = (f) => `${uid}-${f.name}`;
  const errorBoxes = {};

  const read = (form) => {
    const out = {};
    for (const f of fields) {
      const el = form.elements[f.name];
      out[f.name] = f.type === 'checkbox' ? el.checked : el.value;
    }
    return out;
  };

  const control = (f) => {
    const id = idOf(f);
    const common = { id, name: f.name, 'aria-describedby': `${id}-err${f.hint ? ` ${id}-hint` : ''}` };
    const v = values[f.name];
    if (f.type === 'textarea') return h('textarea', { ...common, rows: 5, maxLength: f.maxLength, placeholder: f.placeholder }, v ?? '');
    if (f.type === 'select') {
      return h('select', common, f.options.map((o) => h('option', { value: o.value, selected: o.value === (v ?? f.options[0].value) }, o.label)));
    }
    if (f.type === 'checkbox') return h('input', { ...common, type: 'checkbox', checked: !!v });
    return h('input', {
      ...common, type: f.type === 'number' ? 'number' : 'text', value: v ?? '', min: f.min, max: f.max, step: f.step, maxLength: f.maxLength,
      placeholder: f.placeholder, autocomplete: 'off', inputmode: f.inputmode, list: f.suggestions ? `${id}-list` : undefined,
    });
  };

  const rows = fields.map((f) => {
    const err = h('p', { class: 'form-error', id: `${idOf(f)}-err`, role: 'alert', hidden: true });
    errorBoxes[f.name] = err;
    if (f.type === 'checkbox') {
      return h('div', { class: 'field' },
        h('label', { class: 'inline-check', for: idOf(f) }, control(f), f.label),
        f.hint ? h('p', { class: 'hint', id: `${idOf(f)}-hint` }, f.hint) : null, err);
    }
    return h('div', { class: `field${f.half ? ' half' : ''}` },
      h('label', { for: idOf(f) }, f.label),
      control(f),
      f.suggestions ? h('datalist', { id: `${idOf(f)}-list` }, f.suggestions.map((o) => h('option', { value: o }))) : null,
      f.hint ? h('p', { class: 'hint', id: `${idOf(f)}-hint` }, f.hint) : null, err);
  });

  const form = h('form', {
    class: 'sheet-form', novalidate: true,
    onsubmit: (e) => {
      e.preventDefault();
      const res = validate(read(form));
      let firstBad = null;
      for (const f of fields) {
        const box = errorBoxes[f.name];
        const msg = res.ok ? null : res.errors[f.name];
        box.hidden = !msg;
        box.textContent = msg || '';
        const el = form.elements[f.name];
        if (msg) { el.setAttribute('aria-invalid', 'true'); firstBad = firstBad || el; } else el.removeAttribute('aria-invalid');
      }
      if (!res.ok) { firstBad?.focus(); return; }
      modal.close();
      onSave(res.value);
    },
  },
  h('div', { class: 'form-grid-2' }, rows),
  h('div', { class: 'row end gap' },
    h('button', { type: 'button', class: 'btn', onclick: () => modal.close() }, 'Cancel'),
    h('button', { type: 'submit', class: 'btn primary' }, submitLabel)));

  const modal = openModal(title, form);
  form.elements[fields[0].name]?.focus();
  return modal;
}
