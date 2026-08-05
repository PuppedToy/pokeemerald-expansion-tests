// T-249 — the injector's source provider: one path-keyed object carrying every input the injector reads
// from the base's own tree, so the browser can be handed an artifact where Node reads the disk.
//
// Two things this file has to hold down:
//   1. the manifest is COMPLETE — a path the injector reads but the manifest omits is a browser run that
//      fails (or worse, silently falls back to a stub `fs`);
//   2. the relative literals still name the files the writers use. The literals exist because absolute
//      paths cannot survive esbuild's `path` shim (see the task log), and a literal that drifts from
//      `SPECIES_DIR` & friends would be an artifact missing a file nobody noticed.

const fs = require('fs');
const path = require('path');
const {
    BaseSources, BASE_SOURCE_FILES, baseSourcePaths, collectBaseSources, treeSources, REPO_ROOT,
} = require('../../injector/sources');
const { DEFAULT_HEADERS } = require('../../injector/gameConstants');
const { SPECIES_DIR, LEVEL_UP_LEARNSETS_DIR, TOTAL_GENS, MEGA_TRAINERS } = require('../../constants');
const itemPriceWriter = require('../../itemPriceWriter');
const wildData = require('../../wild');

describe('BaseSources', () => {
    test('read returns the baked text; has/paths report what it carries', () => {
        const sources = new BaseSources({ files: { 'src/data/trade.h': 'const struct IngameTrade …' } });
        expect(sources.read('src/data/trade.h')).toBe('const struct IngameTrade …');
        expect(sources.has('src/data/trade.h')).toBe(true);
        expect(sources.has('src/data/items.h')).toBe(false);
        expect(sources.paths()).toEqual(['src/data/trade.h']);
    });

    test('a missing path throws naming it — never an empty string a parser would misread', () => {
        const sources = new BaseSources({ files: {} });
        expect(() => sources.read('src/data/items.h')).toThrow(/src\/data\/items\.h/);
        expect(() => sources.read('src/data/items.h')).toThrow(/base sources/i);
        expect(sources.tryRead('src/data/items.h')).toBeNull();
    });

    test('paths are normalised, so a caller may pass ./ or a backslash', () => {
        const sources = new BaseSources({ files: { 'src/data/items.h': 'x' } });
        expect(sources.read('./src/data/items.h')).toBe('x');
        expect(sources.read('src\\data\\items.h')).toBe('x');
    });

    test('round-trips through JSON, carrying the build id that keys a cached base', () => {
        const sources = new BaseSources({ files: { 'charmap.txt': "'A' = BB" }, buildId: 'af0dff6c' });
        const restored = BaseSources.fromJSON(JSON.parse(JSON.stringify(sources.toJSON())));
        expect(restored.buildId).toBe('af0dff6c');
        expect(restored.read('charmap.txt')).toBe("'A' = BB");
        expect(restored.totalBytes).toBe(sources.totalBytes);
    });

    test('tree mode reads the disk lazily and caches — Node keeps working with no artifact', () => {
        const sources = treeSources({ root: REPO_ROOT });
        expect(sources.has('charmap.txt')).toBe(false);          // nothing read yet
        expect(sources.read('charmap.txt')).toContain("' '");
        expect(sources.has('charmap.txt')).toBe(true);           // cached after the first read
        expect(sources.tryRead('src/data/no_such_file.h')).toBeNull();
    });
});

describe('the manifest', () => {
    const paths = baseSourcePaths();

    test('every path is repo-relative POSIX, and none is listed twice', () => {
        for (const rel of paths) {
            expect(rel).not.toMatch(/^[/\\]/);
            expect(rel).not.toMatch(/\\|\.\./);
        }
        expect(new Set(paths).size).toBe(paths.length);
    });

    test('every path exists in this tree', () => {
        const missing = paths.filter(rel => !fs.existsSync(path.resolve(REPO_ROOT, rel)));
        expect(missing).toEqual([]);
    });

    test('carries the constant headers gameConstants parses', () => {
        for (const header of DEFAULT_HEADERS) expect(paths).toContain(header);
    });

    test('carries every file the migrated modules read', () => {
        for (let gen = 1; gen <= TOTAL_GENS; gen++) expect(paths).toContain(BASE_SOURCE_FILES.speciesInfo(gen));
        expect(paths).toContain(BASE_SOURCE_FILES.levelUpLearnsets);
        expect(paths).toContain(BASE_SOURCE_FILES.teachableLearnsets);
        expect(paths).toContain(BASE_SOURCE_FILES.trainers);
        expect(paths).toContain(BASE_SOURCE_FILES.battlePartners);
        expect(paths).toContain(BASE_SOURCE_FILES.wildEncounters);
        expect(paths).toContain(BASE_SOURCE_FILES.items);
        expect(paths).toContain(BASE_SOURCE_FILES.trade);
        expect(paths).toContain(BASE_SOURCE_FILES.randomizerSettings);
        expect(paths).toContain(BASE_SOURCE_FILES.randomizerRewards);
        expect(paths).toContain(BASE_SOURCE_FILES.randomizerPicks);
        expect(paths).toContain(BASE_SOURCE_FILES.charmap);
        expect(paths).toContain(BASE_SOURCE_FILES.characters);
        expect(paths).toContain(BASE_SOURCE_FILES.vars);
        // Not the injector's own input: `randomizer/layout.js` reads it at import time, and in a browser
        // that read is served from this artifact (T-249).
        expect(paths).toContain(BASE_SOURCE_FILES.layout);
    });

    test('carries one map.json per mega-stone map (B-060) and the Group-D toggle scripts', () => {
        for (const map of new Set(MEGA_TRAINERS.map(m => m.map))) {
            expect(paths).toContain(BASE_SOURCE_FILES.mapJson(map));
        }
        expect(paths).toContain(BASE_SOURCE_FILES.mapScripts('EverGrandeCity_SidneysRoom'));
        expect(paths).toContain(BASE_SOURCE_FILES.mapScripts('MossdeepCity_SpaceCenter_2F'));
    });
});

