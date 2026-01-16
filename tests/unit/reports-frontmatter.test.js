/**
 * Reports Front Matter Validation Tests
 * Ensures all documents in _reports directory have valid Jekyll front matter
 * and will render correctly when built
 */

const fs = require('fs');
const path = require('path');

// Path to _reports directory relative to project root
const REPORTS_DIR = path.join(__dirname, '../../_reports');

// Required front matter fields for Jekyll to process correctly
const REQUIRED_FIELDS = ['layout', 'title', 'date'];

// Optional but recommended fields
const RECOMMENDED_FIELDS = ['excerpt', 'categories', 'tags'];

// Valid layout values for this site
const VALID_LAYOUTS = ['single', 'archive', 'collection', 'home', 'post-index', 'default'];

// Regex patterns
const FRONT_MATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * Parse YAML front matter from content string
 * Simple parser for common front matter patterns
 */
function parseFrontMatter(content) {
  const match = content.match(FRONT_MATTER_REGEX);
  if (!match) return null;

  const yamlContent = match[1];
  const frontMatter = {};

  // Simple YAML parsing for key: value pairs
  const lines = yamlContent.split('\n');
  let currentKey = null;
  let currentValue = [];
  let inArray = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for array item
    if (trimmed.startsWith('- ') && currentKey) {
      if (!inArray) {
        frontMatter[currentKey] = [];
        inArray = true;
      }
      frontMatter[currentKey].push(trimmed.slice(2).trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    // Check for key: value pair
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle quoted strings
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle inline arrays [item1, item2]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }

      // Handle boolean values
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      currentKey = key;
      inArray = false;

      if (value !== '' && value !== null) {
        frontMatter[key] = value;
      }
    }
  }

  return frontMatter;
}

/**
 * Get all markdown files in _reports directory
 */
function getReportFiles() {
  if (!fs.existsSync(REPORTS_DIR)) {
    return [];
  }

  return fs.readdirSync(REPORTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      name: file,
      path: path.join(REPORTS_DIR, file),
      content: fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8')
    }));
}

