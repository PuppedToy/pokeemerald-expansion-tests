# ROM build-time performance — analysis & optimization runbook

Reference for **why a ROM build takes what it takes** and **exactly how to make it faster**. Findings
are measured against the live production box and the per-ROM build logs, July 2026. Work tracked in
[T-228](../tasks/T-228-analysis-rom-build-time-optimization.md); the strategic endgame is
[T-054](../tasks/T-054-binary-injection-randomizer-viability.md) (binary injection). Delivery format is
BPS ([ADR-013](adr/ADR-013-bps-patch-delivery-client-side.md)).

> This documents the *build pipeline* performance only. It is not a rating/algorithm doc.

## TL;DR

- **The BPS patch step is negligible** (~0.1–0.6 s). "Generating the patch" is **~100 % `make`** (the C
  compile of the ROM). Do not optimize the BPS codec.
- **A build is fast (~55 s) or slow (~150–230 s) depending on ONE thing: is the build tree warm or
  cold.** Cold builds re-do work that the randomizer never asked for.
- **The tree goes cold on DEPLOY, not on a new randomization.** A new nuzlocke batch or an individual
  ROM builds *warm* (~55 s) as long as no deploy happened in between. (Proof + mechanism below.)
- The single most valuable, lowest-risk fix is to **stop deploys from cold-invalidating the tool
  cache** (and/or **pre-warm** after deploy). Everything else (LTO, ccache, more cores, T-054) stacks
  on top.

## The real production architecture (as measured, not as documented)

Inspected read-only via `root@pokemon-emerald-cut.com` (key `~/.ssh/emerald_box`).

| Fact | Reality (measured) | What the docs/config say |
|---|---|---|
| Host | Hetzner x86_64, `ubuntu-4gb-fsn1-16` (Falkenstein `fsn1`) | `deploy/.env.local` still has **OCI/Oracle ARM** vars; `docs/deploy-oracle.md` treats Oracle A1 as primary |
| CPU | **2 vCPU**, AMD EPYC-Rome | ADR-001 title says Hetzner **CX43** (8 vCPU/16 GB) — box is much smaller |
| RAM | **3.7 GiB** + 4 GB swapfile | — |
| Disk | 38 GB, ~24 GB free | — |
| Where builds run | **Inside the `deploy-app-1` container that also serves the web app** (repo bind-mounted at `/app`; `build/`, `.git`, `backend/data` persist on the host across deploys) | ADR-002 (Docker/Compose/Caddy) ✓ matches |
| Toolchain | `arm-none-eabi-gcc 12.2`, **no ccache** | — |
| Built ROM | **32 MB** (vanilla is 16 MB) | — |
| Per-ROM ETA | `AVG_ROM_SECS=180` in the container env — **stale, must be unset or set to ~17** (T-245) | eta.js default **17 s**, the injection cost measured on the box (was 270 for the compile path) |

**Docs to reconcile** (see [T-228](../tasks/T-228-analysis-rom-build-time-optimization.md)): `deploy/.env.local`
(OCI → Hetzner), `docs/deploy-oracle.md` (Oracle-primary framing), ADR-001 (CX43 vs the actual small box).
ADRs are immutable once accepted — reconcile by a superseding note/ADR, not by rewriting.

## Where the ~3 minutes actually go

