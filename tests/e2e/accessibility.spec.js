const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

/**
 * Simplified Accessibility Tests
 *
 * Focus: Core accessibility compliance, not content specifics
 * Philosophy: Test behavior and standards, not implementation details
 *
 * These tests are designed to be resilient to content changes while
 * catching real accessibility issues.
 */

test.describe('Core Accessibility', () => {
  test('homepage should meet WCAG standards', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    // axe-core automatically checks:
    // - Color contrast
    // - ARIA attributes
    // - Form labels
    // - Heading hierarchy
    // - Image alt text
    // - Keyboard navigation
    // - Landmark structure
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('about page should meet WCAG standards', async ({ page }) => {
    await page.goto('/about/');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true
    });
  });

  test('posts page should meet WCAG standards', async ({ page }) => {
    await page.goto('/posts/');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true
    });
  });
});

test.describe('Keyboard Navigation', () => {
  test('should be able to navigate with keyboard', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

    // Should focus an interactive element (link, button, input)
    const interactiveElements = ['A', 'BUTTON', 'INPUT'];
    expect(interactiveElements).toContain(firstFocused);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check that focused element is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await injectAxe(page);

    // Should still meet accessibility standards on mobile
    await checkA11y(page);
  });

  test('should be accessible on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await injectAxe(page);

    await checkA11y(page);
  });
});
