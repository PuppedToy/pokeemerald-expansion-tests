/**
 * Produce / status / download handlers (T-025). HTTP-thin and dependency-injected
 * so they unit-test without a server or real filesystem. Wiring + the auth/verified/
 * owns-rom gate is in routes.js.
 */

import { estimateEta } from './eta.js';

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
    res.status(201).json({ requestId: id, eta, canDeferEmail: eta >= DEFER_THRESHOLD_SECS });
  };
}

export function handleStatus({ requests, avgRomSecs }) {
  return (req, res) => {
    const active = requests.getActiveForUser(req.userId);
    if (!active) return res.status(404).json({ error: 'no active request' });
    res.json({
      requestId: active.id,
      state: active.state,
      romsDone: active.roms_done,
      romsTotal: active.roms_total,
      eta: estimateEta(requests, active.id, { avgRomSecs }),
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
