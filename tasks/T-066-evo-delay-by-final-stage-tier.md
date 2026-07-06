---
id: T-066
title: Delay stage0→1 evolution by the final stage-2 power tier
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: [T-061, T-060]
blocked-by: []
---

# T-066 — Delay stage0→1 evolution by the final stage-2 power tier

## Context

Spawned from **T-061** (bundle `tasks/assets/T-061/bundle.json`). Reported by the user:

> In base games, 3-stage lines that evolve into strong final mons (e.g. Bagon→Shelgon→Salamence) tend to evolve later. We already evolve earlier when the stage-0 form is weak. Add an EXTRA stage0→1 delay based on the FINAL stage-2 mon's power tier: OU → light (+0.01–0.1), Uber (+0.11–0.2), Legendary (+0.21–0.3), AG (+0.31–0.5). Always guarantee at least 2 levels between stage0→1 and stage1→2. Branching evolutions are more confusing — review carefully.

Builds on **T-060** (branching-evolution method standardization): T-060 set evo *methods* (one rare-candy `EVO_LEVEL` default + stones), and explicitly left *levels* to `evoLevelWriter.js`. This task layers the new delay on top.

## Current algorithm (verified)

`randomizer/evoLevelWriter.js`:
- **`computeEvoLevel(preEvoTier, evoTier, stageAdj, params)` (`:65-75`)**: `raw = baseLevel × (1 + modifier + stageAdj + deviation)`, then `round(clamp[min,max](raw))`. Consumes exactly 3 `rng.random()` calls (`randInRange`, `:52-54`).
  - `baseRanges[evoTier]` (`constants.js:267-278`) — base window keyed by **the target's** tier (`evoPokemon.rating.tier`, `:103`).
  - `preEvoModifiers[preEvoTier]` (`constants.js:282-292`) — fractional shift keyed by **the holder's own** tier (`pokemon.rating.tier`, `:102`). Weak holder evolves earlier, strong later. **This is the existing "weak stage-0 evolves early" mechanism.**
  - `stageAdjustments` (`constants.js:298-302`) via `getStageAdjustment(evolutionData.type)` (`:45-47,104`): `LC_OF_3 = −0.10`, `NFE_OF_3 = +0.10`, else 0.
  - `deviation` (default 0.05), `min/max` = 5/65 clamp (`:74`).
- **`applyEvoLevels(pokemonList, evoConfig)` (`:85-124`)**: per mon, per `LEVEL`/`ITEM` evo, reads tiers (`:102-104`), calls `computeEvoLevel` (`:108`), writes `evo.param` (level evos, `:113`) or `evo.minLevel` (stone evos, `:118`). Comment `:106-107`: *"Every branch is balanced from its own target's tier … independent"* → **no cross-stage coordination today.**
- **Bundle read path** `buildEvoLevelMapFromParams` (`:136-150`) reads stored levels without consuming RNG. `resolveEvoParams` (`:24-39`) merges config over constants (no-config = byte-identical).
- **Call site:** `generate.js:36`, after `runPokedexModule` (`:32`) — so `rating.bestEvoTier` and `evoTree` are already attached when levels are rolled. Config flow: `backend/generator.js:99` → `generate.js:35`.

## Chain model & branching (the tricky part)

`parser.js:212-256` builds `evoTree[family] = [ stage0_id, [stage1 ids], [stage2 ids] ]`. Stage classification `getEvolutionType` (`parser.js:602-629`): family length 2 → stage-0 = `LC_OF_2`; length 3 → stage-0 = `LC_OF_3`, middle = `NFE_OF_3`, last = `LAST_OF_3`. `evolutionData` assembled at `pokedexModule.js:104-112`, tree stamped at `:116`.

