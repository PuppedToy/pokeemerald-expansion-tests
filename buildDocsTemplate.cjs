'use strict';
/**
 * T-219 — produce a minified, comment-free docs viewer from frontend/template.html WITHOUT breaking the
 * two client-side substitution mechanisms app.js relies on at doc-generation time:
 *   - CSS font tokens   url(__FONT_*__)                → preserved (CSS minify keeps url() args verbatim)
 *   - data placeholders <script src="X.js"></script>  → left byte-identical (app.js does a literal replace)
 *
 * Strips HTML comments, minifies the single big inline <style> (esbuild css), and whitespace-minifies the
 * inline <script> blocks (esbuild `minifyWhitespace` only — identifiers are NOT mangled, so the viewer's
 * cross-`<script>` globals, e.g. the injected data arrays, keep resolving). Shared by build.js + its test.
 */

const { transformSync } = require('esbuild');

// Strip HTML comments and collapse the blank lines they leave behind. Applied only to the HTML *between*
// <style>/<script> blocks, so inline CSS/JS is handled by the minifiers below (never by this regex).
function stripHtmlComments(s) {
  return s.replace(/<!--[\s\S]*?-->/g, '').replace(/\n[ \t]*(?=\n)/g, '');
}

function minifyDocsTemplate(html) {
  const re = /<(style|script)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    out += stripHtmlComments(html.slice(last, m.index));
    const [full, tagRaw, attrs, body] = m;
    const tag = tagRaw.toLowerCase();
    if (tag === 'style') {
      const css = transformSync(body, { loader: 'css', minify: true }).code.replace(/\s+$/, '');
      out += `<style${attrs}>${css}</style>`;
    } else if (/\bsrc\s*=/i.test(attrs) || body.trim() === '') {
      out += full; // external lib or data-placeholder tag — leave EXACTLY as-is
    } else {
      const js = transformSync(body, {
        loader: 'js', minifyWhitespace: true, minifyIdentifiers: false, minifySyntax: false,
      }).code.replace(/\s+$/, '');
      out += `<script${attrs}>${js}</script>`;
    }
    last = m.index + full.length;
  }
  out += stripHtmlComments(html.slice(last));
  return out;
}

// CSS font tokens app.js substitutes; must survive minification verbatim.
const REQUIRED_TOKENS = ['__FONT_PRESS_START_2P__', '__FONT_VT323__'];

// The `<script src="X.js"></script>` placeholders app.js literal-replaces with injected run data.
function placeholderScriptTags(html) {
  return html.match(/<script\s+src="[^"]+\.js"><\/script>/gi) || [];
}

// Throw (fail the build) if minification dropped/altered a substitution anchor.
function assertAnchorsPreserved(src, min) {
  for (const t of REQUIRED_TOKENS) {
    if (!min.includes(t)) throw new Error(`docs minify dropped required token ${t}`);
  }
  for (const tag of placeholderScriptTags(src)) {
    if (!min.includes(tag)) throw new Error(`docs minify altered data placeholder: ${tag}`);
  }
}

module.exports = { minifyDocsTemplate, assertAnchorsPreserved, placeholderScriptTags, REQUIRED_TOKENS };
