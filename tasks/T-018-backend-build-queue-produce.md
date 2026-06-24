---
id: T-018
title: EPIC — Backend ROM-production service (accounts, ownership, queue, delivery)
status: in-progress
type: feature
created: 2026-06-21
updated: 2026-06-21
target-version: 0.3.0
links: [docs/adr/ADR-001-rom-build-server-provider.md, docs/adr/ADR-002-build-server-iac-docker.md, docs/adr/ADR-003-persistence-job-lifecycle-recovery.md, docs/adr/ADR-004-auth-email-password-jwt.md, docs/adr/ADR-005-two-tier-preemptive-build-queue.md, docs/adr/ADR-006-untrusted-bundle-build-sandbox.md, docs/adr/ADR-007-transactional-email-notifications.md, docs/adr/ADR-008-rom-delivery-full-rom-ownership-gate.md, T-017, T-019, T-020, T-021, T-022, T-023, T-024, T-025, T-026, T-027, T-028]
blocked-by: []
---

# T-018 — EPIC — Backend ROM-production service

> This is the **epic** tracking the whole backend. It owns the global design and the decisions;
> the actual work ships in the child tasks below. The "one in-progress task" focus rule applies
> to the implementation children, not to this tracker.

## Context

The frontend randomizes in the browser and produces a session **bundle** (`bundle.json`, array
of ROMs — `bundle.roms`, make.js:140). The backend's only heavy job is **compiling the GBA
ROM(s)** from that bundle (`make.js` → `make`), on the limited single-box capacity decided in
[ADR-001](../docs/adr/ADR-001-rom-build-server-provider.md). Today `POST /api/produce`
([backend/server.js](../backend/server.js):18) is a 501 stub.

Full owner spec (2026-06-21), goal = keep serving small jobs under load with limited resources:

- **One "Generate" button drives everything.** Clicking *Generate* builds the bundle and
  renders the docs client-side **and**, for an eligible user (logged in + verified + owns-rom +
  no active request), the **ROM build starts automatically from the same bundle** — there is no
  separate "build" button, and starting the build is **not** tied to downloading the docs.
- **Docs download is a separate, backend-free action.** A "Download documentation" button just
  packages the locally-held bundle into the docs zip; it hits no endpoint and can be used anytime,
  including while the ROMs build. The bundle is held client-side (IndexedDB — a ~32 MB bundle does
  not fit in localStorage) and server-side on the request, so on reload the docs can be regenerated
  (lazily, via a "Regenerate docs" button). When the ROM(s) are ready, the ROM-download button
  carries a **"single-use" warning** (downloading deletes them server-side).
- **Generation requires a verified account.** Login is mandatory because the user must (1) prove
  ROM ownership and (2) give an email for long-queue notification. A randomizer section explains
  this. Login remembers the bundle so the flow isn't repeated.
- **ROM ownership** is proven by hash: upload → validate → **delete immediately**, store only a
  flag. Remembered after the first time.
- **Two-tier queue.** A build is ~10–15 s **per ROM**; requests are *fast* (few ROMs) or *slow*
  (many). Fast served first; a slow request is preempted **between ROMs** to drain the fast queue,
  then resumes. One active request per user.
- **ETA** is estimated algorithmically (per-ROM time × queue ahead), shown live to the frontend.
  If initial ETA ≥ 2 min, offer email-on-ready.
- **Delivery & retention.** ROMs live in a "my ROMs" area for **48 h**, deleted on download or at
  48 h. Handled requests are purged; only a minimal **run history** (seed + params, no bytes) is
  kept so a user can re-generate from a seed.
- **Resilience.** On restart the backend recovers the in-flight work and loses nothing.

## Global design

- **One box** (ADR-001), **one serial build worker** — the two-tier queue is smarter scheduling,
  not parallelism (two builds can never share the tree).
- **API** (Express): auth, me, validate, produce, status, download.
- **SQLite** ([ADR-003](../docs/adr/ADR-003-persistence-job-lifecycle-recovery.md)) on the ADR-002
  persistent volume: `users`, `requests`, `runs`.
- **Scheduler/worker** ([ADR-005](../docs/adr/ADR-005-two-tier-preemptive-build-queue.md)): fast/slow
  FIFOs, preemption at ROM boundary, aging, bounded `make -j`, warm `build/` cache.
- **Auth** ([ADR-004](../docs/adr/ADR-004-auth-email-password-jwt.md)): email+password, argon2id,
  **light email verification**, JWT, rate limits.
- **Email** ([ADR-007](../docs/adr/ADR-007-transactional-email-notifications.md)): transactional
  provider for verification/reset/ready — new external dependency.
- **Sandbox** ([ADR-006](../docs/adr/ADR-006-untrusted-bundle-build-sandbox.md)): the bundle is
  untrusted input driving a native build → strict schema + hardened container (extends ADR-002).

