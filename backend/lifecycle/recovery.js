/**
 * Startup recovery (T-023, ADR-003). A SIGKILLed build skips make.js's
 * `finally { restore() }`, leaving the working tree dirty and a request stuck
 * in `building`/`paused`. On boot we restore the tree, then re-queue every
 * in-flight request KEEPING roms_done (the interrupted ROM re-runs; completed
 * ROMs are not redone). "Resume" = restore-and-re-run, never continue.
 */

import { spawnSync } from 'node:child_process';
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
  const inflight = requests.findByStates(['building', 'paused']);
  for (const row of inflight) {
    const back = row.queue_class === 'slow' ? 'queued_slow' : 'queued_fast';
    requests.setState(row.id, back, now); // roms_done is untouched
  }
  return inflight.length;
}
