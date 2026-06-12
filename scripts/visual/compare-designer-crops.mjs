// Compare the live app against the designer reference crops produced by
// design:crop. Both sides are clipped at the SAME formula coordinates
// (cropRegions), so any geometric drift shows up as pixel mismatch instead of
// a silent size difference. Local pixel-fit tooling: NOT part of the quality
// gates; CI keeps using check:visual with the tracked baselines.
//
// Usage: pnpm design:check [--tab=bar] [--width=1920,1280] [--sidebar=expanded]
//        [--region=top-controls] [--report-only]
// Env:   DESIGN_CHECK_BASE_URL reuses a running dev server instead of
//        spawning one on port 3102.

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { createPngAnalysisProbe } from '../check-visual-evidence.mjs';
import { withNextDevServer } from '../lib/next-server.mjs';
import {
  DESIGNER_CROPS_DIR,
  DESIGNER_DIFF_DIR,
  DESIGNER_LIVE_DIR,
  DESIGNER_REPORT_PATH,
  caseId,
  parseFilters,
  selectRefs,
  selectRegions,
  toleranceFor,
} from './designer-refs.map.mjs';

const { filters, flags } = parseFilters(process.argv.slice(2));
const refs = selectRefs(filters);

if (refs.length === 0) {
  console.error('design:check: no references match the given filters');
  process.exit(1);
}

// --disable-lcd-text normalises the capture to grayscale text antialiasing:
// the designer PNGs are Figma exports (grayscale AA), while Chromium on Windows
// defaults to subpixel (ClearType) AA whose RGB fringes exceed the per-pixel
// delta on every glyph edge. Capture-side normalisation only — the app is untouched.
const chromiumLaunchOptions = {
  args: ['--disable-lcd-text'],
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
    : {}),
};
const MOTION_SETTLE_MS = 320; // 220ms rail/grid motion + settle margin.

function pngDataUrl(file) {
  return `data:image/png;base64,${readFileSync(file).toString('base64')}`;
}

async function openTab(page, tab) {
  await page.getByRole('banner').locator(`#praios-header-tab-${tab}`).click();
  await page.waitForTimeout(MOTION_SETTLE_MS);
}

async function setSidebar(page, sidebar) {
  const rail = page.getByTestId('left-rail');
  const current = await rail.getAttribute('data-sidebar-state');
  if (current === sidebar) return;
  await page.getByTestId('left-rail-button-collapse').click();
  await page.waitForTimeout(MOTION_SETTLE_MS);
}

async function runCases(baseUrl) {
  const browser = await chromium.launch(chromiumLaunchOptions);
  const cases = [];

  try {
    const probePage = await browser.newPage();

    for (const ref of refs) {
      const context = await browser.newContext({
        deviceScaleFactor: 1,
        viewport: { height: ref.height, width: ref.width },
      });
      const page = await context.newPage();

      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      await page.evaluate(() => globalThis.document.fonts.ready);
      await openTab(page, ref.tab);
      await setSidebar(page, ref.sidebar);

      for (const region of selectRegions(ref, filters)) {
        const id = caseId(ref, region.region);
        const cropPath = path.resolve(DESIGNER_CROPS_DIR, `${id}.png`);

        if (!existsSync(cropPath)) {
          cases.push({ id, region: region.region, status: 'NO-CROP' });
          continue;
        }

        const livePath = path.resolve(DESIGNER_LIVE_DIR, `${id}.png`);
        mkdirSync(path.dirname(livePath), { recursive: true });
        await page.screenshot({
          clip: { height: region.height, width: region.width, x: region.x, y: region.y },
          path: livePath,
        });

        const tolerance = toleranceFor(ref, region.region);
        const result = await probePage.evaluate(createPngAnalysisProbe(), {
          actualDataUrl: pngDataUrl(livePath),
          operation: 'compare',
          pixelDelta: tolerance.pixelDelta,
          referenceDataUrl: pngDataUrl(cropPath),
        });

        const diffPath = path.resolve(DESIGNER_DIFF_DIR, `${id}.png`);
        mkdirSync(path.dirname(diffPath), { recursive: true });
        writeFileSync(diffPath, Buffer.from(result.diffPngBase64, 'base64'));

        if (
          result.referenceWidth !== result.actualWidth ||
          result.referenceHeight !== result.actualHeight
        ) {
          cases.push({
            dims: `crop=${result.referenceWidth}x${result.referenceHeight} live=${result.actualWidth}x${result.actualHeight}`,
            id,
            region: region.region,
            status: 'DIM-MISMATCH',
          });
          continue;
        }

        const pass = result.mismatchRatio <= tolerance.maxMismatchRatio;
        cases.push({
          diff: `${DESIGNER_DIFF_DIR}/${id}.png`,
          dims: `${result.width}x${result.height}`,
          id,
          mismatchRatio: Number(result.mismatchRatio.toFixed(6)),
          mismatchedPixels: result.mismatchedPixels,
          region: region.region,
          status: pass ? 'PASS' : 'FAIL',
          tolerance,
        });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  return cases;
}

async function main() {
  const baseUrl = process.env.DESIGN_CHECK_BASE_URL;
  const cases = baseUrl
    ? await runCases(baseUrl)
    : await withNextDevServer({ port: 3102 }, (url) => runCases(url));

  mkdirSync(path.dirname(path.resolve(DESIGNER_REPORT_PATH)), { recursive: true });
  writeFileSync(
    path.resolve(DESIGNER_REPORT_PATH),
    JSON.stringify({ cases, filters: process.argv.slice(2) }, null, 2),
  );

  if (cases.length === 0) {
    console.error('design:check: filters selected zero region cases — check --region/--tab values');
    process.exitCode = 1;
    return;
  }

  const failed = cases.filter((entry) => entry.status !== 'PASS');

  for (const entry of cases) {
    const ratio = entry.mismatchRatio == null ? '' : ` mismatch=${entry.mismatchRatio}`;
    console.log(`design:check ${entry.status} ${entry.id}${ratio}`);
  }
  console.log(
    `design:check: ${cases.length - failed.length}/${cases.length} PASS, report: ${DESIGNER_REPORT_PATH}`,
  );

  if (failed.length > 0 && !flags.reportOnly) process.exitCode = 1;
}

await main();
