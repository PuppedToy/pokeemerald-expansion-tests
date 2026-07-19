'use strict';

const { rateMove } = require('../../rating');
const moves = require('../fixtures/miniMoves');

describe('rateMove — damage moves', () => {
    test('Earthquake (100 BP, 100 acc) > Tackle (40 BP)', () => {
        expect(rateMove(moves.MOVE_EARTHQUAKE)).toBeGreaterThan(rateMove(moves.MOVE_TACKLE));
    });

    test('higher base power yields a higher raw score', () => {
        const weak = rateMove(moves.MOVE_TACKLE);
        const strong = rateMove(moves.MOVE_EARTHQUAKE);
        expect(strong).toBeGreaterThan(weak);
    });

    test('lower accuracy reduces score — Blizzard (70 acc) < Flamethrower (100 acc, same BP)', () => {
        expect(rateMove(moves.MOVE_BLIZZARD)).toBeLessThan(rateMove(moves.MOVE_FLAMETHROWER));
    });

    test('Explosion (200 BP) is penalised by 0.5 self-destruct multiplier', () => {
        const raw = rateMove(moves.MOVE_SELF_DESTRUCT);
        // Without the 0.5 multiplier, 200BP at perfect acc would be ~14.2 (capped to 12).
        // With 0.5 it should be < 7.
        expect(raw).toBeLessThan(7);
    });

    test('Rollout 2.5× multiplier is applied (rating > raw 30BP at perfect accuracy)', () => {
        const rollout = rateMove(moves.MOVE_ROLLOUT);
        // Raw 30BP at 100acc = 10*30/140 ≈ 2.14. With 2.5× applied it should exceed that.
        const raw30bp = 10 * 30 / 140;
        expect(rollout).toBeGreaterThan(raw30bp);
    });

    test('Fake Out gets first-turn bonus — rating should be notably high for 40BP', () => {
        const fakeOut = rateMove(moves.MOVE_FAKE_OUT);
        const tackle = rateMove(moves.MOVE_TACKLE); // 40 BP, same
        expect(fakeOut).toBeGreaterThan(tackle);
    });

    test('Knock Off gets a boost from its EFFECT_KNOCK_OFF multiplier', () => {
        const knockOff = rateMove(moves.MOVE_KNOCK_OFF);
        // 65 BP equivalent without boost would be around 4.6; with 1.3× it should be higher.
        const plain65 = 10 * 65 / 140; // ~4.64
        expect(knockOff).toBeGreaterThan(plain65);
    });

    test('Solar Beam is penalised by two-turn delay', () => {
        // 120BP, 100acc without penalty → ~8.57 cap; with solar_beam 0.8 → ~6.86
        // Also without the semi-invulnerable flag so just the solar_beam penalty applies.
        const solarBeam = rateMove(moves.MOVE_SOLAR_BEAM);
        const flamethrower = rateMove(moves.MOVE_FLAMETHROWER);
        expect(solarBeam).toBeLessThan(rateMove(moves.MOVE_EARTHQUAKE)); // lower than 100BP clean
    });

    test('Fly (semi-invulnerable) is penalised vs a clean 90BP move', () => {
        const fly = rateMove(moves.MOVE_FLY);
        const surf = rateMove(moves.MOVE_SURF); // 90 BP, 100 acc, EFFECT_HIT
        expect(fly).toBeLessThan(surf);
    });

    test('Pin Missile (multi-hit) effective power exceeds its face 25BP', () => {
        const pin = rateMove(moves.MOVE_PIN_MISSILE);
        const tackle = rateMove(moves.MOVE_TACKLE); // 40 BP
        // multi-hit: 25 * 2.5 = 62.5 effective
        expect(pin).toBeGreaterThan(tackle);
    });
});

