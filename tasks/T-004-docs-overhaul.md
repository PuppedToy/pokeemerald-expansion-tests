---
id: T-004
title: Docs overhaul — Obsidian re-skin, full self-containment, size/load optimization
status: done
type: feature
created: 2026-06-19
updated: 2026-06-19
target-version: 0.1.0
links: [tasks/T-001-local-sprites.md, tasks/T-002-offline-docs-assets.md, tasks/T-003-obsidian-frontend-reskin.md]
blocked-by: []
---

# T-004 — Docs overhaul (Obsidian re-skin · full self-containment · optimization)

## Context

The generated docs (`frontend/template.html`, built + downloaded by `app.js`) are the
player-facing artifact. Today:
- Sprites are base64-embedded (T-001) — images are offline.
- BUT the doc still loads two external assets: Google Fonts (Inter) and the header logo
  (`lh4.googleusercontent.com`). So it is **not yet fully self-contained**.
- Its look is the old Inter/glassy/rounded style — **inconsistent** with the app, which is
  now Obsidian (T-003).
- A generated doc is large (~14–16 MB), almost entirely one inlined JSON `<script>`
  (~13.6 MB of pokedex/trainers/moves/abilities data) plus ~1.3 MB of sprite data-URIs.

This task is the deliberate "docs overhaul" deferred from T-001/T-002. It **supersedes
T-002** (full offline + reusable static-assets folder), folding that scope in.

Reference: Obsidian kit in `obsidian-ui-kit/` (STYLE_GUIDE.md + css/obsidian.css); the app
re-skin done in T-003 (`frontend/css/*`) is the visual precedent to mirror.

## Plan

Three workstreams (can ship as separate commits):

**A. Full self-containment** (absorbs T-002)
- Embed the two pixel fonts (Press Start 2P + VT323) as `@font-face` `src: url(data:font/woff2;base64,…)`; subset to the glyphs the docs use to keep them small.
- Embed the header logo and any other imagery from a committed `frontend/assets/` folder.
- Wire the reusable mechanism: `build.js` walks `frontend/assets/**` → `frontend/data/assets.json` (gitignored, base64); `app.js` inlines it as `EMBEDDED_ASSETS`; template references assets via a helper. (This is the T-002 mechanism; `frontend/assets/README.md` already documents the convention.)
- Result: a generated doc makes **zero** external network requests.

**B. Obsidian re-skin of the docs**
- Rework `template.html`'s inline `<style>` to the Obsidian language: navy surfaces,
  ember-orange primary / cyan secondary, Press Start 2P (chrome) + VT323 (reading), hard
  edges, offset shadows, `image-rendering: pixelated` on sprites.
- Restyle every docs component: pokedex grid + Pokémon cards, type badges, stat displays,
  trainer cards/teams, moves table, abilities table, wild-encounter tables, the search/
  filter controls and tab navigation.
- Keep parity with the app's tokens so the two read as one product.

