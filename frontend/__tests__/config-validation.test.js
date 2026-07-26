// T-214 — inputs are validated (block until valid), never clamped. `validateNumber` is a pure exported
// helper → unit-tested directly; the DOM wiring is asserted by source inspection (the test harness has no
// full form DOM).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateNumber } from '../js/config-form.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.resolve(__dirname, '../js/config-form.js'), 'utf8');

test('validateNumber: in-range values are valid (null)', () => {
  assert.equal(validateNumber('5', { min: 0, max: 8, step: 1 }), null);
  assert.equal(validateNumber('0', { min: 0, max: 4, step: 1 }), null);
  assert.equal(validateNumber('0.05', { min: 0, max: 1, step: 0.01 }), null); // fractional allowed
});

test('validateNumber: out-of-range → a "between" message (no clamp)', () => {
  assert.match(validateNumber('99', { min: 0, max: 8, step: 1 }), /between 0 and 8/);
  assert.match(validateNumber('-5', { min: 0, max: 8, step: 1 }), /between 0 and 8/);
  assert.match(validateNumber('9', { min: 0, max: 4, step: 1 }), /between 0 and 4/);
});

test('validateNumber: non-integer blocked when the step is a whole number', () => {
  assert.match(validateNumber('2.5', { min: 0, max: 8, step: 1 }), /whole number/);
});

test('validateNumber: non-numeric is invalid', () => {
  assert.match(validateNumber('abc', { min: 0, max: 8, step: 1 }), /must be a number/);
});

test('validateNumber: blank blocks unless allowBlank (seeds are optional)', () => {
  assert.match(validateNumber('', { min: 0, max: 8 }), /enter a value/);
  assert.equal(validateNumber('', { min: 0, max: 4294967295, allowBlank: true }), null); // blank = random
});

test('validateNumber: seeds are bounded to uint32', () => {
  assert.equal(validateNumber('4294967295', { min: 0, max: 4294967295, step: 1, allowBlank: true }), null);
  assert.match(validateNumber('9999999999', { min: 0, max: 4294967295, step: 1, allowBlank: true }), /between/);
});

test('validateNumber: only-min / only-max messages', () => {
  assert.match(validateNumber('-1', { min: 0 }), /at least 0/);
  assert.match(validateNumber('5', { max: 3 }), /at most 3/);
});

// ── DOM wiring (source inspection — the test harness has no full form DOM) ──────────
test('getConfig blocks while any field is invalid, and the T-081 clamp is gone', () => {
  assert.match(src, /getConfig\(\)\s*\{[\s\S]*?this\._validateBounds\(\)\.length[\s\S]*?return null/, 'getConfig gates on _validateBounds');
  assert.ok(!/_clampNumberInput/.test(src), 'no _clampNumberInput (we block, not clamp)');
  assert.ok(!/clampToRange/.test(src), 'no clampToRange');
  assert.match(src, /_validateBounds\(\)\s*\{/, '_validateBounds exists');
  assert.match(src, /_setFieldError\(el, msg\)/, '_setFieldError marks the field red + inline reason');
});

test('previously-unbounded fields now carry their bounds', () => {
  assert.match(src, /id="reward-normal"[^>]*max="999999"/, 'rewards get a max');
  assert.match(src, /max="999999" step="10"/, 'shop prices get a max (priceCell)');
  assert.match(src, /id="seed"[^>]*max="4294967295"[^>]*data-allow-blank="true"/, 'seed is uint32 + optional');
  assert.match(src, /id="universe-seed"[^>]*max="4294967295"/, 'universe seed is uint32');
});

test('validation runs live on number/range input', () => {
  assert.match(src, /addEventListener\('input'[\s\S]*?input\[type="number"\], input\[type="range"\][\s\S]*?_validateBounds\(\)/, 'live validation listener');
});

test('extra-starter count is capped (block adding beyond the max)', () => {
  assert.match(src, /const MAX_EXTRA_STARTERS = 12/, 'a cap constant exists');
  assert.match(src, /_starterSpecs\.length >= MAX_EXTRA_STARTERS\) return/, 'add-starter is blocked at the cap');
});

test('nicknames block on invalid pool names; getConfig gates on it', () => {
  assert.match(src, /_validateNicknames\(\)\s*\{/, '_validateNicknames exists');
  assert.match(src, /this\._validateBounds\(\)\.length \|\| this\._validateNicknames\(\)\.length\) return null/, 'getConfig blocks on invalid nicknames too');
});
