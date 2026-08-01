// T-238 — the injector orchestrator + module registry. The registry is the migration's progress board:
// one entry per Phase-3 task, `pending` until that task migrates its output. While anything is pending,
// injecting a real ROM would silently ship BASE data for the un-migrated outputs (a randomized ROM that
// isn't randomized), so the orchestrator refuses unless the caller says it wants a partial run.
const fs = require('fs');
const path = require('path');
const {
    injectRom,
    loadBase,
    INJECTION_MODULES,
    pendingModules,
    migratedModules,
    checkReadiness,
} = require('../../injector');
const { Rom } = require('../../injector/rom');
const { parseMapFile } = require('../../injector/symbolMap');

const MAP = path.join(__dirname, '..', 'fixtures', 'mini.map');
const offsetMap = parseMapFile(fs.readFileSync(MAP, 'utf8'));
const baseBuffer = Buffer.alloc(0x1000, 0xff);

describe('the module registry (T-238)', () => {
    test('has one entry per Phase-3 migration task, all pending at T-238', () => {
        expect(INJECTION_MODULES.map(m => m.task)).toEqual(['T-239', 'T-240', 'T-241', 'T-242', 'T-243']);
        expect(pendingModules()).toHaveLength(INJECTION_MODULES.length);
        expect(migratedModules()).toHaveLength(0);
    });

    test('every module has a unique id and either an apply() or pending status', () => {
        const ids = INJECTION_MODULES.map(m => m.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const m of INJECTION_MODULES) {
            expect(['pending', 'migrated']).toContain(m.status);
            if (m.status === 'migrated') expect(typeof m.apply).toBe('function');
        }
    });
});

describe('what each module claims (T-238)', () => {
    test('every module declares the base symbols (or name patterns) it will write', () => {
        for (const m of INJECTION_MODULES) {
            expect(Array.isArray(m.symbols)).toBe(true);
            expect(m.symbols.length + (m.symbolPatterns?.length ?? 0)).toBeGreaterThan(0);
        }
    });

    test('no two modules claim the same symbol — ownership is exclusive (INV-BYTES)', () => {
        const seen = new Map();
        for (const m of INJECTION_MODULES) {
            for (const s of m.symbols) {
                expect(seen.has(s) ? `${s} also claimed by ${seen.get(s)}` : s).toBe(s);
                seen.set(s, m.id);
            }
        }
    });

    test('claims every injectable symbol the golden-master manifest tracks (T-230/T-237)', () => {
        // The corpus manifest is the snapshot of what Phase 2 exported for injection; if it lists a
        // symbol no module claims, that output would silently stay at its base value in Phase 3.
        const manifest = JSON.parse(fs.readFileSync(
            path.resolve(__dirname, '..', '..', '..', 'backend', 'build', 'golden-corpus', 'manifest.json'), 'utf8'));
        const tracked = Object.keys(manifest.injectableSymbols).filter(k => !k.startsWith('_'));
        const claimed = new Set(INJECTION_MODULES.flatMap(m => m.symbols));
        expect(tracked.filter(s => !claimed.has(s))).toEqual([]);
    });
});

describe('checkReadiness (T-238)', () => {
    test('reports, per module, which claimed symbols the base actually exports', () => {
        const modules = [
            { id: 'a', task: 'T-239', status: 'pending', symbols: ['gItemsInfo', 'gNotInTheBase'], symbolPatterns: [] },
            { id: 'b', task: 'T-240', status: 'pending', symbols: [], symbolPatterns: [/LevelUpLearnset$/] },
        ];
        const report = checkReadiness(offsetMap, modules);
        expect(report[0]).toMatchObject({ id: 'a', missing: ['gNotInTheBase'] });
        expect(report[0].found).toEqual(['gItemsInfo']);
        expect(report[1].matched).toBe(2);          // the two learnsets in the fixture map
        expect(report[1].missing).toEqual([]);
    });

    test('a pattern that matches nothing counts as missing, not as trivially ready', () => {
        const modules = [{ id: 'x', task: 'T-241', status: 'pending', symbols: [], symbolPatterns: [/NoSuchFamily$/] }];
        expect(checkReadiness(offsetMap, modules)[0].missing).toEqual(['/NoSuchFamily$/']);
    });
});

