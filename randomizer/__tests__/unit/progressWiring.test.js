'use strict';

// T-276 — the pipeline's progress wiring. progress.test.js covers the cost model in isolation; this
// drives the REAL runGeneration with every heavy module stubbed out, so what is asserted is the
// thing that was actually wrong: which percentages a run reports, and whether the two units that
// carry all the time (the Pokédex and the docs) can move the bar from inside their own loops.

jest.mock('../../modules/pokedexModule', () => ({ runPokedexModule: jest.fn() }));
jest.mock('../../modules/trainersModule', () => ({ runTrainersModule: jest.fn(() => ({ trainersData: [], itemAssignments: {} })) }));
jest.mock('../../modules/startersModule', () => ({ runStartersModule: jest.fn(() => ({ starters: [] })) }));
jest.mock('../../modules/wildModule', () => ({ runWildModule: jest.fn(() => ({ extraStarters: [] })), addTradeMegaEvos: jest.fn() }));
jest.mock('../../trades', () => ({ selectTrades: jest.fn(() => []), TRADERS: [] }));
jest.mock('../../writerDocs', () => ({ writerDocs: jest.fn(async () => ({})) }));

const { runPokedexModule } = require('../../modules/pokedexModule');
const { writerDocs } = require('../../writerDocs');
const { runGeneration } = require('../../generate');
const { WEIGHTS } = require('../../progress');

const fakePokedex = () => ({ capLevels: {}, pokes: [], moves: {}, abilities: {} });

beforeEach(() => {
    jest.clearAllMocks();
    runPokedexModule.mockImplementation(async () => fakePokedex());
    writerDocs.mockImplementation(async () => ({}));
});

// Run a generation, capturing every (pct, step) it emits.
async function generate(cfg, hooks = {}) {
    const seen = [];
    await runGeneration(
        { seed: 7, difficulty: 7, ...cfg },
        { seed: 7, difficulty: 7 },
        'progress-wiring',
        { baseData: {}, progress: (pct, step) => seen.push({ pct, step }), ...hooks },
    );
    return { seen, pcts: seen.map(e => e.pct) };
}

const share = (kind, counts) => Math.round(
    WEIGHTS[kind] / Object.keys(counts).reduce((s, k) => s + WEIGHTS[k] * counts[k], 0) * 100,
);

describe('a default run reports the cost of its work', () => {
    const COUNTS = { pokedex: 1, trainers: 1, starters: 1, wild: 1, docs: 1 };

    test('the Pokédex is worth what it costs, not one fifth of the bar', async () => {
        const { seen, pcts } = await generate({ runType: 'default' });
        const afterPokedex = seen.find(e => /trainer teams/i.test(e.step)).pct;
        expect(afterPokedex).toBe(share('pokedex', COUNTS));
        expect(afterPokedex).toBeGreaterThan(60);   // was 20
        expect(pcts.at(-1)).toBe(100);
    });

    test('the three cheap milestones no longer eat 60 points of the bar', async () => {
        const { seen } = await generate({ runType: 'default' });
        const at = (re) => seen.find(e => re.test(e.step)).pct;
        // Trainer templates → starters → wild used to be 20→40→60→80%.
        expect(at(/wild encounters/i) - at(/trainer teams/i)).toBeLessThan(2);
    });

    test('the docs unit spans the rest of the bar', async () => {
        const { seen } = await generate({ runType: 'default' });
        const docsStart = seen.find(e => /docs/i.test(e.step)).pct;
        expect(100 - docsStart).toBeGreaterThan(25);   // ~32% of a run
    });

    test('progress is monotonic and 100% arrives exactly once, at the end', async () => {
        const { pcts } = await generate({ runType: 'default' });
        expect(pcts).toEqual([...pcts].sort((a, b) => a - b));
        expect(pcts.filter(p => p === 100)).toHaveLength(1);
        expect(pcts.at(-1)).toBe(100);
    });
});

