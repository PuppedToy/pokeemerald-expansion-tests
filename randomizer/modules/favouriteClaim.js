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
    const { pokemonList = [], level = 50, types = null, favouriteIds = [], battleType = null } = ctx;
    const doubles = /double/i.test(battleType || ''); // T-109 — claim by the doubles tier for a doubles trainer
    const cap = nearestCap(level);
    const bySpecies = new Map(pokemonList.map(p => [p.id, p]));
    const passesRestriction = p => !types || (p.parsedTypes || []).some(t => types.includes(t));

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
