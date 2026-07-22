'use strict';

const { applyTransform, getBossPreset, getNonBossPreset } = require('../../presets');
const { TIER_OU, TIER_UBERS, TIER_UU, TIER_RU } = require('../../constants');

// T-165 — the no-tag Tabitha boss (used when the "Disable Steven tag battle" option is on) is a full
// 6-slot villain boss, unlike the 3-slot tag Tabitha. Owner-specified team: UBERS / OU / OU / UU / UU
// + bossMega(OU).
describe('getBossPreset — TABITHA_MOSSDEEP_NO_TAG (T-165)', () => {
    test('returns 6 slots', () => {
        expect(getBossPreset('TABITHA_MOSSDEEP_NO_TAG', true)).toHaveLength(6);
    });

    test('non-mega slots are UBERS / OU / OU / UU / UU, all checkValidEvo', () => {
        const slots = getBossPreset('TABITHA_MOSSDEEP_NO_TAG', true);
        const nonMega = slots.filter(s => !s.isMega);
        expect(nonMega.map(s => s.absoluteTier)).toEqual([
            [TIER_UBERS], [TIER_OU], [TIER_OU], [TIER_UU], [TIER_UU],
        ]);
        nonMega.forEach(s => expect(s.checkValidEvo).toBe(true));
    });

    test('slot 5 is a bossMega with an OU window (no Ubers mega)', () => {
        const mega = getBossPreset('TABITHA_MOSSDEEP_NO_TAG', true).find(s => s.isMega);
        expect(mega).toBeDefined();
        expect(mega.absoluteTier).toContain(TIER_OU);
        expect(mega.absoluteTier).not.toContain(TIER_UBERS);
    });
});

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

// B-001: applyTransform must shift single-tier absoluteTier slots exactly like contextualTier ones
// (Flannery → Champion etc.) — for both difficulty scaling and non-boss team derivation — while
// never touching evolutionTier slots (rival/Wally/Steven progressive mons) or megas.
describe('applyTransform — absoluteTier & evolutionTier (B-001)', () => {
    test('shifts a single-tier absoluteTier slot up (harder)', () => {
        const result = applyTransform([{ absoluteTier: ['NU'] }], +1, 'bottom', 1);
        expect(result[0].absoluteTier).toEqual(['RU']);
    });

    test('shifts a single-tier absoluteTier slot down (easier)', () => {
        const result = applyTransform([{ absoluteTier: ['RU'] }], -1, 'top', 1);
        expect(result[0].absoluteTier).toEqual(['NU']);
    });

    test('ranks contextual and absolute slots together by their primary tier', () => {
        // bottom + numShifts=2 → the two lowest-tier slots shift up, regardless of tier system.
        const team = [{ absoluteTier: ['RU'] }, { contextualTier: ['NU'] }, { absoluteTier: ['UU'] }];
        const result = applyTransform(team, +1, 'bottom', 2);
        expect(result[1].contextualTier).toEqual(['RU']); // NU (lowest) → RU
        expect(result[0].absoluteTier).toEqual(['UU']);    // RU (2nd lowest) → UU
        expect(result[2].absoluteTier).toEqual(['UU']);    // UU (highest) untouched
    });

    test('shifts a single-tier absoluteTier slot in fallback when the primary is shifted', () => {
        const team = [{ absoluteTier: ['NU'], fallback: [{ absoluteTier: ['PU'] }] }];
        const result = applyTransform(team, +1, 'bottom', 1);
        expect(result[0].absoluteTier).toEqual(['RU']);
        expect(result[0].fallback[0].absoluteTier).toEqual(['NU']);
    });

    test('does NOT shift a slot carrying evolutionTier (progressive mons stay fixed)', () => {
        const team = [{ contextualTier: ['NU'], evolutionTier: ['OU'] }];
        const result = applyTransform(team, +1, 'bottom', 1);
        expect(result[0].contextualTier).toEqual(['NU']);
    });

    test('does NOT shift isMega slots even when they carry an absoluteTier', () => {
        const team = [{ isMega: true, absoluteTier: ['UU'] }];
        const result = applyTransform(team, +1, 'bottom', 1);
        expect(result[0].absoluteTier).toEqual(['UU']);
    });

    test('does not mutate the original absoluteTier array', () => {
        const team = [{ absoluteTier: ['NU'] }];
        applyTransform(team, +1, 'bottom', 1);
        expect(team[0].absoluteTier).toEqual(['NU']);
    });
});

