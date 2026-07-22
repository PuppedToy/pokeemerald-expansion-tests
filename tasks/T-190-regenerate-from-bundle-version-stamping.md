---
id: T-190
title: Regenerate ROMs from an uploaded bundle + version stamping
status: in-progress
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: [B-048]
blocked-by: [T-188, T-189]
---

# T-190 — Regenerate ROMs from an uploaded bundle + version stamping

## Context
Part of the standardization epic (siblings: T-188, T-189, T-191). Rebuilding a ROM from a bundle
**without re-randomizing already exists** as `make.js --bundle` bundle mode (`randomizer/writer.js`
writes the pre-resolved `roms[].docs` verbatim, no RNG). What is missing is a frontend flow: upload
a `bundle.json` → validate → (migrate, see T-191) → enqueue the existing build path. The browser
cannot compile GBA ROMs, so "regenerate" = hand the bundle to the backend build queue (`produce`
route → `backend/build/bundleSchema.js` validation → persist → `make.js --bundle --rom=i`),
skipping the client-side randomizer Worker.

**Security:** this is a new *untrusted* ingress — arbitrary user JSON driving a native `make` build
(T-026 / ADR-006). The upload must route through `bundleSchema.js`; audit whether that allow-list is
sufficient for hostile-but-well-formed input (artifact contents feed the writers: species / item ids,
etc.).

**Versioning:** stamp two *independent* versions in the bundle — the **app version** (SemVer
provenance; populate the dormant `appVersion` telemetry field, `backend/diagnostics/handlers.js:55`)
and the **bundle contract version** (`formatVersion` + per-artifact `schemaVersion`, which governs
compatibility). Do not conflate them; app SemVer stays owned by `/release` and `CHANGELOG.brooktec.md`.

## Plan
- Frontend: a "Regenerate ROMs from a bundle" control (below Save/Load/Reset per T-188) that uploads
  a `bundle.json`, **distinct from Load-config** (which applies only `config`). Copy: it rebuilds the
  bundle as-is, no re-randomization.
- Backend: accept the uploaded bundle at the produce boundary, run `validateBundle`, persist, enqueue
  build. Reuse the existing queue (`backend/queue/scheduler.js`, `backend/build/buildRom.js`).
- Security review of `bundleSchema.js` against arbitrary input; harden as needed.
- Introduce a single **app-version source** (none exists in code today; SoT is `CHANGELOG.brooktec.md`
  + tags) — decide provenance mechanism (build-time inject vs read tag) and wire it into the bundle +
  telemetry. Confirm `formatVersion` / `schemaVersion` are present and read on ingest.
- Tests: backend bundle validation + regenerate flow; frontend upload wiring.

Acceptance criteria:
- [x] Uploading a valid `bundle.json` regenerates its ROM(s) via the existing build path with no re-randomization (routes to `/api/produce` → `make.js --bundle`, which writes `rom.docs` verbatim). *(end-to-end build is part of the batch manual test)*
- [x] Upload routes through `validateBundle`; malformed/hostile bundles are rejected with a clear message (client-side `isFullBundle` guard + server 400 surfaced).
- [x] Regenerate is distinct from Load-config (which only applies `config`); both have explanatory copy.
- [x] Bundle carries `appVersion` (provenance) and contract version (`formatVersion`/`schemaVersion`); app version has a single derived source (`randomizer/appVersion.js`).
- [x] Security review of the untrusted-bundle ingress recorded; residual content-validation gap tracked as B-048; `npm test` suites green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created; design locked. Depends on T-188 (UI slot + copy) and T-189 (universe seed in the flow).
- **2026-07-22** — In-progress (T-188 + T-189 merged to master). Exploring the current produce → validate → enqueue → build flow and bundleSchema.js coverage to ground the untrusted-bundle ingress + version stamping.
- **2026-07-22** — Implemented:
    - **Regenerate flow** — a separate "Regenerate ROMs from a bundle" upload (`#upload-bundle`) in the config action bar (below Save/Load/Reset), distinct from Load-config. `session.js isFullBundle()` guards it; `ConfigForm` gained an `onRegenerateBundle` option; `app.js` wires it to `currentBundle = bundle → showStep(3) → showGenDone()`, reusing the existing `onBundleReady` → `/api/produce` path and bypassing the randomizer Worker. `make.js` bundle mode already writes the pre-resolved output verbatim (no re-randomization).
    - **Ingress validation** — the flow reuses the authenticated + verified `/api/produce` boundary (already `validateBundle`). Tightened the previously-unvalidated contract fields in `bundleSchema.js`: `formatVersion` (non-negative int), `generatedAt` (bounded string), `appVersion` (bounded string or null).
    - **Version stamping** — new `randomizer/appVersion.js` (`parseAppVersion`/`readAppVersion`) DERIVES the released baseline from `CHANGELOG.brooktec.md` (SoT; no second copy). `generate.js bundle()` lifts `appVersion` to a top-level bundle field; `build.js` injects it into `base-data.json`; the browser worker + `backend/generator.js` stamp it onto `cfg`; `app.js reportDiagnostics` now sends it (populating the dormant diagnostics `appVersion` column). Contract version (`formatVersion`/`schemaVersion`) already existed.
    - Tests: `randomizer npm test` 1574 passed; backend `node --test` 136/0; frontend `node --test` 116/0. Browser bundle rebuilt (`appVersion: 0.5.0` confirmed in base-data.json).
- **2026-07-22** — **Security review of the untrusted-bundle ingress.** The regenerate control does **not** widen the attack surface: an authenticated + verified user could already POST an arbitrary bundle to `/api/produce`. The `/api/produce` route is gated by `requireAuth` + `requireVerified` + a 50 MB body cap; `validateBundle` confines the three path-forming fields (`sessionId`, `romIndex`/`playerIndex`, `wild.file`) per T-026/ADR-006, and the builder is container-hardened (T-019). **Residual gap:** artifact *contents* (species/item ids substituted into C by the writers) are still unvalidated — registered as **B-048** (open, major) rather than half-fixed here, since a correct fix needs an id allow-list/token charset + a regression test and must not break legitimate bundles. All ACs met at implementation level; awaiting the batch manual test before closing.

## Outcome

<!-- Filled when closing. -->
