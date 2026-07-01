'use strict';

const { palafinEffectivePoke, ratePokemon, chooseMoveset } = require('../../rating');
const moves = require('../fixtures/miniMoves');
const abilities = require('../fixtures/miniAbilities');
const { TIER_SEQ } = require('../../constants');
const { PALAFIN_ZERO, PALAFIN_HERO } = require('../fixtures/miniPokes');

describe('palafinEffectivePoke — Zero-to-Hero special case', () => {
    test('adopts Hero stats with no nerf', () => {
        const eff = palafinEffectivePoke(PALAFIN_ZERO, PALAFIN_HERO);
        expect(eff.baseHP).toBe(100);
        expect(eff.baseAttack).toBe(160);
        expect(eff.baseDefense).toBe(97);
        expect(eff.baseSpeed).toBe(100);
        expect(eff.baseSpAttack).toBe(106);
        expect(eff.baseSpDefense).toBe(87);
        expect(eff.baseBST).toBe(650); // 100+160+97+100+106+87 — no HP nerf, unlike Wishiwashi
    });

    test('keeps Zero identity (id, learnset, abilities, teachables)', () => {
        const eff = palafinEffectivePoke(PALAFIN_ZERO, PALAFIN_HERO);
        expect(eff.id).toBe('SPECIES_PALAFIN_ZERO');
        expect(eff.learnset).toBe(PALAFIN_ZERO.learnset);
        expect(eff.parsedAbilities).toEqual(PALAFIN_ZERO.parsedAbilities);
        expect(eff.teachables).toEqual(PALAFIN_ZERO.teachables);
    });

    test('adopts Hero typing (full-form swap)', () => {
        const retypedHero = { ...PALAFIN_HERO, parsedTypes: ['WATER', 'FIGHTING'], types: 'MON_TYPES(TYPE_WATER, TYPE_FIGHTING)' };
        const eff = palafinEffectivePoke(PALAFIN_ZERO, retypedHero);
        expect(eff.parsedTypes).toEqual(['WATER', 'FIGHTING']);
        expect(eff.types).toBe('MON_TYPES(TYPE_WATER, TYPE_FIGHTING)');
    });

    test('does not mutate the Zero input object', () => {
        palafinEffectivePoke(PALAFIN_ZERO, PALAFIN_HERO);
        expect(PALAFIN_ZERO.baseAttack).toBe(70);
        expect(PALAFIN_ZERO.baseBST).toBe(457);
    });
});

describe('Palafin effective rating — end to end', () => {
    const rawTmPool = null; // unrestricted TM pool for the absolute comparison

    test('Hero-effective rating is far above raw Zero, and a higher tier', () => {
        const raw = ratePokemon(PALAFIN_ZERO, moves, abilities, rawTmPool);
        const eff = ratePokemon(palafinEffectivePoke(PALAFIN_ZERO, PALAFIN_HERO), moves, abilities, rawTmPool);

        expect(eff.absoluteRating).toBeGreaterThan(raw.absoluteRating + 1);
        expect(TIER_SEQ.indexOf(eff.tier)).toBeGreaterThan(TIER_SEQ.indexOf(raw.tier));
    });
});

describe('chooseMoveset — Zero-to-Hero always keeps the best pivot move', () => {
    // Effective Hero poke (physical Water attacker) — what placement actually feeds chooseMoveset.
    const heroPoke = palafinEffectivePoke(PALAFIN_ZERO, PALAFIN_HERO);

    test('forces a pivot into the set even when a stronger same-type move exists', () => {
        // Wave Crash (120 BP Water) out-rates Flip Turn (60 BP Water); without the rule, A3
        // same-type dedup would drop Flip Turn. The Zero-to-Hero rule must keep it.
        const { moveset } = chooseMoveset(heroPoke, moves, 100, [], 'ZERO_TO_HERO', null, null, 0);
        expect(moveset).toContain('MOVE_FLIP_TURN');
    });

    test('forced pivot is the best by rating — Flip Turn (Water STAB) over U-turn / Volt Switch', () => {
        // Restrict the pool to the three pivots so the forced pick is unambiguous. The forced
        // pivot is pushed first, so it lands at index 0; STAB makes Flip Turn the winner.
        const pivotOnly = {
            ...heroPoke,
            learnset: [{ level: '1', move: 'MOVE_FLIP_TURN' }],
            teachables: ['MOVE_U_TURN', 'MOVE_VOLT_SWITCH'],
        };
        const { moveset } = chooseMoveset(pivotOnly, moves, 100, [], 'ZERO_TO_HERO', null, null, 0);
        expect(moveset[0]).toBe('MOVE_FLIP_TURN');
    });

    test('detects the ability from the poke even when ability arg is null', () => {
        const { moveset } = chooseMoveset(heroPoke, moves, 100, [], null, null, null, 0);
        expect(moveset).toContain('MOVE_FLIP_TURN');
    });

    test('regression: a non-Zero-to-Hero poke is not forced to take a pivot', () => {
        const plainPoke = { ...heroPoke, parsedAbilities: ['TORRENT', 'NONE', 'NONE'] };
        const { moveset } = chooseMoveset(plainPoke, moves, 100, [], 'TORRENT', null, null, 0);
        // Wave Crash (120 BP STAB) beats Flip Turn (60 BP); no rule forces the weaker pivot in.
        expect(moveset).toContain('MOVE_WAVE_CRASH');
        expect(moveset).not.toContain('MOVE_FLIP_TURN');
    });
});
