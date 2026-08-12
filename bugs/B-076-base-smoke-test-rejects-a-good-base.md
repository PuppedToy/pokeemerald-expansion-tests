---
id: B-076
title: The base smoke test rejects a good base and takes the box's working base down with it
status: open            # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-12
updated: 2026-08-12
found-in: 0.9.0
fixed-in:               # version that ships the fix (set when fixed)
regression-test:        # REQUIRED to mark as fixed: path/to/test (named or annotated with this id)
links: [T-246, T-273, T-274, B-075, backend/build/golden-corpus/, .claude/skills/verify-corpus]
---

# B-076 — The base smoke test rejects a good base and takes the box's working base down with it

## Symptom

`deploy/build-base.sh` on 2026-08-12 built a **correct** base (the B-075 fix made the tree assemble again;
`gIngameTrades` came out 2100 B = 15 × 140, the client artifacts were written for base `7c5ca4dc8348…`) and
then threw it away:

```
==> smoke-test: inject one bundle into the new base
   ✗ INJECTION FAILED against the freshly built base — not installing it:
     Pipeline failed: Injection module 'trades-starters-nicknames' (T-242) failed:
       injector/tradesStartersNicknames: 'INGAME_TRADE_SEEDOT' is not a trade the base defines
```

`INGAME_TRADE_SEEDOT` does not exist anywhere in the tree: it is one of **vanilla's four** trade ids, and it
survives only inside the **frozen** golden-corpus bundles generated on 2026-08-09, before the 15-trader
rework (T-269/T-270) replaced those constants. The injector was right to refuse — the *input* was stale, not
the base.

Two defects, and the second is the expensive one:

1. **False negative.** The smoke test's bundle comes from `backend/data/golden-corpus/*.bundle.json`, which is
   deliberately frozen (T-230, for byte-identity checks). Any change to an injected table's schema makes those
   bundles reject a perfectly good base.
2. **The rejection is destructive.** The script installs into `base/` *before* smoke-testing, so its failure
   path (`mv base base-rejected-<ts>`) leaves the box with **no base at all** — the worker holds every build.
   The previous working base is already gone at that point, overwritten by the `cp -f` of the install step, so
   there is nothing to fall back to. Production went from "stale base" to "no base" on a false alarm.

A third thing, found while validating by hand: generating a bundle **mutates** `src/` and `include/`
(`include/constants/tms_hms.h`, `src/randomizer_picks.c`), and injection then refuses because the base's own
sources are modified. Any smoke step that generates its own bundle must `git checkout -- src/ include/
data/maps/` before injecting.

### Second occurrence — 2026-08-12, the T-274 deploy

It happened again, the same way, because the fix below is not implemented yet. `deploy/build-base.sh`
compiled a correct base for T-274 (`gRandomizerSettings` came out **28 B** — the five new fields at their
offsets), wrote its offset map and client artifacts, and then the smoke test failed on the same stale
`INGAME_TRADE_SEEDOT` and moved the whole thing to `base-rejected-20260812-103029`. Production went from
"app newer than base" to **no base at all** for ~6 minutes.

Recovery, for the record (it is the manual version of the fix below):

1. `generate.mjs baseline` on the box → a bundle from the current pipeline.
2. It dirtied `include/constants/tms_hms.h` + `src/randomizer_picks.c`, exactly as noted above; restored
   them by rsyncing the committed copies before injecting.
3. Re-ran the *same* smoke inject against the rejected artifacts **without touching `base/`**, using
   `INJECT_BASE_ROM` / `INJECT_BASE_MAP` / `INJECT_BASE_SYM` (make.js already supports them — that is the
   staging hook the fix needs, no new flag required). Result: `✓ Injected 5 module(s)`,
   `in-game trades: 15 of 15`, `settings: … / 1 / 8 / 150 / 3 / 150`.
4. Promoted the proven base back to `base/`, hand-wrote `BASE_BUILD.json` with the same values
   `build-base.sh` would have stamped, restarted the app, and confirmed `base-state.mjs` reports in-sync.

**Collateral to undo:** step 1 regenerated `baseline.bundle.json` **in place**, so that frozen golden-master
input is no longer the 2026-07-28 one. The corpus needed a re-freeze anyway (T-274 changes the ROM on
purpose), but the freeze must now cover all seven bundles, and the fix below should generate into a scratch
`CORPUS_OUT` so a smoke test can never overwrite a frozen input again.

## Root cause

Order and input. `build-base.sh` proves the base *after* publishing it, using a fixed input whose schema is
pinned to an older build of the game. Both are fine while no injected table changes shape; the trader rework
changed one, and the two assumptions failed together.

The frozen corpus is not at fault: its purpose (ADR/T-230) is byte-identity of `build(frozen_bundle)` for a
**fixed** base, which a base rebuild voids by definition. It is the wrong tool for "can this new base be
injected into at all".

## Fix

Not yet implemented — the base was validated and installed by hand on 2026-08-12 (see T-273's log) so
production would stop holding builds. What the script should do:

- **Stage, prove, then swap.** Build into `base-staging/`, run the smoke test against *that*, and only then
  swap it into `base/`, keeping the outgoing one as `base-previous/` for one generation. A failed smoke test
  must leave the running base untouched.
- **Smoke-test with a bundle from the current pipeline**, generated into a scratch dir
  (`CORPUS_OUT=… generate.mjs baseline`), followed by `git checkout -- src/ include/ data/maps/` before
  injecting. Keep the frozen corpus for what it is for.
- Note in the same change that `.claude/skills/verify-corpus` inherits the first defect: its bundles cannot
  inject into a post-rework base either, so the corpus needs a documented re-freeze after a schema change.

Regression test: the guard has to be structural (no toolchain, no box), asserting the script's order — smoke
test before install, bundle not sourced from `golden-corpus/`, sources restored before injecting — in the
style of `scripts/__tests__/asm-duplicate-labels.test.mjs`, plus a unit test of the staging/swap helper if the
logic moves into Node.
