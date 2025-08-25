# _sass Directory

This directory contains all the Sass/SCSS stylesheets for "The Parlor" Jekyll site. The styles are organized in a modular structure for maintainability and follow modern Sass best practices.

## 📁 Directory Structure

```
_sass/
├── README.md                    # This file
├── variables.scss               # Global Sass variables
├── mixins.scss                  # Utility mixins and functions
├── minimal-mistakes.scss        # Main theme import file
├── _base.scss                   # Base HTML element styles
├── _buttons.scss               # Button component styles
├── _footer.scss                # Footer component styles
├── _forms.scss                 # Form styling (modern version)
├── _sidebar.scss               # Sidebar component styles
├── coderay.scss                # CodeRay syntax highlighting
├── elements.scss               # Base elements (buttons, wells, images)
├── grid.scss                   # Grid system mixins
├── normalize.scss              # CSS normalization/reset
├── page.scss                   # Page layout and content styling
├── print.scss                  # Print-specific styles
├── site.scss                   # Site-wide global styles
├── typography.scss             # Typography and font styles
├── minimal-mistakes/           # Theme-specific components
│   ├── _footer.scss
│   ├── _search.scss
│   ├── _sidebar.scss
│   ├── _syntax.scss
│   ├── _tables.scss
│   └── utils.scss
└── vendor/                     # Third-party styles
    ├── _fonts.scss             # Google Fonts definitions
    ├── google/                 # Google-specific vendor files
    └── _site/                  # Site-specific vendor files
```

## 🎨 Key Features

### **Modern Sass Architecture**
- Uses `@use` instead of deprecated `@import`
- Modular component-based organization
- Proper namespace management with `as *` syntax
- Modern CSS properties without outdated vendor prefixes

### **Typography System**
- **Primary Font**: PT Serif (serif font for body text)
- **Heading Font**: PT Sans Narrow (sans-serif for headings)
- **Code Font**: Monaco, Courier New (monospace for code)
- Responsive typography with rem units and pixel fallbacks

### **Color Palette**
- Comprehensive color system with semantic naming
- Brand colors for social media platforms
- UI state colors (success, warning, danger, info)
- Accessible contrast ratios

### **Grid System**
- Flexible 12-column grid system
- Responsive breakpoints (micro, small, medium, large, x-large)
- Utility mixins for grid manipulation

## 🔧 Key Files Explained

### **`variables.scss`**
Central configuration file containing:
- Typography settings and font stacks
- Color palette (brand colors, UI colors, syntax highlighting)
- Breakpoint definitions
- Component-specific variables
- Grid and layout settings

### **`mixins.scss`** ⭐ *Recently Modernized*
Utility mixins for common CSS patterns:
- **Typography**: `font-size()`, `font-rem()`, `font()`
- **Layout**: `clearfix()`, `center-block()`, `flex-center()`
- **Effects**: `rounded()`, `box-shadow()`, `transition()`
- **Responsive**: `breakpoint()` mixin for media queries
- **Modern CSS**: Removed outdated vendor prefixes

### **`minimal-mistakes.scss`**
Main import file that loads the Minimal Mistakes theme components in the correct order.

### **Component Files**
- **`_buttons.scss`**: Button styles with color variants
- **`_forms.scss`**: Form styling with focus states and validation
- **`_sidebar.scss`**: Sidebar layout and author profile
- **`_footer.scss`**: Footer layout and social links

## 🚀 Recent Improvements

### **✅ Completed Modernizations:**

1. **Removed Duplicate Files**
   - Consolidated `forms.scss` and `_forms.scss` (kept newer version)
   - Removed duplicate `vendor/_fonts.scss''`

2. **Updated Font Loading** 
   - Changed Google Fonts URLs from HTTP to HTTPS
   - Fixed `@font_face` syntax to `@font-face`

3. **Modernized Sass Syntax**
   - Updated `@use` statements with proper namespacing
   - Removed outdated vendor prefixes (-webkit-, -moz-, -ms-, -o-)
   - Simplified mixins for modern browser support
   - Added modern flexbox utilities

4. **Enhanced Mixins**
   - Added `flex-center()` and `flex-between()` utilities
   - Improved `breakpoint()` mixin for responsive design
   - Streamlined animation and transform mixins

5. **Code Quality**
   - Consistent indentation and formatting
   - Proper Sass variable scoping
   - Removed IE-specific hacks and fallbacks

## 📱 Responsive Design

The stylesheet system includes comprehensive responsive design:

```scss
// Breakpoint variables
$micro: "only screen and (min-width: 30em)";      // 480px
$small: "only screen and (min-width: 37.5em)";    // 600px  
$medium: "only screen and (min-width: 48em)";     // 768px
$large: "only screen and (min-width: 62em)";      // 992px
$x-large: "only screen and (min-width: 86.375em)"; // 1382px
```

Usage:
```scss
@include breakpoint(large) {
  // Styles for large screens and up
}
```

## 🎯 Performance Optimizations

- **Minimal CSS Output**: Removed redundant vendor prefixes
- **Efficient Imports**: Uses `@use` for better dependency management
- **Optimized Fonts**: HTTPS font loading with proper fallbacks
- **Print Styles**: Dedicated print stylesheet for better document printing

## 🔍 Syntax Highlighting

Code syntax highlighting is handled by:
- **`coderay.scss`**: CodeRay syntax highlighter styles
- **`minimal-mistakes/_syntax.scss`**: Theme's syntax highlighting
- Supports multiple color schemes and programming languages

## 🛠️ Development Guidelines

### **Adding New Styles**
1. Use existing variables from `variables.scss`
2. Create mixins for reusable patterns
3. Follow BEM-like naming conventions
4. Test across all breakpoints

### **Modifying Colors**
1. Update variables in `variables.scss`
2. Use Sass color functions for variations:
   ```scss
   color: color.adjust($primary-color, $lightness: 10%);
   ```

### **Adding Responsive Styles**
```scss
.my-component {
  // Mobile-first base styles
  padding: 1rem;
  
  @include breakpoint(medium) {
    // Tablet styles
    padding: 2rem;
  }
  
  @include breakpoint(large) {
    // Desktop styles  
    padding: 3rem;
  }
}
```

## 📚 Dependencies

- **Sass/SCSS**: Modern Sass with `@use` module system
- **Minimal Mistakes Theme**: Base Jekyll theme
- **Google Fonts**: PT Serif and PT Sans Narrow font families

## 🔗 Related Files

- **`assets/css/main.scss`**: Main stylesheet that imports these files
- **`_config.yml`**: Jekyll configuration with theme settings
- **`Gemfile`**: Ruby dependencies including Sass gems

---

*Last updated: August 2025*
*Maintained by: The Parlor development team*
