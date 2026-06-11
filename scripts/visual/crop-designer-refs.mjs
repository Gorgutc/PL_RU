// Crop the chrome regions (header / rail / top-controls / bottom-panel) out of
// the local designer reference PNGs into ignored reports/visual-qa/ artifacts.
// Local pixel-fit tooling: NOT part of the quality gates (the folder only
// exists on the designer-handoff machine; CI keeps using check:visual with
// the tracked self-captured baselines).
//
// Usage: pnpm design:crop [--tab=map,bar] [--width=1920] [--sidebar=collapsed]
//        [--region=top-controls]

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { createPngAnalysisProbe } from '../check-visual-evidence.mjs';
import {
  DESIGNER_CROPS_DIR,
  DESIGNER_REFS_DIR_ENV,
  caseId,
  designerRefPath,
  parseFilters,
  resolveDesignerRefsDir,
  selectRefs,
  selectRegions,
} from './designer-refs.map.mjs';

const { filters } = parseFilters(process.argv.slice(2));
const refsDir = resolveDesignerRefsDir();

if (!existsSync(refsDir)) {
  console.error(
    `design:crop: designer reference folder not found: ${refsDir}\n` +
      `Set ${DESIGNER_REFS_DIR_ENV} to the folder with the 24 reference PNGs.`,
  );
  process.exit(1);
}

const refs = selectRefs(filters);
const missing = refs.filter((ref) => !existsSync(designerRefPath(ref)));

if (missing.length > 0) {
  console.error(`design:crop: ${missing.length} reference file(s) missing in ${refsDir}:`);
  for (const ref of missing) console.error(`  - ${ref.id}: ${ref.file}`);
  process.exit(1);
}

if (refs.length === 0) {
  console.error('design:crop: no references match the given filters');
  process.exit(1);
}

const chromiumLaunchOptions = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
  : {};
const outDir = path.resolve(DESIGNER_CROPS_DIR);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch(chromiumLaunchOptions);

try {
  const page = await browser.newPage();
  let written = 0;

  for (const ref of refs) {
    const dataUrl = `data:image/png;base64,${readFileSync(designerRefPath(ref)).toString('base64')}`;

    for (const region of selectRegions(ref, filters)) {
      const result = await page.evaluate(createPngAnalysisProbe(), {
        actualDataUrl: dataUrl,
        operation: 'crop',
        region,
      });

      if (result.sourceWidth !== ref.width || result.sourceHeight !== ref.height) {
        console.error(
          `design:crop: ${ref.id} unexpected source size ${result.sourceWidth}x${result.sourceHeight}, expected ${ref.width}x${ref.height}`,
        );
        process.exitCode = 1;
        continue;
      }

      const file = path.join(outDir, `${caseId(ref, region.region)}.png`);
      writeFileSync(file, Buffer.from(result.pngBase64, 'base64'));
      written += 1;
    }
  }

  if (written === 0) {
    console.error('design:crop: filters selected zero region cases — check --region/--tab values');
    process.exitCode = 1;
  } else {
    console.log(`design:crop: wrote ${written} crop(s) to ${DESIGNER_CROPS_DIR}`);
  }
} finally {
  await browser.close();
}
