/**
 * Shared Front Matter Utilities
 * DRY-extracted from reports-frontmatter.test.js and collections-frontmatter.test.js
 */

const fs = require('fs');
const path = require('path');

// Regex patterns
const FRONT_MATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
const POST_FILENAME_REGEX = /^\d{4}-\d{2}-\d{2}-.+\.(md|markdown)$/;

/**
 * Parse YAML front matter from content string
 * Simple parser for common front matter patterns
 * @param {string} content - File content to parse
 * @returns {Object|null} Parsed front matter or null if not found
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
 * Get markdown files from a directory
 * @param {string} dir - Directory path
 * @returns {Array} Array of file objects with name, path, and content
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

/**
 * Validate that a date string is in a valid format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid date format
 */
function isValidDateFormat(dateStr) {
  if (DATE_REGEX.test(dateStr) || ISO_DATE_REGEX.test(dateStr)) {
    return true;
  }
  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime());
}

/**
 * Extract content after front matter
 * @param {string} content - Full file content
 * @returns {string} Content after front matter, trimmed
 */
function getContentAfterFrontMatter(content) {
  const match = content.match(FRONT_MATTER_REGEX);
  if (!match) return '';
  return content.slice(match[0].length).trim();
}

/**
 * Check if file has front matter
 * @param {string} content - File content
 * @returns {boolean} True if content has valid front matter delimiters
 */
function hasFrontMatter(content) {
  return content.startsWith('---') && FRONT_MATTER_REGEX.test(content);
}

/**
 * Validate filename follows Jekyll post naming convention
 * @param {string} filename - Filename to validate
 * @returns {boolean} True if follows YYYY-MM-DD-title.md convention
 */
function isValidPostFilename(filename) {
  return POST_FILENAME_REGEX.test(filename);
}

/**
 * Find files missing a required front matter field
 * @param {Array} files - Array of file objects with content
 * @param {string} field - Required field name
 * @returns {Array} Array of filenames missing the field
 */
function findMissingField(files, field) {
  return files
    .filter(file => {
      const fm = parseFrontMatter(file.content);
      return fm && !fm[field];
    })
    .map(file => file.name);
}

module.exports = {
  FRONT_MATTER_REGEX,
  DATE_REGEX,
  ISO_DATE_REGEX,
  POST_FILENAME_REGEX,
  parseFrontMatter,
  getMarkdownFiles,
  isValidDateFormat,
  getContentAfterFrontMatter,
  hasFrontMatter,
  isValidPostFilename,
  findMissingField
};
