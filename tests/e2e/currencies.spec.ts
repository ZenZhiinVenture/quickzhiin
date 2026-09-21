import { test, expect } from '@playwright/test';

test.describe('Currencies & Exchange Rates Page E2E', () => {
  test('should load currencies page, display base currency card and open add rate modal', async ({ page }) => {
    // 1. Navigate to currencies settings page
    await page.goto('/en/settings/currencies');

    // 2. Verify page header
    await expect(page.locator('h1')).toContainText('Currencies & Exchange Rates', { ignoreCase: true });

    // 3. Verify Base Currency configuration card
    await expect(page.getByText('Company Base Currency')).toBeVisible();

    // 4. Verify User-Input Rate policy card
    await expect(page.getByText('User-Input Rate Control')).toBeVisible();

    // 5. Verify Add Exchange Rate button and click it
    const addRateBtn = page.getByRole('button', { name: /Add Exchange Rate/i });
    await expect(addRateBtn).toBeVisible();
    await addRateBtn.click();

    // 6. Verify modal opens
    const dialogTitle = page.getByRole('heading', { name: /Add Exchange Rate/i });
    await expect(dialogTitle).toBeVisible();

    // 7. Verify rate input exists
    await expect(page.getByPlaceholder(/e.g. 4.450000/i)).toBeVisible();

    // 8. Close modal with Cancel button
    const cancelBtn = page.getByRole('button', { name: /Cancel/i });
    await cancelBtn.click();
    await expect(dialogTitle).toBeHidden();
  });
});
