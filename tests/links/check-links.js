/**
 * External Link Checker
 * Scans markdown files for external links and verifies they are accessible
 */

const fs = require('fs');
const path = require('path');

// Directories to scan for markdown files
const CONTENT_DIRS = ['_posts', '_projects', '_reports', '_work', '_pages'];

// Link extraction regex - matches markdown links [text](url)
const LINK_REGEX = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;

// Skip certain domains that block automated requests
const SKIP_DOMAINS = [];

// Request configuration
const REQUEST_CONFIG = {
  timeout: 10000,
  userAgent: 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
  concurrency: 5,
  retryCount: 2,
  retryDelay: 1000
};

class LinkChecker {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.links = new Map(); // url -> { files: [], status: null }
    this.results = { passed: 0, failed: 0, skipped: 0 };
  }

  async scanFiles() {
    console.log('Scanning markdown files for external links...\n');

    for (const dir of CONTENT_DIRS) {
      const dirPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(dirPath)) continue;

      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        this.extractLinks(content, `${dir}/${file}`);
      }
    }

    console.log(`Found ${this.links.size} unique external links\n`);
  }

  extractLinks(content, sourceFile) {
    let match;
    while ((match = LINK_REGEX.exec(content)) !== null) {
      const url = match[2];
      if (!this.links.has(url)) {
        this.links.set(url, { files: [], status: null, error: null });
      }
      this.links.get(url).files.push(sourceFile);
    }
  }

  shouldSkip(url) {
    try {
      const hostname = new URL(url).hostname;
      return SKIP_DOMAINS.some(domain => hostname.includes(domain));
    } catch {
      return true;
    }
  }

  async checkLink(url) {
    if (this.shouldSkip(url)) {
      return { status: 'skipped', code: null, error: 'Domain in skip list' };
    }

    for (let attempt = 0; attempt <= REQUEST_CONFIG.retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_CONFIG.timeout);

        // Try HEAD first (faster), fall back to GET if blocked
        let response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': REQUEST_CONFIG.userAgent },
          redirect: 'follow'
        });

        clearTimeout(timeout);

        // Some servers block HEAD, retry with GET
        if (response.status === 405 || response.status === 403) {
          const getController = new AbortController();
          const getTimeout = setTimeout(() => getController.abort(), REQUEST_CONFIG.timeout);

          response = await fetch(url, {
            method: 'GET',
            signal: getController.signal,
            headers: { 'User-Agent': REQUEST_CONFIG.userAgent },
            redirect: 'follow'
          });

          clearTimeout(getTimeout);
        }

        if (response.ok || response.status === 301 || response.status === 302) {
          return { status: 'ok', code: response.status, error: null };
        }

        return { status: 'failed', code: response.status, error: `HTTP ${response.status}` };
      } catch (error) {
        if (attempt < REQUEST_CONFIG.retryCount) {
          await new Promise(r => setTimeout(r, REQUEST_CONFIG.retryDelay));
          continue;
        }
        return { status: 'failed', code: null, error: error.message };
      }
    }
  }

  async checkAllLinks() {
    const urls = Array.from(this.links.keys());
    const total = urls.length;
    let checked = 0;

    // Process in batches for concurrency control
    for (let i = 0; i < urls.length; i += REQUEST_CONFIG.concurrency) {
      const batch = urls.slice(i, i + REQUEST_CONFIG.concurrency);
      const results = await Promise.all(
        batch.map(async url => {
          const result = await this.checkLink(url);
          this.links.get(url).status = result.status;
          this.links.get(url).error = result.error;
          this.links.get(url).code = result.code;

          checked++;
          const status = result.status === 'ok' ? '✓' :
                        result.status === 'skipped' ? '○' : '✗';
          console.log(`[${checked}/${total}] ${status} ${url}`);

          if (result.status === 'ok') this.results.passed++;
          else if (result.status === 'skipped') this.results.skipped++;
          else this.results.failed++;

          return { url, ...result };
        })
      );
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('LINK CHECK SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total links: ${this.links.size}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Skipped: ${this.results.skipped}`);

    const failedLinks = Array.from(this.links.entries())
      .filter(([_, data]) => data.status === 'failed');

    if (failedLinks.length > 0) {
      console.log('\nFAILED LINKS:');
      console.log('-'.repeat(60));
      for (const [url, data] of failedLinks) {
        console.log(`\n${url}`);
        console.log(`  Error: ${data.error}`);
        console.log(`  Found in: ${data.files.join(', ')}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    return this.results.failed === 0;
  }

  async run() {
    await this.scanFiles();

    if (this.links.size === 0) {
      console.log('No external links found.');
      return true;
    }

    await this.checkAllLinks();
    return this.generateReport();
  }
}

async function main() {
  console.log('External Link Checker');
  console.log('='.repeat(60) + '\n');

  const checker = new LinkChecker();
  const success = await checker.run();

  process.exit(success ? 0 : 1);
}

module.exports = { LinkChecker };

if (require.main === module) {
  main().catch(error => {
    console.error('Link check failed:', error);
    process.exit(1);
  });
}
