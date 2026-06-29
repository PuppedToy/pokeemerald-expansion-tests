/**
 * ETA model (T-025, ADR-005). Best-effort: ETA = (ROMs ranked ahead + own remaining)
 * × avg seconds/ROM. avgRomSecs is seeded (~15s) and calibrated on the instance (T-019).
 * A slow request's ETA is intentionally non-monotonic (incoming fast requests push it back).
 */

// A real ROM build is ~4–5 min on the box (T-019 measured ~277 s); 270 s makes the ETA + progress
// bar meaningful out of the box. Override per-instance with AVG_ROM_SECS once calibrated.
const DEFAULT_AVG = Number(process.env.AVG_ROM_SECS) || 270;
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

/** ROMs ranked ahead of this request in the queue (the currently-building one counts). */
export function romsAhead(requests, id) {
  const target = requests.get(id);
  if (!target) return 0;
  let ahead = 0;
  for (const r of requests.findByStates(QUEUE_STATES)) {
    if (r.id !== id && ranksAhead(r, target)) ahead += remaining(r);
  }
  return ahead;
}

export function estimateEta(requests, id, { avgRomSecs = DEFAULT_AVG } = {}) {
  const target = requests.get(id);
  if (!target) return 0;
  return Math.round((romsAhead(requests, id) + remaining(target)) * avgRomSecs);
}

/**
 * Server-authoritative build progress + ETA (B-013). Derived entirely from durable row state
 * (`roms_done`, `roms_total`, `state`, `updated_at`), NOT from any client clock — so it's identical
 * whether or not the page was reloaded. While a ROM is building, `updated_at` is when that ROM started
 * (the scheduler stamps it on the `building` transition), so the fraction of the current ROM is
 * `(now - updated_at) / avgRomSecs`. The frontend just renders these numbers.
 *
 * Returns: { progress: 0..99 (this request's own ROMs), etaSecs: remaining incl. queue ahead }.
 */
export function buildProgress(requests, id, { avgRomSecs = DEFAULT_AVG, now = Date.now() } = {}) {
  const r = requests.get(id);
  if (!r) return { progress: 0, etaSecs: 0 };
  const total = r.roms_total || 1;
  const curFrac = r.state === 'building'
    ? Math.min(0.99, Math.max(0, (now - r.updated_at) / 1000) / avgRomSecs)
    : 0;
  const remainingRoms = Math.max(0, (total - r.roms_done) - curFrac);
  const etaSecs = Math.round((romsAhead(requests, id) + remainingRoms) * avgRomSecs);
  const progress = Math.min(99, Math.round(((r.roms_done + curFrac) / total) * 100));
  return { progress, etaSecs };
}
