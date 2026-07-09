/**
 * Diagnostics submit handler (T-075). HTTP-thin and dependency-injected so it unit-tests
 * without a server. Wiring + optional-auth gate and per-IP rate limit live in routes.js.
 *
 * The client (the randomizer Web Worker, via frontend/js/app.js) POSTs the run's diagnostics
 * after every generation. We sanitise and cap the payload — it comes from the browser — then
 * persist one row keyed by runId (idempotent on retry).
 */

const MAX_EVENTS = 500;      // a pathological run (hundreds of dropped slots) can't bloat a row
const MAX_MESSAGE = 2000;    // per-event message cap
const SEVERITIES = new Set(['fatal', 'error', 'warning']);

function sanitizeEvent(e) {
  if (!e || typeof e !== 'object') return null;
  const severity = SEVERITIES.has(e.severity) ? e.severity : 'warning';
  const code = typeof e.code === 'string' ? e.code.slice(0, 80) : 'UNKNOWN';
  const message = typeof e.message === 'string' ? e.message.slice(0, MAX_MESSAGE) : '';
  return {
    seq: Number.isFinite(e.seq) ? e.seq : null,
    severity, code, message,
    context: (e.context && typeof e.context === 'object') ? e.context : (e.context ?? null),
  };
}

function deriveCounts(events) {
  const counts = { fatal: 0, error: 0, warning: 0 };
  for (const e of events) counts[e.severity] += 1;
  return counts;
}

function validCounts(c) {
  return c && typeof c === 'object'
    && ['fatal', 'error', 'warning'].every((k) => Number.isFinite(c[k]));
}

export function handleSubmitDiagnostics({ diagnostics, now = () => Date.now(), maxEvents = MAX_EVENTS }) {
  return (req, res) => {
    const b = req.body ?? {};
    const runId = typeof b.runId === 'string' ? b.runId.trim() : '';
    if (!runId) return res.status(400).json({ error: 'runId required' });
    if (!Array.isArray(b.diagnostics)) return res.status(400).json({ error: 'diagnostics must be an array' });

    const events = b.diagnostics.slice(0, maxEvents).map(sanitizeEvent).filter(Boolean);
    const counts = validCounts(b.counts) ? b.counts : deriveCounts(events);
    const ua = req.headers?.['user-agent'];

    diagnostics.create({
      id: runId,
      userId: req.userId ?? null,
      createdAt: now(),
      generatedAt: Number.isFinite(b.generatedAt) ? b.generatedAt : null,
      seed: b.seed != null ? String(b.seed).slice(0, 64) : null,
      runType: typeof b.runType === 'string' ? b.runType.slice(0, 32) : null,
      appVersion: b.appVersion != null ? String(b.appVersion).slice(0, 32)
        : (b.formatVersion != null ? `fmt${b.formatVersion}` : null),
      userAgent: typeof ua === 'string' ? ua.slice(0, 256) : null,
      counts,
      events,
    });
    res.status(201).json({ ok: true });
  };
}
