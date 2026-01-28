/**
 * Shared test constants
 * Centralizes magic numbers for maintainability
 */

// Server configuration (DRY consolidation)
const SERVER = {
  port: 4000,
  host: 'localhost',
  get baseUrl() { return `http://${this.host}:${this.port}`; },
  get baseUrlAlt() { return `http://127.0.0.1:${this.port}`; },
  startupWaitMs: 3000,
  startupTimeoutMs: 120000
};

// Standard device viewport sizes
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};

// Performance thresholds
const PERFORMANCE = {
  pageLoadTimeoutMs: SERVER.startupWaitMs,
  networkIdleWaitMs: SERVER.startupWaitMs
};

// HTTP status codes
const HTTP_STATUS = {
  NOT_FOUND: 404
};

// Analytics cookie consent values
const ANALYTICS = {
  GA_CONSENT_PENDING: 9
};

// Lighthouse score thresholds (0-1 scale, canonical source)
const SCORE_THRESHOLDS = {
  performance: 0.85,
  accessibility: 0.95,
  bestPractices: 0.90,
  seo: 0.95
};

// Core Web Vitals thresholds (milliseconds unless noted)
const WEB_VITALS = {
  firstContentfulPaint: 2000,
  largestContentfulPaint: 3000,
  speedIndex: 4000,
  totalBlockingTime: 300,
  cumulativeLayoutShift: 0.1  // unitless
};

// Lighthouse-specific configuration
const LIGHTHOUSE_CONFIG = {
  numberOfRuns: 3
};

// Test pages (commonly tested URLs)
const TEST_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/about/', name: 'About Page' },
  { path: '/posts/', name: 'Posts Page' }
];

// Console error patterns to ignore in E2E tests
const IGNORED_CONSOLE_ERRORS = [
  'gtag',
  'analytics',
  'ERR_FAILED',
  'net::',
  'Failed to load resource',
  'googletagmanager',
  '422',
  'Cookie',
  '_fbp',
  'facebook'
];

// WCAG-compliant colors for validation (RGB format from computed styles)
const WCAG_COLORS = {
  footerText: 'rgb(74, 74, 74)',  // #4a4a4a
  bodyText: 'rgb(34, 34, 34)'     // #222222
};

// E2E test timeouts
const E2E_TIMEOUTS = {
  styleLoadMs: 10000,
  shortDelayMs: 500
};

module.exports = {
  SERVER,
  VIEWPORTS,
  PERFORMANCE,
  HTTP_STATUS,
  ANALYTICS,
  SCORE_THRESHOLDS,
  WEB_VITALS,
  LIGHTHOUSE_CONFIG,
  TEST_PAGES,
  IGNORED_CONSOLE_ERRORS,
  WCAG_COLORS,
  E2E_TIMEOUTS
};
