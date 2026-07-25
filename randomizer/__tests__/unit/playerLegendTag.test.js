'use strict';

// T-199 — the Ever Grande rival's legendary slot is tagged (`playerLegend`) so the docs viewer can
// hide it behind a placeholder until Juan is marked defeated. Two concerns:
//   1) the shared predicate that recognises a PLAYER_LEGEND_* slot definition, and
//   2) that the flag rides the spread through buildTrainersResultsSimplified into the viewer copy
//      (and is never stripped by the docs-visibility redaction).

const { isPlayerLegendSpecial } = require('../../modules/utils');
const { buildTrainersResultsSimplified } = require('../../writerDocs');
const { normalizeDocsVisibility } = require('../../docsVisibility');

describe('isPlayerLegendSpecial (T-199)', () => {
    test('true for every PLAYER_LEGEND_* special', () => {
        expect(isPlayerLegendSpecial('PLAYER_LEGEND_TREECKO')).toBe(true);
        expect(isPlayerLegendSpecial('PLAYER_LEGEND_TORCHIC')).toBe(true);
        expect(isPlayerLegendSpecial('PLAYER_LEGEND_MUDKIP')).toBe(true);
    });
    test('false for other specials and for missing/empty values', () => {
        expect(isPlayerLegendSpecial('TRAINER_POKE_ENCOUNTER')).toBe(false);
        expect(isPlayerLegendSpecial('TRAINER_REPEAT_ID')).toBe(false);
        expect(isPlayerLegendSpecial(undefined)).toBe(false);
        expect(isPlayerLegendSpecial(null)).toBe(false);
        expect(isPlayerLegendSpecial('')).toBe(false);
    });
});

describe('playerLegend flag reaches the viewer trainer copy (T-199)', () => {
    const makeMember = (id, extra = {}) => ({
        pokemon: { id },
        moves: ['MOVE_TACKLE'],
        item: 'ITEM_LEFTOVERS',
        nature: 'Adamant',
        ability: 'ABILITY_LEVITATE',
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        ...extra,
    });
    const trainers = () => ({
        TRAINER_MAY_EVERGRANDE_CITY_TREECKO: {
            level: 64, class: 'Rival', reward: [], isBoss: true,
            team: [makeMember('SPECIES_A'), makeMember('SPECIES_LEG', { playerLegend: true })],
        },
    });
    const legendOf = (r) => r.TRAINER_MAY_EVERGRANDE_CITY_TREECKO.team.filter(m => m.playerLegend);

    test('exactly the legendary member carries playerLegend (order-independent)', () => {
        const r = buildTrainersResultsSimplified(trainers(), { showExactPositions: true, baseRngSeed: 1 });
        const legend = legendOf(r);
        expect(legend).toHaveLength(1);
        expect(legend[0].pokemon).toBe('SPECIES_LEG');
    });

    test('the flag is NOT stripped by the docs-visibility redaction', () => {
        const dv = normalizeDocsVisibility({ showIVs: false, showMoves: false, showHeldItems: false });
        const r = buildTrainersResultsSimplified(trainers(), { showExactPositions: false, baseRngSeed: 1, docsVisibility: dv });
        // Both the in-game team and the displayTeam copy must keep the tag.
        expect(legendOf(r)).toHaveLength(1);
        const disp = r.TRAINER_MAY_EVERGRANDE_CITY_TREECKO.displayTeam.filter(m => m.playerLegend);
        expect(disp).toHaveLength(1);
        expect(disp[0].pokemon).toBe('SPECIES_LEG');
    });
});