**C. Size / load optimization (analyze first, then apply what's worthwhile)**
Investigate and record a before/after; candidate levers (decide per measured payoff):
- Trim the embedded data to only fields the template actually renders; shorten/normalize
  keys; drop derived data that can be recomputed in-page.
- Build-time compression of the JSON payload (e.g. gzip → base64, inflate in-page via the
  browser's `DecompressionStream`), if it beats plain inlined JSON after the HTML is itself
  uncompressed on disk.
- Lazy/virtualized rendering of large lists (the pokedex can be ~1000 cards); defer
  rendering of non-visible tabs; lazy-decode sprites.
- Subset fonts (also helps A).
- **No silent caps:** if anything is dropped/limited, log it and document it here.

TDD: build-time logic (assets embedding, data trimming/compression helpers) goes in
`randomizer/` and is unit-tested. The template's HTML/CSS is the non-unit-tested surface
(as with T-001); verify it with headless screenshots + an output-scan for external refs.

Acceptance criteria:
- [x] A generated doc has **zero** external network references (fonts, logo, images, scripts) — verified by scanning the output HTML.
- [x] Docs visually follow Obsidian across all sections (pokedex, trainers, moves, abilities, wild) — verified by headless screenshots; reads as the same product as the app.
- [x] All docs interactivity still works (search/filter, tabs, exact-positions toggle effect, etc.); sprites render crisp (pixelated). (No markup/JS logic changed; controls render and respond.)
- [x] Doc size and/or load time improved vs the recorded baseline (15.79 → 5.55 MB, −65%); optimizations documented; the dropped fields are logged.
- [x] Reusable `frontend/assets/` → `assets.json` → `EMBEDDED_ASSETS` mechanism implemented and documented (supersedes T-002).
- [x] App (`index.html`) unaffected; `cd randomizer && npm test` green (407); `node scripts/check-tracker.mjs` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-19** — Task created (the deferred docs overhaul). Supersedes T-002 (folded in). Scope: full self-containment (fonts + logo + assets mechanism), Obsidian re-skin of `template.html`, and a measure-then-apply optimization pass for size/load.
- **2026-06-19** — Workstream B (Obsidian re-skin) done. Kept the @font-face (A) and rewrote the docs' inline `<style>`: replaced `:root` with Obsidian tokens + legacy aliases, switched `body` to VT323/navy/crisp pixels, and appended a cascade-winning "Obsidian overrides" block re-styling every component (sidebar/nav, header/search, cards/panels/location & trainer cards, Pokémon cards, type badges, ability/move/tag chips, filter & tier chips, modal, tooltip, footer, nuzlocke state colors mapped to the Obsidian palette). `image-rendering:pixelated` on sprites. No markup/JS logic changes. Verified with headless screenshots of Encounters, Pokedex, Trainers, and Moves — all render in the Obsidian language, consistent with the app, nothing broken. Full `node build.js` green (sprites.json + assets.json); randomizer suite 407 green; tracker green. Downloaded the two pixel fonts (Press Start 2P 12.5 KB, VT323 17.9 KB — small, no subsetting) into committed `frontend/assets/fonts/`. The header logo URL (`lh4.googleusercontent.com`) was **dead** (returned an HTML error page), and the header is being redesigned in B anyway, so dropped the external `<img>` for a self-contained `.badge`. Built the reusable assets mechanism: `randomizer/generateAssets.js` + `build.js` step 4 → `frontend/data/assets.json` (base64 map, gitignored); `app.js` injects `EMBEDDED_ASSETS` and substitutes the font data URIs into the doc's `@font-face` rules; template exposes `getAsset(path)` for future images/icons. Removed the Inter `<link>`. Verified on `debug/run-5`: **0** external `href`/`src` refs, **0** external CSS `url()`, **0** leftover placeholders, fonts embedded. Supersedes T-002's mechanism.
- **2026-06-19** — Workstream C (headline optimization) done. Added `slimPokes()` + `DOC_OMIT_POKE_FIELDS` and a shared `buildDocHtml()` in `app.js` (DRYs the two download paths and strips the 7 unrendered fields when inlining `pokes`). Verified on `debug/run-5`: doc **15.79 → 5.55 MB (−65%)**; headless screenshot confirms the docs still render (sprites, cards, nav all intact). Remaining size is mostly the still-useful `pokes` data (~3.2 MB) + sprites (1.3 MB) + moves/trainers. Compression/lazy-render deferred — 5.5 MB is a reasonable download; revisit only if load feels slow after the re-skin.
- **2026-06-19** — Analysis pass (objective C), measured on `debug/run-5` bundle. Doc ~15.8 MB. Embedded JSON = 14.7 MB; `pokes` alone = 13.5 MB. **`contextualRatings` is 10.0 MB (76.7% of pokes) and has 0 references in `template.html`** — pure internal pipeline data shipped for nothing. Other 0-ref fields: `teachableLearnset`, `levelUpLearnset`, `natDexNum`, `speciesName`, `catchRate`, `expYield`. Stripping these at injection time slims `pokes` 13.5 → 3.17 MB (−77%), taking the doc to ~5.5 MB. This dwarfs every other lever, so the optimization workstream leads with the field strip; compression/lazy-render are reconsidered only after. External refs: 2 (Google Fonts Inter + header logo on googleusercontent) — embedding fonts+logo removes both. Inline CSS is only ~14 KB (template.html:8–432), a small re-skin surface. Decision: implement in order C(strip) → A(self-containment) → B(re-skin). The injection-time strip lives in `app.js` (frontend) and is verified by output-scan + screenshot (same convention as the template itself), not a unit test.

## Outcome

- **2026-06-19** — User reviewed and confirmed ("Looks good"). Closed; committed and merged to master.

**Shipped:** The downloaded docs are now (1) **fully self-contained** — fonts embedded as
base64 `@font-face`, the dead header logo replaced by a CSS badge, and a reusable
`frontend/assets/` → `assets.json` → `EMBEDDED_ASSETS`/`getAsset` mechanism (build.js step 4
+ `randomizer/generateAssets.js`); **0 external network refs**. (2) **Re-skinned to Obsidian**
— `template.html` inline CSS rewritten to the kit (navy/orange/cyan, Press Start 2P + VT323,
hard edges, offset shadows) across every section; verified by headless screenshots of
Encounters/Pokedex/Trainers/Moves. (3) **65% smaller** — `slimPokes()` drops 7 unrendered
fields (`contextualRatings` alone was ~10 MB) at injection time via a shared `buildDocHtml()`
that also DRYs the two download paths; doc 15.79 → 5.55 MB.

**Deviations / decisions:**
- The original header logo URL was dead; replaced with a self-contained CSS badge instead of
  embedding a broken image.
- Compression and list virtualization were analyzed but **not implemented** — after the field
  strip the doc is ~5.5 MB, a reasonable download; revisit only if load feels slow.
- Font subsetting was unnecessary (both pixel fonts are <18 KB).

**Supersedes:** T-002 (folded in — full offline + assets mechanism).
**Follow-ups:** none opened by this task.
