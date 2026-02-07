---
layout: single
title: "Agent-as-Judge Architecture"
date: 2026-02-03
author_profile: true
breadcrumbs: true
permalink: /reports/agent-as-judge-architecture/
categories: [documentation, observability-toolkit]
tags: [agent-as-judge, multi-agent, evaluation, trajectory-analysis, opentelemetry]
excerpt: "Autonomous judge agents with planning, tool use, memory, and multi-agent collaboration for evaluating complex agent trajectories."
header:
  overlay_image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# Agent-as-Judge Architecture

**Version**: 2.0.0
**Status**: Production
**Last Updated**: 2026-02-03

## Overview

Agent-as-Judge evaluates agentic AI systems using autonomous judge agents with planning, tool use, memory, and multi-agent collaboration. Addresses limitations of single-pass LLM evaluation for complex agent trajectories.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Agent-as-Judge Components                     │
├─────────────────────────────────────────────────────────────────┤
│  Judge Classes                  Tool Verification                │
│  ├── AgentJudge (base)         ├── verifyToolCall()             │
│  ├── ProceduralJudge           ├── verifyToolCalls()            │
│  └── ReactiveJudge             └── Weighted scoring             │
├─────────────────────────────────────────────────────────────────┤
│  Step Scoring                   Trajectory Analysis              │
│  ├── scoreStep()               ├── analyzeTrajectory()          │
│  ├── aggregateStepScores()     ├── Redundancy detection         │
│  └── Weighted aggregation      └── Loopiness metrics            │
├─────────────────────────────────────────────────────────────────┤
│  Multi-Agent Collaboration      Production Utilities             │
│  ├── collectiveConsensus()     ├── AgentEvalTimeoutError        │
│  ├── Convergence detection     ├── withAgentTimeout()           │
│  └── Variance tracking         └── LRU memory management        │
└─────────────────────────────────────────────────────────────────┘
```

## Core Types

```typescript
// src/backends/index.ts

interface StepScore {
  step: string | number;       // Step identifier
  score: number;               // Score for this step (0-1)
  evidence?: EvidenceValue;    // Supporting evidence
  explanation?: string;        // Human-readable explanation
}

interface ToolVerification {
  toolName: string;            // Actual tool called
  toolCallId?: string;         // Unique call ID
  toolCorrect: boolean;        // Correct tool selected?
  argsCorrect: boolean;        // Arguments valid?
  resultCorrect?: boolean;     // Result matched expectations?
  score: number;               // Overall score (0-1)
  expectedTool?: string;       // Expected tool
  evidence?: EvidenceValue;    // Supporting evidence
}

interface TrajectoryMetrics {
  trajectoryLength: number;    // Number of steps
  redundancyScore?: number;    // Repeated action detection
  loopinessScore?: number;     // Circular path detection
  efficiency?: number;         // Steps vs optimal path
}
```

## Judge Patterns

### Procedural Judge
Fixed evaluation pipeline with predefined stages.

```
Input → Stage 1 → Stage 2 → ... → Stage N → Aggregate
```
- Early termination on critical failures
- Context passed between stages

### Reactive Judge
Adaptive evaluation based on intermediate feedback.

```
Input → Router → [Selected Specialists] → Deep Dive (if needed) → Synthesize
```
- Dynamic specialist routing
- Memory-tracked state

### Consensus Judge
Multi-agent debate with convergence detection.

```
Judges → Round 1 → ... → Round N → Median (when variance < threshold)
```
- Variance tracking per round
- Early convergence exit

## Metric Categories

| Category | Metrics | Scope |
|----------|---------|-------|
| Single-turn | Task completion, tool correctness, argument validity | Per-action |
| Multi-turn | Conversation completeness, turn relevancy, context retention | Session |
| Multi-agent | Handoff correctness, collaboration efficiency, role adherence | Cross-agent |

## MCP Integration

### Query Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `agentId` | string | Subject agent ID (max 128 chars) |
| `agentName` | string | Subject agent name (max 256 chars) |
| `evaluatorType` | enum | llm, human, rule, classifier |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `stepScores` | StepScore[] | Per-step evaluation scores |
| `toolVerifications` | ToolVerification[] | Tool call verification results |
| `trajectoryLength` | number | Steps in agent trajectory |

### Example Queries

```typescript
// Query agent evaluations by subject
const agentEvals = await obs_query_evaluations({
  agentId: 'agent-123',
  evaluatorType: 'llm',
  aggregation: 'avg',
  groupBy: ['evaluationName']
});

// Task completion by agent
const taskScores = await obs_query_evaluations({
  evaluationName: 'task_completion',
  agentName: 'CustomerSupportBot',
  aggregation: 'p95'
});
```

## Export Integration

All export tools support agent evaluation results:

| Platform | Agent-Specific Features |
|----------|------------------------|
| Langfuse | Step scores as span annotations |
| Confident AI | Agent trajectory in test case metadata |
| Arize Phoenix | Tool verifications as evaluation feedback |
| Datadog | Agent metrics with ML app segmentation |

## Files

| File | Lines | Description |
|------|-------|-------------|
| `src/lib/agent-as-judge.ts` | ~600 | Main implementation |
| `src/lib/agent-as-judge.test.ts` | ~1,200 | Test suite |
| `src/backends/index.ts` | - | StepScore, ToolVerification types |

## Test Coverage

| Category | Tests |
|----------|-------|
| Tool verification | 25+ |
| Step scoring | 20+ |
| Trajectory analysis | 15+ |
| Consensus evaluation | 20+ |
| Judge classes | 30+ |
| Error handling | 10+ |

## Related Documentation

- [LLM-as-Judge Architecture](/reports/llm-as-judge-architecture/) - Single-pass evaluation baseline
- [Quality Evaluation Architecture](/reports/quality-evaluation-architecture/) - Evaluation storage and export
