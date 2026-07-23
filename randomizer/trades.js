'use strict';

// T-194 — seed-driven town trades.
//
// For each of the 4 towns, choose:
//   • the OFFERED mon — STRICT rule (owner-decided): the family peaks at the town's tier
//     (rating.bestEvoTier === tier) AND the cap-valid evolution stage (devolveToLevel at the gym
//     level cap) is that same tier when evaluated AT the cap (contextualRatings[nearestCap].tier).
//     Handed over at that cap-valid stage.
//   • the ACCEPTED set — the REPRESENTATIVE grass/old-rod encounter species of the town's route
//     (wild replacementLog), each expanded to its FULL evolution family (any stage is accepted). The
//     message lists the base forms of those representatives.
//
// Selection is deterministic per ROM seed and isolated from the global RNG stream: a local mulberry32
// is seeded from deriveSeed(seed, townIndex), so trades stay stable regardless of pipeline ordering.
// The decision is made once at generate time (rom.artifacts.trades) and consumed by BOTH the docs
// generator (writerDocs) and the ROM writer, guaranteeing docs↔ROM agreement.

const { devolveToLevel, devolveToBase } = require('./modules/utils');
const { deriveSeed } = require('./seeds');

// Contextual-rating level buckets — SSOT mirror of pokedexModule LEVEL_CAPS / trainerSelector.nearestCap.
const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];
// Ordered tier ladder (mirror of writerDocs CONTEXTUAL_TIER_SEQ) — used only for the fallback ordering.
const CONTEXTUAL_TIER_SEQ = ['MAGIKARP', 'ZU', 'PU', 'NU', 'RU', 'UU', 'OU', 'UBERS', 'LEGEND', 'AG'];

function nearestCap(level) {
    let best = LEVEL_CAPS[0];
    for (const c of LEVEL_CAPS) { if (c <= level) best = c; else break; }
    return best;
}

// The 4 town trades (owner spec, T-194). ingameTradeId keeps the sIngameTrades slot each town's map
// script selects via `setvar VAR_0x8008, INGAME_TRADE_*`: Rustboro→SEEDOT, Lavaridge→HORSEA (was
// Pacifidlog), Fortree→PLUSLE, Mossdeep→MEOWTH (was Battle Frontier).
const TOWN_TRADES = [
    { town: 'RUSTBORO',  ingameTradeId: 'INGAME_TRADE_SEEDOT', tier: 'RU',    capFlag: 'FLAG_BADGE01_GET', routeMapId: 'MAP_ROUTE101', methods: ['land'] },
    { town: 'LAVARIDGE', ingameTradeId: 'INGAME_TRADE_HORSEA', tier: 'UU',    capFlag: 'FLAG_BADGE04_GET', routeMapId: 'MAP_ROUTE102', methods: ['land', 'old'] },
    { town: 'FORTREE',   ingameTradeId: 'INGAME_TRADE_PLUSLE', tier: 'OU',    capFlag: 'FLAG_BADGE06_GET', routeMapId: 'MAP_ROUTE103', methods: ['land', 'old'] },
    { town: 'MOSSDEEP',  ingameTradeId: 'INGAME_TRADE_MEOWTH', tier: 'UBERS', capFlag: 'FLAG_BADGE07_GET', routeMapId: 'MAP_ROUTE104', methods: ['land', 'old'] },
];

// Local mulberry32 (byte-identical to rng.js) so trade picks never perturb the shared pipeline stream.
function makeRng(s) {
    let t = s >>> 0;
    return function () {
        t |= 0;
        t = (t + 0x6D2B79F5) | 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) | 0;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];

// Flatten a (branching) evoTree into the full set of family member species ids.
function flattenEvoTree(tree) {
    const out = [];
    (function walk(n) { if (Array.isArray(n)) n.forEach(walk); else if (n) out.push(n); })(tree);
    return [...new Set(out)];
}

// One cap-valid offered form per family that peaks at `tier`, keeping only those whose cap-valid form
// is `tier` at the cap bucket (strict). If `relax` is true the contextual check is dropped (fallback).
function offeredCandidates(pokemonList, tier, capLevel, { relax = false } = {}) {
    const bucket = nearestCap(capLevel);
    const byFamily = new Map();
    for (const p of pokemonList) {
        if (!p.rating || p.rating.bestEvoTier !== tier) continue;
        if (!byFamily.has(p.family)) byFamily.set(p.family, p);
    }
    const out = [];
    for (const rep of byFamily.values()) {
        const peak = pokemonList.find(p => p.id === rep.rating.bestEvo) || rep;
        const form = devolveToLevel(pokemonList, peak, capLevel);
        if (relax) { out.push(form); continue; }
        const ctx = form.contextualRatings && form.contextualRatings[bucket];
        if (ctx && ctx.tier === tier) out.push(form);
    }
    // Stable order so a given seed maps to a given pick regardless of Map iteration nuances.
    out.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return out;
}

// Accepted set for a town: representative encounter species of each route method → full family.
function acceptedFor(pokemonList, town, replacementLog, wildMaps) {
    const route = wildMaps.find(m => m.id === town.routeMapId) || {};
    const reps = [];
    for (const method of town.methods) {
        const template = route[method];
        if (!template) continue;
        reps.push((replacementLog && replacementLog[template]) || template);
    }
    const acceptedSpecies = new Set();
    const baseForms = [];
    for (const repId of [...new Set(reps)]) {
        const repPoke = pokemonList.find(p => p.id === repId);
        if (!repPoke) continue;
        const fam = flattenEvoTree(repPoke.evoTree && repPoke.evoTree.length ? repPoke.evoTree : [repId]);
        fam.forEach(s => acceptedSpecies.add(s));
        baseForms.push(devolveToBase(pokemonList, repPoke).id);
    }
    return { acceptedSpecies: [...acceptedSpecies], acceptedBaseForms: [...new Set(baseForms)] };
}

// Decide the 4 trades. Pure given (pokemonList, wildArtifact, wildMaps, capLevels, seed).
function selectTrades({ pokemonList, wildArtifact, wildMaps, capLevels, seed, diagnostics } = {}) {
    const replacementLog = (wildArtifact && wildArtifact.replacementLog) || {};
    return TOWN_TRADES.map((town, idx) => {
        const level = capLevels[town.capFlag];
        let candidates = offeredCandidates(pokemonList, town.tier, level);
        if (candidates.length === 0) {
            candidates = offeredCandidates(pokemonList, town.tier, level, { relax: true });
            if (diagnostics && typeof diagnostics.warn === 'function') {
                diagnostics.warn('TRADE_TIER_POOL_EMPTY',
                    `No strict tier-${town.tier} offer at cap ${level} for ${town.town}; relaxed to family-peak tier.`,
                    { town: town.town, tier: town.tier, level });
            }
        }
        const rand = makeRng(deriveSeed(seed >>> 0, idx));
        const offered = candidates.length ? pick(candidates, rand) : null;
        const { acceptedSpecies, acceptedBaseForms } = acceptedFor(pokemonList, town, replacementLog, wildMaps);
        return {
            town: town.town,
            ingameTradeId: town.ingameTradeId,
            tier: town.tier,
            level,
            routeMapId: town.routeMapId,
            offeredSpecies: offered ? offered.id : null,
            acceptedSpecies,
            acceptedBaseForms,
        };
    });
}

module.exports = {
    selectTrades,
    TOWN_TRADES,
    __test: { nearestCap, offeredCandidates, acceptedFor, flattenEvoTree, makeRng },
};
