'use strict';

// T-052 Steps 3–4 — Team Aqua / Team Magma type themes are configurable via 5 ordered slots
// (main, secondary, other 1..3), each a specific type or the 'RANDOM' token. resolveTeamTypes is
// the pure resolver; RANDOM slots draw seed-deterministically from the un-chosen types.

const { resolveTeamTypes, AQUA_DEFAULT_TYPES, MAGMA_DEFAULT_TYPES } = require('../../trainers');
const { POKEMON_TYPES } = require('../../constants');
const rng = require('../../rng');

describe('resolveTeamTypes', () => {
    test('no config → historical defaults (byte-identical fallback)', () => {
        expect(resolveTeamTypes(undefined, AQUA_DEFAULT_TYPES)).toEqual(AQUA_DEFAULT_TYPES);
        expect(resolveTeamTypes(null, MAGMA_DEFAULT_TYPES)).toEqual(MAGMA_DEFAULT_TYPES);
    });

    test('all-specific config is preserved exactly', () => {
        const cfg = ['GRASS', 'FIRE', 'WATER', 'ICE', 'ELECTRIC'];
        expect(resolveTeamTypes(cfg, AQUA_DEFAULT_TYPES)).toEqual(cfg);
    });

    test('RANDOM slots resolve to valid types, never duplicating a chosen slot', () => {
        rng.seed(42);
        const out = resolveTeamTypes(['WATER', 'DARK', 'RANDOM', 'RANDOM', 'RANDOM'], AQUA_DEFAULT_TYPES);
        expect(out.slice(0, 2)).toEqual(['WATER', 'DARK']);
        for (const t of out) expect(POKEMON_TYPES).toContain(t);
        expect(new Set(out).size).toBe(out.length); // all distinct
        expect(out.slice(2)).not.toContain('WATER');
        expect(out.slice(2)).not.toContain('DARK');
    });

    test('RANDOM resolution is deterministic per seed', () => {
        const cfg = ['FIRE', 'RANDOM', 'RANDOM', 'RANDOM', 'RANDOM'];
        rng.seed(123);
        const a = resolveTeamTypes(cfg, MAGMA_DEFAULT_TYPES);
        rng.seed(123);
        const b = resolveTeamTypes(cfg, MAGMA_DEFAULT_TYPES);
        expect(a).toEqual(b);
    });

    test('missing / invalid entries are treated as RANDOM', () => {
        rng.seed(7);
        const out = resolveTeamTypes(['WATER', 'NOT_A_TYPE', undefined], AQUA_DEFAULT_TYPES);
        expect(out).toHaveLength(AQUA_DEFAULT_TYPES.length);
        expect(out[0]).toBe('WATER');
        for (const t of out) expect(POKEMON_TYPES).toContain(t);
        expect(new Set(out).size).toBe(out.length);
    });
});
