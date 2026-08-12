'use strict';

// T-274 — the shiny rule is configurable per run: either **quality** (a mon is shiny iff its 6 IVs sum to
// at least a threshold, the rule 5d98097 introduced) or **classic** gen 3 luck (a PID/OT-id roll out of
// 65536). This module is the single home of the numbers behind both: the defaults, the `%` → odds
// conversion the engine consumes, the exact "how often does that actually happen" probability, and the
// human-terms "1 in N" text the config form and the docs show. frontend/js/shinyRules.js mirrors it for
// the browser (proven identical by frontend/__tests__/shiny-rules-parity.test.js).

const {
    SHINY_DEFAULTS,
    MAX_IV_TOTAL,
    SHINY_ODDS_DENOMINATOR,
    oddsFromPercent,
    ivTotalAtLeastProbability,
    normalizeShinyRules,
    shinyProbability,
    oneInText,
    shinyChanceText,
    docsShinyRule,
} = require('../../shinyRules');

describe('SHINY_DEFAULTS', () => {
    test('quality mode is the default, at the threshold the game already shipped', () => {
        expect(SHINY_DEFAULTS.shinyByQuality).toBe(true);
        expect(SHINY_DEFAULTS.shinyIvThreshold).toBe(150);
    });

    test('the classic percentage defaults to gen 3\'s own odds — 1 in 8192', () => {
        expect(oddsFromPercent(SHINY_DEFAULTS.shinyChancePercent)).toBe(8);
        expect(SHINY_ODDS_DENOMINATOR / 8).toBe(8192);
    });

    test('the starter floors default to 3 perfect IVs and today\'s 150 total', () => {
        expect(SHINY_DEFAULTS.starterPerfectIvs).toBe(3);
        expect(SHINY_DEFAULTS.starterMinIvTotal).toBe(150);
    });
});

describe('oddsFromPercent', () => {
    test('maps a percentage onto the engine\'s out-of-65536 threshold', () => {
        expect(oddsFromPercent(100)).toBe(SHINY_ODDS_DENOMINATOR);
        expect(oddsFromPercent(50)).toBe(32768);
        expect(oddsFromPercent(0)).toBe(0);
        expect(oddsFromPercent(0.0122)).toBe(8);       // gen 3
        expect(oddsFromPercent(0.1)).toBe(66);         // 1 in ~993
    });

    test('clamps out-of-range input instead of producing an impossible threshold', () => {
        expect(oddsFromPercent(-5)).toBe(0);
        expect(oddsFromPercent(1000)).toBe(SHINY_ODDS_DENOMINATOR);
    });

    test('a percentage finer than one part in 65536 rounds to never-shiny (and the text says so)', () => {
        expect(oddsFromPercent(0.0005)).toBe(0);
    });

    test('junk falls back to the gen 3 default rather than to zero', () => {
        for (const junk of [undefined, null, NaN, 'abc', {}])
            expect(oddsFromPercent(junk)).toBe(8);
    });
});

describe('ivTotalAtLeastProbability', () => {
    test('the extremes are certainties', () => {
        expect(ivTotalAtLeastProbability(0)).toBe(1);
        expect(ivTotalAtLeastProbability(MAX_IV_TOTAL + 1)).toBe(0);
        // Only one of the 32^6 IV combinations is all-31.
        expect(ivTotalAtLeastProbability(MAX_IV_TOTAL)).toBeCloseTo(1 / Math.pow(32, 6), 15);
    });

    test('150 — the shipped threshold — is about 1 in 205 wild Pokémon', () => {
        const p = ivTotalAtLeastProbability(150);
        expect(p).toBeCloseTo(0.004884345456957817, 15);
        expect(Math.round(1 / p)).toBe(205);
    });

    test('the distribution is symmetric around its 93 midpoint', () => {
        // P(total >= 93) = P(total <= 93), so P(>=93) + P(>=94) = 1 exactly.
        expect(ivTotalAtLeastProbability(93) + ivTotalAtLeastProbability(94)).toBeCloseTo(1, 15);
    });

    test('rarer thresholds are monotonically rarer', () => {
        let previous = 1;
        for (const t of [100, 120, 150, 160, 170, 180, 186]) {
            const p = ivTotalAtLeastProbability(t);
            expect(p).toBeLessThan(previous);
            previous = p;
        }
    });
});

