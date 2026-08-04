---
id: T-250
title: "Cut ~4 s/ROM: the .map parser re-sorts each section's symbols once per symbol"
status: proposed
type: fix
created: 2026-08-04
updated: 2026-08-04
target-version: 0.7.0
links: [T-245, T-249, randomizer/injector/symbolMap.js, docs/rom-build-performance.md]
blocked-by: []
---

# T-250 — Quadratic symbol sizing in the `.map` parser

## Context

Found while measuring inject latency for [T-245](T-245-base-injection-etas-queue-simplification.md), not
looked for. Profiling one injection (local, M-series Mac, `baseline` corpus bundle):

| step | time |
|---|---|
| read the 32 MB base ROM | 6 ms |
| **parse `base/pokeemerald.map`** (48,406 symbols) | **4,146 ms** |
| parse `base/pokeemerald.sym` (87,908 symbols) | 74 ms |
| merge the two | 44 ms |
| read + `JSON.parse` the 19 MB bundle | 91 ms |

The `.sym` parser handles **1.8× more symbols 56× faster**, which is what makes this a defect rather than a
cost: nothing about a linker map is inherently slow to read. Total inject time for that bundle is ~7.7 s
locally and ~16.5 s on the box, so this single step is **over half of it** (and the box is ~2× slower, so
plausibly ~8 s there — to be measured, not assumed).

Cause, in `parseMapFile`'s size-computation loop (`randomizer/injector/symbolMap.js`): for **each** symbol
it copies and sorts that symbol's whole section symbol list, then `findIndex`es itself in it, to find the
next symbol's address.

```js
for (const entry of rawSymbols) {
    const sorted = sec.symbols.slice().sort((a, b) => a.addr - b.addr);  // per symbol
    const idx = sorted.findIndex(s => s === entry);                      // per symbol
```

For a section with k symbols that is O(k² log k). `.text` sections carry thousands.

## Plan

Sort each section's symbol list **once**, then walk it, taking each symbol's `end` from its successor (and
the last one's from `section.vma + section.size`) — the same values, computed once.

This must not change a single byte of output, and that is cheaply provable: same base + same bundle → same
sha256 (the T-244 baseline for `baseline.bundle.json` is `3f71cf9b018546fcfe450e74556d464a4961a19a274c1e9fef1c1b4386db89dc`),
plus the parsed symbol table (count, addresses, sizes) must be identical before and after.

Then re-measure on the box and update `AVG_ROM_SECS`'s default in `backend/produce/eta.js` (currently 17 s,
measured with this bug present) and the numbers in
[ADR-024](../docs/adr/ADR-024-single-fifo-build-queue.md) / [rom-build-performance.md](../docs/rom-build-performance.md).

Acceptance criteria:
- [ ] `.map` parse time is proportional to the `.sym` parse (same order of magnitude, ~100 ms).
- [ ] Byte-identical output: sha256 of an injected corpus ROM unchanged, and the parsed symbol table
      (names, addrs, sizes, romOffsets) identical before/after.
- [ ] Re-measured per-ROM inject time on the box; `eta.js` default and the docs updated to match.
- [ ] `cd randomizer && npm test` green.

## Progress log

- **2026-08-04** — Created from the T-245 measurement. Not fixed there: T-245's deliverable was the queue
  and an ETA that matches the code as shipped, and an injector change needs its own byte-identity proof.
  Related: [[T-249]] would avoid this parse entirely in the browser by shipping the precomputed
  `base-offsets.json`, so the two overlap but neither blocks the other.

## Outcome
