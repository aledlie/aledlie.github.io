---
layout: single
title: "Implementation Plan: Self-Optimizing Agent Performance with Session Telemetry"
date: 2026-02-14
categories: [implementation]
tags: [agents, telemetry, self-optimization, performance-tracking, opentelemetry, llm-as-judge]
---

A comprehensive implementation plan for building a self-optimizing agent performance system that uses session telemetry data to track, analyze, and continuously improve agent performance over time.

## Executive Summary

The Edgar & Nadyne translation session post-mortem revealed critical performance gaps: 8.6 hours for 3 translations, 998:1 input-to-output ratio, 63% task management overhead, and a task completion rate of 0.83. These issues stem from a fundamental problem: **no historical performance tracking across sessions**. Each session starts fresh with no knowledge of past efficiency or quality patterns.

This document outlines a system that closes the feedback loop by:
- Establishing performance baselines per agent type
- Automatically analyzing session telemetry post-execution
- Generating optimization suggestions based on performance deltas
- Injecting learned optimizations into future sessions
- Tracking effectiveness and auto-promoting successful patterns

The goal: transform reactive post-mortems into proactive, continuous improvement.

## Problem Statement

Current state limitations:
- **No baseline tracking**: No historical context for "good" vs "poor" performance
- **No trend detection**: Cannot identify gradual performance degradation
- **No feedback loop**: Insights from post-mortems don't automatically improve future sessions
- **Manual analysis**: Performance reviews are time-intensive and inconsistent
- **Reactive optimization**: Problems discovered only after expensive failures

Target state capabilities:
- Automated KPI tracking across all sessions
- Real-time performance comparison against historical baselines
- Automatic optimization suggestion generation
- Self-learning feedback loop with impact tracking
- Proactive alerts for performance regressions

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                     Session Lifecycle                              |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|  Session Start Hook                                               |
|  - Load baselines for agent type                                  |
|  - Inject active optimization suggestions                         |
|  - Set performance expectations                                   |
+------------------------------------------------------------------+
                              |
                              v
                        +-----------+
                        |  Session  |
                        | Execution |
                        +-----------+
                              |
                              v
+------------------------------------------------------------------+
|  Session Stop Hook                                                |
|  - Export telemetry (traces, evaluations, logs)                   |
|  - Trigger performance analyzer agent                             |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|  Performance Analyzer Agent (session-perf-analyzer)               |
|  - Parse telemetry JSONL files                                    |
|  - Compute KPIs (token efficiency, task completion, etc.)         |
|  - Compare against baselines                                      |
|  - Generate delta report + optimization suggestions               |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|  Feedback Loop                                                    |
|  - Store KPI history (append-only JSONL)                          |
|  - Update baselines (exponential moving average)                  |
|  - Activate top 3 optimization suggestions                        |
|  - Track suggestion impact over next 3 sessions                   |
|  - Auto-promote effective suggestions to agent config             |
|  - Auto-retire ineffective suggestions                            |
+------------------------------------------------------------------+
```

---

## Component 1: Performance Baseline System

### Problem

No historical performance tracking across sessions. Each session starts fresh with no knowledge of past efficiency or quality.

### Design

#### Key Performance Indicators (KPIs)

Define per-agent-type KPIs with thresholds based on E&N session learnings:

| KPI | Formula | E&N Session | Target | Warning | Critical |
|-----|---------|-------------|--------|---------|----------|
| **Token Efficiency** | output_tokens / total_tokens | 0.001 | > 0.05 | < 0.02 | < 0.01 |
| **Task Completion Rate** | completed_tasks / created_tasks | 0.83 | > 0.95 | < 0.85 | < 0.70 |
| **Active Time Ratio** | active_time / wall_clock_time | ~20% | > 60% | < 40% | < 20% |
| **Tool Overhead Ratio** | management_tool_calls / productive_tool_calls | 1.73:1 | < 0.5:1 | > 1.0:1 | > 2.0:1 |
| **Cache Efficiency** | cache_hits / total_reads | 98.3% | > 90% | < 80% | < 70% |
| **Error Rate** | failed_operations / total_operations | 0% | 0% | > 0.05 | > 0.10 |
| **Quality: Relevance** | LLM-as-Judge score (p50) | 0.95 | > 0.90 | < 0.70 | < 0.50 |
| **Quality: Faithfulness** | LLM-as-Judge score (p50) | 0.94 | > 0.90 | < 0.80 | < 0.60 |
| **Quality: Coherence** | LLM-as-Judge score (p50) | 0.93 | > 0.90 | < 0.75 | < 0.60 |
| **Quality: Hallucination** | LLM-as-Judge score (avg) | 0.03 | < 0.05 | > 0.10 | > 0.20 |

#### Baseline Storage Schema

Store baselines in `~/.claude/telemetry/baselines/{agent-type}.json`:

```json
{
  "agent_type": "translation-agent",
  "version": "1.0.0",
  "last_updated": "2026-02-14T12:00:00Z",
  "session_count": 12,
  "baselines": {
    "token_efficiency": {
      "mean": 0.048,
      "std_dev": 0.012,
      "p50": 0.047,
      "p95": 0.062,
      "p99": 0.068
    },
    "task_completion_rate": {
      "mean": 0.96,
      "std_dev": 0.03,
      "p50": 0.97,
      "p95": 0.99,
      "p99": 1.00
    },
    "active_time_ratio": {
      "mean": 0.68,
      "std_dev": 0.08,
      "p50": 0.70,
      "p95": 0.82,
      "p99": 0.88
    },
    "tool_overhead_ratio": {
      "mean": 0.42,
      "std_dev": 0.11,
      "p50": 0.40,
      "p95": 0.60,
      "p99": 0.72
    },
    "cache_efficiency": {
      "mean": 0.94,
      "std_dev": 0.04,
      "p50": 0.95,
      "p95": 0.98,
      "p99": 0.99
    },
    "error_rate": {
      "mean": 0.01,
      "std_dev": 0.02,
      "p50": 0.00,
      "p95": 0.04,
      "p99": 0.06
    },
    "quality_relevance": {
      "mean": 0.94,
      "std_dev": 0.02,
      "p50": 0.95,
      "p95": 0.97,
      "p99": 0.98
    },
    "quality_faithfulness": {
      "mean": 0.93,
      "std_dev": 0.03,
      "p50": 0.94,
      "p95": 0.97,
      "p99": 0.98
    },
    "quality_coherence": {
      "mean": 0.92,
      "std_dev": 0.03,
      "p50": 0.93,
      "p95": 0.96,
      "p99": 0.97
    },
    "quality_hallucination": {
      "mean": 0.04,
      "std_dev": 0.02,
      "p50": 0.03,
      "p95": 0.07,
      "p99": 0.09
    }
  }
}
```

#### Baseline Update Strategy

Use exponential moving average (EMA) to balance historical trends with recent performance:

{% raw %}
```typescript
function updateBaseline(
  currentBaseline: Baseline,
  newSessionKPIs: KPIs,
  alpha: number = 0.2
): Baseline {
  const updated: Baseline = { ...currentBaseline };

  for (const [metric, stats] of Object.entries(currentBaseline.baselines)) {
    const newValue = newSessionKPIs[metric as keyof KPIs];
    updated.baselines[metric] = {
      mean: alpha * newValue + (1 - alpha) * stats.mean,
      std_dev: updateStdDev(stats, newValue),
      p50: updatePercentile(stats.p50, newValue, 0.5),
      p95: updatePercentile(stats.p95, newValue, 0.95),
      p99: updatePercentile(stats.p99, newValue, 0.99)
    };
  }

  updated.session_count += 1;
  updated.last_updated = new Date().toISOString();
  return updated;
}
```
{% endraw %}

#### Initial Baseline Bootstrapping

For new agent types with < 5 sessions, use conservative defaults:

```json
{
  "agent_type": "new-agent",
  "version": "1.0.0",
  "session_count": 0,
  "baselines": {
    "token_efficiency": { "mean": 0.03, "std_dev": 0.02, "status": "bootstrap" },
    "task_completion_rate": { "mean": 0.90, "std_dev": 0.10, "status": "bootstrap" },
    "active_time_ratio": { "mean": 0.50, "std_dev": 0.15, "status": "bootstrap" }
  },
  "bootstrap_threshold": 5
}
```

---

## Component 2: Session Performance Analyzer Agent

### Agent Specification

**Name**: `session-perf-analyzer`
**Type**: Post-session background agent
**Trigger**: Automatic on session stop hook
**Timeout**: 5 minutes
**Model**: Claude Sonnet 4.5 (cost-efficient for analysis)

### Agent Input/Output Contract

**Input**: Session ID + telemetry file paths
**Output**: Performance report with:
- KPI scores vs baselines (with delta and trend direction)
- Regression alerts (any KPI > 1 std dev below baseline)
- Improvement suggestions ranked by impact
- Updated baseline recommendations

### KPI Computation from Telemetry

The analyzer reads the existing JSONL telemetry files. Trace spans follow OpenTelemetry format with these key attributes from `traces-{date}.jsonl`:

- **Token metrics** (span name `hook:token-metrics-extraction`):
  - `tokens.input`, `tokens.output`, `tokens.cache_read`, `tokens.cache_creation`
  - `tokens.messages`, `tokens.model`
- **Tool calls** (span name `hook:builtin-post-tool`):
  - `builtin.tool` (Edit, Read, Write, Bash, TaskCreate, TaskUpdate, etc.)
  - `builtin.category` (file, task, etc.)
  - `builtin.success`, `builtin.has_error`
- **MCP calls** (span name `hook:mcp-post-tool`):
  - `mcp.server`, `mcp.tool`, `mcp.success`
- **Context utilization** (span name `hook:skill-activation-prompt`):
  - `context.total_tokens`, `context.utilization_percent`, `context.free_space`
  - `context.breakdown.system_prompt`, `context.breakdown.messages`

Evaluations from `evaluations-{date}.jsonl` follow this format:

- `gen_ai.evaluation.name`: metric name (tool_correctness, evaluation_latency, relevance, faithfulness, coherence, hallucination)
- `gen_ai.evaluation.score.value`: numeric score
- `gen_ai.evaluation.evaluator`: "telemetry-rule-engine" or "llm-judge"
- `gen_ai.evaluation.evaluator.type`: "rule" or "llm"
- `session.id`: session identifier

### KPI Computation Logic

{% raw %}
```
Token Efficiency:
  output_tokens = sum(traces where name == "hook:token-metrics-extraction"
                      → attributes.tokens.output)
  total_tokens  = sum(tokens.input + tokens.output + tokens.cache_read)
  efficiency    = output_tokens / total_tokens

