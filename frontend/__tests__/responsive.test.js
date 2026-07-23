/**
 * T-040 regression: mobile responsiveness must stay in place AND stay additive (desktop unchanged).
 *
 * Structural guards (zero-dep, `node --test`, per ADR-009 — no headless browser here; the real
 * pixel/overflow checks live in the dev-only `visual-tests/` Playwright suite). These fail fast if:
 *   - a viewport meta tag is dropped (media queries silently stop working on phones);
 *   - a surface loses its `@media (max-width:600px)` mobile layer;
 *   - the drawer plumbing that keeps DESKTOP byte-identical is removed — the app nav wrapper must be
 *     `display:contents` and the burgers/scrims `display:none` by default, so the mobile machinery is
 *     invisible above the breakpoint;
 *   - the dead `@media(max-width:1000px)` block (bad selectors) creeps back into the viewer.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FE = path.join(__dirname, '..');
const read = (...p) => fs.readFileSync(path.join(FE, ...p), 'utf8');

const indexHtml    = read('index.html');
const resetHtml    = read('reset.html');
const verifyHtml   = read('verify.html');
const templateHtml = read('template.html');
const layoutCss    = read('css', 'layout.css');
const componentsCss = read('css', 'components.css');
const kitCss = fs.readFileSync(path.join(FE, '..', 'obsidian-ui-kit', 'css', 'obsidian.css'), 'utf8');

const VIEWPORT = /<meta[^>]*name=["']viewport["'][^>]*width=device-width/i;
const MOBILE_MQ = /@media[^{]*max-width:\s*600px/;

test('every HTML entry ships a device-width viewport meta', () => {
  for (const [name, html] of [['index', indexHtml], ['reset', resetHtml], ['verify', verifyHtml], ['template', templateHtml]]) {
    assert.match(html, VIEWPORT, `${name}.html must declare a width=device-width viewport, or mobile media queries won't apply`);
  }
});

test('each styled surface has a ≤600px mobile layer', () => {
  assert.match(layoutCss, MOBILE_MQ, 'layout.css lost its mobile media query');
  assert.match(componentsCss, MOBILE_MQ, 'components.css lost its mobile media query');
  assert.match(kitCss, MOBILE_MQ, 'obsidian-ui-kit lost its mobile media query');
  assert.match(templateHtml, MOBILE_MQ, 'the docs viewer lost its mobile media query');
});

test('app nav stays desktop-identical: menu wrapper is display:contents, burger/scrim hidden by default', () => {
  assert.match(layoutCss, /\.topnav-menu\s*\{[^}]*display\s*:\s*contents/,
    '.topnav-menu must be display:contents so the desktop top-nav lays out exactly as before');
  assert.match(layoutCss, /\.topnav-burger\s*\{\s*display\s*:\s*none/,
    '.topnav-burger must be display:none by default (shown only ≤600px)');
  assert.match(layoutCss, /\.nav-scrim\s*\{\s*display\s*:\s*none/,
    '.nav-scrim must be display:none by default');
  assert.match(indexHtml, /id=["']nav-burger["']/, 'index.html must contain the hamburger button');
});

test('mobile tap targets reach 44px', () => {
  assert.match(componentsCss, /min-height:\s*44px/, 'components.css mobile layer must enforce ≥44px tap targets');
});

test('docs viewer: sidebar becomes an off-canvas drawer, burger/scrim hidden by default', () => {
  assert.match(templateHtml, /\.nav-burger-docs\s*\{\s*display\s*:\s*none/,
    '.nav-burger-docs must be hidden by default so desktop is unchanged');
  assert.match(templateHtml, /\.nav-scrim-docs\s*\{\s*display\s*:\s*none/,
    '.nav-scrim-docs must be hidden by default');
  assert.match(templateHtml, /docs-nav-open/, 'the docs drawer open-state class must be wired');
  assert.match(templateHtml, /id=["']nav-burger-docs["']/, 'template.html must contain the docs menu button');
});

test('docs viewer: the dead @media(max-width:1000px) block is gone', () => {
  assert.doesNotMatch(templateHtml, /\.sidebar\s*\{\s*order\s*:\s*2/,
    'the old broken 1000px media query (bad selectors) must not return');
});

test('presets modal (T-192) has a ≤600px mobile layer that widens the card and stacks filters', () => {
  const mobile = componentsCss.slice(componentsCss.search(MOBILE_MQ));
  assert.match(mobile, /\.modal\.modal-lg\s*\{\s*max-width:\s*100%/,
    'the wide presets modal must go full-width on mobile');
  assert.match(mobile, /\.preset-filter-row\s*\{\s*grid-template-columns/,
    'the community filter row must re-flow on mobile');
  assert.match(mobile, /\.preset-card-actions\s*\.btn\s*\{\s*min-height:\s*44px/,
    'preset action buttons must be finger-sized on mobile');
});
