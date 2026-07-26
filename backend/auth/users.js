/**
 * Users repository (T-021). Owns reads/writes of the `users` table created by the
 * T-023 schema. Auth logic lives in service.js; this is the data access.
 */

export function createUsersRepo(db) {
  const insert = db.prepare(
    'INSERT INTO users (email,password_hash,verified,created_at,updated_at) VALUES (?,?,0,?,?)'
  );
  const byEmail = db.prepare('SELECT * FROM users WHERE email = ?');
  const byId = db.prepare('SELECT * FROM users WHERE id = ?');

  const repo = {
    create({ email, passwordHash, now = Date.now() }) {
      try {
        const info = insert.run(email, passwordHash, now, now);
        return this.get(Number(info.lastInsertRowid));
      } catch (err) {
        if (/UNIQUE/i.test(err.message)) throw new Error('email already exists');
        throw err;
      }
    },
    findByEmail(email) { return byEmail.get(email) ?? null; },
    get(id) { return byId.get(id) ?? null; },
    setVerified(id, now = Date.now()) {
      db.prepare('UPDATE users SET verified = 1, updated_at = ? WHERE id = ?').run(now, id);
    },
    // T-216 — beta invite state: 'pending' (new registrations while BETA is on) | 'accepted'.
    setInviteState(id, state, now = Date.now()) {
      db.prepare('UPDATE users SET invite_state = ?, updated_at = ? WHERE id = ?').run(state, now, id);
    },
    // T-217 — admin beta panel reads. Only email-verified pending users are eligible for the lottery.
    listPendingVerified() {
      return db.prepare("SELECT * FROM users WHERE verified = 1 AND invite_state = 'pending' ORDER BY created_at ASC").all();
    },
    listByInviteState(state, limit = 200) {
      return db.prepare('SELECT * FROM users WHERE invite_state = ? ORDER BY created_at ASC LIMIT ?').all(state, limit);
    },
    countByInviteState() {
      const out = {};
      for (const r of db.prepare('SELECT invite_state AS s, COUNT(*) AS n FROM users GROUP BY invite_state').all()) {
        out[r.s] = r.n;
      }
      return out;
    },
    search(q, limit = 25) {
      const like = `%${String(q || '').toLowerCase().replace(/[%_]/g, '')}%`; // strip LIKE wildcards from user input
      return db.prepare('SELECT * FROM users WHERE lower(email) LIKE ? ORDER BY created_at ASC LIMIT ?').all(like, limit);
    },
    setPassword(id, passwordHash, now = Date.now()) {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, now, id);
    },
    delete(id) {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
    },
  };
  return repo;
}
