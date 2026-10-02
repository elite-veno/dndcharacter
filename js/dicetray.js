// Dice tray: free dice roller, animated result and the persistent roll log. Also the single place every roll on the
// sheet goes through, so each one is logged. All randomness and maths live in dice.js; this file is the browser UI.
// Real browser time is only used here, for log timestamps.

import { h } from './ui.js';
import { DIE_SIZES, rollDie, rollD20Test, rollExpression, formatRoll, combineModes, attackOutcome } from './dice.js';

const LOG_KEY = 'characterforge.rolllog.v1';
const LOG_LIMIT = 100;
const MODE_LABELS = { normal: 'Normal', advantage: 'Advantage', disadvantage: 'Disadvantage' };

function loadLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    return Array.isArray(raw) ? raw.slice(0, LOG_LIMIT) : [];
  } catch {
    return [];
  }
}

function saveLog(log) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, LOG_LIMIT))); } catch { /* storage unavailable: the log is still shown this session */ }
}

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const formatTime = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const signed = (n) => (n >= 0 ? `+${n}` : `${n}`);

/**
 * Build the tray. Returns the controller:
 *   el                     the tray element (mount it once, outside the re-rendered sheet)
 *   mode / setMode(mode)   the one-shot Advantage / Disadvantage toggle shared by the sheet and the tray
 *   modeControl()          a segmented control node bound to that toggle
 *   modeFromEvent(e)       shift-click = Advantage, ctrl/alt/cmd-click = Disadvantage
 *   rollD20({ label, bonus, mode, penalty, attack, targetAC })   -> d20 test result (+ outcome)
 *   rollDamage({ label, expr, crit, minDie, kind })              -> expression result
 *   rollExpr(label, expr, opts)                                  -> same, for any expression
 *   rollFlat(label, total, detail)                               -> fixed amount, no dice
 *   note(label, text)      add a plain line to the log (spell cast, rest, ...)
 */
