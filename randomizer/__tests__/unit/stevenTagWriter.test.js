'use strict';

// TDD (T-165): the maker presets the "Disable Steven tag battle" gate in the Mossdeep Space Center 2F
// script from the bundle config — flipping the single VAR_DISABLE_STEVEN_TAG_BATTLE setvar literal that
// the VAR-gated script branches on (0 = vanilla tag battle, 1 = solo Tabitha boss).

const { patchStevenTagInContent } = require('../../stevenTagWriter');

const SAMPLE = `MossdeepCity_SpaceCenter_2F_OnTransition:
	setvar VAR_DISABLE_STEVEN_TAG_BATTLE, 0
	call_if_eq VAR_MOSSDEEP_CITY_STATE, 2, MossdeepCity_SpaceCenter_2F_EventScript_MoveCivilians
	end
`;

const gateOf = t => Number(t.match(/VAR_DISABLE_STEVEN_TAG_BATTLE, (\d+)/)[1]);

describe('patchStevenTagInContent', () => {
    test('disableStevenTagBattle:true → gate 1 (solo Tabitha boss)', () => {
        expect(gateOf(patchStevenTagInContent(SAMPLE, { disableStevenTagBattle: true }))).toBe(1);
    });

    test('disableStevenTagBattle:false → gate 0 (vanilla tag battle)', () => {
        expect(gateOf(patchStevenTagInContent(SAMPLE, { disableStevenTagBattle: false }))).toBe(0);
    });

    test('absent config → gate 0 (default OFF, byte-identical)', () => {
        expect(patchStevenTagInContent(SAMPLE, {})).toBe(SAMPLE);
        expect(patchStevenTagInContent(SAMPLE)).toBe(SAMPLE);
    });

    test('leaves the rest of the script intact', () => {
        const out = patchStevenTagInContent(SAMPLE, { disableStevenTagBattle: true });
        expect(out).toMatch(/OnTransition:/);
        expect(out).toMatch(/call_if_eq VAR_MOSSDEEP_CITY_STATE/);
        expect(out).toMatch(/\tend/);
    });
});
