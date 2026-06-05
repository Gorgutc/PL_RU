import { expect, test, type Locator, type Page } from '@playwright/test';

declare global {
  interface Window {
    __workspaceMapCanvasResizeState?: {
      events: Array<{ height: string | null; now: number; width: string | null }>;
      observer: MutationObserver | null;
      startedAt: number;
    };
  }
}

const HEADER_HEIGHT = 48;
const VIEWPORT_WIDTH = 1920;
const RAIL_COLLAPSED_WIDTH = 50;
const RAIL_EXPANDED_WIDTH = 240;
const MAP_OUTER_GUTTER = 10;
const MAP_INNER_INSET = 8;
const MAP_CONTAINER_RADIUS = 2;
const MAP_CANVAS_RADIUS = 4;
const WORKSPACE_MOTION_DURATION_MS = 220;
const MAP_RESIZE_SETTLE_DELAY_MS = 80;
const REDUCED_MOTION_MAX_DURATION_MS = 20;
const MAP_MASK_COVERAGE_TOLERANCE_PX = 1;
const MAP_MASK_MOTION_SAMPLE_ELAPSED_MS = [40, 110, 220] as const;
const MAP_STAGE_PRE_WATCH_QUIET_MS =
  WORKSPACE_MOTION_DURATION_MS + MAP_RESIZE_SETTLE_DELAY_MS + 120;
const RAIL_HEIGHTS = [768, 900, 1080, 1200, 1440, 2160] as const;
const RAIL_TAB_EXPECTATIONS = {
  map: {
    headerTabId: 'praios-header-tab-map',
    expandedWidth: RAIL_EXPANDED_WIDTH,
    icons: {
      primary: 'flag-outline',
      documents: 'file-text',
      objects: 'vector',
      tools: 'mother-tool-outline',
      search: 'search-outline',
      information: 'file-outline',
      support: 'transition-to-queries',
      theme: 'moon-outline',
      collapse: 'double-upper-right-outline',
      settings: 'setting-outline',
    },
  },
  bar: {
    headerTabId: 'praios-header-tab-bar',
    expandedWidth: RAIL_EXPANDED_WIDTH,
    icons: {
      primary: 'ruler-outline',
      timeline: 'zerolinetool-outline',
      converter: 'globe-outline',
      weather: 'weather',
      search: 'search-outline',
      information: 'file-outline',
      support: 'transition-to-queries',
      theme: 'moon-outline',
      collapse: 'double-upper-right-outline',
      settings: 'setting-outline',
    },
  },
  tmi: {
    headerTabId: 'praios-header-tab-tmi',
    expandedWidth: RAIL_EXPANDED_WIDTH,
    icons: {
      primary: 'ruler-outline',
      area: 'buffer-outline',
      circle: 'square-outline',
      polygon: 'object-outline',
      mark: 'flag-outline',
      search: 'search-outline',
      information: 'file-outline',
      support: 'transition-to-queries',
      theme: 'moon-outline',
      collapse: 'double-upper-right-outline',
      settings: 'setting-outline',
    },
  },
} as const;
const KICK_SELECT_IDS = [
  'kick-select-point-type',
  'kick-select-launch-point',
  'kick-select-calculation-number',
  'kick-select-product-type',
  'kick-select-product-number',
  'kick-select-pz-number',
  'kick-select-warhead-type',
  'kick-select-pampushka',
  'kick-select-fork',
  'kick-select-radish',
  'kick-select-camera',
  'kick-select-interest',
] as const;

function getCollapsedMapStageWidth(viewportWidth: number) {
  return viewportWidth - RAIL_COLLAPSED_WIDTH - MAP_OUTER_GUTTER * 2 - MAP_INNER_INSET * 2;
}

const MAX_COLLAPSED_MAP_CANVAS_WIDTH = getCollapsedMapStageWidth(VIEWPORT_WIDTH);

async function openWorkspace(page: Page, height = 1080) {
  await page.setViewportSize({ width: VIEWPORT_WIDTH, height });
  await page.goto('/');

  const shell = page.getByTestId('workspace-shell');
  await expect(shell).toBeVisible();

  return shell;
}

async function requireBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Expected visible bounding box');
  return box;
}

function cssTimeToMs(value: string) {
  const normalized = value.trim();

  if (normalized.endsWith('ms')) return Number.parseFloat(normalized);
  if (normalized.endsWith('s')) return Number.parseFloat(normalized) * 1000;

  return Number.parseFloat(normalized);
}

function maxCssDurationToMs(value: string) {
  return Math.max(...value.split(',').map(cssTimeToMs));
}

async function expectMotionDuration(locator: Locator, expectedMs: number) {
  const duration = await locator.evaluate(
    (element) => window.getComputedStyle(element).transitionDuration,
  );
  const actualMs = maxCssDurationToMs(duration);

  expect(actualMs).toBeGreaterThanOrEqual(expectedMs - 5);
  expect(actualMs).toBeLessThanOrEqual(expectedMs + 5);
}

async function expectReducedMotionDuration(locator: Locator) {
  const duration = await locator.evaluate(
    (element) => window.getComputedStyle(element).transitionDuration,
  );

  expect(maxCssDurationToMs(duration)).toBeLessThanOrEqual(REDUCED_MOTION_MAX_DURATION_MS);
}

async function expectUniformBorderRadius(locator: Locator, expectedPx: number) {
  const radii = await locator.evaluate((element) => {
    const styles = window.getComputedStyle(element);

    return [
      styles.borderTopLeftRadius,
      styles.borderTopRightRadius,
      styles.borderBottomRightRadius,
      styles.borderBottomLeftRadius,
    ];
  });

  expect(radii.map((radius) => Math.round(Number.parseFloat(radius)))).toEqual([
    expectedPx,
    expectedPx,
    expectedPx,
    expectedPx,
  ]);
}

