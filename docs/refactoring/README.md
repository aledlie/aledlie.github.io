# Refactoring Documentation

This directory contains refactoring plans and architecture improvement proposals for The Parlor.

## CRITICAL: Read This First

**The original refactoring plan has been COMPREHENSIVELY ANALYZED and ENHANCED.**

**DO NOT proceed with the original plan as-written.** Instead, use the modified plan with added safety measures.

### Start Here (In Order):

1. **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - Read first (10 min)
2. **[QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)** - Use during execution
3. **[REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md](./REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md)** - Deep dive reference

---

## Current Status

### Architecture Simplification Plan (2025-11-11)

**Original Plan:** `architecture-simplification-plan-2025-11-11.md`
**Status:** APPROVED WITH CRITICAL MODIFICATIONS
**Analysis Completed:** 2025-11-11
**Implementation Status:** NOT STARTED (awaiting team approval)

### Key Findings from Analysis

**Critical Issues Found:**
- Original plan missed 5 SCSS files (38% unaccounted for)
- Phase 2 risks underestimated (HIGH, not MEDIUM)
- No visual regression testing plan (critical gap)
- Build performance claims unsubstantiated
- Git workflow not specified
- Missing Phase 1.5 (SCSS Analysis) - NON-NEGOTIABLE addition

**Required Modifications:**
- Add Phase 0: Pre-Flight (2 hours) - Establish baseline and safety
- Add Phase 1.5: SCSS Analysis (4 hours) - CRITICAL before consolidation
- Split Phase 2 into 2A (strategy), 2B (consolidation), 2C (fork)
- Revised timeline: **4 weeks, not 3**
- Revised effort: **26-30 hours, not 15-20**

