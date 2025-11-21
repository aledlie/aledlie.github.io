---
layout: report
title: "Sentry Logging Migration Strategy - ISPublicSites"
date: 2025-11-17
categories: [devops, monitoring, logging]
tags: [sentry, error-tracking, migration, typescript, python, logging]
status: active
priority: P0
---

# Sentry Logging Migration Strategy

## Executive Summary

**Objective**: Replace 2,000+ console/print statements with Sentry-based structured logging across 5 ISPublicSites projects, including AI agent monitoring.

**Current State**:
- **1,310 console statements** (log/error/warn/info/debug) in TypeScript
- **690 print statements** in Python
- Sentry v10 installed but underutilized in 2 projects
- 3 projects without any error tracking
- **No AI agent monitoring** configured in existing Sentry setups

**Impact**: Improved production debugging, centralized error monitoring, performance insights, AI agent interaction tracking, and reduced mean-time-to-resolution (MTTR) for production issues.

**Key Enhancement**: Adding Anthropic AI integration to monitor Claude AI agent interactions, track prompt/response pairs, and capture AI-related errors.

---

## Document Updates (Latest)

### Three Critical Enhancements

**1. Unified Sentry Project with Service Tagging** ✅
- **Decision**: Use single DSN for all 5 ISPublicSites projects
- **Platform**: Node.js (flexible for both TypeScript and Python)
- **Differentiation**: Service tags (`service:tcad-scraper`, `service:analyticsbot-backend`, etc.)
- **Benefit**: Single dashboard, easier correlation, lower cost, faster implementation

**2. Service Tagging Implementation** ✅
- All `initializeSentry()` functions now require `serviceName` parameter
- Automatic tagging in `beforeSend` hook + global tags
- TypeScript: `initializeSentry('tcad-scraper')`
- Python: `init_sentry('analyticsbot-bots')`
- Enables filtering: `service:tcad-scraper is:unresolved`

**3. Dashboard Organization Guide** ✅
- 8 pre-configured saved searches (per-service, AI errors, production)
- 4 alert rules (critical errors, rate limits, high error rate, fatal)
- Migration path if separate projects needed later

**Updated Sections**:
- New: "Sentry Project Architecture & Platform Selection" (before Implementation Roadmap)
- Enhanced: All `Sentry.init()` examples include service tagging
- Enhanced: Configuration Guide with unified DSN emphasis
- Enhanced: Week 1 Day 0 roadmap with service tagging steps

---

## Current State Analysis

### Projects with Sentry Installed ✅

#### 1. tcad-scraper/server
- **Sentry Version**: v10.23.0 (@sentry/node + @sentry/profiling-node)
- **Setup**: Comprehensive `sentry.service.ts` with 17 helper functions
- **Console Statements**: 757 console.log + 30 console.warn + 133 console.error = **920 total**
- **Sentry Usage**: Only 5 `captureException/captureMessage` calls
- **Utilization**: ~0.5% (5/920)
- **Status**: ⚠️ Infrastructure ready, severely underutilized

**Key Features Already Implemented**:
```typescript
// tcad-scraper/server/src/lib/sentry.service.ts
- initializeSentry()
- sentryRequestHandler() / sentryTracingHandler() / sentryErrorHandler()
- captureException(error, context)
- captureMessage(message, level, context)
- addBreadcrumb(breadcrumb)
- setUser(user) / clearUser()
- setContext(name, context)
- setTag(key, value) / setTags(tags)
- startTransaction(name, op)
- wrapAsync(fn, name)
- flush() / close()
- getHealth()
```

#### 2. AnalyticsBot/backend
- **Sentry Version**: v10.23.0 (@sentry/node + @sentry/profiling-node)
- **Setup**: Basic `sentry.config.ts` with 5 helper functions
- **Console Statements**: 97 console.log
- **Print Statements**: 396 print (Python bots)
- **Sentry Usage**: 13 `captureException/captureMessage` calls
- **Utilization**: ~2.6% (13/493)
- **Status**: ⚠️ Partial implementation, needs expansion

**Key Features Implemented**:
```typescript
// AnalyticsBot/backend/src/config/sentry.config.ts
- initializeSentry()
- captureException(error, context)
- captureMessage(message, level)
- setUser(user) / clearUser()
- addBreadcrumb(message, category, data)
```

#### 3. AnalyticsBot/ui
- **Sentry Version**: v7.100.0 (@sentry/react)
- **Status**: Frontend React error tracking (out of scope for this migration)

### Projects Without Sentry ❌

#### 4. SingleSiteScraper
- **Console Statements**: 195 console.log
- **Print Statements**: 100 print
- **Total**: 295 logging statements
- **Sentry**: Not installed
- **Language**: TypeScript + Python
- **Priority**: P1 (Medium usage)

#### 5. IntegrityStudio.ai
- **Console Statements**: 92 console.log
- **Total**: 92 logging statements
- **Sentry**: Not installed
- **Language**: TypeScript (React/Node)
- **Priority**: P2 (Lower usage, many in test files)

#### 6. ToolVisualizer
- **Print Statements**: 177 print
- **Total**: 177 logging statements
- **Sentry**: Not installed (no requirements.txt found)
- **Language**: Python
- **Priority**: P2 (Python-only, visualization tool)

---

## Migration Strategy

### Phase 1: Enhance Existing Sentry Projects (P0) 🔴

**Objective**: Maximize ROI by converting 920 console statements in tcad-scraper where infrastructure already exists.

#### 1.1 tcad-scraper - Pattern Replacement (757 console.logs)

**Locations**: `tcad-scraper/server/src/**/*.ts`

**Pattern Mapping**:

| Current Pattern | Sentry Replacement | Severity | Use Case |
|----------------|-------------------|----------|----------|
| `console.log('info')` | `captureMessage('info', 'info')` | Info | General info logging |
| `console.log('Success')` | `addBreadcrumb({message: 'Success', level: 'info'})` | Info | Non-critical success |
| `console.error(err)` | `captureException(err, context)` | Error | Error objects |
| `console.error('msg')` | `captureMessage('msg', 'error')` | Error | Error strings |
| `console.warn('warning')` | `captureMessage('warning', 'warning')` | Warning | Warnings |
| `console.info('info')` | `addBreadcrumb({message: 'info', level: 'info'})` | Info | Breadcrumb trail |
| `console.debug('debug')` | `addBreadcrumb({message: 'debug', level: 'debug'})` | Debug | Debug info |

