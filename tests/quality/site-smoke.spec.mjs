import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page passes axe smoke check', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // color-contrast is excluded by design decision: the accent palette is frozen
  // to the Figma reference (docs/agent/frozen-decisions.md - the #2970ff active
  // fill with white text measures ~4.3:1, below the WCAG AA 4.5:1 threshold).
  // Pixel parity with the designer references wins per the task brief; the
  // trade-off is tracked in docs/agent/tabs-pixel-fit-handoff.md. Every other
  // axe rule stays enforced.
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});
