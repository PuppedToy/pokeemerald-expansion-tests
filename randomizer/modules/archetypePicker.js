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
const {
    WEATHER_SUBTYPE_BY_SETTER, SETTERS_BY_SUBTYPE, WEATHER_REQUIRED_ABUSERS, WEATHER_ABUSE_THRESHOLD, WX_ABUSE_RATING,
} = require('./weatherConstants');
const { weatherAbuseScore, weatherAbuseRating, weatherAbuseBreakdown, GIMMICK_SPEC } = require('./gimmickPlan');

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
const TR_SLOW_SPEED = 60;                 // T-124 — base Speed at/below which a mon is a Trick Room abuser
const TR_SLOW_FACTOR = 4;                 // how hard Trick Room pulls the pick toward slow mons
const WEATHER_ABUSER_FACTOR = 4;          // T-132 — how hard weather pulls the pick toward abusers (once a setter is down)

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
        const seed = (context && context.archetypeSeed) || null;
        if (!model || soph < BIAS_MIN_SOPH) return sample(candidates);

        // T-137 — Wattson's electric terrain is now the `electric_terrain` GIMMICK (setter + abusers, handled
        // in the gimmick block below), not a manual "prefer Electric-types" overlay: as a gym leader his pool
        // is already Electric-monotype-restricted, so the overlay was redundant.

        // The resolver's team holds newTeamMember wrappers ({ pokemon, ... }); detectors read a poke
        // shape. Normalise to the underlying poke (raw pokes — as in unit tests — pass through), so
        // team detection uses the SAME basis (species potential) as candidate scoring.
        const team = ((context && context.team) || []).map(m => (m && m.pokemon) ? m.pokemon : m);
        const identity = resolveIdentity(team, model, ctx, seed);

        let biased = false;
        let weights = candidates.map(() => 1);
        if (identity) {
            const structure = combinedStructure(model, identity.baseId, identity.gimmickIds);
            const counts = identity.counts;
            weights = candidates.map(c => {
                const s = scoreCandidate(c, counts, structure, ctx);
                if (s > 0) biased = true;
                return 1 + soph * BIAS_STRENGTH * s;
            });
        }
        // T-132 — weather. The gimmick has TWO make-or-break components — a setter and 2 abusers — that a
        // soft weight can't secure (a ×N weight is diluted to ~nothing across a 60-120-mon tier pool), so
        // BOTH are HARD preferences (mirroring the electric-terrain filter), applied greedily as the slots
        // that offer them come up:
        //   1. SETTER first — as soon as a slot's pool offers a setter of the subtype and the team has none,
        //      restrict the pick to setters (weighted by archetype fit among them, so it stays coherent).
        //   2. Then ABUSERS — until the team holds WEATHER_REQUIRED_ABUSERS reliable abusers, restrict the
        //      pick to reliable-abuser candidates (also applied on the slots BEFORE the setter lands, since
        //      setters live in the high-tier slots and the early slots would otherwise build no abusers).
        // Abuser membership is the SHARED weatherAbuseScore (same definition the success condition and the
        // decision-log use — one source of truth). A "reliable" abuser scores ≥ WEATHER_ABUSE_THRESHOLD
        // (an abuser ability, or a boosted TYPE — offensive Water/Fire attacker, or defensive Rock/Ice);
        // a synergy-move-only mon scores below it, so it's a SOFT bias only. Every branch makes exactly one
        // rng draw → the per-slot RNG stream is undisturbed.
        if (identity && (identity.gimmickIds || []).includes('weather')) {
            const teamMembers = (context && context.team) || [];
            const subtype = (seed && seed.weather)
                || teamMembers.map(m => WEATHER_SUBTYPE_BY_SETTER[(m.ability || '').toUpperCase()]).find(Boolean);
            if (subtype) {
                const setterAbils = SETTERS_BY_SUBTYPE[subtype] || [];
                const teamHasSetter = teamMembers.some(m => WEATHER_SUBTYPE_BY_SETTER[(m.ability || '').toUpperCase()] === subtype);
                // T-132 — abuse-only (a tag partner abusing an ALLY's weather): NO setter of its own, so
                // skip the setter hard-pick entirely and go straight to stacking abusers.
                if (!teamHasSetter && !(seed && seed.abuseOnly)) {
                    const setterIdx = [];
                    candidates.forEach((c, i) => { if ((c.parsedAbilities || []).some(a => setterAbils.includes(a))) setterIdx.push(i); });
                    if (setterIdx.length) return weightedSampleOne(setterIdx.map(i => candidates[i]), setterIdx.map(i => weights[i]));
                }
                // DEDICATED abusers already picked — the "pick 2 good ranked abusers" budget counts only
                // freely-chosen abusers, NOT the forced picks (the favourite ace, or the setter, which is
                // hard-picked to establish the weather). So a trainer whose favourite/setter happen to be
                // abusers (Maxie: Camerupt + Torkoal) STILL ranks 2 real abusers for its free slots (T-135).
                const teamAbusers = teamMembers.filter(m =>
                    !m.__favourite
                    && !WEATHER_SUBTYPE_BY_SETTER[(m.ability || '').toUpperCase()]
                    && weatherAbuseScore(m, subtype) >= WEATHER_ABUSE_THRESHOLD).length;
                const reliableIdx = [], softIdx = [];
                candidates.forEach((c, i) => {
                    const s = weatherAbuseScore(c, subtype);
                    if (s >= WEATHER_ABUSE_THRESHOLD) reliableIdx.push(i);
                    if (s > 0) softIdx.push(i);
                });
                if (teamAbusers < WEATHER_REQUIRED_ABUSERS && reliableIdx.length) {
                    // T-135 — rank the eligible abusers by the DETAILED weather-abuse rating (which ability
                    // exploits this weather best, given the mon's stats), and let sophistication pull the pick
                    // toward the TOP (endgame → real ability-abusers; early game ≈ uniform among eligibles).
                    const cands = reliableIdx.map(i => candidates[i]);
                    const breakdowns = cands.map(c => weatherAbuseBreakdown(c, subtype));
                    const maxR = Math.max(...breakdowns.map(b => b.total), 1e-6);
                    // weight = (rating/max)^(soph × sharpness): endgame → top-rated abusers dominate; early
                    // game (soph→0) → exponent→0 → all weights→1 (near-uniform, byte-identical-ish).
                    const exp = soph * WX_ABUSE_RATING.rankSharpness;
                    const rankWeights = breakdowns.map(b => Math.pow(Math.max(b.total, 0) / maxR, exp));
                    const picked = weightedSampleOne(cands, rankWeights);
                    // T-135 audit — record this abuser slot's ranking (top few + score breakdown + the pick)
                    // for the decision log, so the choice is visible/auditable.
                    if (context && context.weatherPicks) {
                        const sorted = cands
                            .map((c, k) => ({ id: c.id, total: breakdowns[k].total, parts: breakdowns[k].parts }))
                            .sort((a, b) => b.total - a.total);
                        const shown = sorted.slice(0, 6);
                        // Always surface the PICKED mon + its rank, even when the weighted draw landed it
                        // below the shown top-N (so the log exposes a pick that skipped higher-rated abusers).
                        const pickedRank = sorted.findIndex(e => e.id === picked.id);
                        if (pickedRank >= shown.length) shown.push({ ...sorted[pickedRank], rank: pickedRank + 1 });
                        context.weatherPicks.push({ subtype, pickedId: picked.id, nEligible: sorted.length, pullExp: Math.round(exp * 100) / 100, ranked: shown });
                    }
                    return picked;
                }
                softIdx.forEach(i => { weights[i] *= WEATHER_ABUSER_FACTOR; biased = true; });
            }
        }
        // T-137 — electric terrain / trick room: the SAME "setter + 2 abusers" build as weather, but
        // single-subtype. Driven by GIMMICK_SPEC (per-gimmick setter detection / abuse score / rating).
        // Electric terrain hard-picks an ability-setter (Electric Surge / Hadron Engine); Trick Room has no
        // ability-setter (the move is retrofit by the resolver), so it only ranks slow-strong abusers.
        const gid = identity && (identity.gimmickIds || []).find(g => GIMMICK_SPEC[g]);
        if (gid) {
            const spec = GIMMICK_SPEC[gid];
            const teamMembers = (context && context.team) || [];
            const abuseOnly = !!(seed && seed.abuseOnly);
            const teamHasSetter = teamMembers.some(m => spec.isSetter(m));
            if (!teamHasSetter && !abuseOnly && spec.setterAbilities.length) {
                const setterIdx = [];
                candidates.forEach((c, i) => { if ((c.parsedAbilities || []).some(a => spec.setterAbilities.includes(a))) setterIdx.push(i); });
                if (setterIdx.length) return weightedSampleOne(setterIdx.map(i => candidates[i]), setterIdx.map(i => weights[i]));
            }
            // Count DEDICATED abusers (exclude the favourite ace + the setter), then rank the free slots —
            // same "pick N good ranked abusers" budget as weather (T-135). T-138 — a FULL room targets 4.
            const abuserTarget = (gid === 'trick_room' && seed && seed.roomStyle === 'full') ? 4 : WEATHER_REQUIRED_ABUSERS;
            const teamAbusers = teamMembers.filter(m => !m.__favourite && !spec.isSetter(m) && spec.score(m) >= WEATHER_ABUSE_THRESHOLD).length;
            const reliableIdx = [], softIdx = [];
            candidates.forEach((c, i) => { const s = spec.score(c); if (s >= WEATHER_ABUSE_THRESHOLD) reliableIdx.push(i); if (s > 0) softIdx.push(i); });
            if (teamAbusers < abuserTarget && reliableIdx.length) {
                const cands = reliableIdx.map(i => candidates[i]);
                const breakdowns = cands.map(c => spec.breakdown(c));
                const maxR = Math.max(...breakdowns.map(b => b.total), 1e-6);
                const exp = soph * WX_ABUSE_RATING.rankSharpness;
                const rankWeights = breakdowns.map(b => Math.pow(Math.max(b.total, 0) / maxR, exp));
                const picked = weightedSampleOne(cands, rankWeights);
                if (context && context.weatherPicks) {
                    const sorted = cands.map((c, k) => ({ id: c.id, total: breakdowns[k].total, parts: breakdowns[k].parts })).sort((a, b) => b.total - a.total);
                    const shown = sorted.slice(0, 6);
                    const pickedRank = sorted.findIndex(e => e.id === picked.id);
                    if (pickedRank >= shown.length) shown.push({ ...sorted[pickedRank], rank: pickedRank + 1 });
                    context.weatherPicks.push({ subtype: spec.label, pickedId: picked.id, nEligible: sorted.length, pullExp: Math.round(exp * 100) / 100, ranked: shown });
                }
                return picked;
            }
            softIdx.forEach(i => { weights[i] *= WEATHER_ABUSER_FACTOR; biased = true; });
            // Trick Room additionally prefers SLOW mons generally (they move first under TR), not just the
            // slow-strong abusers — mirrors the old T-124 slow-mon bias.
            if (gid === 'trick_room') {
                candidates.forEach((c, i) => { if ((c.baseSpeed || 999) <= TR_SLOW_SPEED) { weights[i] *= TR_SLOW_FACTOR; biased = true; } });
            }
        }
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
