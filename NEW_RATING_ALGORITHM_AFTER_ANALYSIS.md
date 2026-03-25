# New Rating Algorithm — Post-A5 Analysis
## A5.2: Current System Audit + Smogon Integration Design

---

## Part 1 — What the Current System Actually Does

### The Core Formula (rating.js line 2007)
```
absoluteRating = (bstRating * 0.80) + (movesRating * 0.10) + (bestAbilityRating * 0.10)
```

Then BST safety floors are applied (lines 2017–2039): if `rawBST >= threshold`, `absoluteRating` is clamped up to the corresponding tier minimum. This guarantees high-BST pokemon are never under-tiered.

### Step 1 — BST Rating (`bstRating`)

**What it does well:**
1. **Role detection** — Computes `offensePower`, `defensePower`, `speedPower` from base stats and classifies each pokemon into `OFFENSIVE / BULKY / TANK / BALANCED`. Role-specific weights then apply (e.g. TANK weights defensePower 80%, OFFENSIVE weights offensePower 55% + speed 40%). This is smart — a Blissey and a Scizor with similar BSTs shouldn't be rated the same way.
2. **HUGE_POWER / PARENTAL_BOND already baked in** — These abilities apply a multiplier directly to the relevant stat before BST rating is computed (×2 for HUGE_POWER, ×1.25 for Parental Bond). Azumarill and Kangaskhan are already elevated at the BST level.
3. **Ability penalties** — TRUANT, DEFEATIST, SLOW_START apply multipliers that lower the effective stat values. Correctly penalises Slaking, Archeops.
4. **Eviolite bonus (A2)** — NFE pokemon get up to ×1.35 to `defensePower`. Correctly elevates Chansey, Porygon2, Dusclops.
5. **BST floors** — Guarantees Garchomp (600 BST) never rates as AVERAGE, regardless of moveset.
6. **Flexibility bonuses** — Balanced Atk/SpAtk or Def/SpDef get a small extra `offensePower`/`defensePower` bonus. Rewards mixed attackers.

**What it misses:**
1. Only HUGE_POWER and PARENTAL_BOND get stat multipliers from abilities. SPEED_BOOST, PROTEAN, MAGIC_GUARD, CONTRARY, SERENE_GRACE, POISON_HEAL, MOLD_BREAKER do not affect `bstRating` at all.
2. The 80% weight means a pokemon with a game-breaking ability/moveset but modest BST still rates low. Breloom (BST 410) can never reach AVERAGE from BST alone — its `bstRating` caps around 4.5 regardless of Spore + Poison Heal.

### Step 2 — Moves Rating (`movesRating`)

**What it does well:**
1. **`rateMove()`** has a nuanced move-by-move rating:
   - Status moves have flat ratings by effect (`MOVE_SPORE: 10`, `MOVE_STEALTH_ROCK: 8`, `MOVE_DRAGON_DANCE: 8.5`, `MOVE_QUIVER_DANCE: 9.5`)
   - Damage moves scale with BP/accuracy/priority/effect modifiers (recoil, two-turn, etc.)
   - There is a hierarchy: QD(9.5) > Shell Smash(9.5) > DD(8.5) > SD(8) > CM(7) > Bulk Up(7)
2. **`rateMoveForAPokemon()`** adds per-pokemon context:
   - STAB multiplier (1.5×, or 2× for ADAPTABILITY)
   - TECHNICIAN: moves ≤60 BP get 1.5× (Bullet Punch becomes Mach Punch-tier)
   - SKILL_LINK + multi-hit: 2.5× multiplier (correctly elevates Cloyster)
   - Item bonuses: Life Orb (×1.3), Choice Band/Specs (×1.5), Gems (×1.3)
   - **Setup synergy**: if any attack-boosting move is in the set, physical damaging moves get ×1.5. If any SpA-boosting move, special moves get ×1.5. This captures "SD makes physical moves better" at the move selection level.
   - Anti-combo filtering: prevents two recovery moves, two setup moves in same antiCombo group, etc.
   - Same-type redundancy filter (A3): removes weaker same-type damage moves.
3. **`comboList`** exists — Baton Pass + QD, Baton Pass + Shell Smash, etc. are detected and override move rating. **BUT** this is only used inside `rateMoveForAPokemon` for the purpose of choosing which moves to SELECT. The final `movesRating` in `ratePokemon` (line 1996–2001) is just `sum(move.rating) * 0.25` — the combo detection **does not contribute to absoluteRating at all**.
4. **A4 coverage blend**: `movesRating = rawMovesRating * 0.7 + coverageScore * 0.3`

