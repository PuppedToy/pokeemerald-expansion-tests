/**
 * Beta admin handlers (T-217). HTTP-thin + dependency-injected so they unit-test without a server.
 * The admin gate (isAdminEmail) lives in routes.js; every handler here assumes an authorised admin.
 *
 * Invite/accept are the ONLY writers of `invite_state = accepted`. Accepting a user with a held
 * `pending` ROM promotes it to the queue with welcome:true (the combined "you're in + ready" mail fires
 * on build completion, T-216); accepting a user WITHOUT a held ROM sends the immediate "you're in" mail.
 */

import { selectBatch } from './lottery.js';

// T-245 — ~16.5 s/ROM measured on the box by injection (see produce/eta.js for the measurement).
const DEFAULT_AVG = Number(process.env.AVG_ROM_SECS) || 17;
const QUEUE_STATES = ['queued', 'building', 'queued_fast', 'queued_slow', 'paused'];

// userId → its held `pending` request (at most one per user: the one-active-per-user rule).
function heldRomMap(requests) {
  const m = new Map();
  for (const r of requests.findByStates(['pending'])) m.set(r.user_id, r);
  return m;
}

function txn(db, fn) {
  if (!db) return fn();
  db.exec('BEGIN');
  try { fn(); db.exec('COMMIT'); }
  catch (err) { db.exec('ROLLBACK'); throw err; }
}

function sendWelcome(mailer, email, baseUrl) {
  if (!mailer || !email) return;
  // fire-and-forget + graceful: a mail hiccup never fails the invite (mirrors the ready-mail path).
  Promise.resolve(mailer.sendMail('welcome', email, { link: `${baseUrl || ''}/` })).catch(() => {});
}

export function handleOverview({ users, requests, betaInvites, avgRomSecs = DEFAULT_AVG, baseReady = true }) {
  return (_req, res) => {
    const held = heldRomMap(requests);
    const pending = users.listPendingVerified().map((u) => ({
      userId: u.id, email: u.email, waitingSince: u.created_at,
      hasRom: held.has(u.id), romsTotal: held.get(u.id)?.roms_total || 0,
    }));
    const accepted = users.listByInviteState('accepted', 200).map((u) => ({
      userId: u.id, email: u.email, since: u.updated_at,
    }));
    const counts = users.countByInviteState();

    const active = requests.findByStates(QUEUE_STATES);
    const outstandingRoms = active.reduce((s, r) => s + Math.max(0, r.roms_total - r.roms_done), 0);
    res.json({
      counts: {
        pending: counts.pending || 0,
        accepted: counts.accepted || 0,
        pendingVerified: pending.length,
        heldRoms: held.size,
      },
      pending,
      accepted,
      queue: {
        building: active.filter((r) => r.state === 'building').length,
        queued: active.filter((r) => r.state.startsWith('queued')).length,
        outstandingRoms,
        etaSecs: outstandingRoms * avgRomSecs,
        // T-246 — false means the box has no base ROM to inject into: the worker is held and the queue is
        // not moving. Without this the panel shows a growing queue and no reason for it.
        baseReady,
      },
      audit: betaInvites ? betaInvites.list(20) : [],
    });
  };
}

export function handleInvite({ users, requests, betaInvites, mailer, baseUrl, avgRomSecs = DEFAULT_AVG, db, now = () => Date.now(), rng = Math.random }) {
  return (req, res) => {
    const count = Math.floor(Number(req.body?.count));
    if (!Number.isFinite(count) || count <= 0) {
      return res.status(400).json({ error: 'count must be a positive integer' });
    }
    const ts = now();
    const held = heldRomMap(requests);
    const poolA = [];
    const poolB = [];
    for (const u of users.listPendingVerified()) {
      const item = { userId: u.id, email: u.email, createdAt: u.created_at, romsTotal: held.get(u.id)?.roms_total || 0 };
      (held.has(u.id) ? poolA : poolB).push(item);
    }

    const batch = selectBatch({ poolA, poolB, count, avgRomSecs, rng });

    txn(db, () => {
      for (const u of batch.withRom) {
        users.setInviteState(u.userId, 'accepted', ts);
        requests.promotePending(held.get(u.userId).id, { welcome: true, now: ts });
      }
      for (const u of batch.withoutRom) users.setInviteState(u.userId, 'accepted', ts);
      betaInvites?.record({
        adminEmail: req.adminEmail, kind: 'batch', requested: count, granted: batch.granted,
        withRom: batch.withRom.length, addedBuildSecs: batch.addedBuildSecs,
        userIds: batch.selected.map((s) => s.userId), now: ts,
      });
    });

    for (const u of batch.withoutRom) sendWelcome(mailer, u.email, baseUrl); // immediate "you're in" mail

    res.json({
      invited: batch.granted,
      withRom: batch.withRom.length,
      withoutRom: batch.withoutRom.length,
      addedBuildSecs: batch.addedBuildSecs,
      cappedByBudget: batch.cappedByBudget,
      shortfall: batch.shortfall,
    });
  };
}

export function handleAccept({ users, requests, betaInvites, mailer, baseUrl, avgRomSecs = DEFAULT_AVG, db, now = () => Date.now() }) {
  return (req, res) => {
    const { email, userId } = req.body ?? {};
    const user = userId != null ? users.get(userId) : (email ? users.findByEmail(email) : null);
    if (!user) return res.status(404).json({ error: 'user not found' });
    if (user.invite_state === 'accepted') return res.json({ ok: true, already: true }); // idempotent

    const ts = now();
    const heldReq = heldRomMap(requests).get(user.id) || null;
    txn(db, () => {
      users.setInviteState(user.id, 'accepted', ts);
      if (heldReq) requests.promotePending(heldReq.id, { welcome: true, now: ts });
      betaInvites?.record({
        adminEmail: req.adminEmail, kind: 'accept', requested: null, granted: 1,
        withRom: heldReq ? 1 : 0, addedBuildSecs: heldReq ? avgRomSecs * Math.max(1, heldReq.roms_total || 1) : 0,
        userIds: [user.id], now: ts,
      });
    });
    if (!heldReq) sendWelcome(mailer, user.email, baseUrl); // no held ROM → immediate "you're in" mail

    res.json({ ok: true, userId: user.id, hasRom: !!heldReq });
  };
}

export function handleSearch({ users, requests }) {
  return (req, res) => {
    const q = String(req.query?.q ?? '').trim();
    if (!q) return res.json({ results: [] });
    const held = heldRomMap(requests);
    const results = users.search(q, 25).map((u) => ({
      userId: u.id, email: u.email, verified: !!u.verified, inviteState: u.invite_state ?? 'pending',
      hasRom: held.has(u.id), romsTotal: held.get(u.id)?.roms_total || 0,
    }));
    res.json({ results });
  };
}
