import { test, expect } from '@playwright/test';

test.describe('Products Page E2E', () => {
  test('should load products page, verify table, and open import modal', async ({ page }) => {
    // 1. Navigate to products page
    await page.goto('/en/products');
    
    // 2. Verify title
    await expect(page.locator('h1')).toContainText('Products', { ignoreCase: true });
    
    // 3. Verify 'Add Product' and 'Import CSV' buttons exist
    const addBtn = page.getByRole('button', { name: /Add Product/i });
    const importBtn = page.getByRole('button', { name: /Import CSV/i });
    
    await expect(addBtn).toBeVisible();
    await expect(importBtn).toBeVisible();

    // 4. Click Import CSV and verify the modal opens
    await importBtn.click();

    // Verify modal title
    const modalTitle = page.getByRole('heading', { name: /Import Products/i });
    await expect(modalTitle).toBeVisible();

    // Verify the drag and drop area
    const dropzone = page.locator('.border-dashed').first();
    await expect(dropzone).toBeVisible();

    // 5. Close modal by clicking outside or pressing Escape
    await page.keyboard.press('Escape');
    await expect(modalTitle).toBeHidden();
  });
});
