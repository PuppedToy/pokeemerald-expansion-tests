// T-211 — download naming convention (1-indexed; per-player folders for soul-link).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSoulLink, bundleFileName, romName, parseServerName, romForServerName } from '../js/romNaming.js';

const nuzlocke = [{ romIndex: 0 }, { romIndex: 1 }, { romIndex: 2 }];
const soullink = [
  { playerIndex: 0, romIndex: 0 }, { playerIndex: 0, romIndex: 1 },
  { playerIndex: 1, romIndex: 2 }, { playerIndex: 1, romIndex: 3 },
];

test('bundleFileName is always bundle-<seed>.json', () => {
  assert.equal(bundleFileName(12345), 'bundle-12345.json');
});

test('isSoulLink distinguishes the two shapes', () => {
  assert.equal(isSoulLink(nuzlocke), false);
  assert.equal(isSoulLink(soullink), true);
});

test('default/nuzlocke roms are rom-1..rom-N at the root (1-indexed, no folder)', () => {
  assert.deepEqual(romName(nuzlocke[0], nuzlocke), { folder: null, base: 'rom-1' });
  assert.deepEqual(romName(nuzlocke[2], nuzlocke), { folder: null, base: 'rom-3' });
});

test('soul-link roms live in per-player folders, renumbered per player from 1', () => {
  assert.deepEqual(romName(soullink[0], soullink), { folder: 'player-1', base: 'player-1-rom-1' });
  assert.deepEqual(romName(soullink[1], soullink), { folder: 'player-1', base: 'player-1-rom-2' });
  // player 2's roms restart at rom-1 (not the global 3/4)
  assert.deepEqual(romName(soullink[2], soullink), { folder: 'player-2', base: 'player-2-rom-1' });
  assert.deepEqual(romName(soullink[3], soullink), { folder: 'player-2', base: 'player-2-rom-2' });
});

test('parseServerName reads make.js 0-indexed names', () => {
  assert.deepEqual(parseServerName('rom-0.bps'), { playerIndex: undefined, romIndex: 0 });
  assert.deepEqual(parseServerName('player-1-rom-3.gba'), { playerIndex: 1, romIndex: 3 });
  assert.equal(parseServerName('weird.txt'), null);
});

test('romForServerName maps a server artifact back to its bundle rom', () => {
  assert.equal(romForServerName('player-1-rom-2.bps', soullink), soullink[2]);
  assert.equal(romForServerName('rom-1.gba', nuzlocke), nuzlocke[1]);
});
