const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { VIEWPORTS, WCAG_COLORS, E2E_TIMEOUTS } = require('../../config/constants');

/**
 * Simplified Accessibility Tests
 *
 * Focus: Core accessibility compliance, not content specifics
 * Philosophy: Test behavior and standards, not implementation details
 *
 * These tests are designed to be resilient to content changes while
 * catching real accessibility issues.
 */

// Helper to wait for CSS to be fully applied
async function waitForStyles(page) {
  await page.waitForLoadState('load');
  // Wait for footer styles to be applied (indicates CSS is loaded)
  // Check both font-family AND color to ensure our accessibility fixes are applied.
  // Runs in the browser, so the colours come in as the arg; a miss fails the test.
  await page.waitForFunction(({ footerText }) => {
    const footer = document.querySelector('.page__footer-copyright');
    if (!footer) return true; // No footer on page
    const style = window.getComputedStyle(footer);
    // Check if custom font family is applied (not browser defaults)
    const fontFamily = style.fontFamily.toLowerCase();
    const hasFontFamily = fontFamily.includes('apple') || fontFamily.includes('roboto') ||
           fontFamily.includes('segoe') || fontFamily.includes('helvetica') ||
           fontFamily.includes('sans-serif');
    // Also check color - our WCAG fix uses accessible colors
    return hasFontFamily && style.color === footerText;
  }, WCAG_COLORS, { timeout: E2E_TIMEOUTS.styleLoadMs });
  // Additional delay to ensure CSS is fully parsed and applied
  await page.waitForTimeout(E2E_TIMEOUTS.shortDelayMs);
  // Theme intro animations fade #main and #footer in from opacity 0 (footer ends at 750ms);
  // axe blends partial opacity into its contrast ratios, so let them finish first
  await page.waitForFunction(() => document.getAnimations()
    .filter(animation => animation.effect.getComputedTiming().endTime !== Infinity)
    .every(animation => animation.playState === 'finished'), null, { timeout: E2E_TIMEOUTS.styleLoadMs });
}

test.describe('Core Accessibility', () => {
  test('homepage should meet WCAG standards', async ({ page }) => {
    await page.goto('/');
    await waitForStyles(page);
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
    await waitForStyles(page);
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true
    });
  });

  test('posts page should meet WCAG standards', async ({ page }) => {
    await page.goto('/posts/');
    await waitForStyles(page);
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
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await waitForStyles(page);
    await injectAxe(page);

    // Should still meet accessibility standards on mobile
    await checkA11y(page);
  });

  test('should be accessible on tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/');
    await waitForStyles(page);
    await injectAxe(page);

    await checkA11y(page);
  });
});
