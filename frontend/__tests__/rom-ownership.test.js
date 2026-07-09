/**
 * T-080 — ROM ownership is a frontend-only fact. The ROM is validated in the browser against the
 * known Emerald dumps (no server round-trip), and "I have a ROM" is derived from the local store
 * (hasRom), never from a backend flag.
 *
 * `isKnownEmeraldRom` is pure → behavioural test. The DOM-coupled account flow is guarded
 * structurally (ADR-009): account.js must validate locally and never POST /api/rom/validate.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isKnownEmeraldRom, KNOWN_EMERALD_SHA1 } from '../js/rom-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');

test('isKnownEmeraldRom accepts a known dump hash and rejects others (case-insensitive)', () => {
  const usaEurope = 'f3ae088181bf583e55daf962a92bb46f4f1d07b7';
  assert.equal(isKnownEmeraldRom(usaEurope), true);
  assert.equal(isKnownEmeraldRom(usaEurope.toUpperCase()), true, 'case-insensitive');
  assert.equal(isKnownEmeraldRom('0000000000000000000000000000000000000000'), false);
  assert.equal(KNOWN_EMERALD_SHA1.size, 6, 'all six official Emerald dumps are recognized');
});

test('account.js validates the ROM in the browser and never calls /api/rom/validate', () => {
  const src = read('js', 'account.js');
  assert.ok(!src.includes('/api/rom/validate'), 'the client-side validate endpoint must be gone');
  assert.match(src, /isKnownEmeraldRom\(/, 'ROM validation happens client-side via isKnownEmeraldRom');
  assert.ok(!src.includes('state.ownsValidRom'), 'no reliance on a backend ownership flag');
});

test('every ROM-add point states the ROM never leaves the browser', () => {
  const src = read('js', 'account.js');
  // Settings add/replace + the ready-screen add-ROM path each carry the "never uploaded/leaves" note.
  const notes = src.match(/never (uploaded|leaves)/gi) || [];
  assert.ok(notes.length >= 2, `expected the "never leaves the browser" note at each ROM-add point, found ${notes.length}`);
});

test('the auth explainer no longer claims the ROM is uploaded to the server', () => {
  const html = read('index.html');
  assert.ok(!/upload your original Pok.mon Emerald ROM so we can verify/i.test(html),
    'the old "upload your ROM so we can verify" copy must be gone');
  assert.match(html, /never leaves your device/i, 'it states the ROM never leaves the device');
});
