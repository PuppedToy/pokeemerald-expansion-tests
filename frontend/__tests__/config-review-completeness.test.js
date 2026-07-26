// T-213 — drift-guard: the run summary (reviewRowsHtml, shared by the step-2 Review and the preset
// "Details" view) must surface every config key the form produces. If someone adds a new key to
// getConfig()'s `base` object without surfacing it, this test fails.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configFormSrc = fs.readFileSync(path.resolve(__dirname, '../js/config-form.js'), 'utf8');
const appSrc = fs.readFileSync(path.resolve(__dirname, '../js/app.js'), 'utf8');

// Ultra-granular tuning knobs deliberately summarised by a headline row rather than shown
// individually: the per-category move-mutation chances (under "Move mutation") and the per-stat
// mutation probabilities (under "Rebalance"/"Mutate").
const INTENTIONALLY_SUMMARISED = new Set([
    'movePowerChance', 'moveAccuracyChance', 'moveTypeChance', 'moveCategoryChance', 'mutationProbs',
]);

function baseConfigKeys(src) {
    const m = src.match(/const base = \{([\s\S]*?)\};/);
    assert.ok(m, 'found the getConfig() base object in config-form.js');
    return m[1].split(/[\s,]+/).filter(k => /^[a-zA-Z]\w*$/.test(k));
}

function reviewBody(src) {
    const start = src.indexOf('function reviewRowsHtml(cfg)');
    const end = src.indexOf('function renderReview', start);
    assert.ok(start !== -1 && end !== -1 && end > start, 'located the reviewRowsHtml body');
    return src.slice(start, end);
}

test('reviewRowsHtml surfaces every config key the form produces', () => {
    const keys = baseConfigKeys(configFormSrc);
    // sanity: we actually parsed a real, non-trivial key list
    assert.ok(keys.length >= 30, `expected many config keys, got ${keys.length}`);
    assert.ok(keys.includes('nicknames') && keys.includes('battleFormat'), 'parsed the expected keys');

    const body = reviewBody(appSrc);
    const missing = keys.filter(k => !INTENTIONALLY_SUMMARISED.has(k) && !body.includes(`cfg.${k}`));
    assert.deepEqual(missing, [], `config keys not surfaced in reviewRowsHtml: ${missing.join(', ')}`);
});

test('the preset "Details" view and the Review step use the same reviewRowsHtml (no duplication)', () => {
    // renderConfigDetail (injected into presets.js) must delegate to reviewRowsHtml, and renderReview
    // must call it too — so the two views can never drift.
    assert.match(appSrc, /renderConfigDetail:\s*\(cfg\)\s*=>\s*reviewRowsHtml\(cfg\)/,
        'preset Details delegates to reviewRowsHtml');
    assert.match(appSrc, /html\s*\+=\s*reviewRowsHtml\(cfg\)/, 'the Review step renders reviewRowsHtml');
});
