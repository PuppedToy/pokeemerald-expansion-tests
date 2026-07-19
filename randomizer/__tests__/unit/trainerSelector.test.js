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

describe('createChooser — TRAINER_REPEAT_ID + devolveToLevel (T-106 reverse continuity)', () => {
    // Beldum --20--> Metang --45--> Metagross. A later-authoritative appearance stored Metagross;
    // an earlier appearance repeats it DEVOLVED to the most-evolved form legal at its level.
    const beldum = makePoke('SPECIES_BELDUM', { tier: 'NU', isLC: true, evolutions: [{ method: 'LEVEL', param: '20', pokemon: 'SPECIES_METANG' }] });
    const metang = makePoke('SPECIES_METANG', { tier: 'NU', evolutions: [{ method: 'LEVEL', param: '45', pokemon: 'SPECIES_METAGROSS' }] });
    const metagross = makePoke('SPECIES_METAGROSS', { tier: 'OU', isFinal: true });
    const list = [beldum, metang, metagross];

    test('repeats the stored mon as-is (no devolveToLevel) at any level', () => {
        const ctx = makeContext();
        ctx.storedIds['STEVEN_MEGA'] = 'SPECIES_METAGROSS';
        const chooser = makeChooser(list, makeTrainer(22), ctx);
        expect(chooser({ special: 'TRAINER_REPEAT_ID', id: 'STEVEN_MEGA' }).id).toBe('SPECIES_METAGROSS');
    });

    test('devolveToLevel projects the stored final form back to the level-legal stage', () => {
        const ctx = makeContext();
        ctx.storedIds['STEVEN_MEGA'] = 'SPECIES_METAGROSS';
        const chooser = makeChooser(list, makeTrainer(22), ctx);
        // level 22: Metagross needs 45 → devolves to Metang (Beldum→Metang at 20 is legal)
        expect(chooser({ special: 'TRAINER_REPEAT_ID', id: 'STEVEN_MEGA', devolveToLevel: true }).id).toBe('SPECIES_METANG');
    });

    test('devolveToLevel is a no-op at a high level (keeps the final form)', () => {
        const ctx = makeContext();
        ctx.storedIds['STEVEN_MEGA'] = 'SPECIES_METAGROSS';
        const chooser = makeChooser(list, makeTrainer(78), ctx);
        expect(chooser({ special: 'TRAINER_REPEAT_ID', id: 'STEVEN_MEGA', devolveToLevel: true }).id).toBe('SPECIES_METAGROSS');
    });
});

describe('createChooser — ALLOW_ONLY_TYPES restriction (B-028)', () => {
    const ALLOW_ONLY_TYPES = 'TRAINER_RESTRICTION_ALLOW_ONLY_TYPES';
    test('keeps only candidates that have one of the trainer types', () => {
        const fire  = makePoke('SPECIES_FIRE_A', { types: ['FIRE'], tier: 'NU', isFinal: true });
        const water = makePoke('SPECIES_WATER_A', { types: ['WATER'], tier: 'NU', isFinal: true });
        const trainer = { ...makeTrainer(32), restrictions: [ALLOW_ONLY_TYPES], types: ['FIRE'] };
        const chooser = makeChooser([fire, water], trainer, makeContext());
        for (let s = 0; s < 25; s++) {
            const r = chooser({ contextualTier: ['NU'] });
            if (r) expect(r.id).toBe('SPECIES_FIRE_A');
        }
    });
    test('is NOT bypassed when no candidate matches (no off-type fallback)', () => {
        // Only a Water mon exists; a Fire-only trainer must field nothing here, not the Water mon.
        const water = makePoke('SPECIES_WATER_B', { types: ['WATER'], tier: 'NU', isFinal: true });
        const trainer = { ...makeTrainer(32), restrictions: [ALLOW_ONLY_TYPES], types: ['FIRE'] };
        const chooser = makeChooser([water], trainer, makeContext());
        expect(chooser({ contextualTier: ['NU'] })).toBeUndefined();
    });
});

