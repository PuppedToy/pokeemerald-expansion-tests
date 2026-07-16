---
id: T-137
title: Electric terrain + Trick Room as corpus-grounded gimmicks (rating + emergent), migrate Wattson
status: done
type: feature
created: 2026-07-14
updated: 2026-07-14
target-version: 0.8.0
links: [T-124, T-135, T-136, docs/research/]
blocked-by: []
---

# T-137 — Electric terrain gimmick + emergent building

## Context

Owner review (2026-07-14): Drake (endgame, soph 0.97) leads with **Miraidon** (Hadron Engine → sets Electric
Terrain), yet nothing builds a terrain team around it and no "considered → dropped" appears in the log.

Root cause: electric terrain is NOT a modelled gimmick. It only exists as **Wattson's manual overlay**
(`archetypeSeed.electricTerrain: true` → the picker HARD-prefers Electric-type mons, `archetypePicker.js`),
with no setter + abusers success condition, no rollback, and no emergent detection. The emergent-weather
machinery (T-136) only recognises weather setters. So a terrain setter that a non-dedicated trainer rolls
(Miraidon/Hadron Engine, Electric Surge) does nothing — unlike a rolled Drizzle/Drought (T-136).

## Scope (owner, 2026-07-14)

**Electric terrain AND Trick Room now**, both **grounded in the research corpus + real competitive teams**
(not my heuristics — see `docs/research/`, mirroring how `weather.md` was corpus-derived). **Migrate Wattson**
(electric terrain) — and Tate & Liza already run the trick_room gimmick. The other 3 terrains (Grassy/Psychic/
Misty) and any further gimmicks are a separate long-term future task.

RESEARCH FIRST (analysis-first): consult the corpus for electric-terrain and Trick Room team composition —
what the setters/abusers actually are on winning teams — and validate the abuser models with the owner BEFORE
coding. Trick Room is already a partial gimmick (seed + slow-mon pull + Room Service, T-124/125); it needs the
T-135 abuser-quality rating + emergent detection. Electric terrain is built from scratch.

## Plan (pending owner validation of the corpus-grounded abuser models)

Model electric terrain as a first-class gimmick, MIRRORING weather (reuse the T-131/132/135/136 shapes):

1. **Setters:** `ELECTRIC_SURGE`, `HADRON_ENGINE` (abilities) + `MOVE_ELECTRIC_TERRAIN` (move-setter).
2. **Abusers (mirror the weather abuser model):**
   - `SURGE_SURFER` — ×2 Speed in electric terrain (the "Swift Swim" → speed-scaled).
   - `QUARK_DRIVE` — Paradox best-stat boost in electric terrain (the "Protosynthesis" → best-stat-scaled;
     dual-value like Protosynthesis, so not zeroed off-terrain).
   - an **Electric-type** with a decent attacking stat — Electric moves ×1.3 when grounded (boosted STAB).
   - carries a terrain-synergy move (`MOVE_RISING_VOLTAGE`, maybe `MOVE_TERRAIN_PULSE`) — synergy.
   - Electric Seed = the defensive payoff (already forward-assigned by T-125).
3. **Success condition + rollback:** setter + N abusers (reuse `weatherHolds`-style logic, ADR-017 fallback).
4. **Emergent detection:** extend T-136 — a non-dedicated soph-≥gate trainer that rolls a terrain setter tries
   to build electric terrain or drops it (logged), exactly like emergent weather.
5. **Abuse rating (T-135):** extend the detailed weather-abuse rating to electric terrain (Surge Surfer ∝
   speed, Quark Drive ∝ best stat, Electric STAB, synergy) so abuser QUALITY is ranked the same way.
6. **Wattson:** optionally migrate from the manual overlay to this gimmick model (consistency) — or leave.

Acceptance criteria (draft):
- [ ] A non-dedicated trainer that rolls an electric-terrain setter builds it (setter + abusers) or drops it
      with a logged reason, mirroring T-136.
- [ ] Electric-terrain abusers are ranked by quality (Surge Surfer / Quark Drive / Electric STAB / synergy).
- [ ] Deterministic; `cd randomizer && npm test` + determinism/continuity gates green.

## Progress log

- **2026-07-14** — Task created from owner review (Drake + Miraidon). Design + owner validation of the abuser
  model pending before any code.
