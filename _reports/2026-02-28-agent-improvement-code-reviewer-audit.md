---
layout: single
title: "Agent Quality Audit: Telemetry-Driven Code Reviewer Improvement"
date: 2026-02-28
author_profile: true
categories: [agent-quality, observability]
tags: [agent-auditor, code-reviewer, otel, telemetry, hooks, jitter, evaluation-injection, agent-improvement]
excerpt: "Ran agent-improvement on code-reviewer — scored 49.5/60 (A), investigated error and rate-limit telemetry, deployed jitter fix and auto-evaluation injection hook."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-28<br>
**Project**: claude-dev-environment (hooks + agents)<br>
**Focus**: Agent quality audit, telemetry investigation, hook-level fixes<br>
**Session Type**: Investigation | Implementation

## Executive Summary

Ran the agent-improvement loop on the code-reviewer agent. Agent-auditor scored it 49.5/60 (Grade A) — no rewrite needed. The audit flagged two actionable telemetry issues: an 8.96% error rate and 7.2% rate-limit rate. Deep investigation of 181 post-tool spans across 7 days revealed the error rate was self-resolved (broad-scope prompts in early sessions) and the rate-limit rate was caused by concurrent session saturation on a spike day with 34 sessions.

Deployed two fixes: a 0-3s jitter in `handlePostCommitReview` to stagger concurrent API calls, and a scope-splitting guardrail on the code-reviewer agent. Then built an automatic evaluation injection system — the `agent-post-tool` hook now parses agent-auditor scorecard output and writes evaluation records to telemetry via `appendEvaluation()`, eliminating manual bash injection from the agent-improvement skill.

| Metric | Value |
|--------|-------|
| Agent score | 49.5/60 (A) |
| Telemetry spans analyzed | 181 |
| Error rate (actual) | 4.4% (8/181) |
| Rate-limit rate | 7.2% (13/181) |
| Commits | 6 (3 source + 3 dist) |
| Tests added | 6 new, 3 modified |
| Tests passing | 133/133 |

## Problem Statement

The agent-improvement skill lacked telemetry data documentation, making it difficult to diagnose issues. When the agent-auditor flagged code-reviewer's error and rate-limit rates, there was no systematic way to investigate the root cause. Additionally, evaluation records were injected via inline bash commands in the skill — fragile and not integrated with the hooks architecture.

## Implementation Details

### 1. Jitter in Post-Commit Review

Added `COMMIT_REVIEW_JITTER_MS` constant (3000ms) and random delay before `instrumentHook` call to prevent thundering herd when multiple sessions commit simultaneously.

`hooks/handlers/post-tool.ts:1078-1089`:
```typescript
const COMMIT_REVIEW_JITTER_MS = 3000;

async function handlePostCommitReview(input: HookInput): Promise<void> {
  if (!isGitCommit(input)) return;
  if (!commitSucceeded(resolveOutputText(input))) return;

  const jitterMs = Math.floor(Math.random() * COMMIT_REVIEW_JITTER_MS);
  await new Promise(resolve => setTimeout(resolve, jitterMs));

  await instrumentHook('post-commit-review', async (ctx) => {
    // ... records review.jitter_ms attribute
```

Jitter placed before `instrumentHook` to avoid inflating measured hook span duration (stays under 500ms median threshold).

### 2. Agent-Auditor Evaluation Injection Hook

New `injectAuditEvaluations()` function parses scorecard tables from agent-auditor output and calls `appendEvaluation()` per dimension + total.

`hooks/handlers/post-tool.ts:478-540`:
```typescript
const AUDIT_LABEL_MAP: Record<string, string> = {
  telemetry: 'telemetry',
  definition: 'definition',
  prompt: 'prompting',     // "Prompt Engineering" → prompting
  overlap: 'overlap',
  alignment: 'alignment',
  efficiency: 'efficiency',
};

const DIMENSION_SCORE_PATTERN = /\|\s*\d+\.\s*([^|]+?)\s*\|\s*([\d.]+)\s*(?:\/\s*10)?\s*\|/g;
```

Wired into `handleAgentPostTool` — fires when `agent-auditor` completes without error:
```typescript
if (agentType === 'agent-auditor' && !hasError && !hasRateLimit) {
  try { injectAuditEvaluations(output, input.session_id || ''); }
  catch { /* best-effort */ }
}
```