**Implementation Pattern**:

```typescript
// BEFORE
console.log(`Processing property: ${propertyId}`);
try {
  await processProperty(propertyId);
  console.log(`✅ Property ${propertyId} processed successfully`);
} catch (error) {
  console.error(`❌ Failed to process property ${propertyId}:`, error);
}

// AFTER
import { captureException, captureMessage, addBreadcrumb, setContext } from '../lib/sentry.service';

addBreadcrumb({
  message: `Processing property: ${propertyId}`,
  category: 'property.processing',
  level: 'info',
  data: { propertyId }
});

try {
  await processProperty(propertyId);
  addBreadcrumb({
    message: `Property ${propertyId} processed successfully`,
    category: 'property.processing',
    level: 'info',
    data: { propertyId }
  });
} catch (error) {
  setContext('property', { propertyId, operation: 'processing' });
  captureException(error as Error, {
    propertyId,
    operation: 'processProperty',
    timestamp: new Date().toISOString()
  });
}
```

**Script-Based Conversion**: Create AST-based rewrite rules for common patterns:

```yaml
# ast-grep rewrite rule for console.log -> breadcrumb
id: console-log-to-breadcrumb
language: typescript
rule:
  pattern: console.log($MSG)
fix: |
  addBreadcrumb({
    message: $MSG,
    category: 'general',
    level: 'info'
  })
```

#### 1.2 AnalyticsBot/backend - Pattern Replacement (97 console.logs)

Similar patterns to tcad-scraper, but fewer statements. Focus on:
- Bot execution errors
- Data fetching issues
- API integration errors

#### 1.3 AnalyticsBot Python Bots (396 print statements)

**Install**: `sentry-sdk` for Python

```python
# BEFORE
print(f"Processing URL: {url}")
try:
    data = fetch_data(url)
    print(f"✅ Fetched {len(data)} records")
except Exception as e:
    print(f"❌ Error: {e}")

# AFTER
import sentry_sdk

sentry_sdk.add_breadcrumb(
    message=f"Processing URL: {url}",
    category="data.fetch",
    level="info",
    data={"url": url}
)

try:
    data = fetch_data(url)
    sentry_sdk.add_breadcrumb(
        message=f"Fetched {len(data)} records",
        category="data.fetch",
        level="info",
        data={"url": url, "record_count": len(data)}
    )
except Exception as e:
    sentry_sdk.capture_exception(e)
    sentry_sdk.set_context("fetch_context", {
        "url": url,
        "operation": "fetch_data"
    })
```

### Phase 2: Install Sentry in Remaining Projects (P1) 🟡

#### 2.1 SingleSiteScraper (295 statements)

**Steps**:
1. Install dependencies:
   ```bash
   npm install @sentry/node @sentry/profiling-node
   ```

2. Create `src/lib/sentry.service.ts` (copy from tcad-scraper as template)

3. Initialize in entry point:
   ```typescript
   // src/index.ts or src/server.ts
   import { initializeSentry } from './lib/sentry.service';

   initializeSentry(); // MUST be first
   // ... rest of application
   ```

4. Add middleware (Express):
   ```typescript
   import { sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './lib/sentry.service';

   app.use(sentryRequestHandler());
   app.use(sentryTracingHandler());
   // ... routes
   app.use(sentryErrorHandler());
   ```

5. Convert console statements using patterns from Phase 1.1

**Python scripts** (100 print statements):
```bash
pip install sentry-sdk
```

```python
# src/init_sentry.py
import sentry_sdk
from sentry_sdk.integrations.anthropic import AnthropicIntegration
import os

def init_sentry(service_name: str):
    """Initialize Sentry with AI integration and service tagging"""
    def _tag_event(event, hint):
        event.setdefault("tags", {})
        event["tags"]["service"] = service_name
        event["tags"]["language"] = "python"
        return event

    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN", "https://b8fb9fe12151c3d01b4d0732d292c7e0@o4510332694495232.ingest.us.sentry.io/4510346321657856"),
        environment=os.getenv("SENTRY_ENVIRONMENT", "development"),

        # Include Anthropic AI integration for agent monitoring
        integrations=[
            AnthropicIntegration(
                record_inputs=True,
                record_outputs=True,
            ),
        ],

        # Performance monitoring - REQUIRED for AI tracking
        traces_sample_rate=1.0 if os.getenv("NODE_ENV") == "development" else 0.1,
        profiles_sample_rate=1.0 if os.getenv("NODE_ENV") == "development" else 0.1,

        # Send PII for AI context
        send_default_pii=True,

        attach_stacktrace=True,
        max_breadcrumbs=50,
        before_send=_tag_event,
    )

    sentry_sdk.set_tag("service", service_name)
    sentry_sdk.set_tag("language", "python")

# Usage:
init_sentry('singlesitescraper')
```

#### 2.2 IntegrityStudio.ai (92 statements)

Follow same TypeScript pattern as SingleSiteScraper.

**Initialization**:
```typescript
// src/index.ts
import { initializeSentry } from './lib/sentry.service';

initializeSentry('integritystudio');  // Service tag for filtering
```

**Focus Areas**:
- Many logs in `scripts/test-prisma.ts` (test file) - Keep console.log in test files
- Production code in `src/` directories - Convert to Sentry with service tagging
- Database operations - Add performance tracking

#### 2.3 ToolVisualizer (177 print statements)

Python-only project. Install `sentry-sdk` and follow AnalyticsBot Python pattern.

**Initialization**:
```python
# main.py
from src.init_sentry import init_sentry

init_sentry('toolvisualizer')  # Service tag for filtering
```

### Phase 3: Advanced Features (P2) 🟢

#### 3.1 Performance Monitoring

