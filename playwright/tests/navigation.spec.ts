import { test, expect } from '@playwright/test';

/**
 * Navigation Tests
 * 
 * Testet die grundlegende Navigation in der Anwendung
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sollte zur Dashboard-Seite navigieren', async ({ page }) => {
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('sollte zur Journal-Seite navigieren', async ({ page }) => {
    await page.click('[data-testid="nav-journal"]');
    await expect(page).toHaveURL('/journal');
  });

  test('sollte zur Learn-Seite navigieren', async ({ page }) => {
    await page.click('[data-testid="nav-learn"]');
    await expect(page).toHaveURL('/lessons');
  });

  test('sollte zur Chart-Seite navigieren', async ({ page }) => {
    await page.click('[data-testid="nav-chart"]');
    await expect(page).toHaveURL('/chart');
  });

  test('sollte zur Alerts-Seite navigieren', async ({ page }) => {
    await page.click('[data-testid="nav-alerts"]');
    await expect(page).toHaveURL('/alerts');
  });

  test('sollte zur Settings-Seite navigieren', async ({ page }) => {
    await page.click('[data-testid="nav-settings"]');
    await expect(page).toHaveURL('/settings');
  });
});

test.describe('Advanced Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sollte Advanced Nav öffnen und schließen können', async ({ page }) => {
    // Prüfe ob Advanced Nav Trigger vorhanden ist
    const advancedTrigger = page.locator('[data-testid="nav-advanced-trigger"]');
    await expect(advancedTrigger).toBeVisible();

    // Klicke zum Schließen
    await advancedTrigger.click();
    
    // Warte kurz für Animation
    await page.waitForTimeout(300);

    // Klicke zum Öffnen
    await advancedTrigger.click();
    
    // Warte kurz für Animation
    await page.waitForTimeout(300);
  });

  test('sollte zur Watchlist navigieren', async ({ page }) => {
    const watchlistLink = page.locator('[data-testid="nav-watchlist"]');
    await expect(watchlistLink).toBeVisible();
    await watchlistLink.click();
    await expect(page).toHaveURL('/watchlist');
  });

  test('sollte zur Oracle-Seite navigieren', async ({ page }) => {
    const oracleLink = page.locator('[data-testid="nav-oracle"]');
    await expect(oracleLink).toBeVisible();
    await oracleLink.click();
    await expect(page).toHaveURL('/oracle');
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sollte Bottom Navigation anzeigen auf Mobile', async ({ page }) => {
    // Desktop Sidebar sollte versteckt sein
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeVisible();

    // Bottom Nav sollte sichtbar sein (implizit durch Navigation-Items)
    const dashboardNav = page.locator('[data-testid="nav-dashboard"]');
    await expect(dashboardNav).toBeVisible();
  });

  test('sollte mobile Navigation funktionieren', async ({ page }) => {
    // Navigiere zu Journal
    await page.click('[data-testid="nav-journal"]');
    await expect(page).toHaveURL('/journal');

    // Navigiere zu Learn
    await page.click('[data-testid="nav-learn"]');
    await expect(page).toHaveURL('/lessons');

    // Navigiere zu Settings
    await page.click('[data-testid="nav-settings"]');
    await expect(page).toHaveURL('/settings');
  });
});

test.describe('Active Route Highlighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sollte aktive Route highlighten', async ({ page }) => {
    // Navigiere zu Journal
    await page.click('[data-testid="nav-journal"]');
    
    // Prüfe ob Journal-Link die active Klasse hat
    const journalLink = page.locator('[data-testid="nav-journal"]');
    await expect(journalLink).toHaveClass(/nav-item-active/);
  });

  test('sollte Dashboard als aktiv markieren bei Root-Route', async ({ page }) => {
    await page.goto('/');
    
    const dashboardLink = page.locator('[data-testid="nav-dashboard"]');
    await expect(dashboardLink).toHaveClass(/nav-item-active/);
  });
});

test.describe('Responsive Sidebar', () => {
  test('sollte Sidebar auf Desktop anzeigen', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('sollte Sidebar collapse funktionieren', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Finde Collapse Button (ChevronLeft icon)
    const collapseButton = page.locator('aside button[aria-label*="sidebar"]').first();
    await expect(collapseButton).toBeVisible();

    // Klicke Collapse
    await collapseButton.click();
    
    // Warte für Animation
    await page.waitForTimeout(300);

    // Sidebar sollte jetzt collapsed sein (schmaler)
    const sidebar = page.locator('aside');
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox?.width).toBeLessThan(100); // Collapsed width ~64px
  });
});
