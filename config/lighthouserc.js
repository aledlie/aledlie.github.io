const {
  SERVER,
  SCORE_THRESHOLDS,
  WEB_VITALS,
  LIGHTHOUSE_CONFIG
} = require('./constants');

module.exports = {
  ci: {
    collect: {
      url: [
        SERVER.baseUrlAlt,
        `${SERVER.baseUrlAlt}/about/`,
        `${SERVER.baseUrlAlt}/posts/`
      ],
      numberOfRuns: LIGHTHOUSE_CONFIG.numberOfRuns,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: SCORE_THRESHOLDS.performance }],
        'categories:accessibility': ['error', { minScore: SCORE_THRESHOLDS.accessibility }],
        'categories:best-practices': ['warn', { minScore: SCORE_THRESHOLDS.bestPractices }],
        'categories:seo': ['error', { minScore: SCORE_THRESHOLDS.seo }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: WEB_VITALS.firstContentfulPaint }],
        'largest-contentful-paint': ['warn', { maxNumericValue: WEB_VITALS.largestContentfulPaint }],
        'speed-index': ['warn', { maxNumericValue: WEB_VITALS.speedIndex }],
        'total-blocking-time': ['error', { maxNumericValue: WEB_VITALS.totalBlockingTime }],
        'cumulative-layout-shift': ['error', { maxNumericValue: WEB_VITALS.cumulativeLayoutShift }],

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'valid-lang': 'error',

        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'canonical': 'warn',

        // Best Practices
        'uses-https': 'error',
        'is-on-https': 'error',
        'external-anchors-use-rel-noopener': 'warn',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      command: 'npm run serve',
      port: SERVER.port,
      wait: SERVER.startupWaitMs
    }
  }
};
