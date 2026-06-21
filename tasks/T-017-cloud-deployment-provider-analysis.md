---
id: T-017
title: Cloud hosting requirements analysis + provider selection for the ROM-build server
status: done
type: docs
created: 2026-06-21
updated: 2026-06-21
target-version: 0.2.0
links: [docs/adr/ADR-001-rom-build-server-provider.md, docs/adr/ADR-002-build-server-iac-docker.md, T-018, T-019, T-020]
blocked-by: []
---

# T-017 — Cloud hosting requirements analysis + provider selection for the ROM-build server

## Context

We want to host the frontend + backend on a cloud machine that serves the static
site and, on demand, fabricates ROMs from a frontend-supplied bundle via
`node make.js --bundle=…` → `make`. The frontend randomizes in the browser; the
server's only heavy job is **compiling the GBA ROM**. We will absorb traffic with a
**queue** (serial builds), explicitly **no autoscaling** and no complex elasticity.

This task produces (a) the machine requirements and (b) a price/quality comparison
of providers (AWS, GCP, and lesser-known ones) to pick the box. The final provider
decision will be recorded as an ADR; the queue + `/api/produce` wiring is follow-up
implementation work (separate task).

## Plan

Approach: characterize the three server workloads (static serving, backend/queue,
ROM build), size the box from the build (the only non-trivial load), then compare
providers for that exact shape under a fixed-size + queue model.

Acceptance criteria:
- [x] Workload + machine spec documented (vCPU / RAM / disk / arch / egress).
- [x] Provider comparison with current (Jun 2026) prices for the target shape.
- [x] A recommendation with caveats, enough to make the decision.
- [x] Decision recorded as an ADR (follow-up) and implementation task opened.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-21** — Task created.
- **2026-06-21** — Requirements analysis (from the code):
  - Three loads: (1) **static frontend** — negligible; the randomizer runs in the
    browser (`frontend/js/randomizer.bundle.js`), backend only does `express.static`.
    (2) **backend/queue** — `backend/server.js` (Express); receives the session
    bundle (`bundle.json` measured at **~32 MB**, `express.json` limit already 50mb),
    enqueues a job, serves the resulting **32 MB `.gba`**. `/api/produce` is currently
    a 501 stub. (3) **ROM build** — `node make.js --bundle=…` → `make -j` compiles the
    C decomp. This is the only resource driver.
  - Build profile: ~343 `.c` in `src/` + the expansion battle engine → 32 MB ROM.
    CPU-bound, parallelizable. Toolchain: devkitARM / `arm-none-eabi-gcc` (cross-compile
    → **host arch is irrelevant to the output**, so ARM hosts are viable → big cost lever).
    Working tree ~1 GB, `.git` 446 MB (shallow-clone for deploy), `build/` grows to
    ~1.5–3 GB on a full build. Estimated times (to **benchmark on the instance**):
    full clean build ~3–5 min @8 vCPU / ~8–12 min @4 / ~20–30 min @2; **incremental**
    (per job: restore + re-mutate data files + relink the 32 MB ELF) ~20–60 s on a
    warm `build/`. The persistent server keeps `build/` warm → every job is incremental.
  - Code note: `make.js` runs `make -j` **unbounded** (line ~164) — on a small box a
    full build can over-spawn and spike RAM. Bound to `-j<cores>` on deploy.
  - Recommended spec: **4–8 vCPU, 8–16 GB RAM, ≥80 GB NVMe**, shared vCPU is fine for
    bursty serial builds (avoid AWS t-series credit throttling under sustained queue).
    Egress matters: each ROM download is 32 MB → providers with generous included
    traffic win decisively over hyperscaler per-GB egress.
