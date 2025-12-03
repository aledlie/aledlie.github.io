module.exports = {
  ci: {
    collect: {
      url: [
        'http://127.0.0.1:4000',
        'http://127.0.0.1:4000/about/',
        'http://127.0.0.1:4000/posts/',
        'http://127.0.0.1:4000/projects/'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
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
      command: 'bundle exec jekyll serve',
      port: 4000,
      wait: 3000
    }
  }
};