'use strict';

// T-107 (107b) — archetype-fit scoring + emergent crystallization for the teambuilding engine.
//
// Pure, read-only. Builds on the 107a feature detectors and the archetype models
// (data/archetypes/{singles,doubles}.json):
//   - `crystallize` reads a (partial or full) team against every archetype/gimmick `entry` to detect
//     which identity it has "fallen into" (with a fractional confidence for partial teams).
//   - `structureFit` / `scoreCandidate` score how well a team / a candidate mon fits a target
//     identity's `structure`, driving completion (107d) and the weighted fill (107c).
// Nothing here mutates its inputs or touches generation output; wiring happens in 107c.

const { detectFeatures } = require('./featureDetectors');

// Aggregate feature tags across a team: { featureTag: count }. A mon contributes to every tag it has.
function teamFeatureCounts(team, ctx = {}) {
    const counts = {};
    for (const mon of team || []) {
        for (const f of detectFeatures(mon, ctx)) counts[f] = (counts[f] || 0) + 1;
    }
    return counts;
}

// AND across clauses: every entry clause's feature count must reach its `min`.
function matchesEntry(counts, entry) {
    return (entry || []).every(c => (counts[c.feature] || 0) >= c.min);
}

// Fractional progress toward an entry in [0,1] (average clause progress, capped) — lets the engine
// detect an emerging identity on a partial team before it is fully matched.
function entryConfidence(counts, entry) {
    if (!entry || !entry.length) return 0;
    const sum = entry.reduce((s, c) => {
        const prog = c.min <= 0 ? 1 : Math.min(1, (counts[c.feature] || 0) / c.min);
        return s + prog;
    }, 0);
    return sum / entry.length;
}

// Rank every base archetype and gimmick by how strongly `team` fits its entry.
// Returns { counts, base: [{id,name,confidence,matched}], gimmicks: [...] } sorted by confidence desc.
function crystallize(team, model, ctx = {}) {
    const counts = teamFeatureCounts(team, ctx);
    const rank = (arr) => (arr || [])
        .map(a => ({
            id: a.id,
            name: a.name,
            confidence: entryConfidence(counts, a.entry),
            matched: matchesEntry(counts, a.entry),
        }))
        .sort((x, y) => y.confidence - x.confidence);
    return { counts, base: rank(model.baseArchetypes), gimmicks: rank(model.gimmicks) };
}

// Merge a set of `structure` arrays by role, taking the strongest requirement for duplicates.
function mergeStructure(structures) {
    const byRole = new Map();
    for (const s of (structures || []).flat()) {
        const cur = byRole.get(s.role);
        if (!cur) byRole.set(s.role, { ...s });
        else byRole.set(s.role, {
            role: s.role,
            min: Math.max(cur.min, s.min),
            max: Math.max(cur.max, s.max),
            weight: Math.max(cur.weight, s.weight),
        });
    }
    return [...byRole.values()];
}

// The effective preferred structure for a committed identity (base archetype + any gimmicks).
function combinedStructure(model, baseId, gimmickIds = []) {
    const base = (model.baseArchetypes || []).find(a => a.id === baseId);
    const gimmicks = (gimmickIds || []).map(id => (model.gimmicks || []).find(g => g.id === id)).filter(Boolean);
    return mergeStructure([base ? base.structure : [], ...gimmicks.map(g => g.structure)]);
}

// How well a team's feature counts satisfy a structure, in [0,1] (weighted). A role at/above `min` is
// fully satisfied; below `min` it is partial; `min: 0` roles are optional (never penalise).
function structureFit(counts, structure) {
    if (!structure || !structure.length) return 1;
    let num = 0, den = 0;
    for (const s of structure) {
        den += s.weight;
        const c = counts[s.role] || 0;
        const sat = s.min <= 0 ? 1 : Math.min(1, c / s.min);
        num += s.weight * sat;
    }
    return den ? num / den : 1;
}

// Marginal bias for adding `candidate` to a team with `teamCounts`, toward a target `structure`:
// full weight for filling a still-UNMET required role, a fraction for adding depth within range,
// nothing once a role is at its max. Drives 107c's weighted fill.
const DEPTH_FACTOR = 0.3;
function scoreCandidate(candidate, teamCounts, structure, ctx = {}) {
    const feats = detectFeatures(candidate, ctx);
    let score = 0;
    for (const s of structure || []) {
        if (!feats.has(s.role)) continue;
        const c = teamCounts[s.role] || 0;
        if (c < s.min) score += s.weight;                 // fills an unmet requirement
        else if (c < s.max) score += s.weight * DEPTH_FACTOR; // adds depth within range
        // at/above max → no bonus
    }
    return score;
}

module.exports = {
    teamFeatureCounts,
    matchesEntry,
    entryConfidence,
    crystallize,
    mergeStructure,
    combinedStructure,
    structureFit,
    scoreCandidate,
    DEPTH_FACTOR,
};
