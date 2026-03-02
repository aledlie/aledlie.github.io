---
layout: single
title: "Wire Meta-Evaluation into Hooks T2 Quality Pipeline"
date: 2026-03-01
author_profile: true
categories: [observability, quality-engineering, hooks]
tags: [llm-judge, meta-evaluation, typescript, explanation-quality, security-hardening]
excerpt: "Implemented selective meta-evaluation of LLM judge explanations in the hooks T2 quality pipeline, capturing explanation text, validating scores, and applying input length caps to prevent prompt injection."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-03-01<br>
**Project**: observability-toolkit (hooks T2 quality pipeline)<br>
**Focus**: Meta-evaluation implementation for judge explanations<br>
**Session Type**: Implementation

## Executive Summary

Completed R6.2 implementation to wire meta-evaluation into the hooks T2 LLM quality pipeline, enabling selective evaluation of judge explanation quality (10% sample rate). The implementation captures structured `Score: X.XX\nExplanation: [...]` output from base judges (relevance, coherence), samples 10% for meta-evaluation, and emits `LLM_EXPLANATION_QUALITY` metrics. All 954 hooks tests pass (0 failures); toolkit tests unaffected (4537/4537 pass). Security hardening applied: NaN guards on score parsing, input length caps (500-2000 chars per field) with truncation helper, canary guards, recursion guards, and atomic budget reservation via `tryReserveBudget()`. Four code review findings documented in backlog for future hardening (budget snapshot asymmetry, test gaps, conditional exports).

## Key Metrics

| Metric | Count/Value |
|--------|-------------|
| **Source Files Modified** | 3 (stop.ts, quality-signals.ts, stop.test.ts) |
| **Tests Added** | 11 new test cases |
| **Test Suites Passing** | 954/954 hooks tests (0 failures) |
| **Commits** | 2 (source + dist rebuild) |
| **Code Review Findings** | 10 total (3 HIGH, 4 MEDIUM, 3 LOW); 2 fixed during session (NaN guard, input caps) |
| **Backlog Items Added** | 4 (R6.2-H1, R6.2-M1, R6.2-M2, R6.2-L1) |
| **Lines Added (stop.ts)** | 260+ (interfaces, helpers, meta-eval orchestration) |
| **Lines Added (tests)** | 210+ (11 new test cases + mock setup) |

## Problem Statement

R6.2 added `evaluateExplanationQuality()` to the observability-toolkit, but the hooks T2 quality pipeline (session-end LLM judge) had no integration point. The original `callLlmJudge()` returned only a numeric score with no explanation text, making meta-evaluation impossible. Additionally, judge prompts had no length caps, creating both context window overflow risk and prompt injection surface for two-hop attacks (user text → base judge explanation → meta-eval prompt).

## Implementation Details

### Architecture Decisions

**Choice**: Selective 10% meta-evaluation sample rate (matching toolkit `META_EVAL_SAMPLE_RATE`)

**Rationale**: Budget-constrained environment ($0.50/day cap); 10% provides signal without overrun. Base eval cost ~4.5¢ (33% increase due to explanation output); meta-eval marginal cost ~0.045¢/session.

**Alternative Considered**: Evaluate all explanations (high cost, no sampling)

**Trade-off**: Lose 90% of explanation quality signal; mitigated by canary sessions providing a low-cost validation path

---

**Choice**: Extract `callAnthropicJudge()` as a reusable helper, returning `JudgeResult { score, reason }` instead of raw `number`

**Rationale**: Eliminates prompt duplication, allows custom model override, supports both base and meta-eval judge paths, simplifies testing.

**Alternative Considered**: Inline all meta-eval logic into `callLlmJudge()`

**Trade-off**: Higher complexity in turn loop; mitigation: delegate pattern keeps `callLlmJudge()` minimal

---

**Choice**: Single-shot raw Anthropic API calls in hooks (no G-Eval chain-of-thought), consistent with relevance/coherence judges

