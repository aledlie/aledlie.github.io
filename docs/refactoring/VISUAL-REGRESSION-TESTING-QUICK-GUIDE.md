# Visual Regression Testing - Quick Reference Guide

**Purpose:** Fast checklist for testing after SCSS changes

---

## Pre-Change Testing (5 minutes)

```bash
# Take baseline screenshots
RUBYOPT="-W0" bundle exec jekyll serve
```

**Screenshot checklist at 1200px, 1024px, 768px:**
- [ ] Homepage
- [ ] Single post
- [ ] Archive page
- [ ] Navigation (test hover)
- [ ] Archive title (test hover)

**Save to:** `documentation/baseline-screenshots/[viewport]/`

---

## Post-Change Testing (10 minutes per change)

### 1. Build Check (1 minute)
```bash
bundle exec jekyll build
# No errors? ✓
ls -lh _site/assets/css/  # CSS file size similar? ✓
```

### 2. Visual Check (5 minutes)
```bash
RUBYOPT="-W0" bundle exec jekyll serve
# Open http://localhost:4000
```

**At 1200px viewport:**
- [ ] Header displays correctly
- [ ] Navigation centered, uppercase
- [ ] Sidebar on right, profile centered
- [ ] Content width constrained to 1200px
- [ ] Colors match baseline

**At 1024px viewport:**
- [ ] Navigation still visible
- [ ] Sidebar width adjusted
- [ ] Avatar reduced size (120px)
- [ ] No layout breaking

**At 768px viewport:**
- [ ] Navigation stacked vertically
- [ ] Sidebar reflows below content
- [ ] No horizontal scroll
- [ ] Links tappable (≥48px)
- [ ] Font size reduced (15px)

### 3. Component Check (3 minutes)

**Typography:**
```
DevTools Inspector (F12):
- [ ] h1: PT Sans Narrow, 2em
- [ ] h2: PT Sans Narrow, 1.3em
- [ ] body: PT Serif, 16px, line-height 1.7
```

**Colors (use color picker):**
```
Right-click element → Inspect → Color picker:
- [ ] Archive title: #8b2635 (academic red)
- [ ] H1 underline: #3498db (accent blue)
- [ ] Body link: #3498db (accent blue)
- [ ] Sidebar link: #8b2635 (academic red)
```

**Spacing:**
```
DevTools Inspector → Computed tab:
- [ ] #main max-width: 1200px
- [ ] Navigation height: ~100px
- [ ] Sidebar padding: 2em 1em 1em
- [ ] Content padding: reasonable margins
```

### 4. Test Suite (2 minutes)
```bash
npm run test:all
# All tests pass? ✓
```

---

## Mobile Testing Checklist (5 minutes)

Open DevTools (F12) → Responsive Design Mode (Ctrl+Shift+M)

### At 375px (Mobile)
- [ ] Navigation wraps and stacks
- [ ] Sidebar stacks below content
- [ ] Content readable without zoom
- [ ] Avatar smaller (150px or adjusted)
- [ ] No horizontal scroll

### Touch Interaction
- [ ] Tap nav items (≥48px height)
- [ ] Tap archive titles (≥48px height)
- [ ] Tap links in sidebar (≥48px height)
- [ ] No elements require pinch to interact

---

## Color Validation (3 minutes)

**Method 1: Color Picker**
1. Open DevTools (F12)
2. Select element
3. Click color box in Styles panel
4. Read hex value
5. Compare to baseline

**Key colors to check:**
```
Before:                    After:
#8b2635 (red)           → #8b2635 (red)      ✓ EXACT MATCH
#3498db (blue)          → #3498db (blue)     ✓ EXACT MATCH
#2c3e50 (text)          → #2c3e50 (text)     ✓ EXACT MATCH
#666 (meta)             → #666 (meta)        ✓ EXACT MATCH
```

**Method 2: Screenshot Comparison**
1. Before: Save screenshot
2. After: Save screenshot
3. Use Photoshop/Preview to overlay
4. Look for color shifts

---

## Typography Validation (3 minutes)

**Method: DevTools Inspector**
1. Open DevTools (F12)
2. Inspect element
3. Check Styles tab
4. Verify computed values

