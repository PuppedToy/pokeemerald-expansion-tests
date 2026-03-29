# New Level-Based Rating System

## Why We Are Doing This

The current system produces a single **generic rating** for each pokemon — a number from 0–10+ computed assuming level 100, full TM availability, and all items in the game. This is the right rating for wild pokemon placement (encounter curves, rarity gates, Dex completion), because we want to know the full long-term threat potential of a pokemon the player might obtain.

**But trainers are different.** A trainer at route 104 level 12 has:
- Only the moves a pokemon learns up to level 12
- Only the TMs in their specific bag (usually 0–2)
- Only the items in their specific bag (usually 0–1)

That is a much smaller universe. The generic rating evaluates a pokemon's ceiling; the trainer needs to know what the pokemon is worth *right now*, in the trainer's specific universe.

### The Three Cases the Generic Rating Gets Wrong for Trainers

**Case 1 — Move-dependent late-game threats:** Snubbull has three typed elemental fangs (Ice/Thunder/Fire Fang) from level 1. But its generic rating is unremarkable because its BST 300 dominates at 80% weight and its level 100 moveset is nothing special. At route 104 a trainer assigning Snubbull would see it as weak — but in context it is a coverage monster that outclasses every other pokemon at that level cap.

**Case 2 — Frail early-game tools:** Some pokemon that are weak late-game have above-average moves early. Poochyena with Bite is only slightly better than Tackle, but the trainer should see it as mediocre. The generic rating may similarly undersell or oversell various pokemon for early-game situations.

**Case 3 — Linear pokemon:** Some pokemon feel about the same strength throughout the game (Machop line, Geodude line) — stable across level caps because their stats and moves scale consistently. The generic rating handles these fine, but we still want trainers to reflect the actual move pool at their level.

### The Key Principle

> **The contextual rating is the generic rating applied to a smaller universe.** It is not a different algorithm — it is the same algorithm receiving fewer inputs (learnset capped at a level, only TMs in the bag, only items in the bag). The tier output naturally changes because the inputs changed.

This means:
- Generic rating = `ratePokemon(poke, moves, abilities, tmPool)` with full `tmPool` and full `learnset`
- Contextual rating = `ratePokemon(poke, moves, abilities, trainerTMs)` with `learnset` capped at `trainer.level` and `trainerTMs` = only moves in the trainer's `tms` array

**The generic rating must not change at all.** Wild pokemon, rarity gates, Dex entries, and the existing tier system all depend on it. We are only adding a new function path that computes a situational variant.

---

## How the Current System Works (What We Are Building On)

### Rating pipeline (`index.js` → `rating.js`)

1. **`index.js`** loads all pokemon data, parses learnsets, loads TM pool from `tms_hms.h`, and calls `ratePokemon(poke, moves, abilities, tmPool)` once per pokemon. The result is stored at `poke.rating`.

2. **`ratePokemon(poke, moves, abilities, tmPool)`** in `rating.js`:
   - Computes `bestAbilityRating` from `abilities.h` (capped for surge/weather/ATE abilities)
   - Applies stat multipliers for HUGE_POWER, BEAST_BOOST, etc.
   - Detects the pokemon's role (OFFENSIVE / DEFENSIVE / TANK / BALANCED) from stat distribution
   - Computes `bstRating` by normalizing BST against role-specific best/worst values
   - Calls `chooseMoveset(poke, moves, level=100, [], ability, null, tmPool)` to pick the best 4-move set
   - Calls `rateMovesetForPokemon(moveset, poke, ability)` to score the moveset
   - Computes `movesRating` from the scored moveset
   - Calls `computeComboBonus(poke, moveset, moves, tmPool)` to detect synergistic patterns
   - Combines: `absoluteRating = (bstRating × 0.80) + (movesRating × 0.10) + (bestAbilityRating × 0.10) + comboBonus`
   - Applies BST floors, frailty caps, and special floors (IMPOSTER, STRONG_JAW, SWORD_OF_RUIN, etc.)
   - Returns a rating object with `absoluteRating`, `tier`, `bonusLog`, `role`, etc.

