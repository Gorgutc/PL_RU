import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './helpers/console-errors';

test('home exposes the workspace heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'PraiOS workspace' })).toBeAttached();
});

test('home renders the workspace map as a Blueprint card surface', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('workspace-map-card')).toHaveClass(/bp6-card|bp5-card/);
});

test('no console errors on load', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});
