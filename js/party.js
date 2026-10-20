// Parties: stored on the DM's device. Each party has a fixed code so players can rejoin every session.
// Players get a stable member id per browser so they keep "their" token when they reconnect.

import { partyCode, normalizeCode, newId } from './map-logic.js';

const PARTIES_KEY = 'characterforge.parties.v1';
const MEMBER_KEY = 'characterforge.member.v1';
const JOIN_KEY = 'characterforge.join.v1';

const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };

export function listParties() {
  const list = read(PARTIES_KEY, []);
  return Array.isArray(list) ? list.filter((p) => p && p.code) : [];
}

export function createParty(name) {
  const taken = new Set(listParties().map((p) => p.code));
  let code = partyCode();
  while (taken.has(code)) code = partyCode();
  const party = { id: newId('p'), name: String(name || '').trim().slice(0, 60) || 'My party', code, members: [], createdAt: Date.now() };
  write(PARTIES_KEY, [...listParties(), party]);
  return party;
}

export const getParty = (id) => listParties().find((p) => p.id === id) || null;

export function saveParty(party) {
  write(PARTIES_KEY, listParties().map((p) => (p.id === party.id ? party : p)));
  return party;
}

export function deleteParty(id) {
  write(PARTIES_KEY, listParties().filter((p) => p.id !== id));
}

/** Add or refresh a member from a player's hello message. */
export function upsertMember(party, hello) {
  const member = {
    memberId: String(hello.memberId || '').slice(0, 60),
    name: String(hello.name || 'Player').slice(0, 60),
    character: hello.character && typeof hello.character === 'object' ? hello.character : null,
    lastSeen: Date.now(),
  };
  if (!member.memberId) return party;
  const members = party.members.some((m) => m.memberId === member.memberId)
    ? party.members.map((m) => (m.memberId === member.memberId ? { ...m, ...member } : m))
    : [...party.members, member];
  return saveParty({ ...party, members });
}

/** This browser's player id (created once). */
export function myMemberId() {
  let id = read(MEMBER_KEY, null);
  if (!id) { id = newId('mem'); write(MEMBER_KEY, id); }
  return id;
}

/** Last used join details { code, name, characterId } so rejoining is one click. */
export const loadJoin = () => read(JOIN_KEY, {}) || {};
export const saveJoin = (j) => write(JOIN_KEY, { ...j, code: normalizeCode(j.code) });
