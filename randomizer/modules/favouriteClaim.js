'use strict';

// T-128 (redesign) — Favourite CLAIM (pool consumption).
//
// A favourite is EXCLUSIVELY a poke (never poke+tier). The boss's tier POOL is its preset team, already
// difficulty-scaled by applyTransform — difficulty touches ONLY the pool. A favourite CONSUMES a pool
// slot of its EXACT tier (or the {isMega} slot if it is a mega). It never predicts a tier and never
// downgrades: if its actual tier (this run) isn't an available budget slot it drops to the next
// fallback; the implicit final fallback is any eligible mon within the trainer's restrictions. Claimed
// favourites are moved to the FRONT (resolved first, so the team crystallises around them).
//
// resolveFavourites(team, favourites, ctx) returns a reordered team: [claimed-favourite slots..., rest].
//   team        — the difficulty-adjusted preset pool (array of slot defs)
//   favourites  — array of chains; each chain is an ordered array of candidates (a 'SPECIES_*' id, or
//                 { mega:true } = "a mega of the type"); null/empty → team returned unchanged
//   ctx         — { pokemonList, level, types (trainer type restriction or null), favouriteIds (per-chain
//                 continuity ids or []) }

const { TIER_SEQ } = require('../constants');
const { DIAGNOSTIC_CODES } = require('../diagnostics');

const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];
function nearestCap(level) {
    let best = LEVEL_CAPS[0];
    for (const cap of LEVEL_CAPS) { if (cap <= level) best = cap; else break; }
    return best;
}
const tierIdx = t => TIER_SEQ.indexOf(t);
function tiersUpTo(maxTier) { const i = TIER_SEQ.indexOf(maxTier); return i === -1 ? [maxTier] : TIER_SEQ.slice(0, i + 1); }

// A pool slot's claimable tier "key": the {isMega} slot (carrying its progression gate — the mega-form
// tier window `megaTiers` and the base-form cap `maxBaseTier`), a single absolute tier, or a single
// contextual tier. Untiered slots (special / oneOf / multi-tier non-mega) are not claimable (return null).
function slotTierKey(slot) {
    if (slot.isMega) return { mega: true, megaTiers: slot.absoluteTier || null, maxBaseTier: slot.maxBaseTier || null };
    if (slot.absoluteTier && slot.absoluteTier.length === 1) return { tier: slot.absoluteTier[0], contextual: false };
    if (slot.contextualTier && slot.contextualTier.length === 1) return { tier: slot.contextualTier[0], contextual: true };
    return null;
}

// A mega species passes a mega slot's GENERAL progression gate (owner-validated, T-128): its mega-form
// tier is within the slot's window AND — the base-form rule — its BASE form's tier is within the cap.
// A bare {isMega} slot (no gate) admits any mega (backward compatible).
// T-109 — for a DOUBLES trainer, a favourite claims its slot by the DOUBLES tier (poke.tierDoubles); the
// contextual branch stays singles until T-111 (contextualRatingsDoubles). `doubles` threads from the ctx.
const absTierOf = (p, doubles) => (doubles && p && p.tierDoubles) ? p.tierDoubles : (p && p.rating && p.rating.tier);
function megaPassesGate(p, key, bySpecies, doubles = false) {
    if (key.megaTiers && !key.megaTiers.includes(absTierOf(p, doubles))) return false;
    if (key.maxBaseTier) {
        const baseId = p.evolutionData && p.evolutionData.megaBaseForm;
        const base = baseId ? bySpecies.get(baseId) : null;
        const baseTier = absTierOf(base, doubles);
        if (!baseTier || !tiersUpTo(key.maxBaseTier).includes(baseTier)) return false;
    }
    return true;
}

// The species' tier as the slot measures it (absolute rating, or the contextual rating at the level cap).
function speciesTierForKey(p, key, cap, doubles = false) {
    if (key.mega) return null;
    if (!key.contextual) return absTierOf(p, doubles);
    const ctxMap = (doubles && p.contextualRatingsDoubles) ? p.contextualRatingsDoubles : p.contextualRatings; // T-111
    return ctxMap && ctxMap[cap] && ctxMap[cap].tier;
}

