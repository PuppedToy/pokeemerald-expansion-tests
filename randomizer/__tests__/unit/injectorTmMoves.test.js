// T-239 — inject the TM→move table (gTMHMItemMoveIds).
//
// The compile path rewrites `FOREACH_TM` in include/constants/tms_hms.h (tmRandomizer.writeTMsFromList),
// which feeds three things. Two are position-based and compile identically for any list — the
// `ITEM_TM_<move> = ITEM_TM<n>` enum and `GetItemTMHMIndex()` — and so is the `itemId` column of
// gTMHMItemMoveIds (always ITEM_TM01, TM02, …). Only the table's `moveId` column carries the list, so
// that column is what gets injected.
//
// `GetItemTMHMMoveId(item)` used to be a switch that baked the moves into CODE; T-239 made it read the
// table (include/item.h), which is what makes this output injectable at all.
const { buildSyntheticBase, constants } = require('../fixtures/syntheticBase');
const { buildInjectionContext } = require('../../injector/context');
const { injectTmMoves } = require('../../injector/modules/tmMoves');
const { TMHM_INDEX_KEY } = require('../../injector/structLayout');

const BASE_TMS = ['VACUUM_WAVE', 'BRUTAL_SWING', 'BRINE', 'HIDDEN_POWER', 'ROAR'];

function setup(tmList, { baseTms = BASE_TMS } = {}) {
    const base = buildSyntheticBase({ tmMoves: baseTms });
    const ctx = buildInjectionContext({
        rom: base.rom,
        offsetMap: base.offsetMap,
        data: { pokedex: { tmList } },
    });
    return { ...base, ctx };
}

/** Read entry `index` (0 = failsafe, 1 = TM01) of gTMHMItemMoveIds. */
function entry(base, index) {
    const at = base.offsetMap.offsetOf('gTMHMItemMoveIds') + index * TMHM_INDEX_KEY.stride;
    return {
        itemId: base.rom.readU16(at + TMHM_INDEX_KEY.itemId),
        moveId: base.rom.readU16(at + TMHM_INDEX_KEY.moveId),
    };
}

describe('the moveId column', () => {
    test('writes each TM slot’s move, leaving the itemId column alone', () => {
        const base = setup(['ICE_BEAM', 'BRUTAL_SWING', 'EARTHQUAKE', 'HIDDEN_POWER', 'THUNDER']);
        const { writes } = injectTmMoves(base.ctx);

        expect(entry(base, 1)).toEqual({ itemId: constants.require('ITEM_TM01'), moveId: constants.require('MOVE_ICE_BEAM') });
        expect(entry(base, 3)).toEqual({ itemId: constants.require('ITEM_TM03'), moveId: constants.require('MOVE_EARTHQUAKE') });
        expect(entry(base, 5).moveId).toBe(constants.require('MOVE_THUNDER'));
        expect(writes).toBe(3);   // slots 2 and 4 already held those moves
    });

    test('a slot whose move the base already has is not written', () => {
        const base = setup([...BASE_TMS]);
        const { writes } = injectTmMoves(base.ctx);

        expect(writes).toBe(0);
        expect(base.rom.journal).toHaveLength(0);
    });

    test('never touches the failsafe entry or the HM entries', () => {
        const base = setup(['ICE_BEAM', 'ICE_BEAM', 'ICE_BEAM', 'ICE_BEAM', 'ICE_BEAM']);
        injectTmMoves(base.ctx);

        expect(entry(base, 0)).toEqual({ itemId: constants.require('ITEM_NONE'), moveId: constants.require('MOVE_NONE') });
        const firstHm = BASE_TMS.length + 1;
        expect(entry(base, firstHm)).toEqual({ itemId: constants.require('ITEM_HM01'), moveId: constants.require('MOVE_CUT') });
    });

    test('tags every write with this module', () => {
        const base = setup(['ICE_BEAM', ...BASE_TMS.slice(1)]);
        injectTmMoves(base.ctx);
        expect(base.rom.journal.every(e => /tm/i.test(e.tag))).toBe(true);
    });
});

describe('failure modes — the table is indexed, so a wrong index is silent corruption', () => {
    test('refuses a table whose itemId column is not ITEM_TM01, TM02, …', () => {
        const base = setup(['ICE_BEAM', ...BASE_TMS.slice(1)]);
        const at = base.offsetMap.offsetOf('gTMHMItemMoveIds') + TMHM_INDEX_KEY.stride;
        base.rom.buffer.writeUInt16LE(constants.require('ITEM_POTION'), at + TMHM_INDEX_KEY.itemId);

        expect(() => injectTmMoves(base.ctx)).toThrow(/ITEM_TM01|itemId/);
    });

    test('refuses a TM list longer than the table’s TM section', () => {
        const base = setup(['ICE_BEAM', 'BRINE', 'ROAR', 'THUNDER', 'SURF', 'FLY']);
        expect(() => injectTmMoves(base.ctx)).toThrow(/6|TM06|longer|section/i);
    });

    test('an unknown move name throws instead of writing a wrong id', () => {
        const base = setup(['NOT_A_MOVE', ...BASE_TMS.slice(1)]);
        expect(() => injectTmMoves(base.ctx)).toThrow(/MOVE_NOT_A_MOVE/);
    });

    test('a bundle with no tmList writes nothing', () => {
        const base = setup(null);
        expect(injectTmMoves(base.ctx).writes).toBe(0);
    });
});

describe('the base change that makes this injectable', () => {
    const fs = require('fs');
    const path = require('path');
    const itemHeader = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'include', 'item.h'), 'utf8');

    test('GetItemTMHMMoveId reads gTMHMItemMoveIds — no FOREACH_TM switch baking moves into code', () => {
        const body = itemHeader.slice(itemHeader.indexOf('GetItemTMHMMoveId'));
        expect(body).toMatch(/gTMHMItemMoveIds\[GetItemTMHMIndex\(item\)\]\.moveId/);
        expect(itemHeader).not.toMatch(/UNPACK_ITEM_TO_TM_MOVE_ID/);
    });

    test('GetItemTMHMIndex keeps its switch — it is position-based, so the list never changes it', () => {
        expect(itemHeader).toMatch(/FOREACH_TM\(UNPACK_ITEM_TO_TM_INDEX\)/);
    });
});
