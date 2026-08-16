---
layout: single
title: "OTel GenAI Semconv Conformance: Fixing Three Gaps Without Breaking History"
date: 2026-08-13
author_profile: true
categories: [observability, telemetry, opentelemetry]
tags: [otel-genai, semconv, metrics, spans, conformance, histogram, agent-spans]
excerpt: "Three OpenTelemetry GenAI semantic conformance gaps closed with zero breaking changes — agent span naming, hook span semantics, and a histogram metric emitted in parallel with the existing counter so historical data stays valid."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/otel-genai-semconv-conformance/
---

**Session Date**: 2026-08-13<br>
**Project**: claude-dev-environment (hooks instrumentation)<br>
**Focus**: OpenTelemetry GenAI semantic conventions compliance<br>
**Session Type**: Implementation | Refactoring

## Executive Summary

A telemetry audit the previous day found eight semantic-conformance gaps in the hooks instrumentation, measured against the [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions). Three of them touched the GenAI conventions directly and were fixed in this session: agent span naming, hook span semantics, and the instrument type used for token-usage metrics.

The interesting constraint was the third one. The spec requires `gen_ai.client.token.usage` to be a **Histogram**; the system emitted it as a **Counter**. Converting in place would have been a one-line change that silently rewrote the meaning of every historical datapoint — a counter's monotonic total and a histogram's distribution are not the same measurement, and no analysis pipeline reading the old data would know the semantics had shifted underneath it. So instead of converting, the fix emits both in parallel: the counter continues unchanged for historical continuity, and a new histogram satisfies the spec. Consumers migrate when they choose.

All three fixes landed with zero breaking changes across two commits, with 1,731 tests passing and a clean TypeScript and ESLint build.

## Key Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Gaps addressed this session | 3 of 8 (the GenAI-conventions subset) | Complete |
| Source files modified | 4 | `hooks/handlers` and `hooks/lib` |
| Tests passing | 1,731 | +3 new histogram tests |
| Test regressions | 0 | None |
| Build | Clean | ESLint + TypeScript |
| Commits | 2 | |
| Net lines added | +125 | Implementation + tests |
| Breaking changes | 0 | No migration required |

## Problem Statement

The audit identified eight conformance gaps. Five concerned metric naming and namespacing — a cost metric squatting in the reserved `gen_ai.*` namespace, attributes emitted as if they were metric names, a legacy `llm.*` prefix predating `gen_ai.*` — and were fixed separately by vendor-prefixing them under `integritystudio.*`. The three addressed here were the ones bearing on GenAI span and metric semantics:

**Gap 1 — span name carries no agent identity.** The spec says a span name SHOULD be `invoke_agent {gen_ai.agent.name}` when the name is available. The synthetic span was named plain `invoke_agent`, so every agent invocation in a trace looked identical until you opened its attributes.

**Gap 2 — two spans for one operation, with no signal which is authoritative.** Each agent invocation emitted a `hook:agent-pre-tool` / `hook:agent-post-tool` pair *alongside* a synthetic `invoke_agent` span covering the full operation. A consumer checking conformance had no way to tell which spans were the spec-conformant model and which were internal instrumentation.

**Gap 3 — wrong instrument type.** `gen_ai.client.token.usage` is specified as a Histogram with unit `{token}`. It was emitted as a Counter. The unit was already correct.

## Implementation

### Gap 1: Agent span naming

One line, in the synthetic span construction:

```typescript
// Before
synthSpans.push({
  name: 'invoke_agent',
  traceId: pending.traceId,
  spanId: pending.invokeSpanId,
  // ...
});

// After
synthSpans.push({
  name: `invoke_agent ${pending.agentName}`,
  traceId: pending.traceId,
  spanId: pending.invokeSpanId,
  // ...
});
```

Span names now read `invoke_agent code-reviewer`, `invoke_agent web-research-analyst`, and so on. The practical gain is in trace visualization and backend grouping: identifying which agent produced a span no longer requires loading its attributes, and backends that group by span name produce meaningful buckets instead of one undifferentiated `invoke_agent` pile.

### Gap 2: Hook span semantics

The fix here was clarification rather than consolidation:

