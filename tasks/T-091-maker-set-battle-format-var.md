---
id: T-091
title: Maker sets the battle-format / Run & Bun VAR at build time and wires new bundle fields
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, T-087, T-090]
blocked-by: [T-087, T-090]
---

# T-091 — Maker sets the battle-format / Run & Bun VAR at build time and wires new bundle fields

## Context

The maker reads the bundle and obeys: it must preset the in-game mode + Run & Bun quota VARs
(T-090) from `bundle.config` at build time, using the writer's token-replacement mechanism (like
`writeMoney`/`writeItemPrices` in `make.js:120-155` and the script-token replacements in
`randomizer/writer.js:316-387`).

## Plan

- Compute the E4 singles/doubles quotas from `config.singlesPercent` (`round(pct/100×4)` clamped
  1–3) and the mode gate from `config.battleFormat`/`config.leagueRunAndBun`.
- In the writer, substitute the placeholder tokens injected in T-090 (mode gate + counters) into the
  E4 room `scripts.inc`, adding the new map files to the writer's mutated-file list
  (`writer.js:65-127`) if needed.
- Wire any new consumption in `make.js buildOneRom` next to the existing config-driven writers.
- Ensure `analyze.js` restore still cleans the newly mutated map files.
- Tests: given a bundle with a chosen %, the preset counters/mode gate match the expected values;
  singles/doubles/mixed-without-Run&Bun set the gate to "no prompt".

Acceptance criteria:
- [ ] Build-time VAR presets match the config (mode gate + E4 quotas) for 50/60/90/100% examples.
- [ ] Plain singles/doubles/mixed set the mode gate so no E4 prompt occurs.
- [ ] New mutated map files are restored correctly by `analyze.js`.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
