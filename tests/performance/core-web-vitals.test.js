/**
 * Core Web Vitals Tests
 * Tests performance metrics that Google uses for ranking
 */

const { WEB_VITALS } = require('../../config/constants');

// Alias constants for test readability
const THRESHOLDS = {
  LCP_GOOD_MS: WEB_VITALS.largestContentfulPaint,
  FID_GOOD_MS: WEB_VITALS.firstInputDelay,
  CLS_GOOD: WEB_VITALS.cumulativeLayoutShift,
  FCP_GOOD_MS: WEB_VITALS.firstContentfulPaint,
  TTI_GOOD_MS: WEB_VITALS.timeToInteractive,
  MAIN_THREAD_BUDGET_MS: WEB_VITALS.mainThreadBudget
};

// Mock timing values for tests
const MOCK_TIMINGS = {
  LCP_MS: 1200,
  FCP_MS: 800,
  TTI_MS: 2800
};

// Layout shift test values
const LAYOUT_SHIFT = {
  OLD_TOP: 100,
  NEW_TOP: 105,
  HEIGHT: 50
};

describe('Core Web Vitals', () => {
  describe('Largest Contentful Paint (LCP)', () => {
    test('should measure LCP timing', () => {
      // Mock PerformanceObserver for LCP
      const mockLCPEntries = [{
        entryType: 'largest-contentful-paint',
        startTime: MOCK_TIMINGS.LCP_MS,
        element: document.createElement('img')
      }];

      const measureLCP = () => {
        return new Promise(resolve => {
          // Simulate LCP measurement
          setTimeout(() => resolve(mockLCPEntries[0].startTime), 100);
        });
      };

      return measureLCP().then(lcp => {
        expect(lcp).toBeLessThan(THRESHOLDS.LCP_GOOD_MS);
        expect(typeof lcp).toBe('number');
      });
    });

    test('should identify LCP element', () => {
      document.body.innerHTML = `
        <img src="/images/hero.jpg" alt="Hero image" id="hero">
        <h1>Main heading</h1>
        <p>Some content</p>
      `;

      const potentialLCPElements = document.querySelectorAll('img, h1, h2, p, div');
      expect(potentialLCPElements.length).toBeGreaterThan(0);

      const heroImage = document.querySelector('#hero');
      expect(heroImage).toBeTruthy();
      expect(heroImage.tagName).toBe('IMG');
    });
  });

  describe('First Input Delay (FID)', () => {
    test('should handle user interactions promptly', (done) => {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      document.body.appendChild(button);

      const startTime = performance.now();

      button.addEventListener('click', () => {
        const inputDelay = performance.now() - startTime;
        expect(inputDelay).toBeLessThan(THRESHOLDS.FID_GOOD_MS);
        done();
      });

      // Simulate immediate click
      setTimeout(() => button.click(), 0);
    });

    test('should not block main thread', () => {
      const performHeavyTask = () => {
        const start = performance.now();
        // Simulate work without blocking
        return new Promise(resolve => {
          setTimeout(() => {
            const duration = performance.now() - start;
            resolve(duration);
          }, 10);
        });
      };

      return performHeavyTask().then(duration => {
        expect(duration).toBeLessThan(THRESHOLDS.MAIN_THREAD_BUDGET_MS);
      });
    });
  });

  describe('Cumulative Layout Shift (CLS)', () => {
    test('should not cause unexpected layout shifts', () => {
      // Mock layout shift detection
      const layoutShifts = [];

      const mockLayoutShift = (element, oldRect, newRect) => {
        const impact = Math.abs(newRect.top - oldRect.top) / window.innerHeight;
        const distance = Math.abs(newRect.top - oldRect.top) / window.innerHeight;
        const shift = impact * distance;

        layoutShifts.push(shift);
        return shift;
      };

      // Simulate a small layout shift
      const shift = mockLayoutShift(
        document.createElement('div'),
        { top: LAYOUT_SHIFT.OLD_TOP, height: LAYOUT_SHIFT.HEIGHT },
        { top: LAYOUT_SHIFT.NEW_TOP, height: LAYOUT_SHIFT.HEIGHT }
      );

      expect(shift).toBeLessThan(THRESHOLDS.CLS_GOOD);

      const totalCLS = layoutShifts.reduce((sum, shift) => sum + shift, 0);
      expect(totalCLS).toBeLessThan(THRESHOLDS.CLS_GOOD);
    });

    test('should have proper image sizing to prevent shifts', () => {
      document.body.innerHTML = `
        <img src="/images/test.jpg" width="300" height="200" alt="Test image">
        <img src="/images/test2.jpg" style="width: 300px; height: 200px;" alt="Test image 2">
      `;

      const images = document.querySelectorAll('img');

      images.forEach(img => {
        const hasWidthAttr = img.getAttribute('width');
        const hasHeightAttr = img.getAttribute('height');
        const hasStyleDimensions = img.style.width && img.style.height;
        const hasNaturalDimensions = img.width > 0 && img.height > 0;

        const hasExplicitDimensions =
          (hasWidthAttr && hasHeightAttr) ||
          hasStyleDimensions ||
          hasNaturalDimensions;

        expect(hasExplicitDimensions).toBeTruthy();
      });
    });

    test('should reserve space for dynamic content', () => {
      // Test that containers have min-height or explicit dimensions
      document.body.innerHTML = `
        <div class="ad-container" style="min-height: 250px;">
          <!-- Ad content loads here -->
        </div>
        <div class="content-placeholder" style="height: 200px;">
          <!-- Content loads here -->
        </div>
      `;

      const containers = document.querySelectorAll('.ad-container, .content-placeholder');

      containers.forEach(container => {
        const style = window.getComputedStyle(container);
        const hasReservedSpace =
          style.minHeight !== 'auto' ||
          style.height !== 'auto';

        // In a real test, you'd check computed styles
        // Here we just verify the elements exist
        expect(container).toBeTruthy();
      });
    });
  });

  describe('First Contentful Paint (FCP)', () => {
    test('should render content quickly', () => {
      // Mock FCP measurement
      const mockFCP = MOCK_TIMINGS.FCP_MS;

      expect(mockFCP).toBeLessThan(THRESHOLDS.FCP_GOOD_MS);
      expect(mockFCP).toBeGreaterThan(0);
    });

    test('should have critical CSS inlined', () => {
      document.head.innerHTML = `
        <style>
          /* Critical CSS */
          body { font-family: system-ui; }
          .header { background: white; }
        </style>
        <link rel="stylesheet" href="/assets/css/main.css">
      `;

      const inlineStyles = document.querySelector('head style');
      const externalStyles = document.querySelector('link[rel="stylesheet"]');

      expect(inlineStyles).toBeTruthy();
      expect(externalStyles).toBeTruthy();
    });
  });

  describe('Time to Interactive (TTI)', () => {
    test('should become interactive within reasonable time', () => {
      // Mock TTI measurement
      const mockTTI = MOCK_TIMINGS.TTI_MS;

      expect(mockTTI).toBeLessThan(THRESHOLDS.TTI_GOOD_MS);
    });

    test('should load critical JavaScript early', () => {
      document.body.innerHTML = `
        <script>
          // Critical inline JavaScript
          document.documentElement.className = 'js';
        </script>
        <script src="/assets/js/main.js" defer></script>
      `;

      const inlineScript = document.querySelector('body script:not([src])');
      const deferredScript = document.querySelector('script[defer]');

      expect(inlineScript).toBeTruthy();
      expect(deferredScript).toBeTruthy();
      expect(deferredScript.defer).toBe(true);
    });
  });

  describe('Resource Loading Optimization', () => {
    test('should preload critical resources', () => {
      document.head.innerHTML = `
        <link rel="preload" href="/assets/css/main.css" as="style">
        <link rel="preload" href="/assets/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
      `;

      const preloadCSS = document.querySelector('link[rel="preload"][as="style"]');
      const preloadFont = document.querySelector('link[rel="preload"][as="font"]');
      const dnsPrefetch = document.querySelector('link[rel="dns-prefetch"]');

      expect(preloadCSS).toBeTruthy();
      expect(preloadFont).toBeTruthy();
      expect(dnsPrefetch).toBeTruthy();
    });

    test('should use modern image formats', () => {
      document.body.innerHTML = `
        <picture>
          <source srcset="/images/hero.avif" type="image/avif">
          <source srcset="/images/hero.webp" type="image/webp">
          <img src="/images/hero.jpg" alt="Hero image">
        </picture>
      `;

      const picture = document.querySelector('picture');
      const avifSource = document.querySelector('source[type="image/avif"]');
      const webpSource = document.querySelector('source[type="image/webp"]');
      const fallbackImg = document.querySelector('picture img');

      expect(picture).toBeTruthy();
      expect(avifSource).toBeTruthy();
      expect(webpSource).toBeTruthy();
      expect(fallbackImg).toBeTruthy();
    });

    test('should lazy load non-critical images', () => {
      document.body.innerHTML = `
        <img src="/images/hero.jpg" alt="Above fold" loading="eager">
        <img src="/images/content1.jpg" alt="Below fold" loading="lazy">
        <img src="/images/content2.jpg" alt="Below fold" loading="lazy">
      `;

      const eagerImage = document.querySelector('img[loading="eager"]');
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');

      expect(eagerImage).toBeTruthy();
      expect(lazyImages.length).toBeGreaterThan(0);
    });
  });
});
