# ADR-010: Responsive visual regression runs in an isolated Playwright dev tool, separate from the zero-dep unit harness

- **Status:** accepted
- **Date:** 2026-07-01
- **Task:** T-040

## Context

[T-040](../../tasks/T-040-mobile-responsive.md) makes the frontend and the generated docs viewer
mobile-responsive **without changing the desktop rendering at all**. Two needs followed:

1. A machine guarantee that desktop stays pixel-identical while mobile CSS is added, and that phones
   have no horizontal overflow — neither is expressible in the repo's DOM-stub unit harness, which does
   no layout or rendering ([ADR-009](ADR-009-frontend-test-harness-zero-dep.md)).
2. A way for the agent to review every screen at every resolution autonomously (the owner explicitly
   did not want to run browser tooling by hand).

ADR-009 committed the *shipped frontend/backend* to **zero runtime dependencies** (only `express`) and
tests them with a hand-rolled DOM stub under `node --test`. Real rendering needs a browser, which that
harness deliberately excludes.

## Decision

Add visual/rendering coverage as a **separate, dev-only tool in `visual-tests/`** — its own npm package
with `@playwright/test` as a devDependency, its own `node_modules`, gitignored browser binaries. It is
**not** wired into the app runtime and adds **zero** runtime dependencies, so ADR-009 stands unchanged:

- ADR-009 governs the **shipped app + its unit/logic harness** → stays zero-dep, `node --test`.
- ADR-010 governs a **dev-only visual/E2E layer** → Playwright, run on demand / locally, never shipped.

The two layers are complementary: fast zero-dep **structural guards** (`frontend/__tests__/responsive.test.js`)
assert the responsive invariants in the source (viewport metas, `@media` layers, drawer plumbing,
desktop-preserving defaults); the Playwright suite (`visual-tests/`) asserts the **rendered** result —
per-viewport pixel snapshots + a no-overflow check — with the **desktop baselines as the "desktop must
not change" lock**. A deterministic Node fixture builder reproduces a current docs-viewer sample so it
can be screenshotted offline. `npm run shoot` is the agent's hands-free multi-resolution preview.

## Alternatives considered

- **Fold visual tests into `node --test` via jsdom/happy-dom** — jsdom does no real layout, so it cannot
  catch overflow or verify desktop pixels; and it is exactly the heavy dep ADR-009 rejected.
- **Add Playwright to the frontend/backend package** — would drag a browser toolchain into the shipped
  app's dependency tree, breaking ADR-009's zero-dep guarantee for no benefit.
- **Manual device testing only** — not repeatable, and can't prove "desktop unchanged" mechanically.

## Consequences

- Desktop identity is now machine-verifiable: the desktop baselines fail loudly if any change perturbs
  desktop rendering. Mobile/tablet baselines evolve and are refreshed with `npm run visual:update` after
  visual review.
- A browser toolchain now exists in the repo, but quarantined to `visual-tests/` (binaries gitignored;
  `npm install && npx playwright install chromium` to set up). It is intentionally **out** of the ROM CI
  (browser cost) — run locally / on demand; documented in `visual-tests/README.md`.
- We commit to keeping the fixture builder in step with `app.js buildDocHtml` and the viewport/screen
  catalogue (`visual-tests/screens.mjs`) current as screens are added.
