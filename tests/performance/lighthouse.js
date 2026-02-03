/**
 * Lighthouse Performance Testing
 * Uses Lighthouse to test site performance, accessibility, SEO, and best practices
 */

const fs = require('fs');
const path = require('path');
const {
  SERVER,
  SCORE_THRESHOLDS: THRESHOLDS_0_1,
  TEST_PAGES
} = require('../../config/constants');

// Convert 0-1 scale to 0-100 for display/comparison
const SCORE_THRESHOLDS = Object.fromEntries(
  Object.entries(THRESHOLDS_0_1).map(([k, v]) => [k, v * 100])
);

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 5,
  retryDelayMs: 5000
};

// Test configuration
const TEST_CONFIG = {
  runsPerPage: 3  // Multiple runs to average out variance
};

class PerformanceTestSuite {
  constructor(baseUrl = SERVER.baseUrl) {
    this.baseUrl = baseUrl;
    this.chrome = null;
    this.results = [];
    this.lighthouse = null;
    this.chromeLauncher = null;
  }

  async loadModules() {
    // Dynamic import for ESM modules
    this.lighthouse = (await import('lighthouse')).default;
    this.chromeLauncher = await import('chrome-launcher');
  }

  async setup() {
    console.log('Launching Chrome for Lighthouse tests...');
    await this.loadModules();
    this.chrome = await this.chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });
  }

  async teardown() {
    if (this.chrome) {
      await this.chrome.kill();
    }
  }

  async runLighthouseTest(url, options = {}) {
    const defaultOptions = {
      logLevel: 'info',
      output: 'json',
      port: this.chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      console.log(`Running Lighthouse test for: ${url}`);
      const runnerResult = await this.lighthouse(url, mergedOptions);

      if (!runnerResult || !runnerResult.lhr) {
        throw new Error('Lighthouse test failed - no results returned');
      }

      return runnerResult.lhr;
    } catch (error) {
      console.error(`Lighthouse test failed for ${url}:`, error);
      return null;
    }
  }

  async testPage(pagePath, pageName) {
    const url = `${this.baseUrl}${pagePath}`;
    const runs = TEST_CONFIG.runsPerPage;
    const allScores = [];

    console.log(`Running ${runs} Lighthouse tests for: ${url}`);

    for (let i = 0; i < runs; i++) {
      const result = await this.runLighthouseTest(url);
      if (result) {
        allScores.push({
          performance: result.categories.performance?.score * 100 || 0,
          accessibility: result.categories.accessibility?.score * 100 || 0,
          bestPractices: result.categories['best-practices']?.score * 100 || 0,
          seo: result.categories.seo?.score * 100 || 0,
          metrics: {
            firstContentfulPaint: result.audits['first-contentful-paint']?.displayValue || 'N/A',
            largestContentfulPaint: result.audits['largest-contentful-paint']?.displayValue || 'N/A',
            speedIndex: result.audits['speed-index']?.displayValue || 'N/A',
            totalBlockingTime: result.audits['total-blocking-time']?.displayValue || 'N/A',
            cumulativeLayoutShift: result.audits['cumulative-layout-shift']?.displayValue || 'N/A',
          }
        });
      }
      if (i < runs - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (allScores.length === 0) {
      console.error(`Failed to test ${pageName}`);
      return null;
    }

    // Average scores across runs
    const scores = {
      performance: allScores.reduce((sum, s) => sum + s.performance, 0) / allScores.length,
      accessibility: allScores.reduce((sum, s) => sum + s.accessibility, 0) / allScores.length,
      bestPractices: allScores.reduce((sum, s) => sum + s.bestPractices, 0) / allScores.length,
      seo: allScores.reduce((sum, s) => sum + s.seo, 0) / allScores.length,
    };

    // Use metrics from last run
    const metrics = allScores[allScores.length - 1].metrics;

    const pageResult = {
      pageName,
      url,
      scores,
      metrics,
      runsCompleted: allScores.length,
      timestamp: new Date().toISOString(),
      passed: this.evaluateScores(scores)
    };

    this.results.push(pageResult);
    this.logPageResult(pageResult);

    return pageResult;
  }

  evaluateScores(scores) {
    const passed = Object.keys(SCORE_THRESHOLDS).every(category =>
      scores[category] >= SCORE_THRESHOLDS[category]
    );

    return passed;
  }

  logPageResult(result) {
    const runsInfo = result.runsCompleted ? ` (avg of ${result.runsCompleted} runs)` : '';
    console.log(`\n Results for ${result.pageName}${runsInfo}:`);
    console.log(`Performance: ${result.scores.performance.toFixed(1)}/100`);
    console.log(`Accessibility: ${result.scores.accessibility.toFixed(1)}/100`);
    console.log(`Best Practices: ${result.scores.bestPractices.toFixed(1)}/100`);
    console.log(`SEO: ${result.scores.seo.toFixed(1)}/100`);
    console.log(`First Contentful Paint: ${result.metrics.firstContentfulPaint}`);
    console.log(`Largest Contentful Paint: ${result.metrics.largestContentfulPaint}`);
    console.log(`Speed Index: ${result.metrics.speedIndex}`);
    console.log(`Total Blocking Time: ${result.metrics.totalBlockingTime}`);
    console.log(`Cumulative Layout Shift: ${result.metrics.cumulativeLayoutShift}`);
    console.log(`${result.passed ? 'PASSED' : 'FAILED'} performance thresholds\n`);
  }

  async runFullSuite() {
    console.log('Starting comprehensive performance test suite...\n');

    await this.setup();

    try {
      for (const page of TEST_PAGES) {
        await this.testPage(page.path, page.name);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.generateSummaryReport();
      this.saveResults();

      const allPassed = this.results.every(result => result.passed);

      if (allPassed) {
        console.log('All performance tests passed!');
        process.exit(0);
      } else {
        console.log('Some performance tests failed. Check the results above.');
        process.exit(1);
      }

    } catch (error) {
      console.error('Performance test suite failed:', error);
      process.exit(1);
    } finally {
      await this.teardown();
    }
  }

  generateSummaryReport() {
    console.log('\nPERFORMANCE TEST SUMMARY');
    console.log('================================');

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total pages tested: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    // Calculate average scores
    const avgScores = this.results.reduce((acc, result) => {
      Object.keys(result.scores).forEach(category => {
        acc[category] = (acc[category] || 0) + result.scores[category];
      });
      return acc;
    }, {});

    Object.keys(avgScores).forEach(category => {
      avgScores[category] = (avgScores[category] / totalTests).toFixed(1);
    });

    console.log('\nAverage Scores:');
    console.log(`Performance: ${avgScores.performance}/100`);
    console.log(`Accessibility: ${avgScores.accessibility}/100`);
    console.log(`Best Practices: ${avgScores.bestPractices}/100`);
    console.log(`SEO: ${avgScores.seo}/100`);

    // Identify failing pages
    const failedPages = this.results.filter(r => !r.passed);
    if (failedPages.length > 0) {
      console.log('\nPages that failed performance thresholds:');
      failedPages.forEach(page => {
        console.log(`- ${page.pageName}: ${page.url}`);
      });
    }
  }

  saveResults() {
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `lighthouse-results-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passedTests: this.results.filter(r => r.passed).length,
        failedTests: this.results.filter(r => !r.passed).length
      },
      results: this.results
    };

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\nDetailed results saved to: ${filepath}`);
  }
}

// Additional performance utilities
class PerformanceUtils {
  static async checkSiteAvailability(url, maxRetries = RETRY_CONFIG.maxRetries) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log(`Site is available at ${url}`);
          return true;
        }
      } catch (error) {
        const retryDelaySec = RETRY_CONFIG.retryDelayMs / 1000;
        console.log(`Attempt ${i + 1}/${maxRetries}: Site not available yet, retrying in ${retryDelaySec}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelayMs));
      }
    }
    throw new Error(`Site not available at ${url} after ${maxRetries} attempts`);
  }

  static async measurePageLoadTime(url) {
    const start = performance.now();
    try {
      await fetch(url);
      const end = performance.now();
      return end - start;
    } catch (error) {
      console.error(`Failed to measure load time for ${url}:`, error);
      return null;
    }
  }
}

// Run the performance test suite
async function main() {
  const baseUrl = process.env.BASE_URL || SERVER.baseUrl;

  console.log(`Testing site performance at: ${baseUrl}`);

  // Check if site is available before running tests
  try {
    await PerformanceUtils.checkSiteAvailability(baseUrl);
  } catch (error) {
    console.error('Site is not available for testing:', error.message);
    console.log('Make sure to run `npm run serve` in another terminal first.');
    process.exit(1);
  }

  const testSuite = new PerformanceTestSuite(baseUrl);
  await testSuite.runFullSuite();
}

// Export for use in other files
module.exports = { PerformanceTestSuite, PerformanceUtils };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Performance test suite failed:', error);
    process.exit(1);
  });
}
