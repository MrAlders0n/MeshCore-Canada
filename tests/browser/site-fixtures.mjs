import { test as base } from "@playwright/test";
export { expect } from "@playwright/test";

// Keep routine browser tests off the public aggregate API. Individual tests
// can override this route to exercise errors, payloads, and cache behavior.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("https://dev.meshcore.ca/api/v1/stats/**", route => route.fulfill({
      json: route.request().url().endsWith("overview")
        ? { activeObservers: 12, activeIatas: 4, totalPackets: 900, windowHours: 24 }
        : [{ nodeType: 2, count: 50 }, { nodeType: 1, count: 20 }, { nodeType: 3, count: 3 }, { nodeType: 4, count: 2 }]
    }));
    await use(page);
  }
});