Task Completion Rate:
  task_creates   = count(traces where builtin.tool == "TaskCreate")
  task_updates   = count(traces where builtin.tool == "TaskUpdate")
  completion     = task_updates / (task_creates * expected_updates_per_task)

Active Time Ratio:
  session_start  = min(traces.startTime)
  session_end    = max(traces.endTime)
  wall_clock     = session_end - session_start
  active_spans   = filter(traces where duration > 1s)
  active_time    = sum(active_spans.duration)
  active_ratio   = active_time / wall_clock

Tool Overhead Ratio:
  management     = count(builtin.tool in [TaskCreate, TaskUpdate, TaskDelete])
  productive     = count(builtin.tool in [Read, Write, Edit, Bash])
  overhead       = management / productive

Cache Efficiency:
  cache_hits     = sum(tokens.cache_read)
  total_reads    = sum(tokens.input + tokens.cache_read)
  cache_eff      = cache_hits / total_reads

Error Rate:
  failed_ops     = count(traces where status.code != 1)
  total_ops      = count(all traces)
  error_rate     = failed_ops / total_ops

Quality Metrics:
  Extract from evaluations JSONL where evaluator.type == "llm":
  - relevance     → p50 of score.value
  - faithfulness  → p50 of score.value
  - coherence     → p50 of score.value
  - hallucination → avg of score.value
```
{% endraw %}

### Optimization Suggestion Rules

| Condition | Suggestion | Priority | Expected Impact |
|-----------|------------|----------|-----------------|
| tool_overhead_ratio > 1.0 | Batch task operations: create all tasks in single TaskCreate call | HIGH | ~50% reduction in management calls |
| token_efficiency < 0.02 | Use background agents for independent work units | CRITICAL | 10-20x improvement in token efficiency |
| active_time_ratio < 0.40 | Set session timeout at 30 minutes idle, implement auto-hibernation | MEDIUM | Reclaim idle resources |
| agent_type == "translation" AND read_count < doc_count | Pre-load all source documents and voice profiles at session start | HIGH | Reduce hallucination, improve faithfulness |
| task_completion_rate < 0.85 | Implement auto-close logic: when Write completes, close associated task | MEDIUM | Improve work tracking hygiene |
| cache_efficiency < 0.80 | Review prompt structure for cache-friendly patterns | LOW | Reduce API costs 50-80% |

### Performance Delta Report Format

Generated at `~/.claude/telemetry/reports/{session-id}.md`:

```
# Session Performance Report

**Session ID**: d1d142a6
**Agent Type**: translation-agent
**Date**: 2026-02-12
**Model**: Claude Opus 4.6
**Status**: CRITICAL

## KPI Summary

| Metric             | Actual | Baseline      | Delta          | Status     |
|--------------------|--------|---------------|----------------|------------|
| Token Efficiency   | 0.001  | 0.047 +/- 0.012 | -0.046 (-97.9%) | CRITICAL |
| Task Completion    | 0.83   | 0.96 +/- 0.03   | -0.13 (-13.5%)  | WARNING  |
| Active Time Ratio  | 0.22   | 0.68 +/- 0.08   | -0.46 (-67.6%)  | CRITICAL |
| Tool Overhead      | 1.73   | 0.42 +/- 0.11   | +1.31 (+311%)   | CRITICAL |
| Cache Efficiency   | 0.983  | 0.94 +/- 0.04   | +0.043 (+4.6%)  | PASS     |

## Regressions Detected

1. CRITICAL: Token Efficiency - 3.8 std dev below baseline
2. CRITICAL: Active Time Ratio - 5.8 std dev below baseline
3. CRITICAL: Tool Overhead - 11.9 std dev above baseline
4. WARNING: Task Completion - 4.3 std dev below baseline

## Optimization Suggestions (Ranked by Impact)

