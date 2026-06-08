'use strict';

const rng = require('../../rng');
const { buildWildPlaceholderMap, substituteWildSpecies } = require('../../writer');

afterEach(() => rng.reset());

describe('buildWildPlaceholderMap', () => {
    test('does not consume any RNG calls', () => {
        rng.seed(42);
        const baseline = rng.random();

        rng.seed(42);
        buildWildPlaceholderMap([['SPECIES_PIKACHU', 'SPECIES_RAICHU']]);
        const after = rng.random();

        expect(after).toBe(baseline);
    });

    test('generates same placeholders regardless of RNG seed', () => {
        const entries = [['SPECIES_BULBASAUR', 'SPECIES_CHIKORITA'], ['SPECIES_PIKACHU', 'SPECIES_RAICHU']];

        rng.seed(1);
        const result1 = buildWildPlaceholderMap(entries);

        rng.seed(99999);
        const result2 = buildWildPlaceholderMap(entries);

        expect(result1).toEqual(result2);
    });

    test('generates unique placeholder for each species', () => {
        const entries = [['SPECIES_A', 'X'], ['SPECIES_B', 'Y'], ['SPECIES_C', 'Z']];
        const result = buildWildPlaceholderMap(entries);
        const placeholders = Object.values(result);
        expect(new Set(placeholders).size).toBe(placeholders.length);
    });
});

describe('substituteWildSpecies', () => {
    // Build a wild_encounters.json-like blob where every base species appears
    // verbatim inside a quoted JSON value, as in the real file.
    function buildContent(baseSpecies) {
        return baseSpecies
            .map((s, i) => `    { "min_level": ${i}, "max_level": ${i}, "species": "${s}" }`)
            .join(',\n');
    }

    test('substitutes every base species with its replacement', () => {
        const log = {
            SPECIES_ZIGZAGOON: 'SPECIES_YAMPER',
            SPECIES_WURMPLE: 'SPECIES_MAREEP',
        };
        const content = buildContent(Object.keys(log));
        const result = substituteWildSpecies(content, log);

        expect(result).toContain('SPECIES_YAMPER');
        expect(result).toContain('SPECIES_MAREEP');
        expect(result).not.toContain('SPECIES_ZIGZAGOON');
        expect(result).not.toContain('SPECIES_WURMPLE');
    });

    test('does not corrupt names when placeholder indices share a prefix (P1 vs P1x)', () => {
        // ≥20 entries so placeholder P1 is a substring-prefix of P10..P19, and with
        // 100+ entries also of P100.. — the exact run-5 corruption scenario.
        const N = 120;
        const log = {};
        for (let i = 0; i < N; i++) {
            log[`SPECIES_BASE${i}`] = `SPECIES_REPL${i}`;
        }
        const content = buildContent(Object.keys(log));
        const result = substituteWildSpecies(content, log);

        // No placeholder may leak through.
        expect(result).not.toMatch(/WILDPOKE_P/);
        // No replacement species may carry a stray trailing/garbage digit suffix
        // produced by a prefix collision (e.g. SPECIES_REPL5 turning into SPECIES_REPL59).
        for (let i = 0; i < N; i++) {
            // The intended replacement token must be present...
            expect(result).toContain(`"SPECIES_REPL${i}"`);
        }
        // ...and every species token in the output must be one we explicitly produced.
        const tokens = result.match(/SPECIES_[A-Z0-9_]+/g) || [];
        const allowed = new Set(Object.values(log));
        for (const tok of tokens) {
            expect(allowed.has(tok)).toBe(true);
        }
    });

    test('does not corrupt a base species that is a prefix of another base species', () => {
        // Pass 1 must not let SPECIES_TAUROS bleed into SPECIES_TAUROS_PALDEA_COMBAT.
        const log = {
            SPECIES_TAUROS: 'SPECIES_YAMPER',
            SPECIES_TAUROS_PALDEA_COMBAT: 'SPECIES_MAREEP',
        };
        const content = buildContent(Object.keys(log));
        const result = substituteWildSpecies(content, log);

        expect(result).toContain('"SPECIES_YAMPER"');
        expect(result).toContain('"SPECIES_MAREEP"');
        expect(result).not.toMatch(/SPECIES_YAMPER_PALDEA_COMBAT/);
    });
});
