import { describe, expect, it, vi } from 'vitest';

type VisualQaModule = {
  closeVisualQaResources: (resources: {
    browser?: { close: () => Promise<void> };
    server: { close: () => Promise<void> };
  }) => Promise<void>;
  createMapCanvasBlankProbe: () => (element: Element) => boolean;
  getCaptureReadinessSelectors: (testCase: { capture?: { selector?: string } }) => string[];
  selectEvidencePath: (options: {
    candidates: string[];
    exists: (file: string) => boolean;
    explicitEvidencePath?: string;
    isTrackedFile: (file: string) => boolean;
    requireTrackedTestsManifest: boolean;
  }) => string | null;
  validateEvidence: (
    evidence: unknown,
    options?: {
      artifactExists?: (file: string) => boolean;
      evidencePath?: string;
      verifyArtifactFiles?: boolean | 'all' | 'references-only';
    },
  ) => string[];
};

async function visualQaModule(): Promise<VisualQaModule> {
  // @ts-expect-error The production visual QA guard is an ESM .mjs CLI module.
  return (await import('../../scripts/check-visual-evidence.mjs')) as VisualQaModule;
}

function visualEvidence({
  actualPath = 'reports/visual-qa/workspace-shell/map-rail-1920x1080.actual.png',
  capture,
  diffPath = 'reports/visual-qa/workspace-shell/map-rail-1920x1080.diff.png',
}: {
  actualPath?: string;
  capture?: {
    actions?: Array<{ selector: string; type: 'click' }>;
    selector: string;
    url: string;
    viewport: { height: number; width: number };
  };
  diffPath?: string;
} = {}) {
  return {
    status: 'PASS',
    taskScope: 'workspace shell',
    references: ['tests/visual-qa/workspace-shell/map-rail-1920x1080.reference.png'],
    viewports: ['1920x1080'],
    states: ['map rail'],
    tolerance: { maxMismatchRatio: 0, pixelDelta: 0 },
    mismatchedAreas: [],
    domCssMetrics: { status: 'PASS' },
    pixelComparison: {
      status: 'PASS',
      tool: 'playwright-canvas-png-diff',
      cases: [
        {
          name: 'map-rail-1920x1080',
          viewport: '1920x1080',
          state: 'map rail',
          referencePath: 'tests/visual-qa/workspace-shell/map-rail-1920x1080.reference.png',
          actualPath,
          diffPath,
          ...(capture == null ? {} : { capture }),
        },
      ],
    },
  };
}

function mockWebglCanvas(
  readPixels: (
    x: number,
    y: number,
    width: number,
    height: number,
    format: number,
    type: number,
    pixels: Uint8Array,
  ) => void,
) {
  const canvas = document.createElement('canvas');
  const gl = {
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    readPixels: vi.fn(readPixels),
  };

  canvas.width = 4;
  canvas.height = 4;
  vi.spyOn(canvas, 'getContext').mockImplementation((contextId: string) => {
    if (contextId === '2d') return null;
    if (contextId === 'webgl2') return gl as unknown as RenderingContext;

    return null;
  });

  return { canvas, gl };
}

