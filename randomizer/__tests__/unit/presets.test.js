'use strict';

const { applyTransform, getBossPreset, getNonBossPreset } = require('../../presets');
const { TIER_OU, TIER_UBERS, TIER_UU, TIER_RU } = require('../../constants');

describe('applyTransform', () => {
    test('shifts primary contextualTier for the eligible bottom-N slots (up)', () => {
        const team = [{ contextualTier: ['NU'] }, { contextualTier: ['RU'] }];
        const result = applyTransform(team, +1, 'bottom', 1);
        // NU is lowest → shifted to RU; RU untouched
        expect(result[0].contextualTier).toEqual(['RU']);
        expect(result[1].contextualTier).toEqual(['RU']);
    });

    test('shifts fallback contextualTier when the primary slot is shifted', () => {
        const team = [{ contextualTier: ['NU'], fallback: [{ contextualTier: ['PU'], evoType: ['EVO_TYPE_LC'] }] }];
        const result = applyTransform(team, +1, 'bottom', 1);
        expect(result[0].contextualTier).toEqual(['RU']);
        expect(result[0].fallback[0].contextualTier).toEqual(['NU']);
    });

    test('shifts all fallback slots in the fallback array when primary is shifted', () => {
        const team = [{
            contextualTier: ['NU'],
            fallback: [
                { contextualTier: ['PU'], exactTypes: ['WATER'] },
                { contextualTier: ['PU'], evoType: ['EVO_TYPE_LC'] },
            ],
        }];
        const result = applyTransform(team, +1, 'bottom', 1);
        expect(result[0].fallback[0].contextualTier).toEqual(['NU']);
        expect(result[0].fallback[1].contextualTier).toEqual(['NU']);
    });

    test('does NOT shift fallback of a slot that was not selected for shifting', () => {
        const team = [
            { contextualTier: ['RU'], fallback: [{ contextualTier: ['NU'] }] },
            { contextualTier: ['NU'], fallback: [{ contextualTier: ['PU'] }] },
        ];
        // 'bottom' + numShifts=1 → only the 1 lowest slot (NU, index 1) is shifted
        const result = applyTransform(team, +1, 'bottom', 1);
        // Slot 0 (RU): not shifted → fallback stays NU
        expect(result[0].contextualTier).toEqual(['RU']);
        expect(result[0].fallback[0].contextualTier).toEqual(['NU']);
        // Slot 1 (NU → RU): shifted → fallback shifts PU → NU
        expect(result[1].contextualTier).toEqual(['RU']);
        expect(result[1].fallback[0].contextualTier).toEqual(['NU']);
    });

    test('handles slots without fallback gracefully', () => {
        const team = [{ contextualTier: ['NU'] }];
        expect(() => applyTransform(team, +1, 'bottom', 1)).not.toThrow();
        expect(applyTransform(team, +1, 'bottom', 1)[0].fallback).toBeUndefined();
    });

    test('does not mutate the original team array or its fallback', () => {
        const fallback = [{ contextualTier: ['PU'] }];
        const team = [{ contextualTier: ['NU'], fallback }];
        applyTransform(team, +1, 'bottom', 1);
        expect(team[0].contextualTier).toEqual(['NU']);
        expect(fallback[0].contextualTier).toEqual(['PU']);
    });

    test('fallback entry without contextualTier is left unchanged', () => {
        const team = [{ contextualTier: ['NU'], fallback: [{ evoType: ['EVO_TYPE_FINAL'] }] }];
        const result = applyTransform(team, +1, 'bottom', 1);
        expect(result[0].fallback[0].contextualTier).toBeUndefined();
        expect(result[0].fallback[0].evoType).toEqual(['EVO_TYPE_FINAL']);
    });
});

describe('getNonBossPreset — megaTier injection', () => {
    test('megaTier=null: isMega slot replaced with plain tier slot (no tryMega)', () => {
        const team = getNonBossPreset('WATTSON');
        const replacedSlot = team[5];
        expect(replacedSlot.tryMega).toBeUndefined();
        expect(replacedSlot.isMega).toBeUndefined();
        expect(replacedSlot.contextualTier).toBeDefined();
    });

    test('megaTier=TIER_OU: isMega slot becomes { isMega: true, absoluteTier: up to OU, no tryMega }', () => {
        const team = getNonBossPreset('FLANNERY', TIER_OU);
        const megaSlot = team.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.tryMega).toBeUndefined();
        expect(megaSlot.absoluteTier).toContain(TIER_OU);
        expect(megaSlot.absoluteTier).not.toContain(TIER_UBERS);
    });

    test('megaTier=TIER_UBERS on split with isMega: slot has absoluteTier including UBERS', () => {
        const team = getNonBossPreset('FLANNERY', TIER_UBERS);
        const megaSlot = team.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.absoluteTier).toContain(TIER_OU);
        expect(megaSlot.absoluteTier).toContain(TIER_UBERS);
    });

    test('megaTier=TIER_UBERS on split without isMega: injects tryMega at slot 0', () => {
        const team = getNonBossPreset('CHAMPION_STEVEN', TIER_UBERS);
        expect(team[0].tryMega).toBe(true);
        expect(team[0].contextualTier).toEqual([TIER_UBERS]);
    });

    test('megaTier=null on split without isMega: returns untouched transformed team (no tryMega)', () => {
        const team = getNonBossPreset('CHAMPION_STEVEN');
        expect(team.some(s => s.tryMega)).toBe(false);
    });
});

