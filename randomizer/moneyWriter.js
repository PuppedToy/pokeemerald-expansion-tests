'use strict';

// T-052 — configurable trainer prize money. Trainer money lives entirely in the C decomp
// (src/battle_script_commands.c → GetTrainerMoneyToGive), which now reads three committed #defines.
// This writer patches those #define values from the bundle config at ROM-build time (called from
// make.js buildOneRom), then make.js's restore() (git checkout -- src/) reverts the file.
//
// The museum grunts and Space-Center grunts derive from the boss value IN C
// (MUSEUM_SPACE_MONEY = round(boss*2/3), MUSEUM_2 = that + 50), so only three literals are patched.
// Elite Four ($10k) and Champion ($50k) are intentionally fixed.

const fs = require('fs').promises;
const path = require('path');

const BATTLE_SCRIPT_FILE = path.resolve(__dirname, '..', 'src', 'battle_script_commands.c');

const MONEY_DEFAULTS = { normal: 250, boss: 3000, gym: 5000 };

function clampMoney(v, def) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return def;
    return Math.round(v);
}

/**
 * Patch the three trainer-money #defines in the given C source text. Pure — returns the new text.
 * @param {string} content - battle_script_commands.c source
 * @param {{normal?:number, boss?:number, gym?:number}} money
 * @returns {string}
 */
function patchMoneyInContent(content, money = {}) {
    const normal = clampMoney(money.normal, MONEY_DEFAULTS.normal);
    const boss = clampMoney(money.boss, MONEY_DEFAULTS.boss);
    const gym = clampMoney(money.gym, MONEY_DEFAULTS.gym);
    return content
        .replace(/#define NORMAL_TRAINER_MONEY\s+\d+/, `#define NORMAL_TRAINER_MONEY ${normal}`)
        .replace(/#define BOSS_TRAINER_MONEY\s+\d+/, `#define BOSS_TRAINER_MONEY ${boss}`)
        .replace(/#define GYM_LEADER_MONEY\s+\d+/, `#define GYM_LEADER_MONEY ${gym}`);
}

/**
 * Read the battle-script C file, patch the money #defines from config, and write it back.
 * A no-op-equivalent when money is undefined (defaults reproduce the committed values).
 */
async function writeMoney(money, { file = BATTLE_SCRIPT_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchMoneyInContent(content, money || {});
    await fs.writeFile(file, patched, 'utf8');
}

module.exports = { writeMoney, patchMoneyInContent, clampMoney, MONEY_DEFAULTS, file: BATTLE_SCRIPT_FILE };
