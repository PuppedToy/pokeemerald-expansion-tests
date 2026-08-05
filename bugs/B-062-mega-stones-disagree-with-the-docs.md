---
id: B-062
title: The mega stone on the ground is not the one the documentation promised
status: fixed
severity: critical
created: 2026-08-05
updated: 2026-08-05
found-in: 0.8.0
fixed-in: 0.8.0
regression-test: randomizer/__tests__/unit/megaAssignment.test.js
links: [T-251, B-060]
---

# B-062 — The mega stone on the ground is not the one the documentation promised

## Symptom

Reported from the presentation run (`bundle-735016030`, `wildEncounterType: classic`): the Jagged Pass
mega-stone ball is documented as **Pidgeotite** and hands over **Scizorite**.

It is not one ball. Measured across that run's 21 mega trainers: **0 of 21** matched. Every stone was
shifted by exactly two positions — the whole queue was off by one per bad entry.

The other bundle in use (`bundle-2653882998`, `deterministic`) matched 21/21, which is why this went
unnoticed: it depends on *which* pokemon a run finds, not on the encounter mode.

Reproduce (before the fix): assign the stones from a bundle's `wild.foundMegaEvos` +
`trainers.trainersData` and compare each mega trainer's stone with `docs.viewerTrainers[trainer].reward`.

## Root cause

`foundMegaEvos[].level` is the sort key that decides which mega trainer hands out which stone. It was
built as `Math.max(levelFound, Number(evolveLevel))` where `evolveLevel` came from the pre-evolution's
`evolutions[].param` (`randomizer/modules/wildModule.js`).

`param` is only a level for a `LEVEL` evolution. When the base form evolves by ITEM — **Scyther → Scizor**
(stone) and **Kirlia → Gallade** (Dawn Stone) — `param` is an item constant, so `Number(param)` is `NaN`
and the level with it. That is the whole cause; the level was quietly NaN for those two megas.

The damage is done by serialization. **JSON has no NaN**: `JSON.stringify` writes `null`. So the two ends
of the pipeline sorted different values with the same comparator:

| | value it sorted | `a.level - b.level` | where the entry landed |
|---|---|---|---|
| browser (wrote the docs, in memory) | `NaN` | `NaN` → treated as *equal* | left roughly in place |
| ROM builder (read the bundle back) | `null` | `null - 29 = -29` → **0** | jumped to the **front** |

Two entries jumping to the front of the queue shifts every stone after them, which is exactly the
observed off-by-two.

Nothing caught it because the rule was written out **three times** — `randomizer/writer.js`,
`randomizer/writerDocs.js` and `randomizer/injector/modules/megaMapItems.js`. All three agreed as *code*;
they disagreed on the *data*, because only one of them lives on the far side of a `JSON.stringify`.

## Fix

Both the cause and the amplifier, in T-251:

1. **Cause** — `megaBaseFormLevel()` in `randomizer/modules/wildModule.js` replaces the inline
   `Math.max(levelFound, Number(param))`. It can no longer return a non-finite level: a non-LEVEL
   evolution uses its `minLevel` (the level it becomes reachable at), falling back to the default
   evolution level. New runs never write a NaN level again.
2. **Amplifier** — the assignment rule now has one home, `randomizer/megaAssignment.js`, called by all
   three sites. Its `megaEvoLevel()` reads a serialized `null` back as the `NaN` it was, so a bundle
   generated *before* this fix still builds the ROM its own documentation describes.

Regression tests (both written first, both verified failing before the fix):

- `randomizer/__tests__/unit/megaEvoLevel.test.js` — the level is always finite, whatever the evolution
  method.
- `randomizer/__tests__/unit/megaAssignment.test.js` — a NaN level and its serialized `null` produce the
  same assignment; the rule itself (order, hiding, exhaustion) is pinned.

Verified end to end against both real bundles: 21/21 mega stones match the documentation in each, and the
built ROMs' object-event tables were read back to confirm the bytes.
