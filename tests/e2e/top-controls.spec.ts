// cspell:disable
import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectConsoleErrors } from './helpers/console-errors';

const VIEWPORT = { width: 1920, height: 1080 };
const HEADER_HEIGHT = 48;
const RAIL_COLLAPSED_WIDTH = 50;
const RAIL_EXPANDED_WIDTH = 240;
const PANEL_WIDTH = 300;
const WORKSPACE_MOTION_DURATION_MS = 220;
// The per-tab toolbar must keep a constant height so switching tabs never resizes
// the map stage (frozen A13): 10px top padding + an 86px control card.
const TOP_CONTROLS_HEIGHT = 96;
const TOP_CONTROL_CARD_HEIGHT = 86;
const MAP_DATE_CARD_WIDTH = 320;
const MAP_DATE_FIELD_WIDTH = 142;
const MAP_DATE_FIELD_HEIGHT = 30;

const ALL_TABS = ['map', 'bar', 'tmi', 'sat', 'kick', 'stats'] as const;
const PANEL_TABS = ['kick', 'stats', 'sat'] as const;
// Reference adaptation widths (16:9) and the chrome content max-width.
const RESPONSIVE_WIDTHS = [1280, 1920, 2560, 3840] as const;
const CONTENT_MAX_WIDTH = 2560;

async function openWorkspace(page: Page) {
  await page.setViewportSize(VIEWPORT);
  await page.goto('/');
  await expect(page.getByTestId('workspace-shell')).toBeVisible();
  await expect(page.getByRole('banner').locator('#praios-header-tab-map')).toBeVisible();
  await page.waitForTimeout(WORKSPACE_MOTION_DURATION_MS + 100);
}

