---
id: T-132
title: Weather team-building — setter + 2 abusers, rollback-on-fail, and weather-tag mechanics
status: proposed
type: feature
created: 2026-07-13
updated: 2026-07-13
target-version: 0.8.0
links: [T-131, T-124, T-130, docs/research/weather.md]
blocked-by: []
---

# T-132 — Proper weather team-building

## Context

Follow-up from T-131. The current weather system only assigns setter/abuser ABILITIES per mon; it never
ensures a setter-capable mon is PICKED, so type-restricted weather villains (Museum grunts, Matt, Tabitha)
drop weather entirely (confirmed via the T-130 audit: 0 setter-capable mons picked). The owner defined —
and the corpus validated — a proper build algorithm. Design SSOT: `docs/research/weather.md` (corpus
analysis + the owner-validated algorithm + weather-tag mechanics). Applies to BOTH seeded weather
villains and any team randomly steered to weather.

## Plan

Implement the owner-validated algorithm (see the research doc for the full spec):
1. Tentative weather tag; team-building runs WITH the tag until dropped.
2. Pick a **setter** (ability optimal; move-setter allowed when forcing, gets an abuser ability). Fail→fail.
3. Ensure **2 abusers** (BROAD definition — abuser ability OR synergy move OR boosted-STAB attacker; the
   setter may count). Fail→fail.
4. Condition **setter + 2 abusers**; on fail, **roll back** the setter slot and redefine it (change/drop
   the weather tag).
5. Complete the archetype with non-abusers, preferring weather-synergy where free.
6. Fallback: try other weathers in random order; final fallback → drop the tag, build a normal team.
7. Apply the **weather-tag mechanics** per member (STAB ×1.5 / ×0.5, Weather Ball type+BP, Thunder/Hurricane
   & Blizzard accuracy, Ice Def / Rock SpDef) in move + ability + item scoring.

The hard part is the **rollback**: the current picker/refine is per-mon with no backtracking. Design a
clean way to commit the weather plan only when setter+2-abusers is achievable within the restrictions,
else abandon the tag — without corrupting determinism or the per-slot reseed.

Acceptance criteria:
- [ ] A weather-seeded villain fields a setter + ≥2 abusers of its (themed, else fallback) weather when its
      type pool allows; else the tag is cleanly dropped (auditable via T-130).
- [ ] Museum grunt 2 (snow → falls back within aqua to rain) and Tabitha (sand) actually get weather.
- [ ] The weather-tag mechanics measurably affect the picks (boosted-STAB attackers, synergy moves).
- [ ] Deterministic; per-slot reseed intact; `cd randomizer && npm test` + determinism/continuity green.

## Progress log

<!-- Append-only. -->

## Outcome
