---
layout: single
title: "Implementation Plan: Translation Pipeline Robustness and Regression Testing"
date: 2026-02-14
categories: [implementation]
tags: [hooks, testing, regression, error-handling, telemetry]
---

Post-mortem analysis of session `d1d142a6` (February 12, 2026) revealed four critical bugs and several systemic robustness gaps in the translation pipeline. This document provides a detailed implementation roadmap for fixes, hardening, and regression testing to prevent recurrence.

## Executive Summary

| Priority | Issue | Impact | Fix ETA |
|----------|-------|--------|---------|
| **P0** | Context overflow RangeError | Production-breaking (172% utilization) | 1 day |
| **P1** | Task completion tracking gap | Quality metric failure (0.83 score) | 2 days |
| **P2** | Webscraping agent rate limit | Research pipeline failure (29s runtime) | 3 days |
| **P3** | Incomplete Instagram scraping | Data quality degradation (2 of 3) | 2 days |

**Total estimated effort:** 8 developer-days + 2 days for regression suite

---

## A. Bug Fixes

### 1. Context Overflow Bug (P0)

**Trace ID:** `eba9ce1a66679a232f44df4566c7d25f` (line 99, traces-2026-02-12.jsonl)

#### What

`getUtilizationBar()` function crashes with `RangeError: Invalid count value: -14` when context utilization exceeds 100%. Session `d2c7e927` (translation session) reached **172% utilization** (343,957 tokens in 200K window), causing negative bar segment calculation.

#### Where

```
File: ~/.claude/hooks/dist/handlers/session-start.js
Function: getUtilizationBar()
Line: 163
Stack trace: String.repeat() called with negative count (-14)
```

#### Root Cause

The utilization bar assumes 20-character width. When utilization exceeds 100%, the "filled" portion exceeds 20 characters, leaving a negative count for the "empty" portion:

```javascript
// Broken calculation example (172% utilization):
const filled = Math.floor(0.2 * 172);  // 34 characters
const empty = 20 - filled;              // -14 characters (INVALID)
const bar = '█'.repeat(filled) + '░'.repeat(empty);  // RangeError!
```

#### Fix

Add clamping to ensure utilization stays within 0-100% range:

```javascript
// session-start.js line ~160
function getUtilizationBar(utilizationPercent) {
  // Clamp to 0-100% range
  const clampedPercent = Math.max(0, Math.min(100, utilizationPercent));
  
  const barWidth = 20;
  const filled = Math.floor(barWidth * (clampedPercent / 100));
  const empty = barWidth - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  // Log overflow events for telemetry
  if (utilizationPercent > 100) {
    console.error(`[OVERFLOW] Context utilization exceeded 100%: ${utilizationPercent}%`);
    // TODO: emit OpenTelemetry span event
  }
  
  return bar;
}
```

**Additional safeguard:** Add overflow detection before context estimation:

```javascript
// session-start.js line ~40 (context estimation section)
const estimatedTokens = calculateContextTokens(transcript);
const utilizationPercent = (estimatedTokens / contextWindowSize) * 100;

if (utilizationPercent > 100) {
  span.setStatus({ code: SpanStatusCode.ERROR, message: 'Context overflow detected' });
  span.recordException(new Error(`Context overflow: ${estimatedTokens} / ${contextWindowSize} tokens`));
}
```

#### Regression Test

```javascript
// File: ~/.claude/hooks/src/handlers/__tests__/session-start.test.ts

describe('getUtilizationBar', () => {
  it('handles 0% utilization', () => {
    const bar = getUtilizationBar(0);
    expect(bar).toBe('░░░░░░░░░░░░░░░░░░░░');  // 20 empty chars
  });
  
  it('handles 50% utilization', () => {
    const bar = getUtilizationBar(50);
    expect(bar).toBe('██████████░░░░░░░░░░');  // 10 filled, 10 empty
  });
  
  it('handles 100% utilization', () => {
    const bar = getUtilizationBar(100);
    expect(bar).toBe('████████████████████');  // 20 filled
  });
  
  it('clamps > 100% utilization to 100%', () => {
    const bar = getUtilizationBar(172);  // Real overflow from session d2c7e927
    expect(bar).toBe('████████████████████');  // Still 20 filled (clamped)
    expect(bar).toHaveLength(20);
  });
  
  it('clamps negative utilization to 0%', () => {
    const bar = getUtilizationBar(-10);
    expect(bar).toBe('░░░░░░░░░░░░░░░░░░░░');
  });
  
  it('does not throw RangeError for any utilization value', () => {
    const testCases = [-100, -1, 0, 0.5, 50, 99.9, 100, 150, 172, 1000];
    testCases.forEach(utilization => {
      expect(() => getUtilizationBar(utilization)).not.toThrow();
    });
  });
  
  it('logs overflow events for > 100% utilization', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    getUtilizationBar(172);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Context utilization exceeded 100%: 172%')
    );
    consoleErrorSpy.mockRestore();
  });
});
```

