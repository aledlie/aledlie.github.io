# Documentation Index

**Last Updated:** 2026-01-29

This directory contains all documentation for The Parlor (www.aledlie.com) Jekyll site.

## Quick Start

- **New to this project?** Start with `ARCHITECTURE-DATA-FLOWS.md` for system overview
- **Understanding the architecture?** See `ARCHITECTURE-DATA-FLOWS.md` for data flows and patterns
- **Setting up locally?** See `setup/` directory
- **Working with Schema.org?** See `schema/` directory

## Directory Structure

```
docs/
├── schema/                       # Schema.org implementation & SEO
│   ├── README.md                 # Schema quick reference & index
│   ├── IMPLEMENTATION-GUIDE.md   # How to implement schemas
│   ├── TESTING-AND-MONITORING.md # Testing and monitoring
│   ├── SITE-SCHEMA-ANALYSIS.md   # Complete site analysis
│   └── archives/                 # Historical documentation
├── setup/                        # Local development setup
├── CHANGELOG.md                  # Project change history
├── ARCHITECTURE-DATA-FLOWS.md    # System architecture overview
└── README.md                     # This file
```

---

## Schema.org Documentation

**Purpose:** Comprehensive Schema.org structured data implementation for SEO optimization

| File | Description |
|------|-------------|
| `schema/README.md` | **Start here** - Quick reference and index |
| `schema/IMPLEMENTATION-GUIDE.md` | How to implement and modify schemas |
| `schema/TESTING-AND-MONITORING.md` | Testing, validation, and Search Console monitoring |
| `schema/SITE-SCHEMA-ANALYSIS.md` | Complete analysis of site schema implementation |

### Schema Quick Reference

Add to blog post front matter:

```yaml
schema_type: TechArticle  # or AnalysisNewsArticle, HowTo
```

See `schema/README.md` for decision tree and examples.

---

## Setup Documentation

**Purpose:** Local development environment setup and troubleshooting

| File | Description |
|------|-------------|
| `setup/DOPPLER_SETUP.md` | Secrets management with Doppler |
| `setup/BUILD_ISSUE_RESOLUTION.md` | Common build issues and fixes |
| `setup/RUBY_3.4.4_COMPATIBILITY_ISSUE.md` | Ruby version compatibility notes |

---

## Top-Level Documentation

| File | Description |
|------|-------------|
| `CHANGELOG.md` | **Project change history** - all notable changes |
| `ARCHITECTURE-DATA-FLOWS.md` | Comprehensive architecture and data flow documentation |

---

## Related Documentation

- **Project Instructions:** `/CLAUDE.md` - Main project documentation for Claude Code
- **Build Tools:** `/utils/` - Utility scripts and tools
- **Test Documentation:** `/tests/` - Test suite documentation

---

## Documentation Standards

### File Naming

- Use `UPPER-CASE-WITH-HYPHENS.md` for guides and official docs
- Use `lowercase-with-hyphens-YYYY-MM-DD.md` for dated reports
- Keep filenames descriptive but concise

### Organization

- **schema/** - Schema.org, SEO, structured data
- **setup/** - Environment setup, tooling, configuration
- **archives/** - Historical documentation (not actively maintained)

### Maintenance

- Update this README when adding new documentation
- Move outdated docs to appropriate `archives/` directory
- Keep CHANGELOG.md current with changes

---

## Need Help?

1. **Understanding the architecture?** → `ARCHITECTURE-DATA-FLOWS.md`
2. **Schema.org questions?** → `schema/README.md` (start here) or `schema/IMPLEMENTATION-GUIDE.md`
3. **Build issues?** → `setup/BUILD_ISSUE_RESOLUTION.md`

---

**This documentation is for The Parlor (www.aledlie.com) - A Jekyll-based personal website**
