# ADR-019: Randomization uses two seeds — a universe seed and a run seed

- **Status:** accepted
- **Date:** 2026-07-22
- **Task:** T-189

## Context

Randomization was driven by a single authored seed (`cfg.seed`, persisted at
`bundle.config.seed`). One global RNG (`randomizer/rng.js`) is re-seeded at nested
granularities; everything shared across the ROMs of a Nuzlocke/Soul-Link (the "shared block":
Pokédex, trainer teams + item bags, starters) derived from `cfg.seed`, and per-ROM content
(wild encounters + gym/static rewards) derived from `cfg.seed ^ (romIndex·GOLDEN)`. The two
roles were entangled in one number.

Users want to **reuse a shared world across separate sessions**: generate 3 ROMs today, then
another day generate 3 more ROMs of the *same* Nuzlocke/Soul-Link universe with fresh per-ROM
variation. A single seed cannot express "keep the world, reroll the ROMs".

The derivations were also **duplicated** between `generate.js` (bundle creation) and `make.js`
(compile), which had to be kept in lock-step by hand ("must match … so docs == ROM") — a
standing drift risk.

## Decision

Split the single seed into two, resolved centrally in `randomizer/seeds.js` (the single source
of truth for every derivation, imported by both `generate.js` and `make.js`):

- **`universeSeed`** seeds the shared block. Pure function of `universeSeed` alone — invariant
  to `runSeed`, ROM count and generation order.
- **`runSeed`** (the existing `seed` field) drives per-ROM subsystems: each ROM reseeds from
  `runSeed ^ (romIndex·GOLDEN)` before its wild plan + any unshared templates.
- Resolution rule: **`universeSeed = cfg.universeSeed ?? runSeed`.** So `default` runs and
  single-seed Nuzlocke/Soul-Link keep working exactly as before; pinning the universe seed lets
  the user extend the same world. The resolved `universeSeed` is persisted in `bundle.config`
  (Nuzlocke/Soul-Link only) and surfaced in the UI so it can be copied and reused.
- Trainer-sharing levels map to seeds via `seeds.trainerBaseSeed`: `shared`/`global` →
  `universeSeed`; `player-N` → `deriveSeed(universeSeed, N)`; per-ROM → the caller's unshared
  policy (worker: `romSeed`; backend/make: `null`).

**Accepted behavioural change:** per-ROM subsystems now get an *explicit* reseed from `runSeed`
(previously the wild plan rode the sequential RNG stream left after the shared block). A
pre-refactor seed therefore no longer reproduces the same ROM byte-for-byte. This is required
for the split, is consistent with the project's standing "any change to RNG draw order/count
alters the ROM for a given seed" norm, and is harmless to existing artifacts: **saved bundles
regenerate byte-identically from the bundle itself** (bundle mode is verbatim), not from the
seed, and bundles predating this change carry no `universeSeed` ⇒ `universeSeed = seed` ⇒
identical rebuilds.

## Alternatives considered

- **Keep one seed, walk the ROM index to "extend" a universe.** Rejected: it cannot reroll
  per-ROM content while holding the world fixed, and exposes an index the user must track.
- **Make wilds a pure function of `universeSeed` (no per-ROM reseed).** Rejected: then `runSeed`
  would not affect wilds at all, so "same universe, fresh ROMs" would produce identical wilds.
- **Correlate/link wilds across Soul-Link players.** Rejected for now (owner decision): the two
  seeds do not change how Nuzlocke/Soul-Link behave — wilds stay per-ROM as today.
- **Keep the derivations duplicated in `make.js`.** Rejected: routing both sides through
  `seeds.js` removes the drift risk entirely.

## Consequences

- Reusing a world is now first-class: pin `universeSeed`, leave `seed` blank ⇒ same shared
  world, fresh wilds. Full reproduction of an exact ROM is covered by regenerate-from-bundle
  (T-190), so no separate "batch seed" is exposed.
- `seeds.js` is the one place seed math lives; `generate.js` and `make.js` can no longer drift.
- The seed→ROM mapping changed once, at this cut; seeds were never a cross-version-stable
  contract, and saved bundles are unaffected.
- We commit to keeping the shared block a pure function of `universeSeed` (no per-ROM state may
  leak into it) so the reuse guarantee holds. Locked by `__tests__/unit/seeds.test.js` and the
  gated `__tests__/integration/universeSeedInvariance.test.js`.
