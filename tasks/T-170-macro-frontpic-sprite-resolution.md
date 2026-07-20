---
id: T-170
title: Resolve macro-body .frontPic so cosmetic/macro forms render in the docs
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-20
updated: 2026-07-20
target-version: 0.6.0
links: [B-045, B-043]
blocked-by: []
---

# T-170 — Resolve macro-body .frontPic so cosmetic/macro forms render in the docs

## Context

Fixes [B-045](../bugs/B-045-macro-frontpic-forms-render-black-sprite.md): 18 kept species render a
black box in the docs because their `.frontPic` is declared inside a C `#define … _INFO(…)` macro
body, which `spriteMapper.parseSpeciesFrontPic` never sees. Also mops up the residual name leak that
[B-043](../bugs/B-043-cosmetic-rep-display-name-keeps-form-suffix.md) left on the roster / wild /
evolution / writer surfaces (they re-derive the name from the raw id instead of `poke.name`).

## Plan

1. **Sprite (root cause).** In `randomizer/spriteMapper.js`, pre-parse every `#define <NAME>(params) …`
   whose body declares `.frontPic = gMonFrontPic_<base>[ ## <param>]`, capturing base symbol + optional
   token-paste parameter. When a `[SPECIES_X]` slice has no direct `.frontPic`, look for an invocation
   of a known frontPic macro and resolve the symbol (substituting the paste parameter with the matching
   invocation argument). Feeds the existing `buildSpeciesSpriteMap` → `generateSprites` path unchanged.
2. **Name leak.** Route the id-derived display name at the four B-045 surfaces through the already-correct
   `poke.name` (`findPoke(pokeId)?.name` in `frontend/template.html`; the parsed name in `writer.js`).
3. Regenerate `frontend/data/sprites.json`; confirm all 18 species resolve to their base art.
4. Rebuild the browser bundle (`node build.js`) so the template name fix reaches the client Worker.

Acceptance criteria:
- [ ] Unit test (Red→Green) proves a macro-body `.frontPic` (fixed symbol *and* `##param` token-paste)
      resolves to the correct `gMonFrontPic_*` symbol / source PNG.
- [ ] After `generateSprites`, all 18 B-045 species have a key in `sprites.json.pokemon`.
- [ ] No collapsed cosmetic form shows its suffix ("Icy Snow", "Natural", …) on any doc surface.
- [ ] `cd randomizer && npm test` green.
- [ ] Browser bundle rebuilt.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-20** — Task created from B-045. Investigation confirmed a single root cause (macro-body
  `.frontPic`) for all 18 black-sprite species, and that each macro's `.frontPic` already points at the
  correct base art. Starting from the failing spriteMapper unit test (TDD Red).
- **2026-07-20** — Implemented. (1) `spriteMapper.js`: added `parseFrontPicMacros` + macro resolution in
  `parseSpeciesFrontPic` (fixed symbols and `##param` token-paste). Red→Green on the new B-045 unit
  tests. After `generateSprites`, all 18 species resolve (Pokémon sprites 1283 → 1521). (2) Name leak:
  routed the trainer-roster / wild / evolution surfaces in `template.html` through `poke.name`, and the
  `writer.js` fallback through `nameizyPokemonId`. (3) The writer fallback surfaced a **pre-existing
  double-space** bug in `nameizyPokemonId` (an existing test masked it with `\s+`→` `) — registered as
  **B-046** and fixed (one-line regex capture-group fix) with its own regression test; removed the mask.
  Full suite green (1395 passing). Rebuilt the browser artifacts (`node build.js`): `base-data.json`,
  `randomizer.bundle.js`, `sprites.json`. `template.html` is fetched at runtime (not bundled), so its fix
  lands on a hard-refresh. End-to-end verified in the rendered doc with Playwright (seed-42 fixture): all
  cosmetic reps show a real sprite data-URI + base name, "Arceus Normal" single-spaced, zero page errors.
  Awaiting owner manual test before closing.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
