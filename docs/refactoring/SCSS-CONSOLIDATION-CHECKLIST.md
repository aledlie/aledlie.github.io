# SCSS Consolidation - Practical Implementation Checklist

**Purpose:** Step-by-step checklist to prevent visual regressions during SCSS consolidation

---

## Pre-Consolidation: Establish Baseline

### Visual Baseline Documentation

- [ ] **Screenshot Current State**
  - [ ] Homepage at 1200px (desktop)
  - [ ] Homepage at 1024px (tablet)
  - [ ] Homepage at 768px (mobile)
  - [ ] Single post at 1200px
  - [ ] Single post at 1024px
  - [ ] Single post at 768px
  - [ ] Archive page at 1200px
  - [ ] Archive page at 1024px
  - [ ] Archive page at 768px
  - [ ] About page (if exists)
  - [ ] Navigation hover state
  - [ ] Archive title hover state
  - [ ] Body link hover state
  - **Total: 14-16 baseline screenshots**

- [ ] **Color Baseline**
  ```
  Use browser DevTools color picker:
  - Nav background/text color
  - H1 underline color (#3498db)
  - Archive title color (#8b2635)
  - Archive title hover color (#6d1e2a)
  - Body link color (#3498db)
  - Body link hover color
  - Sidebar background color
  - Sidebar link color
  - Border colors (#eee)
  - Meta text color

  Screenshot: Open DevTools, take screenshot of color picker with each color
  ```

- [ ] **Typography Baseline**
  ```
  Document using DevTools Inspector:

  h1:
    - Font-family: PT Sans Narrow
    - Font-size: 2em
    - Font-weight: 700
    - Line-height: 1.2
    - Color: ?
    - Border-bottom: 3px solid #3498db

  h2:
    - Font-family: PT Sans Narrow
    - Font-size: 1.3em
    - Font-weight: 500
    - Color: #666

  h3:
    - Font-family: PT Sans Narrow
    - Font-size: 1.2em

  Body text:
    - Font-family: PT Serif
    - Font-size: 16px
    - Line-height: 1.7
    - Color: #2c3e50

  Code:
    - Font-family: monaco
    - Background: #fafafa
    - Padding: 0.2em 0.4em
  ```

- [ ] **Spacing Baseline**
  ```
  Document using DevTools Inspector (Computed tab):

  #main: padding, max-width
  .sidebar: padding, width
  .page-content: padding, margin
  Navigation (.greedy-nav): height, padding
  Archive items: margin-bottom spacing
  Blockquotes: padding, margins
  ```

- [ ] **Responsive Behavior Baseline**
  ```
  Test at 768px breakpoint:
  - [ ] .greedy-nav has flex-direction: column
  - [ ] .visible-links has gap property
  - [ ] .page-content padding adjusted
  - [ ] .page-title font-size reduced (1.8em)
  - [ ] No horizontal scroll
  - [ ] Navigation is readable and tappable

  Test at 1024px breakpoint:
  - [ ] #main has adjusted padding
  - [ ] .sidebar has adjusted width
  - [ ] .author-avatar size adjusted (120px)
  - [ ] Layout still centered
  ```

### Dependency Map

- [ ] **Create Import Chain Documentation**

  For each SCSS file, document:
  ```
  File: _sass/variables.scss
    ✓ Size: 170 lines
    ✓ Imports: None
    ✓ Imported by: typography.scss, page.scss, elements.scss
    ✓ Critical: YES (defines colors, fonts, breakpoints)
    ✓ Status: Must import FIRST in consolidation

  File: _sass/typography.scss
    ✓ Size: 193 lines
    ✓ Imports: variables, mixins, grid
    ✓ Imported by: (none explicitly, included in main)
    ✓ Contains: h1-h6 styles, link styles, code formatting
    ✓ Status: Can consolidate to _overrides.scss

  File: _sass/page.scss
    ✓ Size: 600 lines
    ✓ Imports: variables
    ✓ Imported by: (none explicitly)
    ✓ Contains: Page layout, hero styles, page meta
    ✓ Contains: h1 overrides for single pages
    ✓ Problem: Mixes layout + overrides
    ✓ Status: SPLIT - layout to _layout.scss, overrides to _overrides.scss

  File: assets/css/main.scss
    ✓ Size: 394 lines
    ✓ Contains: 394 lines of cascading overrides
    ✓ Problem: Heavy use of !important (15+ instances)
    ✓ Status: These rules must be preserved in _overrides.scss
  ```

