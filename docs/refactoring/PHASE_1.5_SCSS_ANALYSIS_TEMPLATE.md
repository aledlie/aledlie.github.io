# Phase 1.5: SCSS Analysis Template

**Date Started:** [FILL IN]
**Completed By:** [FILL IN]
**Status:** NOT STARTED
**Time Estimate:** 4 hours

---

## Purpose

This phase is CRITICAL before any SCSS consolidation work begins. The original refactoring plan identified 8 SCSS files but the actual codebase has 13. This analysis ensures we understand ALL files before consolidation.

**DO NOT SKIP THIS PHASE.**

---

## Task 1.5.1: Complete SCSS File Inventory

**Time:** 1 hour
**Script to run:**

```bash
echo "# SCSS File Inventory - $(date)" > scss-inventory.txt
echo "" >> scss-inventory.txt

find _sass -name "*.scss" -type f | while read file; do
    echo "=== $file ===" >> scss-inventory.txt
    echo "Lines: $(wc -l < "$file")" >> scss-inventory.txt
    echo "Size: $(du -h "$file" | cut -f1)" >> scss-inventory.txt
    echo "Imports:" >> scss-inventory.txt
    grep "^@import" "$file" >> scss-inventory.txt || echo "  (none)" >> scss-inventory.txt
    echo "Imported by:" >> scss-inventory.txt
    grep -r "@import.*$(basename $file .scss)" _sass/ assets/css/ 2>/dev/null | cut -d: -f1 | uniq >> scss-inventory.txt || echo "  (none found)" >> scss-inventory.txt
    echo "" >> scss-inventory.txt
done

echo "Total SCSS files: $(find _sass -name "*.scss" -type f | wc -l)" >> scss-inventory.txt
echo "Total lines: $(find _sass -name "*.scss" -type f -exec wc -l {} + | tail -1 | awk '{print $1}')" >> scss-inventory.txt
```

### File Inventory Results

Fill in this table:

| File Path | Lines | Purpose | Imported By | Status |
|-----------|-------|---------|-------------|--------|
| _sass/variables.scss | 170 | Custom variables | main.scss | ✓ In plan |
| _sass/page.scss | 600 | Page layouts | main.scss | ✓ In plan |
| _sass/typography.scss | 193 | Typography | main.scss | ✓ In plan |
| _sass/elements.scss | 183 | Elements | main.scss | ✓ In plan |
| _sass/site.scss | 64 | Site utilities | main.scss | ✓ In plan |
| _sass/coderay.scss | [FILL] | Syntax highlighting | [FILL] | ✓ In plan |
| _sass/grid.scss | [FILL] | Grid system | [FILL] | ✓ In plan |
| _sass/mixins.scss | [FILL] | SCSS mixins | [FILL] | ✓ In plan |
| _sass/_base.scss | [FILL] | [FILL PURPOSE] | [FILL] | ⚠️ NOT IN PLAN |
| _sass/_buttons.scss | [FILL] | [FILL PURPOSE] | [FILL] | ⚠️ NOT IN PLAN |
| _sass/_footer.scss | [FILL] | [FILL PURPOSE] | [FILL] | ⚠️ NOT IN PLAN |
| _sass/_forms.scss | [FILL] | [FILL PURPOSE] | [FILL] | ⚠️ NOT IN PLAN |
| _sass/_sidebar.scss | [FILL] | [FILL PURPOSE] | [FILL] | ⚠️ NOT IN PLAN |
| _sass/normalize.scss | [FILL] | [FILL PURPOSE] | [FILL] | ⚠️ NOT IN PLAN |
| _sass/print.scss | [FILL] | [FILL PURPOSE] | [FILL] | ⚠️ NOT IN PLAN |

**Additional files found:**
- [List any other .scss files not in table above]

---

## Task 1.5.2: Identify Duplicate Files

**Time:** 1 hour

### Known Duplicates to Investigate

#### Duplicate Set 1: Footer Files

