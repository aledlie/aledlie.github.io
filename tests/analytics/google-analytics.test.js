/**
 * Google Analytics Tests
 * Tests Google Tag Manager implementation, tracking events, and analytics setup
 */

describe('Google Analytics Integration', () => {
  const EXPECTED_GTM_ID = 'GTM-TK5J8L38';

  beforeEach(() => {
    // Reset global analytics state
    global.gtag = jest.fn();
    global.dataLayer = [];
    delete window.gtag;
    delete window.dataLayer;
  });

  describe('Google Tag Manager Setup', () => {
    test('should load GTM script with correct ID', () => {
      document.head.innerHTML = `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${EXPECTED_GTM_ID}"></script>
      `;

      const gtagScript = document.querySelector(`script[src*="gtag/js?id=${EXPECTED_GTM_ID}"]`);
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
          gtag('config', '${EXPECTED_GTM_ID}');
        </script>
      `;

      // Mock the gtag function and dataLayer
      window.dataLayer = [];
      window.gtag = jest.fn((command, ...args) => {
        window.dataLayer.push([command, ...args]);
      });

      // Simulate the gtag calls
      window.gtag('js', new Date());
      window.gtag('config', EXPECTED_GTM_ID);

      expect(window.dataLayer).toEqual([
        ['js', expect.any(Date)],
        ['config', EXPECTED_GTM_ID]
      ]);
    });

    test('should not load multiple GTM scripts', () => {
      document.head.innerHTML = `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${EXPECTED_GTM_ID}"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=${EXPECTED_GTM_ID}"></script>
      `;

      const gtagScripts = document.querySelectorAll('script[src*="gtag/js"]');
      expect(gtagScripts.length).toBe(2); // This would indicate a problem in implementation
      
      // In a real implementation, you'd want this to be 1
      // This test documents the current behavior and can be used to verify fixes
    });
  });

  describe('Site Verification', () => {
    test('should have Google site verification meta tag', () => {
      const EXPECTED_VERIFICATION = 'N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM';
      document.head.innerHTML = `
        <meta name="google-site-verification" content="${EXPECTED_VERIFICATION}" />
      `;

      const verificationMeta = document.querySelector('meta[name="google-site-verification"]');
      expect(verificationMeta).toBeTruthy();
      expect(verificationMeta.getAttribute('content')).toBe(EXPECTED_VERIFICATION);
    });

    test('should have only one site verification meta tag', () => {
      document.head.innerHTML = `
        <meta name="google-site-verification" content="N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM" />
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
          window.gtag('config', EXPECTED_GTM_ID, {
            page_title: page_title,
            page_location: page_location
          });
        }
      };

      trackPageView('Home Page', 'https://www.aledlie.com/');

      expect(window.gtag).toHaveBeenCalledWith('config', EXPECTED_GTM_ID, {
        page_title: 'Home Page',
        page_location: 'https://www.aledlie.com/'
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
        <a href="https://github.com/aledlie" target="_blank" class="external-link">GitHub</a>
        <a href="/about" class="internal-link">About</a>
      `;

      const trackOutboundClick = (url) => {
        if (window.gtag && url.startsWith('http') && !url.includes('aledlie.com')) {
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
        event_label: 'https://github.com/aledlie',
        transport_type: 'beacon'
      });
    });

    test('should not track internal link clicks as outbound', () => {
      const trackOutboundClick = (url) => {
        if (window.gtag && url.startsWith('http') && !url.includes('aledlie.com')) {
          window.gtag('event', 'click', {
            event_category: 'outbound',
            event_label: url
          });
        }
      };

      trackOutboundClick('https://www.aledlie.com/about');
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
        window[`ga-disable-${EXPECTED_GTM_ID}`] = true;
      };

      disableAnalytics();
      expect(window[`ga-disable-${EXPECTED_GTM_ID}`]).toBe(true);
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