/**
 * Decision-log submit handler (T-210). HTTP-thin and dependency-injected so it unit-tests without a
 * server. Wiring + optional-auth gate and per-IP rate limit live in routes.js.
 *
 * The client (frontend/js/app.js) POSTs the run's rendered team-building decision log after every
 * generation — the same trigger as diagnostics. We cap the text (it comes from the browser) and
 * persist one row keyed by runId (idempotent on retry). Server-only: never surfaced to the user.
 */

const MAX_TEXT = 1024 * 1024; // 1 MB — a decision log is a per-team trace but must not bloat the DB

export function handleSubmitDecisionLog({ decisionLogs, now = () => Date.now(), maxText = MAX_TEXT }) {
  return (req, res) => {
    const b = req.body ?? {};
    const runId = typeof b.runId === 'string' ? b.runId.trim() : '';
    if (!runId) return res.status(400).json({ error: 'runId required' });
    const text = typeof b.text === 'string' ? b.text.slice(0, maxText) : '';
    if (!text) return res.status(400).json({ error: 'text required' });
    const ua = req.headers?.['user-agent'];

    decisionLogs.create({
      id: runId,
      userId: req.userId ?? null,
      createdAt: now(),
      generatedAt: Number.isFinite(b.generatedAt) ? b.generatedAt : null,
      seed: b.seed != null ? String(b.seed).slice(0, 64) : null,
      runType: typeof b.runType === 'string' ? b.runType.slice(0, 32) : null,
      appVersion: b.appVersion != null ? String(b.appVersion).slice(0, 32)
        : (b.formatVersion != null ? `fmt${b.formatVersion}` : null),
      userAgent: typeof ua === 'string' ? ua.slice(0, 256) : null,
      text,
    });
    res.status(201).json({ ok: true });
  };
}