**File 1:** `_sass/_footer.scss` (custom)
- **Lines:** [FILL]
- **Content preview:** [First 10 lines]

**File 2:** `_sass/minimal-mistakes/_footer.scss` (theme)
- **Lines:** [FILL]
- **Content preview:** [First 10 lines]

**Analysis:**
- [ ] Both files exist
- [ ] Files are identical
- [ ] Files are similar but different
- [ ] Only one is imported

**Which is imported in main.scss?** [FILL]

**Decision:**
- [ ] Keep custom, remove theme
- [ ] Keep theme, remove custom
- [ ] Merge both into new file
- [ ] Keep both (explain why): [FILL]

**Action:** [FILL - what to do with these files]

---

#### Duplicate Set 2: Sidebar Files

**File 1:** `_sass/_sidebar.scss` (custom)
- **Lines:** [FILL]
- **Content preview:** [First 10 lines]

**File 2:** `_sass/minimal-mistakes/_sidebar.scss` (theme)
- **Lines:** [FILL]
- **Content preview:** [First 10 lines]

**Analysis:**
- [ ] Both files exist
- [ ] Files are identical
- [ ] Files are similar but different
- [ ] Only one is imported

**Which is imported in main.scss?** [FILL]

**Decision:**
- [ ] Keep custom, remove theme
- [ ] Keep theme, remove custom
- [ ] Merge both into new file
- [ ] Keep both (explain why): [FILL]

**Action:** [FILL - what to do with these files]

---

#### Other Duplicates Found

**List any other duplicate files discovered:**

1. [File 1] vs [File 2]
   - **Analysis:** [FILL]
   - **Decision:** [FILL]
   - **Action:** [FILL]

---

## Task 1.5.3: Create SCSS Dependency Map

**Time:** 1 hour

### Current Import Structure

**Run this command:**
```bash
echo "=== MAIN.SCSS IMPORTS ===" > scss-imports.txt
grep -n "^@import" assets/css/main.scss >> scss-imports.txt
echo "" >> scss-imports.txt

echo "=== VARIABLE DEPENDENCIES ===" >> scss-imports.txt
grep -r "^\$" _sass/*.scss | head -20 >> scss-imports.txt
echo "" >> scss-imports.txt

echo "=== MIXIN DEPENDENCIES ===" >> scss-imports.txt
grep -r "^@mixin" _sass/*.scss >> scss-imports.txt
```

### Import Order Analysis

**Fill in the actual import order from main.scss:**

```scss
// assets/css/main.scss current structure:
---
---

@charset "utf-8";

// [FILL IN: List all @import statements in order]
1. @import "[FILL]";
2. @import "[FILL]";
3. @import "[FILL]";
...
```

### Dependency Graph

**Create a visual dependency graph:**

```
main.scss
├── [Import 1]
│   ├── Variables used: $[list]
│   └── Mixins used: @[list]
├── [Import 2]
│   ├── Variables used: $[list]
│   ├── Mixins used: @[list]
│   └── Depends on: [other imports]
└── ...
```

**Critical Dependencies Identified:**

| File | Depends On (must be imported before) | Used By (must be imported after) |
|------|-------------------------------------|----------------------------------|
| variables.scss | (none - should be first) | [FILL - list files] |
| mixins.scss | [FILL] | [FILL] |
| minimal-mistakes.scss | [FILL] | [FILL] |
| [Other files] | [FILL] | [FILL] |

---

## Task 1.5.4: Build Detailed Consolidation Plan

**Time:** 1 hour

### Files That Are Unused

**List files NOT imported anywhere:**
- [ ] [File name] - Reason not used: [FILL]
- [ ] [File name] - Reason not used: [FILL]

**Action:** Can be safely deleted (after verification)

---

### Files to Consolidate into `_sass/custom/_variables.scss`

**Target size:** ~250 lines

**Source files:**
- [ ] `_sass/variables.scss` (170 lines)
- [ ] `_sass/mixins.scss` ([FILL] lines) - if mixins are simple
- [ ] [Other files?]

