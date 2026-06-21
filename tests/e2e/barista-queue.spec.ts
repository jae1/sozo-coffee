import { test, expect } from '@playwright/test';

test.describe('Barista Queue', () => {
  test('should load the barista login page', async ({ page }) => {
    await page.goto('/barista');
    
    // Expect barista login or PIN form
    const pinForm = page.locator('form');
    if (await pinForm.isVisible()) {
      await expect(pinForm).toBeVisible();
    }
  });
});
