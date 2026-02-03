# The Parlor

A Jekyll-based personal website with clean, minimal academic blog aesthetics.

**Live Site:** https://www.aledlie.com

## Quick Start

```bash
# Install dependencies
bundle install
npm install

# Serve locally
npm run serve
# Site available at http://localhost:4000

# Run all tests
npm run test:all
```

## Tech Stack

- **Framework:** Jekyll 4.3 with Minimal Mistakes theme
- **Styling:** Custom SCSS (heavily modified theme)
- **Deployment:** GitHub Pages via GitHub Actions
- **Testing:** Jest (unit), Playwright (E2E), Lighthouse (performance)

## Project Structure

```
_posts/          # Blog posts
_projects/       # Portfolio items
_reports/        # Technical reports
_work/           # Work-in-progress content
_layouts/        # Page templates
_includes/       # Reusable components (schema, analytics)
_sass/           # Theme style overrides
assets/          # CSS, JS, images
config/          # Tool configurations
tests/           # Test suites
utils/           # Utility scripts
docs/            # Documentation
```

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Development guide and commands |
| [docs/ARCHITECTURE-DATA-FLOWS.md](docs/ARCHITECTURE-DATA-FLOWS.md) | Detailed architecture and data flows |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Change history |
| [docs/schema/](docs/schema/) | Schema.org implementation |

## Key Features

- WCAG 2.1 Level AA accessible
- Schema.org structured data for SEO
- Google Analytics 4 + Tag Manager
- Comprehensive test coverage

## License

Personal project - All rights reserved.
