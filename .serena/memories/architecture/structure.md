# Directory Structure

## Content
- `_posts/` — blog posts
- `_projects/` — portfolio items
- `_reports/` — technical reports
- `_work/` — WIP content
- `_drafts/` — unpublished drafts

## Theme/UI
- `_layouts/` — 10 Jekyll layout templates
- `_includes/` — 46 components (13 schema.org, 33 UI)
- `_sass/` — SCSS partials
- `assets/css/main.scss` — stylesheet entry point
- `assets/` — images, JS, fonts

## Config/Build
- `_config.yml` — main Jekyll config
- `config/` — stylelint, prettier, playwright configs
- `Gemfile` — Ruby dependencies
- `package.json` — Node dependencies and scripts

## Tests
- `tests/unit/` — Jest tests
- `tests/e2e/` — Playwright tests (Chrome, Firefox, Safari, Mobile)
- `tests/performance/` — Lighthouse audits
- `tests/links/` — link checker

## Docs/Utils
- `docs/` — architecture docs, CHANGELOG, schema guides, repomix artifacts
- `utils/` — analysis, plotting, scripts
- `scripts/repomix/` — repomix pipeline, git analysis
- `SumedhSite/` — submodule (excluded from Jekyll build)
- `.serena/` — Serena project config
