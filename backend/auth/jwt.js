/**
 * Minimal HS256 JWT (T-021, ADR-004). Hand-rolled over `crypto` so there is no
 * `jsonwebtoken` dependency. Signs/verifies and enforces `exp`. The secret comes
 * from env (JWT_SECRET) at the call site.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const b64urlJson = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

export function signJwt(payload, secret, { expiresInSec = 3600 } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const body = b64urlJson({ ...payload, iat: now, exp: now + expiresInSec });
  const data = `${head}.${body}`;
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyJwt(token, secret) {
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const [head, body, sig] = parts;
  const expected = createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('invalid signature');

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp != null && Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new Error('token expired');
  }
  return payload;
}
