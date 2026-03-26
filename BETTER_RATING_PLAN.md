# Better Rating Plan

## Context

The current system rates pokemon on a 0–10+ scale with 7 tiers (BAD → GOD), weighting BST at 80%, moves at 10%, and ability at 10%. BST thresholds act as safety floors so high-BST pokemon are never under-tiered. This works well in the late game but has two major failure modes:

1. **Moveset outliers are invisible.** A pokemon with a game-breaking early moveset (Snubbull with coverage punches, Sandile with Hone Claws + Power Trip) gets no credit for it. A pokemon with terrible moves and average BST (Magikarp, Beldum, Applin) gets the same tier as a pokemon that can actually fight.
2. **The worst tier is too coarse.** Everything below 5.0 is TIER_BAD, but there's a huge difference between a pokemon that's merely weak and one that is genuinely useless at any stage of the game.

The plan fixes both problems in two phases.

---

## Phase A — Optimize the Current Tiering System

### A1 — Split TIER_BAD into three sub-tiers

**Goal:** Give trainers finer control over early-game pokemon quality.

**Current state:** Everything below 5.0 is `TIER_BAD`. This makes it impossible to tell apart "situationally useful in early game" from "completely useless at all stages."

**New tiers below TIER_WEAK (5.0):**

| Tier | Name | Score range | Meaning |
|------|------|-------------|---------|
| TIER_BAD | Bad | 4.0–4.9 | Usable filler. Weak but has some moves. |
| TIER_TRASH | Trash | 3.0–3.9 | Almost never worth using. Poor stats AND poor moves. |
| TIER_USELESS | Useless | < 3.0 | Beldum, Magikarp, Applin tier. Literally cannot contribute at any game stage. |

**Steps:**
- A1a. Add the two new constants to `constants.js`.
- A1b. Update `ratePokemon` in `rating.js` to assign the new tiers.
- A1c. Update all POKEDEF templates in `writer.js` that reference `TIER_BAD` to specify which of the three sub-tiers they actually want.
- A1d. **Analysis:** Print a sorted list of all pokemon landing in each new sub-tier. Manually verify 20–30 edge cases. Adjust score thresholds until the split feels right. Pay special attention to every pokemon that appears in routes 101–110.

### A2 — Eviolite boost for defensive NFE pokemon

**Goal:** NFE pokemon with good defensive bulk should rate higher because late-game trainers can give them Eviolite (+50% Def and SpDef), making them tankier than many final evolutions.

**Current state:** NFE pokemon are rated on their raw stats. Eviolite is in item pools but the rating algorithm does not account for it.

**Approach:**
- A2a. In `ratePokemon`, after computing `defensePower` for an NFE pokemon, apply a multiplier to the defensive component only. Proposed: `× 1.35` for `EVO_TYPE_NFE_OF_3`, `× 1.25` for `EVO_TYPE_LC_OF_2` (less powerful since they have fewer levels at NFE stage before evolving or being boxed).
- A2b. Gate this bonus behind a minimum defensive bulk threshold — a glass-cannon NFE should not benefit from Eviolite math.
- A2c. **Analysis:** List all NFE pokemon whose tier changes due to this bonus. Check that none of them jump more than one tier (if they do, reduce the multiplier).
- A2d. Update trainer definitions that explicitly ask for NFE pokemon (mid and late-game trainers) to now consider the new tier distribution.

### A3 — Same-type move redundancy filter

**Goal:** When choosing a moveset, never keep two moves of the same type unless there is a specific reason (e.g. one is a status move, one is a damage move, or one gets a specific ability boost).

**Current state:** There is a `−70% penalty` for a second same-type damage move, but it still gets selected sometimes.

**Steps:**
- A3a. Audit `chooseMoveset` in `rating.js`. Identify the cases where two same-type damage moves end up in the final set.
- A3b. Harden the filter: after move selection, post-process the final 4-move set and remove the lower-rated same-type damage move unless one of these exceptions applies:
  - One is a status move (Thunder Wave, Will-O-Wisp, etc.)
  - One has a unique priority tier (Extreme Speed vs Quick Attack)
  - One is a Z-move equivalent or Max move placeholder
  - Ability explicitly differentiates them (Iron Fist + Mach Punch vs Close Combat)
