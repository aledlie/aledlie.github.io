/**
 * Shared test constants
 * Centralizes magic numbers for maintainability
 */

// Standard device viewport sizes
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};

// Performance thresholds
const PERFORMANCE = {
  pageLoadTimeoutMs: 3000,
  networkIdleWaitMs: 3000
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
  VIEWPORTS,
  PERFORMANCE,
  HTTP_STATUS,
  ANALYTICS
};
