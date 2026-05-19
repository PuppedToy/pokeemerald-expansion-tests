'use strict';

// TDD: these tests were written BEFORE config.js was implemented.
// Run `npm test` — all tests in this file should fail until config.js exists.

const path = require('path');
const NONEXISTENT_PATH = path.resolve(__dirname, '../fixtures/nonexistent_config.json');
const VALID_CONFIG_PATH = path.resolve(__dirname, '../fixtures/sample_config.json');

// Loaded lazily so each test can get a fresh module (resetConfig).
function freshConfig() {
    let mod;
    jest.isolateModules(() => { mod = require('../../config'); });
    return mod;
}

describe('loadConfig — defaults', () => {
    test('returns all default fields', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg).toHaveProperty('seed');
        expect(cfg).toHaveProperty('difficulty');
        expect(cfg).toHaveProperty('rebalance');
        expect(cfg).toHaveProperty('balanceChance');
        expect(cfg).toHaveProperty('numROMs');
        expect(cfg).toHaveProperty('sharedModules');
    });

    test('difficulty defaults to 7', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.difficulty).toBe(7);
    });

    test('rebalance defaults to true', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.rebalance).toBe(true);
    });

    test('balanceChance defaults to 0.2', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.balanceChance).toBe(0.2);
    });

    test('auto-generates an integer seed when seed is null', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(Number.isInteger(cfg.seed)).toBe(true);
        expect(cfg.seed).toBeGreaterThanOrEqual(0);
    });
});

describe('loadConfig — explicit overrides', () => {
    test('override replaces default — string alias is resolved to number', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ difficulty: 'hard' }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.difficulty).toBe(10);
    });

    test('override with numeric difficulty is kept as-is', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ difficulty: 9 }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.difficulty).toBe(9);
    });

    test('multiple overrides work together', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ difficulty: 'easy', rebalance: false }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.difficulty).toBe(4);
        expect(cfg.rebalance).toBe(false);
    });

    test('explicit integer seed is kept as-is', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ seed: 12345 }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.seed).toBe(12345);
    });

    test('false override for boolean field works', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ rebalance: false }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.rebalance).toBe(false);
    });

    test('balanceChance override is applied', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ balanceChance: 0.5 }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.balanceChance).toBe(0.5);
    });
});

describe('loadConfig — config file merging', () => {
    beforeAll(() => {
        const fs = require('fs');
        fs.writeFileSync(VALID_CONFIG_PATH, JSON.stringify({ difficulty: 'easy', balanceChance: 0.1 }));
    });

    afterAll(() => {
        const fs = require('fs');
        try { fs.unlinkSync(VALID_CONFIG_PATH); } catch (_) {}
    });

    test('values from config.json override defaults — alias resolved', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: VALID_CONFIG_PATH });
        expect(cfg.difficulty).toBe(4); // 'easy' alias → 4
        expect(cfg.balanceChance).toBe(0.1);
    });

    test('explicit overrides win over config file values', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ difficulty: 'hard' }, { argv: [], configPath: VALID_CONFIG_PATH });
        expect(cfg.difficulty).toBe(10);  // 'hard' alias → 10 wins
        expect(cfg.balanceChance).toBe(0.1);   // file value kept
    });

    test('missing config.json is silently ignored', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH })).not.toThrow();
    });
});

describe('parseCLIArgs', () => {
    test('--difficulty=hard → { difficulty: "hard" }', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--difficulty=hard'])).toMatchObject({ difficulty: 'hard' });
    });

    test('--difficulty=HARD is lowercased', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--difficulty=HARD'])).toMatchObject({ difficulty: 'hard' });
    });

    test('--no-balance → { rebalance: false }', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--no-balance'])).toMatchObject({ rebalance: false });
    });

    test('--seed=42 → { seed: 42 }', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--seed=42'])).toMatchObject({ seed: 42 });
    });

    test('--balance-chance=0.5 → { balanceChance: 0.5 }', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--balance-chance=0.5'])).toMatchObject({ balanceChance: 0.5 });
    });

    test('--mode=nuzlocke → { mode: "nuzlocke" }', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--mode=nuzlocke'])).toMatchObject({ mode: 'nuzlocke' });
    });

    test('empty argv returns {}', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs([])).toEqual({});
    });

    test('unknown flags are ignored', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--debug', '--analyze'])).toEqual({});
    });

    test('CLI overrides win over config file values in loadConfig — alias resolved', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: ['--difficulty=hard'], configPath: NONEXISTENT_PATH });
        expect(cfg.difficulty).toBe(10);
    });

    test('explicit override wins over CLI arg in loadConfig', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ difficulty: 'easy' }, { argv: ['--difficulty=hard'], configPath: NONEXISTENT_PATH });
        expect(cfg.difficulty).toBe(4); // 'easy' alias → 4
    });
});