- A3c. **Analysis:** Run the new filter over all ~1000 pokemon. Print any pokemon that lost a move it "shouldn't" have lost. Iterate.

### A4 — Better coverage analysis

**Goal:** Score a moveset not just by the sum of move ratings but by how many of the 18 types it hits super-effectively and how many types can wall the entire set.

**Current state:** Coverage is tracked loosely via `coverageRating` but it does not actually count resisted/immune types.

**New metrics to compute per moveset:**
- `superEffectiveCount`: number of types (0–18) that at least one move hits for ≥ 2×
- `wallCount`: number of types that resist or are immune to ALL moves in the set (the trainer must switch)
- `coverageScore`: `(superEffectiveCount / 18) × 10 − (wallCount / 18) × 5` (proposed formula, tunable)

**Steps:**
- A4a. Write `computeCoverageMetrics(moveset, types)` in `rating.js` that iterates all 18 types and counts the above.
- A4b. Integrate `coverageScore` into the moves component of the rating: `movesRating = (existingMovesRating × 0.7) + (coverageScore × 0.3)`.
- A4c. **Analysis:** Find pokemon whose `wallCount` is 0 (hit everything super-effectively or neutrally). Find pokemon whose `wallCount` ≥ 10 (completely exploitable). Verify both ends make intuitive sense.
- A4d. Tune the 0.7/0.3 weights based on analysis output.

### A5 — Smogon historic tier research

**Goal:** Build a curated list of move+move and move+ability combos that made pokemon outperform their BST — these are the "outlier signals" the rating system should understand.

**Scope:** Focus on Gen 3–6 OU and Ubers. Ignore pokemon that were there purely for BST (Mewtwo, Arceus, etc.). Look for pokemon at or below ~580 BST that consistently placed in OU or higher.

**Research targets (starting list — expand during research):**
- Baton Pass chains (Scolipede, Espeon)
- Sub + Toxic stall combos (Gliscor: Poison Heal + Substitute + Toxic)
- Setup sweepers with poor BST but broken moves (Swords Dance + priority, Dragon Dance + high speed)
- Trick Room setters (Reuniclus: Magic Guard + Calm Mind)
- Pivots (U-turn + Volt Switch + Regenerator)
- Hazard setters (Stealth Rock + recovery, Spikes + Rapid Spin denial)

**Steps:**
- A5a. Research and compile a `COMBO_NOTES.md` document listing: pokemon name, BST, what tier they were in, which specific combo made them viable, which ability or move was the key piece.
- A5b. From the notes, extract abstract combo patterns: e.g. "Substitute + status immunity ability," "setup move + speed tier beats common threats," "pivoting move + recovery."
- A5c. Map each pattern to detectable signals in our data (move IDs, ability IDs, stat thresholds).

### A5.2 — Current system audit + algorithm design

**Goal:** Before implementing combo bonuses, evaluate the current system's strengths and weaknesses against the Smogon research. Produce a design document that explains the new algorithm so A6 is a focused implementation, not an exploration.

**Findings (see `NEW_RATING_ALGORITHM_AFTER_ANALYSIS.md`):**
- The BST calculation (role detection, HUGE_POWER multiplier, Eviolite bonus, BST floors) is solid — do not change it.
- The 80/10/10 weighting means even a perfect moveset barely moves `absoluteRating` by ±0.5. Combo bonuses must be **additive to `absoluteRating` after weighting**, not inside movesRating.
- `comboList` already detects Baton Pass chains during move selection but the bonus is **never wired to `absoluteRating`** — this is the single easiest win.
- 4 of 24 Smogon patterns are fully handled (HUGE_POWER, ADAPTABILITY, TECHNICIAN, SKILL_LINK). 3 are partial. 17 are completely missing.
- Key missing patterns: Magic Guard, Poison Heal, Speed Boost+Protect, Protean/Libero, Contrary+self-lowering, Sub+Toxic+Recovery, Setup+Priority, Hazard+Recovery, Prankster+status.

