---
layout: single
title: "Git Activity Report: PersonalSite Repository"
date: 2026-01-11
author_profile: true
excerpt: "Comprehensive analysis of 403 commits across the PersonalSite repository - spanning from initial creation in May 2017 through January 2026, with 94% of activity concentrated in 2025."
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
---

<style>
/* Increase font size for all text elements in SVG charts */
.page__content svg text {
  font-size: 16px !important;
}

/* Specific adjustments for different text elements */
.page__content svg text.title {
  font-size: 20px !important;
  font-weight: bold;
}

.page__content svg text.label {
  font-size: 15px !important;
}

.page__content svg text.value {
  font-size: 14px !important;
}

/* Ensure axis labels are readable */
.page__content svg .tick text {
  font-size: 14px !important;
}

/* Legend text */
.page__content svg .legend text {
  font-size: 14px !important;
}
</style>

## Executive Summary

**Repository:** PersonalSite (aledlie.com)
**Period:** May 14, 2017 - January 10, 2026 (8+ years)
**Total Commits:** 403

This Jekyll-based personal website has seen consistent evolution, with a massive development surge in 2025 representing **94% of all commits**. The work has focused on accessibility compliance (WCAG 2.1 AA), Schema.org structured data, analytics implementation, and extensive UI/UX refinements. A notable 43% of commits are co-authored with Claude Code, indicating significant AI-assisted development adoption.

### Visual Overview

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin: 30px 0;">
  <div style="text-align: center;">
    <img src="/assets/images/git-activity-2026/monthly-commits-2025.svg" alt="2025 Monthly Commits" style="width: 100%; max-width: 500px; height: auto;">
  </div>
  <div style="text-align: center;">
    <img src="/assets/images/git-activity-2026/yearly-distribution.svg" alt="Commits by Year" style="width: 100%; max-width: 500px; height: auto;">
  </div>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin: 30px 0;">
  <div style="text-align: center;">
    <img src="/assets/images/git-activity-2026/commit-types.svg" alt="Commit Types" style="width: 100%; max-width: 500px; height: auto;">
  </div>
  <div style="text-align: center;">
    <img src="/assets/images/git-activity-2026/day-of-week.svg" alt="Activity by Day of Week" style="width: 100%; max-width: 500px; height: auto;">
  </div>
</div>

### Detailed Charts

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin: 30px 0;">
  <div style="text-align: center;">
    <img src="/assets/images/git-activity-2026/commits_by_hour.png" alt="Commits by Hour" style="width: 100%; max-width: 500px; height: auto;">
    <p style="font-size: 0.9em; color: #666; margin-top: 8px;">Hourly commit distribution</p>
    <p style="font-size: 0.9em; color: #666; margin-top: 8px;">AKA The Vampire Work Schedule</p>
  </div>
  <div style="text-align: center;">
    <img src="/assets/images/git-activity-2026/average_commits.png" alt="Daily Commit Distribution" style="width: 100%; max-width: 500px; height: auto;">
    <p style="font-size: 0.9em; color: #666; margin-top: 8px;">Daily commit count distribution</p>
  </div>
</div>

<div style="text-align: center; margin: 30px 0;">
  <img src="/assets/images/git-activity-2026/commits_by_day_month.png" alt="Commits by Day and Month" style="width: 100%; max-width: 700px; height: auto;">
  <p style="font-size: 0.9em; color: #666; margin-top: 8px;">Activity breakdown by day of week and month</p>
  <p style="font-size: 0.9em; color: #666; margin-top: 8px;">Mon-Wed are finally starting to give me some weekend breaks :)</p>
</div>

---

## Key Development Themes

### 1. Accessibility Compliance (WCAG 2.1 AA)
- Heading hierarchy fixes (H1 handling in overlays)
- Landmark role corrections (duplicate banner removal)
- Color contrast improvements
- Skip navigation implementation

### 2. Schema.org Structured Data
- Knowledge graph entity linking
- BlogPosting, TechArticle, HowTo schemas
- @id generation for entity references
- Enhanced person/organization entities

### 3. UI/UX Refinements
- Cover photo overlay removal (75 pages)
- Header system refactoring
- Sidebar author profile improvements
- Mobile responsiveness fixes

### 4. Analytics & Tracking
- GA4 implementation and duplicate removal
- Facebook Conversions API integration
- Privacy-compliant tracking setup

---

## 2025 Monthly Breakdown