export function createDiceTray({ rng = () => Math.random() } = {}) {
  let log = loadLog();
  let mode = 'normal';
  let open = false;
  let flickerTimer = null;
  const controls = new Set();

  const resultBox = h('div', { class: 'tray-result', 'aria-live': 'polite', 'aria-atomic': 'true' },
    h('p', { class: 'tray-hint' }, 'Roll a die or click any check, save, attack or spell on the sheet.'));
  const logList = h('ol', { class: 'roll-log-list', 'aria-label': 'Roll log' });
  const lastChip = h('span', { class: 'tray-last' });
  const toggle = h('button', {
    type: 'button', class: 'tray-toggle', 'aria-expanded': 'false', 'aria-controls': 'tray-panel',
    onclick: () => setOpen(!open),
  }, h('span', { 'aria-hidden': 'true', class: 'tray-icon' }, '⚄'), h('span', {}, 'Dice'), lastChip);
  const panel = h('div', { class: 'tray-panel', id: 'tray-panel', hidden: true, role: 'region', 'aria-label': 'Dice tray' });
  const el = h('aside', { class: 'dice-tray' }, panel, toggle);

  // ---------------------------------------------------------------- mode toggle

  function refreshControls() {
    for (const node of [...controls]) {
      if (!node.isConnected) { controls.delete(node); continue; }
      node.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    }
  }

  function setMode(next) {
    mode = next in MODE_LABELS ? next : 'normal';
    refreshControls();
  }

  function modeControl() {
    const node = h('div', { class: 'mode-toggle', role: 'group', 'aria-label': 'Next d20 roll' },
      Object.entries(MODE_LABELS).map(([value, label]) => h('button', {
        type: 'button', class: 'mode-btn', dataset: { mode: value }, 'aria-pressed': String(mode === value),
        title: value === 'normal' ? 'Roll one d20' : `${label}: roll two d20s and keep the ${value === 'advantage' ? 'higher' : 'lower'} (applies to the next d20 roll only)`,
        onclick: () => setMode(mode === value && value !== 'normal' ? 'normal' : value),
      }, label)));
    controls.add(node);
    return node;
  }

  function modeFromEvent(e) {
    if (e && e.shiftKey) return 'advantage';
    if (e && (e.ctrlKey || e.altKey || e.metaKey)) return 'disadvantage';
    return 'normal';
  }

  // ---------------------------------------------------------------- log + presentation

  function renderLog() {
    logList.replaceChildren();
    if (!log.length) {
      logList.append(h('li', { class: 'roll-empty' }, 'No rolls yet.'));
      return;
    }
    for (const e of log) {
      logList.append(h('li', { class: `roll-entry ${e.flag || ''}` },
        h('time', { datetime: new Date(e.t).toISOString() }, formatTime(e.t)),
        h('span', { class: 'roll-label' }, e.label),
        e.total !== null ? h('strong', { class: 'roll-total' }, e.total) : null,
        h('span', { class: 'roll-detail' }, e.detail)));
    }
  }

  function addLog(entry) {
    const full = { t: Date.now(), flag: null, total: null, ...entry };
    log = [full, ...log].slice(0, LOG_LIMIT);
    saveLog(log);
    renderLog();
    lastChip.textContent = full.total !== null ? `${full.label}: ${full.total}` : full.label;
    return full;
  }

  function diceFaces(rolls, keptIndex, sides) {
    return h('div', { class: 'tray-dice' }, rolls.map((v, i) => h('span', {
      class: `face d${sides}${keptIndex !== undefined && keptIndex !== i ? ' dropped' : ''}`, 'aria-hidden': 'true',
    }, v)));
  }

  /** Show a result with a short tumble animation (skipped when the user prefers reduced motion). */
  function present({ label, total, detail, flag, faces }) {
    clearInterval(flickerTimer);
    const num = h('output', { class: 'tray-total' }, total);
    const badge = flag === 'crit' ? h('span', { class: 'badge crit' }, 'Natural 20!') : flag === 'fumble' ? h('span', { class: 'badge fumble' }, 'Natural 1') : null;
    resultBox.replaceChildren(...[
      h('p', { class: 'tray-label' }, label),
      h('div', { class: `tray-stage ${flag || ''}` }, faces || null, num),
      badge,
      h('p', { class: 'tray-detail' }, detail),
    ].filter(Boolean));
    const stage = resultBox.querySelector('.tray-stage');
    if (reducedMotion()) return;
    stage.classList.add('rolling');
    let ticks = 0;
    flickerTimer = setInterval(() => {
      ticks += 1;
      num.textContent = String(rollDie(20, rng));
      if (ticks >= 9) {
        clearInterval(flickerTimer);
        num.textContent = String(total);
        stage.classList.remove('rolling');
        stage.classList.add('landed');
      }
    }, 55);
  }

  function setOpen(next) {
    open = next;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    el.classList.toggle('open', open);
  }

  // ---------------------------------------------------------------- rolling

  function rollD20({ label, bonus = 0, mode: extraMode = 'normal', penalty = 0, attack = false, targetAC = null } = {}) {
    const used = combineModes(mode, extraMode);
    const test = rollD20Test({ bonus, mode: used, penalty, rng });
    const modeText = used === 'normal' ? '' : ` (${MODE_LABELS[used]})`;
    const dice = test.rolls.length > 1 ? `d20 [${test.rolls.map((v, i) => (i === test.keptIndex ? v : `(${v})`)).join(', ')}]` : `d20 [${test.natural}]`;
    const mods = `${bonus ? ` ${signed(bonus)}` : ''}${penalty ? ` -${penalty} Exhaustion` : ''}`;
    const outcome = attack ? attackOutcome(test, targetAC) : null;
    const flag = test.crit ? 'crit' : test.fumble ? 'fumble' : null;
    let detail = `${dice}${mods} = ${test.total}${modeText}`;
    if (attack) {
      if (outcome === 'crit') detail += ' · Critical hit: always hits, roll damage twice the dice';
      else if (outcome === 'fumble') detail += ' · Natural 1: automatic miss';
      else if (outcome === 'hit') detail += ` · Hits AC ${targetAC}`;
      else if (outcome === 'miss') detail += ` · Misses AC ${targetAC}`;
    }
    addLog({ label, kind: 'd20', total: test.total, detail, flag });
    present({ label, total: test.total, detail, flag, faces: diceFaces(test.rolls, test.keptIndex, 20) });
    setOpen(true);
    setMode('normal'); // advantage / disadvantage applies to one roll only
    return { ...test, outcome };
  }

  function rollExpr(label, expr, { crit = false, minDie = 0, kind = 'dice' } = {}) {
    const result = rollExpression(expr, { rng, crit, minDie });
    const minNote = minDie && result.terms.some((t) => t.raw.some((v, i) => v !== t.rolls[i])) ? ' · Great Weapon Fighting: 1s and 2s count as 3' : '';
    const detail = `${formatRoll(result)}${crit ? ' · Critical hit: dice doubled' : ''}${minNote}`;
    const flag = crit ? 'crit' : null;
    addLog({ label, kind, total: result.total, detail, flag });
    const first = result.terms[0];
    present({ label, total: result.total, detail, flag, faces: first && result.terms.length === 1 && first.count <= 12 ? diceFaces(first.rolls, undefined, first.sides) : null });
    setOpen(true);
    return result;
  }

  const rollDamage = ({ label, expr, crit = false, minDie = 0, kind = 'damage' }) => rollExpr(label, expr, { crit, minDie, kind });

  /** Log a fixed amount that needs no dice (an Unarmed Strike dealing 1 + Str, a flat heal). */
  function rollFlat(label, total, detail = '') {
    addLog({ label, kind: 'damage', total, detail });
    present({ label, total, detail, flag: null, faces: null });
    setOpen(true);
    return { total };
  }

  function note(label, text) {
    addLog({ label, kind: 'note', total: null, detail: text });
  }

  // ---------------------------------------------------------------- free roller UI

  const countInput = h('input', { type: 'number', id: 'tray-count', min: 1, max: 100, value: 1, 'aria-label': 'Number of dice' });
  const modInput = h('input', { type: 'number', id: 'tray-mod', min: -99, max: 99, value: 0, 'aria-label': 'Modifier' });
  const exprInput = h('input', { type: 'text', id: 'tray-expr', placeholder: '2d6+3', autocomplete: 'off', spellcheck: false, 'aria-label': 'Dice expression' });
  const exprError = h('p', { class: 'tray-error', role: 'alert', hidden: true });

  const readInt = (input, min, max, fallback) => {
    const n = Math.trunc(Number(input.value));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };

  function rollQuick(sides) {
    const count = readInt(countInput, 1, 100, 1);
    const mod = readInt(modInput, -99, 99, 0);
    if (sides === 20 && count === 1) return rollD20({ label: 'd20', bonus: mod });
    return rollExpr(`${count}d${sides}${mod ? signed(mod) : ''}`, `${count}d${sides}${mod ? signed(mod) : ''}`);
  }

  function rollTyped(e) {
    e.preventDefault();
    exprError.hidden = true;
    const text = exprInput.value.trim();
    try {
      rollExpr(text, text);
    } catch (err) {
      exprError.textContent = err.message;
      exprError.hidden = false;
    }
  }

  panel.append(
    h('div', { class: 'tray-head' },
      h('h2', {}, 'Dice Tray'),
      h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close dice tray', onclick: () => setOpen(false) }, '×')),
    resultBox,
    h('div', { class: 'tray-body' },
      h('div', { class: 'die-buttons', role: 'group', 'aria-label': 'Roll a die' },
        DIE_SIZES.map((s) => h('button', { type: 'button', class: 'die-btn', onclick: () => rollQuick(s), 'aria-label': `Roll d${s}` }, `d${s}`))),
      h('div', { class: 'tray-fields' },
        h('label', { for: 'tray-count' }, 'Dice', countInput),
        h('label', { for: 'tray-mod' }, 'Modifier', modInput),
        modeControl()),
      h('form', { class: 'tray-expr', onsubmit: rollTyped },
        h('label', { for: 'tray-expr' }, 'Expression'),
        h('div', { class: 'row' }, exprInput, h('button', { type: 'submit', class: 'btn primary' }, 'Roll')),
        exprError,
        h('p', { class: 'hint' }, 'Try 2d6+3, d20-1, 1d8+1d6+2 or 4d6kh3 (keep highest 3).')),
      h('div', { class: 'log-head' },
        h('h3', {}, 'Roll log'),
        h('button', { type: 'button', class: 'btn small', onclick: () => { log = []; saveLog(log); renderLog(); lastChip.textContent = ''; } }, 'Clear')),
      logList));

  renderLog();
  if (log[0]) lastChip.textContent = log[0].total !== null ? `${log[0].label}: ${log[0].total}` : log[0].label;

  return {
    el, modeControl, modeFromEvent, rollD20, rollDamage, rollExpr, rollFlat, note, setMode, open: () => setOpen(true),
    get mode() { return mode; },
  };
}