describe('injectRom (T-238)', () => {
    const base = () => Rom.fromBuffer(baseBuffer);

    test('the no-op pass reproduces the base byte-for-byte (INV-BYTES baseline)', () => {
        const result = injectRom({ rom: base(), offsetMap, data: {}, allowPending: true });
        expect(result.rom.sha256()).toBe(Rom.fromBuffer(baseBuffer).sha256());
        expect(result.rom.bytesWritten).toBe(0);
        expect(result.applied).toEqual([]);
        expect(result.pending.map(m => m.task)).toEqual(['T-239', 'T-240', 'T-241', 'T-242', 'T-243']);
    });

    test('refuses to emit a ROM while modules are pending, naming what is missing', () => {
        expect(() => injectRom({ rom: base(), offsetMap, data: {} }))
            .toThrow(/pending[\s\S]*T-239|not migrated/i);
    });

    test('runs migrated modules in registry order and reports them', () => {
        const order = [];
        const modules = [
            { id: 'a', task: 'T-239', status: 'migrated', apply: ({ rom }) => { order.push('a'); rom.writeU16(0x10, 0x1234, 'a'); } },
            { id: 'b', task: 'T-240', status: 'migrated', apply: ({ rom }) => { order.push('b'); rom.writeU16(0x20, 0x5678, 'b'); } },
        ];
        const result = injectRom({ rom: base(), offsetMap, data: {}, modules });
        expect(order).toEqual(['a', 'b']);
        expect(result.applied).toEqual(['a', 'b']);
        expect(result.rom.readU16(0x10)).toBe(0x1234);
        expect(result.rom.bytesWritten).toBe(4);
        expect(result.rom.sha256()).not.toBe(Rom.fromBuffer(baseBuffer).sha256());
    });

    test('hands each module the rom, the offset map and the bundle data', () => {
        let seen = null;
        const modules = [{ id: 'a', task: 'T-239', status: 'migrated', apply: (ctx) => { seen = ctx; } }];
        const data = { pokedex: { pokes: [] } };
        injectRom({ rom: base(), offsetMap, data, modules });
        expect(seen.rom).toBeInstanceOf(Rom);
        expect(seen.offsetMap.require('gItemsInfo').romOffset).toBe(0x60a998);
        expect(seen.data).toBe(data);
    });

    test('a failing module is reported with its id and task, not as an anonymous stack', () => {
        const modules = [{ id: 'boom', task: 'T-241', status: 'migrated', apply: () => { throw new Error('offset 0x0 is not free'); } }];
        expect(() => injectRom({ rom: base(), offsetMap, data: {}, modules }))
            .toThrow(/boom[\s\S]*T-241[\s\S]*not free|boom.*not free/i);
    });

    test('a partial run applies the migrated modules and still lists the pending ones', () => {
        const modules = [
            { id: 'done', task: 'T-239', status: 'migrated', apply: ({ rom }) => rom.writeU8(0, 1, 'done') },
            { id: 'todo', task: 'T-240', status: 'pending', apply: null },
        ];
        const result = injectRom({ rom: base(), offsetMap, data: {}, modules, allowPending: true });
        expect(result.applied).toEqual(['done']);
        expect(result.pending.map(m => m.id)).toEqual(['todo']);
    });
});

describe('loadBase (T-238)', () => {
    test('loads the ROM and its matching .map together', () => {
        const romPath = path.join(require('os').tmpdir(), `t238-base-${process.pid}.gba`);
        fs.writeFileSync(romPath, baseBuffer);
        try {
            const { rom, offsetMap: map } = loadBase({ romPath, mapPath: MAP });
            expect(rom.size).toBe(baseBuffer.length);
            expect(map.require('gItemsInfo').romOffset).toBe(0x60a998);
        } finally {
            fs.unlinkSync(romPath);
        }
    });

    test('a missing base or map fails loudly (never inject into "whatever is lying around")', () => {
        expect(() => loadBase({ romPath: '/no/base.gba', mapPath: MAP })).toThrow(/base.gba|not found/i);
        expect(() => loadBase({ romPath: MAP, mapPath: '/no/base.map' })).toThrow(/base.map|not found/i);
    });
});
