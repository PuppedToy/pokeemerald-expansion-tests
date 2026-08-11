'use strict';

// T-269 — the town traders (rework of T-194's four trades). Design: randomizer/docs/trades.md.
//
// Fifteen traders stand in the healing buildings along the progression, one per milestone. Each one
// is a LATERAL SWAP: the player hands in a wild mon they could have caught by that point and gets
// back a mon of the SAME FINAL QUALITY — the tier of the family's best evolution, never the tier of
// the stage that changes hands (owner, 2026-08-11). The gift arrives at the milestone's level cap,
// already knowing a few TMs the player could hold by then, and with a few IVs at 31.
//
// Per trader:
//   • WANTED  — rolled from `encounterPoolAt(milestone)` (every land/old-rod encounter reachable, plus
//     the rods and Surf as the world hands them over — data/progression.js). The pool grows along the
//     ladder and no two traders ask for the same family, so each one is a fresh offer.
//     The whole evolution family is accepted, as in T-194.
//   • OFFERED — a form whose own `rating.bestEvoTier` equals the wanted mon's, at the most evolved
//     stage that is legally ownable at that level. B-073: the family must be unused by the rest of the
//     run (starters, extra starters, gym rewards, statics, wild encounters — `wild
//     .alreadyChosenFamilies`) and by the other traders, so a trade never hands over a second member
//     of a family the player already has a claim on.
//   • TMs / IVs — `tms` TM moves the offered form can actually learn out of the milestone's reachable
//     TMs, and `perfectIvs` stats at 31 (the rest stay at the flat 15 T-194 handed out).
//
// Selection is deterministic per ROM seed and isolated from the global RNG stream: a local mulberry32
// seeded from deriveSeed(seed, traderIndex), so trades stay stable regardless of pipeline ordering.
// The decision is made once at generate time (rom.artifacts.trades) and consumed by the docs
// generator (writerDocs), the ROM writer and the injector, so docs and ROM always agree.

const { devolveToBase, getFamilyGroup, checkValidEvo } = require('./modules/utils');
const { deriveSeed } = require('./seeds');
const { encounterSourcesAt, tmMovesAvailableAt } = require('./data/progression');
const { DIAGNOSTIC_CODES } = require('./diagnostics');
const { BANNED_SPECIES_FOR_PICKING } = require('./modules/wildModule');

