# ADR-012: Upstream is absorbed as bugfixes only, cherry-picked per version, never as feature merges

- **Status:** accepted
- **Date:** 2026-07-03
- **Task:** T-049

## Context

We are a fork of `rh-hideout/pokeemerald-expansion` ("RHH") pinned at expansion **1.13.2**
(`include/constants/expansion.h`), ~1986 commits behind latest (**1.16.2**). Upstream has fixed many
broken mechanics we still ship — the trigger was **Endure lasting the whole battle** instead of one
turn, fixed upstream in **1.13.3, PR #7838**. See T-049 for the full changelog audit (~760 minor +
~45 major bugfixes across 1.13.3→1.16.2).

Two forces shape how we take those fixes:
- **We do not want upstream features.** Brooktec is a *curated* rebalancing experience; new mechanics
  (12v12, Dynamic Weather, Champions content, native random-mon generation, new species/moves) would
  change the game our users get. We are interested in **correctness fixes only**.
- **Our randomizer has a hard data-file contract.** The pipeline parses/writes a specific set of C
  data files (the "Source mutated by the randomizer/rebalancer" list in `CLAUDE.md` →
  *Generated files*). Upstream changes to the **format/macros/location** of those files silently
  break our parsers/writers even when git merges cleanly (teachable_learnsets removed, tutor arrays →
  `special_movesets.json`, `trainers.party` ball-enum + LFS, `species_info` new fields, etc.).

A full tag-by-tag merge (upstream's own recommended path) would drag in both features and the
format migrations — exactly what we want to avoid.

## Decision

**We absorb upstream strictly as bugfixes, cherry-picked, one release version at a time, in order.**
For each version, we take only commits that satisfy **all three**:
1. they fix a bug (not a feature, refactor-for-a-feature, content, or pure doc/test-infra change);
2. they do **not** modify a sensitive file (the randomizer-parsed set defined in `CLAUDE.md`);
3. they apply cleanly with `git cherry-pick -x` (the `-x` records the source commit for provenance)
   without dragging in a feature/refactor they depend on.

Anything failing (2) or (3), plus anything borderline fix-vs-feature or gameplay-balance-affecting,
is **escalated to the owner** before it is taken or skipped. Features and sensitive-file changes are
**excluded by policy**.

We **do not merge release tags**, so `include/constants/expansion.h` stays at our true merge-base
(1.13.2). The record of which upstream fixes we have absorbed lives in a dedicated ledger — see
`docs/upstream-bugfix-sync.md`, which is the SSOT for the **bugfix frontier**.

The repeatable per-version procedure and the state ledger both live in
[docs/upstream-bugfix-sync.md](../upstream-bugfix-sync.md). Each version is one task
(`tasks/T-NNN-…`) on its own branch.

**Shortcut, owner-approved per version:** a release that is 100% bugfix *and* touches no sensitive
file (typically the patch releases `.1`–`.4` on a minor line we are already on) MAY be merged
wholesale instead of cherry-picked, since a merge preserves fix dependencies and is equivalent in
that case. This is the exception, not the rule.

## Alternatives considered

- **Full tag-by-tag merge to 1.16.2** (upstream's recommended path) — rejected: drags in features and
  the data-format migrations, changing the curated game and breaking randomizer parsers.
- **Rebase our ~1207 commits onto upstream** — rejected: rewrites published history of a deployed
  fork.
- **One-off ad-hoc patches when a bug annoys us** — rejected: not reproducible, no record of coverage,
  guarantees drift.
- **Bump `expansion.h` as we complete each version** — rejected: we have not merged the tag, so
  claiming the version would be false; the ledger tracks the real frontier instead.

## Consequences

- We stay current on **correctness** without gameplay or data-format churn.
- Reproducible and auditable: every taken commit is `-x`-annotated; every skip/defer is logged with a
  reason in the ledger. The ledger answers "up to which version are we patched".
- **Cost:** manual per-commit screening per version; the effort and conflict rate **grow with depth**
  (feature-entangled fixes in `.0` releases may be undeliverable via cherry-pick and get escalated).
- `expansion.h` no longer reflects our true fix level — **the ledger is the SSOT** for that. Anyone
  reasoning about "which upstream fixes do we have" reads the ledger, not `expansion.h`.
- Validation per version: `make check` (mgba battle tests, including any cherry-picked test that
  reproduces the fixed bug — this is how a C-engine bug like Endure satisfies the regression-test
  iron rule); plus `cd randomizer && npm test` + a full `node analyze.js` **only if** a cherry-pick
  ever touches a sensitive file (it should not, by policy).
