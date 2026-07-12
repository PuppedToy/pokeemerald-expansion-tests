'use strict';

const { createChooser } = require('../../modules/trainerSelector');
const { selectWithAutoFallback } = require('../../modules/trainerFallback');

// ─── minimal fixture helpers ────────────────────────────────────────────────

function makePoke(id, { family, tier, abilities, types, isLC = false, isFinal = false, isMega = false, megaBaseForm = null, evolutions = [], cap = 32 } = {}) {
    return {
        id,
        family: family || id + '_FAMILY',
        form: null,
        parsedTypes: types || ['NORMAL'],
        parsedAbilities: abilities || ['NONE'],
        rating: { tier: tier || 'NU', absoluteRating: 50 },
        contextualRatings: { [cap]: { tier: tier || 'NU', absoluteRating: 50 } },
        evolutionData: {
            type: isLC ? 'EVO_TYPE_LC' : (isFinal ? 'EVO_TYPE_FINAL' : 'EVO_TYPE_SOLO'),
            isMega,
            isLC,
            isNFE: false,
            isFinal: isFinal || (!isLC && !isMega),
            megaEvos: [],
            megaBaseForm,
        },
        evolutions,
        learnset: [{ level: '1', move: 'MOVE_TACKLE' }],
        teachables: ['MOVE_SURF'],
        newTeachables: [],
        oldTeachables: [],
    };
}

function makeTrainer(level = 32) {
    return { id: 'TRAINER_TEST', level, class: 'Test', restrictions: [], bag: [] };
}

function makeContext() {
    return { team: [], foundMega: false, storedIds: {} };
}

function makeChooser(pokemonList, trainer, context, extras = {}) {
    return createChooser(pokemonList, trainer, context, {
        starters: [null, null, null],
        staticRewards: {},
        replacementLog: {},
        megaReplacementLog: {},
        isSuperEffective: () => false,
        ...extras,
    });
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('createChooser — contextualTier', () => {
    test('returns a pokemon that matches the requested contextualTier', () => {
        const ruMon = makePoke('SPECIES_RU_MON', { tier: 'RU' });
        const nuMon = makePoke('SPECIES_NU_MON', { tier: 'NU' });
        const pokemonList = [ruMon, nuMon];
        const ctx = makeContext();
        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['RU'] });
        expect(result.id).toBe('SPECIES_RU_MON');
    });

    test('returns null when nothing matches the requested contextualTier', () => {
        const nuMon = makePoke('SPECIES_NU_MON', { tier: 'NU' });
        const pokemonList = [nuMon];
        const ctx = makeContext();
        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['RU'] });
        expect(result).toBeUndefined();
    });

    test('tier-down via selectWithAutoFallback: RU empty → NU found', () => {
        const nuMon = makePoke('SPECIES_NU_MON', { tier: 'NU' });
        const pokemonList = [nuMon];
        const ctx = makeContext();
        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);

        const result = selectWithAutoFallback({ contextualTier: ['RU'] }, chooser);
        expect(result?.pokemon.id).toBe('SPECIES_NU_MON');
    });

    test('maxTierDownSteps=1 stops after one tier-down and does not reach PU', () => {
        const puMon = makePoke('SPECIES_PU_MON', { tier: 'PU' });
        const pokemonList = [puMon];
        const ctx = makeContext();
        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);

        // NU → only 1 step down allowed → RU-1=NU (empty) → stop before PU
        const result = selectWithAutoFallback(
            { contextualTier: ['RU'], maxTierDownSteps: 1 },
            chooser,
        );
        expect(result).toBeNull();
    });
});

