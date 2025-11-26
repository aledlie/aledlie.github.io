# Rollback Procedures for Architecture Refactoring

**Project:** The Parlor
**Version:** 1.0
**Last Updated:** 2025-11-11
**Purpose:** Step-by-step recovery procedures for failed changes

---

## Emergency Contact Information

**Before Rollback:**
1. STOP making changes
2. Document what went wrong
3. Assess severity
4. Choose appropriate rollback level
5. Execute rollback
6. Verify recovery
7. Document incident

**Recovery Time Objectives (RTO):**
- Level 1 (Single File): < 1 minute
- Level 2 (Single Commit): < 5 minutes
- Level 3 (Phase Rollback): < 10 minutes
- Level 4 (Full Rollback): < 15 minutes

---

## Rollback Decision Matrix

```
Severity Assessment:
│
├─ Site won't build?
│  └─ YES → Level 3 or 4
│
├─ Tests failing?
│  └─ YES → Check scope
│     ├─ All tests → Level 3
│     └─ Some tests → Level 1 or 2
│
├─ Visual changes unintended?
│  └─ YES → Level 1 or 2
│
└─ Minor issues?
   └─ Consider fix-forward instead
```

---

## Level 1: Single File Rollback

**When to Use:**
- One file changed, broke something
- Quick fix needed
- File not yet committed

**Time:** < 1 minute
**Risk:** Very Low
**Data Loss:** Uncommitted changes to that file only

### Procedure

```bash
# 1. Identify problematic file
# Example: _sass/custom/_overrides.scss

# 2. Check what changed
git diff _sass/custom/_overrides.scss

# 3. Rollback single file
git checkout HEAD -- _sass/custom/_overrides.scss

# 4. Verify
bundle exec jekyll build

# 5. If successful, continue work
# If not, escalate to Level 2
```

### Validation

```bash
# Site should build
bundle exec jekyll build

# Tests should pass
npm run test:all

# Verify locally
RUBYOPT="-W0" bundle exec jekyll serve
# Visit http://localhost:4000
```

---

## Level 2: Single Commit Rollback

**When to Use:**
- Last commit broke something
- Within 1-2 hours of commit
- Isolated change

**Time:** < 5 minutes
**Risk:** Low
**Data Loss:** Last commit only

### Procedure

```bash
# 1. Verify current state
git status
git log --oneline -5

# 2. Review what last commit changed
git show HEAD

# 3. Create safety checkpoint (optional but recommended)
git tag rollback-checkpoint-$(date +%Y%m%d-%H%M%S)

# 4. Choose rollback method:
#    Method A: Revert (creates new commit, safe for shared branches)
#    Method B: Reset (rewrites history, use for local branches only)

# METHOD A: Revert (RECOMMENDED for master branch)
git revert HEAD
# This creates a new commit that undoes the last commit
# Commit message: "Revert: [previous commit message]"

# METHOD B: Reset (ONLY for feature branches, not master)
git reset --hard HEAD~1
# This removes the last commit from history

# 5. If using Method B on shared branch, force push
git push --force origin refactor/architecture-simplification

# 6. Reinstall dependencies (if Gemfile/package.json changed)
bundle install
npm install

# 7. Verify build
bundle exec jekyll build

# 8. Run tests
npm run test:all
```

### Validation Checklist

- [ ] Site builds successfully
- [ ] All tests pass
- [ ] Site serves locally without errors
- [ ] Visual regression baseline matches
- [ ] git log shows expected history

### Re-apply Fix

After successful rollback:

```bash
# 1. Understand what went wrong
git show HEAD  # For revert
git show HEAD@{1}  # For reset

# 2. Create new branch for fix (optional)
git checkout -b fix/issue-description

# 3. Apply fix properly
# Make changes carefully

# 4. Test thoroughly
bundle exec jekyll build
npm run test:all
npm run test:visual

# 5. Commit fix
git add .
git commit -m "fix: [description of fix]

Previous attempt failed because [reason].
This fix addresses it by [solution]."

# 6. Merge back
git checkout refactor/architecture-simplification
git merge fix/issue-description
```

