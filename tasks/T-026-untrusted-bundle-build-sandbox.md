---
id: T-026
title: Untrusted-bundle build sandbox — schema validation + hardened container
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
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
- [ ] Bundle schema rejects malformed/hostile bundles (path traversal, absolute paths, extra fields);
      writers proven to resolve only to known target files.
- [ ] Build runs non-root, no-egress, with ulimits/quota/timeout; a runaway build is killed and the
      tree restored.
- [ ] Tests cover schema rejection and that crafted paths cannot escape the target file set.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-006). Top security
  risk of the epic.

## Outcome
