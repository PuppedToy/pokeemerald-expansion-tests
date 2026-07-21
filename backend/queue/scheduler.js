/**
 * Two-tier preemptive serial build scheduler (T-024, ADR-005).
 *
 * One serial worker; fast requests beat slow ones; a slow request is preempted
 * **between ROMs** (never mid-build) and resumes later without redoing ROMs; an
 * aged paused slow periodically jumps the fast queue so it cannot starve.
 *
 * The policy is a pure function of the DB state: there is no persistent `building`
 * state between ticks — after each ROM a job returns to its resting state
 * (`queued_fast` for a started fast, `paused` for a started slow, `queued_slow`
 * for a fresh one), so `selectNext` re-applies fast-priority every ROM.
 *
 * The actual compile is an injected `buildRom(requestId, romIndex)` — the real
 * per-ROM make.js adapter (with bounded `make -j`, inside the T-026 sandbox) is
 * wired at integration; tests inject a mock so no real `make` runs.
 */

import { finishBuild } from '../lifecycle/complete.js';

// The fast-queue limit: a request that builds at most this many ROMs takes the priority (fast) lane.
// Exported as the single source of truth so the frontend can mirror it (drift-guarded) to warn users
// before they queue a slow build (T-172).
export const FAST_MAX_ROMS = 2;
const DEFAULT_AGING_MS = 5 * 60 * 1000;

/** A request is fast (priority) if it builds few ROMs, else slow. */
export function classify(romsTotal, { fastMaxRoms = FAST_MAX_ROMS } = {}) {
  return romsTotal <= fastMaxRoms ? 'fast' : 'slow';
}

/** Pick the next request to advance by one ROM, or null if the queues are empty. */
export function selectNext(requests, { now, agingMs = DEFAULT_AGING_MS }) {
  // 1. an aged paused (started slow) jumps the fast queue — anti-starvation
  const aged = requests.findByStates(['paused'])
    .filter((r) => now - r.updated_at >= agingMs)
    .sort((a, b) => a.updated_at - b.updated_at)[0];
  if (aged) return aged.id;

  // 2. fast queue first (findByStates orders by created_at)
  const fast = requests.findByStates(['queued_fast']);
  if (fast.length) return fast[0].id;

  // 3. resume started slows / start fresh ones, oldest first
  const slows = requests.findByStates(['paused', 'queued_slow']);
  if (slows.length) return slows[0].id;

  return null;
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
  // more ROMs remain: a started fast keeps its lane; a started slow yields (can be preempted/aged)
  requests.setState(id, after.queue_class === 'fast' ? 'queued_fast' : 'paused', now);
}

export function createWorker(ctx) {
  const { requests, agingMs = DEFAULT_AGING_MS, now = () => Date.now() } = ctx;

  async function runOnce() {
    const id = selectNext(requests, { now: now(), agingMs });
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
