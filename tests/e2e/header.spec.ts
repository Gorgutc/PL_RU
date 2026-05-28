// cspell:disable
import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectConsoleErrors } from './helpers/console-errors';

const HEADER_HEIGHT = 48;
const VIEWPORT_HEIGHT = 1080;
const COMPACT_WIDTHS = [1280, 1440] as const;
const EXPANDED_WIDTHS = [1920, 2560, 3860] as const;
const TAB_NAMES = [
  'Оперативная карта',
  'Маршруты',
  'Телеметрия',
  'Зондирование',
  'Введение пусков',
  'Статистика',
] as const;

async function openHeader(page: Page, width: number) {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.goto('/');

  const header = page.getByRole('banner');
  await expect(header).toBeVisible();
  await expect(header).toHaveCSS('height', `${HEADER_HEIGHT}px`);

  return header;
}

async function requireBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Expected visible bounding box');
  return box;
}

async function expectHeaderRegionsDoNotOverlap(page: Page, header: Locator) {
  const descriptorBox = await requireBox(header.getByText('Центр управления полетами'));
  const tabsBox = await requireBox(page.getByTestId('praios-header-tabs'));
  const actionsStartBox = await requireBox(header.getByRole('button', { name: 'Данные' }));

  expect(descriptorBox.x + descriptorBox.width).toBeLessThanOrEqual(tabsBox.x + 1);
  expect(tabsBox.x + tabsBox.width).toBeLessThanOrEqual(actionsStartBox.x + 1);
}

async function expectTabTextFits(tab: Locator) {
  const textBox = await tab.locator('.bp6-button-text').evaluate((el) => ({
    clientWidth: el.clientWidth,
    scrollWidth: el.scrollWidth,
  }));

  expect(textBox.scrollWidth).toBeLessThanOrEqual(textBox.clientWidth);
}

test.describe('PraiOS header', () => {
  test('renders Figma header regions and action controls', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const header = await openHeader(page, 1920);

    await expect(header.getByText('PraiOS')).toBeVisible();
    await expect(header.getByText('Центр управления полетами')).toBeVisible();

    await expect(header.getByRole('tab', { name: 'Оперативная карта' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(header.getByRole('button', { name: 'Данные' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'База данных' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Аккаунт' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Уведомления' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Данные' })).toBeDisabled();

    expect(errors).toEqual([]);
  });

  test('switches active header tab through page state', async ({ page }) => {
    const header = await openHeader(page, 1920);
    const probeTab = header.getByRole('tab', { name: 'Зондирование' });

    await probeTab.click();

    await expect(probeTab).toHaveAttribute('aria-selected', 'true');
    await expect(header.getByRole('tab', { name: 'Оперативная карта' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await expect(page.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'praios-header-tab-sat',
    );
    await expect(page.getByTestId('active-tab-stub')).toHaveText('4');
  });

  for (const width of COMPACT_WIDTHS) {
    test(`keeps compact icon-only header layout at ${width}px`, async ({ page }) => {
      const header = await openHeader(page, width);

      for (const name of TAB_NAMES) {
        const tab = header.getByRole('tab', { name });
        const box = await requireBox(tab);

        expect(Math.round(box.width)).toBe(80);
        await expect(tab.locator('.bp6-button-text')).toBeHidden();
      }

      const tabsBox = await requireBox(page.getByTestId('praios-header-tabs'));
      expect(Math.round(tabsBox.width)).toBe(480);
      await expectHeaderRegionsDoNotOverlap(page, header);
    });
  }

  for (const width of EXPANDED_WIDTHS) {
    test(`keeps expanded Figma header dimensions at ${width}px`, async ({ page }) => {
      const header = await openHeader(page, width);
      const expectedWidths = [154, 154, 153, 153, 153, 153];

      for (const [index, name] of TAB_NAMES.entries()) {
        const tab = header.getByRole('tab', { name });
        const box = await requireBox(tab);

        expect(Math.round(box.width)).toBe(expectedWidths[index]);
        await expect(tab.locator('.bp6-button-text')).toBeVisible();
        await expectTabTextFits(tab);
      }

      const tabsBox = await requireBox(page.getByTestId('praios-header-tabs'));
      expect(Math.round(tabsBox.width)).toBe(920);
      await expectHeaderRegionsDoNotOverlap(page, header);
    });
  }

  test('uses Figma tab colors and keeps base tabs borderless', async ({ page }) => {
    const header = await openHeader(page, 1920);
    const activeTab = header.getByRole('tab', { name: 'Оперативная карта' });
    const baseTab = header.getByRole('tab', { name: 'Телеметрия' });
    const hoverTab = header.getByRole('tab', { name: 'Маршруты' });

    await expect(activeTab).toHaveCSS('background-color', 'rgb(41, 112, 255)');
    await expect(activeTab.locator('.bp6-icon')).toHaveCSS('color', 'rgb(255, 255, 255)');

    const baseChrome = await baseTab.evaluate((el) => {
      const styles = window.getComputedStyle(el);

      return {
        backgroundColor: styles.backgroundColor,
        borderBottomWidth: styles.borderBottomWidth,
        borderLeftWidth: styles.borderLeftWidth,
        borderRightWidth: styles.borderRightWidth,
        borderTopWidth: styles.borderTopWidth,
        boxShadow: styles.boxShadow,
        outlineStyle: styles.outlineStyle,
      };
    });

    expect(baseChrome).toEqual({
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderBottomWidth: '0px',
      borderLeftWidth: '0px',
      borderRightWidth: '0px',
      borderTopWidth: '0px',
      boxShadow: 'none',
      outlineStyle: 'none',
    });

    await hoverTab.hover();
    await expect(hoverTab).toHaveCSS('background-color', 'rgb(82, 139, 255)');
    await expect(hoverTab.locator('.bp6-icon')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(hoverTab.locator('.bp6-button-text')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(hoverTab).toHaveCSS('box-shadow', 'none');
  });
});
