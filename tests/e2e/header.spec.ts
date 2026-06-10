// cspell:disable
import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectConsoleErrors } from './helpers/console-errors';

const HEADER_HEIGHT = 48;
const VIEWPORT_HEIGHT = 1080;
const COMPACT_WIDTHS = [1280, 1440] as const;
const EXPANDED_WIDTHS = [1920, 2560, 3840] as const;
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

async function expectActionIconIsWhite(button: Locator) {
  await expect(button.locator('.bp6-icon').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
}

async function expectDropdownOffset(trigger: Locator, dropdown: Locator) {
  const triggerBox = await requireBox(trigger);
  const dropdownBox = await requireBox(dropdown);
  const offset = dropdownBox.y - (triggerBox.y + triggerBox.height);

  expect(offset).toBeGreaterThanOrEqual(3.5);
  expect(offset).toBeLessThanOrEqual(4.5);
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
    await expect(header.getByRole('button', { name: 'База данных' })).toBeDisabled();
    await expect(header.getByRole('button', { name: 'Аккаунт' })).toBeEnabled();
    await expect(header.getByRole('button', { name: 'Уведомления' })).toBeEnabled();

    await expectActionIconIsWhite(header.getByRole('button', { name: 'Данные' }));
    await expectActionIconIsWhite(header.getByRole('button', { name: 'База данных' }));
    await expectActionIconIsWhite(header.getByRole('button', { name: 'Аккаунт' }));
    await expectActionIconIsWhite(header.getByRole('button', { name: 'Уведомления' }));

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
    await expect(page.getByTestId('sat-side-panel')).toBeVisible();
    await expect(page.getByTestId('workspace-left-area')).toHaveAttribute('data-tab', 'sat');
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

  test('opens account dropdown from the account action button', async ({ page }) => {
    const header = await openHeader(page, 1920);
    const accountButton = header.getByRole('button', { name: 'Аккаунт' });

    await expect(accountButton).toHaveAttribute('aria-expanded', 'false');
    await accountButton.hover();
    await expect(accountButton).toHaveCSS('border-color', 'rgb(132, 173, 255)');

    await accountButton.click();

    await expect(accountButton).toHaveAttribute('aria-expanded', 'true');
    await expect(accountButton).toHaveCSS('background-color', 'rgb(41, 112, 255)');
    const accountMenu = page.getByRole('menu', { name: 'Блок профиля' });
    await expect(accountMenu).toBeVisible();
    await expectDropdownOffset(accountButton, accountMenu);
    await expect(page.getByRole('menuitem', { name: 'Изменить профиль' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Выйти из аккаунта' })).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Изменить профиль' }).locator('.bp6-icon'),
    ).toHaveCSS('color', 'rgb(255, 255, 255)');

    const accountMenuMetrics = await accountMenu.evaluate((menu) => {
      const styles = getComputedStyle(menu);
      const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
      const firstItemBox = items[0]?.getBoundingClientRect();
      const secondItemBox = items[1]?.getBoundingClientRect();
      const itemGap =
        firstItemBox && secondItemBox ? Math.round(secondItemBox.top - firstItemBox.bottom) : null;

      return {
        borderTopLeftRadius: styles.borderTopLeftRadius,
        borderTopWidth: styles.borderTopWidth,
        itemGap,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        paddingTop: styles.paddingTop,
      };
    });

    expect(accountMenuMetrics).toEqual({
      borderTopLeftRadius: '2px',
      borderTopWidth: '1px',
      itemGap: 8,
      paddingBottom: '16px',
      paddingLeft: '8px',
      paddingRight: '8px',
      paddingTop: '16px',
    });

    await page.keyboard.press('Escape');

    await expect(accountButton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('menu', { name: 'Блок профиля' })).toBeHidden();
  });

  test('opens notification dropdown and filters placeholder notifications', async ({ page }) => {
    const header = await openHeader(page, 1920);
    const notificationsButton = header.getByRole('button', { name: 'Уведомления' });

    await expect(notificationsButton).toHaveAttribute('aria-expanded', 'false');

    await notificationsButton.click();

    const panel = page.getByRole('dialog', { name: 'All notifications' });
    await expect(notificationsButton).toHaveAttribute('aria-expanded', 'true');
    await expect(notificationsButton).toHaveCSS('background-color', 'rgb(41, 112, 255)');
    await expect(panel).toBeVisible();
    await expectDropdownOffset(notificationsButton, panel);
    await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Unread (11)' })).toBeVisible();
    await expect(panel.getByText('Telemetry window updated')).toBeVisible();

    await page.getByRole('button', { name: 'AI Info' }).click();

    await expect(page.getByRole('button', { name: 'AI Info' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(panel.getByText('AI risk scan completed')).toBeVisible();
    await expect(panel.getByText('Telemetry window updated')).toBeHidden();

    await page.getByRole('button', { name: 'Mark all as read' }).click();
    await page.getByRole('button', { name: 'Unread (0)' }).click();

    await expect(panel.getByText('No notifications')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(notificationsButton).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
  });

  test('keeps account and notification popovers mutually exclusive', async ({ page }) => {
    const header = await openHeader(page, 1920);
    const accountButton = header.getByRole('button', { name: 'Аккаунт' });
    const notificationsButton = header.getByRole('button', { name: 'Уведомления' });

    await accountButton.click();

    await expect(accountButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('menu', { name: 'Блок профиля' })).toBeVisible();

    await notificationsButton.click();

    await expect(accountButton).toHaveAttribute('aria-expanded', 'false');
    await expect(notificationsButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('menu', { name: 'Блок профиля' })).toBeHidden();
    await expect(page.getByRole('dialog', { name: 'All notifications' })).toBeVisible();
  });
});
