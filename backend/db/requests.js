/**
 * Request repository (T-023). One row per ROM-production request; the state
 * machine and the one-active-per-user rule are enforced here. DB-only — file
 * deletion is injected (see purge) so the repo stays testable with :memory:.
 */

import fs from 'node:fs';
import { ACTIVE_STATES, TRANSITIONS } from './index.js';

const COLUMNS =
  'id,user_id,state,queue_class,roms_total,roms_done,bundle_path,output_path,email_on_ready,seed,params_json,created_at,started_at,ready_at,updated_at';

const defaultRemoveFile = (p) => {
  if (p) { try { fs.rmSync(p, { force: true }); } catch { /* best effort */ } }
};

export function createRequestsRepo(db) {
  const insert = db.prepare(
    `INSERT INTO requests (${COLUMNS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );
  const byId = db.prepare('SELECT * FROM requests WHERE id = ?');
  const activeForUser = db.prepare(
    `SELECT * FROM requests WHERE user_id = ? AND state IN (${ACTIVE_STATES.map(() => '?').join(',')}) LIMIT 1`
  );

  const repo = {
    create({ id, userId, queueClass, romsTotal, bundlePath, seed, params, emailOnReady = false, now = Date.now() }) {
      if (this.getActiveForUser(userId)) {
        throw new Error('user already has an active request');
      }
      const state = `queued_${queueClass}`;
      insert.run(
        id, userId, state, queueClass, romsTotal, 0, bundlePath, null,
        emailOnReady ? 1 : 0, String(seed), JSON.stringify(params ?? {}), now, null, null, now
      );
      return this.get(id);
    },

    get(id) {
      return byId.get(id) ?? null;
    },

    getActiveForUser(userId) {
      return activeForUser.get(userId, ...ACTIVE_STATES) ?? null;
    },

    findByStates(states) {
      const stmt = db.prepare(
        `SELECT * FROM requests WHERE state IN (${states.map(() => '?').join(',')}) ORDER BY created_at`
      );
      return stmt.all(...states);
    },

    setState(id, to, now = Date.now()) {
      const row = this.get(id);
      if (!row) throw new Error(`request not found: ${id}`);
      const allowed = TRANSITIONS[row.state] ?? [];
      if (!allowed.includes(to)) {
        throw new Error(`illegal transition ${row.state} -> ${to}`);
      }
      const startedAt = to === 'building' && row.started_at == null ? now : row.started_at;
      const readyAt = to === 'ready' ? now : row.ready_at;
      db.prepare('UPDATE requests SET state = ?, started_at = ?, ready_at = ?, updated_at = ? WHERE id = ?')
        .run(to, startedAt, readyAt, now, id);
      return this.get(id);
    },

    incRomDone(id, now = Date.now()) {
      db.prepare('UPDATE requests SET roms_done = roms_done + 1, updated_at = ? WHERE id = ?').run(now, id);
      return this.get(id);
    },

    claimNext(queueClass, now = Date.now()) {
      const next = db.prepare(
        'SELECT id FROM requests WHERE state = ? ORDER BY created_at LIMIT 1'
      ).get(`queued_${queueClass}`);
      if (!next) return null;
      return this.setState(next.id, 'building', now);
    },

    markReady(id, now = Date.now()) {
      return this.setState(id, 'ready', now);
    },

    markDownloaded(id, now = Date.now()) {
      return this.setState(id, 'downloaded', now);
    },

    setOutputPath(id, outputPath, now = Date.now()) {
      db.prepare('UPDATE requests SET output_path = ?, updated_at = ? WHERE id = ?').run(outputPath, now, id);
      return this.get(id);
    },

    setEmailOnReady(id, val, now = Date.now()) {
      db.prepare('UPDATE requests SET email_on_ready = ?, updated_at = ? WHERE id = ?').run(val ? 1 : 0, now, id);
      return this.get(id);
    },

    deleteRow(id) {
      db.prepare('DELETE FROM requests WHERE id = ?').run(id);
    },

    /** Terminal cleanup: delete the bundle + output files, then the row. */
    purge(id, removeFile = defaultRemoveFile) {
      const row = this.get(id);
      if (!row) return;
      removeFile(row.bundle_path);
      if (row.output_path) removeFile(row.output_path);
      this.deleteRow(id);
    },

    /**
     * User-initiated cancel (T-035). Move the request to the terminal, non-blocking `failed` state
     * (so it leaves the active set and the worker won't continue it) and delete its files. The row
     * stays as history. Safe if the worker is mid-build: the next state write there is contained (B-008).
     */
    cancel(id, removeFile = defaultRemoveFile, now = Date.now()) {
      const row = this.get(id);
      if (!row) return null;
      // Leave the active set so the slot frees + the worker won't continue it. `failed` fits an
      // in-flight/queued run (a retryable history row); a `ready` (re-downloadable) run can't go to
      // failed, so expire it instead (T-053). Whichever legal transition applies first wins.
      for (const to of ['failed', 'expired']) {
        try { this.setState(id, to, now); break; } catch { /* illegal from this state — try the next */ }
      }
      removeFile(row.bundle_path);
      if (row.output_path) removeFile(row.output_path);
      return this.get(id);
    },

    /** Delete every request for a user (+ their files). Used by account deletion (T-035). */
    purgeAllForUser(userId, removeFile = defaultRemoveFile) {
      const rows = db.prepare('SELECT id FROM requests WHERE user_id = ?').all(userId);
      for (const { id } of rows) this.purge(id, removeFile);
      return rows.length;
    },
  };

  return repo;
}
