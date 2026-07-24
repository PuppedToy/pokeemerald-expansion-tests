/**
 * T-197 — the docs viewer lets the player choose their rival (May / Brendan) in the Starters card;
 * the choice drives which rival-trainer cards survive the starter filter. Before this, the viewer was
 * hardcoded to May. Structural guard (ADR-009): the viewer template lives in template.html with no
 * headless DOM harness here, so we assert on the template source (same approach as
 * docs-battle-type.test.js). The filtering it feeds is exercised end-to-end only in the real browser.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');

test('the Starters card renders a Rival radio pair (May default-checked, Brendan)', () => {
  // The radio group is gated to the STARTERS location card only.
  assert.match(tpl, /route\.id === 'STARTERS'[\s\S]{0,500}?rival-gender-radio/, 'radio group gated to the STARTERS card');
  assert.match(tpl, /class="rival-gender-radio"[^>]*value="may"[^>]*checked/, 'May option present and default-checked');
  assert.match(tpl, /class="rival-gender-radio"[^>]*value="brendan"/, 'Brendan option present');
});

test('Brendan rival cards get per-starter classes, mirroring May', () => {
  assert.match(tpl, /TRAINER_BRENDAN_[\s\S]{0,80}?rival-brendan-treecko/, 'brendan treecko class');
  assert.match(tpl, /TRAINER_BRENDAN_[\s\S]{0,80}?rival-brendan-torchic/, 'brendan torchic class');
  assert.match(tpl, /TRAINER_BRENDAN_[\s\S]{0,80}?rival-brendan-mudkip/, 'brendan mudkip class');
});

test('applyStarterRivals honours the selected rival (no longer hardcoded to May)', () => {
  const start = tpl.indexOf('function applyStarterRivals');
  assert.ok(start !== -1, 'applyStarterRivals exists');
  const fn = tpl.slice(start, start + 800);
  assert.match(fn, /getRivalGender\(\)/, 'reads the selected rival');
  assert.match(fn, /\['may',\s*'brendan'\]/, 'iterates both rival genders symmetrically');
  assert.doesNotMatch(fn, /Always hide Brendan/, 'the unconditional Brendan hide is gone');
});

test('the rival choice is persisted in nzState and wired through the change handler', () => {
  assert.match(tpl, /nzState\.rivalGender/, 'choice stored in nzState');
  assert.match(tpl, /function handleRivalGenderChange/, 'has a change handler');
  assert.match(tpl, /rival-gender-radio[\s\S]{0,200}?handleRivalGenderChange/, 'delegated change handler wires the radio');
});
