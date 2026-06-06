import { devices, type PlaywrightTestConfig } from '@playwright/test';

const ciChromeChannel = process.env.CI ? ({ channel: 'chrome' } as const) : {};

const sharedConfig = {
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    ...ciChromeChannel,
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
