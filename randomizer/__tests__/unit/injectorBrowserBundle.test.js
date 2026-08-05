// T-249 — the browser bundle of the injector, and the one property that matters about it: it produces the
// same ROM as Node, running the same modules.
//
// The bundle is built here with the very config build.js uses (buildWorker.cjs), then executed in a `vm`
// sandbox holding **no Node built-ins at all** — no Buffer, no require, no process, no fs. That is what
// makes this a real test of the browser path rather than of Node with extra steps: anything the bundle has
// not brought with it (or shimmed) throws, and the injection then cannot produce a ROM at all.
//
// A real browser adds two things this cannot: the memory ceiling and Worker plumbing. That is
// visual-tests/injector-equivalence.spec.mjs, which needs the real 32 MB base and so cannot live in this
// suite.

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { bundleInjector } = require('../../../buildWorker.cjs');
const { buildSyntheticBase } = require('../fixtures/syntheticBase');
const { injectRom } = require('../../injector');
const { BaseSources, BASE_SOURCE_FILES, collectBaseSources } = require('../../injector/sources');

jest.setTimeout(60000);

// One learnset, matching what the synthetic base's ROM holds — see injectorInjectionMap.test.js.
const LEARNSET_SOURCE = [
    'const struct LevelUpMove sZigzagoonLevelUpLearnset[] = {',
    '    LEVEL_UP_MOVE( 1, MOVE_TACKLE),',
    '    LEVEL_UP_END,',
    '};',
    '',
].join('\n');

const base = () => buildSyntheticBase({
    dataDriven: true,
    species: {
        SPECIES_ZIGZAGOON: {
            stats: [38, 30, 41, 60, 30, 41],
            types: ['TYPE_NORMAL', 'TYPE_NORMAL'],
            abilities: ['ABILITY_PICKUP', 'ABILITY_GLUTTONY', 'ABILITY_QUICK_FEET'],
        },
    },
    moves: { MOVE_TACKLE: { power: 40, accuracy: 100, type: 'TYPE_NORMAL', category: 'DAMAGE_CATEGORY_PHYSICAL' } },
    items: { ITEM_ULTRA_BALL: 10 },
    learnsets: { sZigzagoonLevelUpLearnset: [{ level: 1, move: 'MOVE_TACKLE' }] },
    tmMoves: ['VACUUM_WAVE', 'BRUTAL_SWING', 'BRINE'],
});

/** A one-ROM bundle, shaped as the generator emits them. */
const runBundle = () => ({
    seed: 42,
    config: { prices: { balls: { ultra: 4321 } } },
    sharedData: {
        pokedex: {
            pokes: [{
                id: 'SPECIES_ZIGZAGOON',
                baseHP: 44, baseAttack: 55, baseDefense: 41, baseSpeed: 60, baseSpAttack: 30, baseSpDefense: 41,
                parsedTypes: ['DARK', 'NORMAL'],
                parsedAbilities: ['PICKUP', 'GLUTTONY', 'QUICK_FEET'],
                log: [{ target: 'baseHP' }, { target: 'type' }],
                levelUpLearnset: 'sZigzagoonLevelUpLearnset',
                learnset: [{ level: 1, move: 'MOVE_TACKLE' }, { level: 9, move: 'MOVE_EMBER' }],
            }],
            moves: {
                MOVE_TACKLE: {
                    id: 'MOVE_TACKLE', power: 75, accuracy: 100, type: 'NORMAL',
                    category: 'DAMAGE_CATEGORY_PHYSICAL', log: [{ target: 'power' }],
                },
            },
            tmList: ['ICE_BEAM', 'BRUTAL_SWING', 'BRINE'],
        },
        trainers: {},
        starters: {},
    },
    roms: [{
        romIndex: 0,
        artifacts: { pokedex: 'shared', trainers: 'shared', starters: 'shared', wild: {} },
        docs: {},
    }],
});

let bundleCode = null;

beforeAll(async () => {
    const out = path.join(os.tmpdir(), `t249-injector-bundle-${process.pid}.js`);
    try {
        await bundleInjector(out);
        bundleCode = fs.readFileSync(out, 'utf8');
    } finally {
        fs.rmSync(out, { force: true });
    }
});

/** Run the bundle with only the globals a Worker has, and hand back its `injectOne`. */
function loadInSandbox() {
    const self = {};
    const sandbox = {
        self,
        TextEncoder, TextDecoder,
        Uint8Array, Uint32Array, Int32Array, Float64Array, DataView, ArrayBuffer,
        Math, JSON, Date, Object, Array, String, Number, Boolean, Error, RangeError, TypeError,
        Set, Map, WeakMap, RegExp, Symbol, isNaN, parseInt, parseFloat,
        console: { log() {}, warn() {}, error() {}, info() {} },
    };
    sandbox.globalThis = sandbox;
    vm.runInContext(bundleCode, vm.createContext(sandbox), { filename: 'injector.bundle.js' });
    return self.injectOne;
}

describe('the injector bundle', () => {
    test('brings its own Buffer/crypto/fs and asks Node for nothing', () => {
        for (const builtin of ['fs', 'path', 'crypto', 'child_process', 'os']) {
            expect(bundleCode).not.toMatch(new RegExp(`require\\("${builtin}"\\)`));
        }
        // Loading at all is the B-014 guard: a CommonJS file mistaken for ESM (the type:module trap)
        // leaves bare `module`/`require`, and this sandbox has neither. Unlike the frontend's version of
        // that test, nothing here is stubbed from Node — `Buffer` included.
        expect(typeof loadInSandbox()).toBe('function');
    });

    test('injects the same bundle into the same base as the Node path, byte for byte', () => {
        const sources = collectBaseSources();
        sources.files.set(BASE_SOURCE_FILES.levelUpLearnsets, LEARNSET_SOURCE);
        const artifact = sources.toJSON();

        // ── Node: the path GATE-3 verifies ──
        const viaNode = base();
        const { data, romSeed } = require('../../injector/romData')
            .injectionDataFor({ rom: runBundle().roms[0], bundle: runBundle(), seed: 42 });
        require('../../rng').seed(romSeed);
        injectRom({
            rom: viaNode.rom, offsetMap: viaNode.offsetMap, data,
            baseSources: BaseSources.fromJSON(artifact),
        });

        // ── The browser bundle, in a sandbox with no Node ──
        const viaBundle = base();
        const injectOne = loadInSandbox();
        const result = injectOne({
            baseRom: viaBundle.rom.toBuffer(),
            offsets: viaBundle.offsetMap.toJSON(),
            sources: artifact,
            bundle: runBundle(),
            romIndex: 0,
        });

        expect(result.applied).toEqual([
            'group-a-fixed', 'learnsets', 'trainer-parties', 'trades-starters-nicknames', 'data-driven-and-toggles',
        ]);
        expect(result.bytesWritten).toBe(viaNode.rom.bytesWritten);
        expect(result.sha256).toBe(viaNode.rom.sha256());
    });

    test('refuses a base the sources were not baked for, rather than writing to wrong addresses', () => {
        const sources = collectBaseSources({ buildId: 'not-this-base' });
        sources.files.set(BASE_SOURCE_FILES.levelUpLearnsets, LEARNSET_SOURCE);
        const image = base();
        expect(() => loadInSandbox()({
            baseRom: image.rom.toBuffer(),
            offsets: image.offsetMap.toJSON(),
            sources: sources.toJSON(),
            bundle: runBundle(),
            romIndex: 0,
        })).toThrow(/not-this-base|base sources were baked/);
    });
});
