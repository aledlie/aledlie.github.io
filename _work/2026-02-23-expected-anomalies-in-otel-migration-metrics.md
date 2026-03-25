---
layout: single
title: "Expected Anomalies in OTEL Migration Metrics"
date: 2026-02-23
author: Alyshia Ledlie
author_profile: true
read_time: true
excerpt: "Why dramatic metric dips during multi-session migrations are expected, not alarming — and how to classify them in your telemetry."
description: "Analysis of why observability metric dips during code migrations are expected anomalies, with statistical approaches for classification and OTEL implementation patterns."
keywords: opentelemetry, anomaly detection, migration metrics, observability, SRE, expected degradation
header:
  image: /assets/images/cover-work.png
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true
permalink: /work/expected-anomalies-otel-migration-metrics/
categories:
  - Observability
  - AI
tags:
  - opentelemetry
  - anomaly-detection
  - migration
  - sre
schema_type: tech-article
---

Your observability dashboard turns red. Tool correctness drops to 0.89. Latency spikes. Token burn climbs past the alert threshold. You investigate — and find nothing broken. The system was doing exactly what it was supposed to: migrating 40 files from JavaScript to TypeScript across three sessions.

This is the expected anomaly problem. It surfaces whenever a multi-session task — a migration, a large refactor, an architecture change — creates telemetry signatures that look identical to genuine regressions. If your alerting system cannot distinguish between planned degradation and incidents, you lose trust in it. And once engineers stop trusting alerts, real incidents get ignored.

This article documents the problem, the statistical approaches for solving it, and an implementation pattern using OpenTelemetry resource attributes.

## The Anatomy of a Migration Dip

The AlephAuto project recently completed a three-phase TypeScript migration (commits `ed9bcdb`..`a240084`). Each session showed characteristic metric dips in the OTEL telemetry:

### Tool Correctness Drops

TypeScript migrations produce a predictable cycle of `tsc` failures. You rename a file from `.js` to `.ts`, and every import path that referenced it breaks. You fix those imports, and the type checker surfaces new errors in the newly-typed code. Each `tsc` failure registers as a tool failure in the hooks system, dragging `tool_correctness` below the 0.95 threshold.

This is not a regression. The tool (TypeScript compiler) is doing exactly what it should — reporting real errors that the developer is actively fixing. But the telemetry system sees only "tool invoked, tool failed" and counts it against correctness.

### Latency Spikes

Migration sessions involve larger diffs than typical bugfix or feature sessions. A single commit might touch 15 files. The hooks that run on `Write` and `Edit` events — TypeScript checking, code structure analysis, Python linting — take longer when operating on larger changesets. The per-tool latency distribution shifts right, triggering latency alerts calibrated for normal sessions.

### Token Burn

Migrations involve exploration. The developer (or agent) reads unfamiliar code paths, tries approaches that do not work, backtracks, and tries again. This is the nature of migration work — you are learning the shape of the codebase as you transform it. Token consumption climbs because the task genuinely requires more context than a focused bugfix.

## Planned Degradation vs Incidents

SRE practice already has a concept for this: the maintenance window. When you deploy a database migration, you do not count the brief downtime against your SLO. When you perform a blue-green deployment, the increased error rate during the switchover is excluded from your error budget calculations.

The same principle applies to AI agent telemetry. A migration session is a maintenance window for your metrics. The degradation is:

- **Planned** — the developer chose to begin a migration, knowing it would produce temporary failures
- **Bounded** — it affects specific metric dimensions (tool correctness, latency) during specific sessions
- **Self-resolving** — metrics return to baseline once the migration completes

An incident, by contrast, is:

- **Unplanned** — no one expected the degradation
- **Unbounded** — it is unclear which metrics are affected or when they will recover
- **Requiring intervention** — the system will not heal itself

The challenge is encoding this distinction in telemetry data so that dashboards, alerts, and trend analysis can respect it.

## Statistical Classification

Before implementing manual tagging, consider what the data itself can tell you. Three statistical approaches are particularly effective for classifying session-level anomalies.

