---
id: T-001
title: Bundle Pokémon and trainer sprites locally into frontend/sprites
status: done
type: feature
created: 2026-06-19
updated: 2026-06-19
target-version: 0.1.0
links: [tasks/T-002-offline-docs-assets.md]
blocked-by: []
---

# T-001 — Bundle Pokémon and trainer sprites locally into frontend/sprites

## Context

The docs (`frontend/template.html`) currently load every Pokémon and trainer image
from external CDNs: `getPokeImg()` ([template.html:725](../frontend/template.html#L725))
hits `forwardfeed.github.io/ER-nextdex`, and `getTrainerImg()`
([template.html:1032](../frontend/template.html#L1032)) hits `archives.bulbagarden.net`.
This makes the docs depend on third-party hosts that can break, rate-limit, or vanish.

All sprites already exist in-repo as standard (4-bit indexed) PNGs:
- Pokémon: `graphics/pokemon/<species>/anim_front.png` (64×128, 2-frame anim sheet) or
  `front.png` (forms).
- Trainers: `graphics/trainers/front_pics/<name>.png` (64×64).

The species→file mapping is derivable from committed source:
`src/data/pokemon/species_info/gen_*_families.h` (`[SPECIES_X].frontPic = gMonFrontPic_Y`)
→ `src/data/graphics/pokemon.h` (`gMonFrontPic_Y[] = INCBIN(... "graphics/pokemon/.../anim_front.4bpp.smol")`)
→ swap `.4bpp.smol`→`.png`. The `.frontPic` field is NOT mutated by the randomizer, so
parsing base source is safe.

The backend already serves `frontend/` statically ([backend/server.js:12](../backend/server.js#L12)),
so anything written to `frontend/sprites/` is served at `/sprites/...` with no new route.

## Plan

Decisions agreed with the user:
- **Generate at build time** into a **gitignored** `frontend/sprites/` (derive, don't commit).
- **Crop at build time** to a true 64×64 frame (top frame of the anim sheet) using an
  image library.
- **Both** Pokémon and trainers in this task.

Approach:
1. New generator module under `randomizer/` (TDD: pure mapping/parsing logic in unit
   tests with fixtures; I/O kept thin). It:
   - Parses `gen_*_families.h` + `pokemon.h` to build `SPECIES_X → source PNG path`.
   - Maps trainer `class` strings (from the existing `trainerSprites` table in
     template.html) → `graphics/trainers/front_pics/<name>.png`. Build the class→file
     table; log any class with no local match (no silent drops).
   - Crops Pokémon anim sheets to the top 64×64; copies trainer pics (already 64×64).
   - Writes `frontend/sprites/pokemon/<SPECIES>.png` and `frontend/sprites/trainers/<key>.png`.
2. Wire the generator into `build.js`.
3. Repoint `getPokeImg()` / `getTrainerImg()` in `template.html` to `/sprites/...`,
   keeping the form-name normalization so keys match generated filenames.
4. Add `frontend/sprites/` to `.gitignore`.

Acceptance criteria (updated mid-task — see Outcome for the served→embedded pivot):
- [x] `build.js` produces `frontend/data/sprites.json` (base64 map), gitignored, not committed.
- [x] Pokémon sprites are the cropped top 64×64 frame, encoded as indexed PNG + tRNS with the background keyed out; trainers embedded verbatim (64×64 + tRNS).
- [x] Mapping resolves every base species shown in the docs (0 missing of 1203 in base-data.json); unresolved species/trainer classes are logged, not silently skipped.
- [x] `getPokeImg()`/`getTrainerImg()` read embedded `EMBEDDED_SPRITES`; generated docs render images with **zero** external image requests (verified on debug/run-5 bundle).
- [x] No sprite shows a visible background block (the 76 form-sprite green backgrounds fixed via `keyBackgroundFromCorner`).
- [x] Mapping/parsing/encoding logic covered by unit tests (`cd randomizer && npm test` green — 407), following TDD.
- [x] `node scripts/check-tracker.mjs` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-19** — Task created. Investigated asset layout, mapping chain, and current external-CDN usage; confirmed feasibility. Agreed decisions: generate-at-build into gitignored `frontend/sprites/`, build-time crop to 64×64, cover both Pokémon and trainers.
- **2026-06-19** — Implemented (TDD). New pure modules: `randomizer/spriteMapper.js` (parse `gen_*_families.h` + `pokemon.h` → SPECIES→png map; `trainerClassToFile`; `parseTrainerClasses`) and `randomizer/spriteImage.js` (`cropTopLeft`, `keyColorToTransparent`, `cropPngTopFrame`). I/O orchestrator `randomizer/generateSprites.js` wired into `build.js` as step 3. Added `pngjs` to `randomizer/package.json`. Repointed `getPokeImg`/`getTrainerImg` in `frontend/template.html` to `sprites/...` and replaced the stale bulbagarden URL map with a `trainerClasses` list (the generator's validation source). Gitignored `frontend/sprites/`.
  - Findings: 1283 species resolved, 0 source PNGs missing; only `SPECIES_SPEWPA_POKEBALL` lacks an inline `.frontPic` (macro form, never in docs) — logged, not dropped. Pokémon PNGs have no alpha (palette index 0 = background) so the generator keys out the corner color to restore transparency; trainer PNGs carry `tRNS` and are copied verbatim. Coverage: all 1203 species in `base-data.json` have a sprite; all docs trainer classes resolve. Backend serves `/sprites/*` as `image/png` (200), missing → 404. Suite: 399 green.
  - Pending user manual test before closing (per workflow): open the docs and confirm images render with no external image requests.
- **2026-06-19** — Pivot after design discussion: docs are **downloaded standalone artifacts** (app.js builds + downloads HTML/ZIP), not served. Relative `sprites/...` paths would break on `file://`. Decision: make docs **100% self-contained** by base64-embedding sprites. Architecture confirmed: randomization runs in-browser (`randomizer-worker.js`), docs built in `app.js`, backend stays a pure ROM maker (`generator.js` is a documented Phase-G artifact to be deleted) — sprite work touches only build.js + frontend, never the backend.
  - Reworked: removed the served `frontend/sprites/` PNG dir. Added a minimal **indexed-PNG encoder** (`spriteImage.encodeIndexedPng`/`spriteToIndexedPng`, zlib + CRC, no pngjs) — crop top frame, key out background, emit 8-bit palette PNG + tRNS. Lossless, ~3x smaller than RGBA (avg 738 B vs 2.45 KB). `generateSprites.js` now writes `frontend/data/sprites.json` (base64 map, 1.31 MB, gitignored). `app.js` inlines the full map into each doc via a new `sprites.js` placeholder; `template.html` `getPokeImg`/`getTrainerImg` read `EMBEDDED_SPRITES` with a transparent-PNG fallback.
  - Verified on `debug/run-5/bundle.json`: generated doc = 15.79 MB (+~10% vs the ~14.3 MB external-CDN version), **0** forwardfeed/bulbagarden refs, all `<script src>` placeholders injected, 1376 sprite data-URIs embedded. Suite: 403 green.
  - Out of scope, flagged for the user: the doc still references 2 external assets unrelated to sprites — the header logo (`lh4.googleusercontent.com`) and Google Fonts (`fonts.googleapis.com`). Candidate follow-up task for full self-containment.
- **2026-06-19** — Bug found by user during manual review (green backgrounds on ~76 sprites) and fixed. Root cause: form `front.png` files are indexed PNGs that carry a `tRNS` chunk, so `pngjs` reported `alpha:true` and the old `if (src.alpha !== true)` guard skipped background-keying — but their `tRNS` does not cover the opaque green/cyan background (corner pixel α=255). Fix: new pure `keyBackgroundFromCorner(bitmap)` keys out the corner color whenever the corner is **opaque** (the real "visible background" signal), and is a no-op when the corner is already transparent (so real-alpha sprites aren't hole-punched). TDD: 4 new tests reproduce both cases. Re-scan of the rebuilt `sprites.json`: 0 sprites with an opaque border (was 76). Suite: 407 green. (Pre-release WIP defect — captured here with its regression test rather than as a separate B-NNN.)
  - Follow-up scope split out to **T-002** (full-offline docs + reusable static-assets folder); to be done in the upcoming docs overhaul.
- **2026-06-19** — User manually tested the regenerated doc and confirmed it OK ("Fixed"). Closing. Added `tasks/T-001-Assets/` (large rendered review docs) to `.gitignore` — not source.

## Outcome

**Shipped:** Docs no longer depend on external image CDNs — every Pokémon and trainer
sprite is base64-embedded into the generated doc, so downloaded docs render fully
offline. `build.js` produces `frontend/data/sprites.json` (gitignored) from in-repo
graphics; `app.js` inlines it into each doc; `template.html` resolves images from
`EMBEDDED_SPRITES`.

New TDD-covered code: `randomizer/spriteMapper.js` (source parsing/mapping),
`randomizer/spriteImage.js` (crop, background keying, minimal indexed-PNG encoder),
`randomizer/generateSprites.js` (I/O orchestrator). Suite 407 green.

**Deviations from the plan:**
- Served relative `frontend/sprites/*.png` → **embedded base64 data-URIs**. Reason: docs
  are downloaded standalone artifacts, so relative paths break on `file://`. The user's
  goal is fully self-contained docs.
- Built a custom **indexed-PNG encoder** (pngjs can only write RGBA) to keep the embedded
  payload small: cropped 8-bit palette PNG + tRNS, ~3× smaller than RGBA (≈+10% doc size
  vs the external-CDN version, on a doc already ~14 MB of embedded data).
- Background transparency now keyed from the **opaque corner** rather than trusting the
  source alpha flag — fixes 76 form sprites that shipped a `tRNS` not covering their
  green/cyan background.
- `pngjs` added to `randomizer/package.json` (dev/build dependency).

**Follow-ups:** [T-002](T-002-offline-docs-assets.md) — full-offline docs (embed the header
logo + Google Fonts) and a reusable `frontend/assets/` folder embedded into docs the same
way; deferred to the docs overhaul. Folder + convention scaffolded in
`frontend/assets/README.md`.

**Known limitation:** `SPECIES_SPEWPA_POKEBALL` (a cosmetic Vivillon-line form defined via a
`SPEWPA_SPECIES_INFO()` macro instead of an inline `.frontPic`) has no sprite — logged at
build, never appears in docs.
