---
layout: single
title: "Quality Metrics Dashboard"
date: 2026-02-06
author_profile: true
breadcrumbs: true
permalink: /reports/quality-metrics-dashboard/
categories: [documentation, observability-toolkit]
tags: [quality-metrics, dashboard, alerts, opentelemetry, evaluation]
excerpt: "Programmatic quality monitoring across 7 pre-defined LLM evaluation metrics with configurable alert thresholds."
header:
  overlay_image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# Quality Metrics Dashboard

**Version**: 2.0.1
**Status**: Production
**Last Updated**: 2026-02-06

## Overview

Programmatic quality monitoring across 7 pre-defined LLM evaluation metrics with configurable alert thresholds.

- **Entry point**: `computeDashboardSummary()` consumes evaluation results grouped by metric name
- **Output**: `QualityDashboardSummary` with aggregated values, triggered alerts, and health status
- **Extensible**: `MetricConfigBuilder` fluent API for custom metrics
- **Integrations**: SigNoz, Grafana, Datadog

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Quality Metrics Dashboard Pipeline                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Data Source                                                                 │
│  ├── EvaluationResult[] from JSONL backend / obs_query_evaluations           │
│  └── Map<string, EvaluationResult[]> keyed by metric name                    │
│                                                                              │
│         │                                                                    │
│         ▼                                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    computeDashboardSummary()                            │  │
│  │                                                                        │  │
│  │  For each metric in QUALITY_METRICS + customMetrics:                    │  │
│  │  ┌───────────────┐  ┌───────────────────┐  ┌───────────────────────┐  │  │
│  │  │ Extract       │  │ Compute           │  │ Check Alert           │  │  │
│  │  │ scoreValue[]  │─▶│ Aggregations      │─▶│ Thresholds            │  │  │
│  │  │               │  │ (avg,p50,p95,...) │  │ (warning/critical)    │  │  │
│  │  └───────────────┘  └───────────────────┘  └──────────┬────────────┘  │  │
│  │                                                        │              │  │
│  │                                            ┌───────────▼───────────┐  │  │
│  │                                            │ Determine Health      │  │  │
│  │                                            │ Status                │  │  │
│  │                                            └───────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│         │                                                                    │
│         ▼                                                                    │
│  Output: QualityDashboardSummary                                             │
│  ├── overallStatus (worst of all metrics)                                    │
│  ├── metrics[] (QualityMetricResult per metric)                              │
│  ├── alerts[] (all triggered alerts with metricName)                         │
│  └── summary { totalMetrics, healthyMetrics, warningMetrics, ... }           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Built-in Metrics

7 pre-defined metrics with recommended thresholds based on industry best practices for LLM evaluation. Available as the exported constant `QUALITY_METRICS: Record<string, QualityMetricConfig>`.

| Metric | Display Name | Unit | Range | Aggregations |
|--------|-------------|------|-------|--------------|
| `relevance` | Response Relevance | score | 0-1 | avg, p50, p95, min, count |
| `task_completion` | Task Completion Rate | rate | 0-1 | avg, p50, count |
| `tool_correctness` | Tool Selection Accuracy | rate | 0-1 | avg, p50, count |
| `hallucination` | Hallucination Rate | rate | 0-1 | avg, p95, max, count |
| `evaluation_latency` | Evaluation Latency | seconds | 0-60 | avg, p50, p95, p99, max, count |
| `faithfulness` | Response Faithfulness | score | 0-1 | avg, p50, p95, count |
| `coherence` | Response Coherence | score | 0-1 | avg, p50, p95, count |

## Aggregation System

| Aggregation | Description | Algorithm |
|-------------|-------------|-----------|
| `avg` | Arithmetic mean | sum / count |
| `min` | Minimum value | First element of sorted array |
| `max` | Maximum value | Last element of sorted array |
| `count` | Sample count | Array length (always computed when data exists) |
| `p50` | 50th percentile (median) | R-7 linear interpolation |
| `p95` | 95th percentile | R-7 linear interpolation |
| `p99` | 99th percentile | R-7 linear interpolation |

Percentile calculation: `rank = (percentile / 100) * (n - 1)`, interpolate between `sorted[floor(rank)]` and `sorted[ceil(rank)]`. All values except `count` are rounded to 4 decimal places.

## Alert Thresholds

### Warning Thresholds