**Critical:** the stage-2 array is FLAT — it does NOT record which stage-1 → which stage-2. That mapping only lives in each stage-1's own `.evolutions[]`. Bundle examples:
- Linear: `BAGON = ["SPECIES_BAGON",["SPECIES_SHELGON"],["SPECIES_SALAMENCE"]]`.
- Stage-2 branch: `RALTS = […,["SPECIES_KIRLIA"],["SPECIES_GARDEVOIR","SPECIES_GALLADE"]]`.
- Diamond (stage-0 AND stage-2 branch): `WURMPLE = […,["SILCOON","CASCOON"],["BEAUTIFLY","DUSTOX"]]` — Silcoon→Beautifly (NU) vs Cascoon→Dustox (RU); the tree can't tell you which, only `.evolutions[]` can.
- **`EEVEE = ["SPECIES_EEVEE",[8 eeveelutions]]` → length 2 → treated as 2-stage** but `bestEvoTier = OU`. **A naive `bestEvoTier`-only gate would wrongly delay Eevee.** Must gate on `LC_OF_3` + a real stage-2.

## Hook point & final-tier lookup

- **Tier already computed:** `poke.rating.bestEvoTier` (`pokedexModule.js:213-228`) = highest tier across the whole family (all stages, incl. self). Equals the final's tier for linear lines, but **over-reaches for branches** (Wurmple's Beautifly branch would wrongly key off RU).
- **Recommended per-branch lookup** (branch-correct): inside `applyEvoLevels`, `pokemon` = stage-0, `evo.pokemon` = a specific stage-1 → `stage1 = pokemonMap.get(evo.pokemon)` (`:87`) → `finals = stage1.evolutions.map(e2 => pokemonMap.get(e2.pokemon))` → `finalTier = max-by-TIER_SEQ` (`constants.js:490-501`). Yields Wurmple→Silcoon=Beautifly(NU), Wurmple→Cascoon=Dustox(RU).
- **Hook:** add a `finalDelay` term at `evoLevelWriter.js:104`, only when `evolutionData.type === 'EVO_TYPE_LC_OF_3'` AND `finalTier ∈ {OU,UBERS,LEGEND,AG}`. Extend signature `computeEvoLevel(…, finalDelay = 0)` so `:73` becomes `raw = baseLevel * (1 + modifier + stageAdj + finalDelay + deviation)`.

## Bundle evidence (current levels + tiers; shared across all 6 ROMs)

| Line | stage0(tier)→stage1 @L1 | stage1(tier)→stage2 @L2 | final tier | gap |
|---|---|---|---|---|
| Bagon | Bagon(ZU) @15 | Shelgon(NU)→Salamence @48 | **OU** | 33 |
| Dratini | Dratini(ZU) @14 | Dragonair(NU)→Dragonite @43 | **OU** | 29 |
| Gible | Gible(PU) @13 | Gabite(NU)→Garchomp @43 | **OU** | 30 |
| Beldum | Beldum(ZU) @19 | Metang(RU)→Metagross **@65** | **LEGEND** | 46 |
| Jangmo-o | @16 | Hakamo-o→Kommo-o **@65** | **LEGEND** | 49 |
| Happiny | @32 | Chansey→Blissey **@65** | **UBERS** | 33 |
| Applin | @41 | Dipplin→Hydrapple **@65** | **UBERS** | 24 |
| Pawmi | @14 | Pawmo→Pawmot @56 | **UBERS** | 42 |

Affected population (stage-0 `LC_OF_3` by `bestEvoTier`): **OU = 28 lines, UBERS = 3, LEGEND = 3, AG = 0** (all AG mons are single-stage/SOLO/megas — the AG band is exercised only by tests/other seeds). No 3-stage line currently has a gap < 2, BUT many stage1→2 levels are **pinned at max 65** (Beldum, Jangmo-o, Happiny, Applin) — so a LEGEND/AG delay pushing L1 up against a 65-capped L2 is exactly where the ≥2 safeguard bites. It's a real guardrail, not a formality.