describe('check-visual-evidence helpers', () => {
  it('accepts capture metadata for screenshot-backed visual evidence cases', async () => {
    const { validateEvidence } = await visualQaModule();

    const failures = validateEvidence(
      visualEvidence({
        capture: {
          url: '/',
          selector: '[data-testid="workspace-shell"]',
          viewport: { width: 1920, height: 1080 },
          actions: [{ type: 'click', selector: '#praios-header-tab-map' }],
        },
      }),
    );

    expect(failures).toEqual([]);
  });

  it('rejects tracked manifests that point final artifacts at Playwright test-results', async () => {
    const { validateEvidence } = await visualQaModule();

    const failures = validateEvidence(
      visualEvidence({
        actualPath: 'test-results/visual-qa/workspace-shell/map-rail-1920x1080.actual.png',
        diffPath: 'test-results/visual-qa/workspace-shell/map-rail-1920x1080.diff.png',
      }),
      { evidencePath: 'tests/visual-qa/latest.json' },
    );

    expect(failures.join('\n')).toMatch(/test-results\/visual-qa/);
    expect(failures.join('\n')).toMatch(/Playwright clears/);
  });

  it('accepts tracked manifests that point final artifacts at durable reports', async () => {
    const { validateEvidence } = await visualQaModule();

    const failures = validateEvidence(visualEvidence(), {
      evidencePath: 'tests/visual-qa/latest.json',
    });

    expect(failures).toEqual([]);
  });

  it('rejects selected manifests when referenced visual artifacts are missing', async () => {
    const { validateEvidence } = await visualQaModule();

    const failures = validateEvidence(visualEvidence(), {
      artifactExists: (file) => file.endsWith('.reference.png'),
      evidencePath: 'tests/visual-qa/latest.json',
      verifyArtifactFiles: true,
    });

    expect(failures.join('\n')).toMatch(/actualPath artifact does not exist/);
    expect(failures.join('\n')).toMatch(/diffPath artifact does not exist/);
  });

  it('allows clean CI checks to validate tracked references without ignored generated artifacts', async () => {
    const { validateEvidence } = await visualQaModule();

    const failures = validateEvidence(visualEvidence(), {
      artifactExists: (file) => file.endsWith('.reference.png'),
      evidencePath: 'tests/visual-qa/latest.json',
      verifyArtifactFiles: 'references-only',
    });

    expect(failures).toEqual([]);
  });

  it('requires MapLibre readiness checks for workspace screenshot captures', async () => {
    const { getCaptureReadinessSelectors } = await visualQaModule();

    expect(
      getCaptureReadinessSelectors({
        capture: { selector: '[data-testid="workspace-shell"]' },
      }),
    ).toEqual([
      '[data-testid="workspace-map"] .maplibregl-canvas',
      '[data-testid="workspace-map"] .maplibregl-ctrl-attrib',
      '[data-testid="workspace-map"] .maplibregl-ctrl-zoom-in',
      '[data-testid="workspace-map"] .maplibregl-ctrl-zoom-out',
    ]);
  });

  it('treats uniform WebGL canvas pixels as blank when 2D canvas access is unavailable', async () => {
    const { createMapCanvasBlankProbe } = await visualQaModule();
    const { canvas, gl } = mockWebglCanvas((_x, _y, _width, _height, _format, _type, pixels) =>
      pixels.fill(0),
    );

    expect(createMapCanvasBlankProbe()(canvas)).toBe(true);
    expect(gl.readPixels).toHaveBeenCalledOnce();
  });

  it('treats varied WebGL canvas pixels as ready when 2D canvas access is unavailable', async () => {
    const { createMapCanvasBlankProbe } = await visualQaModule();
    const { canvas, gl } = mockWebglCanvas((_x, _y, _width, _height, _format, _type, pixels) => {
      pixels.fill(0);
      pixels[12] = 255;
    });

    expect(createMapCanvasBlankProbe()(canvas)).toBe(false);
    expect(gl.readPixels).toHaveBeenCalledOnce();
  });

  it('rejects ignored default reports evidence for base-diff UI changes', async () => {
    const { selectEvidencePath } = await visualQaModule();
    const isTrackedFile = vi.fn((file: string) => file === 'tests/visual-qa/latest.json');

    expect(() =>
      selectEvidencePath({
        explicitEvidencePath: undefined,
        candidates: ['tests/visual-qa/latest.json', 'reports/visual-qa/latest.json'],
        requireTrackedTestsManifest: true,
        exists: (file) => file === 'reports/visual-qa/latest.json',
        isTrackedFile,
      }),
    ).toThrow(/tests\/visual-qa\/latest\.json/);
  });

  it('closes the visual QA server even when browser cleanup fails', async () => {
    const { closeVisualQaResources } = await visualQaModule();
    const browser = { close: vi.fn().mockRejectedValue(new Error('browser close failed')) };
    const server = { close: vi.fn().mockResolvedValue(undefined) };

    await expect(closeVisualQaResources({ browser, server })).rejects.toThrow(
      /resource cleanup failed/,
    );

    expect(browser.close).toHaveBeenCalledOnce();
    expect(server.close).toHaveBeenCalledOnce();
  });
});
