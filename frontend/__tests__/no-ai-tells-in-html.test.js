/**
 * T-218 — the HTML markup layer must not read as AI/dev-generated. Guards the HTML comments (<!-- … -->)
 * of the two hand-authored HTML files (index.html = app shell, template.html = docs viewer) against the
 * mechanical "tells":
 *   - leaked internal tracking IDs (T-NNN / B-NNN),
 *   - decorative box-drawing banner comments (<!-- ── … ── -->).
 *
 * Scope is the HTML comment layer only. The inline <style>/<script> block comments are source CODE and
 * keep the project's task-ID traceability convention (and are minified out of the shipped artifact by
 * T-219/T-220). Genuinely useful HTML comments are allowed — this does NOT forbid all comments.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const htmlComments = (src) => src.match(/<!--[\s\S]*?-->/g) || [];

const FILES = ['index.html', 'template.html', 'reset.html', 'verify.html'];

for (const file of FILES) {
  test(`${file} — HTML comments carry no leaked task/bug IDs (T-NNN / B-NNN)`, () => {
    const ids = [...new Set(htmlComments(read(file)).join('\n').match(/\b[TB]-\d{3}\b/g) || [])];
    assert.deepEqual(ids, [], `strip internal IDs from the HTML comments: ${ids.join(', ')}`);
  });

  test(`${file} — no decorative box-drawing banner comments`, () => {
    const banners = htmlComments(read(file)).filter((c) => c.includes('─'));
    assert.deepEqual(banners, [], `remove decorative banner comments:\n${banners.join('\n')}`);
  });
}