- **2026-07-14 — CORPUS RESEARCH** (`docs/research/`, 145 teams). Key findings + a critical caveat:
  - **Corpus is Gen 6-7 only** → Surge Surfer / Quark Drive / Hadron Engine / Rising Voltage / Terrain Pulse
    / Room Service / Pincurchin / Miraidon are ALL absent from it. But OUR game (pokeemerald-expansion) HAS
    them. So: ground the STRUCTURE in the corpus; include the modern pieces as real in-game abusers.
  - **Electric terrain (23 teams, all Tapu Koko / Electric Surge):** two modes — (a) SUPPORT LAYER (~16/23):
    the setter self-abuses (fast Electric STAB pivot), terrain is passive (+ blocks sleep) — the direct
    analogue of weather's 0-dedicated-abuser support teams; (b) OFFENSIVE HO (~4): **Tapu Koko + Electric
    Seed → Unburden Hawlucha** SD sweep. The corpus-attested speed abuser is **Unburden (Electric Seed)**,
    NOT Surge Surfer (Gen 8+). Composition: 1 abuser→15, 2→4, 3→3, 0→1 (setter counted as abuser).
  - **Trick Room (33 teams):** setter = the MOVE Trick Room on a bulky SURVIVAL body (Levitate 16 / Disguise
    3 / Prankster / Shadow Shield + Mental Herb / Safety Goggles). Abusers = **slow + strong** (corpus runs
    −Speed natures + 0 Spe IV + wallbreaker offense; practically base Speed ≤ ~55 AND max(Atk,SpA) ≥ ~100):
    Mega Camerupt, Marowak-A, Conkeldurr, Mega Mawile, Crawdaunt… + Gyro Ball users (Stakataka/Bronzong).
    **6v6 wants MULTIPLE redundant setters (2-4)** — the single-setter "dual-mode TR" is a 4v4 artifact and
    must NOT be our 6v6 default (per `6v6-vs-4v4-doubles.md`). Room Service = Gen 8, absent from corpus.
    Setter distribution: 1→17, 2→8, 3→7, 4→1.
  - **Proposed scores (mirror `weatherAbuseScore`, threshold ≥2):**
    - Electric terrain: **+3** terrain ability (Surge Surfer ×2 spe / Quark Drive best-stat, dual-value /
      Unburden via Electric Seed); **+2** Electric-type attacker (grounded STAB ×1.3 / Rising Voltage); **+1**
      Electric Seed; **+1** synergy move (Rising Voltage / Terrain Pulse). Setter (Electric Surge / Hadron
      Engine, else move-retrofit) usually also scores +2.
    - Trick Room: **+3** slow-and-strong (base Speed ≤ ~55 AND max(Atk,SpA) ≥ ~100, potential-based); **+1**
      Gyro Ball; **+1** Room Service (game has it). Setter = the move on a survival body; 6v6 prefers 2-3.
  - Reliable (hard-restrict): abilities/typing/stats. Soft (TM/item-gated): synergy moves, Electric Seed,
    Trick Room move itself, Gyro Ball, Room Service. Pending owner validation before coding + SSOT docs.
- **2026-07-14 — owner validation + 6v6 re-check + SSOT docs.** Owner confirmed: **include the modern pieces**
  (Surge Surfer/Quark Drive/Hadron Engine/Rising Voltage/Room Service — the game has them). Trick Room has
  **two distinct archetypes — FULL room and HALF room**: Tate & Liza = forced FULL (2 setters + 4 abusers);
  emergent trainers pick full/half by context; **TR can coexist with another gimmick (weather + room → half)**.
  Re-mined the **6v6-only** corpus (4v4 excluded — owner: 4v4 is for synergies, not archetypes): confirms both
  archetypes (corpus even names them "full room"/"semi-room"), weather+room coexistence (Bulu/Sun TR,
  Charizard-Y Sun — minor but real), and 3 refinements: full-room typical setter count is **3** (2 is the
  floor); the full/half discriminator is **commitment (non-TR fallback / 2nd gimmick)**, not setter count;
  **singles TR ≈ always full** (priority moves as the room-down fallback). Design enshrined as SSOT:
  `docs/research/electric-terrain.md` + `docs/research/trick-room.md` (indexed). Ready to implement.

- **2026-07-14 — implementation (both gimmicks, test-first).** Landed the core:
  - `gimmickPlan.js`: `electricTerrainAbuseScore/Breakdown/Holds`, `isElectricTerrainSetter`,
    `ensureElectricTerrainSetter`; `trickRoomAbuseScore/Breakdown/Holds`, `isTrickRoomSetter`,
    `ensureTrickRoomSetter`; a `GIMMICK_SPEC` table so the picker/audit treat all three uniformly;
    `gimmickHolds` dispatches to the new holds; `emergentGimmick` generalizes T-136 (weather → electric
    terrain → trick-room half). +14 unit tests (terrainRoomGimmicks.test.js).
  - Picker: a generalized gimmick block (after the weather block) hard-picks the ability-setter (electric
    terrain) and ranks abusers via `GIMMICK_SPEC` — reusing the T-135 soph-pull + weatherPicks audit channel.
    Removed the old Wattson `electricTerrain` overlay + the T-124 slow-mon soft block (folded into the block).
  - Resolver: generalized the setter-retrofit (`ensureSetter`) + the emergent probe to all three gimmicks;
    re-gated the electric-attack pref + Electric Seed (now also Unburden) on the `electric_terrain` gimmick;
    `planMemberAbility` prefers electric-terrain abilities on the gimmick.
  - Seeds: **Wattson → `gimmicks:['electric_terrain']`** (no fallback — monotype pool); **Tate & Liza →
    `gimmicks:['trick_room'], roomStyle:'full'`**.
  - Audit (`teamAudit`): `gimmickMaterialised` uses `gimmickHolds` for all three.
  - **Verified (seed 2920625670):** Wattson builds electric terrain (Raichu-Alola Surge Surfer + Toxtricity,
    abuser ranking shown). Emergent weather still fires (Drake → sun via Groudon). `npm test` 1067;
    determinism + continuity gates 17/17.
  - **KNOWN ISSUE / design fork — Tate & Liza FULL ROOM rolls back.** (superseded by the data finding below)
