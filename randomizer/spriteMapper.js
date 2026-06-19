'use strict';

/**
 * spriteMapper — pure logic for mapping committed C source to local sprite files.
 *
 * Chain (T-001):
 *   src/data/pokemon/species_info/gen_*_families.h : [SPECIES_X] { .frontPic = gMonFrontPic_Y }
 *   src/data/graphics/pokemon.h                    : gMonFrontPic_Y[] = INCBIN(..."graphics/.../anim_front.4bpp.smol")
 *   -> swap the compiled-asset suffix for .png to get the source PNG path.
 *
 * No filesystem I/O lives here so the logic is unit-testable; generateSprites.js
 * does the reading/cropping/writing.
 */

// Turn a compiled INCBIN asset path into its source .png path.
// e.g. graphics/pokemon/bulbasaur/anim_front.4bpp.smol -> graphics/pokemon/bulbasaur/anim_front.png
function incbinPathToPng(assetPath) {
    return assetPath.replace(/\.(4bpp|8bpp|1bpp)?(\.(smol|lz))?$/i, '') + '.png';
}

// Parse pokemon.h into Map<symbol, sourcePngPath>, keeping only gMonFrontPic_* symbols
// and preferring the non-GBA art (paths containing `_gba` are skipped).
function parseFrontPicSymbols(pokemonHText) {
    const map = new Map();
    const re = /const\s+u\d+\s+(gMonFrontPic_\w+)\s*\[\s*\]\s*=\s*INCBIN_\w+\(\s*"([^"]+)"\s*\)/g;
    let m;
    while ((m = re.exec(pokemonHText)) !== null) {
        const [, symbol, assetPath] = m;
        if (/_gba\b/i.test(assetPath)) continue; // GBA-style variant of an already-captured symbol
        if (!map.has(symbol)) map.set(symbol, incbinPathToPng(assetPath));
    }
    return map;
}

// Parse a gen_*_families.h into [{ species, symbol }] for every species that declares a .frontPic.
// Slices the text on `[SPECIES_X]` boundaries so it is robust to inner braces
// (e.g. `.abilities = { ... }`) and to single- vs multi-line formatting.
function parseSpeciesFrontPic(genText) {
    const out = [];
    const heads = [...genText.matchAll(/\[(SPECIES_\w+)\]\s*=/g)];
    for (let i = 0; i < heads.length; i++) {
        const species = heads[i][1];
        const start = heads[i].index;
        const end = i + 1 < heads.length ? heads[i + 1].index : genText.length;
        const slice = genText.slice(start, end);
        const fp = slice.match(/\.frontPic\s*=\s*(gMonFrontPic_\w+)/);
        if (fp) out.push({ species, symbol: fp[1] });
    }
    return out;
}

// Combine the gen-family species->symbol links with the symbol->path table.
// Returns { map: Map<SPECIES_X, sourcePngPath>, unresolved: SPECIES_X[] }.
function buildSpeciesSpriteMap(genTexts, pokemonHText) {
    const symbols = parseFrontPicSymbols(pokemonHText);
    const map = new Map();
    const unresolved = [];
    for (const genText of genTexts) {
        for (const { species, symbol } of parseSpeciesFrontPic(genText)) {
            const pngPath = symbols.get(symbol);
            if (pngPath) map.set(species, pngPath);
            else unresolved.push(species);
        }
    }
    return { map, unresolved };
}

// Output filename stem for a species sprite: SPECIES_VENUSAUR_MEGA -> VENUSAUR_MEGA
function speciesKey(speciesConst) {
    return speciesConst.replace(/^SPECIES_/, '');
}

// Trainer display class -> local front_pics filename stem.
// 'Leader Roxanne' -> 'leader_roxanne', 'Aqua Admin F' -> 'aqua_admin_f'
function trainerClassToFile(className) {
    return className.toLowerCase().replace(/\s+/g, '_');
}

// Extract the trainer class names from the `trainerClasses = [ '...', ... ]`
// array in template.html, so the generator can report which docs classes have
// no local sprite. Returns [] if the block is absent.
function parseTrainerClasses(templateHtml) {
    const block = templateHtml.match(/trainerClasses\s*=\s*\[([\s\S]*?)\]/);
    if (!block) return [];
    return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

module.exports = {
    incbinPathToPng,
    parseFrontPicSymbols,
    parseSpeciesFrontPic,
    buildSpeciesSpriteMap,
    speciesKey,
    trainerClassToFile,
    parseTrainerClasses,
};
