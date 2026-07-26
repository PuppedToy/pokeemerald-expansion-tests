---
id: T-220
title: Build + minify the app frontend (serve a dist in production)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-218, T-219]
blocked-by: []
---

# T-220 — Frontend build + minify (serve a dist)

## Context

The app frontend is served **raw**: `backend/server.js` does `express.static(frontend/)`, shipping
`index.html`, the `js/*.js` ES modules and the CSS unminified and comment-laden (only the randomizer
*worker* is bundled today, via `build.js`/esbuild → `randomizer.bundle.js`). So view-source exposes dev/AI
comments and the payload is larger than it needs to be. **esbuild is already a dependency**, so the tool
cost is nil — the real cost is the architectural change to a source→dist serving model.

This is the *frontend* half of the shipped-artifact minify; the docs viewer is
[T-219](T-219-minified-docs-viewer.md) and the conservative *source* comment cleanup is
[T-218](T-218-strip-ai-tells-from-shipped-html.md).

## Plan

Introduce a frontend build that bundles + minifies the app modules, CSS and `index.html` into a `dist/`,
and serve `dist` in production while keeping the raw edit-refresh loop in development.

- **Build:** extend `build.js` (or add `build:frontend`) to esbuild-bundle the app entry module graph
  (`app.js` + its imports: account/admin/config-form/presets/feedback/session/romNaming/rom-store, the
  `bps.bundle.js` + worker dynamic imports) minified, minify the CSS, and emit a minified `index.html`
  wired to the built assets. Keep `verify.html`/`reset.html` (already clean).
- **Serve model:** `server.js` serves `dist/` when `NODE_ENV=production` (or a `SERVE_DIST` flag), else the
  raw `frontend/` for dev. One switch, documented.
- **Tests stay on source (ADR-009):** the frontend suite imports modules directly and source-inspects
  `frontend/js/*` + `index.html`. It must keep running against **source**, not `dist`, so the build never
  becomes a prerequisite for `npm test`. Verify none of the source-inspection tests assert on something the
  minifier would strip (else the test targets source and is unaffected — confirm).
- **Deploy:** the build step must run in the deploy pipeline (`deploy/update.sh` / Docker image) before the
  app serves; document it alongside the existing worker-bundle build.

Resolved decisions (during implementation):
1. **Prod-only dist:** dev = raw source (edit+refresh, no build); prod (or `SERVE_DIST=1`) = dist. One
   `SERVE_DIST` switch in server.js.
2. **Minify depth:** per-file `transformSync` minify (NOT bundling) — full mangle of module-private names,
   imports/exports preserved. No bundling → the module graph + dynamic imports + the worker/bps bundle
   paths are untouched, which is what kept the risk low.
3. **Asset hashing:** skipped (not needed; the dev/prod split doesn't require cache-busting yet).

Acceptance criteria:
- [x] In production (`NODE_ENV=production` or `SERVE_DIST=1`) the frontend is served minified — shipped
      `index.html`/`js`/`css` carry no comments or `T-…`/`B-…` tells — while dev serves raw source (no build
      needed). Two static mounts: `dist/` shadows `frontend/`, which still serves the generated
      bundles/data/assets/`template.min.html`.
- [x] Full **frontend** suite green (201), still run against **source** (build is not a test prerequisite;
      tests import `frontend/js/*`).
- [x] The build step is wired into the deploy pipeline: `deploy/update.sh` already runs `node build.js`
      (now step 7 = the dist), and prod sets `NODE_ENV=production` (`deploy/.env.example`) → no extra wiring.
- [x] No behaviour/visual change: `SERVE_DIST=1 npm run shoot` renders the minified dist across all 75
      viewport/screen combos (incl. the JS-driven auth/presets modals) with no horizontal overflow.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created (proposed) from the T-218 discussion (owner chose "docs + frontend" minify).
  Noted the real cost is the source→dist serving-model change (not the tool — esbuild is present), and that
  the ADR-009 source-inspection tests must keep targeting source so the build never gates `npm test`.
- **2026-07-26** — Implemented on `feature/T-218…` (stacked). `buildFrontendDist.cjs` (`buildDist`, +
  pure `minifyJs`/`minifyCss`/`minifyHtml`) minifies the hand-written app shell (index/reset/verify.html +
  `js/*.js` except `*.bundle.js` + `css/*.css`) into `frontend/dist/` (gitignored, build.js step 7). Chose
  **per-file transform minify, not bundling** — verified the minified output keeps public export names
  (`initAccount`, `ConfigForm`, …), relative import paths, `import("./bps.bundle.js")` and
  `new Worker("/js/randomizer.bundle.js")` — so the module graph is untouched. server.js gains a
  `SERVE_DIST` switch: prod mounts `dist/` ahead of `frontend/` (fallback serves the generated
  bundles/data/assets/`template.min.html`); a missing dist just falls through. dist −35% vs source.
  Runtime-verified with `SERVE_DIST=1 npm run shoot` (75 screens, incl. JS modals, no overflow). Frontend
  201 green. **Pending owner manual test: smoke the prod-served app (a real randomize→generate→download).**

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
