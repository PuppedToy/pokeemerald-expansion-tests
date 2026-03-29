# Better Rating Plan

## Progress Overview

| Phase | Status | Summary |
|-------|--------|---------|
| **A** | ✅ DONE | Tier sub-splits, Eviolite, combo bonuses, ability caps, BST floors |
| **B** | ⏸ DEFERRED | Context-aware early-game rating — complex, revisit after C/D settle |
| **C** | ✅ DONE | TM-filtered learnsets, third-wave tier corrections, weather system |
| **D** | 📋 PLANNED | Offensive and defensive typing analysis |

---

## Phase A — Optimize the Current Tiering System ✅ DONE

### A1 — Split TIER_BAD into three sub-tiers ✅

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

### A2 — Eviolite boost for defensive NFE pokemon ✅

**Goal:** NFE pokemon with good defensive bulk should rate higher because late-game trainers can give them Eviolite (+50% Def and SpDef), making them tankier than many final evolutions.

**Current state:** NFE pokemon are rated on their raw stats. Eviolite is in item pools but the rating algorithm does not account for it.

**Approach:**
- A2a. In `ratePokemon`, after computing `defensePower` for an NFE pokemon, apply a multiplier to the defensive component only. Proposed: `× 1.35` for `EVO_TYPE_NFE_OF_3`, `× 1.25` for `EVO_TYPE_LC_OF_2` (less powerful since they have fewer levels at NFE stage before evolving or being boxed).
- A2b. Gate this bonus behind a minimum defensive bulk threshold — a glass-cannon NFE should not benefit from Eviolite math.
- A2c. **Analysis:** List all NFE pokemon whose tier changes due to this bonus. Check that none of them jump more than one tier (if they do, reduce the multiplier).
- A2d. Update trainer definitions that explicitly ask for NFE pokemon (mid and late-game trainers) to now consider the new tier distribution.

### A3 — Same-type move redundancy filter ✅

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

### A4 — Better coverage analysis ✅

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

### A5 — Smogon historic tier research ✅

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

### A5.2 — Current system audit + algorithm design ✅

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

### A6 — Combo-aware rating bonuses ✅

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

## Phase B — Context-Aware Early Game Rating ⏸ DEFERRED

**Why deferred:** Phase B is the most complex and risky change — it rewrites how trainers select pokemon. It was intentionally skipped to stabilize Phase A and C first. The absolute rating system is now solid enough that Phase B can be built on top without regressions.

**What Phase B does:** Trainers at early game stages (caps 5–26) pick pokemon based on a contextual rating that is heavily move-weighted, not BST-weighted. This fixes the current failure mode where a move-heavy early pokemon (Snubbull with Ice/Thunder/Fire Punch at level 7) gets treated the same as a stat-heavy one.

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

## Phase C — Game-Accurate Learnset Tiering ✅ DONE

### What was planned

Phase C was originally scoped as: filter combo detection to only moves actually available in this game's TM pool, and identify/add missing TMs for key pokemon.

### What was actually done (beyond the original spec)

**C1 — TM-filtered rating (the original scope) ✅**
- Added `--all-tms` mode and `analyze_no_rebalance_all_tms.js` to compare game-available vs full learnset ratings.
- Combos now filter to `levelUpMoves ∪ gameTMPool` for tier calculation.
- Added three analysis scripts with proper `git restore src/ include/` cleanup.

**C2 — Third-wave tier corrections ✅**
Systematic review of all incorrectly-modeled mons from `smogon_analysis/incorrected_modeled_mons.md`:

*Overvalued fixes:*
- Alakazam Mega: LEGEND → PREMIUM — MAGIC_GUARD combo reduced; ability cap at 7.5
- Gengar Mega: GOD → LEGEND — SHADOW_TAG ability capped at 7.5
- Blaziken Mega: GOD → LEGEND — SPEED_BOOST ability capped at 6.5
- Gardevoir Mega: LEGEND → PREMIUM — frail mega cap (Def ≤ 65 + BST ≥ 600); PIVOT+RECOVERY requires Def ≥ 75; -ATE abilities capped at 7.0
- Sceptile Mega: LEGEND → PREMIUM — LIGHTNING_ROD type-conditional (capped at 4.5 when not Electric-weak)
- Abomasnow Mega: (partial fix) — SNOW_WARNING mega capped at 5.0; full fix deferred to Phase D