function resolveFavourites(team, favourites, ctx = {}) {
    if (!favourites || !favourites.length) return team;
    const { pokemonList = [], level = 50, types = null, favouriteIds = [], battleType = null, diag = null } = ctx;
    const doubles = /double/i.test(battleType || ''); // T-109 — claim by the doubles tier for a doubles trainer
    const cap = nearestCap(level);
    const bySpecies = new Map(pokemonList.map(p => [p.id, p]));
    const passesRestriction = p => !types || (p.parsedTypes || []).some(t => types.includes(t));

    // T-144 — a villain leader's signature-mega ladder. Resolves the {isMega} pool slot to a CONCRETE mega
    // (owner-validated, 2026-07-17): eligible = passes the slot's budget gate AND has a team type; the first
    // satisfied rung wins, pick deterministically (highest tier, then rating, then id). `null` → drop the
    // slot (the caller warns). `t0`/`t1` = the team's primary/secondary types. See tasks/T-144.
    const ratingOf = p => (doubles && typeof p.ratingDoubles === 'number') ? p.ratingDoubles : ((p.rating && p.rating.absoluteRating) || 0);
    function resolveVillainMega(aceMegaId, key) {
        const t0 = types && types[0];
        const t1 = types && types[1];
        const eligible = pokemonList.filter(p =>
            p.evolutionData && p.evolutionData.isMega
            && megaPassesGate(p, key, bySpecies, doubles)
            && passesRestriction(p));
        if (!eligible.length) return null;

        const hasType = (p, t) => (p.parsedTypes || []).includes(t);
        const isExact = (p, a, b) => hasType(p, a) && hasType(p, b);          // ≤2 types → "has both" == "exactly"
        const isMono = (p, t) => (p.parsedTypes || []).length === 1 && p.parsedTypes[0] === t;
        // "has an on-team pre-evolution": the mega's base form has a pre-evo (base not EVO_TYPE_SOLO — no Mega
        // Mawile) whose form meets the team restriction, so the devolved mascot stays on-theme (owner Q1/Q2).
        const prevoOnTeam = (p) => {
            const baseId = p.evolutionData.megaBaseForm;
            const prevo = pokemonList.find(s => (s.evolutions || []).some(e => e.pokemon === baseId));
            return !!prevo && passesRestriction(prevo);
        };
        const rungs = [
            p => p.id === aceMegaId && isExact(p, t0, t1),   // 1 — signature, exact {t0,t1}
            p => isExact(p, t0, t1) && prevoOnTeam(p),       // 2 — any exact {t0,t1} with an on-team prevo
            p => isMono(p, t0) && prevoOnTeam(p),            // 3 — any monotype-t0 with an on-team prevo
            p => p.id === aceMegaId && hasType(p, t0),       // 5 — signature, has t0
            p => hasType(p, t0),                             // 6 — any mega with t0
            p => prevoOnTeam(p),                             // 7 — any mega with an on-team prevo
        ];
        for (const rung of rungs) {
            const matches = eligible.filter(rung);
            if (matches.length) {
                return matches.sort((a, b) =>
                    tierIdx(absTierOf(b, doubles)) - tierIdx(absTierOf(a, doubles))
                    || ratingOf(b) - ratingOf(a)
                    || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0];
            }
        }
        return null;
    }

    const pool = team.map(slot => ({ slot, key: slotTierKey(slot), claimed: false }));
    const claimed = [];

    favourites.forEach((fav, favIdx) => {
        // T-132 — a favourite is a bare chain (array) OR a "liked" wrapper { chain, goodBreed }. A liked
        // favourite claims its slot exactly the same way but breeds GOOD instead of PERFECT (the mascot
        // Groudon/Kyogre shouldn't get perfect IVs). Object wrapper → clone-safe (survives a JSON deep-clone).
        const chain = Array.isArray(fav) ? fav : (fav && fav.chain) || [];
        const goodBreed = !Array.isArray(fav) && !!(fav && fav.goodBreed);
        const mark = extra => ({ breedTier: goodBreed ? 'good' : 'perfect', __favourite: true, ...(favouriteIds[favIdx] ? { id: favouriteIds[favIdx] } : {}), ...extra });
        let done = false;
        for (const cand of chain) {
            if (typeof cand === 'string') {
                const p = bySpecies.get(cand);
                if (!p || !passesRestriction(p)) continue;
                const isMega = !!(p.evolutionData && p.evolutionData.isMega);
                const entry = pool.find(e => {
                    if (e.claimed || !e.key) return false;
                    // a mega claims the {isMega} slot ONLY IF it satisfies the slot's progression gate
                    // (mega-form window + base-form cap); else it drops to the next fallback.
                    if (isMega) return !!e.key.mega && megaPassesGate(p, e.key, bySpecies, doubles);
                    if (e.key.mega) return false;            // a non-mega never claims the mega slot
                    return speciesTierForKey(p, e.key, cap, doubles) === e.key.tier; // EXACT tier, no downgrade
                });
                if (entry) { entry.claimed = true; claimed.push(mark({ specific: cand })); done = true; break; }
            } else if (cand && cand.villainMega) {
                // T-144 — a villain leader's signature-mega ladder: resolve the {isMega} slot to a concrete
                // mega (rungs above), claimed as a `specific` (like a named signature). No eligible mega →
                // DROP the slot (consume it, claim nothing) + a warning, so the leader loses the mega rather
                // than fielding an off-theme filler (owner: "es complicado que pase; dropea + warning").
                const entry = pool.find(e => !e.claimed && e.key && e.key.mega);
                if (entry) {
                    entry.claimed = true; // consume the slot either way (chosen → claim it; else → drop it)
                    const chosen = resolveVillainMega(cand.villainMega, entry.key);
                    if (chosen) {
                        claimed.push(mark({ specific: chosen.id }));
                    } else if (diag) {
                        diag.warn(DIAGNOSTIC_CODES.VILLAIN_MEGA_DROPPED,
                            `Villain mega favourite ${cand.villainMega} — no eligible mega within budget/types; slot dropped`,
                            { aceMega: cand.villainMega, types, trainerId: ctx.trainerId || null, level });
                    }
                    done = true;
                }
                break; // villainMega is the whole chain
            } else if (cand && cand.mega) {
                // "a mega of the type" — claim the {isMega} slot (a themed mega fills it via the pool slot).
                const entry = pool.find(e => !e.claimed && e.key && e.key.mega);
                if (entry) { entry.claimed = true; claimed.push(mark({ ...entry.slot })); done = true; break; }
            }
        }
        if (!done) {
            // Standard final fallback: any eligible mon within the trainer's restrictions. Claim the
            // LOWEST-tier available slot (leave stronger slots for the rest); the trainer restriction is
            // applied when the slot resolves. Falls back to any remaining claimable slot (e.g. mega).
            const tiered = pool.filter(e => !e.claimed && e.key && !e.key.mega)
                .sort((a, b) => tierIdx(a.key.tier) - tierIdx(b.key.tier));
            const entry = tiered[0] || pool.find(e => !e.claimed && e.key);
            if (entry) { entry.claimed = true; claimed.push(mark({ ...entry.slot })); }
        }
    });

    return [...claimed, ...pool.filter(e => !e.claimed).map(e => e.slot)];
}

module.exports = { resolveFavourites, slotTierKey, nearestCap };