- [ ] **Test Current Build**
  ```bash
  RUBYOPT="-W0" bundle exec jekyll build
  # Check for errors: [none should exist]

  ls -lah _site/assets/css/
  # Note CSS file size for comparison

  npm run test:all
  # All tests should pass
  ```

---

## Phase 2a: Create New SCSS Structure

### Directory Setup

- [ ] **Create `_sass/custom/` directory**
  ```bash
  mkdir -p _sass/custom
  ```

- [ ] **Create new custom SCSS files**
  ```bash
  touch _sass/custom/_design-tokens.scss
  touch _sass/custom/_typography.scss
  touch _sass/custom/_layout.scss
  touch _sass/custom/_components.scss
  touch _sass/custom/_utilities.scss
  touch _sass/custom/_responsive.scss
  touch _sass/custom/_index.scss
  ```

### File Content: _design-tokens.scss

- [ ] **Copy all color definitions**
  ```scss
  /* ==========================================================================
     Design Tokens - Color Palette
     ========================================================================== */

  /* Primary Colors - Academic Theme */
  $academic-red: #8b2635;
  $academic-red-dark: #6d1e2a;

  /* Accent Colors */
  $accent-blue: #3498db;
  $accent-blue-dark: #2980b9;

  /* Semantic Colors */
  $color-text: #2c3e50;           /* Body text */
  $color-text-meta: #666;         /* Dates, subtitles */
  $color-text-light: #999;        /* Light text */
  $color-border: #eee;            /* Borders */

  /* Background Colors */
  $bg-white: #fff;
  $bg-light: #f8f9fa;
  $bg-lighter: #e9ecef;

  /* Legacy color variables (maintain compatibility) */
  $basecolor: #343434;
  $black: #111;
  $dark-gray: #4d5356;
  $gray-medium: #666;
  $gray-darker: #555;
  $gray-lighter: #999;
  $light-gray: #b6bcc1;
  $lighter-gray: #f0f1f2;
  $white: #fff;
  ```

- [ ] **Copy all font definitions**
  ```scss
  /* Typography */
  $base-font: 'PT Serif', serif;
  $heading-font: 'PT Sans Narrow', sans-serif;
  $code-font: monaco, "Courier New", "DejaVu Sans Mono", monospace;

  /* Font sizing */
  $doc-font-size: 16;
  $doc-line-height: 26;
  ```

- [ ] **Copy all spacing tokens**
  ```scss
  /* Spacing */
  $space-xs: 0.25rem;
  $space-sm: 0.5em;
  $space-md: 1em;
  $space-lg: 1.5rem;
  $space-xl: 2em;
  $space-xxl: 3rem;
  ```

- [ ] **Copy breakpoints**
  ```scss
  /* Breakpoints */
  $bp-mobile: 768px;
  $bp-tablet: 1024px;
  $bp-desktop: 1200px;
  ```

### File Content: _typography.scss

- [ ] **Copy h1-h6 styles from typography.scss**
- [ ] **Copy link styles from typography.scss**
- [ ] **Copy code styles from typography.scss**
- [ ] **Add comment block with design intent**

  ```scss
  /* ==========================================================================
     Typography Styles
     ========================================================================== */

  /* Design Intent:
     - Georgia serif for body text provides academic, traditional feel
     - PT Sans Narrow for headings adds modern sophistication
     - 16px base with 1.7 line-height optimizes long-form reading
     - Blue underlines on h1 create visual hierarchy
     - Red links in archive create distinct visual pattern
  */

  h1, h2, h3, h4, h5, h6 {
    font-family: $heading-font;
  }

  h1 {
    font-size: 2em;
    color: $color-text;
    border-bottom: 3px solid $accent-blue;
    padding-bottom: 10px;
    font-weight: 700;
    line-height: 1.2;
  }

  /* ... rest of heading styles ... */
  ```

### File Content: _layout.scss

- [ ] **Create from page.scss and main.scss layout sections**
  ```scss
  /* ==========================================================================
     Layout & Page Structure
     ========================================================================== */

  /* Main content container */
  #main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.25rem;
  }

  .initial-content {
    padding-top: 0;
    margin-top: 0;
  }

  .page-content {
    font-family: $base-font;
    font-size: 16px;
    line-height: 1.7;
  }

  /* ... rest of layout styles ... */
  ```

