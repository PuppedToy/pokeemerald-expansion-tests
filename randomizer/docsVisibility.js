'use strict';

// T-163 — pipeline-side docs-visibility defaults, normalization and the wild-encounters redactor.
//
// Every toggle here redacts what the generated docs REVEAL; the redaction is baked into the docs
// bundle at generation time (writerDocs.js), following the showExactPositions precedent, so hidden
// information is genuinely absent from the produced HTML rather than merely hidden on screen.
//
// The UI's initial state lives in frontend/js/config-form.js (DOCS_VISIBILITY_DEFAULT); this is the
// PIPELINE's own fallback, so a missing or partial docsVisibility still yields well-defined docs.

const DOCS_VISIBILITY_DEFAULT = {
    // Trainers tab
    showTrainers: true, showBosses: true, showNonBosses: true,
    showHeldItems: true, showNatures: true, showMoves: true, showAbility: true,
    showRewards: true, showIVs: false, showExactPositions: false,
    hidePokemon: false, hidePokemonCount: 1,
    // Encounters tab (+ Mail inbox, for the static toggles)
    showWildEncounters: true, showLegendaryStatic: true, showNonLegendaryStatic: true,
    showSuperRod: true, showDive: true, showSurf: true,
    showGoodRod: true, showOldRod: true, showGrass: true,
};

// Fill defaults + honour the legacy bare `showExactPositions` option and clamp the hide count (1..5).
function normalizeDocsVisibility(dv, legacyShowExactPositions) {
    const merged = { ...DOCS_VISIBILITY_DEFAULT, ...(dv || {}) };
    if ((!dv || dv.showExactPositions === undefined) && legacyShowExactPositions !== undefined) {
        merged.showExactPositions = legacyShowExactPositions === true;
    }
    let n = Math.round(Number(merged.hidePokemonCount));
    if (!Number.isFinite(n)) n = 1;
    merged.hidePokemonCount = Math.max(1, Math.min(5, n));
    return merged;
}

// Which wildPokes method key each per-method toggle controls.
const WILD_METHOD_TOGGLE = {
    land: 'showGrass', surf: 'showSurf', underwater: 'showDive',
    old: 'showOldRod', good: 'showGoodRod', super: 'showSuperRod',
};

// The distinct species a zone's method can yield, from the sweep plan (deterministic ⇒ 1 element).
// Order-preserving with the representative (route[method] = replacementLog[template] = first pick)
// first, so methodSpecies[0] always equals the plain method slot. Falls back to the single resolved
// species when there is no plan entry (older bundles / statics).
function methodDistinctList(entry, method, wildPlan) {
    const template = entry.__methodTemplates && entry.__methodTemplates[method];
    const picks = template && wildPlan ? wildPlan[template] : null;
    if (Array.isArray(picks) && picks.length) return [...new Set(picks)];
    return entry[method] !== undefined ? [entry[method]] : [];
}

// Distinct count for labelling a hidden method ("N encounters" / "Super-Rod encounter 1…N").
function methodDistinctCount(entry, method, wildPlan) {
    const list = methodDistinctList(entry, method, wildPlan);
    return list.length || 1;
}

// Redact the assembled wildPokes maps array (see writerDocs.js) per the docs-visibility config.
// Pure: returns a new array; never mutates the input. Rules (owner decisions, see T-163):
//  - Starters / extra starters: always shown.
//  - Boss reward cards: shown only when showTrainers && showBosses && showRewards.
//  - Show wild encounters OFF: keep only starters + gated rewards (wild zones AND statics dropped).
//  - Static toggles OFF: omit that static entry entirely (removes both the card and the Mail entry).
//  - Per-method toggle OFF: DELETE that method's species and record it under `hiddenMethods`
//    ({ [method]: { kind:'count'|'superNumbered', count } }) so the viewer can render a placeholder.
//    Deleting the key (rather than leaving a marker object) keeps every other wildPokes consumer —
//    the Nuzlocke/PC/Mail engines — working unchanged: an absent method is simply ignored.
function redactWildPokes(maps, dv, { wildPlan } = {}) {
    if (!dv) return maps.map(stripTemplates);
    const rewardGate = dv.showTrainers && dv.showBosses && dv.showRewards;
    const out = [];
    for (const entry of maps) {
        const isStarter = entry.id === 'STARTERS' || entry.id === 'STARTER_EXTRA';
        if (isStarter) { out.push(stripTemplates(entry)); continue; }
        if (entry.boss) { if (rewardGate) out.push(stripTemplates(entry)); continue; }
        // Wild encounters hidden entirely → only starters + gated rewards survive.
        if (!dv.showWildEncounters) continue;
        // Statics: omit when their toggle is off (drops the card AND the Mail entry).
        if (entry.legendaryEncounter) { if (dv.showLegendaryStatic) out.push(stripTemplates(entry)); continue; }
        if (entry.staticEncounter) { if (dv.showNonLegendaryStatic) out.push(stripTemplates(entry)); continue; }
        // Regular wild zone: hide-off methods become placeholder descriptors; visible methods that
        // hold several species (Classic mode, B-041) surface the FULL distinct list under
        // `methodSpecies` so the viewer can show every one (route[method] stays the representative).
        const redacted = { ...entry };
        let hiddenMethods = null;
        let methodSpecies = null;
        for (const [method, toggle] of Object.entries(WILD_METHOD_TOGGLE)) {
            if (redacted[method] === undefined) continue;
            if (!dv[toggle]) {
                hiddenMethods = hiddenMethods || {};
                hiddenMethods[method] = {
                    kind: method === 'super' ? 'superNumbered' : 'count',
                    count: methodDistinctCount(entry, method, wildPlan),
                };
                delete redacted[method];
                continue;
            }
            const list = methodDistinctList(entry, method, wildPlan);
            if (list.length > 1) {
                methodSpecies = methodSpecies || {};
                methodSpecies[method] = list;
            }
        }
        if (hiddenMethods) redacted.hiddenMethods = hiddenMethods;
        if (methodSpecies) redacted.methodSpecies = methodSpecies;
        out.push(stripTemplates(redacted));
    }
    return out;
}

// The template map is an internal assembly aid (used only to count picks) — never ship it.
function stripTemplates(entry) {
    if (!entry.__methodTemplates) return entry;
    const { __methodTemplates, ...rest } = entry;
    return rest;
}

module.exports = { DOCS_VISIBILITY_DEFAULT, normalizeDocsVisibility, redactWildPokes };
