// B-058 / B-061 — the two source guards that keep the base injectable.
//
// Both bugs share a shape: the DATA was right and the CODE around it was wrong, so no byte comparison
// could see either. What can be pinned in a Jest suite is the source shape; the compiled-code side of
// B-058 is checked on the build box by buildOffsetMap.js's readiness report (see foldedAccessors).
const fs = require('fs');
const path = require('path');
const { INJECTABLE_SCALAR_ACCESSORS, foldedAccessors } = require('../../injector/buildOffsetMap');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const read = (...parts) => fs.readFileSync(path.resolve(ROOT, ...parts), 'utf8');

describe('B-058 — every injectable scalar is read through a volatile load', () => {
    // `noipa` alone is not enough: it stops the CALLER folding the return value, not the compiler folding
    // a `const` global read inside the function body. Four accessors compiled to `movs rN,#imm; bx lr`,
    // so the injected value was written and never read.
    const SITES = [
        ['src/location_nicknames.c', 'GetLocationNicknameCount', 'gLocationNicknameCount'],
        ['src/trade_nicknames.c', 'GetTradeNicknameCount', 'gTradeNicknameCount'],
        ['src/starter_choose.c', 'GetExtraPokemonCount', 'gStarterExtraCount'],
        ['src/starter_choose.c', 'GetStarterGender', 'gStarterGender'],
    ];

    test.each(SITES)('%s: %s reads %s volatile', (file, accessor, global) => {
        const source = read(file);
        const body = source.slice(source.indexOf(`${accessor}(`));
        // the statement, not the comments around it (which mention `return` on purpose)
        const returnLine = body.slice(0, body.indexOf('}')).split('\n').find(l => l.trim().startsWith('return'));

        expect(returnLine).toMatch(/volatile/);
        expect(returnLine).toContain(`&${global}`);
    });

    test.each(SITES)('%s: %s keeps its noipa attribute too', (file, accessor) => {
        const source = read(file);
        const before = source.slice(0, source.indexOf(`${accessor}(`));
        expect(before.slice(-160)).toMatch(/noipa/);
    });

    test('the accessor list the build-box check uses names all four, and nothing stale', () => {
        // The readiness report scans exactly these; a new injectable scalar must be added here or the
        // folded-read trap comes back silently.
        for (const [file, accessor] of SITES) {
            expect(INJECTABLE_SCALAR_ACCESSORS).toContain(accessor);
            expect(read(file)).toContain(accessor);
        }
    });
});

describe('B-058 — the folded-accessor detector itself', () => {
    // Thumb: `movs r0, #imm` is 0x20nn and `bx lr` is 0x4770. A four-byte function of exactly those two
    // is a constant return, whatever the symbol table claims about the table it was supposed to read.
    const romOf = (halfwords) => {
        const buffer = Buffer.alloc(0x100, 0);
        halfwords.forEach(([at, value]) => buffer.writeUInt16LE(value, at));
        return buffer;
    };
    const mapOf = (entries) => ({
        get: (name) => entries[name],
        has: (name) => Boolean(entries[name]),
    });

    test('flags a constant return, naming the value it was folded to', () => {
        const rom = romOf([[0x10, 0x2000], [0x12, 0x4770]]);
        const found = foldedAccessors(rom, mapOf({ GetLocationNicknameCount: { romOffset: 0x11, size: 4 } }),
            ['GetLocationNicknameCount']);

        expect(found).toEqual([{ name: 'GetLocationNicknameCount', value: 0 }]);
    });

    test('reports the folded value, so a wrong-looking count is obvious', () => {
        const rom = romOf([[0x20, 0x2009], [0x22, 0x4770]]);
        const found = foldedAccessors(rom, mapOf({ GetExtraPokemonCount: { romOffset: 0x21, size: 4 } }),
            ['GetExtraPokemonCount']);

        expect(found).toEqual([{ name: 'GetExtraPokemonCount', value: 9 }]);
    });

    test('passes an accessor that actually loads from memory', () => {
        // `ldr r0,[pc,#n]; ldrb r0,[r0]; bx lr` — the shape a volatile read compiles to.
        const rom = romOf([[0x30, 0x4801], [0x32, 0x7800], [0x34, 0x4770]]);
        const found = foldedAccessors(rom, mapOf({ GetTradeNicknameCount: { romOffset: 0x31, size: 8 } }),
            ['GetTradeNicknameCount']);

        expect(found).toEqual([]);
    });

    test('an accessor the base does not export at all is reported, not skipped silently', () => {
        const found = foldedAccessors(romOf([]), mapOf({}), ['GetLocationNicknameCount']);
        expect(found).toEqual([{ name: 'GetLocationNicknameCount', missing: true }]);
    });
});

describe('B-061 — the reward message names the species, not the givemon result', () => {
    const rewardScripts = () => fs.readdirSync(path.resolve(ROOT, 'data', 'maps'))
        .map(dir => path.join('data', 'maps', dir, 'scripts.inc'))
        .filter(file => fs.existsSync(path.resolve(ROOT, file)))
        .filter(file => read(file).includes('special GetGymReward'));

    test('every reward script buffers from VAR_TEMP_TRANSFERRED_SPECIES after the givemon', () => {
        const scripts = rewardScripts();
        expect(scripts.length).toBeGreaterThanOrEqual(11);

        for (const file of scripts) {
            const source = read(file);
            for (const block of source.split('special GetGymReward').slice(1)) {
                if (!block.includes('givemon VAR_RESULT')) continue;
                const afterGive = block.slice(block.indexOf('givemon VAR_RESULT'));
                const buffer = afterGive.split('\n').find(l => l.includes('bufferspeciesname'));
                if (!buffer) continue;
                // `givemon` writes MON_GIVEN_TO_PARTY/PC/CANT_GIVE back into VAR_RESULT, so naming it
                // announces species 0/1/2 — Bulbasaur, every time a full party sends the gift to the PC.
                expect(buffer).not.toContain('VAR_RESULT');
                expect(buffer).toContain('VAR_TEMP_TRANSFERRED_SPECIES');
            }
        }
    });

    test('the species is still saved before the give, which is what makes the fix free', () => {
        for (const file of rewardScripts()) {
            for (const block of read(file).split('special GetGymReward').slice(1)) {
                if (!block.includes('givemon VAR_RESULT')) continue;
                const beforeGive = block.slice(0, block.indexOf('givemon VAR_RESULT'));
                expect(beforeGive).toContain('copyvar VAR_TEMP_TRANSFERRED_SPECIES, VAR_RESULT');
            }
        }
    });
});