**What it misses:**
1. **The `comboList` is orphaned** — it's detected during move selection but the combo bonus never flows into `absoluteRating`. A pokemon with Baton Pass + Shell Smash might pick those moves correctly, but gets no extra credit for the synergy at the final rating stage.
2. **`movesRating` only contributes 10% of the final score** — even a perfect moveset (all moves rated 10.0 → `movesRating` = 10.0) only adds 1.0 to `absoluteRating`. In practice, `movesRating` varies from ~2.0 to ~7.0, so it moves `absoluteRating` by at most 0.5. This is not enough weight to elevate a low-BST pokemon with a great moveset.
3. **No detection of cross-move synergies at rating time**: Sub + Toxic, Sub + Poison Heal, Setup + Priority, Hazard + Recovery combos are not checked in `ratePokemon`. The greedy moveset picker might choose the right moves, but their interaction isn't scored.
4. **Ability + move synergies are invisible to the final formula**: MAGIC_GUARD + Life Orb, SPEED_BOOST + Protect, SERENE_GRACE + Air Slash, MOLD_BREAKER + EQ — none of these are detected at the `ratePokemon` level.

### Step 3 — Ability Rating (`bestAbilityRating`)

**What it does well:**
- Uses a flat ability rating from `abilities.json` — reasonable baseline for triage.
- Already handled separately for HUGE_POWER (set to `baseAttack / 12`, i.e. scales with the stat it doubles).

**What it misses:**
- At 10% weight, ability rating contributes 0.1× its value. Even if SPEED_BOOST has a rating of 8 in abilities.json, it only adds 0.8 to `absoluteRating`. That's not enough to push Blaziken from AVERAGE to STRONG.
- Contextual ability value is ignored: SERENE_GRACE is mediocre on most pokemon but godlike on Togekiss (which has Air Slash). The flat rating can't capture this.
- MAGIC_GUARD, POISON_HEAL, PROTEAN, CONTRARY — these are abilities whose value is entirely dependent on the moveset/item. A flat rating misses 80% of their value.

---

## Part 2 — Smogon Patterns vs Current System Coverage

| Pattern | Current Coverage | Gap |
|---------|-----------------|-----|
| Setup + Priority | Partial — SD raises move rating ×1.5, but no bonus for having BOTH | Missing: +bonus for SD/DD/QD+priority in same set |
| Setup + High Speed | None | Missing entirely |
| Quiver Dance | Move has rating 9.5 — well handled at selection | Missing: no extra boost to pokemon rating |
| Shell Smash | Move has rating 9.5 — comboList has it | comboList not wired to absoluteRating |
| Dragon Dance | Move has rating 8.5 | Same — no pokemon-level bonus |
| Sub + Poison Heal | Item: Toxic Orb correctly rated for PH ability (×10 × genericDefense). Move: Sub=8 | No synergy bonus: Sub+PH+Toxic is more than the sum of parts |
| Sub + Toxic + Recovery | Sub=8, Toxic=8 — both score well individually | No detected pattern for the trio |
| Hazard + Recovery | Stealth Rock=8, Recovery=8.5 — both score well | No extra bonus for having both |
| Technician + Priority | ✅ Already handled via ×1.5 in rateMoveForAPokemon | **Already correct** |
| Skill Link + Multi-hit | ✅ Already handled via ×2.5 in rateMoveForAPokemon | **Already correct** |
| HUGE_POWER | ✅ Already handled via ×2 on Atk in bstRating | **Already correct** |
| Speed Boost + Protect | None at ratePokemon level | Missing |
| Serene Grace + Flinch | None | Missing |
| Magic Guard | None — only generic ability rating at 10% | Missing |
| Poison Heal | Item synergy handled in rateItemForAPokemon, but not at ratePokemon | Missing at final rating level |
| Protean/Libero | None | Missing |
| Contrary + Leaf Storm/Overheat | Move rating doesn't distinguish Contrary | Missing |
| Mold Breaker + EQ | None | Missing |
| Adaptability | ✅ STAB multiplier = 2× in rateMoveForAPokemon | **Already correct** |
| Prankster + Status | None | Missing |
| Unaware + Recovery | None | Missing |
| Magic Bounce | None | Missing |
| Pivot + Recovery | None | Missing |
| Baton Pass + Setup | ✅ comboList has it | comboList not wired to final rating |

**Summary**: 4 patterns are fully handled, 3 are partially handled, 17 are completely missing.

---

