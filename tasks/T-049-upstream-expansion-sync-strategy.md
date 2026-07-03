---
id: T-049
title: Research a controlled, reproducible upstream sync with pokeemerald-expansion
status: in-progress      # proposed | in-progress | done | abandoned
type: chore              # feature | fix | refactor | docs | chore
created: 2026-07-03
updated: 2026-07-03
target-version: 0.6.0
links: []                # will link ADR-012 (sync strategy) + B-018 (Endure) once created
blocked-by: []
---

# T-049 — Research a controlled, reproducible upstream sync with pokeemerald-expansion

## Context

**Trigger — the Endure bug.** Endure is broken in our build: instead of protecting for the single
turn it was used, its effect lasts the rest of the battle. Root cause confirmed locally:
`gDisableStructs[battler].endured` is set to `TRUE` in
[battle_script_commands.c:9584](src/battle_script_commands.c#L9584) but is **never cleared** — a
grep for `endured = FALSE` / `.endured = 0` across `src/` + `include/` returns nothing. It is only
wiped by the wholesale `memset(&gDisableStructs[battler], 0, …)` on switch/battle-init
([battle_main.c:3203](src/battle_main.c#L3203), [:3326](src/battle_main.c#L3326),
[:3019](src/battle_main.c#L3019)). So while the Endure user stays on the field the flag stays
`TRUE` and it endures every hit until it switches out or the battle ends — exactly "dura
eternamente". The missing piece is a per-turn reset that upstream already has.

The bug is patchable directly in C, **but** upstream (`rh-hideout/pokeemerald-expansion`, "RHH")
has already fixed Endure-class issues, and we are far behind. The owner would rather adopt a
**controlled, reproducible** upstream-sync process — so Endure and every other upstream fix come in
the correct way and future updates are mechanical — than accumulate one-off local patches.

This is a **research/spike task**: investigate whether and how to do it, decide the strategy, and
document it. It changes nothing in the repo. Endure is the motivating example, not the deliverable.

Divergence (from GitHub compare, master↔master): **≈1207 ahead, ≈1986 behind**.
Version baseline: we are on expansion **1.13.2** (`include/constants/expansion.h`). No `upstream`
remote is configured yet (only `origin` → our fork). Repo mainline is **`master`** (no `develop`,
no git-flow config) — consistent with the owner's "solo master".

## Plan

Deliver a decision + a repeatable runbook, not a merge. Research is essentially done (see Progress
log 2026-07-03); remaining work is to formalise it and spawn the execution tasks.

Acceptance criteria:
- [ ] Sync strategy recorded as an **ADR** (`docs/adr/ADR-012-upstream-expansion-sync.md`):
      incremental merge by release tag, per-hop test gate, tags-not-branches, reproducibility rules.
- [ ] A **runbook** doc under `docs/` (linked from `docs/INDEX.md`) with the exact commands and the
      per-hop checklist, so a future update is mechanical.
- [ ] The version-hop plan is pinned: `1.13.2 → 1.14.4 → 1.15.3 → 1.16.2` (optional `1.13.4`
      warm-up first). Latest 1.13/1.14 patch numbers re-confirmed against the releases page at
      execution time.
- [ ] Endure registered as **B-018** (its own bug file) with the decision on *how* it gets fixed
      (via first sync hop vs. interim cherry-pick) recorded there.
- [ ] Per-hop **execution tasks** created (one task + one branch per hop), each blocked-by the
      previous, none started under this research task.
- [ ] Decision recorded on the **interim question**: cherry-pick the Endure fix now, or wait for the
      first hop to bring it.

## Research findings (2026-07-03)

### 1. Version state
- **We are on 1.13.2.** Latest upstream release is **1.16.2** (2026-07-02 — one day old).
- Minor lines and their latest patch: 1.13.x → **1.13.4**, 1.14.x → **1.14.4**, 1.15.x → **1.15.3**,
  1.16.x → **1.16.2**. So we are ~3 minor lines behind.

### 2. Upstream's own documented update procedure (this is the sanctioned path)
- Add the remote once: `git remote add RHH https://github.com/rh-hideout/pokeemerald-expansion`.
- Update to a **released version**: `git pull RHH expansion/X.Y.Z` (tag pull).
- `git pull RHH master` = unreleased stable **bugfixes** (next patch); `git pull RHH upcoming` =
  unreleased **features** (next minor). We should pull **tags**, never `master`/`upcoming`, for
  reproducibility.
- **Official guidance when several versions behind: update one minor version at a time, jumping
  straight to the latest patch of each** (their example: `1.5.3 → 1.6.2 → 1.7.4`). Manual conflicts
  are expected for older projects.
- Because our repo genuinely shares pret's ancestry (history back to 2015-10), a tag pull has a real
  merge-base — **`merge` is the right tool** (not `subtree`/`read-tree`).

### 3. Divergence analysis — why "1986 behind" is not "1986 conflicts"
Brooktec's custom work is concentrated **outside** the C engine: `randomizer/`, `analyze.js`,
`make.js`, `backend/`, `tasks/`, `bugs/`, `docs/adr/`, `CHANGELOG.brooktec.md`. Upstream's ~1986
commits are almost entirely **inside** the C engine (`src/`, `include/`, `data/`, `test/`). These
sets barely overlap, so the vast majority of upstream commits will merge cleanly.

**The real git-conflict hotspots are the C data files we have hand-edited for gameplay design.**
`git log` on `src/data/pokemon/species_info/` shows Brooktec edits like *"Level-gate all 57 stone
evolutions"*, *"Convert all non-stone item evolutions to evolution stones"*, *"Make regional/branch
evolutions stone-triggered"*. Upstream also edits these same files between versions → guaranteed
conflicts there. **Pre-flight step for each hop:** `git diff <current-tag>..HEAD -- src/ include/
data/` to enumerate our hand-edits before merging, so we know exactly what we must preserve/re-apply.

### 4. The deeper risk is NOT git conflicts — it is semantic drift in randomizer-parsed files
A clean git merge can still **silently break the pipeline** if upstream changes the *format/macros/
structure* of the files the randomizer reads or writes. Those files (per CLAUDE.md's never-commit
list) are:
`src/data/pokemon/species_info/gen_*.h`, `src/data/pokemon/level_up_learnsets/gen_9.h`,
`src/data/pokemon/teachable_learnsets.h`, `src/data/trainers.party`,
`src/data/wild_encounters.json`, `include/constants/tms_hms.h`, `src/starter_choose.c`,
`src/data/script_menu.h`, `data/maps/**/scripts.inc`, `data/maps/**/map.json`.
If a macro or layout changes upstream, the parsers (`randomizer/index.js`, …) and writers
(`randomizer/writer.js`, `tmRandomizer.js`, `itemRandomizer.js`) can produce corrupted output with
no git conflict at all. **This is why every hop needs a full functional test gate, not just a clean
merge.**

### 5. Strategy options
- **A) Incremental merge by release tag — RECOMMENDED.** Matches upstream docs, preserves history,
  reproducible, testable per hop, each hop is small enough to debug. Hops:
  `1.13.2 → 1.14.4 → 1.15.3 → 1.16.2` (do `1.13.4` first as a low-risk warm-up if desired).
- **B) Cherry-pick only the Endure fix.** Fast, unblocks the immediate bug, but does **not** achieve
  the "stay updated" goal. Useful only as an *interim* if the full sync is deferred.
- **C) Rebase our ~1207 commits onto upstream.** Rewrites published history of a deployed fork —
  breaks every clone/deploy. **Rejected.**
- **D) Fresh upstream + re-apply Brooktec work as a patch set.** Clean slate, but huge effort; only
  justified if the fork were hopelessly tangled. Our work is well-isolated, so **not needed**.

