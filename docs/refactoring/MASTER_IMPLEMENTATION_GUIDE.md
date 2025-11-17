# Master Implementation Guide: The Parlor Architecture Refactoring

**Project:** The Parlor (www.aledlie.com)
**Version:** 2.0 (Modified 8-Phase Approach)
**Last Updated:** 2025-11-11
**Status:** Ready for Execution
**Estimated Duration:** 4 weeks
**Estimated Effort:** 26-30 hours

---

## Executive Summary

This master guide orchestrates the complete architecture refactoring of The Parlor personal website. It synthesizes findings from three comprehensive analyses (refactoring plan, codebase audit, testing strategy) into an actionable roadmap with safety measures, decision gates, and rollback procedures.

**Critical Finding:** The original 4-phase plan missed 38% of SCSS files and underestimated risks. This modified 8-phase approach adds critical safety phases and reduces failure probability from 50% to 15%.

**Success Probability:** 85% (with modified plan)
**Timeline:** 4 weeks (not 3)
**Effort:** 26-30 hours (not 15-20)

---

## Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Document Hierarchy](#document-hierarchy)
3. [Modified Phase Structure](#modified-phase-structure)
4. [Critical Success Factors](#critical-success-factors)
5. [Phase Navigation](#phase-navigation)
6. [Decision Gates](#decision-gates)
7. [Risk Management](#risk-management)
8. [Timeline Overview](#timeline-overview)
9. [Tools and Prerequisites](#tools-and-prerequisites)
10. [Emergency Contacts](#emergency-contacts)

---

## How to Use This Guide

### For First-Time Readers (30 minutes)

**Read in this order:**

1. **This document (MASTER_IMPLEMENTATION_GUIDE.md)** - Overview and navigation (15 min)
2. **EXECUTIVE_SUMMARY.md** - Quick context and red flags (10 min)
3. **DECISION_TREES.md** - Understand key decisions ahead (5 min)

### For Implementation Team

**Before starting any phase:**

1. Review this master guide
2. Check the specific phase section below
3. Consult DECISION_TREES.md for choice points
4. Reference ACCEPTANCE_CRITERIA.md for gate requirements
5. Keep TROUBLESHOOTING_GUIDE.md open during work
6. Update STAKEHOLDER_UPDATES.md after each phase

### For Project Stakeholders

**Essential reading:**

- EXECUTIVE_SUMMARY.md (10 min)
- STAKEHOLDER_UPDATES.md (ongoing)
- This guide's Timeline Overview section (5 min)

---

## Document Hierarchy

### Tier 1: Must Read Before Starting

| Document | Purpose | Time | Audience |
|----------|---------|------|----------|
| **MASTER_IMPLEMENTATION_GUIDE.md** (this) | Central orchestration | 30 min | All |
| **EXECUTIVE_SUMMARY.md** | Context and red flags | 10 min | All |
| **DECISION_TREES.md** | Decision support | 15 min | Implementers |
| **PREFLIGHT_CHECKLIST.md** | Phase 0 checklist | Reference | Implementers |

### Tier 2: Reference During Implementation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **ACCEPTANCE_CRITERIA.md** | Phase gate validation | Before/after each phase |
| **TROUBLESHOOTING_GUIDE.md** | Problem resolution | When issues occur |
| **ROLLBACK_PROCEDURES.md** | Recovery procedures | When rollback needed |
| **testing-strategy-2025-11-11.md** | Testing approach | During testing |

### Tier 3: Deep Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md** | Detailed analysis | For context on decisions |
| **architecture-simplification-plan-2025-11-11.md** | Original plan | Historical reference |
| **FAQ.md** | Common questions | As needed |
| **STAKEHOLDER_UPDATES.md** | Communication templates | After each phase |

---

## Modified Phase Structure

### Overview: 8 Phases (Not 4)

The original 4-phase plan has been enhanced to 8 phases for safety:

```
Original Plan          Modified Plan               Why Changed
--------------         ---------------             ------------
[None]          →      Phase 0: Pre-Flight         Safety baseline
Phase 1         →      Phase 1: Foundation         Enhanced with CI/CD
[None]          →      Phase 1.5: SCSS Analysis    CRITICAL - 38% files missed
Phase 2         →      Phase 2A: Theme Strategy    Split for safety
                →      Phase 2B: SCSS Consolidation Split for safety
                →      Phase 2C: Theme Fork        Split for safety
Phase 3         →      Phase 3: Deployment         Unchanged
Phase 4         →      Phase 4: Testing            Keep mobile testing
```

**Critical Addition:** Phase 1.5 is NON-NEGOTIABLE. Cannot proceed to Phase 2 without completing SCSS analysis.

---

## Phase 0: Pre-Flight (NEW - 2 hours, Week 0 Day 1)

### Purpose
Establish baseline metrics, safety branches, and rollback procedures before any changes.

### Tasks
1. **Measure Baseline Metrics** (30 min)
   - Build times (clean and incremental)
   - File sizes (CSS, site total)
   - Performance metrics (Lighthouse)
   - Test execution time

2. **Create Safety Branches** (15 min)
   - Tag: `pre-refactor-snapshot-2025-11-11`
   - Branch: `refactor/architecture-simplification`
   - Emergency rollback branch

3. **Set Up Visual Regression Testing** (45 min)
   - Install BackstopJS or configure Playwright visual tests
   - Capture baseline screenshots (15 pages x 3 viewports)
   - Document visual test process

4. **Test Rollback Procedure** (30 min)
   - Practice rollback on throwaway branch
   - Document exact steps
   - Verify restoration works

### Deliverables
- [ ] `baseline-metrics-2025-11-11.json` with all measurements
- [ ] Git tag and branches created
- [ ] Visual regression baseline captured (45 screenshots)
- [ ] `ROLLBACK_PROCEDURES.md` documented and tested

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 0

### Next Phase
Proceed to Phase 1 when all deliverables complete and acceptance criteria met.

**Reference Documents:**
- PREFLIGHT_CHECKLIST.md (detailed task list)
- testing-strategy-2025-11-11.md → Section 1
- ROLLBACK_PROCEDURES.md (create during this phase)

---

## Phase 1: Foundation (Enhanced - 3 hours, Week 1 Day 1-2)

### Purpose
Clean up dependencies, resolve submodule issues, update CI/CD, create foundational documentation.

### Tasks
1. **Resolve Submodule State** (15 min)
   - Document current state of `SumedhSite/sumedhjoshi.github.io`
   - Decision: commit, revert, or exclude from refactor

2. **Audit Dependencies** (45 min)
   - Create dependency audit document
   - Check each gem/npm package for actual usage
   - Document findings

3. **Remove Unused Dependencies** (1 hour)
   - Remove one at a time
   - Test after each removal
   - Commit individually
   - **DON'T REMOVE:** font-awesome-sass (required for profile icons)

4. **Update CI/CD** (30 min)
   - Add branch trigger for `refactor/*`
   - Ensure tests run on PR
   - Update workflow if needed

5. **Create Architecture Documentation** (30 min)
   - Document current architecture
   - Create initial ADRs
   - Set up documentation structure

### Deliverables
- [ ] Dependency audit complete
- [ ] Unused dependencies removed (with individual commits)
- [ ] CI/CD updated for refactor branch
- [ ] Architecture documentation created
- [ ] All tests still passing

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 1

### Decision Point
None - proceed to Phase 1.5

**Reference Documents:**
- REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md → Part 4, Task 1.1
- TROUBLESHOOTING_GUIDE.md → "Dependency Removal Issues"

---

## Phase 1.5: SCSS Analysis (NEW - 4 hours, Week 0 Day 2-3)

### Purpose
**CRITICAL PHASE:** Complete inventory and analysis of ALL 13+ SCSS files before consolidation.

### Why This Phase is Non-Negotiable
- Original plan identified only 8 SCSS files
- Actual codebase has 13 files (38% unaccounted for)
- 5 missing files: `_base.scss`, `_buttons.scss`, `_footer.scss`, `_forms.scss`, `_sidebar.scss`
- Duplicate files exist (`_footer.scss`, `_sidebar.scss`)
- Cannot consolidate without understanding dependencies

### Tasks
1. **Complete SCSS File Inventory** (1 hour)
   - List all `.scss` files in `_sass/`
   - Count lines in each file
   - Identify imports in each file
   - Check what's imported in `main.scss`

2. **Identify SCSS Duplicates** (1 hour)
   - Compare `_footer.scss` vs `minimal-mistakes/_footer.scss`
   - Compare `_sidebar.scss` vs `minimal-mistakes/_sidebar.scss`
   - Determine which are used
   - Document differences

3. **Create SCSS Dependency Map** (1 hour)
   - Visual diagram of import hierarchy
   - Identify circular dependencies
   - Document override patterns
   - Map theme dependencies

4. **Build Detailed Consolidation Plan** (1 hour)
   - Decide which files merge where
   - Define exact import order
   - Create batch consolidation plan
   - Document rationale

### Deliverables
- [ ] Complete SCSS inventory (all 13+ files documented)
- [ ] Duplicate file analysis complete
- [ ] SCSS dependency map created
- [ ] Detailed consolidation plan in `PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md`

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 1.5

### Decision Gate: BLOCKING
**Cannot proceed to Phase 2A without completing this phase.**

If Phase 1.5 reveals:
- More than 15 SCSS files → Re-estimate Phase 2 timeline
- Complex circular dependencies → Consider alternative approach
- Heavy theme coupling → Reconsider fork vs consolidate strategy

**Reference Documents:**
- PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md (fill this out)
- REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md → Phase 1.5 section
- DECISION_TREES.md → "SCSS Consolidation Strategy"

---

## Phase 2A: Theme Strategy (Enhanced - 4 hours, Week 1 Day 3-4)

### Purpose
Analyze theme dependencies and make informed decision: fork theme OR consolidate overrides.

### Tasks
1. **Theme Dependency Analysis** (2 hours)
   - Analyze layout dependencies
   - Check include usage
   - Identify variable dependencies
   - Count theme vs custom files

2. **Make Theme Strategy Decision** (1 hour)
   - Use decision tree in DECISION_TREES.md
   - Document decision in ADR
   - Get stakeholder approval if needed

3. **Create Implementation Plan** (1 hour)
   - If forking: list files to copy, update plan
   - If consolidating: define override strategy
   - Estimate effort for chosen approach
   - Update timeline if needed

### Deliverables
- [ ] Theme dependency analysis complete
- [ ] Decision documented in ADR-001-theme-strategy.md
- [ ] Implementation plan created
- [ ] Stakeholder approval obtained (if required)

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 2A

### Decision Point: CRITICAL
Use DECISION_TREES.md → "Theme Strategy Decision"

**If <10 theme includes used:** → Fork (proceed to Phase 2B then 2C)
**If >20 theme includes used:** → Consolidate (proceed to Phase 2B only)
**If unclear:** → Defer decision, do more analysis

**Reference Documents:**
- DECISION_TREES.md → Theme Strategy
- REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md → Phase 2A section

---

## Phase 2B: SCSS Consolidation (MODIFIED - 6 hours, Week 2-3)

### Purpose
Execute SCSS consolidation plan from Phase 1.5 in incremental batches with testing after each change.

### Critical Requirements
- Work in SMALL batches (5 batches planned)
- Test after EACH batch
- Visual regression test after EACH batch
- Commit after EACH successful batch
- NEVER consolidate multiple files at once

### Tasks (5 Batches)

**Batch 1: Utilities** (1 hour)
- Consolidate `site.scss` → `custom/_utilities.scss`
- Build, test, visual regression, commit

**Batch 2: Variables & Mixins** (1.5 hours)
- Consolidate `variables.scss` → `custom/_variables.scss`
- Consolidate `mixins.scss` → merge into `custom/_variables.scss`
- Build, test, visual regression, commit

**Batch 3: Components** (1.5 hours)
- Consolidate `elements.scss` → `custom/_components.scss`
- Consolidate `_buttons.scss` → `custom/_components.scss`
- Build, test, visual regression, commit

**Batch 4: Syntax** (1 hour)
- Consolidate `coderay.scss` → `custom/_syntax.scss`
- Build, test, visual regression, commit

**Batch 5: Layout Overrides** (2 hours)
- Consolidate `page.scss` → `custom/_overrides.scss`
- Consolidate `typography.scss` → `custom/_overrides.scss`
- Handle duplicate files (_footer.scss, _sidebar.scss)
- Optimize main.scss imports
- Build, test, visual regression, commit

### After Each Batch
```bash
# 1. Build
bundle exec jekyll build

# 2. Compare CSS output
diff _site/assets/css/main.css _site.backup/assets/css/main.css

# 3. Visual regression test
npm run test:visual

# 4. Run full test suite
npm run test:all

# 5. If all pass, commit
git add .
git commit -m "refactor(scss): Consolidate batch X - [description]

- Moved [files] into [new location]
- Verified CSS output unchanged
- Visual regression tests pass
- All tests pass"

# 6. Backup new state
rm -rf _site.backup
cp -r _site _site.backup
```

### Deliverables
- [ ] All 5 batches complete
- [ ] CSS output verified unchanged
- [ ] Visual regression tests passing
- [ ] All tests passing
- [ ] main.scss optimized (<100 lines)

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 2B

### Risk Level: HIGH
If visual regression tests fail:
- STOP immediately
- Review diff images
- Determine if change is intentional or bug
- If bug: revert batch and fix
- If intentional: update baseline and document

**Reference Documents:**
- testing-strategy-2025-11-11.md → Phase 2B Testing
- TROUBLESHOOTING_GUIDE.md → "Visual Regression Failures"
- ROLLBACK_PROCEDURES.md → "Single Batch Rollback"

---

## Phase 2C: Theme Fork (NEW - 4 hours if applicable, Week 3 Day 1-2)

### Purpose
Execute theme fork if chosen in Phase 2A. Skip this phase if consolidation chosen.

### Prerequisites
- Phase 2A decision: Fork chosen
- Theme dependency analysis complete
- File copy list prepared

### Tasks
1. **Fork Theme Files** (1 hour)
   - Copy theme to `_sass/theme/`
   - Preserve directory structure
   - Update file references

2. **Update Configuration** (30 min)
   - Remove `remote_theme` from `_config.yml`
   - Remove `minimal-mistakes-jekyll` from Gemfile
   - Update import paths

3. **Test Build** (30 min)
   - Build locally
   - Deploy to staging (Vercel preview)
   - Test on GitHub Pages (via PR)

4. **Visual Verification** (2 hours)
   - Compare all pages against production
   - Check responsive behavior (3 viewports)
   - Verify interactive elements
   - Test search functionality

### Deliverables
- [ ] Theme files forked to `_sass/theme/`
- [ ] Configuration updated
- [ ] Build succeeds locally and on both platforms
- [ ] Visual parity confirmed (all screenshots match)
- [ ] No missing includes or layouts

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 2C

### Risk Level: HIGH
**Rollback trigger:** If GitHub Pages build fails or visual tests fail

**Reference Documents:**
- DECISION_TREES.md → Theme Fork Procedure
- TROUBLESHOOTING_GUIDE.md → "Theme Fork Issues"
- ROLLBACK_PROCEDURES.md → "Theme Fork Rollback"

---

## Phase 3: Deployment Simplification (AS PLANNED - 2-3 hours, Week 3 Day 3-4)

### Purpose
Choose primary deployment target, simplify configuration, document strategy.

### Tasks
1. **Identify Current Primary Deployment** (30 min)
   - Check DNS: where does www.aledlie.com point?
   - Review recent deployment activity
   - Check analytics for traffic source

2. **Choose Primary Deployment** (1 hour)
   - Use decision tree in DECISION_TREES.md
   - Document decision in ADR
   - Plan migration if needed

3. **Simplify Configuration** (1 hour)
   - Update vercel.json or .github/workflows as needed
   - Remove duplicate configs
   - Streamline build commands

4. **Document Deployment Strategy** (30 min)
   - Document deployment process
   - Create deployment checklist
   - Document rollback for deployments

### Deliverables
- [ ] Primary deployment identified and documented
- [ ] Configuration simplified
- [ ] Deployment strategy documented
- [ ] Deployment checklist created

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 3

### Decision Point
Use DECISION_TREES.md → "Deployment Target Selection"

**Reference Documents:**
- DECISION_TREES.md → Deployment decisions
- STAKEHOLDER_UPDATES.md → Deployment change template

---

## Phase 4: Testing Consolidation (MODIFIED - 4 hours, Week 4 Day 1-2)

### Purpose
Consolidate testing infrastructure while maintaining coverage.

### Key Modifications from Original Plan
- **Keep Mobile Chrome** (most common mobile browser)
- Run parallel tests for validation period
- Add coverage reporting
- Don't remove tests until new tests proven

### Tasks
1. **Set Up Parallel Testing** (1 hour)
   - Keep existing Lighthouse config
   - Add new consolidated config
   - Run both in parallel

2. **Reduce Browser Matrix** (1 hour)
   - Keep: Chromium, Firefox, Mobile Chrome
   - Remove: WebKit Desktop, Mobile Safari
   - Update Playwright config

3. **Add Coverage Reporting** (1 hour)
   - Install nyc
   - Configure coverage thresholds
   - Add to CI/CD

4. **Validation Period** (1 week)
   - Run both old and new tests
   - Compare results
   - Fix any discrepancies

5. **Remove Old Tests** (1 hour)
   - After validation period passes
   - Archive old configs
   - Update documentation

### Deliverables
- [ ] New consolidated tests running
- [ ] Coverage reporting added
- [ ] Both old and new tests agree (validation period)
- [ ] Old tests removed after validation
- [ ] CI/CD updated

### Acceptance Criteria
See ACCEPTANCE_CRITERIA.md → Phase 4

**Reference Documents:**
- testing-strategy-2025-11-11.md → Phase 4
- TROUBLESHOOTING_GUIDE.md → "Test Consolidation Issues"

---

## Critical Success Factors

### Must Do (Non-Negotiable)

1. **Complete Phase 0** - Baseline and safety measures
2. **Complete Phase 1.5** - SCSS analysis before consolidation
3. **Visual regression test after every SCSS change**
4. **Work on feature branch, never master**
5. **Test after every single change**
6. **Stop immediately if tests fail**
7. **Document all decisions in ADRs**

### Never Do (Guaranteed Failure)

1. **Skip Phase 1.5** - Will cause issues in Phase 2
2. **Consolidate multiple SCSS files at once** - Impossible to debug
3. **Remove dependencies without individual testing**
4. **Skip visual regression tests** - Only way to verify CSS
5. **Proceed if tests fail** - Fix or rollback first
6. **Commit directly to master during refactor**
7. **Rush through phases** - Take time to do it right

### Best Practices

1. **Commit frequently** with descriptive messages
2. **Update documentation** as you go
3. **Take breaks** between phases
4. **Ask for help** if stuck
5. **Review before proceeding** to next phase
6. **Keep stakeholders informed**
7. **Celebrate small wins**

---

## Decision Gates

Before proceeding to each phase, verify prerequisites are met.

### Phase 0 → Phase 1
- [ ] Baseline metrics recorded
- [ ] Safety branches created
- [ ] Visual regression baseline captured
- [ ] Rollback procedure tested
- [ ] Team approval obtained

### Phase 1 → Phase 1.5
- [ ] Phase 1 complete (all deliverables)
- [ ] All tests passing
- [ ] Dependencies cleaned up
- [ ] CI/CD updated

### Phase 1.5 → Phase 2A (CRITICAL GATE)
- [ ] All 13+ SCSS files documented
- [ ] Duplicate files identified and analyzed
- [ ] SCSS dependency map created
- [ ] Detailed consolidation plan approved
- [ ] **NO SURPRISES in SCSS inventory**

### Phase 2A → Phase 2B
- [ ] Theme strategy decided
- [ ] Decision documented in ADR
- [ ] Implementation plan created
- [ ] Stakeholder approval (if required)

### Phase 2B → Phase 2C or Phase 3
- [ ] All consolidation batches complete
- [ ] CSS output unchanged (verified with diff)
- [ ] Visual regression tests passing
- [ ] All tests passing
- [ ] Build time acceptable

### Phase 2C → Phase 3 (if forking)
- [ ] Theme forked successfully
- [ ] Site builds without theme gem
- [ ] Visual parity confirmed
- [ ] GitHub Pages deployment succeeds

### Phase 3 → Phase 4
- [ ] Primary deployment working
- [ ] Secondary deployment working
- [ ] Deployment strategy documented
- [ ] Rollback tested

### Phase 4 → Complete
- [ ] New tests covering same scenarios
- [ ] Old and new tests agree
- [ ] Coverage maintained or improved
- [ ] CI/CD working

**Full gate checklist:** See ACCEPTANCE_CRITERIA.md

---

## Risk Management

### Risk Levels by Phase

| Phase | Risk Level | Primary Risks | Mitigation |
|-------|------------|---------------|------------|
| Phase 0 | Low | None (preparation only) | N/A |
| Phase 1 | Low | Dependency issues | Test each individually |
| Phase 1.5 | Low | Incomplete analysis | Thorough inventory |
| Phase 2A | Medium | Wrong strategy chosen | Use decision tree |
| Phase 2B | **HIGH** | CSS breaks, visual changes | Incremental batches, visual tests |
| Phase 2C | **HIGH** | Theme fork fails | Staging tests, rollback ready |
| Phase 3 | Medium | Deployment breaks | Test on staging first |
| Phase 4 | Medium | Test coverage regression | Parallel testing period |

### High Risk Indicators

Watch for these signs during implementation:

- Tests failing after changes
- CSS output changed unexpectedly
- Visual regression tests showing differences
- Build taking significantly longer (>20% increase)
- Analytics stopped working
- Search functionality broken
- Mobile layout issues
- Console errors in browser
- Build failures on CI/CD

### Emergency Response

If any high-risk indicator occurs:

1. **STOP immediately** - Don't make more changes
2. **Assess severity** - Is site broken or just test failure?
3. **Check TROUBLESHOOTING_GUIDE.md** for known issues
4. **Execute rollback if needed** (see ROLLBACK_PROCEDURES.md)
5. **Document what happened** in incident log
6. **Fix root cause** before continuing
7. **Update documentation** to prevent recurrence

---

## Timeline Overview

### Week 0: Preparation (8 hours)
- **Day 1:** Phase 0 - Pre-Flight (2 hours)
- **Day 2-3:** Phase 1.5 - SCSS Analysis (4 hours)
- **Day 4:** Review and team approval (2 hours)

### Week 1: Foundation (9 hours)
- **Day 1-2:** Phase 1 - Foundation (3 hours)
- **Day 3:** Phase 2A - Theme Strategy (4 hours)
- **Day 4-5:** Buffer and review (2 hours)

### Week 2-3: SCSS Work (13 hours)
- **Week 2 Day 1-2:** Phase 2B Batches 1-2 (3 hours)
- **Week 2 Day 3:** Phase 2B Batch 3 (3 hours)
- **Week 2 Day 4:** Phase 2B Batches 4-5 (4 hours)
- **Week 2 Day 5:** Visual verification (1 hour)
- **Week 3 Day 1-2:** Phase 2C - Theme fork if needed (4 hours)
- **Week 3 Day 3:** Buffer and testing (2 hours)

### Week 4: Deployment and Testing (7 hours)
- **Day 1-2:** Phase 3 - Deployment (3 hours)
- **Day 3-4:** Phase 4 - Testing (4 hours)
- **Day 5:** Final verification and documentation (2 hours)

**Total: 26-30 hours over 4 weeks**

### Realistic Scheduling

**Full-time equivalent:** 1 week
**Part-time (10 hrs/week):** 3 weeks
**Part-time (5 hrs/week):** 6 weeks

**Recommended approach:** 2-3 hours per session, 2-3 sessions per week

---

## Tools and Prerequisites

### Required Tools

**Must install before starting:**
- Ruby 3.4.4
- Bundler
- Node.js / npm
- Git
- Jekyll
- BackstopJS or Playwright visual testing

**Install commands:**
```bash
# Visual regression testing
npm install --save-dev backstopjs
# OR use existing Playwright setup

# Coverage reporting
npm install --save-dev nyc

# Verify installations
ruby --version
bundle --version
node --version
npm --version
git --version
```

### Required Access

- [ ] Write access to GitHub repository
- [ ] Access to Vercel deployment (if applicable)
- [ ] Access to Google Analytics (for verification)
- [ ] Time dedicated for 4 weeks (26-30 hours total)

### Recommended Environment

**Development setup:**
- Separate branch for refactoring
- Local Jekyll server running
- Browser developer tools open
- Visual regression tool configured
- Terminal with build output visible

**Backup strategy:**
- Git tags for snapshots
- Backup branches for safety
- Built site backup (`_site.backup/`)
- CSS file backups for comparison

---

## Emergency Contacts

### Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| This Guide | Master orchestration | `documentation/refactoring/MASTER_IMPLEMENTATION_GUIDE.md` |
| Troubleshooting | Problem resolution | `documentation/refactoring/TROUBLESHOOTING_GUIDE.md` |
| Rollback | Emergency recovery | `documentation/refactoring/ROLLBACK_PROCEDURES.md` |
| Decision Trees | Choice support | `documentation/refactoring/DECISION_TREES.md` |
| FAQ | Common questions | `documentation/refactoring/FAQ.md` |

### Quick Commands

```bash
# Emergency rollback
git reset --hard pre-refactor-snapshot-2025-11-11

# Check what changed
git status
git diff

# Visual regression test
npm run test:visual

# Full test suite
npm run test:all

# Build site
bundle exec jekyll build

# Serve locally
RUBYOPT="-W0" bundle exec jekyll serve
```

### Get Help

1. Check TROUBLESHOOTING_GUIDE.md first
2. Review FAQ.md for common questions
3. Check git history for recent changes
4. Review phase-specific documentation
5. Consult original analysis documents

---

## Success Metrics

### Must Pass (Blocking)
- [ ] All tests pass
- [ ] Visual regression tests pass (no unintended changes)
- [ ] CSS file size within 10% of baseline
- [ ] Build time not slower than baseline
- [ ] Analytics still tracking
- [ ] Search functionality works
- [ ] RSS feeds valid
- [ ] Site loads at primary URL
- [ ] Mobile responsive behavior preserved

### Should Pass (Important)
- [ ] SCSS file count reduced by 30%+
- [ ] main.scss reduced to <100 lines
- [ ] Dependencies reduced by 20%+
- [ ] Documentation complete and accurate
- [ ] Build time improved by 5%+

### Nice to Have (Aspirational)
- [ ] Build time improved by 15%+
- [ ] SCSS file count reduced by 50%+
- [ ] Zero `!important` flags in custom SCSS
- [ ] Automated visual regression in CI

---

## Final Checklist

Before declaring refactoring complete:

### Technical
- [ ] All 8 phases complete
- [ ] All tests passing
- [ ] Visual regression verified
- [ ] CSS output matches baseline (or changes documented)
- [ ] Build performance acceptable
- [ ] Both deployments working

### Documentation
- [ ] All ADRs created
- [ ] Architecture documentation complete
- [ ] Deployment strategy documented
- [ ] Testing strategy documented
- [ ] Rollback procedures verified

### Validation
- [ ] Stakeholders reviewed changes
- [ ] Site tested on production
- [ ] Analytics verified working
- [ ] Search verified working
- [ ] Mobile experience verified
- [ ] RSS feeds validated

### Cleanup
- [ ] Backup branches/tags created
- [ ] Feature branch merged to master
- [ ] Old files archived (not deleted immediately)
- [ ] Documentation PR created
- [ ] Lessons learned documented

---

## Next Steps

### To Start This Refactoring

1. **Read all Tier 1 documents** (1 hour)
2. **Get team approval** for 4-week timeline
3. **Schedule dedicated time** (26-30 hours over 4 weeks)
4. **Execute Phase 0** (Pre-Flight checklist)
5. **Review Phase 0 results** before proceeding

### First Commands

```bash
# 1. Create feature branch
git checkout -b refactor/architecture-simplification

# 2. Tag current state
git tag pre-refactor-snapshot-2025-11-11
git push origin pre-refactor-snapshot-2025-11-11

# 3. Start Phase 0
# Follow PREFLIGHT_CHECKLIST.md
```

---

## Appendix: Document Map

```
documentation/refactoring/
├── MASTER_IMPLEMENTATION_GUIDE.md          ← YOU ARE HERE
├── EXECUTIVE_SUMMARY.md                    (Read first)
├── DECISION_TREES.md                       (Reference during work)
├── ACCEPTANCE_CRITERIA.md                  (Gate validation)
├── PREFLIGHT_CHECKLIST.md                  (Phase 0 tasks)
├── TROUBLESHOOTING_GUIDE.md                (Problem resolution)
├── ROLLBACK_PROCEDURES.md                  (Emergency recovery)
├── FAQ.md                                  (Common questions)
├── STAKEHOLDER_UPDATES.md                  (Communication templates)
├── testing-strategy-2025-11-11.md          (Testing approach)
├── REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md (Deep reference)
├── architecture-simplification-plan-2025-11-11.md (Original plan)
├── PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md     (Fill during Phase 1.5)
├── QUICK_START_CHECKLIST.md                (Quick reference)
└── README.md                               (Directory overview)
```

---

**Version:** 2.0
**Last Updated:** 2025-11-11
**Next Review:** After Phase 0 completion
**Status:** Ready for execution

**Remember:** Slow and steady wins the race. Test everything. Skip nothing. Phase 1.5 is non-negotiable.