## Part 3 — Risk Assessment: What to Keep vs What to Change

### KEEP (works correctly, do not touch)
- **Role detection** (OFFENSIVE/BULKY/TANK/BALANCED) — clean, well-calibrated
- **BST floors** — prevents systematic under-tiering of high-BST mons
- **HUGE_POWER, PARENTAL_BOND, TRUANT, DEFEATIST, SLOW_START multipliers** — already correct at BST level
- **rateMoveForAPokemon setup synergy** (×1.5 when SD+physical or NP+special) — correct, handles the majority of setup sweeper cases
- **TECHNICIAN and SKILL_LINK handling** in rateMoveForAPokemon — already correct
- **ADAPTABILITY stab multiplier** — already correct
- **A3 same-type filter** — essential, keep
- **A4 coverage metrics** — works, keep
- **Eviolite NFE bonus (A2)** — works, keep
- **Item rating logic** (rateItemForAPokemon) — comprehensive and correct

### CHANGE (necessary improvements)
1. **Wire the comboList to absoluteRating** — combos are already detected during move selection; they need to also affect the final score
2. **Add `computeComboBonus(poke, moveset, ability)`** — post-moveset detection that adds a direct bonus to the final rating for high-value synergy patterns not yet covered
3. **Increase effective weight of moves/ability signals** — the 80/10/10 split means even perfect combos barely move the needle; we need the combo bonus to contribute DIRECTLY to absoluteRating (additive, after weighting), not be diluted by the 10% weight

### DO NOT OVERHAUL (risk too high, reward too low)
- **The 80/10/10 weighting formula** — changing weights globally risks misrating thousands of pokemon. Instead, add an additive bonus AFTER the weighted formula.
- **rateMove() scoring** — the status move ratings are well-tuned. Touching them risks breaking move selection for hundreds of pokemon.
- **chooseMoveset() greedy loop** — works correctly for the vast majority. The only needed change is wiring combos to the RATING, not the selection.

---

## Part 4 — The New Algorithm Design

### Current formula:
```js
absoluteRating = (bstRating * 0.80) + (movesRating * 0.10) + (bestAbilityRating * 0.10)
// + BST floor clamps
```

### New formula (A6):
```js
comboBonus = computeComboBonus(poke, finalMoveset, ability)  // 0 to +1.5

absoluteRating = (bstRating * 0.80) + (movesRating * 0.10) + (bestAbilityRating * 0.10)
absoluteRating += comboBonus  // additive, after weighting, before BST floor clamps
// + BST floor clamps (unchanged)
```

**Why additive after weighting?**
- If we add comboBonus inside movesRating (then multiply by 0.1), even +3.0 moves `absoluteRating` by only 0.3 — not enough to change tier.
- Additive after weighting means +0.5 combo bonus directly shifts the pokemon up by ~0.5 tier points, which IS enough to cross a tier boundary.
- The BST floors still apply after, so a high-BST pokemon can't be pushed above its floor even with combos.

### `computeComboBonus(poke, moveset, ability)` — Concrete Design

Returns a value between 0 and 1.5 (hard cap). Each detected pattern contributes additively, but total is capped.

```
bonuses are cumulative, total capped at 1.5

Pattern checks (in order of importance):
```

#### Group A — Ability-derived (ability must be a specific value)

| Check | Bonus | Notes |
|-------|-------|-------|
| ability == MAGIC_GUARD | +0.5 | Removes residual damage drawbacks universally |
| ability == POISON_HEAL | +0.4 | Additive with item synergy already in rateItemForAPokemon |
| ability == HUGE_POWER \| PURE_POWER | already in BST | Skip — already handled |
| ability == SPEED_BOOST AND Protect in moveset | +0.6 | Free +Spe with no risk |
| ability == SPEED_BOOST (no Protect) | +0.3 | Less reliable but still strong |
| ability == PROTEAN \| LIBERO | +0.4 | STAB on all 4 moves |
| ability == SERENE_GRACE AND high-flinch move in moveset | +0.5 | 60% flinch |
| ability == PRANKSTER AND status move in moveset | +0.4 | Priority status |
| ability == CONTRARY AND self-lowering move (Leaf Storm, Overheat, Superpower, Draco Meteor) | +0.7 | Turns drawback into boost |
| ability == MOLD_BREAKER AND EQ/Earth Power | +0.3 | Hits Levitate users |
| ability == MAGIC_BOUNCE | +0.3 | Hazard reflection |
| ability == UNAWARE AND recovery move in moveset | +0.4 | Hard counter to all setup |
| ability == TECHNICIAN AND priority move ≤60 BP | already in rateMoveForAPokemon | Skip |
| ability == SKILL_LINK AND multi-hit move | already in rateMoveForAPokemon | Skip |

