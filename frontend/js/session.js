/**
 * Session bundle schema and assembly.
 *
 * Format version 1 — canonical for both download and future server request.
 *
 * sharedModules sentinel rules:
 *   >= 2 → roms[i].artifacts.pokedex  = "shared"
 *   >= 3 → roms[i].artifacts.trainers = "shared"
 *   >= 4 → roms[i].artifacts.starters = "shared"
 *   >= 5 → roms[i].artifacts.wild     = "shared"
 *   all others: null (server generates per-ROM)
 */

/**
 * Build a session bundle from a validated config object.
 * sharedArtifacts and roms[].artifacts are empty/null now —
 * the server will fill them in when /api/randomize is implemented.
 */
export function buildBundle(config) {
    const { numROMs, sharedModules } = config;

    const roms = Array.from({ length: numROMs }, (_, i) => ({
        romIndex: i,
        artifacts: {
            pokedex:  sharedModules >= 2 ? 'shared' : null,
            trainers: sharedModules >= 3 ? 'shared' : null,
            starters: sharedModules >= 4 ? 'shared' : null,
            wild:     sharedModules >= 5 ? 'shared' : null,
        },
    }));

    return {
        formatVersion: 1,
        generatedAt: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
        config: { ...config },
        sharedArtifacts: {
            pokedex:  null,
            trainers: null,
            starters: null,
            wild:     null,
        },
        roms,
    };
}

/**
 * Trigger a browser download of the session bundle JSON.
 */
export function downloadBundle(bundle) {
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-bundle-${bundle.config.seed}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Trigger a browser download of just the config portion.
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

/**
 * Read an uploaded JSON file and return the parsed object.
 * @param {File} file
 * @returns {Promise<object>}
 */
export function readJsonFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                resolve(JSON.parse(e.target.result));
            } catch {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsText(file);
    });
}

/**
 * Extract the config from an uploaded file.
 * Accepts either a raw config object or a full session bundle.
 */
export function extractConfig(parsed) {
    if (parsed && parsed.formatVersion !== undefined && parsed.config) {
        return parsed.config;
    }
    return parsed;
}