**Database Query Tracking**:
```typescript
import * as Sentry from '@sentry/node';

export async function queryWithTracking<T>(
  operation: string,
  model: string,
  query: () => Promise<T>
): Promise<T> {
  return await Sentry.startSpan({
    name: `db.${operation}`,
    op: 'db.query',
    attributes: {
      'db.operation': operation,
      'db.model': model
    }
  }, query);
}

// Usage
const users = await queryWithTracking(
  'findMany',
  'User',
  () => prisma.user.findMany()
);
```

#### 3.2 Cron Job Instrumentation

**Pattern** (from error-tracking skill):
```typescript
#!/usr/bin/env node
// FIRST LINE - CRITICAL!
import '../instrument';
import * as Sentry from '@sentry/node';

async function main() {
    return await Sentry.startSpan({
        name: 'cron.job-name',
        op: 'cron',
        attributes: {
            'cron.job': 'job-name',
            'cron.startTime': new Date().toISOString(),
        }
    }, async () => {
        try {
            // Cron job logic
        } catch (error) {
            Sentry.captureException(error, {
                tags: {
                    'cron.job': 'job-name',
                    'error.type': 'execution_error'
                }
            });
            console.error('[Job] Error:', error);
            process.exit(1);
        }
    });
}

main()
    .then(() => {
        console.log('[Job] Completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[Job] Fatal error:', error);
        process.exit(1);
    });
```

#### 3.3 Workflow & Queue Error Tracking

```typescript
// Workflow errors (tcad-scraper)
export class WorkflowSentryHelper {
    static captureWorkflowError(error: Error, context: {
        workflowCode: string;
        instanceId: number;
        stepId?: number;
        userId: string;
        operation: string;
    }) {
        Sentry.withScope((scope) => {
            scope.setTag('workflow.code', context.workflowCode);
            scope.setTag('workflow.operation', context.operation);
            scope.setContext('workflow', {
                instanceId: context.instanceId,
                stepId: context.stepId,
                userId: context.userId
            });
            Sentry.captureException(error);
        });
    }
}

// Queue job errors
export async function processJobWithTracking(job: Job) {
    return await Sentry.startSpan({
        name: 'queue.process',
        op: 'queue.job',
        attributes: {
            'queue.name': job.queueName,
            'queue.jobId': job.id,
            'queue.jobName': job.name
        }
    }, async () => {
        try {
            await job.process();
        } catch (error) {
            Sentry.captureException(error, {
                tags: {
                    'queue.name': job.queueName,
                    'queue.jobId': job.id
                }
            });
            throw error;
        }
    });
}
```

#### 3.4 AI Agent Monitoring with Anthropic Integration 🤖

**CRITICAL**: All projects must include Anthropic AI integration for Claude agent monitoring.

**Why This Matters**:
- Track all Claude AI interactions (prompts, responses, errors)
- Monitor token usage and costs
- Debug AI agent failures with full context
- Performance metrics for AI operations
- Capture AI-specific errors (rate limits, quota exceeded, etc.)

**TypeScript/Node.js Configuration**:

```typescript
// src/lib/sentry.service.ts or src/instrument.ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry with Anthropic AI integration and service tagging
 * @param serviceName - Unique service identifier (e.g., 'tcad-scraper', 'analyticsbot-backend')
 */
export function initializeSentry(serviceName: string): void {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "https://b8fb9fe12151c3d01b4d0732d292c7e0@o4510332694495232.ingest.us.sentry.io/4510346321657856",

    // Environment
    environment: process.env.SENTRY_ENVIRONMENT || 'development',

    // Integrations - MUST include Anthropic AI integration
    integrations: [
      // Profiling
      nodeProfilingIntegration(),

      // Anthropic AI Integration - REQUIRED for agent monitoring
      Sentry.anthropicAIIntegration({
        recordInputs: true,   // Capture prompts sent to Claude
        recordOutputs: true,  // Capture responses from Claude
      }),

      // HTTP, Express, Postgres (if applicable)
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: true }),
      new Sentry.Integrations.Postgres(),
    ],

    // Performance Monitoring - MUST be enabled for agent monitoring
    // Adjust sample rate based on environment:
    // - Development: 1.0 (100%) to capture all interactions
    // - Staging: 0.5 (50%) for thorough testing
    // - Production: 0.1-0.2 (10-20%) to balance cost vs visibility
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

    // REQUIRED: Send PII for AI agent context (prompts/responses)
    // WARNING: Ensure compliance with data privacy policies
    sendDefaultPii: true,

    // Additional options
    attachStacktrace: true,
    maxBreadcrumbs: 50,
    debug: process.env.NODE_ENV === 'development',

    // Data scrubbing (important when sendDefaultPii is true)
    beforeSend(event, hint) {
      // CRITICAL: Set service tag on every event for unified project
      event.tags = event.tags || {};
      event.tags.service = serviceName;
      event.tags.language = 'typescript';

      // Scrub sensitive data from AI prompts/responses if needed
      if (event.contexts?.ai) {
        // Example: Redact API keys, passwords, tokens from prompts
        // Be careful not to break AI debugging capabilities
      }

      // Remove sensitive request data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }

      return event;
    },
  });

  // Set global tags for all future events
  Sentry.setTag('service', serviceName);
  Sentry.setTag('language', 'typescript');

  console.log(`Sentry initialized for ${serviceName} with Anthropic AI integration (environment: ${process.env.SENTRY_ENVIRONMENT})`);
}

// Usage examples in each project:

// tcad-scraper/server/src/index.ts
initializeSentry('tcad-scraper');

// analyticsbot/backend/src/index.ts
initializeSentry('analyticsbot-backend');

// singlesitescraper/src/index.ts
initializeSentry('singlesitescraper');

// integritystudio/src/index.ts
initializeSentry('integritystudio');
```

**Python Configuration** (for AI-powered Python scripts):