describe('getNonBossPreset — useAbsoluteTier', () => {
    test('useAbsoluteTier=true: non-mega slots use absoluteTier, not contextualTier', () => {
        const team = getNonBossPreset('FLANNERY', TIER_OU, true);
        const nonMegaSlots = team.filter(s => !s.isMega && !s.tryMega);
        expect(nonMegaSlots.length).toBeGreaterThan(0);
        nonMegaSlots.forEach(slot => {
            expect(slot.contextualTier).toBeUndefined();
            expect(slot.absoluteTier).toBeDefined();
        });
    });

    test('useAbsoluteTier=false (default): non-mega slots still use contextualTier', () => {
        const team = getNonBossPreset('FLANNERY', TIER_OU);
        const nonMegaSlots = team.filter(s => !s.isMega && !s.tryMega);
        expect(nonMegaSlots.length).toBeGreaterThan(0);
        nonMegaSlots.forEach(slot => {
            expect(slot.contextualTier).toBeDefined();
            expect(slot.absoluteTier).toBeUndefined();
        });
    });

    test('fallback slots are also converted to absoluteTier when useAbsoluteTier=true', () => {
        // WATTSON has weather-combo slots with fallback entries that carry contextualTier
        const team = getNonBossPreset('WATTSON', TIER_UU, true);
        const slotsWithFallback = team.filter(s => s.fallback && s.fallback.length > 0);
        slotsWithFallback.forEach(slot => {
            slot.fallback.forEach(fb => {
                if (fb.contextualTier !== undefined) {
                    // If the fallback had contextualTier, it should have been converted
                    expect(fb.absoluteTier).toBeDefined();
                    expect(fb.contextualTier).toBeUndefined();
                }
            });
        });
    });
});

describe('getNonBossPreset — maxBaseTier', () => {
    test('megaTier=TIER_UU: isMega slot has maxBaseTier=TIER_RU', () => {
        const team = getNonBossPreset('FLANNERY', TIER_UU, true);
        const megaSlot = team.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.maxBaseTier).toBe(TIER_RU);
    });

    test('megaTier=TIER_OU: isMega slot has maxBaseTier=TIER_UU', () => {
        const team = getNonBossPreset('FLANNERY', TIER_OU, true);
        const megaSlot = team.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.maxBaseTier).toBe(TIER_UU);
    });

    test('megaTier=TIER_UBERS: isMega slot has no maxBaseTier (unrestricted)', () => {
        const team = getNonBossPreset('FLANNERY', TIER_UBERS, true);
        const megaSlot = team.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.maxBaseTier).toBeUndefined();
    });

    test('WATTSON split: mega slot has no maxBaseTier despite TIER_UU cap', () => {
        const team = getNonBossPreset('WATTSON', TIER_UU, true);
        const megaSlot = team.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.maxBaseTier).toBeUndefined();
    });

    test('WINONA split: mega slot has no maxBaseTier despite TIER_OU cap', () => {
        const team = getNonBossPreset('WINONA', TIER_OU, true);
        const megaSlot = team.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.maxBaseTier).toBeUndefined();
    });
});

describe('getBossPreset – GRANITE_CAVE_STEVEN', () => {
    test('returns 2 slots', () => {
        const slots = getBossPreset('GRANITE_CAVE_STEVEN');
        expect(slots).toHaveLength(2);
    });

    test('all slots have checkValidEvo and expected tiers at fair difficulty', () => {
        const slots = getBossPreset('GRANITE_CAVE_STEVEN');
        const expectedTiers = [['NU'], ['NU']];
        slots.forEach((slot, i) => {
            expect(slot.contextualTier).toEqual(expectedTiers[i]);
            expect(slot.checkValidEvo).toBe(true);
        });
    });
});
