# Dev → deploy workflow

The whole loop, top to bottom. The goal is that **shipping a change is always the same few commands**
and that **broken code can never reach production** (the deploy refuses red tests).

## TL;DR

```bash
# 1. develop with tests, then:
cd randomizer && npm test          # Jest  (randomizer logic)
cd backend && npm test             # node:test (backend)
# 2. commit (per task/bug) + push
git add -A && git commit -m "feat: … (T-NNN)"
git push origin master --follow-tags
# 3. deploy — one command (runs preflight, rsyncs, recreates, health-checks)
deploy/update.sh
```

## 1. Develop (TDD)

- **Backend** logic → `cd backend && npm test`. **Randomizer** → `cd randomizer && npm test`.
- Red → Green → Refactor (CLAUDE.md). Bugs start from a failing regression test named with the `B-NNN` id.
- The app/frontend run locally with a fake build (no GBA toolchain needed):
  `cd backend && FAKE_BUILD=1 npm start` → http://localhost:3000 (verification links print to the console).

## 2. Commit

- One logical change per commit, Conventional Commit, referencing the task/bug id in the body.
- Branch per task (`feature/T-NNN-slug` → merge `--no-ff` into `master`).
- Closing a task/bug updates the tracker (`node scripts/check-tracker.mjs --write`) and, if user-visible,
  adds a `CHANGELOG.brooktec.md` `[Unreleased]` line.

## 3. Push

```bash
git push origin master --follow-tags
```

## 4. Deploy to the box — `deploy/update.sh`

> **Owner-gated (agent has no push permission).** The **owner** runs the `git push` in step 3 and then
> **explicitly greenlights** the deploy; only then does the agent run `deploy/update.sh`. The agent never
> pushes and never deploys un-pushed or un-greenlit code. (Doing it yourself is fine — it's one command.)

One command does everything, and **aborts before touching the box if anything is red**:

1. **Preflight** — runs the randomizer + backend + frontend test suites and `check-tracker`. Any failure →
   abort. It also checks that the box has a usable **base ROM** and warns if not (see below).
2. **rsync** your working tree to the box (mirrors exactly what you have, including the gitignored
   runtime assets), **preserving** the box's `.git`, `backend/data` (SQLite), `roms/`, `base/` and the warm
   `build/` cache.
3. **Recreate** the `app` container (picks up the new bind-mounted code) and **health-check** `/api/me`.

```bash
deploy/update.sh              # full deploy
deploy/update.sh --dry-run    # preview what would sync; no changes on the box
deploy/update.sh --skip-tests # (escape hatch) skip the preflight
```

Config lives in **`deploy/.env.local`** (gitignored; env vars override it):

```
DEPLOY_HOST=167.233.130.107      # or pokemon-emerald-cut.com
DEPLOY_USER=root                 # Hetzner default
DEPLOY_PATH=/opt/emerald
DEPLOY_KEY=~/.ssh/emerald_box
```

### The base ROM — the second step, and how the deploy knows it needs it

Since T-244 every delivered artifact is **injected** into `base/pokeemerald.{gba,map,sym}`. Those are
gitignored build artifacts that `update.sh` deliberately does **not** carry, so they are installed
separately and then survive every deploy:

```bash
deploy/build-base.sh          # build on the box + install + stamp + restart (~10-20 min: starts from `make tidy`)
```

**Nobody has to remember when** (T-273). A base is *stamped* at build time with the fingerprint of the
sources it came from — `base/BASE_BUILD.json`, a sha256 over the git blob ids of every path `make` reads —
and `update.sh` records which tree the box holds in `backend/data/deployed.json`. Comparing the two is a
command, and the deploy branches on it:

```bash
node scripts/base-state.mjs          # exit 0 = in-sync · 10 = rebuild-required · 2 = cannot tell
node scripts/base-state.mjs --json   # same, machine-readable (what the deploy skill reads)
```

| verdict | what it means | path |
|---|---|---|
| `in-sync` | the base was built from exactly these sources | `deploy/update.sh` and you are done |
| `rebuild-required` | different sources, no stamp, no base, or uncommitted base-relevant changes | `deploy/update.sh` **then** `deploy/build-base.sh` |

Which paths count as "base-relevant" is decided **by exclusion** in `scripts/base-state.mjs` (an
unrecognised path counts as base-relevant, so the worst case is one needless rebuild rather than a base that
silently disagrees with its sources); the classifier is covered by `scripts/__tests__/base-state.test.mjs`,
which runs in the deploy's own preflight.

Two guards worth knowing: `update.sh` prints a loud warning (and repeats it at the end) when it deploys onto
a stale base, and `build-base.sh` **refuses** to stamp a base unless the box is holding the tree it is being
run from — otherwise the stamp would label a base with sources it was not built from, which is the exact
drift the stamp exists to catch. `--force` overrides it (first bring-up, whose deploy predates the stamp).

Full rules (including the all-three-artifacts-from-one-build invariant) in
[base-rom-provisioning.md](base-rom-provisioning.md). If the base is missing, the app starts but holds the
build worker: requests queue instead of failing, the boot log says so, and the admin panel shows a warning.

> The whole sequence — verdict, in-flight-build check, one of the two paths, verification against the live
> site — is the `/deploy` skill (`.claude/skills/deploy/SKILL.md`).

## 5. Verify

- `curl -sI https://pokemon-emerald-cut.com` → `200`; the script also prints the live `/api/me` (401).
- Logs: `ssh -i ~/.ssh/emerald_box root@<host> 'cd /opt/emerald && docker compose -f deploy/docker-compose.yml logs -f app'`.
- Verification emails: real via Brevo in prod; in dev (`FAKE_BUILD`/no `BREVO_API_KEY`) they print to the logs.

## Rollback

```bash
git checkout <previous-sha>   # locally
deploy/update.sh              # redeploys that tree to the box
git checkout master           # back to tip when done
```

## First time / fresh box

See [deploy-oracle.md](deploy-oracle.md): §2c (create a Hetzner box) → §3 (`bootstrap.sh`) → §4b
(deploy gotchas). After the first bring-up, day-to-day is just `deploy/update.sh`.
