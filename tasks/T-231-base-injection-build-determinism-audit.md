---
id: T-231
title: "Base+injection Phase 1 — build determinism audit (GATE-2) + canonical comparison"
status: done
type: chore
created: 2026-07-27
updated: 2026-07-28
target-version: 0.7.0
links: [T-229, T-230, docs/base-plus-injection-strategy.md]
blocked-by: [T-230]
---

# T-231 — Build determinism audit (GATE-2)

## Context
"Exactly the same" is only measurable if `compile(bundle)` is byte-reproducible. GATE-2 in the
[strategy](../docs/base-plus-injection-strategy.md#gono-go-gates). GBA builds can embed timestamps/build-ids.

## Plan
Build the same corpus bundle twice and diff the ROMs. If identical → whole-ROM byte compare is the
invariant. If not → identify the volatile bytes and define the **canonical comparison** (compare data
regions from the `.map`, or strip/mask the volatile ranges) used by the verification harness (T-233).

Acceptance criteria:
- [x] Determinism result documented: **fully byte-reproducible** (no volatile bytes) — see log.
- [x] Canonical comparison specified: **whole-ROM sha256** (no masking/region logic needed) for T-233.
- [x] Bundle-level confirmation: built a frozen production bundle (a504a9f2) twice with `--full-rom`
      (clean tree between builds) → **identical sha256 `04731953a1da5a08…f326c3b07`**. `build(frozen_bundle)`
      is byte-deterministic (make.js seeds the build-time RNG — items/TMs/rewards — from the bundle, make.js:96-106).

## Progress log
- **2026-07-27** — Created (Phase 1).
- **2026-07-27** — Ran the determinism test on PRO (base source, `deploy-app-1`): four builds — incremental
  (A), relink-only from the same objects (B), and **two independent `make clean && make -j2` rebuilds
  (C, D)** — all produced the **identical sha256 `fb34f4b9169a6d78421ab7975604d41a01b5a9ec048c43e8bf3144735e8db5a4`**.
  **GATE-2 = GREEN, best case:** A==B==C==D. The `-flto=auto` non-determinism risk did **not** materialize
  (LTO link is deterministic on the 2-core box); clean rebuilds are bit-identical. **Canonical comparison =
  whole-ROM sha256** — no volatile-byte masking needed. This makes INV-BYTES (Phase 3) a simple hash equality
  `sha256(inject(base,bundle)) == sha256(compile(bundle))`, and the golden master (T-230) a stable set of
  hashes. Caveat: determinism is guaranteed on the **same builder/toolchain/core-count**; a different
  environment could partition LTO differently — so always build the golden master and the verification runs
  on the same PRO box (which is our only build env anyway).

## Outcome
**GATE-2 = GREEN (best case): the build is fully byte-reproducible.** Four base builds (incremental,
relink, two independent `make clean` rebuilds) → identical sha256; bundle-level confirmed (a504a9f2 built
twice + a corpus `baseline` rebuild → the same hash). The `-flto=auto` non-determinism risk did not
materialise on the builder. **Canonical comparison = whole-ROM sha256** (no volatile bytes, no masking), so
INV-BYTES (Phase 3) is a plain hash equality `sha256(inject)==sha256(compile)` and the golden master (T-230)
is a set of hashes. Caveat: holds only on the same builder/toolchain/core-count → build + verify on the
same PRO box (our only build env). No changelog line (internal infrastructure).
