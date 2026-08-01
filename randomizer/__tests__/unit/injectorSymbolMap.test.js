// T-238 — the base build's `.map` is the ONLY source of injection offsets (never hardcoded: an
// upstream sync moves everything, ADR-012 / T-232). This is the reusable `.map` → offset-map loader
// T-232 deferred to this task.
const fs = require('fs');
const path = require('path');
const {
    parseMapFile,
    parseSymFile,
    loadOffsetMap,
    OffsetMap,
    toRomOffset,
    toGbaPointer,
    ROM_BASE_ADDR,
    ROM_MAX_BYTES,
} = require('../../injector/symbolMap');

const FIXTURE = path.join(__dirname, '..', 'fixtures', 'mini.map');
const SYM_FIXTURE = path.join(__dirname, '..', 'fixtures', 'mini.sym');
const mapText = fs.readFileSync(FIXTURE, 'utf8');

describe('address conversion', () => {
    test('GBA pointer ↔ ROM offset round-trip', () => {
        expect(ROM_BASE_ADDR).toBe(0x08000000);
        expect(toRomOffset(0x0864e1d8)).toBe(0x64e1d8);
        expect(toGbaPointer(0x64e1d8)).toBe(0x0864e1d8);
    });

    test('rejects an address outside the ROM region', () => {
        expect(() => toRomOffset(0x02020000)).toThrow(/0x2020000|not in ROM/i);
        expect(() => toRomOffset(0x0a000000)).toThrow();
        expect(() => toGbaPointer(ROM_MAX_BYTES)).toThrow();
        expect(() => toGbaPointer(-1)).toThrow();
    });
});

describe('parseMapFile (T-238)', () => {
    const map = parseMapFile(mapText);

    test('locates a global rodata symbol with its ROM offset', () => {
        const sym = map.require('gItemsInfo');
        expect(sym.addr).toBe(0x0860a998);
        expect(sym.romOffset).toBe(0x60a998);
        expect(sym.size).toBe(0x15000);
        expect(sym.object).toContain('items.o');
    });

    test('reads the wrapped long-section-name form (name on its own line)', () => {
        expect(map.require('sBulbasaurLevelUpLearnset').romOffset).toBe(0xd2fbb0);
        expect(map.require('sBulbasaurLevelUpLearnset').size).toBe(0xb0);
    });

    test('derives a size from the next symbol when one section holds several', () => {
        // .rodata.trades spans 0x90 and holds two symbols 0x40 apart.
        expect(map.require('gIngameTrades').size).toBe(0x40);
        expect(map.require('gTradeNicknames').size).toBe(0x50);
    });

    test('ignores fill, PROVIDE, alignment and discarded-section lines', () => {
        expect(map.has('*fill*')).toBe(false);
        expect(map.has('PROVIDE')).toBe(false);
        expect(map.has('.')).toBe(false);
        expect(map.has('__rodata_end')).toBe(false);
        expect(map.has('UnusedFunc')).toBe(false);
    });

    test('a RAM symbol with no ROM image has no offset; an LMA-loaded one does', () => {
        expect(map.require('gUnusedRam').romOffset).toBeNull();
        // .ewram_data lives at 0x02020000 but is LOADED from 0x08e00000.
        expect(map.require('gRamMirroredTable').romOffset).toBe(0xe00000);
        expect(map.require('gRamMirroredTable').addr).toBe(0x02020000);
    });

    test('reads the ROM capacity and the used/free budget from the map', () => {
        expect(map.romCapacity).toBe(0x2000000);          // 32 MB cartridge ceiling
        expect(map.romEndOffset).toBe(0xe00020);           // last loaded byte (the ewram LMA image)
        expect(map.freeBytes).toBe(0x2000000 - 0xe00020);
    });

    test('require() throws naming the missing symbol; get() just returns undefined', () => {
        expect(() => map.require('gNopeNotHere')).toThrow(/gNopeNotHere/);
        expect(map.get('gNopeNotHere')).toBeUndefined();
        expect(map.has('gItemsInfo')).toBe(true);
    });

    test('findAll() collects a family by pattern (the 2205 learnsets are looked up this way)', () => {
        const learnsets = map.findAll(/LevelUpLearnset$/);
        expect(learnsets.map(s => s.name)).toEqual([
            'sBulbasaurLevelUpLearnset',
            'sIvysaurLevelUpLearnset',
        ]);
    });

    test('a map with no symbols is an error, not an empty result', () => {
        expect(() => parseMapFile('Linker script and memory map\n\nLOAD foo.o\n')).toThrow(/no symbols/i);
    });

    test('survives a symbol table with CRLF line endings', () => {
        const crlf = parseMapFile(mapText.replace(/\n/g, '\r\n'));
        expect(crlf.require('gItemsInfo').romOffset).toBe(0x60a998);
    });
});

