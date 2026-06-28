import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// B-004: Docker Compose's env_file does NOT strip inline comments — everything after
// `=` becomes the value. A line like `BREVO_API_KEY=  # ...` makes the key non-empty
// garbage (and the `→` in that comment crashed email sending). Guard against it.
test('deploy/.env.example has no inline comments on KEY=value lines (B-004)', () => {
  const txt = fs.readFileSync(path.join(root, 'deploy', '.env.example'), 'utf8');
  const offenders = txt
    .split('\n')
    .filter((l) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(l)) // KEY=... lines (not pure comments)
    .filter((l) => l.includes('#'));                   // ...carrying an inline comment
  assert.deepEqual(offenders, [], `inline comments leak into env_file values:\n${offenders.join('\n')}`);
});
