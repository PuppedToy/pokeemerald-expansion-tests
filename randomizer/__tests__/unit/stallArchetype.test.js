'use strict';

// T-159 — stall archetype. Two behaviours:
//  (A) partial-trap / chip moves (Whirlpool, Sand Tomb, Infestation, Salt Cure) are worth more to a
//      defensive mon (they pin the foe while residual damage ticks) and more still alongside residual
//      chip — a role-specific bump, not a global one (owner: "bump pero ... cubren el rol de stall").
//  (B) a mon whose offence is far below its tier and that can complete a stall kit is flagged a pure
//      staller; its stall kit is then boosted so the trainer builds it as pure stall. Conservative.

const { rateMove, rateMoveForAPokemon, isPureStaller, isStallTool } = require('../../rating');

const M = o => ({ additionalEffects: [], pp: 10, priority: 0, makesContact: 'FALSE', strikeCount: '1', accuracy: 100, ...o });
const rated = m => ({ ...m, rating: rateMove(m) });
const rate = (move, poke, { item = null, currentMoves = [], otherMoves = [], ctx = {} } = {}) =>
    rateMoveForAPokemon(rated(move), poke, null, item, otherMoves.map(rated), currentMoves.map(rated), ctx);

const WHIRLPOOL = M({ id: 'MOVE_WHIRLPOOL', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER', power: 35, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_WRAP'] });
const SALT_CURE = M({ id: 'MOVE_SALT_CURE', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'ROCK', power: 40, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_SALT_CURE'] });
const TOXIC     = M({ id: 'MOVE_TOXIC', category: 'DAMAGE_CATEGORY_STATUS', type: 'POISON', power: 0, accuracy: 90, effect: 'EFFECT_TOXIC' });
const MEGA_PUNCH= M({ id: 'MOVE_MEGA_PUNCH', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 80, effect: 'EFFECT_HIT' });

// Same offensive stat (SpA 80) → identical power-scaling; differ only in bulk, so any gap is the trap bonus.
const BULKY = { id: 'SPECIES_BULKY', parsedTypes: ['WATER'], parsedAbilities: ['NONE'], baseHP: 100, baseAttack: 40, baseDefense: 120, baseSpeed: 40, baseSpAttack: 80, baseSpDefense: 120, evolutionData: { isMega: false }, learnset: [], teachables: [], rating: { role: 'TANK', tier: 'OU' } };
const FRAIL = { id: 'SPECIES_FRAIL', parsedTypes: ['WATER'], parsedAbilities: ['NONE'], baseHP: 50, baseAttack: 40, baseDefense: 50, baseSpeed: 130, baseSpAttack: 80, baseSpDefense: 50, evolutionData: { isMega: false }, learnset: [], teachables: [], rating: { role: 'OFFENSIVE', tier: 'OU' } };

describe('T-159(A) — partial-trap / chip moves reward defensive mons', () => {
    test('Whirlpool rates higher on a bulky mon than on an equal-offense frail mon', () => {
        expect(rate(WHIRLPOOL, BULKY)).toBeGreaterThan(rate(WHIRLPOOL, FRAIL));
    });

    test('Whirlpool rates higher when the set already carries residual chip (Toxic)', () => {
        const withChip = rate(WHIRLPOOL, BULKY, { currentMoves: [TOXIC] });
        const without = rate(WHIRLPOOL, BULKY);
        expect(withChip).toBeGreaterThan(without);
    });

    test('Salt Cure earns a larger defensive bump than Whirlpool (2×/turn residual)', () => {
        const saltDelta  = rate(SALT_CURE, BULKY) - rate(SALT_CURE, FRAIL);
        const whirlDelta = rate(WHIRLPOOL, BULKY) - rate(WHIRLPOOL, FRAIL);
        expect(saltDelta).toBeGreaterThan(whirlDelta);
    });
});

describe('T-159(B) — pure-staller detection & kit boost', () => {
    const md = {
        MOVE_RECOVER: M({ id: 'MOVE_RECOVER', category: 'DAMAGE_CATEGORY_STATUS', power: 0, accuracy: 0, effect: 'EFFECT_RESTORE_HP' }),
        MOVE_TOXIC:   TOXIC,
        MOVE_PROTECT: M({ id: 'MOVE_PROTECT', category: 'DAMAGE_CATEGORY_STATUS', power: 0, accuracy: 0, effect: 'EFFECT_PROTECT' }),
        MOVE_HAZE:    M({ id: 'MOVE_HAZE', category: 'DAMAGE_CATEGORY_STATUS', power: 0, accuracy: 0, effect: 'EFFECT_HAZE' }),
        MOVE_SCALD:   M({ id: 'MOVE_SCALD', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER', power: 80, effect: 'EFFECT_HIT' }),
    };
    const stallLearnset = Object.keys(md).map(move => ({ level: '1', move }));
    const TOXAPEX = { id: 'SPECIES_TOXAPEX', parsedTypes: ['POISON', 'WATER'], parsedAbilities: ['REGENERATOR'], baseHP: 100, baseAttack: 40, baseDefense: 130, baseSpeed: 40, baseSpAttack: 50, baseSpDefense: 130, evolutionData: { isMega: false }, learnset: stallLearnset, teachables: [], rating: { role: 'TANK', tier: 'OU' } };

    test('a bulky, low-offense mon with recovery + tools is a pure staller', () => {
        expect(isPureStaller(TOXAPEX, md, 100, false)).toBe(true);
    });

    test('the same mon WITHOUT recovery in its movepool is NOT forced into stall', () => {
        const noRecovery = { ...TOXAPEX, learnset: stallLearnset.filter(l => l.move !== 'MOVE_RECOVER') };
        expect(isPureStaller(noRecovery, md, 100, false)).toBe(false);
    });

    test('an offensive mon is never a pure staller', () => {
        expect(isPureStaller(FRAIL, md, 100, false)).toBe(false);
    });

    test('isStallTool recognises the kit but not a plain attack', () => {
        expect(isStallTool(md.MOVE_RECOVER)).toBe(true);
        expect(isStallTool(md.MOVE_TOXIC)).toBe(true);
        expect(isStallTool(md.MOVE_HAZE)).toBe(true);
        expect(isStallTool(md.MOVE_SCALD)).toBe(false);
    });

    test('in doubles a support move counts as stall utility', () => {
        const followMe = M({ id: 'MOVE_FOLLOW_ME', category: 'DAMAGE_CATEGORY_STATUS', power: 0, accuracy: 0, effect: 'EFFECT_FOLLOW_ME' });
        expect(isStallTool(followMe, false)).toBe(false);
        expect(isStallTool(followMe, true)).toBe(true);
    });

    test('stallMode boosts a stall tool (Toxic) by the kit factor', () => {
        // Two attacks already present so the status gate never interferes — isolates the ×1.3 boost.
        const twoAtks = [MEGA_PUNCH, md.MOVE_SCALD];
        const boosted = rate(TOXIC, BULKY, { currentMoves: twoAtks, ctx: { stallMode: true } });
        const plain = rate(TOXIC, BULKY, { currentMoves: twoAtks, ctx: { stallMode: false } });
        expect(boosted).toBeCloseTo(plain * 1.5, 5);
    });

    test('stallMode lets a staller take status without first stacking two attacks', () => {
        expect(rate(TOXIC, BULKY, { currentMoves: [], ctx: { stallMode: true } })).toBeGreaterThan(0);
        expect(rate(TOXIC, BULKY, { currentMoves: [], ctx: { stallMode: false } })).toBe(0);
    });

    test('stallMode demotes a SECOND attack (a staller keeps at most one)', () => {
        const first  = rate(MEGA_PUNCH, BULKY, { currentMoves: [], ctx: { stallMode: true } });
        const second = rate(MEGA_PUNCH, BULKY, { currentMoves: [md.MOVE_SCALD], ctx: { stallMode: true } });
        expect(second).toBeLessThan(first);
    });

    test('non-stall status (Light Screen) is still gated on a staller with < 2 attacks', () => {
        const lightScreen = M({ id: 'MOVE_LIGHT_SCREEN', category: 'DAMAGE_CATEGORY_STATUS', power: 0, accuracy: 0, effect: 'EFFECT_LIGHT_SCREEN' });
        expect(rate(lightScreen, BULKY, { currentMoves: [md.MOVE_SCALD], ctx: { stallMode: true } })).toBe(0);
    });
});
