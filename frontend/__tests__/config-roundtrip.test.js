/**
 * T-052 Step 11 — a full config (every new option set to a non-default value) survives the
 * import/export path: JSON serialization (Save → Load via session.js) and extractConfig (which
 * accepts either a raw config or a full session bundle). The DOM-coupled setConfig↔getConfig loop
 * is guarded structurally in config-form.test.js (ADR-009: the stub doesn't parse innerHTML).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractConfig } from '../js/session.js';

const FULL_CONFIG = {
    runType: 'default',
    difficulty: 10,
    rebalance: true,
    balanceChance: 0.35,
    mutateStats: true,
    mutateAbilities: false,
    mutateTypes: true,
    mutateLearnsets: false,
    mutationProbs: {
        statBalanceChance: 0.5, buffStatChance: 0.7, repeatStatChance: 0.4,
        typeBalanceChance: 0.2, monotypeBalanceChance: 0.15, abilityBalanceChance: 0.3,
        learnsetBalanceChance: 0.25, changeTypeMoveFromOldChance: 0.8,
        changeTypeMoveFromOtherChance: 0.1, moveInsertChance: 0.6, moveRatingDeviation: 0.3,
    },
    evoLevels: {
        enabled: true, min: 8, max: 60, deviation: 0.1,
        stageAdjustments: { lcOf2: 0.05, lcOf3: -0.2, nfeOf3: 0.2 },
        baseRanges: { MAGIKARP: [6, 8], OU: [40, 50] },
        preEvoModifiers: { NU: [-0.04, 0.02] },
    },
    money: { normal: 500, boss: 4000, gym: 7500 },
    prices: {
        balls: { ultra: 50, quick: 60, timer: 70 },
        mints: { LONELY: 111, BOLD: 222, ADAMANT: 333 },
        abilityCapsule: 4444, abilityPatch: 5555,
        tms: { avgDmg: 1000, strongDmg: 8000, weather: 3500, godlikeStatus: 20000 },
    },
    starterQuality: 'OU',
    extraStarters: [
        { tier: 'UBERS', kind: 'line', lineLength: '3' },
        { tier: 'RU', kind: 'line', lineLength: 'any' },
        { tier: 'NU', kind: 'solo', lineLength: 'any' },
    ],
    wildEncounterType: 'classic',   // T-162
    pokemonPerZone: 8,               // T-162
    gymsTypeChanged: 5,
    e4TypeChanged: 1,
    championTypeChangeChance: 0.25, // T-076
    aquaTypes: ['GRASS', 'FIRE', 'RANDOM', 'WATER', 'ICE'],
    magmaTypes: ['STEEL', 'DRAGON', 'ROCK', 'GRASS', 'RANDOM'],
    disableStevenTagBattle: true,   // T-165
    seed: 123456,
    docsVisibility: {   // T-163
        showTrainers: false, showBosses: false, showNonBosses: true,
        showHeldItems: false, showNatures: false, showMoves: false, showAbility: false,
        showRewards: false, showIVs: true, showExactPositions: true,
        hidePokemon: true, hidePokemonCount: 3,
        showWildEncounters: false, showLegendaryStatic: false, showNonLegendaryStatic: false,
        showSuperRod: false, showDive: false, showSurf: false,
        showGoodRod: false, showOldRod: false, showGrass: false,
    },
    nicknames: {
        enabled: true, includeStarter: true, autoLocation: true, lockGenderPerRoute: true,
        sameNamesAcrossRuns: true, shareAcrossSoullink: false, differentPerGender: true,
        pools: { both: ['Alex', 'Sam'], female: ['Mei'], male: ['Ivan'], single: ['Robin', 'Kai'] },
    },
};

test('a full config survives JSON serialize → parse unchanged (Save/Load)', () => {
    const round = JSON.parse(JSON.stringify(FULL_CONFIG));
    assert.deepEqual(round, FULL_CONFIG);
});

test('extractConfig passes through a raw config object', () => {
    assert.deepEqual(extractConfig(FULL_CONFIG), FULL_CONFIG);
});

test('extractConfig pulls the config out of a full session bundle', () => {
    const bundle = { formatVersion: 2, generatedAt: 'x', sessionId: 's', config: FULL_CONFIG, roms: [] };
    assert.deepEqual(extractConfig(bundle), FULL_CONFIG);
});

test('nested option objects round-trip deeply (no shallow loss)', () => {
    const round = JSON.parse(JSON.stringify(FULL_CONFIG));
    assert.equal(round.mutationProbs.moveRatingDeviation, 0.3);
    assert.deepEqual(round.evoLevels.stageAdjustments, { lcOf2: 0.05, lcOf3: -0.2, nfeOf3: 0.2 });
    assert.deepEqual(round.evoLevels.baseRanges.OU, [40, 50]);
    assert.equal(round.extraStarters.length, 3);
    assert.equal(round.starterQuality, 'OU');
    assert.equal(round.wildEncounterType, 'classic');   // T-162
    assert.equal(round.pokemonPerZone, 8);               // T-162
    assert.deepEqual(round.aquaTypes, ['GRASS', 'FIRE', 'RANDOM', 'WATER', 'ICE']);
    assert.equal(round.disableStevenTagBattle, true);   // T-165
    assert.deepEqual(round.money, { normal: 500, boss: 4000, gym: 7500 });
    assert.equal(round.prices.tms.godlikeStatus, 20000);
    assert.deepEqual(round.prices.balls, { ultra: 50, quick: 60, timer: 70 });
    assert.equal(round.prices.mints.ADAMANT, 333);
    // T-163 — docs-visibility nested object survives deeply.
    assert.equal(round.docsVisibility.showTrainers, false);
    assert.equal(round.docsVisibility.showIVs, true);
    assert.equal(round.docsVisibility.hidePokemonCount, 3);
    assert.equal(round.docsVisibility.showSuperRod, false);
});
