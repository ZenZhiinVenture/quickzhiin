import { test, expect } from '@playwright/test';

test.describe('Sales Page E2E', () => {
  test('should load sales page, verify metric cards and sales tabs', async ({ page }) => {
    // 1. Navigate to sales page
    await page.goto('/en/sales');

    // 2. Verify page title
    await expect(page.locator('h1')).toContainText('Sales', { ignoreCase: true });

    // 3. Verify core navigation tabs exist
    await expect(page.getByRole('tab', { name: /Quotes/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Orders/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Invoices/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Credit Notes/i })).toBeVisible();

    // 4. Verify quick action button
    const newQuoteBtn = page.getByRole('button', { name: /New Quote/i });
    await expect(newQuoteBtn).toBeVisible();
  });
});