*Undervalued fixes (new combo bonuses and learnset additions):*
- Kingambit → OU: SUPREME_OVERLORD +0.75 (+0.30 with setup/priority); added Sucker Punch
- Primarina → OU: LIQUID_VOICE+HYPER_VOICE +0.60; added Hyper Voice + Wish; OU floor
- Tapu Bulu → OU: added Grassy Glide (triggers GRASSY_SURGE+GLIDE combo)
- Corviknight → OU: BODY_PRESS+IRON_DEFENSE +0.55; MIRROR_ARMOR +0.25; added moves + OU floor
- Skeledirge → UU: UNAWARE+TORCH_SONG+recovery floor; added Slack Off
- Great Tusk → OU: added Stealth Rock (HAZARD+REST combo)
- Iron Treads → OU: added Stealth Rock + Swords Dance
- Gouging Fire → Uber: added Dragon Dance; PROTOSYNTHESIS+setup+Atk≥110+BST≥585 floor
- All Tapus → OU: terrain surge combos already present; Tapu Fini MISTY_SURGE+setup floor
- Flutter Mane → Uber, Roaring Moon → Uber, Chien-Pao → Uber, Chi-Yu → Uber
- Iron Bundle → Uber, Urshifu (both) → Uber
- Rillaboom → OU: added Grassy Glide
- Regieleki → Uber: SPEED 200+ bonus

*New combo bonuses added to `computeComboBonus`:*
- PROTOSYNTHESIS/QUARK_DRIVE: +0.45 base (+0.20 if offensive, +0.20 if speed booster)
- Ruin abilities: BEADS_OF_RUIN +0.50, SWORD_OF_RUIN +0.50, TABLETS_OF_RUIN +0.30, CHAIN_OF_RUIN +0.30
- SUPREME_OVERLORD: +0.75 (+0.30 with setup or priority)
- LIQUID_VOICE+HYPER_VOICE: +0.60
- GOOD_AS_GOLD: +0.35
- SCRAPPY+Atk≥100: +0.35
- BODY_PRESS+IRON_DEFENSE: +0.55
- MIRROR_ARMOR: +0.25
- UNSEEN_FIST+always-crit: +1.50 (bonusCap raised to 2.0 for UNSEEN_FIST)

**C3 — Weather system ✅**
Weather abilities previously had zero combo bonus (terrain surges did). Added full weather combo system:
- DRIZZLE: +0.40 base; +0.35 Thunder/Hurricane (100% acc); +0.20 Water STAB; +0.20 recovery
- DROUGHT: +0.40 base; +0.30 Solar Beam/Blade (instant); +0.25 Fire STAB
- SAND_STREAM: +0.30 base; +0.20 Rock type SpDef boost
- SNOW_WARNING: +0.25 base; +0.30 Blizzard (only if SpA ≥ 100 AND Speed ≥ 80)
- Weather abilities capped at 7.5 in ability rating (same as terrain surges)
- Mega DROUGHT/DRIZZLE capped at 4.0 (no Heat Rock / Damp Rock)
- DRIZZLE/DROUGHT final-evo floor: OU if has recovery/pivot/weather-accuracy move, UU if pure setter (Politoed)
- SNOW_WARNING+Aurora Veil+Speed≥100 floor: UU (Ninetales Alola)
- Pelipper learnset: added Roost, Hydro Pump, Thunder, U-Turn

### Known remaining issues (deferred to Phase D)
- **Abomasnow / Abomasnow Mega**: still slightly over-tiered (UU/OU). Root cause is terrible Grass/Ice defensive typing (6 weaknesses including double Fire). Requires Phase D typing analysis to fix properly.
- **Kartana**: stays at Uber in our model — justified because in single-player the player doesn't always have Fire-type answers. Its 4× Fire weakness and SpDef 31 are the competitive containment mechanism.

---

## Phase D — Offensive and Defensive Typing Analysis 📋 PLANNED

### The problem

The current algorithm treats all pokemon with the same BST equally regardless of their typing. Two pokemon with identical BST 530 — one with Steel/Fairy typing (9 resistances, 2 weaknesses) and one with Grass/Ice typing (7 weaknesses, 1 double weakness) — get the same bstRating contribution. This is clearly wrong.

**Known broken cases from Phase C:**
- **Abomasnow Mega (OU, expected NU)**: 6 weaknesses including 4× Fire, Ice/Grass offensive typing is mostly resisted.
- **Vanilluxe / Aurorus / Amaura**: Ice-type offensive STAB is 9× resisted in practice (Steel, Fire, Water, Ice all resist it); pure Ice defensive typing is one of the worst in the game.
- **Gigalith**: Rock/Ground defensive typing is terrible (4× Grass, Water, Fighting).
- Any Ice-type, Bug-type, or Normal-type is structurally disadvantaged in ways BST can't capture.

### D1 — Defensive typing score

**Goal:** Penalize pokemon with many weaknesses, particularly double-weaknesses to common offensive types. Reward pokemon with many resistances and immunities.