```python
# src/init_sentry.py
import sentry_sdk
from sentry_sdk.integrations.anthropic import AnthropicIntegration
import os

def init_sentry(service_name: str):
    """
    Initialize Sentry with Anthropic AI integration and service tagging

    Args:
        service_name: Unique service identifier (e.g., 'analyticsbot-bots', 'toolvisualizer')
    """
    def _tag_event(event, hint):
        """Add service tags to every event for unified project"""
        event.setdefault("tags", {})
        event["tags"]["service"] = service_name
        event["tags"]["language"] = "python"
        return event

    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN", "https://b8fb9fe12151c3d01b4d0732d292c7e0@o4510332694495232.ingest.us.sentry.io/4510346321657856"),

        # Environment
        environment=os.getenv("SENTRY_ENVIRONMENT", "development"),

        # Integrations - Include Anthropic AI
        integrations=[
            AnthropicIntegration(
                record_inputs=True,   # Capture prompts
                record_outputs=True,  # Capture responses
            ),
        ],

        # Performance monitoring - REQUIRED for AI tracking
        traces_sample_rate=1.0 if os.getenv("NODE_ENV") == "development" else 0.1,
        profiles_sample_rate=1.0 if os.getenv("NODE_ENV") == "development" else 0.1,

        # Send PII for AI context
        send_default_pii=True,

        # Additional options
        attach_stacktrace=True,
        max_breadcrumbs=50,
        debug=os.getenv("NODE_ENV") == "development",

        # Tag every event with service name
        before_send=_tag_event,
    )

    # Set global tags for all future events
    sentry_sdk.set_tag("service", service_name)
    sentry_sdk.set_tag("language", "python")

    print(f"Sentry initialized for {service_name} with Anthropic AI integration (environment: {os.getenv('SENTRY_ENVIRONMENT', 'development')})")

# Usage examples in each project:

# analyticsbot/bots/main.py
init_sentry('analyticsbot-bots')

# singlesitescraper/scraper.py
init_sentry('singlesitescraper')

# toolvisualizer/main.py
init_sentry('toolvisualizer')
```

**What Gets Captured**:

1. **AI Prompts**: Full text of prompts sent to Claude
   ```json
   {
     "ai.input": "Analyze this codebase and suggest improvements...",
     "ai.model": "claude-sonnet-4.5",
     "ai.tokens.input": 1250
   }
   ```

2. **AI Responses**: Complete responses from Claude
   ```json
   {
     "ai.output": "Based on my analysis, I recommend...",
     "ai.tokens.output": 3200,
     "ai.tokens.total": 4450
   }
   ```

3. **AI Errors**: Rate limits, quota issues, API failures
   ```json
   {
     "error.type": "AnthropicAPIError",
     "error.message": "Rate limit exceeded",
     "ai.model": "claude-sonnet-4.5",
     "ai.retry_after": 60
   }
   ```

4. **Performance Spans**: AI operation timing
   - Span name: `ai.chat.completions`
   - Duration: Time to generate response
   - Token usage: Input/output/total

**Testing AI Monitoring**:

```typescript
// Test endpoint to verify AI monitoring works
import * as Sentry from '@sentry/node';
import Anthropic from '@anthropic-ai/sdk';

app.get('/api/test-ai-monitoring', async (req, res) => {
  return await Sentry.startSpan({
    name: 'test.ai.monitoring',
    op: 'ai.test',
  }, async () => {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // This will be automatically tracked by Sentry
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4.5',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: 'Say hello in 5 words or less'
        }],
      });

      res.json({
        success: true,
        response: message.content[0].text,
        message: 'Check Sentry dashboard for AI monitoring data'
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { 'test.type': 'ai.monitoring' }
      });
      res.status(500).json({ error: 'AI monitoring test failed' });
    }
  });
});
```

**Sentry Dashboard - What to Check**:

1. **Performance > AI** section shows:
   - Token usage per model
   - Average response times
   - Cost estimates (if configured)

2. **Issues** filtered by `ai` tag shows:
   - Rate limit errors
   - API failures
   - Timeout issues

3. **Traces** show full AI interaction:
   - Prompt → Response flow
   - Token breakdown
   - Timing waterfall

**Privacy & Compliance**:

⚠️ **WARNING**: With `sendDefaultPii: true` and AI monitoring, prompts and responses ARE sent to Sentry.

**Mitigation**:
- Use `beforeSend` hook to scrub PII from AI context
- Configure Sentry data scrubbing rules
- Review prompts for sensitive customer data
- Document AI data handling in privacy policy
- Consider separate Sentry projects for AI-heavy workloads

**Example Data Scrubbing**:

```typescript
beforeSend(event, hint) {
  // Scrub sensitive patterns from AI inputs/outputs
  if (event.contexts?.ai) {
    const sensitivePatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/g,     // SSN
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,  // Email
      /\b\d{16}\b/g,                 // Credit card
      /api[_-]?key[:\s]*['"]?[\w-]+['"]?/gi,  // API keys
    ];

    // Redact from input
    if (event.contexts.ai.input) {
      let input = event.contexts.ai.input;
      sensitivePatterns.forEach(pattern => {
        input = input.replace(pattern, '[REDACTED]');
      });
      event.contexts.ai.input = input;
    }

    // Redact from output
    if (event.contexts.ai.output) {
      let output = event.contexts.ai.output;
      sensitivePatterns.forEach(pattern => {
        output = output.replace(pattern, '[REDACTED]');
      });
      event.contexts.ai.output = output;
    }
  }

  return event;
}
```

---

## Sentry Project Architecture & Platform Selection

### Unified Project Approach (IMPLEMENTED)

**Decision**: Use **single unified Sentry project** with service tagging for all ISPublicSites services.

**Platform**: **Node.js** (flexible, supports both Node and Python SDKs)

**Rationale**:
- ✅ Single DSN for all 5 projects (simpler configuration)
- ✅ Unified dashboard for cross-service visibility
- ✅ Better AI interaction correlation across services
- ✅ Lower cost (single project quota)
- ✅ Faster implementation
- ✅ Can split later if needed

### Service Differentiation Strategy

Each service sets unique tags on initialization:

```typescript
// TypeScript services
Sentry.setTag('service', 'tcad-scraper');
Sentry.setTag('language', 'typescript');
```

