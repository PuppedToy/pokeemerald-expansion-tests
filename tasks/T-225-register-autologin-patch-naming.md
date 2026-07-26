---
id: T-225
title: Register auto-login + patch zip naming (validation feedback)
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [T-021, T-211]
blocked-by: []
---

# T-225 — Register auto-login + patch zip naming

## Context

Owner validation feedback:
4. Registering should give **immediate access** — no separate login step after registering.
5. The raw patch download is named `emerald-cut-patch.zip`; it should be `run-<seed>-patch.zip` (consistent
   with the other archives, T-211).

## Plan

- **(4)** `doRegister` (`frontend/js/account.js`): on a successful `/api/register`, immediately `doLogin`
   with the same credentials (login already works for unverified users — `auth/service.js` issues a token
   without a verified gate). The account is created + the session starts; email verification is still
   required to *build* (reevaluateDelivery shows the verify prompt once they're in). No backend change.
- **(5)** `downloadBpsOnly`: name the file `run-${seed}-patch.zip` (seed from `lastBundle.config.seed`),
   matching `run-<seed>-docs.zip` / `-patch-files.zip` / `-full.zip` (T-211).

Acceptance criteria:
- [x] After registering, the user is logged in without a second step (functional test: session token stored
      after the register submit); still prompted to verify email to build.
- [x] The raw `.bps` download is `run-<seed>-patch.zip`, not `emerald-cut-patch.zip`.
- [x] Consent guard on register preserved; frontend suite green (209); `shoot` no overflow.
- [ ] Owner re-validates on the live site after deploy.

## Progress log

- **2026-07-26** — From owner validation. Confirmed `service.login` has no verified-gate, so client-side
  auto-login after register is safe (no backend change). Renamed the raw patch download to the T-211 scheme.

## Outcome

<!-- Filled when closing. -->