// The 15 traders, in progression order. `flag` is the boss milestone that gates the trader: it fixes
// the level of the gift, the encounters it may ask for and the TMs it may have taught them. `mapId` is
// the healing building it stands in — every one at the same tile (T-270). `tms` / `perfectIvs` are the
// owner's per-trader table (see the task).
const TRADERS = [
    { town: 'RUSTBORO',    ingameTradeId: 'INGAME_TRADE_RUSTBORO',    mapId: 'MAP_RUSTBORO_CITY_POKEMON_CENTER_1F',    flag: 'FLAG_BADGE01_GET',                    tms: 1, perfectIvs: 1 },
    { town: 'DEWFORD',     ingameTradeId: 'INGAME_TRADE_DEWFORD',     mapId: 'MAP_DEWFORD_TOWN_POKEMON_CENTER_1F',     flag: 'FLAG_BADGE02_GET',                    tms: 1, perfectIvs: 1 },
    { town: 'SLATEPORT',   ingameTradeId: 'INGAME_TRADE_SLATEPORT',   mapId: 'MAP_SLATEPORT_CITY_POKEMON_CENTER_1F',   flag: 'FLAG_DELIVERED_DEVON_GOODS',          tms: 1, perfectIvs: 2 },
    { town: 'MAUVILLE',    ingameTradeId: 'INGAME_TRADE_MAUVILLE',    mapId: 'MAP_MAUVILLE_CITY_POKEMON_CENTER_1F',    flag: 'FLAG_DEFEATED_WALLY_MAUVILLE',       tms: 1, perfectIvs: 2 },
    { town: 'VERDANTURF',  ingameTradeId: 'INGAME_TRADE_VERDANTURF',  mapId: 'MAP_VERDANTURF_TOWN_POKEMON_CENTER_1F',  flag: 'FLAG_BADGE03_GET',                    tms: 1, perfectIvs: 2 },
    { town: 'LAVARIDGE',   ingameTradeId: 'INGAME_TRADE_LAVARIDGE',   mapId: 'MAP_LAVARIDGE_TOWN_POKEMON_CENTER_1F',   flag: 'FLAG_BADGE04_GET',                    tms: 1, perfectIvs: 2 },
    { town: 'FALLARBOR',   ingameTradeId: 'INGAME_TRADE_FALLARBOR',   mapId: 'MAP_FALLARBOR_TOWN_POKEMON_CENTER_1F',   flag: 'FLAG_BADGE04_GET',                    tms: 1, perfectIvs: 2 },
    { town: 'PETALBURG',   ingameTradeId: 'INGAME_TRADE_PETALBURG',   mapId: 'MAP_PETALBURG_CITY_POKEMON_CENTER_1F',   flag: 'FLAG_BADGE05_GET',                    tms: 2, perfectIvs: 2 },
    { town: 'FORTREE',     ingameTradeId: 'INGAME_TRADE_FORTREE',     mapId: 'MAP_FORTREE_CITY_POKEMON_CENTER_1F',     flag: 'FLAG_BADGE06_GET',                    tms: 2, perfectIvs: 2 },
    { town: 'LILYCOVE',    ingameTradeId: 'INGAME_TRADE_LILYCOVE',    mapId: 'MAP_LILYCOVE_CITY_POKEMON_CENTER_1F',    flag: 'FLAG_MET_RIVAL_LILYCOVE',             tms: 2, perfectIvs: 2 },
    { town: 'MOSSDEEP',    ingameTradeId: 'INGAME_TRADE_MOSSDEEP',    mapId: 'MAP_MOSSDEEP_CITY_POKEMON_CENTER_1F',    flag: 'FLAG_BADGE07_GET',                    tms: 2, perfectIvs: 3 },
    { town: 'PACIFIDLOG',  ingameTradeId: 'INGAME_TRADE_PACIFIDLOG',  mapId: 'MAP_PACIFIDLOG_TOWN_POKEMON_CENTER_1F',  flag: 'FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN', tms: 2, perfectIvs: 3 },
    { town: 'SOOTOPOLIS',  ingameTradeId: 'INGAME_TRADE_SOOTOPOLIS',  mapId: 'MAP_SOOTOPOLIS_CITY_POKEMON_CENTER_1F',  flag: 'FLAG_BADGE08_GET',                    tms: 3, perfectIvs: 3 },
    { town: 'EVER_GRANDE', ingameTradeId: 'INGAME_TRADE_EVER_GRANDE', mapId: 'MAP_EVER_GRANDE_CITY_POKEMON_CENTER_1F', flag: 'FLAG_DEFEATED_WALLY_VICTORY_ROAD',    tms: 3, perfectIvs: 3 },
    // The League trader lives at the League's own healing counter and sees the whole game.
    { town: 'LEAGUE',      ingameTradeId: 'INGAME_TRADE_LEAGUE',      mapId: 'MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F', flag: 'FLAG_IS_CHAMPION',                    tms: 3, perfectIvs: 4 },
];

// struct InGameTrade.ivs order (src/trade.c → MON_DATA_*_IV): HP, Attack, Defense, Speed, SpAtk, SpDef.
const IV_STATS = 6;
const BASE_IV = 15;     // T-194's flat value; the stats a trader does not perfect keep it
const PERFECT_IV = 31;

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

// `count` distinct members of `arr`, in draw order. Fewer if the array is shorter.
function sampleDistinct(arr, count, rand) {
    const rest = [...arr];
    const out = [];
    while (out.length < count && rest.length) out.push(...rest.splice(Math.floor(rand() * rest.length), 1));
    return out;
}

// Flatten a (branching) evoTree into the full set of family member species ids.
function flattenEvoTree(tree) {
    const out = [];
    (function walk(n) { if (Array.isArray(n)) n.forEach(walk); else if (n) out.push(n); })(tree);
    return [...new Set(out)];
}

// The `ivs` array to hand to the writer: `count` stats at 31, the rest at 15.
function rollIvs(count, rand) {
    const ivs = new Array(IV_STATS).fill(BASE_IV);
    for (const stat of sampleDistinct([0, 1, 2, 3, 4, 5], Math.min(count, IV_STATS), rand)) {
        ivs[stat] = PERFECT_IV;
    }
    return ivs;
}

// The TMs this form can be handed with: reachable by the milestone (progression.js), learnable by the
// form, and not something it already knows by level-up at that level (a gift of a move it has is no
// gift). Stable order in, random `count` out.
function offeredTmMoves(form, level, reachableTms, count, rand) {
    const knownByLevel = new Set((form.learnset || []).filter(l => l.level <= level).map(l => l.move));
    const teachable = new Set(form.teachables || []);
    const candidates = reachableTms.filter(m => teachable.has(m) && !knownByLevel.has(m));
    return sampleDistinct(candidates, count, rand);
}