### 6. Per-hop test gate (run after each merge, before the next hop / before merging back to master)
1. `cd randomizer && npm test` — the JS suite must stay green.
2. `node analyze.js --no-balance` **and** `node analyze.js` — pipeline must run without crashing and
   without producing corrupted output (this catches format/macro drift from §4).
3. A **real ROM build** on the builder machine (`node make.js --bundle=…`) — the writers exercise
   the mutated files end to end.
4. For Endure specifically: upstream ships C battle tests under `test/battle/` (mgba test runner) —
   run the Endure test to confirm the fix landed. **Note the iron-rule nuance:** the project's
   regression-test rule targets the randomizer JS suite; a C-engine mechanic like Endure is
   validated through the expansion's own battle-test framework, not the JS suite — record that in
   B-018.

### 7. Reproducibility mechanisms (so future updates are mechanical)
- Keep the **`RHH` remote permanently** configured (adding a read-only remote + fetch mutates only
  `.git/` and is reversible — deliberately **not** done in this research task per "sin hacer nada").
- **Version SSOT already exists:** `include/constants/expansion.h` is upstream's own version file
  and is bumped by each merge — that is the single home for "which upstream version we're on". Do
  not duplicate it elsewhere.
- **One task + one branch per hop** off `master` (e.g. `feature/T-05x-sync-1.14.4`), each
  `blocked-by` the previous, each passing the §6 gate before merge.
