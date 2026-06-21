# ADR-001: A single fixed cheap VPS (Hetzner CX43) behind a serial queue hosts the ROM-build server

- **Status:** accepted
- **Date:** 2026-06-21
- **Task:** T-017

## Context

We need to host the frontend + backend that fabricates ROMs on demand
(`node make.js --bundle=…` → `make`). The randomizer runs in the browser, so the
server's only non-trivial load is **compiling the GBA ROM**: CPU-bound, parallel,
~20–60 s per job on a warm `build/` cache (incremental), ~3–5 min cold @8 vCPU.
Each session POSTs a ~32 MB bundle and downloads a ~32 MB `.gba`. The toolchain
(`arm-none-eabi-gcc`) is a cross-compiler, so the **host architecture is irrelevant
to the output** — ARM hosts are viable, which is the main cost lever.

Constraints from the product owner: **prioritize cheap cost**, absorb traffic with a
**queue** (serial builds), **no autoscaling**, no complex elasticity. We already use
other clouds for other things, but want the cheapest sensible box for *this*.

See T-017 for the full requirements analysis and the Jun-2026 provider comparison.

## Decision

Run the service on **one fixed VPS sized 4–8 vCPU / 8–16 GB / ≥80 GB NVMe**, with a
single serial build worker and no autoscaling. Builds queue; the box keeps `build/`
warm so every job is incremental.

- **Primary target: Hetzner CX43** (8 vCPU x86 / 16 GB / 160 GB NVMe / 20 TB traffic,
  €11.99/mo, Jun 2026). x86 → the standard devkitARM binaries work with zero toolchain
  friction; 20 TB included traffic covers thousands of 32 MB downloads; shared vCPU is
  fine for bursty serial builds (no AWS-style credit throttling). **CX33** (4 vCPU/8 GB,
  €6.49) is the budget fallback if 4-core build latency is acceptable behind the queue.
- **Zero-cost bootstrap: Oracle Cloud Always Free ARM** (2 OCPU / 12 GB / 10 TB egress,
  €0 as of Jun-15-2026). Acceptable as an MVP while traffic is low. ADR-002 (Docker)
  makes moving Oracle → Hetzner a redeploy, so starting free costs us no rework.
- Serve the ROM downloads directly from the box on the included traffic (no separate
  object store — avoids complexity the owner explicitly doesn't want).
- **Before final commit**, benchmark one real full + incremental build on the chosen
  instance; the build-time figures above are estimates pending that calibration.

## Alternatives considered

- **AWS / GCP** — rejected for this: ~3–5× the compute, expensive per-GB egress on
  32 MB ROMs, and t-series credit throttling under a sustained queue. Only worth it to
  co-locate with existing account infra, which is not a goal here.
- **Hetzner ARM (CAX31, €15.99)** — viable and cheap, but needs a one-time ARM build
  validation (distro `gcc-arm-none-eabi`) and x86 CX is both cheaper and friction-free.
- **Contabo** — cheapest headline price but oversubscribed → inconsistent build times.
- **Vultr / DigitalOcean / Scaleway / OVH** — fine quality, but mid/high price and/or
  metered egress; Hetzner wins on price + included traffic for this profile.
- **Autoscaling / k8s / serverless build farm** — explicitly rejected: the queue is the
  agreed backpressure mechanism; elasticity is complexity we don't want.

## Consequences

- Cheapest sensible footprint (~€0–12/mo) with predictable behaviour; bursts increase
  wait time, never cost. We commit to a **ROM-output retention/cleanup policy** (TTL) so
  disk doesn't fill, and to bounding `make -j` to the box's core count (see T-017).
- Capacity is fixed: a large traffic spike means longer queue waits. Acceptable by design;
  if it ever isn't, the lever is a bigger single box (vertical), not autoscaling.
- Provider lock-in is minimized by ADR-002 (Docker): the price-volatility we just observed
  (Hetzner's Jun-2026 hike, Oracle's free-tier cut) is hedged by trivial portability.