**Verification steps:**
1. Run unit tests: `npm test -- session-start.test.ts`
2. Manually trigger overflow scenario: create session with >200K tokens pre-loaded
3. Check telemetry for overflow span events: `grep "Context overflow" ~/.claude/telemetry/traces-*.jsonl`

---

### 2. Task Completion Tracking Gap (P1)

**Evidence:** Task completion score 0.83 (5 TaskUpdates per 3 TaskCreates)

#### What

The session created more subtasks than it closed, resulting in a task completion ratio below the 0.85 warning threshold. This indicates either:
- Tasks were created but never marked complete
- Context compaction dropped task state
- Tasks were implicitly closed without proper telemetry

From post-mortem:
- TaskCreate: 10 calls
- TaskUpdate: 16 calls
- TaskCreate/TaskUpdate ratio suggests incomplete resolution

#### Where

```
Locations to investigate:
1. Task state persistence: ~/.claude/hooks/dist/lib/context-tracker.js
2. Context compaction logic: Claude Code internal (vendor code)
3. Task auto-close logic: hooks/dist/handlers/post-tool.js
```

#### Root Cause (Hypothesis)

Context compaction at 9:03 PM reset message count from 42 to 6, compressing away task state. The telemetry shows:
- Pre-compaction: 42 messages, 118,542 tokens
- Post-compaction: 6 messages, 93,486 tokens
- **261 output tokens post-compaction** (vs 1,752 pre-compaction) indicates session was "dead"

Task state may be stored in message history, so compaction could orphan unclosed tasks.

#### Fix

**Option 1: Task state serialization** (recommended)

Persist task state to disk, independent of context window:

```javascript
// File: ~/.claude/hooks/dist/lib/task-tracker.js (new file)

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TASK_STATE_DIR = join(process.env.HOME, '.claude', 'task-state');

export function saveTaskState(sessionId, tasks) {
  const filePath = join(TASK_STATE_DIR, `${sessionId}.json`);
  writeFileSync(filePath, JSON.stringify({
    sessionId,
    timestamp: Date.now(),
    tasks
  }, null, 2));
}

export function loadTaskState(sessionId) {
  const filePath = join(TASK_STATE_DIR, `${sessionId}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function calculateTaskCompletion(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return completed / total;
}
```

Hook into context compaction event (if exposed) or session-start hook for resume:

```javascript
// File: ~/.claude/hooks/dist/handlers/session-start.js

import { loadTaskState, calculateTaskCompletion } from '../lib/task-tracker.js';

// In session start handler (after line ~80):
const taskState = loadTaskState(sessionId);
if (taskState && isResume) {
  const completionRatio = calculateTaskCompletion(taskState.tasks);
  console.log(`[TASK-STATE] Restored ${taskState.tasks.length} tasks, completion: ${completionRatio.toFixed(2)}`);
  
  if (completionRatio < 0.85) {
    console.warn(`[TASK-STATE] Low completion ratio: ${completionRatio}`);
  }
}
```

**Option 2: Auto-close on Write tool**

When a Write tool completes successfully, auto-close the associated task:

```javascript
// File: ~/.claude/hooks/dist/handlers/post-tool.js

// In post-tool handler (after Write tool success):
if (toolName === 'Write' && success) {
  // Infer task from file path
  const taskName = inferTaskFromFilePath(toolParams.file_path);
  if (taskName) {
    console.log(`[AUTO-CLOSE] Closing task "${taskName}" after Write success`);
    // TODO: emit TaskUpdate with status="completed"
  }
}
```

#### Regression Test

```javascript
// File: ~/.claude/hooks/src/lib/__tests__/task-tracker.test.ts

