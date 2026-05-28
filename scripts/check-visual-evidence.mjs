import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const defaultEvidencePaths = ['tests/visual-qa/latest.json', 'reports/visual-qa/latest.json'];
const baseRef = process.env.VISUAL_QA_BASE_REF ?? 'origin/main';
const explicitEvidencePath = process.env.VISUAL_QA_EVIDENCE;
const forceRequired = process.env.VISUAL_QA_REQUIRED === '1';
const allowMissingBaseRef = process.env.VISUAL_QA_ALLOW_MISSING_BASE === '1';

export const visualQaContract = Object.freeze({
  baseDiffFailureMode: 'fail-closed-unless-VISUAL_QA_ALLOW_MISSING_BASE',
  changeSources: ['base-diff', 'unstaged-worktree', 'staged-index', 'untracked-files'],
  diffArtifactPathPrefixes: ['reports/visual-qa/', 'test-results/visual-qa/'],
  pixelComparisonEngine: 'playwright-canvas-png-diff',
  requiredPixelCaseFields: ['name', 'viewport', 'state', 'referencePath', 'actualPath', 'diffPath'],
});

function formatGitError(error) {
  if (error instanceof Error && 'stderr' in error && Buffer.isBuffer(error.stderr)) {
    return error.stderr.toString('utf8').trim();
  }

  return error instanceof Error ? error.message : String(error);
}

function runGit(args, { allowFailure = false } = {}) {
  try {
    const files = execFileSync('git', args, { cwd: root, encoding: 'utf8' })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return { files, ok: true };
  } catch (error) {
    if (allowFailure) return { files: [], ok: false };

    throw new Error(`git ${args.join(' ')} failed: ${formatGitError(error)}`);
  }
}

function normalizeFile(file) {
  return file.replaceAll('\\', '/');
}

function unique(files) {
  return [...new Set(files.map(normalizeFile))].sort((a, b) => a.localeCompare(b));
}

function getChangedFiles() {
  const baseDiff = runGit(['diff', '--name-only', `${baseRef}...HEAD`], {
    allowFailure: allowMissingBaseRef,
  });

  if (!baseDiff.ok) {
    console.warn(
      `visual-qa: WARN - base ref ${baseRef} unavailable; VISUAL_QA_ALLOW_MISSING_BASE=1 enabled local fallback`,
    );
  }

  return unique([
    ...baseDiff.files,
    ...runGit(['diff', '--name-only']).files,
    ...runGit(['diff', '--name-only', '--cached']).files,
    ...runGit(['ls-files', '--others', '--exclude-standard']).files,
  ]);
}

function isUiSurface(file) {
  return (
    /^src\/.*\.(ts|tsx|scss)$/.test(file) ||
    /^tests\/e2e\/.*\.(ts|tsx|mjs)$/.test(file) ||
    /^tests\/quality\/.*\.(ts|tsx|mjs)$/.test(file) ||
    /^playwright(\.|-).*\.(ts|mjs)$/.test(file)
  );
}

function findEvidencePath() {
  const candidates = explicitEvidencePath ? [explicitEvidencePath] : defaultEvidencePaths;
  return candidates.find((candidate) => existsSync(path.resolve(root, candidate))) ?? null;
}

function readEvidence(file) {
  return JSON.parse(readFileSync(path.resolve(root, file), 'utf8'));
}

function metricOnlyFallbackAccepted(evidence) {
  return (
    evidence.referenceUnavailable === true &&
    evidence.metricOnlyFallbackAcceptedByCurrentUser === true
  );
}

