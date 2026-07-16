'use strict';

// T-125 inc.7 — terrain-conditional attacking moves (the terrain analogue of the weather moves). A move
// that scales with the active terrain is rated UP when the team establishes that terrain — i.e. THIS mon or
// an EARLIER teammate has the matching Surge/Hadron Engine (ctx.<terrain>), singles + doubles. Mirrors the
// weather-move handling (Thunder in rain, Blizzard in snow, …).

const fs = require('fs');
const path = require('path');
const { rateMove, rateMoveForAPokemon } = require('../../rating');

const baseData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../frontend/data/base-data.json'), 'utf8'));
const asArr = x => Array.isArray(x) ? x : Object.values(x || {});
const movesById = Object.fromEntries(asArr(baseData.allMoves || baseData.moves).map(m => [m.id, m]));
const pokesById = Object.fromEntries(asArr(baseData.allPokes).map(p => [p.id, p]));

// A real special/physical attacker so the base rating is > 0 and stable; the terrain boost is a multiplier,
// so any STAB is identical in both calls and cancels out in the comparison.
const ELEC = pokesById['SPECIES_MANECTRIC'] || pokesById['SPECIES_RAICHU'];
const PSY = pokesById['SPECIES_ALAKAZAM'] || pokesById['SPECIES_ESPEON'];

const call = (moveId, poke, ctx) => {
    const move = { ...movesById[moveId], rating: rateMove(movesById[moveId]) };
    return rateMoveForAPokemon(move, poke, null, null, [], [], ctx);
};

describe('T-125 inc.7 — terrain-scaling moves rated up under the matching terrain', () => {
    test('Rising Voltage rates higher in electric terrain', () => {
        expect(call('MOVE_RISING_VOLTAGE', ELEC, { electricTerrain: true }))
            .toBeGreaterThan(call('MOVE_RISING_VOLTAGE', ELEC, {}));
    });
    test('Psyblade rates higher in electric terrain', () => {
        expect(call('MOVE_PSYBLADE', PSY, { electricTerrain: true }))
            .toBeGreaterThan(call('MOVE_PSYBLADE', PSY, {}));
    });
    test('Expanding Force rates higher in psychic terrain', () => {
        expect(call('MOVE_EXPANDING_FORCE', PSY, { psychicTerrain: true }))
            .toBeGreaterThan(call('MOVE_EXPANDING_FORCE', PSY, {}));
    });
    test('Misty Explosion rates higher in misty terrain', () => {
        expect(call('MOVE_MISTY_EXPLOSION', PSY, { mistyTerrain: true }))
            .toBeGreaterThan(call('MOVE_MISTY_EXPLOSION', PSY, {}));
    });
    test('Terrain Pulse rates higher in ANY terrain', () => {
        expect(call('MOVE_TERRAIN_PULSE', ELEC, { grassyTerrain: true }))
            .toBeGreaterThan(call('MOVE_TERRAIN_PULSE', ELEC, {}));
    });
    test('Grassy Glide rates higher in grassy terrain (gains priority)', () => {
        expect(call('MOVE_GRASSY_GLIDE', ELEC, { grassyTerrain: true }))
            .toBeGreaterThan(call('MOVE_GRASSY_GLIDE', ELEC, {}));
    });
    test('Steel Roller is worthless outside terrain, valuable inside', () => {
        expect(call('MOVE_STEEL_ROLLER', ELEC, {})).toBe(0);
        expect(call('MOVE_STEEL_ROLLER', ELEC, { electricTerrain: true })).toBeGreaterThan(0);
    });
    test('a non-terrain team does NOT boost the move (electric terrain off → Rising Voltage unchanged)', () => {
        expect(call('MOVE_RISING_VOLTAGE', ELEC, { grassyTerrain: true }))
            .toBe(call('MOVE_RISING_VOLTAGE', ELEC, {}));
    });
});