describe('createChooser — contextualTier absolute cap', () => {
    function makePokeDissonant(id, absoluteTier, contextualTierAtCap) {
        return {
            ...makePoke(id, { tier: absoluteTier }),
            contextualRatings: { 32: { tier: contextualTierAtCap, absoluteRating: 50 } },
        };
    }

    test('excludes pokemon whose absolute tier exceeds contextual tier (OU absolute, NU contextual in NU slot)', () => {
        const ouAbsNuCtx = makePokeDissonant('OU_ABS', 'OU', 'NU');
        const nuAbsNuCtx = makePoke('NU_ABS', { tier: 'NU' });
        const chooser = makeChooser([ouAbsNuCtx, nuAbsNuCtx], makeTrainer(32), makeContext());

        const seen = new Set();
        for (let i = 0; i < 50; i++) {
            const r = chooser({ contextualTier: ['NU'] });
            if (r) seen.add(r.id);
        }
        expect(seen.has('OU_ABS')).toBe(false);
        expect(seen.has('NU_ABS')).toBe(true);
    });

    test('includes pokemon whose absolute tier is below contextual tier (PU absolute, NU contextual in NU slot)', () => {
        const puAbsNuCtx = makePokeDissonant('PU_ABS', 'PU', 'NU');
        const chooser = makeChooser([puAbsNuCtx], makeTrainer(32), makeContext());
        expect(chooser({ contextualTier: ['NU'] })?.id).toBe('PU_ABS');
    });

    test('includes pokemon whose absolute tier equals contextual tier (NU absolute, NU contextual in NU slot)', () => {
        const nuAbsNuCtx = makePoke('NU_EXACT', { tier: 'NU' });
        const chooser = makeChooser([nuAbsNuCtx], makeTrainer(32), makeContext());
        expect(chooser({ contextualTier: ['NU'] })?.id).toBe('NU_EXACT');
    });
});

describe('createChooser — abilities filter', () => {
    test('returns pokemon with the required ability', () => {
        const sandMon = makePoke('SPECIES_SAND', { abilities: ['SAND_STREAM', 'NONE'], tier: 'NU' });
        const other    = makePoke('SPECIES_OTHER', { abilities: ['SWIFT_SWIM', 'NONE'], tier: 'NU' });
        const pokemonList = [sandMon, other];
        const ctx = makeContext();
        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['NU'], abilities: ['SAND_STREAM'] });
        expect(result.id).toBe('SPECIES_SAND');
    });

    test('returns null when no pokemon has the required ability at that tier', () => {
        const mon = makePoke('SPECIES_MON', { abilities: ['SWIFT_SWIM'], tier: 'NU' });
        const ctx = makeContext();
        const chooser = makeChooser([mon], makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['NU'], abilities: ['SAND_STREAM'] });
        expect(result).toBeUndefined();
    });
});

describe('createChooser — family dedup', () => {
    test('excludes a pokemon from the same family as an existing team member', () => {
        const mon1 = makePoke('SPECIES_EVO_BASE', { family: 'P_FAMILY_TEST', tier: 'NU', isLC: true });
        const mon2 = makePoke('SPECIES_EVO_NEXT', { family: 'P_FAMILY_TEST', tier: 'NU', isFinal: true });
        const pokemonList = [mon1, mon2];
        const ctx = makeContext();
        ctx.team.push({ pokemon: mon1 }); // mon1 already on team

        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);
        const result = chooser({ contextualTier: ['NU'] });
        // mon2 same family → excluded; only mon1 left but also excluded → null
        expect(result).toBeUndefined();
    });

    test('allows pokemon from a different family even when team is non-empty', () => {
        const teamMon  = makePoke('SPECIES_FIGHTER', { family: 'P_FAMILY_FIGHT', tier: 'NU', isFinal: true });
        const poolMon  = makePoke('SPECIES_WATER',   { family: 'P_FAMILY_WATER', tier: 'NU', isFinal: true });
        const ctx = makeContext();
        ctx.team.push({ pokemon: teamMon });

        const chooser = makeChooser([teamMon, poolMon], makeTrainer(32), ctx);
        const result = chooser({ contextualTier: ['NU'] });
        expect(result.id).toBe('SPECIES_WATER');
    });
});

