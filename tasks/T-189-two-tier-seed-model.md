---
id: T-189
title: Two-tier seed model (universe seed + run seed)
status: proposed
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: [docs/adr/ADR-019-two-tier-seed-model.md]
blocked-by: []
---

# T-189 — Two-tier seed model (universe seed + run seed)

## Context
Part of the config/seed/bundle standardization epic (siblings: T-188, T-190, T-191). Today
there is a single authored seed (`cfg.seed`, persisted at `bundle.config.seed`) and one global
RNG (`randomizer/rng.js`) re-seeded at nested granularities. All shared subsystems derive from
`cfg.seed` (`trainingBaseSeed = cfg.seed`) and per-ROM subsystems from `cfg.seed ^ (i·0x9E3779B9)`.
This task splits that single seed into two:
- **universeSeed** — seeds the shared block (Pokédex / trainer teams + their item bags /
  starters, whichever the nuzlocke/soul-link checkboxes mark shared). Must be a pure function of
  `universeSeed` alone (invariant to runSeed, ROM count and generation order).
- **runSeed** — seeds the per-ROM subsystems (wild encounters + gym/static rewards, always; plus
  any *unchecked* shareable subsystem). Each ROM = `runSeed ^ (i·0x9E3779B9)`.

Rule: `universeSeed = universe-seed field if provided, else runSeed`. So `default` runs and
single-seed nuzlocke/soul-link keep working the same way; supplying the universe seed lets the
user regenerate/extend the same shared world with fresh per-ROM variation.

**Accepted behavioral change (owner-approved):** per-ROM subsystems get an explicit reseed from
`runSeed` (today wilds ride the sequential RNG stream left after the shared block, so they are a
function of the single seed via stream position). Consequently a pre-refactor seed no longer
reproduces the same ROM byte-for-byte. This is required for the split, is consistent with the
project's documented "any change to draw order/count alters the ROM for a given seed" norm, and
is harmless to existing outputs because saved bundles regenerate byte-identically from the bundle
itself (T-190), not from the seed. Everything else (what is shared, quality, structure, defaults,
how nuzlocke/soul-link behave) stays identical.

## Plan
- Config: add `universeSeed` alongside `seed` (`randomizer/config.js`, `config-form.js` DEFAULTS +
  form field, `toModuleConfig` in `randomizer-worker.cjs` + `backend/generator.js`). Resolve
  `universeSeed = config.universeSeed ?? runSeed` centrally.
- Engine: seed the shared block (`generate.js:162-178` nuzlocke + soul-link equivalent; run-level
  seed ~`generate.js:404`) from `universeSeed`. Give per-ROM subsystems an explicit reseed from
  `runSeed`-derived values (wild loop `generate.js:206-207`; per-player in soul-link). Trainer
  per-slot `baseRngSeed` = `universeSeed` when trainers shared, `runSeed`-derived when not
  (`generate.js:226`, `resolveTrainerTeam.js:221`).
- Mirror every derivation on the compile side (`make.js:89-109` `resolveRomSeed` /
  `resolveTrainingBaseSeed`) so docs == ROM. **Highest-risk point** — verify explicitly.
- Persist resolved `universeSeed` + `runSeed` in `bundle.config`; surface the universe seed in the
  UI/docs (copyable) so it can be reused next session.
- UI: show "Universe seed" only for nuzlocke/soul-link; "Seed" stays always. Blank universe = new
  universe; filled = reuse/extend.
- Record the decision as an ADR (two-tier seed model).
- Fix the stale reference in `randomizer/docs/trainer-determinism.md:15` (`writerDocs.js:241-244`
  → `resolveTrainerTeam.js:221`) while in this area.
- TDD: unit tests that (a) shared output is invariant across runSeed / ROM-count / order for a
  fixed universeSeed, (b) blank universe ⇒ `universeSeed == runSeed` ⇒ sharing semantics unchanged,
  (c) per-ROM output varies with runSeed under a fixed universeSeed.

