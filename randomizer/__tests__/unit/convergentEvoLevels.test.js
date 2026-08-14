'use strict';

// T-282 — a converging evolution must gate at ONE level, and the docs must promise that level.
//
// `applyEvoLevels` rolled a level per holder but stored it in maps keyed by TARGET species, and both
// the text writer (`patchEvoLevelInContent`) and the injector (`injectEvolutions`) apply those maps
// by target across every entry that points at it. So the last holder processed won and every holder's
// ROM entry got that level — while each holder's in-memory `evo.param` / `evo.minLevel` kept its own
// roll, which is what the docs serialise.
//
// Reproduced on a real run before the fix: Burmy-Plant's Mothim gate read 18 in the docs and 20 in
// the ROM. Same class of defect as B-062 (docs ≠ ROM).
//
// The ROM cannot express two different gates for one target — an evolution entry carries a species
// id, and the injector already refuses rather than guess. So the fix is to make the pipeline agree
// with what the ROM can hold: one level per target, the LOWEST of the rolls, so the gate is reachable
// from whichever pre-evolution the player actually has.

const rng = require('../../rng');
const { applyEvoLevels, collapseConvergentGates } = require('../../evoLevelWriter');

afterEach(() => rng.reset());

const holder = (id, tier, ...targets) => ({
    id,
    rating: { tier },
    evolutionData: { type: 'EVO_TYPE_LC_OF_2' },
    evolutions: targets,
});
const levelEvo = pokemon => ({ method: 'LEVEL', param: '20', pokemon });
const stoneEvo = pokemon => ({ method: 'ITEM', param: 'ITEM_DAWN_STONE', pokemon, minLevel: '25' });
const target = (id, tier) => ({ id, rating: { tier }, evolutionData: { type: 'EVO_TYPE_LAST_OF_2' } });

// Three cloaks converging on one Mothim, each with a different tier so their rolls differ.
function burmyDex() {
    return [
        holder('BURMY_PLANT', 'ZU', levelEvo('WORMADAM_PLANT'), stoneEvo('MOTHIM')),
        holder('BURMY_SANDY', 'NU', levelEvo('WORMADAM_SANDY'), stoneEvo('MOTHIM')),
        holder('BURMY_TRASH', 'RU', levelEvo('WORMADAM_TRASH'), stoneEvo('MOTHIM')),
        target('WORMADAM_PLANT', 'RU'), target('WORMADAM_SANDY', 'RU'), target('WORMADAM_TRASH', 'RU'),
        target('MOTHIM', 'UU'),
    ];
}

const gateOf = evo => parseInt(evo.method === 'LEVEL' ? evo.param : evo.minLevel, 10);
const mothimGates = dex => dex
    .filter(p => (p.evolutions || []).some(e => e.pokemon === 'MOTHIM'))
    .map(p => gateOf(p.evolutions.find(e => e.pokemon === 'MOTHIM')));

describe('T-282 — every holder of a converging target gates at the same level', () => {
    test.each([1, 2, 3, 7, 12])('seed %i', seed => {
        rng.seed(seed);
        const dex = burmyDex();
        applyEvoLevels(dex);
        const gates = mothimGates(dex);
        expect(gates).toHaveLength(3);
        expect(new Set(gates).size).toBe(1);
    });

    test('the shared gate is the LOWEST of the rolls, so any cloak can reach it', () => {
        // Tested on the collapse itself, with the rolls pinned, so the assertion does not depend on
        // which levels a given seed happens to produce.
        const dex = [
            holder('BURMY_PLANT', 'ZU', { ...stoneEvo('MOTHIM'), minLevel: '31' }),
            holder('BURMY_SANDY', 'NU', { ...stoneEvo('MOTHIM'), minLevel: '18' }),
            holder('BURMY_TRASH', 'RU', { ...stoneEvo('MOTHIM'), minLevel: '27' }),
        ];
        const levelMap = new Map(); const stoneMap = new Map();
        collapseConvergentGates(dex, levelMap, stoneMap);
        expect(mothimGates(dex)).toEqual([18, 18, 18]);
        expect(stoneMap.get('MOTHIM')).toBe(18);
    });

    test('the collapse leaves a single-holder target completely alone', () => {
        const dex = [holder('PICHU', 'ZU', { ...levelEvo('PIKACHU'), param: '23' })];
        const levelMap = new Map(); const stoneMap = new Map();
        collapseConvergentGates(dex, levelMap, stoneMap);
        expect(dex[0].evolutions[0].param).toBe('23');
        expect(levelMap.size).toBe(0);
    });

    test('the map the writer and the injector consume agrees with the evo entries', () => {
        rng.seed(9);
        const dex = burmyDex();
        const { stoneMap } = applyEvoLevels(dex);
        // One entry per target, and it is exactly what every holder now carries.
        expect(stoneMap.get('MOTHIM')).toBe(mothimGates(dex)[0]);
    });
});

describe('T-282 — a non-converging evolution is untouched', () => {
    test('each Wormadam keeps its own independently rolled level', () => {
        rng.seed(5);
        const dex = burmyDex();
        const { levelMap } = applyEvoLevels(dex);
        for (const suffix of ['PLANT', 'SANDY', 'TRASH']) {
            const cloak = dex.find(p => p.id === `BURMY_${suffix}`);
            const evo = cloak.evolutions.find(e => e.pokemon === `WORMADAM_${suffix}`);
            expect(gateOf(evo)).toBe(levelMap.get(`WORMADAM_${suffix}`));
        }
    });

    test('a plain two-mon line still gets one level and one map entry', () => {
        rng.seed(6);
        const dex = [
            holder('PICHU', 'ZU', levelEvo('PIKACHU')),
            target('PIKACHU', 'RU'),
        ];
        const { levelMap } = applyEvoLevels(dex);
        expect(gateOf(dex[0].evolutions[0])).toBe(levelMap.get('PIKACHU'));
    });
});

describe('T-282 — the stone-availability floor still applies after the collapse', () => {
    test('a shared gate below the floor is raised to it', () => {
        rng.seed(3);
        const dex = burmyDex();
        applyEvoLevels(dex, {}, { stoneUnlockLevel: 40 });
        expect(mothimGates(dex)).toEqual([40, 40, 40]);
    });
});