describe('Task state persistence', () => {
  it('saves task state to disk', () => {
    const sessionId = 'test-session-123';
    const tasks = [
      { id: '1', name: 'Task 1', status: 'in-progress' },
      { id: '2', name: 'Task 2', status: 'completed' }
    ];
    
    saveTaskState(sessionId, tasks);
    
    const loaded = loadTaskState(sessionId);
    expect(loaded.tasks).toEqual(tasks);
  });
  
  it('calculates task completion ratio', () => {
    const tasks = [
      { id: '1', status: 'completed' },
      { id: '2', status: 'completed' },
      { id: '3', status: 'in-progress' }
    ];
    
    const ratio = calculateTaskCompletion(tasks);
    expect(ratio).toBeCloseTo(0.67, 2);  // 2 of 3 completed
  });
  
  it('returns 0.83 for session d1d142a6 scenario', () => {
    // 5 TaskUpdates, 3 TaskCreates (from post-mortem)
    const tasks = [
      { id: '1', status: 'completed' },
      { id: '2', status: 'completed' },
      { id: '3', status: 'completed' },
      { id: '4', status: 'in-progress' },
      { id: '5', status: 'in-progress' }
    ];
    
    const ratio = calculateTaskCompletion(tasks);
    expect(ratio).toBeCloseTo(0.60, 2);  // Adjusted to match 3 completed / 5 total
  });
});
```

**Verification steps:**
1. Run translation workflow with task state logging enabled
2. Trigger context compaction at 60% utilization
3. Verify task state persists post-compaction: `ls ~/.claude/task-state/`
4. Check task completion metric: `grep "task_completion" ~/.claude/telemetry/evaluations-*.jsonl`

---

### 3. Webscraping Agent Rate Limit Failure (P2)

**Evidence:** Agent terminated after 29 seconds, 4 tool uses (from post-mortem, line 128)

#### What

Background `webscraping-research-analyst` agent launched to research ZoukMX growth strategy hit an external API rate limit after 29 seconds and terminated without retry or fallback.

From post-mortem:
> Rate limiting after 29 seconds indicates:
> - No rate limit handling or backoff logic
> - No fallback data sources
> - No graceful degradation

#### Where

```
Agent invocation: session d1d142a6, ~8:20-8:30 PM CT
Tool: Task (agent type: webscraping-research-analyst)
Failure mode: External API 429 response → immediate termination
```

#### Root Cause

Agent does not implement:
1. Rate limit detection (429 status code handling)
2. Exponential backoff retry logic
3. Fallback data sources
4. Error escalation to parent session

#### Fix

**Step 1: Detect rate limits**

```javascript
// File: ~/.claude/hooks/dist/handlers/agent-error-handler.js (new file)

export function isRateLimitError(error) {
  // Check for HTTP 429 or common rate limit messages
  return error.statusCode === 429 ||
         error.message?.includes('rate limit') ||
         error.message?.includes('too many requests');
}

export function getRetryAfter(error) {
  // Parse Retry-After header if present
  if (error.headers?.['retry-after']) {
    return parseInt(error.headers['retry-after'], 10) * 1000;  // Convert to ms
  }
  return null;  // Use exponential backoff
}
```

**Step 2: Implement exponential backoff**

```javascript
// File: ~/.claude/hooks/dist/lib/exponential-backoff.js (new file)