describe('createChooser — NO_REPEATED_TYPE restriction (B-027)', () => {
    const NO_REPEAT = 'TRAINER_RESTRICTION_NO_REPEATED_TYPE';
    test('excludes a candidate that shares a type with an existing team member', () => {
        const psyFairy = makePoke('SPECIES_PSY_FAIRY', { types: ['PSYCHIC', 'FAIRY'], tier: 'OU', isFinal: true });
        const waterPsy  = makePoke('SPECIES_WATER_PSY', { types: ['WATER', 'PSYCHIC'], tier: 'OU', isFinal: true });
        const fire      = makePoke('SPECIES_FIRE_ONLY', { types: ['FIRE'], tier: 'OU', isFinal: true });
        const ctx = makeContext();
        ctx.team.push({ pokemon: psyFairy }); // team already fields a Psychic/Fairy mon
        const trainer = { ...makeTrainer(50), restrictions: [NO_REPEAT] };
        const chooser = makeChooser([psyFairy, waterPsy, fire], trainer, ctx);
        // waterPsy shares PSYCHIC → must be excluded; only the pure-Fire mon is eligible.
        for (let s = 0; s < 25; s++) {
            const r = chooser({ absoluteTier: ['OU'] });
            if (r) expect(r.id).toBe('SPECIES_FIRE_ONLY');
        }
    });
    test('allows a candidate whose types are all new', () => {
        const fire = makePoke('SPECIES_F', { types: ['FIRE'], tier: 'OU', isFinal: true });
        const water = makePoke('SPECIES_W', { types: ['WATER'], tier: 'OU', isFinal: true });
        const ctx = makeContext();
        ctx.team.push({ pokemon: fire });
        const trainer = { ...makeTrainer(50), restrictions: [NO_REPEAT] };
        const chooser = makeChooser([fire, water], trainer, ctx);
        expect(chooser({ absoluteTier: ['OU'] }).id).toBe('SPECIES_W');
    });
});

