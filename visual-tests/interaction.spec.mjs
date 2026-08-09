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

  // B-063: #admin-tab carries `hidden` until /api/me reports isAdmin, but the mobile layer's
  // `.topnav-tab { display: flex }` overrode it — so the drawer advertised the beta admin panel to
  // every phone visitor, signed out included. Computed-visibility bug: only a browser can catch it.
  test('app: a nav entry hidden by attribute is not listed in the drawer (B-063)', async ({ page }) => {
    mobileOnly({ page });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.click('#nav-burger');
    await expect(page.locator('#topnav-menu')).toBeVisible();
    await expect(page.locator('#admin-tab')).toBeHidden();
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

    // The next boss on a fresh doc is bossCaps[0] (the rival). B-053: the rival cards are gender-filtered
    // even before a starter is picked, so only the chosen gender's variants are visible — target the first
    // VISIBLE variant, which is the one "Next boss" scrolls to (a hidden variant is never the target).
    const targetId = await page.evaluate(() => {
      const nb = bossCaps[0];
      for (const id of nb.trainers) {
        const c = document.querySelector('.trainer-card[data-trainer-id="' + id + '"]');
        if (c && c.style.display !== 'none') return id;
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

  // When the next boss is the rival, there are 6 variant cards (Brendan/May × 3 starters); once a
  // starter is picked only the matching one is shown. The jump must target that VISIBLE variant, not
  // the first (now-hidden) one in the boss's trainer list.
  test('docs viewer: with a starter picked, "Next boss" targets the visible rival variant', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });

    // Pick a starter (STARTERS route, slot special1) → applyStarterRivals hides the other rival cards.
    const picked = await page.evaluate(() => {
      const cb = document.querySelector('.location-card[data-route-id="STARTERS"] .wild-poke[data-slot="special1"] .nz-select-cb');
      if (!cb) return false;
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });
    expect(picked).toBe(true);

    // The next boss is still the rival (picking a starter defeats nothing). Its first-listed variant is
    // now hidden; exactly one variant is visible.
    const ids = await page.evaluate(() => {
      const nb = bossCaps[0];
      let firstExisting = null, visible = null;
      for (const id of nb.trainers) {
        const c = document.querySelector('.trainer-card[data-trainer-id="' + id + '"]');
        if (!c) continue;
        if (firstExisting === null) firstExisting = id;
        if (visible === null && c.style.display !== 'none') visible = id;
      }
      const firstHidden = firstExisting
        ? document.querySelector('.trainer-card[data-trainer-id="' + firstExisting + '"]').style.display === 'none'
        : null;
      return { firstExisting, visible, firstHidden };
    });
    expect(ids.visible).toBeTruthy();
    expect(ids.firstHidden).toBe(true);          // the naive "first variant" is hidden now
    expect(ids.visible).not.toBe(ids.firstExisting);

    // Clicking "Next boss" must highlight the VISIBLE variant (the fix), not the hidden first one.
    await page.click('.tb-stat--boss');
    await expect(page.locator('section#trainers')).toHaveClass(/\bactive\b/);
    await expect(page.locator('.trainer-card[data-trainer-id="' + ids.visible + '"]')).toHaveClass(/\bnz-boss-focus\b/);
    const hiddenFocused = await page.locator('.trainer-card[data-trainer-id="' + ids.firstExisting + '"]')
      .evaluate((el) => el.classList.contains('nz-boss-focus'));
    expect(hiddenFocused).toBe(false);           // never targets the hidden variant
  });
});

