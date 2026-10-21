// Battle map page (#/map and #/map/<id>): upload a .png/.jpg, put tokens on it (your character, enemies, allies,
// custom markers), drag them around a grid, track HP, conditions and initiative. Saved in IndexedDB.

import { h, toast, confirmDialog, openModal } from './ui.js';
import { field, nextId } from './steps/shared.js';
import { CONDITIONS } from './data/index.js';
import { listCharacters, getCharacter, saveCharacter } from './store.js';
import { deriveCharacter } from './character.js';
import { normalizeSheet, currentHp, applyDamage, applyHealing, grantTempHp } from './sheet-state.js';
import { rollDie } from './dice.js';
import { isTypingTarget } from './history.js';
import {
  TOKEN_KINDS, TOKEN_SIZES, newEncounter, normalizeToken, damageToken, healToken, hpState, snapToGrid, distanceFeet,
  initiativeOrder, stepTurn, duplicateToken, initials, normalizeGrid, normalizeLink, rectFromPoints, viewForRect, newEncounter as makeEncounter,
} from './map-logic.js';
import {
  listEncounters, getEncounter, saveEncounter, deleteEncounter, putImage, getImageBlob, prepareImage,
  exportEncounterJson, importEncounterJson, loadPresets, savePresets,
} from './map-store.js';
import { memberMayMove, memberMayEditHp, memberPermissions } from './map-logic.js';
import { focusController } from './map-focus.js';
import { listParties, createParty } from './party.js';
import { liveSession, subscribe, startLive, stopLive, setLiveSettings, attachEditor, detachEditor, pushState, pushMoving, joinLink } from './live-host.js';

const go = (path) => { location.hash = `#${path}`; };
const ZOOM_KEY = 'characterforge.map.zoomIn';
const fmtSigned = (n) => (n >= 0 ? `+${n}` : `${n}`);
const CONDITION_NAME = Object.fromEntries(CONDITIONS.map((c) => [c.id, c.name]));

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function renderMap(root, id) {
  return id ? renderEditor(root, id) : renderList(root);
}

/** Mark one map as the main (world) map; all others lose the flag. */
async function setMainMap(id) {
  const maps = await listEncounters();
  await Promise.all(maps.filter((m) => m.isMain !== (m.id === id)).map((m) => saveEncounter({ ...m, isMain: m.id === id })));
  toast('Main map set.');
}

// ================================================================ list of maps

function renderList(root) {
  const urls = [];
  const status = h('p', { class: 'hint', role: 'status' });
  const nameIn = h('input', { id: 'map-name', type: 'text', maxlength: 80, placeholder: 'e.g. Goblin cave' });
  const fileIn = h('input', { id: 'map-file', type: 'file', accept: 'image/png,image/jpeg,.png,.jpg,.jpeg' });
  const listBox = h('div', { class: 'map-list' }, h('p', { class: 'hint' }, 'Loading maps…'));

  async function create() {
    const file = fileIn.files && fileIn.files[0];
    if (!file) { status.textContent = 'Choose a .png or .jpg image first.'; return; }
    status.textContent = 'Saving the map…';
    try {
      const img = await prepareImage(file);
      const imageId = await putImage(img.blob);
      const enc = newEncounter({ name: nameIn.value.trim() || file.name.replace(/\.(png|jpe?g)$/i, ''), imageId, width: img.width, height: img.height });
      await saveEncounter(enc);
      go(`/map/${enc.id}`);
    } catch (err) {
      status.textContent = err.message || String(err);
    }
  }

  const importIn = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, 'aria-label': 'Import a battle map file', onchange: async () => {
    const file = importIn.files[0];
    importIn.value = '';
    if (!file) return;
    try { const enc = await importEncounterJson(await file.text()); toast(`Imported ${enc.name}.`); go(`/map/${enc.id}`); } catch (err) { toast(err.message); }
  } });

  async function drawList() {
    let maps;
    try { maps = await listEncounters(); } catch (err) { listBox.replaceChildren(h('p', { class: 'notice warn' }, err.message)); return; }
    if (!maps.length) { listBox.replaceChildren(h('p', { class: 'empty' }, 'No maps yet. Upload an image to start.')); return; }
    maps.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
    const nameOf = Object.fromEntries(maps.map((m) => [m.id, m.name]));
    const cards = await Promise.all(maps.map(async (m) => {
      const blob = await getImageBlob(m.imageId).catch(() => null);
      const url = blob ? URL.createObjectURL(blob) : null;
      if (url) urls.push(url);
      return h('li', { class: 'map-card' },
        h('a', { href: `#/map/${m.id}`, class: 'map-thumb', 'aria-label': `Open ${m.name}` }, url ? h('img', { src: url, alt: '' }) : h('span', {}, 'No image')),
        h('div', { class: 'map-card-body' },
          h('h3', {}, m.isMain ? h('span', { class: 'tag custom-tag' }, '★ Main map') : null, ' ', m.name),
          h('p', { class: 'hint' }, `${m.tokens.length} token${m.tokens.length === 1 ? '' : 's'} · ${m.links.length} linked area${m.links.length === 1 ? '' : 's'}${m.parentId && nameOf[m.parentId] ? ` · inside ${nameOf[m.parentId]}` : ''} · ${new Date(m.updatedAt).toLocaleDateString()}`),
          h('div', { class: 'row gap' },
            h('a', { class: 'btn primary small', href: `#/map/${m.id}` }, 'Open'),
            m.isMain ? null : h('button', { type: 'button', class: 'btn small', onclick: async () => { await setMainMap(m.id); drawList(); } }, 'Set as main map'),
            h('button', { type: 'button', class: 'btn small', onclick: async () => {
              const name = window.prompt('New name for this map:', m.name);
              if (name && name.trim()) { await saveEncounter({ ...m, name: name.trim().slice(0, 80) }); drawList(); }
            } }, 'Rename'),
            h('button', { type: 'button', class: 'btn small', onclick: async () => download(`${m.name.replace(/[^\w-]+/g, '-').toLowerCase() || 'map'}.json`, await exportEncounterJson(m)) }, 'Export'),
            h('button', { type: 'button', class: 'btn small danger', 'aria-label': `Delete ${m.name}`, onclick: async () => {
              if (!(await confirmDialog('Delete map', `Delete ${m.name} and its tokens? This cannot be undone.`, 'Delete'))) return;
              await deleteEncounter(m);
              toast('Map deleted.');
              drawList();
            } }, 'Delete'))));
    }));
    listBox.replaceChildren(h('ul', { class: 'map-cards' }, cards));
  }

  root.append(h('div', { class: 'page map-page' },
    h('h1', {}, 'Battle maps'),
    h('p', { class: 'lead' }, 'Upload a map image, mark where your character is, and track the enemies you are fighting: hit points, AC, conditions and initiative. Make a world map your main map and link areas on it (an island, a town, a dungeon) to their own maps: click the area to zoom in. Maps are saved in this browser.'),
    h('section', { class: 'panel map-new' },
      h('h2', {}, 'New map'),
      h('div', { class: 'row gap map-new-row' },
        field('Map name', nameIn),
        field('Image (.png or .jpg)', fileIn)),
      h('div', { class: 'row gap' },
        h('button', { type: 'button', class: 'btn cta', onclick: create }, 'Create map'),
        h('button', { type: 'button', class: 'btn', onclick: () => importIn.click() }, 'Import a map file'),
        importIn),
      status),
    h('section', {}, h('h2', {}, 'Your maps'), listBox)));
  drawList();
  return () => urls.forEach((u) => URL.revokeObjectURL(u));
}

// ================================================================ editor