function resolveWorkspacePath(file, label) {
  if (typeof file !== 'string' || file.length === 0) {
    throw new Error(`${label} must be a non-empty workspace-relative path`);
  }

  const resolved = path.resolve(root, file);
  const relative = path.relative(root, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the repository: ${file}`);
  }

  return resolved;
}

function relativeWorkspacePath(file) {
  return normalizeFile(path.relative(root, file));
}

function isTrackedFile(file) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', '--', file], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function resolveDiffArtifactPath(file, label) {
  const resolved = resolveWorkspacePath(file, label);
  const relative = relativeWorkspacePath(resolved);
  const allowed = visualQaContract.diffArtifactPathPrefixes.some((prefix) =>
    relative.startsWith(prefix),
  );

  if (!allowed) {
    throw new Error(
      `${label} must stay under one of: ${visualQaContract.diffArtifactPathPrefixes.join(', ')}`,
    );
  }
  if (isTrackedFile(relative)) {
    throw new Error(`${label} must not overwrite a tracked file: ${relative}`);
  }

  return resolved;
}

function getTolerance(evidence, testCase) {
  const globalTolerance = evidence.tolerance;
  const globalObject =
    typeof globalTolerance === 'number'
      ? { maxMismatchRatio: globalTolerance }
      : (globalTolerance ?? {});

  const maxMismatchRatio =
    testCase.maxMismatchRatio ?? globalObject.maxMismatchRatio ?? globalObject.maxMismatchPercent;
  const maxMismatchedPixels = testCase.maxMismatchedPixels ?? globalObject.maxMismatchedPixels;
  const pixelDelta = testCase.pixelDelta ?? globalObject.pixelDelta ?? 0;

  return {
    pixelDelta,
    maxMismatchRatio: maxMismatchRatio ?? (maxMismatchedPixels == null ? 0 : null),
    maxMismatchedPixels,
  };
}

function validateNumber(value, label, failures, { min = 0, max = Number.POSITIVE_INFINITY } = {}) {
  if (value == null) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    failures.push(`${label} must be a finite number between ${min} and ${max}`);
  }
}

function validateEvidence(evidence) {
  const failures = [];
  const cases = evidence.pixelComparison?.cases;
  const fallbackAccepted = metricOnlyFallbackAccepted(evidence);

  if (evidence.status !== 'PASS') failures.push('status must be PASS');
  if (!evidence.taskScope) failures.push('taskScope is required');
  if (!Array.isArray(evidence.references) || evidence.references.length === 0) {
    failures.push('references must list the PNG reference sources');
  }
  if (!Array.isArray(evidence.viewports) || evidence.viewports.length === 0) {
    failures.push('viewports must list every checked viewport');
  }
  if (!Array.isArray(evidence.states) || evidence.states.length === 0) {
    failures.push('states must list every checked UI state');
  }
  if (evidence.pixelComparison?.status !== 'PASS') {
    failures.push('pixelComparison.status must be PASS');
  }
  if (evidence.pixelComparison?.tool == null) {
    failures.push('pixelComparison.tool is required');
  }
  if (evidence.tolerance == null) failures.push('tolerance is required');
  if (!Array.isArray(evidence.mismatchedAreas)) {
    failures.push('mismatchedAreas must be an array, even when empty');
  }
  if (evidence.domCssMetrics?.status !== 'PASS') {
    failures.push('domCssMetrics.status must be PASS');
  }
  if (evidence.referenceUnavailable === true && !fallbackAccepted) {
    failures.push('inaccessible references require explicit current-user metric-only fallback');
  }
  if (!fallbackAccepted && (!Array.isArray(cases) || cases.length === 0)) {
    failures.push('pixelComparison.cases must list screenshot/reference PNG pairs');
  }

  if (Array.isArray(cases)) {
    cases.forEach((testCase, index) => {
      const label = `pixelComparison.cases[${index}]`;

      for (const key of visualQaContract.requiredPixelCaseFields) {
        if (typeof testCase[key] !== 'string' || testCase[key].length === 0) {
          failures.push(`${label}.${key} is required`);
        }
      }
      if (typeof testCase.diffPath === 'string' && testCase.diffPath.length > 0) {
        try {
          resolveDiffArtifactPath(testCase.diffPath, `${label}.diffPath`);
        } catch (error) {
          failures.push(error instanceof Error ? error.message : String(error));
        }
      }
      if (Array.isArray(evidence.viewports) && !evidence.viewports.includes(testCase.viewport)) {
        failures.push(`${label}.viewport must be listed in viewports`);
      }
      if (Array.isArray(evidence.states) && !evidence.states.includes(testCase.state)) {
        failures.push(`${label}.state must be listed in states`);
      }

      const tolerance = getTolerance(evidence, testCase);
      validateNumber(tolerance.pixelDelta, `${label}.pixelDelta`, failures, { min: 0, max: 255 });
      validateNumber(tolerance.maxMismatchRatio, `${label}.maxMismatchRatio`, failures, {
        min: 0,
        max: 1,
      });
      validateNumber(tolerance.maxMismatchedPixels, `${label}.maxMismatchedPixels`, failures, {
        min: 0,
      });
    });
  }

  return failures;
}

function imageDataUrl(file) {
  return `data:image/png;base64,${readFileSync(file).toString('base64')}`;
}

async function comparePngPair(page, testCase, tolerance) {
  const referencePath = resolveWorkspacePath(
    testCase.referencePath,
    `${testCase.name}.referencePath`,
  );
  const actualPath = resolveWorkspacePath(testCase.actualPath, `${testCase.name}.actualPath`);
  const diffPath = resolveDiffArtifactPath(testCase.diffPath, `${testCase.name}.diffPath`);

  if (!existsSync(referencePath)) {
    return [`${testCase.name}: referencePath does not exist (${testCase.referencePath})`];
  }
  if (!existsSync(actualPath)) {
    return [`${testCase.name}: actualPath does not exist (${testCase.actualPath})`];
  }

  const result = await page.evaluate(
    async ({ actualDataUrl, pixelDelta, referenceDataUrl }) => {
      function loadImage(source) {
        return new Promise((resolve, reject) => {
          const image = new globalThis.Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error(`Unable to decode PNG: ${source.slice(0, 32)}`));
          image.src = source;
        });
      }

      function getImageData(image, width, height) {
        const canvas = globalThis.document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, width, height).data;
      }

      const [referenceImage, actualImage] = await Promise.all([
        loadImage(referenceDataUrl),
        loadImage(actualDataUrl),
      ]);
      const width = Math.max(referenceImage.naturalWidth, actualImage.naturalWidth);
      const height = Math.max(referenceImage.naturalHeight, actualImage.naturalHeight);
      const totalPixels = width * height;
      const referencePixels = getImageData(referenceImage, width, height);
      const actualPixels = getImageData(actualImage, width, height);
      const diffCanvas = globalThis.document.createElement('canvas');
      diffCanvas.width = width;
      diffCanvas.height = height;
      const diffContext = diffCanvas.getContext('2d');
      const diffImage = diffContext.createImageData(width, height);
      let mismatchedPixels = 0;

      for (let offset = 0; offset < referencePixels.length; offset += 4) {
        const delta = Math.max(
          Math.abs(referencePixels[offset] - actualPixels[offset]),
          Math.abs(referencePixels[offset + 1] - actualPixels[offset + 1]),
          Math.abs(referencePixels[offset + 2] - actualPixels[offset + 2]),
          Math.abs(referencePixels[offset + 3] - actualPixels[offset + 3]),
        );

        if (delta > pixelDelta) {
          mismatchedPixels += 1;
          diffImage.data[offset] = 255;
          diffImage.data[offset + 1] = 0;
          diffImage.data[offset + 2] = 255;
          diffImage.data[offset + 3] = 255;
        } else {
          diffImage.data[offset] = 0;
          diffImage.data[offset + 1] = 0;
          diffImage.data[offset + 2] = 0;
          diffImage.data[offset + 3] = 0;
        }
      }

      diffContext.putImageData(diffImage, 0, 0);

      return {
        actualHeight: actualImage.naturalHeight,
        actualWidth: actualImage.naturalWidth,
        diffPngBase64: diffCanvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''),
        height,
        mismatchedPixels,
        mismatchRatio: totalPixels === 0 ? 1 : mismatchedPixels / totalPixels,
        referenceHeight: referenceImage.naturalHeight,
        referenceWidth: referenceImage.naturalWidth,
        totalPixels,
        width,
      };
    },
    {
      actualDataUrl: imageDataUrl(actualPath),
      pixelDelta: tolerance.pixelDelta,
      referenceDataUrl: imageDataUrl(referencePath),
    },
  );

  mkdirSync(path.dirname(diffPath), { recursive: true });
  writeFileSync(diffPath, Buffer.from(result.diffPngBase64, 'base64'));

  const failures = [];

  if (
    result.referenceWidth !== result.actualWidth ||
    result.referenceHeight !== result.actualHeight
  ) {
    failures.push(
      `${testCase.name}: dimensions differ reference=${result.referenceWidth}x${result.referenceHeight} actual=${result.actualWidth}x${result.actualHeight}`,
    );
  }
  if (
    tolerance.maxMismatchedPixels != null &&
    result.mismatchedPixels > tolerance.maxMismatchedPixels
  ) {
    failures.push(
      `${testCase.name}: mismatchedPixels=${result.mismatchedPixels} > maxMismatchedPixels=${tolerance.maxMismatchedPixels}`,
    );
  }
  if (tolerance.maxMismatchRatio != null && result.mismatchRatio > tolerance.maxMismatchRatio) {
    failures.push(
      `${testCase.name}: mismatchRatio=${result.mismatchRatio.toFixed(6)} > maxMismatchRatio=${tolerance.maxMismatchRatio}`,
    );
  }

  if (failures.length === 0) {
    console.log(
      `visual-qa: compared ${testCase.name} ${result.width}x${result.height} mismatchedPixels=${result.mismatchedPixels} mismatchRatio=${result.mismatchRatio.toFixed(6)}`,
    );
  }

  return failures;
}

async function validatePixelComparison(evidence) {
  if (metricOnlyFallbackAccepted(evidence)) {
    console.log('visual-qa: metric-only fallback accepted by current user; pixel compare skipped');
    return [];
  }

  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const failures = [];

  try {
    const page = await browser.newPage();

    for (const testCase of evidence.pixelComparison.cases) {
      failures.push(...(await comparePngPair(page, testCase, getTolerance(evidence, testCase))));
    }
  } finally {
    await browser.close();
  }

  return failures;
}

async function main() {
  const changedFiles = getChangedFiles();
  const uiFiles = changedFiles.filter(isUiSurface);
  const visualQaRequired = forceRequired || uiFiles.length > 0;

  if (!visualQaRequired) {
    console.log('visual-qa: PASS - no UI surface changed in base/worktree/staged/untracked diff');
    process.exit(0);
  }

  const evidencePath = findEvidencePath();

  if (!evidencePath) {
    console.error(
      [
        'visual-qa: FAIL - UI surface changed but no visual QA evidence JSON was found.',
        `checked paths: ${explicitEvidencePath ?? defaultEvidencePaths.join(', ')}`,
        `changed UI files: ${uiFiles.join(', ')}`,
      ].join('\n'),
    );
    process.exit(1);
  }

  const evidence = readEvidence(evidencePath);
  const failures = validateEvidence(evidence);

  if (failures.length === 0) {
    failures.push(...(await validatePixelComparison(evidence)));
  }

  if (failures.length > 0) {
    console.error(`visual-qa: FAIL - ${evidencePath}`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`visual-qa: PASS - ${evidencePath}`);
}

main().catch((error) => {
  console.error(`visual-qa: FAIL - ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