### Per-Session-Type Baselines

Not all sessions are alike. A migration session has fundamentally different statistical properties than a bugfix session. Comparing them against a single global baseline guarantees false positives.

Instead, maintain per-type baselines:

| Session Type | tool_correctness baseline | latency_p95 baseline | token_burn baseline |
|---|---|---|---|
| bugfix | 0.97 (IQR: 0.95–0.99) | 0.8s | 45K |
| feature | 0.95 (IQR: 0.92–0.98) | 1.2s | 80K |
| migration | 0.88 (IQR: 0.83–0.93) | 2.1s | 150K |
| refactor | 0.93 (IQR: 0.90–0.96) | 1.0s | 60K |
| exploration | 0.91 (IQR: 0.87–0.95) | 0.5s | 120K |

A `tool_correctness` of 0.89 is a critical alert for a bugfix session but perfectly normal for a migration. The same value, two entirely different meanings.

### MAD-Based Modified Z-Score

The Median Absolute Deviation (MAD) is a robust measure of spread that is resistant to outliers — exactly what you need when migration sessions create extreme values.

The modified Z-score for a metric value `x` within a session type is:

```
M_i = 0.6745 * (x_i - median) / MAD
```

Where `MAD = median(|x_i - median(x)|)` and the constant 0.6745 makes the result comparable to a standard Z-score for normally distributed data.

A modified Z-score above 3.5 indicates a potential anomaly. Below 3.5, the value is within expected variation for that session type. This is more robust than mean/standard-deviation approaches because a single extreme migration session will not distort the baseline.

### CUSUM for Sustained Regression

Individual session anomalies are expected during migrations. What you actually want to detect is a *sustained* shift — a regression that persists after the migration ends.

Cumulative Sum (CUSUM) control charts track the cumulative deviation from the baseline:

```
S_n = max(0, S_{n-1} + (x_n - target - allowance))
```

Where `target` is the per-type baseline and `allowance` is the acceptable deviation (typically 0.5 * MAD). A CUSUM alarm triggers when `S_n` exceeds a decision threshold (typically 4-5 * MAD).

This means: five consecutive migration sessions with slightly low `tool_correctness` will not trigger an alarm. But if `tool_correctness` stays depressed *after* the migration ends and sessions return to bugfix/feature types, CUSUM will detect the sustained shift.

## Implementation: The `is-expected-anomaly` Pattern

The statistical approaches above work retrospectively. For real-time classification, you need a forward-looking signal: a declaration at session start that this session is expected to produce anomalous metrics.

### OTel Resource Attributes

OpenTelemetry resource attributes attach metadata to every span and metric in a session. Two new attributes enable anomaly classification:

```typescript
// In session-start hook
ctx.addAttributes({
  'session.type': 'migration',           // bugfix | feature | migration | refactor | exploration
  'session.expected_degradation': true,   // explicit flag for anomaly filtering
});
```

These attributes propagate to all downstream spans, metrics, and logs. Dashboard queries can then filter:

```sql
-- Alert query: exclude expected degradation
SELECT avg(tool_correctness)
FROM session_metrics
WHERE session.expected_degradation != true
  AND timestamp > now() - interval '7 days'
HAVING avg(tool_correctness) < 0.95
```

### Two-Tier Thresholds

With session type available, threshold checks become type-aware:

| Metric | Global Threshold | Migration Threshold | Feature Threshold |
|---|---|---|---|
| tool_correctness | 0.95 | 0.80 | 0.93 |
| token_burn | 200K | 400K | 150K |
| hook_latency_p95 | 500ms | 1500ms | 500ms |

The global threshold remains as a catch-all, but type-specific thresholds reduce false positives by 60-80% based on the observed distribution from the AlephAuto migration.

### Session Type Inference

Manual tagging is a starting point, but the goal is automated inference. Session characteristics that predict type:

