'use strict';

// T-276 — the progress model. The bar used to count milestones and give each the same weight, so a
// `default` run showed 20% for the Pokédex (68% of the real time) and jumped 20→80% through three
// milestones worth 0.3% of it. These tests pin the two properties that make the bar mean something:
// percentages proportional to the measured cost of the work, and a percentage that keeps moving
// while a single expensive unit of work runs.

const { WEIGHTS, POKEDEX_PASSES, createProgressTracker } = require('../../progress');

// Collect (pct, label) emissions from a tracker.
function recorder() {
    const seen = [];
    return { emit: (pct, label) => seen.push({ pct, label }), seen, pcts: () => seen.map(e => e.pct) };
}

describe('cost model', () => {
    test('every unit kind a run can schedule has a weight', () => {
        expect(Object.keys(WEIGHTS).sort()).toEqual(['docs', 'pokedex', 'starters', 'trainers', 'wild']);
        Object.values(WEIGHTS).forEach(w => expect(w).toBeGreaterThan(0));
    });

    test('the Pokédex and the docs dominate, matching the measurements in tasks/T-276', () => {
        // Measured: pokedex 19.5 s, docs 9.1 s, everything else together ~0.07 s.
        const cheap = WEIGHTS.trainers + WEIGHTS.starters + WEIGHTS.wild;
        expect(WEIGHTS.pokedex / WEIGHTS.docs).toBeCloseTo(19.5 / 9.1, 1);
        expect(WEIGHTS.pokedex / cheap).toBeGreaterThan(50);
    });

    test('the Pokédex sub-passes are shares of the Pokédex weight and cover almost all of it', () => {
        const sum = Object.values(POKEDEX_PASSES).reduce((a, b) => a + b, 0);
        expect(sum).toBeLessThanOrEqual(1);
        expect(sum).toBeGreaterThan(0.9);
        // The per-level contextual pass is the single most expensive thing in a run (17.4 s of 28.8 s).
        expect(POKEDEX_PASSES.contextual).toBeGreaterThan(0.8);
    });
});

describe('createProgressTracker — weighting', () => {
    test('a unit moves the bar by its share of the run, not by 1/steps', async () => {
        const r = recorder();
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1, trainers: 1, starters: 1, wild: 1, docs: 1 } });
        const total = WEIGHTS.pokedex + WEIGHTS.trainers + WEIGHTS.starters + WEIGHTS.wild + WEIGHTS.docs;

        await t.run('pokedex', 'Pokédex', async () => 'pdx');
        const afterPokedex = r.pcts().at(-1);
        expect(afterPokedex).toBe(Math.round((WEIGHTS.pokedex / total) * 100));
        // The old model showed 20% here; the real share is ~68%.
        expect(afterPokedex).toBeGreaterThan(60);

        await t.run('trainers', 'Trainers', async () => 't');
        await t.run('starters', 'Starters', async () => 's');
        await t.run('wild', 'Wild', async () => 'w');
        // The three cheap milestones used to consume 60 points of the bar between them.
        expect(r.pcts().at(-1) - afterPokedex).toBeLessThan(2);
    });

    test('shared work is amortized: the more ROMs, the smaller its share of the bar', async () => {
        const share = async (numROMs) => {
            const r = recorder();
            const t = createProgressTracker({
                emit: r.emit,
                counts: { pokedex: 1, trainers: 1, starters: 1, wild: numROMs, docs: numROMs },
            });
            await t.run('pokedex', 'Pokédex', async () => {});
            return r.pcts().at(-1);
        };
        expect(await share(1)).toBeGreaterThan(60);
        expect(await share(4)).toBeLessThan(40);
        expect(await share(4)).toBeLessThan(await share(2));
    });

    test('a run reaches 100% — and only through finish()', async () => {
        const r = recorder();
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1, docs: 1 } });
        await t.run('pokedex', 'Pokédex', async () => {});
        await t.run('docs', 'Docs', async () => {});
        expect(r.pcts()).not.toContain(100);   // all the work is done, but the run is not
        t.finish('Done');
        expect(r.pcts().at(-1)).toBe(100);
        expect(r.seen.at(-1).label).toBe('Done');
    });

    test('kinds the run does not schedule cost nothing', async () => {
        const r = recorder();
        // A nuzlocke with a shared pokédex never runs the per-ROM pokédex; only scheduled work counts.
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1, docs: 1, trainers: 0 } });
        await t.run('pokedex', 'Pokédex', async () => {});
        const total = WEIGHTS.pokedex + WEIGHTS.docs;
        expect(r.pcts().at(-1)).toBe(Math.round((WEIGHTS.pokedex / total) * 100));
    });
});

