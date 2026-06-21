# ADR-006: The ROM build runs in a hardened sandbox because the bundle is untrusted input

- **Status:** accepted
- **Date:** 2026-06-21
- **Task:** T-018

## Context

`POST /api/produce` accepts a ~32 MB **bundle JSON from the browser** and feeds it to
`make.js`, whose writers mutate `src/`, `data/maps/`, `include/` from the bundle's contents
and then run `make` — i.e. a native compile/link toolchain. That is **arbitrary-input →
file-writing → code-build**, the textbook shape of a remote code execution / path-traversal
surface: a crafted bundle could try to write outside the intended files, smuggle content that
the build compiles, or exhaust CPU/RAM/disk. ADR-002 already containerizes the build for
reproducibility; this ADR makes that container a **security boundary**, which it was not
specified to be.

## Decision

Treat the bundle as hostile and run every build in a **hardened, ephemeral sandbox**.

- **Validate first:** a strict server-side **schema** for the bundle (allow-list of fields and
  shapes; reject anything unexpected). Writers must resolve only to known target files — **no
  path from bundle data reaches the filesystem** (no traversal, no absolute paths).
- **Contain the build:** run `make.js` in the ADR-002 container as a **non-root** user, with
  **no network egress**, CPU/RAM/PID **ulimits**, a **disk quota**, and a wall-clock **timeout**
  that kills a runaway build (and triggers the ADR-003 tree-restore).
- **Ephemeral tree:** the build operates on a working copy that is reset (`git checkout`) after
  every ROM (make.js already does this) and never persists bundle-derived content beyond the
  output `.gba`.
- **Output only:** the only thing leaving the sandbox is the produced ROM file(s); logs are
  captured but not exposed raw to users.

## Alternatives considered

- **Trust the bundle (validate lightly)** — rejected: the bundle drives a code build; light
  validation is not a security boundary.
- **One shared long-lived container, no per-build limits** — rejected: a malicious or buggy
  bundle could exhaust the host or poison the shared tree for the next user.
- **Full VM / microVM (Firecracker, gVisor) per build** — stronger isolation but heavier ops
  for a single box; the hardened container is a proportionate first step. Revisit if the threat
  model grows.

## Consequences

- The build container gains real security responsibilities (non-root, no-net, ulimits, quota,
  timeout) on top of reproducibility — ADR-002 is extended, not replaced.
- Some legitimate bundles might be rejected by strict validation; the schema must track the
  randomizer's real output (kept in sync with `randomizer/writer.js` and the bundle producer).
- We commit to maintaining the bundle schema and the sandbox hardening. Specified/implemented
  in T-026, deployed as part of T-019.
