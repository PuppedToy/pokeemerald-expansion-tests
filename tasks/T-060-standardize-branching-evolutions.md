---
id: T-060
title: Standardize branching evolutions (rare-candy default + stones)
status: done
type: feature
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: []
blocked-by: []
---

# T-060 — Standardize branching evolutions (rare-candy default + stones)

## Context

Branching evolutions (species with 2+ evolution targets) are inconsistent across the
dex: some already follow the desired convention (one **level-up / rare candy** default
+ the rest via **evolution stones**), while others use stones for every branch, or two
level-up branches (Wurmple-style). We want a single, predictable convention so players
always know how to steer a branching evolution.

Convention target:
- **Exactly one branch = `EVO_LEVEL`** (the neutral / most-default form — reachable with a Rare Candy).
- **Every other branch = `EVO_ITEM`** with a thematically-sensible stone.

Exceptions are allowed only when strongly justified (e.g. Eevee), and intrinsic-property
branches (gender / nature / rare-PID forms) and special mechanics (Alcremie's spin) are
out of scope because the player can't steer them with a stone.

Evolution data lives in `src/data/pokemon/species_info/gen_*_families.h` (`.evolutions = EVOLUTION(...)`).

## Plan

1. Enumerate every branching evolution (done — 39 species). Script: scratchpad `parse_evos.js`.
2. Categorize each vs the convention.
3. For every non-compliant case, propose an action and get the user's confirmation (per decision).
4. Apply confirmed edits to the `gen_*_families.h` files.

Acceptance criteria:
- [x] Every confirmed branching evolution follows: 1 `EVO_LEVEL` default + rest `EVO_ITEM` stones.
- [x] Gender/nature branches become player choices (candy = ♀/default, Dawn/Moon stone = ♂/other); no `IF_GENDER`/`IF_*_NATURE`-locked branches remain.
- [x] Purely cosmetic form sets cut to their base form (Alcremie's 63 spin forms → base). Eevee kept as the sole all-stones exception; Dunsparce/Tandemaus 1/100 PID forms left untouched by user's choice.
- [x] All `EVO_ITEM` (stone) branches keep the global `CONDITIONS({IF_MIN_LEVEL, 25})` gate (levels/gates are re-randomized downstream by `evoLevelWriter.js`).
- [x] `cd randomizer && npm test` green (621 passed).
- [x] `CHANGELOG.brooktec.md` line added under [Unreleased].
- [ ] User manually verifies evolution behavior on a ROM build (deferred — closed at user's
      request; to be confirmed on the next builder run).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-06** — Task created. Parsed all 39 branching evolutions and categorized them;
  presenting the analysis + per-decision confirmation requests to the user.
- **2026-07-06** — Decisions confirmed with user across three rounds. Discovered a global
  invariant: all 57 stone (`EVO_ITEM`) evolutions in the hack carry `CONDITIONS({IF_MIN_LEVEL, 25})`.
  User clarified evolution levels & the 25 gate are placeholders re-randomized downstream
  (`evoLevelWriter.js`), so we keep the gate uniform and don't hand-tune windows.

  Applied 18 species edits + Milcery collapse via scratchpad `apply_evos.js` (each replacement
  asserted to match exactly once). Summary:
    - **Stone→level default** (original/neutral form becomes rare-candy): Gloom→Vileplume(38),
      Poliwhirl→Poliwrath(37), Slowpoke-Galar→Slowbro-Galar(37), Pikachu→Raichu-Kanto(30),
      Ursaring→Ursaluna(45), Cosmoem→Solgaleo(53).
    - **Symmetric pairs/trios, picked a default**: Tyrogue→Hitmontop(28), Clamperl→Gorebyss(30),
      Charcadet→Armarouge(30), Rockruff→Lycanroc-Midday(28), Rockruff-Own-Tempo→Lycanroc-Dusk(28).
    - **Wurmple-style (both by level)**: Wurmple→Silcoon(7) default, Cascoon→Moon Stone.
    - **Gender→choice (no `IF_GENDER`)**: Espurr, Lechonk, Basculin-White-Striped — candy = ♀ form,
      Dawn Stone = ♂ form. Basculin's ♀/♂ were previously Moon/Sun stones.
    - **Nature→choice (no `IF_*_NATURE`)**: Toxel — candy = Toxtricity-Amped (base), Moon Stone = Low-Key.
    - **Cosmetic form cull**: Milcery's 63 `EVO_SPIN` Alcremie forms → single `EVO_LEVEL` to base
      (Strawberry Vanilla Cream). The other 62 forms remain defined but unreachable via evolution.
    - **Left as-is (confirmed exceptions)**: Eevee (8 stones), Dunsparce & Tandemaus (1/100 PID
      cosmetic forms), plus all 19 already-compliant lines.
  Re-parsed all gen files (structure intact) and `cd randomizer && npm test` → 621 passed.
  Note for review: the 62 orphaned Alcremie forms now have no pre-evolution; if the rater/randomizer
  places them anywhere it should be checked, though it's the user's intended cosmetic cull.

## Outcome

Standardized every branching evolution to the convention **1 rare-candy (`EVO_LEVEL`) default +
alternates via evolution stones**, editing 18 species across `gen_{1,2,3,5,6,7,8,9}_families.h`
plus collapsing Milcery. Full mapping is in the Progress Log above. Highlights:

- Neutral/original form made the rare-candy default (Gloom, Poliwhirl, Slowpoke-Galar, Pikachu,
  Ursaring, Cosmoem); symmetric pairs/trios got a chosen default (Tyrogue, Clamperl, Charcadet,
  Rockruff, Rockruff-Own-Tempo); Wurmple's Cascoon moved to a Moon Stone.
- Gender-locked splits (Espurr, Lechonk, Basculin) and Toxel's nature split became **free player
  choices** — candy = ♀/base form, stone = ♂/other — dropping the `IF_GENDER` / `IF_*_NATURE`
  conditions entirely.
- Milcery's 63 cosmetic `EVO_SPIN` Alcremie forms collapsed to a single `EVO_LEVEL` into the base
  (Strawberry Vanilla Cream). Eevee, Dunsparce and Tandemaus left as-is by user's choice.

All stone branches keep the hack-wide `CONDITIONS({IF_MIN_LEVEL, 25})` gate; the levels and gate are
placeholders re-randomized downstream by `randomizer/evoLevelWriter.js`, so exact numbers are
non-binding. `cd randomizer && npm test` → 621 passed; the evolution parser (`parser.js`) handles the
new shapes (verified by `parserEvo.test.js`).

**Deviations / follow-ups:**
- No local GBA toolchain, so the C build and in-game behaviour were not verified here — closed at the
  user's explicit request; to be confirmed on the next builder ROM.
- 62 non-base Alcremie forms are now orphaned (defined but unreachable via evolution) — intended
  cosmetic cull; worth a glance to confirm the rater/randomizer doesn't surface them oddly.
- No `develop` branch exists in this repo; merged into `master` (the de-facto integration branch),
  consistent with T-050/052/053/059.
