---
id: T-142
title: Doubles support delivery — hard-pick a support-capable mon (like gimmick setters)
status: in-progress
type: fix
created: 2026-07-15
updated: 2026-07-15
target-version: 0.8.0
links: [T-141, T-109]
---

# T-142 — Doubles support delivery — hard-pick a support-capable mon

## Context

Owner found (run-2709645655, Drake lvl 76 doubles): the team crystallised `redirection_support` but
fielded **zero** redirectors (Kartana/Abomasnow labelled redirection_support deliver weather, not
redirection). Redirection moves are near-absent across the whole bundle (Follow Me 17, Rage Powder 14).
And `dedicatedSupport` doesn't turn a picked mon into a real support with support moves.

Root cause — two-level failure:
1. **No hard-pick for support roles.** Only weather/TR/electric GIMMICKS hard-pick a capable mon;
   `dedicatedSupport`/`redirector` are SOFT bias only, so across a 60-120-mon tier pool the rare
   support mon is out-weighted by high-rated attackers and never forced in.
2. **`planMemberRoleMove` can only add a role move to a mon that already CAN learn it**
   (`speciesFeats.has(role)`). None of Drake's picked mons learn Follow Me/Rage Powder → redirection is
   never injected. Drake is Grass-themed this run and **Amoonguss (Grass + Rage Powder) was in his pool**
   but lost to the soft bias.

## Plan

Do what the gimmicks do (owner: "hacer como con los gimmicks… buscar pokemon capaces de aportar eso"):
- **Hard-pick a dedicated-support-capable mon** in `archetypePicker` when the emerged identity has a
  `dedicatedSupport` slot (min ≥ 1) and the team lacks one — mirroring the gimmick setter hard-pick
  (filter candidates to `DETECTORS.dedicatedSupport`, weighted by fit). Fires after the gimmick
  hard-picks; doubles-only (the slot only exists in doubles.json) → singles byte-identical.
- The existing `planMemberRoleMove` then injects the support MOVE (Rage Powder / Follow Me / Wide Guard)
  onto the now-capable mon (it has the feature, so the refine fires).

Acceptance criteria:
- [ ] A doubles support archetype that emerges with a support-capable mon in the pool actually FIELDS a
      dedicated support (regression/unit test on the picker hard-pick).
- [ ] The support mon carries a real support move (redirection etc.) via the refine.
- [ ] Singles byte-identical (determinism gates); fast suite green.
- [ ] Verified on a regen: Drake-like doubles bosses field a redirector when the pool allows.

## Progress log

- **2026-07-15** — Task created from owner review of run-2709645655. Root cause traced to the missing
  support hard-pick + the capability-gated move refine.
- **2026-07-15 — implemented (TDD).** Added the dedicated-support HARD-PICK to `archetypePicker` (mirrors
  the gimmick setter hard-pick): when a doubles identity carries a `dedicatedSupport` slot (min ≥ 1) and
  the team lacks one, restrict the pick to `DETECTORS.dedicatedSupport` candidates (weighted by fit).
  Runs after the gimmick hard-picks; doubles-only via the slot's existence → singles byte-identical.
  +3 picker tests (forces the support mon; stops once satisfied; singles unaffected).
  - **End-to-end verification on the REAL rated pokedex (seed 2709645655):** Amoonguss →
    `dedicatedSupport=Y`, and `planMemberRoleMove` (redirection_support identity) returns
    **MOVE_RAGE_POWDER**; Clefable → Y → Follow Me. So a Grass-themed Drake now hard-picks Amoonguss AND
    gives it Rage Powder — the exact redirector that was missing. (Togekiss stays a partial-support
    attacker by the offense rule, but still receives Follow Me if picked; Cresselia is a TR pivot, not a
    redirector — correctly no redirection move.)
  - **Verified:** fast suite 1110 green; determinism gates re-running (singles byte-identical expected).

## Outcome
Doubles support archetypes now FIELD a dedicated support (hard-pick) that actually carries its support
move (refine). Awaiting owner manual test.