// B-001: non-boss teams must be the 2-shift-down of the boss for absolute-tier splits too, so
// generic late-game trainers are weaker than the leader (matching early-game behaviour).
describe('getNonBossPreset — absolute-split derivation is 2-shift-down (B-001)', () => {
    test('FLANNERY non-boss non-mega tiers = boss UU,UU,UU,RU,RU shifted 2-down → one UU, four RU', () => {
        const team = getNonBossPreset('FLANNERY', TIER_OU, true);
        const nonMega = team.filter(s => !s.isMega && !s.tryMega).map(s => s.absoluteTier[0]);
        const counts = nonMega.reduce((m, t) => (m[t] = (m[t] || 0) + 1, m), {});
        expect(counts).toEqual({ UU: 1, RU: 4 });
        // strictly weaker than the boss (which is UU,UU,UU,RU,RU)
        const boss = getBossPreset('FLANNERY', true).filter(s => !s.isMega).map(s => s.absoluteTier[0]);
        expect(boss.filter(t => t === 'UU').length).toBe(3);
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

    test('useAbsoluteTier=false (default): pre-Wattson non-mega slots use contextualTier', () => {
        // WATTSON is the last pre-absolute-era boss; its SPLIT stores contextualTier
        const team = getNonBossPreset('WATTSON', TIER_UU);
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

describe('getBossPreset — useAbsoluteTier', () => {
    test('useAbsoluteTier=false (default): pre-Wattson boss slots use contextualTier', () => {
        // WATTSON is the last pre-absolute-era boss; its SPLIT stores contextualTier
        const slots = getBossPreset('WATTSON');
        const nonMegaSlots = slots.filter(s => !s.isMega);
        expect(nonMegaSlots.length).toBeGreaterThan(0);
        nonMegaSlots.forEach(slot => {
            expect(slot.contextualTier).toBeDefined();
            expect(slot.absoluteTier).toBeUndefined();
        });
    });

    test('useAbsoluteTier=true: non-mega slots converted to absoluteTier', () => {
        const slots = getBossPreset('NORMAN', true);
        const nonMegaSlots = slots.filter(s => !s.isMega);
        expect(nonMegaSlots.length).toBeGreaterThan(0);
        nonMegaSlots.forEach(slot => {
            expect(slot.absoluteTier).toBeDefined();
            expect(slot.contextualTier).toBeUndefined();
        });
    });

    // T-128 — a boss's mega slot now carries the pool's mega tier gate (bossMega); it must survive
    // convertSlotToAbsolute intact (isMega short-circuits — no contextual→absolute mangling of the gate).
    test('useAbsoluteTier=true: gated isMega slot keeps its absoluteTier window, no contextualTier', () => {
        const slots = getBossPreset('NORMAN', true);
        const megaSlot = slots.find(s => s.isMega);
        expect(megaSlot).toBeDefined();
        expect(megaSlot.contextualTier).toBeUndefined();
        expect(Array.isArray(megaSlot.absoluteTier)).toBe(true);
        expect(megaSlot.absoluteTier).toContain(TIER_OU);   // gym mega ceiling
        expect(megaSlot.absoluteTier).not.toContain(TIER_UBERS); // gyms cap at OU, no Uber megas
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

describe('T-150: bosses get Mega OU from the start; normal trainers keep UU→OU→Ubers', () => {
    const megaSlot = (team) => team.find((s) => s.isMega);

    // The 3 splits that used bossMega(TIER_UU) (WATTSON, FLANNERY, TABITHA_CHIMNEY) now use OU:
    // their boss mega window reaches OU and the base-form cap widens to UU (BASE_TIER_CAPS[OU]).
    test.each(['WATTSON', 'FLANNERY', 'TABITHA_CHIMNEY'])('%s boss mega window reaches OU', (id) => {
        const mega = megaSlot(getBossPreset(id, true));
        expect(mega.absoluteTier).toContain(TIER_OU);
        expect(mega.absoluteTier).not.toContain(TIER_UBERS); // Ubers still gated for these bosses
    });

    test('WATTSON/FLANNERY boss mega base cap is UU (a genuine OU upgrade)', () => {
        for (const id of ['WATTSON', 'FLANNERY']) {
            expect(megaSlot(getBossPreset(id, true)).maxBaseTier).toBe(TIER_UU);
        }
    });

    test('Ubers bosses unchanged — Ubers stays gated to its own breakpoint', () => {
        expect(megaSlot(getBossPreset('JUAN', true)).absoluteTier).toContain(TIER_UBERS);
    });

    test('normal (non-boss) early-era trainers keep the UU mega cap (unchanged)', () => {
        const mega = megaSlot(getNonBossPreset('WATTSON', TIER_UU, true));
        expect(mega.absoluteTier).toContain(TIER_UU);
        expect(mega.absoluteTier).not.toContain(TIER_OU);
    });
});

// ─── T-186 — difficulty settings: non-boss quality shift + team-size trim ─────────────────
const {
    getNonBossQualityShift,
    slotTrimStrength,
    trimTeamToSize,
} = require('../../presets');
const { TIER_SEQ, TIER_NU, TIER_PU, TIER_LEGEND, TIER_AG } = require('../../constants');

describe('getNonBossQualityShift (T-186)', () => {
    // extraShift = modifier − (−2): default −2 is a no-op; the mechanism composes on top of the
    // already-baked easyTransform(−2) in the non-boss presets.
    test('default −2 → no shift (byte-identical)', () => {
        expect(getNonBossQualityShift(-2)).toEqual({ numShifts: 0, delta: 0, direction: null });
    });

    test('undefined → treated as −2 (no shift)', () => {
        expect(getNonBossQualityShift(undefined)).toEqual({ numShifts: 0, delta: 0, direction: null });
    });

    test('weaker than baseline (−4) shifts DOWN by 2 (top slots)', () => {
        expect(getNonBossQualityShift(-4)).toEqual({ numShifts: 2, delta: -1, direction: 'top' });
    });

    test('weakest (−6) shifts DOWN by 4', () => {
        expect(getNonBossQualityShift(-6)).toEqual({ numShifts: 4, delta: -1, direction: 'top' });
    });

    test('stronger than baseline (−1) shifts UP by 1 (bottom slots)', () => {
        expect(getNonBossQualityShift(-1)).toEqual({ numShifts: 1, delta: +1, direction: 'bottom' });
    });

    test('same quality as boss (0) shifts UP by 2', () => {
        expect(getNonBossQualityShift(0)).toEqual({ numShifts: 2, delta: +1, direction: 'bottom' });
    });
});

describe('slotTrimStrength (T-186)', () => {
    test('ordinary tier slots rank by TIER_SEQ index', () => {
        expect(slotTrimStrength({ contextualTier: [TIER_PU] })).toBe(TIER_SEQ.indexOf(TIER_PU));
        expect(slotTrimStrength({ absoluteTier: [TIER_NU] })).toBe(TIER_SEQ.indexOf(TIER_NU));
        expect(slotTrimStrength({ absoluteTier: [TIER_LEGEND] })).toBe(TIER_SEQ.indexOf(TIER_LEGEND));
    });

    test('a higher tier is stronger than a lower tier', () => {
        expect(slotTrimStrength({ contextualTier: [TIER_LEGEND] }))
            .toBeGreaterThan(slotTrimStrength({ contextualTier: [TIER_PU] }));
    });

    test('mega, evolutionTier, oneOf, specific and special slots outrank every ordinary tier (never trimmed first)', () => {
        const topOrdinary = slotTrimStrength({ absoluteTier: [TIER_AG] });
        expect(slotTrimStrength({ isMega: true })).toBeGreaterThan(topOrdinary);
        expect(slotTrimStrength({ evolutionTier: 3 })).toBeGreaterThan(topOrdinary);
        expect(slotTrimStrength({ oneOf: ['SPECIES_X'] })).toBeGreaterThan(topOrdinary);
        expect(slotTrimStrength({ specific: 'SPECIES_Y' })).toBeGreaterThan(topOrdinary);
        expect(slotTrimStrength({ special: 'REPEAT' })).toBeGreaterThan(topOrdinary);
    });

    test('mega is the single strongest (kept even against an AG ace slot)', () => {
        expect(slotTrimStrength({ isMega: true }))
            .toBeGreaterThanOrEqual(slotTrimStrength({ evolutionTier: 3 }));
    });
});

describe('trimTeamToSize (T-186)', () => {
    const NU = { contextualTier: [TIER_NU] };
    const PU = { contextualTier: [TIER_PU] };
    const AG = { absoluteTier: [TIER_AG] };

    test('size ≥ team length → same array reference (no trim, byte-identical)', () => {
        const team = [NU, PU];
        expect(trimTeamToSize(team, 6)).toBe(team);
        expect(trimTeamToSize(team, 2)).toBe(team);
    });

    test('drops the weakest slots, keeps the strongest, preserving original order', () => {
        // NU(3) PU(2) AG(9) NU(3) → strongest two are AG(idx2) and the first NU(idx0); kept in
        // ORIGINAL order → [NU, AG] (PU and the second NU are dropped).
        const team = [NU, PU, AG, NU];
        expect(trimTeamToSize(team, 2)).toEqual([NU, AG]);
    });

    test('never trims below 1 and clamps size into [1,6]', () => {
        const team = [PU, NU, AG];
        expect(trimTeamToSize(team, 0)).toEqual([AG]);      // clamped to 1 → strongest kept
        expect(trimTeamToSize(team, -3)).toEqual([AG]);
    });

    test('keeps the mega ace when shrinking a boss team to 1', () => {
        const mega = { isMega: true };
        const team = [{ absoluteTier: [TIER_NU] }, { absoluteTier: [TIER_PU] }, mega];
        expect(trimTeamToSize(team, 1)).toEqual([mega]);
    });

    test('does not mutate the input array', () => {
        const team = [NU, PU, AG];
        const copy = [...team];
        trimTeamToSize(team, 1);
        expect(team).toEqual(copy);
    });
});
