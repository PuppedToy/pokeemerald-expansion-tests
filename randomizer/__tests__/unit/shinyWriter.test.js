'use strict';

// T-274 — the shiny writer patches the five per-run shiny/starter-IV fields of `gRandomizerSettings` in
// src/randomizer_settings.c (compile path; the injector writes the same values as bytes on the inject
// path). Modeled on leagueRulesWriter.js: the numbers themselves are resolved by shinyRules.js, so this
// writer only decides how they are spelled in C. (The ROM compile is CI/builder-only — no GBA toolchain
// locally.)

const fs = require('fs');
const {
    patchShinyRulesInContent,
    SHINY_RULE_FIELDS,
    file,
} = require('../../shinyWriter');

const SAMPLE = [
    'const struct RandomizerSettings gRandomizerSettings = {',
    '    .trainerMoneyNormal = 250,',
    '    .healFaintedAfterBattle       = FALSE,',
    '    .shinyByQuality     = TRUE,',
    '    .shinyOdds          = 8,',
    '    .shinyIvThreshold   = 150,',
    '    .starterPerfectIvs  = 3,',
    '    .starterMinIvTotal  = 150,',
    '};',
].join('\n');

const valueOf = (text, field) => (text.match(new RegExp(`\\.${field}\\s*=\\s*(\\w+)`)) || [])[1];

describe('patchShinyRulesInContent', () => {
    test('a quality run writes its IV threshold and keeps the mode flag on', () => {
        const out = patchShinyRulesInContent(SAMPLE, { shinyByQuality: true, shinyIvThreshold: 170 });
        expect(valueOf(out, 'shinyByQuality')).toBe('TRUE');
        expect(valueOf(out, 'shinyIvThreshold')).toBe('170');
    });

    test('a classic run writes FALSE and the percentage as odds out of 65536', () => {
        const out = patchShinyRulesInContent(SAMPLE, { shinyByQuality: false, shinyChancePercent: 0.0122 });
        expect(valueOf(out, 'shinyByQuality')).toBe('FALSE');
        expect(valueOf(out, 'shinyOdds')).toBe('8');
    });

    test('both tunables always reach the ROM, whichever mode is active', () => {
        // Flipping the toggle in-game is not a thing, but a re-generated run must not lose the other
        // system's tuning — and the docs read the threshold even when classic mode is on.
        const out = patchShinyRulesInContent(SAMPLE, {
            shinyByQuality: false, shinyIvThreshold: 186, shinyChancePercent: 100,
        });
        expect(valueOf(out, 'shinyIvThreshold')).toBe('186');
        expect(valueOf(out, 'shinyOdds')).toBe('65536');
    });

    test('the starter floors are written independently of the shiny rule', () => {
        const out = patchShinyRulesInContent(SAMPLE, { starterPerfectIvs: 6, starterMinIvTotal: 0 });
        expect(valueOf(out, 'starterPerfectIvs')).toBe('6');
        expect(valueOf(out, 'starterMinIvTotal')).toBe('0');
    });

    test('out-of-range config is clamped to what the struct can hold, never written raw', () => {
        const out = patchShinyRulesInContent(SAMPLE, {
            shinyIvThreshold: 9999, starterPerfectIvs: 12, starterMinIvTotal: -3, shinyChancePercent: 1e6,
        });
        expect(valueOf(out, 'shinyIvThreshold')).toBe('186');
        expect(valueOf(out, 'starterPerfectIvs')).toBe('6');
        expect(valueOf(out, 'starterMinIvTotal')).toBe('0');
        expect(valueOf(out, 'shinyOdds')).toBe('65536');
    });

    test('an absent config reproduces the committed defaults (the base ROM\'s own behaviour)', () => {
        for (const cfg of [undefined, null, {}]) {
            const out = patchShinyRulesInContent(SAMPLE, cfg);
            expect(out).toBe(SAMPLE);
        }
    });

    test('a field missing from the source is an error, not a silent partial write', () => {
        const drifted = SAMPLE.split('\n').filter(l => !l.includes('.shinyIvThreshold')).join('\n');
        expect(() => patchShinyRulesInContent(drifted, { shinyIvThreshold: 160 }))
            .toThrow(/shinyIvThreshold/);
    });
});

describe('the committed sources', () => {
    test('carry every field this writer owns', () => {
        const content = fs.readFileSync(file, 'utf8');
        for (const field of SHINY_RULE_FIELDS)
            expect(content).toMatch(new RegExp(`\\.${field}\\s*=`));
    });

    test('are left byte-identical by a default config', () => {
        const content = fs.readFileSync(file, 'utf8');
        expect(patchShinyRulesInContent(content, {})).toBe(content);
    });
});
