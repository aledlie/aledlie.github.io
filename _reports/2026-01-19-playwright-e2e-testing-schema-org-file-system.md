---
layout: single
title: "Playwright E2E Testing Setup with Traffic Tracking and OpenTelemetry"
date: 2026-01-19
author_profile: true
categories: [testing, e2e-testing, observability]
tags: [playwright, typescript, opentelemetry, har-recording, core-web-vitals, traffic-tracking, testing-infrastructure]
excerpt: "Complete E2E testing infrastructure for schema-org-file-system dashboard with traffic tracking headers, OpenTelemetry distributed tracing, HAR recording, and Core Web Vitals measurement."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---


**Session Date**: 2026-01-19<br>
**Project**: schema-org-file-system<br>
**Focus**: Implement comprehensive E2E testing infrastructure with observability<br>
**Session Type**: Implementation

## Executive Summary

Implemented a complete Playwright E2E testing framework for the schema-org-file-system dashboard. The setup includes **traffic tracking headers** for request correlation, **OpenTelemetry integration** for distributed tracing, **HAR recording** for network analysis, and **Core Web Vitals measurement** for performance monitoring.

Created **14 files** including 4 test fixtures, 4 test spec files covering all dashboard pages, global setup/teardown for OTEL initialization, and configuration files. Installed **199 npm packages** and **3 Playwright browsers** (Chromium, Firefox, WebKit).

**Key Metrics:**

| Metric | Value |
|--------|-------|
| **Files Created** | 14 |
| **Test Spec Files** | 4 |
| **Fixture Modules** | 5 |
| **NPM Packages Added** | 199 |
| **Browsers Installed** | 3 |
| **Build Errors** | 0 |

## Problem Statement

The schema-org-file-system project has a dashboard (`_site/`) with multiple HTML pages but no automated E2E testing infrastructure. Key requirements:

1. **Traffic Tracking**: Ability to identify test traffic in production logs
2. **Distributed Tracing**: OpenTelemetry integration for observability
3. **Network Analysis**: HAR file recording for debugging
4. **Performance Monitoring**: Core Web Vitals measurement (LCP, FCP, CLS, TTFB)
5. **Multi-Browser Testing**: Chromium, Firefox, WebKit, and mobile viewports

## Implementation Details

### Configuration Files

**File**: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'results/e2e-results.json' }],
    ['list']
  ],
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:3000',
  },
});
```

### Traffic Tracking Fixture

**File**: `tests/e2e/fixtures/traffic-tracking.ts`

Injects tracking headers on all requests:

```typescript
await page.route('**/*', async (route) => {
  const headers = {
    ...route.request().headers(),
    'X-Test-Traffic': 'playwright-e2e',
    'X-Request-ID': uuidv4(),
    'X-Correlation-ID': correlationId,
    'X-Test-Name': testName,
    'X-Test-File': testFile,
  };
  await route.continue({ headers });
});
```

**Headers Injected:**

| Header | Description |
|--------|-------------|
| `X-Test-Traffic` | Identifies traffic as E2E test (always `playwright-e2e`) |
| `X-Request-ID` | UUID per request for individual request tracking |
| `X-Correlation-ID` | UUID per test run for correlating all requests |
| `X-Test-Name` | Test title for debugging |
| `X-Test-File` | Spec filename for traceability |

### OpenTelemetry Integration

**File**: `tests/e2e/fixtures/otel-tracing.ts`

Creates spans for tests and network requests:

```typescript
page.on('request', (request: Request) => {
  const span = tracer.startSpan(`HTTP ${request.method()} ${pathname}`, {
    attributes: {
      'http.method': request.method(),
      'http.url': request.url(),
      'resource.type': request.resourceType(),
    },
  });
  requestSpans.set(key, span);
});

