'use strict';

const rng = require('../../rng');
const { buildWildPlaceholderMap, substituteWildSpecies, buildTrainersResultsFromDocs, resolveMailMints } = require('../../writer');

afterEach(() => rng.reset());

describe('buildWildPlaceholderMap', () => {
    test('does not consume any RNG calls', () => {
        rng.seed(42);
        const baseline = rng.random();

        rng.seed(42);
        buildWildPlaceholderMap([['SPECIES_PIKACHU', 'SPECIES_RAICHU']]);
        const after = rng.random();

        expect(after).toBe(baseline);
    });

    test('generates same placeholders regardless of RNG seed', () => {
        const entries = [['SPECIES_BULBASAUR', 'SPECIES_CHIKORITA'], ['SPECIES_PIKACHU', 'SPECIES_RAICHU']];

        rng.seed(1);
        const result1 = buildWildPlaceholderMap(entries);

        rng.seed(99999);
        const result2 = buildWildPlaceholderMap(entries);

        expect(result1).toEqual(result2);
    });

    test('generates unique placeholder for each species', () => {
        const entries = [['SPECIES_A', 'X'], ['SPECIES_B', 'Y'], ['SPECIES_C', 'Z']];
        const result = buildWildPlaceholderMap(entries);
        const placeholders = Object.values(result);
        expect(new Set(placeholders).size).toBe(placeholders.length);
    });
});

describe('substituteWildSpecies', () => {
    // Build a wild_encounters.json-like blob where every base species appears
    // verbatim inside a quoted JSON value, as in the real file.
    function buildContent(baseSpecies) {
        return baseSpecies
            .map((s, i) => `    { "min_level": ${i}, "max_level": ${i}, "species": "${s}" }`)
            .join(',\n');
    }

    test('substitutes every base species with its replacement', () => {
        const log = {
            SPECIES_ZIGZAGOON: 'SPECIES_YAMPER',
            SPECIES_WURMPLE: 'SPECIES_MAREEP',
        };
        const content = buildContent(Object.keys(log));
        const result = substituteWildSpecies(content, log);

        expect(result).toContain('SPECIES_YAMPER');
        expect(result).toContain('SPECIES_MAREEP');
        expect(result).not.toContain('SPECIES_ZIGZAGOON');
        expect(result).not.toContain('SPECIES_WURMPLE');
    });

    test('does not corrupt names when placeholder indices share a prefix (P1 vs P1x)', () => {
        // ≥20 entries so placeholder P1 is a substring-prefix of P10..P19, and with
        // 100+ entries also of P100.. — the exact run-5 corruption scenario.
        const N = 120;
        const log = {};
        for (let i = 0; i < N; i++) {
            log[`SPECIES_BASE${i}`] = `SPECIES_REPL${i}`;
        }
        const content = buildContent(Object.keys(log));
        const result = substituteWildSpecies(content, log);

        // No placeholder may leak through.
        expect(result).not.toMatch(/WILDPOKE_P/);
        // No replacement species may carry a stray trailing/garbage digit suffix
        // produced by a prefix collision (e.g. SPECIES_REPL5 turning into SPECIES_REPL59).
        for (let i = 0; i < N; i++) {
            // The intended replacement token must be present...
            expect(result).toContain(`"SPECIES_REPL${i}"`);
        }
        // ...and every species token in the output must be one we explicitly produced.
        const tokens = result.match(/SPECIES_[A-Z0-9_]+/g) || [];
        const allowed = new Set(Object.values(log));
        for (const tok of tokens) {
            expect(allowed.has(tok)).toBe(true);
        }
    });

    test('does not corrupt a base species that is a prefix of another base species', () => {
        // Pass 1 must not let SPECIES_TAUROS bleed into SPECIES_TAUROS_PALDEA_COMBAT.
        const log = {
            SPECIES_TAUROS: 'SPECIES_YAMPER',
            SPECIES_TAUROS_PALDEA_COMBAT: 'SPECIES_MAREEP',
        };
        const content = buildContent(Object.keys(log));
        const result = substituteWildSpecies(content, log);

        expect(result).toContain('"SPECIES_YAMPER"');
        expect(result).toContain('"SPECIES_MAREEP"');
        expect(result).not.toMatch(/SPECIES_YAMPER_PALDEA_COMBAT/);
    });
});

