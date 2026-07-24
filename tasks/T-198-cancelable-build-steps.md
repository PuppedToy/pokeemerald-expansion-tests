---
id: T-198
title: Cancel button for the randomization and ROM-build steps
status: done
type: feature
created: 2026-07-24
updated: 2026-07-24
target-version: 0.6.0
links: []
blocked-by: []
---

# T-198 — Cancel button for the randomization and ROM-build steps

## Context

While a run is being **randomized** (step 3, the in-browser Web Worker → `#gen-running`) there is
no way to stop it: the panel only shows a progress bar, and the wizard's "Start over / Cancel" control
lives on the *done* screen (`#gen-done`), which is hidden while generating. So the randomization is not
cancelable at all.

While the **ROM** is being built the server-side cancel already works (`/api/cancel` →
`killActiveBuild`, T-035), but it is wired only to the small bottom `#btn-start-over` ghost button
below all the action buttons — easy to miss, so the build *feels* uncancelable too.

Owner request: a clear Cancel button in **both** phases.

## Plan

1. **Randomization (`#gen-running`)** — add a visible `Cancel` button. Click terminates the Worker
   (`terminateWorker()`) and returns to the Review step (step 2), where the user can tweak and
   regenerate. No server state exists yet, so no confirm and no API call.
2. **ROM build (`#gen-done`)** — surface the already-working cancel where the user is looking: a
   contextual `Cancel build` button inside the *building* and *queued* status rows. Reuse the exact
   cancel flow (`/api/cancel` → `clearRun` → reset). Hide the redundant bottom `#btn-start-over`
   in those two states so there is exactly one cancel affordance per state.

Acceptance criteria:
- [x] A Cancel button is shown during randomization; clicking it stops the Worker and returns to Review.
- [x] A Cancel button is shown in the ROM building/queued rows; clicking it POSTs `/api/cancel` and
      resets the run (same as the existing Start over / Cancel control).
- [x] The bottom `#btn-start-over` is hidden while building/queued (no duplicate Cancel).
- [x] `cd frontend && npm test` and `cd backend && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-24** — Task created. Traced the two phases: randomization Worker (`app.js` → `#gen-running`,
  no cancel) and server ROM build (`account.js` → `#gen-done`; `/api/cancel` + `killActiveBuild` already
  functional, only the tiny bottom button exposes it). Plan above.
- **2026-07-24** — Implemented.
  - Randomization: added `#btn-cancel-gen` inside `#gen-running` (`index.html`), wired in `app.js`
    (`cancelGeneration()` → `terminateWorker()` + `showStep(2)`), styled via `.generate-actions`.
  - ROM build: extracted the shared `cancelActiveRun(mode)` in `account.js` (confirm → `/api/cancel`
    → `clearRun` → reset), reused by the bottom `#btn-start-over` and a new in-row `#rom-cancel`
    "Cancel build" button rendered in the building & queued rows; `setStartOverBtn` now hides the
    bottom control while building/queued so there's exactly one Cancel per state. Added `.rom-cancel-btn`
    CSS.
  - TDD: new `frontend/__tests__/cancel-build.test.js` (4 cases) — red first (no `#rom-cancel`), green
    after. Fixed a stub-only double-listener count in the queued case (a real DOM drops listeners on
    `innerHTML` replace; the zero-dep stub caches elements — made that render idempotent in the test).
  - Suites: `frontend` 146/146, `backend` 175/175 green. No server code changed (the cancel API was
    already correct and unit-tested).
  - Visual: the changed UI (gen-running + building/queued rows) is not in the `visual-tests` default
    screen set and the additions are small centred buttons in existing flex containers (no overflow
    risk), so no `shoot` pass was run — it could not reach these states without driving a full Worker run.

## Outcome

Shipped both cancel affordances. Randomization is now stoppable mid-run (back to Review); the ROM
build/queue shows an in-row **Cancel build** button backed by the existing `/api/cancel` flow, with the
redundant bottom control hidden in those states. Merged to `master` (this repo's integration branch;
see the note — there is no `develop`). Owner opted not to manually test.
