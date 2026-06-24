/**
 * Password hashing (T-021, ADR-004). Uses the built-in `crypto.scrypt` — a strong
 * memory-hard KDF — so there is no native dependency (consistent with node:sqlite,
 * keeps the T-026 image lean). This is a deliberate deviation from ADR-004's literal
 * "argon2id"; logged in T-021 and an easy swap if the owner wants argon2id later.
 *
 * Stored format: `scrypt$<saltHex>$<derivedHex>`.
 */

import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;
const N = 16384; // CPU/memory cost

export function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEYLEN, { N });
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const parts = String(stored).split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  const derived = scryptSync(password, salt, expected.length, { N });
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
