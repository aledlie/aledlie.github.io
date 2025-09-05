const { test, expect } = require('@playwright/test');

test.describe('Site Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have working homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/ℵ₀/);
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('should navigate to all main pages', async ({ page }) => {
    const navLinks = [
      { text: 'About', url: '/about/' },
      { text: 'Posts', url: '/posts/' },
      { text: 'Projects', url: '/projects/' }
    ];

    for (const link of navLinks) {
      await page.goto('/');
      
      // Find and click the navigation link
      const navLink = page.locator(`a[href*="${link.url}"], a:has-text("${link.text}")`).first();
      await expect(navLink).toBeVisible();
      await navLink.click();
      
      // Verify we're on the correct page
      await expect(page).toHaveURL(new RegExp(link.url.replace(/\//g, '\\/')));
      
      // Verify page has content
      await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    }
  });

  test('should have working search functionality', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[name="search"], #search-input');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test search');
      await searchInput.press('Enter');
      
      // Verify search results or search page loads
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('search');
    }
  });

  test('should have working contact links', async ({ page }) => {
    const contactLinks = page.locator('a[href*="mailto:"], a[href*="github.com"], a[href*="twitter.com"], a[href*="linkedin.com"]');
    
    if (await contactLinks.count() > 0) {
      const firstLink = contactLinks.first();
      await expect(firstLink).toBeVisible();
      
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^(mailto:|https?:\/\/)/);
    }
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response.status()).toBe(404);
    
    // Should show custom 404 page
    await expect(page.locator('body')).toContainText(['404', 'not found', 'page not found'], { ignoreCase: true });
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential meta tags
    const title = await page.locator('title').textContent();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(0);
    
    // Check for Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    
    if (ogTitle) expect(ogTitle.length).toBeGreaterThan(0);
    if (ogDescription) expect(ogDescription.length).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    
    // Check that navigation is accessible on mobile
    const navElement = page.locator('nav, .navbar, .navigation').first();
    await expect(navElement).toBeVisible();
    
    // Check that content is readable
    const mainContent = page.locator('main, .main-content, article').first();
    if (await mainContent.count() > 0) {
      await expect(mainContent).toBeVisible();
    }
    
    // Verify no horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 1); // Allow 1px tolerance
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/');
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check that layout adapts properly
    const container = page.locator('.container, .wrapper, main').first();
    if (await container.count() > 0) {
      await expect(container).toBeVisible();
    }
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check that full navigation is visible on desktop
    const navLinks = page.locator('nav a, .navbar a');
    if (await navLinks.count() > 0) {
      const firstNavLink = navLinks.first();
      await expect(firstNavLink).toBeVisible();
    }
  });
});

test.describe('Performance', () => {
  test('should load pages quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check that main content is visible
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (like failed optional resource loads)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should load all critical resources', async ({ page }) => {
    const failedRequests = [];
    
    page.on('response', response => {
      if (!response.ok() && response.status() !== 404) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out non-critical failed requests
    const criticalFailures = failedRequests.filter(req => 
      req.url.includes('.css') || 
      req.url.includes('.js') || 
      (req.url.includes('.jpg') || req.url.includes('.png') || req.url.includes('.webp'))
    );
    
    expect(criticalFailures).toHaveLength(0);
  });
});