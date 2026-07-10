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

test('doubles trainers render a Double Battle badge from trainer.battleType', () => {
  assert.match(tpl, /trainer\.battleType === 'doubles'/, 'the card render branches on battleType');
  assert.match(tpl, /roster-battletype/, 'the badge element/class is emitted');
  assert.match(tpl, /Double Battle/, 'the badge is labelled');
});

test('the .roster-battletype badge is styled', () => {
  assert.match(tpl, /\.roster-battletype\s*\{/, 'template.html styles the battle-type badge');
});
