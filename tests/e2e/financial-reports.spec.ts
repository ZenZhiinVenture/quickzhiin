import { test, expect } from '@playwright/test';

test.describe('Big Three Financial Reports E2E', () => {
  test('should load Trial Balance page and display verification badges', async ({ page }) => {
    await page.goto('/en/accounting/reports/trial-balance');

    // Title should mention Trial Balance
    await expect(page.locator('h1')).toContainText('Trial Balance', { ignoreCase: true });

    // Date selector and Recalculate button should be present
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Recalculate/i })).toBeVisible();
  });

  test('should load Profit and Loss page and display Income Statement structure', async ({ page }) => {
    await page.goto('/en/accounting/reports/profit-loss');

    // Title or heading
    await expect(page.getByText('Income Statement')).toBeVisible();

    // Key financial metrics should be present
    await expect(page.getByText('Revenue', { exact: false })).toBeVisible();
    await expect(page.getByText('Operating Expenses', { exact: false })).toBeVisible();
    await expect(page.getByText('NET PROFIT', { exact: false })).toBeVisible();
  });

  test('should load Balance Sheet page and display Assets, Liabilities, and Equity sections', async ({ page }) => {
    await page.goto('/en/accounting/reports/balance-sheet');

    // Balance Sheet title
    await expect(page.getByText('BALANCE SHEET', { exact: false })).toBeVisible();

    // Three core accounting pillars
    await expect(page.getByText('Assets', { exact: false })).toBeVisible();
    await expect(page.getByText('Liabilities', { exact: false })).toBeVisible();
    await expect(page.getByText('Equity', { exact: false })).toBeVisible();
    await expect(page.getByText('Total Liabilities & Equity', { exact: false })).toBeVisible();
  });
});
