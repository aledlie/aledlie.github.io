# Repository Cleanup Script Documentation

**Script:** `utils/cleanup-repository.sh`
**Created:** 2025-11-17
**Purpose:** Remove irrelevant files and directories based on data architecture analysis

## Overview

This script automates the repository cleanup process identified during a comprehensive data architecture review. It safely removes ~85MB+ of bloat while preserving all functional components of the Jekyll site.

## What It Does

### CRITICAL Cleanup Tasks

1. **Remove Python Virtual Environments (82MB)**
   - `personal_site/` - Old Python venv (~40MB)
   - `utils/numpy/` - Unused Python environment (~42MB)
   - **Rationale:** Virtual environments should not be in repository

2. **Remove .DS_Store Files**
   - All macOS system files
   - **Rationale:** Already in `.gitignore`, OS-specific artifacts

3. **Remove Repomix Output Files (Hundreds of files)**
   - Deletes all nested `repomix-output.xml` files
   - **Keeps:** Root `/repomix-output.xml` (41MB reference file)
   - **Rationale:** Build artifacts scattered throughout directories

### HIGH PRIORITY Cleanup Tasks

4. **Remove Redundant Content Directories (~1.4MB)**
   - `reports/` (988K) - Duplicate of `_reports/` collection
   - `schemas-static/` (196K) - Unused static JSON schemas
   - `results/` (132K) - Old schema analysis results superseded by `docs/schema/`
   - `drafts/` (120K) - Already in `.gitignore`

## Usage

### Basic Usage

```bash
# Run from repository root
./utils/cleanup-repository.sh
```

### Step-by-Step Process

The script follows this workflow:

1. **Confirmation Prompt**
   - Shows what will be removed with sizes
   - Requires explicit "yes" to proceed
   - Safe to cancel at this point

2. **Cleanup Execution**
   - Step 1: Remove Python venvs
   - Step 2: Remove .DS_Store files
   - Step 3: Remove repomix files (keep root)
   - Step 4: Remove redundant directories

3. **Verification**
   - Checks all critical architecture components
   - Verifies Jekyll structure intact

4. **Summary Report**
   - Shows what was removed
   - Reports final repository size
   - Lists preserved components

## Safety Features

### Error Handling
- `set -e` - Exits on any error
- `set -u` - Exits on undefined variables
- Checks for file/directory existence before removal

### Verification
The script verifies these critical components remain intact:
- `_config.yml` - Jekyll configuration
- `_includes/` - Template components (80+ files)
- `_layouts/` - Page templates (16 layouts)
- `_sass/` - SCSS partials
- `_posts/` - Blog posts collection
- `_reports/` - Reports collection
- `_work/` - Work collection
- `_projects/` - Projects collection
- `docs/` - Documentation
- `tests/` - Test suite
- `utils/` - Utility scripts
- `assets/` - Assets directory
- `vercel.json` - Deployment configuration
- `package.json` - Node dependencies

### Visual Feedback
- Color-coded output (green/yellow/red/blue)
- Progress indicators (✓ ✗ ⚠ →)
- Size calculations for removed items
- File counts where applicable

## Expected Results

### Before Cleanup
- Repository size: ~700MB+
- Root directories: 66+
- Contains: venvs, system files, duplicate content, build artifacts

### After Cleanup
- Repository size: ~616MB
- Root directories: ~60
- **Removed:** ~85MB+ of bloat
- **Preserved:** All functional Jekyll architecture

### Detailed Breakdown

| Category | Items Removed | Space Saved |
|----------|---------------|-------------|
| Python venvs | 2 directories | ~82MB |
| Repomix files | 100+ files | ~2MB |
| Content directories | 4 directories | ~1.4MB |
| System files | All .DS_Store | <1MB |
| **Total** | **~110+ items** | **~85MB** |

## Post-Cleanup Steps

### 1. Review Changes
```bash
git status
```

### 2. Update .gitignore (Recommended)
Add these entries to prevent reintroduction:

```gitignore
# Python virtual environments
personal_site/
utils/numpy/
*.venv/

# Already present - verify
.DS_Store
repomix-output.xml
drafts/
```

### 3. Test Build
```bash
# Local build test
RUBYOPT="-W0" bundle exec jekyll build

# Serve locally
RUBYOPT="-W0" bundle exec jekyll serve
```

### 4. Run Test Suite
```bash
# Run all tests
npm run test:all

# Individual test suites
npm run test              # Jest unit tests
npm run test:e2e          # Playwright E2E tests
npm run test:performance  # Lighthouse performance tests
```

