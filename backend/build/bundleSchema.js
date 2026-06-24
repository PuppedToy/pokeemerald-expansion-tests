/**
 * Strict bundle validation (T-026, ADR-006). The bundle is untrusted input that
 * drives a native build, so it is validated against an allow-list before any writer
 * runs. The critical concern is path traversal: audit (T-026) found three bundle
 * fields that become filesystem paths —
 *   - `sessionId`            → `roms/<sessionId>` output dir (make.js)
 *   - `romIndex`/`playerIndex` → the ROM filename (make.js)
 *   - `artifacts.wild.file`  → a path written by writer.js
 * — all confined here. Defense-in-depth (confining the writers themselves to a fixed
 * target set) is a recommended follow-up; container hardening is T-019.
 */

import path from 'node:path';

const SAFE_SLUG = /^[A-Za-z0-9_-]{1,64}$/;
const SAFE_PATH = /^[A-Za-z0-9_./-]+$/;
const TOP_KEYS = new Set(['roms', 'config', 'sharedData', 'sessionId', 'version']);
const REQUIRED_ARTIFACTS = ['pokedex', 'trainers', 'starters', 'wild'];

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

export function isSafeRelPath(p) {
  if (typeof p !== 'string' || p.length === 0) return false;
  if (!SAFE_PATH.test(p)) return false;            // charset blocks spaces, NUL, backslash, etc.
  if (path.isAbsolute(p)) return false;
  const norm = path.normalize(p);
  if (norm === '..' || norm.startsWith(`..${path.sep}`) || norm.includes(`${path.sep}..`)) return false;
  return true;
}

function validateRom(rom, i, errors) {
  if (!isPlainObject(rom)) { errors.push(`roms[${i}] must be an object`); return; }
  if (!Number.isInteger(rom.romIndex) || rom.romIndex < 0) {
    errors.push(`roms[${i}].romIndex must be a non-negative integer`);
  }
  if (rom.playerIndex !== undefined && (!Number.isInteger(rom.playerIndex) || rom.playerIndex < 0)) {
    errors.push(`roms[${i}].playerIndex must be a non-negative integer`);
  }
  if (!isPlainObject(rom.artifacts)) { errors.push(`roms[${i}].artifacts must be an object`); return; }
  for (const key of REQUIRED_ARTIFACTS) {
    if (rom.artifacts[key] === undefined) errors.push(`roms[${i}].artifacts.${key} is required`);
  }
  const wild = rom.artifacts.wild;
  if (isPlainObject(wild) && wild.file !== undefined && !isSafeRelPath(wild.file)) {
    errors.push(`roms[${i}].artifacts.wild.file is not a safe relative path`);
  }
}

export function validateBundle(bundle) {
  const errors = [];
  if (!isPlainObject(bundle)) return { ok: false, errors: ['bundle must be an object'] };

  for (const k of Object.keys(bundle)) {
    if (!TOP_KEYS.has(k)) errors.push(`unexpected top-level key: ${k}`);
  }
  if (bundle.sessionId !== undefined && !SAFE_SLUG.test(bundle.sessionId)) {
    errors.push('sessionId must be a safe slug ([A-Za-z0-9_-], max 64 chars)');
  }
  if (!Array.isArray(bundle.roms) || bundle.roms.length === 0) {
    errors.push('roms must be a non-empty array');
  } else {
    bundle.roms.forEach((rom, i) => validateRom(rom, i, errors));
  }

  return { ok: errors.length === 0, errors };
}
