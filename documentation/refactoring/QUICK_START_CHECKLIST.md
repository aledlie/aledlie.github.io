# Refactoring Quick Start Checklist

**Use this checklist to start the refactoring process safely.**

---

## Before You Begin

- [ ] Read EXECUTIVE_SUMMARY.md
- [ ] Read REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md (at least the red flags section)
- [ ] Understand this will take 4 weeks, not 3
- [ ] Have 26-30 hours of dedicated time available
- [ ] Team approves modified plan

---

## Phase 0: Pre-Flight (2 hours) - DO THIS FIRST

### 0.1: Measure Baseline (30 min)

```bash
# Create baseline metrics file
date > baseline-metrics.txt
echo "=== BUILD TIMES ===" >> baseline-metrics.txt
time bundle install 2>&1 | tee -a baseline-metrics.txt
time bundle exec jekyll build 2>&1 | tee -a baseline-metrics.txt
echo "=== FILE SIZES ===" >> baseline-metrics.txt
du -sh _site/ >> baseline-metrics.txt
wc -l assets/css/main.scss >> baseline-metrics.txt
ls -lh _site/assets/css/main.css >> baseline-metrics.txt
echo "=== NPM ===" >> baseline-metrics.txt
time npm install 2>&1 | tee -a baseline-metrics.txt
echo "=== TESTS ===" >> baseline-metrics.txt
time npm run test:all 2>&1 | tee -a baseline-metrics.txt
git add baseline-metrics.txt
git commit -m "docs: Establish baseline metrics before refactoring"
```

**Checklist:**
- [ ] baseline-metrics.txt created
- [ ] Build times recorded
- [ ] File sizes recorded
- [ ] Test times recorded
- [ ] Committed to git

---

### 0.2: Create Safety Branches (15 min)

```bash
# Tag current perfect state
git tag pre-refactor-snapshot-2025-11-11
git push origin pre-refactor-snapshot-2025-11-11

# Create refactoring work branch
git checkout -b refactor/architecture-simplification
git push -u origin refactor/architecture-simplification

# Create emergency rollback reference
git branch emergency-rollback-$(date +%Y%m%d)
```

**Checklist:**
- [ ] Tag created: pre-refactor-snapshot-2025-11-11
- [ ] Branch created: refactor/architecture-simplification
- [ ] Emergency branch created
- [ ] Currently on refactor branch
- [ ] Pushed to remote

---

### 0.3: Set Up Visual Regression Testing (45 min)

```bash
# Install BackstopJS
npm install --save-dev backstopjs

# Create config
cat > backstop.json <<'EOF'
{
  "id": "the-parlor-refactor",
  "viewports": [
    {"label": "phone", "width": 375, "height": 667},
    {"label": "tablet", "width": 768, "height": 1024},
    {"label": "desktop", "width": 1200, "height": 800}
  ],
  "scenarios": [
    {"label": "Homepage", "url": "http://localhost:4000"},
    {"label": "About", "url": "http://localhost:4000/about/"},
    {"label": "Posts", "url": "http://localhost:4000/posts/"},
    {"label": "Projects", "url": "http://localhost:4000/projects/"}
  ],
  "paths": {
    "bitmaps_reference": "tests/visual/reference",
    "bitmaps_test": "tests/visual/test",
    "html_report": "tests/visual/report"
  },
  "engine": "puppeteer",
  "engineOptions": {
    "args": ["--no-sandbox"]
  },
  "report": ["browser"],
  "debug": false
}
EOF

# Start Jekyll
npm run serve &
JEKYLL_PID=$!
sleep 10

# Create baseline screenshots
npx backstop reference

# Test that it works
npx backstop test

# Kill Jekyll
kill $JEKYLL_PID

# Commit config
git add backstop.json package.json package-lock.json
git commit -m "test: Add BackstopJS visual regression testing"
```

**Checklist:**
- [ ] BackstopJS installed
- [ ] backstop.json configured
- [ ] Baseline screenshots captured
- [ ] Test run successful
- [ ] Config committed

---

### 0.4: Document and Test Rollback (30 min)

**Create rollback procedure document:**

```bash
cat > documentation/architecture/rollback-procedure.md <<'EOF'
# Emergency Rollback Procedure

## If Build Breaks
```bash
git reset --hard HEAD~1
bundle install
bundle exec jekyll build
```

## If Site Looks Broken After Deploy
```bash
git revert HEAD
git push origin master
```

## Nuclear Option - Complete Restore
```bash
git checkout pre-refactor-snapshot-2025-11-11
git checkout -b emergency-restore-$(date +%Y%m%d)
bundle install
bundle exec jekyll build
npm run test:all
# If all passes, force push to master
```

## Rollback Testing Log
- Tested on: [DATE]
- Test branch: [BRANCH NAME]
- Result: [PASS/FAIL]
- Time to rollback: [TIME]
EOF

git add documentation/architecture/rollback-procedure.md
git commit -m "docs: Add emergency rollback procedure"
```

**Now test rollback on throwaway branch:**

