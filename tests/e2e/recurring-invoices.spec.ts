import { test, expect } from '@playwright/test';

test.describe('Recurring Invoices & Retainers E2E', () => {
  test('should load recurring invoices page, render KPIs, and toggle create profile modal', async ({ page }) => {
    // 1. Navigate to recurring invoices page
    await page.goto('/en/sales/recurring');

    // 2. Verify page header
    await expect(page.locator('h1')).toContainText('Recurring Invoices & Retainers');

    // 3. Verify KPI Cards
    await expect(page.getByText('Total Profiles')).toBeVisible();
    await expect(page.getByText('Active Schedules')).toBeVisible();
    await expect(page.getByText('Due For Run')).toBeVisible();
    await expect(page.getByText('Invoices Generated')).toBeVisible();

    // 4. Verify batch trigger action button
    const runBatchBtn = page.getByRole('button', { name: /Run Due Invoices Now/i });
    await expect(runBatchBtn).toBeVisible();

    // 5. Open New Recurring Profile modal
    const newProfileBtn = page.getByRole('button', { name: /New Recurring Profile/i }).first();
    await expect(newProfileBtn).toBeVisible();
    await newProfileBtn.click();

    // 6. Verify modal heading and inputs
    const dialogTitle = page.getByRole('heading', { name: /New Recurring Invoice Profile/i });
    await expect(dialogTitle).toBeVisible();
    await expect(page.getByPlaceholder(/e.g. Monthly SEO & Web Maintenance/i)).toBeVisible();
    await expect(page.getByText('Recurrence Schedule')).toBeVisible();
    await expect(page.getByText('Template Line Items')).toBeVisible();

    // 7. Close modal with Cancel button
    const cancelBtn = page.getByRole('button', { name: /Cancel/i });
    await cancelBtn.click();
    await expect(dialogTitle).toBeHidden();
  });
});