3. **`computeComboBonus(poke, moveset, moves, tmPool)`** detects synergies:
   - Uses `allLearnableMoves` which is `levelUpMoves ∪ tmPool` — **this is already TM-filtered**
   - Checks patterns like SETUP+PRIORITY, HAZARD+REST, LIQUID_VOICE+HYPER_VOICE, etc.
   - Returns a bonus (0 to 1.6) added directly to `absoluteRating`

4. **`chooseMoveset(poke, moves, level, startingMoveset, ability, item, tmsInBag)`**:
   - Already level-aware: `poke.learnset.filter(ls => ls.level <= level)`
   - Already TM-aware: `tmsInBag ? poke.teachables.filter(tm => tmsInBag.includes(tm)) : poke.teachables`
   - This is the function trainers call at assignment time (line 1468 in writer.js) — it already works correctly for contextual use

### Trainer selection pipeline (`writer.js`)

1. Trainer has a `level`, `tms` array, `bag` array, `team` definition array
2. For each slot in `team`, `choosePokemonFromDefinition` filters `allPokes` by:
   - `absoluteTier` — the **generic tier** of the pokemon (e.g. `['PREMIUM', 'LEGEND']`)
   - `checkValidEvo` — can the pokemon realistically evolve at this level?
   - `type`, `evoType`, `abilities`, `megaTier`, etc.
   - Sorts by `poke.rating.absoluteRating` (generic rating) for `pickBest`
3. After selection, `chooseMoveset(pokemon, moves, trainer.level, ..., trainer.tms)` is called — **already level+TM-aware**
4. `rateItemForAPokemon(item, pokemon, ability, moveset, trainer.level, ...)` rates items

**The gap:** Step 2 filters by generic tier. A trainer asking for `TIER_AVERAGE` pokemon might get a pokemon that is genuinely AVERAGE at level 100 but is either much stronger or much weaker at the trainer's actual level. The filter is right on average but wrong for outliers.

---

## What We Need to Build

### The Core Function: `rateContextual(poke, moves, abilities, context)`

A thin wrapper around `ratePokemon` that restricts its inputs to a trainer's universe:

```js
function rateContextual(poke, moves, abilities, context) {
    // context = { level, tms: [...], items: [...] }

    // Build a restricted poke view: learnset capped at context.level
    const restrictedPoke = {
        ...poke,
        learnset: poke.learnset.filter(entry => entry.level <= context.level),
    };

    // Build a restricted TM pool: only TMs the trainer actually has
    const restrictedTmPool = new Set(context.tms || []);

    // Run the exact same ratePokemon logic on restricted inputs
    return ratePokemon(restrictedPoke, moves, abilities, restrictedTmPool);
}
```

That is the entire new function. The insight is that `ratePokemon` already accepts `tmPool` and `chooseMoveset` already respects `level` — we just need to pipe in restricted versions of both.

**Why this works:** When `ratePokemon` runs with a learnset capped at level 12 and a TM pool of only `['MOVE_BITE']`, `chooseMoveset` will only consider level ≤ 12 moves + MOVE_BITE. `computeComboBonus` uses `allLearnableMoves = levelUpMoves ∪ tmPool`, which will also be restricted. The same algorithm produces a lower rating for Beldum (Take Down only at level 12) and a higher relative rating for Snubbull (three typed punches at level 1).

### Pre-computation Cache (`index.js`)

We do not want to call `rateContextual` live during trainer selection — that would be ~1000 pokemon × ~34 level caps = ~34,000 `ratePokemon` calls per run, which may be slow. Instead, pre-compute a cache after the main rating pass:

