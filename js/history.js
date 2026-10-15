// Undo / redo history for the character sheet. Pure and storage-free: it holds JSON snapshots (strings) of the whole
// character, newest last, capped at `limit` mutations. The sheet takes a snapshot before and after every change and
// hands both to commit(); undo()/redo() return the snapshot to restore.

export const HISTORY_LIMIT = 30;

/**
 * Snapshot of a character for the history. The selected sheet tab is view state, not a mutation, so it is left out
 * (switching tabs must never create an undo step, and undoing must not switch tabs).
 */
export function snapshotOf(c) {
  const { sheet, ...rest } = c;
  const { tab: _tab, ...sheetRest } = sheet || {};
  return JSON.stringify({ ...rest, sheet: sheetRest });
}

/**
 * Replace the contents of `target` with a snapshot (in place, so every reference to the character stays valid).
 * The currently selected sheet tab is kept.
 */
export function restoreInto(target, snapshot) {
  const tab = target.sheet?.tab;
  const parsed = JSON.parse(snapshot);
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, parsed);
  if (tab !== undefined) target.sheet = { ...(target.sheet || {}), tab };
  return target;
}

/**
 * Create a history.
 *   commit(before, after, { key, now })  record a change; identical snapshots are ignored. Changes sharing a `key`
 *                                        made within `coalesceMs` of each other (typing) merge into one step.
 *   undo(current) / redo(current)        return the snapshot to restore (or null) and remember `current` for the
 *                                        opposite direction.
 */
export function createHistory({ limit = HISTORY_LIMIT, coalesceMs = 1500 } = {}) {
  let past = [];
  let future = [];
  let lastKey = null;
  let lastAt = 0;

  return {
    commit(before, after, { key = null, now = Date.now() } = {}) {
      if (before === after) return false;
      future = [];
      const merge = key !== null && key === lastKey && now - lastAt < coalesceMs && past.length > 0;
      lastKey = key;
      lastAt = now;
      if (merge) return false;
      past.push(before);
      if (past.length > limit) past = past.slice(past.length - limit);
      return true;
    },
    undo(current) {
      if (!past.length) return null;
      const snap = past.pop();
      future.push(current);
      lastKey = null;
      return snap;
    },
    redo(current) {
      if (!future.length) return null;
      const snap = future.pop();
      past.push(current);
      lastKey = null;
      return snap;
    },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    get undoCount() { return past.length; },
    get redoCount() { return future.length; },
    clear() { past = []; future = []; lastKey = null; },
  };
}

/** Is this keyboard event target a place where typing happens (native undo should win)? */
export function isTypingTarget(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea' || tag === 'select') return true;
  if (tag === 'input') return !['button', 'checkbox', 'radio', 'submit', 'reset', 'range', 'color', 'file', 'image'].includes((el.type || 'text').toLowerCase());
  return !!el.isContentEditable;
}
