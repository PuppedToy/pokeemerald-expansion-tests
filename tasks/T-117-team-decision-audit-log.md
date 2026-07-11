---
id: T-117
title: Team-building decision audit log (per-team decision trace, local + 48h server + audit skill)
status: in-progress
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-083, T-107, T-075]
priority: high
---

# T-117 — Team-building decision audit log

## Context

The 2C engine (T-107) is live but its effect is hard to judge from the final teams alone (the owner's
read: "teams feel the same"). To audit the **algorithm** — not guess — we need, per generated team, a
concise, readable **trace of the decisions** that led to the final roster: sophistication, the
emerged/seeded identity, why each slot was picked (which archetype role it fills), and which role move
the refinement injected. Two purposes (owner):
1. **Local:** every local generation ships a decision log the owner can read to verify the decisions
   were sensible.
2. **Server:** a run generated on the server is stored 48h so, if it looks off, the owner can invoke a
   **team-audit skill** that pulls the traces and checks whether generation follows the design
   philosophy (or needs refining).

Reuse the T-075 diagnostics pattern (see `docs/randomizer-diagnostics.md`): a sink threaded into
`writerDocs`, collected **outside the bundle**, returned as a sibling of the worker's `postMessage`,
POSTed to a 48h server store, audited from local via a skill. Bundle shape / determinism untouched.

Philosophy: **concise, not hyper-loaded** — a legible list of decisions per team, not a data dump.

## Plan

**Phase 1 — collection + local readable output (testable now).**
- `randomizer/teamAudit.js`: a collector (`createTeamAudit()` → `{ record, all }`) + a readable text
  renderer (`renderTeamAuditText(traces)`). Concise per team: header (trainer, level, battleType,
  sophistication, final identity) then, for engine-active teams, per-slot lines (identity-so-far →
  chosen species → archetype roles it fills → injected role move); low-sophistication teams collapse
  to a one-liner ("below engine threshold → tier-random, no steering").
- Assemble the trace in `resolveTrainerTeam` **post-hoc from the same pure functions the engine uses**
  (`resolveIdentity`/`detectFeatures`/`scoreCandidate`) — the engine stays untouched, no RNG, no
  output change. Thread an optional `audit` collector via `createTeamResolver` (like `diag`); default
  off → no-op.
- Thread `options.audit` through `writerDocs` ← `generate.js` (`computeRomDocs`, like `diagnostics`).
- Worker (`randomizer-worker.cjs`): create the collector, pass via hooks, return `teamAudit` as a
  sibling in the `done` message (NOT inside the bundle).
- Frontend (`app.js`): on `done`, keep `data.teamAudit` and expose a **Download decision log** action
  (readable `.txt`). This is the testable-now deliverable for `npm start`.

**Phase 2 — server 48h + audit skill (follow-up).**
- POST the audit to a 48h server store (mirror `/api/diagnostics`), sweeper-purged.
- A `/audit-teams` skill that pulls the stored traces and reviews them against the design philosophy.

> **Meta-analysis validation (owner-gated).** This is tooling, not a meta conclusion — no archetype/
> rating value is decided here. (The seed *assignments* it will help validate remain owner-gated.)

Acceptance criteria:
- [x] Per-team decision trace collected without changing generation output (determinism gate green).
- [x] Readable log available locally after an `npm start` generation (download: dedicated button +
      `decision-log.txt` inside the docs ZIP).
- [x] `cd randomizer && npm test` green (915 pass; trace unit-tested; worker bundles cleanly).
- [x] Phase 2 (server 48h + audit skill) planned; can land after Phase 1.

## Progress log

- **2026-07-11** — Created (priority). Investigated the T-075 diagnostics plumbing to mirror it
  (sink → writerDocs → sibling of the bundle → 48h store → skill). Starting Phase 1.
- **2026-07-11 — Phase 1 done.** `randomizer/teamAudit.js` (`createTeamAudit` collector +
  `renderTeamAuditText` + `noopTeamAudit`). Trace assembled **post-hoc in `resolveTrainerTeam`** from
  the same pure engine fns (`resolveIdentity`/`detectFeatures`/`combinedStructure`) — engine untouched,
  no RNG, output-neutral (added `confidence` to `resolveIdentity`, additive). Threaded `audit` like
  `diag`: `createTeamResolver` ← `writerDocs` (`options.audit`) ← `generate.js` (`computeRomDocs`,
  `ctx.audit` from `hooks.audit`). Worker returns `teamAudit` (structured, for the 48h store) +
  `teamAuditText` (readable) as **siblings** of the bundle. Frontend: a **⬇ Decision log** button
  (downloads the `.txt`) + `decision-log.txt` bundled into the docs ZIP. 4 audit unit tests; full suite
  **915 pass**; `RUN_DETERMINISM=1` gate green (output-neutral); worker bundles cleanly.
- **2026-07-11 — the audit immediately paid off (root-cause of "teams feel the same").** A real run's
  log shows almost every strong endgame mon "fills" ~6 roles at once (e.g. one mon flagged
  hazardSetter+wallbreaker+winCondition+weatherSetter+screenSetter+setupSweeper). Cause: the
  **feature detectors detect a role from "can LEARN the move" (potential)** — and Rain Dance / Light
  Screen / setup moves are widely-learnable TMs — so nearly everyone matches nearly everything. Effects:
  (a) every team crystallizes into `bulky_offense` (its entry wallbreaker+revenge is trivially met);
  (b) the fill bias has no real signal to steer by (all candidates "fit"); (c) spurious gimmick tags
  (+weather+screens+trick_room) fire on everyone. **Fix direction (a meta refinement to validate with
  the owner):** tighten detection — role-by-ABILITY or by being *built* for it, not by TM potential;
  and/or crystallize on a stricter basis. This is the next teambuilding-quality task; the audit tool is
  what makes it visible. Phase 2 (server 48h POST mirroring `/api/diagnostics` + `/audit-teams` skill)
  remains, non-blocking.

## Outcome

<!-- Filled when closing. -->
