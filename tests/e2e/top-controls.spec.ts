// cspell:disable
import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectConsoleErrors } from './helpers/console-errors';

const VIEWPORT = { width: 1920, height: 1080 };
const HEADER_HEIGHT = 48;
const RAIL_COLLAPSED_WIDTH = 50;
const RAIL_EXPANDED_WIDTH = 240;
const PANEL_WIDTH = 300;
const WORKSPACE_MOTION_DURATION_MS = 220;

const ALL_TABS = ['map', 'bar', 'tmi', 'sat', 'kick', 'stats'] as const;
const PANEL_TABS = ['kick', 'stats', 'sat'] as const;

async function openWorkspace(page: Page) {
  await page.setViewportSize(VIEWPORT);
  await page.goto('/');
  await expect(page.getByTestId('workspace-shell')).toBeVisible();
}

async function selectTab(page: Page, tab: (typeof ALL_TABS)[number]) {
  if (tab !== 'map') {
    await page.getByRole('banner').locator(`#praios-header-tab-${tab}`).click();
  }
  await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', tab);
  // Let the shell width motion settle so toolbar/map measurements are stable
  // (panel <-> rail transitions animate the left-area width over 220ms).
  await page.waitForTimeout(WORKSPACE_MOTION_DURATION_MS + 100);
}

async function requireBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Expected a visible bounding box');
  return box;
}

test.describe('Per-tab top control blocks', () => {
  test('renders a top control block above the map for every tab', async ({ page }) => {
    await openWorkspace(page);

    for (const tab of ALL_TABS) {
      await selectTab(page, tab);

      const toolbar = page.getByTestId('tab-top-controls');
      await expect(toolbar).toBeVisible();
      await expect(toolbar.locator('section[aria-label="Тип данных"]')).toBeVisible();

      const toolbarBox = await requireBox(toolbar);
      const mapBox = await requireBox(page.getByTestId('workspace-map'));

      expect(Math.round(toolbarBox.y)).toBe(HEADER_HEIGHT);
      expect(Math.round(mapBox.y)).toBeGreaterThanOrEqual(
        Math.round(toolbarBox.y + toolbarBox.height),
      );
      expect(Math.round(toolbarBox.x)).toBe(Math.round(mapBox.x));
    }
  });

  test('renders the map function icon groups with layer toggles', async ({ page }) => {
    await openWorkspace(page);
    await selectTab(page, 'map');

    const functions = page
      .getByTestId('tab-top-controls')
      .locator('section[aria-label="Функции карты"]');
    await expect(functions).toBeVisible();
    // Инфраструктура (11) + Наложения (8) + Борты (4) + Слои карты (9) = 32 icon buttons.
    await expect(functions.locator('button')).toHaveCount(32);
    await expect(functions.locator('img')).toHaveCount(32);
    await expect(functions.locator('.bp6-switch')).toHaveCount(2);
    expect(
      await functions
        .locator('img')
        .evaluateAll((imgs) =>
          imgs.every(
            (img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0,
          ),
        ),
    ).toBe(true);
  });

  test('shows the expected lead controls per tab', async ({ page }) => {
    await openWorkspace(page);
    const toolbar = page.getByTestId('tab-top-controls');

    await selectTab(page, 'bar');
    await expect(toolbar.getByPlaceholder('Поиск по названию, координатам')).toBeVisible();

    await selectTab(page, 'tmi');
    await expect(toolbar.getByText('Загрузить маршруты')).toBeVisible();
    await expect(toolbar.locator('select')).toHaveCount(6);

    await selectTab(page, 'sat');
    await expect(toolbar.getByText('Airbus')).toBeVisible();
    await expect(toolbar.getByText('Создать анимацию с замедленной сьемкой')).toBeVisible();

    await selectTab(page, 'kick');
    await expect(toolbar.getByPlaceholder('Поиск по таблице')).toBeVisible();
    await expect(toolbar.getByText('Фильтры')).toBeVisible();

    await selectTab(page, 'stats');
    await expect(toolbar.locator('section[aria-label="Работа с таблицей"]')).toBeVisible();
  });

  test('toggles the data-type segmented control with radiogroup semantics', async ({ page }) => {
    await openWorkspace(page);
    await selectTab(page, 'bar');

    const segmented = page
      .getByTestId('tab-top-controls')
      .locator('section[aria-label="Тип данных"] .bp6-segmented-control');
    await expect(segmented).toHaveAttribute('role', 'radiogroup');

    const radios = segmented.getByRole('radio');
    await expect(radios).toHaveCount(3);
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');

    await radios.nth(1).click();
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'false');
  });

  test('compresses with the left rail open/closed and keeps the data-type group pinned', async ({
    page,
  }) => {
    await openWorkspace(page);
    await selectTab(page, 'bar');

    const toolbar = page.getByTestId('tab-top-controls');
    const dataType = toolbar.locator('section[aria-label="Тип данных"]');
    const toggle = page.getByTestId('left-rail-button-collapse');

    expect(Math.round((await requireBox(toolbar)).x)).toBe(RAIL_COLLAPSED_WIDTH);
    const collapsedDataType = await requireBox(dataType);
    expect(Math.round(collapsedDataType.x + collapsedDataType.width)).toBeLessThanOrEqual(
      VIEWPORT.width,
    );

    await toggle.click();
    await page.waitForTimeout(WORKSPACE_MOTION_DURATION_MS + 100);

    expect(Math.round((await requireBox(toolbar)).x)).toBe(RAIL_EXPANDED_WIDTH);
    await expect(dataType).toBeVisible();
    const expandedDataType = await requireBox(dataType);
    expect(Math.round(expandedDataType.x + expandedDataType.width)).toBeLessThanOrEqual(
      VIEWPORT.width,
    );

    const scroll = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth);
  });

  test('aligns the toolbar with the 300px side-panel tabs', async ({ page }) => {
    await openWorkspace(page);

    for (const tab of PANEL_TABS) {
      await selectTab(page, tab);
      const toolbar = page.getByTestId('tab-top-controls');
      await expect(toolbar).toBeVisible();
      expect(Math.round((await requireBox(toolbar)).x)).toBe(PANEL_WIDTH);
    }
  });

  test('renders without console errors across all tabs', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await openWorkspace(page);

    for (const tab of ALL_TABS) {
      await selectTab(page, tab);
      await page.waitForTimeout(50);
    }

    expect(errors).toEqual([]);
  });
});