describe('createProgressTracker — sub-progress', () => {
    test('an expensive unit keeps the bar moving while it runs', async () => {
        const r = recorder();
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1, docs: 1 } });
        await t.run('pokedex', 'Pokédex', async (onProgress) => {
            for (let i = 1; i <= 100; i++) onProgress(i / 100);
        });
        // Distinct percentages inside the unit, not a single jump at the end.
        const inside = new Set(r.pcts());
        expect(inside.size).toBeGreaterThan(20);
    });

    test('sub-progress stays inside the unit it belongs to', async () => {
        const r = recorder();
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1, docs: 1 } });
        const total = WEIGHTS.pokedex + WEIGHTS.docs;
        await t.run('pokedex', 'Pokédex', async (onProgress) => {
            onProgress(0.5);
            expect(r.pcts().at(-1)).toBe(Math.round((WEIGHTS.pokedex * 0.5 / total) * 100));
            onProgress(5);      // a caller overshooting must not push the bar past the unit
            expect(r.pcts().at(-1)).toBe(Math.round((WEIGHTS.pokedex / total) * 100));
        });
    });

    test('emissions never go backwards, and never repeat what the UI already shows', async () => {
        const r = recorder();
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1, docs: 1 } });
        await t.run('pokedex', 'Pokédex', async (onProgress) => {
            onProgress(0.9);
            onProgress(0.1);    // a caller reporting out of order must not rewind the bar
            onProgress(0.9);
        });
        await t.run('docs', 'Docs', async (onProgress) => { onProgress(0.5); });
        t.finish('Done');
        const pcts = r.pcts();
        expect(pcts).toEqual([...pcts].sort((a, b) => a - b));
        // A percentage may recur only when the step label changed (a new step starting where the
        // previous one ended still has to announce itself).
        r.seen.forEach((e, i) => {
            if (i > 0) expect(`${e.pct}|${e.label}`).not.toBe(`${r.seen[i - 1].pct}|${r.seen[i - 1].label}`);
        });
    });

    test('a label is emitted with the percentage, and sub-progress keeps it', async () => {
        const r = recorder();
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1 } });
        await t.run('pokedex', 'Generating Pokédex...', async (onProgress) => { onProgress(0.5); });
        expect(r.seen.every(e => e.label === 'Generating Pokédex...')).toBe(true);
        expect(r.seen[0].pct).toBe(0);
    });
});

describe('createProgressTracker — scale', () => {
    test('progressFloor reserves the head of the bar for work outside the run (the base-data download)', async () => {
        const r = recorder();
        const t = createProgressTracker({ emit: r.emit, counts: { pokedex: 1, docs: 1 }, floor: 2 });
        expect(r.seen).toHaveLength(0);
        await t.run('pokedex', 'Pokédex', async () => {});
        expect(r.seen[0].pct).toBe(2);                       // the run starts where the download left off
        expect(r.pcts().at(-1)).toBeGreaterThan(60);
        await t.run('docs', 'Docs', async () => {});
        t.finish('Done');
        expect(r.pcts().at(-1)).toBe(100);
    });

    test('flush is awaited after each completed unit so a streaming caller can push it', async () => {
        const order = [];
        const t = createProgressTracker({
            emit: (pct) => order.push(`emit:${pct}`),
            flush: async () => { order.push('flush'); },
            counts: { pokedex: 1, docs: 1 },
        });
        await t.run('pokedex', 'Pokédex', async () => { order.push('work'); });
        expect(order).toEqual(['emit:0', 'work', `emit:${Math.round(WEIGHTS.pokedex / (WEIGHTS.pokedex + WEIGHTS.docs) * 100)}`, 'flush']);
    });

    test('the run function receives the tracker result and any thrown error propagates', async () => {
        const t = createProgressTracker({ emit: () => {}, counts: { pokedex: 1 } });
        await expect(t.run('pokedex', 'Pokédex', async () => 42)).resolves.toBe(42);
        const t2 = createProgressTracker({ emit: () => {}, counts: { pokedex: 1 } });
        await expect(t2.run('pokedex', 'Pokédex', async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    });

    test('an unknown kind is a programming error, not a silently free step', async () => {
        const t = createProgressTracker({ emit: () => {}, counts: { pokedex: 1 } });
        await expect(t.run('nope', 'Nope', async () => {})).rejects.toThrow(/nope/);
    });
});
