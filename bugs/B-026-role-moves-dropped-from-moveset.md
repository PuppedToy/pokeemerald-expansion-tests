---
id: B-026
title: Assigned role moves (and tryToHaveMove) are dropped from the final moveset
status: open
severity: high
created: 2026-07-11
updated: 2026-07-11
found-in: Unreleased
fixed-in:
regression-test:
links: [T-107, T-118, T-122]
---

# B-026 — Role moves dropped from the final moveset

## Symptom

The 2C engine assigns a mon a role (e.g. hazard setter) and the refinement (107d) injects the role
move, but the mon does not actually run it — roles are cosmetic. Owner-spotted (Phoebe's teams);
confirmed by measurement over a real generation: the decision log recorded a hazard `roleMove` injected
for **36** high-sophistication mons, but **35** of them do NOT have that move in their final moveset.

Example: a Torchic had `MOVE_TOXIC_SPIKES` injected but resolved to `[Defog, Aerial Ace, Volt Switch,
Light Screen]`. Same for Stealth Rock / Spikes across many trainers.

## Reproduction

Run a generation with the team-audit collector; for high-soph trainers compare each slot's recorded
`roleMove` against the resolved `trainersResultsSimplified` moveset. ~97% of injected role moves are
absent. (Script: `scratchpad/verify-hazards.js`.)

## Root cause

`resolveTrainerTeam` pushes the injected role move (and `effectiveDef.tryToHaveMove`) into
`newTeamMember.moves` before `chooseMoveset` (modules/resolveTrainerTeam.js:213-232), but
`chooseMoveset` / `adjustMoveset` (rating.js) treat those as **soft preferences**, not hard-fixed
slots — so a lower-rated role move (hazards, screens) is dropped in favour of higher-rated attacks.
The whole role → move-delivery contract of the engine is therefore broken.

## Fix

Fixed under **T-122** (role-aware move selection): make the injected fixed moves hard-kept, and feed
the assigned role to move selection. Regression test must assert an injected role/fixed move survives
into the final moveset.
