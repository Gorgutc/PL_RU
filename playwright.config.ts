import { defineConfig } from '@playwright/test';
import { createPlaywrightConfig } from './playwright.shared.config';

export default defineConfig(createPlaywrightConfig('./tests/e2e'));
