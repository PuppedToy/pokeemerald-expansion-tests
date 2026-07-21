'use strict';

// T-185 — Greninja Battle Bond special case:
//  (A) Ash-Greninja is battle-only (KO-transformed via Battle Bond) → banned from picking; the placed
//      Battle Bond form stays placeable. Battle Bond is a SOLO whose dedup family group collapses to
//      P_FAMILY_FROAKIE, so it and the normal Froakie line are mutually exclusive in a run.
//  (B) Battle Bond's rating (absolute + per-level contextual) is a weighted blend of Battle Bond and
//      Ash (0.70 Ash / 0.30 Bond), crediting the KO-transform payoff (Minior-style).
//  (C) When a trainer fields Battle Bond, its moveset/item/nature are built from Ash's stats/typing
//      via greninjaEffectivePoke (Palafin-style full-form swap, no nerf).

const { applyGreninjaTierBlend, applyGreninjaContextualBlend } = require('../../greninja');
const { greninjaEffectivePoke, tierFromRating, ratePokemon } = require('../../rating');
const {
    GRENINJA_BOND_ID, GRENINJA_ASH_ID, GRENINJA_ASH_WEIGHT, GRENINJA_BOND_WEIGHT, TIER_SEQ,
} = require('../../constants');
const { getFamilyGroup } = require('../../modules/utils');
const { BANNED_SPECIES_FOR_PICKING } = require('../../modules/wildModule');
const moves = require('../fixtures/miniMoves');
const abilities = require('../fixtures/miniAbilities');
const { GRENINJA_BOND, GRENINJA_ASH } = require('../fixtures/miniPokes');

describe('Greninja Ash exclusion (T-185)', () => {
    test('Ash is banned from picking (battle-only, non-obtainable form)', () => {
        expect(BANNED_SPECIES_FOR_PICKING).toContain(GRENINJA_ASH_ID);
    });
    test('the placed Battle Bond form stays placeable', () => {
        expect(BANNED_SPECIES_FOR_PICKING).not.toContain(GRENINJA_BOND_ID);
    });
});

describe('Greninja Battle Bond family exclusion (T-185)', () => {
    test('Battle Bond family collapses to the Froakie group so the two never co-place', () => {
        expect(getFamilyGroup('P_FAMILY_GRENINJA_BATTLE_BOND')).toBe('P_FAMILY_FROAKIE');
    });
    test('the normal Froakie family is unchanged', () => {
        expect(getFamilyGroup('P_FAMILY_FROAKIE')).toBe('P_FAMILY_FROAKIE');
    });
});

describe('Greninja absolute tier blend (T-185)', () => {
    const mk = (id, absoluteRating, tier) => ({ id, rating: { absoluteRating, tier } });

    test('Battle Bond rating becomes the 0.70 Ash / 0.30 Bond blend and its tier is recomputed', () => {
        const bond = mk(GRENINJA_BOND_ID, 8.0, 'OU');
        const ash = mk(GRENINJA_ASH_ID, 10.5, 'AG');
        const result = applyGreninjaTierBlend([bond, ash]);
        const expected = GRENINJA_ASH_WEIGHT * 10.5 + GRENINJA_BOND_WEIGHT * 8.0;
        expect(bond.rating.absoluteRating).toBeCloseTo(expected, 6);
        expect(bond.rating.tier).toBe(tierFromRating(expected, { isStoneMega: false }));
        expect(result).toBe(bond);
    });

    test('Ash rating is left untouched', () => {
        const bond = mk(GRENINJA_BOND_ID, 8.0, 'OU');
        const ash = mk(GRENINJA_ASH_ID, 10.5, 'AG');
        applyGreninjaTierBlend([bond, ash]);
        expect(ash.rating.absoluteRating).toBe(10.5);
    });

    test('blend lands above raw Battle Bond (Ash-weighted) — a higher or equal tier', () => {
        const bond = mk(GRENINJA_BOND_ID, 8.0, 'OU');
        const ash = mk(GRENINJA_ASH_ID, 10.5, 'AG');
        applyGreninjaTierBlend([bond, ash]);
        expect(bond.rating.absoluteRating).toBeGreaterThan(8.0);
        expect(TIER_SEQ.indexOf(bond.rating.tier)).toBeGreaterThanOrEqual(TIER_SEQ.indexOf('OU'));
    });

    test('no-op when Ash is absent from the pokedex', () => {
        const bond = mk(GRENINJA_BOND_ID, 8.0, 'OU');
        const result = applyGreninjaTierBlend([bond]);
        expect(result).toBeNull();
        expect(bond.rating.absoluteRating).toBe(8.0);
    });
});