- **Pin to release tags**, never `master`/`upcoming`.
- Codify §2/§5/§6 in **ADR-012** + a `docs/` runbook so the next update is copy-paste.

### Open questions for the owner
1. **Interim Endure fix?** The fix is confirmed to be **expansion 1.13.3, PR #7838 ("Fixes Endure
   lasting forever")** — one patch above our base (see the changelog audit below). Cheapest unblock:
   merge `expansion/1.13.3` (bugfix-only, no data-format changes, pre-LFS) or cherry-pick PR #7838.
   Do that now, or fold it into the first sync hop?
2. **Is the full sync worth it, or does the Endure cherry-pick suffice?** Answered by the audit
   below (verdict: cherry-pick for Endure *now*; full sync is a worthwhile but separate project).
3. **Target of the first campaign:** stop at latest stable `1.16.2`, or a specific intermediate?
4. **Where does the sync run?** Locally vs the builder machine — §6 step 3 needs the builder.

## Upstream changelog audit — what a full sync brings (1.13.3 → 1.16.2)

Requested by the owner to weigh "full sync vs. Endure cherry-pick". Built from a parallel read of
every official changelog between our base and latest (`docs/changelogs/1.1{3,4,5,6}.x/*.md`), judged
for relevance to *our* randomizer/ROM-builder. Format as requested: **major** items explained one by
one; **minor** items counted.

