---
id: T-281
title: Attach megas to the species they are a mega of, not to a family
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-278, T-280, docs/adr/ADR-026-identity-classification-and-dedup-are-three-concerns.md]
blocked-by: [T-278]
---

# T-281 — Attach megas to the species they are a mega of, not to a family

## Context

Fourth child of the T-277 epic. `megaEvoTree` was keyed by `family` and its whole list was stamped on
every non-mega member, so a mega bled across sibling branches: **Slowking carried Slowbro-Mega**,
Gardevoir and Gallade each carried *both* megas, Kleavor carried Scizor-Mega and Froslass carried
Glalie-Mega.

The `invalidMegas = ['SPECIES_FROSLASS', 'SPECIES_KLEAVOR']` blocklist in `modules/utils.js` was a
hand-patch for exactly this. It covered two of the five cases, never Slowking, and only suppressed
`hasValidMega` — `rating.megaEvoTier` was still stamped on all of them.

## Plan

`evoStages.megaEvosOf(list)`: a species reaches the megas of itself plus of everything
forward-reachable from it. Delete the blocklist.

Acceptance criteria:
- [x] A sibling branch with no mega of its own carries none.
- [x] Two siblings that each have a mega keep only their own.
- [x] A pre-evolution still carries the megas of everything it can become.
- [x] A mega does not carry itself.
- [x] No hardcoded species blocklist remains, pinned by a test.
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Owner manually tests a built ROM and confirms (batched with the rest of the epic).

## Progress log

- **2026-08-14** — Implemented TDD; `__tests__/unit/megaAttachment.test.js` red first.
  One test needed rewording, not weakening: it grepped `modules/utils.js` for `invalidMegas` to prove
  the blocklist was gone, which also matched the historical note I left in the comment above
  `hasValidMega`. Tightened to the *declaration* (`const|let|var invalidMegas`), which is the thing
  that must never come back; the comment explaining why it existed is worth keeping.
- **2026-08-14** — Verified against the real dex: **5 species corrected**. Slowking, Kleavor and
  Froslass lose a mega they could never reach; Gardevoir and Gallade narrow from both megas to their
  own. Kirlia still carries both (it can become either) and Slowpoke still carries Slowbro-Mega — the
  pre-evolution cases the fix must not break. Full suite green: 2593 passed.

## Outcome