// How many evolution steps above a base form this mon sits (a mega counts as its base form). Used to
// hand over the MOST evolved stage that is still legal at the trade's level.
function evoDepth(pokemonList, poke) {
    let current = poke;
    if (current.evolutionData && current.evolutionData.megaBaseForm) {
        current = pokemonList.find(p => p.id === current.evolutionData.megaBaseForm) || current;
    }
    let depth = 0;
    for (let guard = 0; guard < 12; guard++) {
        const preEvo = pokemonList.find(p => (p.evolutions || []).some(e => e.pokemon === current.id));
        if (!preEvo) break;
        current = preEvo;
        depth++;
    }
    return depth;
}

/**
 * The forms a trader may hand over: one per candidate family, whose OWN best evolution is `tier`.
 *
 * Only the ceiling is looked at, never the current stage (owner, 2026-08-11) — an early trader happily
 * hands over an LC mon, which is the point: the player is buying into the same ceiling, not the same
 * stat line. Two constraints make that honest:
 *   • the form itself must carry the tier. Reading it off the family instead was wrong: a family can
 *     peak through a MEGA (Slowpoke's ceiling is Mega Slowbro, UU) whose ordinary base form is a tier
 *     lower — that shipped a "UU for UU" swap that handed over an RU Slowbro (caught by the pipeline
 *     dump, 2026-08-11).
 *   • the form must be legally ownable at the trade's level (`checkValidEvo`), and of the forms that
 *     are, the trader gives the most evolved one.
 * A mega form is never itself handed over — the player evolves into it with the stone the run places.
 *
 * @param {Array} pokemonList  the run's pokédex
 * @param {string} tier        the wanted mon's `rating.bestEvoTier`
 * @param {number} capLevel    the trader's level
 * @param {Set} usedFamilies   family groups already claimed by this run (B-073)
 */