---

## Level 3: Phase Rollback

**When to Use:**
- Entire phase failed
- Multiple commits broken
- 1-3 days of work

**Time:** < 10 minutes
**Risk:** Medium
**Data Loss:** Entire phase (all commits in phase)

### Procedure

```bash
# 1. Identify phase start point
git tag | grep phase
# Or
git log --oneline --all --graph

# 2. Find phase start commit/tag
# Example: phase-2b-start

# 3. Create safety checkpoint
git tag rollback-phase-$(date +%Y%m%d-%H%M%S)

# 4. Review what will be lost
git log phase-2b-start..HEAD

# 5. Confirm rollback
read -p "This will lose all work from phase. Continue? (yes/no) " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 1
fi

# 6. Execute rollback
git reset --hard phase-2b-start

# 7. Force push (if on shared branch, coordinate with team first!)
# For feature branch:
git push --force origin refactor/architecture-simplification

# 8. Reinstall dependencies
bundle install
npm install

# 9. Clean build directories
rm -rf _site .jekyll-cache .sass-cache

# 10. Verify build
bundle exec jekyll build

# 11. Run full test suite
npm run test:all

# 12. Visual regression test
npm run test:visual
```

### Post-Rollback Analysis

```bash
# 1. Save lost commits for reference (before they're garbage collected)
git log rollback-phase-$(date +%Y%m%d-%H%M%S)..rollback-checkpoint-$(date +%Y%m%d-%H%M%S) > lost-commits.txt

# 2. Create incident report
cat > incident-phase-rollback-$(date +%Y%m%d).md <<EOF
# Phase Rollback Incident

**Date:** $(date)
**Phase:** Phase 2B
**Commits Lost:** [count]

## What Happened
[Description of failure]

## Why Rollback Was Needed
[Reason]

## What Was Lost
See lost-commits.txt for commit history

## Root Cause
[Analysis]

## Prevention
[How to prevent in future]

## Next Steps
[Plan to resume]
EOF

# 3. Review lost work
cat lost-commits.txt

# 4. Decide what to salvage
git show <specific-commit-hash> > salvageable-work.patch
```

### Resuming After Phase Rollback

```bash
# 1. Review what failed
cat incident-phase-rollback-*.md

# 2. Create detailed plan to retry
# - Break into smaller steps
# - Add more testing points
# - Document assumptions

# 3. Start fresh with lessons learned
git checkout -b retry-phase-2b

# 4. Apply salvaged work carefully
# Review salvageable-work.patch
# Apply selectively, test frequently
```

---

## Level 4: Full Rollback (Nuclear Option)

**When to Use:**
- Complete failure
- Site completely broken
- Unknown issues cascading
- Need to restart from scratch

**Time:** < 15 minutes
**Risk:** High (loses ALL refactoring work)
**Data Loss:** All work since refactoring started

### Pre-Rollback Checklist

**STOP! Before full rollback:**
- [ ] Have you tried Level 1, 2, or 3 rollback?
- [ ] Have you identified the root cause?
- [ ] Is the issue really unfixable?
- [ ] Have you consulted TROUBLESHOOTING_GUIDE.md?
- [ ] Is this truly the only option?

**If all YES, proceed. If any NO, try other options first.**

### Procedure

