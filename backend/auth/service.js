/**
 * Auth service (T-021, ADR-004). Orchestrates the users + tokens repos, password
 * hashing, JWT issuing and the mailer (T-027). HTTP-free so it is unit-testable;
 * routes.js is the thin express glue over this.
 */

import { hashPassword, verifyPassword } from './password.js';
import { signJwt } from './jwt.js';

const RESET_TTL_MS = 60 * 60 * 1000; // password-reset links expire in 1h

export function createAuthService({
  users, tokens, mailer, jwtSecret,
  verifyUrl, resetUrl,
  now = () => Date.now(),
  sessionTtlSec = 7 * 24 * 3600,
}) {
  return {
    async register({ email, password }) {
      const user = users.create({ email, passwordHash: hashPassword(password), now: now() });
      const raw = tokens.issue(user.id, 'verify', { now: now() });
      await mailer.sendMail('verify', email, { link: verifyUrl(raw) });
      return { userId: user.id };
    },

    async verifyEmail(rawToken) {
      const userId = tokens.consume(rawToken, 'verify', { now: now() });
      if (!userId) return false;
      users.setVerified(userId, now());
      return true;
    },

    async login({ email, password }) {
      const user = users.findByEmail(email);
      if (!user || !verifyPassword(password, user.password_hash)) {
        throw new Error('invalid credentials');
      }
      return { token: signJwt({ sub: user.id }, jwtSecret, { expiresInSec: sessionTtlSec }) };
    },

    async requestReset(email) {
      const user = users.findByEmail(email);
      if (user) {
        const raw = tokens.issue(user.id, 'reset', { ttlMs: RESET_TTL_MS, now: now() });
        await mailer.sendMail('reset', email, { link: resetUrl(raw) });
      }
      return { ok: true }; // never reveal whether the email is registered
    },

    async resetPassword(rawToken, newPassword) {
      const userId = tokens.consume(rawToken, 'reset', { now: now() });
      if (!userId) return false;
      users.setPassword(userId, hashPassword(newPassword), now());
      return true;
    },
  };
}
