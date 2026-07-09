/**
 * Retention sweeper (T-023, ADR-003). ROMs live 48 h; finished requests are
 * then expired and purged (files + row) so disk and DB stay clean. The run
 * history (runs table) is written at `ready` and survives the purge.
 *
 * Delete-on-successful-download is owned by T-025 (only after a complete
 * transfer); this sweeper is the time-based backstop. Active requests
 * (queued/building/paused) are never swept.
 */

import fs from 'node:fs';

const DAY = 24 * 60 * 60 * 1000;

const defaultRemoveFile = (p) => {
  if (p) { try { fs.rmSync(p, { force: true }); } catch { /* best effort */ } }
};

export function sweepExpired({ requests, diagnostics, removeFile = defaultRemoveFile, now = Date.now(), ttlMs = 2 * DAY }) {
  const candidates = requests.findByStates(['ready', 'failed']);
  let purged = 0;
  for (const row of candidates) {
    const ts = row.ready_at ?? row.updated_at ?? row.created_at;
    if (ts > now - ttlMs) continue;
    requests.setState(row.id, 'expired', now);
    requests.purge(row.id, removeFile);
    purged++;
  }
  // T-075 — diagnostics share the same 48h window (retention parity with bundles/outputs),
  // keyed off their own receive time. Optional so existing callers/tests still work.
  if (diagnostics?.purgeExpired) diagnostics.purgeExpired(now - ttlMs);
  return purged;
}

export function startSweeper({ requests, diagnostics, removeFile = defaultRemoveFile, ttlMs = 2 * DAY, intervalMs = 5 * 60 * 1000 }) {
  const timer = setInterval(() => {
    sweepExpired({ requests, diagnostics, removeFile, now: Date.now(), ttlMs });
  }, intervalMs);
  if (typeof timer.unref === 'function') timer.unref(); // don't keep the process alive
  return timer;
}