1. [CRITICAL] Use background agents for translation work
2. [HIGH] Batch task operations to reduce overhead
3. [HIGH] Pre-load all source documents at session start
4. [MEDIUM] Implement auto-close logic for tasks
5. [MEDIUM] Set 30-minute idle timeout with auto-hibernation
```

### Optimization Suggestions Output Schema

Written to `~/.claude/telemetry/optimizations/{session-id}.json`:

```json
{
  "session_id": "d1d142a6-51f3-49d3-b283-c00093880453",
  "agent_type": "translation-agent",
  "date": "2026-02-14T12:00:00Z",
  "suggestions": [
    {
      "id": "opt-001",
      "priority": "CRITICAL",
      "category": "architecture",
      "title": "Use background agents for translation work",
      "description": "Launch dedicated agent per document with pre-loaded context",
      "impact": "10-20x improvement in token efficiency",
      "evidence": "Current 998:1 input-to-output ratio",
      "implementation": "Modify session-start hook to spawn background agents",
      "activation_status": "active",
      "tracking": {
        "activated_at": "2026-02-14T12:00:00Z",
        "sessions_tracked": 0,
        "sessions_target": 3,
        "impact_measured": null
      }
    },
    {
      "id": "opt-002",
      "priority": "HIGH",
      "category": "tooling",
      "title": "Batch task operations to reduce overhead",
      "description": "Create all tasks in single TaskCreate call with JSON array",
      "impact": "~50% reduction in management tool calls",
      "evidence": "26 of 41 tools (63%) were TaskCreate/TaskUpdate",
      "implementation": "Update task creation patterns in agent prompts",
      "activation_status": "active",
      "tracking": {
        "activated_at": "2026-02-14T12:00:00Z",
        "sessions_tracked": 0,
        "sessions_target": 3,
        "impact_measured": null
      }
    },
    {
      "id": "opt-003",
      "priority": "HIGH",
      "category": "workflow",
      "title": "Pre-load all source documents at session start",
      "description": "Load source docs + voice profiles before translation begins",
      "impact": "Reduce hallucination, improve faithfulness",
      "evidence": "Only 1 Read call for 3 documents",
      "implementation": "Add pre-load step to session-start hook",
      "activation_status": "active",
      "tracking": {
        "activated_at": "2026-02-14T12:00:00Z",
        "sessions_tracked": 0,
        "sessions_target": 3,
        "impact_measured": null
      }
    }
  ]
}
```

---

## Component 3: Optimization Feedback Loop

### How the System Learns Over Time

```
Session N  -->  Telemetry  -->  Performance Analyzer  -->  Delta Report
                                                               |
                                                    Optimization Suggestions
                                                               |
                                                       Updated Baselines
                                                               |
                                            Active Suggestions (top 3 in active.json)
                                                               |
Session N+1  -->  Pre-loaded with: baselines + active suggestions
                                                               |
                  Execute with suggestions in context
                                                               |
Session N+1  -->  Telemetry  -->  Performance Analyzer  -->  Measure Impact
                                                               |
                               Track: Did KPIs improve? By how much?
                                                               |
                               Update suggestion.tracking.impact_measured
                                                               |
                  After 3 sessions: Evaluate effectiveness
                                                               |
                         +------------------+------------------+
                         |                                     |
                    EFFECTIVE                            INEFFECTIVE
                  (KPIs improved                       (No improvement
                   > 20% in 2/3                         or regression)
                    sessions)                                  |
                         |                                     v
                         v                            Retire suggestion
              Promote to permanent                  Remove from active.json
               agent config file
                         |
                         v
                Update ~/.claude/agents/{agent-type}.md
                Add as permanent optimization pattern
```

### Active Suggestions Storage

Store at `~/.claude/telemetry/optimizations/active.json`:

```json
{
  "version": "1.0.0",
  "last_updated": "2026-02-14T12:00:00Z",
  "suggestions": [
    {
      "id": "opt-001",
      "source_session": "d1d142a6",
      "agent_type": "translation-agent",
      "activated_at": "2026-02-14T12:00:00Z",
      "title": "Use background agents for translation work",
      "implementation_guidance": "Launch dedicated agent per document with pre-loaded context",
      "expected_impact": {
        "kpi": "token_efficiency",
        "direction": "increase",
        "magnitude": "10-20x"
      },
      "tracking": {
        "sessions_applied": ["abc123", "def456", "ghi789"],
        "session_count": 3,
        "impact_results": [
          { "session": "abc123", "kpi_before": 0.001, "kpi_after": 0.042, "delta": "+4100%" },
          { "session": "def456", "kpi_before": 0.042, "kpi_after": 0.051, "delta": "+21%" },
          { "session": "ghi789", "kpi_before": 0.051, "kpi_after": 0.048, "delta": "-6%" }
        ],
        "effectiveness": "PROVEN",
        "avg_improvement": "+1372%",
        "promotion_eligible": true
      }
    }
  ]
}
```

### Session-Start Hook Integration

Modify `~/.claude/hooks/src/hooks/session-start.ts` to inject optimization context:

{% raw %}
```typescript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ActiveSuggestion {
  id: string;
  agent_type: string;
  title: string;
  implementation_guidance: string;
  expected_impact: {
    kpi: string;
    direction: string;
    magnitude: string;
  };
}

export async function injectOptimizations(
  sessionId: string,
  agentType: string
): Promise<string> {
  const activePath = join(
    process.env.HOME!,
    '.claude/telemetry/optimizations/active.json'
  );

  if (!existsSync(activePath)) return '';

  const active = JSON.parse(readFileSync(activePath, 'utf-8'));
  const suggestions = active.suggestions.filter(
    (s: ActiveSuggestion) => s.agent_type === agentType
  );

  if (suggestions.length === 0) return '';

  let context = '\n## Active Performance Optimizations\n\n';
  context += 'Based on recent session analysis, apply these optimizations:\n\n';

  for (const suggestion of suggestions) {
    context += `### ${suggestion.title}\n`;
    context += `- **Implementation**: ${suggestion.implementation_guidance}\n`;
    context += `- **Expected Impact**: ${suggestion.expected_impact.magnitude} `;
    context += `${suggestion.expected_impact.direction} in ${suggestion.expected_impact.kpi}\n\n`;
  }

  return context;
}

export async function loadBaselines(agentType: string): Promise<string> {
  const baselinePath = join(
    process.env.HOME!,
    '.claude/telemetry/baselines',
    `${agentType}.json`
  );

  if (!existsSync(baselinePath)) return '';

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));

  let context = '\n## Performance Baselines\n\n';
  context += `Your historical performance for ${agentType}:\n\n`;
  context += '| Metric | Target | Your Average | Your p95 |\n';
  context += '|--------|--------|--------------|----------|\n';

  const targets: Record<string, string> = {
    token_efficiency: '> 0.05',
    task_completion_rate: '> 0.95',
    active_time_ratio: '> 0.60',
    tool_overhead_ratio: '< 0.50',
    cache_efficiency: '> 0.90',
    error_rate: '0%',
    quality_relevance: '> 0.90',
    quality_faithfulness: '> 0.90',
    quality_coherence: '> 0.90',
    quality_hallucination: '< 0.05'
  };

  for (const [metric, stats] of Object.entries(baseline.baselines) as [string, any][]) {
    const target = targets[metric] || '--';
    const name = metric.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    context += `| ${name} | ${target} | ${stats.mean.toFixed(3)} | ${stats.p95.toFixed(3)} |\n`;
  }

  context += '\nAim to meet or exceed your p95 performance.\n';
  return context;
}
```
{% endraw %}

### Impact Tracking Logic

{% raw %}
```typescript
export function trackSuggestionImpact(
  sessionId: string,
  suggestions: ActiveSuggestion[],
  sessionKPIs: KPIs,
  baselineKPIs: Baseline
): void {
  for (const suggestion of suggestions) {
    const targetKPI = suggestion.expected_impact.kpi;
    const actual = sessionKPIs[targetKPI as keyof KPIs] as number;
    const baseline = baselineKPIs.baselines[targetKPI].mean;
    const delta = ((actual - baseline) / baseline) * 100;

    suggestion.tracking.sessions_applied.push(sessionId);
    suggestion.tracking.session_count += 1;
    suggestion.tracking.impact_results.push({
      session: sessionId,
      kpi_before: baseline,
      kpi_after: actual,
      delta: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
    });

    if (suggestion.tracking.session_count >= 3) {
      evaluateSuggestionEffectiveness(suggestion);
    }
  }

  saveActiveSuggestions(suggestions);
}