function offeredCandidates(pokemonList, tier, capLevel, usedFamilies) {
    const byFamily = new Map();
    for (const p of pokemonList) {
        if (!p.rating || p.rating.bestEvoTier !== tier) continue;
        if (p.evolutionData && p.evolutionData.megaBaseForm) continue;
        const fam = getFamilyGroup(p.family);
        if (usedFamilies.has(fam)) continue;
        if (!checkValidEvo(pokemonList, p, capLevel)) continue;
        const held = byFamily.get(fam);
        if (!held || evoDepth(pokemonList, p) > evoDepth(pokemonList, held)) byFamily.set(fam, p);
    }
    // Stable order so a given seed maps to a given pick regardless of Map iteration nuances.
    return [...byFamily.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * The encounters a trader may ask for: everything reachable at its milestone, minus the families
 * earlier traders already asked for, in a stable order with where each one is caught.
 */
function wantedCandidates(pokemonList, trader, wildArtifact, wildMaps, askedFamilies) {
    const byId = new Map(pokemonList.map(p => [p.id, p]));
    const seen = new Set();
    const out = [];
    for (const source of encounterSourcesAt(trader.flag, wildMaps, wildArtifact)) {
        const poke = byId.get(source.species);
        if (!poke || !poke.rating) continue;
        if (seen.has(poke.id)) continue;                                  // first source wins (earliest)
        if (askedFamilies.has(getFamilyGroup(poke.family))) continue;
        seen.add(poke.id);
        out.push({ poke, mapId: source.mapId, method: source.method });
    }
    out.sort((a, b) => (a.poke.id < b.poke.id ? -1 : a.poke.id > b.poke.id ? 1 : 0));
    return out;
}

/**
 * Decide the 15 trades. Pure given its inputs; consumes no shared RNG.
 *
 * @param {Object}  o
 * @param {Array}   o.pokemonList   the run's pokédex (`pokedex.pokes`)
 * @param {Object}  o.wildArtifact  the run's wild artifact (plan, replacement log, chosen families)
 * @param {Array}   o.wildMaps      wild.js `maps`
 * @param {Object}  o.capLevels     flag → level (caps.c, via the pokédex artifact)
 * @param {Object}  o.moves         the run's move database (TM numbers + in-world locations)
 * @param {number}  o.seed          the ROM seed
 * @param {Object}  o.diagnostics   optional sink
 */
function selectTrades({ pokemonList: rawPokemonList, wildArtifact, wildMaps, capLevels, moves, seed, diagnostics } = {}) {
    const warn = (code, message, context) => {
        if (diagnostics && typeof diagnostics.warn === 'function') diagnostics.warn(code, message, context);
    };
    // Battle-only forms (Aegislash Blade, Palafin Hero, …) are never placeable — same filter the wild
    // module applies before it picks anything.
    const banned = new Set(BANNED_SPECIES_FOR_PICKING);
    const pokemonList = (rawPokemonList || []).filter(p => !banned.has(p.id));
    // B-073 — one without-replacement pool of families for the whole run. The wild module hands over
    // everything it claimed (starters, extra starters, gym rewards, statics, encounters); each trade
    // adds what it takes, so no two trades collide either.
    const usedFamilies = new Set(((wildArtifact && wildArtifact.alreadyChosenFamilies) || []).map(getFamilyGroup));
    const askedFamilies = new Set();
    const reachableTmsByFlag = new Map();

    return TRADERS.map((trader, idx) => {
        const rand = makeRng(deriveSeed(seed >>> 0, idx));
        const level = capLevels[trader.flag];

        // ── what the trader asks for ──────────────────────────────────────────
        let candidates = wantedCandidates(pokemonList, trader, wildArtifact, wildMaps, askedFamilies);
        if (candidates.length === 0) {
            // Every reachable family has already been asked for: repeat rather than skip the trade.
            candidates = wantedCandidates(pokemonList, trader, wildArtifact, wildMaps, new Set());
            if (candidates.length) {
                warn(DIAGNOSTIC_CODES.TRADE_WANTED_POOL_EMPTY,
                    `Every encounter reachable at ${trader.town} was already asked for; repeating a family.`,
                    { town: trader.town, flag: trader.flag });
            }
        }
        const wantedEntry = candidates.length ? pick(candidates, rand) : null;
        const wanted = wantedEntry && wantedEntry.poke;
        const wantedFamily = wanted ? getFamilyGroup(wanted.family) : null;
        if (wanted) {
            askedFamilies.add(wantedFamily);
            // The family the player hands over is spent: nobody may give it back, least of all this trade.
            usedFamilies.add(wantedFamily);
        }

        // ── what the trader gives ─────────────────────────────────────────────
        const tier = wanted ? wanted.rating.bestEvoTier : null;
        let offers = wanted ? offeredCandidates(pokemonList, tier, level, usedFamilies) : [];
        if (wanted && offers.length === 0) {
            // The tier is spent. Repeat a family rather than drop the trade — but still never the one
            // being asked for, so the swap stays a swap.
            offers = offeredCandidates(pokemonList, tier, level, new Set([wantedFamily]));
            warn(DIAGNOSTIC_CODES.TRADE_OFFER_POOL_EMPTY,
                `No unused family peaks at ${tier} for ${trader.town}; allowed a family repeat.`,
                { town: trader.town, tier, level });
            if (offers.length === 0) offers = offeredCandidates(pokemonList, tier, level, new Set());
        }
        const offered = offers.length ? pick(offers, rand) : null;
        if (offered) usedFamilies.add(getFamilyGroup(offered.family));

        // ── what it arrives with ──────────────────────────────────────────────
        if (!reachableTmsByFlag.has(trader.flag)) {
            reachableTmsByFlag.set(trader.flag, tmMovesAvailableAt(trader.flag, moves));
        }
        const tmMoves = offered
            ? offeredTmMoves(offered, level, reachableTmsByFlag.get(trader.flag), trader.tms, rand)
            : [];
        if (offered && tmMoves.length < trader.tms) {
            warn(DIAGNOSTIC_CODES.TRADE_TMS_SHORT,
                `${offered.id} can learn only ${tmMoves.length} of the ${trader.tms} TMs `
                + `${trader.town} should teach it.`,
                { town: trader.town, species: offered.id, asked: trader.tms, got: tmMoves.length });
        }
        const ivs = rollIvs(trader.perfectIvs, rand);

        const acceptedSpecies = wanted
            ? flattenEvoTree(wanted.evoTree && wanted.evoTree.length ? wanted.evoTree : [wanted.id])
            : [];
        const acceptedBaseForms = wanted ? [devolveToBase(pokemonList, wanted).id] : [];

        return {
            town: trader.town,
            ingameTradeId: trader.ingameTradeId,
            mapId: trader.mapId,
            flag: trader.flag,
            tier,                               // the shared final quality of both sides
            level,
            offeredSpecies: offered ? offered.id : null,
            offeredMoves: tmMoves,
            ivs,
            perfectIvs: trader.perfectIvs,
            wantedSpecies: wanted ? wanted.id : null,
            // Where the wanted mon is caught — the docs render the trade on that encounter (T-271).
            wantedMapId: wantedEntry ? wantedEntry.mapId : null,
            wantedMethod: wantedEntry ? wantedEntry.method : null,
            acceptedSpecies,
            acceptedBaseForms,
        };
    });
}

module.exports = {
    selectTrades,
    TRADERS,
    IV_STATS, BASE_IV, PERFECT_IV,
    __test: { offeredCandidates, wantedCandidates, flattenEvoTree, makeRng, rollIvs, sampleDistinct, offeredTmMoves, evoDepth },
};
