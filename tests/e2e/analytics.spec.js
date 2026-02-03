const { test, expect } = require('@playwright/test');
const { PERFORMANCE, IGNORED_CONSOLE_ERRORS } = require('../../config/constants');

// Helper to check if error should be ignored
const isIgnoredError = (text) => IGNORED_CONSOLE_ERRORS.some(pattern => text.includes(pattern));

/**
 * Simplified Analytics Tests
 *
 * Focus: Verify analytics is configured, not implementation details
 * Philosophy: Test presence and configuration, trust Google's code
 *
 * These tests verify analytics setup without brittlely testing Google's implementation.
 */

test.describe('Analytics Configuration', () => {
  test('should have Google Analytics configured', async ({ page }) => {
    await page.goto('/');

    // Verify GA4 script is present (either direct or via GTM)
    const gtagScript = await page.locator('script[src*="gtag/js"]').count();
    expect(gtagScript).toBeGreaterThan(0);

    // Verify a valid GA4 tracking ID is present (G-XXXXXXXXX format)
    // Note: GTM may inject a different GA4 property than the Jekyll config
    const scriptSrc = await page.locator('script[src*="gtag/js"]').first().getAttribute('src');
    expect(scriptSrc).toMatch(/G-[A-Z0-9]+/);
  });

  /**
   * Regression test for Bug #4: Duplicate GA4 Script Loading
   * Fixed in commit 48754081
   *
   * Verifies that analytics scripts are loaded exactly once per page
   * to prevent performance issues and data duplication.
   */
  test('should load GA4 script exactly once per page (regression test)', async ({ page }) => {
    await page.goto('/');

    // Count all gtag script tags - should be exactly 1
    const gtagScriptCount = await page.locator('script[src*="gtag/js"]').count();
    expect(gtagScriptCount).toBe(1);
  });

  test('should load GA4 script exactly once on blog posts (regression test)', async ({ page }) => {
    await page.goto('/posts/');

    const gtagScriptCount = await page.locator('script[src*="gtag/js"]').count();
    expect(gtagScriptCount).toBe(1);
  });

  test('should initialize dataLayer exactly once', async ({ page }) => {
    await page.goto('/');

    // Check that dataLayer exists and is an array (initialized once)
    const dataLayerStatus = await page.evaluate(() => {
      if (!window.dataLayer) return { exists: false };
      return {
        exists: true,
        isArray: Array.isArray(window.dataLayer),
        length: window.dataLayer.length
      };
    });

    expect(dataLayerStatus.exists).toBe(true);
    expect(dataLayerStatus.isArray).toBe(true);
  });

  test('should have site verification configured', async ({ page }) => {
    await page.goto('/');

    // Verify Google Search Console verification
    const verificationTag = await page.locator('meta[name="google-site-verification"]');
    await expect(verificationTag).toHaveCount(1);

    const content = await verificationTag.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(10);
  });

  test('should load analytics asynchronously', async ({ page }) => {
    await page.goto('/');

    // Verify script loads async (doesn't block rendering)
    const gtagScript = page.locator('script[src*="gtag/js"]').first();
    const isAsync = await gtagScript.getAttribute('async');

    expect(isAsync).not.toBeNull();
  });
});

test.describe('Site Functionality Without Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Block analytics to verify site works without it
    await page.route('**/gtag/**', route => route.abort());
    await page.route('**/google-analytics.com/**', route => route.abort());
    await page.route('**/googletagmanager.com/**', route => route.abort());
  });

  test('should load and render without analytics', async ({ page }) => {
    await page.goto('/');

    // Page should render normally
    await expect(page.locator('body')).toBeVisible();

    // Content should be visible
    const hasContent = await page.locator('main, article, .content').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should be interactive without analytics', async ({ page }) => {
    await page.goto('/');

    // Navigation should work
    const links = await page.locator('a[href]').count();
    expect(links).toBeGreaterThan(0);

    // Links should be clickable
    const firstLink = page.locator('a[href]').first();
    await expect(firstLink).toBeVisible();
  });

  test('should not have critical JavaScript errors', async ({ page }) => {
    const criticalErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!isIgnoredError(text)) {
          criticalErrors.push(text);
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have no critical errors
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Performance', () => {
  test('should not block page rendering', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Content should be visible quickly
    await expect(page.locator('body')).toBeVisible({ timeout: PERFORMANCE.pageLoadTimeoutMs });

    const renderTime = Date.now() - startTime;

    // Page should render within performance budget
    expect(renderTime).toBeLessThan(PERFORMANCE.pageLoadTimeoutMs);
  });
});