```bash
# Create test branch
git checkout -b rollback-test

# Make a test change
echo "# TEST CHANGE" >> README.md
git add README.md
git commit -m "test: Rollback test change"

# Test rollback method 1
git reset --hard HEAD~1
# Verify README.md unchanged

# Test rollback method 2
echo "# TEST CHANGE 2" >> README.md
git add README.md
git commit -m "test: Rollback test change 2"
git revert HEAD
# Verify revert worked

# Clean up test branch
git checkout refactor/architecture-simplification
git branch -D rollback-test
```

**Checklist:**
- [ ] rollback-procedure.md created
- [ ] Rollback tested on throwaway branch
- [ ] git reset --hard works
- [ ] git revert works
- [ ] Back on refactor branch
- [ ] Documentation committed

---

## Phase 0 Complete?

**Verify all tasks done:**
- [ ] Baseline metrics recorded
- [ ] Safety branches created
- [ ] Visual regression testing set up
- [ ] Rollback procedure documented and tested
- [ ] Total time: ~2 hours

**If all checked:** Proceed to Phase 1

**If not all checked:** Complete missing tasks before proceeding

---

## Phase 1: Foundation (3 hours)

### 1.0: Resolve Submodule State (15 min)

```bash
# Check submodule status
cd SumedhSite/sumedhjoshi.github.io
git status
git diff

# Document current state
echo "Submodule status on $(date):" > ../../submodule-status.txt
git status >> ../../submodule-status.txt
git diff --stat >> ../../submodule-status.txt
cd ../..

# Decision: commit, revert, or exclude?
# [Make decision and execute]

git add submodule-status.txt
git commit -m "docs: Document submodule state before refactoring"
```

**Checklist:**
- [ ] Submodule status documented
- [ ] Decision made on how to handle
- [ ] Action taken (commit/revert/exclude)

---

### 1.1: Audit Dependencies (45 min)

**Create audit script:**

```bash
cat > scripts/dependency-audit.sh <<'EOF'
#!/bin/bash
echo "# Dependency Audit - $(date)" > dependency-audit.md
echo "" >> dependency-audit.md

echo "## Jekyll Gems" >> dependency-audit.md
echo "" >> dependency-audit.md

echo "### jekyll-coffeescript" >> dependency-audit.md
echo "- Usage in source: $(find . -name "*.coffee" -not -path "./node_modules/*" | wc -l) files" >> dependency-audit.md
echo "- Verdict: SAFE TO REMOVE if 0 files" >> dependency-audit.md
echo "" >> dependency-audit.md

echo "### octopress" >> dependency-audit.md
echo "- Usage in templates: $(grep -r "octopress" _includes/ _layouts/ 2>/dev/null | wc -l) references" >> dependency-audit.md
echo "- Verdict: INVESTIGATE if >0 references" >> dependency-audit.md
echo "" >> dependency-audit.md

echo "### font-awesome-sass" >> dependency-audit.md
echo "- Usage in config: $(grep -r "fa-" _config.yml | wc -l) icon references" >> dependency-audit.md
echo "- Verdict: REQUIRED if >0 references" >> dependency-audit.md
echo "" >> dependency-audit.md

echo "## NPM Packages" >> dependency-audit.md
echo "" >> dependency-audit.md

echo "### puppeteer" >> dependency-audit.md
echo "- Usage in tests: $(grep -r "puppeteer" tests/ 2>/dev/null | wc -l) references" >> dependency-audit.md
echo "- Verdict: SAFE TO REMOVE if 0 references and Playwright installed" >> dependency-audit.md
echo "" >> dependency-audit.md

echo "Audit complete. Review dependency-audit.md"
EOF

chmod +x scripts/dependency-audit.sh
./scripts/dependency-audit.sh
cat dependency-audit.md
```

**Based on audit, remove safe dependencies:**

```bash
# Example: Remove jekyll-coffeescript
sed -i '' "/jekyll-coffeescript/d" _config.yml
sed -i '' "/jekyll-coffeescript/d" Gemfile
bundle install
bundle exec jekyll build

# If successful
git add Gemfile Gemfile.lock _config.yml
git commit -m "refactor: Remove jekyll-coffeescript (unused)"

# Example: Remove puppeteer and chrome-launcher
npm uninstall puppeteer chrome-launcher
npm run test:all

# If successful
git add package.json package-lock.json
git commit -m "refactor: Remove puppeteer and chrome-launcher (Playwright covers)"
```

**Checklist:**
- [ ] dependency-audit.md created
- [ ] jekyll-coffeescript removed (if unused)
- [ ] octopress investigated
- [ ] bundler-graph removed
- [ ] puppeteer removed (if unused)
- [ ] chrome-launcher removed (if unused)
- [ ] Build succeeds after removals
- [ ] Tests pass after removals

---

### 1.2: Update CI/CD (30 min)

```bash
# Check if CI exists
ls -la .github/workflows/

# Update test.yml to include refactor branch
# Add these lines to test.yml:
# on:
#   push:
#     branches: [ master, refactor/* ]
#   pull_request:
#     branches: [ master ]

# Edit .github/workflows/test.yml
# (Manual edit required)

git add .github/workflows/test.yml
git commit -m "ci: Add refactor branch to CI triggers"
```