describe('Greninja contextual blend (T-185)', () => {
    const caps = [10, 30, 50];
    const withCtx = (id, base) => ({
        id,
        contextualRatings: Object.fromEntries(caps.map(c => [c, { absoluteRating: base }])),
        contextualRatingsDoubles: Object.fromEntries(caps.map(c => [c, { absoluteRating: base + 0.1 }])),
    });

    test('blends Battle Bond\'s per-cap contextual (singles + doubles) with Ash\'s', () => {
        const bond = withCtx(GRENINJA_BOND_ID, 6.0);
        const ash = withCtx(GRENINJA_ASH_ID, 10.0);
        applyGreninjaContextualBlend([bond, ash], caps);
        const expSingles = GRENINJA_ASH_WEIGHT * 10.0 + GRENINJA_BOND_WEIGHT * 6.0;
        const expDoubles = GRENINJA_ASH_WEIGHT * 10.1 + GRENINJA_BOND_WEIGHT * 6.1;
        for (const c of caps) {
            expect(bond.contextualRatings[c].absoluteRating).toBeCloseTo(expSingles, 6);
            expect(bond.contextualRatingsDoubles[c].absoluteRating).toBeCloseTo(expDoubles, 6);
        }
        expect(ash.contextualRatings[10].absoluteRating).toBe(10.0); // Ash untouched
    });

    test('no-op when Ash is absent', () => {
        const bond = withCtx(GRENINJA_BOND_ID, 6.0);
        const result = applyGreninjaContextualBlend([bond], caps);
        expect(result).toBeNull();
        expect(bond.contextualRatings[10].absoluteRating).toBe(6.0);
    });
});

describe('greninjaEffectivePoke — Battle-Bond → Ash form swap (T-185)', () => {
    test('adopts Ash stats with no nerf', () => {
        const eff = greninjaEffectivePoke(GRENINJA_BOND, GRENINJA_ASH);
        expect(eff.baseHP).toBe(72);
        expect(eff.baseAttack).toBe(145);
        expect(eff.baseDefense).toBe(67);
        expect(eff.baseSpeed).toBe(132);
        expect(eff.baseSpAttack).toBe(153);
        expect(eff.baseSpDefense).toBe(71);
        expect(eff.baseBST).toBe(640); // 72+145+67+132+153+71 — no HP nerf
    });

    test('keeps Battle Bond identity (id, learnset, abilities, teachables)', () => {
        const eff = greninjaEffectivePoke(GRENINJA_BOND, GRENINJA_ASH);
        expect(eff.id).toBe(GRENINJA_BOND_ID);
        expect(eff.learnset).toBe(GRENINJA_BOND.learnset);
        expect(eff.parsedAbilities).toEqual(GRENINJA_BOND.parsedAbilities);
        expect(eff.teachables).toEqual(GRENINJA_BOND.teachables);
    });

    test('adopts Ash typing (full-form swap)', () => {
        const retypedAsh = { ...GRENINJA_ASH, parsedTypes: ['WATER', 'FIGHTING'], types: 'MON_TYPES(TYPE_WATER, TYPE_FIGHTING)' };
        const eff = greninjaEffectivePoke(GRENINJA_BOND, retypedAsh);
        expect(eff.parsedTypes).toEqual(['WATER', 'FIGHTING']);
        expect(eff.types).toBe('MON_TYPES(TYPE_WATER, TYPE_FIGHTING)');
    });

    test('does not mutate the Battle Bond input object', () => {
        greninjaEffectivePoke(GRENINJA_BOND, GRENINJA_ASH);
        expect(GRENINJA_BOND.baseAttack).toBe(95);
        expect(GRENINJA_BOND.baseBST).toBe(530);
    });

    test('Ash-effective rating is above raw Battle Bond', () => {
        const raw = ratePokemon(GRENINJA_BOND, moves, abilities, null);
        const eff = ratePokemon(greninjaEffectivePoke(GRENINJA_BOND, GRENINJA_ASH), moves, abilities, null);
        expect(eff.absoluteRating).toBeGreaterThan(raw.absoluteRating);
    });
});
