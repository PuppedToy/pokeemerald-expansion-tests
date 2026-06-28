---
id: B-009
title: Deploy rsyncs host-compiled decomp tool binaries, breaking make on the Linux box
status: fixed
severity: major
created: 2026-06-28
updated: 2026-06-28
found-in: 0.3.0
fixed-in: 0.4.0
regression-test: backend/__tests__/deploy-env.test.js
links: [T-031, B-008]
---

# B-009 — Deploy rsyncs host-compiled decomp tool binaries, breaking make on the Linux box

## Symptom

After a deploy, every real ROM build failed at the start of `make`:

```
bash: line 1: tools/mapjson/mapjson: cannot execute binary file: Exec format error
make: *** [map_data_rules.mk:32: include/constants/map_groups.h] Error 126
```

Combined with [B-008](B-008-build-failure-crashes-worker-crashloop.md), this took the whole site down.

## Root cause

`deploy/update.sh` deploys by `rsync` of the **working tree** (to mirror gitignored runtime assets
like `frontend/data/sprites.json`). That tree also contains the decomp tool binaries under
`tools/*/` (`mapjson`, `preproc`, `gbagfx`, …) compiled for the **developer's OS (macOS/arm64)**.
rsync overwrote the box's Linux binaries with the macOS ones, so `make` on the Linux box could not
execute them → "Exec format error" → build dies. (`make tools` alone would not fix it: rsync leaves
the host binary with a fresh mtime, so make considers it up to date and skips the rebuild — the
mtime trap.)

This is the same class of issue noted earlier in the session ("stale macOS tool binaries → make
clean once rebuilds for Linux"); it recurred because the deploy script itself re-introduced them
on every run.

## Fix

`deploy/update.sh` activate step now rebuilds the Linux tools after the rsync and before recreating
the app: `docker compose run --rm app sh -lc 'make clean-tools >/dev/null && make tools'`
(`clean-tools` first to defeat the mtime trap). A failed tools build aborts the deploy (fail-safe).

Regression test (`backend/__tests__/deploy-env.test.js`): "update.sh rebuilds the Linux decomp tools
after rsync, before recreate (B-009)" — asserts both `make clean-tools` and `make tools` are present
and ordered before `up -d --force-recreate`. FAILs before the fix, PASSes after.

Live recovery: rebuilt the tools by hand on the box (`make clean-tools && make tools` in a one-off
container; verified `tools/mapjson/mapjson` is now ELF) before the script fix shipped.