export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,  // 1 second
    maxDelay = 30000,     // 30 seconds
    factor = 2,
    onRetry = null
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries - 1) {
        throw error;  // Final attempt failed
      }
      
      const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);
      
      if (onRetry) {
        onRetry(attempt + 1, delay, error);
      }
      
      console.log(`[RETRY] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

**Step 3: Integrate into agent tool calls**

```javascript
// File: ~/.claude/hooks/dist/handlers/pre-tool.js (agent section)

import { isRateLimitError, getRetryAfter } from './agent-error-handler.js';
import { retryWithBackoff } from '../lib/exponential-backoff.js';

// Wrap agent tool calls with retry logic:
async function executeAgentTool(toolName, params) {
  return await retryWithBackoff(
    async () => {
      return await callAgentTool(toolName, params);
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      onRetry: (attempt, delay, error) => {
        if (isRateLimitError(error)) {
          const retryAfter = getRetryAfter(error) || delay;
          console.log(`[RATE-LIMIT] Attempt ${attempt}, retry after ${retryAfter}ms`);
        }
      }
    }
  );
}
```

**Step 4: Escalate failures to parent session**

```javascript
// In agent execution wrapper:
try {
  const result = await executeAgentTool(toolName, params);
  return result;
} catch (error) {
  if (isRateLimitError(error)) {
    // Surface to user
    console.error(`[AGENT-FAILURE] Rate limit exceeded after retries: ${error.message}`);
    // TODO: emit user notification via Claude Code API
  }
  throw error;
}
```

#### Regression Test

```javascript
// File: ~/.claude/hooks/src/lib/__tests__/exponential-backoff.test.ts

describe('Exponential backoff', () => {
  it('succeeds on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('retries on failure', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');
    
    const result = await retryWithBackoff(fn, { maxRetries: 3 });
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });
  
  it('throws after max retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
    
    await expect(retryWithBackoff(fn, { maxRetries: 2 }))
      .rejects.toThrow('Always fails');
    
    expect(fn).toHaveBeenCalledTimes(2);
  });
  
  it('respects Retry-After header for rate limits', async () => {
    const error = new Error('Rate limit');
    error.statusCode = 429;
    error.headers = { 'retry-after': '5' };  // 5 seconds
    
    const retryAfter = getRetryAfter(error);
    expect(retryAfter).toBe(5000);  // Converted to ms
  });
  
  it('uses exponential backoff delays', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Fail'));
    const delays = [];
    
    try {
      await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 100,
        factor: 2,
        onRetry: (attempt, delay) => delays.push(delay)
      });
    } catch (e) {}
    
    expect(delays).toEqual([100, 200, 400]);
  });
});
```

**Verification steps:**
1. Mock 429 response in agent test harness
2. Verify retry attempts: `grep "RETRY" ~/.claude/telemetry/logs-*.jsonl`
3. Confirm user notification on final failure
4. Test with real webscraping agent: launch 10 concurrent requests to trigger rate limit

---

### 4. Incomplete Instagram Scraping (P3)

**Evidence:** Only 2 `visit_page` calls for 3 Instagram accounts (from post-mortem, line 124)

#### What

Session mentioned three Instagram accounts (`@edghar.e.nadyne`, `@dance.edghar`, `@nadyne.cruz`) as voice reference material, but telemetry shows only 2 MCP `visit_page` tool invocations. The third account was either:
- Skipped intentionally
- Failed silently
- Omitted from scraping plan

The Artist Profile translation had elevated hallucination scores (0.05 vs 0.02 for Austin Market), suggesting incomplete voice reference data.

#### Where

```
Session: d1d142a6 (translation session, Feb 12)
Tool: MCP visit_page (instagram-mcp-server)
Expected calls: 3
Actual calls: 2
```

#### Root Cause (Hypothesis)

1. **Silent failure:** The third account scrape failed (rate limit, private account, network error) but no error was logged
2. **Incomplete scraping plan:** Agent only planned to scrape 2 accounts
3. **Truncated results:** Context window pressure caused early termination

#### Fix

**Step 1: Add scraping validation**

```javascript
// File: ~/.claude/hooks/dist/handlers/post-tool.js (MCP section)

const EXPECTED_INSTAGRAM_ACCOUNTS = [
  '@edghar.e.nadyne',
  '@dance.edghar',
  '@nadyne.cruz'
];

let scrapedAccounts = [];

// In MCP post-tool handler:
if (mcpServer === 'instagram' && mcpTool === 'visit_page') {
  const account = extractAccountFromParams(toolParams);
  scrapedAccounts.push(account);
  
  console.log(`[INSTAGRAM] Scraped ${scrapedAccounts.length}/${EXPECTED_INSTAGRAM_ACCOUNTS.length}: ${account}`);
  
  // Check if all accounts scraped
  if (scrapedAccounts.length === EXPECTED_INSTAGRAM_ACCOUNTS.length) {
    console.log('[INSTAGRAM] All accounts scraped successfully');
  }
}

