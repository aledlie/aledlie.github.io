---
layout: single
title: "Full Test Suite Audit and Hook Latency Research"
date: 2026-02-26
author_profile: true
categories: [testing, observability]
tags: [vitest, node-test, typescript, hooks, performance, tsc, incremental-builds, obtool]
excerpt: "Systematic audit of 291-file test suite: triaged 220 failures across 5 root causes, fixed 13 real test expectation drifts to reach 792/792 passing, then researched cutting-edge strategies to reduce hook latency from 7.3s p50 to sub-second."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-26<br>
**Project**: claude-dev-environment<br>
**Focus**: Test suite audit, failure triage, expectation fixes, hook performance research<br>
**Session Type**: Testing | Performance Research

## Executive Summary

Performed a comprehensive audit of the full `~/.claude` test suite (291 files across hooks, obtool src/, obtool services, and dashboard). Starting from 220 failures and 71 passing, systematically triaged failures into 5 root cause categories: stale dist builds, third-party plugin tests, jsdom environment mismatches, node:test vs vitest runner incompatibility, and 13 real test expectation drifts.

Fixed all 13 real failures across 7 test files — caused by structured JSON logging migration, new metric additions, and mock backend naming changes. Final result: **792/792 passing** for obtool src/ (node:test runner), **898/898** for hooks, **183/183** for dashboard, and **24/24** for obtool-api. Created 3 commits documenting the fixes.

Followed up with hook performance analysis from 773K-line performance log, identifying `stop-tsc-check` (p50=7.3s, max=345s) as the dominant bottleneck, and commissioned research into cutting-edge latency reduction strategies.

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| obtool src/ tests passing | 779/792 | 792/792 | +13 fixed |
| obtool-api tests passing | 10/24 | 24/24 | +14 fixed |
| dashboard scripts tests | 88/89 | 89/89 | +1 fixed |
| hooks/dist tests | 898/898 | 898/898 | Confirmed (stale build) |
| Commits created | 0 | 3 | — |

## Problem Statement

The full test suite (`npx vitest run`) reported 220 failures out of 291 files. Without understanding the failure categories, it was impossible to know which tests reflected real regressions vs environmental issues. Additionally, hook performance logs showed the `stop-tsc-check` hook consuming 7+ seconds per session stop, degrading developer experience.

## Failure Triage

### Category 1: Stale dist/ builds (2 files)
Hooks `dist/` contained outdated compiled JS. Rebuilt with `cd hooks && npm run build` — all 898 tests passed.

### Category 2: Third-party plugin tests (49 files)
`plugins/marketplaces/` contains vendor code not maintained in this repo. Excluded from scope.

### Category 3: Dashboard jsdom environment (4 files)
Component `.tsx` tests require `jsdom` environment configured in `dashboard/vite.config.ts`. When run from the parent directory, vitest uses the parent config which lacks `jsdom`. These pass when run from within the dashboard submodule: `cd mcp-servers/observability-toolkit/dashboard && npx vitest run`.

### Category 4: node:test vs vitest mismatch (81 files)
All obtool `src/` test files use `import { describe, it } from 'node:test'` with `node:assert`. Vitest discovers them by glob but cannot execute `node:test` suites (reports "No test suite found"). Correct runner: `npx tsx --test src/**/*.test.ts`.

### Category 5: Real test expectation drift (13 failures across 7 files)
These were the actual bugs requiring fixes.

## Implementation Details

### Fix 1: obtool-api auth hash (`services/obtool-api/src/__tests__/api.test.ts`)
All 14 authenticated route tests returned 403 instead of 200. Root cause: hardcoded SHA-256 hash for "test-token" was wrong (`cb3576...` vs actual `4c5dc9b7...`).

```typescript
// Fixed: correct SHA-256 of "test-token"
const TEST_TOKEN_HASH = '4c5dc9b7708905f77f5e5d16316b5dfb425e68cb326dcd55a860e90a7707031e';
```

### Fix 2: Dashboard judge-evaluations (`dashboard/scripts/__tests__/judge-evaluations.test.ts`)
`createFailingLLM('relevant')` keyword "relevant" also matched "irrelevant" in shared G-Eval score anchoring text, causing coherence to unexpectedly fail.

```typescript
// Fixed: narrowed keyword to avoid false match on "irrelevant"
const llm = createFailingLLM('evaluating: relevance');
```

### Fix 3: Structured logging assertions (4 files)
Tests expected `[SECURITY]`, `[MEMORY]`, `[llm-as-judge]` prefixed text but production code uses JSON structured logger with `component` field via `createLogger()`.

- `constants-symlink.test.ts`: `[SECURITY]` → `"security"`
- `file-utils.test.ts`: `[MEMORY]` → `"memory"`
- `llm-as-judge.test.ts`: `[llm-as-judge]` → `"llm-judge"`
- `llm-judge-qag.test.ts`: `[llm-as-judge]` → `"llm-judge"`

