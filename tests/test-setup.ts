import { test as base, expect } from '@playwright/test';

const test = base;

test.beforeEach(async ({ page }) => {
  // Block telemetry request that returns 401 and pollutes console output.
  await page.route('**/submit?universe=*', (route) => route.abort());
});

export { test, expect };
