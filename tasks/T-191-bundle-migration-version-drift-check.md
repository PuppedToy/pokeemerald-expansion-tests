---
id: T-191
title: Bundle/config migration framework + deterministic version-drift check
status: in-progress
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: [docs/adr/ADR-020-bundle-contract-versioning.md]
blocked-by: [T-190]
---

# T-191 — Bundle/config migration framework + deterministic version-drift check

## Context
Part of the standardization epic (siblings: T-188, T-189, T-190). Old bundles/configs must remain
usable: loading one runs a migration chain `v_old → v_current`; if a change cannot be migrated (data
genuinely lost), the bundle **contract** version bumps MAJOR and older bundles are rejected with a
clear message.

**Reframe (owner-approved):** "compatibility decided by Claude in a hook" becomes — the source of
truth is a **deterministic schema-drift check** (a committed canonical schema/fixture of the
bundle + config shape) that fails in CI/test when the shape diverges without a contract-version bump.
Claude assists **at dev-time** by drafting the migration and the semver-impact assessment as a
*reviewable* change; it is not an autonomous version bumper and never touches the app SemVer (owned by
`/release`). Heavy automation is deferred until the first real migration is actually needed.

## Plan
- Define a canonical, versioned schema/fixture for the bundle and config shapes; add a deterministic
  test/check that fails on drift without a `formatVersion` / `schemaVersion` bump (runs in CI — no GBA
  toolchain needed).
- Build a migration registry: `migrations[fromVersion](bundle) -> bundle'`, applied as a chain on
  load/regenerate; config migration too (loading an older saved config).
- Golden fixtures per historical contract version, asserted to migrate + validate (+ build where feasible).
- Wire migration into the T-190 regenerate flow and into config Load.
- Reframe the "hook" as a dev-time assist (a Claude Code hook or a `/release`-style skill) that, on
  detected drift, drafts the migration + changelog/ADR entry for human approval. The deterministic
  check is the gate; Claude authors, a human accepts.
- Record the versioning/migration decision as an ADR.

Acceptance criteria:
- [x] **Compatibility gate:** a bundle whose `formatVersion` is unsupported is rejected at ingest with a clear message (`bundleSchema.js` `SUPPORTED_FORMAT_VERSIONS`). The migration *transform* registry is **deferred** until the first real migration is needed (owner decision — see log); the gate + version SoT are in place so the transform slot has an obvious home.
- [x] A **deterministic drift check** (`backend/__tests__/contractDrift.test.js`) fails when the bundle STRUCTURAL contract (top-level keys / required artifacts / supported format versions) changes without an acknowledged snapshot update + version decision. (Config *field additions* are backward-compatible — old bundles just miss the new option — so they are out of scope by design.)
- [x] Config Load already migrates older configs (`extractConfig` + `normalizeDocsVisibility`) — documented in ADR-020, not rebuilt.
- [x] ADR-020 written; app SemVer untouched by the mechanism; `npm test` suites green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created; design locked. Depends on T-190. Owner approved the deterministic-check + Claude-assists reframe and deferring heavy automation until the first real migration.
- **2026-07-22** — In-progress (T-190 merged). Scoped to the non-premature parts per the owner's "defer heavy automation" decision: (1) a `formatVersion`-support gate at the ingest boundary, (2) a deterministic structural-contract drift check, (3) ADR-020. The migration *transform* registry and any Claude-assisted authoring are deferred until a real contract change requires them — the drift check is the trip-wire that will force that moment.
- **2026-07-22** — Implemented:
    - `backend/build/bundleSchema.js` — added `SUPPORTED_FORMAT_VERSIONS = {2}`; `validateBundle` now rejects a present-but-unsupported `formatVersion` with an actionable message. Exported `TOP_KEYS` / `REQUIRED_ARTIFACTS` / `SUPPORTED_FORMAT_VERSIONS` for the drift check.
    - `backend/__tests__/contractDrift.test.js` — pins the structural contract (top keys / required artifacts / supported versions) to a committed `CONTRACT_SNAPSHOT`; deep-equal trip-wire with a failure message that walks the dev through the version-bump + migration decision. Config field additions deliberately excluded (backward-compatible).
    - `backend/__tests__/bundle.test.js` — added the unsupported-`formatVersion` rejection test.
    - ADR-020 written; indexed in `docs/INDEX.md`.
    - Tests: backend `node --test` 138/0. (No randomizer/frontend code changed.)
    - All ACs met at implementation level; awaiting the batch manual test before closing.

## Outcome

<!-- Filled when closing. -->
