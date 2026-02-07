---
layout: single
title: "LLM-as-Judge Architecture"
date: 2026-02-03
author_profile: true
breadcrumbs: true
permalink: /reports/llm-as-judge-architecture/
categories: [documentation, observability-toolkit]
tags: [llm-as-judge, g-eval, qag, bias-mitigation, evaluation, opentelemetry]
excerpt: "G-Eval, QAG patterns, bias mitigation, and production utilities for evaluating AI outputs using AI judges."
header:
  overlay_image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# LLM-as-Judge Architecture

**Version**: 2.0.0
**Status**: Production
**Last Updated**: 2026-02-03

## Overview

LLM-as-Judge evaluates AI outputs using AI judges. This module provides G-Eval, QAG patterns, bias mitigation, and production utilities with enterprise-grade security.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LLM-as-Judge Components                       │
├─────────────────────────────────────────────────────────────────┤
│  Evaluation Patterns          Production Utilities              │
│  ├── gEval()                  ├── JudgeCircuitBreaker           │
│  ├── qagEvaluate()            ├── evaluateWithRetry (60s cap)   │
│  ├── mitigatedPairwiseEval()  ├── runCanaryEvaluations          │
│  └── panelEvaluation()        └── LOG_LEVEL configuration       │
├─────────────────────────────────────────────────────────────────┤
│  Security Layer                                                  │
│  ├── 14 prompt injection patterns + Unicode TR39                │
│  ├── Input validation (64KB total, 10KB/field, 20 context)      │
│  ├── Safe JSON parsing (depth=5, optimized iteration)           │
│  └── 30s default timeout on all LLM calls                       │
└─────────────────────────────────────────────────────────────────┘
```

## Core Types

```typescript
interface EvaluationEvent {
  timestamp: string;
  evaluationName: string;        // "relevance", "faithfulness"
  scoreValue?: number;           // 0.0 - 1.0
  scoreLabel?: string;           // "pass", "fail"
  explanation?: string;
  evaluator?: string;
  evaluatorType?: 'llm' | 'human' | 'rule' | 'classifier';
  traceId?: string;
  sessionId?: string;
  durationMs?: number;
  errorType?: string;
}

interface GEvalConfig {
  name: string;
  criteria: string;
  evaluationParams: ('input' | 'output' | 'context' | 'expectedOutput')[];
  temperature?: number;          // 0.1-0.2 for consistency
}

interface LLMProvider {
  generate(prompt: string, options?: { temperature?: number; logprobs?: boolean }): Promise<GenerateResult>;
}
```

## Evaluation Patterns

### G-Eval (Chain-of-Thought + Logprobs)

```
Input → Generate eval steps → Evaluate with CoT → Normalize via logprobs → Score
```

- `buildEvalPrompt()` - Constructs prompts with sanitization
- `normalizeWithLogprobs()` - Probability-weighted normalization
- `gEval()` - Full implementation

### QAG (Question-Answer Generation)

```
Output → Extract statements → Generate yes/no questions → Answer from context → Score
```

- `extractStatements()` - Atomic claims extraction
- `generateVerificationQuestion()` - Statement to question
- `answerQuestion()` - Context-based verification
- `qagEvaluate()` - Full faithfulness evaluation

### Bias Mitigation

| Strategy | Function | Description |
|----------|----------|-------------|
| Position bias | `mitigatedPairwiseEval()` | Double evaluation with order swap |
| Multi-judge | `panelEvaluation()` | Median score from multiple models |

## Production Utilities

### Circuit Breaker

```typescript
const breaker = new JudgeCircuitBreaker({
  threshold: 5,           // failures before opening
  resetTimeout: 30000,    // ms before retry
  fallbackModel: 'gpt-4o-mini'
});
```

- Ignores transient 429 rate limit errors
- Supports fallback model switching

### Retry Logic

```typescript
await evaluateWithRetry(testCase, config);
// - Exponential backoff (capped at 60s)
// - Preserves error.cause chain
// - Validates score range
```

### Canary Evaluations

```typescript
const report = await runCanaryEvaluations();
// Built-in test cases:
// - Perfect answer (should score high)
// - Hallucination (should score low)
// - Off-topic (should score very low)
```

## Security

| Protection | Implementation |
|------------|----------------|
| Prompt injection | 14 detection patterns + Unicode normalization |
| Size limits | 64KB total, 10KB/field, 20 context items |
| JSON safety | Depth limit (5), optimized parsing |
| Timeouts | 30s default on all LLM calls |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_JUDGE_LOG_LEVEL` | `warn` | debug, info, warn, error, silent |

## Files

| File | Lines | Description |
|------|-------|-------------|
| `src/lib/llm-as-judge.ts` | 1,699 | Main implementation |
| `src/lib/llm-as-judge.test.ts` | 3,171 | Test suite (108 tests) |

## Test Coverage

| Category | Tests |
|----------|-------|
| Security utilities | 28 |
| G-Eval pattern | 9 |
| QAG pattern | 11 |
| Bias mitigation | 17 |
| Production utilities | 27 |
| Canary evaluations | 7 |
| Performance benchmarks | 5 |
| Logging configuration | 4 |

## Related Documentation

- [Quality Evaluation Architecture](/reports/quality-evaluation-architecture/) - Broader evaluation context
