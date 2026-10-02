// Tiny DOM helpers shared by every view. No framework, no dependencies.

/**
 * Create an element. attrs: `class`, `dataset`, `on<Event>` handlers, boolean props (disabled, checked, ...),
 * `html` (trusted static markup only) or any other attribute. Children may be nodes, strings, numbers or arrays.
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'html') el.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in el && typeof value !== 'string') el[key] = value;
    else if (key === 'value' || key === 'checked' || key === 'selected' || key === 'disabled') el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** Replace all children of `el`. */
export function mount(el, ...children) {
  el.replaceChildren();
  append(el, children);
  return el;
}

let toastTimer;
/** Show a short, polite status message (aria-live region defined in index.html). */
export function toast(message) {
  const region = document.getElementById('toast');
  if (!region) return;
  region.textContent = message;
  region.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => region.classList.remove('show'), 3200);
}

/**
 * Open a modal built on <dialog>. `content` is a node; returns { close }.
 * Closes on Escape (native), the close button, or a backdrop click.
 */
export function openModal(title, content, { wide = false, onClose = null } = {}) {
  const dialog = h('dialog', { class: `modal${wide ? ' wide' : ''}`, 'aria-label': title });
  const close = () => { if (dialog.open) dialog.close(); dialog.remove(); };
  dialog.append(
    h('header', { class: 'modal-head' },
      h('h2', {}, title),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: close }, '×')),
    h('div', { class: 'modal-body' }, content),
  );
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener('close', () => { dialog.remove(); if (onClose) onClose(); });
  document.body.append(dialog);
  dialog.showModal();
  return { close };
}

/** Confirm dialog resolving to true/false (false when dismissed). */
export function confirmDialog(title, message, confirmLabel = 'Confirm') {
  return new Promise((resolve) => {
    let modal;
    const finish = (value) => { resolve(value); modal.close(); };
    const body = h('div', {},
      h('p', {}, message),
      h('div', { class: 'row end' },
        h('button', { class: 'btn', type: 'button', onclick: () => finish(false) }, 'Cancel'),
        h('button', { class: 'btn danger', type: 'button', onclick: () => finish(true) }, confirmLabel)));
    modal = openModal(title, body, { onClose: () => resolve(false) });
  });
}

/** Escape a string for safe use inside a regex. */
export const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Capitalise the first letter. */
export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Unique-ish id for characters. */
export const uid = () => `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Read an image File, scale it to fit `max` px and return a JPEG/PNG data URL (keeps localStorage small). */
export function imageToDataUrl(file, max = 360) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