**Consolidation order:**
1. Copy `variables.scss` → `custom/_variables.scss`
2. Append `mixins.scss` if applicable
3. Remove duplicates
4. Test build

**Verification:**
- [ ] Build succeeds
- [ ] No undefined variable errors
- [ ] CSS output unchanged

---

### Files to Consolidate into `_sass/custom/_overrides.scss`

**Target size:** ~800-1000 lines

**Source files:**
- [ ] `_sass/page.scss` (600 lines)
- [ ] `_sass/typography.scss` (193 lines)
- [ ] Parts of `main.scss` overrides (394 lines)
- [ ] [Other files?]

**Consolidation order:**
1. Create file with header comments
2. Add page overrides from `page.scss`
3. Add typography overrides from `typography.scss`
4. Add remaining overrides from `main.scss`
5. Organize with section comments
6. Remove `!important` flags where possible
7. Test build after each addition

**Verification:**
- [ ] Build succeeds
- [ ] Visual regression tests pass
- [ ] CSS output functionally identical

---

### Files to Consolidate into `_sass/custom/_components.scss`

**Target size:** ~200-300 lines

**Source files:**
- [ ] `_sass/elements.scss` (183 lines)
- [ ] `_sass/_buttons.scss` ([FILL] lines)
- [ ] [Other component files?]

**Consolidation order:**
1. Create file with header
2. Add button styles
3. Add element styles
4. Test build

**Verification:**
- [ ] Build succeeds
- [ ] Button styling intact
- [ ] Element styling intact

---

### Files to Consolidate into `_sass/custom/_utilities.scss`

**Target size:** ~100 lines

**Source files:**
- [ ] `_sass/site.scss` (64 lines)
- [ ] [Other utility files?]

**Consolidation order:**
1. Copy site.scss → utilities.scss
2. Add any other utility classes
3. Test build

**Verification:**
- [ ] Build succeeds
- [ ] Utility classes work

---

### Files to Consolidate into `_sass/custom/_syntax.scss`

**Target size:** [FILL] lines

**Source files:**
- [ ] `_sass/coderay.scss`
- [ ] [Other syntax files?]

**Consolidation order:**
1. Copy coderay.scss → syntax.scss
2. Test code highlighting

**Verification:**
- [ ] Build succeeds
- [ ] Code blocks render correctly
- [ ] Syntax highlighting works

---

### Files to Keep Separate

**List files that should NOT be consolidated:**

| File | Reason to Keep Separate | Location in New Structure |
|------|------------------------|---------------------------|
| normalize.scss | Standard CSS reset, shouldn't modify | _sass/vendor/ or theme/ |
| print.scss | Print-specific styles | _sass/custom/_print.scss |
| grid.scss | If used independently | _sass/custom/_grid.scss OR remove if theme provides |
| [Others] | [FILL] | [FILL] |

---

### Files to Delete

**List files that can be safely deleted:**

| File | Reason for Deletion | Verification Done |
|------|---------------------|-------------------|
| [File] | Not imported anywhere | [ ] Grepped, not found |
| [File] | Duplicate of theme file | [ ] Theme file used instead |
| [File] | Replaced by consolidation | [ ] Content moved to [new file] |

---

## New SCSS Structure Plan

### Proposed Directory Structure

```
_sass/
├── theme/                    # Forked theme (if Phase 2A chooses fork)
│   └── minimal-mistakes/
│       └── [theme files]
│
├── custom/                   # All custom SCSS (NEW)
│   ├── _variables.scss       # ~250 lines - colors, fonts, breakpoints, mixins
│   ├── _overrides.scss       # ~800 lines - theme style overrides
│   ├── _components.scss      # ~200 lines - custom components
│   ├── _utilities.scss       # ~100 lines - utility classes
│   └── _syntax.scss          # ~[FILL] lines - code highlighting
│
└── vendor/
    └── _fonts.scss           # Keep as-is
```

