// Mobile drawer interaction guard (T-040). Regression for the "opening the hamburger darkens the
// screen and any click just closes it — you can't navigate" defect: the drawer must sit ABOVE its
// scrim so its links receive pointer events. A real .click() on a drawer link is the test — if the
// scrim intercepts pointer events, Playwright throws "subtree intercepts pointer events" and this
// fails. Only runs on viewports that actually have a drawer (≤600px).
import { test, expect } from '@playwright/test';
import { DOCS_FIXTURE_URL } from './screens.mjs';

const mobileOnly = ({ page }) => test.skip(page.viewportSize().width > 600, 'drawer only exists ≤600px');

test.describe('mobile drawer navigation', () => {
  test('app: opening the drawer and tapping a tab navigates (drawer is above the scrim)', async ({ page }) => {
    mobileOnly({ page });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.click('#nav-burger');
    await expect(page.locator('#topnav-menu')).toBeVisible();
    // Real click: fails if the scrim (or anything) intercepts pointer events over the tab.
    await page.click('.topnav-tab[data-tab="features"]');
    await expect(page.locator('#tab-features')).toHaveClass(/\bactive\b/);
    await expect(page.locator('body')).not.toHaveClass(/\bnav-open\b/);
  });

  test('docs viewer: opening the drawer and tapping a section navigates', async ({ page }) => {
    mobileOnly({ page });
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });
    await page.click('#nav-burger-docs');
    await expect(page.locator('#nav')).toBeVisible();
    await page.click('.nav a[data-target="trainers"]');
    await expect(page.locator('section#trainers')).toHaveClass(/\bactive\b/);
  });
});

// B-023 regression: clicking an encounter tile that has been marked evolved must open the modal for
// the EVOLVED species, not the captured base form. The green sprite/name already reflects the evolved
// species (applyLocVisuals reads the Mail store's `evo` overlay); the click handler must do the same.
// Pre-fix the handler captured the base species from the tile's `poke-<id>` class → this test fails
// (modal shows the base form). Runs once (desktop only) — the logic is viewport-independent.
test.describe('B-023: encounter click opens the evolved species', () => {
  test('docs viewer: an evolved encounter opens the evolved species modal', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });
    await page.dispatchEvent('.nav a[data-target="wildpokes"]', 'click');
    await page.waitForSelector('section#wildpokes.active');

    // In-page: mark a real encounter tile as evolved to an unrelated species, then click it and
    // compare the modal's content to what the EVOLVED species should render (exact, unambiguous).
    const result = await page.evaluate(() => {
      const tile = document.querySelector('#wildpokes .wild-poke[data-base-species]');
      if (!tile) return { error: 'no encounter tile found' };
      const card = tile.closest('.location-card');
      const routeId = card.dataset.routeId;
      const slot = tile.dataset.slot;
      const base = tile.dataset.baseSpecies;
      const other = pokes.find((p) => p.id && p.id !== base);
      // Write the evolution overlay into the Mail store (localStorage), keyed "<routeId>|<slot>".
      const k = nsKey('mail_v1');
      const store = JSON.parse(localStorage.getItem(k) || '{}');
      store.evo = store.evo || {};
      store.evo[routeId + '|' + slot] = other.id;
      localStorage.setItem(k, JSON.stringify(store));
      tile.click();
      const modalNode = document.getElementById('pokemon-modal');
      const actual = document.getElementById('pokemon-modal-body').innerHTML;
      // Normalise both expectations through the DOM (the live modal's innerHTML is browser-serialised,
      // e.g. attribute quoting differs from the raw builder string) so the comparison is exact.
      const norm = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.innerHTML; };
      return {
        modalOpen: !modalNode.classList.contains('hidden'),
        matchesEvolved: actual === norm(buildPokemonDetailHTML(findPoke(other.id))),
        matchesBase: actual === norm(buildPokemonDetailHTML(findPoke(base))),
        base, evolved: other.id,
      };
    });

    expect(result.error).toBeUndefined();
    expect(result.modalOpen).toBe(true);
    expect(result.matchesEvolved).toBe(true);
    expect(result.matchesBase).toBe(false);
  });
});
