---
id: T-021
title: Auth & accounts — register/login/forgot, email verification, JWT
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
target-version: 0.3.0
links: [docs/adr/ADR-004-auth-email-password-jwt.md, docs/adr/ADR-003-persistence-job-lifecycle-recovery.md, docs/adr/ADR-007-transactional-email-notifications.md, T-018]
blocked-by: [T-023, T-027]
---

# T-021 — Auth & accounts — register/login/forgot, email verification, JWT

## Context

Foundation of the backend epic [T-018](T-018-backend-build-queue-produce.md): generation is
gated on a verified account ([ADR-004](../docs/adr/ADR-004-auth-email-password-jwt.md)).
Uses the SQLite store ([ADR-003](../docs/adr/ADR-003-persistence-job-lifecycle-recovery.md))
and the email sender ([ADR-007](../docs/adr/ADR-007-transactional-email-notifications.md)).

## Plan

- `users` table: email (unique), argon2id password hash, `verified`, `owns_valid_rom`, timestamps.
- Endpoints: `POST /api/register`, `POST /api/login` (→ JWT), `POST /api/verify` (one-time token),
  `POST /api/forgot` + `POST /api/reset` (single-use, expiring), `GET /api/me`.
- JWT middleware (env secret); generation routes require `verified`.
- Per-IP rate limits on register/login/forgot; single-use expiring tokens for verify/reset.
- `/api/me` returns: verified?, owns-valid-rom?, active-request summary.

Acceptance criteria:
- [ ] Register → unverified user + verification mail; cannot generate until verified.
- [ ] Login returns a valid JWT; protected routes reject missing/invalid/unverified tokens.
- [ ] Forgot/reset works via single-use expiring token; passwords argon2id-hashed.
- [ ] `/api/me` reports identity + verified/owns-rom/active-request state.
- [ ] Rate limits enforced on auth routes; covered by tests.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-004).

## Outcome
