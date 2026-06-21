---
id: T-020
title: Optional user accounts — ROM-ownership verification + seed/run history
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
target-version: 0.4.0
links: [T-018, T-019]
blocked-by: [T-018]
---

# T-020 — Optional user accounts — ROM-ownership verification + seed/run history

## Context

Future, **optional** feature layered on top of the ROM-delivery flow built in
[T-018](T-018-backend-build-queue-produce.md) (produce endpoint + build queue) and
[T-019](T-019-infra-dockerized-build-server-deploy.md) (deploy).

Two purposes, kept deliberately narrow:

1. **ROM-ownership gate.** The user uploads a base ROM; we verify it by **hash** against
   the known-good base-game checksum. A verified ownership proof is a **requirement** before
   we deliver the modified (randomized) ROM. This is the legitimacy cover for distributing a
   ROM hack: delivery is conditioned on the requester proving they own a legitimate copy of
   the original game.
2. **Convenience memory.** An account lets a returning user avoid re-proving / re-uploading
   and lets them revisit past runs:
   - **Remember their ROM** — store the verified ownership proof (ideally the hash, not the
     ROM bytes) so they don't re-upload every time.
   - **Remember runs (seeds)** — keep a history of their generated runs and the seed each
     used, so they can re-request another ROM from the same seed (e.g. a fresh nuzlocke ROM
     from a known seed).
   - **Maybe later** — other per-user features TBD.

Accounts are **optional**: the anonymous one-shot flow (upload → verify → build → download)
must keep working without an account. The account only removes repeated friction and adds
history.

This is a **broad-strokes** task to be detailed (and likely split) before work starts.

## Plan

Strokes (to refine):
- **Ownership verification by hash.** Decide what we check (which base ROM(s), which hash —
  e.g. SHA-1/CRC32 of the canonical dump) and where the check lives in the delivery flow
  (gate inside / in front of `POST /api/produce`, see T-018). Define the failure UX when the
  hash doesn't match a known-good base.
- **What we store.** Strongly prefer storing the **verified hash / ownership proof**, never
  the uploaded ROM bytes (storage + legal surface). Per user: their verified base-ROM
  proof(s) and a list of runs (seed + the parameters needed to reproduce/re-deliver).
- **Re-deliver from a stored seed.** Given a remembered run, let the user request another
  build of the same seed without re-supplying everything (reuses the T-018 produce/queue).
- **Auth model.** Pick the lightest thing that works (e.g. email magic-link / passwordless)
  — scope an ADR for the auth + storage choice before implementing.
- **Privacy / retention.** Define what is kept, for how long, and how a user deletes their
  account and history. Don't retain ROM bytes.
- **Anonymous path preserved.** The existing no-account flow keeps working end to end.

Acceptance criteria (draft):
- [ ] An account can be created and authenticated (mechanism chosen via ADR).
- [ ] ROM ownership is verified by hash; a verified proof is required before delivery, and
      the proof (not the ROM bytes) is what gets stored.
- [ ] A logged-in user sees their run history with seeds and can re-request a ROM from a
      stored seed without re-uploading.
- [ ] The anonymous one-shot flow still works without an account.
- [ ] Retention/deletion behaviour defined and implemented; no ROM bytes retained.
- [ ] Non-trivial logic (hash verification, seed re-delivery, history) is covered by tests.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-21** — Task created (broad strokes). Future/optional feature on top of the
  T-018/T-019 delivery pipeline; target-version 0.4.0 chosen as a default (delivery flow at
  0.3.0 must exist first) — confirm/adjust before work starts.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