**Algorithm sketch:**
```
// Tier offensive threats by how commonly they appear in the meta
const COMMON_OFFENSIVE_TYPES = {
  FIRE: 1.5, WATER: 1.4, GROUND: 1.3, FIGHTING: 1.3, ELECTRIC: 1.2,
  ROCK: 1.1, ICE: 1.0, GRASS: 1.0, PSYCHIC: 0.9, DARK: 0.9, ...
}

defensiveTypingScore(type1, type2):
  score = 0
  for each attacking type T:
    effectiveness = typeChart(T → [type1, type2])
    if effectiveness == 4: score -= 1.2 * COMMON_OFFENSIVE_TYPES[T]
    if effectiveness == 2: score -= 0.5 * COMMON_OFFENSIVE_TYPES[T]
    if effectiveness == 0.5: score += 0.3 * COMMON_OFFENSIVE_TYPES[T]
    if effectiveness == 0: score += 0.6 * COMMON_OFFENSIVE_TYPES[T]
  return normalize(score, -5, +5) → (0, 1)
```

**Integration:** Apply as a multiplier on the defensive component of bstRating, not on the full bstRating. Penalty should be meaningful but not catastrophic — a bad typing shouldn't drop a high-BST mon by more than ~0.5 tier.

### D2 — Offensive typing score

**Goal:** Reward STAB combinations that hit many types super-effectively. Penalize STAB types that are commonly resisted (Ice, Bug, Normal/Normal).

**Algorithm sketch:**
```
offensiveTypingScore(type1, type2, learnset):
  stab_types = [type1] + ([type2] if type2 != None)
  // Count how many of the 18 types are hit 2× by at least one STAB move
  super_effective_count = count types T where stab_types.any(s => typeChart(s → T) == 2)
  // Common resistors: count how many high-BST pokemon commonly resist your STAB
  coverage_score = super_effective_count / 18
  return coverage_score
```

**Integration:** Feed into movesRating component as a mild bonus/penalty. Offensive typing is less decisive than defensive typing — a bad offensive type can be compensated by coverage moves.

### D3 — Snow value scaling for Ice types

**Goal:** SNOW_WARNING value should scale with the setter's physical defense. A physically bulky Ice-type (hypothetical) can switch into attacks and set snow repeatedly. A frail Ice-type gets OHKO'd before it can do anything.

```
if hasAbility('SNOW_WARNING'):
  physicalBulk = (baseHP * baseDefense) / 1000
  snowBulkMultiplier = clamp(physicalBulk / 4.0, 0.3, 1.0)
  SNOW_WARNING_bonus *= snowBulkMultiplier
```

Abomasnow: HP 90, Def 75 → physicalBulk ≈ 6.75 / 1000... wait, let's use raw: (90 × 75) = 6750. Scale needs tuning. The point is thin Ice-types like Amaura (HP 77, Def 59) get almost no snow bonus; bulkier ones get more.

### D4 — Steps

- D4a. Build a type effectiveness lookup for all 18×18 matchups. Verify against known cases.
- D4b. Implement `defensiveTypingScore(types)` with the common-attacker weighting.
- D4c. Implement `offensiveTypingScore(types)` counting super-effective coverage of STAB.
- D4d. **Analysis pass 1:** Run the full roster. Find the 20 best and 20 worst typing scores for both defensive and offensive. Manually verify they match intuition (Steel/Fairy best defensive, Ice/Rock worst, Fighting/Ground best offensive, Bug/Normal worst).
- D4e. Integrate into `ratePokemon` — defensive score as a multiplier on defensive BST component, offensive as a mild movesRating modifier.
- D4f. **Analysis pass 2:** Check which pokemon tiers change. Specifically verify:
  - Abomasnow Mega drops from OU toward RU/NU
  - Ferrothorn / Corviknight / Skarmory hold or improve
  - Scizor / Kingambit / Corviknight are not hurt (Steel is both offensively and defensively excellent)
  - Ice-types as a class drop slightly but not catastrophically
- D4g. Tune weights so no mon moves more than ~1 tier from typing alone (typing is one factor, not destiny).
- D4h. Sign off. Update `smogon_analysis/incorrected_modeled_mons.md` with any resolved cases.

---

## Execution Order

```
A (✅ DONE) → C (✅ DONE) → B (deferred, start when ready) → D (planned)
```

Phase B can be started independently of D — they touch different parts of the system.
Phase D should run before Phase B is finalized (typing score affects absolute rating which B builds on).

Recommended order: **D → B** or **D and B in parallel** (D changes absolute rating; B adds contextual rating on top).

---

## Files Affected

| File | Changes |
|------|---------|
| `puppedjs/constants.js` | New tier constants, level zone constants |
| `puppedjs/rating.js` | Eviolite bonus, coverage metrics, combo bonuses, contextual rating functions, typing scores |
| `puppedjs/writer.js` | `contextualTier` POKEDEF field, trainer zone logic |
| `puppedjs/index.js` | Contextual rating pre-computation pass |
| `COMBO_NOTES.md` (new) | Research output from A5 |
| `smogon_analysis/` (new) | Full Smogon Gen5-9 research from A5 |
| `NEW_RATING_ALGORITHM_AFTER_ANALYSIS.md` (new) | A5.2 audit + algorithm design doc |
