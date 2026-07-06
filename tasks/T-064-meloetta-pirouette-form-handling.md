---
id: T-064
title: Never place Meloetta-Pirouette; blend its tier and prioritize Relic Song
status: proposed        # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: [T-061, T-047, T-067]
blocked-by: []
---

# T-064 — Never place Meloetta-Pirouette; blend its tier and prioritize Relic Song

## Context

Spawned from **T-061** (bundle `tasks/assets/T-061/bundle.json`). Reported by the user:

> Meloetta-Pirouette is a possible rom-0 encounter, but Pirouette is really a battle-only form. Meloetta should always be Meloetta. For tier classification, account for the fact that Meloetta can switch forms with Relic Song: tiers should use the average tier of Meloetta and Meloetta-Pirouette (weight 0.55 base / 0.45 Pirouette), and trainer movesets should always take base Meloetta and strongly prioritize Relic Song (scaled by SpA etc. but with a high priority boost when the user is Meloetta). Meloetta-Pirouette must never appear wild, as a reward, as a trainer's Pokémon, or anything — but must be accounted for.

**Root cause:** battle-only forms are kept out of placement by one hardcoded list, `BANNED_SPECIES_FOR_PICKING` (`randomizer/modules/wildModule.js:35-52`), which **omits `SPECIES_MELOETTA_PIROUETTE`**. In the rated pokedex Pirouette is an ordinary entry (`isMega:false`, `type:EVO_TYPE_SOLO`, rated **UBERS**), so it passes every filter and — being higher-rated than base Aria (OU) — the tier-gated pickers actively prefer it. The existing `!isMega` filter (`wildModule.js:533`, `trainerSelector.js:170`) screens primals but not Pirouette (not a mega). There is **no Meloetta/Pirouette-specific handling anywhere** — this is a list gap + two new features.

## Bundle evidence

Forms keyed by id suffix only: `SPECIES_MELOETTA_ARIA` (base) vs `SPECIES_MELOETTA_PIROUETTE` (battle-only). Both share `family:P_FAMILY_MELOETTA`, `natDexNum:NATIONAL_DEX_MELOETTA`, `speciesName:_("Meloetta")`, `form:null`.

All Meloetta placements are in **rom-0 only**:
- **Wild leak:** `roms[0].docs.wildPokes` → `MAP_VICTORY_ROAD_B1F` land = `SPECIES_MELOETTA_PIROUETTE`.
- **Replacement log:** `roms[0].artifacts.wild.replacementLog.SPECIES_SHEDINJA = "SPECIES_MELOETTA_PIROUETTE"`; family marker `P_FAMILY_MELOETTA` in `alreadyChosenFamilies`.
- **TRAINER_HOPE (final boss):** carries Pirouette (moveset `STRENGTH/U_TURN/AURA_SPHERE/FLIP_TURN` — no Relic Song), injected via `TRAINER_POKE_ENCOUNTER` mirroring the VR wild slots.
- **Rivals** (`TRAINER_{MAY,BRENDAN}_EVERGRANDE_*` ×6): each has Pirouette as an independent UBERS-pool pick (distinct leak vector from HOPE).

Ratings (`sharedData.pokedex.pokes`):
| id | absoluteRating | tier | BST | stats HP/Atk/Def/Spe/SpA/SpD | types |
|---|---|---|---|---|---|
| MELOETTA_ARIA | 8.3644 | **OU** | 600 | 100/77/77/90/128/128 | Normal/Psychic |
| MELOETTA_PIROUETTE | 9.394 | **UBERS** | 640 | 100/128/90/128/97/97 | Normal/Fighting |

Weighted blend `0.55·Aria + 0.45·Piro = 8.828` → **tier stays OU** in this bundle (OU≥8, UBERS≥9; `constants.js:31-42`). The blend raises Aria's rating +0.463 but does not change its tier here (see decision #7).

