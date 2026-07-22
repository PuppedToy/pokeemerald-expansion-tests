---
id: T-190
title: Regenerate ROMs from an uploaded bundle + version stamping
status: proposed
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: []
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
- [ ] Uploading a valid `bundle.json` regenerates its ROM(s) via the existing build path with no re-randomization (output matches the bundle's docs).
- [ ] Upload routes through `validateBundle`; malformed/hostile bundles are rejected with a clear message.
- [ ] Regenerate is distinct from Load-config (which only applies `config`); both have explanatory copy.
- [ ] Bundle carries `appVersion` (provenance) and contract version; app version has a single source.
- [ ] Security review of the untrusted-bundle ingress recorded; `npm test` suites green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created; design locked. Depends on T-188 (UI slot + copy) and T-189 (universe seed in the flow).

## Outcome

<!-- Filled when closing. -->
