import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validateBundle, isSafeRelPath } from '../build/bundleSchema.js';

const validRom = (over = {}) => ({
  romIndex: 0,
  artifacts: { pokedex: 'pk', trainers: 'tr', starters: 'st', wild: { file: 'data/wild_encounters.json' } },
  ...over,
});
const validBundle = (over = {}) => ({ sessionId: 'sess_abc-123', roms: [validRom()], ...over });

test('a well-formed bundle validates', () => {
  assert.equal(validateBundle(validBundle()).ok, true);
});

test('accepts the real frontend top-level keys formatVersion + generatedAt (B-005)', () => {
  const b = {
    formatVersion: 2,
    generatedAt: '2026-06-28T00:00:00.000Z',
    sessionId: '4eeff242-a688-4eb7-a6b4-43167197d007',
    config: { seed: 7 },
    sharedData: {},
    roms: [validRom()],
  };
  assert.equal(validateBundle(b).ok, true, JSON.stringify(validateBundle(b).errors));
});

test('a non-object bundle is rejected', () => {
  assert.equal(validateBundle(null).ok, false);
  assert.equal(validateBundle('x').ok, false);
});

test('roms must be a non-empty array', () => {
  assert.equal(validateBundle(validBundle({ roms: [] })).ok, false);
  assert.equal(validateBundle(validBundle({ roms: 'nope' })).ok, false);
});

test('unexpected top-level keys are rejected (strict allow-list)', () => {
  const r = validateBundle(validBundle({ evil: 1 }));
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /unexpected top-level key/i);
});

test('sessionId is confined to a safe slug (no path traversal)', () => {
  assert.equal(validateBundle(validBundle({ sessionId: '../../etc' })).ok, false);
  assert.equal(validateBundle(validBundle({ sessionId: '/abs' })).ok, false);
  assert.equal(validateBundle(validBundle({ sessionId: 'ok_slug-1' })).ok, true);
});

test('romIndex / playerIndex must be non-negative integers (they become filenames)', () => {
  assert.equal(validateBundle(validBundle({ roms: [validRom({ romIndex: '../x' })] })).ok, false);
  assert.equal(validateBundle(validBundle({ roms: [validRom({ romIndex: -1 })] })).ok, false);
  assert.equal(validateBundle(validBundle({ roms: [validRom({ playerIndex: 'a' })] })).ok, false);
});

test('a rom missing a required artifact is rejected', () => {
  const rom = validRom();
  delete rom.artifacts.wild;
  assert.equal(validateBundle(validBundle({ roms: [rom] })).ok, false);
});

test('wild.file (a writer-written path) must be a safe relative path', () => {
  const bad = validRom({ artifacts: { pokedex: 'p', trainers: 't', starters: 's', wild: { file: '../../../etc/passwd' } } });
  assert.equal(validateBundle(validBundle({ roms: [bad] })).ok, false);
});

// ── T-068: starterNaming (optional per-ROM artifact) ─────────────────────────
const withNaming = (naming) => validRom({
  artifacts: { pokedex: 'p', trainers: 't', starters: 's', wild: { file: 'data/wild_encounters.json' }, starterNaming: naming },
});
const okBundle = (naming) => validateBundle(validBundle({ roms: [withNaming(naming)] }));