| Metric | Aggregation | Direction | Threshold | Message Template |
|--------|-------------|-----------|-----------|-----------------|
| `relevance` | p50 | below | 0.7 | Relevance p50 ({value}) below 0.7 threshold |
| `task_completion` | avg | below | 0.85 | Task completion rate ({value}) below 85% target |
| `tool_correctness` | avg | below | 0.95 | Tool correctness ({value}) below 95% target |
| `hallucination` | avg | above | 0.1 | Hallucination rate ({value}) above 10% threshold |
| `evaluation_latency` | p95 | above | 5.0 | Evaluation latency p95 ({value}s) exceeds 5s target |
| `faithfulness` | p50 | below | 0.8 | Faithfulness p50 ({value}) below 0.8 threshold |
| `coherence` | p50 | below | 0.75 | Coherence p50 ({value}) below 0.75 threshold |

### Critical Thresholds

| Metric | Aggregation | Direction | Threshold | Message Template |
|--------|-------------|-----------|-----------|-----------------|
| `relevance` | p50 | below | 0.5 | Relevance p50 ({value}) critically low |
| `task_completion` | avg | below | 0.70 | Task completion rate ({value}) critically low |
| `tool_correctness` | avg | below | 0.85 | Tool correctness ({value}) critically low |
| `hallucination` | avg | above | 0.2 | Hallucination rate ({value}) critically high |
| `evaluation_latency` | p95 | above | 10.0 | Evaluation latency p95 ({value}s) critically high |
| `faithfulness` | p50 | below | 0.6 | Faithfulness p50 ({value}) critically low |

Coherence has no critical threshold by default; add one via `MetricConfigBuilder` if needed.

### Alert Direction

- **below**: Fires when the computed value is less than the threshold. Used for quality metrics where higher is better (relevance, faithfulness, task completion, tool correctness, coherence).
- **above**: Fires when the computed value exceeds the threshold. Used for metrics where lower is better (hallucination rate, evaluation latency).

The `{value}` placeholder in message templates is replaced with the actual value formatted to 4 decimal places.

Triggered alerts within each metric are sorted by severity: critical first, then warning, then info.

### Health Status Hierarchy

After evaluating all thresholds, each metric receives a health status:

| Priority | Status | Condition |
|----------|--------|-----------|
| 1 | `no_data` | No evaluation scores available |
| 2 | `critical` | Any triggered alert has severity `critical` |
| 3 | `warning` | Any triggered alert has severity `warning` |
| 4 | `healthy` | No alerts triggered, data present |

The dashboard `overallStatus` is the worst status across all metrics. If any metric is `critical`, the dashboard is `critical`. If all metrics have no data, the dashboard is `no_data`.

## Core Interfaces

```typescript
// src/lib/quality-metrics.ts

type AlertSeverity = 'info' | 'warning' | 'critical';
type ThresholdDirection = 'above' | 'below';

interface QualityMetricConfig {
  name: string;                    // Metric name (matches gen_ai.evaluation.name)
  displayName: string;             // Human-readable display name
  description: string;             // Description for dashboard tooltips
  aggregations: EvaluationAggregation[];  // Functions to compute
  alerts: AlertThreshold[];        // Alert thresholds
  range: { min: number; max: number };    // Expected score range
  unit: 'score' | 'rate' | 'seconds' | 'percentage';
}

interface AlertThreshold {
  aggregation: EvaluationAggregation;  // Which aggregation to monitor
  value: number;                        // Threshold value
  direction: 'above' | 'below';        // Alert condition direction
  severity: 'info' | 'warning' | 'critical';
  message: string;                      // Template with {value} placeholder
}

interface QualityMetricResult {
  name: string;
  displayName: string;
  values: Record<EvaluationAggregation, number | null>;  // Computed aggregations
  sampleCount: number;             // Number of evaluations used
  alerts: TriggeredAlert[];        // Alerts that fired
  status: 'healthy' | 'warning' | 'critical' | 'no_data';
  period?: { start: string; end: string };
}

interface TriggeredAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;                 // Formatted message with actual value
  aggregation: EvaluationAggregation;
  threshold: number;               // Configured threshold
  actualValue: number;             // Current value
  direction: 'above' | 'below';
}

interface QualityDashboardSummary {
  overallStatus: 'healthy' | 'warning' | 'critical' | 'no_data';
  metrics: QualityMetricResult[];
  alerts: Array<TriggeredAlert & { metricName: string }>;
  summary: {
    totalMetrics: number;
    healthyMetrics: number;
    warningMetrics: number;
    criticalMetrics: number;
    noDataMetrics: number;
  };
  timestamp: string;               // ISO timestamp when computed
}
```

## Usage Examples

### Computing a Dashboard Summary

