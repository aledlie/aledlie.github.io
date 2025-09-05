const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('should not have any accessibility violations on homepage', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('should not have accessibility violations on about page', async ({ page }) => {
    await page.goto('/about/');
    await injectAxe(page);
    await checkA11y(page);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 0) {
      // Should have at least one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(1); // Should have only one h1
    }
  });

  test('should have alt text on all images', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const altText = await img.getAttribute('alt');
      expect(altText).not.toBeNull();
      // Alt text can be empty for decorative images, but attribute must exist
    }
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = await page.locator('input, textarea, select').all();
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const inputType = await input.getAttribute('type');
      
      // Skip hidden inputs
      if (inputType === 'hidden') continue;
      
      if (inputId) {
        // Check for associated label
        const label = await page.locator(`label[for="${inputId}"]`).count();
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        // Input should have either a label, aria-label, or aria-labelledby
        const hasAccessibleName = label > 0 || ariaLabel || ariaLabelledBy;
        expect(hasAccessibleName).toBe(true);
      }
    }
  });

  test('should have proper link text', async ({ page }) => {
    const links = await page.locator('a[href]').all();
    
    for (const link of links) {
      const linkText = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      // Link should have descriptive text, aria-label, or title
      const hasAccessibleName = 
        (linkText && linkText.trim().length > 0) || 
        ariaLabel || 
        title;
      
      expect(hasAccessibleName).toBe(true);
      
      // Avoid generic link text
      if (linkText) {
        const genericTexts = ['click here', 'read more', 'here', 'more'];
        const isGeneric = genericTexts.some(generic => 
          linkText.toLowerCase().includes(generic)
        );
        
        if (isGeneric) {
          // If link text is generic, it should have aria-label or title
          expect(ariaLabel || title).toBeTruthy();
        }
      }
    }
  });

  test('should have adequate color contrast', async ({ page }) => {
    // Use axe to check color contrast
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        'color-contrast-enhanced': { enabled: true }
      }
    });
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test that all interactive elements can be reached by keyboard
    const focusableElements = await page.locator(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    ).all();

    if (focusableElements.length > 0) {
      // Start with first element
      await focusableElements[0].focus();
      
      // Tab through some elements
      for (let i = 0; i < Math.min(5, focusableElements.length - 1); i++) {
        await page.keyboard.press('Tab');
      }
      
      // Should be able to navigate with keyboard
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have skip navigation links', async ({ page }) => {
    // Look for skip links (often hidden until focused)
    const skipLinks = await page.locator('a[href^="#"]:has-text(/skip/i)').count();
    
    if (skipLinks > 0) {
      const skipLink = page.locator('a[href^="#"]:has-text(/skip/i)').first();
      
      // Skip link should have proper target
      const href = await skipLink.getAttribute('href');
      const targetId = href.substring(1);
      const target = await page.locator(`#${targetId}`).count();
      
      expect(target).toBeGreaterThan(0);
    }
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    // Check for main landmark
    const mainLandmark = await page.locator('main, [role="main"]').count();
    expect(mainLandmark).toBeGreaterThanOrEqual(1);
    
    // Check for navigation landmark
    const navLandmark = await page.locator('nav, [role="navigation"]').count();
    if (navLandmark === 0) {
      // May not have navigation on all pages, but should have it somewhere
      console.log('No navigation landmark found - may be acceptable for some pages');
    }
  });

  test('should handle focus management', async ({ page }) => {
    // Test focus indicators are visible
    const firstFocusable = page.locator(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    ).first();
    
    if (await firstFocusable.count() > 0) {
      await firstFocusable.focus();
      
      // Element should be focused
      await expect(firstFocusable).toBeFocused();
    }
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(60); // SEO best practice
    
    // Title should be descriptive
    const genericTitles = ['untitled', 'new page', 'page', 'document'];
    const isGeneric = genericTitles.some(generic => 
      title.toLowerCase().includes(generic)
    );
    expect(isGeneric).toBe(false);
  });
});