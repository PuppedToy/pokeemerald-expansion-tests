// T-249 — "which artifacts does this ROM of the bundle get, and with which seed" is the one piece of the
// inject path that lived in make.js. A browser needs the same answer, and a second copy of it would be a
// second randomizer: the per-ROM seed decides every value the writers re-derive at inject time.
//
// So it moved to randomizer/injector/romData.js and make.js calls it. These tests pin the three
// sharing levels, because they are the ones a bundle exercises: shared (one team set for every ROM),
// per-player, and per-ROM.

const { injectionDataFor, resolveArtifact, resolveRomSeed } = require('../../injector/romData');
const { deriveSeed, romSeed: deriveRomSeed } = require('../../seeds');

const bundle = () => ({
    seed: 42,
    config: { money: 3000 },
    sharedData: {
        pokedex: { name: 'shared-pokedex' },
        trainers: { name: 'shared-trainers' },
        starters: { name: 'shared-starters' },
        players: [
            { pokedex: { name: 'p0-pokedex' }, trainers: { name: 'p0-trainers' }, starters: { name: 'p0-starters' } },
            { pokedex: { name: 'p1-pokedex' }, trainers: { name: 'p1-trainers' }, starters: { name: 'p1-starters' } },
        ],
    },
    roms: [],
});

describe('resolveArtifact', () => {
    test('reads shared, per-player and inline artifacts', () => {
        const { sharedData } = bundle();
        expect(resolveArtifact('shared', sharedData, 'pokedex').name).toBe('shared-pokedex');
        expect(resolveArtifact('global', sharedData, 'trainers').name).toBe('shared-trainers');
        expect(resolveArtifact('player-1', sharedData, 'starters').name).toBe('p1-starters');
        expect(resolveArtifact({ name: 'inline' }, sharedData, 'pokedex').name).toBe('inline');
    });
});

describe('resolveRomSeed', () => {
    test('shared trainers key off the universe seed, per-ROM trainers off the run seed', () => {
        expect(resolveRomSeed({ romIndex: 3, artifacts: { trainers: 'shared' } }, 42, 7)).toBe(7);
        expect(resolveRomSeed({ romIndex: 3, artifacts: { trainers: 'player-1' } }, 42, 7)).toBe(deriveSeed(7, 1));
        expect(resolveRomSeed({ romIndex: 3, artifacts: { trainers: 'own' } }, 42, 7)).toBe(deriveRomSeed(42, 3));
    });
});

describe('injectionDataFor', () => {
    const rom = {
        romIndex: 0,
        artifacts: { pokedex: 'shared', trainers: 'shared', starters: 'player-0', wild: { plan: 'inline' } },
        docs: { trainersResultsSimplified: {} },
    };

    test('assembles exactly what the injector modules read', () => {
        const { data, romSeed } = injectionDataFor({ rom, bundle: bundle(), seed: 42, universeSeed: 7 });

        expect(data.pokedex.name).toBe('shared-pokedex');
        expect(data.trainers.name).toBe('shared-trainers');
        expect(data.starters.name).toBe('p0-starters');
        expect(data.wild).toEqual({ plan: 'inline' });
        expect(data.config).toEqual({ money: 3000 });
        expect(data.artifacts).toBe(rom.artifacts);
        expect(data.docs).toBe(rom.docs);
        expect(typeof data.baseRngSeed === 'number' || data.baseRngSeed === null).toBe(true);
        expect(romSeed).toBe(7);                       // shared trainers → the universe seed
    });

    test('a bundle with no config still produces the empty config the modules expect', () => {
        const bare = { ...bundle(), config: undefined };
        expect(injectionDataFor({ rom, bundle: bare, seed: 42 }).data.config).toEqual({});
    });

    test('universeSeed defaults to the run seed, as pre-two-tier bundles need', () => {
        const shared = { ...rom, artifacts: { ...rom.artifacts, trainers: 'shared' } };
        expect(injectionDataFor({ rom: shared, bundle: bundle(), seed: 42 }).romSeed).toBe(42);
    });
});
