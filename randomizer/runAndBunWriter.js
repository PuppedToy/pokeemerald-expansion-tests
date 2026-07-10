'use strict';

/**
 * T-091 / ADR-014 — preset the League Run & Bun game VARs at ROM-build time from the bundle config.
 * The maker "obeys" the randomizer/frontend: it writes the mode gate + the ingame Elite Four
 * singles/doubles quotas into Sidney's room init script (T-090's `..._EventScript_InitRunAndBun`),
 * by substituting the three `setvar` values. Mirrors the moneyWriter/itemPriceWriter pattern.
 *
 * Mode 1 only for `mixed` + `leagueRunAndBun`; otherwise mode 0 (the E4 never prompts). The quotas
 * come from runAndBunE4Split (round(%singles×4) clamped 1–3).
 */

const fs = require('fs').promises;
const path = require('path');
const { runAndBunE4Split } = require('./battleFormat');

const SIDNEY_SCRIPT_FILE = path.resolve(__dirname, '..', 'data', 'maps', 'EverGrandeCity_SidneysRoom', 'scripts.inc');

/** Pure: substitute the three Run & Bun `setvar` values in the InitRunAndBun script from the config. */
function patchRunAndBunInContent(content, config = {}) {
    const runAndBun = config.battleFormat === 'mixed' && config.leagueRunAndBun === true;
    const mode = runAndBun ? 1 : 0;
    const { singles, doubles } = runAndBunE4Split(config.singlesPercent ?? 60);
    // Off → mode 0 makes ChooseBattleStyle never prompt; write sane quota defaults regardless.
    const singlesLeft = runAndBun ? singles : 4;
    const doublesLeft = runAndBun ? doubles : 0;
    return content
        .replace(/setvar VAR_RUNANDBUN_MODE, \d+/, `setvar VAR_RUNANDBUN_MODE, ${mode}`)
        .replace(/setvar VAR_RUNANDBUN_SINGLES_LEFT, \d+/, `setvar VAR_RUNANDBUN_SINGLES_LEFT, ${singlesLeft}`)
        .replace(/setvar VAR_RUNANDBUN_DOUBLES_LEFT, \d+/, `setvar VAR_RUNANDBUN_DOUBLES_LEFT, ${doublesLeft}`);
}

async function writeRunAndBunVars(config, { file = SIDNEY_SCRIPT_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchRunAndBunInContent(content, config || {});
    if (patched !== content) await fs.writeFile(file, patched, 'utf8');
}

module.exports = { writeRunAndBunVars, patchRunAndBunInContent, file: SIDNEY_SCRIPT_FILE };
