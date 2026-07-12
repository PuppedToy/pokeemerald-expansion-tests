'use strict';

// T-107 (107c) — archetype-biased candidate picker (the "weighted fill").
//
// `makeArchetypePicker` returns a `pickCandidate(candidates)` that the tier-slot chooser
// (trainerSelector) calls instead of a uniform `sample` for its NON-pickBest picks. It biases the
// pick toward the archetype identity the partial team has emerged into (107b), with strength scaled
// by the trainer's sophistication (T-105). Crucially it DEGRADES TO PLAIN `sample` — byte-identical to
// the un-biased engine — whenever any of these hold, so early/incoherent teams are unchanged and the
// "singles not worse" gate holds by construction:
//   • fewer than 2 candidates, or no archetype model,
//   • sophistication below BIAS_MIN_SOPH (early game),
//   • no identity has emerged yet (top base confidence < IDENTITY_FLOOR),
//   • no candidate actually improves fit.
// It also preserves determinism: exactly ONE rng draw per pick (same as `sample`), so it never shifts
// the per-slot RNG stream — only which candidate a biased slot lands on changes.

const rng = require('../rng');
const { sample } = require('./utils');
const { teamFeatureCounts, crystallize, combinedStructure, scoreCandidate } = require('./archetypeFit');

const BIAS_MIN_SOPH = 0.15;   // below this sophistication, no bias (early-game = "a pile of mons")
const IDENTITY_FIT = 0.5;     // the top base archetype recipe must fit this well before biasing (T-118)
const GIMMICK_FIT = 0.8;      // a gimmick engine biases structure only once its recipe fits this well (T-118: 0.6→0.7→0.8, gimmicks were too frequent)
const BIAS_STRENGTH = 2.0;    // how hard fit pulls the pick (multiplied by sophistication)

// Single-draw weighted pick — one rng.random(), matching sample()'s RNG consumption. Falls back to
// sample() for degenerate (non-positive-total) weights.
function weightedSampleOne(items, weights) {
    let total = 0;
    for (const w of weights) total += w;
    if (!(total > 0)) return sample(items);
    let r = rng.random() * total;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r < 0) return items[i];
    }
    return items[items.length - 1];
}

// The team's effective identity, shared by the fill (107c) and the refinement (107d):
//   • the EMERGENT identity once the top base archetype's confidence reaches IDENTITY_FLOOR, else
//   • the SEED (T-107 107e — an optional { base, gimmicks } lean the trainer declared), else
//   • null (no identity → callers fall back to unbiased behaviour).
// `team` is already normalised to poke shape. Returns { baseId, gimmickIds, counts, source } | null.
const LAST_RESORT_BASE = 'hyper_offense'; // T-123 — hyper's recipe is easy to satisfy → it over-attracts
const HYPER_YIELD_MARGIN = 0.25;          // hyper yields only to a base fitting within this of its fit

function resolveIdentity(team, model, ctx = {}, seed = null) {
    const cryst = crystallize(team, model, ctx);
    // T-123 — hyper_offense is the LAST-RESORT base: if it tops the fit but another base also clears
    // IDENTITY_FIT, prefer that other base; only fall into hyper when nothing else fits.
    let base = cryst.base[0];
    if (base && base.id === LAST_RESORT_BASE) {
        // Yield to another base only if it fits reasonably CLOSE to hyper's fit — a team that is
        // genuinely all-out (hyper fits far better than anything else) stays hyper.
        const alt = cryst.base.find(b => b.id !== LAST_RESORT_BASE && b.fit >= IDENTITY_FIT && b.fit >= base.fit - HYPER_YIELD_MARGIN);
        if (alt) base = alt;
    }
    const fit = base ? base.fit : 0; // chosen base-recipe fit (also surfaced to the T-117 audit)
    let baseId, source;
    if (base && base.fit >= IDENTITY_FIT) { baseId = base.id; source = 'emergent'; }
    else if (seed && seed.base) { baseId = seed.base; source = 'seed'; }
    else return null;

    // Gimmicks: a SEEDED gimmick is the trainer's INTENTIONAL identity and persists throughout (T-124/
    // T-126 — so a weather-seeded trainer keeps building weather even after its base crystallises).
    // Otherwise take the single best-fitting emergent gimmick engine (T-118 cap — no incoherent stacks).
    let gimmickIds;
    if (seed && seed.gimmicks && seed.gimmicks.length) {
        gimmickIds = seed.gimmicks.slice(0, 1);
    } else {
        const topGimmick = cryst.gimmicks.find(g => g.fit >= GIMMICK_FIT);
        gimmickIds = topGimmick ? [topGimmick.id] : [];
    }
    return { baseId, gimmickIds, counts: cryst.counts, source, confidence: fit };
}

// Build the picker for one trainer. `context` is read by reference (its `team` grows, `sophistication`
// and optional `archetypeSeed` are set per trainer). `ctx` carries the detector context (e.g. `{ moves }`).
function makeArchetypePicker({ model, context, ctx = {} }) {
    return function pickCandidate(candidates) {
        if (!Array.isArray(candidates) || candidates.length < 2) return sample(candidates);
        const soph = (context && context.sophistication) || 0;
        if (!model || soph < BIAS_MIN_SOPH) return sample(candidates);

        // The resolver's team holds newTeamMember wrappers ({ pokemon, ... }); detectors read a poke
        // shape. Normalise to the underlying poke (raw pokes — as in unit tests — pass through), so
        // team detection uses the SAME basis (species potential) as candidate scoring.
        const team = ((context && context.team) || []).map(m => (m && m.pokemon) ? m.pokemon : m);
        const identity = resolveIdentity(team, model, ctx, (context && context.archetypeSeed) || null);
        if (!identity) return sample(candidates); // no identity yet (emergent or seeded)

        const structure = combinedStructure(model, identity.baseId, identity.gimmickIds);
        const counts = identity.counts;

        let biased = false;
        const weights = candidates.map(c => {
            const s = scoreCandidate(c, counts, structure, ctx);
            if (s > 0) biased = true;
            return 1 + soph * BIAS_STRENGTH * s;
        });
        if (!biased) return sample(candidates); // nothing to pull toward → byte-identical
        return weightedSampleOne(candidates, weights);
    };
}

// exported for reuse/inspection
module.exports = {
    makeArchetypePicker,
    resolveIdentity,
    weightedSampleOne,
    teamFeatureCounts,
    BIAS_MIN_SOPH,
    IDENTITY_FIT,
    GIMMICK_FIT,
    BIAS_STRENGTH,
};
