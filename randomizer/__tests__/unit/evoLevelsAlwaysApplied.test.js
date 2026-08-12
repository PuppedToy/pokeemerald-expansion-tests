'use strict';

// T-275 — evolution-level adjustment is NOT optional any more: every run rebalances the levels with
// the algorithm, and only *how* it does so stays configurable. T-052 gated `applyEvoLevels` behind
// `evoLevels.enabled`; the toggle is gone from the frontend, so the only way the pipeline could still
// see `enabled: false` is a LEGACY config (a saved session JSON, or a bundle regenerated from an older
// run). That value must be inert — never a switch that brings the base game's levels back.
//
// Drives the real `makePokedex` with the pokédex module stubbed out, so the assertion is on the
// pipeline's own wiring rather than on `evoLevelWriter` (covered by evoLevelWriter.test.js).

jest.mock('../../modules/pokedexModule', () => ({ runPokedexModule: jest.fn() }));

const { runPokedexModule } = require('../../modules/pokedexModule');
const { makePokedex } = require('../../generate');
const rng = require('../../rng');
const { EVO_LEVEL_MIN, EVO_LEVEL_MAX } = require('../../constants');

afterEach(() => rng.reset());

// Base-game shape: a 2-stage line whose evolution sits at level 16 in the source data.
const BASE_GAME_LEVEL = '16';
function fakePokedex() {
    return {
        capLevels: {},
        pokes: [
            {
                id: 'SPECIES_A',
                rating: { tier: 'NU' },
                evolutionData: { type: 'EVO_TYPE_LC' },
                evolutions: [{ method: 'LEVEL', param: BASE_GAME_LEVEL, pokemon: 'SPECIES_B' }],
            },
            { id: 'SPECIES_B', rating: { tier: 'NU' }, evolutionData: { type: 'EVO_TYPE_FINAL' }, evolutions: [] },
        ],
    };
}

beforeEach(() => {
    runPokedexModule.mockImplementation(async () => fakePokedex());
});

describe('makePokedex always adjusts evolution levels (T-275)', () => {
    test('a legacy `evoLevels.enabled: false` no longer keeps the base-game level', async () => {
        rng.seed(1);
        // min = max pins the computed level, so the assertion holds for any RNG stream.
        const dex = await makePokedex({ evoLevels: { enabled: false, min: 40, max: 40 } }, {});
        expect(dex.pokes[0].evolutions[0].param).toBe('40');
    });

    test('the run\'s tuning still drives the level it writes', async () => {
        rng.seed(1);
        const dex = await makePokedex({ evoLevels: { min: 25, max: 25 } }, {});
        expect(dex.pokes[0].evolutions[0].param).toBe('25');
    });

    test('with no evoLevels config at all the level is still recomputed within the constant window', async () => {
        rng.seed(1);
        const dex = await makePokedex({}, {});
        const level = parseInt(dex.pokes[0].evolutions[0].param, 10);
        expect(level).toBeGreaterThanOrEqual(EVO_LEVEL_MIN);
        expect(level).toBeLessThanOrEqual(EVO_LEVEL_MAX);
    });
});
