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

// Minimal CRC32 (PNG chunk checksum) — no dependency so it runs on any Node (CI/builder included).
let CRC_TABLE;
function crc32(buf) {
    if (!CRC_TABLE) {
        CRC_TABLE = [];
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            CRC_TABLE[n] = c >>> 0;
        }
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// T-187 — the game's category_icons.png is an indexed (colour-type 3) PNG whose palette index 0 is a
// solid light-green that the game treats as transparent but the browser renders opaque (the "green box").
// It ships with no tRNS chunk, so we inject one marking index 0 fully transparent (others stay opaque).
// Pure buffer surgery — insert a tRNS chunk right after PLTE. No-op if it's not an indexed PNG or a
// tRNS already exists.
function makePaletteIndex0Transparent(buf) {
    if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504E47) return buf;
    let o = 8, plteEnd = -1, hasTRNS = false, colorType = -1;
    while (o + 12 <= buf.length) {
        const len = buf.readUInt32BE(o);
        const type = buf.toString('ascii', o + 4, o + 8);
        if (type === 'IHDR') colorType = buf[o + 8 + 9];
        if (type === 'tRNS') hasTRNS = true;
        if (type === 'PLTE') plteEnd = o + 12 + len;
        o += 12 + len;
        if (type === 'IEND') break;
    }
    if (colorType !== 3 || hasTRNS || plteEnd < 0) return buf;
    const data = Buffer.from([0]);   // alpha for palette index 0 = 0 (transparent); rest default opaque
    const chunk = Buffer.alloc(12 + data.length);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write('tRNS', 4, 'ascii');
    data.copy(chunk, 8);
    chunk.writeUInt32BE(crc32(chunk.subarray(4, 8 + data.length)), 8 + data.length);
    return Buffer.concat([buf.subarray(0, plteEnd), chunk, buf.subarray(plteEnd)]);
}

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

    // T-187 — also embed the in-game move-category icon sheet (physical/special/status, a 16×48
    // stack of three 16×16 frames) straight from the game graphics, so the docs show the real
    // category icons rather than a hand-authored copy. Sliced by background-position in the template.
    const catIcons = path.join(root, 'graphics', 'interface', 'category_icons.png');
    if (fs.existsSync(catIcons)) {
        const png = makePaletteIndex0Transparent(fs.readFileSync(catIcons));
        map['category_icons.png'] = `data:image/png;base64,${png.toString('base64')}`;
    } else {
        skipped.push('graphics/interface/category_icons.png (missing)');
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
