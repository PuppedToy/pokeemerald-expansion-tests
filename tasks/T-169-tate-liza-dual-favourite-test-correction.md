---
id: T-169
title: Correct the Tate & Liza dual-favourite test to the confirmed spec
status: done
type: fix
created: 2026-07-20
updated: 2026-07-20
target-version: 0.6.0
links: [T-128]
blocked-by: []
---

# T-169 — Correct the Tate & Liza dual-favourite test to the confirmed spec

## Context

While verifying B-044, two long-stale assertions in the gated `reverseOrderContinuity` suite failed
(independently of B-044 — they fail on `master` too): the "Tate & Liza dual favourite" block expected
BOTH Solrock AND Lunatone to be fielded. Investigation (owner-confirmed 2026-07-20) shows that is the
wrong expectation, not a code bug.

Tate & Liza have two favourite chains — `[SOLGALEO, SOLROCK]` and `[LUNALA, LUNATONE]`. The legendaries
exceed the up-to-Ubers budget and drop to their thematic base counterparts. But Solrock and Lunatone are
mirror-stat twins (BST 460 each), so they rate the **same tier** (RU for the pinned seed), and the
`TATE_AND_LIZA` pool has only **one RU slot** (`[UBERS, UBERS, OU, UU, RU, mega]`). The first chain
(Solrock) claims it; the second twin (Lunatone) finds no free exact-tier slot and is correctly **dropped**
to the generic fallback. Only one twin is guaranteed whenever they share a tier — **intended behaviour**
(owner: "the behaviour is correct and lunatone should be dropped").

## Plan

Rewrite the two failing assertions to encode the confirmed spec: 6 mons, no legendary (budget rule),
Solrock (chain 0) fielded, Lunatone (same-tier second twin) NOT fielded. Deliberate test change per the
TDD rule — the specification was confirmed, not the code.

Acceptance criteria:
- [x] The Tate & Liza block asserts Solrock is fielded and Lunatone is dropped (not both).
- [x] Neither legendary (Solgaleo/Lunala) is fielded.
- [x] The gated `reverseOrderContinuity` suite passes end-to-end (RUN_DETERMINISM=1), no code change.

## Progress log

- **2026-07-20** — Investigated the failure at the owner's request. Instrumented `resolveFavourites` for
  the pinned seed 1830319788: pool keys `[UBERS,UBERS,OU,UU,RU,mega]`; Solrock=RU, Lunatone=RU, both
  Psychic-legal; chain#0 Solgaleo(LEGEND→no slot)→Solrock(RU→claims RU slot); chain#1 Lunala(LEGEND→no
  slot)→Lunatone(RU→**no free RU slot**→generic fallback). Team:
  `[SOLROCK, DEOXYS_ATTACK, MUNKIDORI, IRON_LEAVES, SLOWKING, GALLADE]`. Confirmed NOT a bug; owner
  confirmed Lunatone should be dropped. Correcting the test.

## Outcome

Corrected the two stale assertions in the "Tate & Liza dual favourite" block of
`randomizer/__tests__/integration/reverseOrderContinuity.test.js` to encode the confirmed spec: the team
has six mons with no legendary; Solrock (chain 0) claims the sole RU slot; Lunatone (same-tier second
twin) is correctly dropped. No production code changed — this was a bit-rotted test whose expectation
(both twins fielded) never matched the favourite-claim design once the twins share a tier. Gated suite
green end-to-end (19/19). Closed on green as a test-only change (nothing manually testable). No user-facing
behaviour changed, so no `CHANGELOG.brooktec.md` entry.