```python
# Python services
sentry_sdk.set_tag("service", "analyticsbot-bots")
sentry_sdk.set_tag("language", "python")
```

**Service Names** (use consistently across all projects):
- `tcad-scraper` - tcad-scraper/server
- `analyticsbot-backend` - AnalyticsBot/backend TypeScript
- `analyticsbot-bots` - AnalyticsBot Python bots
- `singlesitescraper` - SingleSiteScraper (mixed)
- `integritystudio` - IntegrityStudio.ai
- `toolvisualizer` - ToolVisualizer Python

### Dashboard Organization

**Saved Searches** (create these in Sentry UI):

1. **tcad-scraper Issues**
   - Filter: `service:tcad-scraper is:unresolved`
   - Use case: Monitor scraper service errors

2. **AnalyticsBot Backend Issues**
   - Filter: `service:analyticsbot-backend is:unresolved`
   - Use case: Backend API errors

3. **AnalyticsBot Bots Issues**
   - Filter: `service:analyticsbot-bots is:unresolved`
   - Use case: Python bot execution errors

4. **All AI Interactions**
   - Filter: `ai.model:* is:unresolved`
   - Use case: Claude agent errors across all services

5. **AI Rate Limits**
   - Filter: `error.type:rate_limit`
   - Use case: Track API rate limiting issues

6. **Production Errors Only**
   - Filter: `environment:production is:unresolved`
   - Use case: Critical production issues

7. **Python Errors**
   - Filter: `language:python is:unresolved`
   - Use case: Python-specific issues

8. **High Token Usage**
   - Filter: `ai.tokens.total:>10000`
   - Use case: Expensive AI operations

**Alert Rules** (configure in Sentry > Alerts):

```javascript
// Alert 1: tcad-scraper critical errors
Conditions: service:tcad-scraper AND level:error
Action: Email to team@ispublicsites.com
Frequency: Immediately

// Alert 2: AI rate limit errors
Conditions: error.type:rate_limit
Action: Slack #ai-alerts channel
Frequency: Every 5 minutes (max)

// Alert 3: High error rate (any service)
Conditions: error count > 50 in 5 minutes
Action: PagerDuty incident
Frequency: Once per hour

// Alert 4: Production errors (any service)
Conditions: environment:production AND level:fatal
Action: Email + Slack #critical
Frequency: Immediately
```

### When to Split into Separate Projects

Migrate to separate Sentry projects if:

| Trigger | Action |
|---------|--------|
| **Quota exhausted** | One service consuming >80% of quota → split it out |
| **Alert fatigue** | Too many mixed notifications → service-specific projects |
| **Team growth** | Different teams owning services → separate ownership |
| **Dashboard slowness** | >100k events/month → consider splitting |
| **Cost optimization** | Paid plan makes per-service pricing better |

**Migration Path**: Just update DSN in each service's `.env` file. Tags become obsolete but data remains organized.

---

## Implementation Roadmap

### Week 1: Foundation & High-Impact (P0)

**Day 0: Add Anthropic AI Integration + Service Tagging to Existing Sentry** ⚡

**tcad-scraper Updates**:
1. Update `sentry.service.ts`:
   - Add `serviceName` parameter to `initializeSentry()`
   - Add `Sentry.anthropicAIIntegration()` to integrations
   - Add service tagging in `beforeSend` hook
   - Set global tags with `Sentry.setTag('service', 'tcad-scraper')`
2. Update `src/index.ts`: Call `initializeSentry('tcad-scraper')`
3. Set `sendDefaultPii: true` and `tracesSampleRate: 1.0` for development

**AnalyticsBot/backend Updates**:
1. Update `sentry.config.ts`:
   - Add `serviceName` parameter to `initializeSentry()`
   - Add `Sentry.anthropicAIIntegration()`
   - Add service tagging: `Sentry.setTag('service', 'analyticsbot-backend')`
2. Update entry point: Call `initializeSentry('analyticsbot-backend')`

**Testing**:
- Create `/api/test-ai-monitoring` endpoint in both services
- Verify AI monitoring in Sentry dashboard (Performance > AI section)
- Verify service tags appear: Filter by `service:tcad-scraper` and `service:analyticsbot-backend`
- Test filtering in Sentry Issues list

**Day 1-2: tcad-scraper console.error → Sentry** (133 statements)
- Focus on error paths first (highest value)
- Search for `console.error` patterns
- Replace with `captureException` or `captureMessage('error')`
- Test error reporting in Sentry dashboard
- Verify AI context is captured

**Day 3-4: tcad-scraper console.log → Breadcrumbs** (757 statements)
- Create ast-grep rewrite rules for common patterns
- Run batch conversion with dry-run
- Manual review of complex cases
- Test breadcrumb trails in Sentry
- Ensure AI interactions show up in traces

**Day 5: AnalyticsBot/backend TypeScript** (97 statements)
- Apply same patterns as tcad-scraper
- Smaller scope, quick wins
- Test AI monitoring for AnalyticsBot agents

### Week 2: Python Projects (P1)

**Day 1-2: AnalyticsBot Python bots** (396 print statements)
- Install `sentry-sdk` in bot environments
- Create `init_sentry.py` utility with **Anthropic AI integration**
- Add `AnthropicIntegration(record_inputs=True, record_outputs=True)`
- Set `send_default_pii=True` for AI context
- Convert print statements to breadcrumbs
- Test with actual bot runs
- Verify AI interactions appear in Sentry dashboard

**Day 3: SingleSiteScraper Python** (100 print statements)
- Apply AnalyticsBot patterns (including AI integration)
- Focus on scraper error paths
- Test AI monitoring if Claude agents are used

**Day 4: ToolVisualizer** (177 print statements)
- Similar pattern to other Python projects
- Include Anthropic AI integration for any Claude usage
- May need visualization-specific context

### Week 3: New Installations (P1)

