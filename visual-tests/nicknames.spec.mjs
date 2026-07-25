// T-201 — auto-nickname display + capture/edit/trade behaviour in the docs viewer. Behavioural (not pixel)
// tests over a nickname-enabled fixture (build it with `npm run fixture:nick`). Desktop only — the logic is
// viewport-independent. If the fixture isn't built the whole file skips (keeps `npm run visual` green locally).
import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NICK_FIXTURE = path.join(__dirname, 'fixtures', 'docs-sample-nick.html');
const NICK_URL = 'file://' + NICK_FIXTURE;

test.describe('T-201: docs viewer nicknames', () => {
  test.skip(({ page }) => page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
  test.skip(!fs.existsSync(NICK_FIXTURE), 'nickname fixture not built — run `npm run fixture:nick`');

  // Find a capturable wild route that carries a location nickname, and capture its first slot.
  async function captureNamedRoute(page) {
    await page.goto(NICK_URL, { waitUntil: 'domcontentloaded' });
    await page.click('.nav a[data-target="wildpokes"]');
    const target = await page.evaluate(() => {
      const nn = (typeof nicknamesData !== 'undefined') ? nicknamesData : null;
      if (!nn || !nn.locations) return null;
      for (const cb of document.querySelectorAll('.nz-select-cb[data-route][data-slot]')) {
        const routeId = cb.getAttribute('data-route');
        const loc = nn.locations[routeId];
        if (loc && loc.nickname) return { routeId, slot: cb.getAttribute('data-slot'), nickname: loc.nickname };
      }
      return null;
    });
    expect(target, 'a capturable route with a location nickname exists in the fixture').toBeTruthy();
    await page.locator(`.nz-select-cb[data-route="${target.routeId}"][data-slot="${target.slot}"]`).check();
    return target;
  }

  test('capturing a wild mon shows its nickname on the encounters tile and in the PC', async ({ page }) => {
    const t = await captureNamedRoute(page);
    const tileNick = page.locator(`.location-card[data-route-id="${t.routeId}"] .wild-poke[data-slot="${t.slot}"] .nz-poke-nick`);
    await expect(tileNick).toBeVisible();
    await expect(tileNick).toHaveText(t.nickname);

    // PC tab: the same name sits under the species.
    await page.click('.nav a[data-target="pc"]');
    await expect(page.locator('#pc-grid .pc-nick', { hasText: t.nickname }).first()).toBeVisible();
  });

  test('un-capturing removes the nickname; re-capturing restores it', async ({ page }) => {
    const t = await captureNamedRoute(page);
    const cb = page.locator(`.nz-select-cb[data-route="${t.routeId}"][data-slot="${t.slot}"]`);
    const tileNick = page.locator(`.location-card[data-route-id="${t.routeId}"] .wild-poke[data-slot="${t.slot}"] .nz-poke-nick`);
    await expect(tileNick).toHaveText(t.nickname);
    await cb.uncheck();
    await expect(tileNick).toBeHidden();       // auto-nickname gone while not captured
    await cb.check();
    await expect(tileNick).toHaveText(t.nickname); // restored on re-capture
  });

  test('the modal shows "<nickname> is in box" with an Edit nickname button', async ({ page }) => {
    const t = await captureNamedRoute(page);
    // Open the modal from the captured tile (click the name, not the checkbox).
    await page.click(`.location-card[data-route-id="${t.routeId}"] .wild-poke[data-slot="${t.slot}"] .nz-poke-name`);
    const boxTag = page.locator('.box-tag', { hasText: 'is in box' });
    await expect(boxTag).toBeVisible();
    await expect(boxTag).toContainText(t.nickname);
    await expect(page.locator('.box-editnick')).toBeVisible();
  });

  test('trading a captured wanted mon swaps it to the offered species + trade name; undo reverts', async ({ page }) => {
    await page.goto(NICK_URL, { waitUntil: 'domcontentloaded' });
    await page.click('.nav a[data-target="wildpokes"]');
    // Find a town-trade route where the wanted species is a capturable slot on that route.
    const tr = await page.evaluate(() => {
      const nn = (typeof nicknamesData !== 'undefined') ? nicknamesData : null;
      if (!nn || !nn.tradesInfo) return null;
      for (const t of nn.tradesInfo) {
        if (!t || !t.routeMapId || !t.wantedSpecies) continue;
        const card = document.querySelector(`.location-card[data-route-id="${t.routeMapId}"]`);
        const tile = card && card.querySelector(`.wild-poke[data-base-species="${t.wantedSpecies}"][data-slot]`);
        if (!tile) continue;
        const slot = tile.getAttribute('data-slot');
        if (!card.querySelector(`.nz-select-cb[data-slot="${slot}"]`)) continue;
        return { routeId: t.routeMapId, slot, offeredName: t.offeredSpecies.replace('SPECIES_', ''),
                 tradeNick: (nn.trades && nn.trades[t.ingameTradeId] && nn.trades[t.ingameTradeId].nickname) || null };
      }
      return null;
    });
    expect(tr, 'a town-trade route with a capturable wanted mon exists').toBeTruthy();

    const card = `.location-card[data-route-id="${tr.routeId}"]`;
    const tradeBtn = page.locator(`${card} .nz-trade-btn`);
    const tileName = page.locator(`${card} .wild-poke[data-slot="${tr.slot}"] .nz-poke-name`);
    const tileNick = page.locator(`${card} .wild-poke[data-slot="${tr.slot}"] .nz-poke-nick`);

    // Capture the wanted mon → the "trade" button appears.
    await page.locator(`${card} .nz-select-cb[data-slot="${tr.slot}"]`).check();
    await expect(tradeBtn).toBeVisible();
    await expect(tradeBtn).toHaveText('trade');

    // Trade → the tile becomes the offered species and (with names on) shows the trade's nickname; button flips.
    await tradeBtn.click();
    await expect(tradeBtn).toHaveText('undo trade');
    await expect(tileName).toContainText(new RegExp(tr.offeredName.replace(/_/g, ' '), 'i'));
    if (tr.tradeNick) await expect(tileNick).toHaveText(tr.tradeNick);

    // Undo → back to the wanted mon.
    await tradeBtn.click();
    await expect(tradeBtn).toHaveText('trade');
    await expect(tileName).not.toContainText(new RegExp(tr.offeredName.replace(/_/g, ' '), 'i'));
  });
});
