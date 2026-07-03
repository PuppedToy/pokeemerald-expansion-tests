# Upstream bugfix sync — procedure & state ledger

How we keep up with `rh-hideout/pokeemerald-expansion` ("RHH") **bugfixes only**, and the record of
how far we have. Decision & rationale: [ADR-012](adr/ADR-012-upstream-bugfix-cherry-pick-sync.md).
Motivating investigation: [T-049](../tasks/T-049-upstream-expansion-sync-strategy.md).

This file has two parts: the **Procedure** (stable — how we do each version) and the **Ledger**
(state — what we have absorbed). The Ledger is the single source of truth for the *bugfix frontier*.
Two tracks (see [ADR-012](adr/ADR-012-upstream-bugfix-cherry-pick-sync.md) + its 2026-07-03
amendment): **pure-bugfix patch releases** are taken by *merge-then-revert* (so `expansion.h`
advances to that version); **feature `.0` releases** are taken by piecemeal *cherry-pick* (so
`expansion.h` stays put and the ledger is the only frontier record).

## Sensitive files (never taken without owner approval)

The randomizer parses/writes these; a change to their **format/macros/location** breaks the pipeline.
The authoritative list is the "Source mutated by the randomizer/rebalancer" bullet in
[CLAUDE.md](../CLAUDE.md) → *Generated files*. In short: `src/data/pokemon/species_info/gen_*.h`,
`level_up_learnsets/*.h`, `teachable_learnsets.h`, `src/data/trainers.party`,
`src/data/wild_encounters.json`, `include/constants/tms_hms.h`, `src/starter_choose.c`,
`src/data/script_menu.h`, `data/maps/**`. A commit touching any of these is **escalated, not taken**.

## Procedure (repeat per version)

Do versions in ascending order. One task per version (`T-NNN`), one branch off `master`.

1. **Open the task** `T-NNN-sync-<ver>-bugfixes`, set it `in-progress`, branch
   `feature/T-NNN-sync-<ver>` off `master`.
2. **Ensure the RHH remote (read-only), once per machine:**
   `git remote add RHH https://github.com/rh-hideout/pokeemerald-expansion` then
   `git fetch RHH --tags`. (This is the first mutation of git state — nothing before this step touches
   the repo.)
3. **Enumerate the version's commits:**
   `git log --oneline --no-merges expansion/<prev-ver>..expansion/<ver>`.
4. **Classify each commit** — bugfix / feature / refactor-for-feature / content / test-infra / docs —
   and flag sensitive-file touches: `git show --stat <sha>` and check against the list above. Record
   the classification in the ledger row as you go.
5. **Cherry-pick the safe bugfixes**, provenance-annotated: `git cherry-pick -x <sha>`. Take the
   commit's accompanying `test/battle/**` test in the same pick when present — that test is the
   regression proof for any bug we also track in `bugs/`.
6. **Escalate to the owner** (do not silently take or skip): any fix touching a sensitive file; any
   cherry-pick that conflicts because it depends on a skipped feature/refactor; any change that is
   borderline fix-vs-feature or alters gameplay balance.
7. **Validate:** `make check` (compiles the game+tests to a GBA ROM with `arm-none-eabi-gcc` and runs
   them in the mGBA headless runner — needs the ARM toolchain + mgba, **not** available on the
   randomizer/analysis machine). Two toolchain-free-for-us venues: **CI** (`.github/workflows/build.yml`
   runs `make -j check` on every push — the primary verifier) or the **builder machine**. To satisfy
   the regression-test iron rule for a bundled fix+test commit, run the test-only change first
   (expect FAIL) then the fix (expect PASS). Only if a cherry-pick touched a sensitive file (it should
   not): also `cd randomizer && npm test` + a full `node analyze.js` + a real ROM build.
8. **Log** the outcome in the Ledger below: commits taken (sha/PR), skipped-feature, skipped-sensitive,
   deferred-for-owner — each with a one-line reason. Update the frontier line.
9. **Close** per `CLAUDE.md`: owner confirms, then merge to `master` (owner-gated push).

Optional shortcut (ADR-012): a 100%-bugfix release touching no sensitive file may be merged wholesale
instead of step 5, with owner approval for that version.

## Ledger — bugfix frontier