```typescript
// Before
await instrumentHook('agent-pre-tool', async (ctx) => {
  // ...
}, { 'hook.trigger': 'PreToolUse', 'hook.type': 'agent' });

// After
// Note: This hook span is internal instrumentation for operational visibility.
// The authoritative GenAI-spec conformant span is the synthetic invoke_agent span
// created in post-tool, which covers the full operation (pre-tool → post-tool).
await instrumentHook('agent.operation.prepare', async (ctx) => {
  // ...
}, { 'hook.trigger': 'PreToolUse', 'hook.type': 'agent', 'hook.instrumentation': 'internal' });
```

Four changes: `hook:agent-pre-tool` became `agent.operation.prepare`, `hook:agent-post-tool` became `agent.operation.finalize`, both gained a `'hook.instrumentation': 'internal'` attribute, and both call sites gained a comment explaining which span is authoritative.

The audit had noted the pre-tool span is "largely redundant under the semconv model," which invited removing it. I kept it. Hook spans provide operational visibility into the instrumentation itself — useful for debugging the telemetry pipeline, which is a different job from modeling the agent operation. The problem was never that both spans existed; it was that nothing distinguished them. An explicit `internal` marker lets conformance tooling filter correctly while preserving the debugging signal, at zero architectural cost.

### Gap 3: Histogram in parallel with the counter

```typescript
// Before
const METRIC_TOKEN_USAGE = 'gen_ai.client.token.usage';

registry.incrementCounter(METRIC_TOKEN_USAGE, params.inputTokens, {
  ...baseAttrs,
  'gen_ai.token.type': 'input',
}, { description: 'Number of tokens used by LLM operations', unit: UNITS.TOKEN });

// After
const METRIC_TOKEN_USAGE_COUNTER = 'gen_ai.client.token.usage';
const METRIC_TOKEN_USAGE_HISTOGRAM = 'gen_ai.client.token.usage.histogram';

// COUNTER — retained for historical continuity
registry.incrementCounter(METRIC_TOKEN_USAGE_COUNTER, params.inputTokens, {
  ...baseAttrs,
  'gen_ai.token.type': 'input',
}, { description: 'Number of tokens used by LLM operations (counter for historical compatibility)', unit: UNITS.TOKEN });

// HISTOGRAM — spec-compliant
registry.recordHistogram(METRIC_TOKEN_USAGE_HISTOGRAM, params.inputTokens, {
  ...baseAttrs,
  'gen_ai.token.type': 'input',
}, { description: 'Distribution of tokens used by LLM operations (histogram for semconv compliance)', unit: UNITS.TOKEN });
```

Both metrics carry identical attributes and values, which is what makes the migration path clean: a consumer switching from one to the other gets the same numbers, grouped the same way, with only the instrument semantics differing.

The same code path also infers the `gen_ai.provider.name` attribute the spec requires, from the model name:

```typescript
function inferProvider(model: string): string {
  if (model.includes('claude')) return 'anthropic';
  if (model.includes('gpt')) return 'openai';
  if (model.includes('gemini')) return 'google';
  if (model.includes('llama')) return 'meta';
  if (model.includes('mistral')) return 'mistral';
  return 'unknown';
}
```

That attribute closes a separate audit finding — the spec marks `gen_ai.provider.name` as Required, while the system had been emitting `gen_ai.system`, which was removed from the registry entirely rather than merely deprecated.

## Testing and Verification

The existing test mocks captured counters only, so they needed to track histograms before the new behavior could be asserted:

```typescript
interface HistogramCreation {
  name: string;
  options: { description?: string; unit?: string } | undefined;
  records: CounterAdd[];
}

const { creations, histogramCreations } = vi.hoisted(() => ({
  creations: [] as CounterCreation[],
  histogramCreations: [] as HistogramCreation[],
}));

vi.mock('./otel.js', () => ({
  getCounter: (name: string, options?: ...) => {
    const creation: CounterCreation = { name, options, adds: [] };
    creations.push(creation);
    return { add: (value, attributes) => creation.adds.push({ value, attributes }) };
  },
  getHistogram: (name: string, options?: ...) => {
    const creation: HistogramCreation = { name, options, records: [] };
    histogramCreations.push(creation);
    return { record: (value, attributes) => creation.records.push({ value, attributes }) };
  },
}));
```

Three tests were added — histogram recording of input tokens, of output tokens, and unit annotation on both call sites:

```typescript
it('records the input token count in histogram (spec-compliant)', () => {
  recordTokenUsage({ inputTokens: 1000, outputTokens: 100, model: OPUS });
  expect(recordFor(TOKEN_USAGE_HISTOGRAM, 'input').value).toBe(1000);
});
```