The 2025 development activity shows concentrated sprints with clear focus areas:

| Month | Commits | % of 2025 | Focus Areas |
|-------|---------|-----------|-------------|
| **August** | 122 | 32.1% | Schema.org implementation, initial Claude Code adoption |
| **November** | 114 | 30.0% | WCAG accessibility compliance, UI refinements |
| **December** | 76 | 20.0% | Header/overlay refactoring, breadcrumb cleanup |
| **September** | 36 | 9.5% | Testing infrastructure, performance optimization |
| **October** | 24 | 6.3% | Documentation, minor fixes |
| **July** | 8 | 2.1% | Setup and planning |

---

## Commit Types (Conventional Commits)

<div style="text-align: center; margin: 30px 0;">
  <img src="/assets/images/git-activity-2026/commit_wordcloud.png" alt="Commit Message Word Cloud" style="width: 100%; max-width: 800px; height: auto;">
  <p style="font-size: 0.9em; color: #666; margin-top: 8px;">Most frequent terms in commit messages</p>
</div>

The repository follows conventional commit standards with clear categorization:

```
fix        █████████████████████████████████████████████████████ 82 (52.6%)
docs       ████████████████ 25 (16.0%)
refactor   ██████████ 15 ( 9.6%)
chore      ████████ 12 ( 7.7%)
style      ██████ 9 ( 5.8%)
feat       ███ 5 ( 3.2%)
test       ██ 3 ( 1.9%)
other      ███ 5 ( 3.2%)
```

| Type | Count | Percentage | Description |
|------|-------|------------|-------------|
| **fix** | 82 | 52.6% | Bug fixes, accessibility fixes, CSS corrections |
| **docs** | 25 | 16.0% | Reports, CHANGELOG, documentation updates |
| **refactor** | 15 | 9.6% | Code restructuring, header system, layouts |
| **chore** | 12 | 7.7% | Maintenance, gitignore, cleanup |
| **style** | 9 | 5.8% | Visual styling, spacing, formatting |
| **feat** | 5 | 3.2% | New features, Schema.org entities |
| **test** | 3 | 1.9% | Test infrastructure |

**Key Insight:** The high ratio of `fix` commits (52.6%) reflects iterative refinement work - accessibility fixes, responsive design adjustments, and theme customizations required multiple iterations to achieve WCAG compliance.

---

## AI-Assisted Development

### Claude Code Integration

**174 commits (43.2%)** include Claude Code co-authorship, indicating deep AI integration in the development workflow.

**Adoption Timeline:**
- Pre-2025: Manual development only
- 2025+: Heavy Claude Code usage for accessibility fixes, refactoring, and documentation

**Common Patterns in Claude-Assisted Commits:**
- Accessibility (WCAG) compliance fixes
- Schema.org structured data implementation
- Multi-file refactoring operations
- Documentation generation
- Testing infrastructure

---

## Recent Commits (Last 30 Days)

| Date | Type | Description |
|------|------|-------------|
| Jan 10, 2026 | fix(analytics) | Remove duplicate GA4 script loading |
| Dec 31, 2025 | docs(reports) | Add Facebook Conversions API session report |
| Dec 28, 2025 | chore | Add .playwright-mcp to gitignore |
| Dec 28, 2025 | fix(sidebar) | Remove min-width for mobile responsiveness |
| Dec 28, 2025 | fix(sidebar) | Add hyphenated class selector for author-urls |
| Dec 28, 2025 | style | Restore dates on reports index page |
| Dec 28, 2025 | docs(reports) | Add IntegrityStudio session report |
| Dec 28, 2025 | fix(a11y) | Add H1 to post-index layout |
| Dec 28, 2025 | fix(a11y) | Resolve duplicate banner landmarks |
| Dec 28, 2025 | refactor(headers) | Remove title overlays from cover photos |

---

## Summary

The PersonalSite repository demonstrates a mature Jekyll implementation with:

- **Strong conventional commit discipline** - 156 commits follow conventional format
- **Accessibility-first approach** - WCAG 2.1 AA compliance achieved
- **Modern AI-assisted development** - 43% Claude Code collaboration
- **Continuous refinement** - 52% bug fix commits show iterative quality improvement
- **Weekend-focused development** - Personal project development pattern

The 2025 surge (380 commits) transformed the site from a basic blog to a professionally polished, accessible, and SEO-optimized platform.
