/**
 * T-274 — the run picks its own shiny system, and the starter its own IV floors.
 *
 * Structural guards on the config form's template + wiring (zero-dep `node --test`, per ADR-009: the DOM
 * stub does not parse innerHTML, so the querySelector logic itself cannot be exercised here). The maths
 * behind the panel is tested for real in randomizer/__tests__/unit/shinyRules.test.js and mirrored by
 * shiny-rules-parity.test.js.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULTS } from '../js/config-form.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'config-form.js'), 'utf8');

test('T-274: DEFAULTS carry the shiny rule — quality mode at 150, gen 3 odds behind it', () => {
  assert.equal(DEFAULTS.shinyByQuality, true, 'quality mode is the default (A1)');
  assert.equal(DEFAULTS.shinyIvThreshold, 150, 'the shipped IV threshold (A2)');
  assert.equal(DEFAULTS.shinyChancePercent, 0.0122, 'gen 3\'s own odds, 1 in 8192 (A3)');
});

test('T-274: DEFAULTS carry the starter IV floors', () => {
  assert.equal(DEFAULTS.starterPerfectIvs, 3, 'three perfect IVs, as the game already did');
  assert.equal(DEFAULTS.starterMinIvTotal, 150, 'topped up to the current 150 total');
});

test('T-274: there is a Shiny Pokémon category with the toggle, the slider and the % field', () => {
  assert.match(src, /data-cat="shiny"/, 'a Shiny Pokémon category exists');
  assert.match(src, /<span class="config-cat-title">Shiny Pok/, 'the category is titled Shiny Pokémon');
  assert.match(src, /id="shiny-by-quality"[^>]*type="checkbox"|type="checkbox"[^>]*id="shiny-by-quality"/,
    'the quality/luck toggle (A1)');
  // The bound comes from the shared module (MAX_IV_TOTAL), so accept the constant or a literal 186.
  assert.match(src, /id="shiny-iv-threshold"[\s\S]{0,200}min="0"[\s\S]{0,80}max="(186|\$\{MAX_IV_TOTAL\})"/,
    'the IV-total slider spans 0..186 (A2)');
  assert.match(src, /id="shiny-chance-percent"[\s\S]{0,200}max="100"/, 'the classic % field (A3)');
});

test('T-274: the "1 in N" line exists and is fed by the shared shiny maths', () => {
  assert.match(src, /id="shiny-chance-note"/, 'the human-terms chance line (A4)');
  assert.match(src, /from '\.\/shinyRules\.js'/, 'the form reads the shared shiny module');
  assert.match(src, /shinyChanceText\s*\(/, 'the line is computed, never hard-coded');
  // A4: the line exists in both modes — it must not be hidden along with the % field or the slider.
  const syncIdx = src.indexOf('_syncUI()');
  const sync = src.slice(syncIdx);
  assert.match(sync, /shiny-chance-note/, 'the note is refreshed by _syncUI');
});

test('T-274: the toggle swaps which control is shown (A1/A2/A3)', () => {
  const syncIdx = src.indexOf('_syncUI()');
  const sync = src.slice(syncIdx);
  assert.match(sync, /shiny-by-quality/, '_syncUI reads the toggle');
  assert.match(sync, /shiny-quality-row/, 'the IV-total row is shown/hidden');
  assert.match(sync, /shiny-chance-row/, 'the % row is shown/hidden');
});

test('T-274: the Starters category gained the two IV sliders, under Starter quality', () => {
  const startersIdx = src.indexOf('data-cat="starters"');
  assert.ok(startersIdx > 0, 'Starters category must exist');
  const starters = src.slice(startersIdx, src.indexOf('data-cat="nicknames"'));
  assert.match(starters, /id="starter-perfect-ivs"[\s\S]{0,200}max="6"/, 'perfect-IV slider 0..6');
  assert.match(starters, /id="starter-min-iv-total"[\s\S]{0,200}max="(186|\$\{MAX_IV_TOTAL\})"/,
    'minimum IV total slider 0..186');
  const qualityIdx = starters.indexOf('id="starter-quality"');
  assert.ok(qualityIdx > 0 && qualityIdx < starters.indexOf('id="starter-perfect-ivs"'),
    'the sliders sit below Starter quality');
});

test('T-274: all five values round-trip through getConfig/setConfig and are wired to onChange', () => {
  for (const key of ['shinyByQuality', 'shinyIvThreshold', 'shinyChancePercent', 'starterPerfectIvs', 'starterMinIvTotal']) {
    assert.match(src, new RegExp(`${key},|${key}:`), `${key} must reach the config object`);
  }
  assert.match(src, /cfg\.shinyByQuality !== false/, 'the toggle reads back defaulting to ON');
  assert.match(src, /cfg\.shinyIvThreshold \?\? 150/, 'the threshold reads back with its default');
  assert.match(src, /cfg\.starterPerfectIvs \?\? 3/, 'the perfect-IV count reads back with its default');
  assert.match(src, /cfg\.starterMinIvTotal \?\? 150/, 'the IV-total floor reads back with its default');
  for (const id of ['#shiny-by-quality', '#shiny-iv-threshold', '#shiny-chance-percent', '#starter-perfect-ivs', '#starter-min-iv-total']) {
    assert.match(src, new RegExp(`'${id}'\\)\\?\\.addEventListener`), `${id} must be wired to the change handler`);
  }
});
