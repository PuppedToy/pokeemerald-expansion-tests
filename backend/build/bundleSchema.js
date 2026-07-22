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
// T-068 — starter nicknames become C string literals in starter_choose.c, so restrict the charset
// (letters/digits/space) and the length (POKEMON_NAME_LENGTH = 12) before the writer ever sees them.
const SAFE_NICKNAME = /^[A-Za-z0-9 ]{0,12}$/;
// The frontend's bundle (frontend/js/randomizer-worker.js) emits these top-level keys.
export const TOP_KEYS = new Set(['roms', 'config', 'sharedData', 'sessionId', 'formatVersion', 'generatedAt', 'appVersion']);
export const REQUIRED_ARTIFACTS = ['pokedex', 'trainers', 'starters', 'wild'];
// T-191 — the bundle contract versions this app can build/migrate. Adding a structurally
// incompatible change means bumping the bundle formatVersion (in the randomizer's bundle()) and
// extending this set (+ a migration transform when one is needed). The drift check
// (__tests__/contractDrift.test.js) trips if the structural contract changes without this being
// consciously updated.
export const SUPPORTED_FORMAT_VERSIONS = new Set([2]);

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

export function isSafeRelPath(p) {
  if (typeof p !== 'string' || p.length === 0) return false;
  if (!SAFE_PATH.test(p)) return false;            // charset blocks spaces, NUL, backslash, etc.
  if (path.isAbsolute(p)) return false;
  const norm = path.normalize(p);
  if (norm === '..' || norm.startsWith(`..${path.sep}`) || norm.includes(`${path.sep}..`)) return false;
  return true;
}

// T-068 — optional per-ROM `artifacts.starterNaming` = { starter: slot|null, extras: slot[] }
// where slot = { gender: 'M'|'F', nickname: string|null }. Names are sanitized here (defence-in-depth).
function validateSlot(slot, where, errors) {
  if (slot === null) return;
  if (!isPlainObject(slot)) { errors.push(`${where} must be an object or null`); return; }
  if (slot.gender !== 'M' && slot.gender !== 'F') errors.push(`${where}.gender must be 'M' or 'F'`);
  if (slot.nickname !== null && slot.nickname !== undefined
      && (typeof slot.nickname !== 'string' || !SAFE_NICKNAME.test(slot.nickname))) {
    errors.push(`${where}.nickname must be null or [A-Za-z0-9 ]{0,12}`);
  }
}

function validateStarterNaming(sn, i, errors) {
  const where = `roms[${i}].artifacts.starterNaming`;
  if (!isPlainObject(sn)) { errors.push(`${where} must be an object`); return; }
  if (sn.starter !== undefined) validateSlot(sn.starter, `${where}.starter`, errors);
  if (!Array.isArray(sn.extras)) { errors.push(`${where}.extras must be an array`); return; }
  sn.extras.forEach((slot, j) => validateSlot(slot, `${where}.extras[${j}]`, errors));
}

// T-070 — optional per-ROM `artifacts.locationNaming` = { <MAP_* key>: slot } where slot is the same
// { gender:'M'|'F'|null, nickname:string|null } shape. Map keys are C constant names; restrict to a safe
// identifier charset (they become MAP_* tokens in generated C). Names are sanitized like starter nicknames.
const SAFE_MAP_KEY = /^[A-Za-z0-9_]{1,64}$/;

function validateLocationNaming(ln, i, errors) {
  const where = `roms[${i}].artifacts.locationNaming`;
  if (!isPlainObject(ln)) { errors.push(`${where} must be an object`); return; }
  for (const key of Object.keys(ln)) {
    if (!SAFE_MAP_KEY.test(key)) { errors.push(`${where} key "${key}" is not a safe MAP_* identifier`); continue; }
    const slot = ln[key];
    if (!isPlainObject(slot)) { errors.push(`${where}.${key} must be an object`); continue; }
    // Unlike starter slots, a location's gender may be null (gender-lock off = names only).
    if (slot.gender !== 'M' && slot.gender !== 'F' && slot.gender !== null && slot.gender !== undefined) {
      errors.push(`${where}.${key}.gender must be 'M', 'F' or null`);
    }
    if (slot.nickname !== null && slot.nickname !== undefined
        && (typeof slot.nickname !== 'string' || !SAFE_NICKNAME.test(slot.nickname))) {
      errors.push(`${where}.${key}.nickname must be null or [A-Za-z0-9 ]{0,12}`);
    }
  }
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
  if (rom.artifacts.starterNaming !== undefined) {
    validateStarterNaming(rom.artifacts.starterNaming, i, errors);
  }
  if (rom.artifacts.locationNaming !== undefined) {
    validateLocationNaming(rom.artifacts.locationNaming, i, errors);
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
  // T-190 — the bundle contract fields drive migration/compat (formatVersion) and telemetry
  // (generatedAt). Previously accepted-but-unvalidated; tighten them now that arbitrary bundles
  // can be uploaded for regeneration.
  if (bundle.formatVersion !== undefined) {
    if (!Number.isInteger(bundle.formatVersion) || bundle.formatVersion < 0) {
      errors.push('formatVersion must be a non-negative integer');
    } else if (!SUPPORTED_FORMAT_VERSIONS.has(bundle.formatVersion)) {
      // T-191 — compatibility gate: reject a bundle whose contract this app cannot build/migrate,
      // with a clear message instead of a confusing downstream build failure.
      errors.push(`unsupported bundle formatVersion ${bundle.formatVersion} (this app supports: ${[...SUPPORTED_FORMAT_VERSIONS].join(', ')}); regenerate the bundle with a compatible app version`);
    }
  }
  if (bundle.generatedAt !== undefined && (typeof bundle.generatedAt !== 'string' || bundle.generatedAt.length > 40)) {
    errors.push('generatedAt must be a string (max 40 chars)');
  }
  if (bundle.appVersion !== undefined && bundle.appVersion !== null
      && (typeof bundle.appVersion !== 'string' || bundle.appVersion.length > 32)) {
    errors.push('appVersion must be a string (max 32 chars) or null');
  }
  if (!Array.isArray(bundle.roms) || bundle.roms.length === 0) {
    errors.push('roms must be a non-empty array');
  } else {
    bundle.roms.forEach((rom, i) => validateRom(rom, i, errors));
  }

  return { ok: errors.length === 0, errors };
}
