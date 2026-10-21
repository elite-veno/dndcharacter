// Party page (#/party) and the player's live map (#/join/<code>).
// DM: create parties and go live with a map. Players: join with the code, see the DM's map live, move their own
// token (when allowed) and track their own hit points, which stay in sync with their character sheet.

import { h, toast, confirmDialog } from './ui.js';
import { field } from './steps/shared.js';
import { listCharacters, getCharacter, saveCharacter } from './store.js';
import { deriveCharacter } from './character.js';
import { normalizeSheet, currentHp } from './sheet-state.js';
import { CONDITIONS } from './data/index.js';
import { joinParty } from './net.js';
import { listParties, createParty, deleteParty, myMemberId, loadJoin, saveJoin } from './party.js';
import { liveSession, startLive, stopLive, joinLink } from './live-host.js';
import { listEncounters } from './map-store.js';
import {
  normalizeCode, snapToGrid, distanceFeet, initiativeOrder, initials, hpState, damageToken, healToken, memberMayMove,
} from './map-logic.js';

const go = (path) => { location.hash = `#${path}`; };
const CONDITION_NAME = Object.fromEntries(CONDITIONS.map((c) => [c.id, c.name]));

// ================================================================ #/party

export function renderParty(root) {
  const join = loadJoin();
  const chars = listCharacters();
  const codeIn = h('input', { id: 'join-code', type: 'text', maxlength: 8, value: join.code || '', placeholder: 'ABC234', autocomplete: 'off', class: 'party-code-input', oninput: (e) => { e.target.value = normalizeCode(e.target.value); } });
  const nameIn = h('input', { id: 'join-name', type: 'text', maxlength: 40, value: join.name || '', placeholder: 'Your name' });
  const charSel = h('select', { id: 'join-char' }, h('option', { value: '' }, 'No character (just watch)'), chars.map((c) => h('option', { value: c.id, selected: c.id === join.characterId }, c.name || 'Unnamed hero')));
  const joinNow = () => {
    const code = normalizeCode(codeIn.value);
    if (code.length !== 6) { toast('Type the 6-character party code from your DM.'); codeIn.focus(); return; }
    saveJoin({ code, name: nameIn.value.trim(), characterId: charSel.value || null });
    go(`/join/${code}`);
  };

  const partyBox = h('div', {});
  async function drawParties() {
    const parties = listParties();
    let maps = [];
    try { maps = await listEncounters(); } catch { /* no maps yet */ }
    const live = liveSession();
    partyBox.replaceChildren(
      parties.length ? h('ul', { class: 'party-list' }, parties.map((p) => {
        const mapSel = h('select', { 'aria-label': `Map for ${p.name}` }, maps.length ? maps.map((m) => h('option', { value: m.id }, m.name)) : h('option', { value: '' }, 'No maps yet'));
        const isLive = live && live.party.id === p.id;
        return h('li', { class: 'panel party-card' },
          h('div', { class: 'row gap party-head' }, h('h3', {}, p.name), isLive ? h('span', { class: 'tag good' }, '● Live') : null),
          h('p', {}, 'Code ', h('strong', { class: 'party-code' }, p.code), ' · ', h('a', { href: joinLink(p.code), onclick: (e) => { e.preventDefault(); navigator.clipboard?.writeText(joinLink(p.code)).then(() => toast('Invite link copied.'), () => toast(joinLink(p.code))); } }, 'copy invite link')),
          p.members.length ? h('p', { class: 'hint' }, `Members: ${p.members.map((m) => `${m.name}${m.character ? ` (${m.character.name})` : ''}`).join(', ')}`) : h('p', { class: 'hint' }, 'No members yet: they appear when players join.'),
          h('div', { class: 'row gap party-actions' },
            maps.length ? field('Map to show', mapSel) : h('p', { class: 'hint' }, h('a', { href: '#/map' }, 'Upload a map first'), ' to go live.'),
            maps.length ? h('button', { type: 'button', class: 'btn cta', onclick: async () => {
              try { await startLive(p.id); go(`/map/${mapSel.value}`); } catch (err) { toast(err.message); }
            } }, isLive ? 'Open map' : 'Go live') : null,
            isLive ? h('button', { type: 'button', class: 'btn', onclick: () => { stopLive(); drawParties(); } }, 'Stop live') : null,
            h('button', { type: 'button', class: 'btn danger small', onclick: async () => {
              if (!(await confirmDialog('Delete party', `Delete ${p.name}? Players will need a new code.`, 'Delete'))) return;
              if (isLive) stopLive();
              deleteParty(p.id);
              drawParties();
            } }, 'Delete')));
      })) : h('p', { class: 'empty' }, 'No parties yet.'));
  }
  const newName = h('input', { id: 'party-name', type: 'text', maxlength: 60, placeholder: 'e.g. The Lantern Bearers' });

  root.append(h('div', { class: 'page party-page' },
    h('h1', {}, 'Party'),
    h('p', { class: 'lead' }, 'Play together: the DM shows a map, every player sees it live on their own phone or laptop and moves their own figure. No accounts needed.'),
    h('div', { class: 'party-grid' },
      h('section', { class: 'panel' },
        h('h2', {}, 'Join a party (player)'),
        field('Party code', codeIn, 'Ask your DM for the 6-character code, or open the invite link.'),
        field('Your name', nameIn),
        field('Your character', charSel, chars.length ? 'Its HP, AC and initiative bonus are shared with the DM and stay in sync with your sheet.' : 'Create a character first if you want your stats on the map.'),
        h('button', { type: 'button', class: 'btn cta', onclick: joinNow }, 'Join')),
      h('section', { class: 'panel' },
        h('h2', {}, 'Run a party (DM)'),
        h('div', { class: 'row gap' }, field('New party', newName), h('button', { type: 'button', class: 'btn primary', onclick: () => { const p = createParty(newName.value); newName.value = ''; toast(`Party created. Code: ${p.code}`); drawParties(); } }, 'Create party')),
        partyBox))));
  drawParties();
}

