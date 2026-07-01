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