async function openWorkspaceWithRailMotionLocators(page: Page) {
  await openWorkspace(page);

  const rail = page.getByTestId('left-rail');
  const toggle = page.getByTestId('left-rail-button-collapse');

  return {
    collapseIcon: toggle.getByTestId('left-rail-icon'),
    leftArea: page.getByTestId('workspace-left-area'),
    rail,
    tabPanel: page.locator('#praios-tab-panel'),
    toggle,
  };
}

async function openRailTab(page: Page, tab: keyof typeof RAIL_TAB_EXPECTATIONS) {
  if (tab !== 'map') {
    await page.getByRole('banner').locator(`#${RAIL_TAB_EXPECTATIONS[tab].headerTabId}`).click();
  }

  await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', tab);
  await expect(page.getByTestId('left-rail')).toBeVisible();
}

async function expectRailWidth(page: Page, expectedWidth: number) {
  const leftArea = page.getByTestId('workspace-left-area');
  const rail = page.getByTestId('left-rail');
  const map = page.getByTestId('workspace-map');

  await expect
    .poll(async () => Math.round((await requireBox(leftArea)).width), { timeout: 3000 })
    .toBe(expectedWidth);
  await expect
    .poll(async () => Math.round((await requireBox(rail)).width), { timeout: 3000 })
    .toBe(expectedWidth);

  const leftBox = await requireBox(leftArea);
  const railBox = await requireBox(rail);
  const mapBox = await requireBox(map);

  expect(Math.round(leftBox.width)).toBe(expectedWidth);
  expect(Math.round(railBox.width)).toBe(expectedWidth);
  expect(Math.round(mapBox.x)).toBe(Math.round(leftBox.x + leftBox.width));
  expect(Math.round(mapBox.width)).toBe(VIEWPORT_WIDTH - Math.round(leftBox.width));
}

async function waitForWorkspaceMotion(page: Page) {
  await page.waitForTimeout(WORKSPACE_MOTION_DURATION_MS + 100);
}

async function expectMapContainerSpacing(page: Page) {
  const map = page.getByTestId('workspace-map');
  const mapCard = page.getByTestId('workspace-map-card');
  const mapCanvas = page.getByTestId('workspace-map-canvas');

  const mapBox = await requireBox(map);
  const cardBox = await requireBox(mapCard);
  const canvasBox = await requireBox(mapCanvas);

  expect(Math.round(cardBox.x - mapBox.x)).toBe(MAP_OUTER_GUTTER);
  expect(Math.round(cardBox.y - mapBox.y)).toBe(MAP_OUTER_GUTTER);
  expect(Math.round(mapBox.x + mapBox.width - (cardBox.x + cardBox.width))).toBe(MAP_OUTER_GUTTER);
  expect(Math.round(mapBox.y + mapBox.height - (cardBox.y + cardBox.height))).toBe(
    MAP_OUTER_GUTTER,
  );
  expect(Math.round(canvasBox.x - cardBox.x)).toBe(MAP_INNER_INSET);
  expect(Math.round(canvasBox.y - cardBox.y)).toBe(MAP_INNER_INSET);
  expect(Math.round(cardBox.x + cardBox.width - (canvasBox.x + canvasBox.width))).toBe(
    MAP_INNER_INSET,
  );
  expect(Math.round(cardBox.y + cardBox.height - (canvasBox.y + canvasBox.height))).toBe(
    MAP_INNER_INSET,
  );
  await expectUniformBorderRadius(mapCard, MAP_CONTAINER_RADIUS);
  await expectUniformBorderRadius(mapCanvas, MAP_CANVAS_RADIUS);
}

async function expectRailLabelFits(button: Locator) {
  const label = button.getByTestId('left-rail-label');
  const metrics = await label.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    text: element.textContent,
  }));

  expect(metrics.scrollWidth, `${metrics.text ?? 'rail label'} should fit`).toBeLessThanOrEqual(
    metrics.clientWidth + 1,
  );
}

async function watchMapCanvasResizeMutations(page: Page) {
  await page.locator('.maplibregl-canvas').waitFor({ state: 'visible' });
  await page.evaluate(() => {
    const canvas = document.querySelector('.maplibregl-canvas');

    if (!canvas) throw new Error('Expected MapLibre canvas before watching mutations');

    const state = {
      events: [] as Array<{ height: string | null; now: number; width: string | null }>,
      observer: null as MutationObserver | null,
      startedAt: performance.now(),
    };

    state.observer = new MutationObserver(() => {
      state.events.push({
        height: canvas.getAttribute('height'),
        now: performance.now() - state.startedAt,
        width: canvas.getAttribute('width'),
      });
    });
    state.observer.observe(canvas, {
      attributeFilter: ['height', 'width'],
      attributes: true,
    });

    window.__workspaceMapCanvasResizeState?.observer?.disconnect();
    window.__workspaceMapCanvasResizeState = state;
  });
}

async function waitForMapCanvasResizeQuiet(page: Page, quietMs = 240, timeoutMs = 3000) {
  await page.locator('.maplibregl-canvas').waitFor({ state: 'visible' });
  await page.evaluate(
    ({ quietMs: quietWindow, timeoutMs: timeoutWindow }) =>
      new Promise<void>((resolve, reject) => {
        const canvas = document.querySelector('.maplibregl-canvas');

        if (!canvas) {
          reject(new Error('Expected MapLibre canvas before waiting for quiet resize'));
          return;
        }

        let quietTimer = 0;
        let timeoutTimer = 0;
        const observer = new MutationObserver(() => {
          window.clearTimeout(quietTimer);
          quietTimer = window.setTimeout(finish, quietWindow);
        });
        const finish = () => {
          window.clearTimeout(quietTimer);
          window.clearTimeout(timeoutTimer);
          observer.disconnect();
          resolve();
        };

        observer.observe(canvas, {
          attributeFilter: ['height', 'width'],
          attributes: true,
        });
        quietTimer = window.setTimeout(finish, quietWindow);
        timeoutTimer = window.setTimeout(() => {
          observer.disconnect();
          reject(new Error('Timed out waiting for MapLibre canvas resize to settle'));
        }, timeoutWindow);
      }),
    { quietMs, timeoutMs },
  );
}

