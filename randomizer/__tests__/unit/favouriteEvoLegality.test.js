'use strict';

// B-068 (forced-species slots) — a slot that NAMES its species bypassed the evolution-legality check,
// because a named species resolves through trainerSelector's STRICT list and checkValidEvo only ever
// filtered the loose one. Two such slots existed; both are covered here.
//
// A favourite resolves to a `{ specific: id }` slot, and in trainerSelector a `specific` slot fills
// `pokemonStrictList` — which `checkValidEvo` never filtered (it only ever filtered the loose list). So
// Norman (level 39, favourite SPECIES_SLAKING) fielded a Slaking whose Vigoroth→Slaking step is level 50
// in that run, and checkValidEvo(…, 39) said false the whole time; nobody asked it.
//
// The fix reuses T-106's projection: field the most-evolved form of the favourite's line that is legal at
// this level, so an early boss shows its signature LINE (Norman → Vigoroth) instead of an impossible
// final form, and still gets the real ace once it is reachable. The claim itself is unchanged — the
// favourite still consumes the pool slot of the NAMED species' tier, because that is the budget the
// trainer means to spend on its signature.

const rng = require('../../rng');
const { resolveFavourites } = require('../../modules/favouriteClaim');
const { getTrainersData } = require('../../trainers.js');
const { TRAINER_REPEAT_ID } = require('../../constants');

// Slakoth --lvl 18--> Vigoroth --lvl 50--> Slaking, plus a mega for the no-devolve-megas case.
const line = [
    {
        id: 'SPECIES_SLAKOTH', parsedTypes: ['NORMAL'], rating: { tier: 'PU' }, contextualRatings: {},
        evolutionData: { isMega: false, type: 'EVO_TYPE_LC_OF_3', isLC: true, isFinal: false },
        evolutions: [{ method: 'LEVEL', param: '18', pokemon: 'SPECIES_VIGOROTH' }],
    },
    {
        id: 'SPECIES_VIGOROTH', parsedTypes: ['NORMAL'], rating: { tier: 'RU' }, contextualRatings: {},
        evolutionData: { isMega: false, type: 'EVO_TYPE_NFE_OF_3', isLC: false, isFinal: false },
        evolutions: [{ method: 'LEVEL', param: '50', pokemon: 'SPECIES_SLAKING' }],
    },
    {
        id: 'SPECIES_SLAKING', parsedTypes: ['NORMAL'], rating: { tier: 'OU' }, contextualRatings: {},
        evolutionData: { isMega: false, type: 'EVO_TYPE_LAST_OF_3', isLC: false, isFinal: true },
        evolutions: undefined,
    },
    {
        id: 'SPECIES_MANECTRIC_MEGA', parsedTypes: ['ELECTRIC'], rating: { tier: 'OU' }, contextualRatings: {},
        evolutionData: { isMega: true, megaBaseForm: 'SPECIES_MANECTRIC' },
        evolutions: undefined,
    },
    {
        id: 'SPECIES_MANECTRIC', parsedTypes: ['ELECTRIC'], rating: { tier: 'UU' }, contextualRatings: {},
        evolutionData: { isMega: false, type: 'EVO_TYPE_SOLO', isLC: false, isFinal: true },
        evolutions: undefined,
    },
];

const pool = (...tiers) => tiers.map(t => (t === 'MEGA' ? { isMega: true } : { absoluteTier: [t], checkValidEvo: true }));
const ctx = level => ({ pokemonList: line, level });

describe('a favourite is projected onto a legal form (B-068)', () => {
    test("Norman's Slaking at level 39 is fielded as the legal Vigoroth", () => {
        const out = resolveFavourites(pool('OU', 'RU', 'RU'), [['SPECIES_SLAKING']], ctx(39));
        expect(out[0].specific).toBe('SPECIES_VIGOROTH');
        expect(out[0].__favourite).toBe(true);
    });

    test('at its own evolution level the real ace shows up', () => {
        const out = resolveFavourites(pool('OU', 'RU', 'RU'), [['SPECIES_SLAKING']], ctx(50));
        expect(out[0].specific).toBe('SPECIES_SLAKING');
    });

    test('below the first step it devolves all the way down the line', () => {
        const out = resolveFavourites(pool('OU', 'RU', 'RU'), [['SPECIES_SLAKING']], ctx(17));
        expect(out[0].specific).toBe('SPECIES_SLAKOTH');
    });

    test('the claim still consumes the NAMED species tier slot, not the devolved one', () => {
        // Slaking is OU; projecting it to Vigoroth (RU) must not move the claim onto an RU slot, or the
        // trainer would silently gain budget. The OU slot is spent either way.
        const out = resolveFavourites(pool('OU', 'RU', 'RU'), [['SPECIES_SLAKING']], ctx(39));
        const remaining = out.slice(1).map(s => s.absoluteTier && s.absoluteTier[0]);
        expect(remaining).toEqual(['RU', 'RU']);
    });

    test('a mega favourite is never devolved — the mega slot exists to field a mega', () => {
        const out = resolveFavourites(pool('OU', 'MEGA'), [['SPECIES_MANECTRIC_MEGA']], ctx(20));
        expect(out[0].specific).toBe('SPECIES_MANECTRIC_MEGA');
    });

    test('a favourite with no pre-evolution is untouched at any level', () => {
        const out = resolveFavourites(pool('UU', 'RU'), [['SPECIES_MANECTRIC']], ctx(10));
        expect(out[0].specific).toBe('SPECIES_MANECTRIC');
    });
});

// The other forced-species slot: TRAINER_REPEAT_ID, which echoes an authoritative roster onto an earlier
// appearance. Every such slot needs `devolveToLevel` or it fields the later, stronger form at the earlier
// level. PARTNER_STEVEN's legend slot was the one that lacked it, on the assumption that "legends are
// solo-evo" — but Cosmoem→Solgaleo/Lunala, Poipole→Naganadel and Kubfu→Urshifu all exist, so the partner
// fielded a level-65 Solgaleo at level 59. devolveToLevel is a no-op for a mon with no pre-evolution, so
// the flag is always safe: this asserts the invariant for the whole template file, not just that one slot.
describe('every REPEAT_ID echo slot projects onto the level (B-068)', () => {
    test('no TRAINER_REPEAT_ID slot is missing devolveToLevel', () => {
        rng.seed(1);
        const stubItems = new Proxy({}, { get: () => Array(12).fill('ITEM_POTION') });
        const trainersData = getTrainersData(stubItems, [], {});

        const offenders = [];
        for (const trainer of trainersData) {
            for (const slot of trainer.team || []) {
                if (slot.special === TRAINER_REPEAT_ID && !slot.devolveToLevel) {
                    offenders.push(`${trainer.id} → ${slot.id}`);
                }
            }
        }
        expect(offenders).toEqual([]);
    });
});
