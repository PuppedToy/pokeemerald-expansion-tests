/**
 * ROM-ownership validation by hash (T-022, ADR-008). Hash the uploaded ROM and
 * check it against the known-good official Pokémon Emerald dumps. The bytes are
 * never persisted — only the resulting `owns_valid_rom` flag (set by the route).
 */

import { createHash } from 'node:crypto';

/** Vanilla Emerald is 16 MB; the built (expansion) ROM is larger. */
export const EMERALD_SIZE = 16 * 1024 * 1024;

/**
 * Accepted official dumps — every legal Pokémon Emerald revision, SHA-1s taken from the No-Intro
 * "Nintendo - Game Boy Advance" DAT (serials AGB-BPE*). The (USA, Europe) hash matches the value the
 * codebase already trusted, which anchors the rest of the set; each SHA-1 was cross-checked against
 * the DAT's MD5 for the same entry (T-037). Ownership is independent of which ROM the server builds against.
 */
export const KNOWN_EMERALD_SHA1 = new Set([
  'f3ae088181bf583e55daf962a92bb46f4f1d07b7', // Pokémon - Emerald Version (USA, Europe)   [BPEE]
  'd7cf8f156ba9c455d164e1ea780a6bf1945465c2', // Pocket Monsters - Emerald (Japan)          [BPEJ]
  '61c2eb2b380b1a75f0c94b767a2d4c26cd7ce4e3', // Pokémon - Smaragd-Edition (Germany)        [BPED]
  'ca666651374d89ca439007bed54d839eb7bd14d0', // Pokémon - Version Émeraude (France)        [BPEF]
  '1692db322400c3141c5de2db38469913ceb1f4d4', // Pokémon - Versione Smeraldo (Italy)        [BPEI]
  'fe1558a3dcb0360ab558969e09b690888b846dd9', // Pokémon - Edición Esmeralda (Spain)        [BPES]
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
    // Hash-only path (T-053, ADR-013): the client hashes its own ROM and sends just the SHA-1, so the
    // ROM bytes never leave the user's machine. Ownership is an attestation, not DRM (the BPS is inert
    // without a genuine base ROM), so trusting the client-computed hash is acceptable here.
    validateHash(sha1) {
      const hex = String(sha1).toLowerCase();
      return { ok: known.has(hex), sha1: hex };
    },
  };
}
