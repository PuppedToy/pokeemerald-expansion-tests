---
id: T-021
title: Auth & accounts — register/login/forgot, email verification, JWT
status: in-progress
type: feature
created: 2026-06-21
updated: 2026-06-24
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
- [x] Register → unverified user + verification mail; cannot generate until verified (service +
      `requireVerified` tested). _Passwords hashed via `crypto.scrypt` — ADR-004 deviation, logged._
- [x] Login returns a valid JWT; protected routes reject missing/invalid/unverified (middleware tested).
- [x] Forgot/reset works via single-use expiring token; passwords hashed (tested).
- [ ] `/api/me` reports identity + verified/owns-rom/active-request — route implemented; **verified in
      the final manual pass** (HTTP glue).
- [x] Rate limits enforced on auth routes; covered by tests (`ipRateLimit`).

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown (decisions in ADR-004).
- **2026-06-24** — Started (branch `feature/T-021-auth-accounts`), as part of the owner's "finish
  the whole backend, then test" push. Tech, consistent with the zero-native-dep stance (node:sqlite,
  node:test): password hashing via **`crypto.scrypt`** (built-in) and a **hand-rolled HS256 JWT** via
  `crypto` — no `argon2`/`jsonwebtoken` (avoids a native build, keeps the T-026 image lean).
  **Deviation from ADR-004's literal "argon2id"** recorded here; scrypt is a strong built-in KDF and an
  easy swap later if the owner wants argon2id. Verify/reset tokens persist hashed in a new `auth_tokens`
  table (single-use, expiring) added to the T-023 schema. Scope split for the "test-only close" policy:
  password/jwt/tokens/users-repo/service/middleware are unit-tested here; the thin express routes are
  glue verified in the final manual test pass. Mailer (T-027) injected; mocked in tests.
- **2026-06-24** — Implemented (Red→Green). Modules: `auth/{password,jwt,tokens,users,service,middleware,routes}.js`
  + `auth_tokens` table added to the schema. **Backend suite 38/38.** Updated the `db` idempotency test
  to expect the new table (deliberate schema change). Logic (hash/jwt/tokens/service/middleware/rate-limit)
  is unit-tested; the express routes are thin glue whose end-to-end behaviour is checked in the final
  manual pass — so the task stays **in-progress** (HTTP surface), code merged to master to unblock T-025.

## Outcome