async function readMapCanvasResizeMutationCount(page: Page, beforeMs?: number) {
  return page.evaluate((limit) => {
    const events = window.__workspaceMapCanvasResizeState?.events ?? [];

    return typeof limit === 'number'
      ? events.filter((event) => event.now < limit).length
      : events.length;
  }, beforeMs);
}

async function readMapCanvasResizeMutationEvents(page: Page) {
  return page.evaluate(() => window.__workspaceMapCanvasResizeState?.events ?? []);
}

async function expectMapCanvasAvoidsResizeForShellMotion(
  page: Page,
  canvas: Locator,
  leftArea: Locator,
  sidebarState: 'collapsed' | 'expanded',
) {
  await page.waitForTimeout(Math.floor(WORKSPACE_MOTION_DURATION_MS / 2));

  await expect(canvas).toBeVisible();
  await expect(leftArea).toHaveAttribute('data-sidebar-state', sidebarState);
  expect(await readMapCanvasResizeMutationCount(page, WORKSPACE_MOTION_DURATION_MS)).toBe(0);

  await page.waitForTimeout(WORKSPACE_MOTION_DURATION_MS + MAP_RESIZE_SETTLE_DELAY_MS + 120);

  await expect(canvas).toBeVisible();
  expect(
    await readMapCanvasResizeMutationEvents(page),
    'shell motion should not resize MapLibre canvas',
  ).toHaveLength(0);
}

async function readMapMaskCoverage(page: Page, label: string) {
  return page.evaluate((sampleLabel) => {
    const host = document.querySelector('[data-testid="workspace-map-canvas"]');
    const canvas = document.querySelector('.maplibregl-canvas');

    if (!host || !canvas) {
      throw new Error(`Expected MapLibre host and canvas for ${sampleLabel}`);
    }

    const hostBox = host.getBoundingClientRect();
    const canvasBox = canvas.getBoundingClientRect();

    return {
      canvasHeight: canvasBox.height,
      canvasRight: canvasBox.right,
      canvasWidth: canvasBox.width,
      hostHeight: hostBox.height,
      hostRight: hostBox.right,
      hostWidth: hostBox.width,
      label: sampleLabel,
    };
  }, label);
}

async function expectMapCanvasCoversMaskDuringMotion(page: Page, label: string) {
  const coverage = await readMapMaskCoverage(page, label);

  expect(
    coverage.canvasWidth,
    `${coverage.label}: MapLibre canvas should cover the map mask width`,
  ).toBeGreaterThanOrEqual(coverage.hostWidth - MAP_MASK_COVERAGE_TOLERANCE_PX);
  expect(
    coverage.canvasHeight,
    `${coverage.label}: MapLibre canvas should cover the map mask height`,
  ).toBeGreaterThanOrEqual(coverage.hostHeight - MAP_MASK_COVERAGE_TOLERANCE_PX);
}

function expectMapCanvasRightAlignedToMask(
  coverage: Awaited<ReturnType<typeof readMapMaskCoverage>>,
) {
  expect(
    Math.abs(coverage.canvasRight - coverage.hostRight),
    `${coverage.label}: MapLibre canvas right edge should stay anchored to the map mask`,
  ).toBeLessThanOrEqual(MAP_MASK_COVERAGE_TOLERANCE_PX);
}

async function expectMapCanvasUsesStableStageWidth(
  page: Page,
  label: string,
  expectedWidth = MAX_COLLAPSED_MAP_CANVAS_WIDTH,
) {
  const coverage = await readMapMaskCoverage(page, label);

  expect(
    coverage.canvasWidth,
    `${coverage.label}: MapLibre canvas should keep the stable collapsed-map stage width`,
  ).toBeGreaterThanOrEqual(expectedWidth - MAP_MASK_COVERAGE_TOLERANCE_PX);
  expect(
    coverage.canvasWidth,
    `${coverage.label}: MapLibre canvas should not grow beyond the stable stage width`,
  ).toBeLessThanOrEqual(expectedWidth + MAP_MASK_COVERAGE_TOLERANCE_PX);
  expectMapCanvasRightAlignedToMask(coverage);
}

async function waitForMapCanvasStableStage(
  page: Page,
  label: string,
  expectedWidth = MAX_COLLAPSED_MAP_CANVAS_WIDTH,
) {
  await expect
    .poll(
      async () => {
        const coverage = await readMapMaskCoverage(page, label);

        return (
          Math.abs(coverage.canvasWidth - expectedWidth) <= MAP_MASK_COVERAGE_TOLERANCE_PX &&
          Math.abs(coverage.canvasRight - coverage.hostRight) <= MAP_MASK_COVERAGE_TOLERANCE_PX
        );
      },
      { message: `${label}: MapLibre canvas should keep a stable right-anchored stage` },
    )
    .toBe(true);
}

async function expectMapCanvasCoversMaskDuringMotionSamples(page: Page, label: string) {
  let previousElapsedMs = 0;

  for (const elapsedMs of MAP_MASK_MOTION_SAMPLE_ELAPSED_MS) {
    await page.waitForTimeout(elapsedMs - previousElapsedMs);
    await expectMapCanvasCoversMaskDuringMotion(page, `${label} at ${elapsedMs}ms`);
    previousElapsedMs = elapsedMs;
  }
}