### File Content: _components.scss

- [ ] **Copy sidebar styles from _sidebar.scss + main.scss**
- [ ] **Copy navigation styles from main.scss**
- [ ] **Copy archive item styles from main.scss**
- [ ] **Copy button styles from _buttons.scss + main.scss**

  ```scss
  /* ==========================================================================
     UI Components
     ========================================================================== */

  /* Sidebar Component */
  .sidebar {
    padding: 2em 1em 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .author-avatar img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-urls li a {
      font-size: 1em;
      color: $academic-red;
      text-decoration: none;
      padding: 0.3em 0.5em;
      border-radius: 3px;
      transition: all 0.3s ease;

      &:hover {
        color: $white;
        background: $academic-red;
      }
    }
  }

  /* ... rest of component styles ... */
  ```

### File Content: _utilities.scss

- [ ] **Copy utility classes**
  ```scss
  /* ==========================================================================
     Utilities & Helper Classes
     ========================================================================== */

  .clearfix {
    &::after {
      content: "";
      display: table;
      clear: both;
    }
  }

  /* ... rest of utility styles ... */
  ```

### File Content: _responsive.scss

- [ ] **Collect ALL media queries**

  ```scss
  /* ==========================================================================
     Responsive Adjustments
     ========================================================================== */

  /* Tablet adjustments (max-width: 1024px) */
  @media (max-width: 1024px) {
    #main {
      padding: 0.25rem;
    }

    .sidebar {
      padding: 0.25rem;
      text-align: center;

      .author-avatar img {
        width: 120px;
        height: 120px;
      }
    }

    .page-content {
      padding: 0 0.25rem;
    }
  }

  /* Mobile adjustments (max-width: 768px) */
  @media (max-width: 768px) {
    .greedy-nav {
      padding: 0.1rem 0.5rem;
      flex-direction: column;
      align-items: flex-start;

      .site-title {
        margin-right: 0;
        margin-bottom: 0.1rem;
        font-size: 1.2em;
      }

      .visible-links {
        gap: 0.02rem;

        a {
          padding: 0.1rem 0.2rem;
          font-size: 0.9em;
          font-weight: 900;
        }
      }
    }

    .single .page-title {
      font-size: 1.8em;
    }

    .archive .list__item .archive__item-title {
      font-size: 1.2em;
    }

    .page-content {
      font-size: 15px;
      line-height: 1.6;
      padding: 1rem;

      p {
        margin-bottom: 1.25em;
      }

      p + p {
        margin-top: 1.5em;
      }
    }
  }
  ```

### File Content: _index.scss

- [ ] **Create import orchestrator**
  ```scss
  /* ==========================================================================
     Custom Styles Index
     ========================================================================== */

  /* Import custom design system and styles in proper order */
  @import "design-tokens";
  @import "typography";
  @import "layout";
  @import "components";
  @import "utilities";
  @import "responsive";
  ```

---

## Phase 2b: Update Main Import Structure

### Update assets/css/main.scss

- [ ] **Simplify to modular imports**

  ```scss
  ---
  # Only the main Sass file needs front matter
  ---

  @charset "utf-8";

  /* The Parlor - Custom Jekyll Site
   * Based on Minimal Mistakes 4.27.3 (forked 2025-11-11)
   *
   * Import order matters:
   * 1. Custom design tokens (override defaults)
   * 2. Theme base (uses custom tokens)
   * 3. Custom overrides (modular organization)
   */

  /* Custom design system */
  @import "custom/design-tokens";

  /* Theme base */
  @import "minimal-mistakes";

  /* Custom styles (organized by category) */
  @import "custom/index";

  /* End of imports - all styles are modular */
  ```

- [ ] **Remove old imports**
  - Remove: `@import "variables"`
  - Remove: `@import "page"`
  - Remove: `@import "typography"`
  - Remove: `@import "elements"`
  - Remove: `@import "site"`
  - Remove: `@import "coderay"` (if separate)

- [ ] **Remove override section**
  - Delete: All lines between `@charset` and comments (the 394-line override section)
  - Verify: All those rules are now in `_sass/custom/_components.scss` or other files

