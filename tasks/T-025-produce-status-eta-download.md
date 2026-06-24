---
id: T-025
title: Produce endpoint + status/ETA + ROM download
status: done
type: feature
created: 2026-06-21
updated: 2026-06-24
target-version: 0.3.0
links: [docs/adr/ADR-005-two-tier-preemptive-build-queue.md, docs/adr/ADR-003-persistence-job-lifecycle-recovery.md, docs/adr/ADR-008-rom-delivery-full-rom-ownership-gate.md, T-018, T-021, T-022, T-023, T-024]
blocked-by: [T-021, T-022, T-023, T-024]
---

# T-025 — Produce endpoint + status/ETA + ROM download

## Context

The user-facing API of the epic [T-018](T-018-backend-build-queue-produce.md): submit a bundle,
watch progress/ETA, download the result. Replaces the 501 stub at
[backend/server.js](../backend/server.js):18. Auth (T-021), ownership (T-022), persistence
(T-023) and the worker (T-024) must exist first.

## Plan

- `POST /api/produce` (authenticated, verified, `owns_valid_rom`, no active request): accept the
  ~32 MB bundle, **validate against the strict schema** (T-026/ADR-006), classify fast/slow,
  enqueue (T-024), persist (T-023), return a request id + initial ETA. If ETA ≥ 2 min, the response
  flags that email-on-ready can be offered. This is called automatically when the user clicks
  **Generate** (T-028) — it is the *only* trigger; docs are produced/downloaded client-side and
  never touch this endpoint.
- **Bundle is stored on disk** for the active request (the build reads `--bundle=path`), referenced
  by the request row, and **purged when the request reaches a terminal state** (downloaded/expired).
  It is also retrievable for the front's lazy "Regenerate docs" fallback (T-028).
- `GET /api/status` (own request): state, queue position, live ETA (ADR-005 model: EWMA
  `avg_rom_secs`). SSE or polling — reuse the job-store pattern in
  [backend/generator.js](../backend/generator.js).
- `GET /api/download` (own ready request): stream the zip of the user's ROM(s); mark `downloaded`
  and schedule deletion **only after a complete, successful transfer**; write the `runs` history row.
- Enforce one-active-request and the verified+owns-rom gate; everything keyed off `/api/me`.

Acceptance criteria:
- [x] `/api/produce` validates + enqueues + returns id and initial ETA; rejects invalid bundle (400) and
      a second active request (409); unauth/unverified/no-rom gated by middleware. Handler tested.
- [x] `/api/status` reports state, ROMs done/total and a live ETA (encodes queue position) — tested.
- [x] `/api/download` returns the ROM zip then marks downloaded + purges (files via injected `removeFile`);
      refuses when not ready (409). `runs` history is written at `ready` by the worker (T-024/T-023). Tested.
- [x] Bundle schema rejects malformed/hostile input (validateBundle wired; produce → 400) — tested.
- [x] Non-trivial logic (validation, ETA, download-then-delete) covered by tests; zero-dep STORE zip too.

_Live HTTP endpoints + a real bundle POST + a real streamed download = final manual pass._

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown.
- **2026-06-24** — Implemented (Red→Green): `produce/eta.js` (best-effort position-based ETA),
  `produce/handlers.js` (handleProduce/handleStatus/handleDownload, dependency-injected), `produce/routes.js`
  (auth+verified+owns-rom gate), `build/zip.js` (zero-dep STORE zip via `zlib.crc32`), and `requireOwnsRom`.
  8 tests; **backend suite 66/66**. Stays **in-progress**: the live endpoints, a real 32 MB bundle POST and
  a streamed real download are the final manual pass. fs ops (persist bundle / read output / delete) are
  injected — wired with FAKE_BUILD in the server-integration step. Code merged.
- **2026-06-24** — Closed per owner. Live produce→status→download with a real bundle is **deferred to
  T-029**; the **real per-ROM build adapter** (FAKE_BUILD off, bounded `make -j`) is wired in **T-019**.
  Gates + handler logic confirmed via smoke.

## Outcome

Implemented: `produce/{eta,handlers,routes}.js` + `build/zip.js` (zero-dep STORE zip) — `/api/produce`
(validate/classify/enqueue/persist + initial ETA), `/api/status` (live ETA), `/api/download` (zip then
mark-downloaded + purge). 8 unit tests; produce gates (403/409) smoke-verified. **Deferred:** real
bundle POST + streamed download → [T-029](T-029-full-flow-manual-test.md); real build adapter → T-019.