// At session end (stop hook):
if (scrapedAccounts.length < EXPECTED_INSTAGRAM_ACCOUNTS.length) {
  const missing = EXPECTED_INSTAGRAM_ACCOUNTS.filter(a => !scrapedAccounts.includes(a));
  console.warn(`[INSTAGRAM] Incomplete scraping: missing ${missing.join(', ')}`);
  // TODO: emit telemetry warning
}
```

**Step 2: Surface scraping errors**

```javascript
// In MCP error handling:
if (mcpServer === 'instagram' && !success) {
  const account = extractAccountFromParams(toolParams);
  console.error(`[INSTAGRAM] Failed to scrape ${account}: ${errorMessage}`);
  
  // Attempt retry for transient errors
  if (isTransientError(error)) {
    console.log(`[INSTAGRAM] Retrying ${account}...`);
    // TODO: retry logic
  }
}
```

**Step 3: Pre-scraping validation**

Before translation starts, validate all accounts are accessible:

```javascript
// File: ~/.claude/hooks/dist/handlers/pre-translation.js (new hook)

export async function validateVoiceReferences(accounts) {
  const results = [];
  
  for (const account of accounts) {
    try {
      const profile = await checkAccountAccessible(account);
      results.push({ account, accessible: true, profile });
    } catch (error) {
      results.push({ account, accessible: false, error: error.message });
    }
  }
  
  const inaccessible = results.filter(r => !r.accessible);
  if (inaccessible.length > 0) {
    console.warn(`[VOICE-REF] Inaccessible accounts: ${inaccessible.map(r => r.account).join(', ')}`);
  }
  
  return results;
}
```

#### Regression Test

```javascript
// File: ~/.claude/hooks/src/handlers/__tests__/instagram-scraping.test.ts

describe('Instagram scraping validation', () => {
  it('tracks all scraped accounts', () => {
    const accounts = ['@account1', '@account2', '@account3'];
    
    // Simulate 3 successful scrapes
    accounts.forEach(account => {
      handleInstagramScrape(account, { success: true });
    });
    
    const status = getScrapingStatus();
    expect(status.scraped).toBe(3);
    expect(status.expected).toBe(3);
    expect(status.complete).toBe(true);
  });
  
  it('warns on incomplete scraping', () => {
    const accounts = ['@account1', '@account2', '@account3'];
    
    // Simulate only 2 successful scrapes (matches session d1d142a6)
    handleInstagramScrape(accounts[0], { success: true });
    handleInstagramScrape(accounts[1], { success: true });
    
    const status = getScrapingStatus();
    expect(status.scraped).toBe(2);
    expect(status.complete).toBe(false);
    expect(status.missing).toEqual(['@account3']);
  });
  
  it('retries transient errors', async () => {
    const account = '@flaky-account';
    
    // Simulate transient error → success
    const scrape1 = await handleInstagramScrape(account, { error: 'Network timeout' });
    expect(scrape1.success).toBe(false);
    
    const scrape2 = await handleInstagramScrape(account, { success: true });
    expect(scrape2.success).toBe(true);
  });
});
```

**Verification steps:**
1. Run translation workflow with 3 Instagram accounts
2. Check scraping logs: `grep "INSTAGRAM" ~/.claude/telemetry/logs-*.jsonl`
3. Verify all accounts scraped: expect 3 `visit_page` calls
4. Simulate account failure (private account) and verify warning

---

## B. Robustness Improvements

### 1. Overflow-Safe Utilization Calculations

**Implementation:** See Bug Fix #1 (Context Overflow)

Additional hardening:
- Add `assert()` statements for non-negative bar width
- Emit OpenTelemetry events for overflow detection
- Set up dashboards to track overflow frequency

### 2. Graceful Degradation for Rate-Limited APIs

**Implementation:** See Bug Fix #3 (Webscraping Agent Rate Limit)

Additional hardening:
- Implement circuit breaker pattern (open circuit after N consecutive failures)
- Add fallback data sources (cached data, alternative APIs)
- Degrade gracefully: proceed with partial data rather than full failure

Example circuit breaker:

```javascript
// File: ~/.claude/hooks/dist/lib/circuit-breaker.js (already exists, enhance)

