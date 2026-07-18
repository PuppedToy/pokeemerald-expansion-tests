---
id: T-149
title: Derive trainer levels from bosscaps (caps.c single source) + shift caps rival→Tabitha +1
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [src/caps.c, randomizer/bossCaps.js, randomizer/trainers.js, randomizer/modules/pokedexModule.js, T-148]
blocked-by: []
---

# T-149 — Derive trainer levels from bosscaps + shift caps rival→Tabitha +1

## Context

Every trainer's `level` is hard-coded in `trainers.js` (202 of them). That is fragile: a
trainer's level really tracks its segment's boss cap, so bumping a cap silently desyncs the
trainers that were tuned to it. Owner wants trainer levels **derived from the boss caps**
(caps.c = single source), then a **+1 shift** applied to the caps rival→Tabitha.

Finding: every distinct trainer level maps exactly to a bossCap level except one orphan,
`level: 33` = `TRAINER_MAXIE_MT_CHIMNEY` (de-capped in T-148). Owner decision (2026-07-18):
**remove Maxie Mt Chimney's team entirely** (he's gone), and use the **generate-via-baseData**
mechanism so caps.c stays the single source and reaches `trainers.js` browser-safely (it runs
in the browser worker, which can't read caps.c).

## Plan

**Mechanism (owner-confirmed): generate-via-baseData.** Reuse the existing boss-cap file
(`bossCaps.js`) and the existing `baseData` injection channel (parseBaseData → pokédex artifact
→ trainers module), so no duplicated cap numbers and no committed generated file.

1. `bossCaps.js` — add `capLevelMap(capsCText)` → `{ flag: level }` (reuses `parseLevelCaps`).
2. `pokedexModule.js` `parseBaseData()` — read `src/caps.c`, add `capLevels` to `baseData`
   (auto-baked into `base-data.json` by `build.js`; live in node). Stamp `capLevels` onto the
   pokédex artifact in `runPokedexModule`.
3. `trainers.js` — a `CAP` alias map (short name → flag; the cap *identity*, ~31 entries) and
   `getTrainersData(itemAssignments, tmList, config, capLevels)` resolves each trainer's
   `level: CAP.<name>` to a number via `capLevels`. Replace all 202 numeric `level:` with the
   matching `CAP.<name>`. `trainersModule.js` passes `pokedex.capLevels` through.
4. **Remove `TRAINER_MAXIE_MT_CHIMNEY`** (team def + its `trainerSeeds.js` entry). Inert C
   references (`opponents.h` constant + hand-maintained `sNonGymBosses[]`) are left untouched
   (valid, never fires post-T-148) and flagged.
5. `caps.c` — `+1` to the 12 caps rival→Tabitha (7→8 … 32→33); Flannery (36)+ unchanged.
   Trainers follow automatically; `bosscaps.json` regenerates.

Acceptance criteria:
- [ ] No numeric `level:` literals remain on trainer objects in `trainers.js` (all `CAP.<name>`).
- [ ] `capLevels` matches caps.c 1-to-1 (drift test); `getTrainersData` resolves every trainer level.
- [ ] Resolved levels equal caps.c values (post-shift): e.g. Roxanne-segment trainers = 13.
- [ ] `TRAINER_MAXIE_MT_CHIMNEY` absent from `trainers.js` and `trainerSeeds.js`.
- [ ] caps.c: rival→Tabitha +1 applied; sequence strictly increasing; Flannery+ untouched.
- [ ] `cd randomizer && npm test` green. Browser: `node build.js` rebuild needed; owner manual-tests.

## Progress log

- **2026-07-18** — Task created. Verified: `level` is per-trainer (202), all match a bossCap
  except Maxie(33); trainers.js doesn't import bossCaps today; `parseBaseData`→`baseData` is the
  browser-safe injection channel; `build.js` already bakes `base-data.json` + `bosscaps.json`
  from caps.c. Owner confirmed generate-via-baseData + full Maxie removal.

## Outcome

<!-- Filled when closing. -->
