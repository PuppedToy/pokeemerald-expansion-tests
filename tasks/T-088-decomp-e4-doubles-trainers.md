---
id: T-088
title: Add committed E4 doubles trainer constants + base .party entries (Run & Bun)
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, T-084]
blocked-by: [T-084]
---

# T-088 — Add committed E4 doubles trainer constants + base .party entries (Run & Bun)

## Context

Run & Bun needs each E4 member to have both a singles team and a separate doubles team, launched by
player choice. Per ADR-014 we implement this with **duplicate committed trainer IDs** (the doubles
flag rides on trainer data at `src/battle_main.c:526-539`, so a distinct id flagged
`Double Battle: Yes` is the clean path — no engine patch). This is a permanent decomp/data change
(new enum entries + base `.party` blocks), unlike the per-run mutated files.

## Plan

- Add new trainer constants for the four E4 members' doubles variants (e.g.
  `TRAINER_SIDNEY_DOUBLES`, `TRAINER_PHOEBE_DOUBLES`, `TRAINER_GLACIA_DOUBLES`,
  `TRAINER_DRAKE_DOUBLES`) in the decomp trainer enum (`include/constants/opponents.h`).
- Add matching base entries in `src/data/trainers.party`, flagged `Double Battle: Yes`, with a
  placeholder team (the randomizer fills the real team each run). Champion is out of scope (always
  majority type, single team).
- Confirm the count/order constraints of the trainer table still compile (this is verified in CI /
  on the builder — there is no local GBA toolchain).
- Note: `src/data/trainers.party` is on the never-commit *mutated* list, but these **base** entries
  are the committed source the pipeline mutates; document the distinction in the task log.

Acceptance criteria:
- [ ] Four `TRAINER_*_DOUBLES` E4 constants exist and are referenced by base `.party` entries.
- [ ] The new entries are flagged `Double Battle: Yes` and carry a valid placeholder team.
- [ ] The project compiles in CI / on the builder with the new trainers.
- [ ] The randomizer team-fill seam (T-089) can address the new IDs.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Note: C/data change — behaviour is verified via CI (`build.yml`)
  or on the builder machine, not locally (no GBA toolchain here).

## Outcome

<!-- Filled when closing. -->
