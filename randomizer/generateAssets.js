'use strict';

/**
 * generateAssets — build-time generator that base64-embeds the hand-authored
 * static assets in `frontend/assets/**` into `frontend/data/assets.json`
 * (gitignored), keyed by path relative to `frontend/assets/` (T-004).
 *
 * The frontend inlines this map into each generated doc as `EMBEDDED_ASSETS`
 * (and substitutes the font data URIs into the doc's @font-face rules), so docs
 * stay 100% self-contained. Drop a font/image/icon into frontend/assets/ and it
 * becomes available to the template via getAsset('<relative/path>') with no code
 * change. Thin I/O orchestrator — no pure logic to unit-test.
 */

const fs = require('fs');
const path = require('path');

const MIME = {
    '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

function walk(dir, base, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'README.md' || entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        const rel = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) walk(full, rel, out);
        else out.push([rel, full]);
    }
}

function generateAssets(opts = {}) {
    const root = opts.root || path.resolve(__dirname, '..');
    const log = opts.log || console.log;

    const dir = path.join(root, 'frontend', 'assets');
    const map = {};
    const skipped = [];
    if (fs.existsSync(dir)) {
        const files = [];
        walk(dir, '', files);
        for (const [rel, full] of files) {
            const mime = MIME[path.extname(rel).toLowerCase()];
            if (!mime) { skipped.push(rel); continue; }
            map[rel] = `data:${mime};base64,${fs.readFileSync(full).toString('base64')}`;
        }
    }

    const outDir = path.join(root, 'frontend', 'data');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'assets.json');
    fs.writeFileSync(outPath, JSON.stringify(map));
    const sizeKb = Math.round(fs.statSync(outPath).size / 1024);

    log(`[assets] ${Object.keys(map).length} asset(s) embedded (${sizeKb} KB) → ${outPath}`);
    if (skipped.length) log(`[assets] skipped ${skipped.length} file(s) with unknown type: ${skipped.join(', ')}`);

    return { count: Object.keys(map).length, keys: Object.keys(map), skipped, outPath };
}

module.exports = { generateAssets };

if (require.main === module) {
    generateAssets();
}
