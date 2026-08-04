# Client-side injection — the browser builds its own ROMs

The randomizer already runs in the browser ([RANDOMIZER.md](../../docs/RANDOMIZER.md)); since T-249 the
**injector** does too, so a run can need **no server compute at all**. It is the same
`randomizer/injector/` modules the build box runs — a second implementation could not be verified by GATE-3
([ADR-023](../../docs/adr/ADR-023-injection-verified-by-data-equivalence.md)) — with the inputs plumbed
differently. For the injection itself, see [injection.md](injection.md); this file is only about *how those
inputs reach a browser* and what it costs.

## The three inputs, and where each comes from

| input | Node (build box / server) | browser |
|---|---|---|
| base ROM | `base/pokeemerald.gba` | the user's vanilla ROM + `base.bps`, cached in IndexedDB |
| offsets | `pokeemerald.map` + `.sym`, parsed per build | `base-offsets.json` — the injection-only map |
| the base's own sources | the repo tree | `base-sources.json` |
| `Buffer`, `crypto`, load-time `fs` reads | Node built-ins | `frontend/js/shims/{buffer,crypto,fs}.cjs` |

All of it is a function of **one base build**, so all of it is stamped with that build's sha256 — the
`buildId` in `manifest.json`. That coupling is the load-bearing safety property: a cached base from an older
build, driven by a newer offset map, would write real data to wrong addresses and nothing downstream would
notice. Both the manifest and `base-sources.json` carry the id, and the Worker refuses a base whose sha256
disagrees with the sources it was handed.

## Producing the artifacts

One command per base build, run by `deploy/build-base.sh` right after the base is installed:

```sh
node randomizer/injector/buildClientArtifacts.js --rom=base/pokeemerald.gba \
     --map=base/pokeemerald.map --sym=base/pokeemerald.sym \
     --vanilla=pokeemerald-vanilla.gba --out=base/client
```

They live next to the base (`base/`, which `deploy/update.sh` deliberately does not carry) and are served
at `/client/` — `manifest.json` `no-store`, everything else `immutable`, because only a new base can change
them. No vanilla ROM on the box means no `base.bps`, and the step skips rather than failing: the server-side
inject path does not need any of this.

| artifact | size | gzipped |
|---|---|---|
| `base.bps` | 31.8 MB | 16.5 MB |
| `base-sources.json` (53 files) | 6.6 MB | 0.65 MB |
| `base-offsets.json` (2,819 of 87,988 symbols) | 0.49 MB | 0.05 MB |

Two of those numbers deserve a note.

**`base.bps` is big, and that is not a regression.** The base is 32 MB where vanilla is 16 MB, so half of it
is expansion content with no counterpart to delta against; BPS has to carry it literally. But today's
delivery is `createBps(vanilla, randomizedRom)` — the *same* ~32 MB, **per ROM, per run**. Here it is one
immutable file, identical for every user and every run, fetched once and kept in IndexedDB. Bytes served per
user go down, not up, and the ROM itself is still never served
([ADR-013](../../docs/adr/ADR-013-bps-patch-delivery-client-side.md)).

**The offset map is filtered, and that has to be exact.** A real base exports 87,988 symbols / 21 MB of
JSON, and injection can only *address* what the module registry names or matches, so
`filterOffsetMapForInjection` keeps those and drops the rest. The danger is silence, not noise: `learnsets`
reads an absent symbol as "the base does not export this array" and leaves base data in place, which is a
plausible-looking un-randomized ROM. Hence the filter is derived from the registry itself (including
`localLabels`, the two Group-D script labels that are local and therefore in no linker map), and a test
injects one bundle through the full and filtered maps and demands the same sha256.

### A side effect worth knowing: the client reads the base's sources, the server reads today's

