---
id: T-027
title: Transactional email service — verification, reset & ROM-ready notification
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
target-version: 0.3.0
links: [docs/adr/ADR-007-transactional-email-notifications.md, T-018, T-021, T-025]
blocked-by: []
---

# T-027 — Transactional email service — verification, reset & ROM-ready notification

## Context

Email is load-bearing once verification is required ([ADR-004](../docs/adr/ADR-004-auth-email-password-jwt.md)).
This task is the sending foundation ([ADR-007](../docs/adr/ADR-007-transactional-email-notifications.md))
consumed by auth (T-021: verification + reset links) and produce (T-025: opt-in ready notification).

## Plan

- Integrate a **transactional email provider on a free-forever tier (zero cost — hard constraint)**.
  Pick: **Brevo** (9 000/mo · 300/day, most headroom); alternatives Mailjet (6 000/mo) / Resend
  (3 000/mo). API key in env. A thin `sendMail(template, to, vars)` wrapper the rest of the backend calls.
- Templates: account verification, password reset, ROM-ready. Ready mail is opt-in and only when
  ETA ≥ 2 min; it **links back to the site**, never attaches the ROM.
- Configure sender **SPF + DKIM (+ DMARC)** DNS for deliverability (record in the deploy runbook, T-019).
- Graceful degradation: a send failure never blocks a build or a download; log and move on.
- Per-account/IP send rate limits; only unverified-address mail is the verification link itself.

Acceptance criteria:
- [ ] `sendMail` delivers via the provider in a real environment; failures are caught and logged.
- [ ] Verification, reset and ready templates send with correct, single-use/expiring links where
      applicable.
- [ ] SPF/DKIM documented for the deploy; ready notification is opt-in and links back (no attachment).
- [ ] Wrapper logic (template selection, rate limiting, failure handling) covered by tests (provider mocked).

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-007).
- **2026-06-21** — Owner constraint: **zero cost** (no paid plans). Provider narrowed to free-forever
  tiers; **Brevo** chosen for headroom (300/day covers low-traffic verification + notifications).
  Note: verification mail is on the registration critical path, so the free cap bounds new sign-ups,
  not existing downloads.

## Outcome
