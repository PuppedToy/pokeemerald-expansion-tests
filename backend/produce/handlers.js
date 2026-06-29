/**
 * Produce / status / download handlers (T-025). HTTP-thin and dependency-injected
 * so they unit-test without a server or real filesystem. Wiring + the auth/verified/
 * owns-rom gate is in routes.js.
 */

import { estimateEta, romsAhead, buildProgress } from './eta.js';

const DEFER_THRESHOLD_SECS = 120; // offer email-on-ready when the initial ETA is >= 2 min

export function handleProduce({ requests, classify, validateBundle, persistBundle, idGen, now = () => Date.now(), avgRomSecs }) {
  return (req, res) => {
    if (requests.getActiveForUser(req.userId)) {
      return res.status(409).json({ error: 'you already have an active request' });
    }
    const bundle = req.body;
    const { ok, errors } = validateBundle(bundle);
    if (!ok) return res.status(400).json({ error: 'invalid bundle', details: errors });

    const romsTotal = bundle.roms.length;
    const id = idGen();
    const bundlePath = persistBundle(id, bundle);
    requests.create({
      id, userId: req.userId, queueClass: classify(romsTotal), romsTotal, bundlePath,
      seed: String(bundle.config?.seed ?? '0'), params: bundle.config ?? {}, now: now(),
    });

    const eta = estimateEta(requests, id, { avgRomSecs });
    res.status(201).json({
      requestId: id, eta, romsAhead: romsAhead(requests, id),
      canDeferEmail: eta >= DEFER_THRESHOLD_SECS,
    });
  };
}

// Cancel the active request (T-035): move it to the terminal `failed` state + delete its files, so
// the user's active slot is freed and the build won't be delivered. Idempotent (no active → ok:false).
export function handleCancel({ requests, removeFile, killActiveBuild, now = () => Date.now() }) {
  return (req, res) => {
    const active = requests.getActiveForUser(req.userId);
    if (!active) return res.json({ ok: false, reason: 'no active request' });
    requests.cancel(active.id, removeFile, now());
    killActiveBuild?.(active.id); // stop the in-flight make immediately, freeing the box (T-035)
    res.json({ ok: true });
  };
}

// Opt in to a "your ROM is ready" email for the active request (offered when ETA >= 2 min, T-031).
export function handleNotifyOnReady({ requests }) {
  return (req, res) => {
    const active = requests.getActiveForUser(req.userId);
    if (!active) return res.status(404).json({ error: 'no active request' });
    requests.setEmailOnReady(active.id, true);
    res.json({ ok: true });
  };
}

export function handleStatus({ requests, avgRomSecs, now = () => Date.now() }) {
  return (req, res) => {
    const active = requests.getActiveForUser(req.userId);
    if (!active) return res.status(404).json({ error: 'no active request' });
    // Server-authoritative progress + ETA so the bar/countdown are identical across reloads (B-013).
    const { progress, etaSecs } = buildProgress(requests, active.id, { avgRomSecs, now: now() });
    res.json({
      requestId: active.id,
      state: active.state,
      romsDone: active.roms_done,
      romsTotal: active.roms_total,
      eta: etaSecs,
      progress,
      romsAhead: romsAhead(requests, active.id),
    });
  };
}

export function handleDownload({ requests, readOutput, removeFile, now = () => Date.now() }) {
  return (req, res) => {
    const active = requests.getActiveForUser(req.userId);
    if (!active) return res.status(404).json({ error: 'no request' });
    if (active.state !== 'ready') return res.status(409).json({ error: 'not ready', state: active.state });

    const data = readOutput(active);
    res.set?.('Content-Type', 'application/zip');
    res.set?.('Content-Disposition', `attachment; filename="emerald-cut-${active.id}.zip"`);
    res.send(data);

    // success → record + purge (delete bundle/output files, drop the row). Run history (T-023) survives.
    requests.markDownloaded(active.id, now());
    requests.purge(active.id, removeFile);
  };
}
