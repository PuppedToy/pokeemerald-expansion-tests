---
id: B-004
title: Docker Compose env_file captures inline comments → BREVO_API_KEY set to garbage, email crashes
status: fixed
severity: major
created: 2026-06-25
updated: 2026-06-25
found-in: 0.3.0
fixed-in: 0.3.0
regression-test: backend/__tests__/deploy-env.test.js
links: [T-019, T-027]
---

# B-004 — Docker Compose env_file captures inline comments

## Symptom

On the first deploy to the Hetzner box, every account-verification email failed:

```
email send failed (verify -> user@x): Cannot convert argument to a ByteString
because the character at index 18 has a value of 8594 which is greater than 255.
```

`8594` is `→`. With no `BREVO_API_KEY` set we expected the dev console transport (which just logs
the link), but the app was trying to call the Brevo API instead — and the API key it used contained a
`→`. Net effect: nobody could verify their email on the deployed box.

## Root cause

`deploy/.env.example` (copied to `deploy/.env`) had **inline comments on value lines**, e.g.
`BREVO_API_KEY=             # Brevo dashboard → SMTP & API → API keys`. Unlike a shell `source`,
**Docker Compose's `env_file` does not strip inline comments** — everything after `=` becomes the
value. So `BREVO_API_KEY` was the non-empty string `"   # Brevo dashboard → SMTP & API → API keys"`,
which (a) made `server.js` pick the real Brevo transport instead of the console one, and (b) put `→`
into an HTTP header → the ByteString error. (`AVG_ROM_SECS` and `JWT_SECRET` had the same inline-comment
shape; only `BREVO_API_KEY` caused a crash, but all were wrong.)

## Fix

Moved every comment in `deploy/.env.example` to its **own line** (never `KEY=val # ...`), and documented
the env_file gotcha in the file header — [deploy/.env.example](../deploy/.env.example). On the box,
`deploy/.env` was corrected (empty `BREVO_API_KEY`) and the container **recreated** (`up -d
--force-recreate`, since `restart` does not reload `env_file`); verify e2e then went green
(register → link logged → verify → `me` verified:true). Regression test
[backend/__tests__/deploy-env.test.js](../backend/__tests__/deploy-env.test.js) fails on any `KEY=value`
line carrying a `#`: verified FAIL before the fix, PASS after. Found during T-019 deploy bring-up
(unreleased 0.3.0). Secondary gotcha logged in T-019: `docker compose restart` ≠ env reload.
