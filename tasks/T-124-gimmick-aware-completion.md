---
id: T-124
title: Gimmick-aware team completion — build the team to BE the gimmick
status: in-progress
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-107, T-122, T-123, T-121, T-102]
blocked-by: [T-122, T-123]
priority: high
---

# T-124 — Gimmick-aware team completion

## Context

Owner: *"tener un weather setter no es suficiente para ser weather trainer… una vez somos un gimmick,
nuestro equipo tiene que reflejarlo en el teambuilding."* Juan crystallised weather (Kyogre) but the
rest of his team does not look like a rain team. A crystallised gimmick must **drive completion**: the
remaining picks + refinement build the team to really be that gimmick.

## Plan

- **Gimmick role knowledge (research, owner-validated — like the recipes).** From the corpus
  (singles OU + the expanded DOU 6v6, T-121/T-102), extract what each gimmick actually runs to fill its
  roles — abilities, moves, mon profiles:
  - **weather** (rain/sun/sand/snow): the setter + abusers — Swift Swim/Chlorophyll/Sand Rush/Slush Rush
    sweepers, weather-boosted nukes (Electro Shot/Weather Ball/Water Spout/Eruption), Hydration/Dry Skin
    rain tanks, sun Fire spam, etc.
  - **trick_room**: slow, high-offense abusers — pick low-Speed mons, or grant **Room Service** (or a
    slow profile) so the abuser benefits.
  - **screens**, **trapping**: the pieces those teams run.
- **Gimmick-aware completion/refinement:** once crystallised (or seeded, T-126), bias the remaining
  slots + the role-move injection (T-122) toward the gimmick's abusers/enablers so the finished team
  embodies it — degrading gracefully within the tier budget (may need T-119's role-driven downgrade).
- **Un-force the legacy hardcodes:** the old engine force-set some gimmicks (e.g. Tate & Liza Trick
  Room). Replace the force with the engine genuinely BUILDING the gimmick (slow mons / Room Service),
  seeded via T-126.
- Format-agnostic (singles + doubles); doubles gimmicks (redirection, Tailwind, Fake Out cores) get the
  same treatment when the doubles recipes land (T-102 v2 / T-109).

> **Meta-analysis validation (owner-gated).** The gimmick composition (which abilities/moves/profiles
> complete each gimmick) is a meta conclusion — analyse against the corpus and validate with the owner
> before implementing.

Acceptance criteria:
- [x] A crystallised/seeded weather team is actually built as a weather team (setter + abusers + synergy),
      not just a lone setter; likewise TR (slow/Room Service). Verified via crystallize/combinedStructure +
      the gimmick `holds` checks. (Perish-trap reframed by the owner to a moveset team-combo — a trapper /
      its support partner carries Perish Song, `planPerishComboMove`, doubles-only — NOT a gimmick. Terrains
      reframed to soft surger-awareness + screens to a light role — corpus-validated, not gimmicks.)
- [x] Legacy forced gimmicks (Tate & Liza TR, …) are produced by the engine, not hardcoded — T&L are TR-
      seeded (`trainerSeeds.js`) and built via the gimmick; no legacy force remains.
- [x] Determinism gate green (17/17); `cd randomizer && npm test` green (1133).

## Progress log

- **2026-07-11 — weather completion done (the core; the Juan fix).** Diagnosed: 20/22 emergent weather
  teams delivered ZERO abusers — because ability-based gimmick roles (weather setter/abuser) are chosen
  by `pickTrainerMonAbility` INDEPENDENTLY of the crystallised identity (unlike move roles, which 107d
  injects). Fix: `planMemberAbility` (archetypeRefine) returns the ability the mon should PREFER given
  the identity — for a weather team, the setter ability (matching the established/themed subtype) if no
  setter yet, else the matching abuser (rain→Swift Swim, sun→Chlorophyll, sand→Sand Rush, snow→Slush
  Rush; corpus-confirmed). `pickTrainerMonAbility` gained a `preferredAbilities` hint (wins if the mon
  can have it). `resolveIdentity` now PERSISTS a seeded gimmick through crystallisation. Measured with
  the T-126 weather seeds: **Archie → real rain** (Drizzle + Swift Swim/Hydration), **Maxie → real sun**
  (Drought + Solar Power); mismatched pools self-correct (ice museum grunt → snow). 5 unit tests; suite
  929; determinism green. **Follow-ups:** TR completion (slow mons / Room Service) so Tate & Liza's TR
  seed is realised; gimmick items (T-125); emergent (non-seeded) weather stays weak by design.
- **2026-07-11** — Created from the owner's problem-2 analysis (Juan's non-weather weather team;
  un-forcing Tate & Liza TR). Blocked on T-122 (roles must deliver) + T-123 (correct crystallisation).

