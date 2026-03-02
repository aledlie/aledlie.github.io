---
layout: single
title: "Agent Telemetry Blackout: Task-to-Agent Rename Breaks All Agent Spans"
date: 2026-03-02
author_profile: true
classes: wide
categories: [observability, debugging]
tags: [otel, telemetry, agent-spans, hooks, claude-code, root-cause-analysis]
excerpt: "Agent span telemetry dropped from 434/day to zero on March 1 after Claude Code renamed the 'Task' tool to 'Agent'. Session mismatch masked the issue until manual investigation traced it to stale hook matchers."
schema_type: analysis-article
schema_genre: "Session Report"
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
url: https://www.aledlie.com/reports/2026-03-02-agent-telemetry-breakage-investigation/
permalink: /reports/2026-03-02-agent-telemetry-breakage-investigation/
---

**Session Date**: 2026-03-02
**Project**: observability-toolkit (hooks + dashboard)
**Focus**: Investigate telemetry anomalies flagged by quality metrics; fix agent span loss
**Session Type**: Root-Cause Analysis + Bug Fix
**Session ID**: `ca100ac0-95d1-464a-b5b0-f587c497c114`

---

## Opening Narrative

Quality metrics from the dashboard flagged three anomalies: task_completion = 0.00, 27 unexpected files_touched, and faithfulness = 0.82. What appeared to be three separate quality regressions turned out to be one false alarm (session mismatch) masking one critical infrastructure bug (agent tool rename). The investigation uncovered that Claude Code v2.1.63 (published Feb 28) renamed the `Task` tool to `Agent`, silently breaking all agent telemetry starting March 1.

---

## Investigation Timeline

### Phase 1: Session Mismatch Discovery

The quality pipeline's `find_latest_session_id()` auto-discovery picked session `2e117678` (a dashboard work session at file position 3431) instead of the actual investigation session `ca100ac0` (position 1583). This produced misleading metrics:

| Metric | Wrong Session (2e117678) | Correct Session (ca100ac0) |
|--------|-------------------------|---------------------------|
| task_completion | 0.00 | 1.00 |
| files_touched | 27 (dashboard components) | 7 (hooks + agents) |
| agent_spans | 0 | 0 (real) |

Two of three "critical" findings were false alarms from analyzing the wrong session.

### Phase 2: Agent Span Cliff

The third finding -- zero agent spans -- was real and affected ALL sessions, not just one. Daily agent span counts:

| Date | Agent Spans | Total Trace Lines |
|------|-------------|-------------------|
| Feb 27 | 434 | 16,662 |
| Feb 28 | 111 | 6,882 |
| Mar 1 | **0** | 17,004 |
| Mar 2 (post-fix) | **30** | 4,797 |

The cliff from 111 to 0 on Mar 1 with 17K total spans confirmed a systematic instrumentation failure, not reduced usage.

### Phase 3: Root Cause

Claude Code v2.1.63 renamed the tool from `Task` to `Agent`. Three places in the hooks infrastructure matched on the old name:

1. **`settings.json`** -- Hook matchers: `mcp__.*|Skill|Task` (PreToolUse and PostToolUse)
2. **`pre-tool.ts`** -- Guard: `if (input.tool_name !== 'Task') return;`
3. **`post-tool.ts`** -- Guard: same pattern, plus router dispatch

All three silently skipped the new `Agent` tool name, producing zero spans with no errors.

---

## Fixes Applied

All fixes applied in session `ca100ac0` on Mar 2:

### settings.json
```
- "matcher": "mcp__.*|Skill|Task"
+ "matcher": "mcp__.*|Skill|Agent|Task"
```

### pre-tool.ts / post-tool.ts
```typescript
- if (input.tool_name !== 'Task') return;
+ if (input.tool_name !== 'Agent' && input.tool_name !== 'Task') return;
```

Both `Agent` and `Task` are accepted for backwards compatibility with any sessions still running older Claude Code versions.

---

## Recovery Verification

Mar 2 telemetry (post-fix, partial day) shows agent spans recovering:

- **15 pre-tool agent spans** + **15 post-tool agent spans** = 30 agent spans
- All from `code-reviewer` agents running FR1-FR8 dashboard review commits
- Full agent attribute capture restored: `gen_ai.agent.name`, `gen_ai.agent.id`, `agent.source_type`, `agent.output_size`

---

## Evaluation Score Trends

| Metric | Feb 27 | Feb 28 | Mar 1 | Mar 2 |
|--------|--------|--------|-------|-------|
| task_completion (avg) | 0.17 | 0.55 | 0.51 | 0.49 |
| coherence (avg) | 0.88 | 0.82 | -- | -- |
| faithfulness (avg) | 0.95 | 0.89 | -- | -- |
| hallucination (avg) | 0.05 | 0.11 | -- | -- |
| tool_correctness (avg) | 0.98 | 0.99 | -- | -- |

Notes:
- Mar 1 and Mar 2 only emitted `task_completion` evaluations (rule-based). LLM-as-Judge metrics (coherence, faithfulness, hallucination) were not sampled.
- Feb 27 had the highest evaluation volume (11,909 evaluation_latency records) due to active LLM-as-Judge sampling.
- task_completion low avg on Feb 27 (0.17) reflects many sessions with incomplete task lists, not quality issues.

---

## Commit Activity (Mar 1-2)

### Dashboard Submodule (16 commits)
FR1-FR8 final review follow-ups: TrendChart COLORS alias removal, useApiQuery JSDoc, Stat magic number extraction, TruncatedList key prop docs, TrendChart aria role, FreqBar CSS grid, MetadataRow empty-string guard, TrendSeries CSS var + p10 mask fix. Plus changelog/backlog housekeeping.

### Parent Repo (hooks, 12 commits)
- R4.1a-c: divergence detection alerts for bimodal score distributions
- R6.2: meta-evaluation wiring into T2 quality pipeline + code review fixes
- Agent infrastructure: web-research-analyst split, WebSearch removal from webscraping agent
- dist rebuilds after each feature delivery

---

## Lessons Learned

1. **External tool renames are silent breakers.** Claude Code renaming `Task` to `Agent` produced zero errors -- spans simply stopped appearing. Defensive telemetry should alert when expected span types drop to zero.
2. **Session auto-discovery is fragile.** `find_latest_session_id()` uses file position, not timestamp ordering. When multiple conversations interleave in the same telemetry file, it picks the wrong one. The skill should accept explicit session IDs or use timestamp-based selection.
3. **Accept both old and new names during transitions.** The fix accepts `Agent|Task` to handle version skew gracefully.

---

## Metrics

| Metric | Value |
|--------|-------|
| Tool calls | 55 |
| Files modified | 7 |
| Bugs found | 1 critical (agent span loss), 1 usage issue (session mismatch) |
| Agent spans lost | ~545+ (Mar 1 full day + Feb 28 partial) |
| Recovery time | ~36 min investigation + fix |
| Session outcome | Rate-limited before report completion |