describe('buildTrainersResultsFromDocs', () => {
    const pokemonList = [
        { id: 'SPECIES_MUDKIP', name: 'Mudkip' },
        { id: 'SPECIES_CHARMANDER', name: 'Charmander' },
    ];

    const docsTrainers = {
        TRAINER_CALVIN_1: {
            level: 7,
            label: null,
            class: 'Youngster',
            reward: ['Mudkip'],
            isBoss: false,
            isPartner: false,
            location: 'Route 101',
            preventShuffle: false,
            team: [
                {
                    pokemon: 'SPECIES_MUDKIP',
                    item: null,
                    nature: 'Naive',
                    moves: ['MOVE_WATER_GUN', 'MOVE_TACKLE'],
                    breedTier: null,
                    pokeId: null,
                    ivs: { hp: 22, atk: 30, def: 25, spa: 2, spd: 14, spe: 23 },
                    ability: 'TORRENT',
                },
            ],
        },
    };

    test('maps each team member species id to its pokemon object', () => {
        const result = buildTrainersResultsFromDocs(docsTrainers, pokemonList);
        const mon = result.TRAINER_CALVIN_1.team[0];
        expect(mon.pokemon).toEqual({ id: 'SPECIES_MUDKIP', name: 'Mudkip' });
    });

    test('passes through resolved team-member fields verbatim', () => {
        const result = buildTrainersResultsFromDocs(docsTrainers, pokemonList);
        const mon = result.TRAINER_CALVIN_1.team[0];
        expect(mon.item).toBeNull();
        expect(mon.nature).toBe('Naive');
        expect(mon.moves).toEqual(['MOVE_WATER_GUN', 'MOVE_TACKLE']);
        expect(mon.ability).toBe('TORRENT');
        expect(mon.ivs).toEqual({ hp: 22, atk: 30, def: 25, spa: 2, spd: 14, spe: 23 });
    });

    test('passes through trainer-level fields', () => {
        const result = buildTrainersResultsFromDocs(docsTrainers, pokemonList);
        const t = result.TRAINER_CALVIN_1;
        expect(t.level).toBe(7);
        expect(t.class).toBe('Youngster');
        expect(t.reward).toEqual(['Mudkip']);
        expect(t.location).toBe('Route 101');
        expect(t.isBoss).toBe(false);
    });

    test('does not consume any RNG calls', () => {
        rng.seed(42);
        const baseline = rng.random();
        rng.seed(42);
        buildTrainersResultsFromDocs(docsTrainers, pokemonList);
        const after = rng.random();
        expect(after).toBe(baseline);
    });

    test('falls back to a derived name when a species is not in the pokemon list', () => {
        const docs = {
            T1: { level: 5, class: 'X', team: [{ pokemon: 'SPECIES_GHOST_MON', moves: [], ivs: {} }] },
        };
        const result = buildTrainersResultsFromDocs(docs, pokemonList);
        expect(result.T1.team[0].pokemon).toEqual({ id: 'SPECIES_GHOST_MON', name: 'Ghost Mon' });
    });
});

describe('resolveMailMints', () => {
    const items = {
        midMints: ['ITEM_LONELY_MINT', 'ITEM_NAUGHTY_MINT'],
        strongDefMints: ['ITEM_BOLD_MINT', 'ITEM_IMPISH_MINT'],
        strongAtkMints: ['ITEM_ADAMANT_MINT', 'ITEM_JOLLY_MINT'],
    };

    test('uses the bundle-stored mint order (display names) converted to ITEM_ consts', () => {
        const itemAssignments = {
            woodMailMints: ['Naughty Mint', 'Lonely Mint'],
            waveMailMints: ['Impish Mint', 'Bold Mint'],
            mechMailMints: ['Jolly Mint', 'Adamant Mint'],
        };
        const r = resolveMailMints(itemAssignments, items);
        expect(r.wood).toEqual(['ITEM_NAUGHTY_MINT', 'ITEM_LONELY_MINT']);
        expect(r.wave).toEqual(['ITEM_IMPISH_MINT', 'ITEM_BOLD_MINT']);
        expect(r.mech).toEqual(['ITEM_JOLLY_MINT', 'ITEM_ADAMANT_MINT']);
    });

    test('falls back to the static pools when the bundle has no mint order (older bundles)', () => {
        const r = resolveMailMints({}, items);
        expect(r.wood).toEqual(items.midMints);
        expect(r.wave).toEqual(items.strongDefMints);
        expect(r.mech).toEqual(items.strongAtkMints);
    });

    test('consumes no RNG', () => {
        rng.seed(42);
        const baseline = rng.random();
        rng.seed(42);
        resolveMailMints({ woodMailMints: ['Lonely Mint'] }, items);
        expect(rng.random()).toBe(baseline);
    });
});