**New formula for A6:**
```
comboBonus = computeComboBonus(poke, finalMoveset, ability)   // 0 to 1.5, capped
absoluteRating = (bstRating × 0.80) + (movesRating × 0.10) + (bestAbilityRating × 0.10)
absoluteRating += comboBonus   // additive, before BST floor clamps
```

**Steps:**
- A5.2a. Read `NEW_RATING_ALGORITHM_AFTER_ANALYSIS.md` — this is the design doc for A6.
- A5.2b. Dry-run `computeComboBonus` logic mentally against 10 key pokemon (Breloom, Scizor, Gliscor, Serperior, Azumarill, Volcarona, Beldum, Magikarp, Toxapex, Sableye) and verify expected tier outcomes match Part 4 of the design doc.
- A5.2c. Sign off — confirm no pattern causes a >1 tier jump or double-counts an already-handled case.

---

### A6 — Combo-aware rating bonuses

**Goal:** Translate the patterns found in A5 into concrete rating bonuses applied during `ratePokemon`.

**Design principles:**
- Bonuses are additive to the moves component only, never to BST (BST is objective).
- Each bonus is capped to avoid stacking into absurdity.
- Each bonus is documented with the reasoning from A5.

**Proposed combo bonus categories:**

| Category | Example | Bonus |
|----------|---------|-------|
| Setup + sweep | Dragon Dance + high base speed | +0.5 to movesRating |
| Setup + priority | Swords Dance + Extreme Speed | +0.7 |
| Substitute + passive damage | Sub + Toxic/Leech Seed + recovery | +0.6 |
| Pivot | U-turn or Volt Switch + decent speed | +0.3 |
| Hazard setter with longevity | Stealth Rock + reliable recovery | +0.4 |
| Magic Guard or Poison Heal + Toxic/Burn | | +0.5 |
| Mold Breaker / Turboblaze bypassing key immunities | | +0.3 |
| Huge Power / Pure Power (already handled via multiplier) | | — |
| Protean/Libero STAB on everything | | +0.4 |

**Steps:**
- A6a. Implement `computeComboBonus(pokemon, moveset, ability)` function.
- A6b. Integrate into `ratePokemon` as an additive bonus to `movesRating` before final weighting.
- A6c. Cap total combo bonus at +1.5 to movesRating.
- A6d. **Analysis:** List all pokemon whose tier changed due to combo bonuses. Verify manually. Tweak caps and values.
- A6e. Rerun full tier output. Spot-check 50 pokemon across all tiers. Sign off on Phase A.

---

## Phase B — Context-Aware Early Game Rating

### B1 — Design the level-contextual rating algorithm

**Goal:** Given a pokemon at a specific level (the current cap), produce a rating that reflects how good it is *right now*, not at level 100.

**Key insight:** At level 7, Snubbull with Thunder Punch, Ice Punch, and Fire Punch is exceptional because:
1. Its moves hit for high power relative to other pokemon at that level.
2. It covers many types at a stage where most pokemon have only Normal or Water moves.
3. Its stats are average, but the moves carry it.

At level 50, Snubbull is mediocre because other pokemon have caught up in moves and its stats are unremarkable.

**The contextual rating = f(level_cap)** where:
- Moves are evaluated relative to the typical damage output at that level.
- Coverage is more valuable at low levels (fewer pokemon have it).
- Stats matter more as the game progresses (BST weight increases with level cap).
- Setup moves are worth more at mid-game caps when battles are long enough to use them.

**Algorithm sketch:**

```
contextualRating(pokemon, level_cap):
  levelset = moves available at or below level_cap (learnset + TMs available)
  contextualMovesRating = rateMoveset(levelset, level_cap)
  coverageMetrics = computeCoverageMetrics(levelset)
  comboBonus = computeComboBonus(pokemon, levelset)

  bstWeight = lerp(0.4, 0.8, normalize(level_cap, 5, 70))
  moveWeight = lerp(0.5, 0.15, normalize(level_cap, 5, 70))
  coverageWeight = lerp(0.1, 0.05, normalize(level_cap, 5, 70))

  return bstComponent * bstWeight
       + contextualMovesRating * moveWeight
       + coverageMetrics.coverageScore * coverageWeight
       + comboBonus
```

