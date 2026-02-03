/**
 * Layout Heading Hierarchy Tests
 * Validates H1 conditional logic to prevent duplicate H1s across layouts
 *
 * Context: archive.html must only suppress its H1 when the hero template
 * actually contains one (overlay_color or overlay_image), not for plain
 * image headers which don't include an H1.
 *
 * Bug prevented: page.header.image was incorrectly in the H1 suppression
 * condition, causing pages with plain image headers to have no H1.
 */

const fs = require('fs');
const path = require('path');

describe('Layout Heading Hierarchy', () => {
  const layoutsDir = path.join(__dirname, '../../_layouts');
  const includesDir = path.join(__dirname, '../../_includes');

  describe('archive.html H1 conditional logic', () => {
    let archiveContent;

    beforeAll(() => {
      archiveContent = fs.readFileSync(
        path.join(layoutsDir, 'archive.html'),
        'utf8'
      );
    });

    test('should suppress H1 only for overlay_color or overlay_image', () => {
      // The unless condition should NOT include page.header.image
      // because page__hero.html only renders H1 for overlays, not plain images
      // Find the unless block that contains page.header.overlay (the H1 suppression block)
      const unlessPattern = /{%\s*unless\s+(page\.header\.[^%]+)%}/g;
      const matches = [...archiveContent.matchAll(unlessPattern)];

      // Should find exactly one unless with page.header
      expect(matches.length).toBe(1);
      const condition = matches[0][1];

      // MUST include these (hero with H1)
      expect(condition).toContain('page.header.overlay_color');
      expect(condition).toContain('page.header.overlay_image');

      // MUST NOT include these (hero without H1)
      expect(condition).not.toContain('page.header.image');
      expect(condition).not.toContain('page.header.video');
    });

    test('should have id="page-title" on H1 elements', () => {
      // All H1s in archive should have id for consistent anchor targeting
      const h1Pattern = /<h1[^>]*class="page-title"[^>]*>/g;
      const h1Matches = archiveContent.match(h1Pattern) || [];

      h1Matches.forEach((h1Tag) => {
        expect(h1Tag).toContain('id="page-title"');
      });
    });

    test('should have exactly one unless block for H1 suppression', () => {
      // Ensure we don't accidentally add multiple H1 conditions
      const unlessMatches = archiveContent.match(/{%\s*unless[^%]+page\.header/g);
      expect(unlessMatches).toHaveLength(1);
    });
  });

  describe('page__hero.html H1 rendering', () => {
    let heroContent;

    beforeAll(() => {
      heroContent = fs.readFileSync(
        path.join(includesDir, 'page__hero.html'),
        'utf8'
      );
    });

    test('should only render H1 inside overlay condition', () => {
      // H1 should be inside: {% if page.header.overlay_color or page.header.overlay_image %}
      // Find the overlay conditional block that contains the H1
      const overlayBlockPattern = /{%\s*if\s+page\.header\.overlay_color\s+or\s+page\.header\.overlay_image\s*%}([\s\S]*?){%\s*else\s*%}/;
      const match = heroContent.match(overlayBlockPattern);

      expect(match).toBeTruthy();
      const overlayBlock = match[1];

      // H1 should be inside this overlay block
      expect(overlayBlock).toMatch(/<h1[^>]*>/);
    });

    test('should NOT render H1 for plain image headers', () => {
      // The else branch (plain image) should not contain H1
      // Find content between {% else %} and the matching {% endif %}
      const elseBranchPattern = /{%\s*else\s*%}([\s\S]*?)<img[^>]*class="page-hero-image"/;
      const match = heroContent.match(elseBranchPattern);

      expect(match).toBeTruthy();
      const elseBranch = match[1];
      expect(elseBranch).not.toMatch(/<h1[^>]*>/);
    });
  });

  describe('cross-layout H1 consistency', () => {
    test('archive and hero H1 id attributes should match', () => {
      const archiveContent = fs.readFileSync(
        path.join(layoutsDir, 'archive.html'),
        'utf8'
      );
      const heroContent = fs.readFileSync(
        path.join(includesDir, 'page__hero.html'),
        'utf8'
      );

      // Extract id from archive H1
      const archiveIdMatch = archiveContent.match(/<h1\s+id="([^"]+)"/);
      // Extract id from hero H1
      const heroIdMatch = heroContent.match(/<h1\s+id="([^"]+)"/);

      if (archiveIdMatch && heroIdMatch) {
        expect(archiveIdMatch[1]).toBe(heroIdMatch[1]);
      }
    });
  });
});