- **2026-07-15 — RESEARCH pass (owner-directed, three questions; analysis-first, pre-implementation).**
  Corpus buckets: 62 singles-6v6, 59 DOU-6v6, 24 VGC-4v4.
  - **Terrains (misty/grassy/psychic — and electric as baseline):** in NO bucket does any terrain reach a
    team-gimmick threshold. Teams with a terrain SETTER, counting terrain-payoff pieces on the rest of the
    team (abuser abilities / terrain-boosted moves / terrain seeds): almost all have **0–1**, essentially
    none have 2+. Even ELECTRIC (which we DID build as a gimmick, T-137) is lone-mon in the corpus
    (DOU 10 setters → 8 with zero abusers). Conclusion: terrains are a **lone mon's tool**, not a
    build-around gimmick. Owner's proposal validated — don't gimmick any terrain; make teams surger-AWARE
    (value the surge + its synergy when a surger is present). Open decision: whether to DOWNGRADE the
    existing electric_terrain gimmick to the same soft treatment for consistency.
  - **Trick Room + Tate & Liza — ALREADY DONE.** `trick_room` is a full engine gimmick (T-137/T-138):
    slow-mon bias (TR_SLOW_SPEED/FACTOR), Room Service item, `ensureTrickRoomSetter`, and full-room
    (2 setters + 4 abusers). Tate & Liza are **seeded** to a full TR room (`trainerSeeds.js`
    `TRAINER_TATE_AND_LIZA_1: TRICK_ROOM`), engine-built — NOT hardcoded (no legacy force remains; the only
    T&L refs in the writers are the boss reward). The two TR acceptance criteria are already met.
  - **Screens + trapping — the plan line was an unanalysed placeholder.** Corpus: **screens** are minor
    (singles 8/62 ≈13%, 7 archetype-flagged; DOU 5/59; VGC 1/24) — a light HO-lead element, not a
    build-around gimmick. **Trapping** is real in DOUBLES (13/59 ≈22% run a trapper — Gothitelle Shadow
    Tag; 12 strategy mentions) and a support element in singles (Magnezone/Dugtrio; 16 mentions, 6 run it).
    Both already exist as light detector-roles (`screenSetter`, `trapper` in featureDetectors + the
    `screens_tailwind`/`trapping` data gimmicks in doubles.json), with NO setter+abuser completion
    ("keep the setter-presence condition for now", gimmickPlan.js). Conclusion: neither warrants full
    gimmick-completion; trapping (doubles) is worth being a **pickable support-style role**, screens a
    light role only. Awaiting owner validation before implementing.

- **2026-07-15 — owner decisions (validated), implementation scope:**
  1. **Terrains:** electric_terrain **stays a full gimmick** (owner); misty/grassy/psychic get a SOFT
     surger-aware layer (no gimmick) — when the matching surger is on the team, a teammate's signature
     payoff move (grassy→Grassy Glide, psychic→Expanding Force, misty→Misty Explosion) gets a light
     preference. No forced build.
  2. **Trick Room + Tate & Liza:** already done → verify + document, no code.
  3. **Trapping:** INVEST — model the **Perish-trap** as a real doubles gimmick (owner). Corpus-grounded:
     12/12 DOU trap teams use **Shadow Tag** (Gothitelle / Gengar-Mega; teams stack 2-3), 5/12 pair it
     with **Perish Song**. Design (mirrors trick_room): setter = Shadow Tag ability (hard-picked, no
     retrofit), core/abuser = Perish Song user (+ Protect/Detect to stall the 3-turn count, + Substitute);
     `trapping` HOLDS when a Shadow Tag trapper AND a Perish Song user are both on the team. `perishSongUser`
     role + `trapper` detector already exist. Screens stays a light role (no completion).

