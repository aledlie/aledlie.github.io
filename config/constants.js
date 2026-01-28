/**
 * Shared test constants
 * Centralizes magic numbers for maintainability
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load _config.yml as single source of truth for site configuration
const configPath = path.join(__dirname, '..', '_config.yml');
const siteConfig = yaml.load(fs.readFileSync(configPath, 'utf8'));

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

// Analytics IDs and configuration (loaded from _config.yml)
const ANALYTICS = {
  GA4_TRACKING_ID: siteConfig.analytics?.google?.tracking_id,
  GTM_CONTAINER_ID: siteConfig.analytics?.google_tag_manager?.container_id,
  FACEBOOK_PIXEL_ID: siteConfig.analytics?.facebook_pixel?.pixel_id,
  GOOGLE_SITE_VERIFICATION: siteConfig.google_site_verification,
  // Test-only constants (not in _config.yml)
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

// Site configuration from _config.yml
const SITE = {
  url: siteConfig.url,
  domain: new URL(siteConfig.url).hostname.replace('www.', ''),
  githubUsername: siteConfig.github_username,
  get githubUrl() { return `https://github.com/${this.githubUsername}`; }
};

// Legacy export for backwards compatibility
const SITE_URL = SITE.url;

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
  E2E_TIMEOUTS,
  SITE,
  SITE_URL,  // Legacy alias for SITE.url
  siteConfig  // Full config for advanced use cases
};
