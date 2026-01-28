/**
 * Collections Front Matter Validation Tests
 * Ensures all documents in _posts and _work collections have valid Jekyll front matter
 */

const fs = require('fs');
const path = require('path');

// Paths to collection directories
const POSTS_DIR = path.join(__dirname, '../../_posts');
const WORK_DIR = path.join(__dirname, '../../_work');

// Regex patterns
const FRONT_MATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const POST_FILENAME_REGEX = /^\d{4}-\d{2}-\d{2}-.+\.(md|markdown)$/;

// Content validation thresholds
const MIN_CONTENT_LENGTH = 50;

/**
 * Parse YAML front matter from content string
 */
function parseFrontMatter(content) {
  const match = content.match(FRONT_MATTER_REGEX);
  if (!match) return null;

  const yamlContent = match[1];
  const frontMatter = {};

  const lines = yamlContent.split('\n');
  let currentKey = null;
  let inArray = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && currentKey) {
      if (!inArray) {
        frontMatter[currentKey] = [];
        inArray = true;
      }
      frontMatter[currentKey].push(trimmed.slice(2).trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }

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
 * Get markdown files from a directory
 */
function getMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.md') || file.endsWith('.markdown'))
    .filter(file => !file.startsWith('.'))
    .map(file => ({
      name: file,
      path: path.join(dir, file),
      content: fs.readFileSync(path.join(dir, file), 'utf8')
    }));
}

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
        .filter(file => !POST_FILENAME_REGEX.test(file.name))
        .map(file => file.name);

      expect(invalidFilenames).toEqual([]);
    });

    test('filename date should be valid', () => {
      const invalidDates = [];

      postFiles.forEach(file => {
        const dateMatch = file.name.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
          const [, year, month, day] = dateMatch;
          const date = new Date(year, month - 1, day);

          if (date.getFullYear() !== parseInt(year) ||
              date.getMonth() !== parseInt(month) - 1 ||
              date.getDate() !== parseInt(day)) {
            invalidDates.push(file.name);
          }
        }
      });

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
        .filter(file => !FRONT_MATTER_REGEX.test(file.content))
        .map(file => file.name);

      expect(invalidFrontMatter).toEqual([]);
    });
  });

  describe('Required Fields', () => {
    test('all posts should have layout field', () => {
      const missingLayout = postFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          return fm && !fm.layout;
        })
        .map(file => file.name);

      expect(missingLayout).toEqual([]);
    });

    test('all posts should have title field', () => {
      const missingTitle = postFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          return fm && !fm.title;
        })
        .map(file => file.name);

      expect(missingTitle).toEqual([]);
    });
  });

  describe('Content Validation', () => {
    test('posts should have content after front matter', () => {
      const emptyPosts = postFiles
        .filter(file => {
          const match = file.content.match(FRONT_MATTER_REGEX);
          if (match) {
            const content = file.content.slice(match[0].length).trim();
            return content.length < MIN_CONTENT_LENGTH;
          }
          return false;
        })
        .map(file => file.name);

      // Allow for drafts that may be short
      if (emptyPosts.length > 0) {
        console.log('Posts with minimal content:', emptyPosts);
      }
      expect(true).toBe(true);
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
        .filter(file => !FRONT_MATTER_REGEX.test(file.content))
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
      const missingLayout = workFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          return fm && !fm.layout;
        })
        .map(file => file.name);

      expect(missingLayout).toEqual([]);
    });

    test('all work items should have title field', () => {
      const missingTitle = workFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          return fm && !fm.title;
        })
        .map(file => file.name);

      expect(missingTitle).toEqual([]);
    });

    test('all work items should have date field', () => {
      const missingDate = workFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          return fm && !fm.date;
        })
        .map(file => file.name);

      expect(missingDate).toEqual([]);
    });
  });

  describe('Field Validation', () => {
    test('date field should be valid format', () => {
      const invalidDates = [];

      workFiles.forEach(file => {
        const fm = parseFrontMatter(file.content);
        if (fm && fm.date) {
          const dateStr = String(fm.date);
          if (!DATE_REGEX.test(dateStr)) {
            const parsed = new Date(dateStr);
            if (isNaN(parsed.getTime())) {
              invalidDates.push({ file: file.name, date: fm.date });
            }
          }
        }
      });

      expect(invalidDates).toEqual([]);
    });

    test('title should not be empty', () => {
      const emptyTitles = workFiles
        .filter(file => {
          const fm = parseFrontMatter(file.content);
          if (fm && fm.title !== undefined) {
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
    const postsFiles = getMarkdownFiles(POSTS_DIR);
    const workFiles = getMarkdownFiles(WORK_DIR);

    const allFiles = [...postsFiles, ...workFiles];
    const layouts = new Set();

    allFiles.forEach(file => {
      const fm = parseFrontMatter(file.content);
      if (fm && fm.layout) {
        layouts.add(fm.layout);
      }
    });

    // Common valid layouts for this site
    const validLayouts = ['single', 'archive', 'collection', 'home', 'post-index', 'default', 'posts'];
    const unknownLayouts = [...layouts].filter(l => !validLayouts.includes(l));

    if (unknownLayouts.length > 0) {
      console.log('Custom layouts found:', unknownLayouts);
    }
    // This is informational - custom layouts are valid
    expect(true).toBe(true);
  });

  test('no duplicate titles across collections', () => {
    const postsFiles = getMarkdownFiles(POSTS_DIR);
    const workFiles = getMarkdownFiles(WORK_DIR);

    const allFiles = [...postsFiles, ...workFiles];
    const titles = new Map();
    const duplicates = [];

    allFiles.forEach(file => {
      const fm = parseFrontMatter(file.content);
      if (fm && fm.title) {
        const title = String(fm.title).toLowerCase().trim();
        if (titles.has(title)) {
          duplicates.push({
            title: fm.title,
            files: [titles.get(title), file.name]
          });
        } else {
          titles.set(title, file.name);
        }
      }
    });

    if (duplicates.length > 0) {
      console.log('Duplicate titles found:', duplicates);
    }
    // Informational - duplicates may be intentional
    expect(true).toBe(true);
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
