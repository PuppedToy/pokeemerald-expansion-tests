/**
 * T-219 — the minified docs viewer must be smaller and comment/ID-free WITHOUT breaking the two
 * substitution anchors app.js depends on at doc-generation time: the CSS font tokens and the
 * `<script src="X.js"></script>` data placeholders (literal-replaced). Runs the same minify function
 * build.js uses (buildDocsTemplate.cjs), resolved via createRequire like the worker-bundle test.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const { minifyDocsTemplate, assertAnchorsPreserved, placeholderScriptTags, REQUIRED_TOKENS } =
  require(path.join(ROOT, 'buildDocsTemplate.cjs'));

const src = fs.readFileSync(path.join(ROOT, 'frontend', 'template.html'), 'utf8');
const min = minifyDocsTemplate(src);

test('minify preserves the CSS font tokens (app.js substitutes them)', () => {
  for (const t of REQUIRED_TOKENS) assert.ok(min.includes(t), `token ${t} must survive`);
});

test('minify leaves the data-placeholder <script src> tags byte-identical (literal-replaced by app.js)', () => {
  const tags = placeholderScriptTags(src);
  assert.ok(tags.length >= 5, 'the template has the expected data placeholders');
  for (const tag of tags) assert.ok(min.includes(tag), `placeholder must survive verbatim: ${tag}`);
  assert.doesNotThrow(() => assertAnchorsPreserved(src, min), 'the build-time anchor guard passes');
});

test('the minified viewer carries no comments or leaked IDs, and is meaningfully smaller', () => {
  assert.equal(min.match(/<!--/g), null, 'no HTML comments remain');
  const ids = [...new Set(min.match(/\b[TB]-\d{3}\b/g) || [])];
  assert.deepEqual(ids, [], `minified docs must not leak task/bug IDs: ${ids.join(', ')}`);
  assert.ok(min.length < src.length * 0.9, `expected a real size cut (got ${min.length} vs ${src.length})`);
});

test('the minifier produced valid output (esbuild parsed every inline block)', () => {
  // esbuild transformSync throws on a parse error, so reaching here means the CSS + every inline
  // <script> parsed cleanly; identifiers are not mangled, so cross-<script> globals still resolve.
  assert.ok(min.includes('<style') && min.includes('</script>'), 'structure intact');
  assert.ok(min.length > 10_000, 'output is a full document, not a truncation');
});