**Checklist:**
```
h1:
  Font: PT Sans Narrow ✓
  Size: 32px (2em) ✓
  Weight: 700 ✓
  Color: #2c3e50 ✓
  Border-bottom: 3px solid #3498db ✓

h2:
  Font: PT Sans Narrow ✓
  Size: 20-21px (1.3em) ✓
  Weight: 500 ✓
  Color: #666 ✓

body:
  Font: PT Serif ✓
  Size: 16px ✓
  Line-height: 1.7 ✓
  Color: #2c3e50 ✓

code:
  Font: monaco ✓
  Background: #fafafa ✓
  Padding: 0.2em 0.4em ✓
```

---

## Responsive Breakpoint Testing (5 minutes)

**Critical Points:**
- 768px: Mobile layout
- 1024px: Tablet layout
- 1200px: Desktop layout

**Test at each breakpoint:**

| Breakpoint | Expected Behavior | How to Test |
|------------|-------------------|------------|
| 768px | Nav stacked, content readable | DevTools resize to 375px, look at layout |
| 1024px | Sidebar adjusted, nav inline | DevTools resize to 1024px |
| 1200px | Full layout, sidebar right | DevTools resize to 1200px |

**Media Query Test:**
```
DevTools → Inspector → Check computed styles
At 768px:
  .greedy-nav { flex-direction: column; } ✓
  .page-content { font-size: 15px; } ✓

At 1024px:
  .sidebar { width: adjusted; } ✓
  .author-avatar { width: 120px; } ✓

At 1200px:
  Full layout visible ✓
  Sidebar on right ✓
```

---

## Common Visual Regression Patterns

### Pattern 1: Colors Shifted
**Symptom:** Colors look slightly different
**Check:**
- [ ] Color picker values (hex codes must match exactly)
- [ ] Color contrast still sufficient
- [ ] Check if theme variables were overridden

**Fix:** Verify color definitions in _design-tokens.scss

### Pattern 2: Typography Changed
**Symptom:** Text looks bigger/smaller or different font
**Check:**
- [ ] Font-family in DevTools (pt Serif vs PT Sans?)
- [ ] Font-size in DevTools
- [ ] Line-height in DevTools

**Fix:** Verify typography rules in _typography.scss

### Pattern 3: Spacing Wrong
**Symptom:** Elements too close or too far apart
**Check:**
- [ ] Margin in DevTools Computed tab
- [ ] Padding in DevTools Computed tab
- [ ] Compare to baseline screenshot

**Fix:** Verify spacing rules, check cascade order

### Pattern 4: Responsive Breaking
**Symptom:** Layout wrong at certain viewport size
**Check:**
- [ ] Media query applied? (DevTools shows media query in source)
- [ ] Correct breakpoint? (768px, 1024px, 1200px?)
- [ ] Rules in correct order?

**Fix:** Verify media queries in _responsive.scss, check import order

### Pattern 5: Sidebar Issues
**Symptom:** Sidebar misaligned or wrong size
**Check:**
- [ ] Sidebar width at each breakpoint
- [ ] Avatar size (150px desktop, 120px tablet, responsive mobile)
- [ ] Profile centered alignment
- [ ] Link colors and hover states

**Fix:** Verify _components.scss sidebar section

### Pattern 6: Navigation Not Wrapping
**Symptom:** Nav doesn't stack at 768px
**Check:**
- [ ] Media query exists for 768px? (✓ should be in _responsive.scss)
- [ ] flex-direction: column applied? (✓ check DevTools)
- [ ] Correct selector? (✓ .greedy-nav)

**Fix:** Verify media query in _responsive.scss, test browser cache (Ctrl+Shift+Delete)

---

## Quick Fixes for Common Issues

### Issue: Colors don't match
```scss
/* Check _design-tokens.scss */
$academic-red: #8b2635;        /* ← Must be exact hex */
$accent-blue: #3498db;         /* ← No variants allowed */

/* Use consistently */
.archive__item-title a {
  color: $academic-red;        /* ← Must use variable */
  text-decoration: none;
}
```