async function selectTab(page: Page, tab: (typeof ALL_TABS)[number]) {
  // Always click the Header tab (clicking the already-active tab is a no-op) so
  // the helper works mid-test regardless of which tab is currently active.
  await page.getByRole('banner').locator(`#praios-header-tab-${tab}`).click();
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
      // kick/stats render the table container in the center instead of the map.
      const isTableTab = tab === 'kick' || tab === 'stats';
      const centerBox = await requireBox(
        page.getByTestId(isTableTab ? 'workspace-table' : 'workspace-map'),
      );

      expect(Math.round(toolbarBox.y)).toBe(HEADER_HEIGHT);
      expect(Math.round(centerBox.y)).toBeGreaterThanOrEqual(
        Math.round(toolbarBox.y + toolbarBox.height),
      );
      expect(Math.round(toolbarBox.x)).toBe(Math.round(centerBox.x));

      // Constant toolbar height across every tab — a regression to taller
      // controls (e.g. 32px selects) would resize the map stage on tab switch.
      expect(Math.round(toolbarBox.height)).toBe(TOP_CONTROLS_HEIGHT);

      // Full-width contract: the leading-groups scroller has no internal
      // horizontal overflow and never overlaps the pinned data-type group.
      const fit = await toolbar.evaluate((el) => {
        const scroller = el.firstElementChild as HTMLElement;
        const trailing = el.lastElementChild as HTMLElement;
        const scrollerRect = scroller.getBoundingClientRect();
        const trailingRect = trailing.getBoundingClientRect();
        return {
          scrollerOverflow: scroller.scrollWidth - scroller.clientWidth,
          overlap: Math.round(scrollerRect.right) - Math.round(trailingRect.left),
        };
      });
      expect(fit.scrollerOverflow).toBeLessThanOrEqual(1);
      expect(fit.overlap).toBeLessThanOrEqual(0);
    }
  });

  test('renders the map function icon groups with layer toggles', async ({ page }) => {
    // At the wider chrome cap all map function icons and layer toggles are visible.
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/');
    await expect(page.getByTestId('workspace-shell')).toBeVisible();

    const functions = page
      .getByTestId('tab-top-controls')
      .locator('section[aria-label="Функции карты"]');
    await expect(functions).toBeVisible();
    // Инфраструктура (11) + Наложения (8) + Борты (4) + Слои карты (9) = 32 icon
    // buttons. At 1920 everything fits, so no overflow chevron appears; the
    // Слои карты group also carries the two map toggles.
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
    // Every icon button keeps a non-empty accessible name.
    const iconLabels = await functions
      .locator('button')
      .evaluateAll((els) => els.map((el) => (el.getAttribute('aria-label') ?? '').trim()));
    expect(iconLabels.length).toBe(32);
    expect(iconLabels.every((label) => label.length > 0)).toBe(true);
    // Both layer toggles keep accessible names.
    const toggleLabels = await functions
      .locator('.bp6-switch input')
      .evaluateAll((els) => els.map((el) => (el.getAttribute('aria-label') ?? '').trim()));
    expect(toggleLabels.length).toBe(2);
    expect(toggleLabels.every((label) => label.length > 0)).toBe(true);
  });

  test('keeps the map date card on the 1920 Figma sizing contract', async ({ page }) => {
    await openWorkspace(page);
    await selectTab(page, 'map');

    const toolbar = page.getByTestId('tab-top-controls');
    const scroller = toolbar.locator(':scope > div').first();
    const sections = scroller.locator(':scope > section');
    const dateCard = sections.first();
    const functionsCard = sections.nth(1);
    const fields = dateCard.locator('input');

    await expect(fields).toHaveCount(2);
    await expect(fields.nth(0)).toHaveValue('24-04-2025');
    await expect(fields.nth(1)).toHaveValue('24-04-2025');

    const cardBox = await requireBox(dateCard);
    expect(Math.round(cardBox.width)).toBe(MAP_DATE_CARD_WIDTH);
    expect(Math.round(cardBox.height)).toBe(TOP_CONTROL_CARD_HEIGHT);

    for (let index = 0; index < 2; index += 1) {
      const fieldBox = await requireBox(fields.nth(index));
      expect(Math.round(fieldBox.width)).toBe(MAP_DATE_FIELD_WIDTH);
      expect(Math.round(fieldBox.height)).toBe(MAP_DATE_FIELD_HEIGHT);
    }

    const dateCardMetrics = await dateCard.evaluate((el) => {
      const title = el.querySelector('[class*="fieldTitle"]') as HTMLElement | null;
      const range = el.querySelector('[class*="dateTimeRange"]') as HTMLElement | null;
      const input = el.querySelector('input') as HTMLInputElement | null;
      const cs = getComputedStyle(el);
      const titleCs = title ? getComputedStyle(title) : null;
      const inputCs = input ? getComputedStyle(input) : null;
      const rangeCs = range ? getComputedStyle(range) : null;

      return {
        cardPadding: cs.padding,
        cardRadius: cs.borderRadius,
        cardBackground: cs.backgroundColor,
        cardOutlineColor: cs.outlineColor,
        cardOutlineStyle: cs.outlineStyle,
        cardOutlineWidth: cs.outlineWidth,
        rangeGap: rangeCs?.columnGap ?? '',
        titleFontSize: titleCs?.fontSize ?? '',
        titleFontWeight: titleCs?.fontWeight ?? '',
        titleLineHeight: titleCs?.lineHeight ?? '',
        inputRadius: inputCs?.borderRadius ?? '',
        inputFontSize: inputCs?.fontSize ?? '',
        inputLineHeight: inputCs?.lineHeight ?? '',
      };
    });
    expect(dateCardMetrics).toMatchObject({
      cardPadding: '16px',
      cardRadius: '2px',
      cardBackground: 'rgb(23, 29, 32)',
      cardOutlineColor: 'rgb(114, 118, 119)',
      cardOutlineStyle: 'solid',
      cardOutlineWidth: '1px',
      rangeGap: '4px',
      titleFontSize: '12px',
      titleFontWeight: '500',
      titleLineHeight: '16px',
      inputRadius: '3px',
      inputFontSize: '12px',
      inputLineHeight: '16px',
    });

    const finalDateBox = await requireBox(dateCard);
    const functionsBox = await requireBox(functionsCard);
    expect(Math.round(finalDateBox.x + finalDateBox.width)).toBeLessThanOrEqual(
      Math.round(functionsBox.x),
    );

    const scrollerOverflow = await scroller.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(scrollerOverflow).toBeLessThanOrEqual(1);
  });

  test('moves extra map layer icons into the rightmost dropdown at 1920', async ({ page }) => {
    await openWorkspace(page);
    await selectTab(page, 'map');

    const toolbar = page.getByTestId('tab-top-controls');
    const scroller = toolbar.locator(':scope > div').first();
    const functionsCard = scroller.locator(':scope > section').nth(1);
    const dataTypeCard = toolbar.locator('section[aria-label="Тип данных"]');
    const iconGroups = functionsCard.locator('[class*="iconGroup"]');
    const layerGroup = functionsCard.locator('[class*="iconGroup"]').last();
    const iconRows = iconGroups.locator('[class*="iconRow"]');
    const switches = layerGroup.locator('[class*="layerToggles"] label');

    await expect(iconGroups).toHaveCount(4);
    await expect(switches).toHaveCount(2);
    await expect(switches.nth(0)).toBeHidden();
    await expect(switches.nth(1)).toBeHidden();

    await expect(iconRows.nth(0).locator('button')).toHaveCount(11);
    await expect(iconRows.nth(1).locator('button')).toHaveCount(8);
    await expect(iconRows.nth(2).locator('button')).toHaveCount(4);
    await expect(iconRows.nth(3).locator('button')).toHaveCount(4);
    await expect(layerGroup.locator('[class*="iconDivider"]')).toHaveCount(2);

    const layerImageIds = await layerGroup
      .locator('[class*="iconRow"] img')
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('data-icon-id')));
    expect(layerImageIds).toEqual(['hydromap', 'google', 'yandex-plus']);
    await expect(layerGroup.locator('[class*="iconRow"] button').last().locator('img')).toHaveCount(
      0,
    );

    const overflowButton = layerGroup.getByTestId('map-layer-overflow-trigger');
    await expect(overflowButton).toHaveAttribute('aria-haspopup', 'menu');
    await overflowButton.click();

    const overflowMenu = page.getByTestId('map-layer-overflow-menu');
    await expect(overflowMenu).toBeVisible();
    await expect(overflowMenu.locator('[data-icon-id="yandex"]')).toBeVisible();
    const hiddenYandexItem = overflowMenu.locator('[data-menu-icon-id="yandex"]');
    await expect(hiddenYandexItem).toHaveAttribute('aria-pressed', 'false');
    await hiddenYandexItem.click();
    await expect(hiddenYandexItem).toHaveAttribute('aria-pressed', 'true');
    await expect(overflowMenu.locator('.bp6-switch, .bp5-switch')).toHaveCount(2);

    const groupBoxes = await iconGroups.evaluateAll((groups) =>
      groups.map((group) => {
        const rect = group.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      }),
    );
    for (let index = 0; index < groupBoxes.length - 1; index += 1) {
      expect(Math.round(groupBoxes[index + 1].left - groupBoxes[index].right)).toBe(16);
    }

    const buttonEdgeGaps = await iconRows.evaluateAll((rows) =>
      rows.slice(0, -1).map((row, index) => {
        const currentLastButton = row.querySelector('button:last-of-type');
        const nextFirstButton = rows[index + 1]?.querySelector('button:first-of-type');
        if (!currentLastButton || !nextFirstButton) return Number.NaN;
        return (
          nextFirstButton.getBoundingClientRect().left -
          currentLastButton.getBoundingClientRect().right
        );
      }),
    );
    expect(buttonEdgeGaps.map(Math.round)).toEqual([16, 16, 16]);

    const dataTypeBox = await requireBox(dataTypeCard);
    expect(Math.round(dataTypeBox.width)).toBeGreaterThanOrEqual(440);
    const dataTypeSegments = dataTypeCard.locator('.bp6-button, .bp5-button');
    await expect(dataTypeSegments).toHaveCount(2);
    const dataTypeSegmentWidths = await dataTypeSegments.evaluateAll((buttons) =>
      buttons.map((button) => button.getBoundingClientRect().width),
    );
    expect(Math.abs(dataTypeSegmentWidths[0] - dataTypeSegmentWidths[1])).toBeLessThanOrEqual(1);

    const firstRowGap = await iconRows.first().evaluate((row) => getComputedStyle(row).columnGap);
    expect(firstRowGap).toBe('4px');

    const firstLayerButton = await requireBox(
      layerGroup.locator('[class*="iconRow"] button').first(),
    );
    expect(Math.round(firstLayerButton.width)).toBe(32);
    expect(Math.round(firstLayerButton.height)).toBe(30);
  });

  test('shows the expected lead controls per tab', async ({ page }) => {
    await openWorkspace(page);
    const toolbar = page.getByTestId('tab-top-controls');

    await selectTab(page, 'bar');
    await expect(toolbar.getByPlaceholder('Поиск по названию')).toBeVisible();

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

  test('keeps the sat animation control a resting-outlined toggle (rest -> active)', async ({
    page,
  }) => {
    await openWorkspace(page);
    await selectTab(page, 'sat');

    const button = page
      .getByTestId('tab-top-controls')
      .getByRole('button', { name: /Создать анимацию/ });
    await expect(button).toBeVisible();

    // Rest: outlined, NOT a filled accent button (the bug was a permanent fill).
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(await button.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgba(0, 0, 0, 0)',
    );

    // Click toggles it on and fills it with the accent, like the account button.
    // Move the pointer off the button first so we read the resting active fill
    // (#2970ff), not the lighter hover fill (#528bff).
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(0, 0);
    expect(await button.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgb(41, 112, 255)',
    );

    // Click again returns it to the resting outlined state.
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    // Even while still focused after a pointer click (and not hovered), the resting
    // button keeps its hairline outline — it must never go borderless.
    await page.mouse.move(0, 0);
    const rest = await button.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        outlineStyle: cs.outlineStyle,
        outlineWidth: Number.parseFloat(cs.outlineWidth),
      };
    });
    expect(rest.bg).toBe('rgba(0, 0, 0, 0)');
    expect(rest.outlineStyle).toBe('solid');
    expect(rest.outlineWidth).toBeGreaterThan(0);
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

    // Check both the lean `bar` toolbar and the dense `map` toolbar (32 icon
    // buttons + toggles) — the map block is the most likely to overflow.
    for (const tab of ['bar', 'map'] as const) {
      await selectTab(page, tab);

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

      // Collapse again so the next tab starts from the collapsed rail.
      await toggle.click();
      await page.waitForTimeout(WORKSPACE_MOTION_DURATION_MS + 100);
    }
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

  test('keeps the map toolbar fitting and capped across viewport widths', async ({ page }) => {
    // The map tab is the densest toolbar: a fixed 320px Figma date card + an
    // adaptive map-functions card + the pinned "Тип данных" card. Rail-collapsed
    // is the 1920 visual target; expanded and narrower widths must still avoid
    // page scroll and data-type overlap while icon groups trim into chevrons.
    const SCROLLER_FIT_BUDGET = { collapsed: 1, expanded: 6 } as const;
    for (const width of RESPONSIVE_WIDTHS) {
      const height = Math.round((width * 9) / 16);
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.getByTestId('workspace-shell')).toBeVisible();

      const toolbar = page.getByTestId('tab-top-controls');
      await expect(toolbar).toBeVisible();
      const dataType = toolbar.locator('section[aria-label="Тип данных"]');
      const collapseToggle = page.getByTestId('left-rail-button-collapse');
      await expect(collapseToggle).toBeVisible();
      // The shell appears before React has always wired the rail toggle after a
      // fresh goto at every viewport. Let the first interactive click settle.
      await page.waitForTimeout(WORKSPACE_MOTION_DURATION_MS + 100);

      for (const state of ['collapsed', 'expanded'] as const) {
        if (state === 'expanded') {
          await collapseToggle.click();
          await expect
            .poll(async () => Math.round((await requireBox(toolbar)).x), {
              message: `rail did not expand at ${width}px`,
              timeout: WORKSPACE_MOTION_DURATION_MS + 2_000,
            })
            .toBe(RAIL_EXPANDED_WIDTH);
        }

        const railWidth = state === 'expanded' ? RAIL_EXPANDED_WIDTH : RAIL_COLLAPSED_WIDTH;
        // The toolbar starts at the rail's right edge.
        expect(Math.round((await requireBox(toolbar)).x)).toBe(railWidth);

        // The data-type group stays visible, within the viewport, and never past
        // the capped chrome width (rail + content max-width — matters at 3840).
        await expect(dataType).toBeVisible();
        const dt = await requireBox(dataType);
        expect(Math.round(dt.x + dt.width)).toBeLessThanOrEqual(width);
        expect(Math.round(dt.x + dt.width)).toBeLessThanOrEqual(railWidth + CONTENT_MAX_WIDTH + 1);

        // No horizontal page scroll at any width or rail state.
        const scroll = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth);

        // The leading-groups scroller fits within its per-rail-state budget (see above).
        const scrollerOverflow = await toolbar.evaluate((el) => {
          const scroller = el.firstElementChild as HTMLElement;
          return scroller.scrollWidth - scroller.clientWidth;
        });
        expect(scrollerOverflow, `scroller overflow at ${width}px ${state}`).toBeLessThanOrEqual(
          SCROLLER_FIT_BUDGET[state],
        );

        if (state === 'expanded') {
          await collapseToggle.click();
          await expect
            .poll(async () => Math.round((await requireBox(toolbar)).x), {
              message: `rail did not collapse at ${width}px`,
              timeout: WORKSPACE_MOTION_DURATION_MS + 2_000,
            })
            .toBe(RAIL_COLLAPSED_WIDTH);
        }
      }
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