function evaluateSuggestionEffectiveness(suggestion: ActiveSuggestion): void {
  const results = suggestion.tracking.impact_results;
  const improvements = results.filter((r: any) => {
    const delta = parseFloat(r.delta);
    return suggestion.expected_impact.direction === 'increase'
      ? delta > 20
      : delta < -20;
  });

  const successRate = improvements.length / results.length;

  if (successRate >= 0.67) {
    suggestion.tracking.effectiveness = 'PROVEN';
    suggestion.tracking.promotion_eligible = true;
    promoteSuggestionToPermanent(suggestion);
  } else {
    suggestion.tracking.effectiveness = 'INEFFECTIVE';
    suggestion.tracking.promotion_eligible = false;
    retireSuggestion(suggestion);
  }
}

function promoteSuggestionToPermanent(suggestion: ActiveSuggestion): void {
  const agentConfigPath = join(
    process.env.HOME!,
    '.claude/agents',
    `${suggestion.agent_type}.md`
  );

  let config = readFileSync(agentConfigPath, 'utf-8');
  config += `\n## Optimization: ${suggestion.title}\n\n`;
  config += `**Proven Effective** (${suggestion.tracking.avg_improvement} avg improvement)\n\n`;
  config += `${suggestion.implementation_guidance}\n\n`;

  writeFileSync(agentConfigPath, config);
}

function retireSuggestion(suggestion: ActiveSuggestion): void {
  suggestion.tracking.retirement_reason = 'No significant impact after 3 sessions';
  // Remove from active.json during next save cycle
}
```
{% endraw %}

---

## Component 4: Time-Series Performance Dashboard

### History Storage

Store KPI history in append-only JSONL at `~/.claude/telemetry/history/kpis.jsonl`:

{% raw %}
```jsonl
{"session_id":"d1d142a6","date":"2026-02-12T18:28:00Z","agent_type":"translation-agent","model":"claude-opus-4-6","duration_seconds":30960,"kpis":{"token_efficiency":0.001,"task_completion_rate":0.83,"active_time_ratio":0.22,"tool_overhead_ratio":1.73,"cache_efficiency":0.983,"error_rate":0.00,"quality_relevance":0.95,"quality_faithfulness":0.94,"quality_coherence":0.93,"quality_hallucination":0.03},"baselines":{"token_efficiency":0.047,"task_completion_rate":0.96,"active_time_ratio":0.68,"tool_overhead_ratio":0.42},"optimizations_active":[],"alert_level":"CRITICAL"}
{"session_id":"def456","date":"2026-02-14T10:15:00Z","agent_type":"translation-agent","model":"claude-opus-4-6","duration_seconds":1800,"kpis":{"token_efficiency":0.042,"task_completion_rate":0.97,"active_time_ratio":0.71,"tool_overhead_ratio":0.38,"cache_efficiency":0.961,"error_rate":0.00,"quality_relevance":0.96,"quality_faithfulness":0.95,"quality_coherence":0.94,"quality_hallucination":0.02},"baselines":{"token_efficiency":0.046,"task_completion_rate":0.96,"active_time_ratio":0.68,"tool_overhead_ratio":0.42},"optimizations_active":["opt-001","opt-003"],"alert_level":"PASS"}
```
{% endraw %}

### Trend Detection

Detect 3+ consecutive sessions below baseline:

{% raw %}
```typescript
export function detectPerformanceDegradation(
  agentType: string,
  metric: string,
  windowSize: number = 3
): boolean {
  const history = loadKPIHistory(agentType);
  const recentSessions = history.slice(-windowSize);

  if (recentSessions.length < windowSize) return false;

  let consecutiveBelowBaseline = 0;

  for (const session of recentSessions) {
    const actual = session.kpis[metric];
    const baseline = session.baselines[metric];

    // For hallucination and error_rate, higher is worse
    const isRegression = ['quality_hallucination', 'error_rate', 'tool_overhead_ratio']
      .includes(metric)
      ? actual > baseline
      : actual < baseline;

    if (isRegression) {
      consecutiveBelowBaseline++;
    } else {
      consecutiveBelowBaseline = 0;
    }
  }

  return consecutiveBelowBaseline >= windowSize;
}
```
{% endraw %}

### ASCII Trend Charts

Generate in performance reports:

```
Token Efficiency Trend (last 10 sessions)

0.06 |                            .---.
     |                        .---'   '-.
0.05 |                     .--'          '-
     |                  .--'
0.04 |               .--'
     |            .--'
0.03 |         .--'
     |      .--'
0.02 |   .--'
     |.--'
0.01 +---------------------------------------
     s1  s2  s3  s4  s5  s6  s7  s8  s9  s10

Baseline (p50): 0.047 - - - - - - - - -
Current: 0.042 (trending toward baseline)
```

### Weekly Performance Summary

Generate automated weekly report at `~/.claude/telemetry/reports/weekly-{date}.md`:

```markdown
# Weekly Performance Summary: Feb 8-14, 2026

## Overview

- **Total Sessions**: 23
- **Agent Types**: translation-agent (8), code-reviewer (7),
  webscraping-research-analyst (5), genai-quality-monitor (3)
- **Total Tokens**: 12.4M (8.2M cached, 66% hit rate)
- **Estimated Cost**: $84.32 (vs $312.45 without caching)

## Top Performers (vs baseline)

1. **code-reviewer** - Token efficiency +18% above baseline
2. **genai-quality-monitor** - Task completion 100% (target 95%)
3. **translation-agent** - Cache efficiency 98.1% (p99 performance)

## Regressions Detected

1. **translation-agent** - Active time ratio -47% below baseline (3 consecutive)
2. **webscraping-research-analyst** - Error rate 12% (critical threshold 10%)

## Active Optimizations

- **opt-001**: Background agents (2/3 sessions tracked, +41x avg improvement)
- **opt-002**: Batch task ops (3/3 sessions tracked, no impact -- retiring)
- **opt-003**: Pre-load source docs (1/3 sessions tracked)

## Recommendations

1. Investigate webscraping-research-analyst error rate spike
2. Promote opt-001 to permanent translation-agent config
3. Add idle timeout for translation sessions
```

---

## Component 5: Alert Escalation Rules

### Rule Matrix

| Condition | Action | Priority |
|-----------|--------|----------|
| KPI regression < 1 std dev | Log to telemetry, no alert | INFO |
| KPI regression 1-2 std dev | Warning banner in next session start | WARNING |
| KPI regression > 2 std dev | Block session start, require review | CRITICAL |
| 3+ consecutive regressions | Generate incident report, notify user | CRITICAL |
| Token efficiency < 0.01 | Recommend agent restructuring | CRITICAL |
| Task completion < 0.70 | Investigate compaction/tracking bug | CRITICAL |
| Error rate > 0.10 | Block session, review error logs | CRITICAL |
| Active time ratio < 0.20 | Recommend timeout/hibernation | MEDIUM |
| Tool overhead > 2.0 | Recommend workflow restructuring | HIGH |

### Implementation

{% raw %}
```typescript
interface Alert {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metric: string;
  message: string;
  action: string;
  value?: number;
  baseline?: number;
  recommendation?: string;
  trend?: string;
}

