---
id: T-212
title: Remove the Mossdeep Space Center magma grunt battles
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-165, T-116, T-145]
blocked-by: []
---

# T-212 — Remove the Mossdeep Space Center magma grunt battles

## Context

On the **bottom floor (1F)** of the Mossdeep Space Center, Team Magma grunts are still trainers with battle
teams when the player talks to them. Remove their battles. This is separate from the 2F Steven-tag / Tabitha
story ([T-165](T-165-disable-steven-tag-battle.md)) and the 2F gauntlet grunts
([T-145](T-145-gauntlet-battle-accounting-and-tag.md) / [T-116](T-116-battle-tag-refinements.md)) — those are
untouched. C map-script work (**builder-only compile — not verifiable locally**).

### Findings from the current code
- **`data/maps/MossdeepCity_SpaceCenter_1F/scripts.inc`:** Grunt3 `:196-199` (battle `:197`
  `trainerbattle_single TRAINER_GRUNT_SPACE_CENTER_3`), Grunt1 `:201-204` (`:202`), Grunt4 `:206-209` (`:207`),
  Grunt2 `:211-235` (msgbox `:215`, battle `:216` `trainerbattle_no_intro TRAINER_GRUNT_SPACE_CENTER_2`, guarded
  by `FLAG_DEFEATED_GRUNT_SPACE_CENTER_1F` `:214`).
- **`data/maps/MossdeepCity_SpaceCenter_1F/map.json`:** Grunt3/1/4 are already `TRAINER_TYPE_NONE` (they only
  battle via the talk-script); Grunt2 is `TRAINER_TYPE_NORMAL` (`:135`) — triggers on line-of-sight.
- **No boss-cap impact:** the Space Center level-cap flag `FLAG_DEFEATED_MAGMA_SPACE_CENTER` is set on **2F**
  (`src/caps.c:38`), not by these 1F grunts.
- **How to disable while keeping the NPCs:** replace each `trainerbattle_*` with a plain `msgbox` (their
  existing `..._Text_GruntNPostBattle`) so talking just shows dialogue; additionally flip Grunt2
  `map.json:135` to `TRAINER_TYPE_NONE` so it no longer challenges on sight.

### Resolved during implementation
- **Keep the NPCs, remove only the fights** (owner: "quitar sus combates"). Talking to a grunt now just shows
  its dialogue, no battle.
- **Grunt2 is the stairs guard** — beating it moved it off the stairs (`copyobjectxytoperm` + `applymovement` +
  `setvar VAR_MOSSDEEP_SPACE_CENTER_STAIR_GUARD_STATE, 2`) to open the way to 2F. That step-aside logic and the
  `FLAG_DEFEATED_GRUNT_SPACE_CENTER_1F` gate are **kept** — only the `trainerbattle_no_intro` was removed — so
  talking to Grunt2 makes it step aside without a fight and 2F stays reachable (no soft-lock).

## Plan

Neutralise the four 1F grunt battles (talk → dialogue only), flip Grunt2 to `TRAINER_TYPE_NONE`, leaving the 2F
story and caps intact. Verify on a builder ROM build.

Acceptance criteria:
- [x] Talking to the 1F grunts no longer starts a battle (all four `trainerbattle*` removed); Grunt2 no longer
      challenges on sight (`map.json` `TRAINER_TYPE_NORMAL` → `TRAINER_TYPE_NONE`; 0 on-sight trainers left).
- [x] 2F Steven-tag/Tabitha flow and the Space Center level cap are unaffected — Grunt2's stair-unblock logic is
      preserved; the 2F cap flag `FLAG_DEFEATED_MAGMA_SPACE_CENTER` (`caps.c:38`) is untouched.
- [ ] Verified on a builder ROM build; logged in this task. **Builder-only — cannot compile locally.**

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Located the four 1F grunt battles
  (`MossdeepCity_SpaceCenter_1F/scripts.inc:197/202/207/216`) and Grunt2's on-sight `TRAINER_TYPE_NORMAL`
  (`map.json:135`); confirmed no boss-cap impact (cap flag set on 2F, `caps.c:38`). Captured the keep-NPC vs
  remove-grunt and story-flag open questions.
- **2026-07-26** — **Implemented (in-progress).** Removed all four grunt battles: the three simple grunts
  (1/3/4) drop their `trainerbattle_single` (talking now shows their existing dialogue), and Grunt2 drops its
  `trainerbattle_no_intro` while keeping the intro msgbox + the stair-guard step-aside logic that opens 2F.
  Flipped Grunt2's `map.json` object to `TRAINER_TYPE_NONE` so it no longer challenges on sight. Verified: no
  grunt `trainerbattle` remains, Grunt2's `setflag`/`copyobjectxytoperm`/`applymovement`/`STAIR_GUARD_STATE`
  chain is intact, `map.json` parses and has 0 remaining `TRAINER_TYPE_NORMAL` objects. **Builder-only — decomp
  map change, needs an in-game compile check** (talk to the grunts → no battle; talk to the stair guard → it
  steps aside and 2F is reachable).

## Outcome

<!-- Filled when closing. -->