```bash
# 1. Confirm you're doing full rollback
echo "=========================================="
echo "FULL ROLLBACK - ALL WORK WILL BE LOST"
echo "=========================================="
read -p "Type 'CONFIRM-FULL-ROLLBACK' to proceed: " confirm
if [ "$confirm" != "CONFIRM-FULL-ROLLBACK" ]; then
    echo "Rollback cancelled. Good choice - try other levels first."
    exit 1
fi

# 2. Save current state for forensics
git bundle create refactoring-attempt-$(date +%Y%m%d).bundle --all
echo "Current state saved to: refactoring-attempt-$(date +%Y%m%d).bundle"

# 3. Document what went wrong
cat > full-rollback-incident-$(date +%Y%m%d).md <<EOF
# Full Rollback Incident

**Date:** $(date)
**Time Lost:** [estimate hours]
**Reason for Full Rollback:**

[Detailed description of why full rollback was needed]

## Timeline of Events
- [timestamp]: [what happened]
- [timestamp]: [what happened]
- ...

## What Was Attempted
1. [attempted fix]
2. [attempted fix]
3. ...

## Why Those Failed
[Analysis]

## Lessons Learned
[What we learned from this failure]

## Recovery Plan
[Plan to eventually retry, if applicable]
EOF

# 4. Execute full rollback
git reset --hard pre-refactor-snapshot-2025-11-11

# 5. Clean all caches
rm -rf _site .jekyll-cache .sass-cache node_modules vendor/bundle

# 6. Reinstall dependencies from scratch
bundle install
npm install

# 7. Verify original state works
bundle exec jekyll build
npm run test:all

# 8. Visual regression check (should match baseline)
npm run test:visual

# 9. Serve and manually verify
RUBYOPT="-W0" bundle exec jekyll serve
# Visit http://localhost:4000 and check major pages

# 10. If successful, update master (if needed)
git checkout master
git reset --hard pre-refactor-snapshot-2025-11-11
git push --force origin master  # CAUTION: Only if site is broken in production

# 11. Clean up refactoring branch
git branch -D refactor/architecture-simplification
git push origin --delete refactor/architecture-simplification
```

### Post-Rollback Validation

**Complete checklist before declaring rollback successful:**

- [ ] Jekyll builds without errors
- [ ] All tests pass
- [ ] Site serves locally
- [ ] Homepage loads correctly
- [ ] About page loads correctly
- [ ] Posts page loads correctly
- [ ] Individual post loads correctly
- [ ] Projects page loads correctly
- [ ] Navigation works
- [ ] Search works (if applicable)
- [ ] Analytics tracking works
- [ ] RSS feeds validate
- [ ] Mobile layout correct
- [ ] No console errors in browser
- [ ] Visual regression baseline matches

### Recovery Decision

After full rollback:

**Option 1: Abandon Refactoring**
```bash
# Accept current state
# Document why refactoring was abandoned
# Archive all documentation for future reference

mv documentation/refactoring documentation/refactoring-abandoned-$(date +%Y%m%d)
git add .
git commit -m "docs: Archive abandoned refactoring attempt"
```

**Option 2: Plan New Approach**
```bash
# Review what failed
cat full-rollback-incident-*.md

# Create new, safer plan
# - Smaller scope
# - More incremental steps
# - Better testing
# - Different approach

# Start planning phase again
# Don't rush into execution
```

**Option 3: Defer Refactoring**
```bash
# Table refactoring for now
# Keep documentation for future attempt
# Set reminder for 3-6 months

git tag refactoring-deferred-$(date +%Y%m%d)
```

---

## Rollback Testing (Phase 0)

**Test rollback procedures BEFORE refactoring:**

```bash
# 1. Create test branch
git checkout -b test-rollback

# 2. Make a fake breaking change
echo "// BREAK" >> assets/css/main.scss

# 3. Commit it
git add assets/css/main.scss
git commit -m "test: Breaking change for rollback test"

# 4. Practice Level 2 rollback
git revert HEAD

# 5. Verify it works
bundle exec jekyll build

# 6. Practice Level 4 rollback
git reset --hard pre-refactor-snapshot-2025-11-11

# 7. Verify it works
bundle exec jekyll build

# 8. Clean up test
git checkout master
git branch -D test-rollback

# 9. Document success
echo "Rollback procedures tested successfully on $(date)" >> rollback-test-log.txt
```

---

## Rollback Communication Template

**If rollback affects production:**