// `make syms` (objdump -t) is the only source for LOCAL symbols — map-script labels never reach the
// linker map, and the Group-D toggles (Run & Bun, Steven tag) are setvars inside those scripts.
describe('parseSymFile (T-238, Group-D locator input)', () => {
    const sym = parseSymFile(fs.readFileSync(SYM_FIXTURE, 'utf8'));

    test('reads "<addr> <flag> <size> <name>" rows into the same shape as the .map', () => {
        expect(sym.require('gItemsInfo')).toMatchObject({ addr: 0x0860a998, romOffset: 0x60a998, size: 0x200 });
    });

    test('keeps local script labels — the whole reason the .sym exists here', () => {
        expect(sym.require('EverGrandeCity_SidneysRoom_EventScript_Init').romOffset).toBe(0xd40100);
        expect(sym.require('MossdeepCity_SpaceCenter_2F_OnTransition').romOffset).toBe(0xd40000);
    });

    test('a RAM symbol still has no ROM offset', () => {
        expect(sym.require('gUnusedRam').romOffset).toBeNull();
    });

    test('merging a .sym into a .map keeps the map entry when both define a symbol', () => {
        const merged = parseMapFile(mapText).merge(sym);
        expect(merged.require('gItemsInfo').object).toContain('items.o');           // came from the .map
        expect(merged.require('EverGrandeCity_SidneysRoom_EventScript_Init').romOffset).toBe(0xd40100);
        expect(merged.symbolCount).toBeGreaterThan(parseMapFile(mapText).symbolCount);
    });

    // Validated against the real base (T-238): a linker map only BOUNDS a symbol by its section, so
    // gStarterExtraCount (a u8) came out as 335 B and gIngameTrades (0x200) as 23,120 B. objdump
    // reports the true symbol size, so an exact size always wins over a section-derived one.
    test('an exact ELF size beats the map\'s section-derived bound', () => {
        expect(parseMapFile(mapText).require('gItemsInfo').sizeExact).toBe(false);
        expect(sym.require('gItemsInfo').sizeExact).toBe(true);

        const merged = parseMapFile(mapText).merge(sym);
        expect(merged.require('gItemsInfo').size).toBe(0x200);      // the .sym's exact size, not 0x15000
        expect(merged.require('gItemsInfo').object).toContain('items.o');
    });

    test('a zero-size .sym row (most script labels) never overwrites a real size', () => {
        const merged = parseMapFile(mapText).merge(sym);
        expect(merged.require('sBulbasaurLevelUpLearnset').size).toBe(0xb0);
    });

    test('loadOffsetMap accepts a .sym as well', () => {
        expect(loadOffsetMap(SYM_FIXTURE).require('gItemsInfo').romOffset).toBe(0x60a998);
    });
});

describe('OffsetMap serialization + loading (T-238)', () => {
    test('toJSON → fromJSON round-trips every symbol', () => {
        const map = parseMapFile(mapText);
        const clone = OffsetMap.fromJSON(JSON.parse(JSON.stringify(map.toJSON())));
        expect(clone.symbolCount).toBe(map.symbolCount);
        expect(clone.require('gIngameTrades')).toEqual(map.require('gIngameTrades'));
        expect(clone.romCapacity).toBe(map.romCapacity);
    });

    test('loadOffsetMap reads either a .map or a previously exported .json', () => {
        const fromMap = loadOffsetMap(FIXTURE);
        expect(fromMap.require('gItemsInfo').romOffset).toBe(0x60a998);

        const jsonPath = path.join(require('os').tmpdir(), `t238-offsets-${process.pid}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(fromMap.toJSON()));
        try {
            expect(loadOffsetMap(jsonPath).require('gItemsInfo').romOffset).toBe(0x60a998);
        } finally {
            fs.unlinkSync(jsonPath);
        }
    });

    test('loadOffsetMap fails loudly when the map file is missing', () => {
        expect(() => loadOffsetMap('/no/such/pokeemerald.map')).toThrow(/no such|not found|ENOENT/i);
    });
});
