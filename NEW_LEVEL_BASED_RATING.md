# Level-Based Contextual Rating System

## Why

The generic rating (`poke.rating`) is computed at level 100 with full TM availability. That is correct for wild pokemon placement, rarity gates, and Dex entries — it tells you the pokemon's ceiling.

**Trainers are different.** A trainer at level 12 only has the moves a pokemon learns up to level 12 and the TMs in their specific bag. A level-12 Beldum has only Take Down. A level-12 Snubbull has Ice Fang, Thunder Fang, and Fire Fang from birth. The generic rating cannot distinguish these cases because BST dominates at 80% weight — Beldum's high BST obscures that it literally cannot fight yet.

The contextual rating solves this by running the same algorithm with a restricted universe.

---

## What Is Implemented (as of commit bac6d38)

### 1. `rateContextual` in `rating.js`

```js
function rateContextual(poke, moves, abilities, context) {
    const { level = 100, tms = [] } = context;
    const restrictedPoke = {
        ...poke,
        learnset: poke.learnset.filter(entry => entry.level <= level),
    };
    const restrictedTmPool = new Set(tms);
    return ratePokemon(restrictedPoke, moves, abilities, restrictedTmPool);
}
```

It creates a shallow copy of the pokemon with its learnset filtered to `level <= cap`, then runs `ratePokemon` with a restricted TM pool. The original `poke.rating` is **never touched**. Passing `{ level: 100, tms: [...fullTmPool] }` produces the exact same result as the generic rating — the function is a strict superset.

The return value is the same shape as `ratePokemon`: `{ absoluteRating, tier, bestMoveset, movesRating, role, ... }`.

### 2. Pre-computed cache in `index.js`

After the main rating pass (and the bestEvo/megaEvo pass), every pokemon gets a `contextualRatings` map:

```js
const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];
for (const poke of allPokes) {
    poke.contextualRatings = {};
    for (const cap of LEVEL_CAPS) {
        poke.contextualRatings[cap] = rateContextual(poke, moves, abilities, { level: cap, tms: [] });
    }
}
```

**Key detail — this is learnset-only, no TMs.** Every cap uses `tms: []`. This is a conservative baseline: it tells you what the pokemon can do purely from level-up moves at that cap. A trainer's actual TMs would make some ratings higher, but the cache is for filtering candidates — the conservative number is the right tool for that job.

The 25 level caps were chosen to cover the full game's trainer distribution with ~2-level granularity in early game and coarser steps later.

### 3. `contextualTier` POKEDEF field in `writer.js`

Two helpers support the filter:

```js
const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];

// Returns the highest cap that is <= level, or the lowest cap if level is below all caps.
function nearestCap(level) {
    let best = LEVEL_CAPS[0];
    for (const cap of LEVEL_CAPS) {
        if (cap <= level) best = cap;
        else break;
    }
    return best;
}
```

Inside `choosePokemonFromDefinition`, after the `absoluteTier` filter block:

```js
if (trainerMonDefinition.contextualTier) {
    const cap = nearestCap(trainer.level);
    const beforeCount = pokemonLooseList.length;
    const filtered = pokemonLooseList.filter(loosePokemon => {
        const contextual = loosePokemon.contextualRatings?.[cap];
        return contextual && trainerMonDefinition.contextualTier.includes(contextual.tier);
    });
    // Fall back to absoluteTier (or unfiltered list) if contextualTier yields nothing
    pokemonLooseList = filtered.length > 0 ? filtered : pokemonLooseList;
    if (filtered.length === 0 && beforeCount > 0) {
        console.warn(`WARN: contextualTier filter yielded 0 results for trainer ${trainer.id} at level ${trainer.level} (cap=${cap}). Falling back to pre-contextual list.`);
    }
}
```

`pickBest` sorting also uses the contextual rating when `contextualTier` is present:

```js
const getRatingForSort = (poke) => {
    if (trainerMonDefinition.contextualTier) {
        const cap = nearestCap(trainer.level);
        return poke.contextualRatings?.[cap]?.absoluteRating ?? poke.rating.absoluteRating;
    }
    return poke.rating.absoluteRating;
};
```

