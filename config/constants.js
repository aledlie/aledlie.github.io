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

module.exports = {
  SERVER,
  VIEWPORTS,
  PERFORMANCE,
  HTTP_STATUS,
  ANALYTICS
};