---

## Phase 2c: Test & Validate

### Build Test

- [ ] **Clean build**
  ```bash
  rm -rf _site
  RUBYOPT="-W0" bundle exec jekyll build
  ```
  - [ ] No SCSS errors
  - [ ] No build warnings
  - [ ] _site generated successfully

- [ ] **Compare CSS output**
  ```bash
  # Before consolidation (commit before changes):
  ls -lh _site/assets/css/ # Note file size

  # After consolidation:
  ls -lh _site/assets/css/ # Should be similar or smaller
  ```
  - [ ] Main CSS file exists
  - [ ] File size is comparable (within 5%)

### Visual Test - Homepage

- [ ] **1200px Desktop View**
  - [ ] Header displays correctly (100px height)
  - [ ] Navigation centered and uppercase
  - [ ] Sidebar visible on right
  - [ ] Content constrained to 1200px max-width
  - [ ] Colors match baseline (take screenshot, compare)

- [ ] **1024px Tablet View**
  - [ ] Sidebar width adjusted
  - [ ] Navigation still centered
  - [ ] Avatar reduced to 120px
  - [ ] Content still readable

- [ ] **768px Mobile View**
  - [ ] Navigation stacked vertically
  - [ ] Sidebar content flows
  - [ ] Typography scaled down (15px)
  - [ ] No horizontal scroll
  - [ ] Links tappable (48px minimum)

### Visual Test - Archive Page

