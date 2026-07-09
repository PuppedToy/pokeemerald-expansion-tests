/**
 * T-081 — number-field validation in the randomization settings.
 *
 * `clampToRange` is a pure exported helper → unit-tested directly. The DOM-coupled wiring (the
 * change-listener that clamps a field to its min/max, and the hardened integer reads in getConfig)
 * is guarded structurally against the source, matching config-form.test.js (ADR-009: the test DOM
 * stub does not parse innerHTML, so ConfigForm can't be instantiated here).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clampToRange } from '../js/config-form.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'config-form.js'), 'utf8');

test('clampToRange clamps into [min,max]', () => {
  assert.equal(clampToRange('99', 0, 8), 8);   // gym max
  assert.equal(clampToRange('5', 0, 8), 5);    // in range
  assert.equal(clampToRange('-5', 0, 8), 0);   // negative → min
  assert.equal(clampToRange('9', 0, 4), 4);    // E4 max
  assert.equal(clampToRange('0', 0, 4), 0);    // min boundary
});

test('clampToRange leaves blank / non-numeric values untouched (returns null)', () => {
  assert.equal(clampToRange('', 0, 8), null);        // blank seed stays "random"
  assert.equal(clampToRange('abc', 0, 8), null);
  assert.equal(clampToRange(null, 0, 8), null);
  assert.equal(clampToRange(undefined, 0, 8), null);
});

test('clampToRange treats missing bounds as unbounded on that side', () => {
  assert.equal(clampToRange('-3', 0, ''), 0);          // only min enforced
  assert.equal(clampToRange('1000', '', 100), 100);    // only max enforced
  assert.equal(clampToRange('-9', '', ''), -9);        // no bounds → unchanged
  assert.equal(clampToRange('0.05', 0, 1), 0.05);      // fractions (deviation)
});

test('a number field with a value outside its range does not exceed the bound', () => {
  // Gym leaders: 0..8, Elite Four: 0..4 (the explicit requirement).
  assert.equal(clampToRange('12', 0, 8), 8);
  assert.equal(clampToRange('7', 0, 4), 4);
});

// ── Structural guards on the DOM-coupled wiring ─────────────────────────────────────────────

test('every number field is clamped to its min/max on change (live validation)', () => {
  assert.match(src, /addEventListener\('change'/, 'a change listener must clamp number inputs');
  assert.match(src, /input\[type="number"\]/, 'the clamp listener targets number inputs');
  assert.match(src, /_clampNumberInput\s*\(/, 'the clamp listener calls _clampNumberInput');
  assert.match(src, /_clampNumberInput\s*\(el\)\s*\{[\s\S]*clampToRange\(el\.value, el\.min, el\.max\)/,
    '_clampNumberInput clamps against the input\'s own min/max attributes');
});

test('gym and Elite-Four type-change fields declare min 0 and max 8 / 4', () => {
  assert.match(src, /id="gyms-type-changed"[^>]*min="0"[^>]*max="8"/, 'gyms field must be min 0 / max 8');
  assert.match(src, /id="e4-type-changed"[^>]*min="0"[^>]*max="4"/, 'E4 field must be min 0 / max 4');
});

test('getConfig clamps nuzlocke / soul-link counts (no unbounded parseInt || default)', () => {
  assert.match(src, /numROMs\s*=\s*this\._intField\('#nz-numroms', 3, 2, 10\)/, 'numROMs clamped to [2,10]');
  assert.match(src, /numPlayers\s*=\s*this\._intField\('#sl-numplayers', 2, 2, 8\)/, 'numPlayers clamped to [2,8]');
  assert.match(src, /romsPerPlayer\s*=\s*this\._intField\('#sl-roms-per-player', 2, 1, 10\)/, 'romsPerPlayer clamped to [1,10]');
  // The old unclamped pattern must be gone for these fields.
  assert.ok(!/parseInt\(this\._q\('#nz-numroms'\)\.value, 10\)\s*\|\|/.test(src), 'numROMs no longer uses parseInt || default');
  assert.ok(!/parseInt\(this\._q\('#sl-numplayers'\)\.value, 10\)\s*\|\|/.test(src), 'numPlayers no longer uses parseInt || default');
});

test('the seed field cannot go negative (min 0)', () => {
  assert.match(src, /id="seed"[^>]*min="0"/, 'seed input must declare min 0');
});