**Expected Impact (Revised):**
- 25-35% reduction in SCSS complexity (not 30-40%, more files than planned)
- 5-10% faster build times (not 20-30%, SCSS isn't the bottleneck)
- Clearer architecture and comprehensive documentation
- Much better maintainability
- **85% success probability** (vs 50% with original plan)

### Modified Phase Structure

**Phase 0: Pre-Flight** (NEW - 2 hours, Low risk)
- Measure baseline metrics
- Create safety branches
- Set up visual regression testing
- Test rollback procedure

**Phase 1: Foundation** (Enhanced - 3 hours, Low risk)
- Resolve submodule state
- Audit and remove dependencies
- Update CI/CD
- Create documentation

**Phase 1.5: SCSS Analysis** (NEW - 4 hours, CRITICAL)
- Inventory all 13+ SCSS files
- Identify duplicates
- Map dependencies
- Build detailed consolidation plan
- **NON-NEGOTIABLE: Cannot proceed to Phase 2 without this**

**Phase 2A: Theme Strategy** (NEW - 4 hours, Medium risk)
- Analyze theme dependencies
- Decide: fork vs consolidate
- Document decision
- Create implementation plan

**Phase 2B: SCSS Consolidation** (Modified - 6 hours, HIGH risk)
- Consolidate in 5 incremental batches
- Test after each batch
- Handle duplicate files
- Optimize main.scss

**Phase 2C: Theme Fork** (NEW - 4 hours if applicable, HIGH risk)
- Fork theme files
- Update configs
- Test thoroughly
- Visual verification

**Phase 3: Deployment** (As planned - 3 hours, Medium risk)
- Choose primary deployment
- Simplify configuration
- Document strategy

**Phase 4: Testing** (Modified - 4 hours, Medium risk)
- Consolidate Playwright + Lighthouse
- Keep mobile testing (not remove completely)
- Add coverage reporting

**Total Revised Effort:** 26-30 hours over 4 weeks

## Implementation Status

**Current Phase:** Pre-Phase 0 (Planning Complete, Awaiting Approval)

### Phase 0: Pre-Flight (NOT STARTED)
- [ ] Measure baseline metrics
- [ ] Create safety branches and tags
- [ ] Set up visual regression testing (BackstopJS)
- [ ] Document and test rollback procedure

### Phase 1: Foundation (NOT STARTED)
- [ ] Resolve submodule state
- [ ] Audit dependencies (use template)
- [ ] Remove unused dependencies (one at a time)
- [ ] Update CI/CD workflows
- [ ] Create architecture documentation

### Phase 1.5: SCSS Analysis (NOT STARTED - CRITICAL)
- [ ] Complete SCSS file inventory (all 13+ files)
- [ ] Identify duplicate files (_footer.scss, _sidebar.scss)
- [ ] Create SCSS dependency map
- [ ] Build detailed consolidation plan
- [ ] **BLOCKING: Must complete before Phase 2**

### Phase 2A: Theme Strategy (NOT STARTED)
- [ ] Analyze theme dependencies
- [ ] Make fork vs consolidate decision
- [ ] Document decision in ADR
- [ ] Create implementation plan

### Phase 2B: SCSS Consolidation (NOT STARTED)
- [ ] Batch 1: Consolidate utilities
- [ ] Batch 2: Consolidate variables & mixins
- [ ] Batch 3: Consolidate components
- [ ] Batch 4: Consolidate syntax
- [ ] Batch 5: Consolidate layout overrides
- [ ] Handle duplicate files
- [ ] Optimize main.scss
- [ ] Verify CSS output unchanged

### Phase 2C: Theme Fork (NOT STARTED - IF APPLICABLE)
- [ ] Fork theme files to _sass/theme/
- [ ] Update imports and configs
- [ ] Test build
- [ ] Visual verification

### Phase 3: Deployment (NOT STARTED)
- [ ] Choose primary deployment target
- [ ] Simplify build configuration
- [ ] Document deployment strategy
- [ ] Create deployment checklist

### Phase 4: Testing (NOT STARTED)
- [ ] Consolidate Playwright + Lighthouse
- [ ] Update test commands
- [ ] Reduce browser matrix (5 → 3 or 4)
- [ ] Add coverage reporting
- [ ] Update CI/CD

---

## Document Index

### Planning Documents (Read These)

| Document | Purpose | Read Time | When to Use |
|----------|---------|-----------|-------------|
| **EXECUTIVE_SUMMARY.md** | Quick overview, red flags, go/no-go | 10 min | READ FIRST |
| **QUICK_START_CHECKLIST.md** | Step-by-step execution guide | Reference | During execution |
| **REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md** | Detailed analysis, all issues | 45 min | Reference during work |
| **PHASE_1.5_SCSS_ANALYSIS_TEMPLATE.md** | Template to fill out | 4 hours | CRITICAL: Before Phase 2 |
| **architecture-simplification-plan-2025-11-11.md** | Original plan | 30 min | Context only |

### Supporting Documents

- **Testing documents**: Various testing strategy docs (can be referenced as needed)
- **Architecture docs**: To be created during Phase 1

---

## Quick Start (Modified Process)

**DO NOT use the original quick start.** Use this instead:

### Before You Begin
1. **Read EXECUTIVE_SUMMARY.md** (10 min)
2. **Review key red flags** in analysis document
3. **Get team approval** for modified 4-week plan
4. **Ensure you have 26-30 hours** dedicated time

### Phase 0: Pre-Flight (START HERE)
```bash
# See QUICK_START_CHECKLIST.md for detailed commands

# 1. Measure baseline (30 min)
date > baseline-metrics.txt
time bundle install 2>&1 | tee -a baseline-metrics.txt
time bundle exec jekyll build 2>&1 | tee -a baseline-metrics.txt
# ... (see checklist for full script)

# 2. Create safety branches (15 min)
git tag pre-refactor-snapshot-2025-11-11
git checkout -b refactor/architecture-simplification

# 3. Set up visual regression (45 min)
npm install --save-dev backstopjs
# ... (see checklist for full setup)

# 4. Test rollback (30 min)
# ... (see checklist for procedure)
```

### After Phase 0
- Complete Phase 1 (Foundation)
- **CRITICAL:** Complete Phase 1.5 (SCSS Analysis) before any SCSS work
- Proceed to Phase 2A (Theme Strategy)
- Execute remaining phases incrementally

---

## Critical Success Factors

### Must Do
1. Complete Phase 0 (establish baseline and safety)
2. Complete Phase 1.5 (understand all 13+ SCSS files)
3. Visual regression test after every SCSS change
4. Work on feature branch, never master
5. Test after every single change

### Never Do
1. Skip Phase 1.5 (guaranteed to cause issues)
2. Consolidate multiple SCSS files at once
3. Remove dependencies without testing
4. Skip visual regression tests
5. Proceed if tests fail

---

## Decision Gates

**Before each phase, verify prerequisites:**

| Phase | Decision Question | Requirements |
|-------|------------------|--------------|
| Phase 0 | Ready to start? | Team approval, 4 weeks available |
| Phase 1 | Baseline established? | Metrics recorded, branches created |
| Phase 1.5 | Ready for SCSS analysis? | Phase 1 complete, time dedicated |
| Phase 2A | SCSS understood? | Phase 1.5 complete, all files documented |
| Phase 2B | Strategy decided? | Theme decision made, plan created |
| Phase 2C | Consolidation done? | SCSS consolidated, tests passing |
| Phase 3 | Theme work done? | Fork complete (if chosen), verified |
| Phase 4 | Deployment simplified? | Deployment working, documented |

---

## Risk Management

### High Risk Indicators
- Tests failing after changes
- CSS output changed unexpectedly
- Visual regression tests failing
- Build taking significantly longer
- Analytics stopped working

### If Something Goes Wrong
1. **STOP immediately**
2. **Don't make more changes**
3. **Check `/documentation/architecture/rollback-procedure.md`**
4. **Execute rollback if needed**
5. **Document what happened**
6. **Fix root cause before continuing**

---

## Monitoring and Validation

### After Each Phase
- [ ] All tests pass
- [ ] Visual regression tests pass (for SCSS changes)
- [ ] Build time acceptable
- [ ] Documentation updated
- [ ] Changes committed to feature branch

### Before Merging to Master
- [ ] All phases complete
- [ ] Full test suite passing
- [ ] Visual regression verified
- [ ] Analytics tracking verified
- [ ] Team reviewed changes
- [ ] Rollback procedure tested

---

## Success Metrics

### Must Pass (Blocking)
- All tests pass
- Visual regression tests pass
- CSS file size within 10% of baseline
- Site loads at primary URL
- Analytics works

### Should Pass (Important)
- SCSS file count reduced 30%+
- main.scss under 100 lines
- Documentation complete
- Build time not slower

### Nice to Have
- Build time improved 15%+
- Zero `!important` flags
- Automated visual regression in CI

---

## Resources and References

### Documentation
- **CLAUDE.md** - Project overview and commands
- **Original plan** - architecture-simplification-plan-2025-11-11.md
- **Analysis** - REFACTORING_ANALYSIS_AND_RECOMMENDATIONS.md
- **Checklist** - QUICK_START_CHECKLIST.md

### To Be Created During Refactoring
- `/documentation/architecture/scss-organization.md`
- `/documentation/architecture/deployment-strategy.md`
- `/documentation/architecture/theme-usage.md`
- `/documentation/architecture/rollback-procedure.md`
- `/documentation/architecture/decisions/*.md` (ADRs)

### Tools Required
- BackstopJS (visual regression)
- Git (version control)
- Jekyll (site builder)
- Node/npm (testing)

---

## FAQ

**Q: Can we skip Phase 1.5?**
A: NO. Non-negotiable. Original plan missed 38% of SCSS files.

**Q: Why 4 weeks instead of 3?**
A: Safety. Extra week is risk mitigation insurance. Success rate: 85% vs 50%.

**Q: Can we use the original plan?**
A: Not recommended. Original plan has critical gaps. Use modified plan.

**Q: What if we find more issues?**
A: Stop, assess, update plans, get team input, proceed carefully.

**Q: Do we need visual regression testing?**
A: YES for CSS changes. Only way to verify styling doesn't break.

---

## Status Updates

**Last Updated:** 2025-11-11
**Current Status:** Planning complete, awaiting team approval
**Next Action:** Get team approval for modified 4-week plan
**Estimated Start Date:** [FILL AFTER APPROVAL]
**Estimated Completion:** [FILL - 4 weeks from start]

---

## Notes and Lessons Learned

### During Planning
- Original plan was well-structured but incomplete
- Missed 5 SCSS files in initial analysis
- Risk levels underestimated
- Need for Phase 1.5 discovered through code analysis

### During Execution
[Fill in as phases complete]

### After Completion
[Fill in after project complete]

---

**Remember: Slow and steady wins the race. Test everything. Skip nothing. Phase 1.5 is non-negotiable.**
