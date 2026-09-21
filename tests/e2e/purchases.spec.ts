import { test, expect } from '@playwright/test';

test.describe('Purchases Page E2E', () => {
  test('should load purchases page, verify heading and purchase tabs', async ({ page }) => {
    // 1. Navigate to purchases page
    await page.goto('/en/purchases');

    // 2. Verify page title
    await expect(page.locator('h1')).toContainText('Purchases', { ignoreCase: true });

    // 3. Verify core tabs exist
    await expect(page.getByRole('tab', { name: /Requisitions/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Orders/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Goods Received/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Bills/i })).toBeVisible();
  });
});
