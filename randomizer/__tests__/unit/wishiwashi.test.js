'use strict';

const { wishiwashiEffectivePoke, ratePokemon, rateContextual } = require('../../rating');
const moves = require('../fixtures/miniMoves');
const abilities = require('../fixtures/miniAbilities');
const { TIER_SEQ, WISHIWASHI_SCHOOL_LEVEL } = require('../../constants');
const { WISHIWASHI_SOLO, WISHIWASHI_SCHOOL } = require('../fixtures/miniPokes');

describe('wishiwashiEffectivePoke — Schooling special case', () => {
    test('default level (absolute) → School stats with 25% HP nerf', () => {
        const eff = wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL);
        expect(eff.baseHP).toBe(33);          // floor(45 * 0.75)
        expect(eff.baseAttack).toBe(140);
        expect(eff.baseDefense).toBe(130);
        expect(eff.baseSpeed).toBe(30);
        expect(eff.baseSpAttack).toBe(140);
        expect(eff.baseSpDefense).toBe(135);
        expect(eff.baseBST).toBe(608);        // 33+140+130+30+140+135
    });

    test('keeps Solo identity (id, learnset, abilities, teachables)', () => {
        const eff = wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL);
        expect(eff.id).toBe('SPECIES_WISHIWASHI_SOLO');
        expect(eff.learnset).toBe(WISHIWASHI_SOLO.learnset);
        expect(eff.parsedAbilities).toEqual(WISHIWASHI_SOLO.parsedAbilities);
        expect(eff.teachables).toEqual(WISHIWASHI_SOLO.teachables);
    });

    test('adopts School typing (full-form swap)', () => {
        const retypedSchool = { ...WISHIWASHI_SCHOOL, parsedTypes: ['WATER', 'STEEL'], types: 'MON_TYPES(TYPE_WATER, TYPE_STEEL)' };
        const eff = wishiwashiEffectivePoke(WISHIWASHI_SOLO, retypedSchool);
        expect(eff.parsedTypes).toEqual(['WATER', 'STEEL']);
        expect(eff.types).toBe('MON_TYPES(TYPE_WATER, TYPE_STEEL)');
    });

    test('level === 20 → School (boundary inclusive)', () => {
        const eff = wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL, 20);
        expect(eff.baseAttack).toBe(140);
        expect(eff.baseBST).toBe(608);
    });

    test('level < 20 → unchanged Solo form', () => {
        const eff = wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL, 18);
        expect(eff).toBe(WISHIWASHI_SOLO);
        expect(eff.baseAttack).toBe(20);
        expect(eff.baseBST).toBe(175);
    });

    test('does not mutate the Solo input object', () => {
        wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL);
        expect(WISHIWASHI_SOLO.baseHP).toBe(45);
        expect(WISHIWASHI_SOLO.baseAttack).toBe(20);
        expect(WISHIWASHI_SOLO.baseBST).toBe(175);
    });
});

describe('Wishiwashi effective rating — end to end', () => {
    const rawTmPool = null; // unrestricted TM pool for the absolute comparison

    test('absolute: School-effective rating is far above raw Solo, and a higher tier', () => {
        const raw = ratePokemon(WISHIWASHI_SOLO, moves, abilities, rawTmPool);
        const eff = ratePokemon(wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL), moves, abilities, rawTmPool);

        expect(eff.absoluteRating).toBeGreaterThan(raw.absoluteRating + 2);
        expect(TIER_SEQ.indexOf(eff.tier)).toBeGreaterThan(TIER_SEQ.indexOf(raw.tier));
    });

    test('contextual: below lvl 20 stays weak (Solo), at lvl 20+ jumps (School)', () => {
        const belowLevel = WISHIWASHI_SCHOOL_LEVEL - 1; // 19 → still Solo
        const atLevel     = WISHIWASHI_SCHOOL_LEVEL;     // 20 → schools

        const ctxBelow = rateContextual(
            wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL, belowLevel),
            moves, abilities, { level: belowLevel, tms: [] },
        );
        const ctxAt = rateContextual(
            wishiwashiEffectivePoke(WISHIWASHI_SOLO, WISHIWASHI_SCHOOL, atLevel),
            moves, abilities, { level: atLevel, tms: [] },
        );

        expect(ctxAt.absoluteRating).toBeGreaterThan(ctxBelow.absoluteRating + 2);
    });
});