#### Group B — Move combo patterns (any ability, specific move interactions)

| Check | Bonus | Notes |
|-------|-------|-------|
| SETUP_MOVE AND PRIORITY_MOVE in moveset | +0.7 | The single most reliable pattern |
| SETUP_MOVE AND baseSpe >= 90 | +0.4 | Fast enough to need no speed boost |
| QUIVER_DANCE in moveset | +0.5 | Triple stat boost — best standalone setup |
| SHELL_SMASH in moveset | +0.4 | Double boost — powerful but leaves defense gap |
| DRAGON_DANCE in moveset AND coverage score > 3 | +0.3 | DD + spread — already partially handled by ×1.5 in rateMoveForAPokemon |
| Substitute AND RECOVERY_MOVE in moveset | +0.4 | Sub+recovery = sustained stall loop |
| Substitute AND (TOXIC \| WILL_O_WISP) AND RECOVERY_MOVE | +0.6 | Sub+status+recovery = full stall combo (replaces sub+recovery bonus) |
| (STEALTH_ROCK \| SPIKES) AND RECOVERY_MOVE in moveset | +0.4 | Hazard setter with longevity |
| (U_TURN \| VOLT_SWITCH) AND (RECOVERY_MOVE OR ability == REGENERATOR) | +0.3 | Pivot with heal |
| BATON_PASS AND SETUP_MOVE in moveset | already in comboList | Extend comboList wiring to absoluteRating |
| BELLY_DRUM AND PRIORITY_MOVE in moveset | +0.6 | BD+priority is the most extreme version of setup+priority |

**SETUP_MOVE set** (for pattern detection):
`MOVE_SWORDS_DANCE, MOVE_DRAGON_DANCE, MOVE_NASTY_PLOT, MOVE_CALM_MIND, MOVE_QUIVER_DANCE, MOVE_SHELL_SMASH, MOVE_BELLY_DRUM, MOVE_SHIFT_GEAR, MOVE_TAIL_GLOW, MOVE_GEOMANCY, MOVE_BULK_UP, MOVE_COIL, MOVE_WORK_UP, MOVE_HONE_CLAWS, MOVE_CURSE`

**PRIORITY_MOVE set** (for pattern detection):
`MOVE_BULLET_PUNCH, MOVE_MACH_PUNCH, MOVE_AQUA_JET, MOVE_SHADOW_SNEAK, MOVE_SUCKER_PUNCH, MOVE_EXTREME_SPEED, MOVE_ICE_SHARD, MOVE_QUICK_ATTACK, MOVE_VACUUM_WAVE, MOVE_JET_PUNCH, MOVE_GRASSY_GLIDE (if grassy terrain), MOVE_WATER_SHURIKEN`

**RECOVERY_MOVE set**:
`MOVE_RECOVER, MOVE_ROOST, MOVE_SOFT_BOILED, MOVE_SLACK_OFF, MOVE_MILK_DRINK, MOVE_HEAL_ORDER, MOVE_SYNTHESIS, MOVE_MORNING_SUN, MOVE_MOONLIGHT, MOVE_SHORE_UP, MOVE_REST`

### Cap and Overlap Rules
- Total comboBonus is capped at 1.5 (absolute ceiling).
- Patterns are cumulative but non-overlapping where they describe the same mechanic:
  - Sub+Toxic+Recovery gives +0.6 (not +0.4 + +0.6 stacked).
  - DD + high coverage gives +0.3, not stacked with "SETUP_MOVE AND baseSpe >= 90" (+0.4) unless both conditions genuinely co-occur on different setups.
- Ability-based bonuses stack with move-based bonuses (they measure different things).

### Expected Impact on Key Pokemon

