---
id: T-136
title: Emergent weather on non-dedicated teams + un-force Flannery's sun
status: done
type: feature
created: 2026-07-14
updated: 2026-07-14
target-version: 0.8.0
links: [T-132, T-135]
blocked-by: []
---

# T-136 — Emergent weather on non-dedicated teams

## Context

Owner review (2026-07-14) of bundle run-2920625670:

1. **Flannery** was force-seeded to sun (`WEATHER_SUN`), but with type mutation her Fire pool often can't
   field a sun setter + 2 abusers, so the old seed just fell back to another weather anyway. The owner
   liked that a Fire leader could end up on a different weather but wants it **not forced**: "quitar que
   flannery fuerce sol. Si le sale natural con su torkoal genial pero que no lo fuerce."
2. **Non-dedicated teams never build weather.** Juan (unseeded) rolled Kyogre and was tagged `+weather`
   but never rolled abusers deliberately (no ranking list); Robert rolled Politoed (Drizzle) with **no
   report of a weather attempt at all**. The owner: "si un entrenador rollea gimmick randomly intente hacer
   equipo de gimmick con abusers... puede que no estemos haciendo bien ese algoritmo de asignación dinámica
   en equipos no dedicados."

Root cause (verified): the weather machinery (setter hard-pick + ranked abusers + hold/drop + log) fires
only from a `seed`. An unseeded trainer runs a single plain attempt (`gimmickFallbackChain(null) = [null]`),
so nothing builds weather. The `+weather` on Juan is a POST-HOC crystallization label for the log, computed
on the finished team — the picker never pursued it (the gimmick crystallizes from FIT, which needs the
weather mons already present → chicken-and-egg → too late to hard-build abusers). Robert's Politoed never
even crystallized (too few rain mons), so zero attempt, zero log.

## Plan

**Setter-triggered emergent weather (probe-then-commit).** Reuse the seeded machinery, don't duplicate it.

1. Remove Flannery's `WEATHER_SUN` seed → fully emergent.
2. In `resolveTrainerTeam`: after the committed plain build, if the trainer had **no weather intent of its
   own** (not weather-seeded/committed, not a tag abuse-partner), is **sophisticated enough**
   (`soph ≥ EMERGENT_WEATHER_MIN_SOPH = 0.35`, owner-chosen), and its plain team **fielded a natural
   setter** (`teamWeather != null`) → re-run as a weather attempt with a synthetic
   `{ base, gimmicks:['weather'], weather:<detected>, emergent:true }` seed (isolated state, per-slot
   reseed → deterministic, ADR-017). Commit the weather build **iff it holds** (setter + 2 abusers); else
   keep the plain team and annotate its trace so the log reports "weather considered → dropped".
3. Pure decision helper `emergentWeatherSubtype()` (gimmickPlan) — unit-tested (the trigger is the only new
   logic; the build reuses tested machinery). Log: `seed: none → emergent <subtype>` + an
   `emergentWeatherDropped` line.

Acceptance criteria:
- [x] Flannery is no longer force-seeded; she builds sun ONLY when she naturally rolls a setter.
- [x] An unseeded soph-≥0.35 trainer that rolls a setter builds that weather (setter + 2 ranked abusers)
      with the abuser ranking shown in the log, OR drops it with a logged reason.
- [x] Below 0.35, a fluke setter builds nothing (early game unchanged).
- [x] Deterministic; `cd randomizer && npm test` + determinism/continuity gates green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-14** — Task created from owner review. Diagnosis confirmed in code (weather machinery is
  seed-driven; unseeded = one plain attempt; `+weather` is a post-hoc label). Owner chose the soph gate =
  **0.35** ("Media"). Implemented Path A (probe-then-commit):
  - `emergentWeatherSubtype()` pure helper + `EMERGENT_WEATHER_MIN_SOPH` (weatherConstants); 7 unit tests
    (Red→Green).
  - `resolveTrainerTeam`: extracted `tryVariant()`, tracked a mutable `committedSeed`, added the emergent
    probe (re-run + commit-if-holds, else annotate `emergentWeatherDropped`).
  - teamAudit: `seed: none → emergent <subtype>` in seedStr; an `emergentWeatherDropped` render line.
  - Removed Flannery's `WEATHER_SUN` seed.
  - **Verified (seed 2920625670):** Flannery → `none → emergent sun` (rolled Torkoal → Fire-STAB sun team);
    Robert → `none → emergent rain` (Politoed + Ludicolo/Golduck/Gorebyss); Juan → `none → emergent rain`
    (Kyogre + water abusers, ranking now shown); Maxie (seeded) unchanged. `npm test` 1034; determinism +
    continuity gates 17/17.
  - NOTE for the owner's regen review: Flannery's sun abusers are all Fire-STAB (no Chlorophyll) — correct
    for a Fire-restricted pool. The rank-13 abuser pick at soph 0.6 is the SAME soph-pull tuning question
    reserved under T-135, not a T-136 issue.

## Outcome

Shipped as planned (Path A, probe-then-commit). A non-dedicated trainer at `soph ≥ 0.35` that rolls a
natural weather setter re-runs a synthetic `emergent` weather attempt and commits it iff it holds (setter +
2 ranked abusers), else keeps the plain team and logs the drop. Flannery de-seeded → fully emergent.
Owner reviewed the regenerated decision log for seed 2920625670 (Flannery → emergent sun via Torkoal;
Robert/Juan → emergent rain with abuser rankings; Maxie seeded path unchanged) and accepted on 2026-07-14.

Deviations: none. No move-setter (`ensureMoveSetter`) surprises observed — the trigger requires a natural
setter, which the re-run re-picks; the move-setter safety net only fills if the ability-setter doesn't
survive re-picking.

Follow-up (NOT part of T-136): the soph-pull can still let a mid-ranked abuser win at soph ~0.6 (Flannery's
rank-13 pick). That tuning (`rankSharpness` / top-K restriction) is the open question reserved under
**T-135**, which stays `in-progress` for the owner's regen-and-tune pass.