- **2026-06-21** — Provider research (Jun 2026 prices, ex-VAT):

  | Provider / plan | vCPU | RAM | Disk | Included traffic | Arch | Price/mo | Notes |
  |---|---|---|---|---|---|---|---|
  | **Hetzner CX43** ⭐ | 8 (shared x86) | 16 GB | 160 GB NVMe | 20 TB | x86 | **€11.99** | Leading pick: devkitARM zero-friction, traffic covers thousands of 32 MB ROMs, no credit throttling |
  | Hetzner CX33 | 4 (shared x86) | 8 GB | 80 GB NVMe | 20 TB | x86 | €6.49 | Budget fallback if 4-core build latency OK behind the queue |
  | Hetzner CAX31 | 8 (shared ARM) | 16 GB | 160 GB NVMe | 20 TB | ARM | €15.99 | ARM alt; needs one-time `gcc-arm-none-eabi` validation |
  | Oracle Always Free ARM | 2 OCPU (ARM) | 12 GB | up to 200 GB | 10 TB | ARM | **€0** | €0 bootstrap; hard to provision, reclaim risk, ARM toolchain validation, only 2 cores (slower) |
  | AWS / GCP (≈equiv) | 4–8 | 8–16 GB | EBS/PD extra | metered, costly | x86/ARM | ~3–5× | Expensive 32 MB-ROM egress + t-series credit risk; only for account co-location |
  | Contabo | 4–8 | 8–16 GB | large | generous | x86 | cheapest headline | Oversubscribed → inconsistent build times |
  | Vultr / DigitalOcean / Scaleway / OVH | 4–8 | 8–16 GB | NVMe | metered | x86/ARM | mid/high | Fine quality but mid/high price and/or metered egress; OVH VPS prices rose |

  - **Hetzner** best value. June-15-2026 hike spared CX/CAX: **CX43** is the leading pick;
    **CX33** the budget option; **CAX31** the ARM alternative.
  - **Oracle Always Free ARM** — now **2 OCPU/12 GB** (cut from 4/24 on Jun-15-2026),
    10 TB egress free → near-$0 MVP option; caveats: hard to provision, reclaim risk,
    ARM toolchain validation, only 2 cores (slower, OK behind the queue).
  - **AWS/GCP** — ~3–5× the compute + expensive 32 MB-ROM egress + t-series credit risk;
    only worth it for account/integration reasons. **Contabo** cheapest headline but
    oversubscribed → inconsistent build times. **Scaleway/OVH** mid; OVH VPS prices rose.
  - Leading recommendation: **Hetzner CX43** (or CX33 for budget), serve ROMs from the
    box on the included 20 TB. Validate one real build before committing.
- **2026-06-21** — Decisions recorded and follow-ups opened (owner-approved):
  - [ADR-001](../docs/adr/ADR-001-rom-build-server-provider.md) — provider/machine:
    single fixed Hetzner CX43 behind a serial queue, Oracle free ARM as €0 bootstrap.
  - [ADR-002](../docs/adr/ADR-002-build-server-iac-docker.md) — IaC: single Docker image
    + Compose + Caddy, chosen for reproducibility and cheap provider portability (cost-first).
  - Implementation split out: **T-018** (backend produce endpoint + serial queue, broad
    strokes) and **T-019** (Dockerized image + VPS deploy, future, blocked-by T-018).
  - Also spawned **T-020** (optional user accounts — ROM-ownership-by-hash gate + seed/run
    history), a future feature layered on the T-018/T-019 delivery pipeline (blocked-by T-018).
- **2026-06-21** — Closing pass (owner-approved): materialized the provider comparison as a
  durable table here (was "see chat"), cross-referenced T-020 from this task, and ticked the
  analysis/comparison/recommendation acceptance criteria (their content was already delivered).
  All four criteria met; `check-tracker` green. No changelog line — internal analysis/decision
  work, not user-visible. Closed to unblock the implementation tasks.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
**Shipped:** the cloud-hosting requirements analysis and a Jun-2026 provider comparison
for the ROM-build server's exact workload (browser-side randomizer → server only compiles
the ~32 MB GBA ROM, absorbed by a serial queue, no autoscaling). Machine spec sized from the
build (4–8 vCPU / 8–16 GB / ≥80 GB NVMe; cross-compiler → ARM hosts viable; egress-sensitive)
and a structured provider table (Hetzner / Oracle free / AWS-GCP / Contabo / Vultr-DO-Scaleway-OVH).

**Decisions:** [ADR-001](../docs/adr/ADR-001-rom-build-server-provider.md) — single fixed
Hetzner CX43 behind a serial queue (Oracle Always Free ARM as €0 bootstrap); and
[ADR-002](../docs/adr/ADR-002-build-server-iac-docker.md) — ship as one Docker image
(Compose + Caddy) for reproducibility and cheap provider portability.

**Deviations:** none in scope; the only material caveat carried forward is that the
build-time figures are estimates pending a real benchmark on the chosen instance (owned by
T-019). **Follow-ups:** T-018 (backend produce endpoint + serial queue), T-019 (Dockerized
image + VPS deploy, blocked-by T-018), T-020 (optional user accounts / ROM-ownership gate +
seed history, blocked-by T-018).