Where `lerp(a, b, t)` linearly interpolates from `a` to `b` as level_cap goes from 5 to 70. In the early game, moves dominate. In the late game, BST dominates (and beyond level 70, contextual rating is deactivated entirely — use the regular absolute rating).

**Move power normalization at a given level:**
- Compute the median damage output of all moves available to all pokemon at that level.
- Score each move relative to that median, not relative to the fixed 140-power ceiling.
- This makes Tackle terrible at any stage and Ice Punch excellent at level 7.

**Steps:**
- B1a. Write a utility `getLearnsetAtLevel(pokemon, level_cap, trainerBag)` that returns moves from learnset up to that level plus any TMs present in that trainer's specific item bag. TM availability is trainer-specific, not stage-specific — a trainer's bag is already defined in `trainers.js` so this is a direct lookup, not a global map.
- B1b. Write `computeMedianMovePower(all_pokemon, level_cap)` that samples the distribution of move power across all pokemon at that cap (learnset moves only, no TMs, since this is a population baseline).
- B1c. Write `rateMoveset_contextual(moveset, level_cap, median_power)` using the normalized power scoring.
- B1d. Write `computeContextualRating(pokemon, level_cap, trainerBag)` combining the above. The `trainerBag` parameter is optional — when absent (e.g. during the pre-computation cache pass) only learnset moves are used. The trainer selection step in B3 passes the actual bag.
- B1e. Items in the trainer bag also affect contextual rating, exactly like TMs. A Choice Band on a fast sweeper, Eviolite on a defensive NFE, or a type-boosting item on a mono-attacker all change how good a pokemon is for that specific trainer. `computeContextualRating` should call the existing `rateItemForAPokemon` logic with each item available in the trainer bag and pick the best fit, feeding that into the final score.
- B1f. Because both TMs and items are trainer-specific, the pre-computation cache in B3a (ratings per cap) is learnset-only and item-free. The full TM+item-aware contextual rating is computed once per pokemon slot during writer selection when the actual bag is known. Two-pass: fast learnset-only cache for coarse filtering, precise bag-aware calculation for the final pick.

### B2 — Analyze and iterate the contextual algorithm

**Goal:** Verify the algorithm actually ranks the examples correctly before integrating it.

**Test cases (minimum — expand as needed):**

| Pokemon | Level cap | Expected result | Reason |
|---------|-----------|-----------------|--------|
| Snubbull | 7 | High (STRONG or above) | Ice/Thunder/Fire Punch at level 1 |
| Sandile | 9 | High | Hone Claws + Power Trip combo |
| Munna | 10 | High | Defense Curl + Stored Power |
| Beldum | 7 | USELESS | Only knows Take Down |
| Magikarp | 9 | USELESS | Only knows Splash/Tackle |
| Applin | 10 | USELESS | Only knows Withdraw/Astonish |
| Abra | 10 | STRONG | Telekinesis + Psychic with high SpAtk |
| Ralts | 10 | AVERAGE | Confusion is okay but frail |
| Shroomish | 9 | AVERAGE–STRONG | Spore is huge but frail |
| Geodude | 9 | AVERAGE | Rock Throw + decent bulk |

**Steps:**
- B2a. Run `computeContextualRating` for all test cases across 4 key level caps: 7, 10, 16, 26.
- B2b. Print a full sorted ranking of all pokemon for each cap. Review top 20 and bottom 20.
- B2c. Identify false positives (bad pokemon rating too high) and false negatives (good pokemon rating too low).
- B2d. Tune `bstWeight`, `moveWeight`, `coverageWeight` lerp curves until test cases pass.
- B2e. Specifically validate that the rating degrades gracefully: Snubbull at level cap 40 should not still be STRONG.
- B2f. Sign off on algorithm before proceeding to B3.