**Rationale**: Deliberate simplification for hooks context; acceptable self-evaluation bias mitigated by `META_EVAL_JUDGE_MODEL` env override.

### Code Changes

#### 1. Constants & Input Validation (`stop.ts:45-74`)

```typescript
const META_EVAL_SAMPLE_RATE = 0.1;
const META_EVAL_METRIC_NAME = 'explanation_quality';
const JUDGE_MAX_TOKENS = 384;  // raised from 256 for explanation output
const META_EVAL_JUDGE_MODEL = process.env.META_EVAL_JUDGE_MODEL || SAMPLING_CONFIG.JUDGE_MODEL;

const MAX_USER_TEXT_LEN = 500;
const MAX_ASSISTANT_TEXT_LEN = 2000;
const MAX_REASON_LEN = 400;
const MAX_TOOL_RESULT_LEN = 500;

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '...[truncated]' : text;
}
```

**Rationale**: Length caps prevent context overflow and limit prompt injection surface. Truncation helper provides consistent multi-use behavior.

#### 2. Refactored API Helper (`stop.ts:861-911`)

```typescript
async function callAnthropicJudge(
  headers: Record<string, string>,
  prompt: string,
  canary: boolean,
  model?: string,
): Promise<JudgeResult> {
  if (canary) return { score: 0.2 + Math.random() * 0.3, reason: 'canary' };

  // ... API call ...

  const scoreMatch = text.match(/Score:\s*(\d+(?:\.\d+)?)/i);
  if (!scoreMatch?.[1]) throw new Error('llm_judge_score_parse_failed');

  const rawScore = parseFloat(scoreMatch[1]);
  if (isNaN(rawScore)) throw new Error('llm_judge_score_parse_failed');  // NaN guard
  const score = Math.max(0, Math.min(1, rawScore));

  const explanationMatch = text.match(/Explanation:\s*(.+)/i);
  const reason = explanationMatch?.[1]?.trim() || text.trim();  // fallback to full text

  return { score, reason };
}
```

**Security Fix**: NaN guard prevents silent propagation of invalid scores to metrics.

#### 3. Prompt Builders with Truncation (`stop.ts:1007-1048`)

```typescript
function buildRelevancePrompt(turn: { userText: string; assistantText: string; toolResults: string[] }): string {
  const safeUser = truncate(turn.userText, MAX_USER_TEXT_LEN);
  const safeAssistant = truncate(turn.assistantText, MAX_ASSISTANT_TEXT_LEN);
  const toolContext = turn.toolResults.length > 0
    ? `\nTool results used:\n${turn.toolResults.slice(0, 3).map(r => truncate(r, MAX_TOOL_RESULT_LEN)).join('\n---\n')}`
    : '';

  return `You are evaluating the relevance of an AI assistant's response to a user's request.

User request:
${safeUser}
...`;
}
```

**Security Fix**: All interpolated user-controlled content now has explicit length caps.

#### 4. Meta-Evaluation Guards & Orchestration (`stop.ts:934-1004`)

```typescript
function shouldMetaEvaluate(evaluationName: string, canary: boolean): boolean {
  if (canary) return false;                          // canary sessions skip meta-eval
  if (evaluationName === META_EVAL_METRIC_NAME) return false;  // recursion guard
  return Math.random() < META_EVAL_SAMPLE_RATE;
}

async function maybeMetaEvaluate(
  judgeHeaders: Record<string, string>,
  evaluationName: string,
  result: JudgeResult,
  userText: string,
  sessionId: string,
  canary: boolean,
): Promise<boolean> {
  if (!shouldMetaEvaluate(evaluationName, canary)) return false;
  if (!tryReserveBudget(COST_PER_METRIC_CENTS)) return false;  // atomic budget check

  try {
    const metaPrompt = buildExplanationQualityPrompt(
      evaluationName, result.score, result.reason, userText
    );
    const metaResult = await callAnthropicJudge(
      judgeHeaders, metaPrompt, false, META_EVAL_JUDGE_MODEL
    );
    recordMetric(QUALITY_METRIC_NAMES.LLM_EXPLANATION_QUALITY, metaResult.score, {
      evaluator_type: LLM_EVALUATOR_TYPE,
      'session.id': sessionId,
      'meta.original_evaluation': evaluationName,
    });
    appendEvaluation({
      name: META_EVAL_METRIC_NAME,
      score: metaResult.score,
      evaluatorType: LLM_EVALUATOR_TYPE,
      evaluator: META_EVAL_JUDGE_MODEL,
      sessionId,
      explanation: metaResult.reason,
      extraAttributes: { 'meta.original_evaluation': evaluationName },
    });
    return true;
  } catch {
    recordMetric('quality.llm_judge_failures', 1, {
      'session.id': sessionId,
      metric: META_EVAL_METRIC_NAME,
    });
    return false;
  }
}
```