- **2026-07-15 — IMPLEMENTED (all three, TDD).**
  - **Perish-trap `trapping` gimmick** (`gimmickPlan.js`): `isTrapSetter` (Shadow Tag ability),
    `perishTrapAbuseScore` (+3 Perish Song, +1 Protect/Detect, +1 Substitute; 0 without Perish Song),
    `perishTrapBreakdown`, `trappingHolds` (Shadow Tag + an actually-equipped Perish Song, like TR's
    real-move check), `ensureTrapCore` (retrofit the Perish Song move onto the trapper), `GIMMICK_SPEC.
    trapping` (`abuserTarget: 1`), `gimmickHolds` routing, and DOUBLES-ONLY `emergentGimmick` detection.
    Picker generalised (`spec.abuserTarget`) + the emergent caller passes `doubles`. doubles.json `trapping`
    entry tightened to require trapper AND perishSongUser (perishSongUser structure min 1). Verified the
    data path: `crystallize` ranks trapping **fit 1.00** for a Gothitelle (Shadow Tag + Perish Song) team;
    `combinedStructure(bulky_offense + trapping)` includes `trapper:1-1` + `perishSongUser:1-1`.
  - **Soft surger-awareness** (misty/grassy/psychic; electric stays a gimmick): `planTerrainSynergyMove`
    (`archetypeRefine.js`) — a light payoff-move preference (Grassy Glide / Expanding Force / Misty
    Explosion) when the matching Surge setter is on the team; wired in `resolveTrainerTeam` DOUBLES-ONLY,
    soph-gated (singles byte-identical).
  - **TR + Tate & Liza:** confirmed already complete (no code) — see the research entry above.
  - **Screens:** left as the light `screenSetter` role (no completion), per the corpus.
  - Tests: +13 (perish-trap in `terrainRoomGimmicks.test.js`, terrain synergy in `archetypeRefine.test.js`).
    Fast suite **1133 green**; determinism gates **17/17**; docs/research/trapping.md (SSOT) + INDEX +
    CHANGELOG. Singles untouched (all new paths doubles-gated).

- **2026-07-15 — round 2 (owner reframe): perish-trap is a TEAM-COMBO, not a gimmick.** Owner: *"Perish
  Song + Shadow Tag/Arena Trap va por move… si un pokemon tiene Shadow Tag/Arena Trap prioriza mucho Perish
  Song en su moveset. El combo solo tiene sentido en dobles… no es un gimmick entero ni un arquetipo, es un
  team combo."* So the whole `trapping` GIMMICK built above was TORN DOWN and replaced with moveset
  prioritisation:
  - Removed: the `trapping` GIMMICK_SPEC entry, `gimmickHolds` routing, the DOUBLES emergent branch, all the
    perish-trap gimmick functions in gimmickPlan.js, the `abuserTarget` picker generalisation, and the
    `trapping` gimmick entry from `doubles.json` (the `trapper`/`perishSongUser` detectors stay).
  - Added: `planPerishComboMove` (`archetypeRefine.js`) — (1) SELF: a mon whose resolved ability is Shadow
    Tag / Arena Trap and that can learn Perish Song prefers it (Gothitelle / Mega Gengar carry it); (2)
    TEAMMATE: a support-leaning mon (offense ≤ 100) whose teammate traps prefers Perish Song (split combo).
    Wired in `resolveTrainerTeam` after ability selection, DOUBLES-only (singles byte-identical), fixed-move
    injection (reachable-gated). Tests rewritten (gimmick tests removed; `planPerishComboMove` +
    `archetypes.test.js` "no trapping gimmick" added). Fast suite **1133 green**; docs/CHANGELOG reframed.

- **2026-07-16 — round 3 (owner): the SELF-combo also applies to singles.** `planPerishComboMove` gained a
  `doubles` flag: the SELF case (a Shadow Tag / Arena Trap mon carries Perish Song) now fires in BOTH
  formats — the caller no longer wraps it in a doubles guard — while the TEAMMATE split stays doubles-only
  (`if (!doubles) return null`). This is a deliberate, owner-authorised **singles-output change** for the
  handful of Shadow-Tag/Arena-Trap mons that learn Perish Song (Gothitelle line, Mega Gengar); the
  determinism gates (cross-ROM consistency) still hold. Tests + docs/CHANGELOG updated. Fast suite 1133.

## Outcome

Gimmick-aware completion finished. Weather (prior) + Trick Room (T-137/138) build themselves; T-124 adds a
**perish-trap moveset team-combo** (owner-reframed from a gimmick: a Shadow Tag / Arena Trap trapper — or its
support partner — carries Perish Song, `planPerishComboMove`, doubles-only) and a **soft surger-aware** layer
for the non-gimmick terrains (misty/grassy/psychic), while keeping electric a gimmick and screens a light role
— all per owner-validated corpus research. Tate & Liza's Trick Room was already engine-built (seeded), not
hardcoded. Fast suite 1133 green, determinism 17/17, singles byte-identical (new paths doubles-gated).
Awaiting owner manual test before closing.