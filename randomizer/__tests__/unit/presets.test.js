'use strict';

const { applyTransform, getBossPreset } = require('../../presets');

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

describe('getBossPreset – GRANITE_CAVE_STEVEN', () => {
    test('returns 3 slots (one per steel-type team member)', () => {
        const slots = getBossPreset('GRANITE_CAVE_STEVEN');
        expect(slots).toHaveLength(3);
    });

    test('all slots are NU at fair difficulty with checkValidEvo', () => {
        const slots = getBossPreset('GRANITE_CAVE_STEVEN');
        slots.forEach(slot => {
            expect(slot.contextualTier).toEqual(['NU']);
            expect(slot.checkValidEvo).toBe(true);
        });
    });
});