// B-024 regression: evolution mails must fire for evolutions available at or below the first cap.
// The Mail engine's per-boss windows are (bossCaps[i].level, bossCaps[i+1].level], whose union starts
// at the first cap — so a low/immediate (level ≤ first cap, incl. 0) evolution never got a mail. We
// defeat the first boss and assert the evolution mail for a box mon with such an evo now exists.
test.describe('B-024: evolution mails below the first cap', () => {
  test('docs viewer: defeating the first boss surfaces low-evolution mails', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });

    // A STARTER_EXTRA box mon whose evolution level is ≤ the first cap (the case that never notified).
    const expected = await page.evaluate(() => {
      const evoGate = (e) => {
        if ((e.method === 'LEVEL' || e.method === 'LEVEL_BATTLE_ONLY') && /^\d+$/.test(String(e.param))) return +e.param;
        if (e.method === 'ITEM' && e.minLevel != null && /^\d+$/.test(String(e.minLevel))) return +e.minLevel;
        return null;
      };
      const byId = {}; pokes.forEach((p) => { byId[p.id] = p; });
      const firstCap = bossCaps[0].level;
      const se = wildPokes.find((r) => r.id === 'STARTER_EXTRA');
      for (const k of Object.keys(se).filter((x) => x.startsWith('special'))) {
        const p = byId[se[k]]; if (!p || !p.evolutions) continue;
        for (const e of p.evolutions) { const lv = evoGate(e); if (lv != null && lv <= firstCap) return { to: e.pokemon, encounterKey: 'STARTER_EXTRA|' + k, level: lv }; }
      }
      return null;
    });
    expect(expected, 'seed-42 fixture has a box mon evolving at ≤ first cap').toBeTruthy();

    // Defeat the first boss (any of its trainer variants) → the mail engine regenerates.
    const defeated = await page.evaluate((ids) => {
      for (const id of ids) {
        const cb = document.querySelector('.trainer-card[data-trainer-id="' + id + '"] .nz-defeat-cb');
        if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); return id; }
      }
      return null;
    }, await page.evaluate(() => bossCaps[0].trainers));
    expect(defeated).toBeTruthy();

    // Open Mail so the list renders, then assert the evolution mail for that low-evo mon is present.
    await page.dispatchEvent('.nav a[data-target="mail"]', 'click');
    await page.waitForSelector('section#mail.active');
    const found = await page.evaluate((exp) => {
      return [...document.querySelectorAll('[data-evolve]')].some((b) => {
        const v = b.getAttribute('data-evolve') || '';
        return v.includes(exp.encounterKey) && v.endsWith(exp.to);
      });
    }, expected);
    expect(found).toBe(true);
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

// T-172 regression: the config UI warns inline, next to the ROM-count inputs, when the chosen number
// of ROMs would land the build in the SLOW queue (romsTotal > FAST_MAX_ROMS = 2), naming the fast-queue
// limit; it hides again at or below the limit. The unit tests use a DOM stub that can't parse innerHTML,
// so this is the only place the actual show/hide + text wiring runs in a real browser.
// T-199 regression: the Ever Grande rival's legendary is hidden behind a placeholder
// ("A legendary Pokémon") until the player marks Juan (TRAINER_JUAN_1) as defeated, at which point it
// reveals the real species. Gated purely on Juan's per-trainer Defeated checkbox (nzState), so this is
// the interaction that proves the whole chain: playerLegend tag → placeholder render → reveal on toggle.
test.describe('T-199: rival legendary hidden until Juan is defeated', () => {
  test('docs viewer: the rival legendary is a placeholder until Juan is defeated, then reveals', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    // Marking a late boss (Juan = Badge 8) triggers the mail engine's "mark earlier bosses too?" confirm;
    // accept it (as a real user would) so Juan ends up genuinely defeated instead of being un-checked.
    page.on('dialog', (d) => d.accept());
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });

    // Pick a starter (special1 → treecko) so exactly one Ever Grande rival variant is shown with its
    // legendary slot (default rival gender is May). Driving the checkbox directly is section-independent.
    const picked = await page.evaluate(() => {
      const cb = document.querySelector('.location-card[data-route-id="STARTERS"] .wild-poke[data-slot="special1"] .nz-select-cb');
      if (!cb) return false;
      cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });
    expect(picked).toBe(true);

    // Activate the Trainers section so the rival card is actually rendered/visible.
    await page.dispatchEvent('.nav a[data-target="trainers"]', 'click');
    await page.waitForSelector('section#trainers.active');

    const rivalCard = page.locator('.trainer-card[data-trainer-id="TRAINER_MAY_EVERGRANDE_CITY_TREECKO"]');
    await expect(rivalCard).toBeVisible();
    const placeholder = rivalCard.locator('.rival-legend-placeholder');
    const realRow = rivalCard.locator('.rival-legend-real');

    // Before Juan: the placeholder is shown, the real species row is hidden.
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toContainText('A legendary Pokémon');
    await expect(realRow).toBeHidden();

    // Mark Juan defeated via his per-trainer Defeated checkbox.
    const juanFound = await page.evaluate(() => {
      const cb = document.querySelector('.trainer-card[data-trainer-id="TRAINER_JUAN_1"] .nz-defeat-cb');
      if (!cb) return false;
      cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    });
    expect(juanFound).toBe(true);

    // After Juan: the placeholder is gone and the real legendary row (a clickable species) is shown.
    await expect(placeholder).toBeHidden();
    await expect(realRow).toBeVisible();
    await expect(realRow).toHaveClass(/\btrainer-poke\b/);
  });
});

