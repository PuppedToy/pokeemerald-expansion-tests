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
    setPassword(id, passwordHash, now = Date.now()) {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, now, id);
    },
    delete(id) {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
    },
  };
  return repo;
}