async function expectMapCanvasStableStageDuringMotionSamples(page: Page, label: string) {
  let previousElapsedMs = 0;

  for (const elapsedMs of MAP_MASK_MOTION_SAMPLE_ELAPSED_MS) {
    await page.waitForTimeout(elapsedMs - previousElapsedMs);
    await expectMapCanvasUsesStableStageWidth(page, `${label} at ${elapsedMs}ms`);
    previousElapsedMs = elapsedMs;
  }
}

async function stopWatchingMapCanvasResizeMutations(page: Page) {
  await page.evaluate(() => {
    window.__workspaceMapCanvasResizeState?.observer?.disconnect();
    delete window.__workspaceMapCanvasResizeState;
  });
}

async function expectRailIcons(page: Page, tab: keyof typeof RAIL_TAB_EXPECTATIONS) {
  const expectedIcons = RAIL_TAB_EXPECTATIONS[tab].icons;

  for (const [itemId, iconId] of Object.entries(expectedIcons)) {
    const button = page.getByTestId(`left-rail-button-${itemId}`);
    const icon = button.getByTestId('left-rail-icon');

    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('data-rail-item-id', itemId);
    await expect(button).toHaveAttribute('data-icon-id', iconId);
    await expect(icon).toHaveAttribute('data-icon-id', iconId);
  }
}

async function expectPanelControlsAligned(page: Page, panelTestId: string) {
  const panel = page.getByTestId(panelTestId);
  await expect(panel).toBeVisible();

  const footerButtons = panel.locator('footer button');
  const panelLevelControls = panel.locator(
    [
      '.bp6-html-select',
      '.bp5-html-select',
      '.bp6-input-group',
      '.bp5-input-group',
      'textarea',
    ].join(', '),
  );
  const containedCards = panel.locator('section[aria-label]');

  const footerButtonCount = await footerButtons.count();
  expect(footerButtonCount).toBeGreaterThan(0);

  const footerRightEdges: number[] = [];
  for (let index = 0; index < footerButtonCount; index += 1) {
    const footerBox = await requireBox(footerButtons.nth(index));
    footerRightEdges.push(Math.round(footerBox.x + footerBox.width));
  }

  const footerRight = Math.max(...footerRightEdges);
  const panelBox = await requireBox(panel);
  const panelMidpoint = panelBox.x + panelBox.width / 2;
  const controlBoxes = await panelLevelControls.evaluateAll((elements) =>
    elements
      .filter((element) => !element.closest('section[aria-label]'))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.x, right: rect.x + rect.width, y: rect.y };
      }),
  );
  const cardBoxes = await containedCards.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.x, right: rect.x + rect.width, y: rect.y };
    }),
  );
  const alignmentBoxes = [...controlBoxes, ...cardBoxes];
  const boxesByRow = new Map<number, typeof alignmentBoxes>();

  expect(alignmentBoxes.length).toBeGreaterThan(0);

  for (const box of alignmentBoxes) {
    const rowKey = Math.round(box.y / 4) * 4;
    boxesByRow.set(rowKey, [...(boxesByRow.get(rowKey) ?? []), box]);
  }

  for (const boxes of boxesByRow.values()) {
    const controlRight = Math.round(Math.max(...boxes.map((box) => box.right)));
    const leftOnlySingleColumn =
      boxes.length === 1 && boxes[0].left < panelMidpoint && boxes[0].right < panelMidpoint + 1;

    if (leftOnlySingleColumn) continue;

    expect(Math.abs(controlRight - footerRight)).toBeLessThanOrEqual(1);
  }
}

async function tabUntilFocused(page: Page, locator: Locator, maxTabs = 40) {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await locator.evaluate((element) => element.contains(document.activeElement));

    if (focused) return;
  }

  throw new Error('Expected target to receive keyboard focus');
}

async function expectInputTextFits(locator: Locator, displayValue: string) {
  const metrics = await locator.evaluate((element, value) => {
    const input = element as HTMLInputElement;
    const style = window.getComputedStyle(input);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Expected a canvas context for text measurement');

    context.font = [
      style.fontStyle,
      style.fontVariant,
      style.fontWeight,
      style.fontSize,
      style.fontFamily,
    ].join(' ');

    return {
      clientWidth: input.clientWidth,
      paddingLeft: Number.parseFloat(style.paddingLeft) || 0,
      paddingRight: Number.parseFloat(style.paddingRight) || 0,
      textWidth: context.measureText(value).width,
    };
  }, displayValue);

  const reservedPickerWidth = 14;
  const requiredWidth =
    metrics.textWidth + metrics.paddingLeft + metrics.paddingRight + reservedPickerWidth;

  expect(requiredWidth).toBeLessThanOrEqual(metrics.clientWidth);
}

async function expectCalendarInputUsable(locator: Locator) {
  const metrics = await locator.evaluate((element) => {
    const input = element as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const style = window.getComputedStyle(input);

    return {
      ariaHidden: input.getAttribute('aria-hidden'),
      height: rect.height,
      pointerEvents: style.pointerEvents,
      tabIndex: input.tabIndex,
      width: rect.width,
    };
  });

  expect(metrics.ariaHidden).toBeNull();
  expect(metrics.pointerEvents).not.toBe('none');
  expect(metrics.tabIndex).toBeGreaterThanOrEqual(0);
  expect(metrics.width).toBeGreaterThanOrEqual(16);
  expect(metrics.height).toBeGreaterThanOrEqual(16);
}

