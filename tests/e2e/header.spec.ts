// cspell:disable
import { expect, test } from '@playwright/test';

test.describe('PraiOS header', () => {
  test('renders Figma header regions and action controls', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const header = page.getByRole('banner');
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS('height', '48px');
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
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const header = page.getByRole('banner');
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

  test('keeps Figma header dimensions stable at 1920px', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const header = page.getByRole('banner');
    const mapBox = await header.getByRole('tab', { name: 'Оперативная карта' }).boundingBox();
    const barBox = await header.getByRole('tab', { name: 'Маршруты' }).boundingBox();
    const brandBox = await header.getByText('Центр управления полетами').boundingBox();
    const tabsBox = await page.getByTestId('praios-header-tabs').boundingBox();
    const actionsBox = await header.getByRole('button', { name: 'Уведомления' }).boundingBox();
    const statsText = header.getByRole('tab', { name: 'Статистика' }).locator('.bp6-button-text');

    expect(mapBox?.width).toBe(154);
    expect(barBox?.width).toBe(153);
    expect(brandBox).not.toBeNull();
    expect(tabsBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect((brandBox?.x ?? 0) + (brandBox?.width ?? 0)).toBeLessThanOrEqual(tabsBox?.x ?? 0);
    expect((tabsBox?.x ?? 0) + (tabsBox?.width ?? 0)).toBeLessThanOrEqual(actionsBox?.x ?? 0);
    const statsTextBox = await statsText.evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(statsTextBox.scrollWidth).toBeLessThanOrEqual(statsTextBox.clientWidth);
  });
});