Per-ROM flow ([make.js `buildOneRom`](../make.js#L118)): write game files (fast) → **`make`** (the whole
cost) → **`createBps`** (<1 s) → `restore()` (git checkout).

**BPS is not the bottleneck.** `createBps` ([randomizer/bps.js](../randomizer/bps.js)) benchmarked on the
16 MB vanilla ROM: 0.1 s (identical) → 0.3 s (12 MB delta, worst realistic case). A 32 MB target is still
well under a second. Leave it alone.

**`make` is the bottleneck**, and it is bimodal.

## The cold-vs-warm mechanism (the core finding)

Durations mined from `/app/backend/data/logs/*.log` (each carries a `=== build start … @ ISO ===`
marker; end = file mtime). Classifying by number of C compiles (`cc1`) and graphics conversions
(`gbagfx`):

| Build class | `cc1` (C files) | `gbagfx` (graphics) | Duration | When it happens |
|---|---|---|---|---|
| **Warm** | ~116–118 (randomizer fan-out only) | 0 | **~55 s** | No deploy since the last build |
| **Graphics-cold** | ~116–120 | ~15 k–20 k (≈all) | **~150 s** | First build after a deploy |
| **Fully cold** | **343 (all)** | ~20 k + sound (`mid2agb`) | **~220 s** | Deploy that also bumped a widely-included header/tool |

The decomp has **344 C translation units**. A warm build recompiles only the **~116** that transitively
include what the randomizer mutates (species/base-stat headers, `constants/tms_hms.h`, learnsets, map
scripts → `data/event_scripts.s`). The extra ~95–165 s of a cold build is **regenerating graphics
(`gbagfx`)** and sometimes **all C + sound** — work the randomization did not change.

### Why the tree goes cold on deploy (root cause)

[`deploy/update.sh`](../deploy/update.sh) `rsync`s the working tree to the box, which **overwrites the
box's Linux tool binaries with the host's (macOS) ones**; because those aren't Linux-executable, the
script then runs **`make clean-tools && make tools`** on every deploy (update.sh ~line 84). That rebuilds
`gbagfx`, `preproc`, `scaninc`, `mid2agb` with a **fresh mtime**. Since `gbagfx` is a prerequisite of
every graphics target (and `preproc`/tools of the C/data targets), the **next** `make` sees the tools as
newer than all outputs and **regenerates all graphics** (graphics-cold, ~150 s); a deploy that also
touches a broadly-included header additionally forces the **full 343-file C rebuild + sound** (fully
cold, ~220 s).

### Answer: deploy only — NOT per-batch, NOT per-ROM

**A new nuzlocke batch or an individual ROM does not cool the tree.** This is not just correlation, it is
mechanical: the randomizer/writer never touches `graphics/`, `sound/`, or the tool binaries — only
`src/`, `include/`, `data/maps/` (restored via `git checkout` after each ROM). Therefore a new
randomization **cannot** invalidate graphics/sound/tools; only a deploy's `make tools` can.

Empirical confirmation:
- Within a bundle, `rom0` may be cold, but `rom1/rom2/rom3…` are always warm (~55–85 s) — e.g. bundle
  `a7efd7ad`: 157 s, 82 s, 59 s, 58 s, 59 s, 59 s.
- **Across different bundles with no deploy in between, the second bundle builds warm** — e.g.
  `b972dc3d` (18:31) → new bundle `a2e578a6` (18:38) both 55 s; `c69a13af` (08:34) → new bundle
  `2cadff3f` (08:37) both 55–56 s. A brand-new randomization is 55 s, not 220 s, when the tree is warm.

**Practical caveat:** during active development, deploys are frequent (≈hourly on busy days — every
`deploy-snapshot` commit + tool rebuild), so in practice a meaningful share of *real user* builds land
right after a deploy and pay the cold penalty. It is 100 % avoidable without touching ROM quality.

Secondary, minor factor: after long idle the OS page-cache is evicted, so the first build re-reads the
toolchain/headers from disk (same commands, slightly slower). Small next to the graphics-rebuild effect,
and largely mitigated by the same fixes.

## Every optimization option — exact steps, effort, risk, expected impact

Ordered by value-for-effort. Measure each on the box with the log-duration method (below); we have no
local GBA toolchain ([CI/box only](../.github/workflows/build.yml)).

### Option A — Stop deploys from cold-invalidating the tree  ★ highest value / lowest risk

The graphics-cold penalty exists only because every deploy rebuilds the tools. Two independent ways to
kill it; A2 is the clean root fix, A1 is the brute-force safety net. They compose.

**A1 — Pre-warm after deploy.** Append one throwaway build to `update.sh` *after* `make tools` and the
`up -d`, so the graphics regenerate during the deploy (when nobody is waiting) instead of on the first
user's ROM:
```sh
# after 'up -d --force-recreate app' + health check, still inside the ssh block:
&& docker compose -f deploy/docker-compose.yml exec -T app sh -lc 'make -j2 >/tmp/warm.log 2>&1 && echo "   build tree pre-warmed"'
```
- Effect: first post-deploy user gets ~55 s instead of ~150–220 s.
- Cost: +~3 min of deploy wall-time (unattended). Risk: ~none.

**A2 — Don't rebuild tools every deploy (root fix).** The rebuild is only needed because the `rsync`
overwrites the box's Linux tool binaries with host binaries. Exclude the compiled tool binaries from the
rsync so the box keeps its valid Linux ones and `make tools` becomes a no-op (no mtime bump → no graphics
invalidation):
```sh
# in update.sh rsync: add binary excludes (keep shipping tool *source*, drop compiled artifacts)
--exclude 'tools/*/*.o' --exclude 'tools/**/*.o' \
--exclude 'tools/agbcc/**' \
# …and the specific built binaries: tools/gbagfx/gbagfx, tools/preproc/preproc, tools/scaninc/scaninc,
#    tools/mid2agb/mid2agb, tools/rsfont/rsfont, tools/jsonproc/jsonproc, etc.
```
Then `make tools` only runs when a tool *source* actually changed (rare). Verify with a no-op deploy that
the next build is warm (`gbagfx` count 0). Risk: low-medium — must enumerate the binaries correctly, and
keep a `make tools` fallback if a tool source changed. This is the elegant fix: **every** deploy then
leaves the tree warm and no pre-warm is needed.

### Option B — ccache  ★ high value, attacks cold rebuilds directly

Cold builds recompile files whose *content did not change* (only mtimes bumped). `ccache` turns those
into cache hits, collapsing both the graphics-cold C portion and the fully-cold 343-file rebuild toward
link-only time; it also helps warm builds.

Steps:
1. Add `ccache` to [`deploy/Dockerfile`](../deploy/Dockerfile) apt list; rebuild the image.
2. Point the compiler at it — either `CC="ccache arm-none-eabi-gcc"` or prepend the ccache symlink dir to
   `PATH`. The decomp Makefile resolves `cc1` via `--print-prog-name`; verify ccache actually wraps the
   `.c → .o` recipe ([Makefile ~L405/423](../Makefile#L405)).
3. Persist the cache across container recreates: bind-mount a host dir to `CCACHE_DIR` in
   [`docker-compose.yml`](../deploy/docker-compose.yml), size it (`ccache -M 2G`).
4. **LTO caveat:** the build uses `-flto=auto -fno-fat-lto-objects` (Makefile L131). ccache + LTO works
   but store fat-LTO or set `ccache --set-config=run_second_cpp=true`; validate a produced ROM boots.
- Effect: cold builds drop substantially (I/O + recompute avoided). Risk: medium (LTO interaction, cache
  correctness — always verify a round-tripped ROM).

### Option C — Cheaper optimization flags for the per-user build  ★ lowers the warm floor too

Production compiles at `-O2 + -flto=auto` (Makefile L120 `O_LEVEL?=2`, L129-131 LTO on unless `LTO=0`).
`make.js` runs a bare `make -j` ([make.js L169](../make.js#L169)) and never disables it, so **every** ROM
pays the full whole-program LTO link.

Steps: pass flags from `make.js`'s `run('make', …)` (bundle + randomize paths):
```js
run('make', ['-j', String(jobs), 'LTO=0']);        // drop whole-program link-time optimization
// and/or force a cheaper per-file opt for build speed:
run('make', ['-j', String(jobs), 'LTO=0', 'O_LEVEL=1']);   // or NOOPT=1 for -O0 (fastest compile)
```
- Effect: cheaper link (LTO=0) and cheaper compile (O1/O0) on **cold and warm** builds.
- Trade-off: a slightly less-optimized ROM (the Makefile notes LTO helps "especially audio processing").
  On emulator this is typically imperceptible — **A/B a produced ROM** before adopting.
- Risk: low (toggles already exist and are supported by the decomp Makefile).

### Option D — More cores (2 → 4 vCPU)  ★ trivial, helps the cold case most

`make -j` is bounded to the box core count ([make.js `resolveJobs`](../make.js#L62); `BUILD_JOBS` env
overrides). At 2 vCPU the 343-file cold compile barely parallelizes. A Hetzner plan bump to 4 vCPU
roughly halves the compile phase (the LTO link parallelizes less). Also relieves the web app, which today
shares 2 cores with an in-progress build.
- Steps: resize the box; confirm `nproc`=4 in the container; optionally set `BUILD_JOBS`.
- Cost: a few €/mo. Risk: none. Note: contradicts nothing except ADR-001's stated CX43 (already off).

### Option E — Parallelize multi-ROM bundles

Today a bundle's ROMs build **serially** (`buildOneRom` in a loop). Because each ROM mutates and
`git checkout`-restores the shared tree, they can't share a working tree — but they could run in parallel
**git worktrees** with separate `build/` dirs.
- Effect: wall-clock for an N-ROM bundle drops toward ~1 ROM instead of N. Big for 3–6 ROM nuzlocke
  groups.
- Cost: N× CPU/RAM during the bundle (needs Option D headroom); worktree plumbing in the queue/scheduler
  ([ADR-005](adr/ADR-005-two-tier-preemptive-build-queue.md)). Risk: medium.

### Option F — Reduce the warm-build fan-out

The ~116-file warm floor is the transitive include fan-out of the randomizer's mutations. Narrowing which
broadly-included headers get mutated (e.g. isolating `constants/tms_hms.h`) would shrink it. Fiddly, and
dominated by the LTO link anyway — low priority next to A–D.

### Option G — T-054 binary injection (the endgame)  ★ eliminates compilation entirely

Build the expansion base **once**, then randomize by **injecting binary data into the prebuilt ROM** — no
`make` per user → **seconds, not minutes**. Named in [ADR-013](adr/ADR-013-bps-patch-delivery-client-side.md)
as the second half of the architecture; scoped in [T-054](../tasks/T-054-binary-injection-randomizer-viability.md)
(writer data-vs-code audit, variable-length table repointing, patch-friendly base, symbol-map offsets).
Large project, but it also dissolves the queue and unlocks a toolchain-free offline app.

## How to measure (on the box, read-only)

```sh
# per-ROM real durations (start marker -> file mtime) + recompile counts:
docker exec deploy-app-1 sh -c 'cd /app/backend/data/logs; for f in *.log; do
  s=$(date -d "$(grep -m1 "build start" "$f" | sed -E "s/.*@ ([0-9T:.-]+Z).*/\1/")" +%s 2>/dev/null) || continue
  d=$(( $(stat -c %Y "$f") - s )); [ "$d" -lt 40 ] && continue
  printf "%3ds cc1=%s gbagfx=%s %s\n" "$d" "$(grep -c "cc1 " "$f")" "$(grep -c gbagfx "$f")" "$f"
done | sort -n'
```
`cc1≈116 & gbagfx=0` → warm (~55 s). High `gbagfx` → graphics-cold. `cc1=343` → fully cold. Compare
before/after any change; recalibrate `AVG_ROM_SECS` once stable.