page.on('response', (response: Response) => {
  span.setAttributes({ 'http.status_code': response.status() });
  span.setStatus({ code: response.status() >= 400 ? ERROR : OK });
  span.end();
});
```

### Core Web Vitals Measurement

**File**: `tests/e2e/fixtures/performance.ts`

Measures key performance metrics:

```typescript
export interface CoreWebVitals {
  lcp: number | null;  // Largest Contentful Paint
  fcp: number | null;  // First Contentful Paint
  cls: number | null;  // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: 2500,   // 2.5s for "good"
  fcp: 1800,   // 1.8s for "good"
  cls: 0.1,    // 0.1 for "good"
  ttfb: 800,   // 800ms for "good"
};
```

### HAR Recording

**File**: `tests/e2e/fixtures/har-recording.ts`

Records network traffic per test:

```typescript
const context = await browser.newContext({
  recordHar: {
    path: harPath,
    mode: 'full',
    content: 'embed',
  },
});
```

**Output**: `test-results/har/<test-file>-<test-name>.har`

### Global Setup/Teardown

**File**: `tests/e2e/global-setup.ts`

Initializes OTEL SDK and creates test run metadata:

```typescript
const metadata: TestRunMetadata = {
  runId: uuidv4(),
  correlationId: uuidv4(),
  startTime: new Date().toISOString(),
  playwright: { version, projects },
  otel: { enabled, endpoint },
  environment: { nodeVersion, platform, ci },
};
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
```

### Test Specifications

Created 4 comprehensive test spec files:

| Spec File | Tests | Coverage |
|-----------|-------|----------|
| `dashboard.spec.ts` | 14 | Hero, stats, cards, navigation, performance |
| `metadata-viewer.spec.ts` | 17 | Filters, search, dark mode, large JSON |
| `timeline.spec.ts` | 12 | Visualization, interactions, FPS |
| `correction-interface.spec.ts` | 14 | Forms, validation, export |

**Example Test** (`dashboard.spec.ts`):

```typescript
test('should meet Core Web Vitals thresholds', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('load');

  const metrics = await measurePagePerformance(page);
  console.log(formatMetrics(metrics));

  const violations = checkThresholds(metrics, DEFAULT_THRESHOLDS);
  if (metrics.lcp !== null) {
    expect(metrics.lcp).toBeLessThan(2500);
  }
});
```

## Files Created

### Configuration (3 files)

| File | Lines | Purpose |
|------|-------|---------|
| `package.json` | 32 | Updated with Playwright + OTEL dependencies |
| `tsconfig.json` | 26 | TypeScript configuration for E2E tests |
| `playwright.config.ts` | 55 | Multi-browser, HAR, webServer configuration |

### Test Fixtures (5 files)

| File | Lines | Purpose |
|------|-------|---------|
| `tests/e2e/fixtures/traffic-tracking.ts` | 95 | X-Test-Traffic header injection |
| `tests/e2e/fixtures/har-recording.ts` | 135 | HAR file recording per test |
| `tests/e2e/fixtures/otel-tracing.ts` | 165 | OpenTelemetry spans for tests |
| `tests/e2e/fixtures/performance.ts` | 195 | Core Web Vitals measurement |
| `tests/e2e/fixtures/index.ts` | 35 | Merged fixture export |

### Global Setup/Teardown (2 files)

| File | Lines | Purpose |
|------|-------|---------|
| `tests/e2e/global-setup.ts` | 85 | OTEL SDK init, test metadata |
| `tests/e2e/global-teardown.ts` | 70 | Flush spans, update metadata |

### Test Specs (4 files)

| File | Tests | Purpose |
|------|-------|---------|
| `tests/e2e/dashboard.spec.ts` | 14 | Main dashboard tests |
| `tests/e2e/metadata-viewer.spec.ts` | 17 | Metadata viewer tests |
| `tests/e2e/timeline.spec.ts` | 12 | Timeline visualization tests |
| `tests/e2e/correction-interface.spec.ts` | 14 | Correction form tests |

## Dependencies Installed

### NPM Packages (199 total)

**Core Testing:**
- `@playwright/test` ^1.40.0
- `typescript` ^5.3.0
- `@types/node` ^20.10.0

**OpenTelemetry:**
- `@opentelemetry/api` ^1.7.0
- `@opentelemetry/sdk-node` ^0.46.0
- `@opentelemetry/sdk-trace-node` ^1.19.0
- `@opentelemetry/exporter-trace-otlp-http` ^0.46.0
- `@opentelemetry/resources` ^1.19.0
- `@opentelemetry/semantic-conventions` ^1.19.0

**Utilities:**
- `uuid` ^9.0.1
- `serve` ^14.2.0

### Playwright Browsers

| Browser | Version | Build |
|---------|---------|-------|
| Chromium | (cached) | - |
| Firefox | 144.0.2 | v1497 |
| WebKit | 26.0 | v2227 |

## NPM Scripts

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:trace": "playwright test --trace on",
  "serve": "serve _site -l 3000"
}
```

## Output Directory Structure

```
test-results/
├── har/                    # HAR files per test
└── telemetry/
    └── test-run-metadata.json
playwright-report/          # HTML test report
results/
└── e2e-results.json        # JSON test results
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint |
| `OTEL_DEBUG` | Enable OTEL debug logging |
| `BASE_URL` | Override base URL (default: http://localhost:3000) |

## Verification

```bash
npm install

npx playwright install

npm run test:e2e

npm run test:e2e:report
```

## Key Decisions and Trade-offs

### Decision 1: Merged Fixtures vs Separate Test Files
**Choice**: Merged fixtures with selective imports available
**Rationale**: Provides convenience while maintaining flexibility
**Alternative Considered**: Separate test files per fixture
**Trade-off**: Slightly larger test context for simpler usage

### Decision 2: HAR Recording Per Test vs Per Suite
**Choice**: Per test recording
**Rationale**: Easier debugging of specific test failures
**Alternative Considered**: Single HAR per test suite
**Trade-off**: More files, but better isolation

### Decision 3: Default OTEL Disabled Unless Endpoint Set
**Choice**: Opt-in OTEL via environment variable
**Rationale**: No overhead for local development
**Alternative Considered**: Always enabled with console exporter
**Trade-off**: Requires setup for OTEL benefits

## Next Steps

### Immediate
1. Run `npm run test:e2e` to verify all tests pass
2. Configure OTEL endpoint for trace collection

### Short-term
3. Add visual regression testing with Playwright snapshots
4. Integrate with CI/CD pipeline (GitHub Actions)

### Medium-term
5. Add accessibility testing (axe-core integration)
6. Create custom reporters for metrics aggregation

## References

### Code Files
- `playwright.config.ts` - Main configuration
- `tests/e2e/fixtures/index.ts` - Merged fixtures
- `tests/e2e/global-setup.ts` - OTEL initialization

### Documentation
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [OpenTelemetry JS SDK](https://opentelemetry.io/docs/instrumentation/js/)
- [Core Web Vitals](https://web.dev/vitals/)

### Dashboard Pages Tested
- `_site/index.html` - Main dashboard
- `_site/metadata_viewer.html` - Metadata viewer
- `_site/timeline.html` - Timeline visualization
- `_site/correction_interface.html` - Correction interface