Branching illustrations: Wurmple (diamond, `LC_OF_3`, two `→@8` level evos, finals NU vs RU — needs per-branch lookup); Ralts (stage-2 branch, `Kirlia→Gardevoir @32` + `Kirlia→Gallade @34` — the gap safeguard must use the **min** stage1→2 level, 32); Eevee (`LC_OF_2`, out of scope, `bestEvoTier=OU` trap).

## Plan

1. Add a `finalStageDelays` config block mirroring `preEvoModifiers` — keys `OU/UBERS/LEGEND/AG → [lo,hi]` = `{OU:[0.01,0.1], UBERS:[0.11,0.2], LEGEND:[0.21,0.3], AG:[0.31,0.5]}`; new constant `EVO_LEVEL_FINAL_STAGE_DELAYS` in `constants.js` with fallback in `resolveEvoParams` (`:24-39`). (RU/UU/NU intentionally absent → no delay below OU.)
2. In `applyEvoLevels`, for stage0→1 evos of `LC_OF_3` lines, compute the per-branch final tier (two-hop `.evolutions[]` lookup), draw `finalDelay = randInRange(band)`, pass into `computeEvoLevel` (added into the multiplicative bracket at `:73`).
3. **New family-level post-pass** after the `applyEvoLevels` loop: enforce `L2 − L1 ≥ 2` per branch path (using the **min** stage1→2 level when stage-2 branches). Per-evo steps can't see siblings, so this is a second sweep.
4. **RNG parity:** only draw the extra `randInRange` for qualifying lines when the feature is enabled/present, so disabled/absent config stays byte-identical (guard `evoLevelConfig.test.js:75-81`).
5. Wire the config into the frontend form if we expose it (`frontend/js/config-form.js:47-53, 335-341, 353-366, 653-654`) — see decision #6.

Acceptance criteria:
- [x] stage0→1 L1 increases monotonically with final tier (RU/UU = no shift < OU < UBERS < LEGEND < AG); band magnitudes match the spec ranges. — unit-tested (RU=90, OU=100, UBERS=110, LEGEND=120, AG=140 under fixed bands).
- [x] `L2 − L1 ≥ 2` always holds after the post-pass (incl. low/pinned stage1→2 cases). — unit-tested + e2e: 116 real 3-stage lines, 0 violations.
- [x] 2-stage lines (`LC_OF_2`) are untouched (gated on `LC_OF_3`).
- [x] Branching stage-0 (Wurmple) uses per-branch finals; branching stage-2 (Ralts) uses the min stage1→2 level for the gap.
- [x] Disabled/absent config (`finalStageDelays: {}`) → no delay draw (RNG parity).
- [x] `cd randomizer && npm test` green; failing-first tests added.
- [ ] **User manual test** (build ROM(s); confirm strong 3-stage lines evolve later and gaps stay ≥2) — closing gate.

## Test plan (TDD, red first)

New `randomizer/__tests__/unit/evoLevelFinalStageDelay.test.js`. NOTE: existing `evoLevelWriter.test.js`/`evoLevelConfig.test.js` `makePoke` helpers set only `rating.tier` + `evolutionData.type` and build no real 3-mon chain — the new tests need a fixture wiring a full stage0/1/2 family (so the two-hop lookup + gap post-pass have data).
1. Delay present & monotonic by final tier (RU/UU no shift < OU < UBERS < LEGEND < AG).
2. Band magnitude with degenerate min==max ranges + deviation 0 (pattern from `evoLevelConfig.test.js:49-62`).
3. Gap ≥ 2 even against a 65-pinned L2.
4. 2-stage / Eevee untouched (gate on `LC_OF_3` + real stage-2).
5. Wurmple: per-branch finals → different delays despite shared `bestEvoTier`.
6. Ralts: gap safeguard uses min stage1→2 level.
7. Determinism parity when disabled (mirror `evoLevelConfig.test.js:75-81`).

## Open decisions (confirm before implementing)

