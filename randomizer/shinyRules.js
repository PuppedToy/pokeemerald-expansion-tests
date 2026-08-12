'use strict';

// T-274 — the single home of the numbers behind the shiny rule. The run picks one of two systems:
//
//   • **quality** (the default, introduced by 5d98097): a Pokémon is shiny iff its six IVs sum to at least
//     `shinyIvThreshold`. Deterministic — the mon's stats decide, not luck.
//   • **classic**: gen 3's own lottery, `GET_SHINY_VALUE(otId, personality) < shinyOdds` out of 65536.
//
// The frontend expresses the classic system as a plain percentage (what a player can reason about); the
// engine can only compare against an integer out of 65536, so `oddsFromPercent` is where the two meet —
// and `shinyChanceText` is what turns either system back into the "1 in N" every human actually wants.
//
// Consumers: shinyWriter.js (compile path), the `dataDrivenAndToggles` injector module (inject path), the
// docs viewer injection (writer.js / frontend/js/app.js) and — mirrored as ESM, since a browser module
// cannot require CommonJS — frontend/js/shinyRules.js, kept honest by a parity test that sweeps both.
//
// Pure: no I/O, no RNG, no game data. Nothing here draws from the seeded stream (rng.js) — these values
// are ROM behaviour carried in `bundle.config`, exactly like the T-257 league rules.

// The engine's own bounds (include/constants/pokemon.h: MAX_PER_STAT_IVS 31, NUM_STATS 6).
const NUM_STATS = 6;
const MAX_PER_STAT_IVS = 31;
const MAX_IV_TOTAL = NUM_STATS * MAX_PER_STAT_IVS;   // 186
const SHINY_ODDS_DENOMINATOR = 65536;                // GET_SHINY_VALUE is a 16-bit xor fold

const SHINY_DEFAULTS = {
    shinyByQuality: true,       // quality (IV total) or classic (luck)
    shinyIvThreshold: 150,      // quality mode: shiny at this IV total or above (the value 5d98097 shipped)
    shinyChancePercent: 0.0122, // classic mode: % per encounter — 0.0122% ⇒ 8/65536 ⇒ gen 3's 1 in 8192
    starterPerfectIvs: 3,       // starter: this many IVs forced to 31 (what CB2_GiveStarter already did)
    starterMinIvTotal: 150,     // starter: then top the rest up until the total reaches this
};

const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);

/**
 * A finite number from a number or a numeric string, or `fallback` for anything else. `null` / `''` are
 * junk here rather than 0: an older bundle that never carried the field must land on the default, not on
 * "never shiny".
 */
function numberOr(value, fallback) {
    if (typeof value !== 'number' && typeof value !== 'string') return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * A percentage as the engine's out-of-65536 threshold. Rounds to the nearest representable step, so a
 * percentage finer than 1/65536 (≈0.0015%) lands on 0 — never shiny, which `shinyChanceText` says out loud
 * instead of silently promoting it to the rarest non-zero value.
 * @param {number} percent 0..100
 * @returns {number} integer 0..65536
 */
function oddsFromPercent(percent) {
    const pct = numberOr(percent, SHINY_DEFAULTS.shinyChancePercent);
    return clamp(Math.round((pct / 100) * SHINY_ODDS_DENOMINATOR), 0, SHINY_ODDS_DENOMINATOR);
}

/** The inverse, for showing a stored odds value back as a percentage. */
function percentFromOdds(odds) {
    return (clamp(numberOr(odds, 0), 0, SHINY_ODDS_DENOMINATOR) / SHINY_ODDS_DENOMINATOR) * 100;
}

// How many of the 32^6 IV combinations reach each possible total, by convolution — built once.
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
    return dist;                                     // index = IV total (0..186), value = combinations
})();

const IV_COMBINATIONS = Math.pow(MAX_PER_STAT_IVS + 1, NUM_STATS);   // 32^6

// Cumulative tail: how many combinations reach *at least* each total. Exact integers throughout.
const ivTotalTailCounts = (() => {
    const tail = new Array(ivTotalCounts.length + 1).fill(0);
    for (let total = ivTotalCounts.length - 1; total >= 0; total--)
        tail[total] = tail[total + 1] + ivTotalCounts[total];
    return tail;
})();

