---
layout: single
title: "Claude Code Config Bloat Audit: Removing Stale Permissions, Plugins, and Skills"
date: 2026-01-21
author_profile: true
categories: [maintenance, configuration, optimization]
tags: [claude-code, config, cleanup, skills, plugins, marketplaces]
excerpt: "Audit and cleanup of ~/.claude/config/ removing stale MCP permissions, unused plugins, redundant skills, and inactive marketplaces."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---


**Session Date**: 2026-01-21<br>
**Project**: Claude Code Dev Environment<br>
**Focus**: Configuration file cleanup and consolidation<br>
**Session Type**: Maintenance

## Executive Summary

Audited and cleaned up the `~/.claude/config/` directory, reducing bloat across four configuration files. Removed stale MCP permissions, disabled unused plugins, consolidated overlapping skills, and pruned inactive marketplace registrations.

**Impact Summary:**

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| settings.local.json | 1.8 KB | 303 bytes | 83% |
| settings.json | 2.8 KB | 2.2 KB | 21% |
| skill-rules.json | 14.4 KB | 13.8 KB | 4% |
| marketplaces.json | 3.6 KB | 2.8 KB | 23% |

## Changes Made

### 1. settings.local.json - Stale MCP Permissions Removed

Removed 21 pre-approved permissions for inactive MCP servers:

**Removed:**
- 8 Chrome DevTools MCP permissions (`mcp__plugin_chrome-devtools-mcp_*`)
- 11 Playwright MCP permissions (`mcp__plugin_compound-engineering_playwright_*`)
- 1 unused skill permission (`Skill(scientific-skills:get-available-resources)`)

**Retained:**
- `Bash(*)`, `WebFetch`, `WebSearch`
- Active skill permissions: `frontend-dev-guidelines`, `cicd-cross-platform`, `skill-developer`, `git:commit`, `git:commit-and-push`

### 2. settings.json - Unused Plugins Disabled

Removed 11 plugins from `awesome-claude-skills` that were enabled but unused:

- `file-organizer`
- `internal-comms`
- `image-enhancer`
- `content-research-writer`
- `developer-growth-analysis`
- `invoice-organizer`
- `competitive-ads-extractor`
- `lead-research-assistant`
- `canvas-design`
- `meeting-insights-analyzer`
- `mcp-builder`

**Retained:** `commit-commands@claude-code-plugins` (actively used)

### 3. skill-rules.json - Overlapping Skills Consolidated

Merged 2 pairs of overlapping skills:

**bugfix-planner → bug-detective:**
- Added keywords: `bugfix plan`, `fix plan`, `reproduce bug`, `regression`, `rollback plan`
- Added patterns: `(create|make|write).*?(bugfix|fix).*?plan`, `(plan|strategy).*?(fix|bugfix|repair)`, `root cause.*?(analysis|investigation)`

**ui-ux-design-expert → frontend-design:**
- Added keywords: `UI`, `UX`, `user interface`, `user experience`, `design review`, `layout`, `visual hierarchy`, `usability`, `interface design`, `design system`
- Added patterns: `(review|improve|simplify).*?(UI|UX|interface|design|layout)`, `(how|what).*?(design|UX|usability)`

**Result:** 19 skills (was 21)

### 4. marketplaces.json - Inactive Marketplaces Removed

Removed 3 marketplace registrations that weren't actively used:

- `claude-code-marketplace` (ananddtyagi)
- `fradser-dotagent` (FradSer/dotclaude)
- `claude-code-templates` (davila7)

**Retained:** 10 marketplaces including official Anthropic ones

## Recommendations for Future Cleanup

1. **Audit remaining marketplaces** - Consider removing `insforge-official-marketplace` and `claude-scientific-skills` if not actively used
2. **Review skill triggers** - Some skills may have overlapping keywords that could be further consolidated
3. **Periodic permission review** - Remove MCP permissions when disabling servers

## Files Modified

```
~/.claude/config/
├── marketplaces.json    (3 entries removed)
├── settings.json        (11 plugins disabled)
├── settings.local.json  (21 permissions removed)
└── skill-rules.json     (2 skills consolidated)
```
