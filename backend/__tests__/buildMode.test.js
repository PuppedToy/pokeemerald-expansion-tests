// T-238/T-244 — how make.js decides to produce a ROM. Phase 3 flipped one env var per step with compile
// as the default; **T-244 inverted that**: injection is the default and the only path that can deliver a
// ROM, and the compile path survives only as GATE-3's reference, reachable by name alone. These pin that
// inversion, plus the guard that inject REFUSES to emit a ROM while any module is pending (it would ship
// base data as if it were randomized).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import makejs from '../../make.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveBuildMode, isCompileExplicitlyRequested } = require('../../randomizer/injector/mode.js');
const { INJECTION_MODULES } = require('../../randomizer/injector/index.js');

const TMP = path.join(os.tmpdir(), `ec-buildmode-${process.pid}`);
const clean = () => fs.rmSync(TMP, { recursive: true, force: true });

test('make.js exports the injection path alongside the compile path', () => {
  assert.equal(typeof makejs.buildOneRom, 'function');
  assert.equal(typeof makejs.injectOneRom, 'function');
  assert.equal(typeof makejs.resolveBasePaths, 'function');
});

// T-244 inverted the T-238 default. The point of the inversion is that no *absence* of configuration can
// select the compile path any more: not an empty env, not an unrelated env, not a bare argv.
test('the default build mode is inject — the compile path is never selected by omission', () => {
  assert.equal(resolveBuildMode({ env: {}, argv: [] }), 'inject');
  assert.equal(resolveBuildMode({ env: { BUILD_JOBS: '2' }, argv: ['--bundle=x.json'] }), 'inject');
  assert.equal(resolveBuildMode({ env: { ROM_BUILD_MODE: '' }, argv: [] }), 'inject');
});

test('compile is reachable only by name, and --inject beats a compile env (delivery cannot regress)', () => {
  assert.equal(resolveBuildMode({ env: {}, argv: ['--compile'] }), 'compile');
  assert.equal(resolveBuildMode({ env: { ROM_BUILD_MODE: 'compile' }, argv: [] }), 'compile');
  // buildRom.js spawns make.js with an explicit --inject for exactly this case (a stale box env).
  assert.equal(resolveBuildMode({ env: { ROM_BUILD_MODE: 'compile' }, argv: ['--inject'] }), 'inject');

  assert.equal(isCompileExplicitlyRequested({ env: {}, argv: [] }), false);
  assert.equal(isCompileExplicitlyRequested({ env: {}, argv: ['--compile'] }), true);
  assert.equal(isCompileExplicitlyRequested({ env: { ROM_BUILD_MODE: 'compile' }, argv: [] }), true);
  assert.equal(isCompileExplicitlyRequested({ env: { ROM_BUILD_MODE: 'compile' }, argv: ['--inject'] }), false);
});

test('an unrecognised mode throws instead of falling back to a pipeline nobody asked for', () => {
  assert.throws(() => resolveBuildMode({ env: { ROM_BUILD_MODE: 'compilee' }, argv: [] }), /Invalid build mode/);
});

// The quarantine (T-244): compileOneRom is GATE-3's reference, so a caller that did not ask for it by
// name must not be able to start a 4-minute `make` — least of all the delivery path.
test('compileOneRom refuses unless the compile path was asked for by name', async () => {
  await assert.rejects(
    () => makejs.compileOneRom({
      rom: { romIndex: 0, artifacts: { pokedex: {}, trainers: {}, starters: {}, wild: {} } },
      bundle: { config: {}, sharedData: {} }, seed: 1, outDir: TMP, allowCompile: false,
    }),
    /GATE-3 reference path/,
  );
});

// Which branch buildOneRom took is legible from *where* it fails: the compile path validates the resolved
// artifacts up front ("missing artifacts after resolution"), the inject path goes looking for the base ROM.
// So a default-mode call on a bundle with empty artifacts must fail on the base, never on the writers.
test('buildOneRom takes the inject branch by default, with no mode passed at all', async () => {
  clean();
  fs.mkdirSync(TMP, { recursive: true });
  let message = '(no error — buildOneRom returned)';
  try {
    await makejs.buildOneRom({
      rom: { romIndex: 0, artifacts: { pokedex: {}, trainers: {}, starters: {}, wild: {} } },
      bundle: { config: { seed: 1 }, sharedData: {} }, seed: 1, outDir: TMP, fullRom: true,
    });
  } catch (err) { message = err.message; }

  assert.doesNotMatch(message, /missing artifacts after resolution/, 'that is the compile path talking');
  assert.match(message, /base[\\/]pokeemerald\.gba/, 'the inject path resolves the base ROM first');
  clean();
});

