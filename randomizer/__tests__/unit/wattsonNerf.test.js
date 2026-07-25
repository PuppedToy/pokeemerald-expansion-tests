'use strict';

// T-204 — Wattson is overtuned (he fields a mega before the player can get one), so his two bottom
// non-mega slots are nerfed RU → NU, giving the player breathing room. Owner decision: the change
// rides the shared WATTSON split, so the ~9 generic post-Wattson trainers ease too (intended).

const { getBossPreset } = require('../../presets');
const { TIER_OU, TIER_RU, TIER_NU } = require('../../constants');

describe('getBossPreset — WATTSON bottom-two nerf (T-204)', () => {
    test('returns 6 slots (5 non-mega + 1 mega)', () => {
        const slots = getBossPreset('WATTSON');
        expect(slots).toHaveLength(6);
        expect(slots.filter(s => s.isMega)).toHaveLength(1);
    });

    test('non-mega slots are 3× RU + 2× NU (two bottom slots nerfed RU→NU)', () => {
        const nonMega = getBossPreset('WATTSON').filter(s => !s.isMega);
        expect(nonMega).toHaveLength(5);
        const tiers = nonMega.map(s => s.contextualTier).filter(Array.isArray);
        expect(tiers.filter(t => t[0] === TIER_NU)).toHaveLength(2);
        expect(tiers.filter(t => t[0] === TIER_RU)).toHaveLength(3);
    });

    test('the mega slot still has an OU window', () => {
        const mega = getBossPreset('WATTSON').find(s => s.isMega);
        expect(mega).toBeDefined();
        expect(mega.absoluteTier).toContain(TIER_OU);
    });
});