---

## How to Use It in a Trainer Definition

```js
// Current (unchanged) — filters by generic tier
{ absoluteTier: ['RU', 'UU'], checkValidEvo: true }

// New — filters by contextual tier at trainer.level
{ contextualTier: ['RU', 'UU'], checkValidEvo: true }

// Both together — absoluteTier first narrows the pool, then contextualTier filters it further
// (contextualTier only runs on what absoluteTier already passed)
{ absoluteTier: ['NU', 'RU', 'UU'], contextualTier: ['RU', 'UU'], checkValidEvo: true }
```

**Interaction between absoluteTier and contextualTier:** The filters are applied in sequence. `absoluteTier` runs first and shrinks `pokemonLooseList`. Then `contextualTier` filters that already-shrunk list. Using both is a way to say "must be at least RU generically, but also contextually UU at this level."

**Fallback behavior:** If `contextualTier` matches zero candidates, the filter is a no-op (the pre-contextual list is used unchanged) and a `WARN` is printed. This prevents empty teams.

---

## What Does NOT Change

- `poke.rating` — the generic rating object, used by wild encounters, rarity gates, and all trainers that still use `absoluteTier`.
- `absoluteTier` in any trainer definition that hasn't been manually switched.
- The BST formula, moveset scorer, combo bonus system, ability caps — all run identically inside `rateContextual`.

---

## Known Limitations

**No TMs in the cache.** The 25 pre-computed caps use `tms: []`. A trainer who actually has MOVE_FLAMETHROWER in their bag would get a higher contextual rating for Growlithe than the cache shows. The cache is accurate for pokemon whose strength comes from level-up moves. For TM-heavy trainers, the cache is conservative (undershoots real contextual strength).

This is intentional for Phase B — it handles the cases the generic rating gets most wrong (early-game move-dependent threats) without overcomplicating the cache. A future pass could call `rateContextual(poke, moves, abilities, { level, tms: trainer.tms })` per-slot at selection time for high-priority trainers.

**Trainer level interpolation uses nearest-lower cap.** A trainer at level 13 uses cap 12, not cap 14. This slightly undershoots the real universe at that level. It is accurate enough for filtering purposes.

**Megas are not contextually rated differently.** `rateContextual` runs on the same pokemon object as `ratePokemon`. A Mega's contextual rating at level 20 reflects its stats correctly but the mega stone availability constraint is not modeled here.

---

## Validation Test Cases

After switching early-game trainers to `contextualTier`, manually verify:

| Pokemon | Trainer level | Expected contextual tier | Reason |
|---------|--------------|--------------------------|--------|
| Snubbull | 7 | UU | Ice/Thunder/Fire Fang from level 1 — massive tri-coverage |
| Poochyena | 7 | PU/NU | Bite only — one dark move, nothing else |
| Geodude | 9 | RU | Rock Throw + decent bulk, no coverage |
| Beldum | 7 | MAGIKARP | Take Down only — effectively can't fight |
| Magikarp | 9 | MAGIKARP | Splash/Tackle — can't contribute |
| Shroomish | 9 | RU–UU | Spore is enormous at level 9 |
| Abra | 10 | UU | High SpA even at low level, Teleport + future Psychic |
| Machop | 14 | UU | Low Kick + Karate Chop early, Fighting coverage rare at this stage |
| Gastly | 16 | RU | Lick + Hypnosis is powerful but very frail |
| Ralts | 10 | NU–RU | Confusion is decent but very frail and slow |

---

## Next Steps

- **Step 4 (analysis):** Run `node analyze_no_rebalance.js --analyze` (or add a dedicated contextual analysis flag) to print, for every early-game trainer (level ≤ 26), what pokemon they picked before vs after switching to `contextualTier`. Flag any trainer whose team changed.
- **Step 5 (trainer updates):** Switch early trainer definitions (routes 101–110) from `absoluteTier` to `contextualTier` based on the analysis output.
- **Step 6 (validation):** Verify `poke.rating` is identical between a generic run and a contextual run. Wild tiers must not change.
