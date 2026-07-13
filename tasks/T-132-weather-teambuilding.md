---
id: T-132
title: Weather team-building — setter + 2 abusers, rollback-on-fail, and weather-tag mechanics
status: in-progress
type: feature
created: 2026-07-13
updated: 2026-07-13
target-version: 0.8.0
links: [T-131, T-124, T-130, docs/adr/ADR-017-gimmick-attempt-rollback.md, docs/research/weather.md]
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

### 2026-07-13 (cont.) — attempt/rollback engine wired into the resolver
- Refactored `resolveTrainerTeam` into `runAttempt(...)` (the slot loop, writing only to passed-in
  isolated state) + an ORCHESTRATOR that tries the `gimmickFallbackChain` variants, validates each with
  `gimmickHolds`, and commits the first that holds (else the final no-gimmick fallback). Each attempt runs
  on a `storedIds`/IV-cache overlay + a throwaway audit + a cloned trainer (its `tms`/`bag` are mutated in
  place), so failed attempts never touch shared state. `generateIVs` takes an optional cache; `teamAudit`
  gained `absorb()` to merge a committed attempt's trace.
- Determinism + continuity gates GREEN (17/17) — byte-identical for single-attempt (non-gimmick) trainers.
- Auditability: a rolled-back gimmick is recorded on the committed trace (`rolledBack`) and rendered
  ("weather intended but ROLLED BACK (after N attempts): couldn't build its setter + 2 abusers…"); an
  incidental emergent setter is no longer claimed as an identity trait. Suite 983.
- **Observed:** the weather villains now cleanly ROLL BACK (Museum/Matt/Tabitha) because the picker still
  doesn't seek a setter — Archie/Maxie only get a setter incidentally. So the ROLLBACK works, but weather
  doesn't yet BUILD.
- **Next increment:** setter-first picking — bias the attempt to actually PICK a setter (+ abusers) within
  the restriction (owner algo step 2/3), so the weather condition can pass; then the weather-tag mechanics
  (STAB/accuracy/Def-SpDef/Weather Ball) in scoring.

### 2026-07-13 — design (ADR-017) + gimmick success-condition module
- **ADR-017** (accepted) — the general rollback: gimmick team-building is ATTEMPT-based. Resolve into
  isolated state (local team + a `storedIds` overlay + buffered audit) under a candidate tag; validate the
  gimmick's success condition; commit the first attempt that holds, trying the fallback chain (themed
  weather → other weathers random → drop). Determinism survives because each slot reseeds independently, so
  re-running an attempt is byte-identical; failed attempts never touch shared `storedIds`.
- **`modules/gimmickPlan.js`** (new, pure, tested — the SSOT for "did the gimmick materialise"):
  `gimmickHolds(gimmickId, team, ctx, subtype)`. Weather = setter + ≥2 abusers with the BROAD abuser
  definition (abuser ability | synergy move | boosted-STAB attacker; the setter may count; subtype inferred
  from the actual setter if not given). trick_room/screens = setter-move presence for now. 10 unit tests.
  Exported `SETTERS_BY_SUBTYPE` from archetypeRefine for reuse. Suite 978.
- **Remaining (the substantive refactor):** extract the slot loop into an `attempt(seed)` with isolated
  `storedIds`/audit; add the orchestrator (fallback chain + commit); wire the fallback tag variants (weather
  subtypes random order → drop); apply the weather-tag mechanics (STAB/accuracy/Def-SpDef/Weather Ball) in
  move/ability/item scoring. Verify determinism + continuity gates stay green.

## Outcome
