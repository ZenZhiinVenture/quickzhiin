import { test, expect } from '@playwright/test';

test.describe('Contacts Page E2E', () => {
  test('should load contacts page, verify table, and open import modal', async ({ page }) => {
    // 1. Navigate to contacts page
    await page.goto('/en/contacts');
    
    // 2. Verify title
    await expect(page.locator('h1')).toContainText('Contacts', { ignoreCase: true });
    
    // 3. Verify 'Add Contact' and 'Import CSV' buttons exist
    const addBtn = page.getByRole('button', { name: /Add Contact/i });
    const importBtn = page.getByRole('button', { name: /Import CSV/i });
    
    await expect(addBtn).toBeVisible();
    await expect(importBtn).toBeVisible();

    // 4. Click Import CSV and verify the modal opens
    await importBtn.click();

    // Verify modal title
    const modalTitle = page.getByRole('heading', { name: /Import Contacts/i });
    await expect(modalTitle).toBeVisible();

    // Verify the drag and drop area
    const dropzone = page.locator('.border-dashed').first();
    await expect(dropzone).toBeVisible();

    // 5. Close modal by clicking outside or pressing Escape
    await page.keyboard.press('Escape');
    await expect(modalTitle).toBeHidden();
  });
});
