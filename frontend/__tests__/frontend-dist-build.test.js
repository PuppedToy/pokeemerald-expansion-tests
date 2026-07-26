/**
 * T-220 — the frontend dist minifiers must shrink + de-comment the shipped app while keeping the ES
 * module interface intact (imports/exports are the cross-module contract; only module-private names may
 * be mangled). Runs the same functions build.js uses (buildFrontendDist.cjs). The full end-to-end proof
 * (minified dist actually renders) is `SERVE_DIST=1 npm run shoot` in visual-tests.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const { minifyJs, minifyCss, minifyHtml } = require(path.join(ROOT, 'buildFrontendDist.cjs'));

test('minifyJs preserves the public export name + import path while mangling internals and dropping comments', () => {
  const src = [
    "import { helper } from './util.js';",
    '// a leaky T-042 comment',
    'export function initThing(aVeryLongLocalName) {',
    '  const anotherVeryLongLocal = aVeryLongLocalName + 1;',
    '  return helper(anotherVeryLongLocal);',
    '}',
  ].join('\n');
  const min = minifyJs(src);
  assert.match(min, /initThing/, 'the exported name (module interface) is preserved');
  assert.match(min, /["']\.\/util\.js["']/, 'the import path is preserved');
  assert.doesNotMatch(min, /leaky|T-042/, 'comments (incl. any IDs) are stripped');
  assert.doesNotMatch(min, /aVeryLongLocalName/, 'module-private locals are mangled');
  assert.ok(min.length < src.length, 'it is smaller');
});

test('minifyCss strips comments and shrinks', () => {
  const src = '/* T-999 note */\n.foo {\n  color: red;\n  margin: 0px;\n}\n';
  const min = minifyCss(src);
  assert.doesNotMatch(min, /T-999|note/, 'the CSS comment is gone');
  assert.match(min, /\.foo/, 'the selector is kept');
  assert.ok(min.length < src.length);
});

test('minifyHtml strips HTML comments but keeps markup', () => {
  const src = '<!-- banner -->\n<div>hi</div>\n<!-- another -->\n';
  const min = minifyHtml(src);
  assert.doesNotMatch(min, /<!--/, 'no HTML comments remain');
  assert.match(min, /<div>hi<\/div>/, 'markup untouched');
});
