// Shared catalogue of viewports + screens for both the agent preview (shoot.mjs) and
// the Playwright visual-regression spec (visual.spec.mjs). Single source of truth (T-040).
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DOCS_FIXTURE = path.join(__dirname, 'fixtures', 'docs-sample.html');
export const DOCS_FIXTURE_URL = 'file://' + DOCS_FIXTURE;

// The four bands from the T-040 plan + a small-phone sanity size.
export const VIEWPORTS = [
  { name: 'phone-sm',       width: 360,  height: 640 },   // small-phone sanity (≤380)
  { name: 'mobile',         width: 375,  height: 667 },   // primary mobile target
  { name: 'ipad-portrait',  width: 768,  height: 1024 },  // iPad = desktop-first
  { name: 'ipad-landscape', width: 1024, height: 768 },
  { name: 'desktop',        width: 1440, height: 900 },   // must stay pixel-identical
];

// App screens: served by the backend at BASE_URL. `setup(page)` runs after navigation.
// NB: nav clicks use dispatchEvent, not click(), so they fire the SPA's JS handler even when the
// (pre-fix) mobile top-nav overflows and the target sits outside the viewport — Playwright's
// click() refuses to act on an off-viewport element. The overflow itself is caught by the spec's
// expectNoOverflow assertion; here we just need to reach each screen to screenshot it.
const tab = (name) => (p) => p.dispatchEvent(`[data-tab="${name}"]`, 'click');

export const APP_SCREENS = [
  { name: 'home',       path: '/' },
  { name: 'features',   path: '/', setup: tab('features') },
  { name: 'randomizer', path: '/', setup: tab('randomizer') },
  { name: 'settings',   path: '/', setup: tab('settings') },
  {
    name: 'auth-modal', path: '/',
    setup: async (p) => { await p.dispatchEvent('#nav-login', 'click'); await p.waitForSelector('#auth-modal:not([hidden])'); },
  },
  {
    // Mobile drawer open (T-040). On desktop the burger is display:none and there is no drawer,
    // so this baseline is identical to `home` — harmless.
    name: 'nav-drawer', path: '/',
    setup: async (p) => { await p.dispatchEvent('#nav-burger', 'click'); await p.waitForTimeout(300); },
  },
  {
    // Presets modal on the Community tab (T-192). Content-independent to screenshot: the search +
    // filter bar always renders (no login/seed needed), so this previews the modal chrome + the
    // filter/sort/date controls responsively.
    name: 'presets-modal', path: '/',
    setup: async (p) => {
      await p.dispatchEvent('[data-tab="randomizer"]', 'click');
      await p.dispatchEvent('#btn-load-preset', 'click');
      await p.waitForSelector('#presets-modal:not([hidden])');
      await p.dispatchEvent('[data-presets-tab="community"]', 'click');
      await p.waitForSelector('.preset-filters');
      await p.waitForTimeout(200);
    },
  },
  { name: 'reset',  path: '/reset.html' },
  { name: 'verify', path: '/verify.html' },
];

// Docs-viewer screens: the self-contained fixture over file:// (no server). `target` is the
// sidebar nav data-target that activates the section.
export const DOCS_SCREENS = [
  { name: 'docs-encounters', target: 'wildpokes' },
  { name: 'docs-trainers',   target: 'trainers' },
  { name: 'docs-pc',         target: 'pc' },
  { name: 'docs-pokedex',    target: 'pokemon' },
  { name: 'docs-moves',      target: 'moves' },
  { name: 'docs-abilities',  target: 'abilities' },
];

export async function gotoDocsSection(page, target) {
  await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.nav a.clicker', { state: 'attached' });
  // dispatchEvent (not click) — the pre-fix mobile sidebar can push nav links off-viewport.
  await page.dispatchEvent(`.nav a[data-target="${target}"]`, 'click');
  await page.waitForSelector(`section#${target}.active`, { timeout: 5000 }).catch(() => {});
}
