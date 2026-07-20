'use strict';

// B-044 — the per-`pokeId` IV cache key derivation. A slot's `id` is its IV identity so a recurring
// character's same Pokémon keeps consistent IVs across appearances; a cross-character mascot slot carries
// `independentIvs` so it detaches from that cache and rolls its own IVs (never inheriting the leader's
// perfect breed). This guards the exact seam that fixes B-044.

const { ivCacheKeyForDefinition } = require('../../modules/resolveTrainerTeam');
const { TRAINER_REPEAT_ID } = require('../../constants');

test('a plain slot with an id keys the IV cache by that id (continuity preserved)', () => {
    expect(ivCacheKeyForDefinition({ id: 'RIVAL_ACE' })).toBe('RIVAL_ACE');
});

test('a same-character REPEAT_ID continuity echo still shares its id (IV-consistent)', () => {
    // Rival Metang echoing the Champion Metagross must keep the same IVs.
    const def = { special: TRAINER_REPEAT_ID, id: 'RIVAL_ACE', devolveToLevel: true, breedTier: 'perfect' };
    expect(ivCacheKeyForDefinition(def)).toBe('RIVAL_ACE');
});

test('a mascot slot (independentIvs) detaches from the cache → key null', () => {
    // The grunt mascot reuses the leader's stored species via `id` but must NOT inherit its IVs.
    const def = { special: TRAINER_REPEAT_ID, id: 'MAXIE_MEGA', devolveToLevel: true, independentIvs: true };
    expect(ivCacheKeyForDefinition(def)).toBeNull();
});

test('a slot with no id keys nothing (fresh IVs each time)', () => {
    expect(ivCacheKeyForDefinition({})).toBeNull();
    expect(ivCacheKeyForDefinition({ absoluteTier: ['TIER_OU'] })).toBeNull();
});

test('null / undefined definitions are tolerated', () => {
    expect(ivCacheKeyForDefinition(null)).toBeNull();
    expect(ivCacheKeyForDefinition(undefined)).toBeNull();
});
