---
id: T-030
title: Real per-ROM build adapter (make.js refactor + bounded make -j)
status: proposed
type: feature
created: 2026-06-24
updated: 2026-06-24
target-version: 0.3.0
links: [docs/adr/ADR-005-two-tier-preemptive-build-queue.md, docs/adr/ADR-006-untrusted-bundle-build-sandbox.md, T-018, T-019, T-024, T-025]
blocked-by: []
---

# T-030 — Real per-ROM build adapter (make.js refactor + bounded make -j)

## Context

The backend currently builds in **`FAKE_BUILD` mode** — `build/buildRom.js` writes a placeholder
`.gba` so the whole flow (queue → status → download) runs without the GBA toolchain. This task wires
the **real** compile.

`make.js` already compiles a bundle from the CLI, but it loops over **all** ROMs in one process
(`for (const rom of bundle.roms)`, make.js:140). The queue ([T-024](T-024-build-worker-fast-slow-queue.md),
[ADR-005](../docs/adr/ADR-005-two-tier-preemptive-build-queue.md)) instead drives **one ROM at a time**
so a fast request can preempt a slow one between ROMs — so the per-ROM build step must be a callable unit
the scheduler can invoke per `romIndex`. This was the explicit handoff from T-024/T-025.

It is split out of [T-019](T-019-infra-dockerized-build-server-deploy.md) because it is **app code**, not
infra — but it can only be *validated* where the toolchain exists (inside the Docker image / on the box),
so it lands alongside T-019's first real build.

## Plan

- **Refactor `make.js`:** extract the per-ROM loop body into an exported `buildOneRom({ rom, bundle, seed,
  outDir, jobs, isDebug })` — resolve artifacts → seed RNG → run the writers (`writer` + `writeTMsFromList`
  + `writeItemFilesFromBundle`) → `make -j<jobs>` → copy the `.gba` to `outDir` → `restore()` in a `finally`.
  `bundleMode` keeps working by looping over `buildOneRom` (CLI behaviour unchanged).
- **Bound `make -j`** to the box core count (`os.availableParallelism()` or a `BUILD_JOBS` env) — the
  T-024 criterion-4 handoff and the make.js:163 unbounded-`-j` note.
- **Wire the backend** (`build/buildRom.js`, the `fake:false` path): load the request's bundle from its
  `bundle_path`, build `roms[romIndex]` into the request's output dir, set `output_path`. Decide
  in-process vs shelling out `node make.js --rom=N --out=…` (shelling out gives process isolation and
  matches CLAUDE.md's "always go through make.js"; the sandbox in ADR-006 wraps it).
- **Validate** one real full + incremental build inside the container (with T-019); confirm the produced
  ROM downloads end-to-end; then set `FAKE_BUILD` off in `deploy/.env`.

## Acceptance criteria

- [ ] `make.js` refactored into a per-ROM callable; the CLI bundle build is unchanged (still produces the
      same ROMs).
- [ ] Backend real `buildRom` compiles `roms[romIndex]` via `make`; `make -j` bounded to the box cores.
- [ ] One real ROM builds end-to-end inside the Docker image and is downloadable (with T-019); `FAKE_BUILD` off.
- [ ] The refactor's non-`make` logic (arg/bundle/output-path handling) covered by tests.

## Progress log

- **2026-06-24** — Split out of T-019 (app code vs infra). Owner asked for it as its own task.

## Outcome