1. **Which stage gets the delay?** stage0→1 only (per spec); stage1→2 stays on existing `nfeOf3 = +0.10`. **Recommend: stage0→1 only.**
2. **Final-tier lookup under branching:** per-branch via `.evolutions[]` (recommended, correct for Wurmple) vs family-wide `bestEvoTier` (simpler, over-reaches). If a stage-1 branches to several stage-2s → MAX-by-`TIER_SEQ`. **Recommend: per-branch, MAX.**
3. **Fraction→levels:** keep multiplicative on the stage-1 target base level (matches existing modifiers; absolute delay scales with base level) vs additive-in-levels (flatter). **Recommend: multiplicative (consistent).**
4. **Gap-repair strategy** when delay collides with 65-pinned L2: cap L1 at `L2−2` vs push L2 up (cascade/re-clamp). **Recommend: cap L1 at L2−2** (simpler, respects the 65 cap).
5. **Delay pushing L1 past max 65:** clamp to 65 then safeguard forces the issue — acceptable, or exempt qualifying finals from the 65 cap? **Recommend: clamp + cap L1 at L2−2; accept.**
6. **Config exposure:** internal fixed table only, or user-configurable in the frontend form? **Recommend: config block with constant fallback; frontend exposure optional/nice-to-have.**
7. **RNG parity:** accept that ENABLING reshuffles the whole evo-level stream (new bundle even for unaffected mons); guarantee byte-identity only when disabled. **Recommend: yes.**
8. **Stacking with `nfeOf3 = +0.10`** (already delays stage1→2): is "slower to reach stage-1, then further wait to final" the intended official-like curve? **Assume yes.**

## Progress log

<!-- Append-only. Never rewrite past entries. -->

- **2026-07-06** — Task created from T-061 investigation dossier (issue 5). Current algorithm, chain/branch model, hook point and bundle baseline verified. Awaiting confirmation of open decisions (esp. #2 per-branch lookup, #4 gap-repair, #6 config exposure).
- **2026-07-06** — Implemented (TDD). New `EVO_LEVEL_FINAL_STAGE_DELAYS` constant (OU/UBERS/LEGEND/AG bands) + `finalStageDelays` in `resolveEvoParams` (pass `{}` to disable). `computeEvoLevel` gained a `finalDelay` param (added into the multiplicative bracket; defaults 0 → 3-arg callers unchanged). `applyEvoLevels`: for `LC_OF_3` stage0→1 evos, `finalDelay = randInRange(finalStageDelays[finalStageTierFor(stage1)])` — new `finalStageTierFor` walks the stage-1's own `.evolutions[]` (per-branch, MAX tier); the RNG draw happens only when a band exists (OU+), so sub-OU lines and `finalStageDelays: {}` keep the pre-T066 RNG stream. Added a post-loop safeguard capping L1 at `min(stage1→2 levels) − 2` (branch-aware, no RNG). **Decisions applied:** #2 per-branch `.evolutions[]` MAX; #3 multiplicative; #4 cap L1; #6 config block with constant fallback, **no frontend UI** (kept out of scope). New `__tests__/unit/evoLevelFinalStageDelay.test.js` (computeEvoLevel delay, `finalStageTierFor` MAX, monotonic-by-tier, disabled=no delay, ≥2 gap safeguard, LC_OF_2 untouched, branching per-branch final, branching min-L2). Confirmed **RED** (delay neutralized → monotonic/branching fail) then **GREEN**; full suite green (661 passed); existing evoLevel tests unaffected. E2E `analyze.js --seed=3370362284 --difficulty=7`: exit 0, **116 3-stage lines, 0 gap-<2 violations**; OU+ lines delayed (Bagon→Shelgon@14→…@49, Happiny→Chansey@40 [Ubers], Gible→Gabite@13→…@46). Awaiting user manual test to close.

## Outcome

<!-- Filled when closing. -->
