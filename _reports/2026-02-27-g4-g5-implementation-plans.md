---
layout: single
title: "G4/G5 Implementation Plans: Industry-Validated Roadmap Docs"
date: 2026-02-27
author_profile: true
categories: [observability-toolkit, documentation]
tags: [implementation-plan, evaluation-datasets, multi-agent-visualization, langfuse, reactflow, elkjs, otel]
excerpt: "Created research-validated implementation plans for two remaining roadmap gaps: evaluation dataset management (G4) and multi-agent workflow visualization (G5), grounded in cross-platform industry analysis."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-27<br>
**Project**: observability-toolkit<br>
**Focus**: Create and validate implementation plans for G4 (Evaluation Dataset Management) and G5 (Multi-Agent Workflow Visualization)<br>
**Session Type**: Documentation | Research

## Executive Summary

Created two comprehensive implementation documents for the final two known gaps in the observability-toolkit roadmap. Both plans were validated against industry standards via web research agents covering 5 platforms (Langfuse, Arize Phoenix, Braintrust, DeepEval/Confident AI, Datadog) and 4 graph visualization libraries (ReactFlow, d3-dag, dagre, ELKjs).

The session produced 597 lines of new documentation across 4 files, resolved a stale Langfuse characterization in `known-gaps.md`, corrected 9 stale source file references from a prior codebase refactor, and closed the G5 graph library research question (ReactFlow v12 + ELKjs, React 19 confirmed Oct 2025).

Two quality evaluation passes via LLM-as-Judge drove iterative improvements: the first pass (hallucination 0.12 CRITICAL) triggered a backport of stale line references; the second pass (hallucination 0.09 WARNING) triggered two targeted fixes (Langfuse characterization + tool count correction), bringing all metrics to acceptable thresholds.

| Metric | Value |
|--------|-------|
| Files created | 2 (impl-g4, impl-g5) |
| Files modified | 2 (known-gaps.md, README.md) |
| Lines added | 597 |
| Lines removed | 291 |
| Quality passes | 2 (LLM-as-Judge) |
| Platforms researched | 5 (Langfuse, Phoenix, Braintrust, DeepEval, Datadog) |
| Libraries evaluated | 4 (ReactFlow, d3-dag, dagre, ELKjs) |
| Stale refs corrected | 9 (known-gaps.md G5 section) |
| Commit | `59ff83d` |

## Problem Statement

The observability-toolkit roadmap had two remaining known gaps (G4, G5) with gap analysis in `known-gaps.md` but no actionable implementation plans. The existing research was partially stale: G5's source file references pointed to pre-refactor monolithic files, and Langfuse's Agent Graphs (GA Nov 2025) was not reflected in the competitive analysis.

## Implementation Details

### G4: Evaluation Dataset Management (`impl-g4-dataset-management.md`)

**Design pattern**: Langfuse immutable auto-versioning (validated Feb 2026).

Key findings from cross-platform research:

| Platform | Versioning | Version ID | Experiment link |
|----------|-----------|------------|-----------------|
| Langfuse | Immutable, auto on mutation | Timestamp | Auto-capture |
| Phoenix | Immutable, DatasetVersion + Revision | Explicit FK | FK in experiments table |
| Braintrust | Mutable with audit trail | Opaque | Opt-in `origin` field |
| DeepEval | No formal versioning | N/A | N/A |

