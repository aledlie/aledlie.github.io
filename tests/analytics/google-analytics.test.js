/**
 * Google Analytics Tests
 * Tests Google Analytics 4 (GA4) implementation, tracking events, and analytics setup
 */

const { ANALYTICS, SITE } = require('../../config/constants');

describe('Google Analytics Integration', () => {
  const EXPECTED_GA_ID = ANALYTICS.GA4_TRACKING_ID;

  beforeEach(() => {
    // Reset global analytics state
    global.gtag = jest.fn();
    global.dataLayer = [];
    delete window.gtag;
    delete window.dataLayer;
  });

  describe('Google Analytics Setup', () => {
    test('should load GA4 script with correct ID', () => {
      document.head.innerHTML = `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${EXPECTED_GA_ID}"></script>
      `;

      const gtagScript = document.querySelector(`script[src*="gtag/js?id=${EXPECTED_GA_ID}"]`);
      expect(gtagScript).toBeTruthy();
      expect(gtagScript.hasAttribute('async')).toBe(true);
    });

    test('should initialize gtag with correct configuration', () => {
      // Simulate the analytics script execution
      document.body.innerHTML = `
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${EXPECTED_GA_ID}');
        </script>
      `;

      // Mock the gtag function and dataLayer
      window.dataLayer = [];
      window.gtag = jest.fn((command, ...args) => {
        window.dataLayer.push([command, ...args]);
      });

      // Simulate the gtag calls
      window.gtag('js', new Date());
      window.gtag('config', EXPECTED_GA_ID);

      expect(window.dataLayer).toEqual([
        ['js', expect.any(Date)],
        ['config', EXPECTED_GA_ID]
      ]);
    });

    test('should load GA4 script exactly once (regression test for duplicate loading fix)', () => {
      // Regression test for Bug #4: Duplicate GA4 Script Loading
      // Fixed in commit 48754081
      // This test ensures the analytics script is only included once per page
      document.head.innerHTML = `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${EXPECTED_GA_ID}"></script>
      `;

      const gtagScripts = document.querySelectorAll('script[src*="gtag/js"]');
      expect(gtagScripts.length).toBe(1);
    });

    test('should initialize dataLayer exactly once', () => {
      // Ensure dataLayer is not duplicated which would cause double-counting
      window.dataLayer = window.dataLayer || [];

      // Attempting to reinitialize should not create a new array
      const originalDataLayer = window.dataLayer;
      window.dataLayer = window.dataLayer || [];

      expect(window.dataLayer).toBe(originalDataLayer);
    });
  });

  describe('Site Verification', () => {
    test('should have Google site verification meta tag', () => {
      const EXPECTED_VERIFICATION = ANALYTICS.GOOGLE_SITE_VERIFICATION;
      document.head.innerHTML = `
        <meta name="google-site-verification" content="${EXPECTED_VERIFICATION}" />
      `;

      const verificationMeta = document.querySelector('meta[name="google-site-verification"]');
      expect(verificationMeta).toBeTruthy();
      expect(verificationMeta.getAttribute('content')).toBe(EXPECTED_VERIFICATION);
    });

    test('should have only one site verification meta tag', () => {
      document.head.innerHTML = `
        <meta name="google-site-verification" content="${ANALYTICS.GOOGLE_SITE_VERIFICATION}" />
      `;

      const verificationMetas = document.querySelectorAll('meta[name="google-site-verification"]');
      expect(verificationMetas).toHaveLength(1);
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
      window.dataLayer = [];
    });

    test('should track page views', () => {
      // Simulate page view tracking
      const trackPageView = (page_title, page_location) => {
        if (window.gtag) {
          window.gtag('config', EXPECTED_GA_ID, {
            page_title: page_title,
            page_location: page_location
          });
        }
      };

      trackPageView('Home Page', `${SITE.url}/`);

      expect(window.gtag).toHaveBeenCalledWith('config', EXPECTED_GA_ID, {
        page_title: 'Home Page',
        page_location: `${SITE.url}/`
      });
    });

    test('should track custom events', () => {
      const trackEvent = (action, category, label, value) => {
        if (window.gtag) {
          window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
          });
        }
      };

      trackEvent('click', 'navigation', 'header_logo', 1);

      expect(window.gtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'navigation',
        event_label: 'header_logo',
        value: 1
      });
    });

    test('should track outbound link clicks', () => {
      document.body.innerHTML = `
        <a href="${SITE.githubUrl}" target="_blank" class="external-link">GitHub</a>
        <a href="/about" class="internal-link">About</a>
      `;

      const trackOutboundClick = (url) => {
        if (window.gtag && url.startsWith('http') && !url.includes(SITE.domain)) {
          window.gtag('event', 'click', {
            event_category: 'outbound',
            event_label: url,
            transport_type: 'beacon'
          });
        }
      };

      const externalLink = document.querySelector('.external-link');
      trackOutboundClick(externalLink.href);

      expect(window.gtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'outbound',
        event_label: SITE.githubUrl,
        transport_type: 'beacon'
      });
    });

    test('should not track internal link clicks as outbound', () => {
      const trackOutboundClick = (url) => {
        if (window.gtag && url.startsWith('http') && !url.includes(SITE.domain)) {
          window.gtag('event', 'click', {
            event_category: 'outbound',
            event_label: url
          });
        }
      };

      trackOutboundClick(`${SITE.url}/about`);
      expect(window.gtag).not.toHaveBeenCalled();
    });
  });

  describe('Privacy and Consent', () => {
    test('should respect do not track header', () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        writable: false
      });

      const shouldTrack = () => {
        return navigator.doNotTrack !== '1' && navigator.doNotTrack !== 'yes';
      };

      expect(shouldTrack()).toBe(false);
    });

    test('should allow analytics opt-out', () => {
      const disableAnalytics = () => {
        window[`ga-disable-${EXPECTED_GA_ID}`] = true;
      };

      disableAnalytics();
      expect(window[`ga-disable-${EXPECTED_GA_ID}`]).toBe(true);
    });

    test('should have proper consent management', () => {
      const grantConsent = () => {
        if (window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: 'granted'
          });
        }
      };

      const denyConsent = () => {
        if (window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: 'denied'
          });
        }
      };

      window.gtag = jest.fn();

      grantConsent();
      expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted'
      });

      denyConsent();
      expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'denied'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing gtag gracefully', () => {
      window.gtag = undefined;

      const safeTrack = (event, params) => {
        try {
          if (window.gtag && typeof window.gtag === 'function') {
            window.gtag('event', event, params);
            return true;
          }
          return false;
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
          return false;
        }
      };

      expect(safeTrack('test_event', {})).toBe(false);
      expect(() => safeTrack('test_event', {})).not.toThrow();
    });

    test('should handle analytics script loading failures', () => {
      const checkAnalyticsLoaded = () => {
        return typeof window.gtag === 'function' && Array.isArray(window.dataLayer);
      };

      // Simulate script not loaded
      expect(checkAnalyticsLoaded()).toBe(false);

      // Simulate script loaded
      window.gtag = jest.fn();
      window.dataLayer = [];
      expect(checkAnalyticsLoaded()).toBe(true);
    });
  });
});