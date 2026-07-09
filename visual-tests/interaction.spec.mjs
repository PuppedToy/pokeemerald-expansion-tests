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

// T-078 regression: held items and trainer rewards must carry an item-description hover tooltip
// (data-tooltip), sourced from the injected itemsData map. Verifies the whole chain: parseItemsFile →
// base-data → pokedex.items → buildDocHtml injection → template render.
// T-082 regression: the top-bar "Next boss" stat is a shortcut — clicking it activates the Trainers
// section and scrolls THAT boss's card into view (flashing .nz-boss-focus), even when the default
// section-scroll would land on the last trainer you defeated (which is the bug this guards). We defeat
// a far-down non-boss trainer first so the two scroll targets differ, then assert Next-boss wins.
test.describe('T-082: Next boss shortcut', () => {
  test('docs viewer: "Next boss" scrolls to that boss, not the last defeated trainer', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });

    // The next boss on a fresh doc is bossCaps[0]; its target is the first of its trainers with a card.
    const targetId = await page.evaluate(() => {
      const nb = bossCaps[0];
      for (const id of nb.trainers) {
        if (document.querySelector('.trainer-card[data-trainer-id="' + id + '"]')) return id;
      }
      return null;
    });
    expect(targetId).toBeTruthy();

    // Defeat a far-down NON-boss trainer (no boss-cascade, doesn't advance the next boss) so the
    // default "last defeated" section scroll would jump far away from the next boss.
    const farId = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('#trainers .trainer-card[data-trainer-id][data-is-boss="0"]')]
        .filter((c) => c.querySelector('.nz-defeat-cb'));
      const last = cards[cards.length - 1];
      if (!last) return null;
      const cb = last.querySelector('.nz-defeat-cb');
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      return last.dataset.trainerId;
    });
    expect(farId).toBeTruthy();
    expect(farId).not.toBe(targetId);
    await expect(page.locator('.trainer-card[data-trainer-id="' + farId + '"]')).toHaveClass(/\bnz-defeated\b/);

    // Click "Next boss" → lands on the next boss (highlighted + in viewport), not the defeated card.
    await page.click('.tb-stat--boss');
    await expect(page.locator('section#trainers')).toHaveClass(/\bactive\b/);
    await expect(page.locator('.trainer-card[data-trainer-id="' + targetId + '"]')).toHaveClass(/\bnz-boss-focus\b/);
    await page.waitForTimeout(350); // let every scroll pass settle (incl. any default 150ms pass)
    const inView = await page.locator('.trainer-card[data-trainer-id="' + targetId + '"]')
      .evaluate((el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; });
    expect(inView).toBe(true);
  });
});

test.describe('T-078: item descriptions on hover', () => {
  test('docs viewer: itemsData is injected and held items carry a description tooltip', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });
    await page.dispatchEvent('.nav a[data-target="trainers"]', 'click');
    await page.waitForSelector('section#trainers.active');

    const info = await page.evaluate(() => {
      const itemsPresent = typeof itemsData !== 'undefined' && Object.keys(itemsData).length > 0;
      const heldWithTip = document.querySelector('#trainers .rm-item[data-tooltip]');
      const rewardWithTip = document.querySelector('#trainers .reward-item[data-tooltip]');
      return {
        itemsPresent,
        heldTip: heldWithTip ? heldWithTip.getAttribute('data-tooltip') : null,
        heldText: heldWithTip ? heldWithTip.textContent.trim() : null,
        rewardTip: rewardWithTip ? rewardWithTip.getAttribute('data-tooltip') : null,
      };
    });

    expect(info.itemsPresent).toBe(true);
    // At least one held item in the seed-42 run resolves to a description tooltip.
    expect(info.heldTip).toBeTruthy();
    expect(info.heldTip.length).toBeGreaterThan(0);
  });
});