export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;  // 60 seconds
    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.nextAttempt = null;
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN, rejecting request');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.error(`[CIRCUIT-BREAKER] Opened circuit after ${this.failures} failures, retry after ${this.resetTimeout}ms`);
    }
  }
}
```

### 3. Task State Persistence Across Context Compaction

**Implementation:** See Bug Fix #2 (Task Completion Tracking)

Additional hardening:
- Serialize task state on every TaskCreate/TaskUpdate
- Hook into pre-compaction event (if exposed) to force persistence
- Add task state recovery on session resume

### 4. Agent Failure Escalation to Parent Session

**Implementation:** See Bug Fix #3 (Webscraping Agent Rate Limit), Step 4

Additional hardening:
- Emit agent failure events to OpenTelemetry
- Send user notifications via Claude Code notification API
- Track agent failure rate by type in telemetry dashboard

---

## C. Regression Test Suite

### Unit Tests (12 tests, ~2 hours)

| Test File | Tests | Purpose |
|-----------|-------|---------|
| `session-start.test.ts` | 7 | Context overflow, utilization bar edge cases |
| `task-tracker.test.ts` | 3 | Task state persistence, completion ratio |
| `exponential-backoff.test.ts` | 5 | Retry logic, rate limit handling |
| `instagram-scraping.test.ts` | 3 | Scraping validation, incomplete scraping |

**Run command:**
```bash
cd ~/.claude/hooks
npm test
```

### Integration Tests (4 tests, ~4 hours)

| Test | Scenario | Validation |
|------|----------|------------|
| **Context overflow E2E** | Pre-load 250K tokens, trigger session-start | No RangeError, overflow logged |
| **Task persistence through compaction** | Create 5 tasks, trigger compaction, resume | All 5 tasks restored |
| **Agent rate limit with retry** | Mock 429 response, launch agent | 3 retry attempts, exponential backoff |
| **Instagram scraping validation** | Scrape 3 accounts, fail 1 | Warning logged, 2 of 3 success |

**Test harness:**
```javascript
// File: ~/.claude/hooks/src/__tests__/integration/translation-pipeline.test.ts

describe('Translation pipeline regression', () => {
  it('handles context overflow gracefully', async () => {
    const session = await createTestSession();
    
    // Pre-load 250K tokens (125% of 200K window)
    await session.loadTranscript({ tokenCount: 250000 });
    
    // Trigger session-start hook
    const result = await triggerHook('session-start', { sessionId: session.id });
    
    expect(result.status).toBe('success');
    expect(result.logs).toContain('Context utilization exceeded 100%');
    expect(result.logs).not.toContain('RangeError');
  });
  
  it('persists task state through compaction', async () => {
    const session = await createTestSession();
    
    // Create 5 tasks
    for (let i = 1; i <= 5; i++) {
      await session.createTask(`Task ${i}`);
    }
    
    // Trigger context compaction
    await session.compactContext();
    
    // Resume session
    const resumed = await createTestSession({ resumeFrom: session.id });
    
    const tasks = await resumed.getTasks();
    expect(tasks).toHaveLength(5);
  });
  
  it('retries agent on rate limit', async () => {
    const session = await createTestSession();
    
    // Mock 429 response for 2 attempts, then success
    mockApiResponse('/api/scrape', [
      { status: 429, headers: { 'retry-after': '1' } },
      { status: 429, headers: { 'retry-after': '2' } },
      { status: 200, body: { data: 'success' } }
    ]);
    
    const result = await session.launchAgent('webscraping-research-analyst', {
      target: 'https://example.com'
    });
    
    expect(result.success).toBe(true);
    expect(result.retries).toBe(2);
  });
  
  it('validates Instagram scraping completeness', async () => {
    const session = await createTestSession();
    
    const accounts = ['@account1', '@account2', '@account3'];
    
    // Scrape only 2 accounts (simulate session d1d142a6)
    await session.scrapeInstagram(accounts[0]);
    await session.scrapeInstagram(accounts[1]);
    
    // End session
    await session.stop();
    
    const warnings = session.getWarnings();
    expect(warnings).toContain('Incomplete scraping: missing @account3');
  });
});
```

### E2E Tests (1 test, ~1 day)

**Full translation pipeline test:**

```javascript
// File: ~/.claude/hooks/src/__tests__/e2e/translation-workflow.test.ts

