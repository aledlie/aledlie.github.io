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

// Analytics IDs and configuration (canonical source - mirrors _config.yml)
const ANALYTICS = {
  GA4_TRACKING_ID: 'G-J7TL7PQH7S',
  GTM_CONTAINER_ID: 'GTM-NR4GGH5K',
  FACEBOOK_PIXEL_ID: '685721201205820',
  GOOGLE_SITE_VERIFICATION: 'N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM',
  GA_CONSENT_PENDING: 9
};

// Lighthouse score thresholds (0-1 scale, canonical source)
// TODO: Restore bestPractices to 0.90 once Facebook updates fbevents.js SDK
// Note: bestPractices threshold lowered to 0.75 due to unavoidable third-party
// issues from Facebook Pixel (deprecated APIs: AttributionReporting, Topics;
// console errors from capig.datah04.com 422 responses). These are external
// scripts we cannot modify. See: https://connect.facebook.net/en_US/fbevents.js
const SCORE_THRESHOLDS = {
  performance: 0.85,
  accessibility: 0.95,
  bestPractices: 0.75,  // TODO: restore to 0.90 when Facebook fixes deprecated APIs
  seo: 0.95
};

// Core Web Vitals thresholds - Google's "good" ratings (canonical source)
// All values in milliseconds unless noted
const WEB_VITALS = {
  // Paint metrics
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  speedIndex: 4000,
  // Interactivity metrics
  firstInputDelay: 100,
  timeToInteractive: 3800,
  totalBlockingTime: 300,
  mainThreadBudget: 50,
  // Layout stability (unitless)
  cumulativeLayoutShift: 0.1
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
