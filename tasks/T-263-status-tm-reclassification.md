---
id: T-263
title: Reclassify the status TM pools by real effect strength
status: done            # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-10
updated: 2026-08-11
target-version: 0.9.0
links: [B-066, T-152]
blocked-by: []
---

# T-263 — Reclassify the status TM pools by real effect strength

## Context

[B-066](../bugs/B-066-terrain-tms-cluster-in-one-pick.md) exposed that the status pools in
`randomizer/tms.js` were never reviewed: they arrived with the inherited puppedjs classification
(`c3cc77f7f9`) and only T-152 ever edited them. The terrain moves sat in `goodStatusMoves` next to
Calm Mind and Stealth Rock, three of them filled one Route 121 pick in run `735016030`, and the
average tier still carries strictly-redundant moves.

Owner decisions (2026-08-10):

- Grassy / Psychic / Misty Terrain move **down** to `averageStatusMoves`. **Electric Terrain stays**
  in `goodStatusMoves` (it is the one the pipeline actually builds around — `electric_terrain`
  gimmick, Electric Seed, Rising Voltage).
- Promote to `goodStatusMoves`: **Haze, Endure, Iron Defense, Amnesia** and the two unconditional
  −2 attack debuffs, **Charm** (−2 Atk) and **Eerie Impulse** (−2 SpA).
- Delete **Feather Dance** (duplicate of Charm) and **Rock Polish** (duplicate of Agility).

## Plan

Reclassify the two lists in `randomizer/tms.js` and lock the result with a hygiene test that reads
the **real** move data (`src/data/moves_info.h` via `parseMovesFile`, 65 ms) so the invariants survive
an upstream sync:

1. A move belongs to exactly one pool.
2. No pool lists the same move twice, and every pooled move exists in the game data.
3. **One effect per pool** — the owner's new rule. Identity is `effect` + `argument`, so Toxic and
   Will-O-Wisp (both `EFFECT_NON_VOLATILE_STATUS`, different `nonVolatileStatus`) are correctly
   distinct while Roar/Whirlwind and Agility/Rock Polish are correctly duplicates. Survivors need an
   explicit, justified allow-list entry.
4. Every status tier keeps at least `slots + 3` candidates, so a tier can never go near-fixed (what
   would have happened if the 4 terrains had simply been deleted: 14 candidates for 13 slots).
5. The classification decisions above are asserted by name, so a future edit has to be deliberate.

Acceptance criteria:
- [x] Grassy/Psychic/Misty Terrain in `averageStatusMoves`; Electric Terrain in `goodStatusMoves`.
- [x] Haze, Endure, Iron Defense, Amnesia, Charm, Eerie Impulse in `goodStatusMoves`.
- [x] Feather Dance and Rock Polish in no pool.
- [x] Hygiene test green, with every surviving duplicate effect justified in the allow-list.
- [x] Every status tier has ≥ slots + 3 candidates.
- [x] `cd randomizer && npm test` green.
- [x] `randomizer/docs/tms.md` documents pool membership (it only documented tiers and locations —
      that is why nobody ever reviewed the contents).
- [x] Owner decides on the three remaining duplicate pairs (allow-list entries) and on the extra
      promotion candidates (Work Up, Agility).
- [x] Owner manual-tests a fresh run and confirms.

## Progress log

- **2026-08-10** — Task created from the B-066 investigation and the owner's classification calls.
  Audited all 12 pools against the real move data: no unknown move ids, no cross-pool duplicates, and
  4 duplicate-effect pairs — Agility/Rock Polish and Charm/Feather Dance (both being fixed here),
  plus **Fake Tears/Metal Sound** (−2 SpD) and **Roar/Whirlwind** (identical `EFFECT_ROAR`) reported
  to the owner. `nichePool` also carries Explosion/Self-Destruct (same effect, 250 vs 200 power).
  Toxic/Will-O-Wisp share `EFFECT_NON_VOLATILE_STATUS` but differ in `argument` — genuinely distinct.

