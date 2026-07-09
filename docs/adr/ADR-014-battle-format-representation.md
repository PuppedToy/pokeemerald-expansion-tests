# ADR-014: Battle format is a run-level config echoed into the bundle and stamped per-trainer as `battleType`; Run & Bun uses duplicate committed E4 trainer IDs

- **Status:** proposed
- **Date:** 2026-07-09
- **Task:** T-084

## Context

The epic ([T-083](../../tasks/T-083-epic-battle-formats-and-teambuilding.md)) introduces a global
**battle format** so a run can be generated as **singles**, **doubles**, or **mixed** (a per-pool
proportion of doubles), plus a **"League style Run & Bun"** option where each Elite Four member
offers an in-game singles-or-doubles choice.

Facts from the read-only exploration that constrain the design:

- The pipeline has **no** battle-format concept today. The frontend config rides into the bundle
  whole (`config:{...cfg}`, `randomizer/generate.js:71-80`); `docs.trainersResultsSimplified` is the
  fully-resolved SSOT the ROM is built from; the bundle carries no battle-type info.
- The `.party` text format already supports `Double Battle: Yes/No` and the C `battleType:2` struct
  field is fully wired (`tools/trainerproc`, `include/data.h:85-100`). The engine forces
  `BATTLE_TYPE_DOUBLE` for any trainer whose data says doubles, **regardless of the script macro**
  used to launch the fight (`src/battle_main.c:526-539`). So basic per-trainer doubles needs **no C
  change** — only the writer must emit the correct `Double Battle:` line (today its regex preserves
  the whole trainer header verbatim, `randomizer/writer.js:836-867`).
- There is **no** runtime "force this trainer double" flag for trainer battles. A per-player runtime
  choice (Run & Bun) therefore needs either a second doubles-flagged trainer id or an engine patch.
- The Mossdeep Space Center Steven fight is a `multi_2_vs_2` tag battle
  (`TRAINER_MAXIE_MOSSDEEP` + `TRAINER_TABITHA_MOSSDEEP` + ally `PARTNER_STEVEN`) — already
  multi/double and special.
- **Tate & Liza** (`TRAINER_TATE_AND_LIZA_1`) is canonically a double-battle gym leader: a single
  trainer id that sends out two Pokémon.

Owner decisions taken at planning time: Run & Bun → duplicate committed trainer IDs (no engine
patch); the mixed slider is **% of singles** (default 60); the Run & Bun E4 split is
`round(%singles×4)` clamped to 1–3.

## Decision

**1. Config fields (frontend → bundle, spread verbatim into `bundle.config`).**
- `battleFormat`: `'singles' | 'doubles' | 'mixed'`, default `'singles'`.
- `singlesPercent`: integer 0–100, default 60; only meaningful when `battleFormat === 'mixed'`.
- `leagueRunAndBun`: boolean, default false; only offered when `battleFormat === 'mixed'`.

**2. Battle type is decided by the randomizer and recorded in the bundle; the maker only obeys.**
Each entry of `artifacts.trainers.trainersData` and each `docs.trainersResultsSimplified[id]` gains a
field `battleType: 'singles' | 'doubles'`. The writer sets the `.party` `Double Battle:` line from
this field. No consumer infers battle type from anything else.

**3. Pools (by concrete trainer-ID membership).** In `mixed`, each pool independently receives the
split closest to the chosen proportion; a pool's assignment is deterministic under the run seed.
- `champion` = `TRAINER_CHAMPION_STEVEN`. Always the **majority** type (see rule 4). Not counted in
  Run & Bun.
- `e4` = `TRAINER_SIDNEY`, `TRAINER_PHOEBE`, `TRAINER_GLACIA`, `TRAINER_DRAKE`.
- `gymBosses` = `TRAINER_ROXANNE_1`, `TRAINER_BRAWLY_1`, `TRAINER_WATTSON_1`, `TRAINER_FLANNERY_1`,
  `TRAINER_NORMAN_1`, `TRAINER_WINONA_1`, `TRAINER_TATE_AND_LIZA_1`, `TRAINER_JUAN_1`.
- `bossTrainers` = every other `isBoss` trainer (rivals, Maxie/Archie, Tabitha/Matt/Shelly, grunt
  gauntlet bosses, Wally), **excluding** the tag-battle trainers (rule 6).
- `normalTrainers` = all remaining (non-boss) trainers.

**4. Proportion rules.**
- The slider is **% of singles**. For a multi-member pool, mark `round(fraction × poolSize)` members
  singles (closest to the target), the rest doubles; ties resolved deterministically by seed.