**Request state machine:** `queued_fast | queued_slow | building | paused | ready | failed`
→ terminal `downloaded→purged` / `expired→purged`. Recovery: restore tree → re-queue `building`
→ resume from the persisted queue.

## Breakdown (child tasks)

| Child | Scope | ADR |
|---|---|---|
| [T-021](T-021-auth-accounts.md) | Auth & accounts (register/login/forgot, verification, JWT, `/api/me`) | ADR-004 |
| [T-022](T-022-rom-ownership-validation.md) | ROM-ownership validation by hash (validate-and-delete) | ADR-004 |
| [T-023](T-023-persistence-lifecycle-recovery.md) | SQLite, state machine, crash recovery, retention sweeper | ADR-003 |
| [T-024](T-024-build-worker-fast-slow-queue.md) | Build worker + two-tier preemptive serial queue | ADR-005 |
| [T-025](T-025-produce-status-eta-download.md) | `/api/produce` + status/ETA + download | ADR-005/003 |
| [T-026](T-026-untrusted-bundle-build-sandbox.md) | Untrusted-bundle schema + hardened build sandbox | ADR-006 |
| [T-027](T-027-transactional-email.md) | Transactional email (verification/reset/ready) | ADR-007 |
| [T-028](T-028-frontend-account-generation-flow.md) | Frontend: login/explainer, dual-action button, status/ETA, "my ROMs" | — |

Suggested order: foundations T-023 / T-027 / T-021 → T-022, T-024, T-026 → T-025 → T-028; deploy
([T-019](T-019-infra-dockerized-build-server-deploy.md)) last, blocked on T-025 + T-026.
[T-020](T-020-user-accounts-rom-ownership-seed-history.md) is superseded by this epic (accounts &
ownership → T-021/T-022; seed history → T-023 `runs`).

## Acceptance criteria

- [ ] All child tasks (T-021…T-028) closed and their criteria met.
- [ ] End-to-end: anonymous docs; verified login; ROM validated-and-deleted; bundle → queued →
      built → downloadable; ETA live; email-on-ready when long; 48 h TTL; restart loses nothing.
- [ ] `cd randomizer && npm test` green; no SSOT violations.

## Progress log

- **2026-06-21** — Created (broad strokes) alongside ADR-001/ADR-002 and T-017.
- **2026-06-21** — Owner delivered the full backend spec. Reviewed for completeness and risk;
  surfaced the top dangers (untrusted-bundle RCE, DoS via open registration, crash-recovery =
  restore-and-re-run not continue, slow-queue starvation, ROM-vs-bundle preemption granularity,
  download-then-delete ordering, legal exposure of serving built ROMs). Owner decisions: keep a
  **minimal run-history** (seed/params, no bytes) — reconciles T-020; add **light email
  verification** — closes DoS/reset/spam at once. Recorded ADR-003…ADR-007 and split the epic into
  T-021…T-028. Re-scoped T-018 from a single task into this epic; T-020 superseded.
- **2026-06-21** — Owner refinements: (1) corrected the trigger model — **Generate** starts docs
  *and* the ROM build; docs download is a separate backend-free action (was wrongly recorded as
  "download docs = launch build"). Adjusted T-028/T-025/T-023. (2) Email constrained to a
  **free-forever** tier (zero cost) → Brevo as the pick (ADR-007/T-027). (3) Accepted ROM set =
  all official Emerald releases, locked from the No-Intro DAT (T-022). (4) Aging confirmed
  ("occasionally take a slow one"). **Open decision:** delivery format — server returns the built
  ROM (current design) vs client-side patch + hash-only validation (lower legal exposure; no
  bandwidth win here). Not legal advice; pending owner call before T-022/T-025/T-028 finalize.
- **2026-06-21** — Delivery decision resolved by the owner: **server builds and delivers the full
  ROM**, ownership-by-hash gate as the accepted mitigation; legal exposure explicitly accepted (real
  legal sign-off recommended before any wide public launch). Recorded as
  [ADR-008](../docs/adr/ADR-008-rom-delivery-full-rom-ownership-gate.md). T-022/T-025/T-028 already
  match this model — no rework needed.
- **2026-06-24** — Whole backend implemented (TDD, 67 backend tests) and wired into `server.js` with a
  `FAKE_BUILD` mode; boot smoke-verified (register→verify→login; gates). Fixed B-002 (DB dir on boot).
  Children **closed** per owner with end-to-end verification explicitly deferred: T-023/T-024/T-026/T-027
  done on green; **T-021/T-022/T-025/T-028 closed** with e2e owned by **[T-029](T-029-full-flow-manual-test.md)**
  (manual full-flow test). Deploy goes to **Oracle ARM free tier** via **[T-019](T-019-infra-dockerized-build-server-deploy.md)**
  (also wires the real per-ROM build adapter). **This epic stays `in-progress`** until T-019 (deploy) +
  T-029 (e2e) confirm the full flow end-to-end on the live box.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned. -->
