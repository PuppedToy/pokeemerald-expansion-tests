'use strict';

// T-276 — the generation progress model: the single home of what each unit of work COSTS and of
// the arithmetic that turns work done into a percentage.
//
// The bar used to count milestones and give each one the same weight, which is why it jumped from
// 20% to 80% in a blink and then stalled: those three milestones are 0.3% of a run, while the two
// at the ends of the bar are ~100% of it. Here the percentage is a weighted fraction instead, and
// the two expensive units report progress from inside their own loops (`onProgress`), so the bar
// keeps moving while they run.
//
// The weights are wall-clock milliseconds measured over the real pipeline (see tasks/T-276 for the
// table and the method). Only their RATIOS matter — the generation runs on the client's machine, so
// the absolute numbers cannot predict anything and this model deliberately produces no ETA.
const WEIGHTS = {
    pokedex:  19500,   // dominated by the per-level contextual rating pass
    trainers:    16,   // trainer TEMPLATES only; resolving the teams is part of `docs`
    starters:     9,
    wild:        47,
    docs:      9100,   // town trades + per-trainer team resolution (writerDocs)
};

// Where the Pokédex weight goes internally, as fractions of it. Lets runPokedexModule report honest
// sub-progress through its long loops. The remainder (parsing, cloning, TMs, teachables, best-evo,
// the special cases) is the small unreported rest.
const POKEDEX_PASSES = {
    rate:       0.058,   // absolute singles+doubles rating of every species (~1.1 s)
    rebalance:  0.021,   // mutation pass + re-rating the species it changed (~0.4 s)
    contextual: 0.892,   // per-level-cap contextual ratings (~17.4 s — the biggest thing in a run)
};

// Share of the docs unit spent resolving trainer teams (8.5 s of its 8.8 s). The rest is the town
// trades that precede it and the encounter/redaction tail that follows.
const DOCS_TRAINERS_SHARE = 0.95;

const clamp01 = (n) => (n <= 0 ? 0 : n >= 1 ? 1 : n);

// A reporter for one long loop inside a unit of work: call it with the index just completed and it
// reports `base + span * done/total` — but only every ~1/`steps` of the loop, because a percentage
// that changes 1200 times is no more informative than one that changes 50 times, and each report
// crosses a postMessage boundary. Returns a no-op when nobody is listening or there is nothing to do.
function passReporter(onProgress, { total, base = 0, span = 1, steps = 50 }) {
    if (!onProgress || !total) return () => {};
    const every = Math.max(1, Math.ceil(total / steps));
    return (index) => {
        const done = index + 1;
        if (done % every === 0 || done === total) onProgress(base + span * (done / total));
    };
}

// Build a progress tracker for one run.
//
//   emit(pct, label)  where the percentage goes (postMessage / SSE / nothing)
//   flush()           optional async yield awaited after each completed unit, so a streaming
//                     transport can push the event before the next synchronous unit starts
//   counts            how many units of each kind this run will do, e.g. { pokedex: 1, docs: 4 }.
//                     This is what makes the weighting adapt to the run: a Pokédex shared across
//                     4 ROMs stops being "20% of the bar" and becomes the share it really is.
//   floor             percentage already spent before the run began (the browser's base-data
//                     download), so generation continues the scale instead of rewinding to 0.
function createProgressTracker({ emit = () => {}, flush = null, counts = {}, floor = 0 } = {}) {
    const total = Object.keys(WEIGHTS).reduce((sum, kind) => sum + WEIGHTS[kind] * (counts[kind] || 0), 0);
    let done = 0;          // weight of the units already finished
    let lastPct = -1;
    let lastLabel = null;

    // Emit only when the user would see something new, and never let the bar go backwards: sub-
    // progress arrives from independent loops, and 100% belongs to finish() alone.
    const show = (fraction, label) => {
        const pct = Math.min(99, Math.round(floor + clamp01(fraction) * (100 - floor)));
        if (pct < lastPct || (pct === lastPct && label === lastLabel)) return;
        lastPct = pct;
        lastLabel = label;
        emit(pct, label);
    };

    return {
        // Run one unit of work. Announces itself at the percentage the previous units reached, hands
        // the work an onProgress(fraction 0..1) it can call as often as it likes, and books its weight
        // when it completes.
        async run(kind, label, fn) {
            const weight = WEIGHTS[kind];
            if (weight === undefined) throw new Error(`Unknown progress unit kind: ${kind}`);
            show(total ? done / total : 0, label);
            const result = await fn((fraction) => show(total ? (done + weight * clamp01(fraction)) / total : 0, label));
            done = Math.min(done + weight, total);
            show(total ? done / total : 0, label);
            if (flush) await flush();
            return result;
        },

        // The run itself is over (bundle assembled) — the only place 100% comes from.
        finish(label = 'Done') {
            lastPct = 100;
            lastLabel = label;
            emit(100, label);
        },
    };
}

module.exports = { WEIGHTS, POKEDEX_PASSES, DOCS_TRAINERS_SHARE, passReporter, createProgressTracker };
