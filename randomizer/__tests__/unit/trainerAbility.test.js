'use strict';

// T-065 — a weather-archetype fallback mon must keep its weather ability. The resolver picks from
// effectiveDef.abilities (fallback-aware); the old writerDocs bug used the primary def's abilities,
// so a rain-abuser fallback got a generic top-rated ability (Intimidate) instead of Swift Swim.

const abilities = require('../fixtures/miniAbilities');
const rng = require('../../rng');
const { pickTrainerMonAbility } = require('../../modules/trainerAbility');

const rainAbilities = ['SWIFT_SWIM', 'RAIN_DISH', 'DRY_SKIN', 'HYDRATION'];
const sandAbilities = ['SAND_STREAM', 'SAND_RUSH', 'SAND_FORCE', 'SAND_VEIL'];

// Qwilfish-Hisui: has Swift Swim, but Intimidate (7) out-rates it (5) — the bug picked Intimidate.
const qwilfishHisui = () => ({ id: 'SPECIES_QWILFISH_HISUI', parsedAbilities: ['POISON_POINT', 'SWIFT_SWIM', 'INTIMIDATE'] });
// Boldore: has Sand Rush (3), but Sturdy (5) out-rates it — the bug picked Sturdy.
const boldore = () => ({ id: 'SPECIES_BOLDORE', parsedAbilities: ['SAND_RUSH', 'STURDY'] });

describe('pickTrainerMonAbility — weather fallback (T-065)', () => {
    test('rain-abuser fallback gets Swift Swim, never Intimidate', () => {
        rng.seed(1);
        const mon = qwilfishHisui();
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: mon, baseFormMon: mon,
            trainerAbilities: [], effectiveDef: { abilities: rainAbilities },
            level: 24, abilities,
        });
        expect(ability).toBe('SWIFT_SWIM');
    });

    test('sand-abuser fallback gets Sand Rush, never Sturdy (same path covers all weathers)', () => {
        rng.seed(1);
        const mon = boldore();
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: mon, baseFormMon: mon,
            trainerAbilities: [], effectiveDef: { abilities: sandAbilities },
            level: 32, abilities,
        });
        expect(ability).toBe('SAND_RUSH');
    });

    test('a primary (non-fallback) def keeps its required ability (e.g. a real Drizzle mon)', () => {
        rng.seed(1);
        const drizzler = { id: 'SPECIES_DRIZZLER', parsedAbilities: ['DRIZZLE', 'SWIFT_SWIM'] };
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: drizzler, baseFormMon: drizzler,
            trainerAbilities: [], effectiveDef: { abilities: ['DRIZZLE'] },
            level: 24, abilities,
        });
        expect(ability).toBe('DRIZZLE');
    });

    test('an abilities-less fallback (terrain / type-only) uses the generic best-ability pick', () => {
        rng.seed(1);
        const mon = qwilfishHisui();
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: mon, baseFormMon: mon,
            trainerAbilities: [], effectiveDef: { abilities: undefined },
            level: 24, abilities,
        });
        expect(ability).toBe('INTIMIDATE'); // highest-rated when no weather constraint applies
    });

    // T-132 (owner, 2026-07-13) — WEATHER-AWARE ability value: a weather ability is only worth having when
    // ITS weather is active. Off-weather it "puntúa 0" (isn't picked); on-weather it's preferred.
    test('a FOREIGN weather ability is not picked (Swift Swim on a sand team)', () => {
        rng.seed(1);
        // Omanyte-like: Swift Swim (rain) is high-rated, but on sand it does nothing → pick a neutral one.
        const omanyte = { id: 'SPECIES_OMANYTE', parsedAbilities: ['SWIFT_SWIM', 'SHELL_ARMOR', 'WEAK_ARMOR'] };
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: omanyte, baseFormMon: omanyte,
            trainerAbilities: [], effectiveDef: { abilities: undefined },
            level: 40, abilities, weatherSubtype: 'sand',
        });
        expect(ability).not.toBe('SWIFT_SWIM');
    });

    test('a foreign weather SETTER is not picked either (Drizzle on a snow team) — subsumes the old RC4 ban', () => {
        rng.seed(1);
        const delibird = { id: 'SPECIES_DELIBIRD', parsedAbilities: ['DRIZZLE', 'HUSTLE'] };
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: delibird, baseFormMon: delibird,
            trainerAbilities: [], effectiveDef: { abilities: undefined },
            level: 40, abilities, weatherSubtype: 'snow',
        });
        expect(ability).toBe('HUSTLE');
    });

    test('the ACTIVE weather ability is preferred over a generic one (Leaf Guard in sun beats Overgrow)', () => {
        rng.seed(1);
        const meganium = { id: 'SPECIES_MEGANIUM', parsedAbilities: ['OVERGROW', 'LEAF_GUARD'] };
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: meganium, baseFormMon: meganium,
            trainerAbilities: [], effectiveDef: { abilities: undefined },
            level: 33, abilities, weatherSubtype: 'sun',
        });
        expect(ability).toBe('LEAF_GUARD');
    });

    test('no weather context → generic pick unchanged (byte-identical for non-weather trainers)', () => {
        rng.seed(1);
        const mon = qwilfishHisui();
        const { ability } = pickTrainerMonAbility({
            chosenTrainerMon: mon, baseFormMon: mon,
            trainerAbilities: [], effectiveDef: { abilities: undefined },
            level: 24, abilities, // no weatherSubtype
        });
        expect(ability).toBe('INTIMIDATE');
    });
});