- **2026-07-14 (cont.) — owner picked "relax TR abuser to SLOW" (offence = ranking, not eligibility).** Done:
  `trickRoomAbuseScore` +3 for any slow mon (≤55), `trickRoomBreakdown` scales the payoff by offence+slowness
  so a slow wallbreaker out-ranks a slow wall. Tests updated. `npm test` 1068.
- **2026-07-14 (cont.) — ROOT-CAUSE of the TR rollback found (DATA gap, not logic).** Instrumented Tate &
  Liza's trick_room ATTEMPT: **3 slow abusers assembled fine, but `setter? false`** — and NONE of its mons
  (Solgaleo/Lunatone/Wobbuffet/Azelf/Duosion/Slowbro, all canonical TR learners) report Trick Room as
  learnable. Confirmed: **`MOVE_TRICK_ROOM` is declared a TM (`include/constants/tms_hms.h`) but appears 0
  times in `src/data/pokemon/teachable_learnsets.h`** (and the randomizer cache). So NO mon can learn Trick
  Room via teachables → the move-setter retrofit can never fire → TR can never build. (Same for
  `MOVE_ELECTRIC_TERRAIN` — 0 in teachables — but electric terrain is unaffected because it has ABILITY
  setters: Electric Surge / Hadron Engine, verified on Wattson.) **Implication:** the OLD Tate & Liza TR never
  actually built either (same data gap); T-137 exposed it. **The TR gimmick logic is complete + green +
  deterministic; it is BLOCKED purely by this teachables data gap** — a pipeline/data issue (TM added without
  populating teachable compatibility), to be fixed/registered separately before TR can function. Electric
  terrain ships independently.

- **2026-07-14 (cont.) — CORRECTION: not a data gap, it's seed variance (owner was right).** `tms_hms.h`,
  the teachable learnsets, and the gym TYPES are all RANDOMIZED per seed. In seed 2920625670, Trick Room
  simply wasn't in the TM pool AND Tate & Liza's rolled Psychic pool had no natural TR learner (Hoopa /
  Articuno-Galar / Oranguru / etc.) — bad luck, not a permanent gap. Seed sweep (Tate & Liza TR): seed 1
  BUILT, 2 rolled back, 3 rolled back, 42 BUILT, 100 BUILT, 777 BUILT (a clean room: Solrock/Lunatone/
  Exeggutor/Reuniclus/Kadabra/Metagross) → **TR builds in ~4/6 sampled seeds** and rolls back cleanly when
  the rolled pool can't support it. **Both gimmicks verified working.** `npm test` 1068; determinism +
  continuity gates 17/17 (re-run after the relaxed slow-abuser score).

## Outcome

Shipped electric terrain + Trick Room as first-class, corpus-grounded gimmicks (setter + 2 abusers, ranked
by an abuse breakdown, with rollback + emergent detection), reusing the weather machinery via a `GIMMICK_SPEC`
table. Electric terrain: ability-setters (Electric Surge / Hadron Engine) + move retrofit; abusers = Surge
Surfer / Quark Drive / Unburden / Electric-STAB / synergy. Trick Room: move-setter on a survival body;
abuser = any SLOW mon (owner-validated — offence is a ranking factor, not an eligibility gate, so a Psychic
room can assemble). Emergent probe generalized (T-136) to weather → electric terrain → trick-room-half.
**Wattson migrated** to the `electric_terrain` gimmick (no fallback; old manual overlay removed); **Tate &
Liza** to `trick_room` + `roomStyle:'full'`.

Owner accepted 2026-07-14. Verified: Wattson builds electric terrain (Surge Surfer abuser ranking shown); a
seed sweep shows Tate & Liza's Trick Room builds in ~4/6 seeds and rolls back cleanly otherwise (seed
variance — TR's TM/learnset/gym-type are randomized). `npm test` 1068; determinism + continuity gates 17/17.

Deferred refinements (noted, non-blocking): explicit `roomStyle:'full'` enforcement (2 setters + 4 abusers —
today approximated by the slow-mon bias); squeezing the weather+room (half) coexistence; the other 3 terrains
+ further gimmicks (owner: separate long-term task). Corpus SSOT: docs/research/{electric-terrain,trick-room}.md.
