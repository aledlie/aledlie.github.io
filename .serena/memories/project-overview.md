# personal-site — Project Overview

## What it is
Jekyll-based personal website for Alyshia Ledlie (aledlie.com).
Theme: Minimal Mistakes (contrast skin), deployed via GitHub Pages.

## Stack
- Jekyll + Ruby (Gemfile), Node >=22 (package.json)
- Minimal Mistakes theme (local gem, not remote_theme — SSL issue)
- SCSS customization (110+ !important overrides), stylelint enforced
- Analytics: Google Tag Manager (GTM-NR4GGH5K), GA4, Facebook Pixel
- Testing: Jest (unit), Playwright (e2e, a11y), Lighthouse (perf)

## Collections
- `_posts/` — blog posts (YYYY-MM-DD-title.md)
- `_projects/` — portfolio items
- `_reports/` — technical reports
- `_work/` — work-in-progress

## Key config
- `_config.yml` — site config, collections, plugins, pagination (15/page)
- `assets/css/main.scss` — primary stylesheet entry point
- `_layouts/` — 10 templates; `_includes/` — 46 components (13 schema, 33 UI)

## Key commands
- `npm run serve` — local dev at localhost:4000
- `npm run build` — production build
- `npm run test:all` — full suite (build + unit + e2e + perf)
- `npm run lint:scss` — SCSS lint

## Important notes
- WCAG 2.1 AA compliance required
- Liquid: wrap {{...}} in raw...endraw tags
- Ruby warnings suppressed via RUBYOPT="-W0"
- Schema.org markup validated with Google Rich Results Test
