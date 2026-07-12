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
- [ ] A crystallised/seeded weather team is actually built as a weather team (setter + abusers + synergy),
      not just a lone setter; likewise TR (slow/Room Service), screens, trapping. Verified via the log.
- [ ] Legacy forced gimmicks (Tate & Liza TR, …) are produced by the engine, not hardcoded.
- [ ] Determinism gate green; `cd randomizer && npm test` green.

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

## Outcome