/**
 * The exact chance that a Pokémon rolled with uniform random IVs reaches an IV total — i.e. how often
 * quality mode makes an ordinary wild encounter shiny. (Mons with forced perfect IVs — the starter, the
 * static encounters, trade gifts — are guaranteed by construction and are not what this describes.)
 * @param {number} threshold IV total, 0..186
 * @returns {number} 0..1
 */
function ivTotalAtLeastProbability(threshold) {
    const t = Math.round(numberOr(threshold, SHINY_DEFAULTS.shinyIvThreshold));
    if (t <= 0) return 1;
    if (t > MAX_IV_TOTAL) return 0;
    return ivTotalTailCounts[t] / IV_COMBINATIONS;
}

/**
 * Resolve a run config into exactly the five values the ROM carries, clamped to what the engine can
 * represent. Both tunables always resolve, whatever the mode: flipping the toggle back must not lose the
 * other system's tuning. An absent or junk config lands on the committed defaults.
 * @param {object|null|undefined} cfg
 * @returns {{shinyByQuality: boolean, shinyIvThreshold: number, shinyOdds: number,
 *            starterPerfectIvs: number, starterMinIvTotal: number}}
 */
function normalizeShinyRules(cfg) {
    const c = cfg || {};
    const ivTotal = (value, fallback) =>
        clamp(Math.round(numberOr(value, fallback)), 0, MAX_IV_TOTAL);
    return {
        shinyByQuality: c.shinyByQuality !== false,
        shinyIvThreshold: ivTotal(c.shinyIvThreshold, SHINY_DEFAULTS.shinyIvThreshold),
        shinyOdds: oddsFromPercent(c.shinyChancePercent),
        starterPerfectIvs: clamp(Math.round(numberOr(c.starterPerfectIvs, SHINY_DEFAULTS.starterPerfectIvs)), 0, NUM_STATS),
        starterMinIvTotal: ivTotal(c.starterMinIvTotal, SHINY_DEFAULTS.starterMinIvTotal),
    };
}

/** The chance a wild Pokémon of this run is shiny, under whichever system the config picked. */
function shinyProbability(cfg) {
    const rules = normalizeShinyRules(cfg);
    return rules.shinyByQuality
        ? ivTotalAtLeastProbability(rules.shinyIvThreshold)
        : rules.shinyOdds / SHINY_ODDS_DENOMINATOR;
}

/** 1234567 → "1,234,567" (locale-independent, so the tests and the ROM docs agree everywhere). */
function groupDigits(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** A probability in human terms: "1 in 205", or the words for the two certainties. */
function oneInText(probability) {
    const p = numberOr(probability, 0);
    if (p <= 0) return 'never';
    if (p >= 1) return 'always';
    return `1 in ${groupDigits(Math.round(1 / p))}`;
}

/** The "1 in N" a run's shiny rule works out to — the line the config form and the docs show. */
function shinyChanceText(cfg) {
    return oneInText(shinyProbability(cfg));
}

/**
 * The compact rule a generated doc carries (the viewer's `shinyRule` global, injected by writer.js and
 * frontend/js/app.js). The viewer has exactly one question to answer — "does this IV line mean shiny?" —
 * so it gets the mode, the threshold and the human odds rather than the whole config. In classic mode
 * shininess is luck the docs cannot know, which is why `byQuality` travels with the threshold.
 */
function docsShinyRule(cfg) {
    const rules = normalizeShinyRules(cfg);
    return {
        byQuality: rules.shinyByQuality,
        ivThreshold: rules.shinyIvThreshold,
        chanceText: shinyChanceText(cfg),
    };
}

module.exports = {
    NUM_STATS,
    MAX_PER_STAT_IVS,
    MAX_IV_TOTAL,
    SHINY_ODDS_DENOMINATOR,
    SHINY_DEFAULTS,
    oddsFromPercent,
    percentFromOdds,
    ivTotalAtLeastProbability,
    normalizeShinyRules,
    shinyProbability,
    oneInText,
    shinyChanceText,
    docsShinyRule,
    groupDigits,
};
