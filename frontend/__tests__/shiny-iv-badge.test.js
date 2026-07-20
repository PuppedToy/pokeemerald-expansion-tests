/**
 * T-168: when IVs are shown, a Pokémon whose IV total is 150+ gets a gold "Shiny" badge on its IV
 * line — mirroring this game's rule that a 150+ IV total is guaranteed shiny in-game (stated in
 * index.html). Structural guard (the viewer's inline template JS/CSS has no headless harness here):
 * fails if the threshold, the badge markup, or its gold styling is lost.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');

test('T-168: the roster row totals the IVs and gates the badge on >= 150', () => {
  assert.match(
    tpl,
    /ivTotal\s*>=\s*150/,
    'the shiny badge must trigger at an IV total of 150 or more (the game\'s shiny rule)',
  );
});

test('T-168: a Shiny badge is rendered on the IV line', () => {
  assert.match(
    tpl,
    /class="rm-shiny"[^>]*>[\s\S]*?★[\s\S]*?Shiny/,
    'the badge must render a ★ star and the word "Shiny"',
  );
});

test('T-168: the Shiny badge is styled gold/yellow', () => {
  assert.match(
    tpl,
    /\.rm-shiny\s*\{[^}]*color\s*:\s*#FFD43B/i,
    'the .rm-shiny badge must be gold/yellow so it reads as shiny',
  );
});