```markdown
# INCIDENT: Refactoring Rollback

**Status:** RESOLVED
**Impact:** [Description]
**Duration:** [Start time] to [End time]
**Severity:** [Low/Medium/High/Critical]

## What Happened
[Brief description]

## Impact
- Site availability: [percentage]
- Features affected: [list]
- Users affected: [estimate]

## Timeline
- [time]: Issue detected
- [time]: Rollback initiated
- [time]: Rollback complete
- [time]: Verification complete
- [time]: Site fully restored

## Root Cause
[Analysis of what went wrong]

## Resolution
Rolled back to: [commit/tag]
Method: Level [1/2/3/4] rollback

## Prevention
[Steps to prevent recurrence]

## Follow-up Actions
- [ ] Incident report complete
- [ ] Team debriefing scheduled
- [ ] Documentation updated
- [ ] Refactoring plan revised (if applicable)
```

---

## Partial Rollback Strategies

### Rollback Only SCSS Changes

```bash
# Keep other changes, rollback only SCSS
git checkout HEAD~1 -- _sass/ assets/css/main.scss
bundle install
bundle exec jekyll build
npm run test:visual
```

### Rollback Only Dependencies

```bash
# Keep code changes, rollback only Gemfile/package.json
git checkout HEAD~1 -- Gemfile Gemfile.lock package.json package-lock.json
bundle install
npm install
```

### Rollback Only Specific Batch

```bash
# In Phase 2B, rollback just one consolidation batch
# Find the batch commit
git log --oneline | grep "Batch 3"

# Reset to before that batch
git reset --hard <commit-before-batch-3>

# Or revert just that batch
git revert <batch-3-commit-hash>
```

---

## Rollback Best Practices

### DO

✓ Create tags before major changes
✓ Test rollback procedure before refactoring
✓ Document why rollback was needed
✓ Learn from failures
✓ Verify completely after rollback
✓ Communicate with stakeholders
✓ Save forensic data (bundle, commits)

### DON'T

✗ Skip validation after rollback
✗ Force push to master without coordination
✗ Delete rollback tags immediately
✗ Repeat same mistake
✗ Rollback in panic without assessment
✗ Skip incident documentation
✗ Lose data without backup

---

## Rollback Checklist Template

```markdown
# Rollback Checklist

**Date:** YYYY-MM-DD
**Time:** HH:MM
**Rollback Level:** [1/2/3/4]
**Initiated By:** [Name]

## Pre-Rollback
- [ ] Assessed severity
- [ ] Tried lower-level rollback
- [ ] Created safety checkpoint/bundle
- [ ] Documented issue
- [ ] Chose appropriate rollback level

## Rollback Execution
- [ ] Executed rollback commands
- [ ] Reinstalled dependencies
- [ ] Cleaned build directories
- [ ] Verified build succeeds

## Validation
- [ ] All tests pass
- [ ] Site serves locally
- [ ] Visual regression matches baseline
- [ ] Manual testing complete
- [ ] No console errors
- [ ] Analytics working

## Post-Rollback
- [ ] Incident documented
- [ ] Stakeholders notified
- [ ] Root cause identified
- [ ] Prevention plan created
- [ ] Recovery plan created (if applicable)

## Sign-off
Rollback validated by: _______________
Date/Time: _______________
```

---

## Appendix: Git Reflog Rescue

**If you accidentally lost commits:**

```bash
# Git keeps history in reflog for ~30 days
git reflog

# Find your lost commit
# Look for your commit message or recognize the changes

# Example output:
# abc1234 HEAD@{0}: reset: moving to HEAD~1
# def5678 HEAD@{1}: commit: Your lost commit
# ...

# Recover lost commit
git cherry-pick def5678

# Or create branch from it
git branch recovered-work def5678

# Or just look at it
git show def5678
```

---

**Version:** 1.0
**Last Updated:** 2025-11-11
**Next Review:** After Phase 0 (rollback test)
**Critical:** Test these procedures in Phase 0 before refactoring!
