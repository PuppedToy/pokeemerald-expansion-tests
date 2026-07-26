---
id: T-220
title: Build + minify the app frontend (serve a dist in production)
status: proposed        # proposed | in-progress | done | abandoned
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

Open decisions to confirm when starting:
1. **Prod-only dist vs. always** (does dev also serve dist? default: dev = raw, prod = dist).
2. **Minify depth:** full bundle+mangle vs. only comment/whitespace strip (mangling maximises size savings
   but is the riskier change — decide after a first working bundle).
3. **Asset hashing / cache-busting** for the built JS/CSS (nice-to-have; adds `index.html` templating).

Acceptance criteria:
- [ ] In production the frontend is served minified — shipped `index.html`/JS/CSS carry no dev/AI comments
      or `T-…`/`B-…` tells — while the dev loop still serves raw source (edit + refresh, no build needed).
- [ ] Full **frontend** suite green, still run against **source** (build is not a test prerequisite).
- [ ] The build step is wired into the deploy pipeline and documented.
- [ ] No behaviour or visual change: `npm run shoot` shows no horizontal overflow and a manual smoke of the
      built dist matches the raw app (auth, randomizer wizard, presets, settings, admin).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created (proposed) from the T-218 discussion (owner chose "docs + frontend" minify).
  Noted the real cost is the source→dist serving-model change (not the tool — esbuild is present), and that
  the ADR-009 source-inspection tests must keep targeting source so the build never gates `npm test`.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
