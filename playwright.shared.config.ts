import { devices, type PlaywrightTestConfig } from '@playwright/test';

// Every Playwright browser check (e2e, quality, pa11y, visual) runs Playwright's
// lockfile-pinned bundled Chromium — installed in CI via
// `playwright install --with-deps chromium` — NOT the runner's system Google
// Chrome. The 2026-06 runner image auto-bumped Chrome 148 -> 149 and its wider
// font metrics broke the top-controls fitting + visual gates with zero repo
// changes. Setting no `channel` lets the chromium project launch the bundled
// browser, matching the pa11y/visual/verify-frozen launch paths and local dev.
const sharedConfig = {
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
} satisfies Omit<PlaywrightTestConfig, 'testDir'>;

export function createPlaywrightConfig(testDir: PlaywrightTestConfig['testDir']) {
  return {
    testDir,
    ...sharedConfig,
  } satisfies PlaywrightTestConfig;
}
