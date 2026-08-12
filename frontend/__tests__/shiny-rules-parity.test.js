/**
 * T-274 — frontend/js/shinyRules.js is a hand-kept ESM mirror of randomizer/shinyRules.js (a browser
 * module cannot require the pipeline's CommonJS). The numbers it shows in the config form must be the
 * numbers the ROM is actually built with, so this test runs both implementations over the whole input
 * space that matters and fails the moment they disagree.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import * as esm from '../js/shinyRules.js';

const cjs = createRequire(import.meta.url)('../../randomizer/shinyRules.js');

test('T-274: the defaults and the bounds are the same on both sides', () => {
  assert.deepEqual(esm.SHINY_DEFAULTS, cjs.SHINY_DEFAULTS);
  assert.equal(esm.MAX_IV_TOTAL, cjs.MAX_IV_TOTAL);
  assert.equal(esm.SHINY_ODDS_DENOMINATOR, cjs.SHINY_ODDS_DENOMINATOR);
});

test('T-274: every IV threshold produces the same probability and the same "1 in N"', () => {
  for (let threshold = 0; threshold <= esm.MAX_IV_TOTAL + 1; threshold++) {
    assert.equal(
      esm.ivTotalAtLeastProbability(threshold),
      cjs.ivTotalAtLeastProbability(threshold),
      `probability drifted at an IV total of ${threshold}`,
    );
    const cfg = { shinyByQuality: true, shinyIvThreshold: threshold };
    assert.equal(esm.shinyChanceText(cfg), cjs.shinyChanceText(cfg), `text drifted at ${threshold}`);
  }
});

test('T-274: every percentage maps to the same odds out of 65536', () => {
  const percents = [0, 0.0005, 0.0122, 0.1, 0.5, 1, 5, 12.5, 50, 99.9, 100, -3, 1000];
  for (const percent of percents) {
    assert.equal(esm.oddsFromPercent(percent), cjs.oddsFromPercent(percent), `odds drifted at ${percent}%`);
    const cfg = { shinyByQuality: false, shinyChancePercent: percent };
    assert.equal(esm.shinyChanceText(cfg), cjs.shinyChanceText(cfg), `text drifted at ${percent}%`);
  }
});

test('T-274: the rule injected into a doc is the same on both paths', () => {
  // randomizer/writer.js (out.html) uses the CJS one, frontend/js/app.js (served docs) the ESM one — two
  // doc builders that must state the same rule for the same run.
  const configs = [
    null, {},
    { shinyByQuality: true, shinyIvThreshold: 186 },
    { shinyByQuality: false, shinyChancePercent: 0.5 },
    { shinyByQuality: false, shinyChancePercent: 0 },
    { shinyByQuality: true, shinyIvThreshold: 0 },
  ];
  for (const cfg of configs) {
    assert.deepEqual(esm.docsShinyRule(cfg), cjs.docsShinyRule(cfg), `doc rule drifted for ${JSON.stringify(cfg)}`);
  }
});

test('T-274: junk and out-of-range config normalise identically', () => {
  const configs = [
    undefined, null, {},
    { shinyByQuality: false },
    { shinyByQuality: 'no', shinyIvThreshold: 'lots' },
    { shinyIvThreshold: 9999, starterPerfectIvs: 12, starterMinIvTotal: -3 },
    { shinyIvThreshold: 150.7, starterPerfectIvs: 2.4, shinyChancePercent: '0.0122' },
    { starterPerfectIvs: null, starterMinIvTotal: '' },
  ];
  for (const cfg of configs) {
    assert.deepEqual(
      esm.normalizeShinyRules(cfg),
      cjs.normalizeShinyRules(cfg),
      `normalisation drifted for ${JSON.stringify(cfg)}`,
    );
  }
});