```js
// After the main rating pass in index.js:
const LEVEL_CAPS = [5, 7, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35, 38, 40, 43, 46, 50, 55, 60, 65, 70];

for (const poke of allPokes) {
    poke.contextualRatings = {};
    for (const cap of LEVEL_CAPS) {
        // No-item, no-TM baseline: learnset only up to cap
        poke.contextualRatings[cap] = rateContextual(poke, moves, abilities, { level: cap, tms: [] });
    }
}
```

This gives us a learnset-only baseline per level cap. It is conservative (no TMs) but sufficient for filtering: if a pokemon is terrible at level 12 even with its own learnset, it doesn't belong on a level-12 trainer.

**Trainer-specific TM context:** For the final pick, when we know the trainer's actual `tms` array, we compute one precise contextual rating with TMs included. This is one `rateContextual` call per selected pokemon slot, not per candidate — acceptable cost.

### New Trainer Filter: `contextualTier`

Add a new optional field to POKEDEF alongside `absoluteTier`:

```js
// Current POKEDEF (unchanged):
{ absoluteTier: ['AVERAGE', 'STRONG'], checkValidEvo: true }

// New POKEDEF option:
{ contextualTier: ['AVERAGE', 'STRONG'], checkValidEvo: true }

// Both can coexist (contextual overrides absolute when present):
{ absoluteTier: ['AVERAGE'], contextualTier: ['AVERAGE', 'STRONG'], checkValidEvo: true }
```

When `contextualTier` is present in a POKEDEF slot, `choosePokemonFromDefinition` uses `poke.contextualRatings[trainer.level].tier` for filtering instead of `poke.rating.tier`. Sorting by `pickBest` also uses `contextualRatings[trainer.level].absoluteRating`.

**Fallback:** If no candidates match `contextualTier`, fall back to `absoluteTier` as before. This prevents empty teams.

### Which Trainers Get Updated

We do **not** change all trainers at once. A phased rollout:

| Game stage | Level cap range | Approach |
|---|---|---|
| Early game | ≤ 26 | Switch to `contextualTier`. These are most affected by the BST-vs-moves gap. |
| Mid game | 27–50 | Leave as `absoluteTier` for now. Revisit after early game is validated. |
| Late game | 51+ | Stay `absoluteTier` permanently. Their universe approaches the full one anyway. |

---

## Implementation Steps

### Step 1 — Add `rateContextual` to `rating.js`

- Write the function as described above.
- Export it alongside `ratePokemon`.
- Add unit test: call `rateContextual(Snubbull, ..., { level: 7, tms: [] })` and verify it rates higher than `rateContextual(Poochyena, ..., { level: 7, tms: [] })` purely from move coverage.
- Verify: calling `rateContextual(poke, ..., { level: 100, tms: [...fullTmPool] })` produces the **exact same result** as `ratePokemon(poke, ...)`. This is the contract that proves generic rating is unchanged.

### Step 2 — Pre-compute contextual cache in `index.js`

- After `poke.rating = ratePokemon(...)`, add the contextual pass.
- Store at `poke.contextualRatings = { [cap]: ratingObject, ... }`.
- Include contextual ratings in `pokes.js` output so the HTML viewer can show them.
- Performance check: measure wall-clock time before/after. Target: < 15 seconds added to total pipeline.

### Step 3 — Add `contextualTier` filter to `writer.js`

- In `choosePokemonFromDefinition`, after the `absoluteTier` filter block (~line 1167), add:

```js
if (trainerMonDefinition.contextualTier) {
    const cap = trainer.level;
    pokemonLooseList = pokemonLooseList.filter(loosePokemon => {
        const contextual = loosePokemon.contextualRatings?.[cap]
            ?? loosePokemon.contextualRatings?.[nearestCap(cap, LEVEL_CAPS)];
        return contextual && trainerMonDefinition.contextualTier.includes(contextual.tier);
    });
}
```

Where `nearestCap(level, caps)` returns the closest cap in the precomputed set (handles trainers at levels not in the exact list).

- Update `pickBest` sorting to use `contextualRatings[trainer.level].absoluteRating` when `contextualTier` is present.

