// T-276 — the display side of the generation progress bar.
//
// The percentages themselves come from the worker, which weights every unit of work by what it
// actually costs (randomizer/progress.js). This module owns only how those numbers reach the screen:
// it keeps the bar monotonic, repaints only when something changed, and eases forward a little
// between reports so a gap of a few hundred milliseconds doesn't read as a frozen bar.
//
// It used to do much more than that: the animation crawled up to 18 points above the last reported
// value, because the old milestone model left the bar parked at 20% for ~19 s and at 80% for ~9 s.
// That was invented progress. With honest reports the smoothing can be a hair wide — and must be,
// or the bar is lying again.

// Points the smoothing may add on top of the last reported percentage.
export const CRAWL_LOOKAHEAD = 2;
// Points added per tick (app.js ticks every 250 ms, so ~1 point/second).
export const CRAWL_STEP = 0.25;
// The bar can only be completed by a report, never by smoothing.
export const CRAWL_CEILING = 99;

// render({ pct, label }) paints one frame. `pct` is a whole number; `label` is the current step.
export function createProgressDisplay({ render, lookahead = CRAWL_LOOKAHEAD, step = CRAWL_STEP, ceiling = CRAWL_CEILING }) {
    let reported = 0;   // the highest percentage the run has reported
    let shown = 0;      // what the bar is showing (fractional; the smoothing lives here)
    let label = '';
    let painted = null; // last frame painted, so an unchanged frame costs nothing

    const paint = () => {
        const pct = Math.round(shown);
        if (painted && painted.pct === pct && painted.label === label) return;
        painted = { pct, label };
        render(painted);
    };

    return {
        // A progress event from the worker.
        report(pct, step) {
            if (typeof pct === 'number' && pct > reported) reported = pct;
            if (reported > shown) shown = reported;
            if (step != null) label = step;
            paint();
        },

        // One animation frame: ease towards, but never past, what has been reported.
        tick() {
            const limit = Math.min(reported + lookahead, ceiling);
            if (shown >= limit) return;
            shown = Math.min(shown + step, limit);
            paint();
        },

        // Back to the start of the bar for a new run.
        reset(startLabel = '') {
            reported = 0;
            shown = 0;
            label = startLabel;
            painted = null;
            paint();
        },
    };
}
