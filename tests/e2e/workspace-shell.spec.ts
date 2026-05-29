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
    });
  }

  test('shows the probing placeholder side menu without replacing the map', async ({ page }) => {
    await openWorkspace(page);

    await page.getByRole('banner').locator('#praios-header-tab-sat').click();

    const satPanel = page.getByTestId('sat-side-panel');

    await expect(satPanel).toBeVisible();
    await expect(page.getByTestId('workspace-map')).toBeVisible();
    await expect(satPanel.getByText('Зондирование')).toBeVisible();
  });
});
