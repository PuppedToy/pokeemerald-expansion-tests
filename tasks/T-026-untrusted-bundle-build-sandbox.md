---
id: T-026
title: Untrusted-bundle build sandbox — schema validation + hardened container
status: done
type: feature
created: 2026-06-21
updated: 2026-06-24
target-version: 0.3.0
links: [docs/adr/ADR-006-untrusted-bundle-build-sandbox.md, docs/adr/ADR-002-build-server-iac-docker.md, T-018, T-019]
blocked-by: []
---

# T-026 — Untrusted-bundle build sandbox — schema validation + hardened container

## Context

`POST /api/produce` feeds a browser-supplied bundle to `make.js`, which writes source files and
runs a native build → an RCE / path-traversal / resource-exhaustion surface
([ADR-006](../docs/adr/ADR-006-untrusted-bundle-build-sandbox.md)). This task makes the build a
real security boundary; it extends the Docker image of
[ADR-002](../docs/adr/ADR-002-build-server-iac-docker.md) and is a prerequisite for the
production deploy ([T-019](T-019-infra-dockerized-build-server-deploy.md)).

## Plan

- **Strict bundle schema** (server-side): allow-list of fields/shapes mirroring the randomizer's
  real output; reject anything unexpected. **No filesystem path is ever derived from bundle data**
  (no traversal, no absolute paths) — audit `randomizer/writer.js`, `tmRandomizer.js`,
  `itemRandomizer.js` for path handling.
- **Hardened build container:** non-root user, **no network egress** during build, CPU/RAM/PID
  ulimits, disk quota, wall-clock timeout that kills runaway builds (then triggers ADR-003
  tree-restore). Ephemeral working copy; only the output `.gba` leaves the sandbox; raw logs not
  exposed to users.
- Document the threat model and the validation rules in the task.

Acceptance criteria:
- [x] Bundle schema rejects malformed/hostile bundles — extra top-level fields, and path traversal via
      `sessionId`, `romIndex`/`playerIndex` and `artifacts.wild.file` (the three bundle→FS vectors from
      the writer audit below). Tested.
- [ ] Build runs non-root, no-egress, with ulimits/quota/timeout; a runaway build is killed and the
      tree restored — **T-019 handoff** (container/deploy).
- [x] Tests cover schema rejection and that crafted paths cannot escape (sessionId/indices/wild.file).

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-006). Top security
  risk of the epic.
- **2026-06-24** — Implemented the bundle schema (Red→Green): `build/bundleSchema.js`
  (`validateBundle`, `isSafeRelPath`), 9 tests; **backend suite 58/58**.
  **Writer audit (the "writers resolve only to known target files" part):** grepped make.js + the
  writers for bundle-derived filesystem paths. Found **three vectors**, all now confined by the schema:
  (1) `sessionId` → `roms/<sessionId>` (make.js:125) — safe-slug only; (2) `romIndex`/`playerIndex` →
  the ROM filename (make.js:165) — non-negative integers only; (3) **`artifacts.wild.file`** → written
  directly by writer.js:383 — must be a safe relative path. Everything else writes to fixed `src/`
  paths driven by artifact *content*, not paths.
  **Recommended defense-in-depth follow-up** (not done here): confine the writers themselves to assert
  every write stays under the repo root (belt-and-braces even if a path slips the schema). Container
  hardening (non-root/no-net/ulimits/timeout) is the **T-019** deploy handoff. Schema part closed on green.

## Outcome