test('base ROM/map/sym paths default under base/ and are env-overridable', () => {
  const def = makejs.resolveBasePaths({ env: {}, root: '/repo' });
  assert.equal(def.romPath, path.join('/repo', 'base', 'pokeemerald.gba'));
  assert.equal(def.mapPath, path.join('/repo', 'base', 'pokeemerald.map'));
  assert.equal(def.symPath, path.join('/repo', 'base', 'pokeemerald.sym'));

  const custom = makejs.resolveBasePaths({
    env: { INJECT_BASE_ROM: '/b/rom.gba', INJECT_BASE_MAP: '/b/rom.map', INJECT_BASE_SYM: '/b/rom.sym' },
    root: '/repo',
  });
  assert.equal(custom.romPath, '/b/rom.gba');
  assert.equal(custom.mapPath, '/b/rom.map');
  assert.equal(custom.symPath, '/b/rom.sym');
});

// The board is complete since T-243, so this guard is driven with an explicit pending module: the
// mechanism (a half-migrated board must never ship a ROM) outlives the last `pending` entry.
test('injectOneRom refuses while any Phase-3 module is pending', async () => {
  clean();
  fs.mkdirSync(TMP, { recursive: true });
  const romPath = path.join(TMP, 'pokeemerald.gba');
  const mapPath = path.join(TMP, 'pokeemerald.map');
  fs.writeFileSync(romPath, Buffer.alloc(0x1000, 0xff));
  fs.copyFileSync(path.join(process.cwd(), '..', 'randomizer', '__tests__', 'fixtures', 'mini.map'), mapPath);

  const bundle = { config: { seed: 1 }, sharedData: {}, roms: [] };
  const rom = { romIndex: 0, artifacts: { pokedex: {}, trainers: {}, starters: {}, wild: {} } };

  await assert.rejects(
    () => makejs.injectOneRom({
      rom, bundle, seed: 1, outDir: TMP, basePaths: { romPath, mapPath, symPath: null },
      modules: [{ id: 'todo', task: 'T-999', status: 'pending', apply: null }],
    }),
    /pending|not migrated/i,
    'a ROM built by injection today would carry BASE data for every un-migrated output',
  );
  clean();
});

test('a partial inject run is allowed explicitly and reproduces the base byte-for-byte (INV-BYTES)', async () => {
  // The wiring contract, independent of how far the migration has got: with nothing migrated, the
  // artifact make.js emits IS the base. (T-239 migrated group-a-fixed, whose tables this 4 KB fixture
  // base does not have — see the test below for that case.)
  clean();
  fs.mkdirSync(TMP, { recursive: true });
  const romPath = path.join(TMP, 'pokeemerald.gba');
  const mapPath = path.join(TMP, 'pokeemerald.map');
  const baseBytes = Buffer.alloc(0x1000, 0xff);
  fs.writeFileSync(romPath, baseBytes);
  fs.copyFileSync(path.join(process.cwd(), '..', 'randomizer', '__tests__', 'fixtures', 'mini.map'), mapPath);

  const bundle = { config: { seed: 1 }, sharedData: {}, roms: [] };
  const rom = { romIndex: 0, artifacts: { pokedex: {}, trainers: {}, starters: {}, wild: {} } };

  const result = await makejs.injectOneRom({
    rom, bundle, seed: 1, outDir: TMP, fullRom: true, allowPending: true,
    basePaths: { romPath, mapPath, symPath: null },
    modules: INJECTION_MODULES.map(m => ({ ...m, status: 'pending', apply: null })),
  });

  assert.equal(result.applied.length, 0, 'nothing migrated in this run');
  assert.equal(result.pending.length, INJECTION_MODULES.length);
  assert.deepEqual(fs.readFileSync(result.dest), baseBytes, 'a no-op inject IS the base');
  clean();
});

test('an injected module whose tables the base does not export fails loudly, naming the symbol', async () => {
  clean();
  fs.mkdirSync(TMP, { recursive: true });
  const romPath = path.join(TMP, 'pokeemerald.gba');
  const mapPath = path.join(TMP, 'pokeemerald.map');
  fs.writeFileSync(romPath, Buffer.alloc(0x1000, 0xff));
  fs.copyFileSync(path.join(process.cwd(), '..', 'randomizer', '__tests__', 'fixtures', 'mini.map'), mapPath);

  const bundle = { config: { seed: 1 }, sharedData: {}, roms: [] };
  const rom = { romIndex: 0, artifacts: { pokedex: {}, trainers: {}, starters: {}, wild: {} } };

  await assert.rejects(
    () => makejs.injectOneRom({
      rom, bundle, seed: 1, outDir: TMP, fullRom: true, allowPending: true,
      basePaths: { romPath, mapPath, symPath: null },
    }),
    /group-a-fixed[\s\S]*gSpeciesInfo/,
    'a base without the Group-A tables must stop the run, not silently ship base data',
  );
  clean();
});
