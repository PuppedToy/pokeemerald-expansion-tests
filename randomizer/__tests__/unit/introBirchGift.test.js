'use strict';

// T-182 — the game intro (Route 101, after the wild Zigzagoon) must:
//   1. NOT play a level-cap fanfare — the intro is not a cap milestone (cap is 8 from the start).
//   2. Spawn the starter + extras directly at the cap (GetCurrentLevelCap), not a hard-coded level 7,
//      so with the hard exp cap the party is at cap without a level-up event.
//   3. Have Professor Birch hand over ALL 13 starting items on Route 101 (not at new-game init).
// These are structural guards: the C engine / map scripts can't be built or run locally, so the suite
// asserts the source is wired correctly (same approach as T-151 / B-039).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const route101 = fs.readFileSync(path.join(ROOT, 'data/maps/Route101/scripts.inc'), 'utf8');
const newGame = fs.readFileSync(path.join(ROOT, 'src/new_game.c'), 'utf8');
const battleSetup = fs.readFileSync(path.join(ROOT, 'src/battle_setup.c'), 'utf8');

// The 13 intro items that used to be granted at new-game init and now come from Birch on Route 101.
const INTRO_ITEMS = [
    'ITEM_RARE_CANDY', // Evolve Candy
    'ITEM_OLD_ROD',
    'ITEM_MACH_BIKE',
    'ITEM_ACRO_BIKE',
    'ITEM_ULTRA_BALL',
    'ITEM_QUICK_BALL',
    'ITEM_TIMER_BALL',
    'ITEM_CHERI_BERRY',
    'ITEM_CHESTO_BERRY',
    'ITEM_PECHA_BERRY',
    'ITEM_RAWST_BERRY',
    'ITEM_ASPEAR_BERRY',
    'ITEM_PERSIM_BERRY',
];

describe('T-182 — no level-cap fanfare in the intro', () => {
    test('Route 101 intro no longer plays the cap fanfare / shows the cap message', () => {
        expect(route101).not.toMatch(/PlayLevelCapFanfare/);
        expect(route101).not.toMatch(/BufferLevelCap/);
        expect(route101).not.toMatch(/Route101_LevelCap\b/);
        // the orphaned "leveled up to" string must be gone too
        expect(route101).not.toMatch(/leveled up to/i);
    });
});

describe('T-182 — starter + extras spawn at the level cap (SSOT), not a hard-coded level', () => {
    // Isolate the CB2_GiveStarter *definition* (not the forward declaration) so we don't match
    // unrelated code: find `static void CB2_GiveStarter(void) {` and stop at the next function.
    const start = battleSetup.search(/static void CB2_GiveStarter\(void\)\s*\n\{/);
    const afterDef = battleSetup.slice(start);
    const body = afterDef.slice(0, afterDef.indexOf('\nstatic void CB2_StartFirstBattle'));

    test('battle_setup.c includes caps.h', () => {
        expect(battleSetup).toMatch(/#include "caps\.h"/);
    });

    test('CB2_GiveStarter reads the cap from GetCurrentLevelCap()', () => {
        expect(start).toBeGreaterThan(-1);
        expect(body).toMatch(/GetCurrentLevelCap\(\)/);
    });

    test('CB2_GiveStarter no longer hard-codes the starter/extra level as 7', () => {
        expect(body).not.toMatch(/ScriptGiveMonWithGenderAndNickname\([^;]*,\s*7\s*,/);
    });
});

describe('T-182 — Birch gives all 13 intro items on Route 101, not at new-game init', () => {
    test('every intro item is granted via `additem` in the Route 101 intro script', () => {
        const missing = INTRO_ITEMS.filter(
            (item) => !new RegExp(`additem\\s+${item}\\b`).test(route101),
        );
        expect(missing).toEqual([]);
    });

    test('the item gift plays its own obtain fanfare (distinct from the Pokémon one)', () => {
        // The intro already plays one MUS_OBTAIN_ITEM for the received Pokémon; the item gift adds a
        // second, consolidated "you received the items!" moment. Wording is owner-tunable, but there
        // must be a second obtain fanfare in the intro.
        const fanfares = route101.match(/playfanfare\s+MUS_OBTAIN_ITEM\b/g) || [];
        expect(fanfares.length).toBeGreaterThanOrEqual(2);
    });

    test('new_game.c no longer AddBagItem()s any of the intro items', () => {
        const stillThere = INTRO_ITEMS.filter(
            (item) => new RegExp(`AddBagItem\\(${item}\\b`).test(newGame),
        );
        expect(stillThere).toEqual([]);
    });

    test('new_game.c still clears the bag (starts empty)', () => {
        expect(newGame).toMatch(/ClearBag\(\)/);
    });
});