```typescript
import { computeDashboardSummary } from './lib/quality-metrics.js';
import type { EvaluationResult } from './backends/index.js';

const evaluationsByMetric = new Map<string, EvaluationResult[]>();

evaluationsByMetric.set('relevance', [
  { timestamp: '2026-02-06T10:00:00Z', evaluationName: 'relevance', scoreValue: 0.85 },
  { timestamp: '2026-02-06T10:01:00Z', evaluationName: 'relevance', scoreValue: 0.92 },
  { timestamp: '2026-02-06T10:02:00Z', evaluationName: 'relevance', scoreValue: 0.78 },
]);

evaluationsByMetric.set('hallucination', [
  { timestamp: '2026-02-06T10:00:00Z', evaluationName: 'hallucination', scoreValue: 0.05 },
  { timestamp: '2026-02-06T10:01:00Z', evaluationName: 'hallucination', scoreValue: 0.08 },
]);

const dashboard = computeDashboardSummary(evaluationsByMetric);
// dashboard.overallStatus: 'healthy'
// dashboard.summary: { totalMetrics: 7, healthyMetrics: 2, noDataMetrics: 5, ... }
// dashboard.alerts: []

// With optional parameters:
const period = { start: '2026-02-06T00:00:00Z', end: '2026-02-06T23:59:59Z' };
const dashboardWithPeriod = computeDashboardSummary(evaluationsByMetric, undefined, period);
```

### Creating a Custom Metric

```typescript
import {
  createMetricConfig,
  registerQualityMetric,
  getAllQualityMetrics,
  computeDashboardSummary,
} from './lib/quality-metrics.js';

const toxicity = createMetricConfig('toxicity')
  .displayName('Toxicity Score')
  .description('Measures harmful or toxic content in responses')
  .aggregations('avg', 'p50', 'p95', 'max', 'count')
  .range(0, 1)
  .unit('score')
  .alertAbove('avg', 0.1, 'warning', 'Toxicity avg ({value}) above 10% threshold')
  .alertAbove('avg', 0.25, 'critical', 'Toxicity avg ({value}) critically high')
  .build();

// Option 1: Register in module-scoped registry (for getQualityMetric / getAllQualityMetrics)
registerQualityMetric(toxicity);

// Option 2: Pass custom metrics directly to computeDashboardSummary
const dashboard = computeDashboardSummary(evaluationsByMetric, { toxicity });

// Bridge: use the registry to feed custom metrics into the dashboard
const allMetrics = getAllQualityMetrics();
const dashboardFromRegistry = computeDashboardSummary(evaluationsByMetric, allMetrics);
```

Note: `registerQualityMetric` populates a module-scoped registry for `getQualityMetric` / `getAllQualityMetrics`. It does **not** automatically feed into `computeDashboardSummary`. Pass custom metrics explicitly via the second parameter, or bridge with `getAllQualityMetrics()`.

### Interpreting Alerts

```typescript
import {
  computeDashboardSummary,
  formatMetricValue,
  getQualityMetric,
} from './lib/quality-metrics.js';

const dashboard = computeDashboardSummary(evaluationsByMetric);

for (const alert of dashboard.alerts) {
  console.log(`[${alert.severity.toUpperCase()}] ${alert.metricName}: ${alert.message}`);
  // [CRITICAL] relevance: Relevance p50 (0.4500) critically low
}

for (const metric of dashboard.metrics) {
  const config = getQualityMetric(metric.name);
  if (config && metric.values.avg !== null) {
    console.log(`${metric.displayName}: ${formatMetricValue(metric.values.avg, config.unit)}`);
  }
}
```

## Edge Cases

- **Empty data**: Metrics with no evaluations return `no_data` status and null aggregation values
- **Null scores**: Evaluations where `scoreValue` is undefined or null are filtered out before aggregation
- **Empty Map**: Calling `computeDashboardSummary(new Map())` returns all 7 built-in metrics with `no_data` status
- **Duplicate registration**: `registerQualityMetric()` throws if metric name matches a built-in or already-registered custom metric
- **Unregister built-in**: `unregisterQualityMetric('relevance')` returns `false` because built-in metrics are not stored in the custom registry
- **Registry scope**: The custom metric registry is module-scoped. In multi-worker environments, each worker maintains its own registry

## Value Formatting

`formatMetricValue()` produces display strings based on unit type:

| Unit | Format | Example Input | Example Output |
|------|--------|---------------|----------------|
| `score` | 4 decimal places | 0.8567 | `0.8567` |
| `rate` | Percentage, 1 decimal | 0.95 | `95.0%` |
| `percentage` | Percentage, 1 decimal | 0.85 | `85.0%` |
| `seconds` | 2 decimals + "s" | 3.456 | `3.46s` |
| (null) | N/A literal | null | `N/A` |

