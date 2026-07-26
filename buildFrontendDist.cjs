'use strict';
/**
 * T-220 — build a minified copy of the HAND-WRITTEN frontend into frontend/dist/. In production the
 * server mounts dist/ ahead of frontend/, so these minified files shadow the source while the generated
 * artifacts (randomizer.bundle.js / bps.bundle.js / data / assets / template.min.html) keep being served
 * from frontend/. Dev serves the raw source unchanged, and the test suite always runs against source.
 *
 * ES modules are minified with `transformSync` (NOT bundled): imports/exports — the cross-module interface
 * — are preserved, only module-private identifiers are mangled, so the module graph keeps working as-is.
 */

const fs = require('fs');
const path = require('path');
const { transformSync } = require('esbuild');

const GEN_JS = /\.bundle\.js$/;                                   // generated bundles — not ours to minify
const HTML_FILES = ['index.html', 'reset.html', 'verify.html', 'privacy.html', 'terms.html']; // app shell + legal pages (NOT the docs template)

function minifyJs(code) {
  return transformSync(code, { loader: 'js', format: 'esm', minify: true }).code;
}
function minifyCss(code) {
  return transformSync(code, { loader: 'css', minify: true }).code;
}
function minifyHtml(html) {
  // The app shell has no big inline <style>/<script> — just strip HTML comments + the blank lines they leave.
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n[ \t]*(?=\n)/g, '');
}

function buildDist({ root, log = () => {} }) {
  const front = path.join(root, 'frontend');
  const dist = path.join(front, 'dist');
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'js'), { recursive: true });
  fs.mkdirSync(path.join(dist, 'css'), { recursive: true });

  let files = 0;
  let srcBytes = 0;
  let outBytes = 0;
  const emit = (rel, out) => {
    fs.writeFileSync(path.join(dist, rel), out);
    files += 1;
    outBytes += Buffer.byteLength(out);
  };

  for (const f of HTML_FILES) {
    const src = fs.readFileSync(path.join(front, f), 'utf8');
    srcBytes += Buffer.byteLength(src);
    emit(f, minifyHtml(src));
  }
  for (const f of fs.readdirSync(path.join(front, 'js')).filter((n) => n.endsWith('.js') && !GEN_JS.test(n))) {
    const src = fs.readFileSync(path.join(front, 'js', f), 'utf8');
    srcBytes += Buffer.byteLength(src);
    emit(path.join('js', f), minifyJs(src));
  }
  for (const f of fs.readdirSync(path.join(front, 'css')).filter((n) => n.endsWith('.css'))) {
    const src = fs.readFileSync(path.join(front, 'css', f), 'utf8');
    srcBytes += Buffer.byteLength(src);
    emit(path.join('css', f), minifyCss(src));
  }

  const pct = srcBytes ? Math.round((1 - outBytes / srcBytes) * 100) : 0;
  log(`[build] Wrote frontend/dist (${files} files, ${Math.round(outBytes / 1024)} KB, -${pct}% vs source)`);
  return { files, srcBytes, outBytes };
}

module.exports = { buildDist, minifyJs, minifyCss, minifyHtml };
