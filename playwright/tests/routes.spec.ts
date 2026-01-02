import { test, expect } from "@playwright/test";

/**
 * Route contract smoke tests (tabs + secondary deep links)
 */

test.describe("Secondary Routes", () => {
  test("sollte alle Secondary Routes direkt öffnen können", async ({ page }) => {
    const routes = [
      { url: "/journal/review", testId: "page-journal-review" },
      { url: "/journal/insights", testId: "page-journal-insights" },
      { url: "/journal/entry-1", testId: "page-journal-entry" },

      { url: "/oracle/inbox", testId: "page-oracle-inbox" },
      { url: "/oracle/oracle-1", testId: "page-oracle-insight" },
      { url: "/oracle/status", testId: "page-oracle-status" },

      { url: "/settings/providers", testId: "page-settings-providers" },
      { url: "/settings/data", testId: "page-settings-data" },
      { url: "/settings/experiments", testId: "page-settings-experiments" },
      { url: "/settings/privacy", testId: "page-settings-privacy" },

      // Valid Solana base58 mint (wSOL)
      { url: "/asset/So11111111111111111111111111111111111111112", testId: "page-asset" },
    ] as const;

    for (const r of routes) {
      await page.goto(r.url);
      await expect(page.locator(`[data-testid="${r.testId}"]`)).toBeVisible();
    }
  });
});

