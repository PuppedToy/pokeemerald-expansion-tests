'use strict';

// TDD (T-053, ADR-013): emitArtifact turns a freshly-built ROM into the delivered artifact — a BPS
// delta (default) or the full .gba (--full-rom). fs is injected so this stays a pure unit test.

const path = require('path');
const { emitArtifact, resolveVanillaPath } = require('../../romArtifact');
const { applyBps } = require('../../bps');

const eq = (a, b) => Array.from(a).join(',') === Array.from(b).join(',');

// In-memory fs double: files is { path: Uint8Array }; captures writes/copies in _writes.
function mockFs(files) {
    const writes = {};
    return {
        existsSync: (p) => p in files,
        readFileSync: (p) => Buffer.from(files[p]),
        writeFileSync: (p, data) => { writes[p] = Uint8Array.from(data); },
        copyFileSync: (src, dst) => { writes[dst] = Uint8Array.from(files[src]); },
        _writes: writes,
    };
}

const VANILLA = Uint8Array.from({ length: 256 }, (_, i) => (i * 7) & 0xff);
const BUILT = (() => { const b = Uint8Array.from(VANILLA); for (let i = 0; i < 80; i++) b[i] = (i * 13 + 1) & 0xff; return b; })();

describe('emitArtifact — BPS mode (default)', () => {
    test('writes a .bps that applies back to the built ROM', () => {
        const fs = mockFs({ '/v.gba': VANILLA, '/build/rom-0.gba': BUILT });
        const dest = emitArtifact({
            builtRomPath: '/build/rom-0.gba', outDir: '/out', label: 'rom-0.gba',
            fullRom: false, vanillaPath: '/v.gba', fs,
        });
        expect(dest).toBe(path.join('/out', 'rom-0.bps'));
        expect(eq(applyBps(fs._writes[dest], VANILLA), BUILT)).toBe(true);
    });

    test('throws a helpful error when the vanilla reference is missing', () => {
        const fs = mockFs({ '/build/rom-0.gba': BUILT });
        expect(() => emitArtifact({
            builtRomPath: '/build/rom-0.gba', outDir: '/out', label: 'rom-0.gba',
            fullRom: false, vanillaPath: '/v.gba', fs,
        })).toThrow(/vanilla reference rom not found/i);
    });
});

describe('emitArtifact — full ROM mode (--full-rom)', () => {
    test('copies the .gba verbatim and never needs a vanilla', () => {
        const fs = mockFs({ '/build/rom-0.gba': BUILT });
        const dest = emitArtifact({
            builtRomPath: '/build/rom-0.gba', outDir: '/out', label: 'rom-0.gba', fullRom: true, fs,
        });
        expect(dest).toBe(path.join('/out', 'rom-0.gba'));
        expect(eq(fs._writes[dest], BUILT)).toBe(true);
    });
});

// T-238 — an injected ROM never touches the filesystem before delivery: the injector holds the bytes
// in memory, so the artifact emitter must accept a buffer as well as a path. Same BPS/full-ROM
// contract, so a delivered artifact is indistinguishable from a compiled one.
describe('emitArtifact — injected ROM (in-memory bytes, T-238)', () => {
    test('BPS mode diffs the buffer against vanilla without reading a built file', () => {
        const fs = mockFs({ '/v.gba': VANILLA });
        const dest = emitArtifact({
            builtRomBuffer: Buffer.from(BUILT), outDir: '/out', label: 'rom-0.gba',
            fullRom: false, vanillaPath: '/v.gba', fs,
        });
        expect(dest).toBe(path.join('/out', 'rom-0.bps'));
        expect(eq(applyBps(fs._writes[dest], VANILLA), BUILT)).toBe(true);
    });

    test('full-ROM mode writes the buffer verbatim', () => {
        const fs = mockFs({});
        const dest = emitArtifact({
            builtRomBuffer: Buffer.from(BUILT), outDir: '/out', label: 'rom-0.gba', fullRom: true, fs,
        });
        expect(eq(fs._writes[dest], BUILT)).toBe(true);
    });

    test('neither a path nor a buffer is a programming error, not an empty ROM', () => {
        expect(() => emitArtifact({ outDir: '/out', label: 'rom-0.gba', fullRom: true, fs: mockFs({}) }))
            .toThrow(/builtRomPath|builtRomBuffer/);
    });
});

describe('resolveVanillaPath', () => {
    test('honors VANILLA_ROM when set', () => {
        expect(resolveVanillaPath('/repo', { VANILLA_ROM: '/custom/base.gba' })).toBe('/custom/base.gba');
    });
    test('defaults to pokeemerald-vanilla.gba at the repo root', () => {
        expect(resolveVanillaPath('/repo', {})).toBe(path.join('/repo', 'pokeemerald-vanilla.gba'));
    });
});