Acceptance criteria:
- [ ] Fixing `universeSeed` reproduces the shared universe byte-identically regardless of runSeed, ROM count or generation order.
- [ ] Fixing `universeSeed` + fresh `runSeed` yields the same shared universe with different per-ROM wilds.
- [ ] Blank universe seed ⇒ `universeSeed == runSeed`; sharing semantics and structure identical to today (test-locked).
- [ ] `make.js` compile-side seed derivations mirror `generate.js` (docs == ROM), verified.
- [ ] `bundle.config` carries both resolved seeds; universe seed shown in the UI/docs.
- [ ] ADR written; `cd randomizer && npm test` + frontend `node --test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created; design locked. Owner approved the per-ROM reseed behavioral change (seed→ROM mapping changes; saved bundles unaffected).
- **2026-07-22** — In-progress. Confirmed the seed flow end-to-end: single `cfg.seed` → `rng.seed(cfg.seed)` in `runGeneration` (generate.js:406) feeds the shared block; per-ROM wild plans (`runWildModule`, generate.js:207/341) + unshared templates ride the sequential stream; docs phase reseeds `romSeed = cfg.seed ^ (i·GOLDEN)` and `trainingBaseSeed` (shared→cfg.seed, player→cfg.seed^pi, unshared→policy). `make.js` mirrors via `resolveRomSeed`/`resolveTrainingBaseSeed` (make.js:89-109), fed by `bundle.config.seed` (make.js:197). Key safety finding: bundle-mode builds are **verbatim** (docs/artifacts reused, no re-randomization), and existing bundles carry no `universeSeed` ⇒ `universeSeed = seed` ⇒ byte-identical rebuilds. Design: `universeSeed` seeds the shared block + shared/player trainingBaseSeed; `runSeed` (= existing `seed` field) drives per-ROM reseeds (`runSeed ^ i`) for wild + unshared. `universeSeed = cfg.universeSeed ?? cfg.seed`. Resolved `universeSeed` persisted in `bundle.config` (nuzlocke/soul-link only) and surfaced in the UI.
- **2026-07-22** — Implemented (Red→Green):
    - New `randomizer/seeds.js` — single source of truth for `resolveSeeds`/`deriveSeed`/`romSeed`/`trainerBaseSeed`, imported by both `generate.js` and `make.js` (kills the duplicated-derivation drift risk). Unit-tested in `__tests__/unit/seeds.test.js` (16 cases: byte-compat with the legacy `base ^ (i·GOLDEN)`, fallback, invariants).
    - `generate.js` — `runGeneration` resolves the two seeds, seeds the shared block from `universeSeed`, threads `ctx.runSeed`/`ctx.universeSeed`, and persists resolved `universeSeed` in `bundle.config` (null for `default`). Nuzlocke + soul-link: explicit per-ROM reseed `rng.seed(deriveRomSeed(runSeed, i))` before wild/unshared; docs `trainingBaseSeed` via `trainerBaseSeed(...)`; per-player block reseeds `deriveSeed(universeSeed, p)`.
    - `make.js` — `resolveRomSeed`/`resolveTrainingBaseSeed` route through `seeds.js` with a 3rd optional `universeSeed = seed` param (back-compat); `bundleMode` reads `bundle.config.universeSeed ?? seed`; `buildOneRom` threads it. Existing bundles (no `universeSeed`) ⇒ identical values.
    - `config.js` DEFAULTS + validate + `--universe-seed` CLI. `config-form.js`: `universeSeed` in DEFAULTS/getConfig(base)/setConfig, a gated **Universe seed** field + Roll button (shown only for nuzlocke/soul-link) in General, `_syncUI` visibility. Adapters (`randomizer-worker.cjs`, `backend/generator.js`) already preserve it via spread — no change.
    - Browser bundle rebuilt (`node build.js`).
    - Tests: randomizer `npm test` 1570 passed; frontend `node --test` 113/0. ADR-019 written; `trainer-determinism.md` stale ref fixed (`writerDocs.js:241-244` → `resolveTrainerTeam.js:221`).
- **2026-07-22** — Gated `universeSeedInvariance` first FAILED (`sharedFp(gen(999)) !== sharedFp(gen(999))`). Investigated with a separate-process diagnostic (scratchpad/detgen.js, hashing sub-fields across independent `node` runs — the production shape, one gen per process):
    - **False positive, not a bug.** `sharedData.pokedex.generatedAt` is a wall-clock timestamp ⇒ two runs differ on it; hashing the whole pokedex flagged that.
    - Deeper: with a fixed `universeSeed` but different `runSeed`, `sharedData.trainers` + `starters` are **byte-identical** (531d/a1fe) and `wild` differs — exactly the guarantee. But `pokedex.pokes` also differed by runSeed. Instrumented `generateNuzlocke`: pokes `@after-shared-block` is identical across runSeeds (`8d3220a6`), and only diverges `@before-bundle` — the per-ROM wild pass writes **mega-evolution availability gating onto the shared pokemon objects**, which is **legitimately per-ROM** (mega discovery is per-ROM by design, cf. `trainer-determinism.md`), not part of the shared world. Pre-existing; unchanged by this task.
    - Fix was in the TEST: fingerprint the universeSeed-pure shared world (`trainers` + `starters` + `pokedex.moves`/`abilities`), excluding `pokes` (per-run mega-gating side-effect) and `generatedAt`. Added a "different universeSeed ⇒ different world" case. Debug instrumentation removed. Re-running gated to confirm green.

## Outcome

<!-- Filled when closing. -->