describe('loadConfig — validation', () => {
    test('throws on unrecognized difficulty string', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ difficulty: 'nightmare' }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/difficulty/i);
    });

    test('throws when numeric difficulty is out of range 1-13', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ difficulty: 0 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/difficulty/i);
        expect(() => loadConfig({ difficulty: 14 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/difficulty/i);
    });

    test('all integer difficulty values 1-13 are valid', () => {
        for (let d = 1; d <= 13; d++) {
            const { loadConfig } = freshConfig();
            expect(() => loadConfig({ difficulty: d }, { argv: [], configPath: NONEXISTENT_PATH }))
                .not.toThrow();
        }
    });

    test('throws when balanceChance > 1', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ balanceChance: 1.5 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/balanceChance/i);
    });

    test('throws when balanceChance < 0', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ balanceChance: -0.1 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/balanceChance/i);
    });

    test('balanceChance of exactly 0 and 1 are valid', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ balanceChance: 0 }, { argv: [], configPath: NONEXISTENT_PATH })).not.toThrow();
        expect(() => loadConfig({ balanceChance: 1 }, { argv: [], configPath: NONEXISTENT_PATH })).not.toThrow();
    });

    test('throws on non-integer seed', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ seed: 3.14 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/seed/i);
    });

    test('null seed (before generation) is allowed', () => {
        // null seed gets auto-generated — no throw
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH })).not.toThrow();
    });
});

describe('loadConfig — numROMs and sharedModules', () => {
    test('numROMs defaults to 1', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.numROMs).toBe(1);
    });

    test('sharedModules defaults to 4', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.sharedModules).toBe(4);
    });

    test('numROMs override is applied', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ numROMs: 3 }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.numROMs).toBe(3);
    });

    test('sharedModules override is applied', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ sharedModules: 2 }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.sharedModules).toBe(2);
    });

    test('throws when numROMs < 1', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ numROMs: 0 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/numROMs/i);
    });

    test('throws when numROMs is not an integer', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ numROMs: 1.5 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/numROMs/i);
    });

    test('throws when sharedModules < 1 or > 5', () => {
        const { loadConfig } = freshConfig();
        expect(() => loadConfig({ sharedModules: 0 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/sharedModules/i);
        expect(() => loadConfig({ sharedModules: 6 }, { argv: [], configPath: NONEXISTENT_PATH }))
            .toThrow(/sharedModules/i);
    });

    test('all five sharedModules values (1–5) are valid', () => {
        for (const v of [1, 2, 3, 4, 5]) {
            const { loadConfig } = freshConfig();
            expect(() => loadConfig({ sharedModules: v }, { argv: [], configPath: NONEXISTENT_PATH }))
                .not.toThrow();
        }
    });
});

describe('loadConfig — allTms', () => {
    test('allTms defaults to false', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.allTms).toBe(false);
    });

    test('--all-tms CLI arg sets allTms: true', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({}, { argv: ['--all-tms'], configPath: NONEXISTENT_PATH });
        expect(cfg.allTms).toBe(true);
    });

    test('parseCLIArgs --all-tms returns { allTms: true }', () => {
        const { parseCLIArgs } = freshConfig();
        expect(parseCLIArgs(['--all-tms'])).toMatchObject({ allTms: true });
    });

    test('allTms override is applied', () => {
        const { loadConfig } = freshConfig();
        const cfg = loadConfig({ allTms: true }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(cfg.allTms).toBe(true);
    });
});

describe('getConfig — caching', () => {
    test('getConfig returns the config set by loadConfig', () => {
        const { loadConfig, getConfig } = freshConfig();
        loadConfig({ seed: 99, difficulty: 'hard' }, { argv: [], configPath: NONEXISTENT_PATH });
        const cached = getConfig();
        expect(cached.seed).toBe(99);
        expect(cached.difficulty).toBe(10); // 'hard' alias → 10
    });

    test('getConfig without prior loadConfig auto-initialises with defaults', () => {
        const { getConfig } = freshConfig();
        // Must not throw even without an explicit loadConfig call
        expect(() => getConfig()).not.toThrow();
        expect(getConfig().difficulty).toBe(7);
    });

    test('resetConfig clears the cache', () => {
        const { loadConfig, getConfig, resetConfig } = freshConfig();
        loadConfig({ seed: 77 }, { argv: [], configPath: NONEXISTENT_PATH });
        expect(getConfig().seed).toBe(77);
        resetConfig();
        // After reset, getConfig re-initialises with defaults+CLI (seed will be newly generated)
        expect(getConfig().seed).not.toBe(77);
    });
});
