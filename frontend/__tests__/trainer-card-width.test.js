/**
 * B-016 regression: trainer cards must be capped and centred so they don't over-expand on large
 * monitors (which let the team spread to a third Pokémon column). The cap (1536px) is the width
 * that fits exactly two 640px Pokémon columns; the grid centres the capped card.
 *
 * Structural CSS guard (no headless-browser harness): fails if the trainer card loses its max-width
 * cap or the grid stops centring. Column behaviour is verified manually in the deployed viewer.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');

test('B-016: the trainer card is width-capped so it cannot over-expand', () => {
  assert.match(
    tpl,
    /\.trainer-card\s*\{[^}]*max-width\s*:/,
    '.trainer-card must set a max-width, else it stretches full-width on large monitors and the team spreads to 3 columns',
  );
});

test('B-016: the trainer grid centres its cards', () => {
  assert.match(
    tpl,
    /\.trainer-grid\s*\{[^}]*justify-items\s*:\s*center/,
    '.trainer-grid must centre the capped trainer cards on wide viewports',
  );
});
