---
id: B-006
title: Auth router's body parser (mounted at /api) rejects the 32 MB produce bundle with 413
status: fixed
severity: critical
created: 2026-06-25
updated: 2026-06-25
found-in: 0.3.0
fixed-in: 0.3.0
regression-test: backend/__tests__/routing.test.js
links: [T-021, T-025, T-019]
---

# B-006 — Auth router's body parser blocks the produce bundle

## Symptom

`POST /api/produce` with a real ~32 MB bundle returned **HTTP 413 Payload Too Large** — even though
the produce route uses `express.json({ limit: '50mb' })`. ROM generation impossible.

## Root cause

`server.js` mounts both routers under the same base: `app.use('/api', authRouter)` then
`app.use('/api', produceRouter)`. The auth router applied its body parser with
`router.use(express.json({ limit: '1mb' }))` — and because it is mounted at `/api`, that 1 MB parser
runs for **every** `/api/*` request that passes through the auth router, including `/api/produce`. So
the 32 MB bundle hit the 1 MB limit and 413'd before ever reaching the produce router's 50 MB parser.

## Fix

Parse JSON **per-route** on the auth POST routes instead of `router.use` — so the auth parser only
applies to auth endpoints, never to `/api/produce` — [backend/auth/routes.js](../backend/auth/routes.js).
Regression test [backend/__tests__/routing.test.js](../backend/__tests__/routing.test.js) boots an
express app with the auth router at `/api` + a 50 MB `/api/produce`, POSTs a ~2 MB body, and asserts it
is not 413. Manifested as a live 413 on the box (fail-before); passes after. Found during T-019 deploy
validation — the third integration bug (with B-004, B-005) that unit tests missed and an end-to-end run
caught.
