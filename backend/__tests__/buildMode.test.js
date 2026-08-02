// T-238 — the compile-vs-inject switch as make.js sees it. Phase 3 flips one env var per step and must
// be able to flip it back, so these pin: compile is the default, inject is reachable, and inject
// REFUSES to emit a ROM while Phase-3 modules are still pending (it would ship base data as if it were
// randomized).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import makejs from '../../make.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveBuildMode } = require('../../randomizer/injector/mode.js');
const { INJECTION_MODULES } = require('../../randomizer/injector/index.js');

const TMP = path.join(os.tmpdir(), `ec-buildmode-${process.pid}`);
const clean = () => fs.rmSync(TMP, { recursive: true, force: true });

test('make.js exports the injection path alongside the compile path', () => {
  assert.equal(typeof makejs.buildOneRom, 'function');
  assert.equal(typeof makejs.injectOneRom, 'function');
  assert.equal(typeof makejs.resolveBasePaths, 'function');
});

test('the default build mode is compile — injection never turns itself on', () => {
  assert.equal(resolveBuildMode({ env: {}, argv: [] }), 'compile');
  assert.equal(resolveBuildMode({ env: { ROM_BUILD_MODE: 'inject' }, argv: [] }), 'inject');
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

test('injectOneRom refuses while Phase-3 modules are pending (T-243 still is)', async () => {
  clean();
  fs.mkdirSync(TMP, { recursive: true });
  const romPath = path.join(TMP, 'pokeemerald.gba');
  const mapPath = path.join(TMP, 'pokeemerald.map');
  fs.writeFileSync(romPath, Buffer.alloc(0x1000, 0xff));
  fs.copyFileSync(path.join(process.cwd(), '..', 'randomizer', '__tests__', 'fixtures', 'mini.map'), mapPath);

  const bundle = { config: { seed: 1 }, sharedData: {}, roms: [] };
  const rom = { romIndex: 0, artifacts: { pokedex: {}, trainers: {}, starters: {}, wild: {} } };

  await assert.rejects(
    () => makejs.injectOneRom({ rom, bundle, seed: 1, outDir: TMP, basePaths: { romPath, mapPath, symPath: null } }),
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
