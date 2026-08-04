/**
 * ETA model (T-025, ADR-005; re-derived in T-245).
 *
 * ETA = (ROMs waiting ahead of this request + its own remaining) × avgRomSecs. With one FIFO lane
 * (T-245) "ahead" is simply "queued earlier", so the ETA is monotonic again — ADR-005's deliberately
 * non-monotonic ETA existed because a later small request could preempt an earlier big one, which no
 * longer happens.
 */

// Measured on the production box (2 vCPU Hetzner, 2026-08-03, T-245): three corpus bundles injected in an
// ephemeral container — baseline 16.8 s, nicknames-on 16.9 s, nuzlocke-3 48.9 s for 3 ROMs (16.3 s/ROM).
// Injection cost barely varies with the config (it writes the same tables either way), so a constant is a
// good model — unlike the compile path it replaced, whose 270 s default swung between ~55 s warm and
// ~230 s cold. 17 s is the honest default; AVG_ROM_SECS still overrides per instance.
const DEFAULT_AVG = Number(process.env.AVG_ROM_SECS) || 17;
// `building` counts: its remaining ROMs are still ahead of everyone else. The legacy tier states are here
// so a request queued before the T-245 deploy is still counted while recovery has not yet rewritten it.
const QUEUE_STATES = ['queued', 'building', 'queued_fast', 'queued_slow', 'paused'];

const remaining = (r) => Math.max(0, r.roms_total - r.roms_done);

/** ROMs ranked ahead of this request in the queue (the currently-building one counts). */
export function romsAhead(requests, id) {
  const target = requests.get(id);
  if (!target) return 0;
  let ahead = 0;
  for (const r of requests.findByStates(QUEUE_STATES)) {
    if (r.id === id) continue;
    // FIFO: the currently-building request is ahead by definition; everyone else by arrival order.
    if (r.state === 'building' || r.created_at < target.created_at) ahead += remaining(r);
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
