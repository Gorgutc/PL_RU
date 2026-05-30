import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const trackedDefaultEvidencePath = 'tests/visual-qa/latest.json';
const defaultEvidencePaths = [trackedDefaultEvidencePath, 'reports/visual-qa/latest.json'];
const baseRef = process.env.VISUAL_QA_BASE_REF ?? 'origin/main';
const explicitEvidencePath = process.env.VISUAL_QA_EVIDENCE;
const visualQaBaseUrl = process.env.VISUAL_QA_BASE_URL ?? 'http://localhost:3000';
const forceRequired = process.env.VISUAL_QA_REQUIRED === '1';
const allowMissingBaseRef = process.env.VISUAL_QA_ALLOW_MISSING_BASE === '1';

export const visualQaContract = Object.freeze({
  baseDiffFailureMode: 'fail-closed-unless-VISUAL_QA_ALLOW_MISSING_BASE',
  changeSources: ['base-diff', 'unstaged-worktree', 'staged-index', 'untracked-files'],
  diffArtifactPathPrefixes: ['reports/visual-qa/', 'test-results/visual-qa/'],
  pixelComparisonEngine: 'playwright-canvas-png-diff',
  screenshotCaptureEngine: 'playwright-live-app-screenshot',
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

function getChangedFileSources() {
  const baseDiff = runGit(['diff', '--name-only', `${baseRef}...HEAD`], {
    allowFailure: allowMissingBaseRef,
  });

  if (!baseDiff.ok) {
    console.warn(
      `visual-qa: WARN - base ref ${baseRef} unavailable; VISUAL_QA_ALLOW_MISSING_BASE=1 enabled local fallback`,
    );
  }

  const sources = {
    'base-diff': baseDiff.files,
    'unstaged-worktree': runGit(['diff', '--name-only']).files,
    'staged-index': runGit(['diff', '--name-only', '--cached']).files,
    'untracked-files': runGit(['ls-files', '--others', '--exclude-standard']).files,
  };

  return {
    ...sources,
    all: unique([
      ...sources['base-diff'],
      ...sources['unstaged-worktree'],
      ...sources['staged-index'],
      ...sources['untracked-files'],
    ]),
  };
}

function isUiSurface(file) {
  return (
    /^src\/.*\.(ts|tsx|scss)$/.test(file) ||
    /^tests\/e2e\/.*\.(ts|tsx|mjs)$/.test(file) ||
    /^tests\/quality\/.*\.(ts|tsx|mjs)$/.test(file) ||
    /^playwright(\.|-).*\.(ts|mjs)$/.test(file)
  );
}

export function selectEvidencePath({
  candidates = defaultEvidencePaths,
  exists = (candidate) => existsSync(path.resolve(root, candidate)),
  explicitEvidencePath,
  isTrackedFile: isTracked = isTrackedFile,
  requireTrackedTestsManifest = false,
} = {}) {
  const explicit = typeof explicitEvidencePath === 'string' && explicitEvidencePath.length > 0;
  const selected = (explicit ? [explicitEvidencePath] : candidates).find((candidate) =>
    exists(candidate),
  );

  if (selected == null) return null;

  if (requireTrackedTestsManifest && !explicit) {
    const normalizedSelected = normalizeFile(selected);

    if (normalizedSelected !== trackedDefaultEvidencePath) {
      throw new Error(
        [
          'base-diff UI changes require CI-visible visual evidence at',
          trackedDefaultEvidencePath,
          'or an explicit VISUAL_QA_EVIDENCE override;',
          `default ignored evidence is not accepted: ${selected}`,
        ].join(' '),
      );
    }
    if (!isTracked(normalizedSelected)) {
      throw new Error(
        `base-diff UI changes require tracked visual evidence: ${trackedDefaultEvidencePath}`,
      );
    }
  }

  return selected;
}

function findEvidencePath({ requireTrackedTestsManifest = false } = {}) {
  return selectEvidencePath({
    explicitEvidencePath,
    requireTrackedTestsManifest,
  });
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

function resolveVisualArtifactPath(file, label) {
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

function resolveDiffArtifactPath(file, label) {
  return resolveVisualArtifactPath(file, label);
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

function validateCapture(testCase, label, failures) {
  if (testCase.capture == null) return;

  const { capture } = testCase;

  if (typeof capture !== 'object' || Array.isArray(capture)) {
    failures.push(`${label}.capture must be an object`);
    return;
  }
  if (typeof capture.url !== 'string' || capture.url.length === 0) {
    failures.push(`${label}.capture.url is required`);
  }
  if (typeof capture.selector !== 'string' || capture.selector.length === 0) {
    failures.push(`${label}.capture.selector is required`);
  }
  if (typeof capture.viewport !== 'object' || capture.viewport == null) {
    failures.push(`${label}.capture.viewport is required`);
  } else {
    validateNumber(capture.viewport.width, `${label}.capture.viewport.width`, failures, {
      min: 1,
    });
    validateNumber(capture.viewport.height, `${label}.capture.viewport.height`, failures, {
      min: 1,
    });
  }
  if (capture.actions != null && !Array.isArray(capture.actions)) {
    failures.push(`${label}.capture.actions must be an array`);
  }
  if (Array.isArray(capture.actions)) {
    capture.actions.forEach((action, actionIndex) => {
      const actionLabel = `${label}.capture.actions[${actionIndex}]`;

      if (action?.type !== 'click') failures.push(`${actionLabel}.type must be click`);
      if (typeof action?.selector !== 'string' || action.selector.length === 0) {
        failures.push(`${actionLabel}.selector is required`);
      }
      validateNumber(action?.waitAfterMs, `${actionLabel}.waitAfterMs`, failures, {
        min: 0,
        max: 30_000,
      });
    });
  }

  if (typeof testCase.actualPath === 'string' && testCase.actualPath.length > 0) {
    try {
      resolveVisualArtifactPath(testCase.actualPath, `${label}.actualPath`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
}

export function validateEvidence(evidence) {
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
      validateCapture(testCase, label, failures);
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

async function isUrlReachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await isUrlReachable(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for visual QA app at ${url}`);
}

function getPnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

function getDevServerCommand() {
  if (process.platform === 'win32') {
    return {
      command: 'cmd.exe',
      args: ['/d', '/s', '/c', `${getPnpmCommand()} dev`],
    };
  }

  return {
    command: getPnpmCommand(),
    args: ['dev'],
  };
}

function getPortFromBaseUrl(baseUrl) {
  const parsed = new URL(baseUrl);
  if (parsed.port) return parsed.port;
  return parsed.protocol === 'https:' ? '443' : '3000';
}

function stopServer(server) {
  if (server.exitCode != null || server.signalCode != null) return Promise.resolve();

  return new Promise((resolve) => {
    let forceTimeout;
    const timeout = setTimeout(() => {
      if (process.platform !== 'win32') {
        try {
          process.kill(-server.pid, 'SIGKILL');
        } catch {
          server.kill('SIGKILL');
        }
      }
      resolve();
    }, 5_000);
    server.once('exit', () => {
      clearTimeout(timeout);
      clearTimeout(forceTimeout);
      resolve();
    });
    if (process.platform === 'win32') {
      try {
        execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
          stdio: 'ignore',
        });
      } catch {
        server.kill();
      }
      return;
    }

    try {
      process.kill(-server.pid, 'SIGTERM');
      forceTimeout = setTimeout(() => {
        try {
          process.kill(-server.pid, 'SIGKILL');
        } catch {
          server.kill('SIGKILL');
        }
      }, 2_000);
    } catch {
      server.kill();
    }
  });
}

async function ensureVisualQaServer(baseUrl) {
  if (await isUrlReachable(baseUrl)) {
    return { close: async () => undefined };
  }

  const output = [];
  const devServerCommand = getDevServerCommand();
  const server = spawn(devServerCommand.command, devServerCommand.args, {
    cwd: root,
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      PORT: getPortFromBaseUrl(baseUrl),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (chunk) => output.push(chunk.toString()));
  server.stderr.on('data', (chunk) => output.push(chunk.toString()));

  try {
    await waitForUrl(baseUrl);
  } catch (error) {
    await stopServer(server);
    throw new Error(
      [error instanceof Error ? error.message : String(error), output.join('').trim().slice(-2_000)]
        .filter(Boolean)
        .join('\n'),
    );
  }

  return { close: () => stopServer(server) };
}

function resolveCaptureUrl(captureUrl, baseUrl) {
  return new URL(captureUrl, baseUrl).toString();
}

async function performCaptureAction(page, action) {
  if (action.type === 'click') {
    await page.locator(action.selector).click();
  }
  if (action.waitAfterMs != null) {
    await page.waitForTimeout(action.waitAfterMs);
  }
}

async function captureActualScreenshot(page, testCase, baseUrl) {
  if (testCase.capture == null) return;

  const actualPath = resolveVisualArtifactPath(testCase.actualPath, `${testCase.name}.actualPath`);
  mkdirSync(path.dirname(actualPath), { recursive: true });

  await page.setViewportSize(testCase.capture.viewport);
  await page.goto(resolveCaptureUrl(testCase.capture.url, baseUrl), {
    waitUntil: 'domcontentloaded',
  });

  for (const action of testCase.capture.actions ?? []) {
    await performCaptureAction(page, action);
  }

  const target = page.locator(testCase.capture.selector);
  await target.waitFor({ state: 'visible' });
  await target.screenshot({ path: actualPath });
  console.log(`visual-qa: captured ${testCase.name} -> ${relativeWorkspacePath(actualPath)}`);
}

async function validatePixelComparison(evidence) {
  if (metricOnlyFallbackAccepted(evidence)) {
    console.log('visual-qa: metric-only fallback accepted by current user; pixel compare skipped');
    return [];
  }

  const { chromium } = await import('playwright');
  const cases = evidence.pixelComparison.cases;
  const needsLiveCapture = cases.some((testCase) => testCase.capture != null);
  const server = needsLiveCapture
    ? await ensureVisualQaServer(visualQaBaseUrl)
    : { close: async () => undefined };
  let browser;
  const failures = [];

  try {
    browser = await chromium.launch();
    const page = await browser.newPage();

    for (const testCase of cases) {
      await captureActualScreenshot(page, testCase, visualQaBaseUrl);
      failures.push(...(await comparePngPair(page, testCase, getTolerance(evidence, testCase))));
    }
  } finally {
    await closeVisualQaResources({ browser, server });
  }

  return failures;
}

export async function closeVisualQaResources({ browser, server }) {
  const errors = [];

  if (browser != null) {
    try {
      await browser.close();
    } catch (error) {
      errors.push(error);
    }
  }

  try {
    await server.close();
  } catch (error) {
    errors.push(error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors, 'visual QA resource cleanup failed');
  }
}

export async function main() {
  const changedFileSources = getChangedFileSources();
  const changedFiles = changedFileSources.all;
  const uiFiles = changedFiles.filter(isUiSurface);
  const baseUiFiles = changedFileSources['base-diff'].filter(isUiSurface);
  const visualQaRequired = forceRequired || uiFiles.length > 0;

  if (!visualQaRequired) {
    console.log('visual-qa: PASS - no UI surface changed in base/worktree/staged/untracked diff');
    process.exit(0);
  }

  const evidencePath = findEvidencePath({
    requireTrackedTestsManifest: baseUiFiles.length > 0,
  });

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

const isDirectRun =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(`visual-qa: FAIL - ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