describe('the two expensive units move the bar from inside', () => {
    test('the Pokédex pass reports sub-progress', async () => {
        runPokedexModule.mockImplementation(async (cfg, baseData, hooks) => {
            expect(typeof hooks.onProgress).toBe('function');
            [0.25, 0.5, 0.75].forEach(hooks.onProgress);
            return fakePokedex();
        });
        const { pcts } = await generate({ runType: 'default' });
        const afterPokedex = pcts.find(p => p > 60);
        // Percentages strictly between the start of the Pokédex and its completion.
        expect(pcts.filter(p => p > 0 && p < afterPokedex).length).toBeGreaterThanOrEqual(3);
    });

    test('trainer resolution reports sub-progress', async () => {
        writerDocs.mockImplementation(async (...args) => {
            const options = args[args.length - 1];
            expect(typeof options.onProgress).toBe('function');
            [0.25, 0.5, 0.75].forEach(options.onProgress);
            return {};
        });
        const { seen } = await generate({ runType: 'default' });
        const docsStart = seen.find(e => /docs/i.test(e.step)).pct;
        const inside = seen.filter(e => e.pct > docsStart && e.pct < 100);
        expect(inside.length).toBeGreaterThanOrEqual(3);
    });

    test('no run has a silent gap: every step either finishes fast or reports from inside', async () => {
        // The heavy units are the only ones allowed to take real time, and both now take a hook.
        runPokedexModule.mockImplementation(async (cfg, baseData, hooks) => { hooks.onProgress(0.5); return fakePokedex(); });
        writerDocs.mockImplementation(async (...args) => { args[args.length - 1].onProgress(0.5); return {}; });
        const { pcts } = await generate({ runType: 'default' });
        const gaps = pcts.slice(1).map((p, i) => p - pcts[i]);
        expect(Math.max(...gaps)).toBeLessThan
            (Math.round(WEIGHTS.pokedex / (WEIGHTS.pokedex + WEIGHTS.trainers + WEIGHTS.starters + WEIGHTS.wild + WEIGHTS.docs) * 100));
    });
});

describe('multi-ROM runs weight shared work by how much of the run it is', () => {
    test('a shared Pokédex shrinks as ROMs are added', async () => {
        const pokedexShare = async (numROMs) => {
            const { seen } = await generate({
                runType: 'nuzlocke', numROMs,
                shared: { pokedex: true, trainers: true, starters: true },
            });
            // The last percentage reported under the shared-Pokédex label is where that unit ended.
            return seen.filter(e => /shared Pokédex/i.test(e.step)).at(-1).pct;
        };
        const one = await pokedexShare(1);
        const four = await pokedexShare(4);
        expect(one).toBeGreaterThan(60);
        expect(four).toBeLessThan(40);
        expect(four).toBeLessThan(one);
    });

    test('each ROM\'s docs get an equal slice of what is left', async () => {
        const { seen } = await generate({
            runType: 'nuzlocke', numROMs: 3,
            shared: { pokedex: true, trainers: true, starters: true },
        });
        // Each ROM's viewer is one unit: take where each one STARTED (the first pct under its label).
        const viewerStarts = [...new Map(
            seen.filter(e => /Building viewer/i.test(e.step)).reverse().map(e => [e.step, e.pct]),
        ).values()].reverse();
        expect(viewerStarts).toHaveLength(3);
        const slices = viewerStarts.slice(1).map((p, i) => p - viewerStarts[i]);
        expect(Math.max(...slices) - Math.min(...slices)).toBeLessThanOrEqual(1);
    });

    test('a soul-link run also reaches 100% and stays monotonic', async () => {
        const { pcts } = await generate({
            runType: 'soullink', numPlayers: 2, romsPerPlayer: 2,
            playerShared: { pokedex: true, trainers: false, starters: false },
            romShared: { pokedex: false, trainers: true, starters: true },
        });
        expect(pcts).toEqual([...pcts].sort((a, b) => a - b));
        expect(pcts.at(-1)).toBe(100);
    });
});

describe('callers that report nothing are unaffected', () => {
    test('no progress hook at all still generates a bundle', async () => {
        const bundle = await runGeneration({ runType: 'default', seed: 7 }, { seed: 7 }, 'no-hook', { baseData: {} });
        expect(bundle.roms).toHaveLength(1);
    });

    test('the browser can reserve the head of the bar for its base-data download', async () => {
        const { pcts } = await generate({ runType: 'default' }, { progressFloor: 4 });
        expect(pcts[0]).toBe(4);
        expect(pcts.at(-1)).toBe(100);
    });
});
