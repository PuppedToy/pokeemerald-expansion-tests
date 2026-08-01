// T-238 — the reusable `.map` → offset-map extraction T-232 did by hand and deferred here. Run on the
// build box against a fresh base build: it prints the free-space budget (GATE-1, recomputed) and, per
// Phase-3 module, whether the base really exports what that module will need.
const fs = require('fs');
const path = require('path');
const { buildOffsetMapReport, exportOffsetMap } = require('../../injector/buildOffsetMap');
const { parseMapFile } = require('../../injector/symbolMap');

const offsetMap = parseMapFile(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'mini.map'), 'utf8'));

describe('buildOffsetMapReport (T-238)', () => {
    const report = buildOffsetMapReport({ offsetMap });

    test('reports the ROM budget against the 32 MB ceiling', () => {
        expect(report).toMatch(/32 MB|0x2000000/);
        expect(report).toMatch(/free/i);
    });

    test('flags per module what the base does not export (the T-234/T-237 LTO trap)', () => {
        // The fixture base exports gItemsInfo and two learnsets, nothing else.
        expect(report).toMatch(/T-239[\s\S]*gSpeciesInfo/);      // missing → named
        expect(report).toMatch(/T-240.*READY|READY.*T-240/);      // both learnset patterns matched
    });
});

describe('exportOffsetMap (T-238)', () => {
    test('writes a JSON offset map the injector can load back', () => {
        const out = path.join(require('os').tmpdir(), `t238-export-${process.pid}.json`);
        try {
            exportOffsetMap(offsetMap, out);
            const json = JSON.parse(fs.readFileSync(out, 'utf8'));
            expect(json.symbols.gItemsInfo.romOffset).toBe(0x60a998);
            expect(json._comment).toMatch(/T-238|base/i);
        } finally {
            fs.unlinkSync(out);
        }
    });
});