export function evaluateAlertRules(
  agentType: string,
  recentKPIs: KPIs,
  baseline: Baseline
): Alert[] {
  const alerts: Alert[] = [];

  for (const [metric, value] of Object.entries(recentKPIs)) {
    const baselineStat = baseline.baselines[metric];
    if (!baselineStat) continue;

    const deviation = Math.abs(
      (value as number) - baselineStat.mean
    ) / baselineStat.std_dev;

    if (deviation > 2.0) {
      alerts.push({
        severity: 'CRITICAL',
        metric,
        message: `${metric} is ${deviation.toFixed(1)} std dev from baseline`,
        action: 'BLOCK_SESSION',
        value: value as number,
        baseline: baselineStat.mean
      });
    } else if (deviation > 1.0) {
      alerts.push({
        severity: 'WARNING',
        metric,
        message: `${metric} is ${deviation.toFixed(1)} std dev from baseline`,
        action: 'WARN',
        value: value as number,
        baseline: baselineStat.mean
      });
    }
  }

  // Check consecutive regressions
  const trendMetrics = [
    'token_efficiency',
    'task_completion_rate',
    'active_time_ratio'
  ];
  for (const metric of trendMetrics) {
    if (detectPerformanceDegradation(agentType, metric)) {
      alerts.push({
        severity: 'CRITICAL',
        metric,
        message: `3+ consecutive sessions below baseline for ${metric}`,
        action: 'GENERATE_INCIDENT_REPORT',
        trend: 'degrading'
      });
    }
  }

  // Specific hard thresholds
  if (recentKPIs.token_efficiency < 0.01) {
    alerts.push({
      severity: 'CRITICAL',
      metric: 'token_efficiency',
      message: 'Extremely low token efficiency suggests architectural issue',
      action: 'RECOMMEND_AGENT_RESTRUCTURING',
      value: recentKPIs.token_efficiency,
      recommendation: 'Consider background agents or context pre-loading'
    });
  }

  if (recentKPIs.task_completion_rate < 0.70) {
    alerts.push({
      severity: 'CRITICAL',
      metric: 'task_completion_rate',
      message: 'Task completion failure suggests tracking bug',
      action: 'INVESTIGATE_COMPACTION',
      value: recentKPIs.task_completion_rate,
      recommendation: 'Review context compaction logs and task lifecycle'
    });
  }

  return alerts;
}

export function handleAlerts(alerts: Alert[]): void {
  const critical = alerts.filter(a => a.severity === 'CRITICAL');

  if (critical.some(a => a.action === 'BLOCK_SESSION')) {
    console.error('\nSESSION BLOCKED: Critical performance regression detected\n');
    for (const alert of critical) {
      console.error(`  ${alert.metric}: ${alert.message}`);
      if (alert.value !== undefined) {
        console.error(`    Actual: ${alert.value}, Baseline: ${alert.baseline}\n`);
      }
    }
    console.error('Review ~/.claude/telemetry/reports/ before continuing.\n');
    process.exit(1);
  }

  const warnings = alerts.filter(a => a.severity === 'WARNING');
  if (warnings.length > 0) {
    console.warn('\nPerformance warnings:\n');
    for (const alert of warnings) {
      console.warn(`  ${alert.metric}: ${alert.message}`);
    }
    console.warn('');
  }
}
```
{% endraw %}

### Incident Report Generation

For 3+ consecutive regressions:

{% raw %}
```typescript
export function generateIncidentReport(
  agentType: string,
  metric: string,
  sessions: HistoryEntry[]
): void {
  const reportPath = join(
    process.env.HOME!,
    '.claude/telemetry/incidents',
    `${agentType}-${metric}-${Date.now()}.md`
  );

  let report = `# Performance Incident: ${agentType} - ${metric}\n\n`;
  report += `**Detected**: ${new Date().toISOString()}\n`;
  report += `**Pattern**: 3+ consecutive sessions below baseline\n\n`;
  report += `## Session History\n\n`;
  report += `| Session | Date | Actual | Baseline | Delta |\n`;
  report += `|---------|------|--------|----------|-------|\n`;

  for (const session of sessions) {
    const actual = session.kpis[metric as keyof KPIs] as number;
    const baseline = session.baselines[metric];
    const delta = ((actual - baseline) / baseline * 100).toFixed(1);
    report += `| ${session.session_id} | ${session.date} `;
    report += `| ${actual.toFixed(3)} | ${baseline.toFixed(3)} | ${delta}% |\n`;
  }

  report += `\n## Recommended Actions\n\n`;
  report += `1. Review session telemetry for common failure patterns\n`;
  report += `2. Check for recent changes to agent config or prompts\n`;
  report += `3. Verify infrastructure health (API latency, rate limits)\n`;
  report += `4. Consider rolling back recent optimization suggestions\n`;

  writeFileSync(reportPath, report);
}
```
{% endraw %}

---

## Component 6: Integration with Existing Infrastructure

### claude-code-hooks Integration

The system hooks into the existing `claude-code-hooks` lifecycle. New modules are added to the hooks source tree:

```
~/.claude/hooks/
  src/
    hooks/
      session-start.ts        <-- Inject baselines + optimizations
      session-stop.ts         <-- Trigger analyzer agent
      pre-tool.ts
      post-tool.ts
    telemetry/
      baseline-loader.ts      <-- NEW: Load agent-type baselines
      kpi-computer.ts         <-- NEW: Compute KPIs from telemetry
      suggestion-tracker.ts   <-- NEW: Track suggestion impact
      alert-engine.ts         <-- NEW: Evaluate alert rules
    agents/
      session-perf-analyzer.ts  <-- NEW: Analyzer agent runner
```

### Observability Toolkit Integration

Leverage the existing LLM-as-Judge pipeline and rule engine in the observability-toolkit MCP server:

```
~/.claude/mcp-servers/observability-toolkit/
  dashboard/
    scripts/
      judge-evaluations.ts       (existing - compute quality metrics)
      baseline-updater.ts        <-- NEW: Update baselines post-session
      trend-detector.ts          <-- NEW: Detect performance trends
    reports/
      session-report.ts          <-- NEW: Generate delta reports
      weekly-summary.ts          <-- NEW: Generate weekly summaries
  src/
    evaluation/
      rule-engine.ts             (existing - tool correctness, latency)
      llm-judge.ts               (existing - relevance, faithfulness, etc.)
    export/
      signoz-exporter.ts         (existing - export to SigNoz Cloud)
```

The quality metrics from `judge-evaluations.ts` already produce the evaluation JSONL entries this system consumes. The rule engine already computes `tool_correctness` and `evaluation_latency` per span. The new modules extend this pipeline with KPI aggregation and trend detection.

### SigNoz Cloud Telemetry Export

Extend the existing exporter to include KPI metrics:

{% raw %}
```typescript
export function exportKPIsToSigNoz(sessionKPIs: KPIs, sessionId: string): void {
  const metrics = [
    {
      name: 'agent.performance.token_efficiency',
      value: sessionKPIs.token_efficiency,
      labels: { session_id: sessionId, agent_type: sessionKPIs.agent_type }
    },
    {
      name: 'agent.performance.task_completion_rate',
      value: sessionKPIs.task_completion_rate,
      labels: { session_id: sessionId, agent_type: sessionKPIs.agent_type }
    },
    {
      name: 'agent.performance.active_time_ratio',
      value: sessionKPIs.active_time_ratio,
      labels: { session_id: sessionId, agent_type: sessionKPIs.agent_type }
    },
    {
      name: 'agent.performance.tool_overhead_ratio',
      value: sessionKPIs.tool_overhead_ratio,
      labels: { session_id: sessionId, agent_type: sessionKPIs.agent_type }
    }
  ];

  signozExporter.exportMetrics(metrics);
}
```
{% endraw %}

### Local JSONL Storage Layout

Preserves local-first architecture. All data stays in `~/.claude/telemetry/`:

```
~/.claude/telemetry/
  traces-{date}.jsonl              (existing - OpenTelemetry spans)
  evaluations-{date}.jsonl         (existing - LLM-as-Judge results)
  logs-{date}.jsonl                (existing - session logs)
  baselines/                       <-- NEW
    translation-agent.json
    code-reviewer.json
    webscraping-research-analyst.json
    genai-quality-monitor.json
    code-simplifier.json
  history/                         <-- NEW
    kpis.jsonl                     (append-only session KPI history)
  reports/                         <-- NEW
    {session-id}.md                (per-session delta reports)
    weekly-{date}.md               (weekly summaries)
  optimizations/                   <-- NEW
    active.json                    (currently active suggestions)
    {session-id}.json              (suggestions per session)
  incidents/                       <-- NEW
    {agent-type}-{metric}-{timestamp}.md
