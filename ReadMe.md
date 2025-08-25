# The Parlor - Personal Website

A Jekyll-based personal website using the Minimal Mistakes theme, completely redesigned with a clean, minimal aesthetic inspired by professional academic blogs. Optimized for GitHub Pages and Vercel deployment.

[![LICENSE](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://raw.githubusercontent.com/mmistakes/minimal-mistakes/master/LICENSE)
[![Jekyll](https://img.shields.io/badge/jekyll-%3E%3D%203.7-blue.svg)](https://jekyllrb.com/)

## Project Structure

```
/Users/alyshialedlie/code/PersonalSite/
├── _config.yml                 # Jekyll site configuration
├── _data/
│   ├── navigation.yml          # Site navigation menu structure
│   └── ui-text.yml            # UI text translations
├── _includes/                  # Reusable template components
│   ├── documents_collection.html
│   ├── posts-category.html
│   ├── posts-tag.html
│   ├── posts-taxonomy.html
│   ├── post-schema.html
│   └── post_pagination.html
├── _layouts/                   # Page layout templates
│   └── home.html              # Homepage layout (extends archive)
├── _posts/                     # Blog posts in Markdown
│   ├── 2017-05-12-my-first-jekyll-post.markdown
│   └── 2025-07-02-updating-jekyll-in-2025.markdown
├── assets/
│   ├── css/
│   │   └── main.scss          # **HEAVILY CUSTOMIZED** - Main stylesheet
│   ├── images/                # Profile and header images
│   │   ├── cover-*.png        # Header images for different pages
│   │   ├── profile*.jpg       # Profile photos
│   │   └── [other images]
│   ├── js/                    # JavaScript files
│   ├── code/                  # MATLAB code samples
│   └── fonts/                 # Font files
├── images/                     # Additional image assets
├── index.html                  # Homepage (uses home layout)
├── about.md                   # About page
├── Gemfile                    # Ruby dependencies
├── Gemfile.lock              # Locked dependency versions
├── .gitignore                # Git exclusion rules
└── ReadMe.md                 # This file

4 directories, 13+ files
```

## Base Theme: Minimal Mistakes

This site is built on the [Minimal Mistakes Jekyll theme](https://mmistakes.github.io/minimal-mistakes/) by Michael Rose, which provides:

### **Original Theme Features:**
- Responsive design with sidebar navigation
- Built-in support for blog posts and pages
- Social media integration
- SEO optimization with jekyll-seo-tag
- Multiple layout options (single, archive, home, etc.)
- Customizable color schemes (skins)
- Author profile sidebar
- Navigation menu system
- Pagination support

### **Theme Configuration:**
- **Skin**: `contrast` - High contrast color scheme
- **Layout**: Two-column with sidebar and main content
- **Navigation**: Custom menu defined in `_data/navigation.yml`
- **Author Profile**: Enabled with social media links
- **Pagination**: 8 posts per page

## Major Customizations Made

### **1. Complete CSS Redesign (`assets/css/main.scss`)**
**Status**: 🔴 **HEAVILY MODIFIED** - Complete visual overhaul

#### **Design Philosophy:**
- Transformed from default theme styling to clean, minimal academic blog aesthetic
- Inspired by professional academic websites (reference: Sumedh Joshi's blog)
- Focus on typography, readability, and content-first design

#### **Key Changes:**
- **Typography**: System fonts, improved hierarchy, smaller font sizes (14px base)
- **Layout**: Compact spacing, reduced margins, professional proportions
- **Colors**: Clean black text on white background, subtle gray accents
- **Navigation**: Centered, constrained width, bold typography
- **Header**: Compact cover images (120px height) instead of large hero sections
- **Post Titles**: Clean black text, removed blue underlined links
- **Sidebar**: Simplified social links, hidden icons, cleaner profile section
- **Responsive**: Mobile-first approach with proper breakpoints

#### **Technical Improvements:**
- Fixed CSS specificity issues with `!important` overrides where necessary
- Targeted correct Jekyll-generated classes (`.list__item`, `.archive__item`)
- Resolved character encoding issues for Vercel deployment
- Consolidated redundant CSS rules (reduced file size by ~25%)
- Added proper SCSS organization and nesting

### **2. Navigation Customization (`_data/navigation.yml`)**
**Status**: 🟡 **MODIFIED** - Custom menu structure

```yaml
main:
  - title: "About"
  - title: "Blog" 
  - title: "About Me"
  - title: "Vita"
  - title: "Homage"
  - title: "Sumedh's Site" (external link)
  - title: "Side Projects"
```

### **3. Site Configuration (`_config.yml`)**
**Status**: 🟡 **MODIFIED** - Personalized settings

#### **Key Configurations:**
- **Title**: "The Parlor"
- **Description**: "An archive for midnight rambles"
- **URL**: https://www.aledlie.com
- **Theme**: minimal-mistakes-jekyll with contrast skin
- **Author Profile**: Complete with bio, location, social links
- **Analytics**: Google Analytics integration
- **Plugins**: SEO, feeds, pagination, sitemap

### **4. Content Structure**
**Status**: 🟢 **STANDARD** - Uses theme defaults

#### **Layouts Used:**
- `home` layout for homepage (extends `archive`)
- `single` layout for individual posts
- `page` layout for static pages

#### **Content Organization:**
- Blog posts in `_posts/` with YAML front matter
- Static pages (about.md) in root directory
- Images organized in `assets/images/` and `images/`

## Technology Stack

### **Core Technologies:**
- **Jekyll** 3.10.0 - Static site generator
- **Ruby** 3.4.4 - Runtime environment
- **SCSS** - CSS preprocessing
- **Liquid** - Templating language

### **Ruby Gems:**
```ruby
gem "github-pages", "~> 232"           # GitHub Pages compatibility
gem "minimal-mistakes-jekyll"          # Base theme
gem "jekyll-feed"                      # RSS feeds
gem "jekyll-seo-tag"                   # SEO optimization
gem "jekyll-paginate"                  # Post pagination
gem "jekyll-sitemap"                   # XML sitemap
gem "jekyll-gist"                      # GitHub Gist embedding
gem "jekyll-include-cache"             # Performance optimization

# Ruby 3.4.4 compatibility gems
gem "csv"
gem "logger" 
gem "webrick"
gem "base64"
```

### **Deployment Platforms:**
- **GitHub Pages** - Primary hosting
- **Vercel** - Alternative deployment (with encoding fixes)

## Key Features

### **Design Features:**
- ✅ **Clean, minimal aesthetic** matching professional academic blogs
- ✅ **Responsive design** with mobile-first approach
- ✅ **Typography-focused** with excellent readability
- ✅ **Fast loading** with optimized assets
- ✅ **SEO optimized** with proper meta tags and structure

### **Content Features:**
- ✅ **Blog functionality** with post archives and pagination
- ✅ **Author profile** with social media integration
- ✅ **Custom navigation** with external links
- ✅ **Image galleries** and code syntax highlighting
- ✅ **RSS feeds** and XML sitemap

### **Technical Features:**
- ✅ **GitHub Pages compatible** deployment
- ✅ **Vercel deployment ready** with encoding fixes
- ✅ **Analytics integration** (Google Analytics)
- ✅ **Performance optimized** CSS and JavaScript
- ✅ **Cross-browser compatible** with modern web standards

## Development Workflow

### **Local Development:**
```bash
# Install dependencies
bundle install

# Serve locally (with Ruby warnings suppressed)
RUBYOPT="-W0" bundle exec jekyll serve

# Build for production
bundle exec jekyll build
```

### **Deployment:**
- **Automatic**: Push to `master` branch triggers GitHub Pages deployment
- **Manual**: Build locally and deploy `_site/` directory to hosting provider

## Customization Notes

### **CSS Architecture:**
The main stylesheet (`assets/css/main.scss`) follows this structure:
1. **Global Layout** - Body, typography, base styles
2. **Header** - Cover images, hero sections
3. **Navigation** - Masthead, menu styling
4. **Content Areas** - Main content, sidebar, archive listings
5. **Components** - Buttons, links, forms
6. **Responsive** - Media queries for different screen sizes

### **Color Scheme:**
- **Primary Text**: `#333` (dark gray)
- **Secondary Text**: `#666` (medium gray)
- **Meta Text**: `#999` (light gray)
- **Accent Color**: `#0066cc` (blue for hover states)
- **Background**: `#fff` (pure white)
- **Borders**: `#eee` (very light gray)

### **Typography Scale:**
- **Base Font Size**: 14px
- **Headings**: System font stack with proper hierarchy
- **Line Height**: 1.6 for body text, 1.3 for headings
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Performance Optimizations

- **CSS**: Consolidated rules, removed redundancies, compressed output
- **Images**: Optimized profile and header images
- **JavaScript**: Minimal custom JS, leveraging theme defaults
- **Fonts**: System font stack for fast loading
- **Caching**: Proper cache headers for static assets

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Responsive Breakpoints**: 768px (mobile), 1024px (tablet), 1200px (desktop)

## License

This project uses the MIT License inherited from the Minimal Mistakes theme. See the original theme's [LICENSE](https://raw.githubusercontent.com/mmistakes/minimal-mistakes/master/LICENSE) for details.

## Acknowledgments

- **Base Theme**: [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) by Michael Rose
- **Design Inspiration**: Professional academic blog layouts
- **Hosting**: GitHub Pages and Vercel
- **Development**: Jekyll static site generator