Relic Song: `MOVE_RELIC_SONG` exists (Normal, Special, power 75, 30% sleep). Both forms learn it at **level 50** (resolved moves in each poke's `learnset`; `levelUpLearnset` is only a string ref). Neither form's current `bestMoveset` includes it — why trainer teams never carry it.

## Key code locations

**Exclusion:** `wildModule.js:35-52` (`BANNED_SPECIES_FOR_PICKING`; comment `:49-51` documents the Palafin precedent), applied at `wildModule.js:156` (wild/starter/reward pool), `writer.js:247` (trainer pool), `writerDocs.js:118` (docs). `!isMega` filters: `wildModule.js:533`, `trainerSelector.js:170`.

**Trainer acquisition of Pirouette:** `trainerSelector.js:132,163` (generic pool = post-ban `[...pokemonList]`; rivals pick Pirouette as UBERS); `:134-139` (`TRAINER_POKE_ENCOUNTER` mirrors placed wild — HOPE path); `trainers.js:435-473` (`encounterIds` wiring).

**Tier / rating:** `rating.js:2861` `ratePokemon` (per-poke, no sibling access); `:3120-3125` (`absoluteRating` formula); `:3185-3281` (existing hardcoded rating-floor override pattern); `:3288-3320` (tier from `absoluteRating`); **`pokedexModule.js:192-210`** (the cross-form re-rate hook — "9b Wishiwashi", "9c Palafin"; add "9d Meloetta" here, before best-evo at `:213`); `:213-249` (best-evo pass re-derives `bestEvoTier` automatically); `:269-283` (contextual-ratings loop); `constants.js:48-58` (`WISHIWASHI_*_ID`/`PALAFIN_*_ID` pattern — add Meloetta ids + weights).

**Trainer moveset / Relic Song:** `rating.js:1834` `chooseMoveset`; **`:1854-1872`** (Zero-to-Hero "force best pivot into set" rule — exact model for "force Relic Song when user is Meloetta"); `:1874-1886` (greedy top-4 fill); `:1047` `rateMoveForAPokemon`, `:1261-1265` (STAB ×1.5/×2 — alt hook for a priority boost); `:1900-1921` (A3 same-type dedup to exempt, like `forcedPivotId`). Single funnel: `writer.js:724` (ROM parties), `writerDocs.js:371` (docs), `rating.js:3106` (pokedex bestMoveset).

## Plan

**(A) Exclusion (one-line data fix):** add `'SPECIES_MELOETTA_PIROUETTE'` to `BANNED_SPECIES_FOR_PICKING`. This removes it from wild (`:156`), trainer (`writer.js:247`), and docs (`writerDocs.js:118`) pools at once; the `TRAINER_POKE_ENCOUNTER` (HOPE) path then mirrors base Meloetta/another species. Keep Pirouette in the dex (the in-battle Relic Song transform needs it); only *picking* is banned. Parallels the documented Palafin-Hero handling.

**(B) Tiering (cross-form weighted-average re-rate):** add a "9d Meloetta" block in `pokedexModule.js` after 9c (~`:210`), before best-evo. Look up both forms in `allPokes` (both present here — ban is applied downstream, not in pokedexModule), set `aria.rating.absoluteRating = 0.55*aria + 0.45*pirouette`, recompute the tier. Extract the threshold ladder (`rating.js:3288-3320`) into an exported `tierFromRating(absoluteRating, {isStoneMega})` helper (Meloetta not a mega). Best-evo pass then re-derives `bestEvoTier`. Add `MELOETTA_ARIA_ID`/`MELOETTA_PIROUETTE_ID` + weights to `constants.js`. Do NOT reuse `palafinEffectivePoke` (that swaps *stats*; Meloetta blends two *ratings*).

**(C) Trainer moveset (force/boost Relic Song):** mirror the Zero-to-Hero forced-move rule in `chooseMoveset` (`:1854-1872`): if the poke is Meloetta, it learns Relic Song, and the set lacks it, push it in and exempt it from A3 same-type dedup (like `forcedPivotId`). Relic Song is Special so SpA-driven rating applies; add the Meloetta-specific boost per spec. One rule covers ROM parties, docs, and pokedex bestMoveset (single funnel).

Acceptance criteria:
- [ ] `SPECIES_MELOETTA_PIROUETTE` never appears in any wild slot, reward, or trainer team across all ROMs; base `MELOETTA_ARIA` remains placeable.
- [ ] Meloetta-Aria's `absoluteRating` = `0.55*aria + 0.45*pirouette` (±epsilon) and its tier = `tierFromRating(blend)`; `bestEvoTier` propagates.
- [ ] A trainer's Meloetta moveset contains Relic Song (forced/boosted); a non-Meloetta mon that can learn it is NOT forced to.
- [ ] `cd randomizer && npm test` green; failing-first tests added.

## Test plan (TDD, red first)

1. **Exclusion** — extend `wildModule.test.js:565` (imports `BANNED_SPECIES_FOR_PICKING`): `.toContain('SPECIES_MELOETTA_PIROUETTE')` and `.not.toContain('SPECIES_MELOETTA_ARIA')`. Fails today.
2. **Tiering** — new `meloetta.test.js` (model on `palafin.test.js`); add `MELOETTA_ARIA`+`MELOETTA_PIROUETTE` to `fixtures/miniPokes.js` (absent today). Assert blended `absoluteRating ≈ 0.55*aria + 0.45*piro` and tier = `tierFromRating(blend)`. Do NOT assert an OU→UBERS change (stays OU in real data).
3. **Trainer moveset** — in `meloetta.test.js`, feed a Meloetta-Aria-like poke whose learnset includes `MOVE_RELIC_SONG` + higher-rated moves; assert `chooseMoveset().moveset` contains Relic Song. Regression: a non-Meloetta poke that can learn it is not forced. Add `MOVE_RELIC_SONG` (+ comparison moves) to `fixtures/miniMoves.js` (absent today).
4. **Integration** — no ROM's wild/trainer/reward contains Pirouette.

## Decisions

1. **RESOLVED (user, 2026-07-06): T-064 is Meloetta-ONLY.** The four other battle-only forms with the identical leak gap (`ZACIAN_CROWNED`, `ZAMAZENTA_CROWNED`, `ETERNATUS_ETERNAMAX`, `TERAPAGOS_TERASTAL` — note BANNED already lists `TERAPAGOS_NORMAL`/`_STELLAR` but not `_TERASTAL`) are handled in a **separate task (T-067)**, later. (Primals safe via `isMega`; Dialga/Palkia/Giratina Origin are held-item permanent changes — left placeable.)
2. **Zacian/Zamazenta** (placeable `_HERO` + battle-only stronger `_CROWNED`) — same structure as Meloetta; whether they get a weighted-average blend too is deferred to T-067 (their power gap is larger).

Remaining implementation choices (defaults chosen; override in the log if implementing decides otherwise):
3. **Blend edge case:** if one form is rated 0/MAGIKARP (the "no damage moves reachable" guard, `rating.js:3329-3335`), still blend 0.55/0.45 (spec implies always-blend).
4. **Scope of the blend:** top-level `absoluteRating`/`tier` + `contextualRatings` (`pokedexModule.js:269-283`, read by trainer `contextualTier` filters) and displayed `bestMoveset`, for consistency.
5. **Relic Song mechanism:** force-into-set (like the Zero-to-Hero pivot) PLUS a priority boost. Spec says "HIGH priority boost / strongly prioritize"; boost magnitude relative to STAB ×1.5/×2 TBD at implementation.
6. **Keying Meloetta:** by `family === P_FAMILY_MELOETTA` / `natDexNum` (robust), not the exact `_ARIA` id.
7. **Blend doesn't change the tier in this bundle** (OU→OU; 8.364→8.828, UBERS needs ≥9). Accepted — keep 0.55/0.45 as specified.

## Progress log

<!-- Append-only. Never rewrite past entries. -->

- **2026-07-06** — Task created from T-061 investigation dossier (issue 3). Root cause (Pirouette missing from `BANNED_SPECIES_FOR_PICKING`) + two new features (weighted-tier blend, Relic Song boost) verified against bundle + code.
- **2026-07-06** — User decision: **Meloetta-only** now; the 4 other battle-only forms (Zacian/Zamazenta-Crowned, Eternatus-Eternamax, Terapagos-Terastal) go to a separate task **T-067**. Other open items defaulted per recommendations.

## Outcome

<!-- Filled when closing. -->