### 5. Commit Changes
```bash
git add -A
git commit -m "Clean up repository: remove venvs, build artifacts, and redundant directories

- Remove Python virtual environments (personal_site/, utils/numpy/)
- Remove all .DS_Store files
- Remove nested repomix-output.xml files (keep root)
- Remove redundant content directories (reports/, schemas-static/, results/, drafts/)

Space savings: ~85MB
Architecture verified: All core Jekyll components intact"
```

## Troubleshooting

### Script Fails to Run
```bash
# Make script executable
chmod +x /Users/alyshialedlie/code/PersonalSite/utils/cleanup-repository.sh

# Run from repository root
cd /Users/alyshialedlie/code/PersonalSite
./utils/cleanup-repository.sh
```

### "Already Removed" Messages
- Normal if cleanup was already performed
- Script is idempotent - safe to run multiple times
- Will skip items that don't exist

### Architecture Verification Fails
- Critical error - DO NOT PROCEED
- Indicates essential Jekyll files are missing
- Restore from backup or git
- Report issue before continuing

### Build Fails After Cleanup
The cleanup only removes non-functional files. If build fails:

1. Check Ruby version: `ruby --version` (requires 3.2.0+)
2. Check bundler: `bundle install`
3. Check dependencies: `npm install`
4. Review git diff: `git diff` to see what was removed

**Note:** Ruby version issues are unrelated to cleanup - see `docs/setup/RUBY_3.4.4_COMPATIBILITY_ISSUE.md`

## Data Architecture Alignment

This cleanup aligns with the documented data architecture:

### Content Flow (Preserved)
```
Markdown Files → Jekyll Build → Liquid Templates → HTML
     ↓                ↓              ↓              ↓
  _posts/         _config.yml    _layouts/      _site/
  _reports/       Collections    _includes/     (output)
  _work/          Front Matter   _sass/
```

### Removed Items Not in Architecture
- Python venvs - not part of Jekyll build
- `reports/` directory - superseded by `_reports/` collection
- `schemas-static/` - not used in Schema.org data flow
- `results/` - old analysis superseded by `docs/schema/`
- `drafts/` - already excluded via `.gitignore`

### Preserved Components (All Documented)
- Collections: `_posts/`, `_reports/`, `_work/`, `_projects/`
- Templates: `_layouts/`, `_includes/`
- Styles: `_sass/`, `assets/css/`
- Configuration: `_config.yml`, `vercel.json`, `package.json`
- Testing: `tests/` (unit, e2e, performance)
- Documentation: `docs/` (architecture, schema, setup, refactoring)
- Utilities: `utils/` (duplication finder, git reports, scripts)

## Related Documentation

- **Architecture Overview:** `docs/ARCHITECTURE-DATA-FLOWS.md`
- **Project Instructions:** `CLAUDE.md`
- **Refactoring Status:** `docs/REFACTORING_STATUS.md`
- **Schema Documentation:** `docs/schema/ENHANCED-SCHEMA-IMPLEMENTATION-GUIDE.md`
- **Testing Guide:** `docs/refactoring/TESTING-QUICKSTART.md`

## Maintenance

### When to Re-run

Run this script when you notice:
- `.DS_Store` files appearing in git status
- `repomix-output.xml` files in subdirectories
- Accidental creation of venvs in repo
- Build artifacts not being cleaned up

### Periodic Cleanup

Consider running quarterly to maintain repository hygiene:

```bash
# Quick cleanup check (dry-run concept)
./utils/cleanup-repository.sh
# Review what would be removed
# Confirm and proceed
```

### Extending the Script

To add new cleanup tasks:

1. Create a new function: `cleanup_your_task()`
2. Add to main execution in `main()`
3. Update summary and verification
4. Document in this file

Example:
```bash
cleanup_your_task() {
    print_header "Step X: Your Task Description"

    # Your cleanup logic

    print_success "Task completed"
}
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-17 | Initial release - cleanup based on data architecture analysis |

## Support

For issues or questions:
1. Check this documentation
2. Review `docs/ARCHITECTURE-DATA-FLOWS.md`
3. Check git history: `git log utils/cleanup-repository.sh`
4. Restore from backup if needed: `git checkout HEAD~1 -- .`

---

**Last Updated:** 2025-11-17
**Maintainer:** Data Architecture Review Process
**Status:** Production Ready
