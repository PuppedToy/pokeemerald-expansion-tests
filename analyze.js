#!/usr/bin/env node
'use strict';

/**
 * analyze.js — Unified interactive pipeline runner.
 *
 * Non-interactive (flags take priority over prompts):
 *   node analyze.js                     — interactive prompts
 *   node analyze.js --no-balance        — skip rebalancer mutations
 *   node analyze.js --all-tms           — treat all teachable moves as TMs
 *   node analyze.js --difficulty=hard
 *   node analyze.js --seed=42
 *   node analyze.js --debug
 */

const { spawnSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const root = __dirname;

function checkDataClean() {
    const result = spawnSync('git', ['status', '--porcelain', 'data/'], {
        cwd: root,
        shell: process.platform === 'win32',
        encoding: 'utf8',
    });
    const dirty = (result.stdout || '').trim();
    if (dirty) {
        console.error('\nERROR: Uncommitted changes in data/ detected. Commit or stash them before running:\n' + dirty);
        process.exit(1);
    }
}

function run(cmd, args) {
    console.log(`\n> ${cmd} ${args.join(' ')}`);
    const result = spawnSync(cmd, args, {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
    if (result.error) throw new Error(`Failed to spawn: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`Command exited with code ${result.status}`);
}

function restore() {
    console.log('\n> Restoring mutated source files...');
    spawnSync('git', ['restore', 'src/', 'include/', 'data/maps/'], {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
}

function ask(rl, question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function promptOrParseArgs() {
    const argv = process.argv.slice(2);
    const hasFlags = argv.some(a =>
        a === '--no-balance' || a === '--all-tms' || a === '--debug' ||
        a.startsWith('--difficulty=') || a.startsWith('--seed=')
    );

    if (hasFlags) {
        return {
            rebalance: !argv.includes('--no-balance'),
            allTms: argv.includes('--all-tms'),
            debug: argv.includes('--debug'),
            difficulty: (argv.find(a => a.startsWith('--difficulty=')) || '').replace('--difficulty=', '') || null,
            seed: (argv.find(a => a.startsWith('--seed=')) || '').replace('--seed=', '') || null,
        };
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\nPokémon Emerald Randomizer');
    console.log('==========================');

    const rebalanceStr  = await ask(rl, 'Rebalance stats? (y/n) [y]: ');
    const allTmsStr     = await ask(rl, 'All TMs available? (y/n) [n]: ');
    const difficultyStr = await ask(rl, 'Difficulty (easy/fair/hard) [fair]: ');
    const seedStr       = await ask(rl, 'Seed (blank = random): ');
    const debugStr      = await ask(rl, 'Debug output? (y/n) [n]: ');

    rl.close();

    return {
        rebalance: rebalanceStr.trim().toLowerCase() !== 'n',
        allTms: allTmsStr.trim().toLowerCase() === 'y',
        difficulty: difficultyStr.trim() || null,
        seed: seedStr.trim() || null,
        debug: debugStr.trim().toLowerCase() === 'y',
    };
}

function buildIndexArgs(opts) {
    const args = [path.join('puppedjs', 'index.js')];
    if (!opts.rebalance) args.push('--no-balance');
    if (opts.allTms) args.push('--all-tms');
    if (opts.difficulty) args.push(`--difficulty=${opts.difficulty}`);
    if (opts.seed) args.push(`--seed=${opts.seed}`);
    if (opts.debug) args.push('--debug');
    return args;
}

async function main() {
    checkDataClean();
    const opts = await promptOrParseArgs();

    // Ensure Ctrl+C triggers the finally block
    process.on('SIGINT', () => process.exit(130));

    try {
        run('node', buildIndexArgs(opts));
    } finally {
        restore();
    }

    console.log('\nDone. Open puppedjs/output/out.html to review results.');
}

main().catch(err => {
    console.error(`\nPipeline failed: ${err.message}`);
    process.exit(1);
});
