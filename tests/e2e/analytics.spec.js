const { test, expect } = require('@playwright/test');

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

    // Verify GA4 script is present
    const gtagScript = await page.locator('script[src*="gtag/js"]').count();
    expect(gtagScript).toBeGreaterThan(0);

    // Verify correct tracking ID
    const scriptSrc = await page.locator('script[src*="gtag/js"]').first().getAttribute('src');
    expect(scriptSrc).toContain('G-J7TL7PQH7S');
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
        // Filter out expected analytics errors
        if (!text.includes('gtag') &&
            !text.includes('analytics') &&
            !text.includes('ERR_FAILED') &&
            !text.includes('net::')) {
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
    await expect(page.locator('body')).toBeVisible({ timeout: 3000 });

    const renderTime = Date.now() - startTime;

    // Page should render in under 3 seconds
    expect(renderTime).toBeLessThan(3000);
  });
});