**6-phase plan**: Extend types (versioning + `fieldMapping`) -> local backend storage (JSONL + `.idx`) -> MCP tool `obs_manage_datasets` (#18) -> experiment-to-version linkage (`DatasetRunRecord`) -> export integration (`datasetId` filter) -> tests (14 test cases).

**3 gaps found and addressed**:
1. Experiment-to-version linkage model (`dataset-runs.jsonl`) -- missing from original plan
2. `fieldMapping` for export interop (`input`/`expectedOutput` attribute paths) -- required by all platforms
3. Concurrency assumption documented (single-writer local backend, integer versioning safe)

**5 anti-patterns documented** from Braintrust/DeepEval gotchas: UI-only schema enforcement, opt-in experiment linkage, mutable version records, name-as-identifier, pre-populated actual_output.

### G5: Multi-Agent Workflow Visualization (`impl-g5-multi-agent-visualization.md`)

**Library decision resolved**: `@xyflow/react` v12 + ELKjs.

| Library | React 19 | Bundle | Maintenance | Verdict |
|---------|----------|--------|-------------|---------|
| ReactFlow v12 | Confirmed (Oct 2025) | ~150KB | Active (35.4K stars) | Selected |
| ELKjs | N/A (layout only) | ~100KB | Active (Eclipse) | Selected (layout) |
| d3-dag | N/A | ~30KB | Light maintenance | Rejected |
| dagre | N/A | ~30KB | Deprecated (2015) | Rejected |

**Key type changes**:
- `WorkflowDAG` renamed to `WorkflowGraph` -- real agent executions are cyclic (retry loops, reflection)
- `isMultiAgent: boolean` replaced with `workflowShape: WorkflowShape` enum (`single_agent | linear | branching | cyclic`)
- `totalTokens` added to `WorkflowNode` (Datadog standard)

**New capabilities added from research**:
- Span-inference fallback when `MultiAgentEvaluation` absent (Langfuse pattern)
- `<MiniMap />` for graphs with 5+ nodes (ReactFlow built-in)
- Accessibility: `aria-label`, keyboard nav, text labels on score badges (WCAG 1.4.1)

**5 anti-patterns documented**: flame chart for multi-agent, dagre as layout engine, rendering every span as a node, requiring explicit graph metadata, color-only score indicators.

### Quality-Driven Iteration

Two LLM-as-Judge passes drove targeted fixes:

**Pass 1** (hallucination 0.12 CRITICAL):
- `known-gaps.md` G5 had 9 stale source locations pointing to pre-refactor files
- Backported all corrections: `quality-metrics.ts` -> `quality-multi-agent.ts`, `agent-as-judge.ts` -> `agent-judge-*.ts`

**Pass 2** (hallucination 0.09 WARNING):
- `known-gaps.md` still characterized Langfuse as "no DAG/flowchart" -- updated to Agent Graphs GA Nov 2025
- `impl-g4` stated `manage-datasets.ts` was new (stub exists) and tool count was #17 (actually #18)

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| `docs/roadmap/impl-g4-dataset-management.md` | **Created** | ~260 |
| `docs/roadmap/impl-g5-multi-agent-visualization.md` | **Created** | ~280 |
| `docs/roadmap/known-gaps.md` | Corrected 9 stale refs, updated Langfuse, removed completed G1-G3/G6 | -291/+57 |
| `docs/roadmap/README.md` | Added impl plan links, updated status counts | +5/-7 |

## Git History

```
59ff83d docs(roadmap): add G4/G5 implementation plans with industry-validated research
```

## Decisions

**Choice**: Integer version numbers for dataset versioning (G4)<br>
**Rationale**: More user-friendly for `get_version` queries than Langfuse's timestamp model<br>
**Alternative**: Timestamp-based (Langfuse) or opaque UUID (Phoenix)<br>
**Trade-off**: Requires single-writer assumption (documented); no distributed lock needed for local backend

**Choice**: ReactFlow v12 + ELKjs for graph visualization (G5)<br>
**Rationale**: React 19 confirmed, full interactivity built-in, ELKjs handles cycles<br>
**Alternative**: d3-dag (light maintenance, no React bindings), dagre (deprecated)<br>
**Trade-off**: ~250KB combined bundle size, mitigated by lazy-loading via dynamic `import()`

**Choice**: Rename WorkflowDAG to WorkflowGraph (G5)<br>
**Rationale**: Real agent executions are cyclic; both Langfuse and Datadog explicitly handle cycles<br>
**Alternative**: Keep DAG naming with cycle-handling as an exception<br>
**Trade-off**: None -- type-level change only

## References

- `docs/roadmap/impl-g4-dataset-management.md` -- G4 implementation plan
- `docs/roadmap/impl-g5-multi-agent-visualization.md` -- G5 implementation plan
- `docs/roadmap/known-gaps.md` -- Gap analysis (source document)
- `docs/roadmap/README.md` -- Roadmap index
- `src/backends/index.ts:730-791` -- Existing DatasetRecord, DatasetManageOptions types
- `src/server.ts:21-39` -- 17-tool registry (manage-datasets not yet wired)
- `src/lib/quality-multi-agent.ts:27-185` -- MultiAgentEvaluation, HandoffEvaluation types
- [Langfuse Dataset Versioning (Dec 2025)](https://langfuse.com/changelog/2025-12-15-dataset-versioning)
- [Langfuse Agent Graphs (Nov 2025)](https://langfuse.com/changelog/2025-11-05-langfuse-for-agents)
- [ReactFlow React 19 + Tailwind 4 (Oct 2025)](https://reactflow.dev/whats-new/2025-10-28)
- [ReactFlow ELKjs example (Feb 2026)](https://reactflow.dev/examples/layout/elkjs)

---

## Appendix: OTEL Telemetry Provenance

*Tracing the full session lineage that produced `impl-g4-dataset-management.md` and `impl-g5-multi-agent-visualization.md`. Attribution method: keyword + temporal correlation against `~/.claude/telemetry/traces-*.jsonl`.*

### Session Timeline

```
19:52  ┌─ 449a970d  pre-session/setup        17 min  116 spans  Sonnet 4.6
20:03  ├─ cb0ef51e  stale-ref corrections    11 min   66 spans  Opus 4.6
20:17  ├─ 0aecbf4b  main (codebase research, ─────────────────────────────
       │             create G4/G5 docs,       85 min  519 spans  Opus + Sonnet
       │             web research agents,
       │             2× LLM-as-Judge,
20:34  │             commit 59ff83d)
21:42  └──────────────────────────────────────────────────────────────────
```

**Subagents within `0aecbf4b`** (Sonnet 4.6 model):
- Explore agent — codebase research (types, line numbers, component structure)
- webscraping-research-analyst × 2 — G4 platform comparison, G5 library evaluation
- genai-quality-monitor × 2 — LLM-as-Judge quality passes (pre-fix + post-fix)

### Quality Scorecard (Final Deliverable State)

```
--------------------------------------------------------
  Quality Scorecard  (aggregate across 3 sessions)
--------------------------------------------------------
  tool_correctness  ████████████████████  1.00   healthy
  eval_latency      ████████████████████  0.005s healthy
  task_completion   ████████████████████  1.00   healthy
  relevance         ███████████████████░  0.97   healthy
  faithfulness      ███████████████████░  0.95   healthy
  coherence         ███████████████████░  0.97   healthy
  hallucination     ███████████████████░  0.055 WARNING
--------------------------------------------------------
  Dashboard: WARNING — hallucination (0.055) in 0.05-0.10 range
  Residual: G4 "dateRange" field description collapses
  dateRangeStart / dateRangeEnd into a single entry
--------------------------------------------------------
```

### Per-Output LLM-as-Judge Scores (Post-Fix)

| File | rel | fai | coh | hal | Notes |
|------|-----|-----|-----|-----|-------|
| impl-g4-dataset-management.md | 0.97 | 0.91 | 0.96 | 0.07 | dateRange field description vs two actual fields |
| impl-g5-multi-agent-visualization.md | 0.97 | 0.98 | 0.97 | 0.04 | All 10 line refs exact; library decision grounded |
| **Session average** | **0.97** | **0.945** | **0.965** | **0.055** | |

### What the Judge Found

Both documents are high-quality implementation plans grounded firmly in the codebase: all 10 G5 line references and all G4 type/line references checked out exactly, with one minor G4 faithfulness gap where the current-state summary collapses `dateRangeStart`/`dateRangeEnd` into a single `dateRange` field. The multi-round LLM-as-Judge refinement is evident — anti-patterns tables, per-platform competitive comparisons, and acceptance criteria are precise and actionable rather than generic. Hallucination risk is low across both documents; the only unverifiable claims are platform release dates and library star counts, consistent with the stated research validation date.

### Session Telemetry

**Aggregate (3 sessions)**

| Metric | Value |
|--------|-------|
| Total spans | 701 |
| Tool spans | 446 |
| Sessions | 3 |
| Evaluations | 12 |
| Duration | ~113 min (19:52–21:42) |

**Tool profile**

| Tool | Uses |
|------|------|
| Read | 170 |
| Bash | 118 |
| Edit | 59 |
| Grep | 45 |
| TaskUpdate | 25 |
| TaskCreate | 10 |
| Glob | 14 |
| Write | 5 |

**Per-session rule-based metrics**

| Session | Role | Spans | tool_correctness | eval_latency | task_completion |
|---------|------|-------|-----------------|--------------|-----------------|
| 449a970d | pre/setup | 116 | 1.000 | 0.005s | 1.00 |
| cb0ef51e | corrections | 66 | 1.000 | 0.004s | n/a |
| 0aecbf4b | main | 519 | 0.997 | 0.005s | 1.00 |
| **Aggregate** | | **701** | **0.998** | **0.005s** | **1.00** |

**Token usage by model**

| Model | Calls | Input | Output | Cache Read | Cache Create |
|-------|-------|-------|--------|------------|--------------|
| claude-opus-4-6 | 60 | 33.8K | 292K | 87.8M | 4.9M |
| claude-sonnet-4-6 | 21 | 17.5K | 216K | 61.0M | 3.3M |
| claude-haiku-4-5 | 1 | <1K | <1K | — | 100K |
| synthetic (est.) | 5 | 15.1K | 92K | 18.7M | 1.5M |

*Sonnet usage reflects Explore + webscraping + genai-quality-monitor subagents within session `0aecbf4b`.*

### Methodology

- **Session discovery**: keyword + temporal correlation against `~/.claude/telemetry/traces-*.jsonl` for 2026-02-27 commit window (commit `59ff83d` at 20:34)
- **Metric extraction**: `aggregate-metrics.py` — spans, tools, token counts from hook spans
- **LLM-as-Judge**: `genai-quality-monitor` agent (Sonnet 4.6), G-Eval pattern, final post-fix pass
- **Quality passes**: 2 iterative rounds during session (hallucination 0.12 → 0.09 → 0.055 final)
- **Attribution caveat**: subagent spans attributed to parent session `0aecbf4b` by temporal containment; synthetic model entries are time-window estimates for sessions without explicit session.id on token spans