Three existing tests were updated to assert across both instruments rather than just the counter: unit annotation (now scoped explicitly to the counter), attribute merging, and zero-token recording. That last one matters more than it looks — a histogram that silently drops zero-valued observations produces a different distribution than the counter's total implies.

```
npm run hooks:test

 RUN  v4.1.10  hooks/

 Test Files  70 passed (70)
      Tests  1731 passed (1731)
   Start at  17:21:30
   Duration  4.06s
```

TypeScript compilation clean; ESLint passing via the pre-commit hook.

## Decision Rationale

**Gap 1 — include the agent name.** The spec specifies it, it costs one string template, and it removes an attribute lookup from the most common trace-reading task. No real trade-off. *Alternative rejected:* leave it non-compliant.

**Gap 2 — clarify rather than consolidate.** Removing the pre-tool span would have satisfied a literal reading of "one operation, one span" while destroying operational visibility into the instrumentation itself. Consolidating the two hook spans into one was an architectural change with real cost and no conformance benefit, since the synthetic span was *already* the conformant model. Labeling won because the actual defect was ambiguity, not span count. *Trade-off accepted:* two hook spans still emit, but their role is now unambiguous and documented at the call site.

**Gap 3 — parallel metrics rather than conversion.** Conversion is the smaller diff and the worse change: it invalidates historical interpretation without any signal to downstream consumers. Parallel emission preserves every existing datapoint's meaning, satisfies the spec for anyone who wants conformance, and lets migration happen on the consumer's schedule. *Trade-off accepted:* four metrics emitted where there were two, at negligible overhead.

## Backward Compatibility

| Change | Type | Impact |
|--------|------|--------|
| Synthetic span name | Cosmetic | Display and grouping only; span function unchanged |
| Hook span renames | Internal detail | Behavior identical; documented as internal instrumentation |
| New histogram metric | Additive | Existing counter untouched |
| Existing counter | Unchanged | All historical data remains valid |
| Attributes | Identical on both instruments | Consumers keep full context |

No migration required, and adoption of the new metric is optional.

## Conformance Status

| Gap | Requirement | Before | After |
|-----|-------------|--------|-------|
| 1 | Span name includes agent identity | Missing agent name | `invoke_agent {name}` |
| 2 | Clear semantic model for spans | Ambiguous dual spans | Internal spans labeled; synthetic span authoritative |
| 3 | Token usage as Histogram | Counter only | Counter + Histogram |

## Still Outstanding

Worth recording what this session did *not* close. Beyond the eight numbered gaps, the audit listed a set of metrics the GenAI conventions define but this instrumentation does not emit at all:

- `gen_ai.invoke_agent.duration` (Histogram, seconds)
- `gen_ai.invoke_agent.inference_calls`
- `gen_ai.invoke_agent.tool_calls`
- `gen_ai.execute_tool.duration`

These are conformance-by-omission rather than incorrect emission, which is probably why they were never numbered as gaps — nothing is *wrong*, there is simply less coverage than the spec anticipates. The duration metric in particular looks close to free: the synthetic `invoke_agent` span already spans pre-tool start to post-tool end, so the measurement exists and only needs recording as a histogram. That is the obvious next increment.

## Summary

Three GenAI conformance gaps closed, 1,731 tests passing, zero breaking changes. The through-line in all three fixes is that the cheapest diff was the wrong one: converting the counter, deleting the redundant span, and leaving the span name alone would each have been smaller changes that traded away historical data, debugging signal, or spec compliance. Emitting telemetry that conforms to a shared convention is worth something mainly because other tools can then read it without bespoke knowledge — and that value evaporates if reaching conformance quietly breaks the data you already have.

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 33.1 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 14.3 | US school grade level (College) |
| Gunning Fog Index | 17.9 | Years of formal education needed |
| SMOG Index | 16.2 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 14.8 | Grade level via character counts |
| Automated Readability Index | 14.8 | Grade level via characters/words |
| Dale-Chall Score | 12.75 | <5 = 5th grade, >9 = college |
| Linsear Write | 15.4 | Grade level |
| Text Standard (consensus) | 14th and 15th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 1,241 |
| Sentence count | 54 |
| Syllable count | 2,206 |
| Avg words per sentence | 23.0 |
| Avg syllables per word | 1.78 |
| Difficult words | 308 |