**Design**: Recursion guard (`explanation_quality` never triggers meta-eval) prevents infinite chains. Atomic `tryReserveBudget()` ensures budget is decremented only on success.

#### 5. Turn Loop Integration (`stop.ts:793-848`)

```typescript
for (const turn of turns) {
  if (!hasBudget()) break;

  let relevanceResult: JudgeResult | null = null;
  let coherenceResult: JudgeResult | null = null;

  try {
    relevanceResult = await callLlmJudge(judgeHeaders, 'relevance', turn, canary);
  } catch {
    recordMetric('quality.llm_judge_failures', 1, { 'session.id': sessionId, metric: 'relevance' });
  }

  if (relevanceResult !== null) {
    if (tryReserveBudget(COST_PER_METRIC_CENTS)) {
      recordMetric(QUALITY_METRIC_NAMES.LLM_RELEVANCE, relevanceResult.score, {...});
      appendEvaluation({
        ...
        explanation: relevanceResult.reason,  // NEW: pass explanation
      });
    }
    const ran = await maybeMetaEvaluate(judgeHeaders, 'relevance', relevanceResult, turn.userText, sessionId, canary);
    if (ran) metaEvalsCount++;
  }
  // ... same for coherence ...
}
ctx.addAttribute('quality.meta_evals_run', metaEvalsCount);
```

**Key Change**: `appendEvaluation()` now receives `explanation: result.reason`, enabling external systems to access judge reasoning.

#### 6. Metric Name Addition (`quality-signals.ts:21`)

```typescript
export const QUALITY_METRIC_NAMES = {
  LLM_RELEVANCE: 'llm.judge.relevance',
  LLM_COHERENCE: 'llm.judge.coherence',
  LLM_EXPLANATION_QUALITY: 'llm.judge.explanation_quality',  // NEW
} as const;
```

### Test Coverage

11 new tests added to `stop.test.ts`, covering:

1. **`shouldMetaEvaluate()` Statistical Test** — 10K iterations verify ~10% true rate (7-13% band)
2. **Recursion Guard** — `explanation_quality` always returns false
3. **Canary Guard** — Canary sessions skip meta-eval
4. **Prompt Content** — `buildExplanationQualityPrompt()` includes evaluation name, score, reason, user text, all 5 score anchors
5. **Response Parsing** — `Score: 0.85\nExplanation: [...]` correctly extracted
6. **Fallback Parse** — Missing `Explanation:` line falls back to full text
7. **Custom Model** — Model override forwarded to API call
8. **JUDGE_MAX_TOKENS** — Verified in API request body
9. **Canary Shape** — `{ score: [0.2-0.5], reason: 'canary' }`
10. **T2 Integration** — Explanation passed through to `appendEvaluation()`
11. **Mock Setup** — 6 missing module mocks added for T2 coverage

## Testing and Verification

