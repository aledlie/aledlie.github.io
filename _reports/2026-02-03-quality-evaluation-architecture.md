---
layout: single
title: "Quality Evaluation Architecture"
date: 2026-02-03
author_profile: true
breadcrumbs: true
permalink: /reports/quality-evaluation-architecture/
categories: [documentation, observability-toolkit]
tags: [quality-evaluation, opentelemetry, langfuse, datadog, arize-phoenix, llm-as-judge]
excerpt: "Evaluation event storage, multi-platform export, and LLM-as-Judge patterns for addressing the invisible failure problem in LLM systems."
header:
  overlay_image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# Quality Evaluation Architecture

**Version**: 2.0.0
**Status**: Production
**Last Updated**: 2026-02-03

## Overview

Quality evaluation addresses the "invisible failure" problem where LLM systems appear operational but produce low-quality outputs. This layer provides evaluation event storage, multi-platform export, and LLM-as-Judge patterns.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Quality Evaluation Layer                               │
├──────────────────────────────────────────────────────────────────────────────┤
│  Storage & Query                                                              │
│  ├── EvaluationResult schema (OTel GenAI semantic conventions)               │
│  ├── queryEvaluations() - JSONL backend with streaming aggregation           │
│  └── obs_query_evaluations - MCP tool with filters + aggregations            │
├──────────────────────────────────────────────────────────────────────────────┤
│  Platform Exports                                                             │
│  ├── Langfuse        obs_export_langfuse    OTLP + basic auth               │
│  ├── Confident AI    obs_export_confident   API key + env tagging           │
│  ├── Arize Phoenix   obs_export_phoenix     Bearer auth + project org       │
│  └── Datadog         obs_export_datadog     Two-phase spans + eval metrics  │
├──────────────────────────────────────────────────────────────────────────────┤
│  LLM-as-Judge (see quality/llm-as-judge.md)                                  │
│  ├── G-Eval (CoT + logprobs)    ├── Circuit breaker                         │
│  ├── QAG (faithfulness)         ├── Retry with backoff                       │
│  ├── Position bias mitigation   └── Canary evaluations                       │
│  └── Multi-judge panels                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│  Compliance                                                                   │
│  └── obs_query_verifications - EU AI Act human verification tracking         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Core Types

```typescript
// src/backends/index.ts

interface EvaluationResult {
  timestamp: string;
  evaluationName: string;       // gen_ai.evaluation.name (required)
  scoreValue?: number;          // gen_ai.evaluation.score.value
  scoreLabel?: string;          // gen_ai.evaluation.score.label
  scoreUnit?: string;           // "ratio_0_1", "percentage"
  explanation?: string;         // gen_ai.evaluation.explanation
  evaluator?: string;           // Model, human, system identity
  evaluatorType?: 'llm' | 'human' | 'rule' | 'classifier';
  responseId?: string;          // gen_ai.response.id (correlation)
  traceId?: string;
  spanId?: string;
  sessionId?: string;
}

type EvaluatorType = 'llm' | 'human' | 'rule' | 'classifier';
```

## MCP Tools

### obs_query_evaluations

Query evaluation events with filtering and aggregation.

| Parameter | Type | Description |
|-----------|------|-------------|
| `evaluationName` | string | Substring match |
| `scoreMin/scoreMax` | number | Score range filter |
| `scoreLabel` | string | Exact match |
| `evaluatorType` | enum | llm, human, rule, classifier |
| `aggregation` | enum | avg, min, max, count, p50, p95, p99 |
| `groupBy` | array | evaluationName, scoreLabel, evaluator |

### Export Tools

All export tools share common filters plus platform-specific options:

| Tool | Auth | Key Features |
|------|------|--------------|
| `obs_export_langfuse` | Basic auth (pk:sk) | OTLP /v1/traces, retry with backoff |
| `obs_export_confident` | API key | Environment tagging, metric collections |
| `obs_export_phoenix` | Bearer token | Project organization, legacy auth support |
| `obs_export_datadog` | DD_API_KEY | Two-phase export, auto metric type detection |

### obs_query_verifications

EU AI Act compliance - query human verification events.

