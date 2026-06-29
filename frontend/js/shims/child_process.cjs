'use strict';
const noop = () => { throw new Error('child_process is not available in the browser'); };
module.exports = { exec: noop, execSync: noop, spawn: noop };