**Day 1-2: SingleSiteScraper TypeScript** (195 console.log)
- Install Sentry packages: `npm install @sentry/node @sentry/profiling-node`
- Create `sentry.service.ts` with **Anthropic AI integration**
- Initialize with `Sentry.anthropicAIIntegration()` in integrations array
- Set `sendDefaultPii: true` and appropriate `tracesSampleRate`
- Add Express middleware (requestHandler, tracingHandler, errorHandler)
- Convert console statements to Sentry calls
- Test AI monitoring endpoint

**Day 3-4: IntegrityStudio.ai** (92 console.log)
- Install Sentry packages
- Create sentry.service.ts with **Anthropic AI integration**
- Include `anthropicAIIntegration({ recordInputs: true, recordOutputs: true })`
- Focus on production code (exclude test files - keep console.log in tests)
- Database operation tracking with performance spans
- Test AI monitoring if Claude agents are used

### Week 4: Advanced Features (P2)

**Day 1-2: Performance Monitoring**
- Database query tracking (all projects)
- API endpoint performance spans
- Slow query detection

**Day 3-4: Cron Job Instrumentation**
- Identify all cron jobs/scheduled tasks
- Add Sentry instrumentation
- Test execution tracking

**Day 5: Documentation & Review**
- Update project READMEs
- Create Sentry best practices guide
- Team training session

---

## Conversion Patterns Reference

### TypeScript Pattern Library

```typescript
// 1. Simple info logging
console.log('Operation started')
// →
addBreadcrumb({ message: 'Operation started', category: 'operation', level: 'info' })

// 2. Error logging
console.error('Operation failed:', error)
// →
captureException(error, { operation: 'operation-name' })

// 3. Warning logging
console.warn('Deprecated API usage')
// →
captureMessage('Deprecated API usage', 'warning', { api: 'deprecated-api-name' })

// 4. Success with data
console.log(`Processed ${count} items`)
// →
addBreadcrumb({
  message: `Processed ${count} items`,
  category: 'processing',
  level: 'info',
  data: { count }
})

// 5. Error with context
console.error(`Failed to process user ${userId}:`, error)
// →
Sentry.withScope((scope) => {
  scope.setContext('user', { userId });
  scope.setTag('operation', 'user.process');
  captureException(error);
})

// 6. Debug logging (development only)
console.debug('Debug data:', debugData)
// →
if (config.isDevelopment) {
  addBreadcrumb({
    message: 'Debug data',
    category: 'debug',
    level: 'debug',
    data: debugData
  })
}

// 7. Performance-sensitive operations
const start = Date.now();
await operation();
console.log(`Operation took ${Date.now() - start}ms`);
// →
await Sentry.startSpan({
  name: 'operation.name',
  op: 'operation.type'
}, async () => {
  await operation();
})
```

### Python Pattern Library

```python
# 1. Simple info logging
print('Operation started')
# →
sentry_sdk.add_breadcrumb(
    message='Operation started',
    category='operation',
    level='info'
)

# 2. Error logging
print(f'Error: {e}')
# →
sentry_sdk.capture_exception(e)

# 3. Success with data
print(f'Processed {count} items')
# →
sentry_sdk.add_breadcrumb(
    message=f'Processed {count} items',
    category='processing',
    level='info',
    data={'count': count}
)

# 4. Error with context
try:
    process_user(user_id)
except Exception as e:
    print(f'Failed to process user {user_id}: {e}')
# →
try:
    process_user(user_id)
except Exception as e:
    sentry_sdk.set_context('user', {'user_id': user_id})
    sentry_sdk.set_tag('operation', 'user.process')
    sentry_sdk.capture_exception(e)
```

---

## Automation Tools

### AST-Grep Rewrite Rules

Create `sentry-migration-rules.yml`:

```yaml
rules:
  # Rule 1: console.log with string literal
  - id: console-log-string
    language: typescript
    rule:
      pattern: console.log($MSG)
      where:
        $MSG:
          kind: string
    fix: |
      addBreadcrumb({ message: $MSG, category: 'general', level: 'info' })

  # Rule 2: console.error with error object
  - id: console-error-object
    language: typescript
    rule:
      pattern: console.error($MSG, $ERR)
    fix: |
      captureException($ERR, { context: $MSG })

  # Rule 3: console.warn
  - id: console-warn
    language: typescript
    rule:
      pattern: console.warn($MSG)
    fix: |
      captureMessage($MSG, 'warning')
```

**Usage**:
```bash
# Dry run
ast-grep scan --config sentry-migration-rules.yml --json ./src

# Apply fixes
ast-grep scan --config sentry-migration-rules.yml --update ./src
```

### Migration Script

Create `scripts/migrate-to-sentry.sh`:

```bash
#!/bin/bash
set -e

PROJECT=$1
if [ -z "$PROJECT" ]; then
    echo "Usage: ./migrate-to-sentry.sh <project-name>"
    exit 1
fi

echo "🚀 Starting Sentry migration for $PROJECT"

# Step 1: Backup
echo "📦 Creating backup..."
cp -r "$PROJECT/src" "$PROJECT/src.backup.$(date +%Y%m%d-%H%M%S)"

# Step 2: Run ast-grep replacements
echo "🔄 Running automated replacements..."
ast-grep scan --config sentry-migration-rules.yml --update "$PROJECT/src"

# Step 3: Add imports
echo "📥 Adding Sentry imports..."
find "$PROJECT/src" -name "*.ts" -exec grep -l "addBreadcrumb\|captureException\|captureMessage" {} \; | \
while read file; do
    if ! grep -q "from.*sentry.service" "$file"; then
        sed -i '' '1i\
import { captureException, captureMessage, addBreadcrumb } from '\''../lib/sentry.service'\'';
' "$file"
    fi
done

# Step 4: Run tests
echo "🧪 Running tests..."
cd "$PROJECT" && npm test

echo "✅ Migration complete! Review changes and commit."
```

---

## Testing Strategy

### 1. Unit Testing

```typescript
// Test Sentry helpers
describe('Sentry Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should capture exception with context', () => {
        const error = new Error('Test error');
        const context = { userId: '123', operation: 'test' };

        captureException(error, context);

        expect(Sentry.captureException).toHaveBeenCalledWith(
            error,
            expect.objectContaining({ extra: context })
        );
    });

    it('should add breadcrumb', () => {
        addBreadcrumb({
            message: 'Test breadcrumb',
            category: 'test',
            level: 'info'
        });

        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Test breadcrumb',
                category: 'test',
                level: 'info'
            })
        );
    });
});
```

