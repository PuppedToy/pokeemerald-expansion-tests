---
id: T-036
title: Frontend test harness + regression tests for the frontend bugs (B-011, B-012)
status: done
type: chore
created: 2026-06-29
updated: 2026-06-29
target-version: 0.4.0
links: [B-011, B-012, T-031]
---

# T-036 — Frontend test harness + regression tests for B-011/B-012

## Context

The frontend (`frontend/js/app.js`, `account.js`) has **no automated test harness** — only `randomizer/`
(Jest) and `backend/` (node:test) are covered. Two real, fixed-and-deployed bugs cannot be marked
`fixed` because the project's iron rule requires a regression test that reproduces them and there is
nowhere to write it:

- **[B-011](../bugs/B-011-generated-run-lost-on-reload-without-active-build.md)** — a generated run is lost on reload when no build is in flight (email-verification round-trip).
- **[B-012](../bugs/B-012-delivery-optimistic-building-flash.md)** — the delivery panel flashed a false "Building" before the server confirmed.

The owner chose to build a harness (rather than waive the rule) so these — and future frontend logic —
get real regression coverage.

## Plan

- Pick a harness. Note the **zero-new-runtime-dependency** stance (only `express` at runtime): a DOM
  test tool would be a **dev**-dependency, so decide between jsdom / happy-dom (devDependency, richest)
  vs. hand-rolled DOM + IndexedDB/localStorage stubs (no dep, more work). Record the choice as an ADR.
- Make the frontend modules testable: the DOM-coupled logic (delivery state machine `renderRom`/
  `reevaluateDelivery`/`categoryOf`, the IndexedDB bundle store + `delivered` persistence, the
  recovery/restore path) should be importable and exercised against the stubbed DOM/storage.
- Write the regression tests:
  - **B-011**: a stored bundle with no active request is restored into the step-3 view on init (and the
    `delivered` flag is honoured so a downloaded run isn't rebuilt).
  - **B-012**: the optimistic state on Generate is the neutral "Submitting…", never a "Building" flash
    before the server confirms.
- Wire the harness into the `update.sh` preflight alongside the other suites.

## Acceptance criteria
- [x] A frontend test command exists and runs in CI/preflight.
- [x] B-011 and B-012 each have a test that FAILS before their fix and PASSES after; their
      `regression-test` fields are filled and both bugs move to `fixed`.
- [x] Harness choice recorded as an ADR.

## Progress log

- **2026-06-29** — Created when closing T-031 (owner chose "create a frontend harness" over waiving the
  iron rule for B-011/B-012). Backlog; not started.

- **2026-06-29** — Built it. Chose a **zero-dependency DOM/env stub** under `node --test` over jsdom/
  happy-dom (ADR-009) — `account.js` is import-free ESM and uses optional chaining for dynamic children,
  so a cached-fake-element `getElementById` + minimal `localStorage`/`indexedDB`/`fetch`/timer stubs
  suffice. `frontend/__tests__/helpers/dom-env.js` + `account.test.js` (fresh module per test via a
  cache-busting import). Regression tests for B-011 and B-012 both verified **FAIL before / PASS after**
  (temporarily reverted each fix to confirm). Wired into the `update.sh` preflight (`cd frontend &&
  npm test`). 3/3 green.

## Outcome

- **2026-06-29** — Done. Frontend now has an automated test harness (zero new deps, ADR-009) in the
  preflight gate. B-011 and B-012 got real regression tests and moved to `fixed`. Test-infra task →
  closed on green (nothing to manually test). Future frontend logic can extend the stub as needed.