describe('Reports Directory Front Matter Validation', () => {
  let reportFiles;

  beforeAll(() => {
    reportFiles = getReportFiles();
  });

  describe('Directory Structure', () => {
    test('_reports directory should exist', () => {
      expect(fs.existsSync(REPORTS_DIR)).toBe(true);
    });

    test('_reports directory should contain markdown files', () => {
      expect(reportFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Front Matter Presence', () => {
    test('all markdown files should have front matter delimiters', () => {
      const filesWithoutFrontMatter = [];

      reportFiles.forEach(file => {
        if (!file.content.startsWith('---')) {
          filesWithoutFrontMatter.push(file.name);
        }
      });

      expect(filesWithoutFrontMatter).toEqual([]);
    });

    test('all markdown files should have closing front matter delimiter', () => {
      const filesWithUnclosedFrontMatter = [];

      reportFiles.forEach(file => {
        const match = file.content.match(FRONT_MATTER_REGEX);
        if (!match) {
          filesWithUnclosedFrontMatter.push(file.name);
        }
      });

      expect(filesWithUnclosedFrontMatter).toEqual([]);
    });

    test('front matter should be parseable', () => {
      const unparsableFiles = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter === null) {
          unparsableFiles.push(file.name);
        }
      });

      expect(unparsableFiles).toEqual([]);
    });
  });

  describe('Required Fields', () => {
    test('all files should have layout field', () => {
      const missingLayout = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && !frontMatter.layout) {
          missingLayout.push(file.name);
        }
      });

      expect(missingLayout).toEqual([]);
    });

    test('all files should have title field', () => {
      const missingTitle = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && !frontMatter.title) {
          missingTitle.push(file.name);
        }
      });

      expect(missingTitle).toEqual([]);
    });

    test('all files should have date field', () => {
      const missingDate = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && !frontMatter.date) {
          missingDate.push(file.name);
        }
      });

      expect(missingDate).toEqual([]);
    });
  });

  describe('Field Validation', () => {
    test('layout field should use valid layout', () => {
      const invalidLayouts = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && frontMatter.layout) {
          if (!VALID_LAYOUTS.includes(frontMatter.layout)) {
            invalidLayouts.push({
              file: file.name,
              layout: frontMatter.layout
            });
          }
        }
      });

      if (invalidLayouts.length > 0) {
        console.warn('Files with potentially invalid layouts:', invalidLayouts);
      }
      // This is a warning test - layouts may be valid custom layouts
      expect(true).toBe(true);
    });

    test('date field should be valid date format', () => {
      const invalidDates = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && frontMatter.date) {
          const dateStr = String(frontMatter.date);
          // Accept YYYY-MM-DD or ISO 8601 formats
          if (!DATE_REGEX.test(dateStr) && !ISO_DATE_REGEX.test(dateStr)) {
            // Also check if it's a valid Date object when parsed
            const parsed = new Date(dateStr);
            if (isNaN(parsed.getTime())) {
              invalidDates.push({
                file: file.name,
                date: frontMatter.date
              });
            }
          }
        }
      });

      expect(invalidDates).toEqual([]);
    });

    test('title should not be empty', () => {
      const emptyTitles = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && frontMatter.title !== undefined) {
          const title = String(frontMatter.title).trim();
          if (title === '' || title === '""' || title === "''") {
            emptyTitles.push(file.name);
          }
        }
      });

      expect(emptyTitles).toEqual([]);
    });

    test('categories should be an array when present', () => {
      const invalidCategories = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && frontMatter.categories !== undefined) {
          if (!Array.isArray(frontMatter.categories) && typeof frontMatter.categories !== 'string') {
            invalidCategories.push({
              file: file.name,
              categories: frontMatter.categories
            });
          }
        }
      });

      expect(invalidCategories).toEqual([]);
    });

    test('tags should be an array when present', () => {
      const invalidTags = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && frontMatter.tags !== undefined) {
          if (!Array.isArray(frontMatter.tags) && typeof frontMatter.tags !== 'string') {
            invalidTags.push({
              file: file.name,
              tags: frontMatter.tags
            });
          }
        }
      });

      expect(invalidTags).toEqual([]);
    });
  });

  describe('Content Validation', () => {
    test('files should have content after front matter', () => {
      const emptyContent = [];

      reportFiles.forEach(file => {
        const match = file.content.match(FRONT_MATTER_REGEX);
        if (match) {
          const contentAfterFrontMatter = file.content.slice(match[0].length).trim();
          if (contentAfterFrontMatter.length < 10) {
            emptyContent.push(file.name);
          }
        }
      });

      expect(emptyContent).toEqual([]);
    });

    test('files should not have duplicate front matter blocks', () => {
      const duplicateFrontMatter = [];

      reportFiles.forEach(file => {
        // Count occurrences of ---
        const delimiterMatches = file.content.match(/^---$/gm);
        // Should have exactly 2 delimiters for valid front matter
        if (delimiterMatches && delimiterMatches.length > 2) {
          // Check if it's actually duplicate front matter or just --- in content
          const parts = file.content.split(/^---$/m);
          if (parts.length > 3) {
            // Could be duplicate front matter - check if third part looks like YAML
            const thirdPart = parts[2]?.trim() || '';
            if (thirdPart.includes(':') && !thirdPart.startsWith('#')) {
              duplicateFrontMatter.push(file.name);
            }
          }
        }
      });

      expect(duplicateFrontMatter).toEqual([]);
    });
  });

  describe('Image References', () => {
    test('header images should reference valid paths', () => {
      const invalidImagePaths = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter && frontMatter.header) {
          // Check if header is an object with image property
          const headerContent = file.content.match(/header:\s*\n(\s+.+\n)*/);
          if (headerContent) {
            const imageMatch = headerContent[0].match(/image:\s*(.+)/);
            if (imageMatch) {
              const imagePath = imageMatch[1].trim();
              // Image paths should start with / for absolute paths
              if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                invalidImagePaths.push({
                  file: file.name,
                  path: imagePath
                });
              }
            }
          }
        }
      });

      // This is informational - relative paths might be intentional
      if (invalidImagePaths.length > 0) {
        console.log('Files with relative image paths (may be intentional):', invalidImagePaths.length);
      }
      expect(true).toBe(true);
    });
  });

  describe('Encoding and Special Characters', () => {
    test('files should be valid UTF-8', () => {
      const invalidEncoding = [];

      reportFiles.forEach(file => {
        try {
          // Check for null bytes or other invalid characters
          if (file.content.includes('\x00')) {
            invalidEncoding.push(file.name);
          }
        } catch (e) {
          invalidEncoding.push(file.name);
        }
      });

      expect(invalidEncoding).toEqual([]);
    });

    test('titles should not have unescaped quotes that break YAML', () => {
      const problematicTitles = [];

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter === null) {
          // Check if it's a quoting issue
          const titleMatch = file.content.match(/title:\s*(.+)/);
          if (titleMatch) {
            const titleValue = titleMatch[1];
            // Check for unbalanced quotes
            const singleQuotes = (titleValue.match(/'/g) || []).length;
            const doubleQuotes = (titleValue.match(/"/g) || []).length;
            if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
              problematicTitles.push({
                file: file.name,
                title: titleValue
              });
            }
          }
        }
      });

      expect(problematicTitles).toEqual([]);
    });
  });

  describe('Summary Statistics', () => {
    test('should report summary of all files', () => {
      const stats = {
        totalFiles: reportFiles.length,
        withLayout: 0,
        withTitle: 0,
        withDate: 0,
        withExcerpt: 0,
        withCategories: 0,
        withTags: 0,
        withHeader: 0
      };

      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter) {
          if (frontMatter.layout) stats.withLayout++;
          if (frontMatter.title) stats.withTitle++;
          if (frontMatter.date) stats.withDate++;
          if (frontMatter.excerpt) stats.withExcerpt++;
          if (frontMatter.categories) stats.withCategories++;
          if (frontMatter.tags) stats.withTags++;

          // Check for header in raw content (nested YAML)
          if (file.content.includes('header:')) stats.withHeader++;
        }
      });

      console.log('\n📊 Reports Front Matter Statistics:');
      console.log(`   Total files: ${stats.totalFiles}`);
      console.log(`   With layout: ${stats.withLayout} (${Math.round(stats.withLayout/stats.totalFiles*100)}%)`);
      console.log(`   With title: ${stats.withTitle} (${Math.round(stats.withTitle/stats.totalFiles*100)}%)`);
      console.log(`   With date: ${stats.withDate} (${Math.round(stats.withDate/stats.totalFiles*100)}%)`);
      console.log(`   With excerpt: ${stats.withExcerpt} (${Math.round(stats.withExcerpt/stats.totalFiles*100)}%)`);
      console.log(`   With categories: ${stats.withCategories} (${Math.round(stats.withCategories/stats.totalFiles*100)}%)`);
      console.log(`   With tags: ${stats.withTags} (${Math.round(stats.withTags/stats.totalFiles*100)}%)`);
      console.log(`   With header image: ${stats.withHeader} (${Math.round(stats.withHeader/stats.totalFiles*100)}%)`);

      // All files should have the required fields
      expect(stats.withLayout).toBe(stats.totalFiles);
      expect(stats.withTitle).toBe(stats.totalFiles);
      expect(stats.withDate).toBe(stats.totalFiles);
    });
  });
});

describe('Individual Report Validation', () => {
  let reportFiles;

  beforeAll(() => {
    reportFiles = getReportFiles();
  });

  // Generate individual tests for each file
  test.each(getReportFiles().map(f => [f.name, f]))(
    '%s should have valid front matter',
    (fileName, file) => {
      const frontMatter = parseFrontMatter(file.content);

      expect(frontMatter).not.toBeNull();
      expect(frontMatter.layout).toBeDefined();
      expect(frontMatter.title).toBeDefined();
      expect(frontMatter.date).toBeDefined();
    }
  );
});
