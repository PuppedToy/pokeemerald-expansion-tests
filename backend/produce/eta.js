/**
 * ETA model (T-025, ADR-005). Best-effort: ETA = (ROMs ranked ahead + own remaining)
 * × avg seconds/ROM. avgRomSecs is seeded (~15s) and calibrated on the instance (T-019).
 * A slow request's ETA is intentionally non-monotonic (incoming fast requests push it back).
 */

const DEFAULT_AVG = Number(process.env.AVG_ROM_SECS) || 15;
const QUEUE_STATES = ['queued_fast', 'queued_slow', 'building', 'paused'];

const remaining = (r) => Math.max(0, r.roms_total - r.roms_done);

function ranksAhead(r, target) {
  if (r.state === 'building') return true;            // currently running
  const rFast = r.queue_class === 'fast';
  if (target.queue_class === 'fast') {
    return rFast && r.created_at < target.created_at; // only earlier fasts beat a fast
  }
  return rFast || r.created_at < target.created_at;   // any fast, or an earlier slow, beats a slow
}

export function estimateEta(requests, id, { avgRomSecs = DEFAULT_AVG } = {}) {
  const target = requests.get(id);
  if (!target) return 0;

  let ahead = 0;
  for (const r of requests.findByStates(QUEUE_STATES)) {
    if (r.id !== id && ranksAhead(r, target)) ahead += remaining(r);
  }
  return Math.round((ahead + remaining(target)) * avgRomSecs);
}
