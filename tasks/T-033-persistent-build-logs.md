---
id: T-033
title: Persist per-build logs so they survive a container recreate
status: done
type: feature
created: 2026-06-28
updated: 2026-06-29
target-version: 0.4.0
links: [B-008, B-009]
---

# T-033 — Persist per-build logs so they survive a container recreate

## Context

During the B-008/B-009 incident the only build output was the container's stdout, recoverable via
`docker compose logs` — but that is **ephemeral**: `docker compose up -d --force-recreate` (every
deploy) drops the old container and its logs with it. The owner asked for a way to recover build
logs / a log-recovery system. `buildRom` ran `make.js` with `stdio: 'inherit'`, so nothing was
persisted.

## Plan

Tee each real build's output to a persistent per-ROM log file under `DATA_DIR/logs/` (bind-mounted,
rsync-excluded → survives recreate and deploys), while still mirroring it to the process stdio so
live `docker logs` keeps working.

Acceptance criteria:
- [x] `storage.logPathFor(id, romIndex)` returns a path under `DATA_DIR/logs` (kept out of the output
      dir so it never lands in the user's download zip).
- [x] `buildRom` (real path) writes the child's stdout+stderr to that file with start/end markers,
      AND mirrors them to `process.stdout`/`stderr`; resolves only after the log stream flushes.
- [x] FAKE build and callers without `logPathFor` keep the old inherited-stdio behavior (no break).
- [x] Regression-style test: a real child's stdout/stderr is captured to the log file (T-033).
- [x] `cd backend && npm test` green (85/85).
- [x] Verified on the box after the (owner-gated) redeploy: a build writes `DATA_DIR/logs/<id>-rom0.log`.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-28** — Created from the B-008/B-009 incident (the owner's "log recovery system" ask).
  Implemented `storage.logPathFor` + `logsDir`, and the tee-to-file in `buildRom` (start/end markers,
  resolve-on-flush). TDD: new buildRom test uses a real `spawn` so the pipe + exit are exercised
  end-to-end (no mock-timing flake). Backend 85/85. Code complete; box verification pending the
  owner-gated redeploy. Follow-up (not blocking): the logs dir grows unbounded — wire the sweeper to
  prune logs older than the request TTL.

## Outcome

- **2026-06-29** — Shipped. Real builds tee stdout+stderr to `DATA_DIR/logs/<id>-rom<N>.log` (bind-mounted,
  rsync-excluded) with start/end markers, while still mirroring to the container stdio. **Proven in the
  wild:** during a later production diagnosis the box held per-build logs (`c69a13af-…-rom0.log`,
  `df48b198-…-rom0.log`, …) that survived multiple `--force-recreate` deploys — the exact recovery the
  owner asked for. No deviations from plan. Follow-up (not blocking): prune logs older than the request
  TTL via the sweeper — left as a known, low-priority loose end.
