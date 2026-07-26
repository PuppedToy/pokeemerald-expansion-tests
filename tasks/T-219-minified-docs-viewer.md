---
id: T-219
title: Generate a minified docs viewer (out.html) in the doc-gen pipeline
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-218, T-220]
blocked-by: []
---

# T-219 — Minified docs viewer (out.html)

## Context

The downloadable docs viewer is a single self-contained HTML file built from `frontend/template.html`:
app.js fetches the template and hydrates it in the browser via `__TOKEN__` substitution (base64 fonts
`__FONT_PRESS_START_2P__`/`__FONT_VT323__`, a per-run localStorage-namespace token, and per-ROM data
injection points), then packages it into the download / `randomizer/output/out.html`. Today it ships with
developer comments and unminified inline `<style>`/`<script>` → larger download + AI/dev tells in
view-source. **esbuild is already a project dependency** (`build.js` uses it to bundle the worker), so
minifying adds no new tool.

This is the *shipped-artifact* half of the cleanup; the *source* comment hygiene is [T-218](T-218-strip-ai-tells-from-shipped-html.md),
and the frontend-app minify is [T-220](T-220-frontend-build-minify.md).

## Plan

Produce a minified template artifact (e.g. `frontend/template.min.html`) at build time and load THAT for
doc generation, keeping `frontend/template.html` fully readable/commented as the source.

- Add a step (in `build.js`, or a dedicated `build:docs`) that: strips HTML comments + collapses
  whitespace (safe), minifies the inline `<style>` (esbuild `css`) and — behind an aggressiveness dial —
  the inline `<script>` (esbuild `js`). Re-inline the results into one self-contained file.
- Point the generator (app.js template fetch) at the minified artifact for the shipped viewer.

**Critical safety rail — token preservation.** Every `__TOKEN__` must survive minification byte-for-byte:
- Audit how each token appears: CSS `url(__FONT_*__)`, string literal, or bare identifier. String literals
  and `url()` args survive; a bare identifier could be *renamed* by JS mangling and break substitution.
- Add a **post-build assertion/test** that every expected token still appears in the minified output; fail
  the build if any is missing. Start with comment+whitespace strip + CSS minify (low risk); enable JS
  minify only once the `docs-*` tests + a manual open of a generated `out.html` confirm the viewer works.
- **Determinism:** the minify must be byte-stable across runs (so it doesn't fight the T-190/T-191
  regenerate-from-bundle / version-stamping equivalence checks).

Acceptance criteria:
- [x] The shipped docs viewer has no HTML comments and no `T-…`/`B-…` tells, and is measurably smaller:
      `template.min.html` is **−35%** (218 KB → 142 KB) with 0 comments / 0 leaked IDs.
- [x] Both substitution anchors survive minification, guarded at build time (`assertAnchorsPreserved` fails
      the build) + in the test: the two CSS font tokens and all 11 `<script src="X.js">` data placeholders
      are byte-identical. *(Runtime hydrate/render = owner manual open — see below.)*
- [x] `frontend/template.html` source stays readable/commented (only the built `template.min.html`, which is
      gitignored, is minified); app.js prefers it and falls back to the raw template in dev.
- [x] Deterministic (esbuild `transformSync`, no clock/RNG); **frontend** suite green (198); `node build.js`
      runs the step end-to-end. *(shoot screenshots the app, not a generated doc.)*

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created (proposed) from the T-218 discussion (owner chose "docs + frontend" minify).
  esbuild already available. Key risk identified: `__TOKEN__` survival through JS/CSS minification →
  mandated a token-preservation build test + a low-risk-first dial (comments/whitespace + CSS before JS).
- **2026-07-26** — Implemented on `feature/T-218…` (stacked). `buildDocsTemplate.cjs` segments the template
  and: strips HTML comments between blocks, esbuild-minifies the inline `<style>` (CSS), and
  **whitespace-minifies** the inline `<script>` blocks with `minifyIdentifiers:false` — so comments+size go
  but cross-`<script>` globals (injected data arrays) keep resolving. `<script src="X.js">` placeholders and
  external libs are left byte-identical; the deploy already runs `node build.js`, so `template.min.html`
  (gitignored, build.js step 6) ships in prod and app.js prefers it with a raw fallback for dev. Result:
  −35%, 0 comments, 0 leaked IDs, all anchors preserved (build-time `assertAnchorsPreserved` + test). Chose
  whitespace-only JS minify (no mangle) over full minify to eliminate the rename/ASI risk entirely.
  **Pending owner manual test: open a generated doc from a real run and confirm it renders + hydrates.**

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
