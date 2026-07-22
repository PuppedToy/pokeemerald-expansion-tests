---
id: T-191
title: Bundle/config migration framework + deterministic version-drift check
status: proposed
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: []
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
- [ ] Loading/regenerating an older bundle migrates it forward and builds; an unmigratable one is rejected with a clear message and the contract version is bumped MAJOR.
- [ ] A deterministic drift check fails when the bundle/config shape changes without a contract-version bump.
- [ ] Golden fixtures per contract version migrate + validate in the test suite.
- [ ] Config Load migrates older configs.
- [ ] ADR written; app SemVer untouched by the mechanism; `npm test` suites green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created; design locked. Depends on T-190. Owner approved the deterministic-check + Claude-assists reframe and deferring heavy automation until the first real migration.

## Outcome

<!-- Filled when closing. -->