### 2. Integration Testing

**Test Sentry Endpoints** (from error-tracking skill):

```bash
# Test basic error capture
curl http://localhost:3002/api/sentry/test-error

# Test with context
curl -X POST http://localhost:3002/api/sentry/test-error \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "operation": "test"}'

# Check Sentry dashboard for captured events
```

### 3. Production Validation

**Checklist**:
- [ ] Verify DSN is configured (`SENTRY_DSN` env var)
- [ ] Check environment setting (`SENTRY_ENVIRONMENT=production`)
- [ ] Confirm trace sample rate (`tracesSampleRate: 0.1`)
- [ ] Test error capture in staging
- [ ] Verify breadcrumbs appear in error context
- [ ] Check performance monitoring data
- [ ] Validate user context is set correctly
- [ ] Test alert notifications (email/Slack)

---

## Configuration Guide

### Environment Variables

```bash
# .env
# UNIFIED DSN for all ISPublicSites projects
SENTRY_DSN=https://b8fb9fe12151c3d01b4d0732d292c7e0@o4510332694495232.ingest.us.sentry.io/4510346321657856

SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 100% in dev, 10% in prod for AI monitoring
SENTRY_PROFILES_SAMPLE_RATE=0.1
SENTRY_ENABLED=true
SENTRY_SEND_DEFAULT_PII=true  # REQUIRED for AI agent monitoring
```

**Important Notes**:
- All ISPublicSites projects use the **same unified DSN** for consolidated monitoring
- `SENTRY_SEND_DEFAULT_PII=true` is **REQUIRED** for Anthropic AI integration to capture prompts/responses
- **Development**: Set `SENTRY_TRACES_SAMPLE_RATE=1.0` to capture all AI interactions
- **Production**: Set `SENTRY_TRACES_SAMPLE_RATE=0.1-0.2` to balance cost vs visibility

### Sample Rate Guidelines

| Environment | Traces Sample Rate | Profiles Sample Rate | Reasoning |
|-------------|-------------------|---------------------|-----------|
| Development | 1.0 (100%) | 1.0 (100%) | Capture everything for debugging + **all AI interactions** |
| Staging | 0.5 (50%) | 0.5 (50%) | High coverage for pre-prod testing + AI testing |
| Production | 0.1-0.2 (10-20%) | 0.1 (10%) | Balance cost vs observability + **AI monitoring** |
| High Traffic | 0.01 (1%) | 0.01 (1%) | Reduce volume, still get insights (may miss AI issues) |

**AI Monitoring Note**: Higher sample rates (10-20% in production) recommended for projects with Claude agents to ensure adequate AI interaction visibility.

### Sentry Project Organization

**Recommended Structure**:
- `ispublicsites-tcad-scraper-server` (production)
- `ispublicsites-tcad-scraper-server-staging`
- `ispublicsites-analyticsbot-backend` (production)
- `ispublicsites-analyticsbot-backend-staging`
- `ispublicsites-analyticsbot-ui` (production)
- `ispublicsites-singlesitescraper` (production)
- `ispublicsites-integritystudio` (production)
- `ispublicsites-toolvisualizer` (production)

**Tags for Filtering**:
- `service`: tcad-scraper, analyticsbot, singlesitescraper, etc.
- `environment`: production, staging, development
- `language`: typescript, python
- `operation`: scraping, processing, api, cron, queue, **ai.interaction**
- `ai.model`: claude-sonnet-4.5, claude-opus, etc.
- `ai.operation`: chat.completion, embedding, classification, etc.
- `error.type`: For AI errors: rate_limit, quota_exceeded, api_error, timeout

---

## Success Metrics

### Quantitative Goals

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Console statements | 1,310 | 0-50 | 4 weeks |
| Print statements | 690 | 0-20 | 4 weeks |
| Sentry error captures | 18 | 200+ | 2 weeks |
| Projects with Sentry | 2/5 | 5/5 | 3 weeks |
| **Projects with AI monitoring** | **0/5** | **5/5** | **1 week** |
| **AI interactions tracked** | **0** | **100%** | **2 weeks** |
| Avg resolution time | N/A | <1 hour | 6 weeks |
| Production incidents detected | 0% | 95% | 6 weeks |

### Qualitative Goals

- **Observability**: All production errors visible in Sentry dashboard
- **Context**: Every error includes user context, operation details, timestamps
- **Performance**: Database query performance tracked and optimized
- **AI Monitoring**: All Claude agent interactions captured with prompts, responses, token usage
- **AI Debugging**: Full AI context available for debugging agent failures
- **Alerting**: Critical errors trigger immediate notifications
- **Debugging**: Breadcrumb trails provide full context for issue reproduction
- **Cost Tracking**: AI token usage monitored for cost optimization

---

## Risk Mitigation

### Risk 1: Performance Impact

**Concern**: Sentry SDK adds overhead to every request.

**Mitigation**:
- Use sample rates (10% in production)
- Async event sending (non-blocking)
- Breadcrumbs are buffered locally
- Monitor application performance metrics before/after

### Risk 2: Sensitive Data Leakage

**Concern**: Errors may contain PII, tokens, passwords.

**Mitigation**:
- Configure `beforeSend` hook to scrub sensitive data
- Never log full request bodies
- Use Sentry data scrubbing rules (regex patterns)
- Audit captured events regularly

```typescript
Sentry.init({
    beforeSend(event, hint) {
        // Scrub sensitive data
        if (event.request) {
            delete event.request.cookies;
            delete event.request.headers?.authorization;
        }

        // Remove sensitive context
        if (event.extra) {
            delete event.extra.password;
            delete event.extra.token;
            delete event.extra.apiKey;
        }

        return event;
    }
});
```

### Risk 3: Incomplete Migration

**Concern**: Missed console.log statements in production.

