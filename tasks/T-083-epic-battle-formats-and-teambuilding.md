---
id: T-083
title: EPIC — Battle formats (singles/doubles/mixed) + doubles-aware rating & teambuilding redesign
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [docs/adr/ADR-014.md, docs/adr/ADR-015.md, docs/adr/ADR-016.md]
blocked-by: []
---

# T-083 — EPIC — Battle formats (singles/doubles/mixed) + doubles-aware rating & teambuilding redesign

## Context

Umbrella task tracking a large, two-group epic. Group 1 makes the whole pipeline
(frontend → bundle → writer → ROM/C) aware of a global **battle format** so a run can be
generated as **singles**, **doubles**, or **mixed** (a per-pool proportion of doubles), plus a
**"League style Run & Bun"** option where each Elite Four member offers an in-game
singles-or-doubles choice. Group 2 then isolates the **value of moves/abilities/tiers in
doubles**, researches historic competitive teams, and **redesigns the teambuilding engine from
near-scratch** into an archetype-driven, sophistication-curved generator that replaces the
current fixed-slot system for both formats. See the child tasks for scope; the design lives in
ADR-014 (battle format), ADR-015 (dual rating), ADR-016 (teambuilding engine).

Owner design decisions locked at planning time (2026-07-09):
- **Run & Bun E4 doubles** → duplicate committed trainer IDs (e.g. `TRAINER_SIDNEY_DOUBLES`), no
  battle-engine patch; the doubles flag rides on trainer data.
- **Teambuilding rewrite** → hard replace of the current slot/preset engine for both formats.
- **Historic-team research** → exhaustive + adversarially verified (multi-agent workflows).
- **Mixed % semantics** → slider is **% of singles** (default 60); Run & Bun E4 split is
  `round(%singles×4)` clamped to 1–3 (always ≥1 singles and ≥1 doubles); champion always takes the
  majority type and is not counted.

## Plan

Deliver in two groups with a manual-test checkpoint after each (per the batch-and-test-together
workflow). Every child task carries its own plan and acceptance criteria.

**Group 1 — Battle formats (target 0.7.0):**
- T-084 — Design battle-format architecture + ADR-014
- T-085 — Frontend: `battleFormat` big-box setting + `singlesPercent` + Run & Bun checkbox + config forwarding
- T-086 — Randomizer: assign per-trainer battle type by pool proportions, mark it in the bundle
- T-087 — Writer: emit/rewrite the `Double Battle:` header per trainer from the bundle
- T-088 — Decomp: committed E4 doubles trainer constants + base `.party` entries
- T-089 — Randomizer: generate duplicated E4 singles+doubles teams for Run & Bun
- T-090 — ROM scripts: in-game E4 singles/doubles prompt + remaining-choices counter + build-time VAR
- T-091 — Maker: set the battle-format/Run & Bun VAR at build time + wire new bundle fields
- T-092 — Group 1 checkpoint: end-to-end ROM builds + manual test in every mode

**Group 2 — Doubles rating + teambuilding redesign (target 0.8.0):**
- 2A rating: T-093 (design + ADR-015), T-094 (spread move rating), T-095 (support/gimmick move re-valuation), T-096 (doubles ability rating), T-097 (doubles tiers)
- 2B research: T-098 (VGC doubles corpus), T-099 (Smogon singles corpus), T-100 (synergy/anti-synergy synthesis), T-101 (singles archetype JSON), T-102 (doubles archetype JSON)
- 2C engine: T-103 (design + ADR-016), T-104 (collapse dual resolver), T-105 (sophistication scalar), T-106 (backwards generation), T-107 (preference/rules system), T-108 (fixed-ID/special-case port), T-109 (doubles teambuilding path), T-110 (replace old engine + cleanup)
- 2D tiers/docs: T-111 (viewer per-format tiers), T-112 (docs), T-113 (Group 2 checkpoint)

**Deferred (target 0.9.0):** T-114 — battle AI tuned per team archetype/format.

Acceptance criteria:
- [ ] All Group 1 child tasks (T-084…T-091) done and the T-092 checkpoint passed by the owner.
- [ ] All Group 2 child tasks (T-093…T-112) done and the T-113 checkpoint passed by the owner.
- [ ] ADR-014, ADR-015, ADR-016 written and accepted; `docs/INDEX.md` updated.
- [ ] Singles output is verified not worse than the pre-epic baseline (owner review at each checkpoint).
- [ ] `cd randomizer && npm test` green and frontend `node --test` green at every group boundary.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Epic created after a six-subsystem read-only exploration (frontend/settings,
  bundle/maker/writer, teambuilding, move/ability/tier rating, C-side battle types, tracker
  conventions). Key confirmed facts driving the plan: the `.party` format + C `battleType` struct
  already support doubles with no C change for basic flagging (`src/battle_main.c:526-539`), but the
  writer preserves trainer headers verbatim and the bundle carries no battle-type today;
  `move.target` is already parsed and `statusList` already parks the doubles-support moves low, so a
  parallel doubles rating slots in cleanly; teambuilding is a fixed-slot table (`trainers.js` +
  `presets.js`) with a duplicated `writer.js`/`writerDocs.js` resolver that must be unified. Four
  owner design decisions recorded above. Child tasks T-084…T-114 created as `proposed`.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned. -->