```

---

## Component 7: Implementation Phases

### Phase 1: Baseline Collection (Weeks 1-2)

**Goal**: Instrument, measure, store -- no optimization yet.

#### Tasks

1. **Define KPI schemas**
   - Create TypeScript interfaces for KPIs, baselines, sessions
   - Write JSON schemas for baseline storage format
   - Implement validation logic

2. **Build KPI computation functions**
   - Write parsers for traces JSONL (token metrics, tool calls, timings)
   - Write parsers for evaluations JSONL (quality metrics)
   - Implement each KPI computation function with unit tests
   - Handle edge cases (missing data, compacted sessions, multi-session days)

3. **Create baseline storage system**
   - Initialize `~/.claude/telemetry/baselines/` directory
   - Write baseline save/load utilities
   - Implement EMA update algorithm
   - Add bootstrap logic for new agent types (< 5 sessions)

4. **Integrate with session-stop hook**
   - Compute KPIs at session end
   - Store in history JSONL
   - Initialize baselines for new agent types
   - Update existing baselines with EMA

5. **Validate data collection**
   - Run 5-10 sessions per agent type
   - Verify telemetry completeness
   - Check KPI computation accuracy against manual calculations
   - Review baseline convergence (std dev should stabilize)

#### Deliverables

- `~/.claude/hooks/src/telemetry/kpi-computer.ts` -- KPI computation library
- `~/.claude/hooks/src/telemetry/baseline-loader.ts` -- Baseline storage system
- Updated `session-stop.ts` hook
- Baseline files for 5 agent types
- History JSONL with 15-50 session entries

#### Success Criteria

- All KPIs compute successfully for 95%+ of sessions
- Baselines converge after 5 sessions (std dev stabilizes within 10%)
- History JSONL contains complete session records with no data loss
- KPI values match manual verification within 5% tolerance

### Phase 2: Post-Session Analysis (Weeks 3-4)

**Goal**: Run analyzer agent, generate reports.

#### Tasks

1. **Build session-perf-analyzer agent**
   - Create agent config at `~/.claude/agents/session-perf-analyzer.md`
   - Define agent inputs (session ID, telemetry paths, baseline path)
   - Define agent outputs (delta report, optimization suggestions)
   - Implement agent runner in session-stop hook

2. **Implement delta computation**
   - Compare session KPIs vs baselines
   - Compute statistical significance (std dev deltas)
   - Identify regressions and improvements
   - Generate trend indicators (up/down/stable)

3. **Build optimization suggestion engine**
   - Implement rule-based suggestion logic (6 rules from Component 2)
   - Rank suggestions by priority and estimated impact
   - Generate actionable implementation guidance per suggestion
   - Write suggestions to per-session JSON files

4. **Create report generator**
   - Design Markdown report template
   - Generate per-session delta reports with KPI tables
   - Include historical context (percentile rankings vs all sessions)
   - Add ASCII trend charts for key metrics

5. **Validate analysis accuracy**
   - Run analyzer on the E&N session telemetry (known ground truth)
   - Verify suggestions match post-mortem recommendations
   - Check false positive rate for alerts on healthy sessions
   - Review report readability and actionability

#### Deliverables

- `~/.claude/agents/session-perf-analyzer.md` -- Agent config
- `~/.claude/hooks/src/agents/session-perf-analyzer.ts` -- Agent runner
- Optimization suggestion engine with 6 rules
- Report generator producing Markdown delta reports
- 10+ delta reports for test sessions

#### Success Criteria

- Analyzer completes within 5 minutes for 99% of sessions
- Suggestions are actionable (each has implementation guidance)
- Reports correctly identify all regressions from E&N session
- No false critical alerts on healthy sessions (< 5% false positive rate)

### Phase 3: Feedback Loop (Weeks 5-6)

**Goal**: Inject suggestions, track impact.

#### Tasks

1. **Build active suggestions system**
   - Create `active.json` storage and schema
   - Implement suggestion activation logic (top 3 per agent type)
   - Add suggestion retirement logic (after 3 sessions)
   - Write save/load utilities with validation

2. **Extend session-start hook**
   - Load active suggestions for detected agent type
   - Inject optimization context into session prompt
   - Display performance baselines to agent
   - Add alert evaluation and handling (warn/block)

3. **Implement impact tracking**
   - Track which sessions used which suggestions
   - Compare KPIs before/after suggestion activation
   - Compute impact deltas and trends
   - Store tracking results in active.json

4. **Build effectiveness evaluator**
   - Define success criteria (20% improvement in 2/3 sessions)
   - Evaluate after 3 sessions complete
   - Mark suggestions as PROVEN or INEFFECTIVE
   - Trigger promotion or retirement pipeline

5. **Validate feedback loop**
   - Activate test suggestions manually
   - Run 3 sessions per suggestion
   - Verify impact tracking accuracy against manual KPI calculation
   - Test promotion and retirement logic end-to-end

#### Deliverables

- Active suggestions system (`active.json` + management code)
- Updated `session-start.ts` hook with optimization injection
- Impact tracking system in `suggestion-tracker.ts`
- Effectiveness evaluator with promotion/retirement logic

#### Success Criteria

- Suggestions successfully injected into 100% of matching sessions
- Impact tracking captures KPI changes with < 5% error
- Effective suggestions promote automatically after 3 sessions
- Ineffective suggestions retire without manual intervention

### Phase 4: Auto-Optimization (Weeks 7-8)

**Goal**: Promote/retire suggestions automatically. Add trend detection and alerting.

#### Tasks

1. **Build agent config updater**
   - Parse existing agent Markdown configs
   - Append promoted optimizations with metadata
   - Preserve formatting and structure
   - Add effectiveness data (avg improvement, sessions tracked)

2. **Implement promotion pipeline**
   - Trigger on PROVEN effectiveness evaluation
   - Write optimization to agent config Markdown
   - Remove from active.json
   - Log promotion event to telemetry

3. **Implement retirement pipeline**
   - Trigger on INEFFECTIVE detection
   - Remove from active.json
   - Archive retired suggestions with reason
   - Log retirement event to telemetry

4. **Add trend detection and alerting**
   - Implement consecutive regression detector (3+ sessions)
   - Build incident report generator
   - Add weekly summary generator
   - Create ASCII trend charts for reports

5. **Build alert escalation system**
   - Implement full alert rule matrix (9 rules)
   - Add session blocking for critical alerts
   - Generate incident reports for degradation patterns
   - Test alert accuracy and false positive rate

#### Deliverables

- Agent config updater (Markdown manipulation)
- Promotion and retirement pipelines
- Trend detection system with `detectPerformanceDegradation()`
- Alert escalation engine with `evaluateAlertRules()`
- Weekly summary generator
- Incident report generator

#### Success Criteria

- Effective optimizations auto-promote to agent configs
- Agent configs remain valid Markdown after updates
- Incident reports generate for genuine degradation only
- No false critical alerts that block healthy sessions (< 2% false positive rate)
- Weekly summaries provide actionable insights within 48 hours of week end

---

## Code Stubs

### Baseline JSON Schema (TypeScript Interface)

{% raw %}
```typescript
export interface BaselineStat {
  mean: number;
  std_dev: number;
  p50: number;
  p95: number;
  p99: number;
  status?: 'bootstrap' | 'converged';
}

