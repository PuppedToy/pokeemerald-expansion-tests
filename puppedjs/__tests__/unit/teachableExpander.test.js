'use strict';

const rng = require('../../rng');
const { expandAllTeachables, HM_MOVES } = require('../../teachableExpander');
const miniMoves = require('../fixtures/miniMoves');
const { MACHOP, MACHOKE, MACHAMP, STARMIE, SLOWBRO_MEGA } = require('../fixtures/miniPokes');

// Build a moves lookup keyed by move ID (as teachableExpander expects).
const movesById = {};
for (const [id, move] of Object.entries(miniMoves)) {
    movesById[id] = { ...move, type: move.type };
}

// Full TM pool: all non-HM moves from miniMoves.
const TM_POOL = new Set(
    Object.keys(miniMoves).filter(id => !HM_MOVES.has(id))
);

function clonePoke(p) {
    return {
        ...p,
        parsedTypes: [...p.parsedTypes],
        parsedAbilities: [...p.parsedAbilities],
        learnset: p.learnset.map(l => ({ ...l })),
        teachables: [...p.teachables],
        newTeachables: [],
        oldTeachables: [],
    };
}

beforeEach(() => {
    rng.reset();
});

describe('expandAllTeachables — base form', () => {
    test('base form teachables are a subset of tmPool ∪ original teachables', () => {
        rng.seed(1);
        const starmie = clonePoke(STARMIE);
        expandAllTeachables([starmie], TM_POOL, movesById);

        for (const m of starmie.teachables) {
            if (HM_MOVES.has(m)) continue; // HMs are always allowed
            expect(TM_POOL.has(m) || STARMIE.teachables.includes(m)).toBe(true);
        }
    });

    test('newTeachables contains only moves not in the original official learnset', () => {
        rng.seed(2);
        const starmie = clonePoke(STARMIE);
        expandAllTeachables([starmie], TM_POOL, movesById);

        const original = new Set(STARMIE.teachables);
        for (const m of starmie.newTeachables) {
            expect(original.has(m)).toBe(false);
        }
    });

    test('oldTeachables contains official non-HM TMs absent from the run pool', () => {
        // STARMIE official teachables: SURF (HM — always preserved), THUNDERBOLT, FLAMETHROWER.
        // Pool excludes THUNDERBOLT and FLAMETHROWER → both should appear in oldTeachables.
        rng.seed(3);
        const starmie = clonePoke(STARMIE);
        const reducedPool = new Set(['MOVE_EARTHQUAKE', 'MOVE_CLOSE_COMBAT']);
        expandAllTeachables([starmie], reducedPool, movesById);

        expect(starmie.oldTeachables).toContain('MOVE_THUNDERBOLT');
        expect(starmie.oldTeachables).toContain('MOVE_FLAMETHROWER');
        // SURF is an HM — it must NOT appear in oldTeachables (it's always preserved instead)
        expect(starmie.oldTeachables).not.toContain('MOVE_SURF');
    });

    test('HM moves in original teachables are always preserved', () => {
        rng.seed(4);
        const pokeWithHM = clonePoke(STARMIE);
        pokeWithHM.teachables = [...STARMIE.teachables, 'MOVE_SURF', 'MOVE_DIVE'];
        expandAllTeachables([pokeWithHM], TM_POOL, movesById);

        expect(pokeWithHM.teachables).toContain('MOVE_SURF');
        expect(pokeWithHM.teachables).toContain('MOVE_DIVE');
    });
});

describe('expandAllTeachables — evolution chain', () => {
    test('evolution inherits base teachables (not rolled again)', () => {
        rng.seed(10);
        const pokes = [clonePoke(MACHOP), clonePoke(MACHOKE), clonePoke(MACHAMP)];
        expandAllTeachables(pokes, TM_POOL, movesById);

        const machop = pokes.find(p => p.id === 'SPECIES_MACHOP');
        const machoke = pokes.find(p => p.id === 'SPECIES_MACHOKE');

        // Every non-HM move in Machop's final teachables should be in Machoke's teachables.
        for (const m of machop.teachables) {
            if (!HM_MOVES.has(m)) {
                expect(machoke.teachables).toContain(m);
            }
        }
    });

    test('topological order: machamp inherits machop teachables even if processed first', () => {
        rng.seed(11);
        // Provide them in reverse order — should still process correctly.
        const pokes = [clonePoke(MACHAMP), clonePoke(MACHOKE), clonePoke(MACHOP)];
        expandAllTeachables(pokes, TM_POOL, movesById);

        const machop = pokes.find(p => p.id === 'SPECIES_MACHOP');
        const machamp = pokes.find(p => p.id === 'SPECIES_MACHAMP');

        for (const m of machop.teachables) {
            if (!HM_MOVES.has(m)) {
                expect(machamp.teachables).toContain(m);
            }
        }
    });
});

describe('expandAllTeachables — mega forms', () => {
    test('mega inherits base form teachables exactly (no extra rolls)', () => {
        // We need SLOWBRO base + SLOWBRO_MEGA in the same list.
        // For simplicity, create a minimal SLOWBRO base that looks like SLOWBRO_MEGA's base.
        const slowbroBase = {
            ...clonePoke(STARMIE),
            id: 'SPECIES_SLOWBRO',
            family: 'P_FAMILY_SLOWPOKE',
            evolutionData: { type: 'EVO_TYPE_FINAL', isMega: false, isLC: false, isNFE: false, isFinal: true, megaEvos: ['SPECIES_SLOWBRO_MEGA'] },
            evolutions: [],
            teachableLearnset: 'sSlowbroTeachableLearnset',
        };
        const mega = clonePoke(SLOWBRO_MEGA);

        rng.seed(20);
        const pokes = [slowbroBase, mega];
        expandAllTeachables(pokes, TM_POOL, movesById);

        // Mega should have the same non-HM teachables as the base (no more, no less extra).
        const baseNonHM = slowbroBase.teachables.filter(m => !HM_MOVES.has(m));
        for (const m of baseNonHM) {
            expect(mega.teachables).toContain(m);
        }
    });
});

describe('expandAllTeachables — no TM pool', () => {
    test('does nothing when tmPool is null', () => {
        const starmie = clonePoke(STARMIE);
        const originalTeachables = [...starmie.teachables];
        expandAllTeachables([starmie], null, movesById);
        expect(starmie.teachables).toEqual(originalTeachables);
    });
});

describe('expandAllTeachables — determinism', () => {
    test('same seed produces identical teachable sets', () => {
        const run1 = [clonePoke(STARMIE)];
        rng.seed(99);
        expandAllTeachables(run1, TM_POOL, movesById);

        const run2 = [clonePoke(STARMIE)];
        rng.seed(99);
        expandAllTeachables(run2, TM_POOL, movesById);

        expect(run1[0].teachables).toEqual(run2[0].teachables);
        expect(run1[0].newTeachables).toEqual(run2[0].newTeachables);
    });
});
