# CSS Maintainability Fix

**Date**: 2026-01-31
**Goal**: Reduce `!important` declarations from 130 to <20 justified ones while maintaining WCAG AA compliance and visual parity.

## Results Summary

| Location | Before | After | Change |
|----------|--------|-------|--------|
| `assets/css/main.scss` | 123 | 0 | -123 |
| `_sass/minimal-mistakes/_footer.scss` | 6 | 6 | 0 (justified) |
| `_sass/minimal-mistakes/_search.scss` | 1 | 1 | 0 (justified) |
| **Custom Code Total** | **130** | **7** | **-123** |

### Compiled CSS Analysis

The compiled `main.css` contains ~58 `!important` declarations, all from:
- Vendor CSS (Magnific Popup lightbox)
- Theme gem print styles
- Theme gem notice/button components
- Justified footer overrides (WCAG AA compliance)

## Techniques Used

### 1. CSS Custom Properties / Variable Overrides

Overrode theme's base16 syntax highlighting variables in `_sass/variables.scss`. The theme uses `!default` flags, so defining variables before import takes precedence.

```scss
// Override theme's dark base16 palette with light theme colors
$base00: $code-bg;           // Background - light gray
$base05: $text-color;        // Default text - dark
$base08: $syntax-error;      // Errors - red
$base0b: $syntax-string;     // Strings - red
$base0e: $syntax-keyword;    // Keywords - dark red
```

**Impact**: Eliminated 62 syntax highlighting `!important` declarations.

### 2. Specificity Escalation

Used parent context (`html body`, `body`) instead of `!important` to increase specificity.

```scss
// Before: a { color: $text-color !important; }
// After:
html body a { color: $text-color; }
```

Specificity breakdown:
- `a` = (0,0,1)
- `html body a` = (0,0,3) - wins cascade

**Impact**: Eliminated global link, code block, and layout clearing overrides.

### 3. New Utility Mixin

Created `text-wrap-normal` mixin for repeated sidebar text truncation fixes:

```scss
@mixin text-wrap-normal {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  max-width: none;
}
```

**Impact**: Eliminated 17 text truncation `!important` declarations with clean, reusable code.

### 4. Contextual Selectors

Used parent class context for higher specificity:

```scss
// Before: .author__avatar { display: block !important; }
// After:
body .sidebar .author__avatar { display: block; }
```

**Impact**: Eliminated author profile and archive link overrides.

## Justified Remaining `!important` (7 total)

### Footer Colors (6)
Located in `_sass/minimal-mistakes/_footer.scss`:
- WCAG AA compliance requires specific contrast ratios
- Theme's cascade complexity makes specificity escalation impractical
- Colors validated: 7.4:1 and 14.0:1 contrast ratios

### Search Widget (1)
Located in `_sass/minimal-mistakes/_search.scss`:
- Algolia integration requires this override
- Third-party widget styles cannot be controlled

## Files Modified

| File | Changes |
|------|---------|
| `_sass/variables.scss` | Added base16 overrides, `text-wrap-normal` mixin |
| `assets/css/main.scss` | Removed 123 `!important`, restructured selectors |

## Verification

- Build: `npm run build` - SCSS compiles without errors
- Unit tests: `npm run test` - 203 tests passing
- Visual verification: Manual comparison shows identical rendering

## Architecture Notes

The fix leverages CSS cascade order:
1. `_sass/variables.scss` - Loaded first, defines base16 overrides
2. Theme gem `_variables.scss` - Uses `!default`, our values take precedence
3. Theme components - Use our variable values
4. `assets/css/main.scss` - Loaded last, can use specificity to override

This approach is more maintainable because:
- Variable overrides are centralized
- Specificity is predictable (no `!important` arms race)
- New overrides follow established patterns