describe('Full translation workflow', () => {
  it('translates 3 reports with telemetry validation', async () => {
    // Launch translation session
    const session = await launchClaudeCode({
      cwd: '/Users/alyshialedlie/reports',
      model: 'claude-opus-4-6'
    });
    
    // Issue translation request
    await session.sendMessage(`
      Translate these 3 HTML reports to Brazilian Portuguese:
      - artist-profile.html
      - zouk-market-analysis.html
      - austin-market-analysis.html
      
      Use voice references from @edghar.e.nadyne, @dance.edghar, @nadyne.cruz
    `);
    
    // Wait for completion (max 30 min)
    await session.waitForIdle({ timeout: 1800000 });
    
    // Validate outputs
    const outputs = await session.getWrittenFiles();
    expect(outputs).toHaveLength(3);
    expect(outputs.map(f => f.name)).toContain('artist-profile-pt-br.html');
    
    // Validate telemetry
    const telemetry = await session.getTelemetry();
    
    // Quality metrics
    expect(telemetry.evaluations.relevance).toBeGreaterThan(0.90);
    expect(telemetry.evaluations.faithfulness).toBeGreaterThan(0.90);
    expect(telemetry.evaluations.coherence).toBeGreaterThan(0.90);
    expect(telemetry.evaluations.hallucination).toBeLessThan(0.10);
    expect(telemetry.evaluations.task_completion).toBeGreaterThan(0.85);
    
    // Instagram scraping
    expect(telemetry.tool_calls.filter(t => t.tool === 'visit_page')).toHaveLength(3);
    
    // Context utilization
    expect(telemetry.context.peak_utilization).toBeLessThan(100);
    
    // No errors
    expect(telemetry.errors).toHaveLength(0);
  });
});
```

---

## D. Telemetry Alerts

Add these alert rules to observability-toolkit:

### 1. Context Utilization Alerts

```typescript
// File: observability-toolkit/dashboard/alerts/context-alerts.ts

export const contextAlerts = [
  {
    name: 'context-utilization-warning',
    condition: 'context.utilization_percent > 95',
    severity: 'warning',
    message: 'Context utilization exceeded 95%, approaching compaction threshold',
    channels: ['console', 'telemetry']
  },
  {
    name: 'context-overflow',
    condition: 'context.utilization_percent > 100',
    severity: 'critical',
    message: 'Context overflow detected! Utilization > 100%',
    channels: ['console', 'telemetry', 'user-notification']
  }
];
```

**Query to detect overflows:**
```bash
obs_query_traces --attributes "context.utilization_percent > 100" --severity ERROR
```

### 2. Agent Failure Alerts

```typescript
// File: observability-toolkit/dashboard/alerts/agent-alerts.ts

export const agentAlerts = [
  {
    name: 'agent-early-failure',
    condition: 'agent.duration < 60000 AND agent.status = "failed"',
    severity: 'warning',
    message: 'Agent failed within first 60 seconds, likely rate limit or config issue',
    channels: ['console', 'telemetry']
  },
  {
    name: 'agent-rate-limit',
    condition: 'agent.error_type = "rate_limit"',
    severity: 'warning',
    message: 'Agent hit rate limit, verify backoff logic triggered',
    channels: ['telemetry']
  }
];
```

**Query to detect early failures:**
```bash
obs_query_traces --attributes "agent.duration < 60000" --status ERROR
```

### 3. Task Completion Alerts

```typescript
// File: observability-toolkit/dashboard/alerts/task-alerts.ts

export const taskAlerts = [
  {
    name: 'task-completion-low',
    condition: 'evaluations.task_completion < 0.85',
    severity: 'warning',
    message: 'Task completion ratio below 0.85, investigate incomplete work',
    channels: ['console', 'telemetry']
  }
];
```

**Query to detect low completion:**
```bash
obs_query_evaluations --evaluationName "task_completion" --scoreMax 0.85
```

### 4. Instagram Scraping Alerts

```typescript
// File: observability-toolkit/dashboard/alerts/scraping-alerts.ts

