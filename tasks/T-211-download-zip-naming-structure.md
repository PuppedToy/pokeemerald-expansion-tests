---
id: T-211
title: Overhaul generated-file naming & download-zip structure
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-025, T-053, T-210]
blocked-by: []
---

# T-211 — Overhaul generated-file naming & download-zip structure

## Context

Review and standardise the names/structure of every generated download so they're consistent and 1-indexed.
Spans the client-side docs zip, the server-side patch/full zip, and per-ROM naming (`make.js`). Related:
[T-025](T-025-produce-status-eta-download.md) (zip writer/download), [T-053](T-053-bps-patch-delivery.md) (BPS),
[T-210](T-210-decision-log-server-only-skill.md) (removes `decision-log.txt` from the docs zip — coordinate).

### Owner spec (target)
**Docs zip → `run-<seed>-docs.zip`**
- Docs + `bundle-<seed>.json` at the **root** (no `docs/` subfolder).
- Nuzlocke: ROM docs named `rom-1.html`, `rom-2.html`, … (**1-indexed**, not `rom-0`).
- Soul-link: **one folder per player** (`player-1`, `player-2`, …); inside each, `player-1-rom-1`,
  `player-1-rom-2`, … — **numbering restarts per player, nothing starts at 0**.

**BPS zip → `run-<seed>-patch-files.zip`.**

**Full ("download patches & apply to my ROMs") → `run-<seed>-full.zip`**
- Root: `bundle-<seed>.json` + the ROMs; a `docs/` folder with the docs; a `bps/` folder with the bps.
- ROMs named like the docs (above) but with `.gba` instead of `.html`.
- Soul-link full: root has `bundle.json` + `player-1 … player-n` folders; each player folder contains its ROMs
  (same naming convention) plus its own `docs/` and `bps/` folders.

### Findings from the current code
- **Docs zip (client, JSZip):** `frontend/js/app.js:283-329` (`#btn-download-docs`) — filename `app.js:318`
  currently `run-<seed>.zip`; contents `bundle.json` (`:300`), `decision-log.txt` (`:301`, removed by T-210),
  per-ROM HTML under a `docs/` folder `:308-311` (`docs/player-${playerIndex}-rom-${romIndex}.html` for
  soul-link at `:308`, else `docs/rom-${romIndex}.html`). This is where nuzlocke vs soul-link naming diverges.
- **Server patch/full zip:** filename `backend/produce/handlers.js:92` (`emerald-cut-${id}.zip`,
  `handleDownload :81-95`); flat layout `backend/build/storage.js:44-49` (`readOutput`), zero-dep writer
  `backend/build/zip.js:13` (`createZip`).
- **Per-ROM naming:** `make.js:108-113` (`romFileName` → `player-${playerIndex}-rom-${romIndex}.gba` else
  `rom-${romIndex}.gba`); FAKE build mirror `backend/build/buildRom.js:47`; `.bps` by default (ADR-013,
  `make.js:15/212`).
- **Raw BPS download:** `frontend/js/account.js` — `emerald-cut-patch.zip` (`:611`); re-zipped applied ROMs
  `emerald-cut-${seed}.zip` (`:606`, `zipRoms :579-584`); `patchZipToRoms` strips `.bps`→`.gba` (`:567-577`,
  `:574`).

### Resolved by owner (2026-07-26)
- The bundle file is **always** `bundle-<seed>.json` (including soul-link).
- The `docs/` folder is used **only in the full ("apply patch & download") archive** — to organise that zip.
  The docs-only download keeps its docs at the root (per-player folders for soul-link, no `docs/` wrapper).
- 1-indexing applies to `romIndex` everywhere (docs, roms, bps).

## Plan

Introduce a single naming/layout helper shared by the client docs zip, the server zip and `make.js` so the
convention (1-indexed; per-player folders for soul-link) is defined once. Rename the three zips and restructure
their contents per the spec. Coordinate the `decision-log.txt` removal with T-210. TDD on the backend zip
(`backend/__tests__/zip.test.js`) and a frontend docs-zip test; verify soul-link/nuzlocke/single paths.

Acceptance criteria:
- [x] Docs zip is `run-<seed>-docs.zip` with docs + `bundle-<seed>.json` at root, 1-indexed `rom-N.html`
      (nuzlocke) / per-player `player-K/player-K-rom-N.html` (soul-link). *(app.js docs handler.)*
- [x] BPS zip is `run-<seed>-patch-files.zip`; full zip is `run-<seed>-full.zip` with the specified root +
      `docs/` + `bps/` layout and `.gba` ROMs named like the docs. *(account.js `deliverPatch` + app.js
      `buildFullZipBlob`.)*
- [x] Soul-link full zip uses per-player folders each containing ROMs + `docs/` + `bps/`.
- [x] No 0-indexed filenames remain; naming defined in one shared helper (`frontend/js/romNaming.js`) used by
      both the docs and full/patch paths (no divergence).
- [x] Frontend suite green (170); backend untouched (make.js unchanged — the client owns final naming, so the
      server ROM builder needs no change). `app.js`/`account.js`/`romNaming.js` are served directly → no bundle
      rebuild. **Owner to manually verify the actual downloaded zips** (browser-only flow, not unit-testable).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Mapped all three download paths: client docs zip
  (`app.js:283-329`, name `:318`, per-ROM naming `:308-311`), server patch/full zip (`produce/handlers.js:92`,
  `storage.js:44-49`, `zip.js`), and per-ROM naming in `make.js:108-113` / `buildRom.js:47`. Captured the
  1-index + per-player-folder target and the open questions (soul-link bundle name; docs-folder asymmetry).
- **2026-07-26** — **Implemented (in-progress).** Owner resolved the open questions (always `bundle-<seed>.json`;
  `docs/` folder only in the full archive; 1-index everywhere). Built `frontend/js/romNaming.js` as the naming
  SSOT (`romName` → 1-indexed base + per-player folder; `bundleFileName`; `parseServerName`/`romForServerName`
  map the server's 0-indexed `.bps` back to a bundle rom) with a unit test (`__tests__/rom-naming.test.js`).
  Docs download (`app.js`): `run-<seed>-docs.zip`, `bundle-<seed>.json`, docs at root (no `docs/`), per-player
  folders for soul-link. Full download: new `buildFullZipBlob` in `app.js` (it owns the docs path) invoked by
  `account.js` `deliverPatch` via a `buildFullZip` callback passed to `initAccount` (avoids an app↔account
  circular import) — assembles `run-<seed>-full.zip` = `bundle-<seed>.json` + applied ROMs + `docs/` + `bps/`
  (nested under per-player folders for soul-link). No-ROM path re-zips the patches as `run-<seed>-patch-files.zip`
  with the 1-indexed convention. `make.js` left unchanged (client owns final naming → no builder risk). Updated
  the `deliverPatch` source-inspection test to the new shape (deliberate spec change). Frontend 170 green; app
  boots clean (shoot). **Owner to manually verify the downloaded zips** (browser-only, not unit-testable).

## Outcome

<!-- Filled when closing. -->
