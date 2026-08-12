/**
 * T-168: when IVs are shown, a Pokémon that this game's rule makes shiny has its IV line tinted gold with
 * a small ★ at the end (no "Shiny" label). Structural guard (the viewer's inline template JS/CSS has no
 * headless harness here): fails if the threshold, the gold tint, or the trailing star is lost.
 *
 * T-274 — spec change: the threshold is no longer the fixed 150. The run's shiny rule rides into each doc
 * as the injected `shinyRule` global, so the tint follows the run's own IV threshold and disappears in
 * classic mode, where shininess is luck the docs cannot know. Docs from older bundles carry no global and
 * keep the historical 150 rule.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');
const appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const writerSrc = fs.readFileSync(path.join(__dirname, '..', '..', 'randomizer', 'writer.js'), 'utf8');

test('T-274: the roster row gates the shiny styling on the run\'s IV threshold, not a fixed 150', () => {
  assert.match(tpl, /ivTotal\s*>=\s*threshold/, 'the tint compares the IV total against the run\'s threshold');
  assert.match(tpl, /rule\.byQuality !== false && ivTotal/, 'classic mode tints nothing');
  assert.match(tpl, /rule\.ivThreshold/, 'the threshold comes from the injected rule');
  assert.ok(!/ivTotal\s*>=\s*150/.test(tpl), 'the hard-coded 150 comparison must be gone');
});

test('T-274: a doc that predates the setting falls back to the historical 150 rule', () => {
  assert.match(tpl, /typeof shinyRule !== 'undefined'/, 'the global is optional');
  assert.match(tpl, /\{ byQuality: true, ivThreshold: 150 \}/, 'the fallback is quality mode at 150');
});

test('T-274: both doc builders inject the shiny rule (no path shows a stale tint)', () => {
  assert.match(tpl, /<script src="shinyrule\.js"><\/script>/, 'the template carries the data anchor');
  assert.match(appSrc, /shinyrule\.js[\s\S]{0,120}docsShinyRule\(config\)/, 'the browser doc builder injects it');
  assert.match(writerSrc, /TEMPLATE_SHINY_RULE_REPLACEMENT[\s\S]{0,120}shinyRule/, 'the Node doc builder injects it');
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