- The champion (single-member pool) follows the **majority** rule: `>50%` singles → singles;
  `=50%` → seeded coin-flip; `<50%` singles → doubles. (This is the "51 → singles / 50 → coin-flip /
  49 → doubles" rule.)

**5. Doubles eligibility.** A trainer may only be marked doubles if its resolved team has **≥2**
Pokémon. A trainer that would be doubles but has <2 mons is forced back to singles and logged in
diagnostics.

**6. Exclusion.** The Mossdeep tag battle trainers (`TRAINER_MAXIE_MOSSDEEP`,
`TRAINER_TABITHA_MOSSDEEP`) and the ally `PARTNER_STEVEN` are never assigned/converted — they keep
their existing `multi_2_vs_2` behaviour.

**7. Run & Bun (mixed + `leagueRunAndBun`).**
- Each of the four E4 members has **two committed trainer IDs**: the base id (singles-flagged) and a
  new `TRAINER_<MEMBER>_DOUBLES` id (doubles-flagged), each with a **distinct** randomizer-generated
  team.
- Ingame, at each E4 member, if the player still has choices of a given type remaining, the game asks
  "singles or doubles?" and branches to the matching id; once a type's quota is exhausted, it goes
  straight to the remaining type without asking. The champion is never prompted (always majority).
- Two game VARs hold the remaining singles/doubles quotas; a mode-gate VAR distinguishes "Run & Bun
  active" from plain mixed. All are preset at build time by the maker via writer token replacement.
- **E4 split formula:** `singlesCount = clamp(round(singlesPercent/100 × 4), 1, 3)`,
  `doublesCount = 4 − singlesCount`. The clamp guarantees at least one of each so the choice is always
  meaningful.

**Worked examples** (mixed; percentages are % singles):

| % singles | Multi-member pool (e.g. E4, size 4) | Champion | Run & Bun E4 split (S/D) |
|---|---|---|---|
| 100% | 4 singles / 0 doubles | singles | 3 / 1 (clamped) |
| 90%  | round(3.6)=4 → 4 / 0 | singles | 3 / 1 (clamped) |
| 60%  | round(2.4)=2 → 2 / 2 | singles | 2 / 2 |
| 51%  | round(2.04)=2 → 2 / 2 | singles | 2 / 2 |
| 50%  | round(2.0)=2 → 2 / 2 | coin-flip (seeded) | 2 / 2 |
| 40%  | round(1.6)=2 → 2 singles / 2 doubles | doubles | 2 / 2 |

Note the per-pool proportional count and the Run & Bun clamp are independent: a pool of 4 at 90% is
4/0, but the Run & Bun *choice* quota clamps to 3/1 so the player always gets at least one of each.

**8. Tate & Liza special case (open point for owner confirmation).** Because Tate & Liza is
canonically a double battle, the default here is that they **follow the global format** like any other
gym boss (single in a `singles` run, eligible for doubles in `mixed`/`doubles`). If the owner prefers
to preserve their canonical always-doubles nature, that becomes a one-line exception in the pool
assignment. Recorded here so the choice is explicit; default assumed unless the owner says otherwise.

## Alternatives considered

- **Runtime engine patch for Run & Bun** (one E4 id + a "force double" VAR honoured by the engine,
  swapping in a second team at runtime). Rejected: riskier C change, and the second team still has to
  live somewhere; duplicate committed IDs are cleaner and lean entirely on existing data-driven
  doubles support.
- **Encoding battle type only in `config` (a rule the maker re-derives)** rather than per-trainer in
  the bundle. Rejected: the randomizer already owns team resolution and the ≥2-mon gate; making it the
  single decider (recorded per-trainer) keeps "randomizer decides, maker obeys" clean and auditable.
- **Slider as "% of doubles"** instead of "% of singles". Rejected: every owner-specified example is
  phrased in singles terms (51/90/100% singles), so a singles slider avoids mental inversion.

## Consequences

- Adding the setting is mostly additive: the config flows to the bundle for free; the only new bundle
  surface is the per-trainer `battleType` field and the config echo.
- The writer must stop preserving the `Double Battle:` header verbatim for the affected trainers
  (T-087). Downstream C/parser support already exists.
- Run & Bun commits four new `TRAINER_*_DOUBLES` constants + base `.party` entries (T-088) — a
  permanent decomp/data change, verified in CI/on the builder (no local GBA toolchain).
- We commit to keeping `trainersData` and `docs.trainersResultsSimplified` in agreement on
  `battleType`, reinforcing the case for a single trainer-resolution path (Group 2C, T-104).
- Determinism is preserved: battle-type assignment reuses the per-slot reseed convention so
  shared-trainer ROMs stay consistent.
- The Tate & Liza default may surprise players who expect their canonical double battle in a singles
  run; flagged for owner sign-off.
