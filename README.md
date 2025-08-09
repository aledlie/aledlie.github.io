# Personal Website

A Jekyll-based personal website using the Minimal Mistakes theme, designed for GitHub Pages hosting.

## Project Structure

```
/Users/alyshialedlie/code/PersonalSite
├── _config.yml
├── _posts
│   ├── 2017-05-12-my-first-jekyll-post.markdown
│   └── 2025-07-02-updating-jekyll-in-2025.markdown
├── .gitignore
├── about.md
├── assets
│   └── images
│       ├── profile_bw.jpg
│       ├── profile.jpg
│       ├── profile.png
│       └── profilebw.png
├── Gemfile
├── Gemfile.lock
├── index.md
└── README.md

4 directories, 13 files
```

## Description

This is a Jekyll-powered personal website that leverages the popular Minimal Mistakes theme for a clean, professional appearance. The site is configured for seamless deployment on GitHub Pages, making it easy to maintain and update.

### Key Features

- **Jekyll Framework**: Static site generator for fast, secure websites
- **Minimal Mistakes Theme**: Professional, responsive design with built-in features
- **GitHub Pages Compatible**: Uses the `github-pages` gem for deployment compatibility
- **Blog Functionality**: Organized blog posts in the `_posts` directory
- **Asset Management**: Centralized image storage in `assets/images`
- **SEO Optimized**: Includes Jekyll SEO tag plugin for better search visibility

### Technology Stack

- **Ruby Gems**: 
  - `github-pages` (~232) for GitHub Pages compatibility
  - `minimal-mistakes-jekyll` theme
  - `jekyll-feed` for RSS feeds
  - `jekyll-seo-tag` for SEO optimization
  - Additional gems for Ruby 3.4.4 compatibility (csv, logger, webrick, base64)

### Directory Overview

- **_posts/**: Blog posts in Markdown format with YAML front matter
- **assets/images/**: Profile images and other static assets
- **_config.yml**: Jekyll site configuration and theme settings
- **index.md**: Homepage content
- **about.md**: About page content
- **Gemfile**: Ruby dependency management
- **.gitignore**: Git exclusion rules

## Getting Started

1. Install dependencies: `bundle install`
2. Serve locally: `bundle exec jekyll serve`
3. Visit: `http://localhost:4000`

## Deployment

This site is configured for automatic deployment to GitHub Pages when pushed to the main branch.
