/**
 * Resolve a bundle artifact sentinel to the actual object.
 * Handles: "shared"/"global" → sharedData[key], "player-N" → sharedData.players[N][key], or pass-through.
 */
export function resolveArtifact(value, sharedData, key) {
    if (value === 'shared' || value === 'global') return sharedData[key];
    if (typeof value === 'string' && value.startsWith('player-')) {
        const playerIndex = parseInt(value.split('-')[1], 10);
        return sharedData.players[playerIndex][key];
    }
    return value;
}

/**
 * Config import/export helpers for Step 1.
 * The session bundle is generated entirely in the browser (randomizer-worker.js).
 */

export function downloadConfig(config) {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'randomizer-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function readJsonFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try { resolve(JSON.parse(e.target.result)); }
            catch { reject(new Error('Invalid JSON file')); }
        };
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsText(file);
    });
}

/**
 * Extract the config portion from an uploaded file.
 * Accepts either a raw config object or a full session bundle.
 */
export function extractConfig(parsed) {
    if (parsed && parsed.formatVersion !== undefined && parsed.config) {
        return parsed.config;
    }
    return parsed;
}

/**
 * True when `parsed` is a full session bundle (not just a raw config): it carries the
 * contract version, a non-empty roms array and its config. Used by the "regenerate ROMs
 * from a bundle" flow (T-190), which needs the WHOLE bundle, unlike Load-config which only
 * reads `.config`.
 */
export function isFullBundle(parsed) {
    return !!parsed && typeof parsed === 'object'
        && parsed.formatVersion !== undefined
        && Array.isArray(parsed.roms) && parsed.roms.length > 0
        && !!parsed.config && typeof parsed.config === 'object';
}
