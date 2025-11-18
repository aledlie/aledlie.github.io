# Test Suite Documentation

This test suite provides comprehensive testing for site functionality, analytics tracking, and performance optimization.

## Overview

The test suite includes:

- **Unit Tests**: Test individual components and functions using Jest
- **End-to-End Tests**: Test complete user flows using Playwright
- **Analytics Tests**: Verify Google Tag Manager and tracking implementation
- **Performance Tests**: Measure Core Web Vitals and site performance using Lighthouse

## Quick Start

```bash
# Install dependencies
npm install

# Build the site (required for testing)
npm run build

# Run all tests
npm run test:all

# Run individual test suites
npm run test              # Unit tests with Jest
npm run test:e2e         # E2E tests with Playwright  
npm run test:performance # Performance tests with Lighthouse
```

## Test Structure

```
tests/
├── unit/                    # Jest unit tests
│   ├── site-functionality.test.js
│   └── setup.js
├── e2e/                     # Playwright end-to-end tests
│   ├── site-navigation.spec.js
│   └── analytics.spec.js
├── analytics/               # Analytics-specific tests
│   └── google-analytics.test.js
├── performance/             # Performance testing
│   ├── lighthouse.js
│   ├── core-web-vitals.test.js
│   └── results/            # Generated test results
└── README.md               # This file
```

## Test Categories

### Unit Tests (Jest)

Tests core functionality and DOM manipulation:
- Navigation structure and links
- Form validation and submission
- Responsive design elements
- Accessibility features
- Meta tags and SEO elements

**Run with:** `npm run test`

### End-to-End Tests (Playwright)

Tests complete user workflows across multiple browsers:
- Site navigation and page loading
- Mobile/tablet/desktop responsiveness  
- Error handling (404 pages)
- Performance and console errors
- Analytics implementation

**Run with:** `npm run test:e2e`

**Supported browsers:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari

### Analytics Tests

Verifies Google Analytics 4 (GA4) implementation:
- GA4 script loading with correct tracking ID (`G-J7TL7PQH7S`)
- Google site verification meta tag
- Event tracking functionality
- Privacy compliance (Do Not Track, opt-out)
- Error handling for blocked/failed analytics

**Run unit tests:** `npm run test` (includes analytics unit tests)
**Run E2E tests:** `npm run test:e2e analytics.spec.js`

### Performance Tests (Lighthouse)

Measures Core Web Vitals and site performance:
- **Lighthouse Scores**: Performance, Accessibility, Best Practices, SEO
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTI
- **Resource Loading**: Critical CSS, lazy loading, modern image formats
- **Performance Thresholds**: Configurable pass/fail criteria

**Run with:** `npm run test:performance`

**Default thresholds:**
- Performance: ≥90
- Accessibility: ≥95  
- Best Practices: ≥90
- SEO: ≥95

## Configuration

### Jest Configuration

Located in `package.json`:
```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "testMatch": ["<rootDir>/tests/**/*.test.js"]
  }
}
```

### Playwright Configuration

Located in `playwright.config.js`:
- Tests multiple browsers and devices
- Automatic Jekyll server startup
- Screenshot and video capture on failure
- CI-friendly reporting

### Performance Test Configuration

Located in `tests/performance/lighthouse.js`:
- Configurable base URL (default: `http://localhost:4000`)
- Adjustable performance thresholds
- Automated report generation
- JSON result export

## Environment Variables

- `BASE_URL`: Override default localhost URL for testing
- `CI`: Enables CI-specific configurations (retry logic, reporting)

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
```

### Local CI Testing

```bash
# Run tests as they would run in CI
CI=true npm run test:ci
```

## Performance Monitoring

The performance tests generate detailed reports:

- **Console Output**: Real-time scores and metrics
- **JSON Reports**: Saved to `tests/performance/results/`
- **Lighthouse HTML**: Full audit details
- **Trend Analysis**: Compare results over time

### Performance Thresholds

You can customize performance thresholds in `tests/performance/lighthouse.js`:

```javascript
const thresholds = {
  performance: 90,    // Lighthouse Performance score
  accessibility: 95,  // Accessibility score  
  bestPractices: 90, // Best Practices score
  seo: 95            // SEO score
};
```

## Troubleshooting

### Common Issues

**Jekyll server not running:**
```bash
# Start Jekyll in another terminal
npm run serve
```

**Tests timing out:**
- Increase timeout values in test configuration
- Check that site is accessible at `BASE_URL`

**Playwright installation issues:**
```bash
npx playwright install
```

**Performance tests failing:**
- Check Jekyll server is running
- Verify site is built: `npm run build`
- Try increasing performance thresholds temporarily

### Debug Mode

**Jest debug:**
```bash
npm run test:watch  # Watch mode for development
```

**Playwright debug:**
```bash
npx playwright test --debug
npx playwright test --headed  # See browser UI
```

**Performance debug:**
```bash
BASE_URL=http://localhost:4000 node tests/performance/lighthouse.js
```

## Adding New Tests

### Unit Test Example

```javascript
// tests/unit/my-feature.test.js
describe('My Feature', () => {
  test('should work correctly', () => {
    // Your test code
    expect(true).toBe(true);
  });
});
```

### E2E Test Example

```javascript
// tests/e2e/my-feature.spec.js
const { test, expect } = require('@playwright/test');

test('should navigate to new page', async ({ page }) => {
  await page.goto('/');
  await page.click('text=My Link');
  await expect(page).toHaveURL('/my-page');
});
```

### Performance Test Addition

Edit `tests/performance/lighthouse.js` to add new pages:

```javascript
const pagesToTest = [
  { path: '/', name: 'Homepage' },
  { path: '/my-new-page/', name: 'My New Page' }  // Add here
];
```

## Reporting Issues

If tests are failing or you need help:

1. Check the console output for specific error messages
2. Review the generated reports in `tests/performance/results/`
3. Run individual test suites to isolate issues
4. Check that Jekyll site builds and serves correctly

## Contributing

When adding new features:

1. Add corresponding unit tests
2. Add E2E tests for user workflows  
3. Update performance tests if needed
4. Ensure all tests pass before submitting