# ADR-017: Gimmick team-building is attempt-based with rollback

- **Status:** accepted
- **Date:** 2026-07-13
- **Task:** T-132

## Context

Gimmicks (weather, Trick Room, screens, trapping) are INTENTS: a team declares one, then must gather its
support (a weather needs a setter + ≥2 abusers; Trick Room needs a TR setter + slow abusers; …). The
current resolver builds the team one slot at a time with a per-slot reseed and NO backtracking, so a
gimmick that can't gather support leaves a half-committed team — a weather setter with no abusers, or (the
T-131 finding) no setter picked at all so the gimmick silently drops. We need a GENERAL way to "assume the
tag, build forward, and roll back if the support can't be assembled" — the owner's model — that works for
every gimmick and stays deterministic.

Key facts about the current engine that make this tractable:
- Each slot reseeds independently (`rng.seed(baseRngSeed ^ hash(trainerId + ':' + slotIndex))`), so
  re-running a team build with a different gimmick tag is byte-identical — determinism survives retries.
- The only cross-team side effects are `storedIds` (continuity ids read by later `REPEAT_ID` slots) and
  the decision `audit`. Everything else (IV cache) is keyed and idempotent.

## Decision

Team resolution for a gimmicked trainer becomes **attempt-based**:

1. A gimmick declares two things (SSOT in a new `gimmickPlan` module): a **success condition** — a pure
   predicate over the resolved team (e.g. weather → setter + ≥2 abusers, per `docs/research/weather.md`) —
   and a **fallback chain** — the ordered tag variants to try (a themed weather → the other weathers in a
   seeded-random order → no gimmick).
2. The resolver runs the slot loop as an **attempt** under a candidate tag, into ISOLATED state: a local
   `team`, a `storedIds` OVERLAY (`{ ...shared }` — reads see committed continuity, writes stay local), and
   a BUFFERED audit. It returns the resolved team + its buffered writes.
3. The orchestrator tries the fallback chain in order and **commits the first attempt whose success
   condition holds** (merging its `storedIds` overlay into the shared map and flushing its audit). If none
   holds, it commits the final no-gimmick attempt. A failed attempt is simply discarded — it never touched
   shared state, so continuity for later trainers is intact.

Non-gimmick trainers take a single attempt (no condition) — byte-identical to today.

## Alternatives considered

- **Per-slot backtracking** (undo the last N slots): rejected — stateful, tangles with the per-slot reseed,
  hard to reason about.
- **Accept half-committed gimmicks** (today): rejected — it's the bug (setter with no abusers, or a dropped
  tag that still coloured the picks).
- **Hardcode a guaranteed setter slot**: rejected — rigid, reintroduces the per-trainer special-casing T-128
  removed, and can't express "drop the gimmick when the restriction can't support it".

## Consequences

- One general rollback serves every gimmick; adding a gimmick = declaring its success condition + fallback
  chain, no new control flow.
- Cost: a gimmicked trainer re-runs its (≤6-slot) build once per attempted variant. Bounded and small;
  non-gimmick trainers are unaffected.
- We commit to isolating `storedIds` + `audit` per attempt (the overlay/buffer). The slot loop must be
  extracted into a pure-ish `attempt(seed)` with no direct shared-state writes until commit.
- The gimmick success conditions become the single source of truth for "did the gimmick materialise",
  replacing the softer `gimmickMaterialised` reading in the audit.
