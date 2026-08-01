'use strict';

/**
 * Inject the TM→move table, `gTMHMItemMoveIds` (T-239, Group A).
 *
 * The compile path regenerates `FOREACH_TM` in include/constants/tms_hms.h
 * (`tmRandomizer.writeTMsFromList`). That macro feeds three consumers, and only one of them carries the
 * list into the ROM as data:
 *
 *  · `enum TMHMItemId` (`ITEM_TM_<move> = ITEM_TM<n>`) and `GetItemTMHMIndex()` are **position**-based:
 *    the n-th machine is always ITEM_TM<n>, so they compile identically for any list.
 *  · `gTMHMItemMoveIds[]`'s `itemId` column is likewise always ITEM_TM01, TM02, … — only its `moveId`
 *    column changes. That column is what this module writes.
 *  · `GetItemTMHMMoveId(item)` *was* a switch that baked the moves into code (GetItemDescription,
 *    item_icon.c, party_menu.c). T-239 changed it to read the table (include/item.h) — without that, no
 *    amount of data injection would make a randomized TM list correct.
 *
 * The table is indexed, not named, so before writing anything the `itemId` column is checked to be
 * ITEM_TM01, TM02, … in order: that is the proof that entry k really is TM k.
 */

const { TMHM_INDEX_KEY } = require('../structLayout');

const TAG = 'tmMoves';

/**
 * @param {object} ctx  see injector/context.js
 * @returns {{ writes: number, slots: number }}
 */
function injectTmMoves(ctx) {
    const { rom, constants, offsetMap, data, log } = ctx;
    const tmList = (data.pokedex && data.pokedex.tmList) || null;
    if (!tmList || tmList.length === 0) return { writes: 0, slots: 0 };

    const table = offsetMap.require('gTMHMItemMoveIds');
    const tableAt = offsetMap.offsetOf('gTMHMItemMoveIds');
    const entries = table.sizeExact ? table.size / TMHM_INDEX_KEY.stride : null;
    const firstTmItem = constants.require('ITEM_TM01');

    if (entries !== null && tmList.length + 1 > entries) {
        throw new Error(
            `injector/tmMoves: the bundle has ${tmList.length} TMs but gTMHMItemMoveIds only holds ` +
            `${entries} entries (failsafe + machines) — the base and the bundle disagree on the TM count`);
    }

    let writes = 0;
    tmList.forEach((moveName, slot) => {
        if (!moveName) return;
        const at = tableAt + (slot + 1) * TMHM_INDEX_KEY.stride;   // entry 0 is the ITEM_NONE failsafe

        const itemId = rom.readU16(at + TMHM_INDEX_KEY.itemId);
        const expectedItem = firstTmItem + slot;
        if (itemId !== expectedItem) {
            throw new Error(
                `injector/tmMoves: gTMHMItemMoveIds entry ${slot + 1} has itemId ${itemId}, expected ` +
                `ITEM_TM${String(slot + 1).padStart(2, '0')} (${expectedItem}). Either the TM list is longer ` +
                `than the base's TM section (this entry is an HM) or the table's layout changed — refusing ` +
                `to write a move into the wrong machine.`);
        }

        const move = constants.get(`MOVE_${moveName}`);
        if (move === undefined) {
            throw new Error(`injector/tmMoves: TM${String(slot + 1).padStart(2, '0')} — 'MOVE_${moveName}' is not a move the base defines`);
        }
        if (rom.readU16(at + TMHM_INDEX_KEY.moveId) === move) return;   // the base already teaches it
        rom.writeU16(at + TMHM_INDEX_KEY.moveId, move, TAG);
        writes += 1;
    });

    if (writes) log(`tmMoves: ${writes} of ${tmList.length} TM slot(s) rewritten`);
    return { writes, slots: tmList.length };
}

module.exports = { injectTmMoves, TAG };
