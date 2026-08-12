---
name: deploy
description: Deploy to production, deciding by itself whether the prebuilt base ROM has to be rebuilt too. Reads the base's provenance stamp, then takes one of two real paths — app-only (update.sh) or base-relevant (update.sh + build-base.sh) — checks for in-flight user builds first, verifies the result against the live site, and reports. Use whenever the owner greenlights a deploy ("deploy", "despliega", "sube esto a producción").
---

# Deploy

Ship the current tree to the box and leave production **coherent**: the app *and* the artifact its ROMs
are injected into. Since T-244 every delivered ROM is injected into the box's prebuilt
`base/pokeemerald.{gba,map,sym}`, which `update.sh` deliberately does not carry — so a deploy alone can
leave the box serving an app whose sources disagree with its base, which makes the injector refuse every
build (or ship ROMs missing what the docs promise). **Deciding that is this skill's job, not the owner's.**

Ground rules (CLAUDE.md): the agent **never pushes**. The owner pushes and greenlights; invoking this skill
is the greenlight for `deploy/update.sh` and, when the verdict says so, `deploy/build-base.sh`.

## 0. Preconditions — stop, don't improvise

```sh
git status --short                     # must be clean; a dirty tree is what gets rsynced
git fetch origin && git rev-list --left-right --count origin/master...master
```

- **Not `0 0`** → the owner has not pushed (or is behind). **Stop** and say so; never deploy un-pushed code.
- **Dirty tree** → stop and show what is uncommitted. `update.sh` mirrors the working tree, so uncommitted
  files would go live unrecorded.

## 1. The verdict — which path is this?

```sh
node scripts/base-state.mjs --json     # exit 0 = in-sync · 10 = rebuild-required · 2 = cannot tell
```

It compares a **fingerprint** (sha256 over the git blob ids of every path `make` reads) against the stamp
`deploy/build-base.sh` left in `base/BASE_BUILD.json` on the box. Read `verdict`, and keep `reason`,
`commitsSinceBase` and `changedBasePaths` — they go in the report.

- `exit 2` (box unreachable / no `DEPLOY_HOST`) → **stop**. Do not deploy blind; report the error.
- Classification lives in `scripts/base-state.mjs` and is by exclusion (unknown path ⇒ base-relevant), so a
  new source root can only ever cause one extra rebuild, never a silent mismatch. Don't second-guess it
  here; if it is wrong, fix the classifier and its tests.

## 2. Before touching the box: in-flight user builds

Both paths recreate the `app` container, which **kills any build in progress** (observed 2026-08-12: a
user's ROM died with `make.js exited with code null` mid-deploy).

```sh
set -a; . deploy/.env.local; set +a
SSH="ssh -i ${DEPLOY_KEY/#\~/$HOME} -o IdentitiesOnly=yes ${DEPLOY_USER:-root}@$DEPLOY_HOST"
$SSH "cd ${DEPLOY_PATH:-/opt/emerald} && docker compose -f deploy/docker-compose.yml exec -T app node -e \"
const {DatabaseSync}=require('node:sqlite');
const db=new DatabaseSync('backend/data/app.db',{readOnly:true});
console.log(db.prepare(\\\"SELECT state, COUNT(*) n FROM requests WHERE state IN ('building','queued') GROUP BY state\\\").all());
\" </dev/null"
```

- Nothing `building`/`queued` → carry on.
- Something is → **tell the owner and wait** for a go-ahead. A build is ~16 s (injection) plus queue; the
  usual answer is "wait a minute and go". Killing a stranger's build to save 60 s is not our call.

## 3a. Path 1 — the base is in sync (app-only change)

```sh
deploy/update.sh                       # preflight (4 suites + tracker) → rsync → recreate → health-check
```

Run it in the background and poll its log — it is 2-4 min. It aborts before touching the box if anything is
red. Then go to §4.

## 3b. Path 2 — the base must be rebuilt (base-relevant change)

Say so first, in one line: what changed (`changedBasePaths`), and that the base rebuild is **10-20 min** on
the box because it starts from `make tidy`. Then, **in this order**:

```sh
deploy/update.sh                       # must go first: build-base.sh compiles the BOX's tree
deploy/build-base.sh                   # tidy → make -j all syms → install → offsets → client artifacts
                                       # → smoke-inject → stamp BASE_BUILD.json → restart
```

Order is not cosmetic: `build-base.sh` refuses to run unless the box's `backend/data/deployed.json`
fingerprint matches this tree, precisely so a base can never be stamped with sources it was not built from.

Run each in the background (the base build is long) and poll — and **capture the script's own exit status**,
not the pipeline's:

```sh
set -o pipefail; deploy/build-base.sh 2>&1 | tee /tmp/ec-basebuild.log
```

Without `pipefail`, `| tee | tail` reports the *tail's* status and a failed build is announced as "exit code
0" (that happened on 2026-08-12, over the compile error that turned out to be B-075). Read the log's tail
regardless of the status; §4 is what actually decides.

Watch for:

- `Error: symbol ... is already defined` / `make: *** [...] Error 1` → the tree does not assemble. **Stop**,
  register the bug, and fix it with a guard in `scripts/__tests__/asm-duplicate-labels.test.mjs`-style so the
  next occurrence costs a second in preflight instead of 20 minutes here.

- `✗ INJECTION FAILED against the freshly built base` → the base was **moved aside**
  (`base-rejected-<ts>`) and the app now holds the queue instead of failing requests. **Stop** and report
  with the tail of the log — a base that cannot be injected into is a real defect, usually the LTO trap
  (T-234/T-237) or a source/base struct mismatch (see `randomizer/docs/injection.md`).
- `⚠ no golden-corpus bundle on this box` → the smoke test was skipped; say so plainly, the base is
  installed but unproven.

## 4. Verify — against the live site, not the script's own output

```sh
node scripts/base-state.mjs                                   # MUST now print in-sync (path 2 especially)
curl -sI https://pokemon-emerald-cut.com | head -1            # 200
curl -sL https://pokemon-emerald-cut.com/<changed asset>       # spot-check the change is really served
```

Production serves `frontend/dist`, so a frontend change must be grepped out of the **minified** asset
(`/css/*.css`, `/js/*.js`) — the deploy rebuilds it, but proving it is one curl. Remind the owner to
hard-refresh (⌘⇧R) before judging a UI change.

## 5. Report

Say, in this order: which path ran and **why** (the verdict's reason), what is live now, what you verified
(with the actual values), whether the base was rebuilt or is knowingly stale, and any collateral (a killed
build, a skipped smoke test, a `base-rejected-*` left behind). If anything is unresolved, name the next
command — never end on "should be fine".

## Reference

- `docs/dev-deploy-workflow.md` — the whole loop, config, rollback.
- `docs/base-rom-provisioning.md` — the base's invariants (all three artifacts from one build).
- `randomizer/docs/injection.md` — why source/base drift is fatal per table.
