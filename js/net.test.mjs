// Run with: node js/net.test.mjs
import assert from 'node:assert/strict';
import { encodeParts, createDecoder, topicsFor } from './net.js';

let groups = 0;
const group = (name, fn) => { fn(); groups++; };

group('small messages travel whole; duplicates (one per relay) are dropped', () => {
  const decode = createDecoder();
  const [p] = encodeParts({ mid: 'a1', type: 'ping', from: 'x' });
  assert.deepEqual(decode(p), { mid: 'a1', type: 'ping', from: 'x' });
  assert.equal(decode(p), null);
  assert.equal(decode('not json'), null);
  assert.equal(decode(JSON.stringify({ type: 'no-mid' })), null);
});

group('big messages (map images) are split and reassembled in any order', () => {
  const big = { mid: 'img1', type: 'image', imageId: 'i', dataUrl: 'data:image/jpeg;base64,' + 'A'.repeat(200000) };
  const parts = encodeParts(big);
  assert.ok(parts.length > 3);
  assert.ok(parts.every((p) => p.length < 60 * 1024));
  const decode = createDecoder();
  const shuffled = [...parts].reverse();
  let out = null;
  shuffled.forEach((p, i) => { const r = decode(p); if (i < shuffled.length - 1) assert.equal(r, null); else out = r; });
  assert.deepEqual(out, big);
  shuffled.forEach((p) => assert.equal(decode(p), null)); // the same message from a second relay is ignored
});

group('topics per party', () => {
  const t = topicsFor('ABC234');
  assert.equal(t.up, 'cforge/v2/ABC234/up');
  assert.equal(t.down, 'cforge/v2/ABC234/down');
  assert.equal(t.to('mem_1'), 'cforge/v2/ABC234/to/mem_1');
});

console.log(`${groups} test groups passed`);
