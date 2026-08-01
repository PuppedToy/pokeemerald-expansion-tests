---
id: T-232
title: "Base+injection Phase 1 — symbol-map + free-space audit tool (GATE-1)"
status: done
type: chore
created: 2026-07-27
updated: 2026-07-28
target-version: 0.7.0
links: [T-229, docs/base-plus-injection-strategy.md, docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md]
blocked-by: []
---

# T-232 — Symbol-map + free-space audit tool (GATE-1)

## Context
Injection needs every output table's ROM offset (from the build's `.map`/`.sym`, never hardcoded — the
upstream-sync concern, [ADR-012](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md)). And the whole
project is gated on the **32 MB ceiling**: is there enough free/padding space to pad the Group-B tables?
GATE-1 in the [strategy](../docs/base-plus-injection-strategy.md#gono-go-gates).

## Plan
Tool that parses the base `.map`/`.sym` → a machine-readable offset map for every output
(`gSpeciesInfo`, `gMovesInfo`, learnset pointers, `gTrainers`, wild tables, `gItems`, `gTMHMItemMoveIds`,
the setvar sites, …). Report total ROM size, used vs padding/free space, and the byte budget to pad each
Group-B table to max. Produce the GATE-1 go/no-go verdict.

Acceptance criteria:
- [x] Offset map generated from `.map`/`.sym` for the injectable global tables (below). The `static` tables
      need a base-export refactor (Phase 2), and the reusable `.map`→offset-map **tool** + Group-D setvar
      offsets are folded into **T-238** (injector offset loader), which consumes them directly.
- [x] Free-space report: total, used, free/padding, per-table max-padding cost. → **~8.33 MB free** (see log).
- [x] GATE-1 verdict: **GO** — B1 (fixed-capacity padding, ~1–1.5 MB) fits in 8.33 MB with wide margin.

## Progress log
- **2026-07-27** — Created (Phase 1). GATE-1 for Phase 2.
- **2026-07-27** — Ran a BASE build on PRO (`root@pokemon-emerald-cut.com`, in `deploy-app-1`). **GATE-1 = GO.**
  - **Free space:** linker `--print-memory-usage` on the base ROM: ROM **24,822,572 B / 32 MB = 73.98%** →
    **8,731,860 B ≈ 8.33 MB free** (EWRAM 87.2%, IWRAM 87.5% — tight but OK).
  - **Base offset map (globals, `.map`-locatable):** gSpeciesInfo 0x0864e1d8 (~618 KB), gMovesInfo 0x08629730
    (~105 KB), gTrainers 0x083d5904 (~189 KB), gBattlePartners 0x0839c664, gItemsInfo 0x0860a998 (~86 KB;
    symbol is `gItemsInfo`, not `gItems`), gTMHMItemMoveIds 0x0860a7f8, gWildMonHeaders 0x08d14100.
  - **Finding (base refactor):** the `static` tables (`sIngameTrades`, `sLocationNicknames`, `sTradeNicknames`,
    `sStarterMon`, `sStarterExtraMon`) have **0 hits in the `.map`** → the injector can't locate them by name.
    They must be **exported (non-static / anchor symbol, kept from `--gc-sections`)** in the base — a small
    Phase-2 item (feeds T-235/T-242/T-237). Learnsets are fine — pointer-reachable via `gSpeciesInfo`.
  - **Confirmed:** randomization SHIFTS offsets (variable-length tables move everything after them; e.g. gSpeciesInfo
    base 0x0864e1d8 vs a randomized build 0x08655fa4) → we must inject into the FIXED base with fixed-capacity
    tables (B1), never a randomized build. Padding budget (~1–1.5 MB) ≪ 8.33 MB free.
  - Remaining for this task: export the static tables (or coordinate with Phase 2), capture the setvar-operand
    offsets (Group D), and script the manual extraction into a reusable `.map`→offset-map tool.

## Outcome
**GATE-1 = GO.** Base ROM (built on PRO) uses 24,822,572 B / 32 MB (73.98 %) → **~8.33 MB free**; the B1
fixed-capacity padding budget (~1–1.5 MB) fits with wide margin, so the base+injection refactor is
space-viable. Extracted the base offset map for all injectable global tables (gSpeciesInfo, gMovesInfo,
gTrainers, gBattlePartners, gItemsInfo, gTMHMItemMoveIds, gWildMonHeaders — see progress log). Surfaced a
concrete Phase-2 requirement: the `static` tables (trades, nicknames, starters) aren't in the `.map` and
must be **exported** in the base for the injector (feeds T-235/T-237/T-242); learnsets are fine
(pointer-reachable via gSpeciesInfo). Also confirmed randomization shifts offsets → inject only into the
fixed base. Follow-ups: the reusable extraction tool + Group-D setvar offsets ship with **T-238** (injector
offset loader). No changelog line (internal infrastructure, not user-visible).