| Parameter | Type | Description |
|-----------|------|-------------|
| `sessionId` | string | Session filter |
| `verificationType` | enum | approval, rejection, override, review |

## Environment Variables

### Langfuse
| Variable | Required | Description |
|----------|----------|-------------|
| `LANGFUSE_ENDPOINT` | Yes | API endpoint URL |
| `LANGFUSE_PUBLIC_KEY` | Yes | Public key (pk-lf-...) |
| `LANGFUSE_SECRET_KEY` | Yes | Secret key (sk-lf-...) |

### Confident AI
| Variable | Required | Description |
|----------|----------|-------------|
| `CONFIDENT_ENDPOINT` | No | Custom endpoint |
| `CONFIDENT_API_KEY` | Yes | API key |

### Arize Phoenix
| Variable | Required | Description |
|----------|----------|-------------|
| `PHOENIX_COLLECTOR_ENDPOINT` | Yes | Collector URL |
| `PHOENIX_API_KEY` | Yes | Bearer token |

### Datadog
| Variable | Required | Description |
|----------|----------|-------------|
| `DD_API_KEY` | Yes | Datadog API key |
| `DD_SITE` | No | Site (datadoghq.com, eu, us3, us5, ap1) |
| `DD_LLMOBS_ML_APP` | No | LLM application name |

## OTel Event Structure

```
Trace: Customer Support Query
├── Span: invoke_agent CustomerSupportBot
│   ├── Span: chat claude-3-opus
│   │   └── Event: gen_ai.evaluation.result
│   │       ├── gen_ai.evaluation.name: "Relevance"
│   │       ├── gen_ai.evaluation.score.value: 0.92
│   │       ├── gen_ai.evaluation.score.label: "relevant"
│   │       └── gen_ai.evaluation.explanation: "Response addresses query"
│   │
│   └── Span: execute_tool lookup_customer
│       └── Event: gen_ai.evaluation.result
│           ├── gen_ai.evaluation.name: "ToolCorrectness"
│           └── gen_ai.evaluation.score.label: "pass"
```

## Security

| Feature | Implementation |
|---------|----------------|
| DNS rebinding | URL validation, HTTPS-only for exports |
| Memory protection | 600MB OOM threshold, MAX_AGGREGATION_GROUPS=10,000 |
| Credential sanitization | Masked in logs, error messages |
| Timestamp validation | Year 2000-3000 range |

## File Structure

```
src/
├── backends/
│   ├── index.ts                # EvaluationResult, EvaluatorType types
│   └── local-jsonl.ts          # queryEvaluations() method
├── lib/
│   ├── constants.ts            # Export env vars, HttpStatus
│   ├── export-utils.ts         # Shared export utilities
│   ├── langfuse-export.ts      # Langfuse OTLP export
│   ├── confident-export.ts     # Confident AI export
│   ├── phoenix-export.ts       # Arize Phoenix export
│   ├── datadog-export.ts       # Datadog LLM Obs export
│   ├── llm-as-judge.ts         # LLM-as-Judge patterns
│   └── verification-events.ts  # EU AI Act compliance
└── tools/
    ├── query-evaluations.ts    # obs_query_evaluations
    ├── export-langfuse.ts      # obs_export_langfuse
    ├── export-confident.ts     # obs_export_confident
    ├── export-phoenix.ts       # obs_export_phoenix
    ├── export-datadog.ts       # obs_export_datadog
    └── query-verifications.ts  # obs_query_verifications
```

## Test Coverage

| Component | Tests | File |
|-----------|-------|------|
| Query evaluations | 45+ | query-evaluations.test.ts |
| Langfuse export | 71 | langfuse-export.test.ts |
| Confident AI export | 40+ | confident-export.test.ts |
| Phoenix export | 50+ | phoenix-export.test.ts |
| Datadog export | 160 | datadog-export.test.ts |
| LLM-as-Judge | 108 | llm-as-judge.test.ts |
| Verifications | 30+ | query-verifications.test.ts |

## Related Documentation

- [LLM-as-Judge Architecture](/reports/llm-as-judge-architecture/) - G-Eval, QAG, bias mitigation
- [Agent-as-Judge Architecture](/reports/agent-as-judge-architecture/) - Multi-agent evaluation patterns