async function readSelectMetrics(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return {
      height: Math.round(rect.height),
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      paddingTop: style.paddingTop,
    };
  });
}

test.describe('PraiOS workspace shell', () => {
  test('renders below the fixed Header and lets the map fill remaining space', async ({ page }) => {
    const shell = await openWorkspace(page);
    const header = page.getByRole('banner');
    const map = page.getByTestId('workspace-map');
    const mapCard = page.getByTestId('workspace-map-card');
    const leftArea = page.getByTestId('workspace-left-area');

    await expect(page.getByRole('heading', { name: 'PraiOS workspace' })).toBeAttached();
    await expect(map).toBeVisible();
    await expect(mapCard).toHaveClass(/bp6-card|bp5-card/);

    const headerBox = await requireBox(header);
    const shellBox = await requireBox(shell);
    const leftBox = await requireBox(leftArea);
    const mapBox = await requireBox(map);

    expect(Math.round(headerBox.height)).toBe(HEADER_HEIGHT);
    expect(Math.round(shellBox.y)).toBe(HEADER_HEIGHT);
    expect(Math.round(shellBox.height)).toBe(VIEWPORT_WIDTH ? 1080 - HEADER_HEIGHT : 0);
    expect(Math.round(leftBox.width)).toBe(RAIL_COLLAPSED_WIDTH);
    expect(Math.round(mapBox.x)).toBe(Math.round(leftBox.x + leftBox.width));
    expect(Math.round(mapBox.width)).toBe(VIEWPORT_WIDTH - Math.round(leftBox.width));
    expect(Math.round(mapBox.height)).toBe(1080 - HEADER_HEIGHT);
    await expectMapContainerSpacing(page);
  });

  test('opens and closes the contextual left rail with tab-specific reference widths', async ({
    page,
  }) => {
    await openWorkspace(page);

    for (const tab of Object.keys(RAIL_TAB_EXPECTATIONS) as Array<
      keyof typeof RAIL_TAB_EXPECTATIONS
    >) {
      await openRailTab(page, tab);

      const leftArea = page.getByTestId('workspace-left-area');
      const rail = page.getByTestId('left-rail');
      const toggle = page.getByTestId('left-rail-button-collapse');
      const railLabels = rail.getByTestId('left-rail-label');
      const expectedLabelCount = Object.keys(RAIL_TAB_EXPECTATIONS[tab].icons).length;

      await expect(leftArea).toHaveAttribute('data-sidebar-state', 'collapsed');
      await expect(rail).toHaveAttribute('data-sidebar-state', 'collapsed');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expectRailWidth(page, RAIL_COLLAPSED_WIDTH);
      await expectRailIcons(page, tab);
      await expect(railLabels).toHaveCount(expectedLabelCount);
      await expect(railLabels.first()).toHaveCSS('opacity', '0');

      await toggle.click();

      await expect(leftArea).toHaveAttribute('data-sidebar-state', 'expanded');
      await expect(rail).toHaveAttribute('data-sidebar-state', 'expanded');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expectRailWidth(page, RAIL_TAB_EXPECTATIONS[tab].expandedWidth);
      await expectMapContainerSpacing(page);
      await expect(railLabels).toHaveCount(expectedLabelCount);
      await expect(railLabels.first()).toHaveCSS('opacity', '1');
      if (tab === 'map') {
        await expectRailLabelFits(page.getByTestId('left-rail-button-objects'));
      }

      await toggle.click();

      await expect(leftArea).toHaveAttribute('data-sidebar-state', 'collapsed');
      await expect(rail).toHaveAttribute('data-sidebar-state', 'collapsed');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expectRailWidth(page, RAIL_COLLAPSED_WIDTH);
      await expect(railLabels).toHaveCount(expectedLabelCount);
      await expect(railLabels.first()).toHaveCSS('opacity', '0');
    }
  });

  test('uses a shared soft motion contract for left rail and map mask changes', async ({
    page,
  }) => {
    const { collapseIcon, leftArea, rail, tabPanel, toggle } =
      await openWorkspaceWithRailMotionLocators(page);

    await expectMotionDuration(tabPanel, WORKSPACE_MOTION_DURATION_MS);
    await expectMotionDuration(leftArea, WORKSPACE_MOTION_DURATION_MS);
    await expectMotionDuration(rail, WORKSPACE_MOTION_DURATION_MS);
    await expectMotionDuration(collapseIcon, WORKSPACE_MOTION_DURATION_MS);

    await toggle.click();

    const firstLabel = rail.getByTestId('left-rail-label').first();
    await expect(firstLabel).toBeVisible();
    await expectMotionDuration(firstLabel, WORKSPACE_MOTION_DURATION_MS);
    await waitForWorkspaceMotion(page);
    await expectMapContainerSpacing(page);
  });

  test('keeps MapLibre canvas stable while the left rail is animating', async ({ page }) => {
    const { leftArea, toggle } = await openWorkspaceWithRailMotionLocators(page);
    const map = page.getByTestId('workspace-map');
    const canvas = map.locator('.maplibregl-canvas');

    await expect(canvas).toBeVisible();
    await waitForMapCanvasResizeQuiet(page);
    await watchMapCanvasResizeMutations(page);

    await toggle.click();
    await expectMapCanvasAvoidsResizeForShellMotion(page, canvas, leftArea, 'expanded');

    await stopWatchingMapCanvasResizeMutations(page);

    await waitForMapCanvasResizeQuiet(page);
    await watchMapCanvasResizeMutations(page);

    await toggle.click();
    await expectMapCanvasAvoidsResizeForShellMotion(page, canvas, leftArea, 'collapsed');

    await stopWatchingMapCanvasResizeMutations(page);
  });

  test('covers the map mask while the left rail and side panels resize', async ({ page }) => {
    const { toggle } = await openWorkspaceWithRailMotionLocators(page);

    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    await waitForMapCanvasStableStage(page, 'initial map');

    await toggle.click();
    await waitForMapCanvasStableStage(page, 'expanded rail before close');

    await toggle.click();
    await expectMapCanvasCoversMaskDuringMotionSamples(page, 'rail closing');

    await waitForMapCanvasStableStage(page, 'collapsed rail after close');
    await page.getByRole('banner').locator('#praios-header-tab-stats').click();
    await waitForMapCanvasStableStage(page, 'stats panel before map tab');

    await page.getByRole('banner').locator('#praios-header-tab-map').click();
    await expectMapCanvasCoversMaskDuringMotionSamples(page, 'stats to map');
  });

  test('keeps a right-anchored stable map stage while tabs crop and reveal it', async ({
    page,
  }) => {
    const { toggle } = await openWorkspaceWithRailMotionLocators(page);
    const header = page.getByRole('banner');

    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    await waitForMapCanvasStableStage(page, 'initial collapsed map');

    await header.locator('#praios-header-tab-stats').click();
    await waitForMapCanvasStableStage(page, 'stats panel crop');
    await waitForMapCanvasResizeQuiet(page, MAP_STAGE_PRE_WATCH_QUIET_MS);
    await watchMapCanvasResizeMutations(page);

    await header.locator('#praios-header-tab-map').click();
    await expectMapCanvasStableStageDuringMotionSamples(page, 'stats to map');
    await waitForWorkspaceMotion(page);
    await expectMapCanvasUsesStableStageWidth(page, 'map after stats reveal');
    const statsToMapResizeEvents = await readMapCanvasResizeMutationEvents(page);
    expect(statsToMapResizeEvents, 'stats to map should not resize MapLibre canvas').toHaveLength(
      0,
    );
    await stopWatchingMapCanvasResizeMutations(page);

    await toggle.click();
    await waitForMapCanvasStableStage(page, 'expanded rail crop');
    await waitForMapCanvasResizeQuiet(page, MAP_STAGE_PRE_WATCH_QUIET_MS);
    await watchMapCanvasResizeMutations(page);

    await toggle.click();
    await expectMapCanvasStableStageDuringMotionSamples(page, 'rail closing');
    await waitForWorkspaceMotion(page);
    await expectMapCanvasUsesStableStageWidth(page, 'map after rail close reveal');
    const railClosingResizeEvents = await readMapCanvasResizeMutationEvents(page);
    expect(railClosingResizeEvents, 'rail closing should not resize MapLibre canvas').toHaveLength(
      0,
    );
    await stopWatchingMapCanvasResizeMutations(page);
  });

  test('resizes MapLibre when the stable map stage changes with the viewport', async ({ page }) => {
    await openWorkspace(page);
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    await waitForMapCanvasStableStage(page, 'initial viewport stage');
    await waitForMapCanvasResizeQuiet(page, MAP_STAGE_PRE_WATCH_QUIET_MS);
    await watchMapCanvasResizeMutations(page);

    const resizedViewport = { height: 900, width: 1600 };
    await page.setViewportSize(resizedViewport);
    await waitForMapCanvasStableStage(
      page,
      'resized viewport stage',
      getCollapsedMapStageWidth(resizedViewport.width),
    );
    await waitForMapCanvasResizeQuiet(page);

    const resizeEvents = await readMapCanvasResizeMutationEvents(page);
    expect(
      resizeEvents,
      'viewport resize should resize MapLibre canvas for the new stage',
    ).not.toHaveLength(0);
    await stopWatchingMapCanvasResizeMutations(page);
  });

  test('removes meaningful rail motion for reduced-motion users', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const { collapseIcon, leftArea, rail, tabPanel, toggle } =
      await openWorkspaceWithRailMotionLocators(page);

    await expectReducedMotionDuration(tabPanel);
    await expectReducedMotionDuration(leftArea);
    await expectReducedMotionDuration(rail);
    await expectReducedMotionDuration(collapseIcon);

    await toggle.click();
    await expectReducedMotionDuration(rail.getByTestId('left-rail-label').first());
  });

  test('syncs tab-specific left panels with Header state', async ({ page }) => {
    await openWorkspace(page);
    const header = page.getByRole('banner');

    await expect(page.getByTestId('left-rail')).toBeVisible();
    await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', 'map');

    await header.locator('#praios-header-tab-kick').click();
    await waitForWorkspaceMotion(page);

    await expect(page.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'praios-header-tab-kick',
    );
    await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', 'kick');
    await expect(page.getByTestId('kick-side-panel')).toBeVisible();
    await expect(page.getByText('Создание параметров для пуска')).toBeVisible();
    await expect
      .poll(async () =>
        Math.round((await requireBox(page.getByTestId('workspace-left-area'))).width),
      )
      .toBe(300);

    await header.locator('#praios-header-tab-stats').click();
    await waitForWorkspaceMotion(page);

    await expect(page.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'praios-header-tab-stats',
    );
    await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', 'stats');
    await expect(page.getByTestId('stats-side-panel')).toBeVisible();
    await expect(page.getByText('Фильтры таблицы')).toBeVisible();
    await expect
      .poll(async () =>
        Math.round((await requireBox(page.getByTestId('workspace-left-area'))).width),
      )
      .toBe(300);
  });

  for (const height of RAIL_HEIGHTS) {
    test(`keeps compact left rail anchored across ${height}px viewport height`, async ({
      page,
    }) => {
      await openWorkspace(page, height);
      const rail = page.getByTestId('left-rail');
      const topGroup = page.getByTestId('left-rail-top-group');
      const bottomGroup = page.getByTestId('left-rail-bottom-group');
      const firstButton = page.getByTestId('left-rail-button-primary');

      const railBox = await requireBox(rail);
      const topBox = await requireBox(topGroup);
      const bottomBox = await requireBox(bottomGroup);

      expect(Math.round(railBox.width)).toBe(RAIL_COLLAPSED_WIDTH);
      expect(Math.round(railBox.height)).toBe(height - HEADER_HEIGHT);
      expect(Math.round(topBox.y)).toBe(HEADER_HEIGHT + 4);
      expect(Math.round(bottomBox.y + bottomBox.height)).toBe(height - 4);

      await expect(firstButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await firstButton.hover();
      await expect(firstButton).toHaveCSS('background-color', 'rgb(82, 139, 255)');
      await firstButton.click();
      await page.mouse.move(200, 200);
      await expect(firstButton).toHaveAttribute('aria-pressed', 'true');
      await expect(firstButton).toHaveCSS('background-color', 'rgb(41, 112, 255)');
      await expect(firstButton).toHaveCSS('border-top-width', '0px');
      await expect(firstButton).toHaveCSS('outline-style', 'none');
      await expect(firstButton).toHaveCSS('box-shadow', 'none');
    });
  }

  test('preserves keyboard focus on an active left rail button', async ({ page }) => {
    await openWorkspace(page);
    const firstButton = page.getByTestId('left-rail-button-primary');

    await firstButton.click();
    await firstButton.evaluate((button) => {
      button.setAttribute('data-focus-source', 'keyboard');
      button.focus();
    });

    await expect(firstButton).toHaveAttribute('aria-pressed', 'true');
    await expect(firstButton).toHaveCSS('outline-style', 'solid');
  });

  test('aligns side-panel controls to the same right edge as footer actions', async ({ page }) => {
    await openWorkspace(page);
    const header = page.getByRole('banner');

    await header.locator('#praios-header-tab-kick').click();
    await expectPanelControlsAligned(page, 'kick-side-panel');

    await header.locator('#praios-header-tab-stats').click();
    await expectPanelControlsAligned(page, 'stats-side-panel');

    await header.locator('#praios-header-tab-sat').click();
    await expectPanelControlsAligned(page, 'sat-side-panel');
  });

  test('keeps launch checkbox controls compact without pointer focus outlines', async ({
    page,
  }) => {
    await openWorkspace(page);
    await page.getByRole('banner').locator('#praios-header-tab-kick').click();

    const checkboxes = page.getByTestId('kick-side-panel').locator('.bp6-checkbox, .bp5-checkbox');

    await expect(checkboxes).toHaveCount(2);

    for (let index = 0; index < 2; index += 1) {
      const checkbox = checkboxes.nth(index);
      const metrics = await checkbox.evaluate((element) => {
        const control = element.parentElement;
        const indicator = element.querySelector('.bp6-control-indicator, .bp5-control-indicator');

        if (!control || !indicator) throw new Error('Expected checkbox control and indicator');

        const controlRect = control.getBoundingClientRect();
        const checkboxRect = element.getBoundingClientRect();
        const indicatorRect = indicator.getBoundingClientRect();

        return {
          checkboxWidth: checkboxRect.width,
          controlRight: controlRect.right,
          indicatorHeight: indicatorRect.height,
          indicatorRight: indicatorRect.right,
          indicatorWidth: indicatorRect.width,
        };
      });

      expect(Math.round(metrics.checkboxWidth)).toBe(16);
      expect(Math.round(metrics.indicatorWidth)).toBe(16);
      expect(Math.round(metrics.indicatorHeight)).toBe(16);
      expect(Math.abs(metrics.indicatorRight - (metrics.controlRight - 10))).toBeLessThanOrEqual(1);

      await checkbox.click();
      await expect(checkbox).toHaveCSS('outline-style', 'none');
      await expect(checkbox.locator('.bp6-control-indicator, .bp5-control-indicator')).toHaveCSS(
        'box-shadow',
        'none',
      );
    }

    const fullWidthFooterButton = page
      .getByTestId('kick-side-panel')
      .locator('footer button')
      .last();
    const panelBox = await requireBox(page.getByTestId('kick-side-panel'));
    const fullWidthFooterButtonBox = await requireBox(fullWidthFooterButton);

    expect(Math.round(fullWidthFooterButtonBox.x)).toBeGreaterThan(Math.round(panelBox.x));
    expect(Math.round(fullWidthFooterButtonBox.x + fullWidthFooterButtonBox.width)).toBeLessThan(
      Math.round(panelBox.x + panelBox.width),
    );

    await fullWidthFooterButton.click();
    await expect(fullWidthFooterButton).toHaveCSS('outline-style', 'none');
    await expect(fullWidthFooterButton).toHaveCSS('box-shadow', 'none');
  });

  test('preserves keyboard focus visibility for launch checkbox and footer actions', async ({
    page,
  }) => {
    await openWorkspace(page);
    await page.getByRole('banner').locator('#praios-header-tab-kick').click();

    const panel = page.getByTestId('kick-side-panel');
    const firstCheckbox = panel.locator('.bp6-checkbox, .bp5-checkbox').first();
    const firstIndicator = firstCheckbox.locator('.bp6-control-indicator, .bp5-control-indicator');
    const fullWidthFooterButton = panel.locator('footer button').last();

    await page.locator('body').click();
    await tabUntilFocused(page, firstCheckbox);
    await expect(firstIndicator).toHaveCSS('outline-style', 'solid');
    await expect(firstIndicator).toHaveCSS('box-shadow', 'none');

    await page.locator('body').click();
    await tabUntilFocused(page, fullWidthFooterButton);
    await expect(fullWidthFooterButton).toHaveCSS('outline-style', 'none');
    await expect(fullWidthFooterButton).not.toHaveCSS('box-shadow', 'none');
  });

  test('uses the shared native select dropdown contract for launch selection fields', async ({
    page,
  }) => {
    await openWorkspace(page);
    await page.getByRole('banner').locator('#praios-header-tab-kick').click();

    const panel = page.getByTestId('kick-side-panel');
    const statsSelect = page.getByTestId('stats-side-panel').locator('select').first();
    const launchSelectMetrics = [];

    await expect(panel.locator('input[aria-autocomplete], input[list], datalist')).toHaveCount(0);
    await expect(panel.locator('[data-testid^="kick-combobox"]')).toHaveCount(0);

    for (const testId of KICK_SELECT_IDS) {
      const select = panel.getByTestId(testId);

      await expect(select).toBeVisible();
      await expect(select).toHaveJSProperty('tagName', 'SELECT');
      await expect(select).not.toHaveAttribute('aria-autocomplete');
      await expect(select).not.toHaveAttribute('list');

      const optionCount = await select.locator('option').count();
      expect(optionCount).toBeGreaterThanOrEqual(1);

      launchSelectMetrics.push(await readSelectMetrics(select));
    }

    await page.getByRole('banner').locator('#praios-header-tab-stats').click();
    await expect(statsSelect).toBeVisible();
    const statsSelectMetrics = await readSelectMetrics(statsSelect);

    for (const metrics of launchSelectMetrics) {
      expect(metrics).toEqual(statsSelectMetrics);
    }
  });

  test('makes launch comment and date fields editable', async ({ page }) => {
    await openWorkspace(page);
    await page.getByRole('banner').locator('#praios-header-tab-kick').click();

    const panel = page.getByTestId('kick-side-panel');
    const launchDate = panel.getByTestId('kick-launch-datetime');
    const launchCalendar = panel.getByTestId('kick-launch-datetime-calendar');
    const comment = panel.getByTestId('kick-comment');

    await expect(launchDate).toHaveAttribute('type', 'text');
    await expect(launchDate).toHaveValue('02.05.2026 | 16:31');
    expect(await launchDate.evaluate((element) => (element as HTMLInputElement).readOnly)).toBe(
      false,
    );
    await launchDate.fill('03.05.2026 | 12:45');
    await expect(launchDate).toHaveValue('03.05.2026 | 12:45');
    await expect(launchCalendar).toHaveAttribute('type', 'datetime-local');
    await expectCalendarInputUsable(launchCalendar);

    expect(await comment.evaluate((element) => (element as HTMLTextAreaElement).readOnly)).toBe(
      false,
    );
    await comment.fill('Тестовый комментарий');
    await expect(comment).toHaveValue('Тестовый комментарий');
  });

  test('fits the launch date-time value in the narrow launch field', async ({ page }) => {
    await openWorkspace(page);
    await page.getByRole('banner').locator('#praios-header-tab-kick').click();

    await expectInputTextFits(page.getByTestId('kick-launch-datetime'), '02.05.2026 | 16:31');
  });

  test('uses editable date-time controls in statistics period filters', async ({ page }) => {
    await openWorkspace(page);
    await page.getByRole('banner').locator('#praios-header-tab-stats').click();

    const panel = page.getByTestId('stats-side-panel');

    for (const [testId, value] of [
      ['stats-start-datetime', '25-04-2025 | 01:15'],
      ['stats-end-datetime', '26-04-2025 | 02:30'],
    ] as const) {
      const input = panel.getByTestId(testId);
      const calendar = panel.getByTestId(`${testId}-calendar`);

      await expect(input).toHaveAttribute('type', 'text');
      expect(await input.evaluate((element) => (element as HTMLInputElement).readOnly)).toBe(false);
      await input.fill(value);
      await expect(input).toHaveValue(value);
      await expect(calendar).toHaveAttribute('type', 'datetime-local');
      await expectCalendarInputUsable(calendar);
    }
  });

  test('renders an interactive MapLibre map instead of the CSS placeholder', async ({ page }) => {
    await openWorkspace(page);

    const map = page.getByTestId('workspace-map');
    const attribution = map.locator('.maplibregl-ctrl-attrib');

    await expect(map.locator('.maplibregl-canvas')).toBeVisible();
    await expect(map.locator('.maplibregl-ctrl-zoom-in')).toBeVisible();
    await expect(map.locator('.maplibregl-ctrl-zoom-out')).toBeVisible();
    await expect(attribution).toBeVisible();
    await expect(attribution).toContainText('OpenStreetMap');
    await expect(attribution).not.toHaveClass(/maplibregl-compact/);
  });

  test('shows the probing side menu without replacing the map', async ({ page }) => {
    await openWorkspace(page);

    await page.getByRole('banner').locator('#praios-header-tab-sat').click();

    const satPanel = page.getByTestId('sat-side-panel');

    await expect(satPanel).toBeVisible();
    await expect(page.getByTestId('workspace-map')).toBeVisible();
    await expect(satPanel.getByText('Зондирование')).toBeVisible();
  });

  test('keeps probing comment separate from the editable launch comment', async ({ page }) => {
    await openWorkspace(page);
    await page.getByRole('banner').locator('#praios-header-tab-sat').click();

    const satPanel = page.getByTestId('sat-side-panel');
    const comment = satPanel.locator('textarea');

    await expect(satPanel.locator('[data-testid="kick-comment"]')).toHaveCount(0);
    await expect(comment).toHaveCount(1);
    expect(await comment.evaluate((element) => (element as HTMLTextAreaElement).readOnly)).toBe(
      true,
    );
  });
});