**Total estimated lines after consolidation:** ~[FILL] (down from [FILL])

---

### Proposed main.scss Structure

```scss
---
# Only the main Sass file needs front matter
---

@charset "utf-8";

/* The Parlor - Custom Jekyll Site
 * Based on Minimal Mistakes 4.27.3 (forked 2025-11-11)
 * Refactored: [DATE]
 *
 * Import order is critical:
 * 1. Custom variables FIRST (define colors, fonts, breakpoints)
 * 2. Theme base (uses our variables)
 * 3. Custom overrides (adjust theme styles)
 * 4. Custom components (new components)
 * 5. Utilities (helper classes)
 */

// Step 1: Define our custom variables
// These override theme defaults
@import "custom/variables";

// Step 2: Import theme base
// This uses the variables we just defined
@import "theme/minimal-mistakes";  // OR "minimal-mistakes" if not forking

// Step 3: Override theme styles
// Changes to theme components
@import "custom/overrides";

// Step 4: Add our custom components
// New components built on theme foundation
@import "custom/components";

// Step 5: Add utility classes
// Helper classes for layout
@import "custom/utilities";

// Step 6: Add syntax highlighting customizations
@import "custom/syntax";

/* End of imports - all styles are modular */
```

**Estimated lines:** ~50 (down from 394)

---

## Import Order Verification

**Critical: Verify this import order doesn't break anything**

### Test Plan

**After creating new structure, test in this order:**

1. **Create new directory structure:**
   ```bash
   mkdir -p _sass/custom
   mkdir -p _sass/theme  # If forking
   ```

2. **Create stub files:**
   ```bash
   touch _sass/custom/{_variables,_overrides,_components,_utilities,_syntax}.scss
   ```

3. **Update main.scss with new imports:**
   - Comment out old imports
   - Add new imports
   - Test build

4. **If build fails:**
   - Check for undefined variables
   - Check for undefined mixins
   - Check import order

5. **If build succeeds but looks wrong:**
   - Run visual regression test
   - Check browser console for errors
   - Verify responsive behavior

---

## Risk Assessment for Consolidation

### High Risk Files

| File | Risk Level | Reason | Mitigation |
|------|-----------|--------|------------|
| variables.scss | MEDIUM | Other files depend on it | Move first, test immediately |
| page.scss | HIGH | 600 lines of overrides | Consolidate incrementally |
| main.scss | HIGH | 394 lines with !important | Need to understand cascade |
| [Others] | [FILL] | [FILL] | [FILL] |

### Low Risk Files

| File | Risk Level | Reason |
|------|-----------|--------|
| site.scss | LOW | Small utility file |
| coderay.scss | LOW | Self-contained syntax styles |
| [Others] | [FILL] | [FILL] |

---

## Phase 1.5 Completion Checklist

**Before proceeding to Phase 2A, verify:**

- [ ] All 13+ SCSS files documented
- [ ] Duplicate files identified and decisions made
- [ ] Import dependencies mapped
- [ ] Consolidation plan detailed with exact file destinations
- [ ] New directory structure designed
- [ ] New main.scss import order specified
- [ ] Risk assessment complete
- [ ] Test plan created
- [ ] Visual regression baseline captured
- [ ] Team reviewed this analysis

**If all checked:** APPROVED to proceed to Phase 2A

**If any unchecked:** Complete missing items before Phase 2A

---

## Notes and Observations

**Unexpected findings:**
- [FILL - anything surprising discovered during analysis]

**Concerns:**
- [FILL - any worries about consolidation approach]

**Questions for team:**
- [FILL - any decisions needed from stakeholders]

---

## Sign-Off

**Completed by:** [NAME]
**Date completed:** [DATE]
**Time taken:** [ACTUAL TIME]
**Ready for Phase 2A:** [ ] YES [ ] NO

**If NO, what's missing:**
- [FILL]

---

**Next Step:** Proceed to Phase 2A (Theme Strategy Decision)