// ================================================================ #/join/<code>: the player's live map

export function renderJoin(root, rawCode) {
  const code = normalizeCode(rawCode);
  const saved = loadJoin();
  const memberId = myMemberId();
  if (saved.code !== code) saveJoin({ ...saved, code });
  let characterId = saved.code === code || !saved.code ? saved.characterId || null : saved.characterId || null;
  let playerName = saved.name || '';
  let map = null; // public map state from the DM
  let roster = []; // party members as the DM sees them (with online status)
  let imageId = null;
  let imgUrl = null;
  let conn = null;
  let lastSentHp = null;
  const view = { scale: 1, x: 0, y: 0, fitted: false };
  const pointers = new Map();
  let gesture = null;

  // Ask for name/character first when unknown (e.g. opened from an invite link).
  if (!playerName) {
    const chars = listCharacters();
    const nameIn = h('input', { id: 'jn-name', type: 'text', maxlength: 40, placeholder: 'Your name' });
    const charSel = h('select', { id: 'jn-char' }, h('option', { value: '' }, 'No character (just watch)'), chars.map((c) => h('option', { value: c.id }, c.name || 'Unnamed hero')));
    root.append(h('div', { class: 'page party-page' },
      h('h1', {}, `Join party ${code}`),
      h('section', { class: 'panel narrow' },
        field('Your name', nameIn), field('Your character', charSel),
        h('button', { type: 'button', class: 'btn cta', onclick: () => {
          if (!nameIn.value.trim()) { nameIn.focus(); toast('Type your name.'); return; }
          saveJoin({ code, name: nameIn.value.trim(), characterId: charSel.value || null });
          root.replaceChildren();
          renderJoin(root, code);
        } }, 'Join'))));
    setTimeout(() => nameIn.focus(), 0);
    return undefined;
  }

  // ---------------------------------------------------------------- my character (local sheet)
  function myCharacter() {
    const c = characterId && getCharacter(characterId);
    if (!c) return null;
    const d = deriveCharacter(c);
    c.sheet = normalizeSheet(c.sheet, { gold: d.gold });
    return { c, d, max: d.hp };
  }
  function snapshot() {
    const mc = myCharacter();
    if (!mc) return null;
    const { c, d, max } = mc;
    return {
      name: c.name || playerName, classLine: `Level ${d.level} ${[d.species?.name, d.cls?.name].filter(Boolean).join(' ')}`,
      hp: { max, current: currentHp(c.sheet.hp, max), temp: c.sheet.hp.temp || 0 }, ac: d.ac.ac, initBonus: d.initiative,
    };
  }

  // ---------------------------------------------------------------- layout
  const statusEl = h('span', { class: 'live-status', role: 'status' }, 'Connecting…');
  const viewport = h('div', { class: 'map-viewport', tabindex: 0, 'aria-label': 'Live party map. Drag the background to pan, scroll or pinch to zoom, drag your own token to move.' });
  const stage = h('div', { class: 'map-stage' });
  const img = h('img', { class: 'map-image', alt: '', draggable: false });
  const gridEl = h('div', { class: 'map-grid', 'aria-hidden': 'true' });
  const tokenLayer = h('div', { class: 'map-tokens' });
  const measure = h('div', { class: 'map-measure', hidden: true });
  stage.append(img, gridEl, tokenLayer, measure);
  const waiting = h('div', { class: 'live-waiting' }, h('p', {}, 'Waiting for the DM to show a map…'));
  viewport.append(stage, waiting);
  const side = h('aside', { class: 'map-side' });
  const title = h('h1', { class: 'live-title' }, `Party ${code}`);
  root.append(h('div', { class: 'page map-editor live-player' },
    h('div', { class: 'map-toolbar' }, h('div', { class: 'row gap map-toolbar-row' },
      h('a', { class: 'btn small', href: '#/party' }, '← Party'),
      title, statusEl,
      h('span', { class: 'btn-pair' },
        h('button', { type: 'button', class: 'btn small', 'aria-label': 'Zoom out', onclick: () => zoomCenter(1 / 1.25) }, '−'),
        h('button', { type: 'button', class: 'btn small', 'aria-label': 'Zoom in', onclick: () => zoomCenter(1.25) }, '+'),
        h('button', { type: 'button', class: 'btn small', onclick: fit }, 'Fit')),
      h('button', { type: 'button', class: 'btn small', onclick: () => { const t = myToken(); if (t) centerOn(t); else toast('You are not on the map yet.'); } }, 'Find me'))),
    h('div', { class: 'map-body' }, viewport, side)));

  // ---------------------------------------------------------------- view transform
  const applyTransform = () => { stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`; };
  function fit() {
    const r = viewport.getBoundingClientRect();
    if (!r.width || !map) return;
    view.scale = Math.min(r.width / map.width, r.height / map.height) * 0.98;
    view.x = (r.width - map.width * view.scale) / 2;
    view.y = (r.height - map.height * view.scale) / 2;
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
  const zoomCenter = (f) => { const r = viewport.getBoundingClientRect(); zoomAt(f, r.width / 2, r.height / 2); };
  const toImage = (cx, cy) => { const r = viewport.getBoundingClientRect(); return { x: (cx - r.left - view.x) / view.scale, y: (cy - r.top - view.y) / view.scale }; };
  function centerOn(t) { const r = viewport.getBoundingClientRect(); view.x = r.width / 2 - t.x * view.scale; view.y = r.height / 2 - t.y * view.scale; applyTransform(); }
  const myToken = () => (map ? map.tokens.find((t) => t.memberId === memberId) : null);

  // ---------------------------------------------------------------- drawing
  function drawMap() {
    if (!map) { waiting.hidden = false; stage.hidden = true; title.textContent = `Party ${code}`; tokenLayer.replaceChildren(); return; }
    waiting.hidden = true;
    stage.hidden = false;
    title.textContent = map.name;
    stage.style.width = `${map.width}px`; stage.style.height = `${map.height}px`;
    img.style.width = `${map.width}px`; img.style.height = `${map.height}px`;
    const g = map.grid;
    gridEl.hidden = !g.show;
    gridEl.style.backgroundSize = `${g.size}px ${g.size}px`;
    gridEl.style.backgroundPosition = `${g.offsetX}px ${g.offsetY}px`;
    gridEl.style.setProperty('--grid-color', g.color);
    gridEl.style.setProperty('--grid-line', `${Math.max(1, g.size / 50)}px`);
    const ordered = [...map.tokens].sort((a, b) => (a.kind === 'marker' ? 0 : 1) - (b.kind === 'marker' ? 0 : 1));
    tokenLayer.replaceChildren(...ordered.map(tokenEl));
    if (!view.fitted) { view.fitted = true; requestAnimationFrame(fit); }
  }

  function hpInfo(t) {
    if (!t.hp) return null;
    if (t.hp.state !== undefined) return { state: t.hp.state, pct: t.hp.state === 'down' ? 0 : t.hp.state === 'bloodied' ? 40 : 100, text: t.hp.state === 'down' ? 'down' : t.hp.state === 'bloodied' ? 'bloodied' : 'unhurt' };
    return { state: hpState(t.hp), pct: t.hp.max ? Math.round((t.hp.current / t.hp.max) * 100) : 0, text: `${t.hp.current}/${t.hp.max}` };
  }

  function tokenEl(t) {
    const px = t.size * map.grid.size;
    const info = hpInfo(t);
    const mine = t.memberId === memberId;
    const active = map.turn.activeId === t.id;
    return h('button', {
      type: 'button', class: `map-token kind-${t.kind}${mine ? ' mine selected' : ''}${active ? ' active' : ''}${info && info.state ? ` ${info.state}` : ''}`,
      dataset: { id: t.id }, 'aria-label': `${t.name}${info ? `, ${info.text}` : ''}${mine ? ' (you)' : ''}${active ? ', current turn' : ''}`,
      title: `${t.name}${mine ? ' (you)' : ''}${info ? ` · ${info.text}` : ''}${t.ac !== null && t.ac !== undefined ? ` · AC ${t.ac}` : ''}${t.conditions.length ? ` · ${t.conditions.map((c) => CONDITION_NAME[c] || c).join(', ')}` : ''}`,
      style: `left:${t.x - px / 2}px;top:${t.y - px / 2}px;width:${px}px;height:${px}px;--token-color:${t.color};font-size:${Math.max(8, px * 0.36)}px`,
    },
    h('span', { class: 'map-token-label' }, info && info.state === 'down' ? '✖' : (t.label || initials(t.name))),
    info ? h('span', { class: 'map-token-hp', style: `--pct:${Math.max(0, Math.min(100, info.pct))}%` }) : null,
    t.conditions.length ? h('span', { class: 'map-token-cond' }, String(t.conditions.length)) : null);
  }

  function drawSide() {
    const me = myToken();
    const order = map ? initiativeOrder(map.tokens) : [];
    const canMove = map && me && memberMayMove(me, memberId, map.settings);
    const amount = h('input', { type: 'number', min: 0, max: 999, class: 'map-amount', placeholder: 'Amount', 'aria-label': 'Amount' });
    const act = (mode) => {
      const v = Math.floor(Number(amount.value) || 0);
      if (!v || !me || !me.hp || me.hp.state !== undefined) { amount.focus(); return; }
      let next = me;
      if (mode === 'damage') next = damageToken(me, v);
      else if (mode === 'heal') next = healToken(me, v);
      else next = { ...me, hp: { ...me.hp, temp: Math.max(me.hp.temp, v) } };
      sendHp(next.hp);
      writeLocalHp(next.hp);
      Object.assign(me, next);
      drawMap(); drawSide();
    };
    side.replaceChildren(
      h('section', { class: 'panel' },
        h('h2', {}, me ? me.name : playerName),
        me && me.hp && me.hp.current !== undefined ? h('div', { class: 'map-hp' },
          h('div', { class: 'map-hp-line' }, h('strong', {}, `HP ${me.hp.current} / ${me.hp.max}`), me.hp.temp ? h('span', { class: 'tag good' }, `+${me.hp.temp} temp`) : null),
          h('div', { class: 'hp-bar' }, h('span', { class: `hp-fill${hpState(me.hp) !== 'healthy' ? ' low' : ''}`, style: `width:${me.hp.max ? Math.round((me.hp.current / me.hp.max) * 100) : 0}%` })),
          h('div', { class: 'row gap map-hp-actions' }, amount,
            h('button', { type: 'button', class: 'btn small danger', onclick: () => act('damage') }, 'Damage'),
            h('button', { type: 'button', class: 'btn small', onclick: () => act('heal') }, 'Heal'),
            h('button', { type: 'button', class: 'btn small', onclick: () => act('temp') }, 'Temp')),
          characterId ? h('p', { class: 'hint' }, 'Synced with your character sheet.') : null) : null,
        me && me.conditions.length ? h('p', {}, h('strong', {}, 'Conditions: '), me.conditions.map((c) => CONDITION_NAME[c] || c).join(', ')) : null,
        h('p', { class: 'hint' }, !map ? 'Waiting for the DM to show a map.' : !me ? 'The DM has not put you on this map yet.' : canMove ? 'Drag your token (blue outline) to move. The DM sees it right away.' : 'The DM moves the tokens on this map.'),
        characterId ? h('a', { class: 'btn small', href: `#/sheet/${characterId}` }, 'Open my sheet') : null),
      h('section', { class: 'panel' },
        h('h2', {}, `Party (${roster.filter((m) => m.online).length} online)`),
        roster.length ? h('ul', { class: 'map-rows' }, roster.map((m) => h('li', { class: 'map-link-row' },
          h('span', { class: `online-dot${m.online ? ' on' : ''}`, 'aria-label': m.online ? 'online' : 'offline' }),
          h('span', { class: 'map-row-name' }, m.name, m.memberId === memberId ? ' (you)' : '', m.character ? h('small', { class: 'hint' }, ` · ${m.character.name}${m.character.classLine ? `, ${m.character.classLine}` : ''}`) : null))))
          : h('p', { class: 'hint' }, 'The party list appears when you are connected to the DM.')),
      h('section', { class: 'panel' },
        h('h2', {}, `Turn order${map ? ` · round ${map.turn.round}` : ''}`),
        order.length ? h('ol', { class: 'map-rows' }, order.map((t) => {
          const info = hpInfo(t);
          return h('li', {}, h('div', { class: `map-row${map.turn.activeId === t.id ? ' active' : ''}${t.memberId === memberId ? ' selected' : ''}` },
            h('span', { class: 'map-dot', style: `--token-color:${t.color}` }),
            h('span', { class: 'map-row-name' }, t.name, t.memberId === memberId ? ' (you)' : ''),
            h('span', { class: 'tag' }, `Init ${t.init}`),
            info ? h('span', { class: `tag${info.state === 'down' ? ' bad' : info.state === 'bloodied' ? ' warn-tag' : ''}` }, info.text) : null));
        })) : h('p', { class: 'hint' }, 'No initiative yet.')));
  }

  // ---------------------------------------------------------------- HP sync with the local sheet
  function writeLocalHp(hp) {
    const mc = myCharacter();
    if (!mc || !hp || hp.current === undefined) return;
    const cur = currentHp(mc.c.sheet.hp, mc.max);
    if (cur === hp.current && (mc.c.sheet.hp.temp || 0) === (hp.temp || 0)) return;
    mc.c.sheet.hp = { ...mc.c.sheet.hp, current: Math.min(mc.max, Math.max(0, hp.current)), temp: hp.temp || 0 };
    saveCharacter(mc.c);
  }
  function sendHp(hp) {
    lastSentHp = `${hp.current}/${hp.max}/${hp.temp}`;
    if (conn) conn.send({ type: 'hp', current: hp.current, max: hp.max, temp: hp.temp });
  }

  // ---------------------------------------------------------------- pointer: pan, zoom, drag own token
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.setPointerCapture(e.pointerId);
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; gesture = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale }; return; }
    const node = e.target.closest('.map-token');
    const t = node && map ? map.tokens.find((x) => x.id === node.dataset.id) : null;
    if (t && memberMayMove(t, memberId, map.settings)) gesture = { type: 'drag', id: t.id, node, start: toImage(e.clientX, e.clientY), orig: { x: t.x, y: t.y } };
    else gesture = { type: 'pan', sx: e.clientX, sy: e.clientY, x0: view.x, y0: view.y };
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!gesture) return;
    if (gesture.type === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const r = viewport.getBoundingClientRect();
      zoomAt((gesture.scale * (Math.hypot(a.x - b.x, a.y - b.y) / gesture.dist)) / view.scale, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
    } else if (gesture.type === 'pan') {
      view.x = gesture.x0 + e.clientX - gesture.sx; view.y = gesture.y0 + e.clientY - gesture.sy; applyTransform();
    } else if (gesture.type === 'drag') {
      const t = map.tokens.find((x) => x.id === gesture.id);
      if (!t) return;
      const p = toImage(e.clientX, e.clientY);
      const x = gesture.orig.x + p.x - gesture.start.x;
      const y = gesture.orig.y + p.y - gesture.start.y;
      const pos = map.grid.snap ? snapToGrid(x, y, map.grid, t.size) : { x, y };
      const px = t.size * map.grid.size;
      gesture.node.style.left = `${pos.x - px / 2}px`; gesture.node.style.top = `${pos.y - px / 2}px`;
      gesture.pos = pos;
      measure.hidden = false;
      measure.textContent = `${distanceFeet(gesture.orig, pos, map.grid)} ft`;
      measure.style.left = `${pos.x}px`; measure.style.top = `${pos.y - px / 2}px`;
      measure.style.fontSize = `${Math.max(12, 14 / view.scale)}px`;
    }
  });
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (!gesture) return;
    if (gesture.type === 'pinch') { if (pointers.size < 2) gesture = null; return; }
    const g = gesture;
    gesture = null;
    measure.hidden = true;
    if (g.type === 'drag' && g.pos) {
      const t = map.tokens.find((x) => x.id === g.id);
      if (t) { t.x = g.pos.x; t.y = g.pos.y; }
      if (conn) conn.send({ type: 'move', tokenId: g.id, x: g.pos.x, y: g.pos.y });
    }
  };
  viewport.addEventListener('pointerup', up);
  viewport.addEventListener('pointercancel', up);
  viewport.addEventListener('wheel', (e) => { e.preventDefault(); const r = viewport.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  const onResize = () => applyTransform();
  window.addEventListener('resize', onResize);

  // ---------------------------------------------------------------- connection
  let ended = false; // the DM stopped the session: keep saying so instead of "reconnecting" until the DM is back
  const setStatus = (text, state) => {
    if (ended && state !== 'live') return;
    statusEl.textContent = text;
    statusEl.className = `live-status state-${state}`;
  };
  function onMessage(msg) {
    if (msg.type === 'welcome') { ended = false; setStatus(`Connected to ${msg.party}`, 'live'); return; }
    if (msg.type === 'ended') { setStatus('The DM ended the live session. This page reconnects by itself when the DM goes live again.', 'waiting'); ended = true; map = null; drawMap(); drawSide(); return; }
    if (msg.type === 'idle') { map = null; drawMap(); drawSide(); return; }
    if (msg.type === 'image') {
      if (msg.imageId === imageId) return;
      imageId = msg.imageId;
      if (imgUrl) URL.revokeObjectURL(imgUrl);
      imgUrl = null;
      if (msg.dataUrl) fetch(msg.dataUrl).then((r) => r.blob()).then((b) => { imgUrl = URL.createObjectURL(b); img.src = imgUrl; });
      else img.removeAttribute('src');
      view.fitted = false;
      return;
    }
    if (Array.isArray(msg.roster)) { roster = msg.roster; if (!(document.activeElement && side.contains(document.activeElement))) drawSide(); }
    if (msg.type === 'state' && msg.map) {
      const changedMap = !map || map.id !== msg.map.id;
      if (gesture && gesture.type === 'drag') {
        // Keep the token being dragged where the finger is.
        const keep = msg.map.tokens.find((t) => t.id === gesture.id);
        if (keep && gesture.pos) { keep.x = gesture.pos.x; keep.y = gesture.pos.y; }
      }
      map = msg.map;
      if (changedMap) view.fitted = false;
      const me = myToken();
      if (me && me.hp && me.hp.current !== undefined && `${me.hp.current}/${me.hp.max}/${me.hp.temp}` !== lastSentHp) writeLocalHp(me.hp);
      drawMap();
      if (!(document.activeElement && side.contains(document.activeElement))) drawSide();
      return;
    }
    if (msg.type === 'moving' && map && !(gesture && gesture.id === msg.id)) {
      const t = map.tokens.find((x) => x.id === msg.id);
      const node = tokenLayer.querySelector(`[data-id="${CSS.escape(msg.id)}"]`);
      if (t && node) { const px = t.size * map.grid.size; node.style.left = `${msg.x - px / 2}px`; node.style.top = `${msg.y - px / 2}px`; }
    }
  }

  drawMap();
  drawSide();
  joinParty(code, {
    onStatus: setStatus,
    onOpen: () => conn && conn.send({ type: 'hello', memberId, name: playerName, character: snapshot() }),
    onMessage,
  }).then((c) => { conn = c; conn.send({ type: 'hello', memberId, name: playerName, character: snapshot() }); }).catch((err) => setStatus(err.message || String(err), 'error'));

  return () => {
    if (conn) conn.close();
    window.removeEventListener('resize', onResize);
    if (imgUrl) URL.revokeObjectURL(imgUrl);
  };
}