describe('normalizeShinyRules', () => {
    test('an absent config resolves to the defaults', () => {
        for (const cfg of [undefined, null, {}]) {
            expect(normalizeShinyRules(cfg)).toEqual({
                shinyByQuality: true,
                shinyIvThreshold: 150,
                shinyOdds: 8,
                starterPerfectIvs: 3,
                starterMinIvTotal: 150,
            });
        }
    });

    test('clamps every field to what the engine can represent', () => {
        const out = normalizeShinyRules({
            shinyByQuality: false,
            shinyIvThreshold: 500,
            shinyChancePercent: 250,
            starterPerfectIvs: 99,
            starterMinIvTotal: -20,
        });
        expect(out).toEqual({
            shinyByQuality: false,
            shinyIvThreshold: MAX_IV_TOTAL,
            shinyOdds: SHINY_ODDS_DENOMINATOR,
            starterPerfectIvs: 6,
            starterMinIvTotal: 0,
        });
    });

    test('rounds fractional sliders and keeps junk on the default', () => {
        expect(normalizeShinyRules({ shinyIvThreshold: 150.7 }).shinyIvThreshold).toBe(151);
        expect(normalizeShinyRules({ shinyIvThreshold: 'lots' }).shinyIvThreshold).toBe(150);
        expect(normalizeShinyRules({ starterPerfectIvs: 'all' }).starterPerfectIvs).toBe(3);
    });

    test('only an explicit false switches to classic luck', () => {
        expect(normalizeShinyRules({ shinyByQuality: false }).shinyByQuality).toBe(false);
        expect(normalizeShinyRules({ shinyByQuality: 'no' }).shinyByQuality).toBe(true);
        expect(normalizeShinyRules({ shinyByQuality: true }).shinyByQuality).toBe(true);
    });

    test('the threshold survives classic mode and the percentage survives quality mode', () => {
        // Both numbers ride to the ROM whatever the mode, so flipping the toggle back keeps the tuning.
        const classic = normalizeShinyRules({ shinyByQuality: false, shinyIvThreshold: 170 });
        expect(classic.shinyIvThreshold).toBe(170);
        const quality = normalizeShinyRules({ shinyByQuality: true, shinyChancePercent: 1 });
        expect(quality.shinyOdds).toBe(655);
    });
});

describe('shinyProbability / shinyChanceText', () => {
    test('quality mode reads the IV threshold, classic mode the odds', () => {
        expect(shinyProbability({ shinyByQuality: true, shinyIvThreshold: 150 }))
            .toBeCloseTo(0.004884345456957817, 15);
        expect(shinyProbability({ shinyByQuality: false, shinyChancePercent: 0.0122 }))
            .toBeCloseTo(1 / 8192, 15);
    });

    test('the default run reads "1 in 205"', () => {
        expect(shinyChanceText(SHINY_DEFAULTS)).toBe('1 in 205');
    });

    test('classic gen 3 reads "1 in 8,192" — grouped, so the size is legible at a glance', () => {
        expect(shinyChanceText({ shinyByQuality: false, shinyChancePercent: 0.0122 })).toBe('1 in 8,192');
    });

    test('certainties read as words, not as "1 in 1" or a division by zero', () => {
        expect(oneInText(1)).toBe('always');
        expect(oneInText(0)).toBe('never');
        expect(shinyChanceText({ shinyByQuality: true, shinyIvThreshold: 0 })).toBe('always');
        expect(shinyChanceText({ shinyByQuality: false, shinyChancePercent: 0 })).toBe('never');
        expect(shinyChanceText({ shinyByQuality: false, shinyChancePercent: 100 })).toBe('always');
    });

    test('an all-31 threshold reads its full, absurd rarity', () => {
        expect(shinyChanceText({ shinyByQuality: true, shinyIvThreshold: 186 })).toBe('1 in 1,073,741,824');
    });
});

describe('docsShinyRule', () => {
    test('carries exactly what the viewer needs to tint an IV line', () => {
        expect(docsShinyRule({ shinyByQuality: true, shinyIvThreshold: 160 })).toEqual({
            byQuality: true, ivThreshold: 160, chanceText: '1 in 1,185',
        });
    });

    test('a classic run says so, so the viewer can stop implying the IVs mean shiny', () => {
        const rule = docsShinyRule({ shinyByQuality: false, shinyChancePercent: 0.0122 });
        expect(rule.byQuality).toBe(false);
        expect(rule.chanceText).toBe('1 in 8,192');
        // The threshold still travels: it is the number the run would use if the toggle were on.
        expect(rule.ivThreshold).toBe(150);
    });

    test('no config (the analyze.js path) is the committed default rule', () => {
        expect(docsShinyRule(null)).toEqual({ byQuality: true, ivThreshold: 150, chanceText: '1 in 205' });
    });
});
