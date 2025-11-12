# Decision Trees for Architecture Refactoring

**Project:** The Parlor
**Version:** 1.0
**Last Updated:** 2025-11-11
**Purpose:** Visual decision support for key refactoring choices

---

## How to Use This Document

Each decision tree follows this format:
1. **Decision Point:** The question to answer
2. **Inputs:** Information needed to decide
3. **Tree:** Visual flowchart of decision logic
4. **Outputs:** Recommended action
5. **Validation:** How to verify decision is correct

Use these trees at critical phase transitions to make informed choices.

---

## Table of Contents

1. [Go/No-Go Decision](#1-gono-go-decision)
2. [Theme Strategy Decision](#2-theme-strategy-decision)
3. [SCSS Consolidation Strategy](#3-scss-consolidation-strategy)
4. [Deployment Target Selection](#4-deployment-target-selection)
5. [Browser Matrix Decision](#5-browser-matrix-decision)
6. [Rollback Decision](#6-rollback-decision)
7. [Phase Continuation Decision](#7-phase-continuation-decision)

---

## 1. Go/No-Go Decision

**When:** Before starting Phase 0
**Decision:** Should we proceed with this refactoring?

### Inputs Required

- [ ] Team availability (26-30 hours over 4 weeks)
- [ ] Stakeholder approval
- [ ] Risk tolerance assessment
- [ ] Alternative options considered

### Decision Tree

```
START: Should we refactor?
│
├─ Is there dedicated time available (26-30 hours over 4 weeks)?
│  ├─ NO → STOP: Reschedule when time available
│  └─ YES → Continue
│
├─ Do we have stakeholder approval?
│  ├─ NO → STOP: Get approval first
│  └─ YES → Continue
│
├─ Is current site critically broken?
│  ├─ YES → Consider quick fixes instead
│  └─ NO → Continue
│
├─ Are we OK with 4-week timeline (not 3)?
│  ├─ NO → STOP: Timeline is non-negotiable for safety
│  └─ YES → Continue
│
├─ Can we accept 85% success probability?
│  ├─ NO → STOP: Risk too high, consider alternatives
│  └─ YES → Continue
│
├─ Have we read all Tier 1 documentation?
│  ├─ NO → STOP: Read first (1 hour investment)
│  └─ YES → Continue
│
└─ GO: Proceed to Phase 0
```

### Recommended Action

**GO if all conditions met:**
- Dedicated time available
- Stakeholder approval obtained
- Not critically broken (planned refactor)
- Accept 4-week timeline
- Accept 85% success probability
- Documentation reviewed

**NO-GO if any condition not met:**
- Defer until conditions met
- Document reasons for delay
- Set target date for re-evaluation

### Validation

After GO decision:
- Schedule kickoff meeting
- Block out time on calendar
- Create tracking task list
- Notify stakeholders of start date

---

## 2. Theme Strategy Decision

**When:** Phase 2A
**Decision:** Fork Minimal Mistakes theme OR consolidate overrides?

### Inputs Required

From Phase 1.5 analysis:
- [ ] Count of theme includes used
- [ ] Count of custom layouts vs theme layouts
- [ ] Complexity of overrides
- [ ] Future maintenance plans

### Decision Tree

```
START: Theme Strategy
│
├─ How many theme includes are actively used?
│  │
│  ├─ < 10 includes
│  │  └─ Recommendation: FORK THEME
│  │     Rationale: Light theme usage, forking gives full control
│  │
│  ├─ 10-20 includes
│  │  └─ Check: How many custom layouts exist?
│  │     │
│  │     ├─ > 5 custom layouts
│  │     │  └─ Recommendation: CONSOLIDATE OVERRIDES
│  │     │     Rationale: Already heavily customized
│  │     │
│  │     └─ ≤ 5 custom layouts
│  │        └─ Check: Is theme actively updated?
│  │           │
│  │           ├─ YES (theme updated in last 6 months)
│  │           │  └─ Recommendation: CONSOLIDATE OVERRIDES
│  │           │     Rationale: Benefit from future updates
│  │           │
│  │           └─ NO (theme stale)
│  │              └─ Recommendation: FORK THEME
│  │                 Rationale: No benefit from updates
│  │
│  └─ > 20 includes
│     └─ Recommendation: CONSOLIDATE OVERRIDES
│        Rationale: Heavy theme usage, forking too complex
│
├─ DECISION POINT: Fork or Consolidate?
│  │
│  ├─ FORK THEME
│  │  └─ Next Steps:
│  │     1. Copy theme files to _sass/theme/
│  │     2. Update all imports
│  │     3. Remove theme gem
│  │     4. Test thoroughly (Phase 2C)
│  │     5. Document fork rationale in ADR
│  │
│  └─ CONSOLIDATE OVERRIDES
│     └─ Next Steps:
│        1. Keep theme gem
│        2. Organize overrides in _sass/custom/
│        3. Document override patterns
│        4. Test thoroughly (Phase 2B only)
│        5. Document consolidation in ADR
│
└─ Document decision in ADR-001-theme-strategy.md
```

### Data Collection Commands

```bash
# Count theme includes used
grep -r "{% include" _layouts/ _includes/ _posts/ | \
    grep -v "^_includes/" | \
    sed "s/.*{% include \([^ }]*\).*/\1/" | \
    sort | uniq | wc -l

# Count custom layouts
ls -1 _layouts/ | wc -l

# Check theme last update
cd vendor/bundle/ruby/*/gems/minimal-mistakes-jekyll-*
git log -1 --format="%ai"
```

### Recommended Action Matrix

| Theme Includes | Custom Layouts | Theme Updates | Recommendation |
|----------------|----------------|---------------|----------------|
| < 10 | Any | Any | **FORK** |
| 10-20 | > 5 | Any | **CONSOLIDATE** |
| 10-20 | ≤ 5 | Recent | **CONSOLIDATE** |
| 10-20 | ≤ 5 | Stale | **FORK** |
| > 20 | Any | Any | **CONSOLIDATE** |

### Validation

**If FORK chosen, verify:**
- [ ] Can build without theme gem
- [ ] All pages render correctly
- [ ] No missing includes errors
- [ ] Theme files copied completely

**If CONSOLIDATE chosen, verify:**
- [ ] Override organization clear
- [ ] Import order documented
- [ ] No conflicts with theme updates
- [ ] Can update theme gem safely

---

## 3. SCSS Consolidation Strategy

**When:** Phase 1.5 (planning) and Phase 2B (execution)
**Decision:** How to batch consolidation for safety?

### Inputs Required

From Phase 1.5 SCSS analysis:
- [ ] Complete file inventory
- [ ] Dependency map
- [ ] Line counts per file
- [ ] Import order

### Decision Tree

```
START: SCSS Consolidation Strategy
│
├─ Total SCSS files to consolidate?
│  │
│  ├─ < 8 files
│  │  └─ Batching Strategy: 3 batches
│  │     Batch 1: Utilities + Variables
│  │     Batch 2: Components + Mixins
│  │     Batch 3: Overrides + Syntax
│  │
│  ├─ 8-15 files (CURRENT SITUATION)
│  │  └─ Batching Strategy: 5 batches (RECOMMENDED)
│  │     Batch 1: Utilities only
│  │     Batch 2: Variables + Mixins
│  │     Batch 3: Components
│  │     Batch 4: Syntax highlighting
│  │     Batch 5: Layout overrides
│  │
│  └─ > 15 files
│     └─ Batching Strategy: 7+ batches
│        Split further by file size
│        Never consolidate > 300 lines at once
│
├─ For each file, determine batch assignment:
│  │
│  ├─ File type: Utilities (site.scss, helpers)
│  │  └─ Batch 1: Lowest risk, test SCSS consolidation process
│  │
│  ├─ File type: Variables, Mixins, Functions
│  │  └─ Batch 2: Foundation for other files
│  │
│  ├─ File type: Components (buttons, forms, elements)
│  │  └─ Batch 3: Moderate risk, visual changes possible
│  │
│  ├─ File type: Syntax highlighting (coderay, rouge)
│  │  └─ Batch 4: Isolated scope, low risk
│  │
│  └─ File type: Layout overrides (page, typography, grid)
│     └─ Batch 5: Highest risk, consolidate last
│
├─ After each batch:
│  │
│  ├─ Did CSS output change?
│  │  ├─ YES → STOP: Investigate and fix before continuing
│  │  └─ NO → Continue
│  │
│  ├─ Did visual regression tests pass?
│  │  ├─ NO → STOP: Review diffs, revert if unintended
│  │  └─ YES → Continue
│  │
│  ├─ Did all tests pass?
│  │  ├─ NO → STOP: Fix tests before continuing
│  │  └─ YES → Continue
│  │
│  └─ Commit batch and proceed to next
│
└─ All batches complete → Proceed to Phase 2C or Phase 3
```

### Batch Safety Rules

**NEVER:**
- Consolidate more than 2 files in one batch
- Skip testing after a batch
- Proceed if visual regression fails
- Consolidate files with circular dependencies together

**ALWAYS:**
- Test after each batch
- Commit after each successful batch
- Backup _site/ before each batch
- Compare CSS output with diff
- Run visual regression tests

### File Assignment Template

Create this during Phase 1.5:

```markdown
# SCSS Consolidation Batches

## Batch 1: Utilities (Est. 1 hour)
- [ ] site.scss (64 lines) → custom/_utilities.scss
- Test, commit, backup

## Batch 2: Variables & Mixins (Est. 1.5 hours)
- [ ] variables.scss (170 lines) → custom/_variables.scss
- [ ] mixins.scss (unknown lines) → custom/_variables.scss
- Test, commit, backup

## Batch 3: Components (Est. 1.5 hours)
- [ ] elements.scss (183 lines) → custom/_components.scss
- [ ] _buttons.scss (unknown lines) → custom/_components.scss
- Test, commit, backup

## Batch 4: Syntax (Est. 1 hour)
- [ ] coderay.scss (unknown lines) → custom/_syntax.scss
- Test, commit, backup

## Batch 5: Layout Overrides (Est. 2 hours)
- [ ] page.scss (600 lines) → custom/_overrides.scss
- [ ] typography.scss (193 lines) → custom/_overrides.scss
- [ ] Handle _footer.scss duplicate
- [ ] Handle _sidebar.scss duplicate
- [ ] Optimize main.scss
- Test, commit, backup
```

### Validation

After each batch:
```bash
# 1. CSS diff
diff _site/assets/css/main.css _site.backup/assets/css/main.css

# 2. Visual regression
npm run test:visual

# 3. Full test suite
npm run test:all

# 4. Build time check
time bundle exec jekyll build
```

**Success criteria for batch:**
- CSS diff shows no changes (or only expected changes)
- Visual regression: 0 unintended pixel differences
- All tests pass
- Build time within 20% of previous batch

---

## 4. Deployment Target Selection

**When:** Phase 3
**Decision:** GitHub Pages OR Vercel as primary deployment?

### Inputs Required

- [ ] Current DNS configuration
- [ ] Recent deployment activity
- [ ] Analytics traffic sources
- [ ] Feature requirements

### Decision Tree

```
START: Deployment Target Selection
│
├─ Check DNS: Where does www.aledlie.com point?
│  │
│  ├─ Points to GitHub Pages (username.github.io)
│  │  └─ Current Primary: GitHub Pages
│  │
│  └─ Points to Vercel (vercel.app or custom domain)
│     └─ Current Primary: Vercel
│
├─ Check recent deployment activity:
│  │
│  ├─ GitHub Pages: Recent pushes trigger deployments?
│  │  └─ Active: YES/NO
│  │
│  └─ Vercel: Recent commits trigger deployments?
│     └─ Active: YES/NO
│
├─ Do you need features only Vercel provides?
│  │
│  ├─ Need security headers (CSP, HSTS)?
│  │  └─ YES → Favor Vercel
│  │
│  ├─ Need custom cache headers?
│  │  └─ YES → Favor Vercel
│  │
│  ├─ Need preview deployments for branches?
│  │  └─ YES → Favor Vercel
│  │
│  └─ None of the above
│     └─ Either works, favor GitHub Pages (simpler)
│
├─ DECISION MATRIX:
│  │
│  ├─ Scenario 1: DNS → GitHub Pages, Active deployments
│  │  └─ PRIMARY: GitHub Pages
│  │     SECONDARY: Vercel (for previews)
│  │     Action: Keep current setup, document
│  │
│  ├─ Scenario 2: DNS → Vercel, Active deployments
│  │  └─ PRIMARY: Vercel
│  │     SECONDARY: GitHub Pages (automatic)
│  │     Action: Keep current setup, document
│  │
│  ├─ Scenario 3: DNS → GitHub Pages, Need Vercel features
│  │  └─ PRIMARY: Vercel
│  │     Action: Migrate DNS to Vercel
│  │     Timeline: Add 2 hours for migration
│  │
│  └─ Scenario 4: Both inactive or unclear
│     └─ RECOMMENDED: GitHub Pages primary
│        Rationale: Simpler, free, integrated
│        Action: Update DNS if needed
│
└─ Document decision in ADR-002-deployment-strategy.md
```

### Data Collection Commands

```bash
# Check DNS
nslookup www.aledlie.com
dig www.aledlie.com

# Check GitHub Pages settings
# Go to: GitHub repo → Settings → Pages

# Check Vercel deployments
# Go to: Vercel dashboard → Project → Deployments

# Check .git/config for remotes
cat .git/config
```

### Recommended Configuration

**Option 1: GitHub Pages Primary (SIMPLEST)**
```yaml
Primary: GitHub Pages
Secondary: Vercel (branch previews)
DNS: CNAME to username.github.io
Deployment: Automatic on push to master
```

**Option 2: Vercel Primary (MOST FLEXIBLE)**
```yaml
Primary: Vercel
Secondary: GitHub Pages (automatic)
DNS: CNAME to vercel.app
Deployment: Automatic on push to master
Features: Security headers, cache control, previews
```

### Validation

After deployment decision:
- [ ] Primary deployment working
- [ ] DNS resolves correctly
- [ ] Site loads at www.aledlie.com
- [ ] HTTPS working
- [ ] Deployment triggers on push
- [ ] Rollback process tested

---

## 5. Browser Matrix Decision

**When:** Phase 4
**Decision:** Which browsers to keep in test matrix?

### Inputs Required

- [ ] Google Analytics browser data (last 3 months)
- [ ] Mobile vs desktop traffic split
- [ ] Current browser matrix
- [ ] Test execution time per browser

### Decision Tree

```
START: Browser Matrix Optimization
│
├─ Check Analytics: Desktop vs Mobile traffic split
│  │
│  ├─ > 60% Mobile traffic
│  │  └─ Strategy: Prioritize mobile browsers
│  │
│  ├─ 40-60% Mixed traffic
│  │  └─ Strategy: Balance desktop and mobile
│  │
│  └─ > 60% Desktop traffic
│     └─ Strategy: Prioritize desktop browsers
│
├─ Current Matrix: 5 browsers (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
│  │
│  ├─ Test execution time acceptable (< 10 minutes)?
│  │  ├─ YES → KEEP ALL 5 browsers
│  │  └─ NO → Reduce matrix
│  │
│  └─ Reduce matrix to optimize time:
│     │
│     ├─ Desktop browsers (choose 2-3):
│     │  │
│     │  ├─ Chromium (Chrome/Edge)
│     │  │  └─ KEEP: 70%+ market share
│     │  │
│     │  ├─ Firefox
│     │  │  └─ KEEP if > 5% of traffic
│     │  │     DROP if < 5% of traffic
│     │  │
│     │  └─ WebKit (Safari Desktop)
│     │     └─ KEEP if > 10% Mac users
│     │        DROP if < 10% Mac users
│     │
│     └─ Mobile browsers (choose 1-2):
│        │
│        ├─ Mobile Chrome
│        │  └─ KEEP: 60%+ mobile market share
│        │
│        └─ Mobile Safari
│           └─ KEEP if > 20% iOS users
│              DROP if < 20% iOS users
│
├─ RECOMMENDED MATRICES:
│  │
│  ├─ Minimal (3 browsers, fastest):
│  │  - Chromium (desktop)
│  │  - Firefox (desktop)
│  │  - Mobile Chrome
│  │  Time: ~5 minutes
│  │
│  ├─ Balanced (4 browsers, recommended):
│  │  - Chromium (desktop)
│  │  - Firefox (desktop)
│  │  - Mobile Chrome
│  │  - Mobile Safari
│  │  Time: ~7 minutes
│  │
│  └─ Comprehensive (5 browsers, thorough):
│     - Chromium (desktop)
│     - Firefox (desktop)
│     - WebKit (desktop)
│     - Mobile Chrome
│     - Mobile Safari
│     Time: ~10 minutes
│
└─ Update playwright.config.js with chosen matrix
```

### Analytics Data Template

Check Google Analytics for:
```
Browser Usage (Last 3 Months):
- Chrome: ____%
- Safari (Desktop): ____%
- Safari (Mobile): ____%
- Firefox: ____%
- Edge: ____%
- Other: ____%

Device Category:
- Desktop: ____%
- Mobile: ____%
- Tablet: ____%

Operating System:
- Windows: ____%
- Mac: ____%
- iOS: ____%
- Android: ____%
- Other: ____%
```

### Recommended Action

**For The Parlor (personal blog):**
```javascript
// playwright.config.js - BALANCED MATRIX
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
],
```

**Rationale:**
- Chromium: Covers Chrome, Edge, Opera (70%+ users)
- Firefox: Covers Firefox users (~5-10%)
- Mobile Chrome: Covers Android users (60%+ mobile)
- Mobile Safari: Covers iOS users (30%+ mobile)
- Drop WebKit Desktop: Covered by Mobile Safari

### Validation

After browser matrix change:
- [ ] Run tests on new matrix
- [ ] Verify coverage matches old matrix
- [ ] Check execution time improvement
- [ ] Update CI/CD configuration
- [ ] Document decision in ADR

---

## 6. Rollback Decision

**When:** Any time during refactoring
**Decision:** Should we rollback? If yes, how far?

### Inputs Required

- [ ] What broke?
- [ ] When did it break?
- [ ] How critical is it?
- [ ] Can it be fixed forward?

### Decision Tree

```
START: Rollback Decision
│
├─ What broke?
│  │
│  ├─ Site won't build
│  │  └─ Severity: CRITICAL
│  │     Action: Immediate rollback
│  │
│  ├─ Tests failing
│  │  └─ Severity: HIGH
│  │     Investigate: Can tests be fixed?
│  │
│  ├─ Visual regression failures
│  │  └─ Severity: MEDIUM-HIGH
│  │     Investigate: Intentional or bug?
│  │
│  └─ Minor styling issue
│     └─ Severity: LOW
│        Action: Fix forward, no rollback
│
├─ Can it be fixed forward in < 30 minutes?
│  ├─ YES → Fix forward
│  │  1. Identify root cause
│  │  2. Apply fix
│  │  3. Test fix
│  │  4. Commit fix
│  │  5. Continue refactoring
│  │
│  └─ NO → Proceed to rollback decision
│
├─ How far back to rollback?
│  │
│  ├─ Issue in current batch (not yet committed)
│  │  └─ Rollback Type: SOFT RESET
│  │     Command: git reset --hard HEAD
│  │     Loses: Uncommitted changes only
│  │     Time: < 1 minute
│  │
│  ├─ Issue in last commit (1-2 hours ago)
│  │  └─ Rollback Type: SINGLE COMMIT REVERT
│  │     Command: git revert HEAD
│  │     Loses: Last commit only
│  │     Time: < 5 minutes
│  │
│  ├─ Issue in last phase (1-2 days ago)
│  │  └─ Rollback Type: PHASE ROLLBACK
│  │     Command: git reset --hard <phase-start-tag>
│  │     Loses: Entire phase
│  │     Time: 5-10 minutes
│  │
│  └─ Issue unknown, refactoring questionable
│     └─ Rollback Type: FULL ROLLBACK
│        Command: git reset --hard pre-refactor-snapshot-2025-11-11
│        Loses: All refactoring work
│        Time: 5 minutes
│
├─ After rollback:
│  │
│  ├─ 1. Verify site works
│  │    └─ bundle exec jekyll build && npm run test:all
│  │
│  ├─ 2. Document what happened
│  │    └─ Create incident report
│  │
│  ├─ 3. Identify root cause
│  │    └─ What went wrong? Why?
│  │
│  ├─ 4. Update plan if needed
│  │    └─ Prevent similar issues
│  │
│  └─ 5. Decide: Resume or abort refactoring?
│
└─ Resume refactoring from safe state
```

### Rollback Commands

**Soft Reset (uncommitted changes):**
```bash
# Discard all uncommitted changes
git reset --hard HEAD
git clean -fd
bundle install
npm install
bundle exec jekyll build
```

**Single Commit Revert:**
```bash
# Revert last commit
git revert HEAD
git push origin refactor/architecture-simplification
bundle install
bundle exec jekyll build
```

**Phase Rollback:**
```bash
# Reset to phase start
git tag  # Find phase tag
git reset --hard phase-2b-start
git push --force origin refactor/architecture-simplification
bundle install
bundle exec jekyll build
```

**Full Rollback:**
```bash
# Nuclear option
git reset --hard pre-refactor-snapshot-2025-11-11
git push --force origin refactor/architecture-simplification
bundle install
bundle exec jekyll build
```

### Rollback Validation

After any rollback:
- [ ] Site builds successfully
- [ ] All tests pass
- [ ] Site serves locally
- [ ] Visual regression baseline matches
- [ ] Analytics working
- [ ] Incident documented

---

## 7. Phase Continuation Decision

**When:** End of each phase
**Decision:** Proceed to next phase OR pause?

### Inputs Required

- [ ] Phase completion status
- [ ] Test results
- [ ] Acceptance criteria status
- [ ] Team availability
- [ ] Issues encountered

### Decision Tree

```
START: Phase Continuation Decision
│
├─ Are all phase deliverables complete?
│  ├─ NO → PAUSE: Complete deliverables first
│  └─ YES → Continue
│
├─ Do all tests pass?
│  ├─ NO → PAUSE: Fix tests or rollback
│  └─ YES → Continue
│
├─ Are acceptance criteria met?
│  ├─ NO → PAUSE: Meet criteria or document exceptions
│  └─ YES → Continue
│
├─ Were major issues encountered?
│  ├─ YES → DECISION POINT:
│  │  │
│  │  ├─ Issues resolved and documented?
│  │  │  ├─ YES → Continue with caution
│  │  │  └─ NO → PAUSE: Resolve and document first
│  │  │
│  │  └─ Do issues suggest fundamental problem?
│  │     ├─ YES → PAUSE: Re-evaluate approach
│  │     └─ NO → Continue
│  │
│  └─ NO → Continue
│
├─ Is next phase's prerequisite met?
│  ├─ NO → PAUSE: Cannot proceed
│  └─ YES → Continue
│
├─ Is team available for next phase?
│  ├─ NO → PAUSE: Schedule continuation
│  └─ YES → Continue
│
├─ SPECIAL GATE: Proceeding from Phase 1.5 to Phase 2A?
│  │
│  ├─ Are ALL 13+ SCSS files documented?
│  │  ├─ NO → STOP: Non-negotiable, complete Phase 1.5
│  │  └─ YES → Continue
│  │
│  ├─ Is SCSS dependency map complete?
│  │  ├─ NO → STOP: Required for Phase 2
│  │  └─ YES → Continue
│  │
│  └─ Is detailed consolidation plan approved?
│     ├─ NO → STOP: Get approval first
│     └─ YES → Proceed to Phase 2A
│
└─ PROCEED to next phase
   └─ Actions before starting next phase:
      1. Update STAKEHOLDER_UPDATES.md
      2. Review next phase documentation
      3. Check ACCEPTANCE_CRITERIA.md for next phase
      4. Create phase start tag
      5. Begin next phase tasks
```

### Phase Completion Checklist

Before proceeding from any phase:

**Technical:**
- [ ] All tasks complete
- [ ] All tests passing
- [ ] Build successful
- [ ] No console errors
- [ ] Performance acceptable

**Documentation:**
- [ ] Phase deliverables created
- [ ] ADRs written (if applicable)
- [ ] Changes committed with good messages
- [ ] Stakeholders updated

**Validation:**
- [ ] Acceptance criteria met
- [ ] Decision gates passed
- [ ] Team reviewed (if required)
- [ ] Next phase prerequisites met

### Special Phase Gates

**Phase 1.5 → Phase 2A (CRITICAL):**
```
MUST HAVE:
✓ All SCSS files inventoried
✓ Duplicates identified
✓ Dependency map created
✓ Consolidation plan detailed
✓ Plan peer-reviewed
✓ No surprises in inventory
```

**Phase 2B → Phase 2C or Phase 3:**
```
MUST HAVE:
✓ All batches complete
✓ CSS output unchanged (verified)
✓ Visual regression passing
✓ All tests passing
✓ Build time acceptable
```

**Phase 4 → Completion:**
```
MUST HAVE:
✓ New tests proven reliable
✓ Old and new tests agree
✓ Coverage maintained
✓ CI/CD working
✓ Documentation complete
```

### Pause/Resume Protocol

**If pausing:**
1. Document current state
2. Tag current commit: `phase-X-paused-YYYY-MM-DD`
3. Update stakeholders
4. Set resume date
5. Create handoff document if team changes

**When resuming:**
1. Review phase documentation
2. Check previous phase completion
3. Review any changes made during pause
4. Re-run baseline tests
5. Continue from last checkpoint

---

## Validation and Continuous Improvement

### After Using Each Decision Tree

**Record:**
- Decision made
- Inputs used
- Outcome
- Would you make same decision again?

### Update Trees Based on Experience

If you encounter:
- New decision points not covered
- Tree led to wrong decision
- Missing inputs needed
- Ambiguous branches

**Action:**
1. Document issue
2. Propose tree update
3. Update this document
4. Share learnings with team

---

## Quick Reference: Critical Decisions

| Phase | Critical Decision | Decision Tree | Blocking |
|-------|------------------|---------------|----------|
| Pre-Phase 0 | Proceed with refactoring? | #1 Go/No-Go | YES |
| Phase 2A | Fork or consolidate theme? | #2 Theme Strategy | YES |
| Phase 2B | How to batch SCSS consolidation? | #3 SCSS Strategy | NO |
| Phase 3 | Primary deployment target? | #4 Deployment | NO |
| Phase 4 | Browser matrix selection? | #5 Browser Matrix | NO |
| Any Phase | Should we rollback? | #6 Rollback | MAYBE |
| End of Each | Proceed to next phase? | #7 Phase Continuation | YES |

---

**Version:** 1.0
**Last Updated:** 2025-11-11
**Next Review:** After Phase 2A completion
**Feedback:** Document decision outcomes to improve trees
