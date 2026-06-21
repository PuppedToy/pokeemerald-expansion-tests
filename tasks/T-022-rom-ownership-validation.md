---
id: T-022
title: ROM-ownership validation by hash (validate-and-delete)
status: proposed
type: feature
created: 2026-06-21
updated: 2026-06-21
target-version: 0.3.0
links: [docs/adr/ADR-004-auth-email-password-jwt.md, T-018, T-021]
blocked-by: [T-021]
---

# T-022 — ROM-ownership validation by hash (validate-and-delete)

## Context

Generation requires proof the user owns a real Pokémon Emerald cart/dump (the legitimacy
cover for delivering a ROM hack — [T-018](T-018-backend-build-queue-produce.md)). We verify
by hash and **never keep the bytes**: validate, set the user's `owns_valid_rom` flag, delete
the upload immediately. Once flagged, the user never re-uploads.

## Plan

- `POST /api/rom/validate` (authenticated): accepts an uploaded ROM, **size-bounded** to the
  Emerald size (~16 MB) to reject abuse before reading.
- Hash the upload (SHA-1; MD5/CRC32 as needed) and compare against an allow-list of known-good
  Emerald dumps (decide which regional revisions: USA 1.0/1.1, EUR, …). Research/confirm the
  canonical hashes and record them in the task.
- On match: set `owns_valid_rom = true`, delete the file, return success. On mismatch: clear
  failure UX, delete the file regardless.
- The bytes are never persisted, never logged.

Acceptance criteria:
- [ ] A known-good Emerald dump validates and flips `owns_valid_rom`; the file is deleted.
- [ ] A non-matching / oversized upload is rejected with a clear error; nothing is retained.
- [ ] Accepted hash set documented in this task; hashing covered by tests (fixtures = known hashes).
- [ ] Endpoint requires auth; rate-limited.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown. Open question carried from the
  spec: which Emerald revisions we accept (confirm canonical hashes before implementing).

## Outcome