export interface Baseline {
  agent_type: string;
  version: string;
  last_updated: string;
  session_count: number;
  baselines: Record<string, BaselineStat>;
  bootstrap_threshold?: number;
}
```
{% endraw %}

### KPI Computation Functions

{% raw %}
```typescript
import { readFileSync } from 'fs';

export interface KPIs {
  token_efficiency: number;
  task_completion_rate: number;
  active_time_ratio: number;
  tool_overhead_ratio: number;
  cache_efficiency: number;
  error_rate: number;
  quality_relevance: number;
  quality_faithfulness: number;
  quality_coherence: number;
  quality_hallucination: number;
}

export function computeKPIs(
  tracesPath: string,
  evaluationsPath: string,
  sessionId: string
): KPIs {
  const traces = parseJSONL(tracesPath).filter(
    (t: any) => t.attributes?.['session.id'] === sessionId
  );
  const evals = parseJSONL(evaluationsPath).filter(
    (e: any) => e.attributes?.['session.id'] === sessionId
  );

  // Token efficiency
  const tokenSpans = traces.filter(
    (t: any) => t.name === 'hook:token-metrics-extraction'
  );
  const totalOutput = tokenSpans.reduce(
    (sum: number, s: any) => sum + (s.attributes?.['tokens.output'] || 0), 0
  );
  const totalInput = tokenSpans.reduce(
    (sum: number, s: any) => sum + (s.attributes?.['tokens.input'] || 0), 0
  );
  const totalCacheRead = tokenSpans.reduce(
    (sum: number, s: any) => sum + (s.attributes?.['tokens.cache_read'] || 0), 0
  );
  const totalTokens = totalInput + totalOutput + totalCacheRead;
  const token_efficiency = totalTokens > 0 ? totalOutput / totalTokens : 0;

  // Task completion rate
  const taskCreates = traces.filter(
    (t: any) => t.attributes?.['builtin.tool'] === 'TaskCreate'
  ).length;
  const taskUpdates = traces.filter(
    (t: any) => t.attributes?.['builtin.tool'] === 'TaskUpdate'
  ).length;
  const task_completion_rate = taskCreates > 0
    ? Math.min(taskUpdates / taskCreates, 1.0)
    : 1.0;

  // Active time ratio
  const startTimes = traces.map((t: any) => t.startTime[0]);
  const endTimes = traces.map((t: any) => t.endTime[0]);
  const sessionStart = Math.min(...startTimes);
  const sessionEnd = Math.max(...endTimes);
  const wallClockTime = sessionEnd - sessionStart;
  const activeSpans = traces.filter(
    (t: any) => t.duration[0] > 0 || t.duration[1] > 1_000_000_000
  );
  const activeTime = activeSpans.reduce(
    (sum: number, s: any) => sum + s.duration[0] + s.duration[1] / 1e9, 0
  );
  const active_time_ratio = wallClockTime > 0
    ? Math.min(activeTime / wallClockTime, 1.0)
    : 0;

  // Tool overhead ratio
  const managementTools = traces.filter((t: any) =>
    ['TaskCreate', 'TaskUpdate', 'TaskDelete'].includes(
      t.attributes?.['builtin.tool']
    )
  ).length;
  const productiveTools = traces.filter((t: any) =>
    ['Read', 'Write', 'Edit', 'Bash'].includes(
      t.attributes?.['builtin.tool']
    )
  ).length;
  const tool_overhead_ratio = productiveTools > 0
    ? managementTools / productiveTools
    : 0;

  // Cache efficiency
  const totalReads = totalInput + totalCacheRead;
  const cache_efficiency = totalReads > 0 ? totalCacheRead / totalReads : 0;

  // Error rate
  const failedOps = traces.filter((t: any) => t.status?.code !== 1).length;
  const totalOps = traces.length;
  const error_rate = totalOps > 0 ? failedOps / totalOps : 0;

  // Quality metrics from evaluations
  const quality_relevance = computeQualityMetric(evals, 'relevance', 'p50');
  const quality_faithfulness = computeQualityMetric(evals, 'faithfulness', 'p50');
  const quality_coherence = computeQualityMetric(evals, 'coherence', 'p50');
  const quality_hallucination = computeQualityMetric(evals, 'hallucination', 'avg');

  return {
    token_efficiency,
    task_completion_rate,
    active_time_ratio,
    tool_overhead_ratio,
    cache_efficiency,
    error_rate,
    quality_relevance,
    quality_faithfulness,
    quality_coherence,
    quality_hallucination
  };
}

function computeQualityMetric(
  evals: any[],
  metricName: string,
  aggregation: 'p50' | 'avg'
): number {
  const scores = evals
    .filter((e: any) => e.attributes?.['gen_ai.evaluation.name'] === metricName)
    .map((e: any) => e.attributes?.['gen_ai.evaluation.score.value'])
    .filter((v: any) => typeof v === 'number');

  if (scores.length === 0) return 0;

  if (aggregation === 'avg') {
    return scores.reduce((sum: number, v: number) => sum + v, 0) / scores.length;
  }

  // p50
  const sorted = scores.slice().sort((a: number, b: number) => a - b);
  const index = Math.floor(sorted.length * 0.5);
  return sorted[index];
}

function parseJSONL(path: string): any[] {
  const content = readFileSync(path, 'utf-8');
  return content
    .split('\n')
    .filter(Boolean)
    .map((line: string) => JSON.parse(line));
}
```
{% endraw %}

### Performance Analyzer Agent Config

```markdown
# Session Performance Analyzer

## Purpose

Analyze session telemetry to compute KPIs, compare against baselines,
and generate optimization suggestions.

## Activation

Automatically triggered by session-stop hook.

## Inputs

- Session ID: from CLAUDE_SESSION_ID env var
- Agent type: detected from session context
- Telemetry paths:
  - ~/.claude/telemetry/traces-{date}.jsonl
  - ~/.claude/telemetry/evaluations-{date}.jsonl
  - ~/.claude/telemetry/logs-{date}.jsonl
- Baseline: ~/.claude/telemetry/baselines/{agent-type}.json

## Outputs

- Delta report: ~/.claude/telemetry/reports/{session-id}.md
- Updated baseline: ~/.claude/telemetry/baselines/{agent-type}.json
- Optimization suggestions: ~/.claude/telemetry/optimizations/{session-id}.json
- History entry: append to ~/.claude/telemetry/history/kpis.jsonl

## Analysis Process

1. Load session telemetry JSONL files
2. Compute all KPIs using kpi-computer
3. Load agent-type baseline from storage
4. Calculate performance deltas (session vs baseline)
5. Identify regressions (> 1 std dev below baseline)
6. Generate optimization suggestions using rule engine
7. Update baseline with EMA algorithm (alpha = 0.2)
8. Write all outputs

## Quality Standards