## MetricConfigBuilder API

Fluent builder for creating custom `QualityMetricConfig` objects. Defaults: `aggregations: ['avg', 'count']`, `range: { min: 0, max: 1 }`, `unit: 'score'`, `alerts: []`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `displayName()` | `(name: string): this` | Set display name |
| `description()` | `(desc: string): this` | Set description |
| `aggregations()` | `(...aggs: EvaluationAggregation[]): this` | Set aggregations to compute |
| `range()` | `(min: number, max: number): this` | Set expected value range |
| `unit()` | `(unit: 'score' \| 'rate' \| 'seconds' \| 'percentage'): this` | Set measurement unit |
| `alertBelow()` | `(agg, value, severity, message?): this` | Alert when aggregation falls below value |
| `alertAbove()` | `(agg, value, severity, message?): this` | Alert when aggregation exceeds value |
| `build()` | `(): QualityMetricConfig` | Finalize and return config |

## Computation Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `computeDashboardSummary` | `(evaluationsByMetric: Map<string, EvaluationResult[]>, customMetrics?: Record<string, QualityMetricConfig>, period?: { start: string; end: string }) => QualityDashboardSummary` | Compute dashboard across all built-in + custom metrics. |
| `computeQualityMetric` | `(evaluations: EvaluationResult[], config: QualityMetricConfig, period?: { start: string; end: string }) => QualityMetricResult` | Compute a single metric from evaluation results. |
| `computeAggregations` | `(scores: number[], aggregations: EvaluationAggregation[]) => Record<EvaluationAggregation, number \| null>` | Compute aggregation values from raw scores. |
| `checkAlertThresholds` | `(values: Record<EvaluationAggregation, number \| null>, thresholds: AlertThreshold[]) => TriggeredAlert[]` | Check values against thresholds, return triggered alerts (sorted by severity). |
| `determineHealthStatus` | `(alerts: TriggeredAlert[], hasData: boolean) => 'healthy' \| 'warning' \| 'critical' \| 'no_data'` | Derive health status from triggered alerts. |
| `formatMetricValue` | `(value: number \| null, unit: QualityMetricConfig['unit']) => string` | Format a metric value for display. |
| `createMetricConfig` | `(name: string) => MetricConfigBuilder` | Create a fluent builder for custom metric configs. |

## Metric Registration API

| Function | Signature | Description |
|----------|-----------|-------------|
| `registerQualityMetric` | `(config: QualityMetricConfig) => void` | Register custom metric. Validates via Zod schema. Throws if name exists. |
| `unregisterQualityMetric` | `(name: string) => boolean` | Remove custom metric. Returns `true` if removed. Cannot remove built-in metrics. |
| `getAllQualityMetrics` | `() => Record<string, QualityMetricConfig>` | Get all metrics (built-in + custom). |
| `getQualityMetric` | `(name: string) => QualityMetricConfig \| undefined` | Get a specific metric by name. Checks built-in first, then custom. |

Zod validation via the exported `qualityMetricConfigSchema` enforces: `name` (1-100 chars), `displayName` (1-200 chars), `description` (0-1000 chars, empty string allowed), `aggregations` (min 1 entry), `message` (max 500 chars).

## Files

All tests in `src/lib/quality-metrics.test.ts`.

| File | Lines | Description |
|------|-------|-------------|
| `src/lib/quality-metrics.ts` | 721 | Metric configs, aggregation, alerting, builder, registration |
| `src/lib/quality-metrics.test.ts` | 523 | Test suite (50 tests) |

## Test Coverage

| Category | Tests |
|----------|-------|
| Pre-defined metrics (QUALITY_METRICS) | 6 |
| Aggregation computation | 10 |
| Alert threshold checking | 6 |
| Health status determination | 4 |
| Single metric computation | 5 |
| Dashboard summary | 5 |
| Metric registration | 7 |
| Value formatting | 5 |
| MetricConfigBuilder | 2 |
| **Total** | **50** |

## Related Documentation

- [Quality Evaluation Architecture](/reports/quality-evaluation-architecture/) - Evaluation storage and export
- [LLM-as-Judge Architecture](/reports/llm-as-judge-architecture/) - G-Eval, QAG, bias mitigation
- [Agent-as-Judge Architecture](/reports/agent-as-judge-architecture/) - Multi-agent evaluation patterns
