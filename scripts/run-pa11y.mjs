import pa11y from 'pa11y';
import { withNextDevServer } from './lib/next-server.mjs';

const urls = ['/'];

await withNextDevServer({ port: 3101 }, async (baseUrl) => {
  let failures = 0;

  for (const url of urls) {
    const target = new URL(url, baseUrl).toString();
    const result = await pa11y(target, {
      standard: 'WCAG2AA',
      timeout: 45_000,
      chromeLaunchConfig: {
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