// B-053 regression: the Rival May/Brendan toggle must filter the rival cards even with NO starter picked
// (show the 3 variants of the chosen gender, default May), and narrow to 1 once a starter is picked. Pre-fix
// applyStarterRivals only hid cards when a starter was selected, so with no starter all 6 variants showed.
test.describe('B-053: rival gender toggle filters without a starter', () => {
  test('docs viewer: no starter → 3 of the chosen gender; toggle swaps; starter → 1', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    await page.goto(DOCS_FIXTURE_URL, { waitUntil: 'domcontentloaded' });
    await page.dispatchEvent('.nav a[data-target="trainers"]', 'click');
    await page.waitForSelector('section#trainers.active');

    // Count shown rival cards per gender via the `rival-<gender>-<starter>` classes (all appearances share
    // them; style.display is section-independent). Brendan's id lacks "_CITY", so count by class not id.
    const state = () => page.evaluate(() => {
      const cardsFor = (g, s) => [...document.querySelectorAll('.trainer-card.rival-' + g + '-' + s)];
      const gender = (g) => ['treecko', 'torchic', 'mudkip'].flatMap((s) => cardsFor(g, s));
      const shown = (arr) => arr.filter((c) => c.style.display !== 'none').length;
      return {
        mayTotal: gender('may').length, mayShown: shown(gender('may')),
        brendanTotal: gender('brendan').length, brendanShown: shown(gender('brendan')),
        mayTreecko: shown(cardsFor('may', 'treecko')),
        mayTorchic: shown(cardsFor('may', 'torchic')),
        mayMudkip: shown(cardsFor('may', 'mudkip')),
      };
    });
    const setGender = (value) => page.evaluate((v) => {
      const radio = document.querySelector('.rival-gender-radio[value="' + v + '"]');
      radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);

    // Fresh: no starter, default gender May → every May card shown, no Brendan card shown.
    let s = await state();
    expect(s.mayTotal).toBeGreaterThan(0);
    expect(s.brendanTotal).toBeGreaterThan(0);
    expect(s.mayShown).toBe(s.mayTotal);
    expect(s.brendanShown).toBe(0);

    // Toggle to Brendan (still no starter) → every Brendan card shown, no May card shown.
    await setGender('brendan');
    s = await state();
    expect(s.brendanShown).toBe(s.brendanTotal);
    expect(s.mayShown).toBe(0);

    // Back to May, then pick a starter (special1 → treecko) → only the may-treecko variant shows.
    await setGender('may');
    await page.evaluate(() => {
      const cb = document.querySelector('.location-card[data-route-id="STARTERS"] .wild-poke[data-slot="special1"] .nz-select-cb');
      cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
    s = await state();
    expect(s.mayTreecko).toBeGreaterThan(0);
    expect(s.mayTorchic).toBe(0);
    expect(s.mayMudkip).toBe(0);
    expect(s.brendanShown).toBe(0);
  });
});

test.describe('T-172: slow-queue ROM-count warning', () => {
  test('app: ROM counts over the fast-queue limit warn inline (Nuzlocke + Soul-Link)', async ({ page }) => {
    test.skip(page.viewportSize().width < 1440, 'viewport-independent — run once on desktop');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.dispatchEvent('[data-tab="randomizer"]', 'click');
    await page.waitForSelector('#config-form-mount .config-accordion');

    // Select a run type by driving the (visually-hidden) radio directly and firing its change handler.
    const pickRunType = (id) => page.evaluate((rid) => {
      const r = document.getElementById(rid);
      r.checked = true;
      r.dispatchEvent(new Event('change', { bubbles: true }));
    }, id);
    const setNum = (id, val) => page.evaluate(({ i, v }) => {
      const el = document.getElementById(i);
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, { i: id, v: val });

    // Nuzlocke: the default 3 ROMs is over the limit → warning shows and names the fast-queue limit.
    await pickRunType('run-nuzlocke');
    const nz = page.locator('#nz-slow-queue-warning');
    await expect(nz).toBeVisible();
    await expect(nz).toContainText('fast-queue limit of 2');
    await expect(nz).toContainText(/slow queue/i);

    // Exactly at the limit (2 ROMs) → warning hides.
    await setNum('nz-numroms', 2);
    await expect(nz).toBeHidden();

    // Back above the limit → shows again, naming the new total.
    await setNum('nz-numroms', 5);
    await expect(nz).toBeVisible();
    await expect(nz).toContainText('5 ROMs');

    // Soul-Link: default 2 players × 2 ROMs-per-player = 4 → over the limit.
    await pickRunType('run-soullink');
    const sl = page.locator('#sl-slow-queue-warning');
    await expect(sl).toBeVisible();
    await expect(sl).toContainText('fast-queue limit of 2');

    // Drop to 2 players × 1 ROM = 2 (the limit) → hides.
    await setNum('sl-roms-per-player', 1);
    await expect(sl).toBeHidden();
  });
});
