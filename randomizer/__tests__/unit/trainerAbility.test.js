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
});
