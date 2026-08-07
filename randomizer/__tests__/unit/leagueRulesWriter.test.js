'use strict';

// T-257 — the league-rules writer patches the three bool8 house-rule fields of `gRandomizerSettings` in
// src/randomizer_settings.c (post-battle healing in the world, post-battle healing inside the Elite Four
// gauntlet, and whether the summary-screen relearner works in there — T-258). Booleans are written as the
// C literals TRUE/FALSE so the initializer stays readable and the injector can parse them back.
// (The ROM compile is CI/builder-only — no GBA toolchain locally.)

const fs = require('fs');
const {
    patchLeagueRulesInContent,
    LEAGUE_RULE_FIELDS,
    file,
} = require('../../leagueRulesWriter');

const SAMPLE = [
    'const struct RandomizerSettings gRandomizerSettings = {',
    '    .trainerMoneyNormal = 250,',
    '    .trainerMoneyBoss   = 3000,',
    '    .trainerMoneyGym    = 5000,',
    '    .moveRelearnerCost  = 250,',
    '    .healFaintedAfterBattle       = FALSE,',
    '    .healFaintedAfterBattleLeague = FALSE,',
    '    .leagueMoveRelearnAllowed     = FALSE,',
    '};',
].join('\n');

describe('patchLeagueRulesInContent', () => {
    test('turns each rule on independently', () => {
        const out = patchLeagueRulesInContent(SAMPLE, { healFaintedAfterBattle: true });
        expect(out).toMatch(/\.healFaintedAfterBattle\s+=\s+TRUE/);
        expect(out).toMatch(/\.healFaintedAfterBattleLeague\s+=\s+FALSE/);
        expect(out).toMatch(/\.leagueMoveRelearnAllowed\s+=\s+FALSE/);
    });

    test('heal-in-the-league is independent of heal-in-the-world (the owner\'s "and viceversa")', () => {
        const out = patchLeagueRulesInContent(SAMPLE, {
            healFaintedAfterBattle: false,
            healFaintedAfterBattleLeague: true,
        });
        expect(out).toMatch(/\.healFaintedAfterBattle\s+=\s+FALSE/);
        expect(out).toMatch(/\.healFaintedAfterBattleLeague\s+=\s+TRUE/);
    });

    test('all three on at once', () => {
        const out = patchLeagueRulesInContent(SAMPLE, {
            healFaintedAfterBattle: true,
            healFaintedAfterBattleLeague: true,
            leagueMoveRelearnAllowed: true,
        });
        for (const field of LEAGUE_RULE_FIELDS)
            expect(out).toMatch(new RegExp(`\\.${field}\\s+=\\s+TRUE`));
    });

    test('absent / junk config → the committed default (every rule off)', () => {
        for (const cfg of [undefined, null, {}, { healFaintedAfterBattle: 'yes' }, { healFaintedAfterBattle: 1 }]) {
            const out = patchLeagueRulesInContent(SAMPLE, cfg);
            for (const field of LEAGUE_RULE_FIELDS)
                expect(out).toMatch(new RegExp(`\\.${field}\\s+=\\s+FALSE`));
        }
    });

    test('turning a rule back off rewrites TRUE to FALSE', () => {
        const on = patchLeagueRulesInContent(SAMPLE, { leagueMoveRelearnAllowed: true });
        const off = patchLeagueRulesInContent(on, { leagueMoveRelearnAllowed: false });
        expect(off).toMatch(/\.leagueMoveRelearnAllowed\s+=\s+FALSE/);
    });

    test('does not touch the money or relearn-price fields (owned by the other two writers)', () => {
        const out = patchLeagueRulesInContent(SAMPLE, { healFaintedAfterBattle: true });
        expect(out).toContain('.trainerMoneyNormal = 250');
        expect(out).toContain('.trainerMoneyBoss   = 3000');
        expect(out).toContain('.trainerMoneyGym    = 5000');
        expect(out).toContain('.moveRelearnerCost  = 250');
    });

    test('a missing field is a hard error — the base source and this writer must agree', () => {
        const truncated = SAMPLE.replace(/\s*\.leagueMoveRelearnAllowed[^\n]*\n/, '\n');
        expect(() => patchLeagueRulesInContent(truncated, { leagueMoveRelearnAllowed: true }))
            .toThrow(/leagueMoveRelearnAllowed/);
    });
});

describe('committed C source matches the writer', () => {
    test('randomizer_settings.c carries all three patchable rule fields, all off', () => {
        const content = fs.readFileSync(file, 'utf8');
        for (const field of LEAGUE_RULE_FIELDS)
            expect(content).toMatch(new RegExp(`\\.${field}\\s+=\\s+FALSE`));
        const patched = patchLeagueRulesInContent(content, {
            healFaintedAfterBattle: true,
            healFaintedAfterBattleLeague: true,
            leagueMoveRelearnAllowed: true,
        });
        for (const field of LEAGUE_RULE_FIELDS)
            expect(patched).toMatch(new RegExp(`\\.${field}\\s+=\\s+TRUE`));
    });
});