describe('favourite as a slot + fallback chain (T-128 unified mechanism)', () => {
    // The resolver materialises a favourite priority chain [ace, ...fallbacks] as
    // { ...ace, fallback: [...rest] } with maxTierDownSteps:0, and drives it through the shared
    // selectWithAutoFallback engine: the first rung that fits wins, else the next, else the whole
    // favourite drops (null). This block tests that behaviour on the exact shape the resolver builds.
    const sharpedoMega = () => makePoke('SPECIES_SHARPEDO_MEGA', { tier: 'OU', isMega: true, megaBaseForm: 'SPECIES_SHARPEDO', types: ['WATER', 'DARK'] });
    const otherWater   = () => makePoke('SPECIES_WATER_X', { tier: 'OU', isFinal: true, types: ['WATER'] });
    const fireMon      = () => makePoke('SPECIES_FIRE_X', { tier: 'OU', isFinal: true, types: ['FIRE'] });
    const chain = [
        { oneOf: ['SPECIES_SHARPEDO_MEGA'], isMega: true, absoluteTier: ['UU', 'OU'] }, // the ace
        { type: ['WATER'] },                                                            // any aqua mon
    ];
    const favSlot = (c) => { const r = c.map(m => ({ ...m, maxTierDownSteps: 0 })); return { ...r[0], fallback: r.slice(1) }; };

    test('the highest-priority rung that fits wins (even when a lower one also fits)', () => {
        const chooser = makeChooser([sharpedoMega(), otherWater()], makeTrainer(60), makeContext());
        expect(selectWithAutoFallback(favSlot(chain), chooser).pokemon.id).toBe('SPECIES_SHARPEDO_MEGA');
    });

    test('falls through to the next rung when the higher-priority pool is empty', () => {
        const chooser = makeChooser([otherWater()], makeTrainer(60), makeContext()); // no Sharpedo mega
        expect(selectWithAutoFallback(favSlot(chain), chooser).pokemon.id).toBe('SPECIES_WATER_X');
    });

    test('drops the whole favourite (null) when no rung fits the restrictions', () => {
        const chooser = makeChooser([fireMon()], makeTrainer(60), makeContext()); // nothing aqua
        expect(selectWithAutoFallback(favSlot(chain), chooser)).toBeNull();
    });

    test('respects the tier gate on a species rung (Sharpedo mega below tier → next rung)', () => {
        const lowMega = makePoke('SPECIES_SHARPEDO_MEGA', { tier: 'PU', isMega: true, megaBaseForm: 'SPECIES_SHARPEDO', types: ['WATER', 'DARK'] });
        const chooser = makeChooser([lowMega, otherWater()], makeTrainer(60), makeContext());
        expect(selectWithAutoFallback(favSlot(chain), chooser).pokemon.id).toBe('SPECIES_WATER_X');
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

describe('createChooser — T-142 doubles support tier-flex', () => {
    const { getArchetypeModel } = require('../../archetypes');
    const doubles = getArchetypeModel('doubles');
    const singles = getArchetypeModel('singles');
    const supportMon = (id, tierD) => ({
        ...makePoke(id, { tier: tierD, types: ['GRASS'] }), tierDoubles: tierD,
        learnset: [{ level: 1, move: 'MOVE_RAGE_POWDER' }, { level: 1, move: 'MOVE_HELPING_HAND' }, { level: 1, move: 'MOVE_TRICK_ROOM' }], // 3 support tools
        teachables: [], baseHP: 90, baseAttack: 80, baseDefense: 100, baseSpAttack: 80, baseSpDefense: 100, baseSpeed: 60, // BST 510 — viable support
    });
    const attackerMon = (id, tierD) => ({ ...makePoke(id, { tier: tierD }), tierDoubles: tierD, baseAttack: 150, baseSpAttack: 60 });

    test('a doubles team that still wants a support admits an OU support onto an UBERS slot (1 tier down)', () => {
        const support = supportMon('OUSUPP', 'OU');
        const attacker = attackerMon('UBATK', 'UBERS');
        let captured = null;
        const chooser = makeChooser([support, attacker], { ...makeTrainer(76), battleType: 'doubles' },
            { team: [], foundMega: false, storedIds: {}, doublesWantsSupport: true },
            { model: doubles, moves: {}, pickCandidate: (list) => { captured = list; return list.find(p => p.id === 'OUSUPP') || list[0]; } });
        const res = chooser({ absoluteTier: ['UBERS'] });
        expect(captured.map(p => p.id)).toContain('OUSUPP'); // flexed into the pool from 1 tier down
        expect(res.id).toBe('OUSUPP');
    });

    test('the flex is 1 tier only — a UU support is NOT admitted to an UBERS slot (2 down → dropped)', () => {
        const support = supportMon('UUSUPP', 'UU');
        const attacker = attackerMon('UBATK', 'UBERS');
        let captured = null;
        const chooser = makeChooser([support, attacker], { ...makeTrainer(76), battleType: 'doubles' },
            { team: [], foundMega: false, storedIds: {}, doublesWantsSupport: true },
            { model: doubles, moves: {}, pickCandidate: (list) => { captured = list; return list[0]; } });
        chooser({ absoluteTier: ['UBERS'] });
        expect(captured.map(p => p.id)).not.toContain('UUSUPP');
    });

    test('no flex once the team already has a dedicated support (min satisfied)', () => {
        const onTeam = supportMon('TEAMSUPP', 'OU');
        const support = supportMon('OUSUPP', 'OU');
        const attacker = attackerMon('UBATK', 'UBERS');
        let captured = null;
        const chooser = makeChooser([support, attacker], { ...makeTrainer(76), battleType: 'doubles' },
            { team: [{ pokemon: onTeam }], foundMega: false, storedIds: {}, doublesWantsSupport: true },
            { model: doubles, moves: {}, pickCandidate: (list) => { captured = list; return list[0]; } });
        chooser({ absoluteTier: ['UBERS'] });
        expect(captured.map(p => p.id)).not.toContain('OUSUPP'); // need already met → no flex
    });

    test('SINGLES is unaffected — no tier-flex (an OU support stays out of an UBERS singles slot)', () => {
        const support = supportMon('OUSUPP', 'OU');
        const attacker = attackerMon('UBATK', 'UBERS');
        let captured = null;
        const chooser = makeChooser([support, attacker], makeTrainer(76),
            { team: [], foundMega: false, storedIds: {}, archetypeSeed: { base: 'balance' } },
            { model: singles, moves: {}, pickCandidate: (list) => { captured = list; return list[0]; } });
        chooser({ absoluteTier: ['UBERS'] });
        expect(captured.map(p => p.id)).not.toContain('OUSUPP');
    });
});

// ─── T-162 — TRAINER_POKE_ENCOUNTER expands templates to their wildPlan picks ──────────
const rng = require('../../rng');
const { TRAINER_POKE_ENCOUNTER } = require('../../constants');

describe('createChooser — TRAINER_POKE_ENCOUNTER (T-162 wildPlan expansion)', () => {
    const A = makePoke('SPECIES_A', { tier: 'RU' });
    const B = makePoke('SPECIES_B', { tier: 'RU' });
    const C = makePoke('SPECIES_C', { tier: 'RU' });

    test('route slot draws from ALL the template\'s wildPlan picks (random of N), not just the representative', () => {
        rng.seed(1);
        // The representative (A) is NOT in the list; only the other N picks are → proves wildPlan is used.
        const chooser = makeChooser([B, C], makeTrainer(32), makeContext(), {
            replacementLog: { SPECIES_TEMPLATE: 'SPECIES_A' },
            wildPlan: { SPECIES_TEMPLATE: ['SPECIES_A', 'SPECIES_B', 'SPECIES_C'] },
        });
        const result = chooser({ special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_TEMPLATE'] });
        expect(['SPECIES_B', 'SPECIES_C']).toContain(result.id);
    });

    test('deterministic mode (1 pick) resolves to the representative (back-compat)', () => {
        rng.seed(1);
        const chooser = makeChooser([A], makeTrainer(32), makeContext(), {
            replacementLog: { SPECIES_TEMPLATE: 'SPECIES_A' },
            wildPlan: { SPECIES_TEMPLATE: ['SPECIES_A'] },
        });
        const result = chooser({ special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_TEMPLATE'] });
        expect(result.id).toBe('SPECIES_A');
    });

    test('no wildPlan entry falls back to replacementLog (old bundles / unplaced templates)', () => {
        rng.seed(1);
        const chooser = makeChooser([A], makeTrainer(32), makeContext(), {
            replacementLog: { SPECIES_TEMPLATE: 'SPECIES_A' },
            wildPlan: {},
        });
        const result = chooser({ special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_TEMPLATE'] });
        expect(result.id).toBe('SPECIES_A');
    });

    test('rival pool: pickBest sees EVERY obtainable pick across all templates and takes the best', () => {
        rng.seed(1);
        const weak1  = makePoke('SPECIES_WEAK1',  { tier: 'NU' }); weak1.rating.absoluteRating = 40;
        const weak2  = makePoke('SPECIES_WEAK2',  { tier: 'NU' }); weak2.rating.absoluteRating = 42;
        const strong = makePoke('SPECIES_STRONG', { tier: 'RU' }); strong.rating.absoluteRating = 90;
        const chooser = makeChooser([weak1, weak2, strong], makeTrainer(32), makeContext(), {
            // representatives are the weak ones; the strong pick exists only in wildPlan (a classic-mode N).
            replacementLog: { SPECIES_T1: 'SPECIES_WEAK1', SPECIES_T2: 'SPECIES_WEAK2' },
            wildPlan: { SPECIES_T1: ['SPECIES_WEAK1', 'SPECIES_STRONG'], SPECIES_T2: ['SPECIES_WEAK2'] },
        });
        const result = chooser({ special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_T1', 'SPECIES_T2'], pickBest: true });
        expect(result.id).toBe('SPECIES_STRONG');
    });
});
