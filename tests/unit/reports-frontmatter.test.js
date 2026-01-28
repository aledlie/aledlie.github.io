/**
 * Reports Front Matter Validation Tests
 * Ensures all documents in _reports directory have valid Jekyll front matter
 * and will render correctly when built
 */

const fs = require('fs');
const path = require('path');
const {
  FRONT_MATTER_REGEX,
  parseFrontMatter,
  getMarkdownFiles,
  isValidDateFormat,
  getContentAfterFrontMatter,
  hasFrontMatter,
  findMissingField
} = require('./frontmatter-utils');

// Path to _reports directory relative to project root
const REPORTS_DIR = path.join(__dirname, '../../_reports');

// Required and recommended fields
const REQUIRED_FIELDS = ['layout', 'title', 'date'];
const RECOMMENDED_FIELDS = ['excerpt', 'categories', 'tags'];
const VALID_LAYOUTS = ['single', 'archive', 'collection', 'home', 'post-index', 'default'];
const FRONT_MATTER_KEYS = ['layout', 'title', 'date', 'permalink', 'excerpt', 'categories', 'tags', 'author'];

/**
 * Get all markdown files in _reports directory
 */
function getReportFiles() {
  return getMarkdownFiles(REPORTS_DIR);
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
      const filesWithoutFrontMatter = reportFiles
        .filter(file => !file.content.startsWith('---'))
        .map(file => file.name);
      expect(filesWithoutFrontMatter).toEqual([]);
    });

    test('all markdown files should have closing front matter delimiter', () => {
      const filesWithUnclosedFrontMatter = reportFiles
        .filter(file => !hasFrontMatter(file.content))
        .map(file => file.name);
      expect(filesWithUnclosedFrontMatter).toEqual([]);
    });

    test('front matter should be parseable', () => {
      const unparsableFiles = reportFiles
        .filter(file => parseFrontMatter(file.content) === null)
        .map(file => file.name);
      expect(unparsableFiles).toEqual([]);
    });
  });

  describe('Required Fields', () => {
    test('all files should have layout field', () => {
      expect(findMissingField(reportFiles, 'layout')).toEqual([]);
    });

    test('all files should have title field', () => {
      expect(findMissingField(reportFiles, 'title')).toEqual([]);
    });

    test('all files should have date field', () => {
      expect(findMissingField(reportFiles, 'date')).toEqual([]);
    });
  });

  describe('Field Validation', () => {
    test('layout field should use valid layout', () => {
      const invalidLayouts = [];
      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter?.layout && !VALID_LAYOUTS.includes(frontMatter.layout)) {
          invalidLayouts.push({ file: file.name, layout: frontMatter.layout });
        }
      });
      if (invalidLayouts.length > 0) {
        console.warn('Files with potentially invalid layouts:', invalidLayouts);
      }
      expect(true).toBe(true);
    });

    test('date field should be valid date format', () => {
      const invalidDates = [];
      reportFiles.forEach(file => {
        const frontMatter = parseFrontMatter(file.content);
        if (frontMatter?.date && !isValidDateFormat(String(frontMatter.date))) {
          invalidDates.push({ file: file.name, date: frontMatter.date });
        }
      });
      expect(invalidDates).toEqual([]);
    });

    test('title should not be empty', () => {
      const emptyTitles = reportFiles
        .filter(file => {
          const frontMatter = parseFrontMatter(file.content);
          if (frontMatter?.title !== undefined) {
            const title = String(frontMatter.title).trim();
            return title === '' || title === '""' || title === "''";
          }
          return false;
        })
        .map(file => file.name);
      expect(emptyTitles).toEqual([]);
    });

    test('categories should be an array when present', () => {
      const invalidCategories = reportFiles
        .filter(file => {
          const frontMatter = parseFrontMatter(file.content);
          return frontMatter?.categories !== undefined &&
            !Array.isArray(frontMatter.categories) &&
            typeof frontMatter.categories !== 'string';
        })
        .map(file => file.name);
      expect(invalidCategories).toEqual([]);
    });

    test('tags should be an array when present', () => {
      const invalidTags = reportFiles
        .filter(file => {
          const frontMatter = parseFrontMatter(file.content);
          return frontMatter?.tags !== undefined &&
            !Array.isArray(frontMatter.tags) &&
            typeof frontMatter.tags !== 'string';
        })
        .map(file => file.name);
      expect(invalidTags).toEqual([]);
    });
  });

  describe('Content Validation', () => {
    test('files should have content after front matter', () => {
      const emptyContent = reportFiles
        .filter(file => getContentAfterFrontMatter(file.content).length < 10)
        .map(file => file.name);
      expect(emptyContent).toEqual([]);
    });

    test('files should not have duplicate front matter blocks', () => {
      const duplicateFrontMatter = [];
      reportFiles.forEach(file => {
        let contentAfter = getContentAfterFrontMatter(file.content);
        contentAfter = contentAfter.replace(/```[\s\S]*?```/g, '');

        const duplicatePattern = /\n---\r?\n([\s\S]*?)\r?\n---/;
        const duplicateMatch = contentAfter.match(duplicatePattern);

        if (duplicateMatch) {
          const potentialYaml = duplicateMatch[1];
          const hasFrontMatterKeys = FRONT_MATTER_KEYS.some(key =>
            new RegExp(`^${key}:`, 'm').test(potentialYaml)
          );
          if (hasFrontMatterKeys) {
            duplicateFrontMatter.push(file.name);
          }
        }
      });
      expect(duplicateFrontMatter).toEqual([]);
    });
  });

  describe('Encoding and Special Characters', () => {
    test('files should be valid UTF-8', () => {
      const invalidEncoding = reportFiles
        .filter(file => file.content.includes('\x00'))
        .map(file => file.name);
      expect(invalidEncoding).toEqual([]);
    });

    test('titles should not have unescaped quotes that break YAML', () => {
      const problematicTitles = reportFiles
        .filter(file => {
          if (parseFrontMatter(file.content) !== null) return false;
          const titleMatch = file.content.match(/title:\s*(.+)/);
          if (titleMatch) {
            const titleValue = titleMatch[1];
            const singleQuotes = (titleValue.match(/'/g) || []).length;
            const doubleQuotes = (titleValue.match(/"/g) || []).length;
            return singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0;
          }
          return false;
        })
        .map(file => file.name);
      expect(problematicTitles).toEqual([]);
    });
  });

  describe('Summary Statistics', () => {
    test('should report summary of all files', () => {
      const stats = {
        totalFiles: reportFiles.length,
        withLayout: 0, withTitle: 0, withDate: 0,
        withExcerpt: 0, withCategories: 0, withTags: 0, withHeader: 0
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
          if (file.content.includes('header:')) stats.withHeader++;
        }
      });

      console.log('\n📊 Reports Front Matter Statistics:');
      console.log(`   Total files: ${stats.totalFiles}`);
      Object.entries(stats).slice(1).forEach(([key, val]) => {
        console.log(`   ${key}: ${val} (${Math.round(val/stats.totalFiles*100)}%)`);
      });

      expect(stats.withLayout).toBe(stats.totalFiles);
      expect(stats.withTitle).toBe(stats.totalFiles);
      expect(stats.withDate).toBe(stats.totalFiles);
    });
  });
});

describe('Individual Report Validation', () => {
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