- **2026-08-10 — shipped the agreed reclassification.** `goodStatusMoves` 18 → 21 candidates for its
  13 slots, `averageStatusMoves` 45 → 40 for its 11.
  - **Dead end on the hygiene rule:** the first version applied "one effect per pool" to every pool
    and went red on all four damage pools — damage moves share effects by design (dozens of
    `EFFECT_HIT`) and are told apart by power and type. The rule is status-only now. Then it went
    *green for the wrong reason*: `parseMovesFile` returns `power` as a **string**, so `power === 0`
    matched nothing; switched to `category === 'DAMAGE_CATEGORY_STATUS'`.
  - **New finding, allow-listed with its reason:** `weatherMoves` lists both Hail and Snowscape
    (same effect). It is never drawn — TM72-75 are `FIXED_TMS` — so Snowscape is dead weight in a
    documentation-only list. Flagged to the owner separately because of the Aurora Veil question.
  - **Measured effect on B-066** (400k simulated runs per tier, real pool sizes, real pick groups):
    a good-tier pick can no longer hold two terrains at all (only Electric Terrain is left there),
    and in the average tier a pick holds ≥2 terrains **3.4 %** of the time versus **28.4 %** before,
    with all three down to 0.03 % from 1.0 %. Electric Terrain availability is unchanged (52 % mixed
    / 62 % singles, was 59 %), so T-137's `electric_terrain` gimmick and the Electric Seed keep
    working, and the other three seeds keep a source in the average tier.

- **2026-08-10 (second round — owner answered the open questions).**
  - **Deleted** `MOVE_METAL_SOUND` (kept Fake Tears, the other −2 Sp. Def) and `MOVE_WHIRLWIND` (kept
    Roar; identical `EFFECT_ROAR`), plus `MOVE_DOUBLE_TEAM` — evasion, owner's call. The
    allow-list is down to the one `weatherMoves` entry. `averageStatusMoves` 40 → **37** for 11 slots.
  - **Not applied, owner declined:** promoting Work Up (its siblings Bulk Up / Calm Mind are good-tier,
    so this stays an open inconsistency by choice) and Agility (the "not speed" exclusion was
    deliberate). Explosion / Self-Destruct stay both in `nichePool`.
  - **Test spec deliberately changed:** `tmPoolsDoubles.test.js` pinned T-152's additions, two of
    which (Metal Sound, Whirlwind) this task deletes. The list was trimmed with a comment pointing at
    the reason — the specification changed, the test was not weakened, and `tmPoolHygiene.test.js` now
    asserts those moves are in *no* pool.
  - **Aurora Veil check (raised by the Hail/Snowscape finding):** no problem. The gate is
    `B_WEATHER_ICY_ANY` = `B_WEATHER_HAIL | B_WEATHER_SNOW` (`include/constants/battle.h:362`), and
    `B_PREFERRED_ICE_WEATHER` is `B_ICE_WEATHER_BOTH`, so the fixed TM75 = Hail does enable Aurora
    Veil. Snowscape is simply dead weight in a list that is never drawn.

- **2026-08-11** — Owner reviewed the result and approved ("lo veo bien"). Closing.

## Outcome

The status tiers now reflect what the moves do. `goodStatusMoves` holds **21** candidates for its 13
slots (was 18), `averageStatusMoves` **37** for its 11 (was 45). Grassy/Psychic/Misty Terrain went
down, Electric Terrain stayed as the one terrain the pipeline builds around, and Amnesia, Iron
Defense, Charm, Eerie Impulse, Haze and Endure came up. Five moves left the TM system entirely: four
as second copies of a card their pool already had (Feather Dance, Rock Polish, Metal Sound, Whirlwind)
and Double Team for being evasion.

B-066 is fixed by reclassification, not by a constraint, and the bug file states the residual
honestly: a good-tier pick can no longer hold two terrains at all, but two average-tier terrains still
share a pick 3.4 % of runs (was 28.4 %). A per-pick family-spread constraint remains available if the
owner ever wants 0 % — it would need the TM pick groups from `src/randomizer_picks.c` mirrored in JS.

Deviations from the plan: the owner declined two of the extras I proposed — promoting Work Up (its
siblings Bulk Up and Calm Mind are good-tier, so that inconsistency stands by choice) and Agility
(the "not speed" exclusion was deliberate) — and kept both Explosion and Self-Destruct. One test spec
changed deliberately: `tmPoolsDoubles.test.js` pinned T-152's additions, two of which this task
deletes.

What the hygiene test bought beyond the ask: it reads the real `moves_info.h`, so an upstream sync that
renames or re-effects a pooled move now fails a test instead of surfacing in someone's run. It also
caught Hail/Snowscape both sitting in the never-drawn `weatherMoves` list, which prompted verifying
that the fixed TM75 = Hail does enable Aurora Veil (`B_WEATHER_ICY_ANY` = hail | snow). No follow-ups
spawned.