describe('createChooser — checkValidEvo', () => {
    test('excludes a final-evo pokemon whose pre-evo level exceeds trainer level', () => {
        // SPECIES_EVO evolves from BASE at level 40; trainer is level 32 → invalid
        const base = makePoke('SPECIES_BASE', {
            tier: 'NU', isLC: true,
            evolutions: [{ method: 'LEVEL', param: '40', pokemon: 'SPECIES_EVO' }],
        });
        const evo = makePoke('SPECIES_EVO', {
            tier: 'NU', isFinal: true,
            // no evolutions
        });
        const pokemonList = [base, evo];
        const ctx = makeContext();
        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['NU'], checkValidEvo: true });
        // base passes (isLC → checkValidEvo true), evo fails (evolves at 40 > 32)
        expect(result.id).toBe('SPECIES_BASE');
    });

    test('accepts a final-evo pokemon whose pre-evo level is within trainer level', () => {
        const base = makePoke('SPECIES_BASE2', {
            tier: 'NU', isLC: true,
            evolutions: [{ method: 'LEVEL', param: '20', pokemon: 'SPECIES_EVO2' }],
        });
        const evo = makePoke('SPECIES_EVO2', { tier: 'NU', isFinal: true });
        const pokemonList = [base, evo];
        const ctx = makeContext();
        const chooser = makeChooser(pokemonList, makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['NU'], checkValidEvo: true });
        // both should pass — whichever is sampled is fine, just confirm no throw + result exists
        expect(result).toBeDefined();
    });
});

describe('createChooser — mustHaveOneOfMoves', () => {
    test('excludes pokemon that cannot learn any of the required moves', () => {
        const withMove    = makePoke('SPECIES_WITH_MOVE', { tier: 'NU', isFinal: true });
        withMove.teachables = ['MOVE_SANDSTORM'];
        const withoutMove = makePoke('SPECIES_NO_MOVE', { tier: 'NU', isFinal: true });
        withoutMove.teachables = [];
        withoutMove.learnset = [];

        const ctx = makeContext();
        const chooser = makeChooser([withMove, withoutMove], makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['NU'], mustHaveOneOfMoves: ['MOVE_SANDSTORM'] });
        expect(result.id).toBe('SPECIES_WITH_MOVE');
    });
});

describe('createChooser — isMega filter', () => {
    test('excludes mega forms by default (isMega not set on def)', () => {
        const base = makePoke('SPECIES_BASE3', { tier: 'NU', isFinal: true });
        const mega = makePoke('SPECIES_BASE3_MEGA', { tier: 'NU', isMega: true, megaBaseForm: 'SPECIES_BASE3' });
        const ctx = makeContext();
        const chooser = makeChooser([base, mega], makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['NU'] });
        expect(result.id).toBe('SPECIES_BASE3');
    });
});

describe('createChooser — maxBaseTier filter', () => {
    test('passes mega whose base form absolute tier is within maxBaseTier', () => {
        const base = makePoke('SPECIES_BASE_RU', { tier: 'RU', isFinal: true });
        const mega = makePoke('SPECIES_BASE_RU_MEGA', { tier: 'OU', isMega: true, megaBaseForm: 'SPECIES_BASE_RU' });
        const ctx = makeContext();
        const chooser = makeChooser([base, mega], makeTrainer(32), ctx);

        const result = chooser({ isMega: true, absoluteTier: ['MAGIKARP', 'ZU', 'PU', 'NU', 'RU', 'UU', 'OU'], maxBaseTier: 'RU' });
        expect(result?.id).toBe('SPECIES_BASE_RU_MEGA');
    });

    test('filters out mega whose base form absolute tier exceeds maxBaseTier', () => {
        const base = makePoke('SPECIES_BASE_UU', { tier: 'UU', isFinal: true });
        const mega = makePoke('SPECIES_BASE_UU_MEGA', { tier: 'OU', isMega: true, megaBaseForm: 'SPECIES_BASE_UU' });
        const ctx = makeContext();
        const chooser = makeChooser([base, mega], makeTrainer(32), ctx);

        const result = chooser({ isMega: true, absoluteTier: ['MAGIKARP', 'ZU', 'PU', 'NU', 'RU', 'UU', 'OU'], maxBaseTier: 'RU' });
        expect(result).toBeUndefined();
    });

    test('without maxBaseTier all megas remain eligible regardless of base form tier', () => {
        const base = makePoke('SPECIES_BASE_UU2', { tier: 'UU', isFinal: true });
        const mega = makePoke('SPECIES_BASE_UU2_MEGA', { tier: 'OU', isMega: true, megaBaseForm: 'SPECIES_BASE_UU2' });
        const ctx = makeContext();
        const chooser = makeChooser([base, mega], makeTrainer(32), ctx);

        const result = chooser({ isMega: true, absoluteTier: ['MAGIKARP', 'ZU', 'PU', 'NU', 'RU', 'UU', 'OU'] });
        expect(result?.id).toBe('SPECIES_BASE_UU2_MEGA');
    });
});

