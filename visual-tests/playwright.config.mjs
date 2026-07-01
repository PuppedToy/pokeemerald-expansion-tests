import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3100);
const BASE_URL = `http://localhost:${PORT}`;

// One project per viewport (see screens.mjs VIEWPORTS). Playwright appends the project name to
// each snapshot file, so the same test yields a per-viewport baseline. The **desktop** baselines
// are the "desktop must not change" lock (T-040); mobile/tablet baselines evolve as we implement
// and are refreshed with `npm run visual:update` after visual review.
const VIEWPORTS = [
  { name: 'phone-sm',       width: 360,  height: 640 },
  { name: 'mobile',         width: 375,  height: 667 },
  { name: 'ipad-portrait',  width: 768,  height: 1024 },
  { name: 'ipad-landscape', width: 1024, height: 768 },
  { name: 'desktop',        width: 1440, height: 900 },
];

export default defineConfig({
  testDir: __dirname,
  testMatch: '*.spec.mjs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  expect: {
    toHaveScreenshot: {
      // Retro pixel-art UI is high-contrast; allow a hair of AA noise but flag real diffs.
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL: BASE_URL,
    deviceScaleFactor: 1,
  },
  projects: VIEWPORTS.map((v) => ({
    name: v.name,
    use: { viewport: { width: v.width, height: v.height } },
  })),
  webServer: {
    command: `node ${path.join(ROOT, 'backend', 'server.js')}`,
    url: BASE_URL + '/',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    env: { PORT: String(PORT), FAKE_BUILD: '1', NODE_ENV: 'development' },
  },
});