### Step 4 — Analysis pass

Run `node analyze_no_rebalance.js`. For every early-game trainer (level ≤ 26):
- Print what pokemon they had before (generic tier filter) vs after (contextual tier filter).
- Flag any trainer whose team changed.

Review manually:
- Do early trainers now have pokemon whose moves are relevant at that level?
- Does Snubbull appear on early trainers more than it used to? (It should.)
- Does Beldum still not appear on any trainer before it gets Take Down + level 29 Iron Head? (It should not.)

### Step 5 — Update early trainer definitions

After the analysis shows which trainers need updating, switch their `absoluteTier` to `contextualTier` in `trainers.js`. Start with routes 101–110 trainers (the most affected by early-game power gaps).

### Step 6 — Validation

The critical check: run both `analyze_no_rebalance.js` (generic only) and the new pipeline side by side. Verify:
- `poke.rating` is byte-for-byte identical between the two runs for all pokemon.
- Wild encounter tiers are unchanged.
- Only trainer team compositions change.

---

## What Stays the Same (Explicitly)

- `ratePokemon` signature and output — unchanged.
- All existing `absoluteTier` trainer definitions — unchanged until manually updated in Step 5.
- Wild pokemon encounter tables — use `rating.tier` (generic) only, never contextual.
- Rarity gates and Dex entry thresholds — use generic tier.
- The combo bonus system, ability caps, weather system, BST formula — all unchanged.
- `BETTER_RATING_PLAN.md` Phase A and C — already done, not touched.

---

## Key Validation Test Cases

After Step 4, manually verify these expected outcomes:

| Pokemon | Trainer level | Expected contextual tier | Reason |
|---------|--------------|--------------------------|--------|
| Snubbull | 7 | STRONG | Ice/Thunder/Fire Fang from level 1 — massive coverage |
| Poochyena | 7 | BAD/WEAK | Bite only — one dark move, nothing else |
| Geodude | 9 | AVERAGE | Rock Throw + decent bulk, but no coverage |
| Beldum | 7 | USELESS | Take Down only — effectively can't fight |
| Magikarp | 9 | USELESS | Splash/Tackle — can't contribute |
| Shroomish | 9 | AVERAGE–STRONG | Spore is enormous at level 9, but it's level-up move |
| Abra | 10 | STRONG | Teleport + future Psychic, high SpA even at low level |
| Machop | 14 | STRONG | Low Kick + Karate Chop early, Fighting coverage rare at this stage |
| Gastly | 16 | AVERAGE | Lick + Hypnosis is powerful but frail |
| Ralts | 10 | WEAK–AVERAGE | Confusion is decent but very frail and slow |

---

## Open Questions (Decide Before Step 1)

1. **LEVEL_CAPS list:** Should we use fixed caps matching actual gym/trainer level curves in the game, or a dense set (every 2 levels)? Dense = larger cache but more accurate interpolation. Fixed = smaller, sufficient for most cases.

2. **Nearest-cap interpolation:** If a trainer is level 13 and our caps are [12, 14], do we use cap 12, cap 14, or average the two ratings? Simplest is nearest-lower (cap 12). Most accurate is linear interpolation of the rating. Recommend nearest-lower to start.

3. **Items in the cache:** The no-item baseline (Step 2) is conservative. A trainer with a Choice Band should see their physical sweeper rate higher. Do we compute a second cache with items? Recommendation: no — the final per-pokemon item rating call at selection time is the right place for this. The cache is for filtering, the precise call is for picking.

4. **Combo bonus with restricted learnset:** When `ratePokemon` runs with only a level-12 learnset, `computeComboBonus` checks `allLearnableMoves = levelUpMoves ∪ tmPool`. At level 12 with no TMs, many combo patterns won't fire (SETUP+RECOVERY requires knowing both Swords Dance and Roost are available). This is the correct behavior — the combo isn't available yet. No change needed.
