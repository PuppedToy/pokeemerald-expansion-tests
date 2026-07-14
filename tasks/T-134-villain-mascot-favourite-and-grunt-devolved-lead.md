---
id: T-134
title: Villain mascot favourite + paired grunt leads a devolved copy of it
status: done
type: feature
created: 2026-07-13
updated: 2026-07-14
target-version: 0.8.0
links: [T-128, T-106, T-132]
blocked-by: []
---

# T-134 — Villain mascot favourite + grunt devolved lead

## Context

Owner request (2026-07-13), noted for later. Team Aqua/Magma should feel like they rally around their
leader's signature Pokémon (the "mascot"), and their grunts should foreshadow it with a baby version — the
same reverse-continuity idea as T-106 (endgame roster first, earlier appearances echo it devolved), but
across DIFFERENT trainers of the same faction rather than the same trainer's timeline.

## Plan

- **The favourite Archie/Maxie resolve IS the team mascot** (Archie → Kyogre, Maxie → Groudon). It already
  claims a slot via the T-128 favourite machinery; this task makes that favourite the faction's identity
  anchor that the grunts below reference.
- **Aqua Grunt (Petalburg Woods)** tries to field the **devolved** form of Archie's favourite in its
  **slot 1** — if it fits the grunt's level/tier budget (else skip, don't force an illegal stage).
- **Magma Grunt (Rusturf Tunnel)** tries the **devolved** form of Maxie's favourite in its **slot 1** —
  same budget gate.
- Reuse the T-106 `devolveToLevel` machinery (authoritative endgame form → the most-evolved stage legal at
  the grunt's level). Was previously "forced another way"; give it the dedicated reverse-continuity path.

Acceptance criteria:
- [ ] Archie/Maxie's favourite (the mascot) is resolved first; the two named grunts reference it.
- [ ] Each named grunt leads (slot 1) with the mascot devolved to a level-legal stage, or cleanly skips
      when it doesn't fit the budget (no illegal/over-leveled stage, no crash).
- [ ] Deterministic; per-slot reseed + cross-ROM determinism intact; `cd randomizer && npm test` + gates green.
- [ ] Auditable in the T-130 decision log (grunt slot 1 shown as the devolved mascot, with provenance).

## Progress log

<!-- Append-only. -->

- **2026-07-13** — Task created (owner request). Design + validation before code.
- **2026-07-14** — Owner clarified the mascot = the leader's SIGNATURE MEGA the villain actually commits
  (Kyogre/Groudon are single-stage → can't devolve), so build the leader first, read its committed mega,
  devolve it for the grunt. Preserve display order "like Wally" (no trainer-position changes).
  Implemented by reusing the T-106 machinery exactly:
  - Two `CONTINUITY_GROUPS` entries — `{auth: TRAINER_ARCHIE, members:[TRAINER_GRUNT_PETALBURG_WOODS]}` and
    `{auth: TRAINER_MAXIE_MAGMA_HIDEOUT, members:[TRAINER_GRUNT_RUSTURF_TUNNEL]}` — so `hoist` builds the
    leader first (its mega is stored under `ARCHIE_MEGA`/`MAXIE_MEGA` via its favouriteId) and `displayOrder`
    keeps the grunts in their early canonical slots.
  - Each grunt's slot 1 → `{ special: TRAINER_REPEAT_ID, id: 'ARCHIE_MEGA'|'MAXIE_MEGA', devolveToLevel: true }`
    — reads the leader's committed mega and devolves it to the grunt's level.
  - **Verified** (seeds 2920625670/42/777): Petalburg Woods grunt fields **Carvanha** (devolved Mega
    Sharpedo), Rusturf Tunnel grunt fields **Numel** (devolved Mega Camerupt). `npm test` 1021; determinism
    + continuity gates 17/17.
  - Owner call: the mascot just needs to be ON the team (no forced lead) — the normal party shuffle decides
    its position, like any other mon. No lead rule added. Functionally complete; awaiting owner close.

## Outcome

Shipped (owner-approved 2026-07-14): the Aqua/Magma early grunts foreshadow their leader's signature mascot,
devolved. Reused the T-106 continuity machinery exactly — two `CONTINUITY_GROUPS` entries build the leader
(Archie / Maxie Magma Hideout) first so its committed mega is stored under `ARCHIE_MEGA`/`MAXIE_MEGA`, and
each grunt's slot 1 is a `{ special: TRAINER_REPEAT_ID, id, devolveToLevel:true }` that reads + devolves it.
`displayOrder` keeps the grunts in their canonical early positions (no trainer-position change). Verified on
seeds 2920625670/42/777: Petalburg Woods → Carvanha (Mega Sharpedo devolved), Rusturf Tunnel → Numel (Mega
Camerupt devolved). Owner: the mascot only needs to be ON the team (normal shuffle decides its slot). No new
logic (declarative wiring over tested machinery); npm test 1021, determinism + continuity gates 17/17.