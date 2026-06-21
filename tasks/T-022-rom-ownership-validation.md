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
- Hash the upload (SHA-1; CRC32/MD5 as needed) and compare against an allow-list of the known-good
  official Emerald dumps (the **accepted set** below).
- On match: set `owns_valid_rom = true`, delete the file, return success. On mismatch: clear
  failure UX, delete the file regardless.
- The bytes are never persisted, never logged.

### Accepted set (all official Emerald releases)

Pokémon Emerald shipped one English ROM (shared US + Europe) plus the Japanese and EU-language
versions — **6 official dumps**, no English revision. The **No-Intro GBA DAT is the source of truth**;
the full SHA-1 list is locked from it at implementation time (we do not hand-transcribe hashes).

| Release (No-Intro name) | Confirmed hash |
|---|---|
| Pokémon - Emerald Version (USA, Europe) | SHA-1 `f3ae088181bf583e55daf962a92bb46f4f1d07b7` · CRC32 `1f1c08fb` |
| Pokémon - Emerald Version (Japan) | from No-Intro DAT |
| Pokémon - Emerald Version (France) | from No-Intro DAT |
| Pokémon - Emerald Version (Germany) | from No-Intro DAT |
| Pokémon - Emerald Version (Italy) | from No-Intro DAT |
| Pokémon - Emerald Version (Spain) | from No-Intro DAT |

Vanilla Emerald is ~16 MB (the built expansion ROM is ~32 MB) — size-bound the upload to the vanilla
size before hashing. Ownership is independent of which ROM the server builds against (the build is
from source), so accepting any official dump is correct.

Acceptance criteria:
- [ ] A known-good Emerald dump (any of the accepted set) validates and flips `owns_valid_rom`; the file is deleted.
- [ ] A non-matching / oversized upload is rejected with a clear error; nothing is retained.
- [ ] Accepted hash set documented in this task; hashing covered by tests (fixtures = known hashes).
- [ ] Endpoint requires auth; rate-limited.

## Progress log

- **2026-06-21** — Task created from the T-018 epic breakdown.
- **2026-06-21** — Owner: accept **all legal/official** Emerald releases. Researched: there are 6
  official dumps (English shared US+EU, plus JP/FR/DE/IT/ES; no English revision). Confirmed the
  (USA, Europe) SHA-1/CRC32; the rest are locked from the **No-Intro GBA DAT** at implementation
  (avoid transcribing hashes by hand). Recorded the accepted set in the plan.

## Outcome
