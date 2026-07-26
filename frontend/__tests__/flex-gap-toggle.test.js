/**
 * T-227 — the inline-flex config containers must be re-shown with display:'flex' (not ''), or clearing the
 * inline display wipes the flex layout and their `gap` between options stops rendering. Source-inspection
 * (ADR-009): the containers declare inline flex and their show/hide toggles restore 'flex'.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'config-form.js'), 'utf8');

test('inline-flex containers declare their flex + gap inline', () => {
  for (const id of ['mutation-categories', 'move-mutation-categories', 'evo-tuning']) {
    assert.match(src, new RegExp(`id="${id}" style="display:flex[^"]*gap:`), `${id} is an inline-flex+gap container`);
  }
});

test('their show/hide toggles restore display:"flex", never "" (which would wipe flex+gap)', () => {
  assert.match(src, /#mutation-categories'\)\.style\.display = rebalanceOn \? 'flex'/, 'mutations categories → flex');
  assert.match(src, /mmCategories\.style\.display = mutateMovesOn \? 'flex'/, 'move-mutation categories → flex');
  assert.match(src, /evoTuning\.style\.display = evoOn \? 'flex'/, 'evolution tuning → flex');
  // none of the three toggle to '' (the bug)
  assert.doesNotMatch(src, /#mutation-categories'\)\.style\.display = rebalanceOn \? '' :/);
  assert.doesNotMatch(src, /mmCategories\.style\.display = mutateMovesOn \? '' :/);
  assert.doesNotMatch(src, /evoTuning\.style\.display = evoOn \? '' :/);
});