The artifacts are baked when the base is built, so a browser always derives its writes from **the sources
that base was compiled from**. The server-side inject path reads the *current tree*. After a
`deploy/update.sh` that changes an injectable source without a base rebuild, those two differ — and the
baked one is the correct one. The server path does not silently produce a wrong ROM (the modules byte-match
the base's tables against the source and refuse: "the base ROM and the base sources are not the same
build"), but it does mean a deploy that touches base data must be followed by `deploy/build-base.sh`, while
a client-injected run would have kept working.

## The flow in the browser

`frontend/js/client-inject.js`, driven by `account.js` when the flag is on:

1. `GET /client/manifest.json` — which base build this deployment is offering.
2. `ensureBaseRom()` — IndexedDB hit for that `buildId`, or fetch `base.bps` and apply it to the user's
   vanilla ROM with the codec ADR-013 already ships (`bps.bundle.js`). `applyBps` verifies the source
   checksum, so the wrong vanilla fails here instead of producing a base that injects into nonsense.
3. `base-offsets.json` + `base-sources.json`.
4. One `injector.bundle.js` Worker per ROM: the base is **transferred in** (so the Worker writes it in
   place) and the finished ROM **transferred back** — no structured-clone copies of 32 MB.
5. The result is the same `{ serverName, gbaBytes, bpsBytes }` the server path assembles, so the full
   archive (T-211) is built identically. `bpsBytes` is computed locally with the same codec — 0.7 s per ROM
   in Node for the full 32 MB, so a few seconds in a browser.

### The flag

Off by default, per browser: `?clientInject=1` (sticky in `localStorage`), `?clientInject=0` to clear.
That is deliberate and it is not a technical limitation — the request queue is where beta gating, quotas
and the "your ROM is ready" email live, so moving delivery off the server is a product decision.

## What it costs, measured

Chromium, 32 MB base, a real 15 MB bundle (`--enable-precise-memory-info`; `performance.memory` does not
exist inside a Worker, so the heap numbers come from running the same `injectOne` on the page thread):

| | |
|---|---|
| inject one ROM | **1.0 s** (Chromium) / **1.8 s** (WebKit) / 0.7 s (Node) |
| apply `base.bps` | 0.3 s, then 14 ms from the IndexedDB cache |
| inputs held before injecting | **142 MB** — 32 MB base + a 15 MB bundle parsed to objects + 6.6 MB sources |
| peak | **213 MB** |
| the injection itself | **+71 MB**, of which 32 MB is `Rom`'s byte-per-byte ownership map (the INV-BYTES guard) |

The bundle is the biggest single item and the browser already holds it today, since generation runs there.
Client injection adds ~100 MB on top. Comfortable on desktop; **marginal on a phone**, where a tab that
exceeds its budget is killed rather than slowed — so an iOS Safari device check is the open question, not
engine compatibility (WebKit produces the same bytes).

If it has to come down: `Rom`'s ownership map is 32 MB and could be dropped (`trackWrites: false`) at the
cost of the INV-BYTES overlap guard, and a multi-ROM run could release each finished ROM before starting the
next instead of accumulating them for the archive.

## Diagnostics and decision logs

Unchanged, because they were never a property of *who injects*: both are **generation** artifacts, produced
by the randomizer Worker and posted by the browser (T-075 diagnostics, T-117 decision logs). A
client-injected run reports them exactly as a server-built one does.

What a client-injected run has no equivalent of is the **server build log** (`log.txt`/`logError.txt` per
request) and the injector's write journal — those exist only where the injection happens, which is now the
user's machine. The journal is still built in the Worker and can be surfaced for support if a run ever needs
explaining; it is not uploaded.

## Verifying a change to any of this

- `randomizer/__tests__/unit/injectorBrowserBundle.test.js` — builds the bundle and runs it in a `vm`
  sandbox with **no Buffer, no require, no process, no fs**, then demands the Node path's sha256. Runs
  everywhere, part of `cd randomizer && npm test`.
- `visual-tests/injector-browser-check.mjs` — the real thing: a real Worker in a real browser, over HTTP,
  including the shipped `client-inject.js` flow. `--engine webkit` for Safari's engine. Needs the local
  32 MB base, so it is a harness rather than a test.
- The shims are pinned method-by-method against Node's `Buffer`/`crypto` in
  `randomizer/__tests__/unit/browserShims.test.js`. The subtle one: Node's `slice()` returns a **view**
  where `Uint8Array.prototype.slice` **copies**, and the injector writes through slices.