describe('rateMove — statusList moves', () => {
    test('MOVE_THUNDER_WAVE returns its hardcoded statusList value (7)', () => {
        expect(rateMove(moves.MOVE_THUNDER_WAVE)).toBe(7);
    });

    test('MOVE_TOXIC returns its hardcoded statusList value (8)', () => {
        expect(rateMove(moves.MOVE_TOXIC)).toBe(8);
    });

    test('MOVE_WILL_O_WISP returns its hardcoded statusList value (8)', () => {
        expect(rateMove(moves.MOVE_WILL_O_WISP)).toBe(8);
    });

    test('MOVE_SING returns its hardcoded statusList value (4.5)', () => {
        expect(rateMove(moves.MOVE_SING)).toBe(4.5);
    });

    test('MOVE_HYPNOSIS returns its hardcoded statusList value (5)', () => {
        expect(rateMove(moves.MOVE_HYPNOSIS)).toBe(5);
    });

    test('MOVE_STUN_SPORE returns its hardcoded statusList value (5.5)', () => {
        expect(rateMove(moves.MOVE_STUN_SPORE)).toBe(5.5);
    });

    test('MOVE_POISON_POWDER returns its hardcoded statusList value (3.5)', () => {
        expect(rateMove(moves.MOVE_POISON_POWDER)).toBe(3.5);
    });

    test('Sleep moves (Sing, Hypnosis) rate higher than Poison Powder', () => {
        expect(rateMove(moves.MOVE_SING)).toBeGreaterThan(rateMove(moves.MOVE_POISON_POWDER));
        expect(rateMove(moves.MOVE_HYPNOSIS)).toBeGreaterThan(rateMove(moves.MOVE_POISON_POWDER));
    });

    test('Thunder Wave (90% acc paralysis) rates higher than Sing (55% acc sleep)', () => {
        expect(rateMove(moves.MOVE_THUNDER_WAVE)).toBeGreaterThan(rateMove(moves.MOVE_SING));
    });
});

describe('rateMove — status moves by effect (not in statusList)', () => {
    test('Tail Whip (EFFECT_DEFENSE_DOWN) returns 1.5', () => {
        expect(rateMove(moves.MOVE_TAIL_WHIP)).toBe(1.5);
    });

    test('Protect (EFFECT_PROTECT) returns 4.5', () => {
        expect(rateMove(moves.MOVE_PROTECT)).toBe(4.5);
    });

    test('Swords Dance (EFFECT_ATTACK_UP_2) returns its statusList value (8)', () => {
        expect(rateMove(moves.MOVE_SWORDS_DANCE)).toBe(8);
    });

    test('Dragon Dance (EFFECT_DRAGON_DANCE) is in statusList and rates highly', () => {
        const dd = rateMove(moves.MOVE_DRAGON_DANCE);
        expect(dd).toBeGreaterThan(6);
    });

    test('Sing rates higher than Tail Whip', () => {
        expect(rateMove(moves.MOVE_SING)).toBeGreaterThan(rateMove(moves.MOVE_TAIL_WHIP));
    });
});

describe('rateMove — EFFECT_HIT_SWITCH_TARGET (phazing moves)', () => {
    test('Circle Throw rates above 0 (not penalised by its -6 priority tag)', () => {
        expect(rateMove(moves.MOVE_CIRCLE_THROW)).toBeGreaterThan(0);
    });

    test('Dragon Tail rates above 0', () => {
        expect(rateMove(moves.MOVE_DRAGON_TAIL)).toBeGreaterThan(0);
    });

    test('Circle Throw rates above Wide Guard (useless singles move)', () => {
        expect(rateMove(moves.MOVE_CIRCLE_THROW)).toBeGreaterThan(rateMove(moves.MOVE_WIDE_GUARD));
    });
});

describe('rateMove — doubles-only moves rate 0 in singles', () => {
    test('Wide Guard rates 0 (spread-move protection is useless in singles)', () => {
        expect(rateMove(moves.MOVE_WIDE_GUARD)).toBe(0);
    });
});

describe('rateMove — EFFECT_LOW_KICK (variable weight-based power)', () => {
    test('Low Kick (power: 1 in game data) rates above 4 (treated as ~70 avg power)', () => {
        expect(rateMove(moves.MOVE_LOW_KICK)).toBeGreaterThan(4);
    });

    test('Low Kick rates higher than Low Sweep (65 BP)', () => {
        expect(rateMove(moves.MOVE_LOW_KICK)).toBeGreaterThan(rateMove(moves.MOVE_LOW_SWEEP));
    });
});

