// @ts-check
/**
 * Playwright config
 * =================
 * Drives the E2E tests in tests/.  Assumes the local server is already
 * running on port 8090 (see README "Local development").  We don't auto-
 * start the server because Claude Preview manages it; running playwright's
 * own webServer would conflict.
 *
 * Run:
 *   npx playwright test                    # all tests
 *   npx playwright test --ui               # interactive watcher
 *   npx playwright test admin.spec         # one file
 */
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8090',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'ar-SA',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
