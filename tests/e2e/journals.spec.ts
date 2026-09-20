import { test, expect } from '@playwright/test';

test.describe('Journals Page E2E', () => {
  test('should load journals page, verify table, and open import modal', async ({ page }) => {
    // 1. Navigate to journals page
    await page.goto('/en/accounting/journals');
    
    // 2. Verify title
    await expect(page.locator('h1')).toContainText('Journal Entries', { ignoreCase: true });
    
    // 3. Verify 'New Entry' and 'Import CSV' buttons exist
    const addBtn = page.getByRole('button', { name: /New Entry/i });
    const importBtn = page.getByRole('button', { name: /Import CSV/i });
    
    await expect(addBtn).toBeVisible();
    await expect(importBtn).toBeVisible();

    // 4. Click Import CSV and verify the modal opens
    await importBtn.click();

    // Verify modal title
    const modalTitle = page.getByRole('heading', { name: /Import Journal Entries/i });
    await expect(modalTitle).toBeVisible();

    // Verify the drag and drop area
    const dropzone = page.locator('.border-dashed').first();
    await expect(dropzone).toBeVisible();

    // 5. Close modal by clicking outside or pressing Escape
    await page.keyboard.press('Escape');
    await expect(modalTitle).toBeHidden();
  });
});
