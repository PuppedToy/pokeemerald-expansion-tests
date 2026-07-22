---
id: T-189
title: Two-tier seed model (universe seed + run seed)
status: proposed
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: []
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

## Outcome

<!-- Filled when closing. -->
