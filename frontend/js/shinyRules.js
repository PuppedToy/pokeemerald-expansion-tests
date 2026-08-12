// T-274 — the shiny-rule maths, for the browser. **Mirror** of `randomizer/shinyRules.js`, which is the
// single home of these numbers and the one the ROM is built from; a browser ES module cannot require the
// pipeline's CommonJS, so this file restates it and `frontend/__tests__/shiny-rules-parity.test.js` sweeps
// both implementations to prove they never drift. Change the pipeline module first, then this one.
//
// Used by the config form to label the Shiny Pokémon panel ("1 in 205") and by app.js to summarise a run.

const NUM_STATS = 6;
export const MAX_PER_STAT_IVS = 31;
export const MAX_IV_TOTAL = NUM_STATS * MAX_PER_STAT_IVS;   // 186
export const SHINY_ODDS_DENOMINATOR = 65536;

export const SHINY_DEFAULTS = {
    shinyByQuality: true,
    shinyIvThreshold: 150,
    shinyChancePercent: 0.0122,   // 8/65536 — gen 3's own 1 in 8192
    starterPerfectIvs: 3,
    starterMinIvTotal: 150,
};

const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

function numberOr(value, fallback) {
    if (typeof value !== 'number' && typeof value !== 'string') return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

export function oddsFromPercent(percent) {
    const pct = numberOr(percent, SHINY_DEFAULTS.shinyChancePercent);
    return clamp(Math.round((pct / 100) * SHINY_ODDS_DENOMINATOR), 0, SHINY_ODDS_DENOMINATOR);
}

export function percentFromOdds(odds) {
    return (clamp(numberOr(odds, 0), 0, SHINY_ODDS_DENOMINATOR) / SHINY_ODDS_DENOMINATOR) * 100;
}

const ivTotalCounts = (() => {
    let dist = [1];
    for (let stat = 0; stat < NUM_STATS; stat++) {
        const next = new Array(dist.length + MAX_PER_STAT_IVS).fill(0);
        for (let total = 0; total < dist.length; total++) {
            const ways = dist[total];
            if (!ways) continue;
            for (let iv = 0; iv <= MAX_PER_STAT_IVS; iv++) next[total + iv] += ways;
        }
        dist = next;
    }
    return dist;
})();

const IV_COMBINATIONS = Math.pow(MAX_PER_STAT_IVS + 1, NUM_STATS);

const ivTotalTailCounts = (() => {
    const tail = new Array(ivTotalCounts.length + 1).fill(0);
    for (let total = ivTotalCounts.length - 1; total >= 0; total--)
        tail[total] = tail[total + 1] + ivTotalCounts[total];
    return tail;
})();

export function ivTotalAtLeastProbability(threshold) {
    const t = Math.round(numberOr(threshold, SHINY_DEFAULTS.shinyIvThreshold));
    if (t <= 0) return 1;
    if (t > MAX_IV_TOTAL) return 0;
    return ivTotalTailCounts[t] / IV_COMBINATIONS;
}

export function normalizeShinyRules(cfg) {
    const c = cfg || {};
    const ivTotal = (value, fallback) => clamp(Math.round(numberOr(value, fallback)), 0, MAX_IV_TOTAL);
    return {
        shinyByQuality: c.shinyByQuality !== false,
        shinyIvThreshold: ivTotal(c.shinyIvThreshold, SHINY_DEFAULTS.shinyIvThreshold),
        shinyOdds: oddsFromPercent(c.shinyChancePercent),
        starterPerfectIvs: clamp(Math.round(numberOr(c.starterPerfectIvs, SHINY_DEFAULTS.starterPerfectIvs)), 0, NUM_STATS),
        starterMinIvTotal: ivTotal(c.starterMinIvTotal, SHINY_DEFAULTS.starterMinIvTotal),
    };
}

export function shinyProbability(cfg) {
    const rules = normalizeShinyRules(cfg);
    return rules.shinyByQuality
        ? ivTotalAtLeastProbability(rules.shinyIvThreshold)
        : rules.shinyOdds / SHINY_ODDS_DENOMINATOR;
}

export function groupDigits(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function oneInText(probability) {
    const p = numberOr(probability, 0);
    if (p <= 0) return 'never';
    if (p >= 1) return 'always';
    return `1 in ${groupDigits(Math.round(1 / p))}`;
}

export function shinyChanceText(cfg) {
    return oneInText(shinyProbability(cfg));
}

/** The compact rule a generated doc carries (the viewer's `shinyRule` global) — see the CJS original. */
export function docsShinyRule(cfg) {
    const rules = normalizeShinyRules(cfg);
    return {
        byQuality: rules.shinyByQuality,
        ivThreshold: rules.shinyIvThreshold,
        chanceText: shinyChanceText(cfg),
    };
}
