/**
 * T-115 — the generated docs viewer shows a "Double Battle" badge on trainers fought as doubles
 * (mainly visible in Mixed runs; its absence = a single battle). Structural guard (ADR-009): the
 * viewer template lives in template.html with no headless harness here; the battleType data plumbing
 * that feeds it is covered in randomizer/__tests__/unit/battleTypeWriter.test.js.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');

test('each trainer renders a battle-format tag (single/double/tag) from battleType', () => {
  assert.match(tpl, /trainer\.battleType === 'singles'[\s\S]{0,80}?Single Battle/, 'Single Battle tag');
  assert.match(tpl, /trainer\.battleType === 'doubles'[\s\S]{0,80}?Double Battle/, 'Double Battle tag');
  assert.match(tpl, /trainer\.battleType === 'tag'[\s\S]{0,80}?Tag Battle/, 'Tag Battle tag');
});

test('the Double Battle tag has no emoji and is not force-uppercased', () => {
  assert.doesNotMatch(tpl, /⚔️\s*Double Battle/, 'no emoji on the tag');
  const css = tpl.slice(tpl.indexOf('.roster-battletype {'), tpl.indexOf('.roster-battletype {') + 260);
  assert.doesNotMatch(css, /text-transform:\s*uppercase/, 'the tag is not uppercased');
});

test('single/double/tag tags each have a distinct colour class', () => {
  assert.match(tpl, /\.roster-battletype\.bt-single\s*\{[^}]*background/, 'bt-single colour');
  assert.match(tpl, /\.roster-battletype\.bt-double\s*\{[^}]*background/, 'bt-double colour');
  assert.match(tpl, /\.roster-battletype\.bt-tag\s*\{[^}]*background/, 'bt-tag colour');
});

test('Run & Bun E4 cards render a Choice Battle info box from trainer.choiceBattle', () => {
  assert.match(tpl, /trainer\.choiceBattle/, 'render branches on choiceBattle');
  assert.match(tpl, /Choice Battle/, 'the box is labelled');
  assert.match(tpl, /\.choice-battle\s*\{/, 'the box is styled');
});