**Mitigation**:
- Use ast-grep to find ALL console/print statements
- Create pre-commit hooks to block new console.log
- Add ESLint rule: `no-console: error`
- Run periodic audits with batch_search tool

### Risk 4: Sentry Quota Exceeded

**Concern**: High-volume applications may exceed Sentry plan limits.

**Mitigation**:
- Start with low sample rates (1-10%)
- Filter out noisy errors (404s, rate limits)
- Use quotas and spike protection in Sentry settings
- Monitor usage dashboard regularly

---

## Maintenance & Monitoring

### Weekly Tasks

- [ ] Review Sentry error trends
- [ ] Triage unresolved issues
- [ ] Check for new error patterns
- [ ] Validate alert configurations
- [ ] Review performance regressions

### Monthly Tasks

- [ ] Audit Sentry quota usage
- [ ] Review and update alert thresholds
- [ ] Analyze MTTR improvements
- [ ] Update documentation
- [ ] Team retrospective on Sentry effectiveness

### Quarterly Tasks

- [ ] Review sample rates and adjust
- [ ] Evaluate Sentry plan and features
- [ ] Conduct sensitive data audit
- [ ] Update training materials
- [ ] Benchmark against industry standards

---

## Documentation & Training

### Developer Guide

Create `docs/sentry-developer-guide.md` in each project:

**Contents**:
1. Quick start: Adding Sentry to new code
2. Pattern library: Common replacements
3. Testing locally: Sentry test mode
4. Debugging: Reading Sentry errors
5. Best practices: Context, breadcrumbs, tags
6. FAQ: Common issues and solutions

### Team Training

**Session 1: Sentry Basics** (1 hour)
- What is Sentry and why we're using it
- Tour of Sentry dashboard
- How to read error reports
- Understanding breadcrumbs and context

**Session 2: Implementation** (1 hour)
- Writing Sentry-aware code
- Error handling patterns
- Performance monitoring
- Testing strategies

**Session 3: Production** (30 min)
- On-call workflow with Sentry
- Alert triage and response
- Common production patterns
- Incident retrospectives

---

## Appendix

### A. Complete File List for Migration

**tcad-scraper** (920 statements):
```bash
cd /Users/alyshialedlie/code/ISPublicSites/tcad-scraper/server
ast-grep run --pattern 'console.$METHOD($$$)' --lang typescript --json src | \
  jq -r '.[] | .file' | sort | uniq -c | sort -rn
```

**AnalyticsBot** (493 statements):
```bash
# TypeScript
cd /Users/alyshialedlie/code/ISPublicSites/AnalyticsBot/backend
ast-grep run --pattern 'console.$METHOD($$$)' --lang typescript --json src | \
  jq -r '.[] | .file' | sort | uniq -c | sort -rn

# Python
cd /Users/alyshialedlie/code/ISPublicSites/AnalyticsBot
ast-grep run --pattern 'print($$$)' --lang python --json . | \
  jq -r '.[] | .file' | sort | uniq -c | sort -rn
```

### B. Sentry DSN Setup

1. Create projects in Sentry (sentry.io)
2. Copy DSN for each project
3. Add to environment variables:
   ```bash
   # .env.production
   SENTRY_DSN=https://PUBLIC_KEY@sentry.io/PROJECT_ID
   ```
4. Never commit DSN to git (use .env files)

### C. Related Resources

- **Sentry Documentation**: https://docs.sentry.io/platforms/node/
- **Sentry Python SDK**: https://docs.sentry.io/platforms/python/
- **ast-grep**: https://ast-grep.github.io/
- **Error Tracking Skill**: `~/.claude/skills/error-tracking/SKILL.md`
- **Previous Session Report**: `/Users/alyshialedlie/code/PersonalSite/_reports/2025-11-17-ispublicsites-duplication-analysis.md`

### D. Quick Command Reference

```bash
# Find all console.log statements
ast-grep run --pattern 'console.log($$$)' --lang typescript ./src

# Find all console.error statements
ast-grep run --pattern 'console.error($$$)' --lang typescript ./src

# Find all print statements
ast-grep run --pattern 'print($$$)' --lang python .

# Count by file
ast-grep run --pattern 'console.log($$$)' --lang typescript --json ./src | \
  jq -r '.[] | .file' | sort | uniq -c | sort -rn

# Dry-run rewrite
ast-grep scan --config rewrite-rules.yml --json ./src

# Apply rewrite
ast-grep scan --config rewrite-rules.yml --update ./src
```

---

## Next Steps

1. **Review & Approve**: Review this strategy with team
2. **Day 0 - AI Integration** (HIGHEST PRIORITY):
   - Update tcad-scraper `sentry.service.ts` with `Sentry.anthropicAIIntegration()`
   - Update AnalyticsBot/backend `sentry.config.ts` with AI integration
   - Set `sendDefaultPii: true` and `tracesSampleRate: 1.0` for development
   - Create test endpoint: `/api/test-ai-monitoring`
   - Verify AI monitoring in Sentry dashboard (Performance > AI section)
3. **Phase 1 Start**: Begin tcad-scraper console.error migration (Day 1-2)
4. **Daily Standups**: Track progress against roadmap
5. **Weekly Review**: Assess effectiveness and adjust plan

---

**Document Version**: 3.0
**Last Updated**: 2025-11-17
**Author**: Claude Code
**Status**: Ready for Implementation
**Priority**: P0 - Critical

**Version 3.0 Enhancements**:
1. ✅ Unified Sentry project architecture with service tagging (single DSN for all 5 projects)
2. ✅ Service differentiation strategy with automatic tagging (`serviceName` parameter)
3. ✅ Complete dashboard organization guide (8 saved searches + 4 alert rules)
4. ✅ Platform selection guidance (Node.js for unified flexibility)

**Version 2.0 Enhancements**:
1. ✅ Comprehensive Anthropic AI integration for Claude agent monitoring
2. ✅ AI-specific configuration (`sendDefaultPii: true`, `anthropicAIIntegration()`)
3. ✅ Privacy & compliance guidance for AI data capture

**Version 1.0**:
- Initial migration strategy for replacing 2,000+ console/print statements
