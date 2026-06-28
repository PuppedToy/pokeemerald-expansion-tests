---
id: T-030
title: Real per-ROM build adapter (make.js refactor + bounded make -j)
status: done
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

- [x] `make.js` refactored into a per-ROM callable (`buildOneRom`); `bundleMode` loops it (CLI behaviour
      preserved — randomizer suite 464/464; `make.js` now `require`-able without running `main`). Byte-for-byte
      ROM equivalence is checked on the box.
- [x] Backend real `buildRom` shells out to `make.js --bundle --rom --out` (async, non-blocking);
      `make -j` bounded to box cores via `resolveJobs` (`BUILD_JOBS` overrides). Logic tested.
- [x] One real ROM builds end-to-end inside the Docker image and is downloadable; `FAKE_BUILD` off —
      **validated on the Hetzner box**: cold `make.js --bundle` → 32 MB ROM in ~277s; then full backend
      produce e2e (produce 201 → build → status ready → download a 33,554,548-byte real-ROM zip).
- [x] The refactor's non-`make` logic (spawn argv, output-path, FAKE placeholder) covered by tests.

## Progress log

- **2026-06-24** — Split out of T-019 (app code vs infra). Owner asked for it as its own task.
- **2026-06-24** — Implemented (while the box was being provisioned). `make.js`: extracted `buildOneRom`
  ({rom,bundle,seed,outDir,isDebug,jobs}); `bundleMode` loops it + accepts `--rom/--out/--jobs`; `make -j`
  bounded via `resolveJobs()`; `main` guarded by `require.main` + `module.exports` so it's importable.
  Backend `build/buildRom.js`: real path spawns `node make.js --bundle --rom --out` (async), sets
  `output_path`, rejects on non-zero exit; `spawnFn`/`repoRoot` injectable. 4 tests; **backend 71/71**,
  **randomizer 464/464** (no regression). Stays **in-progress**: the real compile + `FAKE_BUILD` off is
  validated on the box with T-019.

- **2026-06-28** — Validated on the deployed box (T-019). Added `.git` so `make.js` restore works;
  confirmed the toolchain (arm-none-eabi-gcc 12.2.1) compiles. A cold `node make.js --bundle --rom=0
  --out --jobs=2 --clean` produced a **32 MB ROM in 277s**; the writer correctly regenerated the
  gitignored `data/maps/**/scripts.inc` from the bundle (a plain `make` had failed on stale
  randomizer-mutated scripts — moot for the real path). Then `FAKE_BUILD=0` and a full backend produce
  e2e over the API: `produce 201 → status building → ready → download` a **33,554,548-byte** real-ROM
  zip. Three integration bugs surfaced & fixed along the way: B-004 (env_file inline comments),
  B-005 (bundle schema missing `formatVersion`/`generatedAt`), B-006 (auth body parser 413'd produce).
  `AVG_ROM_SECS` seeded to 180. All acceptance criteria met → done.

## Outcome

Real per-ROM build adapter shipped and **proven in production**: `make.js buildOneRom` (CLI unchanged,
randomizer 464/464), backend `buildRom` shelling `make.js --bundle --rom --out` with bounded `make -j`,
validated end-to-end on the Hetzner box (32 MB real ROM built + downloaded via the API; FAKE_BUILD off).
Backend suite 74/74. Deploy specifics + the 3 integration bugs live in T-019 / B-004..B-006.
