const { test, expect } = require('@playwright/test');
const { VIEWPORTS, PERFORMANCE, HTTP_STATUS, IGNORED_CONSOLE_ERRORS } = require('../../config/constants');

// Helper to check if error should be ignored
const isIgnoredError = (text) => IGNORED_CONSOLE_ERRORS.some(pattern => text.includes(pattern));

/**
 * Simplified Navigation Tests
 *
 * Focus: Core navigation functionality, not content specifics
 * Philosophy: Test that site is navigable and functional, not every detail
 *
 * These tests verify the site works without being brittle to content changes.
 */

test.describe('Core Navigation', () => {
  test('homepage should load and be interactive', async ({ page }) => {
    await page.goto('/');

    // Page should have a title
    await expect(page).toHaveTitle(/.+/);

    // Page should have visible content
    const hasContent = await page.locator('main, article, .content, h1, h2').count();
    expect(hasContent).toBeGreaterThan(0);

    // Page should have navigation
    const hasNav = await page.locator('nav, .navigation, header a').count();
    expect(hasNav).toBeGreaterThan(0);
  });

  test('navigation links should work', async ({ page }) => {
    await page.goto('/');

    // Get all internal navigation links
    const navLinks = page.locator('nav a, header a').filter({ hasNotText: /^$/ });
    const count = await navLinks.count();

    // Should have some navigation links
    expect(count).toBeGreaterThan(0);

    // Test first navigation link works
    if (count > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');

      // Skip external links and anchors
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // Should navigate to a page with content
        const hasContent = await page.locator('body').isVisible();
        expect(hasContent).toBe(true);
      }
    }
  });

  test('404 page should exist', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345');

    // Should return 404 status
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);

    // Should still render a page
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Meta Tags', () => {
  test('should have essential SEO meta tags', async ({ page }) => {
    await page.goto('/');

    // Should have title
    const title = await page.locator('title').textContent();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Should have description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(10);

    // Should have viewport for mobile
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
  });
});

test.describe('Responsive Design', () => {
  const viewportEntries = Object.entries(VIEWPORTS);

  for (const [name, dimensions] of viewportEntries) {
    test(`should work on ${name}`, async ({ page }) => {
      await page.setViewportSize(dimensions);
      await page.goto('/');

      // Page should render
      await expect(page.locator('body')).toBeVisible();

      // Content should be visible
      const hasContent = await page.locator('main, article, h1, h2').count();
      expect(hasContent).toBeGreaterThan(0);

      // Navigation should exist (even if in hamburger menu)
      const hasNav = await page.locator('nav, .navigation, header').count();
      expect(hasNav).toBeGreaterThan(0);
    });
  }
});

test.describe('Performance', () => {
  test('pages should load quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within performance budget
    expect(loadTime).toBeLessThan(PERFORMANCE.pageLoadTimeoutMs);
  });

  test('should not have console errors', async ({ page }) => {
    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isIgnoredError(text)) {
          errors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have no critical errors
    expect(errors).toHaveLength(0);
  });
});