test('starterNaming: a well-formed naming validates', () => {
  const r = okBundle({ starter: { gender: 'M', nickname: 'Yuki' }, extras: [{ gender: 'F', nickname: 'Aada' }, { gender: 'M', nickname: null }] });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test('starterNaming: starter may be null (include-starter off) and nickname may be empty', () => {
  assert.equal(okBundle({ starter: null, extras: [{ gender: 'M', nickname: '' }] }).ok, true);
});

test('starterNaming: bad gender is rejected', () => {
  assert.equal(okBundle({ starter: null, extras: [{ gender: 'X', nickname: 'Ana' }] }).ok, false);
});

test('starterNaming: unsafe nicknames (injection / bad chars / too long) are rejected', () => {
  assert.equal(okBundle({ starter: null, extras: [{ gender: 'M', nickname: '"),SPECIES_X' }] }).ok, false);
  assert.equal(okBundle({ starter: null, extras: [{ gender: 'M', nickname: 'a"b' }] }).ok, false);
  assert.equal(okBundle({ starter: null, extras: [{ gender: 'M', nickname: 'ThirteenChars' }] }).ok, false); // 13 > 12
});

test('starterNaming: malformed shape is rejected', () => {
  assert.equal(okBundle('nope').ok, false);
  assert.equal(okBundle({ starter: null, extras: 'nope' }).ok, false);
  assert.equal(okBundle({ starter: { gender: 'M' /* nickname missing is ok */ }, extras: [] }).ok, true);
});

// ── T-070: locationNaming (optional per-ROM artifact) ────────────────────────
const withLocNaming = (ln) => validRom({
  artifacts: { pokedex: 'p', trainers: 't', starters: 's', wild: { file: 'data/wild_encounters.json' }, locationNaming: ln },
});
const okLoc = (ln) => validateBundle(validBundle({ roms: [withLocNaming(ln)] }));

test('locationNaming: a well-formed map validates', () => {
  const r = okLoc({ MAP_ROUTE102: { gender: null, nickname: 'Percy' }, MAP_PETALBURG_WOODS: { gender: 'F', nickname: 'Aada' } });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test('locationNaming: null gender + null nickname allowed', () => {
  assert.equal(okLoc({ MAP_ROUTE101: { gender: null, nickname: null } }).ok, true);
});

test('locationNaming: unsafe map key or nickname is rejected', () => {
  assert.equal(okLoc({ 'MAP_X; rm -rf': { gender: null, nickname: 'A' } }).ok, false);
  assert.equal(okLoc({ MAP_ROUTE102: { gender: null, nickname: 'a"b' } }).ok, false);
  assert.equal(okLoc({ MAP_ROUTE102: { gender: 'X', nickname: 'A' } }).ok, false);
});

test('locationNaming: non-object is rejected', () => {
  assert.equal(okLoc('nope').ok, false);
});

// ── T-190: tighten the previously-unvalidated top-level contract fields ──────
test('formatVersion, if present, must be a non-negative integer (T-190)', () => {
  assert.equal(validateBundle(validBundle({ formatVersion: 2 })).ok, true);
  assert.equal(validateBundle(validBundle({ formatVersion: -1 })).ok, false);
  assert.equal(validateBundle(validBundle({ formatVersion: 1.5 })).ok, false);
  assert.equal(validateBundle(validBundle({ formatVersion: 'two' })).ok, false);
});

test('generatedAt, if present, must be a bounded string (T-190)', () => {
  assert.equal(validateBundle(validBundle({ generatedAt: '2026-06-28T00:00:00.000Z' })).ok, true);
  assert.equal(validateBundle(validBundle({ generatedAt: 123 })).ok, false);
  assert.equal(validateBundle(validBundle({ generatedAt: 'x'.repeat(100) })).ok, false);
});

test('appVersion, if present, must be a bounded string or null (T-190)', () => {
  assert.equal(validateBundle(validBundle({ appVersion: '0.5.0' })).ok, true);
  assert.equal(validateBundle(validBundle({ appVersion: null })).ok, true);
  assert.equal(validateBundle(validBundle({ appVersion: 5 })).ok, false);
  assert.equal(validateBundle(validBundle({ appVersion: 'x'.repeat(40) })).ok, false);
});

test('isSafeRelPath blocks absolute, traversal and odd chars', () => {
  assert.equal(isSafeRelPath('data/wild.json'), true);
  assert.equal(isSafeRelPath('/etc/passwd'), false);
  assert.equal(isSafeRelPath('../escape'), false);
  assert.equal(isSafeRelPath('a/../../b'), false);
  assert.equal(isSafeRelPath('x y'), false);
  assert.equal(isSafeRelPath(''), false);
});
