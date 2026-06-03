import { expect, test, type Locator, type Page } from '@playwright/test';

const HEADER_HEIGHT = 48;
const VIEWPORT_WIDTH = 1920;
const RAIL_HEIGHTS = [768, 900, 1080, 1200, 1440, 2160] as const;

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
    expect(Math.round(leftBox.width)).toBe(50);
    expect(Math.round(mapBox.x)).toBe(Math.round(leftBox.x + leftBox.width));
    expect(Math.round(mapBox.width)).toBe(VIEWPORT_WIDTH - Math.round(leftBox.width));
    expect(Math.round(mapBox.height)).toBe(1080 - HEADER_HEIGHT);
  });

  test('syncs tab-specific left panels with Header state', async ({ page }) => {
    await openWorkspace(page);
    const header = page.getByRole('banner');

    await expect(page.getByTestId('left-rail')).toBeVisible();
    await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', 'map');

    await header.locator('#praios-header-tab-kick').click();

    await expect(page.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'praios-header-tab-kick',
    );
    await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', 'kick');
    await expect(page.getByTestId('kick-side-panel')).toBeVisible();
    await expect(page.getByText('Создание параметров для пуска')).toBeVisible();
    expect(Math.round((await requireBox(page.getByTestId('workspace-left-area'))).width)).toBe(300);

    await header.locator('#praios-header-tab-stats').click();

    await expect(page.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'praios-header-tab-stats',
    );
    await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', 'stats');
    await expect(page.getByTestId('stats-side-panel')).toBeVisible();
    await expect(page.getByText('Фильтры таблицы')).toBeVisible();
    expect(Math.round((await requireBox(page.getByTestId('workspace-left-area'))).width)).toBe(300);
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

      expect(Math.round(railBox.width)).toBe(50);
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
});
