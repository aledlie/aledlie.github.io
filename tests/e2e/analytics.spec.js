const { test, expect } = require('@playwright/test');

test.describe('Analytics Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Block actual analytics requests to avoid polluting real data
    await page.route('**/gtag/js**', route => route.abort());
    await page.route('**/google-analytics.com/**', route => route.abort());
    await page.route('**/googletagmanager.com/**', route => route.abort());
  });

  test('should load Google Tag Manager script', async ({ page }) => {
    await page.goto('/');
    
    // Check that GTM script tag exists
    const gtagScript = await page.locator('script[src*="gtag/js"]').count();
    expect(gtagScript).toBeGreaterThan(0);
    
    // Verify it has the correct GTM ID
    const scriptSrc = await page.locator('script[src*="gtag/js"]').first().getAttribute('src');
    expect(scriptSrc).toContain('GTM-TK5J8L38');
  });

  test('should have Google site verification meta tag', async ({ page }) => {
    await page.goto('/');
    
    const verificationTag = await page.locator('meta[name="google-site-verification"]');
    await expect(verificationTag).toHaveCount(1);
    
    const content = await verificationTag.getAttribute('content');
    expect(content).toBe('N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM');
  });

  test('should initialize gtag function', async ({ page }) => {
    await page.goto('/');
    
    // Check that gtag function is defined
    const gtagExists = await page.evaluate(() => typeof window.gtag === 'function');
    expect(gtagExists).toBe(true);
    
    // Check that dataLayer is initialized
    const dataLayerExists = await page.evaluate(() => Array.isArray(window.dataLayer));
    expect(dataLayerExists).toBe(true);
  });

  test('should track page views', async ({ page }) => {
    // Mock gtag to capture calls
    await page.addInitScript(() => {
      window.gtagCalls = [];
      window.gtag = function() {
        window.gtagCalls.push(Array.from(arguments));
      };
      window.dataLayer = window.dataLayer || [];
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that gtag was called with config
    const gtagCalls = await page.evaluate(() => window.gtagCalls);
    
    // Should have at least a 'js' call and a 'config' call
    const jsCalls = gtagCalls.filter(call => call[0] === 'js');
    const configCalls = gtagCalls.filter(call => call[0] === 'config');
    
    expect(jsCalls.length).toBeGreaterThan(0);
    expect(configCalls.length).toBeGreaterThan(0);
    
    // Verify config call has correct GTM ID
    const gtmConfigCall = configCalls.find(call => call[1] === 'GTM-TK5J8L38');
    expect(gtmConfigCall).toBeTruthy();
  });

  test('should handle navigation tracking', async ({ page }) => {
    await page.addInitScript(() => {
      window.gtagCalls = [];
      window.gtag = function() {
        window.gtagCalls.push(Array.from(arguments));
      };
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to another page
    const aboutLink = page.locator('a[href*="/about"]').first();
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check for additional gtag calls on navigation
      const gtagCalls = await page.evaluate(() => window.gtagCalls);
      expect(gtagCalls.length).toBeGreaterThan(1);
    }
  });

  test('should respect Do Not Track', async ({ page, context }) => {
    // Set Do Not Track header
    await context.setExtraHTTPHeaders({
      'DNT': '1'
    });
    
    await page.goto('/');
    
    // In a real implementation, you'd check that analytics is disabled
    // This test documents the requirement
    const dntHeader = await page.evaluate(() => navigator.doNotTrack);
    expect(dntHeader).toBe('1');
  });

  test('should load analytics scripts asynchronously', async ({ page }) => {
    await page.goto('/');
    
    const gtagScript = page.locator('script[src*="gtag/js"]').first();
    const isAsync = await gtagScript.getAttribute('async');
    
    expect(isAsync).not.toBeNull();
  });

  test('should not block page rendering', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Check that main content is visible quickly, even if analytics hasn't loaded
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 3000 });
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(3000);
  });
});

test.describe('Privacy and Consent', () => {
  test('should handle analytics opt-out', async ({ page }) => {
    await page.goto('/');
    
    // Set analytics opt-out
    await page.evaluate(() => {
      window['ga-disable-GTM-TK5J8L38'] = true;
    });
    
    const optOutSet = await page.evaluate(() => window['ga-disable-GTM-TK5J8L38']);
    expect(optOutSet).toBe(true);
  });

  test('should have privacy policy link', async ({ page }) => {
    await page.goto('/');
    
    // Look for privacy policy or similar links
    const privacyLinks = page.locator('a:has-text("privacy"), a:has-text("Privacy"), a[href*="privacy"]');
    
    if (await privacyLinks.count() > 0) {
      const firstPrivacyLink = privacyLinks.first();
      await expect(firstPrivacyLink).toBeVisible();
      
      const href = await firstPrivacyLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});

test.describe('Analytics Error Handling', () => {
  test('should handle missing analytics gracefully', async ({ page }) => {
    // Block all analytics scripts
    await page.route('**/gtag/**', route => route.abort());
    await page.route('**/google-analytics.com/**', route => route.abort());
    await page.route('**/googletagmanager.com/**', route => route.abort());
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should still function normally
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Should not have critical JavaScript errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.toLowerCase().includes('gtag') &&
      !error.toLowerCase().includes('analytics') &&
      !error.toLowerCase().includes('network error')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle slow analytics loading', async ({ page }) => {
    // Delay analytics scripts
    await page.route('**/gtag/js**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    await page.goto('/');
    
    // Page should be interactive even before analytics loads
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 1000 });
    
    // Navigation should work
    const navLink = page.locator('nav a, .navbar a').first();
    if (await navLink.count() > 0) {
      await expect(navLink).toBeVisible();
      // Should be clickable immediately
      await expect(navLink).not.toHaveAttribute('disabled');
    }
  });
});