### Issue: Typography broken
```scss
/* Check _typography.scss import in _index.scss */
@import "design-tokens";    /* ← First */
@import "typography";       /* ← Second, after tokens */
@import "components";       /* ← Third */

/* Verify h1 definition includes ALL properties */
h1 {
  font-family: $heading-font;
  font-size: 2em;
  color: $color-text;
  border-bottom: 3px solid $accent-blue;
  padding-bottom: 10px;
  line-height: 1.2;          /* ← Don't miss line-height */
}
```

### Issue: Mobile not responsive
```scss
/* Check _responsive.scss */
@media (max-width: 768px) {
  .greedy-nav {
    flex-direction: column;   /* ← Must have this */
    align-items: flex-start;  /* ← For mobile layout */
  }

  .page-content {
    font-size: 15px;          /* ← Smaller for mobile */
    padding: 1rem;            /* ← Adjust margins */
  }
}

/* Verify media query is AFTER selector definition, not before */
```

### Issue: Sidebar wrong
```scss
/* Check _components.scss */
.sidebar {
  padding: 2em 1em 1em;
  display: flex;
  flex-direction: column;       /* ← Must be column */
  align-items: center;          /* ← Center everything */
  text-align: center;           /* ← Center text */
}

/* Check media query for tablet */
@media (max-width: 1024px) {
  .author-avatar img {
    width: 120px;               /* ← 150px becomes 120px */
    height: 120px;
  }
}
```

---

## Testing Timeline Recommendations

### During Development (Per File)
**Time: 10 minutes per consolidation**
1. Build check (1 min)
2. Visual spot check (5 min)
3. Component check (3 min)
4. Test suite (1 min)

### Between Sections (Per Category)
**Time: 15 minutes**
1. All above (10 min)
2. Full page screenshot at 3 viewports (5 min)

### Before Commit (Phase Complete)
**Time: 30 minutes**
1. All above for complete site (20 min)
2. Compare against baseline (10 min)
3. Verify all tests pass (interactive check)

### Final Before Merge
**Time: 1 hour**
1. Full site at 3 viewports (20 min)
2. Color validation (10 min)
3. Typography validation (10 min)
4. Mobile device test (10 min)
5. Performance check (10 min)

---

## When to Rollback

Rollback if:
- [ ] Colors changed (hex values don't match)
- [ ] Typography fundamentally different (font, size, weight)
- [ ] Responsive breaks at 768px
- [ ] Sidebar layout wrong
- [ ] Navigation doesn't wrap at mobile
- [ ] Tests fail
- [ ] Build errors

**Rollback command:**
```bash
git checkout HEAD -- _sass/custom/[problematic-file].scss
bundle exec jekyll build
# Verify: npm run test:all
```

---

## Performance Check (5 minutes)

```bash
npm run test:performance
# Check Lighthouse scores
# Performance: ≥85% ✓
# Accessibility: ≥95% ✓
# SEO: ≥95% ✓
# Best Practices: ≥90% ✓
```

**If performance dropped:**
- [ ] Check CSS file size (should be similar)
- [ ] Check build time (should be similar or faster)
- [ ] Check for new console errors
- [ ] Check Lighthouse report details

---

## Browser Testing Matrix

**Minimum for consolidation:**
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (WebKit)
- [ ] Mobile Chrome (375px)
- [ ] Mobile Safari (375px)

**Spot checks:**
- Hover states (desktop)
- Link colors (all browsers)
- Typography rendering (all browsers)
- Mobile layout (mobile browsers)

---

## Documentation Updates

After testing passes, update:
- [ ] baseline-screenshots/ (save final screenshots)
- [ ] CLAUDE.md (if SCSS organization changed)
- [ ] This testing checklist (if new issues found)
- [ ] Git commit message (document what was tested)

---

## Emergency Contacts / Fallback

If something goes wrong:
1. Check import order in main.scss (90% of issues)
2. Check media query placement (most responsive issues)
3. Check variable definitions (color/font issues)
4. Rollback to previous commit
5. Debug one file at a time

---

**Version:** 1.0
**Last Updated:** 2025-11-11
**Typical Time:** 10-30 minutes per change
**Success Rate:** 95% if checklist followed exactly