describe('rateMove — EFFECT_REVENGE conditional-power moves', () => {
    test('Revenge (priority -4) rates above 0 — priority penalty is not applied', () => {
        expect(rateMove(moves.MOVE_REVENGE)).toBeGreaterThan(0);
    });

    test('Avalanche (priority -4, EFFECT_REVENGE) rates above 0', () => {
        expect(rateMove(moves.MOVE_AVALANCHE)).toBeGreaterThan(0);
    });

    test('Revenge rates higher than Low Sweep (65 BP) — conditional double power bonus applied', () => {
        expect(rateMove(moves.MOVE_REVENGE)).toBeGreaterThan(rateMove(moves.MOVE_LOW_SWEEP));
    });
});

// T-159 — Sticky Web is "almost Stealth Rock quality": ranked strictly between Stealth Rock and the
// other hazards (better than Spikes / Toxic Spikes, worse than Stealth Rock) so a Web setter is a
// meaningful, but not top, hazard pick.
describe('rateMove — entry-hazard ordering (T-159)', () => {
    const hazard = id => ({ id });
    const SR   = rateMove(hazard('MOVE_STEALTH_ROCK'));
    const WEB  = rateMove(hazard('MOVE_STICKY_WEB'));
    const TSPK = rateMove(hazard('MOVE_TOXIC_SPIKES'));
    const SPK  = rateMove(hazard('MOVE_SPIKES'));

    test('Stealth Rock > Sticky Web', () => {
        expect(SR).toBeGreaterThan(WEB);
    });
    test('Sticky Web > Toxic Spikes and > Spikes', () => {
        expect(WEB).toBeGreaterThan(TSPK);
        expect(WEB).toBeGreaterThan(SPK);
    });
    test('Sticky Web stays close to Stealth Rock (within 1 point)', () => {
        expect(SR - WEB).toBeLessThanOrEqual(1);
    });
});

// T-160 — always-crit moves (Wicked Blow, Surging Strikes, Storm Throw, Frost Breath, Zippy Zap,
// Flower Trick) land a guaranteed critical hit = ×1.5 damage in this build, so their effective power
// (and rating) is 1.5× a same-power non-crit move.
describe('rateMove — always-crit moves get the guaranteed ×1.5 (T-160)', () => {
    const B = { additionalEffects: [], accuracy: 100, priority: 0, makesContact: 'TRUE', strikeCount: '1' };
    const wickedBlow  = { ...B, id: 'MOVE_WICKED_BLOW', power: 75, type: 'DARK', category: 'DAMAGE_CATEGORY_PHYSICAL', effect: 'EFFECT_HIT', alwaysCriticalHit: 'TRUE' };
    const nonCritTwin = { ...B, id: 'MOVE_TWIN',        power: 75, type: 'DARK', category: 'DAMAGE_CATEGORY_PHYSICAL', effect: 'EFFECT_HIT' };

    test('Wicked Blow rates 1.5× a same-power non-crit move plus a small bypass bonus', () => {
        // ×1.5 = guaranteed crit damage; +0.5 = ignores the target's Def/SpDef boosts and screens.
        expect(rateMove(wickedBlow)).toBeCloseTo(rateMove(nonCritTwin) * 1.5 + 0.5, 5);
    });

    test('the bypass bonus is exactly the +0.5 on top of the ×1.5 damage', () => {
        expect(rateMove(wickedBlow) - rateMove(nonCritTwin) * 1.5).toBeCloseTo(0.5, 5);
    });

    test('a non-crit move is unaffected', () => {
        expect(rateMove(nonCritTwin)).toBeCloseTo(10 * 75 / 140, 5);
    });

    test('Surging Strikes (3 hits + always crit) rates near the cap', () => {
        const surging = { ...B, id: 'MOVE_SURGING_STRIKES', power: 25, type: 'WATER', category: 'DAMAGE_CATEGORY_PHYSICAL', effect: 'EFFECT_HIT', alwaysCriticalHit: 'TRUE', strikeCount: '3' };
        expect(rateMove(surging)).toBeGreaterThan(10);
    });
});
