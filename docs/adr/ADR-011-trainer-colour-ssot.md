# ADR-011: The docs-viewer trainer colour system has one home and is resolved in the pipeline

- **Status:** accepted
- **Date:** 2026-07-01
- **Task:** T-044

## Context

The docs viewer painted every boss trainer card with the same dark-red `.specialCard`
style. We wanted each boss coloured by identity: typed bosses (gym / E4 / champion) by the
**randomized** type they run this seed, evil teams by a two-type mix, rival/Wally by fixed
identity palettes, and common trainers by a neutral non-type colour. This needs four colours
per type (one — the bright `main` — already existed as the frontend's `typeColors`), plus a
rule mapping each trainer to its colours.

Two constraints shaped the design:

1. **SSOT.** All these colours must live in one place; the pre-existing `main` colours (used
   by the move chips) had to be consolidated in, not duplicated.
2. **Tested logic.** All logic in `randomizer/` (except the HTML template) is covered by tests;
   colour classification is real logic, so it cannot live untested inside the template.
3. **Two runtimes.** The viewer HTML is produced both in Node (`writer.js` → `out.html`) and
   in the browser (`writerDocs.js` in the esbuild worker bundle → `app.js` injection). A boss
   must resolve to identical colours in both, and the downloaded doc must stay fully offline.

## Decision

- `randomizer/trainerColors.js` is the **single home** for `TYPE_PALETTES` (4 colours × 18
  types), the generic/rival/Wally/fallback palettes, the evil-team type pairs, and the pure
  `resolveTrainerColors(trainer)` resolver. It is unit-tested.
- Typed bosses are tagged with a `themeType` in `getTrainersData` (gym→`gymMainTypes[i]`,
  E4→`e4NMainType`, Steven→Steel) — one post-pass keyed by trainer class, covering every battle
  instance.
- `runTrainersModule` attaches `trainer.colors = resolveTrainerColors(trainer)` to every
  trainer. This is the **single seam** both writers consume, so colours are resolved once, in
  the pipeline, and flow to both runtimes via the trainer data. The template only reads
  `trainer.colors` and applies inline styles — no colour logic in the template.
- The move-chip `typeColors` map is derived from the same module (`typeMainColors()`) and
  **injected** into the template (replacing a `<script src="colors.js">` placeholder) by both
  runtimes, so the bright per-type colour also has exactly one home.

## Alternatives considered

- **Resolve colours in the browser template from an injected palette.** Rejected: puts untested
  classification logic in the HTML template.
- **Keep `typeColors` hardcoded in the template with a drift-guard test.** Rejected: leaves two
  literal copies of the `main` colours; injection gives a true single home.
- **Tag `themeType` on every boss definition inline.** Rejected: bosses have many battle
  instances (rematches, endgame); a class-keyed post-pass covers them all in one place.

## Consequences

- Adding/adjusting a type's palette or a boss's colour rule is a one-file change with test
  coverage; both runtimes and the move chips follow automatically.
- The pipeline's trainer data now carries a small `colors` object per trainer (also in the
  bundle) — harmless to the schema (top-level allow-list only) and to determinism.
- `themeType` couples to the gym/E4 type-randomization variables; the mapping is verified
  against the team-slot `type` references and guarded by an integration test.
