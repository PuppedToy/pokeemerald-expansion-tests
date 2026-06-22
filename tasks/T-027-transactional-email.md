---
id: T-027
title: Transactional email service — verification, reset & ROM-ready notification
status: done
type: feature
created: 2026-06-21
updated: 2026-06-22
target-version: 0.3.0
links: [docs/adr/ADR-007-transactional-email-notifications.md, T-018, T-021, T-025]
blocked-by: []
---

# T-027 — Transactional email service — verification, reset & ROM-ready notification

## Context

Email is load-bearing once verification is required ([ADR-004](../docs/adr/ADR-004-auth-email-password-jwt.md)).
This task is the sending foundation ([ADR-007](../docs/adr/ADR-007-transactional-email-notifications.md))
consumed by auth (T-021: verification + reset links) and produce (T-025: opt-in ready notification).

### Design (backend ESM; mailer decoupled from the provider)

- **`backend/email/transport.js`** — provider behind a `send({to,subject,html,text})` interface.
  `brevoTransport({ apiKey, sender })` posts to Brevo's `v3/smtp/email` via `fetch` (zero new dep).
  The real transport is only exercised in a real env (key from `BREVO_API_KEY`); tests inject a mock.
- **`backend/email/templates.js`** — pure `render(kind, vars)` → `{subject, html, text}` for the three
  kinds: `verify`, `reset`, `ready`. `ready` **links back to the site**, never an attachment.
- **`backend/email/rateLimiter.js`** — in-memory per-recipient limiter (N per rolling window, injectable
  `now`). Route/IP limits are auth-route middleware (T-021), not here.
- **`backend/email/index.js`** — `createMailer({ transport, limiter, now })` → `sendMail(kind, to, vars)`:
  render → rate-limit check → transport.send. **Never throws to the caller** (graceful degradation: a
  send failure returns `{ ok:false, reason }` and logs; a build/download still completes).

### Deferred to deploy (T-019)

Provider account + `BREVO_API_KEY` env + sender **SPF/DKIM/DMARC** DNS. The real send is validated then;
here it is covered via a mock transport (acceptance criterion 1 is split accordingly).

Acceptance criteria:
- [x] `sendMail(kind,...)` renders the right template and calls the transport with subject/body+link;
      provider mocked in tests. (Real-env delivery validated at deploy — T-019.)
- [x] `verify`, `reset`, `ready` render distinct subjects; `ready` links back to the site (no attachment).
- [x] Per-recipient rate limiting suppresses over-limit sends (transport not called) — tested.
- [x] A transport failure is caught: `sendMail` returns a failure result and does **not** throw — tested.

**Handoff to [T-019](T-019-infra-dockerized-build-server-deploy.md) (deploy ops, not this task):**
provision the Brevo account, set `BREVO_API_KEY`, configure sender SPF/DKIM/DMARC, and confirm one
live send. That is operational enablement owned by the deploy; T-027 ships the provider-agnostic
mailer code it runs on.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-007).
- **2026-06-21** — Owner constraint: **zero cost** (no paid plans). Provider narrowed to free-forever
  tiers; **Brevo** chosen for headroom (300/day covers low-traffic verification + notifications).
  Note: verification mail is on the registration critical path, so the free cap bounds new sign-ups,
  not existing downloads.
- **2026-06-22** — Started on branch `feature/T-027-transactional-email`. Decoupled the mailer from the
  provider (transport interface) so the unit is fully testable with a mock; the real Brevo `fetch`
  transport + DNS are deferred to deploy (T-019). Implementing TDD: render/select, per-recipient rate
  limit, graceful failure. Marked criteria 1–4 in scope here; criterion 5 (live send) deferred to T-019.
- **2026-06-22** — Implemented (Red→Green) and closed on green. Wrote the email spec first (saw it fail
  on the missing modules), then `email/{templates,rateLimiter,transport,index}.js`. **Backend suite
  20/20** (`cd backend && npm test`). Re-scoped the live-send/DNS criterion as an explicit handoff to
  T-019 (added there as an acceptance criterion) so T-027's own four criteria are all met. Closed under
  the owner's test-only policy (no manual surface here; the real send is deploy ops).

## Outcome

**Shipped:** the provider-agnostic transactional mailer (ADR-007). `email/templates.js` renders the
`verify`/`reset`/`ready` messages (`ready` links back to the site, never an attachment);
`email/rateLimiter.js` is an in-memory per-recipient rolling-window limiter; `email/transport.js` is
the Brevo `fetch` transport (free tier, zero dep); `email/index.js` `createMailer().sendMail(kind,to,vars)`
renders → rate-limits → sends and **never throws** (graceful degradation). 6 new tests (provider mocked),
suite 20/20.

**Deviations from the plan:** the live-send + SPF/DKIM/DMARC + real API key are operational enablement,
moved to **T-019** (deploy) as a handoff — T-027 ships the code, not the prod wiring.

**Follow-ups:** none new. Consumers: T-021 (verification + reset links), T-025 (opt-in ready
notification). No changelog line — internal infra, not user-visible.
