/**
 * T-168: when IVs are shown, a Pokémon whose IV total is 150+ has its IV line tinted gold with a small
 * ★ at the end (no "Shiny" label) — mirroring this game's rule that a 150+ IV total is guaranteed shiny
 * in-game (stated in index.html). Structural guard (the viewer's inline template JS/CSS has no headless
 * harness here): fails if the threshold, the gold tint, or the trailing star is lost.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');

test('T-168: the roster row totals the IVs and gates the shiny styling on >= 150', () => {
  assert.match(
    tpl,
    /ivTotal\s*>=\s*150/,
    'the shiny styling must trigger at an IV total of 150 or more (the game\'s shiny rule)',
  );
});

test('T-168: a shiny IV line adds a trailing star and drops the old "Shiny" badge', () => {
  assert.match(
    tpl,
    /rm-ivs--shiny/,
    'the shiny state must add the rm-ivs--shiny modifier to the IV line',
  );
  assert.match(
    tpl,
    /class="rm-ivs-star">★/,
    'the shiny IV line must end with a ★ star',
  );
  assert.doesNotMatch(
    tpl,
    /class="rm-shiny"/,
    'the old ★ Shiny badge (and its "Shiny" label) must be gone',
  );
});

test('T-168: the shiny IV line is tinted gold/yellow', () => {
  assert.match(
    tpl,
    /\.rm-ivs--shiny\s*\{[^}]*color\s*:\s*#FFD43B/i,
    'the .rm-ivs--shiny line must be gold/yellow so it reads as shiny',
  );
});
