// T-249 — the artifact set a browser downloads for one base build, and the two properties that make it
// safe: `base.bps` really reconstructs the base from vanilla (nothing 32 MB is ever served), and every
// piece is stamped with the base's own sha256 so a cached base and a fresh offset map can never be paired.

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { buildClientArtifacts } = require('../../injector/buildClientArtifacts');
const { applyBps } = require('../../bps');
const { BaseSources } = require('../../injector/sources');
const { OffsetMap } = require('../../injector/symbolMap');

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

/** A stand-in vanilla/base pair: same size, differing in a few places, like a real build does. */
function pair() {
    const vanilla = Buffer.alloc(64 * 1024);
    for (let i = 0; i < vanilla.length; i++) vanilla[i] = (i * 7) & 0xff;
    const base = Buffer.from(vanilla);
    base.write('RANDOMIZER', 0x1000);
    base.fill(0xaa, 0x8000, 0x9000);
    return { vanilla, base };
}

describe('buildClientArtifacts', () => {
    let dir;
    let manifest;
    let vanilla;
    let base;

    beforeAll(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 't249-client-'));
        ({ vanilla, base } = pair());
        fs.writeFileSync(path.join(dir, 'vanilla.gba'), vanilla);
        fs.writeFileSync(path.join(dir, 'base.gba'), base);
        manifest = buildClientArtifacts({
            romPath: path.join(dir, 'base.gba'),
            vanillaPath: path.join(dir, 'vanilla.gba'),
            mapPath: path.join(__dirname, '..', 'fixtures', 'mini.map'),
            symPath: path.join(__dirname, '..', 'fixtures', 'mini.sym'),
            outDir: path.join(dir, 'out'),
        });
    });

    afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

    test('base.bps reconstructs the base from the user\'s own vanilla ROM', () => {
        const patch = new Uint8Array(fs.readFileSync(path.join(dir, 'out', 'base.bps')));
        const rebuilt = Buffer.from(applyBps(patch, new Uint8Array(vanilla)));
        expect(sha256(rebuilt)).toBe(sha256(base));
        expect(rebuilt.length).toBe(base.length);
    });

    test('the manifest stamps every artifact with the base build it belongs to', () => {
        expect(manifest.buildId).toBe(sha256(base));
        expect(manifest.romBytes).toBe(base.length);
        expect(manifest.vanillaBytes).toBe(vanilla.length);
        expect(manifest.vanillaSha1).toBe(crypto.createHash('sha1').update(vanilla).digest('hex'));

        for (const key of ['bps', 'offsets', 'sources']) {
            const entry = manifest.artifacts[key];
            const bytes = fs.readFileSync(path.join(dir, 'out', entry.file));
            expect(bytes.length).toBe(entry.bytes);
            expect(sha256(bytes)).toBe(entry.sha256);
        }
        // The sources carry the build id INSIDE them too — that is the copy the Worker checks against the
        // base it was handed, so a stale pairing cannot get as far as a write.
        const sources = BaseSources.fromJSON(JSON.parse(fs.readFileSync(path.join(dir, 'out', 'base-sources.json'), 'utf8')));
        expect(sources.buildId).toBe(manifest.buildId);
    });

    test('the offset map is the injection-only one, and loads back as an OffsetMap', () => {
        const json = JSON.parse(fs.readFileSync(path.join(dir, 'out', 'base-offsets.json'), 'utf8'));
        const map = OffsetMap.fromJSON(json);
        expect(map.symbolCount).toBe(manifest.artifacts.offsets.symbols);
        // The fixture base exports gItemsInfo and two learnsets; the rest of a real map is unaddressable.
        expect(map.has('gItemsInfo')).toBe(true);
        expect(map.symbolCount).toBeLessThan(Object.keys(json.symbols).length + 1);
    });

    test('the sources artifact is complete enough to inject with — nothing to read from disk', () => {
        const sources = BaseSources.fromJSON(JSON.parse(fs.readFileSync(path.join(dir, 'out', 'base-sources.json'), 'utf8')));
        const { baseSourcePaths } = require('../../injector/sources');
        expect(sources.paths().sort()).toEqual(baseSourcePaths().slice().sort());
    });

    test('a missing input is refused by name, not by a stack trace', () => {
        expect(() => buildClientArtifacts({
            romPath: path.join(dir, 'nope.gba'),
            vanillaPath: path.join(dir, 'vanilla.gba'),
            mapPath: path.join(__dirname, '..', 'fixtures', 'mini.map'),
            outDir: path.join(dir, 'out2'),
        })).toThrow(/base ROM/);
        expect(() => buildClientArtifacts({
            romPath: path.join(dir, 'base.gba'),
            vanillaPath: path.join(dir, 'nope.gba'),
            mapPath: path.join(__dirname, '..', 'fixtures', 'mini.map'),
            outDir: path.join(dir, 'out2'),
        })).toThrow(/vanilla ROM/);
    });
});
