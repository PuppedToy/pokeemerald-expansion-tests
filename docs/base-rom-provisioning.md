# Provisioning the base ROM on a box

Since [T-244](../tasks/T-244-base-injection-decommission-old-maker.md) every delivered artifact is
**injected** into a prebuilt base ROM. That base is three files:

| file | what it is | size |
|---|---|---|
| `base/pokeemerald.gba` | the base ROM every user's data is written into | 32 MB |
| `base/pokeemerald.map` | the linker map — where each symbol lives | ~3.9 MB |
| `base/pokeemerald.sym` | `make syms` (`objdump -t`) — also the **local** symbols (map-script labels) | ~4.6 MB |

They are **build artifacts, not source**: gitignored (`*.gba`, `*.map`, `*.sym`), too big for git, and
produced by one `make && make syms` on a machine with the devkitARM toolchain. Nothing in a git clone or a
deploy carries them, so a box has to be given them once — and again after any change to the C sources.

## The one invariant

**All three must come from the same build.** The `.map`/`.sym` name addresses *inside that exact ROM*; pair
a ROM with another build's map and injection writes correct-looking values at wrong offsets. This is the
one thing no automated check can recover from — the injector defends it per table (it reads its anchors
back out of the ROM and refuses on a mismatch: see
[injection.md](../randomizer/docs/injection.md#ids-and-struct-offsets)), but the way to not have the problem
is to always install the three together, which is what the script below does.

Two more rules the script enforces:

- **Build from a clean tree.** `git checkout -- src/ include/ data/maps/` first. A base built from a
  randomized tree bakes one run's data into *everyone's* ROM.
- **Re-run after any source change.** Injection reads some of the base's own sources at inject time
  (item prices, learnsets, wild slots, the `.party` files — see
  [Deriving writes from the compile path](../randomizer/docs/injection.md#deriving-writes-from-the-compile-path)).
  If those disagree with the base, injection refuses. `make.js`'s `checkInjectInputsClean()` catches the
  local-dirt case; a stale *base* is caught by the injector's anchors.

## Installing it

```sh
deploy/build-base.sh              # build on the box + install into <DEPLOY_PATH>/base/ + restart the app
deploy/build-base.sh --fetch      # …and copy the three artifacts down into ./base/ (to run a gate locally)
deploy/build-base.sh --dry-run    # print what it would run
```

It runs inside the app container (which has the toolchain), so the box builds its own base: clean tree →
`make -j$(nproc) && make syms` → install → `buildOffsetMap.js` → restart. Expect **~4 min warm, ~20 min
cold** on the 2-core box ([rom-build-performance.md](rom-build-performance.md)).

`buildOffsetMap.js` prints two things worth reading every time:

- the **ROM budget** against the 32 MB ceiling (GATE-1);
- the **per-module readiness table** — which claimed symbols the base actually exports. A table missing here
  is the T-234/T-237 trap: LTO folded a constant and garbage-collected the table nothing reads any more, so
  injecting it would be a silent no-op. Catching it here costs seconds; catching it in a play-test costs days.

## Why deploys don't carry it

`deploy/update.sh` mirrors the working tree with `rsync --delete`, including gitignored runtime assets. It
**excludes `/base/`** deliberately: otherwise a deploy from a machine that happens not to have a local
`base/` would *delete the box's base* and break every build. The base is box-managed state, like
`backend/data/` (SQLite, frozen corpus bundles) and `roms/`.

`update.sh` checks the box's base as a preflight and warns if it is missing or incomplete — a
docs-or-frontend-only deploy to a box awaiting its first base build is legitimate, so it warns rather than
aborting.

## When the base is missing

The app checks at boot (`backend/build/baseReadiness.js`) whenever real builds are on (`FAKE_BUILD=0`):

- it logs what is missing, where it looked, and the command that fixes it;
- it **does not start the build worker**, so requests wait in the queue instead of marching to `failed`
  one at a time;
- the admin panel shows *"⚠ no base ROM on the box — builds are held"* next to the queue counters, so the
  symptom ("nothing is building") is answerable without reading container logs.

Install the base and restart the app; the queue drains on its own.
