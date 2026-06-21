---
id: T-025
title: Produce endpoint + status/ETA + ROM download
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
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
- [ ] `/api/produce` validates + enqueues + returns id and initial ETA; rejects unauth/unverified/
      no-rom/active-request with clear errors.
- [ ] `/api/status` reports state, position and a live ETA that updates as the queue drains.
- [ ] `/api/download` streams the zip and deletes only after a successful full transfer; `runs` written.
- [ ] Bundle schema rejects malformed/hostile input (with T-026).
- [ ] Non-trivial logic (validation, ETA, download-then-delete) covered by tests.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown.

## Outcome
