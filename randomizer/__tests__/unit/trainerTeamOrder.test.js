'use strict';

const { applyLeadLogic } = require('../../modules/trainerTeamOrder');

function makeEntry(id, moves = [], ability = '') {
    return { _id: id, moves, ability };
}

// Returns a rngFn that yields the given values in sequence, then throws.
function makeRng(...rolls) {
    let i = 0;
    return () => {
        if (i >= rolls.length) throw new Error(`makeRng: unexpected call #${i + 1} (only ${rolls.length} values provided)`);
        return rolls[i++];
    };
}

const A = makeEntry('A');
const B = makeEntry('B');
const C = makeEntry('C');
const D = makeEntry('D');

const SR  = makeEntry('SR',  ['MOVE_STEALTH_ROCK']);
const TD  = makeEntry('TD',  [],                   'TOXIC_DEBRIS');
const SPK = makeEntry('SPK', ['MOVE_SPIKES']);
const TSP = makeEntry('TSP', ['MOVE_TOXIC_SPIKES']);
const ILL = makeEntry('ILL', [],                   'ILLUSION');
const ILL2 = makeEntry('ILL2', [],                 'ILLUSION');

// ── Edge cases ────────────────────────────────────────────────────────────────

test('empty team → returns []', () => {
    expect(applyLeadLogic([], makeRng())).toEqual([]);
});

test('single-entry team → returns that entry unchanged', () => {
    expect(applyLeadLogic([A], makeRng())).toEqual([A]);
});

// ── Phase 1: Stealth Rock / Toxic Debris (90%) ────────────────────────────────

test('SR setter + roll 0.89 → SR goes first', () => {
    const team = [A, B, SR, C];
    const result = applyLeadLogic(team, makeRng(0.89));
    expect(result[0]._id).toBe('SR');
    expect(result).toHaveLength(4);
});

test('SR setter + roll 0.90 → SR does NOT go first (falls through)', () => {
    const team = [A, SR, B];
    // Phase 1 roll = 0.90 (fails). No spikes/illusion → returns unchanged.
    const result = applyLeadLogic(team, makeRng(0.90));
    expect(result[0]._id).toBe('A');
});

test('Toxic Debris ability + roll 0.50 → TD goes first', () => {
    const team = [A, TD, B];
    const result = applyLeadLogic(team, makeRng(0.50));
    expect(result[0]._id).toBe('TD');
});

test('no SR/TD → phase 1 rngFn is NOT called', () => {
    // makeRng with no rolls — any call would throw
    const team = [A, B, SPK];
    // Phase 1: no hazard1 setter, skip rng. Phase 2: SPK roll = 0.50.
    const result = applyLeadLogic(team, makeRng(0.50));
    expect(result[0]._id).toBe('SPK');
});

// ── Phase 2: Spikes / Toxic Spikes (80%) ─────────────────────────────────────

test('Spikes setter (no SR) + roll 0.79 → Spikes goes first', () => {
    const team = [A, B, SPK];
    const result = applyLeadLogic(team, makeRng(0.79));
    expect(result[0]._id).toBe('SPK');
});

test('Spikes setter + roll 0.80 → does not go first (falls through)', () => {
    const team = [A, SPK, B];
    // Phase 2 roll fails (0.80). No illusion → original order.
    const result = applyLeadLogic(team, makeRng(0.80));
    expect(result[0]._id).toBe('A');
});

test('Toxic Spikes setter (no SR/Spikes) + roll 0.50 → TSP goes first', () => {
    const team = [A, TSP, B];
    const result = applyLeadLogic(team, makeRng(0.50));
    expect(result[0]._id).toBe('TSP');
});

test('SR roll fails → Spikes roll succeeds → Spikes goes first', () => {
    const team = [SR, SPK, A];
    // Phase 1: SR found, roll = 0.91 (fails). Phase 2: SPK found, roll = 0.50 (succeeds).
    const result = applyLeadLogic(team, makeRng(0.91, 0.50));
    expect(result[0]._id).toBe('SPK');
});

// ── Phase 3: Illusion (30% first / 70% second) ───────────────────────────────

test('no hazard setters, Illusion + roll 0.29 → Illusion goes first', () => {
    const team = [A, B, ILL, C];
    const result = applyLeadLogic(team, makeRng(0.29));
    expect(result[0]._id).toBe('ILL');
    expect(result).toHaveLength(4);
});

test('no hazard setters, Illusion + roll 0.30 → Illusion goes second (index 1)', () => {
    const team = [A, B, ILL, C];
    const result = applyLeadLogic(team, makeRng(0.30));
    expect(result[1]._id).toBe('ILL');
    expect(result[0]._id).toBe('A');
});

test('2 Illusion users + roll 0.29 → both at front (indices 0 and 1)', () => {
    const team = [A, ILL, B, ILL2, C];
    const result = applyLeadLogic(team, makeRng(0.29));
    expect(result[0]._id).toBe('ILL');
    expect(result[1]._id).toBe('ILL2');
    expect(result).toHaveLength(5);
});

test('2 Illusion users + roll 0.30 → first to index 1, second to index 2', () => {
    const team = [A, ILL, B, ILL2, C];
    const result = applyLeadLogic(team, makeRng(0.30));
    expect(result[0]._id).toBe('A');
    expect(result[1]._id).toBe('ILL');
    expect(result[2]._id).toBe('ILL2');
});

test('SR roll fails, Illusion present → Illusion phase fires', () => {
    const team = [SR, ILL, A];
    // Phase 1: SR found, roll = 0.91 (fails). Phase 2: no hazard2. Phase 3: roll = 0.29 (leads).
    const result = applyLeadLogic(team, makeRng(0.91, 0.29));
    expect(result[0]._id).toBe('ILL');
});

test('no hazard, no illusion → team returned unchanged', () => {
    const team = [A, B, C, D];
    const result = applyLeadLogic(team, makeRng());
    expect(result).toEqual([A, B, C, D]);
});

test('SR roll succeeds, Illusion also in team → Illusion NOT repositioned', () => {
    const team = [A, SR, ILL, B];
    // Phase 1: SR found, roll = 0.50 (succeeds) → SR to front. Done.
    const result = applyLeadLogic(team, makeRng(0.50));
    expect(result[0]._id).toBe('SR');
    // Illusion stays wherever the splice left it
    const illusionIdx = result.findIndex(e => e._id === 'ILL');
    expect(illusionIdx).not.toBe(0);
});

// ── Immutability: original array is not mutated ───────────────────────────────

test('original team array is not mutated', () => {
    const team = [A, SR, B];
    const copy = [...team];
    applyLeadLogic(team, makeRng(0.50));
    expect(team).toEqual(copy);
});
