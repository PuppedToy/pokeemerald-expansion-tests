# ADR-009: The frontend is tested with a zero-dependency DOM/env stub under `node --test`

- **Status:** accepted
- **Date:** 2026-06-29
- **Task:** T-036

## Context

The frontend (`frontend/js/account.js`, `app.js`) had no automated tests — only `randomizer/` (Jest)
and `backend/` (node:test) were covered. Two real, deployed bugs ([B-011](../../bugs/B-011-generated-run-lost-on-reload-without-active-build.md),
[B-012](../../bugs/B-012-delivery-optimistic-building-flash.md)) could not be marked `fixed` because
the project's iron rule requires a regression test and there was nowhere to write one. We need a
harness — and the repo's standing rule is **zero new runtime dependencies** (only `express`).

`account.js` is plain ESM with no imports, holds module-level state, and touches a small, known set of
browser globals (`document.getElementById`, `classList`, `innerHTML`/`textContent`, `addEventListener`,
`localStorage`, a tiny IndexedDB use, `fetch`, `setInterval`, `URL.createObjectURL`, `alert`). Crucially
it uses optional chaining (`$('x')?.addEventListener`) for dynamically-created children, so a test DOM
does **not** need real `innerHTML`→child parsing.

## Decision

Test the frontend with a **hand-rolled, zero-dependency DOM/env stub** (`frontend/__tests__/helpers/dom-env.js`)
run by **`node --test`** (same runner as the backend). `getElementById` returns a cached fake element
per id (so set-then-read is consistent); `localStorage`, a minimal in-memory `indexedDB`
(open/transaction/get/put), `fetch` (test-supplied), `alert`, `URL` and `setInterval` are stubbed.
Each test imports a fresh `account.js` via a cache-busting query string to isolate module state. The
frontend suite (`cd frontend && npm test`) is wired into the `update.sh` preflight alongside the others.

## Alternatives considered

- **jsdom** — most realistic, but a heavy devDependency (~dozens of transitive packages) against the
  repo's zero-dep ethos; and we'd still have to stub IndexedDB + fetch ourselves.
- **happy-dom** — lighter than jsdom but still a dependency, same IndexedDB/fetch caveat.
- **Playwright / real browser** — real end-to-end coverage, but a large toolchain + CI cost; overkill
  for unit-testing the delivery state machine.

## Consequences

- No new dependency; tests are fast and run under the existing `node --test`.
- The stub covers only what the code touches — adding frontend features may require extending it
  (e.g. real child-querying) ; that's an accepted, incremental cost.
- We commit to keeping the frontend logic testable (DOM access via `$`/optional-chaining, no DOM work
  at import time) so the stub stays small.