- [ ] **Archive Item Colors**
  - [ ] Titles are academic red (#8b2635) - use color picker
  - [ ] NOT blue (#3498db)
  - [ ] Hover: Color darkens to #6d1e2a
  - [ ] No underlines

- [ ] **Archive Item Spacing**
  - [ ] Items have proper margin-bottom
  - [ ] Excerpts are gray and italic
  - [ ] Dates are hidden

### Visual Test - Single Post

- [ ] **Post Title**
  - [ ] H1 size is 2em
  - [ ] H1 has 3px blue underline
  - [ ] Color matches baseline

- [ ] **Post Content**
  - [ ] Body text is Georgia serif, 16px, 1.7 line-height
  - [ ] Links are blue (#3498db) with dotted underline
  - [ ] Link hover: dotted → solid underline
  - [ ] Blockquotes have proper formatting

- [ ] **Post Meta**
  - [ ] Author, date, categories visible
  - [ ] Gray color matches baseline
  - [ ] Proper spacing

### Color Validation

- [ ] **Color Picker Comparison**
  ```
  For each color:
  1. Before: Open current site, use color picker
  2. After: Open consolidated site, use color picker
  3. Compare: Hex values must match exactly

  Colors to verify:
  - [ ] Navigation text
  - [ ] Archive title (#8b2635)
  - [ ] H1 underline (#3498db)
  - [ ] Body text (#2c3e50)
  - [ ] Meta text (#666)
  - [ ] Border (#eee)
  - [ ] Link color (#3498db)
  - [ ] Sidebar link color (#8b2635)
  ```

### Typography Validation

- [ ] **Font Families**
  ```
  DevTools Inspector → Computed:
  - [ ] h1: PT Sans Narrow
  - [ ] h2: PT Sans Narrow
  - [ ] h3: PT Sans Narrow
  - [ ] body: PT Serif
  - [ ] code: monaco
  ```

- [ ] **Font Sizes**
  ```
  - [ ] h1: 2em (32px)
  - [ ] h2: 1.3em (~21px)
  - [ ] h3: 1.2em (~19px)
  - [ ] body: 16px
  - [ ] @768px: body 15px
  ```

- [ ] **Line Heights**
  ```
  - [ ] body: 1.7
  - [ ] h1: 1.2
  - [ ] @768px: 1.6
  ```

### Browser Testing

- [ ] **Desktop Chrome**
  - [ ] All pages render correctly
  - [ ] No console errors
  - [ ] Links work

- [ ] **Firefox**
  - [ ] Styling renders identically
  - [ ] Color picker shows same hex values

- [ ] **Safari (WebKit)**
  - [ ] Styling matches Chrome
  - [ ] Fonts render correctly

- [ ] **Mobile Chrome (375px width)**
  - [ ] Navigation wraps vertically
  - [ ] Content readable without zoom
  - [ ] Links tappable

- [ ] **Mobile Safari (375px width)**
  - [ ] Same as Mobile Chrome
  - [ ] Rendering matches

### Responsive Validation

- [ ] **Breakpoint Testing**
  ```
  Test at exactly: 768px, 1024px, 1200px

  At 768px:
  - [ ] .greedy-nav { flex-direction: column; }
  - [ ] Navigation items stack
  - [ ] .page-content { font-size: 15px; }
  - [ ] No horizontal scroll
  - [ ] .page-title { font-size: 1.8em; }

  At 1024px:
  - [ ] .sidebar { width adjusted; }
  - [ ] .author-avatar { width: 120px; }
  - [ ] Navigation still inline
  - [ ] Content still constrained to 1200px max

  At 1200px:
  - [ ] Full layout visible
  - [ ] Sidebar on right
  - [ ] Navigation centered
  - [ ] Content properly centered
  ```

- [ ] **No Horizontal Scroll**
  - [ ] At 768px: Zoom 100%, no scroll
  - [ ] At 1024px: No scroll
  - [ ] At 1200px: No scroll

---

## Phase 2d: Remove Old Files Safely

### Before Deletion Verification

- [ ] **All tests pass**
  ```bash
  npm run test:all
  ```
  - [ ] Jest tests: PASS
  - [ ] Playwright tests: PASS
  - [ ] Performance tests: PASS

- [ ] **Lighthouse scores maintained**
  - [ ] Performance: ≥85%
  - [ ] Accessibility: ≥95%
  - [ ] SEO: ≥95%

- [ ] **Git status clean**
  ```bash
  git status
  # Only _sass/custom/* should be new
  # No uncommitted changes to other files
  ```

### Safe Deletion Strategy

- [ ] **Create backup branch**
  ```bash
  git checkout -b refactor/scss-backup
  git commit -am "Backup before SCSS deletion"
  git checkout master
  ```

- [ ] **Delete old custom SCSS files one at a time**
  - [ ] Delete: `_sass/variables.scss`
    - Test: `bundle exec jekyll build`
    - [ ] No errors?

  - [ ] Delete: `_sass/typography.scss`
    - Test: `bundle exec jekyll build`
    - [ ] No errors?

  - [ ] Delete: `_sass/page.scss`
    - Test: `bundle exec jekyll build`
    - [ ] No errors?

  - [ ] Delete: `_sass/elements.scss`
    - Test: `bundle exec jekyll build`
    - [ ] No errors?

  - [ ] Delete: `_sass/site.scss`
    - Test: `bundle exec jekyll build`
    - [ ] No errors?

  - [ ] Delete: Other files as needed
    - After each: `bundle exec jekyll build`
    - [ ] No errors?

- [ ] **Update _config.yml if needed**
  - [ ] Remove: `sass_dir: _sass` (should be default)
  - [ ] Verify: `bundle exec jekyll build` still works

- [ ] **Run full test suite**
  ```bash
  npm run test:all
  ```
  - [ ] All tests: PASS

---

## Post-Consolidation: Documentation

### Create Architecture Documentation

- [ ] **Create `documentation/architecture/scss-organization.md`**
  ```markdown
  # SCSS Organization

  ## Structure
  _sass/
  ├── custom/
  │   ├── _design-tokens.scss
  │   ├── _typography.scss
  │   ├── _layout.scss
  │   ├── _components.scss
  │   ├── _utilities.scss
  │   ├── _responsive.scss
  │   └── _index.scss
  └── [theme files]

  ## Import Order (Critical!)
  1. Design tokens (colors, fonts, spacing)
  2. Theme base (uses custom tokens)
  3. Custom overrides (modular)

  ## Adding New Styles
  1. New component? → _components.scss
  2. Layout change? → _layout.scss
  3. Typography? → _typography.scss
  4. New token? → _design-tokens.scss
  5. Mobile adjustment? → _responsive.scss
  ```

- [ ] **Create `documentation/architecture/color-system.md`**
  ```markdown
  # Color System

  ## Primary Colors
  - Academic Red: #8b2635 (sidebar, archive titles)
  - Accent Blue: #3498db (body links, h1 underline)

  ## When to Use
  - Archive titles: $academic-red
  - Body links: $accent-blue
  - Sidebar buttons: $academic-red
  - Headings: varies by context

  ## Contrast Ratios
  All colors tested against WCAG AA standards.
  ```

- [ ] **Create `documentation/architecture/typography-system.md`**
  ```markdown
  # Typography System

  ## Font Families
  - Headings: PT Sans Narrow (sans-serif)
  - Body: PT Serif (serif)
  - Code: Monaco (monospace)

  ## Sizing
  - Base: 16px / 1.7 line-height
  - H1: 2em
  - H2: 1.3em
  - H3: 1.2em

  ## Why These Choices
  - Serif body: Academic, traditional
  - Sans-serif headings: Modern sophistication
  - 1.7 line-height: Optimal for long-form reading
  ```

### Update CLAUDE.md

- [ ] **Add SCSS organization section**
  ```markdown
  ## SCSS Architecture (Post-Refactoring)

  _sass/custom/ contains organized custom styles:
  - _design-tokens.scss: Color, font, spacing tokens
  - _typography.scss: All text styling
  - _layout.scss: Page structure
  - _components.scss: UI components
  - _utilities.scss: Helper classes
  - _responsive.scss: Mobile adjustments
  - _index.scss: Import orchestrator

  Import order in main.scss is critical:
  1. Custom tokens
  2. Theme base
  3. Custom overrides
  ```

### Update README or Project Docs

- [ ] **Document color palette for contributors**
- [ ] **Document responsive breakpoints**
- [ ] **Document font families and why**
- [ ] **Document spacing system**

---

## Rollback Checklist (If Needed)

If consolidation causes visual issues:

- [ ] **Identify the problem**
  - [ ] Which page(s) affected?
  - [ ] Which component(s)?
  - [ ] What changed visually?

- [ ] **Check import order**
  ```bash
  # Verify main.scss import order:
  cat assets/css/main.scss | head -30
  # Should show: tokens → theme → custom
  ```

- [ ] **Check specific file**
  - [ ] Which _sass/custom/*.scss file?
  - [ ] Run SCSS linter: `npm run lint:scss`
  - [ ] Check for CSS errors

- [ ] **Isolate the issue**
  - [ ] Comment out problematic file
  - [ ] `bundle exec jekyll build`
  - [ ] Does issue go away?

- [ ] **Rollback strategy**
  ```bash
  # If consolidated version broken:
  git checkout HEAD~1 -- _sass/custom/
  git checkout HEAD~1 -- assets/css/main.scss
  bundle exec jekyll build

  # Debug the problematic consolidation
  # Then try again more carefully
  ```

---

## Success Criteria

Consolidation is successful when:

- [ ] All tests pass (`npm run test:all`)
- [ ] No SCSS build errors
- [ ] Visual appearance identical at 1200px, 1024px, 768px
- [ ] All colors verified via color picker (hex values exact match)
- [ ] All typography verified (fonts, sizes, weights match)
- [ ] Responsive breakpoints working correctly
- [ ] No `!important` flags removed (in Phase 2)
- [ ] All interactive elements respond to hover/focus
- [ ] Lighthouse scores maintained (≥85%, ≥95%, ≥95%)
- [ ] Documentation updated

---

## File Locations Reference

**SCSS Structure:**
```
_sass/
├── custom/                    ← New consolidated custom styles
│   ├── _design-tokens.scss
│   ├── _typography.scss
│   ├── _layout.scss
│   ├── _components.scss
│   ├── _utilities.scss
│   ├── _responsive.scss
│   └── _index.scss
├── variables.scss            ← To be deleted
├── typography.scss           ← To be deleted
├── page.scss                 ← To be deleted
├── elements.scss             ← To be deleted
├── site.scss                 ← To be deleted
└── [other files]
```

**Main Import File:**
```
assets/css/main.scss          ← Update to import from custom/
```

**Documentation:**
```
documentation/
├── UI-UX-REFACTORING-REVIEW.md
├── SCSS-CONSOLIDATION-CHECKLIST.md  ← This file
└── architecture/
    ├── scss-organization.md
    ├── color-system.md
    └── typography-system.md
```

---

**Version:** 1.0
**Last Updated:** 2025-11-11
**Purpose:** Step-by-step checklist for SCSS consolidation
**Related Document:** UI-UX-REFACTORING-REVIEW.md