### 3. EvaluationRecord Extension

Extended `EvaluationRecord` interface with `extraAttributes` for pass-through fields like `gen_ai.agent.name`:

`hooks/lib/quality-signals.ts:103-112`:
```typescript
interface EvaluationRecord {
  // ... existing fields
  extraAttributes?: Record<string, string | number | boolean>;
}
```

### 4. Code Reviewer Guardrail

Added scope-splitting guardrail to `agents/code-reviewer.md:56`:
```
- If reviewing more than 5 files, split into multiple reviews by area (e.g., API, UI, tests)
```

### 5. Agent Improvement Telemetry Docs

Added "Agent Telemetry Data" section to `skills/agent-improvement/SKILL.md` with span type table, common query snippets, and evaluation record naming conventions.

## Telemetry Investigation Findings

### Error Pattern (Self-Resolved)

| Date | Total | Errors | Rate |
|------|-------|--------|------|
| 02-20 | 10 | 3 | 30.0% |
| 02-21 | 2 | 2 | 100.0% |
| 02-22 | 6 | 2 | 33.3% |
| 02-23 | 15 | 1 | 6.7% |
| 02-24+ | 148 | 0 | 0.0% |

Root cause: Broad-scope prompts ("Final full-stack code review") produced unstructured output (`has_structure=false`, avg 9,592 bytes vs 4,671 non-error). Concentrated in 3 sessions, then resolved as prompts became more targeted.

### Rate-Limit Pattern (Mitigated)

- 10 of 13 rate-limits on 02-27 spike day
- 34 sessions, 18 cross-session pairs within 60 seconds
- Spread across 8 sessions (1-2 each) — API saturation, not runaway session
- Fix: 0-3s jitter staggers concurrent invocations

## Testing and Verification

```
Test Files  10 passed (10)
     Tests  133 passed (133)
  Duration  720ms
```

New tests:
- `post-tool-audit-eval.test.ts`: 5 tests — dimension injection, score accuracy, missing agent name, missing total, empty output
- `post-tool-commit-review.test.ts`: 1 new test (jitter range validation), 2 modified (fake timers for jitter)

## Files Modified/Created

| File | Action | Lines |
|------|--------|-------|
| `hooks/handlers/post-tool.ts` | Modified | +79 |
| `hooks/handlers/post-tool-audit-eval.test.ts` | Created | 116 |
| `hooks/handlers/post-tool-commit-review.test.ts` | Modified | +33 |
| `hooks/lib/quality-signals.ts` | Modified | +2 |
| `agents/code-reviewer.md` | Modified | +1 |
| `skills/agent-improvement/SKILL.md` | Modified | +48/-12 |
| `agent-improvement-state.json` | Updated | (gitignored) |

## Git Commits

| Hash | Message |
|------|---------|
| `a38b04e` | fix(hooks): add jitter to post-commit review and scope guardrail |
| `b8f63f5` | chore(hooks): rebuild dist for post-commit review jitter |
| `8deaaa9` | feat(hooks): auto-inject agent-auditor scores into evaluation telemetry |
| `52292d6` | chore(hooks): rebuild dist for audit eval injection |

## Decisions

- **Jitter before instrumentHook**: Keeps measured span duration accurate; avoids false alerts on 500ms hook latency threshold
- **`AUDIT_LABEL_MAP` over `includes()` matching**: "Prompt Engineering" doesn't contain "prompting" — explicit map handles all scorecard label variants
- **`[^|]+?` regex for dimension labels**: Original `\w[\w\s]*?` failed on `&` in "Overlap & Redundancy" and "Efficiency & Cost"
- **`extraAttributes` on EvaluationRecord**: Extensible without breaking existing callers; avoids a specialized `appendAgentEvaluation` function

## Quality Scorecard

```
  tool_correctness  ████████████████████  1.00  healthy
  eval_latency      ████████████████████  0.00s  healthy
  task_completion   ████████████████████  1.00  healthy
  relevance         ███████████████████░  0.95  healthy
  faithfulness      ███████████████████░  0.95  healthy
  coherence         ████████████████████  0.96  healthy
  hallucination     █░░░░░░░░░░░░░░░░░░░  0.05  healthy
  Dashboard: HEALTHY
```