### Fix 4: Metric count update (`quality-metrics.test.ts`)
`QUALITY_METRICS` array grew from 7 to 8 entries (added `handoff_correctness`). Updated two assertion sites:

```typescript
assert.strictEqual(dashboard.metrics.length, 8);
assert.strictEqual(dashboard.summary.totalMetrics, 8);
```

### Fix 5: Mock backend naming (`query-logs.test.ts`, `query-metrics.test.ts`)
`createTraceBackend(store, 'local')` returns `name: 'mock-local'`, but tests asserted `'local'`. Updated 7 assertions across 2 files, preserving 1 correct `'local'` assertion for the cost metric branch (`query-metrics.ts:109` hardcodes `backend: 'local'`).

### Build fix: tsconfig exclude (`mcp-servers/observability-toolkit/tsconfig.json`)
`src/backends/cloud.test.ts` imports vitest but was included in the tsc build. Added `"src/**/*.test.ts"` to exclude array.

## Hook Performance Analysis

Analyzed 773K-line `~/.claude/logs/hook-performance.log` to identify latency hotspots:

| Hook | p50 | Max | Notes |
|------|-----|-----|-------|
| stop-tsc-check | 7.3s | 345s | Runs `tsc --noEmit` per affected repo |
| stop-py-check | 1.1s | 60s | Runs mypy/pyright |
| token-metrics-extraction | 31ms | 165ms (historical) | File-size dedup cache improved this |
| session-start | 324ms | — | Git spawns + node version check |

Key finding: `runTypeCheck()` in `stop.ts:88` has guard clauses — only runs when PostToolUse `tsc-check.sh` logged edited TypeScript files during the session. Read-only sessions skip entirely.

## Hook Latency Research Findings

Commissioned webscraping-research-analyst to investigate cutting-edge strategies. Top findings:

### Immediate wins (Phase 1, low effort)
- **`tsc --incremental --tsBuildInfoFile`**: p50 7.3s → 1-2s on warm runs
- **Replace `execSync` → `execAsync`**: Unblocks event loop during tsc runs
- **Parallel repo iteration**: `Promise.allSettled` instead of sequential loop
- **`process.version`** instead of `execAsync('node --version')`: -50ms on session-start

### Medium-term (Phase 2-3)
- **Content hash skip**: Hash edited files, skip repos unchanged since last clean check
- **Background fire-and-forget**: Launch tsc as detached process at Stop, surface results at next SessionStart — 0ms user-visible latency

### Long-term (Phase 4)
- **typescript-go (`tsgo`)**: Microsoft's Go rewrite benchmarks at 10x faster. Available as `@typescript/native-preview`, targeting TypeScript 7.0 in early 2026. Would reduce p50 from 7.3s to ~0.7s.

## Testing and Verification

```
# obtool src/ (node:test runner)
792 tests passed out of 792

# obtool-api
24 tests passed out of 24

# dashboard (from submodule)
183 tests passed out of 183 (components)
89 tests passed out of 89 (scripts)

# hooks
898 tests passed out of 898
```

## Git Commits

- `78d6d37` test(obtool): fix 13 test expectation failures across src/
- `bec9706` test(judge): fix failing evalFailures test (dashboard submodule)
- `c560289` chore(obtool): update dashboard submodule pointer

## Files Modified

| File | Change |
|------|--------|
| `mcp-servers/observability-toolkit/tsconfig.json` | Added `src/**/*.test.ts` to exclude |
| `services/obtool-api/src/__tests__/api.test.ts` | Fixed SHA-256 hash constant |
| `dashboard/scripts/__tests__/judge-evaluations.test.ts` | Narrowed LLM failure keyword |
| `src/lib/constants-symlink.test.ts` | JSON logging assertion |
| `src/lib/file-utils.test.ts` | JSON logging assertion |
| `src/lib/llm-as-judge.test.ts` | JSON logging assertion |
| `src/lib/llm-judge-qag.test.ts` | JSON logging assertion |
| `src/lib/quality-metrics.test.ts` | Metric count 7→8 (2 sites) |
| `src/tools/query-logs.test.ts` | Mock backend name (4 sites) |
| `src/tools/query-metrics.test.ts` | Mock backend name (3 sites) |

## References

- [TypeScript Incremental Compilation](https://www.typescriptlang.org/tsconfig/incremental.html)
- [typescript-go native port](https://github.com/microsoft/typescript-go)
- [oxlint type-aware alpha](https://oxc.rs/blog/2025-12-08-type-aware-alpha.html)
- Hook handler: `hooks/handlers/stop.ts:88` (`runTypeCheck`)
- Performance log: `~/.claude/logs/hook-performance.log`
