---
id: T-005
title: Isolate localStorage per generated docs run
status: done
type: fix
created: 2026-06-19
updated: 2026-06-20
target-version: 0.1.0
links: [tasks/T-002-offline-docs-assets.md, tasks/T-004-docs-overhaul.md]
blocked-by: []
---

# T-005 — Isolate localStorage per generated docs run

## Context

The self-contained docs generated for each run (`frontend/template.html`) persist UI
state — pokedex filters, nuzlocke tracker, nav collapse — in `localStorage` under
**fixed, shared keys**:

- `pokedex_filters_v1` (`FS_KEY`, template.html:1424)
- `nuzlocke_v1` (`NZ_KEY`/`LS_KEY`, template.html:1425 & :1816)
- `nav_collapsed` (`NAV_KEY`, template.html:2112)

Because the keys are constant, two docs from different runs opened in the same browser
(same origin — e.g. both served from `localhost` or both `file://`) share one storage
bucket. Editing the nuzlocke/filters in one run's docs mutates the state the other run
reads back, so the second collapses onto the first run's state instead of keeping its own.

## Plan

Namespace every `localStorage` key by a per-run identifier so each generated docs file
owns an isolated bucket, while a single docs file still restores its own state on reload
(reopening the same run must NOT reset it).

Approach (to confirm before implementing):
- Inject a stable, unique run id into the template at generation time (e.g. bundle/run
  id or seed-derived) and suffix it onto each storage key (`pokedex_filters_v1::<runId>`).
- Resolve the run id at the writer/generation boundary, not from `Date.now()` in the
  page (a re-opened file must reuse the same id).
- Decide migration/cleanup: stale buckets from old runs accumulating in one origin.

Acceptance criteria:
- [x] Two docs generated from different runs, opened in the same browser, keep fully
      independent nuzlocke / filter / nav state (editing one never affects the other).
- [x] Reloading or reopening a single run's docs restores that same run's state (no reset).
- [x] All four keys (`FS_KEY`, `NZ_KEY`, `LS_KEY`, `NAV_KEY`) are namespaced; no fixed
      key remains shared across runs.
- [x] Run id is deterministic for a given run (stable across reopen), not generated in-page.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-19** — Task created.
- **2026-06-20** — Implemented. Root cause confirmed: 3 logical keys (`pokedex_filters_v1`,
  `nuzlocke_v1`, `nav_collapsed`) defined under 4 consts (`FS_KEY`/`NZ_KEY`/`LS_KEY`/`NAV_KEY`)
  plus 2 hardcoded `removeItem` calls, all with fixed strings → shared bucket across runs.
  Solution: added pure helper `docRunNamespace({seed,playerIndex,romIndex})` in
  `randomizer/writer.js` (TDD: `__tests__/unit/docRunNamespace.test.js`, 8 cases, Red→Green)
  producing e.g. `s42-p0-r1`. Template gains a `%%DOC_RUN_NS%%` token + `nsKey(base)` helper;
  every key/`removeItem` now goes through `nsKey`, which suffixes `::<ns>` when generated and
  falls back to the legacy shared key when the token is left intact (dev/raw template).
  Wired the namespace into all generation paths: `writer()` (new trailing `runNs` param),
  `make.js` (bundle loop per-ROM + randomize mode), and the browser path `frontend/js/app.js`
  `buildDocHtml` (mirrors the formula, fed by `currentBundle.config.seed`). Full suite green
  (415/415). Note: `startersModule.test.js` is intermittently flaky (random-seed starter
  fallback) — pre-existing, unrelated to this change. Pending user manual test before closing.
- **2026-06-20** — User manually tested generated docs ("Looking good!") and confirmed runs no
  longer collide. Closed.

## Outcome

Generated docs now namespace their `localStorage` per run. Shipped exactly as planned:

- Pure helper `docRunNamespace({seed,playerIndex,romIndex})` in `randomizer/writer.js`
  (id form `s<seed>-p<player>-r<rom>`), covered by `__tests__/unit/docRunNamespace.test.js`.
- `frontend/template.html`: `%%DOC_RUN_NS%%` token + `nsKey(base)` helper; all 4 key consts
  (`FS_KEY`/`NZ_KEY`/`LS_KEY`/`NAV_KEY`) and the 2 reset `removeItem` calls go through it.
  Raw/un-generated template falls back to the legacy shared keys (no dev regression).
- Namespace injected in every generation path: `writer()` (new trailing `runNs` param),
  `make.js` (bundle loop per-ROM + randomize mode), `frontend/js/app.js` `buildDocHtml`.

Each generated doc within a run is scoped to its own ROM, so distinct ROMs of the same run
track independently (intended — each ROM is a different randomized game). Two docs share a
bucket only when seed+player+rom are identical (i.e. the same game regenerated).

No deviations from the plan. No follow-up tasks spawned. Pre-existing flakiness in
`startersModule.test.js` (random-seed starter fallback) was observed but is out of scope.
