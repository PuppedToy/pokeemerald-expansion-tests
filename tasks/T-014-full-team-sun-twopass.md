---
id: T-014
title: Full-team sun visibility for Solar Beam/Blade via a determinism-preserving two-pass build
status: proposed
type: feature
created: 2026-06-20
updated: 2026-06-28
target-version: 0.4.0
links: [tasks/T-013-move-rating-heuristics.md]
blocked-by: []
---

# T-014 — Full-team sun visibility via a determinism-preserving two-pass team build

> **Backlog / not scheduled.** This captures the investigation + action plan so the knowledge isn't
> lost if we ever decide to do it "the harder way". T-013 shipped the cheaper **earlier-teammates-only**
> version; this task is its possible evolution.

## Context / motivation

In T-013, Solar Beam / Solar Blade are valued only when sun is provided by **this mon** (own Drought /
Orichalcum Pulse / Desolate Land / own Sunny Day) or an **EARLIER** teammate (the partial approach —
see `randomizer/writerDocs.js` `teamHasSun = team.some(...)`, which only sees members already built).
That misses a sun-setter placed **later** in the team, and misses a teammate's **organically-chosen**
Sunny Day. This task would make Solar Beam/Blade see the **whole** team's sun (any slot, any order),
including organic Sunny Day.

The `teamHasSun` flag is already threaded end-to-end through the rater
(`rateMoveForAPokemon` → `chooseMoveset` / `adjustMoveset`), so the rating side needs **no** change —
only how/when `teamHasSun` is computed and supplied.

## Why it's hard (the investigation)

1. **Sequential build.** `writerDocs.js` builds each team member in slot order: species → ability →
   `chooseMoveset` → item → nature → `team.push`. At move-selection time only earlier members exist,
   so the full team (and its abilities) isn't known yet.
2. **Per-slot RNG reseeding = the trainer-determinism mechanism.** When `baseRngSeed !== null`
   (`writerDocs.js` ~L241-244), each slot reseeds the RNG to a deterministic per-slot seed
   (`slotSeed = baseRngSeed ^ hash(trainerId:slotIndex)`). This is what keeps shared trainers
   consistent across a bundle's ROMs (`randomizer/docs/trainer-determinism.md`).
3. **`rng.js` exposes no state save/restore.** It's a mulberry32 closure with a private `t`
   (`seed`/`random`/`reset` only).
4. **SSOT is `writerDocs.js`.** The bundle ROM build does NOT rebuild teams — `writer.js` does
   `buildTrainersResultsFromDocs(docs.trainersResultsSimplified, …)` (writer.js ~L520-523, "Single
   source of truth"). The `writer.js` `chooseMoveset` loop (~L558-770) is only the standalone
   (`docs === null`) fallback and must be kept consistent.

A **naive** two-pass (decide all species+abilities first, then all movesets) would change the RNG draw
order and therefore **silently change every generated team** for a given seed.

## Action plan (determinism-preserving)

1. **`randomizer/rng.js` — add `getState()` / `setState(s)`** that read/write the internal mulberry32
   state, preserving the exact sequence (refactor the closure `t` into a module variable; verify the
   number sequence is byte-identical so existing seeded outputs/tests don't move).
2. **`writerDocs.js` — split the per-slot loop into two passes with per-slot RNG state capture:**
   - **Pass A** (slot order): `if (baseRngSeed!==null) rng.seed(slotSeed)`; pick species (+mega/
     foundMega/storedIds) + ability + seed forced moves; build the skeleton `newTeamMember`; push to
     `team`; `savedState[slotIndex] = rng.getState()`.
   - Compute **`teamHasSun`** once from the full `team`: any member with `DROUGHT` / `ORICHALCUM_PULSE`
     ability, or a forced Sunny Day. (With this structure, organic Sunny Day can also be folded in if
     pass B records it, but forced is the deterministic baseline T-013 agreed on.)
   - **Pass B** (slot order): `rng.setState(savedState[slotIndex])`; `chooseMoveset(… teamHasSun …)` →
     item-from-bag → nature → `adjustMoveset`. Because state is restored to exactly after the slot's
     ability pick, each slot's RNG sequence is **identical** to the single-pass — outputs stay
     byte-identical EXCEPT the intended `teamHasSun` effect on Solar Beam/Blade.
   - Note: this is determinism-preserving only when per-slot reseed is active (`baseRngSeed!==null`),
     which is the case for the frontend docs and the bundle. For the `baseRngSeed===null` standalone
     path it would shift outputs (non-deterministic anyway).
3. **`writer.js` — mirror the same two-pass** in the standalone (`docs===null`) loop for consistency.
4. **Verify** the determinism test suite stays green and headless docs are byte-identical to pre-change
   except for the targeted Solar Beam/Blade changes; spot-check a team with a late sun-setter.

## Acceptance criteria (when/if undertaken)
- [ ] `rng.getState`/`setState` round-trip preserves the exact mulberry32 sequence (unit test).
- [ ] Two-pass build makes Solar Beam/Blade see sun from ANY teammate (incl. one in a later slot).
- [ ] Determinism preserved for the seeded per-slot path: generated teams byte-identical to before
      except where teammate sun newly enables/【dis】ables Solar Beam/Blade (snapshot/determinism suite green).
- [ ] `writer.js` standalone loop mirrors `writerDocs.js`.

## Progress log

- **2026-06-20** — Proposed. Investigation + plan captured during T-013 (which shipped the
  earlier-teammates-only version). Not scheduled.

## Outcome

<!-- Filled if/when undertaken. -->
