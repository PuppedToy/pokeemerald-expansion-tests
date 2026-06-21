---
id: T-018
title: Backend ROM-production endpoint + serial build queue
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
target-version: 0.3.0
links: [docs/adr/ADR-001-rom-build-server-provider.md, T-017]
blocked-by: []
---

# T-018 — Backend ROM-production endpoint + serial build queue

## Context

Today `POST /api/produce` ([backend/server.js](../backend/server.js)) is a 501 stub.
This task wires the real flow: receive a session bundle, queue it, build the ROM with
`node make.js`, and serve the result — under the single-fixed-box + serial-queue model
decided in [ADR-001](../docs/adr/ADR-001-rom-build-server-provider.md). Sizing rationale
in [T-017](T-017-cloud-deployment-provider-analysis.md).

This is a **broad-strokes** task to be detailed before work starts.

## Plan

Strokes (to refine):
- `POST /api/produce` accepts the ~32 MB bundle (limit already 50mb), validates it,
  enqueues a job, returns a job id. Progress over SSE (reuse the job-store pattern in
  [backend/generator.js](../backend/generator.js)).
- **Serial queue**: one worker, one `node make.js --bundle=…` at a time; the box keeps
  `build/` warm so each job is incremental. Decide persistence (in-memory vs SQLite/BullMQ)
  — durability vs simplicity, leaning simple.
- Serve the finished `.gba` for download; apply a **TTL cleanup** for output ROMs (ADR-001).
- Bound `make -j` to the core count (T-017 note on the unbounded `make -j` at make.js:164).
- Concurrency/safety: `make.js` mutates + restores `src/`; serial execution must be enforced
  so jobs never overlap on the shared working tree.

Acceptance criteria (draft):
- [ ] `/api/produce` enqueues and returns a job id; status/progress observable.
- [ ] Builds run strictly serially; a ROM is produced and downloadable.
- [ ] Output ROMs are cleaned up by TTL; `make -j` is bounded.
- [ ] Covered by tests where logic is non-trivial (queue ordering, validation).

## Progress log

- **2026-06-21** — Task created (broad strokes) alongside ADR-001/ADR-002 and T-017.

## Outcome
