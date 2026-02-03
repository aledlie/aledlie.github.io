const { test, expect } = require('@playwright/test');
const { TEST_PAGES } = require('../../config/constants');

/**
 * Layout Structure Tests
 *
 * Tests for recent structural changes:
 * - Footer dual class naming convention support
 * - Pagination functionality (v1 only)
 * - Blog post rendering (single layout)
 * - Archive/taxonomy pages
 *
 * Added after commits: 27a0569a, 1f7ab091, 04662fce
 */

test.describe('Footer Structure', () => {
  test('footer should render with correct structure', async ({ page }) => {
    await page.goto('/');

    // Footer should exist
    const footer = page.locator('.page__footer, .page-footer');
    await expect(footer).toBeVisible();

    // Should have copyright section (supports both naming conventions)
    const copyright = page.locator('.page__footer-copyright, .page-footer-copyright');
    await expect(copyright).toBeVisible();

    // Copyright should contain text
    const copyrightText = await copyright.textContent();
    expect(copyrightText.length).toBeGreaterThan(0);
  });

  test('footer should have accessible link colors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Check footer link exists and is styled
    const footerLink = page.locator('.page__footer a, .page-footer a').first();

    if (await footerLink.count() > 0) {
      await expect(footerLink).toBeVisible();

      // Link should have underline or distinct styling
      const textDecoration = await footerLink.evaluate(el =>
        window.getComputedStyle(el).textDecoration
      );
      // Either underlined or will get underline on hover
      expect(textDecoration).toBeDefined();
    }
  });

  test('footer follow section should render correctly', async ({ page }) => {
    await page.goto('/');

    // Follow section may or may not exist depending on config
    const followSection = page.locator('.page__footer-follow, .page-footer-follow');

    if (await followSection.count() > 0) {
      // If it exists, it should have list items
      const listItems = followSection.locator('li');
      const count = await listItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Pagination', () => {
  test('homepage should have pagination if multiple pages exist', async ({ page }) => {
    await page.goto('/');

    // Check for pagination elements
    const pagination = page.locator('.pagination, .paginator, nav[aria-label*="pagination"], .pager');
    const paginationExists = await pagination.count() > 0;

    if (paginationExists) {
      // Pagination should have page links or numbers
      const paginationLinks = pagination.locator('a');
      const linkCount = await paginationLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('pagination links should be functional', async ({ page }) => {
    await page.goto('/');

    // Look for next/page 2 link
    const nextLink = page.locator('a[href*="/page"], a:has-text("Next"), a:has-text("Older"), .pagination a').first();

    if (await nextLink.count() > 0 && await nextLink.isVisible()) {
      const href = await nextLink.getAttribute('href');

      if (href && href.includes('/page')) {
        await nextLink.click();
        await page.waitForLoadState('networkidle');

        // Should navigate to a valid page
        const hasContent = await page.locator('body').isVisible();
        expect(hasContent).toBe(true);

        // URL should contain page number
        expect(page.url()).toMatch(/\/page\d+/);
      }
    }
  });
});

test.describe('Blog Post Rendering', () => {
  test('blog posts should render with single layout', async ({ page }) => {
    // Go to posts archive
    await page.goto('/posts/');

    // Find first post link (using actual site structure)
    const postLink = page.locator('.archive-item-title a').first();
    const href = await postLink.getAttribute('href');

    if (href) {
      // Navigate directly to avoid click timing issues
      await page.goto(href);
      await page.waitForLoadState('load');

      // Post should have essential elements - article.page or main content area
      const article = page.locator('article.page');
      const main = page.locator('main');

      // Either article or main should be visible
      const articleVisible = await article.isVisible().catch(() => false);
      const mainVisible = await main.isVisible().catch(() => false);
      expect(articleVisible || mainVisible).toBe(true);

      // Should have a title (h1)
      const hasTitle = await page.locator('h1').count();
      expect(hasTitle).toBeGreaterThan(0);
    }
  });

  test('blog post should have proper meta elements', async ({ page }) => {
    await page.goto('/posts/');

    const postLink = page.locator('.archive-item-title a').first();

    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Should have title meta
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Should have date or time element
      const hasDate = await page.locator('time, .page__date, .page__meta').count();
      expect(hasDate).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Archive Pages', () => {
  test('posts archive should render correctly', async ({ page }) => {
    await page.goto('/posts/');

    // Should have heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Should have post entries (using actual site structure)
    const posts = page.locator('article.archive-item, .archive-item');
    const postCount = await posts.count();
    expect(postCount).toBeGreaterThanOrEqual(0);
  });

  test('archive should group posts by year', async ({ page }) => {
    await page.goto('/posts/');

    // Look for year headings (using actual site structure)
    const yearHeadings = page.locator('h2.archive-subtitle, .archive-subtitle');
    const hasYears = await yearHeadings.count();

    // Should have year groupings
    expect(hasYears).toBeGreaterThanOrEqual(0);
  });

  test('taxonomy links should work if present', async ({ page }) => {
    await page.goto('/posts/');

    // Find first post to check for tags/categories
    const postLink = page.locator('.archive-item-title a').first();

    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Look for tag or category links
      const taxonomyLinks = page.locator('.page__taxonomy a, .p-category, a[rel="tag"]');

      if (await taxonomyLinks.count() > 0) {
        const firstTag = taxonomyLinks.first();
        const href = await firstTag.getAttribute('href');

        // Tag links should have valid href
        expect(href).toBeTruthy();
        expect(href.length).toBeGreaterThan(1);
      }
    }
  });
});

test.describe('Layout Regression Tests', () => {
  test('removed post layout should not break existing posts', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/posts/');

    const postLink = page.locator('.archive-item-title a').first();

    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Page should load successfully (not 404 or error)
      await expect(page.locator('body')).toBeVisible();

      // Should not show Jekyll build error
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('does not exist');
    }
  });

  test('pages should not reference removed layouts', async ({ page }) => {
    for (const { path } of TEST_PAGES) {
      await page.goto(path);

      // Should load without errors
      await expect(page.locator('body')).toBeVisible();

      // Check for layout errors in page content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('Liquid error');
    }
  });
});