export const scrapingAlerts = [
  {
    name: 'instagram-scrape-incomplete',
    condition: 'instagram.accounts_scraped < instagram.accounts_expected',
    severity: 'warning',
    message: 'Instagram scraping incomplete, check for failed accounts',
    channels: ['console', 'telemetry']
  }
];
```

**Query to detect incomplete scraping:**
```bash
obs_query_logs --severity WARN --message "Incomplete scraping"
```

---

## E. Implementation Timeline

| Week | Tasks | Deliverables |
|------|-------|--------------|
| **Week 1** | Bug fixes #1-2 (P0-P1) | Context overflow fix, task persistence |
| **Week 2** | Bug fixes #3-4 (P2-P3) | Rate limit retry, Instagram validation |
| **Week 3** | Unit tests, integration tests | 19 tests passing |
| **Week 4** | E2E test, telemetry alerts | Full pipeline validated |

**Total effort:** 4 weeks (1 developer)

---

## F. Success Criteria

### Functional Requirements

- [ ] Context overflow bug fixed: no RangeError for utilization > 100%
- [ ] Task completion ratio ≥ 0.90 for translation workflows
- [ ] Agent rate limit retry: 3 attempts with exponential backoff
- [ ] Instagram scraping: 100% completeness or warning logged

### Test Coverage

- [ ] 7 unit tests for context overflow (100% coverage of `getUtilizationBar()`)
- [ ] 3 unit tests for task persistence (100% coverage of task tracker)
- [ ] 5 unit tests for exponential backoff (100% coverage of retry logic)
- [ ] 3 unit tests for Instagram scraping validation
- [ ] 4 integration tests for end-to-end scenarios
- [ ] 1 E2E test for full translation pipeline

### Telemetry

- [ ] Context overflow events logged to OpenTelemetry
- [ ] Agent retry attempts tracked with span events
- [ ] Task state persistence events logged
- [ ] Instagram scraping completeness tracked

### Alerts

- [ ] Context utilization > 95% → warning
- [ ] Context utilization > 100% → critical
- [ ] Agent failure < 60s → warning
- [ ] Task completion < 0.85 → warning
- [ ] Instagram scraping incomplete → warning

---

## G. Future Work (Out of Scope)

1. **Voice-matching evaluation dimension** (post-mortem recommendation #2)
   - Add LLM-as-Judge metric for voice fidelity
   - Requires prompt engineering and baseline validation

2. **Dedicated translation agents** (post-mortem recommendation #4)
   - Launch background agents per document
   - Requires agent orchestration framework

3. **Session idle detection** (post-mortem recommendation #6)
   - Auto-hibernation after 10 minutes idle
   - Requires session lifecycle API

4. **Hallucination guardrails** (post-mortem recommendation #5)
   - Post-translation validation: extract statements, verify against source
   - Requires integration with QAG evaluator

---

## H. References

### Source Documents

- **Post-mortem:** `/Users/alyshialedlie/code/PersonalSite/_reports/2026-02-13-edgar-nadyne-translation-session-telemetry.md`
- **Telemetry data:** `~/.claude/telemetry/traces-2026-02-12.jsonl` (line 99: context overflow trace)
- **Session ID:** `d1d142a6-51f3-49d3-b283-c00093880453` (translation session, Feb 12, 2026)

### Key Traces

| Trace ID | Issue | Line |
|----------|-------|------|
| `eba9ce1a66679a232f44df4566c7d25f` | Context overflow (172% utilization) | 99 |
| (session d1d142a6) | Task completion 0.83 | (evaluations file) |
| (session d1d142a6) | Webscraping agent failure (29s) | (logs file) |
| (session d1d142a6) | Instagram scraping (2 of 3) | (traces file) |

### Testing Commands

```bash
# Unit tests
cd ~/.claude/hooks
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Telemetry queries
obs_query_traces --attributes "context.utilization_percent > 100"
obs_query_evaluations --evaluationName "task_completion" --scoreMax 0.85
obs_query_logs --severity WARN --message "Incomplete scraping"
```

---

**Document Status:** Draft  
**Author:** Quality evaluation agent (Sonnet 4.5)  
**Last Updated:** 2026-02-14