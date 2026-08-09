// T-259 — the nav is real URLs and real links. These are the parts a source-inspection test cannot
// prove: that a deep link renders the right section on a cold load, that clicking swaps sections
// WITHOUT a page reload while still moving the URL, that Back/Forward work, and that an alias URL is
// normalised on arrival. Viewport-independent → desktop only.
import { test, expect } from '@playwright/test';

const desktopOnly = ({ page }) => test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once');

// Survives a client-side navigation, dies on a real page load. Lets us prove we did not reload.
const stampNoReload = (page) => page.evaluate(() => { window.__noReload = true; });
const survived = (page) => page.evaluate(() => window.__noReload === true);

test.describe('URL routing', () => {
  test('a deep link renders its destination on a cold load', async ({ page }) => {
    desktopOnly({ page });
    for (const [path, section, panel] of [
      ['/features', 'features', 'rom'],
      ['/features/docs', 'features', 'docs'],
      ['/features/randomizer', 'features', 'randomizer'],
      ['/randomizer', 'randomizer', null],
      ['/feedback/bugs', 'feedback', 'bugs'],
      ['/settings', 'settings', null],
    ]) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(`#tab-${section}`)).toHaveClass(/\bactive\b/);
      await expect(page.locator(`.topnav-tab[data-tab="${section}"]`)).toHaveClass(/\bactive\b/);
      if (panel && section === 'features') {
        await expect(page.locator(`[data-subtab-panel="${panel}"]`)).toHaveClass(/\bactive\b/);
      }
      if (panel && section === 'feedback') {
        await expect(page.locator(`[data-fb-panel="${panel}"]`)).toHaveClass(/\bactive\b/);
      }
      expect(page.url()).toContain(path);
    }
  });

  test('/features/randomizer is the Features list, not the Randomizer page', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/features/randomizer', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#tab-features')).toHaveClass(/\bactive\b/);
    await expect(page.locator('#tab-randomizer')).not.toHaveClass(/\bactive\b/);
  });

  test('clicking the nav moves the URL without reloading the page', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await stampNoReload(page);

    await page.click('.topnav-tab[data-tab="features"]');
    await expect(page).toHaveURL('/features');
    await expect(page.locator('#tab-features')).toHaveClass(/\bactive\b/);

    await page.click('.subtab[data-subtab="docs"]');
    await expect(page).toHaveURL('/features/docs');
    await expect(page.locator('[data-subtab-panel="docs"]')).toHaveClass(/\bactive\b/);

    await page.click('.topnav-tab[data-tab="randomizer"]');
    await expect(page).toHaveURL('/randomizer');

    expect(await survived(page)).toBe(true); // never left the document
  });

  test('the landing call-to-action is a link to /features', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.goto-tab')).toHaveAttribute('href', '/features');
    await page.click('.goto-tab');
    await expect(page).toHaveURL('/features');
  });

  test('Back and Forward walk the destinations the user visited', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.click('.topnav-tab[data-tab="features"]');
    await page.click('.subtab[data-subtab="docs"]');
    await page.click('.topnav-tab[data-tab="feedback"]');

    await page.goBack();
    await expect(page).toHaveURL('/features/docs');
    await expect(page.locator('[data-subtab-panel="docs"]')).toHaveClass(/\bactive\b/);

    await page.goBack();
    await expect(page).toHaveURL('/features');
    await expect(page.locator('[data-subtab-panel="rom"]')).toHaveClass(/\bactive\b/);

    await page.goBack();
    await expect(page).toHaveURL('/');
    await expect(page.locator('#tab-home')).toHaveClass(/\bactive\b/);

    await page.goForward();
    await expect(page).toHaveURL('/features');
    await expect(page.locator('#tab-features')).toHaveClass(/\bactive\b/);
  });

  test('clicking the same destination twice does not pile up history entries', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.click('.topnav-tab[data-tab="features"]');
    await page.click('.topnav-tab[data-tab="features"]');
    await page.click('.subtab[data-subtab="rom"]');   // canonically /features too
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('an alias URL is normalised on arrival, so Back does not bounce through it', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/features/rom', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/features');
    await expect(page.locator('[data-subtab-panel="rom"]')).toHaveClass(/\bactive\b/);

    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/');
    await expect(page.locator('#tab-home')).toHaveClass(/\bactive\b/);
  });

  test('each destination has its own title and marks itself current for assistive tech', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Pokémon Emerald Cut');
    await expect(page.locator('.topnav-tab[data-tab="home"]')).toHaveAttribute('aria-current', 'page');

    await page.goto('/features/docs', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Generated docs · Features · Pokémon Emerald Cut');
    await expect(page.locator('.topnav-tab[data-tab="features"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.subtab[data-subtab="docs"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.topnav-tab[data-tab="home"]')).not.toHaveAttribute('aria-current', 'page');
  });

  test('the brand goes home, and the standalone legal pages are still real page loads', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.click('#brand-home');
    await expect(page).toHaveURL('/');

    await page.click('.site-footer a[href="/privacy.html"]');
    await expect(page).toHaveURL('/privacy.html');
    await expect(page.locator('body')).toContainText('Privacy Policy');
  });

  test('a non-admin does not get parked on /admin', async ({ page }) => {
    desktopOnly({ page });
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/');          // bounced once the auth state resolves
    await expect(page.locator('#admin-tab')).toBeHidden();
  });
});
