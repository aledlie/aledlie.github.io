---
layout: single
title: "Skill Audit Scorer and Agent Definition Collapse"
date: 2026-02-28
author_profile: true
categories: [observability-toolkit, developer-tooling]
tags: [skill-auditor, agent-auditor, otel, telemetry, scoring, python, prompt-engineering]
excerpt: "Created skill-audit-scorer.py parallel to agent-audit-scorer.py, then collapsed both auditor agent definitions by ~38% by moving rubric detail into scripts."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-28<br>
**Project**: observability-toolkit<br>
**Focus**: Skill auditor scorer script + agent definition optimization<br>
**Session Type**: Implementation

## Executive Summary

Created `scripts/skill-audit-scorer.py`, a standalone Python scorer that implements the full 6-dimension skill-auditor rubric (max 60 points) against plugin-level OTEL telemetry. Successfully tested against all 18 skills, producing a grade distribution of 9 B's and 9 C's. Then collapsed both `agent-auditor.md` and `skill-auditor.md` definitions by removing verbose rubric tables now superseded by their respective scorer scripts, reducing injection token cost by ~38%.

| Metric | Value |
|--------|-------|
| Skills scored | 18 |
| Grade distribution | B: 9, C: 9 |
| `agent-auditor.md` lines | 137 → 85 (-38%) |
| `skill-auditor.md` lines | 146 → 89 (-39%) |
| `skill-audit-scorer.py` lines | 712 |
| Commit | `dfddc95` |

## Problem Statement

The `agent-auditor` had a scorer script (`agent-audit-scorer.py`) for automated Phase 1-3 scoring, but the `skill-auditor` lacked a parallel script — forcing the agent to parse telemetry inline via embedded Python snippets during every invocation. Both agent definitions also carried full rubric tables (scoring thresholds, formulas, sub-metric weights) that were now redundant with their scripts, inflating injection size by ~700 tokens each.

## Implementation Details

### 1. Skill Audit Scorer (`scripts/skill-audit-scorer.py`)

Built as a parallel to `agent-audit-scorer.py` with key adaptations for skill telemetry:

**Dimension 1 (Telemetry Health)** — Uses `hook:plugin-pre-tool` / `plugin-post-tool` spans keyed on `plugin.name`. Replaces agent error rate + trend with:
- Empty injection rate (25%) — `plugin.output_size == 0` / total
- Activation conversion (15%) — from `hook:skill-activation-prompt` event spans

**Dimension 6 (Efficiency)** — Replaces agent duration/amplification/output/background with:
- Injection size percentile (35%) — ranked against all skills
- Model cost (30%) — haiku=10, sonnet=7, opus=3, none=5
- Tool scope (35%) — fewer restricted tools = higher score

**Frontmatter parsing** — Handles YAML list `allowed-tools` (not CSV `tools`), `tags`, full model IDs (`claude-sonnet-4-6` → `sonnet`).

Self-contained — no dependency on `agent-telemetry-audit.py` (unlike the agent scorer).

### 2. Agent Definition Collapse

Replaced verbose per-dimension sections (scoring tables, formulas, inline code) with a compact 6-row summary table in both files:

```markdown
| # | Dimension | What it measures |
|---|-----------|-----------------|
| 1 | Telemetry Health | Usage frequency, error rate, ... |
| 2 | Definition Quality | Frontmatter completeness, ... |
...
```

Additional changes to `skill-auditor.md`:
- Removed inline Python telemetry snippet (14 lines)
- Added Phase 4: Rewrite (mirroring agent-auditor)
- Added Write/Edit to tools (needed for rewrites)
- Updated guidelines: read-only → rewrite C/D skills
- Added scorer script reference section

### 3. Restored Scripts

`scripts/agent-audit-scorer.py` and `scripts/parse/agent-telemetry-audit.py` existed in git history (commits `e25d148`, `b66021d`) but were not in the working tree. Restored from those commits.

## Testing and Verification

Ran `--all --days 30` successfully across all 18 skills:

```
python3 scripts/skill-audit-scorer.py --all --days 30
```

Top scorers: ralph-wiggum (46.9/60 B), backlog-migrate (45.7/60 B), git-commit-smart (44.0/60 B). Lowest: otel-output-provenance (26.2/60 C), session-report (28.9/60 C).

Single-skill JSON output verified:
```
python3 scripts/skill-audit-scorer.py otel-session-summary --json --days 7
```

## Token Count Comparison

| File | ~Tokens | Chars |
|------|--------:|------:|
| `agent-auditor.md` | ~1,608 | 5,510 |
| `skill-auditor.md` | ~1,669 | 5,401 |
| `skill-audit-scorer.py` | ~8,600 | 26,311 |

The script is ~5x larger than either agent definition, but runs at zero LLM inference cost.

## Files Modified/Created

| File | Action | Lines |
|------|--------|------:|
| `scripts/skill-audit-scorer.py` | Created | 712 |
| `scripts/agent-audit-scorer.py` | Restored | 584 |
| `scripts/parse/agent-telemetry-audit.py` | Restored | 318 |
| `~/.claude/agents/agent-auditor.md` | Collapsed | 137 → 85 |
| `~/.claude/agents/skill-auditor.md` | Collapsed + rewrite phase | 146 → 89 |

## Decisions

- **Choice**: Self-contained skill scorer (no import of agent-telemetry-audit)
- **Rationale**: Plugin spans use different span names and attribute keys than agent spans; sharing the parser would require abstraction that adds complexity for minimal benefit
- **Alternative**: Refactor agent-telemetry-audit to support both span types
- **Trade-off**: ~50 lines of duplicated file-discovery logic

## References

- `scripts/skill-audit-scorer.py` — new skill scorer
- `scripts/agent-audit-scorer.py` — existing agent scorer (parallel structure)
- `~/.claude/agents/skill-auditor.md` — skill auditor agent definition
- `~/.claude/agents/agent-auditor.md` — agent auditor agent definition
- `src/lib/skill-auditor-scoring.ts` — TypeScript scoring module (shared functions)
- Commit `dfddc95` — session commit