- **Migration signals:** High ratio of file renames/moves, import path changes in diffs, `tsc` invocations with many errors, cross-file edit patterns
- **Bugfix signals:** Small diffs, test file modifications, single-file focus, error reproduction patterns
- **Feature signals:** New file creation, test additions, API route changes
- **Refactor signals:** No new files, no test changes, structural modifications to existing code

A lightweight classifier using git diff characteristics could assign session type automatically after the first few tool invocations.

## Reducing Error Bars Over Time

The per-type baselines are only as good as the data behind them. Early on, with few sessions per type, the confidence intervals are wide — a migration baseline built from three sessions has enormous uncertainty.

The roadmap:

1. **Phase 1: Manual tagging** — Developer sets `session.type` at session start. Baselines accumulate. Error bars are wide.
2. **Phase 2: Heuristic inference** — After 20+ sessions per type, git diff characteristics can suggest a session type automatically. Developer confirms or overrides.
3. **Phase 3: Automated classification** — With 100+ sessions, a simple classifier (decision tree on diff features) assigns type with high confidence. Manual override remains available.

Each phase narrows the error bars. At Phase 3, a modified Z-score of 3.5 represents genuine statistical significance rather than "we do not have enough data to say."

## Conclusion

Expected anomalies are an unavoidable consequence of multi-session work that changes the character of your codebase. The solution is not to suppress alerts during migrations — it is to give your telemetry system enough context to distinguish planned degradation from genuine regressions.

The implementation is straightforward: tag sessions with their type, maintain per-type baselines, and use robust statistics (MAD Z-score, CUSUM) that are resistant to the very outliers you are trying to classify. The hard part is building enough data to make the baselines meaningful, which is why starting with manual tagging now puts you in a position to automate later.

---

## Appendix A: Session OTEL Data

Telemetry from the session that prompted this analysis (2026-02-23, AlephAuto project):

| Metric | Value | Threshold | Status |
|---|---|---|---|
| tool_correctness | 0.89 | 0.95 | CRITICAL (global) / OK (migration) |
| eval_latency | 0.006s | — | Normal |
| total_spans | 14 | — | Normal |
| hook_types | 6 | — | Normal |

Span breakdown by hook handler:
- `session-start`: 1 span (environment checks, git status, task restore)
- `post-tool`: 8 spans (Write, Edit, Bash operations)
- `pre-tool`: 2 spans (permission checks)
- `stop`: 1 span (session cleanup)
- `user-prompt`: 1 span (prompt processing)
- `notification`: 1 span (alert dispatch)

The `tool_correctness` dip came from `tsc` check failures during TypeScript migration cleanup — renamed imports, enum-to-const conversions, and `.js`→`.ts` extension updates that temporarily broke the type checker.

## Appendix B: AlephAuto TS Migration Telemetry Patterns

The AlephAuto TypeScript migration (Phase 2-3) ran across multiple sessions from 2026-02-14 through 2026-02-18. Common telemetry signatures observed:

**Import path failures:** Renaming `foo.js` to `foo.ts` breaks every `import ... from './foo.js'` statement. Each broken import produces a `tsc` diagnostic, counted as a tool failure. Typical pattern: 5-15 import errors per renamed file, all resolved within the same session.

**Enum-to-const migration:** TypeScript `enum` declarations were converted to `as const` objects with `z.nativeEnum()` Zod schemas. Each conversion temporarily produces type errors in consumers until the import types are updated. Pattern: 2-4 type errors per enum conversion.

**Test file updates:** Test files that imported from `.js` paths needed corresponding updates. Since test files are not type-checked in the same pass, these failures surfaced as runtime errors rather than `tsc` errors, creating a different failure signature.

**Session duration:** Migration sessions averaged 45 minutes vs 20 minutes for bugfix sessions. The longer duration amplifies all cumulative metrics (total token burn, total tool invocations, total failures).

These patterns are consistent across TypeScript migrations in general — they are not specific to AlephAuto. Any project undergoing a JS-to-TS migration should expect similar telemetry signatures and should pre-classify those sessions as expected anomalies.
