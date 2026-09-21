import { test, expect } from '@playwright/test';

test.describe('Accounting Periods Page E2E', () => {
  test('should load accounting periods page, verify KPI cards, and open create dialog', async ({ page }) => {
    // 1. Navigate to accounting periods page
    await page.goto('/en/accounting/periods');

    // 2. Verify header title
    await expect(page.locator('h1')).toContainText('Accounting Periods', { ignoreCase: true });

    // 3. Verify KPI cards are rendered
    await expect(page.getByText('Open Periods')).toBeVisible();
    await expect(page.getByText('Closed / Locked')).toBeVisible();
    await expect(page.getByText('Book Protection')).toBeVisible();

    // 4. Verify 'New Period' button exists and click it
    const newPeriodBtn = page.getByRole('button', { name: /New Period/i });
    await expect(newPeriodBtn).toBeVisible();
    await newPeriodBtn.click();

    // 5. Verify modal dialog opened
    const dialogTitle = page.getByRole('heading', { name: /Create Accounting Period/i });
    await expect(dialogTitle).toBeVisible();

    // 6. Verify form inputs exist
    await expect(page.getByPlaceholder(/e.g. October 2025/i)).toBeVisible();

    // 7. Close modal with Cancel button
    const cancelBtn = page.getByRole('button', { name: /Cancel/i });
    await cancelBtn.click();
    await expect(dialogTitle).toBeHidden();
  });
});
