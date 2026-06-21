---
id: T-028
title: Frontend — login/explainer, dual-action download, status/ETA & "my ROMs"
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
target-version: 0.3.0
links: [T-018, T-021, T-022, T-025]
blocked-by: [T-021, T-025]
---

# T-028 — Frontend — login/explainer, dual-action download, status/ETA & "my ROMs"

## Context

The browser side of the epic [T-018](T-018-backend-build-queue-produce.md). Docs stay anonymous;
ROM generation requires login + a verified account + a validated ROM. This wires the UI onto the
API (T-021 auth, T-022 validate, T-025 produce/status/download).

## Plan

- **Login/register/verify/forgot UI** + an **explainer section** in the randomizer stating *why*
  login is needed: (1) upload the original Emerald ROM (ownership), (2) provide an email to be
  notified if the queue is long.
- **Dual-action download button** ("Download documentation"): docs zip (+ `bundle.json`) is built
  client-side and **always** downloads. If logged in + verified + owns-rom + no active request, it
  **also** POSTs the bundle to `/api/produce`. Failure modes are **decoupled** from the docs
  download and surfaced separately (not logged in / not verified / no validated ROM → warning with
  the right CTA; already has an active request → point to status).
- **ROM-upload step** only when the user lacks a validated ROM (the system remembers once validated).
- **Status/ETA view:** poll/SSE `/api/status`; show position + live ETA; when ETA ≥ 2 min offer the
  email-on-ready checkbox. ETA may rise for slow jobs — message it gracefully.
- **"My ROMs" area:** the user's ready ROM(s), 48 h TTL, download (which deletes server-side);
  session restored on return (one active request → land straight on its status).

Acceptance criteria:
- [ ] Docs download works for anyone; ROM submission only fires when fully eligible, with clear
      warnings otherwise.
- [ ] Login/verify/forgot flow works against the API; explainer present.
- [ ] ROM upload appears only when needed; remembered after validation.
- [ ] Status/ETA updates live; email opt-in shown when ETA ≥ 2 min; "my ROMs" shows TTL + download.
- [ ] Session restored on re-entry to the active request.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown.

## Outcome