describe('createChooser — favouriteChain (T-128)', () => {
    // A favourite is an ORDERED list of standard slot-defs (priority high→low). The chain returns the
    // first matcher whose pool is non-empty, and DROPS the favourite (undefined) when none fit —
    // exactly the seed/gimmick "intent → materialise-or-drop" dynamic, applied to the ace.
    const sharpedoMega = () => makePoke('SPECIES_SHARPEDO_MEGA', { tier: 'OU', isMega: true, megaBaseForm: 'SPECIES_SHARPEDO', types: ['WATER', 'DARK'] });
    const otherWater   = () => makePoke('SPECIES_WATER_X', { tier: 'OU', isFinal: true, types: ['WATER'] });
    const fireMon      = () => makePoke('SPECIES_FIRE_X', { tier: 'OU', isFinal: true, types: ['FIRE'] });
    const chain = [
        { oneOf: ['SPECIES_SHARPEDO_MEGA'], isMega: true, absoluteTier: ['UU', 'OU'] }, // the ace
        { type: ['WATER'] },                                                            // any aqua mon
    ];

    test('the highest-priority matcher that fits wins (even when a lower one also fits)', () => {
        const chooser = makeChooser([sharpedoMega(), otherWater()], makeTrainer(60), makeContext());
        expect(chooser({ favouriteChain: chain }).id).toBe('SPECIES_SHARPEDO_MEGA');
    });

    test('falls through to the next matcher when the higher-priority pool is empty', () => {
        const chooser = makeChooser([otherWater()], makeTrainer(60), makeContext()); // no Sharpedo mega
        expect(chooser({ favouriteChain: chain }).id).toBe('SPECIES_WATER_X');
    });

    test('drops the favourite (undefined) when no matcher fits the restrictions', () => {
        const chooser = makeChooser([fireMon()], makeTrainer(60), makeContext()); // nothing aqua
        expect(chooser({ favouriteChain: chain })).toBeUndefined();
    });

    test('respects the tier gate on a species matcher (Sharpedo mega below tier → next matcher)', () => {
        const lowMega = makePoke('SPECIES_SHARPEDO_MEGA', { tier: 'PU', isMega: true, megaBaseForm: 'SPECIES_SHARPEDO', types: ['WATER', 'DARK'] });
        const chooser = makeChooser([lowMega, otherWater()], makeTrainer(60), makeContext());
        // Sharpedo mega is PU (not UU/OU) → the ace matcher is empty → falls to "any aqua"
        expect(chooser({ favouriteChain: chain }).id).toBe('SPECIES_WATER_X');
    });
});

describe('createChooser — TRAINER_POKE_ENCOUNTER + tryMega', () => {
    test('returns the encounter pokemon even when it has no mega (does not filter by hasValidMega)', () => {
        // Froakie has no mega — if hasValidMega were applied, pool would empty → undefined
        const froakie = makePoke('SPECIES_FROAKIE', { tier: 'NU', isLC: true });
        const ctx = makeContext();
        const chooser = makeChooser([froakie], makeTrainer(59), ctx, {
            replacementLog: {},   // no replacement → encounterIds lookup finds froakie directly
        });

        const result = chooser({
            special: 'TRAINER_POKE_ENCOUNTER',
            encounterIds: ['SPECIES_FROAKIE'],
            tryMega: true,
        });
        expect(result).toBeDefined();
        expect(result.id).toBe('SPECIES_FROAKIE');
    });

    test('still applies hasValidMega to the general random pool when tryMega is set', () => {
        // General pool slot: only non-mega-capable mons → hasValidMega should filter them → undefined
        const noMegaMon = makePoke('SPECIES_NO_MEGA', { tier: 'NU', isFinal: true });
        const ctx = makeContext();
        const chooser = makeChooser([noMegaMon], makeTrainer(32), ctx);

        const result = chooser({ contextualTier: ['NU'], tryMega: true });
        expect(result).toBeUndefined();
    });
});
