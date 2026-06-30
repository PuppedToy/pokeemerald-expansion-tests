/**
 * B-015 regression: the doc-viewer top bar must stay pinned to the top on scroll (unless unpinned).
 *
 * The bar is `position:sticky;top:0`, but a sticky element only stays pinned within its containing
 * block. `<body>` is `display:flex`, which by default (`align-items:stretch`) stretches its child
 * `.app` — the bar's containing block — to exactly 100vh. `.app`'s content overflows that clamped
 * box, so once you scroll past 100vh the sticky bar is carried out of view. The fix is
 * `.app{align-self:flex-start}` so `.app` grows to its full content height and the bar has the whole
 * page to stick through.
 *
 * No headless-browser harness exists here, so this is a structural CSS guard: it fails if the bar
 * stops being sticky, or if `.app` loses the align-self that keeps its sticky container from being
 * height-clamped. Real scroll behaviour is verified manually in the deployed viewer.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.html'), 'utf8');

test('B-015: the top bar is sticky by default', () => {
  assert.match(
    tpl,
    /\.topbar\s*\{[^}]*position\s*:\s*sticky/,
    '.topbar must be position:sticky so it stays pinned while scrolling',
  );
});

test('B-015: the sticky top bar container (.app) is not height-clamped by the flex body', () => {
  assert.match(
    tpl,
    /\.app\s*\{[^}]*align-self\s*:\s*flex-start/,
    '.app must use align-self:flex-start, else the flex body stretches it to 100vh and the sticky top bar scrolls away',
  );
});
