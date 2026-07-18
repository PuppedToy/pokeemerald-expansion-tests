'use strict';

// B-039 — the player must do the little hop (jump_right) when stepping out of the truck into Littleroot
// Town, even though the intro skips going home and heads straight to save Birch. The truck exit sets
// VAR_LITTLEROOT_INTRO_STATE to some value; that value MUST be handled by a Littleroot Town OnFrame
// script that applies the step-off-truck hop movement. (Structural guard — the intro can't be run here.)

const fs = require('fs');
const path = require('path');

const MAPS = path.resolve(__dirname, '../../../data/maps');
const truck = fs.readFileSync(path.join(MAPS, 'InsideOfTruck/scripts.inc'), 'utf8');
const town = fs.readFileSync(path.join(MAPS, 'LittlerootTown/scripts.inc'), 'utf8');

describe('B-039 — the truck exit still triggers the step-off-truck hop', () => {
    // The intro state the truck exit sets (male + female should agree).
    const setStates = [...truck.matchAll(/setvar VAR_LITTLEROOT_INTRO_STATE,\s*(\d+)/g)].map((m) => Number(m[1]));

    test('truck exit sets a single, consistent VAR_LITTLEROOT_INTRO_STATE', () => {
        expect(setStates.length).toBeGreaterThan(0);
        expect(new Set(setStates).size).toBe(1);
    });

    test('that state is handled by a Littleroot OnFrame script that hops off the truck', () => {
        const state = setStates[0];
        const onFrame = town.match(/LittlerootTown_OnFrame:[\s\S]*?\.2byte 0/)[0];
        const handlerMatch = onFrame.match(new RegExp(`map_script_2 VAR_LITTLEROOT_INTRO_STATE, ${state}, (\\w+)`));
        expect(handlerMatch).not.toBeNull(); // state must be handled on frame (was 7 → unhandled = no hop)

        const handler = handlerMatch[1];
        const body = town.match(new RegExp(`${handler}::[\\s\\S]*?\\n\\tend`))[0];
        expect(body).toMatch(/applymovement LOCALID_PLAYER, LittlerootTown_Movement_PlayerStepOffTruck/);
    });

    test('the step-off-truck movement is the jump (hop) animation', () => {
        const mvt = town.match(/LittlerootTown_Movement_PlayerStepOffTruck:[\s\S]*?step_end/)[0];
        expect(mvt).toMatch(/jump_right/);
    });
});
