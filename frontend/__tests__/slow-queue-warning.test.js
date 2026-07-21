/**
 * T-172 — the config UI warns, inline next to the ROM-count inputs, when the chosen number of ROMs
 * exceeds the fast-queue limit (so the build would be de-prioritised into the slow queue).
 *
 * Per ADR-009 the DOM stub does not parse innerHTML, so the show/hide wiring can't be exercised here;
 * following the repo convention we behaviourally test the pure exported helpers and assert the template
 * + wiring structurally. A drift-guard test pins the frontend mirror limit to the backend SSOT.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  totalRoms,
  slowQueueWarning,
  slowQueueMessage,
  FAST_QUEUE_MAX_ROMS,
} from '../js/config-form.js';
import { FAST_MAX_ROMS } from '../../backend/queue/scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'config-form.js'), 'utf8');

// ── totalRoms: the single ROM-count computation for every run type ──────────────────────────────
test('totalRoms: default run is always a single ROM', () => {
  assert.equal(totalRoms({ runType: 'default' }), 1);
  assert.equal(totalRoms({}), 1);            // unknown/absent runType → default
  assert.equal(totalRoms(undefined), 1);
});

test('totalRoms: nuzlocke is the chosen ROM count', () => {
  assert.equal(totalRoms({ runType: 'nuzlocke', numROMs: 2 }), 2);
  assert.equal(totalRoms({ runType: 'nuzlocke', numROMs: 7 }), 7);
  assert.equal(totalRoms({ runType: 'nuzlocke' }), 1); // missing count is safe
});

test('totalRoms: soul-link is players × ROMs-per-player', () => {
  assert.equal(totalRoms({ runType: 'soullink', numPlayers: 2, romsPerPlayer: 1 }), 2);
  assert.equal(totalRoms({ runType: 'soullink', numPlayers: 4, romsPerPlayer: 3 }), 12);
  assert.equal(totalRoms({ runType: 'soullink' }), 1); // missing fields are safe
});

// ── slowQueueWarning: fires only above the fast-queue limit ──────────────────────────────────────
test('slowQueueWarning: at or below the limit does not warn; above it does', () => {
  // Nuzlocke boundary — the default fast limit is FAST_QUEUE_MAX_ROMS.
  assert.equal(slowQueueWarning({ runType: 'nuzlocke', numROMs: FAST_QUEUE_MAX_ROMS }).show, false);
  assert.equal(slowQueueWarning({ runType: 'nuzlocke', numROMs: FAST_QUEUE_MAX_ROMS + 1 }).show, true);
  // A single-ROM default run never warns.
  assert.equal(slowQueueWarning({ runType: 'default' }).show, false);
  // Soul-link product crossing the limit.
  assert.equal(slowQueueWarning({ runType: 'soullink', numPlayers: 2, romsPerPlayer: 1 }).show, false);
  assert.equal(slowQueueWarning({ runType: 'soullink', numPlayers: 2, romsPerPlayer: 2 }).show, true);
});

test('slowQueueWarning: reports the total and the limit, and honours an explicit fastMax', () => {
  const w = slowQueueWarning({ runType: 'soullink', numPlayers: 3, romsPerPlayer: 3 });
  assert.equal(w.total, 9);
  assert.equal(w.fastMax, FAST_QUEUE_MAX_ROMS);
  assert.equal(w.show, true);
  // An explicit, higher limit suppresses the warning.
  assert.equal(slowQueueWarning({ runType: 'nuzlocke', numROMs: 3 }, 5).show, false);
});

test('slowQueueMessage: names the total and the fast-queue limit and mentions the slow queue', () => {
  const msg = slowQueueMessage(6, 2);
  assert.match(msg, /6/, 'message names the chosen total');
  assert.match(msg, /2/, 'message names the fast-queue limit');
  assert.match(msg, /slow queue/i, 'message tells the user the build goes to the slow queue');
});

// ── Drift guard: the frontend mirror MUST equal the backend SSOT ─────────────────────────────────
test('FAST_QUEUE_MAX_ROMS mirrors the backend FAST_MAX_ROMS (SSOT drift guard)', () => {
  assert.equal(FAST_QUEUE_MAX_ROMS, FAST_MAX_ROMS);
});

// ── Structural: both inline banners exist and are wired ──────────────────────────────────────────
test('both run panels render an inline slow-queue warning banner', () => {
  assert.match(src, /id="nz-slow-queue-warning"[^>]*class="warning-banner/, 'Nuzlocke panel needs a slow-queue warning banner');
  assert.match(src, /id="sl-slow-queue-warning"[^>]*class="warning-banner/, 'Soul-Link panel needs a slow-queue warning banner');
});

test('the slow-queue banners are toggled from the run-type sync methods', () => {
  // Slice the METHOD BODIES (from each definition to the next method) so we assert the sync logic
  // itself references the banner, not the call sites inside _syncUI.
  const nz = src.slice(src.indexOf('_syncNuzlocke() {'), src.indexOf('_syncSoullink() {'));
  assert.match(nz, /#nz-slow-queue-warning/, '_syncNuzlocke must drive its slow-queue banner');
  const sl = src.slice(src.indexOf('_syncSoullink() {'), src.indexOf('_wireEvents() {'));
  assert.match(sl, /#sl-slow-queue-warning/, '_syncSoullink must drive its slow-queue banner');
});
