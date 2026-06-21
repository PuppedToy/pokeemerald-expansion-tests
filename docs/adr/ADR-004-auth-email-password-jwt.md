# ADR-004: Authentication is email + password with light email verification and JWT

- **Status:** accepted
- **Date:** 2026-06-21
- **Task:** T-018

## Context

ROM generation requires a logged-in user for two product reasons (T-018): the user must
upload a base ROM to prove ownership, and must give an email so a finished ROM can be sent
when the queue is long. Documentation generation stays anonymous. The owner asked for the
**simplest registration/login that works**.

The first cut was "email + password, no email verification". Review (T-018) surfaced that
this opens three holes at once: open registration + an expensive build endpoint =
**DoS amplification**; "forgot password" by email is unsound if the email was never proven;
and the notification email can be aimed at non-consenting third parties (spam vector). The
owner chose to add **light email verification**, which closes all three.

## Decision

Authenticate with **email + password + a one-time email verification link**, sessions via
**JWT**.

- **Registration:** email + password; password hashed with **argon2id** (bcrypt acceptable
  fallback). Account starts `unverified`; an activation link is emailed (ADR-007). ROM
  generation is gated on `verified` (anonymous docs are not).
- **Login:** returns a signed JWT (short-lived) stored client-side; the secret is an env var,
  never committed.
- **Forgot password:** emailed single-use, expiring reset link — now sound because the email
  is verified.
- **Abuse control:** per-IP rate limits on register / login / forgot / produce, plus the
  global queue cap (ADR-005). Verification + rate limits make mass account creation costly.
- **`/api/me`** returns identity + state: verified?, owns-valid-rom?, active request? — the
  frontend drives everything off this.

## Alternatives considered

- **No email verification** (original spec) — rejected by the owner once the DoS / reset /
  spam consequences were clear.
- **Magic-link / passwordless** — viable and simple, but every login needs an email round-trip;
  password + one-time verification is less friction for repeat use.
- **OAuth (Google/GitHub)** — rejected: heavier, drags in a third party, and we still need the
  ROM-ownership flag which is ours regardless.
- **Server-side sessions** — rejected: JWT is stateless and enough; the few things needing
  server state (one-active-request) live in SQLite (ADR-003), not the session.

## Consequences

- Email is now **load-bearing from registration**, not just notifications → ADR-007 (email
  provider + DNS) is a launch dependency, not a nice-to-have.
- We commit to: argon2id hashing, env-managed JWT secret, expiring single-use tokens for
  verify/reset, and rate limits on every auth + produce route.
- A user can't generate before verifying; the frontend (T-028) must explain this in the
  login/explainer section. Implementation in T-021.
