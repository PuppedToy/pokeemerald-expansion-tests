'use strict';

/**
 * T-165 — preset the "Disable Steven tag battle" gate at ROM-build time from the bundle config.
 *
 * With config.disableStevenTagBattle on, the Mossdeep Space Center 2F fight becomes a SOLO boss vs
 * TRAINER_TABITHA_MOSSDEEP_NO_TAG (Steven takes Maxie off-screen) instead of the player + Steven vs
 * Maxie + Tabitha multi_2_vs_2 tag battle. The map script is VAR-gated
 * (VAR_DISABLE_STEVEN_TAG_BATTLE, initialised to 0 in OnTransition); the maker just flips that one
 * setvar literal per-ROM — the branch logic itself lives in the (committed) base script. Mirrors the
 * runAndBunWriter / moneyWriter pattern; restored by make.js's restore() after the build.
 */

const fs = require('fs').promises;
const path = require('path');

const SPACE_CENTER_SCRIPT_FILE = path.resolve(__dirname, '..', 'data', 'maps', 'MossdeepCity_SpaceCenter_2F', 'scripts.inc');

/** Pure: set the VAR_DISABLE_STEVEN_TAG_BATTLE setvar literal (0 off / 1 on) from the config. */
function patchStevenTagInContent(content, config = {}) {
    const gate = config.disableStevenTagBattle === true ? 1 : 0;
    return content.replace(/setvar VAR_DISABLE_STEVEN_TAG_BATTLE, \d+/, `setvar VAR_DISABLE_STEVEN_TAG_BATTLE, ${gate}`);
}

async function writeStevenTagVar(config, { file = SPACE_CENTER_SCRIPT_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchStevenTagInContent(content, config || {});
    if (patched !== content) await fs.writeFile(file, patched, 'utf8');
}

module.exports = { writeStevenTagVar, patchStevenTagInContent, file: SPACE_CENTER_SCRIPT_FILE };
