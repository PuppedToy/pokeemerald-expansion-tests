---
id: T-219
title: Generate a minified docs viewer (out.html) in the doc-gen pipeline
status: proposed        # proposed | in-progress | done | abandoned
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
- [ ] The shipped docs viewer (`out.html`) has no HTML comments and no `T-…`/`B-…` tells, and is measurably
      smaller than today's output.
- [ ] All `__TOKEN__` placeholders survive minification (guarded by a build-time test); a generated viewer
      hydrates + renders correctly (`docs-*` + `trainerColors` tests green + a manual open).
- [ ] `frontend/template.html` source stays readable/commented (only the built artifact is minified).
- [ ] Minified output is deterministic; **randomizer** + **frontend** suites green; `npm run shoot` shows no
      horizontal overflow on the viewer screens.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Task created (proposed) from the T-218 discussion (owner chose "docs + frontend" minify).
  esbuild already available. Key risk identified: `__TOKEN__` survival through JS/CSS minification →
  mandated a token-preservation build test + a low-risk-first dial (comments/whitespace + CSS before JS).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
