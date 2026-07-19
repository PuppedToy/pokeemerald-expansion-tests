'use strict';

// T-163 — buildTrainersResultsSimplified applies the docs-visibility redaction: per-member field
// stripping, IV inclusion, boss/non-boss filtering, reward stripping, "hide some Pokémon", and the
// showTrainers master switch. Team-ORDER behaviour (showExactPositions/displayTeam) is unchanged and
// covered by writerDocsTeamOrder.test.js.

const { buildTrainersResultsSimplified } = require('../../writerDocs');
const { normalizeDocsVisibility } = require('../../docsVisibility');

function makeMember(speciesId) {
    return {
        pokemon: { id: speciesId },
        moves: ['MOVE_TACKLE'],
        item: 'ITEM_LEFTOVERS',
        nature: 'Adamant',
        ability: 'ABILITY_LEVITATE',
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    };
}
function team(n) { return Array.from({ length: n }, (_, i) => makeMember('SPECIES_' + (i + 1))); }

function makeTrainers() {
    return {
        ROUTE_JOE: { level: 20, class: 'Youngster', reward: ['TM Return'], isBoss: false, team: team(6) },
        GYM_ROXANNE: { level: 15, class: 'Leader', reward: ['GYM_REWARD_1'], isBoss: true, team: team(4) },
    };
}

const dvWith = (over) => normalizeDocsVisibility(over);
const ids = (t) => t.map(m => m.pokemon);

describe('buildTrainersResultsSimplified — docs-visibility redaction', () => {
    test('no docsVisibility → nothing stripped (back-compat: item/nature/moves/ability/ivs kept)', () => {
        const r = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1 });
        const m = r.ROUTE_JOE.team[0];
        expect(m.item).toBe('ITEM_LEFTOVERS');
        expect(m.nature).toBe('Adamant');
        expect(m.moves).toEqual(['MOVE_TACKLE']);
        expect(m.ability).toBe('ABILITY_LEVITATE');
        expect(m.ivs).toEqual({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 });
    });

    test('default docsVisibility strips IVs (showIVs defaults off) but keeps the rest', () => {
        const r = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1, docsVisibility: dvWith({}) });
        const m = r.ROUTE_JOE.team[0];
        expect(m.ivs).toBeUndefined();
        expect(m.item).toBe('ITEM_LEFTOVERS');
        expect(m.ability).toBe('ABILITY_LEVITATE');
    });

    test('showIVs=true keeps IVs', () => {
        const r = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1, docsVisibility: dvWith({ showIVs: true }) });
        expect(r.ROUTE_JOE.team[0].ivs).toEqual({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 });
    });

    test('each field toggle strips only its field', () => {
        const cases = [
            ['showHeldItems', 'item'], ['showNatures', 'nature'], ['showMoves', 'moves'], ['showAbility', 'ability'],
        ];
        for (const [toggle, field] of cases) {
            const r = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1, docsVisibility: dvWith({ [toggle]: false }) });
            expect(r.ROUTE_JOE.team[0][field]).toBeUndefined();
        }
    });

    test('showBosses=false drops boss trainers; showNonBosses=false drops the rest', () => {
        const noBoss = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1, docsVisibility: dvWith({ showBosses: false }) });
        expect(noBoss.GYM_ROXANNE).toBeUndefined();
        expect(noBoss.ROUTE_JOE).toBeDefined();
        const noNorm = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1, docsVisibility: dvWith({ showNonBosses: false }) });
        expect(noNorm.ROUTE_JOE).toBeUndefined();
        expect(noNorm.GYM_ROXANNE).toBeDefined();
    });

    test('showTrainers=false → no trainers at all', () => {
        const r = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1, docsVisibility: dvWith({ showTrainers: false }) });
        expect(Object.keys(r)).toHaveLength(0);
    });

    test('showRewards=false empties every trainer reward', () => {
        const r = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: true, baseRngSeed: 1, docsVisibility: dvWith({ showRewards: false }) });
        expect(r.ROUTE_JOE.reward).toEqual([]);
        expect(r.GYM_ROXANNE.reward).toEqual([]);
    });

    test('hidePokemon truncates the team, records the count, hides the SAME set in team and displayTeam', () => {
        const r = buildTrainersResultsSimplified(makeTrainers(), { showExactPositions: false, baseRngSeed: 7, docsVisibility: dvWith({ hidePokemon: true, hidePokemonCount: 2 }) });
        const t = r.ROUTE_JOE;
        expect(t.hiddenCount).toBe(2);
        expect(t.team).toHaveLength(4);          // 6 - 2
        expect(t.displayTeam).toHaveLength(4);
        // Same members remain in both orderings (nothing leaks via the other array).
        expect(ids(t.team).slice().sort()).toEqual(ids(t.displayTeam).slice().sort());
    });

    test('hidePokemon never hides the whole team (capped at size-1)', () => {
        const trainers = { SOLO: { level: 5, class: 'Bug Catcher', reward: [], isBoss: false, team: team(1) },
                           TRIO: { level: 9, class: 'Lass', reward: [], isBoss: false, team: team(3) } };
        const r = buildTrainersResultsSimplified(trainers, { showExactPositions: true, baseRngSeed: 3, docsVisibility: dvWith({ hidePokemon: true, hidePokemonCount: 5 }) });
        expect(r.SOLO.team).toHaveLength(1);     // can't hide the only mon
        expect(r.SOLO.hiddenCount).toBeUndefined();
        expect(r.TRIO.team).toHaveLength(1);     // 3 - min(5, 2) = 1
        expect(r.TRIO.hiddenCount).toBe(2);
    });
});
