// Browser stub for Node's 'fs' module.
//
// Historically a pure stub: every method in the randomizer is guarded by an IS_NODE check, so this only
// had to satisfy the static require().
//
// T-249 gave it one real job. The injector reads the base's own sources through
// randomizer/injector/sources.js, but a few of the compile-path modules it reuses read a file at MODULE
// LOAD time — `randomizer/layout.js` parses `include/constants/randomizer_layout.h` for the table
// capacities, and five writers destructure those the moment they are imported. There is no seam to thread
// through an import, and re-typing the numbers into JS is exactly what T-237 forbade.
//
// So the injector Worker registers the baked base sources here BEFORE requiring the injector graph, and
// this stub answers those load-time reads from the same artifact everything else uses — one copy of the
// data, no second home. Nothing is writable, and a path the artifact does not carry still throws.
'use strict';

const noop = () => { throw new Error('fs is not available in the browser'); };

// repo-relative path → text, as baked by buildOffsetMap.js --sources (see randomizer/injector/sources.js).
let virtualFiles = new Map();

/**
 * Register the baked base sources as the files this stub can serve (T-249).
 *
 * @param {Object<string,string>|Map<string,string>} files  keyed by repo-relative path
 */
function setVirtualFiles(files) {
    virtualFiles = files instanceof Map ? new Map(files) : new Map(Object.entries(files || {}));
}

/**
 * Which baked file a requested path means.
 *
 * The paths that reach here are built with the `path` shim (`path.resolve(__dirname, '..', 'include', …)`),
 * so they are absolute-looking nonsense with a meaningful TAIL: `/randomizer/../include/constants/x.h`.
 * Matching on the repo-relative suffix is what makes them resolvable at all. Longest key first, so
 * `data/maps/X/map.json` can never be shadowed by a shorter key that happens to also end the path.
 */
function resolveVirtual(filePath) {
    const wanted = String(filePath).replace(/\\/g, '/');
    let best = null;
    for (const key of virtualFiles.keys()) {
        if (wanted === key || wanted.endsWith(`/${key}`)) {
            if (!best || key.length > best.length) best = key;
        }
    }
    return best;
}

function readFileSync(filePath, encoding) {
    const key = resolveVirtual(filePath);
    if (key === null) {
        throw new Error(
            `fs is not available in the browser: '${filePath}' is not one of the ${virtualFiles.size} baked ` +
            `base source(s). Add it to BASE_SOURCE_FILES in randomizer/injector/sources.js and rebuild the ` +
            `base-sources artifact (T-249).`);
    }
    const text = virtualFiles.get(key);
    // Callers that ask for bytes get bytes; everything reaching here today asks for utf8.
    if (encoding === undefined || encoding === null) return new TextEncoder().encode(text);
    return text;
}

module.exports = {
    setVirtualFiles,
    readFile:        noop,
    writeFile:       noop,
    readFileSync,
    writeFileSync:   noop,
    stat:            noop,
    statSync:        noop,
    mkdirSync:       noop,
    existsSync:      (filePath) => resolveVirtual(filePath) !== null,
    promises: {
        readFile:  noop,
        writeFile: noop,
        stat:      noop,
    },
};