- Analysis must complete within 5 minutes
- KPI computation must handle missing data gracefully
- Suggestions must be actionable with implementation guidance
- Reports must include historical context and trend direction

## Error Handling

- If telemetry files missing: log error, skip analysis
- If baseline missing: bootstrap with conservative defaults
- If KPI computation fails: report partial results with warnings
- If timeout exceeded: write partial outputs, log warning
```

### Session-Start Hook Integration

{% raw %}
```typescript
// ~/.claude/hooks/src/hooks/session-start-perf.ts

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function sessionStartPerfHook(
  sessionId: string,
  agentType: string
): Promise<string> {
  let context = '';

  // Load baselines
  context += await loadBaselines(agentType);

  // Load active optimizations
  context += await injectOptimizations(sessionId, agentType);

  // Evaluate alerts from most recent session
  const alerts = evaluateAlertRulesFromHistory(agentType);
  if (alerts.length > 0) {
    handleAlerts(alerts);
  }

  return context;
}

function evaluateAlertRulesFromHistory(agentType: string): Alert[] {
  const historyPath = join(
    process.env.HOME!,
    '.claude/telemetry/history/kpis.jsonl'
  );

  if (!existsSync(historyPath)) return [];

  const history = parseJSONL(historyPath).filter(
    (e: any) => e.agent_type === agentType
  );

  if (history.length === 0) return [];

  const mostRecent = history[history.length - 1];

  const baselinePath = join(
    process.env.HOME!,
    '.claude/telemetry/baselines',
    `${agentType}.json`
  );

  if (!existsSync(baselinePath)) return [];

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));

  return evaluateAlertRules(agentType, mostRecent.kpis, baseline);
}
```
{% endraw %}

### History JSONL Schema

{% raw %}
```typescript
export interface HistoryEntry {
  session_id: string;
  date: string;
  agent_type: string;
  model: string;
  duration_seconds: number;
  kpis: KPIs;
  baselines: Record<string, number>;
  optimizations_active: string[];
  alert_level: 'PASS' | 'WARNING' | 'CRITICAL';
}

export function appendToHistory(entry: HistoryEntry): void {
  const historyPath = join(
    process.env.HOME!,
    '.claude/telemetry/history/kpis.jsonl'
  );

  const line = JSON.stringify(entry) + '\n';
  appendFileSync(historyPath, line);
}

export function loadKPIHistory(agentType?: string): HistoryEntry[] {
  const historyPath = join(
    process.env.HOME!,
    '.claude/telemetry/history/kpis.jsonl'
  );

  if (!existsSync(historyPath)) return [];

  const entries = parseJSONL(historyPath) as HistoryEntry[];

  if (agentType) {
    return entries.filter(e => e.agent_type === agentType);
  }

  return entries;
}
```
{% endraw %}

---

## Success Metrics

### System-Level KPIs

Track the self-optimization system itself:

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Coverage** | 95% of sessions analyzed | Sessions with complete KPI data / total sessions |
| **Latency** | < 5 min per analysis | Time from session-stop to report generation |
| **Accuracy** | < 5% false positive alerts | False critical alerts / total critical alerts |
| **Effectiveness** | > 60% suggestions promote | Promoted suggestions / total suggestions |
| **Impact** | > 30% avg KPI improvement | Avg improvement from promoted optimizations |
| **Adoption** | 100% sessions use baselines | Sessions with baseline injection / total sessions |

### Agent-Level Improvements

Expected improvements after 3 months:

| Agent Type | KPI | Before | After | Target Improvement |
|------------|-----|--------|-------|-------------------|
| translation-agent | Token efficiency | 0.001 | 0.045 | +4400% |
| translation-agent | Task completion | 0.83 | 0.96 | +16% |
| translation-agent | Active time ratio | 0.22 | 0.68 | +209% |
| code-reviewer | Tool overhead | 0.82 | 0.38 | -54% |
| webscraping-research-analyst | Error rate | 0.12 | 0.02 | -83% |

---

## Risk Mitigation

### Risk: Baseline Drift

**Problem**: Baselines become stale or drift due to external changes (API latency, model updates).

**Mitigation**:
- Track baseline confidence: flag if std dev > 50% of mean
- Reset baselines if model version changes
- Allow manual baseline reset via CLI command
- Monitor baseline update frequency (should update weekly at minimum)

### Risk: Suggestion Overfitting

**Problem**: Suggestions optimize for specific failure patterns, don't generalize.

**Mitigation**:
- Require 3 sessions for effectiveness evaluation (not 1)
- Track success rate across diverse session types
- Retire suggestions with < 67% success rate
- Review promoted suggestions quarterly for continued relevance

### Risk: Alert Fatigue

**Problem**: Too many warnings reduce alert effectiveness.

**Mitigation**:
- Use strict thresholds (> 1 std dev for warnings, > 2 std dev for critical)
- Aggregate similar alerts (1 alert per metric per session, not per span)
- Track alert accuracy, adjust thresholds if false positive rate > 5%
- Provide clear actionable guidance in every alert

### Risk: Performance Regression from Suggestions

**Problem**: Active suggestion causes regression instead of improvement.

**Mitigation**:
- Activate max 3 suggestions at once (reduce blast radius)
- Track impact immediately, detect regressions after 1 session
- Auto-retire suggestions that cause regression in any session
- Allow manual disable of suggestions via `active.json` edit

### Risk: Telemetry Data Loss

**Problem**: Missing telemetry prevents KPI computation.

**Mitigation**:
- Handle missing data gracefully (compute partial KPIs, flag incomplete)
- Log data completeness percentage per session
- Alert if > 20% of sessions have incomplete telemetry
- Implement telemetry validation in session-stop hook before analysis

---

## Future Enhancements

### Multi-Agent Optimization

Extend to optimize agent interaction patterns:
- Track handoff latency between agents
- Detect duplicate work across agents in same session
- Optimize agent selection for task types based on historical performance

### Predictive Alerts

Use ML to predict performance issues before they occur:
- Train model on historical session metadata + KPI outcomes
- Predict KPI outcomes before session execution based on task type
- Alert proactively if predicted performance < baseline

### Cost Optimization

Add cost-specific KPIs:
- Cost per output token (accounting for cache savings)
- Cost per task completion
- Cost efficiency trend over time
- Budget alerts and model selection recommendations

### A/B Testing Framework

Test optimization suggestions scientifically:
- Randomly assign sessions to control/treatment groups
- Measure KPI deltas with statistical significance testing
- Promote only statistically significant improvements (p < 0.05)

---

## Conclusion

This self-optimizing agent performance system transforms reactive post-mortems into proactive, continuous improvement. By establishing performance baselines, automatically analyzing telemetry, generating actionable suggestions, and tracking their impact, the system creates a closed feedback loop that drives agent performance higher with every session.

The Edgar & Nadyne translation session revealed critical inefficiencies: 8.6 hours for 3 translations, 998:1 input-to-output ratio, 63% task management overhead. With this system in place, those failure modes would be detected automatically, optimization suggestions generated, and future sessions improved -- potentially reducing wall-clock time by 75%, improving token efficiency by 40x, and cutting task overhead by 50%.

The path forward:
1. **Phase 1** (Weeks 1-2): Collect baselines -- instrument, measure, store
2. **Phase 2** (Weeks 3-4): Analyze performance -- run analyzer agent, generate reports
3. **Phase 3** (Weeks 5-6): Close the feedback loop -- inject suggestions, track impact
4. **Phase 4** (Weeks 7-8): Auto-optimize -- promote/retire suggestions automatically

In 2 months, every agent will learn from every session, performance will trend upward, and expensive failures will become rare. The system optimizes itself.