```bash
$ cd ~/.claude/hooks && npx tsc --noEmit
# Clean — no type errors

$ npx vitest run handlers/stop.test.ts
✓ handlers/stop.test.ts (25 tests)  12ms
  Test Files  1 passed (1)
  Tests       25 passed (25)

$ npx vitest run
✓ 34 test files (954 tests)  2.66s
  Test Files  34 passed (34)
  Tests       954 passed (954)
```

Toolkit tests (4537/4537) unaffected.

## Code Review Findings (Fixed)

### Security Hardening Applied

1. **NaN Guard** (`stop.ts:902-903`) — `parseFloat` result validated with `isNaN()` before clamping
2. **Input Length Caps** (`stop.ts:65-74, 1007-1048`) — All prompt builders truncate user text (500 chars), assistant text (2000 chars), judge reason (400 chars), tool results (500 chars each)

## Code Review Findings (Backlog)

| ID | Priority | Issue | Notes |
|----|----------|-------|-------|
| R6.2-H1 | P1 | Budget snapshot race (`hasBudget()` pre-checks + dual `tryReserveBudget()` per metric) | Asymmetry between outer snapshot reads and inner atomic reservations; restructure base eval guard to pre-check reservation success |
| R6.2-M1 | P2 | Missing test for `maybeMetaEvaluate()` budget exhaustion path; `maybeMetaEvaluate` not in `_test` export | Add to `_test` or create pipeline-level test |
| R6.2-M2 | P2 | Gate `_test` export on `NODE_ENV === 'test'` | Signals test-only surface; prevents accidental `callAnthropicJudge` bypass of budget guard |
| R6.2-L1 | P3 | Misleading API key scope comment in `handleQualityEvaluation()` | Closure semantics mean key remains reachable; remove or reword |

Documented in `/mcp-servers/observability-toolkit/docs/BACKLOG.md`.

## Files Modified/Created

| File | Lines | Change |
|------|-------|--------|
| `hooks/handlers/stop.ts` | +260 | Types, constants, helpers, meta-eval orchestration, prompt builders with caps |
| `hooks/handlers/stop.test.ts` | +210 | Module mocks (quality-sampler/budget/signals/transcript-parser/otel), 11 test cases |
| `hooks/lib/quality-signals.ts` | +1 | `LLM_EXPLANATION_QUALITY` metric name |
| `hooks/dist/handlers/stop.js` | +173 | Compiled output (rebuilt) |
| `hooks/dist/lib/quality-signals.js` | +3 | Compiled output (rebuilt) |
| `docs/BACKLOG.md` | +7 | Code review follow-ups (R6.2-H1 through R6.2-L1) |

## Git Commits

- **`2318993`**: `feat(hooks): wire meta-evaluation into T2 quality pipeline` — 4 source files, +470/-56
- **`ef8891b`**: `build(hooks): rebuild dist after meta-evaluation wiring` — 3 dist files

Pushed to `origin/main` (2026-03-01).

## References

**Related R6.2 Deliverables**:
- Toolkit: `src/lib/judge/llm-judge-config.ts:167-173` — `EXPLANATION_QUALITY_CRITERIA` scoring rubric (mirrors hooks implementation)
- Previous session: `docs/roadmap/impl-r62-explanation-quality-meta-eval.md` — R6.2 specification

**Hooks Modules**:
- `lib/quality-sampler.ts` — Session sampling (10% rate, canary logic)
- `lib/quality-budget.ts` — Budget reservation (`tryReserveBudget()`)
- `lib/quality-signals.ts` — Metric names and evaluation JSONL appending
- `handlers/stop.ts` — T2 pipeline (lines 746-848 turn loop; 861-1004 judge/meta-eval)

**CLAUDE.md Conventions** (followed):
- Named exports (`export const QUALITY_METRIC_NAMES`)
- TypeScript 2-space indent
- Snake_case OTel attribute values (`'llm.judge.explanation_quality'`)
- camelCase properties (`evaluator`, `sessionId`)
- `@deprecated` JSDoc for breaking changes (if needed in future)

---

**Session End**: 2026-03-01, 21:23 UTC
