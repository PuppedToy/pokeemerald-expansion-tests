/**
 * Startup recovery (T-023, ADR-003). A SIGKILLed build skips make.js's
 * `finally { restore() }`, leaving the working tree dirty and a request stuck
 * in `building`/`paused`. On boot we restore the tree, then re-queue every
 * in-flight request KEEPING roms_done (the interrupted ROM re-runs; completed
 * ROMs are not redone). "Resume" = restore-and-re-run, never continue.
 */

import { spawnSync } from 'node:child_process';
import { LEGACY_QUEUE_STATES } from '../db/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Mirrors make.js's restore(): discard randomizer-mutated source. */
export function defaultRestoreTree() {
  spawnSync('git', ['checkout', '--', 'src/', 'include/', 'data/maps/'], {
    cwd: repoRoot,
    stdio: 'ignore',
  });
}

export function runOnStartup({ requests, restoreTree = defaultRestoreTree, now = Date.now() }) {
  restoreTree();
  // T-245 — also sweeps up the legacy tier states: a request left in `queued_fast`/`queued_slow`/`paused`
  // by the previous version is rewritten into the single `queued` lane on the first boot after the deploy,
  // so the tier states disappear from live data without a migration.
  const inflight = requests.findByStates(['building', ...LEGACY_QUEUE_STATES]);
  for (const row of inflight) {
    requests.setState(row.id, 'queued', now); // roms_done is untouched
  }
  return inflight.length;
}