function renderEditor(root, id) {
  let enc = null;
  let imgUrl = null;
  let selectedId = null;
  let saveTimer = null;
  const view = { scale: 1, x: 0, y: 0 };
  const pointers = new Map();
  let gesture = null; // { type: 'drag'|'pan'|'pinch'|'link'|'rect', ... }
  let mode = 'normal'; // 'link' while drawing a new linked area
  let mapsById = {}; // other maps, for link targets and the parent button

  const viewport = h('div', { class: 'map-viewport', tabindex: 0, 'aria-label': 'Battle map. Drag tokens to move them; drag the background to pan; scroll or use the zoom buttons to zoom; double-click to add a token.' });
  const stage = h('div', { class: 'map-stage' });
  const img = h('img', { class: 'map-image', alt: '', draggable: false });
  const gridEl = h('div', { class: 'map-grid', 'aria-hidden': 'true' });
  const tokenLayer = h('div', { class: 'map-tokens' });
  const linkLayer = h('div', { class: 'map-links' });
  const rectPreview = h('div', { class: 'map-link drawing', hidden: true });
  const measure = h('div', { class: 'map-measure', hidden: true, 'aria-live': 'polite' });
  stage.append(img, gridEl, linkLayer, rectPreview, tokenLayer, measure);
  viewport.append(stage);
  const side = h('aside', { class: 'map-side' });
  const toolbar = h('div', { class: 'map-toolbar' });
  const page = h('div', { class: 'page map-editor' }, toolbar, h('div', { class: 'map-body' }, viewport, side));
  root.append(page);
  const focus = focusController(page, { onChange: () => { if (enc) { drawToolbar(); requestAnimationFrame(fit); } } });

  // ---------------------------------------------------------------- persistence
  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveEncounter(enc).catch((err) => toast(`Could not save the map: ${err.message}`)); }, 250);
  };
  const flush = () => { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; saveEncounter(enc).catch(() => {}); } };
  const commit = (fn, { panel = true } = {}) => { fn(); scheduleSave(); drawTokens(); if (panel) drawSide(); drawToolbarTurn(); pushState(); };
  const tokenById = (tid) => enc.tokens.find((t) => t.id === tid) || null;
  const replaceToken = (next) => { enc.tokens = enc.tokens.map((t) => (t.id === next.id ? next : t)); };

  // ---------------------------------------------------------------- linked characters (HP lives on the character sheet)
  function linked(token) {
    if (!token.characterId) return null;
    const c = getCharacter(token.characterId);
    if (!c) return null;
    const d = deriveCharacter(c);
    c.sheet = normalizeSheet(c.sheet, { gold: d.gold });
    return { c, d, max: d.hp, hp: c.sheet.hp };
  }
  /** HP shown for a token: from the character sheet when linked, otherwise the token's own. */
  function hpOf(token) {
    const l = linked(token);
    if (l) return { max: l.max, current: currentHp(l.hp, l.max), temp: l.hp.temp || 0 };
    return token.hp;
  }
  const acOf = (token) => { const l = linked(token); return l ? l.d.ac.ac : token.ac; };

  function changeHp(token, amount, mode) {
    const l = linked(token);
    if (l) {
      if (mode === 'damage') l.c.sheet.hp = applyDamage(l.c.sheet.hp, amount, l.max).hp;
      else if (mode === 'heal') l.c.sheet.hp = applyHealing(l.c.sheet.hp, amount, l.max);
      else l.c.sheet.hp = grantTempHp(l.c.sheet.hp, amount);
      if (!saveCharacter(l.c)) toast('Could not save the character.');
      commit(() => {});
      return;
    }
    commit(() => {
      if (mode === 'damage') replaceToken(damageToken(token, amount));
      else if (mode === 'heal') replaceToken(healToken(token, amount));
      else replaceToken({ ...token, hp: { ...token.hp, temp: Math.max(token.hp.temp, Math.max(0, Math.floor(amount))) } });
    });
  }

  // ---------------------------------------------------------------- view transform
  const applyTransform = () => { stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`; };
  stage.addEventListener('transitionend', () => stage.classList.remove('animating'));
  function fit() {
    const r = viewport.getBoundingClientRect();
    if (!r.width || !enc) return;
    view.scale = Math.min(r.width / enc.width, r.height / enc.height) * 0.98;
    view.x = (r.width - enc.width * view.scale) / 2;
    view.y = (r.height - enc.height * view.scale) / 2;
    applyTransform();
  }
  function zoomAt(factor, cx, cy) {
    const next = Math.min(8, Math.max(0.05, view.scale * factor));
    const k = next / view.scale;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.scale = next;
    applyTransform();
  }
  const zoomCenter = (factor) => { const r = viewport.getBoundingClientRect(); zoomAt(factor, r.width / 2, r.height / 2); };
  function toImage(clientX, clientY) {
    const r = viewport.getBoundingClientRect();
    return { x: (clientX - r.left - view.x) / view.scale, y: (clientY - r.top - view.y) / view.scale };
  }
  function viewCenterImage() {
    const r = viewport.getBoundingClientRect();
    return toImage(r.left + r.width / 2, r.top + r.height / 2);
  }
  function centerOn(token) {
    const r = viewport.getBoundingClientRect();
    view.x = r.width / 2 - token.x * view.scale;
    view.y = r.height / 2 - token.y * view.scale;
    applyTransform();
  }

  // ---------------------------------------------------------------- drawing
  function drawGrid() {
    const g = enc.grid;
    gridEl.hidden = !g.show;
    gridEl.style.backgroundSize = `${g.size}px ${g.size}px`;
    gridEl.style.backgroundPosition = `${g.offsetX}px ${g.offsetY}px`;
    gridEl.style.setProperty('--grid-color', g.color);
    gridEl.style.setProperty('--grid-line', `${Math.max(1, g.size / 50)}px`);
  }

  function tokenEl(t) {
    const px = t.size * enc.grid.size;
    const hp = hpOf(t);
    const state = hpState(hp);
    const active = enc.turn.activeId === t.id;
    const pct = hp && hp.max ? Math.round((hp.current / hp.max) * 100) : null;
    const label = t.label || initials(t.name);
    const el = h('button', {
      type: 'button', class: `map-token kind-${t.kind}${t.id === selectedId ? ' selected' : ''}${active ? ' active' : ''}${state ? ` ${state}` : ''}${t.hidden ? ' is-hidden' : ''}`,
      dataset: { id: t.id },
      'aria-label': `${t.name}${hp ? `, ${hp.current} of ${hp.max} hit points` : ''}${active ? ', current turn' : ''}`,
      title: `${t.name}${hp ? ` · HP ${hp.current}/${hp.max}${hp.temp ? ` (+${hp.temp})` : ''}` : ''}${acOf(t) !== null ? ` · AC ${acOf(t)}` : ''}${t.conditions.length ? ` · ${t.conditions.map((c) => CONDITION_NAME[c] || c).join(', ')}` : ''}`,
      style: `left:${t.x - px / 2}px;top:${t.y - px / 2}px;width:${px}px;height:${px}px;--token-color:${t.color};font-size:${Math.max(8, px * 0.36)}px`,
    },
    h('span', { class: 'map-token-label' }, state === 'down' ? '✖' : label),
    pct !== null ? h('span', { class: 'map-token-hp', style: `--pct:${Math.max(0, Math.min(100, pct))}%` }) : null,
    t.conditions.length ? h('span', { class: 'map-token-cond' }, String(t.conditions.length)) : null);
    return el;
  }

  function drawLinks() {
    linkLayer.replaceChildren(...enc.links.map((l) => {
      const target = mapsById[l.targetId];
      return h('div', {
        class: `map-link${target ? '' : ' broken'}`, dataset: { link: l.id }, role: 'link', tabindex: 0,
        'aria-label': `${l.label || (target ? target.name : 'Linked area')}: open ${target ? target.name : 'map (missing)'}`,
        title: target ? `Click to zoom in to ${target.name}` : 'The linked map no longer exists',
        style: `left:${l.x}px;top:${l.y}px;width:${l.w}px;height:${l.h}px;font-size:${Math.max(12, Math.min(l.w, l.h) / 7)}px`,
        onkeydown: (e) => { if (e.key === 'Enter') followLink(l); },
      }, h('span', { class: 'map-link-label' }, l.label || (target ? target.name : 'Missing map')));
    }));
  }

  /** Zoom smoothly into a linked area, then open its map. */
  function followLink(l) {
    const target = mapsById[l.targetId];
    if (!target) { toast('That linked map no longer exists. Edit the link in the side panel.'); return; }
    const r = viewport.getBoundingClientRect();
    Object.assign(view, viewForRect(l, r.width, r.height, 1));
    stage.classList.add('animating');
    applyTransform();
    try { sessionStorage.setItem(ZOOM_KEY, target.id); } catch { /* ignore */ }
    setTimeout(() => go(`/map/${target.id}`), 480);
  }

  function goParent() {
    const parent = mapsById[enc.parentId];
    if (!parent) return;
    const r = viewport.getBoundingClientRect();
    stage.classList.add('animating');
    zoomAt(0.4, r.width / 2, r.height / 2);
    setTimeout(() => go(`/map/${parent.id}`), 380);
  }

  function drawTokens() {
    // Markers first so creatures are drawn on top of them.
    const ordered = [...enc.tokens].sort((a, b) => (a.kind === 'marker' ? 0 : 1) - (b.kind === 'marker' ? 0 : 1));
    tokenLayer.replaceChildren(...ordered.map(tokenEl));
  }

  const turnBox = h('span', { class: 'map-turn', 'aria-live': 'polite' });
  function drawToolbarTurn() {
    const active = tokenById(enc.turn.activeId);
    turnBox.textContent = `Round ${enc.turn.round}${active ? ` · ${active.name}'s turn` : ''}`;
  }

  function drawToolbar() {
    const nameIn = h('input', { type: 'text', class: 'map-title', value: enc.name, maxlength: 80, 'aria-label': 'Map name', onchange: (e) => commit(() => { enc.name = e.target.value.trim() || enc.name; }) });
    const g = enc.grid;
    const num = (key, label, min, max, step = 1) => {
      const fid = nextId('grid');
      return h('div', { class: 'field compact' }, h('label', { for: fid }, label), h('input', {
        id: fid, type: 'number', min, max, step, value: g[key],
        oninput: (e) => { const v = Number(e.target.value); if (Number.isFinite(v)) { enc.grid = normalizeGrid({ ...enc.grid, [key]: v }, enc.width); drawGrid(); drawTokens(); scheduleSave(); } },
      }));
    };
    const chk = (key, label) => {
      const fid = nextId('grid');
      return h('div', { class: 'field inline' }, h('input', { id: fid, type: 'checkbox', checked: g[key], onchange: (e) => { enc.grid = { ...enc.grid, [key]: e.target.checked }; drawGrid(); scheduleSave(); } }), h('label', { for: fid }, label));
    };
    toolbar.replaceChildren(
      h('div', { class: 'row gap map-toolbar-row' },
        h('button', { type: 'button', class: 'btn small', onclick: focus.toggle, 'aria-pressed': String(focus.isOn()), title: 'Use the whole screen for the map' }, focus.isOn() ? '✕ Exit full screen' : '⤢ Full screen'),
        focus.isOn() ? h('button', { type: 'button', class: 'btn small', onclick: focus.toggleSide, title: 'Show or hide the token and combat panel' }, '☰ Panel') : null,
        h('a', { class: 'btn small', href: '#/map' }, '← Maps'),
        mapsById[enc.parentId] ? h('button', { type: 'button', class: 'btn small', onclick: goParent, title: 'Zoom out to the map this one is part of' }, `↑ ${mapsById[enc.parentId].name}`) : null,
        (() => { const main = Object.values(mapsById).find((m) => m.isMain); return main && !enc.isMain && main.id !== enc.parentId ? h('a', { class: 'btn small', href: `#/map/${main.id}` }, `★ ${main.name}`) : null; })(),
        nameIn,
        enc.isMain ? h('span', { class: 'tag custom-tag' }, '★ Main map') : h('button', { type: 'button', class: 'btn small', onclick: async () => { await setMainMap(enc.id); enc.isMain = true; await loadOthers(); drawToolbar(); } }, 'Set as main map'),
        h('span', { class: 'btn-pair' },
          h('button', { type: 'button', class: 'btn small', 'aria-label': 'Zoom out', onclick: () => zoomCenter(1 / 1.25) }, '−'),
          h('button', { type: 'button', class: 'btn small', 'aria-label': 'Zoom in', onclick: () => zoomCenter(1.25) }, '+'),
          h('button', { type: 'button', class: 'btn small', onclick: fit }, 'Fit')),
        h('button', { type: 'button', class: 'btn primary small', onclick: () => openAddDialog(viewCenterImage()) }, '+ Add token'),
        liveSession() ? h('button', { type: 'button', class: `btn small${liveSession().settings.movementLocked ? ' danger' : ''}`, onclick: () => setLiveSettings({ movementLocked: !liveSession().settings.movementLocked }), title: 'Stop or allow all player movement' }, liveSession().settings.movementLocked ? '🔓 Unlock' : '🔒 Lock') : null,
        liveSession() ? h('button', { type: 'button', class: 'btn small live-on', onclick: () => side.querySelector('.map-live')?.scrollIntoView({ behavior: 'smooth' }), title: 'Your party sees this map live' }, `● Live · ${liveSession().online.size}`)
          : h('button', { type: 'button', class: 'btn small', onclick: openLiveDialog, title: 'Let your party see this map live on their own devices' }, '📡 Go live'),
        h('button', { type: 'button', class: `btn small${mode === 'link' ? ' cta' : ''}`, 'aria-pressed': String(mode === 'link'), onclick: () => setMode(mode === 'link' ? 'normal' : 'link'), title: 'Drag a rectangle over an area (an island, a town…) and link it to another map' }, mode === 'link' ? 'Cancel link area' : '⌖ Link area'),
        h('span', { class: 'btn-pair' },
          h('button', { type: 'button', class: 'btn small', 'aria-label': 'Previous turn', onclick: () => commit(() => { enc = stepTurn(enc, -1); }) }, '◀'),
          h('button', { type: 'button', class: 'btn small cta-lite', 'aria-keyshortcuts': 'n', onclick: () => commit(() => { enc = stepTurn(enc, 1); }) }, 'Next turn ▶')),
        turnBox,
        h('button', { type: 'button', class: 'btn small', onclick: async () => download(`${enc.name.replace(/[^\w-]+/g, '-').toLowerCase() || 'map'}.json`, await exportEncounterJson(enc)) }, 'Export')),
      h('details', { class: 'map-grid-settings' },
        h('summary', {}, 'Grid settings'),
        h('div', { class: 'row gap' },
          chk('show', 'Show grid'), chk('snap', 'Snap tokens to grid'),
          num('size', 'Square size (px)', 8, 1000, 1), num('offsetX', 'Offset X', -500, 500), num('offsetY', 'Offset Y', -500, 500),
          num('feet', 'Feet per square', 1, 100)),
        h('p', { class: 'hint' }, 'Match the square size to the grid printed on your map image (zoom in to line it up), then use the offsets to shift it.')));
    drawToolbarTurn();
  }

  // ---------------------------------------------------------------- side panel
  function hpBlock(t) {
    const hp = hpOf(t);
    if (!hp) return null;
    const amountId = nextId('amt');
    const amount = h('input', { id: amountId, type: 'number', min: 0, max: 999, class: 'map-amount', placeholder: 'Amount', 'aria-label': `Amount for ${t.name}` });
    const val = () => Math.floor(Number(amount.value) || 0);
    const act = (mode) => { const v = val(); if (v > 0) { changeHp(t, v, mode); } else amount.focus(); };
    const l = linked(t);
    return h('div', { class: 'map-hp' },
      h('div', { class: 'map-hp-line' },
        h('strong', {}, `HP ${hp.current} / ${hp.max}`), hp.temp ? h('span', { class: 'tag good' }, `+${hp.temp} temp`) : null,
        hpState(hp) === 'bloodied' ? h('span', { class: 'tag warn-tag' }, 'Bloodied') : null,
        hpState(hp) === 'down' ? h('span', { class: 'tag bad' }, '0 HP') : null),
      h('div', { class: 'hp-bar' }, h('span', { class: `hp-fill${hpState(hp) !== 'healthy' ? ' low' : ''}`, style: `width:${hp.max ? Math.round((hp.current / hp.max) * 100) : 0}%` })),
      h('div', { class: 'row gap map-hp-actions' },
        amount,
        h('button', { type: 'button', class: 'btn small danger', onclick: () => act('damage') }, 'Damage'),
        h('button', { type: 'button', class: 'btn small', onclick: () => act('heal') }, 'Heal'),
        h('button', { type: 'button', class: 'btn small', onclick: () => act('temp') }, 'Temp')),
      l ? h('p', { class: 'hint' }, `Linked to ${l.c.name}'s sheet: HP changes here also change the sheet.`) : null);
  }

  function tokenEditor(t) {
    const l = linked(t);
    const set = (patch, redraw = true) => commit(() => replaceToken(normalizeToken({ ...t, ...patch })), { panel: redraw });
    const fid = () => nextId('tok');
    const input = (label, attrs, onChange) => { const i = fid(); return field(label, h('input', { id: i, ...attrs, onchange: (e) => onChange(e.target) })); };
    const nameField = input('Name', { type: 'text', value: t.name, maxlength: 60 }, (el) => set({ name: el.value }));
    const kindSel = (() => { const i = fid(); const s = h('select', { id: i, onchange: (e) => set({ kind: e.target.value, color: TOKEN_KINDS[e.target.value].color, hp: e.target.value === 'marker' ? null : (t.hp || { max: 10, current: 10, temp: 0 }) }) },
      Object.entries(TOKEN_KINDS).map(([k, v]) => h('option', { value: k, selected: k === t.kind }, v.label))); return field('Type', s); })();
    const sizeSel = (() => { const i = fid(); const s = h('select', { id: i, onchange: (e) => set({ size: Number(e.target.value) }) },
      TOKEN_SIZES.map((o) => h('option', { value: o.value, selected: o.value === t.size }, o.label))); return field('Size', s); })();
    const initBonus = l ? l.d.initiative : t.initBonus;
    const rollInit = () => { const r = rollDie(20); set({ init: r + initBonus }); toast(`${t.name} initiative: ${r} ${fmtSigned(initBonus)} = ${r + initBonus}`); };
    const condChips = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Conditions' }, CONDITIONS.map((c) => h('button', {
      type: 'button', class: `chip${t.conditions.includes(c.id) ? ' on' : ''}`, 'aria-pressed': String(t.conditions.includes(c.id)), title: c.desc,
      onclick: () => set({ conditions: t.conditions.includes(c.id) ? t.conditions.filter((x) => x !== c.id) : [...t.conditions, c.id] }),
    }, c.name)));
    return h('section', { class: 'panel map-token-editor', 'aria-label': `Selected: ${t.name}` },
      h('div', { class: 'row gap map-editor-head' },
        h('span', { class: 'map-dot', style: `--token-color:${t.color}` }),
        h('h2', {}, t.name),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Deselect', onclick: () => { selectedId = null; drawTokens(); drawSide(); } }, '×')),
      hpBlock(t),
      t.kind !== 'marker' ? h('div', { class: 'row gap map-stats' },
        h('span', { class: 'stat' }, h('small', {}, 'AC'), h('strong', {}, acOf(t) ?? '—')),
        h('span', { class: 'stat' }, h('small', {}, 'Initiative'), h('strong', {}, t.init ?? '—')),
        h('button', { type: 'button', class: 'btn small', onclick: rollInit, title: `d20 ${fmtSigned(initBonus)}` }, `Roll initiative (${fmtSigned(initBonus)})`)) : null,
      t.kind !== 'marker' ? condChips : null,
      h('details', { class: 'map-token-details', open: !l && !t.hp && t.kind !== 'marker' ? true : undefined },
        h('summary', {}, 'Edit token'),
        h('div', { class: 'map-form-grid' },
          nameField, kindSel,
          input('Label (letters or emoji)', { type: 'text', value: t.label, maxlength: 4 }, (el) => set({ label: el.value })),
          input('Colour', { type: 'color', value: t.color }, (el) => set({ color: el.value })),
          sizeSel,
          !l && t.kind !== 'marker' ? input('Max HP', { type: 'number', min: 0, max: 9999, value: t.hp ? t.hp.max : 0 }, (el) => { const max = Math.max(0, Math.floor(Number(el.value) || 0)); set({ hp: { max, current: t.hp ? Math.min(t.hp.current, max) || max : max, temp: t.hp ? t.hp.temp : 0 } }); }) : null,
          !l && t.hp ? input('Current HP', { type: 'number', min: 0, max: 9999, value: t.hp.current }, (el) => set({ hp: { ...t.hp, current: Number(el.value) } })) : null,
          !l && t.kind !== 'marker' ? input('AC', { type: 'number', min: 0, max: 40, value: t.ac ?? '' }, (el) => set({ ac: el.value })) : null,
          t.kind !== 'marker' ? input('Initiative', { type: 'number', min: -10, max: 50, value: t.init ?? '' }, (el) => set({ init: el.value })) : null,
          !l && t.kind !== 'marker' ? input('Initiative bonus', { type: 'number', min: -10, max: 20, value: t.initBonus }, (el) => set({ initBonus: el.value })) : null),
        (() => { const i = fid(); return field('Notes', h('textarea', { id: i, rows: 3, maxlength: 2000, value: t.note, onchange: (e) => set({ note: e.target.value }, false) })); })()),
      h('div', { class: 'row gap map-token-actions' },
        h('button', { type: 'button', class: 'btn small', onclick: () => centerOn(t) }, 'Center'),
        !l ? h('button', { type: 'button', class: 'btn small', onclick: () => { const copy = duplicateToken(t, enc.tokens, enc.grid); commit(() => { enc.tokens = [...enc.tokens, copy]; selectedId = copy.id; }); } }, 'Duplicate') : null,
        !l ? h('button', { type: 'button', class: 'btn small', onclick: () => savePreset(t) }, 'Save as custom add') : h('a', { class: 'btn small', href: `#/sheet/${t.characterId}` }, 'Open sheet'),
        h('button', { type: 'button', class: 'btn small danger', onclick: async () => {
          if (!(await confirmDialog('Remove token', `Remove ${t.name} from the map?`, 'Remove'))) return;
          commit(() => { enc.tokens = enc.tokens.filter((x) => x.id !== t.id); if (enc.turn.activeId === t.id) enc.turn = { ...enc.turn, activeId: null }; selectedId = null; });
        } }, 'Remove')));
  }

  function combatantRow(t) {
    const hp = hpOf(t);
    const active = enc.turn.activeId === t.id;
    return h('li', {},
      h('button', {
        type: 'button', class: `map-row${t.id === selectedId ? ' selected' : ''}${active ? ' active' : ''}`,
        onclick: () => { selectedId = t.id; centerOn(t); drawTokens(); drawSide(); },
      },
      h('span', { class: 'map-dot', style: `--token-color:${t.color}` }),
      h('span', { class: 'map-row-name' }, t.name, t.conditions.length ? h('small', { class: 'hint' }, ` · ${t.conditions.map((c) => CONDITION_NAME[c] || c).join(', ')}`) : null),
      t.init !== null ? h('span', { class: 'tag' }, `Init ${t.init}`) : null,
      hp ? h('span', { class: `tag${hpState(hp) === 'down' ? ' bad' : hpState(hp) === 'bloodied' ? ' warn-tag' : ''}` }, `${hp.current}/${hp.max}`) : null,
      acOf(t) !== null && t.kind !== 'marker' ? h('span', { class: 'tag' }, `AC ${acOf(t)}`) : null));
  }

  function drawSide() {
    const sel = tokenById(selectedId);
    const order = initiativeOrder(enc.tokens);
    const rest = enc.tokens.filter((t) => !order.includes(t) && t.kind !== 'marker');
    const markers = enc.tokens.filter((t) => t.kind === 'marker');
    const rollAll = () => commit(() => {
      enc.tokens = enc.tokens.map((t) => {
        if (t.kind === 'marker' || t.init !== null) return t;
        const l = linked(t);
        return { ...t, init: rollDie(20) + (l ? l.d.initiative : t.initBonus) };
      });
    });
    side.replaceChildren(
      livePanel(),
      sel ? tokenEditor(sel) : h('p', { class: 'hint map-help' }, 'Select a token to edit it. Double-click (on a phone: press and hold) the map, or use "+ Add token", to place your character, enemies or custom markers. Arrow keys move the selected token one square; N = next turn.'),
      h('section', { class: 'panel' },
        h('div', { class: 'row gap map-side-head' },
          h('h2', {}, 'Combat'),
          h('button', { type: 'button', class: 'btn small', onclick: rollAll, title: 'Roll a d20 + bonus for every token without initiative' }, 'Roll initiative'),
          h('button', { type: 'button', class: 'btn small', onclick: () => commit(() => { enc.tokens = enc.tokens.map((t) => ({ ...t, init: null })); enc.turn = { activeId: null, round: 1 }; }) }, 'End combat')),
        order.length ? h('ol', { class: 'map-rows' }, order.map(combatantRow)) : h('p', { class: 'hint' }, 'No initiative rolled yet.'),
        rest.length ? [h('h3', {}, 'Not in initiative'), h('ul', { class: 'map-rows' }, rest.map(combatantRow))] : null,
        markers.length ? [h('h3', {}, 'Markers'), h('ul', { class: 'map-rows' }, markers.map(combatantRow))] : null),
      h('section', { class: 'panel' },
        h('div', { class: 'row gap map-side-head' }, h('h2', {}, 'Linked areas'),
          h('button', { type: 'button', class: 'btn small', onclick: () => setMode('link') }, '⌖ Add')),
        enc.links.length ? h('ul', { class: 'map-rows' }, enc.links.map((l) => {
          const target = mapsById[l.targetId];
          return h('li', { class: 'map-link-row' },
            h('span', { class: 'map-row-name' }, l.label || (target ? target.name : 'Linked area'), h('small', { class: 'hint' }, ` → ${target ? target.name : 'missing map'}`)),
            h('button', { type: 'button', class: 'btn small', disabled: !target, onclick: () => followLink(l) }, 'Open'),
            h('button', { type: 'button', class: 'btn small', onclick: () => openLinkDialog(l) }, 'Edit'),
            h('button', { type: 'button', class: 'btn small danger', 'aria-label': `Delete linked area ${l.label}`, onclick: async () => {
              if (!(await confirmDialog('Delete linked area', 'Remove this clickable area? The other map is kept.', 'Delete'))) return;
              commit(() => { enc.links = enc.links.filter((x) => x.id !== l.id); });
              drawLinks();
            } }, 'Delete'));
        })) : h('p', { class: 'hint' }, 'None. Use "⌖ Link area" and drag over part of the map (an island, a town) to link it to its own map. Clicking the area then zooms in.')));
  }

  // ---------------------------------------------------------------- live party session (DM side)
  function livePanel() {
    const s = liveSession();
    if (!s) return null;
    const chk = (key, label) => {
      const fid = nextId('live');
      return h('div', { class: 'field inline' }, h('input', { id: fid, type: 'checkbox', checked: !!s.settings[key], onchange: (e) => setLiveSettings({ [key]: e.target.checked }) }), h('label', { for: fid }, label));
    };
    const link = joinLink(s.party.code);
    return h('section', { class: `panel map-live state-${s.state}` },
      h('div', { class: 'row gap map-side-head' },
        h('h2', {}, `● Live: ${s.party.name}`),
        h('button', { type: 'button', class: 'btn small danger', onclick: async () => { if (await confirmDialog('Stop live session', 'Players will no longer see the map.', 'Stop')) stopLive(); } }, 'Stop')),
      h('p', { class: 'hint', role: 'status' }, s.status),
      h('p', {}, 'Party code ', h('strong', { class: 'party-code' }, s.party.code)),
      h('div', { class: 'row gap' },
        h('input', { type: 'text', readOnly: true, value: link, 'aria-label': 'Invite link', class: 'invite-link', onfocus: (e) => e.target.select() }),
        h('button', { type: 'button', class: 'btn small', onclick: async () => { try { await navigator.clipboard.writeText(link); toast('Invite link copied.'); } catch { toast('Select the link and copy it.'); } } }, 'Copy link')),
      h('h3', {}, `Players (${s.online.size} online)`),
      s.party.members.length ? h('ul', { class: 'map-rows' }, s.party.members.map((m) => {
        const on = s.online.has(m.memberId);
        const tok = enc.tokens.find((t) => t.memberId === m.memberId);
        const perm = (key, label) => {
          const own = (s.settings.perMember || {})[m.memberId] || {};
          const cur = typeof own[key] === 'boolean' ? String(own[key]) : 'default';
          const def = key === 'move' ? s.settings.playersMove : s.settings.playersHp;
          const fid = nextId('perm');
          return h('span', { class: 'perm-field' }, h('label', { for: fid }, label), h('select', {
            id: fid, 'aria-label': `${label} permission for ${m.name}`,
            onchange: (e) => {
              const per = { ...(s.settings.perMember || {}) };
              const next = { ...(per[m.memberId] || {}) };
              if (e.target.value === 'default') delete next[key]; else next[key] = e.target.value === 'true';
              per[m.memberId] = next;
              setLiveSettings({ perMember: per });
            },
          }, [['default', `Default (${def ? 'yes' : 'no'})`], ['true', 'Allowed'], ['false', 'Not allowed']].map(([v, l]) => h('option', { value: v, selected: v === cur }, l))));
        };
        const eff = memberPermissions(m.memberId, s.settings);
        return h('li', { class: 'map-link-row member-row' },
          h('span', { class: `online-dot${on ? ' on' : ''}`, 'aria-label': on ? 'online' : 'offline' }),
          h('span', { class: 'map-row-name' }, m.name, m.character ? h('small', { class: 'hint' }, ` · ${m.character.name}${m.character.classLine ? `, ${m.character.classLine}` : ''}`) : null),
          tok ? h('button', { type: 'button', class: 'btn small', onclick: () => { selectedId = tok.id; centerOn(tok); drawTokens(); drawSide(); } }, 'Show')
            : h('button', { type: 'button', class: 'btn small', onclick: () => placeMember(m, viewCenterImage()) }, 'Place'),
          h('span', { class: 'perm-row' }, perm('move', 'Move'), perm('hp', 'HP'),
            h('small', { class: 'hint' }, `${eff.move ? 'can move' : '🔒 cannot move'} · ${eff.hp ? 'can change HP' : 'HP locked'}`)));
      })) : h('p', { class: 'hint' }, 'Nobody has joined yet. Share the code or the link.'),
      h('h3', {}, 'Permissions for everyone'),
      h('button', { type: 'button', class: `btn small${s.settings.movementLocked ? ' danger' : ''}`, 'aria-pressed': String(!!s.settings.movementLocked), onclick: () => setLiveSettings({ movementLocked: !s.settings.movementLocked }) },
        s.settings.movementLocked ? '🔓 Unlock movement' : '🔒 Lock movement for everyone'),
      chk('playersMove', 'Players may move their own token (default)'),
      chk('playersHp', 'Players may change their own HP (default)'),
      chk('autoPlace', 'Put players on the map when they join'),
      chk('showEnemyHp', 'Show enemy HP and AC to players'),
      h('p', { class: 'hint' }, 'Per player you can override the defaults above. "Lock movement" freezes everyone, whatever the other settings say. You (the DM) can always move and edit everything.'));
  }

  function openLiveDialog() {
    let modal;
    const parties = listParties();
    const sel = h('select', { id: 'live-party' }, parties.map((p) => h('option', { value: p.id }, `${p.name} (${p.code})`)));
    const nameIn = h('input', { id: 'live-new', type: 'text', maxlength: 60, placeholder: 'e.g. The Lantern Bearers' });
    const status = h('p', { class: 'hint', role: 'status' });
    const go = async (partyId) => {
      status.textContent = 'Starting…';
      try { await startLive(partyId); await attachEditor(editorApi); modal.close(); drawToolbar(); drawSide(); }
      catch (err) { status.textContent = err.message || String(err); }
    };
    modal = openModal('Go live with your party', h('div', { class: 'map-add' },
      h('p', {}, 'Players open the invite link (or Party → Join and type the code) on their own phone or laptop and see this map live. You keep full control; they can move their own token if you allow it.'),
      parties.length ? h('section', {}, h('h3', {}, 'Use a party'), h('div', { class: 'row gap' }, field('Party', sel), h('button', { type: 'button', class: 'btn cta', onclick: () => go(sel.value) }, 'Go live'))) : null,
      h('section', {}, h('h3', {}, 'New party'), h('div', { class: 'row gap' }, field('Party name', nameIn), h('button', { type: 'button', class: parties.length ? 'btn' : 'btn cta', onclick: () => go(createParty(nameIn.value).id) }, 'Create and go live'))),
      status), { wide: true });
  }

  /** Put a party member's token on this map (or refresh it). */
  function placeMember(member, at) {
    const ch = member.character || {};
    const existing = enc.tokens.find((t) => t.memberId === member.memberId);
    const base = {
      name: ch.name || member.name, kind: 'player', memberId: member.memberId, color: ch.color || TOKEN_KINDS.player.color,
      hp: ch.hp ? { max: ch.hp.max, current: ch.hp.current, temp: ch.hp.temp || 0 } : (existing ? existing.hp : null),
      ac: ch.ac ?? (existing ? existing.ac : null), initBonus: ch.initBonus ?? 0,
    };
    if (existing) { commit(() => replaceToken(normalizeToken({ ...existing, ...base, x: existing.x, y: existing.y }))); return; }
    const offset = enc.tokens.filter((t) => t.memberId).length;
    place([base], { x: at.x + offset * enc.grid.size, y: at.y });
  }

  const editorApi = {
    getEnc: () => enc,
    getImageBlob: () => getImageBlob(enc.imageId),
    onMemberHello: (member) => {
      const s = liveSession();
      const existing = enc.tokens.find((t) => t.memberId === member.memberId);
      if (existing || (s && s.settings.autoPlace)) placeMember(member, viewCenterImage());
    },
    onMemberMove: (memberId, msg) => {
      const t = tokenById(msg.tokenId);
      const s = liveSession();
      if (!memberMayMove(t, memberId, s && s.settings)) { pushState(); return; }
      const x = Number(msg.x);
      const y = Number(msg.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const pos = enc.grid.snap ? snapToGrid(x, y, enc.grid, t.size) : { x, y };
      commit(() => replaceToken({ ...t, x: Math.min(enc.width, Math.max(0, pos.x)), y: Math.min(enc.height, Math.max(0, pos.y)) }), { panel: false });
    },
    onMemberHp: (memberId, msg) => {
      const t = enc.tokens.find((x) => x.memberId === memberId);
      if (!t) return;
      const s = liveSession();
      if (!memberMayEditHp(t, memberId, s && s.settings)) { pushState(); return; } // not allowed: send the real HP back
      commit(() => replaceToken(normalizeToken({ ...t, hp: { max: msg.max ?? (t.hp && t.hp.max) ?? 0, current: msg.current, temp: msg.temp } })));
    },
  };
  const unsubscribe = subscribe((sess) => {
    if (!enc) return;
    if (sess && !sess.editor) attachEditor(editorApi); // e.g. the session resumed after a page refresh
    drawToolbar();
    drawSide();
  });

  function setMode(next) {
    mode = next;
    viewport.classList.toggle('mode-link', mode === 'link');
    drawToolbar();
    if (mode === 'link') toast('Drag a rectangle over the area you want to link.');
  }

  async function loadOthers() {
    try { mapsById = Object.fromEntries((await listEncounters()).filter((m) => m.id !== enc.id).map((m) => [m.id, m])); } catch { mapsById = {}; }
  }

  /** Create or edit a linked area: pick an existing map, or upload a new image that becomes a map inside this one. */
  function openLinkDialog(link) {
    const isNew = !enc.links.some((l) => l.id === link.id);
    let modal;
    const others = Object.values(mapsById);
    const labelIn = h('input', { id: 'link-label', type: 'text', maxlength: 60, value: link.label, placeholder: 'e.g. Skull Island' });
    const targetSel = h('select', { id: 'link-target' }, h('option', { value: '' }, others.length ? 'Choose a map…' : 'No other maps yet'), others.map((m) => h('option', { value: m.id, selected: m.id === link.targetId }, m.name)));
    const fileIn = h('input', { id: 'link-file', type: 'file', accept: 'image/png,image/jpeg,.png,.jpg,.jpeg' });
    const status = h('p', { class: 'hint', role: 'status' });
    const save = async () => {
      let targetId = targetSel.value;
      const file = fileIn.files && fileIn.files[0];
      try {
        if (file) {
          status.textContent = 'Saving the new map…';
          const imgData = await prepareImage(file);
          const imageId = await putImage(imgData.blob);
          const child = makeEncounter({ name: labelIn.value.trim() || file.name.replace(/\.(png|jpe?g)$/i, ''), imageId, width: imgData.width, height: imgData.height, parentId: enc.id });
          await saveEncounter(child);
          targetId = child.id;
        } else if (targetId && mapsById[targetId] && !mapsById[targetId].parentId) {
          await saveEncounter({ ...mapsById[targetId], parentId: enc.id });
        }
      } catch (err) { status.textContent = err.message || String(err); return; }
      if (!targetId) { status.textContent = 'Pick a map or upload an image for this area.'; return; }
      const next = normalizeLink({ ...link, targetId, label: labelIn.value || (mapsById[targetId] && mapsById[targetId].name) || '' }, enc.width, enc.height);
      await loadOthers();
      if (!next.label && mapsById[targetId]) next.label = mapsById[targetId].name;
      commit(() => { enc.links = isNew ? [...enc.links, next] : enc.links.map((l) => (l.id === next.id ? next : l)); });
      drawLinks();
      drawToolbar();
      modal.close();
      toast(isNew ? 'Area linked. Click it to zoom in.' : 'Link updated.');
    };
    modal = openModal(isNew ? 'Link this area to a map' : 'Edit linked area', h('div', { class: 'map-add' },
      field('Name of the area', labelIn),
      h('section', {}, h('h3', {}, 'Open an existing map'), field('Map', targetSel)),
      h('section', {}, h('h3', {}, 'Or upload a new map for this area'), field('Image (.png or .jpg)', fileIn, 'It becomes a new map that belongs to this one, with a button to zoom back out.')),
      status,
      h('div', { class: 'row end' },
        h('button', { type: 'button', class: 'btn', onclick: () => modal.close() }, 'Cancel'),
        h('button', { type: 'button', class: 'btn cta', onclick: save }, isNew ? 'Link area' : 'Save'))), { wide: true });
    setTimeout(() => labelIn.focus(), 0);
  }

  // ---------------------------------------------------------------- adding tokens
  function savePreset(t) {
    const presets = loadPresets().filter((p) => p.name !== t.name);
    const { id: _id, x: _x, y: _y, init: _i, conditions: _c, characterId: _ch, ...rest } = t;
    presets.push({ ...rest, hp: t.hp ? { max: t.hp.max, current: t.hp.max, temp: 0 } : null });
    if (savePresets(presets)) toast(`${t.name} saved as a custom add. It is available on every map.`);
  }

  function place(tokens, at) {
    const g = enc.grid;
    const placed = tokens.map((raw, i) => {
      const tok = normalizeToken(raw);
      const x = at.x + i * g.size * tok.size;
      const pos = g.snap ? snapToGrid(x, at.y, g, tok.size) : { x, y: at.y };
      return { ...tok, ...pos };
    });
    commit(() => { enc.tokens = [...enc.tokens, ...placed]; selectedId = placed[placed.length - 1].id; });
  }

  function openAddDialog(at) {
    const chars = listCharacters();
    let modal;
    const numberedNames = (name, count) => {
      const used = new Set(enc.tokens.map((t) => t.name));
      const out = [];
      let n = 1;
      for (let i = 0; i < count; i++) {
        let candidate = count === 1 && !used.has(name) ? name : `${name} ${n}`;
        while (used.has(candidate)) { n++; candidate = `${name} ${n}`; }
        used.add(candidate);
        out.push(candidate);
        n++;
      }
      return out;
    };

    // Your character
    const charSel = h('select', { id: 'add-char' }, chars.length ? chars.map((c) => h('option', { value: c.id }, c.name || 'Unnamed hero')) : h('option', { value: '' }, 'No characters yet'));
    const addChar = () => {
      const c = getCharacter(charSel.value);
      if (!c) { toast('Create a character first.'); return; }
      const existing = enc.tokens.find((t) => t.characterId === c.id);
      if (existing) { modal.close(); selectedId = existing.id; centerOn(existing); drawTokens(); drawSide(); toast(`${c.name} is already on this map.`); return; }
      const d = deriveCharacter(c);
      place([{ name: c.name || 'Hero', kind: 'player', characterId: c.id, hp: { max: d.hp, current: d.hp, temp: 0 }, ac: d.ac.ac, initBonus: d.initiative }], at);
      modal.close();
    };

    // Custom token(s)
    const f = {};
    const inp = (key, label, attrs) => { const i = nextId('add'); f[key] = h('input', { id: i, ...attrs }); return field(label, f[key]); };
    const kindSel = h('select', { id: 'add-kind' }, Object.entries(TOKEN_KINDS).filter(([k]) => k !== 'player').map(([k, v]) => h('option', { value: k, selected: k === 'enemy' }, v.label)));
    const sizeSel = h('select', { id: 'add-size' }, TOKEN_SIZES.map((o) => h('option', { value: o.value, selected: o.value === 1 }, o.label)));
    const addCustom = () => {
      const name = f.name.value.trim();
      if (!name) { f.name.focus(); toast('Give the token a name.'); return; }
      const kind = kindSel.value;
      const max = Math.max(0, Math.floor(Number(f.hp.value) || 0));
      const count = Math.min(20, Math.max(1, Math.floor(Number(f.count.value) || 1)));
      const base = {
        kind, color: f.color.value || TOKEN_KINDS[kind].color, label: f.label.value, size: Number(sizeSel.value),
        hp: kind === 'marker' ? null : { max, current: max, temp: 0 }, ac: f.ac.value, initBonus: f.init.value,
      };
      place(numberedNames(name, count).map((n) => ({ ...base, name: n })), at);
      modal.close();
    };
    kindSel.addEventListener('change', () => { f.color.value = TOKEN_KINDS[kindSel.value].color; f.hp.disabled = f.ac.disabled = kindSel.value === 'marker'; });

    // Saved custom adds
    const presetBox = h('div', {});
    const drawPresets = () => {
      const presets = loadPresets();
      presetBox.replaceChildren(presets.length ? h('ul', { class: 'map-presets' }, presets.map((p) => h('li', {},
        h('button', { type: 'button', class: 'btn small', onclick: () => { place(numberedNames(p.name, 1).map((n) => ({ ...p, name: n })), at); modal.close(); } },
          h('span', { class: 'map-dot', style: `--token-color:${p.color}` }), ` ${p.name}`, p.hp ? ` (HP ${p.hp.max}${p.ac !== null && p.ac !== undefined ? `, AC ${p.ac}` : ''})` : ''),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': `Delete custom add ${p.name}`, onclick: () => { savePresets(loadPresets().filter((x) => x.name !== p.name)); drawPresets(); } }, '×'))))
        : h('p', { class: 'hint' }, 'None yet. Select a token on the map and press "Save as custom add" to reuse it on every map.'));
    };
    drawPresets();

    const body = h('div', { class: 'map-add' },
      h('section', {},
        h('h3', {}, 'Your character (where you are)'),
        h('div', { class: 'row gap' }, field('Character', charSel), h('button', { type: 'button', class: 'btn primary', disabled: !chars.length, onclick: addChar }, 'Place character')),
        h('p', { class: 'hint' }, 'The token is linked to the character sheet: HP, AC and initiative bonus come from the sheet.')),
      h('section', {},
        h('h3', {}, 'Enemy, ally or custom add'),
        h('div', { class: 'map-form-grid' },
          inp('name', 'Name', { type: 'text', maxlength: 60, placeholder: 'e.g. Goblin, Chest, Trap' }),
          field('Type', kindSel),
          inp('hp', 'Max HP', { type: 'number', min: 0, max: 9999, value: 7 }),
          inp('ac', 'AC', { type: 'number', min: 0, max: 40, value: 13 }),
          inp('init', 'Initiative bonus', { type: 'number', min: -10, max: 20, value: 0 }),
          field('Size', sizeSel),
          inp('label', 'Label (letters or emoji)', { type: 'text', maxlength: 4, placeholder: 'auto' }),
          inp('color', 'Colour', { type: 'color', value: TOKEN_KINDS.enemy.color }),
          inp('count', 'How many', { type: 'number', min: 1, max: 20, value: 1 })),
        h('button', { type: 'button', class: 'btn cta', onclick: addCustom }, 'Add to map')),
      h('section', {}, h('h3', {}, 'Saved custom adds'), presetBox));
    modal = openModal('Add token', body, { wide: true });
    setTimeout(() => (chars.length ? charSel : f.name).focus(), 0);
  }

  // ---------------------------------------------------------------- pointer interaction
  function onPointerDown(e) {
    if (e.button !== undefined && e.button > 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      if (gesture) clearTimeout(gesture.longPress);
      gesture = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
      return;
    }
    if (mode === 'link') {
      const p = toImage(e.clientX, e.clientY);
      gesture = { type: 'rect', start: p };
      Object.assign(rectPreview.style, { left: `${p.x}px`, top: `${p.y}px`, width: '0px', height: '0px' });
      rectPreview.hidden = false;
      return;
    }
    const linkNode = e.target.closest('.map-link');
    const tokenNode = e.target.closest('.map-token');
    if (linkNode && !tokenNode) {
      gesture = { type: 'pan', sx: e.clientX, sy: e.clientY, x0: view.x, y0: view.y, moved: false, linkId: linkNode.dataset.link };
      return;
    }
    if (tokenNode) {
      const t = tokenById(tokenNode.dataset.id);
      if (!t) return;
      const p = toImage(e.clientX, e.clientY);
      gesture = { type: 'drag', id: t.id, node: tokenNode, start: p, orig: { x: t.x, y: t.y }, moved: false };
      if (selectedId !== t.id) { selectedId = t.id; tokenLayer.querySelectorAll('.map-token.selected').forEach((n) => n.classList.remove('selected')); tokenNode.classList.add('selected'); drawSide(); }
    } else {
      gesture = { type: 'pan', sx: e.clientX, sy: e.clientY, x0: view.x, y0: view.y, moved: false };
      if (e.pointerType === 'touch' && mode === 'normal') {
        const at = toImage(e.clientX, e.clientY);
        const g = gesture;
        g.longPress = setTimeout(() => { if (gesture === g && !g.moved && pointers.size === 1) { gesture = null; pointers.clear(); openAddDialog(at); } }, 600);
      }
    }
  }

  function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!gesture) return;
    if (gesture.type === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const r = viewport.getBoundingClientRect();
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((gesture.scale * (dist / gesture.dist)) / view.scale, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
      return;
    }
    if (gesture.type === 'rect') {
      const r = rectFromPoints(gesture.start, toImage(e.clientX, e.clientY));
      gesture.rect = r;
      Object.assign(rectPreview.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
      return;
    }
    if (gesture.type === 'pan') {
      const dx = e.clientX - gesture.sx;
      const dy = e.clientY - gesture.sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) { gesture.moved = true; clearTimeout(gesture.longPress); }
      view.x = gesture.x0 + dx;
      view.y = gesture.y0 + dy;
      applyTransform();
      return;
    }
    if (gesture.type === 'drag') {
      const t = tokenById(gesture.id);
      const p = toImage(e.clientX, e.clientY);
      const x = gesture.orig.x + (p.x - gesture.start.x);
      const y = gesture.orig.y + (p.y - gesture.start.y);
      if (Math.abs(x - gesture.orig.x) + Math.abs(y - gesture.orig.y) > 2 / view.scale) gesture.moved = true;
      const pos = enc.grid.snap ? snapToGrid(x, y, enc.grid, t.size) : { x, y };
      const px = t.size * enc.grid.size;
      gesture.node.style.left = `${pos.x - px / 2}px`;
      gesture.node.style.top = `${pos.y - px / 2}px`;
      gesture.pos = pos;
      pushMoving(t.id, pos.x, pos.y);
      measure.hidden = false;
      measure.textContent = `${distanceFeet(gesture.orig, pos, enc.grid)} ft`;
      measure.style.left = `${pos.x}px`;
      measure.style.top = `${pos.y - px / 2}px`;
      measure.style.fontSize = `${Math.max(12, 14 / view.scale)}px`;
    }
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (!gesture) return;
    const g = gesture;
    if (g.type === 'pinch') { if (pointers.size < 2) gesture = null; return; }
    clearTimeout(g.longPress);
    gesture = null;
    measure.hidden = true;
    if (g.type === 'rect') {
      rectPreview.hidden = true;
      if (!g.rect || g.rect.w * view.scale < 12 || g.rect.h * view.scale < 12) { toast('Drag a bigger rectangle over the area.'); return; }
      setMode('normal');
      openLinkDialog(normalizeLink(g.rect, enc.width, enc.height));
      return;
    }
    if (g.type === 'pan' && !g.moved && g.linkId) {
      const l = enc.links.find((x) => x.id === g.linkId);
      if (l) followLink(l);
      return;
    }
    if (g.type === 'drag' && g.moved && g.pos) {
      const t = tokenById(g.id);
      commit(() => replaceToken({ ...t, x: g.pos.x, y: g.pos.y }));
    } else if (g.type === 'pan' && !g.moved && selectedId) {
      selectedId = null;
      drawTokens();
      drawSide();
    }
  }

  function onKey(e) {
    if (!enc || isTypingTarget(e.target) || document.querySelector('dialog[open]')) return;
    const t = tokenById(selectedId);
    const step = enc.grid.size;
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (t && moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      commit(() => replaceToken({ ...t, x: t.x + dx * step, y: t.y + dy * step }), { panel: false });
    } else if (e.key === 'n' || e.key === 'N') {
      commit(() => { enc = stepTurn(enc, e.shiftKey ? -1 : 1); });
    } else if (e.key === 'Escape' && mode === 'link') {
      setMode('normal');
    } else if (e.key === 'Escape' && selectedId) {
      selectedId = null; drawTokens(); drawSide();
    } else if (e.key === '+' || e.key === '=') zoomCenter(1.25);
    else if (e.key === '-') zoomCenter(1 / 1.25);
  }

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', onPointerUp);
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = viewport.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  viewport.addEventListener('dblclick', (e) => { if (mode === 'normal' && !e.target.closest('.map-token, .map-link')) openAddDialog(toImage(e.clientX, e.clientY)); });
  document.addEventListener('keydown', onKey);
  const onResize = () => { if (enc) applyTransform(); };
  window.addEventListener('resize', onResize);

  // ---------------------------------------------------------------- load
  side.append(h('p', { class: 'hint' }, 'Loading map…'));
  (async () => {
    try {
      enc = await getEncounter(id);
      if (!enc) { page.replaceChildren(h('h1', {}, 'Map not found'), h('p', {}, h('a', { class: 'btn', href: '#/map' }, 'Back to maps'))); return; }
      const blob = await getImageBlob(enc.imageId);
      if (blob) { imgUrl = URL.createObjectURL(blob); img.src = imgUrl; }
      stage.style.width = `${enc.width}px`;
      stage.style.height = `${enc.height}px`;
      img.style.width = `${enc.width}px`;
      img.style.height = `${enc.height}px`;
      await loadOthers();
      drawToolbar();
      drawGrid();
      drawLinks();
      drawTokens();
      drawSide();
      if (liveSession()) attachEditor(editorApi);
      let zoomed = false;
      try { zoomed = sessionStorage.getItem(ZOOM_KEY) === enc.id; sessionStorage.removeItem(ZOOM_KEY); } catch { /* ignore */ }
      requestAnimationFrame(() => {
        fit();
        if (zoomed) { viewport.classList.add('zoom-arrive'); setTimeout(() => viewport.classList.remove('zoom-arrive'), 600); }
      });
    } catch (err) {
      page.replaceChildren(h('p', { class: 'notice warn' }, err.message || String(err)));
    }
  })();

  return () => {
    if (enc) flush();
    unsubscribe();
    focus.destroy();
    detachEditor(editorApi);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    if (imgUrl) URL.revokeObjectURL(imgUrl);
  };
}
