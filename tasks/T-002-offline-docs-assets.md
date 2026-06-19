---
id: T-002
title: Fully offline docs + reusable embedded static-assets folder
status: abandoned
type: feature
created: 2026-06-19
updated: 2026-06-19
target-version: 0.1.0
links: [tasks/T-001-local-sprites.md, tasks/T-004-docs-overhaul.md]
blocked-by: []
---

# T-002 — Fully offline docs + reusable embedded static-assets folder

## Context

T-001 made Pokémon/trainer **sprites** self-contained (base64-embedded into each doc).
But a generated doc still pulls two assets from the network, so it is not yet 100%
offline:

- Header logo — `https://lh4.googleusercontent.com/proxy/...` (in `frontend/template.html`).
- Google Fonts — `https://fonts.googleapis.com/css2?family=Inter...`.

The user also wants a **general place for their own static assets** (header, fonts,
icons, future additions) that are usable from `template.html` and get embedded into
the downloaded docs the same offline way. The folder + convention are scaffolded in
`frontend/assets/README.md`; this task implements the wiring.

Deferred deliberately: a larger **docs overhaul** is coming, so implement this as part
of that work rather than piecemeal now.

## Plan

Mirror the T-001 sprite mechanism for arbitrary assets:

1. `build.js` walks `frontend/assets/**`, base64-encodes each file, writes
   `frontend/data/assets.json` (generated, gitignored), keyed by relative path.
2. `app.js` inlines that map into each doc as `EMBEDDED_ASSETS` (new `assets.js`
   placeholder), exactly like `EMBEDDED_SPRITES`.
3. `template.html`:
   - `getAsset(path)` → embedded `data:` URI (dev fallback to the file path).
   - Replace the header logo `<img>` src with `getAsset('header/...')`.
   - Replace the Google Fonts `<link>` with an `@font-face` whose `src` is the
     embedded woff2 data URI; subset the font to the glyphs the docs use.
4. Keep the pure encoding/mapping logic testable (reuse `spriteImage`/new helpers) — TDD.

Acceptance criteria:
- [ ] A generated doc has **zero** external network references (no `https://` for images, fonts, or the logo) — verified by scanning the output HTML.
- [ ] `frontend/assets/` files are committed; `frontend/data/assets.json` is generated and gitignored.
- [ ] Fonts render from embedded woff2 (no `fonts.googleapis.com`); header renders from an embedded asset.
- [ ] Adding a new file under `frontend/assets/` makes it available to the template via `getAsset()` with no code change.
- [ ] Encoding/mapping logic unit-tested; `cd randomizer && npm test` green.
- [ ] `node scripts/check-tracker.mjs` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-19** — Task created and deferred to the docs overhaul. `frontend/assets/` folder + convention scaffolded and documented in its README during T-001.

## Outcome

- **2026-06-19** — Abandoned (not dropped): superseded by **T-004**, the docs overhaul,
  which folds this scope (full self-containment — fonts + header logo — and the reusable
  `frontend/assets/` embedding mechanism) together with the Obsidian re-skin and the
  size/load optimization pass. The `frontend/assets/README.md` scaffold from T-001 stands.