### B3 — Integrate contextual rating into trainer selection

**Goal:** Trainers at each game stage pick pokemon based on contextual tier, not absolute tier.

**Current state:** Trainers use `absoluteTier` filter in POKEDEF, which uses the absolute rating.

**New field:** Add `contextualTier` to POKEDEF. When set, the selection system computes `computeContextualRating(pokemon, trainer_level_cap)` at runtime and filters on that.

**Efficiency concern:** Computing contextual rating for ~1000 pokemon per trainer slot at generation time is acceptable (it's a build step, not runtime in the GBA). But it needs to be fast enough that the full writer pass completes in < 30 seconds.

**Optimization strategy:**
- Pre-compute contextual ratings for all pokemon at each of the 34 level caps during `index.js` startup. Cache as `pokemon.contextualRatingByLevel[cap]`.
- Trainer selection then just reads the cached value — O(1) lookup.

**Steps:**
- B3a. In `index.js`, after the main rating pass, run a second pass computing `computeContextualRating(pokemon, cap)` for each of the 34 caps and storing it.
- B3b. Add `contextualTier` field to the POKEDEF schema in `writer.js`. When present, use `contextualRatingByLevel[trainer_level_cap]` for filtering instead of `absoluteRating`.
- B3c. Update early-game trainers (caps 7–26) to use `contextualTier`. Mid-game trainers (caps 27–50) may use either or a blend. Late-game trainers (caps 51+) use `absoluteTier`.
- B3d. Add a fallback: if `contextualTier` is set but no pokemon match, fall back to `absoluteTier` to avoid empty teams.
- B3e. **Analysis:** Generate a test ROM run. Review early trainer teams manually. Verify no USELESS pokemon appear on early trainers and no GOD-tier pokemon appear before gym 3.

### B4 — Scale analysis and late-game deactivation

**Goal:** Ensure the contextual system doesn't introduce imbalance at mid or late game, and deactivate it cleanly for endgame trainers.

**Expected behavior:**
- Caps 5–26 (early game): Contextual rating is primary, heavily move-weighted.
- Caps 27–50 (mid game): Contextual rating blends with absolute (BST weight rising).
- Caps 51+ (late game): Absolute rating only. Contextual system fully deactivated.

**Steps:**
- B4a. Define the three zones above as constants in `constants.js`.
- B4b. For each of the 34 level caps, plot the BST weight and move weight from the lerp formula. Verify the curve is smooth with no jumps.
- B4c. Generate trainer teams for every trainer in the game using the new system. For each trainer, verify:
  - The pokemon on the team could plausibly appear at that game stage.
  - No pokemon is more than 1 contextual tier above the trainer's designated tier.
  - No USELESS pokemon appear unless it's specifically a "joke trainer" or early wild encounter.
- B4d. Identify any caps where the transition causes a sudden quality jump or drop in trainer teams. Smooth the lerp curve at those points.
- B4e. Final pass: run the full `node ./puppedjs/index.js` and review the complete output. Fix any remaining anomalies.
- B4f. Document final weight values and thresholds in `constants.js` with comments explaining the reasoning.

---

## Execution Order

Work strictly in this order. Do not start a step until its analysis sub-step is complete and signed off.

```
A1 → A1d (analysis) → A2 → A2c (analysis) → A3 → A3c (analysis)
→ A4 → A4c (analysis) → A5 (research) → A5.2 (audit + design) → A5.2c (sign-off) → A6 → A6d (analysis) → A6e (sign-off)
→ B1 → B2 → B2f (sign-off) → B3 → B3e (analysis) → B4 → B4f (done)
```

Each analysis step produces printed output that we review together before proceeding.

---

## Phase C — Game-Accurate Learnset Tiering

### C1 — Audit which competitive moves are actually available

**Problem:** The rating system evaluates every move in a pokemon's learnset, including moves from egg moves, event tutors, and cross-gen TMs that are NOT in this game's TM pool. A pokemon may receive credit for `MOVE_BELLY_DRUM`, `MOVE_AQUA_JET`, `MOVE_GRASSY_GLIDE`, `MOVE_BULLET_PUNCH`, or `MOVE_ROOST` when none of these moves can be taught in this ROM.

This inflates ratings for pokemon whose competitive ceiling depends on these moves:
- **Azumarill**: rated on HUGE_POWER + Aqua Jet potential, but Aqua Jet and Belly Drum are unavailable → correctly NU/WEAK in this game.
- **Rillaboom**: GRASSY_SURGE combo fires because `MOVE_GRASSY_GLIDE` is in the learnset data, but the move is not in any teachable pool → no real combo.
- **Corviknight**: credited for Roost and U-turn, neither of which are in the TM pool → vastly over-rated.
- **Scizor**: TECHNICIAN+priority combo fires, but Bullet Punch is not teachable → combo should not fire.

**Goal:** Tier pokemon based only on moves they can actually learn in this game — level-up learnset + this game's actual TM/HM pool.

### C2 — Separate "species learnset" from "game-available learnset"

**Approach:**
- C2a. Enumerate the actual TM list available in this game (`include/constants/tms_hms.h`).
- C2b. In `rating.js`, when computing `allLearnableMoves` for combo detection, filter out any move that is neither in the level-up learnset nor in the game's TM list.
- C2c. The move rating pass (`rateMoveset`) should continue using the full learnset (to pick the best possible moveset for a trainer to give), but `computeComboBonus` and `hasReliableRecovery` should use the filtered "game-available" set.

**Why separate the two:** Trainers in this game CAN give pokemon any move from their full learnset via the party editor — so the moveset selection stays broad. But competitive tier depends on what moves a player can actually access, which is TM-restricted.

### C3 — Document game-vs-Smogon tier discrepancies

After C2 is implemented, produce a list of pokemon whose tier changes between "full learnset rating" and "game-available learnset rating." This list explains why some pokemon rate lower than their Smogon equivalents and should be referenced in trainer design decisions.

**Known cases (pre-C2 research):**
| Pokemon | Key missing move(s) | Impact |
|---------|---------------------|--------|
| Azumarill | Belly Drum, Aqua Jet | WEAK instead of OU |
| Rillaboom | Grassy Glide | STRONG instead of OU |
| Corviknight | Roost, U-turn | AVERAGE instead of OU |
| Scizor | Bullet Punch, Roost | STRONG instead of OU |
| Tapu Bulu | Grassy Glide | STRONG instead of OU |
| Annihilape | Drain Punch | STRONG instead of OU |

### C4 — Steps

- C4a. Parse `include/constants/tms_hms.h` to extract the full TM list as a Set of move IDs.
- C4b. In `index.js`, pass the TM set to `ratePokemon` alongside the pokemon data.
- C4c. In `ratePokemon`, compute `gameAvailableMoves = levelUpMoves ∪ tmMoves` and pass this to `computeComboBonus` instead of `allLearnableMoves`.
- C4d. Run the pipeline and generate the discrepancy list (see C3).
- C4e. Review the discrepancy list. Verify that no pokemon that should be OU drops below STRONG due to a missing TM that should be present. Add missing TMs to the game's TM pool if warranted (e.g. if Corviknight without Roost is intentional, accept it; if it's a learnset gap in the source data, patch the TM list).

---

## Files Affected

| File | Changes |
|------|---------|
| `puppedjs/constants.js` | New tier constants, level zone constants |
| `puppedjs/rating.js` | Eviolite bonus, coverage metrics, combo bonuses, contextual rating functions |
| `puppedjs/writer.js` | `contextualTier` POKEDEF field, trainer zone logic |
| `puppedjs/index.js` | Contextual rating pre-computation pass |
| `COMBO_NOTES.md` (new) | Research output from A5 |
| `smogon_analysis/` (new) | Full Smogon Gen5-9 research from A5 |
| `NEW_RATING_ALGORITHM_AFTER_ANALYSIS.md` (new) | A5.2 audit + algorithm design doc |
