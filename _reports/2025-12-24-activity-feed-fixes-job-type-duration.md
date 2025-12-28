---
layout: single
title: "Activity Feed Fixes: Job Type and Duration Display"
date: 2025-12-24
author_profile: true
breadcrumbs: true
categories: [bug-fixes, dashboard, websocket]
tags: [nodejs, typescript, websocket, activity-feed, real-time, pm2, production-deployment]
excerpt: "Fixed activity feed displaying 'unknown' for job types and 'unknown duration' for completed jobs. Implemented timestamp-based duration calculation and proper job type propagation."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# Activity Feed Fixes: Job Type and Duration Display
**Session Date**: 2025-12-24
**Project**: AlephAuto - Job Queue Dashboard
**Focus**: Fix activity feed displaying incorrect job type and duration information
**Session Type**: Bug Fix and Production Deployment

## Executive Summary

Fixed two critical bugs in the AlephAuto dashboard activity feed where job events were displaying **"unknown"** for job types and **"unknown duration"** for completed jobs. The root cause was twofold: job creation calls weren't including the pipeline type in job data, and the activity feed wasn't calculating duration from job timestamps.

Both fixes were implemented, tested locally with live job triggers, deployed to production via PM2, and verified working correctly. The dashboard now displays accurate pipeline names (e.g., "claude-health", "git-activity") and precise duration times (e.g., "0.15s", "0.46s").

**Key Metrics:**
| Metric | Value |
|--------|-------|
| **Bugs Fixed** | 2 |
| **Files Modified** | 4 |
| **Commits Pushed** | 3 |
| **Pipelines Verified** | 2 (claude-health, git-activity) |
| **Production Deployment** | Successful |
| **Breaking Changes** | 0 |

## Problem Statement

### Bug 1: Unknown Job Type
The activity feed was displaying "unknown" for all job types instead of the actual pipeline name.

**Before:**
```
Job job-123 completed successfully (unknown duration)
jobType: "unknown"
```

**Root Cause:** The `triggerPipelineJob()` function in `api/routes/pipelines.js` wasn't including the `type` field when creating jobs.

### Bug 2: Unknown Duration
Completed job messages showed "unknown duration" instead of actual elapsed time.

**Before:**
```
Job job-123 completed successfully (unknown duration)
```

**Root Cause:** The activity feed in `api/activity-feed.js` only checked for `job.result?.duration_seconds`, which wasn't being set. The job's `startedAt` and `completedAt` timestamps were available but not being used.

## Implementation Details

### Fix 1: Job Type Propagation

**File**: `api/routes/pipelines.js`

Added `type: pipelineId` to all job creation calls in `triggerPipelineJob()`:

```javascript
// Generic job creation for other pipelines
if (typeof pipelineWorker.createJob === 'function') {
    pipelineWorker.createJob(jobId, {
        type: pipelineId,  // <-- Added this line
        ...parameters,
        triggeredBy: 'api',
        triggeredAt: new Date().toISOString()
    });
}
```

This was applied to:
- Schema-enhancement single file mode
- Generic `createJob` calls
- `scheduleJob` fallback
- `addJob` fallback
- Direct emit fallback

### Fix 2: Duration Calculation from Timestamps

**File**: `api/activity-feed.js:192-214`

Added timestamp-based duration calculation in the `job:completed` event handler:

```javascript
worker.on('job:completed', (job) => {
  try {
    // Calculate duration from timestamps, fallback to result.duration_seconds
    let durationSeconds = job.result?.duration_seconds;
    if (!durationSeconds && job.startedAt && job.completedAt) {
      const startTime = job.startedAt instanceof Date
        ? job.startedAt
        : new Date(job.startedAt);
      const endTime = job.completedAt instanceof Date
        ? job.completedAt
        : new Date(job.completedAt);
      durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    }

    const duration = durationSeconds != null
      ? `${durationSeconds.toFixed(2)}s`
      : 'unknown duration';

    this.addActivity({
      type: 'job:completed',
      message: `Job ${job.id} completed successfully (${duration})`,
      jobType: job.data?.type || 'unknown',
      duration: durationSeconds,
      // ...
    });
  }
});
```

**Design Decisions:**
- Fallback chain: `result.duration_seconds` → calculated from timestamps → "unknown duration"
- Handle both Date objects and ISO strings for timestamps
- Store numeric duration for potential future analytics

## Before/After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Job Type Display** | "unknown" | "claude-health", "git-activity", etc. |
| **Duration Display** | "unknown duration" | "0.15s", "0.46s", etc. |
| **Activity Message** | `Job X completed (unknown duration)` | `Job X completed successfully (0.15s)` |

