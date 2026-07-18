'use strict';

// T-155 — Minior special case:
//  (A) Core is battle-only (reached via Shields Down at <50% HP) → banned from picking; the placed
//      Meteor form stays placeable.
//  (B) Meteor's rating (absolute + per-level contextual) is a weighted blend of Meteor and Core,
//      crediting the bulky status-immune setup turn AND the Core sweeper payoff (Meloetta-style).

const { applyMiniorTierBlend, applyMiniorContextualBlend } = require('../../minior');
const { tierFromRating } = require('../../rating');
const {
    MINIOR_METEOR_ID, MINIOR_CORE_ID, MINIOR_METEOR_WEIGHT, MINIOR_CORE_WEIGHT,
} = require('../../constants');
const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');

describe('Minior Core exclusion (T-155)', () => {
    test('Core (Red) is banned from picking (battle-only form)', () => {
        expect(BANNED_SPECIES_FOR_PICKING).toContain('SPECIES_MINIOR_CORE_RED');
    });
    test('the placed Meteor (Red) form stays placeable', () => {
        expect(BANNED_SPECIES_FOR_PICKING).not.toContain('SPECIES_MINIOR_METEOR_RED');
    });
});

describe('Minior absolute tier blend (T-155)', () => {
    const mk = (id, absoluteRating, tier) => ({ id, rating: { absoluteRating, tier } });

    test('Meteor rating becomes weighted blend of Meteor + Core and its tier is recomputed', () => {
        const meteor = mk(MINIOR_METEOR_ID, 5.0, 'NU');
        const core = mk(MINIOR_CORE_ID, 8.2, 'OU');
        const result = applyMiniorTierBlend([meteor, core]);
        const expected = MINIOR_METEOR_WEIGHT * 5.0 + MINIOR_CORE_WEIGHT * 8.2;
        expect(meteor.rating.absoluteRating).toBeCloseTo(expected, 6);
        expect(meteor.rating.tier).toBe(tierFromRating(expected, { isStoneMega: false }));
        expect(result).toBe(meteor);
    });

    test('Core rating is left untouched', () => {
        const meteor = mk(MINIOR_METEOR_ID, 5.0, 'NU');
        const core = mk(MINIOR_CORE_ID, 8.2, 'OU');
        applyMiniorTierBlend([meteor, core]);
        expect(core.rating.absoluteRating).toBe(8.2);
    });

    test('no-op when Core is absent from the pokedex', () => {
        const meteor = mk(MINIOR_METEOR_ID, 5.0, 'NU');
        const result = applyMiniorTierBlend([meteor]);
        expect(result).toBeNull();
        expect(meteor.rating.absoluteRating).toBe(5.0);
    });
});

describe('Minior contextual blend (T-155)', () => {
    const caps = [10, 30, 50];
    const withCtx = (id, base) => ({
        id,
        contextualRatings: Object.fromEntries(caps.map(c => [c, { absoluteRating: base }])),
        contextualRatingsDoubles: Object.fromEntries(caps.map(c => [c, { absoluteRating: base + 0.1 }])),
    });

    test('blends Meteor\'s per-cap contextual (singles + doubles) with Core\'s', () => {
        const meteor = withCtx(MINIOR_METEOR_ID, 4.0);
        const core = withCtx(MINIOR_CORE_ID, 8.0);
        applyMiniorContextualBlend([meteor, core], caps);
        const expSingles = MINIOR_METEOR_WEIGHT * 4.0 + MINIOR_CORE_WEIGHT * 8.0;
        const expDoubles = MINIOR_METEOR_WEIGHT * 4.1 + MINIOR_CORE_WEIGHT * 8.1;
        for (const c of caps) {
            expect(meteor.contextualRatings[c].absoluteRating).toBeCloseTo(expSingles, 6);
            expect(meteor.contextualRatingsDoubles[c].absoluteRating).toBeCloseTo(expDoubles, 6);
        }
        // Core untouched
        expect(core.contextualRatings[10].absoluteRating).toBe(8.0);
    });

    test('no-op when Core is absent', () => {
        const meteor = withCtx(MINIOR_METEOR_ID, 4.0);
        const result = applyMiniorContextualBlend([meteor], caps);
        expect(result).toBeNull();
        expect(meteor.contextualRatings[10].absoluteRating).toBe(4.0);
    });
});
