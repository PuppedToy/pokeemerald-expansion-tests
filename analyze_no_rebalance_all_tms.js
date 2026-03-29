#!/usr/bin/env node
/**
 * analyze_no_rebalance_all_tms.js — Run the pipeline with balance/mutations
 * disabled AND with all teachable moves treated as learnable (no TM filter).
 *
 * Use this to compare "what would tiers look like if every teachable move
 * were available via TM?" vs the default run which respects the actual TM pool.
 * Useful for identifying Phase C gaps — pokemon that need a specific TM added
 * to this game's TM list to reach their expected competitive tier.
 *
 * Usage:
 *   node analyze_no_rebalance_all_tms.js           — no-balance, all-tms run
 *   node analyze_no_rebalance_all_tms.js --debug   — passes --debug to index.js
 */

const { spawnSync } = require('child_process');
const path = require('path');

const root = __dirname;
const isDebug = process.argv.includes('--debug');

function run(cmd, args, opts = {}) {
    console.log(`\n> ${cmd} ${args.join(' ')}`);
    const result = spawnSync(cmd, args, {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
        ...opts,
    });
    if (result.error) {
        console.error(`Failed to spawn: ${result.error.message}`);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(`Command exited with code ${result.status}`);
        process.exit(result.status);
    }
}

// Step 1: Run without balance/mutations and with all TMs treated as available
const indexArgs = [path.join('puppedjs', 'index.js'), '--no-balance', '--all-tms'];
if (isDebug) indexArgs.push('--debug');
run('node', indexArgs);

// Step 2: Reset all C/H source files — leaves puppedjs/output/ untouched
run('git', ['restore', 'src/', 'include/']);

console.log('\nDone. Open puppedjs/output/out.html to review results (vanilla stats, all TMs available).');
