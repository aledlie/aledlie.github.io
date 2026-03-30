# Testing Architecture

## Test suites
- **Jest** (`npm test`) — unit tests in `tests/unit/`, jsdom environment, setup in `tests/setup.js`
- **Playwright** (`npm run test:e2e`) — e2e + a11y, config at `config/playwright.config.js`, browsers: Chrome/Firefox/Safari/Mobile
- **Lighthouse** (`npm run test:performance`) — perf audits via `tests/performance/lighthouse.js`
- **Link checker** (`npm run test:links`) — `tests/links/check-links.mjs`
- **Full suite** (`npm run test:all`) — build + unit + e2e + perf

## Coverage
- Source: `assets/js/**/*.js` (excluding vendor/)
- Output: `tests/coverage/`

## CI
- `npm run test:ci` — build + jest --ci --coverage + playwright --reporter=github
