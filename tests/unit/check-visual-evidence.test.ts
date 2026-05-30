import { describe, expect, it, vi } from 'vitest';

type VisualQaModule = {
  closeVisualQaResources: (resources: {
    browser?: { close: () => Promise<void> };
    server: { close: () => Promise<void> };
  }) => Promise<void>;
  selectEvidencePath: (options: {
    candidates: string[];
    exists: (file: string) => boolean;
    explicitEvidencePath?: string;
    isTrackedFile: (file: string) => boolean;
    requireTrackedTestsManifest: boolean;
  }) => string | null;
  validateEvidence: (evidence: unknown) => string[];
};

async function visualQaModule(): Promise<VisualQaModule> {
  // @ts-expect-error The production visual QA guard is an ESM .mjs CLI module.
  return (await import('../../scripts/check-visual-evidence.mjs')) as VisualQaModule;
}

describe('check-visual-evidence helpers', () => {
  it('accepts capture metadata for screenshot-backed visual evidence cases', async () => {
    const { validateEvidence } = await visualQaModule();

    const failures = validateEvidence({
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
            actualPath: 'test-results/visual-qa/workspace-shell/map-rail-1920x1080.actual.png',
            diffPath: 'test-results/visual-qa/workspace-shell/map-rail-1920x1080.diff.png',
            capture: {
              url: '/',
              selector: '[data-testid="workspace-shell"]',
              viewport: { width: 1920, height: 1080 },
              actions: [{ type: 'click', selector: '#praios-header-tab-map' }],
            },
          },
        ],
      },
    });

    expect(failures).toEqual([]);
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
