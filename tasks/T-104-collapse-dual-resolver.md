---
id: T-104
title: Collapse the writer.js / writerDocs.js dual resolver into one shared module
status: in-progress
type: refactor
created: 2026-07-09
updated: 2026-07-10
target-version: 0.8.0
links: [T-083, T-103]
blocked-by: [T-103]
---

# T-104 — Collapse the writer.js / writerDocs.js dual resolver into one shared module

## Context

`writer.js` (`:543-802`) and `writerDocs.js` (`~230-360`) implement the same ~250-line team
resolution loop and have drifted before (documented in `modules/trainerAbility.js:1-13`). The new
engine must have exactly one resolution path. Doing this refactor first — on the *current* behaviour,
guarded by tests — de-risks the rewrite by giving us a single seam to replace.

## Plan

**Exact extraction boundary (analysed 2026-07-10 — both loops read + compared, confirmed parallel):**
- New `randomizer/modules/resolveTrainerTeam.js` exporting `resolveTrainerTeam(trainer, deps) → team[]`
  = the `trainer.team.forEach(...)` resolution body currently duplicated at `writer.js:604-799` and
  `writerDocs.js:257-425` (select-with-fallback → mega handling → store IDs → build member →
  tryToHaveMove → `pickTrainerMonAbility` → weather/PowerHerb `selCtx` → Palafin-effective →
  `chooseMoveset` → bag-item selection → nature → `adjustMoveset` → push), plus the identical
  `generateIVs` closure (`writer.js:546` / `writerDocs.js:209`).
- **Callers keep** their own `copy:` handling and their own `trainersResults[id] = { …meta…, team }`
  assembly — the META differs (writerDocs carries `label`/`choiceBattle`; writer carries `colors`,
  the randomize-mode reward mapping, etc.). Only the TEAM resolution is shared.
- **Deps (per-run data) passed in:** `pokemonList, moves, abilities, starters, staticRewards,
  replacementLog, megaReplacementLog, isSuperEffective, storedIds, baseRngSeed, palafinHero`. The
  module imports its own leaf helpers (chooseMoveset/adjustMoveset/rateItemForAPokemon/chooseNature/
  palafinEffectivePoke, pickTrainerMonAbility, selectWithAutoFallback, createChooser, sample/
  canLearnMove/usesStrategicNature, NATURES/GENERIC_DEVIATION/EVO_TYPE_SOLO/PALAFIN_ZERO_ID,
  itemIdToName, djb2Hash, rng) — all already used identically by both callers.
- **Behaviour-preserving.** The loops are parallel; extracting the common body preserves output. Any
  latent drift is reconciled to `writer.js`'s (fuller, commented) version and noted in the log.
- **Verification gate:** the FULL suite green — especially `integration/crossRomBossDeterminism.test.js`
  (ROM/docs byte-parity across shared trainers) + `unit/writer.test.js` + `unit/writerDocsHelpers.test.js`.
  Execute + verify with clean context (a subtle determinism regression must not slip through).

Acceptance criteria:
- [x] One shared resolver module; `writer.js` and the docs path both use it (no duplicated loop).
- [x] Byte-identical output vs. pre-refactor for fixed seeds (crossRomBossDeterminism stays green).
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-10** — Started on `feature/T-104-collapse-resolver`. Read + compared both resolution loops
  (`writer.js:604-799` ≈ `writerDocs.js:257-425`) — confirmed they are parallel copies sharing the same
  primitives (`createChooser` / `selectWithAutoFallback` / `pickTrainerMonAbility` / `chooseMoveset` /
  `rateItemForAPokemon` / `chooseNature`) and the same `generateIVs`. Determined the clean extraction
  boundary (above): share the **team-resolution `forEach` + generateIVs**; keep each caller's `copy:`
  handling + trainersResults meta assembly. Deliberately did NOT execute the byte-identical extraction
  at the tail of a very long session — it is a behaviour-preserving core refactor whose only guard is
  the determinism suite, so it will be executed with clean context and verified against
  `crossRomBossDeterminism`. Plan is de-risked and ready to run.
- **2026-07-10** — Executed the extraction. New `randomizer/modules/resolveTrainerTeam.js` exports
  `createTeamResolver(deps) → { resolveTrainerTeam }` (closes over the shared `storedIds` +
  per-pokeId IV cache, created once per run) and `normalizeTrainerBagTms(trainer)`. The loop body is
  a verbatim copy of writerDocs.js's (the version the determinism gate exercises); diagnostics route
  through an injected `diag` sink (writerDocs passes its real sink; writer.js passes none → defaults
  to `noopDiagnostics()`, matching that legacy path's non-structured behaviour). Both callers now
  delegate — each keeps only its own `copy` handling + trainersResults meta (writerDocs: label/
  choiceBattle; writer: randomize-mode reward map). **Net −467 lines across the two callers, +298 in
  the shared module.** Pruned the imports that went dead with the loop (rating fns, trainerSelector/
  Fallback/Ability, several constants, `usesStrategicAbility`, `DIAGNOSTIC_CODES`) and the now-unused
  local `djb2Hash` in writer.js. **Verified:** full suite 844 pass; the `RUN_DETERMINISM=1`
  cross-ROM gate PASSES (~64 s, real generation path) — shared-trainer teams byte-identical across
  ROMs; all three modules `require()` cleanly; working tree clean (no game files touched). Acceptance
  criteria met. Kept `in-progress` — closes with the 2C batch manual test (per the batch-test policy;
  a byte-identical internal refactor has no standalone manual surface).

## Outcome

<!-- Filled when closing. -->
