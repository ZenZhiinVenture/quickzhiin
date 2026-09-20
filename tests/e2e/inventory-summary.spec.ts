import { test, expect } from '@playwright/test';

test.describe('Inventory Summary Page', () => {
  test('should load the inventory summary page and display key UI elements', async ({ page }) => {
    // Navigate to the localized page (English)
    await page.goto('/en/inventory/reports/summary');

    // Expect the page title/header to be visible
    // We look for an h1 tag containing 'Inventory Summary'
    await expect(page.locator('h1')).toContainText('Inventory Summary', { ignoreCase: true });

    // Since the API call might fail or return empty if the backend isn't seeded,
    // we just check that the main card or the empty state is visible.
    // The component either shows a loading spinner, then an empty state, or a table.
    
    // Wait for the loading spinner to disappear
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 });

    // Check if the glass card loaded
    const hasCard = await page.locator('.glass-card').isVisible();
    expect(hasCard).toBeTruthy();
  });
});