## Testing and Verification

### Direct Node.js Test

```javascript
// Simulate job with timestamps
const mockJob = {
  id: 'test-123',
  data: { type: 'git-activity' },
  startedAt: new Date(Date.now() - 5000),
  completedAt: new Date()
};

// Result
Activity message: Job test-123 completed successfully (5.00s)
Activity jobType: git-activity
Activity duration: 5

--- Verification ---
Job type correct: ✅
Duration calculated: ✅
```

### Production Verification

| Pipeline | Job Type | Duration | Status |
|----------|----------|----------|--------|
| claude-health | "claude-health" | 0.15s | ✅ PASS |
| claude-health | "claude-health" | 0.17s | ✅ PASS |
| claude-health | "claude-health" | 0.18s | ✅ PASS |
| git-activity | "git-activity" | 0.43s | ✅ PASS |
| git-activity | "git-activity" | 0.46s | ✅ PASS |

### API Response Verification

```json
{
  "type": "job:completed",
  "jobType": "claude-health",
  "message": "Job claude-health-manual-1766627468956 completed successfully (0.18s)"
}
```

## Deployment

### PM2 Update Required
The PM2 daemon was out of date and causing module resolution errors:

```
Error: Cannot find module '/Users/.../code-env/node/lib/node_modules/pm2/lib/ProcessContainerFork.js'
```

**Solution:** Run `npx pm2 update` to refresh the daemon.

### Deployment Steps

```bash
# 1. Update PM2 daemon
npx pm2 update

# 2. Verify processes online
npx pm2 list
# aleph-dashboard: online
# aleph-worker: online

# 3. Test with live job
curl -X POST http://localhost:8080/api/pipelines/claude-health/trigger \
  -H "Content-Type: application/json" -d '{}'

# 4. Save PM2 state
npx pm2 save
# Saved to /Users/alyshialedlie/.pm2/dump.pm2
```

### Production Status

| Process | Status | PID | Uptime |
|---------|--------|-----|--------|
| aleph-dashboard | online | 30847 | 3m |
| aleph-worker | online | 30857 | 3m |

## Files Modified

### Modified Files (4)

| File | Changes | Purpose |
|------|---------|---------|
| `api/routes/pipelines.js` | +5 lines | Add type field to job creation |
| `api/activity-feed.js` | +15 lines | Calculate duration from timestamps |
| `api/utils/worker-registry.js` | +10 lines | Add setActivityFeed() method |
| `api/server.js` | +3 lines | Connect WorkerRegistry to ActivityFeed |

### Frontend (Gitignored)
- `frontend/src/hooks/useWebSocketConnection.ts` - Map `jobType` to `pipelineId/pipelineName`

## Git Commits

| Commit | Description |
|--------|-------------|
| `aea4fdf` | fix(activity): calculate job duration from timestamps |
| `93f05e3` | fix(activity): include pipeline type in job data for activity feed |
| `efcc6a5` | fix(api): connect worker registry to activity feed for websocket broadcasts |

## Key Decisions

### Decision 1: Timestamp-Based Duration Calculation
**Choice**: Calculate duration from `startedAt`/`completedAt` timestamps
**Rationale**: These timestamps are always available on completed jobs, unlike `result.duration_seconds`
**Alternative Considered**: Requiring all workers to set `result.duration_seconds`
**Trade-off**: Slight calculation overhead vs. no worker changes required

### Decision 2: Fallback Chain for Duration
**Choice**: `result.duration_seconds` → timestamps → "unknown duration"
**Rationale**: Maintains backward compatibility with workers that do set duration
**Trade-off**: Multiple code paths vs. robustness

## WebSocket Real-Time Updates

The fixes integrate with the existing WebSocket infrastructure:

```
ActivityFeedManager.addActivity()
  → broadcaster.broadcast({ type: 'activity:new', ... })
    → WebSocket clients receive real-time updates
      → Dashboard displays correct job type and duration
```

## References

### Code Files
- `api/routes/pipelines.js:triggerPipelineJob()` - Job type propagation
- `api/activity-feed.js:192-214` - Duration calculation
- `api/utils/worker-registry.js:setActivityFeed()` - ActivityFeed connection

### Related Systems
- `sidequest/core/server.js` - SidequestServer job lifecycle events
- `frontend/src/services/websocket.ts` - WebSocket client
- `frontend/src/hooks/useWebSocketConnection.ts` - React hook for dashboard

### Documentation
- `docs/API_REFERENCE.md` - REST API endpoints
- `docs/architecture/ERROR_HANDLING.md` - Error handling patterns
