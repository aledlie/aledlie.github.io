# CLAUDE.md

Guidance for Claude Code when working with this Jekyll-based personal website.

**Site:** https://www.aledlie.com | **Theme:** Minimal Mistakes (contrast skin) | **Deployment:** GitHub Pages

## Commands

```bash
# Development
bundle install              # Install Ruby deps
npm install                 # Install Node deps
npm run serve               # Serve at localhost:4000
npm run build               # Production build

# Testing
npm run test:all            # All tests (build + unit + e2e + perf)
npm run test                # Jest unit tests
npm run test:e2e            # Playwright (Chrome, Firefox, Safari, Mobile)
npm run test:performance    # Lighthouse audits

# Linting
npm run lint:scss           # SCSS linting
npm run lint:scss --fix     # Auto-fix SCSS
```

## Architecture

> **Details:** [docs/ARCHITECTURE-DATA-FLOWS.md](docs/ARCHITECTURE-DATA-FLOWS.md) - Data flows, mermaid diagrams, component relationships

| Component | Location | Notes |
|-----------|----------|-------|
| Config | `_config.yml` | Site settings, collections, plugins |
| Layouts | `_layouts/` | 10 templates (home, single, archive, etc.) |
| Includes | `_includes/` | 59 components (34 schema, 25 UI) |
| Styles | `assets/css/main.scss` | Heavily customized theme |
| Tests | `tests/` | unit/, e2e/, performance/ |
| Utils | `utils/` | analysis/, plotting/, scripts/ |

### Collections

| Collection | Purpose |
|------------|---------|
| `_posts/` | Blog posts (YYYY-MM-DD-title.md) |
| `_projects/` | Portfolio items |
| `_reports/` | Technical reports |
| `_work/` | Work-in-progress |

## Front Matter

**Blog post:**
```yaml
---
layout: single
title: "Title"
date: YYYY-MM-DD
categories: [category]
tags: [tag1, tag2]
schema_type: tech-article  # Optional: tech-article, analysis-article, how-to
---
```

**Page:**
```yaml
---
layout: single
title: "Title"
permalink: /url/
author_profile: true
header:
  image: /assets/images/cover.png
---
```

## Important Notes

1. **Testing:** Run `npm run test:all` before pushing
2. **Accessibility:** WCAG 2.1 AA compliant - test with `npm run test:e2e`
3. **CSS:** 110+ `!important` declarations override theme (intentional)
4. **Schema:** Validate changes with [Google Rich Results Test](https://search.google.com/test/rich-results)
5. **Liquid:** Wrap `{{...}}` in `{% raw %}...{% endraw %}`
6. **Ruby warnings:** Suppressed via `RUBYOPT="-W0"` in npm scripts

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/ARCHITECTURE-DATA-FLOWS.md](docs/ARCHITECTURE-DATA-FLOWS.md) | Architecture deep dive |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Change history |
| [docs/schema/](docs/schema/) | Schema.org guides |
| [docs/setup/](docs/setup/) | Local setup troubleshooting |

---
**Last Updated:** 2026-01-29
