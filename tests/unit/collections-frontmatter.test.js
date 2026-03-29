/**
 * Collections Front Matter Validation Tests
 * Ensures all documents in _posts and _work collections have valid Jekyll front matter
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
  isValidPostFilename,
  findMissingField
} = require('./frontmatter-utils');

// Paths to collection directories
const POSTS_DIR = path.join(__dirname, '../../_posts');
const WORK_DIR = path.join(__dirname, '../../_work');

// Content validation thresholds
const MIN_CONTENT_LENGTH = 50;

describe('Posts Collection (_posts)', () => {
  let postFiles;

  beforeAll(() => {
    postFiles = getMarkdownFiles(POSTS_DIR);
  });

  describe('Directory Structure', () => {
    test('_posts directory should exist', () => {
      expect(fs.existsSync(POSTS_DIR)).toBe(true);
    });

    test('should contain markdown files', () => {
      expect(postFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Filename Convention', () => {
    test('all posts should follow YYYY-MM-DD-title.md naming convention', () => {
      const invalidFilenames = postFiles
        .filter(file => !isValidPostFilename(file.name))
        .map(file => file.name);
      expect(invalidFilenames).toEqual([]);
    });

    test('filename date should be valid', () => {
      const invalidDates = postFiles
        .filter(file => {
          const dateMatch = file.name.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            const [, year, month, day] = dateMatch;
            const date = new Date(year, month - 1, day);
            return date.getFullYear() !== parseInt(year) ||
              date.getMonth() !== parseInt(month) - 1 ||
              date.getDate() !== parseInt(day);
          }
          return false;
        })
        .map(file => file.name);
      expect(invalidDates).toEqual([]);
    });
  });

  describe('Front Matter Presence', () => {
    test('all posts should have front matter', () => {
      const missingFrontMatter = postFiles
        .filter(file => !file.content.startsWith('---'))
        .map(file => file.name);
      expect(missingFrontMatter).toEqual([]);
    });

    test('all posts should have valid front matter delimiters', () => {
      const invalidFrontMatter = postFiles
        .filter(file => !hasFrontMatter(file.content))
        .map(file => file.name);
      expect(invalidFrontMatter).toEqual([]);
    });
  });

  describe('Required Fields', () => {
    test('all posts should have layout field', () => {
      expect(findMissingField(postFiles, 'layout')).toEqual([]);
    });

    test('all posts should have title field', () => {
      expect(findMissingField(postFiles, 'title')).toEqual([]);
    });
  });

  describe('Content Validation', () => {
    test('posts should have content after front matter', () => {
      const emptyPosts = postFiles
        .filter(file => getContentAfterFrontMatter(file.content).length < MIN_CONTENT_LENGTH)
        .map(file => file.name);
      expect(emptyPosts).toEqual([]);
    });
  });
});

describe('Work Collection (_work)', () => {
  let workFiles;

  beforeAll(() => {
    workFiles = getMarkdownFiles(WORK_DIR);
  });

  describe('Directory Structure', () => {
    test('_work directory should exist', () => {
      expect(fs.existsSync(WORK_DIR)).toBe(true);
    });

    test('should contain markdown files', () => {
      expect(workFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Front Matter Presence', () => {
    test('all work items should have front matter', () => {
      const missingFrontMatter = workFiles
        .filter(file => !file.content.startsWith('---'))
        .map(file => file.name);
      expect(missingFrontMatter).toEqual([]);
    });

    test('all work items should have valid front matter delimiters', () => {
      const invalidFrontMatter = workFiles
        .filter(file => !hasFrontMatter(file.content))
        .map(file => file.name);
      expect(invalidFrontMatter).toEqual([]);
    });

    test('front matter should be parseable', () => {
      const unparsable = workFiles
        .filter(file => parseFrontMatter(file.content) === null)
        .map(file => file.name);
      expect(unparsable).toEqual([]);
    });
  });

  describe('Required Fields', () => {
    test('all work items should have layout field', () => {
      expect(findMissingField(workFiles, 'layout')).toEqual([]);
    });

    test('all work items should have title field', () => {
      expect(findMissingField(workFiles, 'title')).toEqual([]);
    });

    test('all work items should have date field', () => {
      expect(findMissingField(workFiles, 'date')).toEqual([]);
    });
  });

  describe('Field Validation', () => {
    test('date field should be valid format', () => {
      const invalidDates = workFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          return fm?.date && !isValidDateFormat(String(fm.date));
        })
        .map(file => file.name);
      expect(invalidDates).toEqual([]);
    });

    test('title should not be empty', () => {
      const emptyTitles = workFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          if (fm?.title !== undefined) {
            const title = String(fm.title).trim();
            return title === '' || title === '""' || title === "''";
          }
          return false;
        })
        .map(file => file.name);
      expect(emptyTitles).toEqual([]);
    });
  });
});

describe('Cross-Collection Validation', () => {
  test('all collections should use consistent layout values', () => {
    const allFiles = [...getMarkdownFiles(POSTS_DIR), ...getMarkdownFiles(WORK_DIR)];
    const validLayouts = ['single', 'archive', 'collection', 'home', 'post-index', 'default', 'posts'];
    const invalidLayouts = [];

    allFiles.forEach(file => {
      const fm = parseFrontMatter(file.content);
      if (fm?.layout && !validLayouts.includes(fm.layout)) {
        invalidLayouts.push({ file: file.name, layout: fm.layout });
      }
    });

    expect(invalidLayouts).toEqual([]);
  });

  test('no duplicate titles between _posts and _work collections', () => {
    // Checks for accidental cross-collection title collisions only.
    // Same-title posts within a single collection (e.g. recurring series) are allowed.
    const postTitles = new Set(
      getMarkdownFiles(POSTS_DIR)
        .map(f => parseFrontMatter(f.content)?.title)
        .filter(Boolean)
        .map(t => String(t).toLowerCase().trim())
    );

    const crossCollisionTitles = getMarkdownFiles(WORK_DIR)
      .map(f => ({ name: f.name, title: parseFrontMatter(f.content)?.title }))
      .filter(({ title }) => title && postTitles.has(String(title).toLowerCase().trim()));

    expect(crossCollisionTitles).toEqual([]);
  });
});

describe('Individual File Validation', () => {
  const postsFiles = getMarkdownFiles(POSTS_DIR);
  const workFiles = getMarkdownFiles(WORK_DIR);

  if (postsFiles.length > 0) {
    test.each(postsFiles.map(f => [f.name, f]))(
      'Post: %s should have valid front matter',
      (fileName, file) => {
        const frontMatter = parseFrontMatter(file.content);
        expect(frontMatter).not.toBeNull();
        expect(frontMatter.layout).toBeDefined();
        expect(frontMatter.title).toBeDefined();
      }
    );
  }

  if (workFiles.length > 0) {
    test.each(workFiles.map(f => [f.name, f]))(
      'Work: %s should have valid front matter',
      (fileName, file) => {
        const frontMatter = parseFrontMatter(file.content);
        expect(frontMatter).not.toBeNull();
        expect(frontMatter.layout).toBeDefined();
        expect(frontMatter.title).toBeDefined();
      }
    );
  }
});