describe('the relative literals name the same files the writers do (ADR-012)', () => {
    const abs = (rel) => path.resolve(REPO_ROOT, rel);

    test('species info, level-up and teachable learnsets', () => {
        for (let gen = 1; gen <= TOTAL_GENS; gen++) {
            expect(abs(BASE_SOURCE_FILES.speciesInfo(gen))).toBe(path.resolve(SPECIES_DIR, `gen_${gen}_families.h`));
        }
        expect(abs(BASE_SOURCE_FILES.levelUpLearnsets)).toBe(path.resolve(LEVEL_UP_LEARNSETS_DIR, 'gen_9.h'));
        expect(abs(BASE_SOURCE_FILES.teachableLearnsets)).toBe(path.resolve(SPECIES_DIR, '..', 'teachable_learnsets.h'));
    });

    test('item prices and wild encounters', () => {
        expect(abs(BASE_SOURCE_FILES.items)).toBe(itemPriceWriter.file);
        expect(abs(BASE_SOURCE_FILES.wildEncounters)).toBe(wildData.file);
    });

    test('the layout header layout.js reads', () => {
        expect(abs(BASE_SOURCE_FILES.layout)).toBe(require('../../layout').LAYOUT_HEADER);
    });
});

// The point of the seam: the files that RUN AN INJECTION must not touch the disk, so the same modules
// can run in a browser (T-249, step 3). Node I/O is allowed only at the edges — loading a ROM, parsing a
// `.map`, and this seam itself. A new `require('fs')` inside a module is exactly the regression that
// would make the browser path impossible again, and it would otherwise only show up as a stubbed `fs`
// throwing at runtime in a Worker.
describe('the fs boundary', () => {
    const INJECTOR_DIR = path.resolve(__dirname, '..', '..', 'injector');
    const IO_FILES = [
        'sources.js',           // the seam — the one place that may read the tree
        'rom.js',               // load/save a ROM file (the browser hands `new Rom(buffer)` instead)
        'symbolMap.js',         // parse a `.map`/`.sym`; the browser gets base-offsets.json
        'buildOffsetMap.js',    // build-box CLI: emits base-offsets.json + base-sources.json
        'buildClientArtifacts.js', // build-box CLI: emits base.bps + the client artifact set (T-249)
        'verifyParity.js',      // Node-only diagnostic tool (compares two ROM files)
    ];

    const injectorFiles = () => {
        const out = [];
        const walk = (dir, prefix) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                if (entry.isDirectory()) walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
                else if (entry.name.endsWith('.js')) out.push(`${prefix}${entry.name}`);
            }
        };
        walk(INJECTOR_DIR, '');
        return out;
    };

    test('only the I/O edges require fs', () => {
        const offenders = injectorFiles().filter(rel => {
            if (IO_FILES.includes(rel)) return false;
            return /require\(['"]fs['"]\)/.test(fs.readFileSync(path.join(INJECTOR_DIR, rel), 'utf8'));
        });
        expect(offenders).toEqual([]);
    });

    test('the allowlist is not stale', () => {
        for (const rel of IO_FILES) expect(injectorFiles()).toContain(rel);
    });
});

describe('collectBaseSources — the artifact the base build emits', () => {
    test('reads every manifest path and reports its size', () => {
        const sources = collectBaseSources({ root: REPO_ROOT, buildId: 'test' });
        expect(sources.paths().sort()).toEqual(baseSourcePaths().slice().sort());
        // ~5.8 MB in this tree; the floor only has to prove nothing came back empty.
        expect(sources.totalBytes).toBeGreaterThan(4 * 1024 * 1024);
        for (const rel of sources.paths()) expect(sources.read(rel).length).toBeGreaterThan(0);
    });

    test('the collected artifact answers without touching the disk', () => {
        const artifact = collectBaseSources({ root: REPO_ROOT }).toJSON();
        const sources = BaseSources.fromJSON(artifact);
        const spy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw new Error('the injector read the disk when it was handed an artifact');
        });
        try {
            for (const rel of baseSourcePaths()) expect(typeof sources.read(rel)).toBe('string');
        } finally {
            spy.mockRestore();
        }
    });
});
