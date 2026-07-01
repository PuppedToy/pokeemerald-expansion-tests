// Visual-regression + no-overflow suite (T-040, ADR-010). Runs once per viewport project
// (see playwright.config.mjs). Two guarantees per screen:
//   1. no horizontal overflow (documentElement.scrollWidth ≤ viewport width) — the #1 mobile smell;
//   2. pixel snapshot vs the committed baseline — the **desktop** baseline is the "desktop must not
//      change" lock; mobile/tablet baselines evolve (refresh with `npm run visual:update`).
import { test, expect } from '@playwright/test';
import { APP_SCREENS, DOCS_SCREENS, gotoDocsSection } from './screens.mjs';

async function settle(page) {
  await page.evaluate(() => Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 1500)),
  ])).catch(() => {});
  await page.waitForTimeout(200);
}

async function expectNoOverflow(page) {
  const width = page.viewportSize().width;
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `horizontal overflow: scrollWidth ${scrollWidth} > viewport ${width}`).toBeLessThanOrEqual(width + 1);
}

test.describe('app', () => {
  for (const s of APP_SCREENS) {
    test(s.name, async ({ page }) => {
      await page.goto(s.path, { waitUntil: 'domcontentloaded' });
      if (s.setup) await s.setup(page);
      await settle(page);
      await expectNoOverflow(page);
      await expect(page).toHaveScreenshot(`${s.name}.png`, { fullPage: false });
    });
  }
});

test.describe('docs-viewer', () => {
  for (const d of DOCS_SCREENS) {
    test(d.name, async ({ page }) => {
      await gotoDocsSection(page, d.target);
      await settle(page);
      await expectNoOverflow(page);
      await expect(page).toHaveScreenshot(`${d.name}.png`, { fullPage: false });
    });
  }
});
