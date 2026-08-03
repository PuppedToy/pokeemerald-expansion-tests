/**
 * Serial FIFO build scheduler (T-024/ADR-005, simplified in T-245).
 *
 * ADR-005 specified **two preemptive queues** because a ROM took ~4–5 minutes: a 6-ROM run held the box
 * for ~27 minutes, so a 1-ROM run queued behind it had to be able to jump ahead, which in turn needed
 * pausing, resuming and anti-starvation aging. Injection (T-244) put a ROM at ~16.5 s measured on the box,
 * so the worst case a small run can wait behind the largest one is **~100 s**. The machinery that bought
 * that 27-minute reprieve now buys ~90 s, at the cost of three extra queue states and a policy nobody can
 * reason about from a log line. It is retired: one lane, oldest first.
 * See docs/adr/ADR-005-two-tier-preemptive-build-queue.md (superseding note).
 *
 * What is kept, because latency was never its justification:
 *  · **Serial.** One build at a time — a 2-core box with a 32 MB ROM buffer per build (T-228).
 *  · **Per-ROM advancement.** The worker still advances one ROM at a time, so a cancel or an account
 *    deletion mid-run stops at the next boundary and startup recovery resumes without redoing ROMs.
 *
 * The actual build is an injected `buildRom(requestId, romIndex)`; tests inject a mock.
 */

import { finishBuild } from '../lifecycle/complete.js';

// The one waiting state; the legacy tier states are still selectable so requests already queued when this
// deploys are not stranded (startup recovery rewrites them — lifecycle/recovery.js).
const QUEUED = 'queued';
export const LEGACY_QUEUED_STATES = ['queued_fast', 'queued_slow', 'paused'];
const SELECTABLE = [QUEUED, ...LEGACY_QUEUED_STATES];

/** Pick the next request to advance by one ROM, or null if the queue is empty. Oldest first. */
export function selectNext(requests, { now: _now } = {}) {
  // findByStates orders by created_at, so the head of the list IS the FIFO head.
  const waiting = requests.findByStates(SELECTABLE);
  return waiting.length ? waiting[0].id : null;
}

/** Build exactly one ROM for `id`, then move it to its next resting/terminal state. */
export async function advanceOneRom(ctx, id, { now }) {
  const { requests, buildRom } = ctx;
  const before = requests.get(id);
  requests.setState(id, 'building', now);

  try {
    await buildRom(id, before.roms_done); // 0-indexed: build the next undone ROM
  } catch (err) {
    // The build may have been killed on purpose — a user cancel (row → failed) or account deletion
    // (row gone) mid-build (T-035). In that case it's already terminal: don't log it as a failure or
    // attempt an illegal transition; just drop it cleanly.
    const row = requests.get(id);
    if (!row || row.state !== 'building') return;
    // B-008: a genuine build failure must NEVER crash the worker/process. Move the request to the
    // terminal, non-blocking `failed` state and return — the loop keeps serving other jobs, and startup
    // recovery won't re-run it (recovery only re-queues `building`/`paused`), so no crash loop.
    console.error(`[build] request ${id} rom ${before.roms_done} failed:`, err?.message ?? err);
    requests.setState(id, 'failed', now);
    return;
  }

  // The request may have been cancelled (state → failed) or the account deleted (row gone) WHILE this
  // ROM was compiling (T-035). Re-read before recording progress: if it's no longer `building`, drop it
  // cleanly — the finished ROM simply isn't delivered, and we don't attempt an illegal transition or
  // touch a missing row. This also stops any remaining ROMs of a cancelled multi-ROM run.
  const mid = requests.get(id);
  if (!mid || mid.state !== 'building') return;

  requests.incRomDone(id, now);
  const after = requests.get(id);

  if (after.roms_done >= after.roms_total) {
    finishBuild(ctx, id, now); // building -> ready + record run
    return;
  }
  // More ROMs remain: back to the single waiting lane, keeping the row's created_at, so it stays at the
  // FIFO head and finishes before a later arrival starts (T-245 — no preemption, no lane to choose).
  requests.setState(id, QUEUED, now);
}

export function createWorker(ctx) {
  const { requests, now = () => Date.now() } = ctx;

  async function runOnce() {
    const id = selectNext(requests, { now: now() });
    if (!id) return false;
    await advanceOneRom(ctx, id, { now: now() });
    return true;
  }

  async function drain(maxSteps = 100000) {
    let steps = 0;
    while (await runOnce()) {
      if (++steps >= maxSteps) break; // runaway guard
    }
    return steps;
  }

  function start({ idleMs = 250 } = {}) {
    let stopped = false;
    (async function loop() {
      while (!stopped) {
        let did = false;
        try {
          did = await runOnce();
        } catch (err) {
          // B-008 last-resort guard: the build daemon must never die. advanceOneRom already
          // contains build failures; this catches anything unexpected (DB, etc.) so the loop
          // survives. A request left mid-flight is cleaned by startup recovery on the next boot.
          console.error('[worker] unexpected error in runOnce:', err?.message ?? err);
        }
        if (!did) await new Promise((r) => setTimeout(r, idleMs));
      }
    })();
    return () => { stopped = true; };
  }

  return { runOnce, drain, start };
}