### Endure — the trigger (RESOLVED)
Fixed in **expansion 1.13.3**, PR [#7838](https://github.com/rh-hideout/pokeemerald-expansion/pull/7838)
"**Fixes Endure lasting forever**" (@AlexOn1ine) — verbatim from the 1.13.3 changelog, verified
directly. This is exactly our bug (per-turn `endured` flag never reset). It is the **immediate next
patch** above our 1.13.2 and carries **no data-format changes** → the cheapest possible unblock.
(Do not confuse with PR #7687 "Endure and Eject Pack issues" — related but not the persistence fix.)
No further Endure duration fix exists anywhere in 1.14.x–1.16.x (the only later mentions are AI
*awareness* of Endure in 1.15.0, not the mechanic).

### Major features — one by one (curated from ~28 headline features across the range)
**1.14.0**
- **Move Relearners for TMs, Tutors & Egg moves** — the relearner can now re-teach these categories;
  `MAX_RELEARNER_MOVES` raised to 60. Relevant: overlaps how we surface teachable moves.
- **Regional-form evolution condition** — evolutions can be gated on region. Relevant: intersects our
  hand-edited stone/region evolution work.
- **ORAS Dowsing Machine**, **GSC berry/apricorn regrowing trees**, **Instant/faster text**,
  **Fishing odds reworked to official rates** (moves config to a new `fishing.h` — breaking for
  callers), **Time-based encounter system rework** (ships a migration script).

**1.15.0**
- **FRLG (FireRed/LeafGreen) support, Part 1** — Kanto maps/content, a `BUILD` variable, no more
  `make clean` when switching bases. Large surface-area addition.
- **New trainer-AI switching flags** — `AI_FLAG_RANDOMIZE_SWITCHINS`, `AI_FLAG_RANDOMIZE_PARTY_INDICES`,
  Dynamic Switch AI. **Directly relevant:** the randomizer assigns trainer AI flags.
- **Capture-odds refactor + new catch-rate modifiers**, **Legends Z-A "Mega Dimension" content**,
  **Egg moves for Legends-Arceus mons**, **species-unique egg sprites**.

**1.16.0**
- **12v12 battles** — engine supports up to 12-vs-12; ships party-access renames
  (`gEnemyParty`→`gParties[…]`) and `Trainer`-struct bitfield repacking (touches trainer data).
- **Built-in Random Mon Generation** — native random species/item/ball/move generation.
  **Conceptually overlaps our randomizer** — worth evaluating whether it replaces or complements parts
  of our pipeline.
- **Basic daily seed (`OW_USE_DAILY_SEED`)** — determinism primitive; relevant to our seeding story.
- **Conditional item shop appearances** — marts can gate items by a criteria function. Relevant: we
  randomize shops.
- **Event evolution `tryspecialevo` rework** (typed arg, `tryMultiple`, result to `VAR_SPECIAL_RESULT`)
  — relevant to our evolution edits.
- **Automated regional Pokédex orders**, **Dynamic Weather**, **Z-A Mega ability data / Champions
  Regulation content**, **generational mechanics alignment** (Encore/Uproar/Pledge configs).

### Major bugfixes — one by one (standouts; ~45 "major" across the range, listed by line)
**1.13.3–1.13.4:** Endure lasting forever (**1.13.3**, our trigger) · Volt Tackle recoil restored ·
Steadfast not activating · Cursed Body at 0 PP · SmartStrike double-battle crash · fusion-mon illegal
movesets · Emergency Exit/Knock Off in wild battles · Focus Energy/ Ruination / Echoed Voice / Stomping
Tantrum power · Beat Up damage (Gen ≤5) · Receiver/Magician/Shell Trap/Destiny Knot · King's Rock vs
flinch · Protosynthesis/Quark Drive recalculation.

**1.14.x:** Beat Up double-damage on non-crit · Critical Capture RNG + Catching Charm · ball cycling
across duplicate bag slots · King's Rock vs flinch · double Dynamax in 2v1 · stairs walk freeze ·
capture sends active mon to PC · in-battle form changes always reverting (**1.14.3**) · berry timing
for Yawn/Leech Seed · Kingambit/Floette-Eternal/Mega-Gardevoir evolution & typing · Rare Candy
reviving lvl-100 · illegal hazard switching.

**1.15.x:** instant-text game freeze · Rare Candy revive · illegal switch via hazards · negative
friendship modifiers (affects friendship evolutions) · Sturdy vs OHKO priority (Gen 5+) · Sheer Force
suppressing recoil · double-battle rematch being a single battle.

**1.16.x:** Bide refactor · double-battle rematch → single · Swagger+Own Tempo softlock · Air Balloon
vs Substitute / on faint · Future Sight party-slot & item/ability triggers · Trace reactivation ·
link-battle party assignment / 0-max-HP display · Supreme Overlord/Last Respects faint counter ·
Emergency Exit after Shell Bell · Mimikyu/Eiscue revert-on-revive · Thousand Arrows grounding.

### Minor features & minor bugfixes — counts

| Line | Major features | Major bugfixes | Minor features | Minor bugfixes |
|------|:---:|:---:|:---:|:---:|
| 1.13.3–1.13.4 | ~2 | ~15 | 4 | ~155 |
| 1.14.0–1.14.4 | ~9 | ~13 | ~35 | ~250 |
| 1.15.0–1.15.3 | 6 | ~7 | ~40 | ~210 |
| 1.16.0–1.16.2 | ~10 | ~10 | ~23 | ~145 |
| **Total** | **~27** | **~45** | **~102** | **~760** |

The minor bugfix tail is overwhelmingly niche battle move/ability/item interaction corrections plus
sprite/overworld/build fixes — individually small, collectively the main reason a base drifts from
"correct competitive behaviour". Minor features are dominated by **AI-scoring improvements** (~65 of
the ~102 across the range), which matter to us because our trainers rely on the stock AI.

### Data-format migration risks — why the sync is *delicate for our randomizer* (not for git)
These are the real cost. Each is a file our JS parses/writes whose format/location changed upstream —
a clean git merge will not flag them, but the pipeline breaks until adapted.

| File (we parse/write) | What changed | First in | Risk |
|---|---|---|---|
| `teachable_learnsets.h` | `tmIlliterate` bool → `teachingType` enum; then **file removed**, now generated at build from `all_learnables.json` | 1.14.0 → **1.15.0** | **HIGH** |
| tutor/universal moves | `P_TUTOR_MOVES_ARRAY` removed → new `src/data/pokemon/special_movesets.json` | 1.14.0 | **HIGH** |
| `src/data/trainers.party` | git-LFS text; ball field `enum Item`→`enum Pokeball`→`u8→enum PokeBall`; `Trainer` bitfields repacked (12v12); Trainer Party Pools | 1.13.4 → 1.16.1 | **HIGH** |
| `species_info/gen_*.h` | new fields `.isRestricted`/`.isSubLegendary`, sky-battle flag, species enum, Telekinesis-ban field; content growth (Z-A/LA) | 1.15.0 / 1.16.0 | **MED** |
| `wild_encounters.json` | porymap default-settings change warned to break projects; encounter config relocated to `include/config/wild_encounter.h` | 1.14.0 / 1.16.0 | **MED** |
| audio `.aif`→`.wav` + several migration scripts (`bin_to_wav.py`, trainer-pic refactor, etc.) | not our files, but block a clean build/pull | 1.14.1+ | build-blocking |
| `level_up_learnsets/*.h`, `tms_hms.h` | **no format change** observed — only content growth / logic refactors | — | low |

### Verdict — full sync vs. Endure cherry-pick
- **For Endure specifically: the cherry-pick (or a `1.13.3` bugfix-only merge) is enough and cheap.**
  The fix is one patch away, PR #7838, with zero data-format fallout. Recommended to unblock now.
- **The full sync to 1.16.2 is worth doing, but it is a genuine multi-session project — and its cost
  is the data-format migrations above, not git conflicts.** The payoff is ~760 bugfixes + ~45 major
  fixes + features that directly touch us (relearner categories, AI switch-randomization flags,
  conditional shops, regional-form evolutions, native random-mon generation to evaluate against our
  own). The work is dominated by re-teaching our parsers/writers the new formats and re-validating
  per hop, exactly what §4/§6 predicted.
- **Recommended shape:** Tier 0 — cherry-pick Endure now (its own bug B-018). Tier 1+ — run the full
  sync as the separate, tag-by-tag campaign in §5 option A, **not** blocking Endure on it. This gives
  the owner the fix immediately while keeping the big update controlled and reproducible.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-03** — Task created. Trigger: Endure effect persists all battle instead of one turn.
  Investigation done (read-only; repo untouched, no remote added):
  - Confirmed Endure root cause locally: `endured` flag set at battle_script_commands.c:9584, never
    cleared per turn; only wiped by the on-switch `memset` of `gDisableStructs`.
  - Established version state: on **1.13.2**, latest upstream **1.16.2**; minor-line latest patches
    1.13.4 / 1.14.4 / 1.15.3 / 1.16.2.
  - Captured upstream's sanctioned update procedure (RHH remote, `git pull RHH expansion/X.Y.Z`,
    one-minor-at-a-time to latest patch).
  - Divergence analysis: ~1986-behind ≠ ~1986 conflicts; hotspots = hand-edited C data files
    (evolution/species_info/shops, from the stone-evolution work); randomizer/backend isolated.
    Deeper risk = semantic drift in randomizer-parsed files → per-hop functional test gate required.
  - Options A–D with **A (incremental merge by tag)** recommended; hop plan
    `1.13.2 → 1.14.4 → 1.15.3 → 1.16.2` (optional 1.13.4 warm-up).
  - Sources: rh-hideout wiki update guidance; GitHub releases page (1.16.2, 2026-07-02); PR #7687
    ("Endure and Eject Pack issues", @AlexOn1ine) — exact fix commit/version to be pinned at
    execution.
  - **Deliberately NOT done:** added the `RHH` remote or ran a `git merge --no-commit` dry-run
    (would give the precise conflict list) — deferred per "sin hacer nada". That dry-run is the
    first concrete action once the owner greenlights execution.
- **2026-07-03** — Changelog audit added (see "Upstream changelog audit" section). Read every
  official changelog 1.13.3→1.16.2 via four parallel agents and consolidated into the owner's
  requested format (majors one-by-one, minors counted). Headline results:
  - **Correction to the earlier entry:** the "Endure lasting forever" fix is **PR #7838 in 1.13.3**
    (verified verbatim against the 1.13.3 changelog), NOT #7687 (a related Endure/Eject-Pack change).
    Confirmed no other Endure-duration fix exists in 1.14–1.16.
  - Totals across the range: ~27 major features, ~45 major bugfixes, ~102 minor features
    (~65 AI-scoring), ~760 minor bugfixes.
  - Identified the real sync cost = **data-format migrations** for randomizer-parsed files
    (`teachable_learnsets.h` removed/regenerated, tutor arrays → `special_movesets.json`,
    `trainers.party` LFS + ball-enum + pools, `species_info` new fields, `wild_encounters.json`
    porymap changes, `.aif`→`.wav` + migration scripts) — git conflicts are the smaller problem.
  - **Verdict:** Endure → cherry-pick / `1.13.3` merge now (cheap, zero format fallout); full sync to
    1.16.2 is worthwhile but a separate tag-by-tag campaign, not a blocker for Endure.
- **2026-07-03** — Owner chose a **bugfixes-only, cherry-pick-per-version** strategy (no features, to
  avoid changing the curated game and breaking randomizer data-file contracts). Analysed viability
  (viable; real filter is "touches sensitive file", not "feature vs fix"; per-commit picking degrades
  with depth as `.0`-release fixes depend on skipped refactors → those get escalated). Built the
  system:
  - [ADR-012](../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md) — the decision.
  - [docs/upstream-bugfix-sync.md](../docs/upstream-bugfix-sync.md) — repeatable procedure + state
    ledger (SSOT for the bugfix frontier; roadmap of 1.13.3→1.16.2 with per-version sensitive-file
    warnings). Both linked from `docs/INDEX.md`.
  - [B-018](../bugs/B-018-endure-persists-whole-battle.md) — Endure registered (fix = #7838 via T-050).
  - [T-050](T-050-sync-1.13.3-bugfixes.md) (1.13.3, incl. Endure) and
    [T-051](T-051-sync-1.13.4-bugfixes.md) (1.13.4) created — the pure-bugfix tranche on our current
    minor line. Tasks for 1.14.0→1.16.2 to be minted just-in-time (scope depends on the RHH
    enumeration + earlier-hop outcomes); the ledger roadmap holds them until then.
  - Still no git state changed (RHH remote not added) — first execution step is the read-only fetch
    inside T-050.

## Outcome

<!-- Filled when closing. Expected: ADR-012 + docs runbook + B-018 + per-hop execution tasks. -->
