/**
 * Beta invite audit repository (T-217). Append-only history of admin invite actions (balanced batches
 * and single accepts). Kept 100% — never swept, never purged on account deletion — so the beta's
 * who-was-let-in-when trail is complete (owner decision). DB-only; trivially testable with :memory:.
 */

export function createBetaInvitesRepo(db) {
  const insert = db.prepare(
    `INSERT INTO beta_invites (created_at, admin_email, kind, requested, granted, with_rom, added_build_secs, user_ids_json)
     VALUES (?,?,?,?,?,?,?,?)`
  );

  return {
    /** Record one invite action. `userIds` is the accepted set; `kind` is 'batch' | 'accept'. */
    record({ adminEmail = null, kind, requested = null, granted, withRom, addedBuildSecs, userIds, now = Date.now() }) {
      const info = insert.run(
        now, adminEmail, kind, requested, granted, withRom, Math.round(addedBuildSecs || 0),
        JSON.stringify(userIds ?? [])
      );
      return Number(info.lastInsertRowid);
    },

    /** Most-recent-first audit rows (for the admin panel), with user_ids parsed back to an array. */
    list(limit = 50) {
      const rows = db.prepare('SELECT * FROM beta_invites ORDER BY created_at DESC, id DESC LIMIT ?').all(limit);
      return rows.map((r) => ({ ...r, user_ids: JSON.parse(r.user_ids_json || '[]') }));
    },
  };
}