**Checklist:**
- [ ] CI workflow updated
- [ ] Refactor branch added to triggers
- [ ] Push to test CI works
- [ ] CI passes on refactor branch

---

### 1.3-1.4: Documentation (Remaining time)

**Create architecture docs:**

```bash
mkdir -p documentation/architecture/decisions

# Create ADR template
cat > documentation/architecture/decisions/000-template.md <<'EOF'
# [NUMBER]. [Title]

Date: [YYYY-MM-DD]
Status: [Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue we're seeing that is motivating this decision?]

## Decision
[What is the change we're proposing?]

## Consequences
[What becomes easier or more difficult because of this change?]
EOF
```

**Checklist:**
- [ ] documentation/architecture/ created
- [ ] ADR template created
- [ ] Initial documentation written

---

## Phase 1 Complete?

**Verify all tasks done:**
- [ ] Submodule resolved
- [ ] Dependencies audited and cleaned
- [ ] CI/CD updated
- [ ] Documentation started
- [ ] All tests still passing
- [ ] Total time: ~3 hours

**If all checked:** Proceed to Phase 1.5 (CRITICAL)

**If not all checked:** Complete missing tasks

---

## Phase 1.5: SCSS Analysis (4 hours) - CRITICAL

**This phase is NON-NEGOTIABLE.**

### Use the Template

Open and complete: `documentation/refactoring/PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md`

**Quick checklist:**
- [ ] Task 1.5.1: Complete SCSS inventory (all 13+ files)
- [ ] Task 1.5.2: Identify duplicates (_footer, _sidebar)
- [ ] Task 1.5.3: Create dependency map
- [ ] Task 1.5.4: Build detailed consolidation plan
- [ ] New directory structure designed
- [ ] New main.scss import order specified
- [ ] Risk assessment complete
- [ ] Total time: ~4 hours

**DO NOT proceed to Phase 2A without completing Phase 1.5.**

---

## Phase 1.5 Complete?

**Verify:**
- [ ] PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md filled out
- [ ] All 13+ files documented
- [ ] Duplicates identified
- [ ] Consolidation plan detailed
- [ ] Team reviewed analysis

**If all checked:** Proceed to Phase 2A

**If not checked:** Complete Phase 1.5 first

---

## Decision Gate: Phase 2A

**Before starting Phase 2A, answer:**

1. **Do we fork Minimal Mistakes or consolidate overrides?**
   - Based on Phase 1.5 analysis
   - [ ] Decision made
   - [ ] Decision documented

2. **Are we confident in the SCSS consolidation plan?**
   - [ ] All files accounted for
   - [ ] Import order understood
   - [ ] Risks mitigated

3. **Do we have time for Phase 2 (10 hours)?**
   - [ ] Dedicated time scheduled
   - [ ] Can work without interruption

**If all yes:** Proceed to Phase 2A

**If any no:** Address concerns first

---

## Troubleshooting

### Build Fails After Dependency Removal

```bash
# Restore previous state
git reset --hard HEAD~1
bundle install
npm install

# Try removing dependencies one at a time instead
```

### Visual Regression Test Fails

```bash
# Update baseline if change is intentional
npx backstop approve

# Or investigate what changed
open tests/visual/report/html_report/index.html
```

### Can't Commit - Submodule Issues

```bash
# Reset submodule to clean state
git submodule update --init --recursive
```

---

## Time Tracking

**Record actual time spent:**

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| 0.1: Baseline | 30 min | [FILL] | [FILL] |
| 0.2: Branches | 15 min | [FILL] | [FILL] |
| 0.3: Visual tests | 45 min | [FILL] | [FILL] |
| 0.4: Rollback | 30 min | [FILL] | [FILL] |
| 1.0: Submodule | 15 min | [FILL] | [FILL] |
| 1.1: Dependencies | 45 min | [FILL] | [FILL] |
| 1.2: CI/CD | 30 min | [FILL] | [FILL] |
| 1.3-1.4: Docs | 90 min | [FILL] | [FILL] |
| 1.5: SCSS Analysis | 4 hours | [FILL] | [FILL] |

**Total actual time:** [FILL]

---

## Next Steps After Phase 1.5

1. Review Phase 1.5 analysis with team
2. Make theme strategy decision (fork vs consolidate)
3. Proceed to Phase 2A with confidence
4. Follow incremental SCSS consolidation plan
5. Test after EVERY change

---

## Emergency Stop

**If at any point you need to stop:**

```bash
# Commit current work
git add .
git commit -m "wip: Pausing refactoring at [PHASE]"
git push origin refactor/architecture-simplification

# Document stopping point
echo "Stopped at: [PHASE]" >> refactoring-progress.txt
echo "Reason: [WHY]" >> refactoring-progress.txt
echo "Resume by: [NEXT STEPS]" >> refactoring-progress.txt
git add refactoring-progress.txt
git commit -m "docs: Document refactoring pause point"
git push
```

**To resume later:**
```bash
git checkout refactor/architecture-simplification
cat refactoring-progress.txt
# Continue from documented stopping point
```

---

**Good luck! Take it slow, test everything, and don't skip Phase 1.5.**
