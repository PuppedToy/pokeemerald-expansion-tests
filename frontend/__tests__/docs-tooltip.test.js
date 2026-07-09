/**
 * T-078/T-079 — the item-description tooltip on a trainer REWARD chip must anchor to the chip's own
 * left edge and grow only rightward. Reward chips sit in the narrow left rail, so the default centred
 * tooltip (left:50% / translateX(-50%)) clips off the left. Structural guard (ADR-009): the docs
 * viewer's inline CSS lives in template.html and has no headless harness here.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');

test('the base tooltip stays centred', () => {
  assert.match(tpl, /\[data-tooltip\]::after\s*\{[^}]*transform:\s*translateX\(-50%\)/,
    'the shared data-tooltip bubble is centred above its element');
});

test('reward-item tooltips are left-anchored and grow rightward (no left clip)', () => {
  assert.match(tpl, /\.reward-item\[data-tooltip\]::after\s*\{[^}]*left:\s*0/,
    'reward tooltips start at the chip left edge');
  assert.match(tpl, /\.reward-item\[data-tooltip\]::after\s*\{[^}]*transform:\s*none/,
    'reward tooltips are not translated (so they extend only to the right)');
});
