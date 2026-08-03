# Can the injector run in the browser? — evaluation

Written for [T-246](../tasks/T-246-base-injection-frontend-delivery-uat.md), whose acceptance criterion is
*"client-side/offline injector evaluated (spike or follow-up task)"*. Verdict up front: **yes, and it is a
smaller job than it looks — but not a flag, a refactor.** Tracked as
[T-249](../tasks/T-249-client-side-offline-injector.md).

The payoff [ADR-013](adr/ADR-013-bps-patch-delivery-client-side.md) and
[ADR-022](adr/ADR-022-base-plus-injection-architecture.md) anticipate: **zero server compute per user**, and
a toolchain-free offline/desktop path.

## Why it is close

Everything expensive already runs client-side. The randomizer itself — every value decision — is
`frontend/js/randomizer.bundle.js` in a Web Worker; the server never randomizes
([RANDOMIZER.md](RANDOMIZER.md)). ADR-013 already put a **BPS patcher** (`frontend/js/bps.bundle.js`,
5.6 KB) and the user's **vanilla ROM in IndexedDB** (`frontend/js/rom-store.js`) in the browser. So the
browser already holds the data and can already apply a patch to a ROM it owns.

What the server still does is the *sink*: write ~427 KB of that data into the base ROM (measured on the
`baseline` corpus bundle). That is `randomizer/injector/` — pure JS: buffer writes, no native deps, no
network.

## The four things that block it, and what each costs

### 1. The base ROM in the browser — solved, not shipped

Never ship 32 MB. `base = vanilla + base.bps`, and the user already supplies vanilla: serve **one static
`base.bps`** (vanilla→base), apply it with the patcher that is already bundled, keep the result in
IndexedDB. One immutable, cacheable file for every user and every run, instead of a per-run server build —
strictly *less* exposure than today's per-run BPS, which ADR-013 already treats with ROM-like caution.
Nothing new is decided here; it is the same artifact class.

### 2. The source-derived inputs — the actual work

The injector reads the base's **own sources** at inject time, deliberately
([Deriving writes from the compile path](../randomizer/docs/injection.md#deriving-writes-from-the-compile-path)):
the writer's own function runs over the base source and the diff is injected, so a rule like "only patch
prices that are plain numbers" has exactly one home. Measured: **~5.8 MB** across the 9 species-info
headers, both learnset files, `items.h`, `wild_encounters.json`, both `.party` files and `charmap.txt`,
plus `include/constants/*.h` for the id tables.

14 of the injector's files call `readFileSync`. They must instead receive that content. There is already a
seam — group modules accept a `sources` object (used by the parity harness) — so the shape is known; what
is missing is (a) baking the inputs into one artifact at base-build time (the natural home is
`buildOffsetMap.js`, which already emits `base-offsets.json`), and (b) removing `fs`/`path` from the module
graph so it bundles. Gzipped, those inputs are perhaps ~1 MB; they change only when the base does, so they
cache like the base.

### 3. The offset map — free, and it pays for itself twice

Don't parse a 3.9 MB linker map in a browser: `buildOffsetMap.js` already precomputes
`base-offsets.json`. Note this is also a **server-side win today** — parsing the `.map` costs **4.1 s of
every ROM** (measured; see [T-250](../tasks/T-250-map-parse-quadratic-symbol-sizing.md)), so the artifact a
browser needs is the same artifact that would make the server faster. Whichever lands first helps the other.

### 4. Verification must not fork

The corpus gate (GATE-3, [ADR-023](adr/ADR-023-injection-verified-by-data-equivalence.md)) runs in Node. A
second implementation would be unverifiable, so the browser must run **the same modules** with inputs
plumbed differently — which is exactly what items 2 and 3 arrange. The cheap ongoing proof is a test that
injects the same bundle through both paths and compares sha256; today's evidence that this is realistic is
that the box and a local Mac already produce byte-identical output (`3f71cf9b0185…`, T-244).

## What does *not* work client-side

- **The BPS delta against vanilla.** The user's browser has vanilla and can compute its own delta, so this
  is fine — but the *server* would no longer see a patch at all, which is the point.
- **Anything needing the toolchain.** Building the base still needs `make` on a machine that has devkitARM
  ([base-rom-provisioning.md](base-rom-provisioning.md)). Only *injection* moves.
- **Diagnostics/decision logs** currently written server-side per run would need to be uploaded, or
  accepted as lost for client-injected runs.

## Recommendation

Follow-up task, not a spike inside T-246: the work is a real refactor (de-`fs` the injector, bake the
inputs, ship the base as a static BPS), and each piece is independently useful — item 3 speeds up the
server whether or not the browser path ever ships. Sequence it after the server-side injection has been
play-tested in production, so the browser path is measured against something known good.

Open questions for T-249: memory ceiling on mobile Safari with a 32 MB buffer plus a 19 MB bundle in a
Worker; whether the static `base.bps` is served from the app or a signed URL; and how a stale cached base
is invalidated when a new base is deployed (the `base-offsets.json` build id is the obvious key).
