/**
 * ROM-ownership validation by hash (T-022, ADR-008). Hash the uploaded ROM and
 * check it against the known-good official Pokémon Emerald dumps. The bytes are
 * never persisted — only the resulting `owns_valid_rom` flag (set by the route).
 */

import { createHash } from 'node:crypto';

/** Vanilla Emerald is 16 MB; the built (expansion) ROM is larger. */
export const EMERALD_SIZE = 16 * 1024 * 1024;

/**
 * Accepted official dumps (No-Intro). (USA, Europe) is confirmed; the JP/FR/DE/IT/ES
 * SHA-1s are locked from the No-Intro GBA DAT before the real upload path goes live
 * (see T-022). Ownership is independent of which ROM the server builds against.
 */
export const KNOWN_EMERALD_SHA1 = new Set([
  'f3ae088181bf583e55daf962a92bb46f4f1d07b7', // Pokémon - Emerald Version (USA, Europe)
]);

export function sha1hex(buffer) {
  return createHash('sha1').update(buffer).digest('hex');
}

export function createRomValidator({ knownHashes = KNOWN_EMERALD_SHA1 } = {}) {
  const known = knownHashes instanceof Set ? knownHashes : new Set(knownHashes);
  return {
    validate(buffer) {
      const sha1 = sha1hex(buffer);
      return { ok: known.has(sha1), sha1 };
    },
  };
}
