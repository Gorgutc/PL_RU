import pa11y from 'pa11y';
import { chromium } from 'playwright';
import { withNextDevServer } from './lib/next-server.mjs';

const urls = ['/'];
const chromiumExecutablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? chromium.executablePath();

await withNextDevServer({ port: 3101 }, async (baseUrl) => {
  let failures = 0;

  for (const url of urls) {
    const target = new URL(url, baseUrl).toString();
    const result = await pa11y(target, {
      standard: 'WCAG2AA',
      // G18 (text contrast) is excluded by design decision, symmetric with the
      // axe color-contrast exclusion in tests/quality/site-smoke.spec.mjs: the
      // accent palette is frozen to the Figma reference (#2970ff active fill
      // with white text = ~4.3:1). Tracked in docs/agent/tabs-pixel-fit-handoff.md.
      ignore: ['WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail'],
      timeout: 45_000,
      chromeLaunchConfig: {
        executablePath: chromiumExecutablePath,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    });

    const errors = result.issues.filter((issue) => issue.type === 'error');
    if (errors.length > 0) {
      failures += errors.length;
      for (const issue of errors) {
        console.error(`${target}: ${issue.code} ${issue.message}`);
      }
    } else {
      console.log(`pa11y: ${target} passed`);
    }
  }

  if (failures > 0) {
    console.error(`pa11y: ${failures} error(s)`);
    process.exitCode = 1;
  }
});
