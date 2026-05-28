import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './helpers/console-errors';

test('home renders an h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('home renders a Blueprint card', async ({ page }) => {
  await page.goto('/');
  // Blueprint v6 uses `.bp6-card`; allow v5 selector for migration parity.
  const card = page.locator('.bp6-card, .bp5-card');
  await expect(card.first()).toBeVisible();
});

test('no console errors on load', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});