**Bugfixes absorbed up to: _none merged yet_. Endure fix (#7838) staged on `feature/T-050-sync-1.13.3`
(unverified). Full 1.13.3 planned as a merge-then-revert on the builder. Base = expansion 1.13.2.**
Target of the campaign: **1.16.2** (latest as of 2026-07-03). Revisit when RHH releases more.

Per-version status lives in the linked task (SSOT for work status). This table adds the roadmap and
the per-version sensitive-file warnings surfaced by the T-049 audit; the commit-level decisions
(taken / skipped / deferred) are filled in each version's subsection as its task executes.

| Version | Kind | Task | Sensitive-file warnings from audit (screen these out) | Frontier status |
|---|---|---|---|---|
| 1.13.3 | patch (bugfix) | [T-050](../tasks/T-050-sync-1.13.3-bugfixes.md) | revert on merge: #7881 sprites (`species_info`); #8007/#7976 Dome + #2196 tooling (map scripts) | Endure staged; **do 1.13.3 via merge-then-revert on builder** |
| 1.13.4 | patch (bugfix) | [T-051](../tasks/T-051-sync-1.13.4-bugfixes.md) | `.party` → git-LFS (tooling, not format) | pending |
| 1.14.0 | **minor (features)** | _minted when reached_ | `teachingType` enum, tutor→`special_movesets.json`, `wild_encounters.json`, `.party` LFS | pending |
| 1.14.1 | patch | _minted when reached_ | audio `.aif`→`.wav` migration script (build-blocking) | pending |
| 1.14.2 | patch | _minted when reached_ | generational move-data changes — verify vs `moves` parse | pending |
| 1.14.3 | patch | _minted when reached_ | misc `species_info` value changes | pending |
| 1.14.4 | patch | _minted when reached_ | none observed | pending |
| 1.15.0 | **minor (features)** | _minted when reached_ | **`teachable_learnsets.h` removed** (now build-generated), `.party` ball `enum Pokeball`, `species_info` `.isRestricted`/`.isSubLegendary`/sky-battle | pending |
| 1.15.1 | patch | _minted when reached_ | none observed | pending |
| 1.15.2 | patch | _minted when reached_ | none observed | pending |
| 1.15.3 | patch | _minted when reached_ | none observed | pending |
| 1.16.0 | **minor (features)** | _minted when reached_ | `species_info` species-enum + Telekinesis-ban field, `.party` `u8`→`enum PokeBall` + 12v12 struct repack + Trainer Pools, `wild_encounters` config relocation | pending |
| 1.16.1 | patch | _minted when reached_ | `.party` PokeBall-enum consistency | pending |
| 1.16.2 | patch | _minted when reached_ | none observed (Champions content is feature — skip) | pending |

> Tasks for 1.14.0→1.16.2 are minted just-in-time (each when its predecessor closes), because their
> concrete commit lists and clean-cherry-pick viability are only known after the RHH fetch + the
> outcome of earlier hops. This table is the roadmap; the frontier line above is the headline "how
> far are we" answer.

### Per-version decision records

Filled as each version's task runs. Format per version: **Taken** (sha `-x`, PR) · **Skipped —
feature** · **Skipped — sensitive** (file) · **Deferred — owner** (reason).

- **1.13.3** — _Endure staged 2026-07-03 (T-050). Decision: absorb the rest via merge-then-revert on
  the builder (see below). `expansion.h` will advance to 1.13.3._
  - **Staged now:** `a347e47b7a` Endure #7838 (`-x`, with its `endure.c` test → B-018), on
    `feature/T-050-sync-1.13.3`. Clean, unverified (CI pending).
  - **Why not piecemeal:** a trial run cherry-picked 98 of 1.13.3's commits cleanly but 7 real fixes
    were entangled with later refactors already picked (Throat Spray moveend → `battle_util.c`, RNG
    enum restructured, `TryImmunityAbilityHealStatus` moved), and none of it could be compiled here.
    Reverted that trial; keeping only the clean Endure fix.
  - **Builder step — merge-then-revert:** `git merge expansion/1.13.3`, then `git revert` the
    feature/sensitive commits: `95d98305dd` (#7881 sprites), `b4041535cf` (#8007) + `90c3a8cb2c`
    (#7976) (Dome — owner: skip), `d1d5435487` (#2196 tooling). Brings all 1.13.3 fixes (incl. the 7)
    in correct order; verify with `make check`.
- **1.13.4** — _pending (T-051)._