| Pokemon | BST | Current Tier (est.) | Expected Combo Bonus | New Tier |
|---------|-----|---------------------|----------------------|----------|
| Breloom | 410 | BAD/WEAK | +0.4 (PH) + 0.5 (QD/or SD+priority) | WEAK → AVERAGE |
| Scizor | 430 | WEAK/AVERAGE | +0.5 (Technician already handled) + 0.7 (SD+BP) | AVERAGE → STRONG |
| Gliscor | 510 | AVERAGE | +0.4 (PH) + 0.6 (Sub+Toxic+Recovery) = 1.0 | AVERAGE → STRONG |
| Reuniclus | 490 | AVERAGE | +0.5 (Magic Guard) + 0.3 (Sub synergy) | AVERAGE → STRONG |
| Cloyster | 525 | AVERAGE/STRONG | +0.4 (Shell Smash) | STRONG |
| Serperior | 528 | AVERAGE | +0.7 (Contrary+Leaf Storm) | STRONG |
| Azumarill | 420 | WEAK | +0.6 (BD+priority) [HP already ×2 from HugePower] | WEAK → AVERAGE/STRONG |
| Ferrothorn | 489 | AVERAGE | +0.4 (Spikes+Recovery=Leech Seed) | AVERAGE → STRONG |
| Volcarona | 550 | STRONG | +0.5 (QD) | STRONG → PREMIUM |
| Toxapex | 364 | BAD/TRASH | +0.4 (Regen+pivot) | WEAK (correct) |
| Sableye | 380 | BAD/TRASH | +0.4 (Prankster+status) | WEAK |
| Beldum | 185 | USELESS | 0 (Take Down only) | USELESS (unchanged) |
| Magikarp | 200 | USELESS | 0 | USELESS (unchanged) |

---

## Part 5 — What Must NOT Be Done

### Anti-patterns to avoid in A6:

1. **Do not add combo bonuses to `bstRating`** — BST is objective. Bonuses live in the moves/ability layer only, as additive post-weighting.

2. **Do not change the BST floor clamps** — they are the single most important correctness guarantee in the system.

3. **Do not double-count** already-handled patterns:
   - HUGE_POWER: already ×2 in BST calc. Do not give it a combo bonus too.
   - ADAPTABILITY: already ×2 STAB in rateMoveForAPokemon. Do not bonus again.
   - TECHNICIAN + priority: already ×1.5 in rateMoveForAPokemon.
   - SKILL_LINK + multi-hit: already ×2.5 in rateMoveForAPokemon.

4. **Do not add combo bonuses to pokemon that currently tier-cap correctly** — a Mewtwo (BST 680) is GOD regardless of moves. Combo bonuses shouldn't push it past the cap (BST floors already handle this upward direction; make sure combo bonus only raises rating, never lowers).

5. **Do not make the comboBonus affect move SELECTION** — `computeComboBonus` is a post-moveset bonus on the final `absoluteRating`. It does not and should not feed back into `chooseMoveset`. The selection logic already has `comboList` for that purpose.

6. **Do not break the anti-combo list** — the anti-combo list prevents bad combos from getting picked. That's correct behavior; A6 combo bonuses are for GOOD combos only, and should never override the anti-combo protection.

---

## Part 6 — Where Each Piece Lives in the Code

| Change | File | Function | Notes |
|--------|------|----------|-------|
| `computeComboBonus()` | `rating.js` | New function | Detects all 24 patterns |
| Call `computeComboBonus` in `ratePokemon` | `rating.js` | `ratePokemon()` line ~2007 | `absoluteRating += comboBonus` before BST floors |
| Wire `comboList` to `absoluteRating` | `rating.js` | `ratePokemon()` | Check comboList against final moveset and add to absoluteRating |
| Add SETUP_MOVE/PRIORITY_MOVE constant sets | `rating.js` or `constants.js` | Top-level | Used by `computeComboBonus` |
| Add RECOVERY_MOVE constant set | `rating.js` or `constants.js` | Top-level | Used by `computeComboBonus` |
| Export `computeComboBonus` | `rating.js` | `module.exports` | For testing |

No changes needed to: `constants.js` (beyond new move set constants), `writer.js`, `index.js`, `trainers.js`, `chooseMoveset`, `rateItemForAPokemon`, or any BST logic.

---

## Part 7 — The Plan for A5.2 Analysis Sign-Off

Before implementing A6, run a dry-run of `computeComboBonus` against the full pokemon list and verify:

1. **Top 20 pokemon by comboBonus value** — are these the Breloom/Scizor/Gliscor/Serperior types, or are there false positives?
2. **Bottom 20 by comboBonus** — should be Beldum/Magikarp/Caterpie/Applin types and early NFE with no useful moves.
3. **Check all pokemon that would cross a tier boundary** — no pokemon should jump more than 1 tier from combo bonus alone.
4. **Verify cap effectiveness** — no pokemon should have comboBonus > 1.0 (cap at 1.5 in code but in practice should rarely exceed 1.0).
5. **Spot-check the Smogon outliers** from Part 4 above — do they now fall in the right tier?

Sign off on the distribution before writing any production code.
