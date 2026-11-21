---
layout: single
title: "Reconciling Local Telemetry with the Cloud Store and Aligning Hooks to GenAI Semconv v0.1.0"
date: 2026-11-20
author_profile: true
categories: [observability, data-engineering, opentelemetry]
tags: [otel, cloudflare-d1, r2, telemetry-backfill, semantic-conventions, genai, dedup, hooks]
excerpt: "Compared ~2.3M local telemetry records against the cloud store, backfilled the gaps, cleaned up 218,711 duplicate D1 rows the backfill created, pruned 1.7M matched local records, and aligned the hooks with semantic-conventions-genai v0.1.0."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
permalink: /reports/telemetry-cloud-reconciliation-semconv-alignment/
---

**Session Date**: 2026-11-20 (UTC 2026-11-21)<br>
**Project**: `~/.claude` dev environment (hooks) and the `observability-toolkit` submodule<br>
**Focus**: Local-vs-cloud telemetry reconciliation, backfill, cleanup, local pruning, GenAI semconv conformance<br>
**Session Type**: Migration | Data cleanup | Refactoring

## Executive Summary

The session started as a disk-hygiene question (why `~/.claude-history/telemetry` held 1.3 GB) and became a full reconciliation of local JSONL telemetry against the cloud store (obtool-api / Cloudflare D1 over R2). Traces were matched by span ID, logs and evaluations by identity tuples, and metrics by per-day counts in D1, then per data point. The comparison found three kinds of gap: an Aug 26–27 window that never shipped, a 20-minute window on Oct 8 where a reverted hook build stamped metrics with `process.hrtime()` (1970 dates), and about 37,800 `dashboard:judge-evaluations` records that never reached the cloud.

Re-shipping the metric gap through the production shipper landed the August data. On the October days it **doubled** about 218,700 rows, because ingest's dedup key hashes resource attributes and the re-shipped points carried an extra `process.command_args`. The duplicates were identified with a strict twin test (identical attributes minus `process.command_args`). A D1 Time Travel bookmark was recorded first, and the rows were deleted in batches, then hour-by-hour after D1 overload errors (code 7429). Every table's deletion count matched its dry-run count exactly.

With the cloud reconciled, local records over 30 days old that matched a cloud record were pruned: 1.7M records in all, shrinking the telemetry directory from 1.3 GB to 478 MB. Three rename eras had to be handled along the way (`builtin.*`, unprefixed names, and the retired `gen_ai.client.token.usage`). Finally, the hooks were brought in line with `semantic-conventions-genai` v0.1.0: the judge stopped reporting inference calls on `gen_ai.client.operation.duration`, the `invoke_agent` buckets were extended to 24 hours, and every `gen_ai.*` definition now cites a dated source.

## Key Metrics

| Metric | Value |
|---|---|
| Local records compared | ~2.3M (traces 370,294 · logs 161,411 · evaluations 83,267 · metric points 1.59M) |
| Metric points backfilled to cloud | ~30.3k lines across 5 files, 13 shipper runs |
| D1 duplicate rows deleted | 218,711 (dry run 218,711) |
| Local records pruned (≤ Oct 21) | traces 274,262 · logs 93,454 · evaluations 32,917 · derived 35,886 · metric points 1,287,842 |
| Telemetry dir size | 1.3 GB → 478 MB (−63%) |
| Hooks tests after semconv fix | 714 passed (47 files); follow-up 337 passed |
| Commits | 8 in `~/.claude`, 1 in toolkit; both repos pushed |

## Problem Statement

1. **No retention on daily JSONL.** `npm run cleanup` archives into `~/.claude-history/telemetry`, which is also the live `TELEMETRY_DIR`, so nothing ever ages out. Claude Code's `1p_failed_events.*` spool was also being archived forever.
2. **Unknown completeness of the cloud copy.** Before deleting anything local, each record needed a confirmed cloud counterpart.
3. **Semconv drift.** The GenAI conventions moved repos (June 2026). PR #374 (merged 2026-09-22) replaced `gen_ai.client.token.usage`, and #521 (merged 2026-10-06) moved inference latency to `gen_ai.client.inference.duration`. The hooks were partly ahead and partly behind.

## Implementation Details

### 1. Cleanup discard rule

`scripts/env/cleanup-runtime.sh` gained a `DISCARD_FILE_PATTERNS` list (`telemetry:1p_failed_events.*`) and `discard_files_by_age()`. Matching files are deleted once older than `DAYS_TO_KEEP` and never archived. It was tested against a scratch `HOME`: old spool deleted, new spool kept, other old files still archived.

### 2. Comparison

A resumable script (`compare_cloud.py`) cached `/v1/traces`, `/v1/logs` and `/v1/evaluations` per day per org key (three keys). Metrics used D1 aggregate queries instead, because ~2M points were too many to page through the API.

One apparent 2% daily histogram gap turned out to be a classification artifact. `gen_ai.execute_tool.duration` has an exponential-histogram View (`hooks/lib/otel/otel.ts:111-123`). The file exporter labels it `HISTOGRAM` with `dataPointType: 1`, and ingest stores it in `metric_exponential_histograms`.

### 3. The 1970 points

All 3,056 came from `metrics-2026-10-09.jsonl`, written 03:31–03:52 UTC. That window matches commit `a03a31e6` (HDF1 flat-record emitter, which timestamped with `process.hrtime()`) up to its revert `991f717e`. Of those points, 2,979 came from real `hook-runner.js` processes, 70 from a vitest worker (fixed later by `c2bc946b`'s per-run `TELEMETRY_DIR`), and 7 from the detached quality evaluator. The evaluator's judge calls had also failed with HTTP 401.

### 4. Backfill and the duplicate problem

The shipper's 4 MB-per-run objects (~800 KB each) slowed the ingest cron (`cpu_ms = 500`, 100 objects per signal per tick). One tick ended `exceededResources` (2.5 s CPU, 209 s wall). The data was queued, not lost: every object without rows sorted after the watermark.

The duplication came from the dedup index:

```sql
CREATE UNIQUE INDEX idx_metric_histograms_dedup
  ON metric_histograms (name, timestamp_ns, service_name, session_id, attributes_hash);
```

`attributes_hash` covers resource attributes. Original October rows lack `process.command_args` (backfilled row hash `3da64f6b` vs original `71a2a53c`).

- **Choice**: delete only backfilled rows with an exact twin (`json(o.attributes) = json_remove(json(n.attributes), '$."process.command_args"')`).
- **Rationale**: it removes the duplicates while keeping the ~3.7k genuinely new points.
- **Alternative considered**: restoring the Time Travel bookmark. It was rejected because it would also drop live data ingested since.
- **Trade-off**: about 800 backfilled rows on Oct 9/10/12 with no exact twin remain (likely duplicates differing in another attribute).

### 5. Local pruning

Matching was multiset-based, so a cloud row could be consumed by at most one local record, and a partial cloud fetch could only under-match. Metrics needed three passes:

| Pass | Key | Points dropped |
|---|---|---|
| Exact | table, name, ts, pid, point attrs | 1,168,916 |
| Legacy names | `integritystudio.X` → `X`, `integritystudio.tool.*` → `builtin.*` | 98,382 |
| Token usage | `gen_ai.client.token.usage{,.histogram}` + `gen_ai.token.type` → `gen_ai.client.inference.{usage,operation}.{input,output}_tokens` + `gen_ai.token.modality=text` | 20,544 |

Strict attribute matching and name+ts+pid matching gave identical counts in pass 2, which confirmed the gap was purely names.

### 6. GenAI semconv alignment

Facts were verified from raw spec files (`curl` of `raw.githubusercontent.com`), because the web fetcher truncated at ~40k characters:

- TOOL buckets `[0.01 … 81.92]` match `execute-tool.md:908`, `client-inference.md:515`, and the operation and invoke-agent client docs.
- `gen_ai.invoke_agent.duration` now extends to 86,400 s (`gen-ai-metrics.md:600-603`).
- `gen-ai-metrics.md`: operation duration "SHOULD NOT be reported for inference … use `gen_ai.client.inference.duration`".

Code changes (`hooks/lib/quality/llm-judge.ts`, `hooks/lib/otel/attributes.ts:226-241`):

```ts
AGENT: [0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8, 25.6, 51.2, 102.4, 204.8, 409.6,
        900, 1800, 3600, 7200, 14400, 43200, 86400],
```

The judge's pre-status `recordMetric(GENAI_CLIENT_OPERATION_DURATION_METRIC, …)` was removed. The `finally`-block inference duration already covered every path and carries `error.type`. A single dated source statement now heads the semconv section of `attributes.ts`, and the other definitions point to it.

The MCP-SEMCONV-CHURN watch item in the toolkit was rolled forward to 2026-12-21. Its watermark records v0.1.0 as the repo's first release, and two behaviour changes the name-only drift check cannot see: #404 (client-side errors no longer reported as server failures) and #732 (`rpc.status_code`).

## Testing and Verification

```
Test Files  47 passed (47)
     Tests  714 passed (714)        # hooks: judge, otel, handlers after the semconv fix
Test Files  2 passed / Tests 87      # reviewer's independent run
     Tests  337 passed (337)        # after folding duplicate tests
check:semconv-drift: OK — 17 attributes + 2 metrics + 12 enum values present and undeprecated (exit 0)
```

Post-cleanup D1 counts for the backfilled days (local / cloud):

| Day | Histogram | Counter |
|---|---|---|
| Aug 26 | 2,073 / 2,073 | 689 / 689 |
| Aug 27 | 16,960 / 16,967 | 5,602 / 5,608 |
| Oct 9 | 56,467 / 56,934 | 19,182 / 19,247 |
| Oct 10 | 11,667 / 11,775 | 4,045 / 4,057 |
| Oct 12 | 27,078 / 27,327 | 8,800 / 8,827 |

A `code-reviewer` pass on `6137b5c8` found no critical issues. Four of its seven findings rested on premises already verified false, such as treating UTC dates as future-dated. Three were valid and fixed in `83a35a07`.

## Files Modified

| File | Change |
|---|---|
| `scripts/env/cleanup-runtime.sh` | +26 (discard rule) |
| `docs/TrackingFiles.md` | 1 line |
| `hooks/lib/otel/attributes.ts` | semconv source block, citations, AGENT buckets, constant removed |
| `hooks/lib/quality/llm-judge.ts` | operation-duration emit removed |
| `hooks/lib/quality/llm-judge.test.ts` | inference-duration assertions, negative test, duplicates folded (−40/+18 in follow-up) |
| `hooks/lib/transcript/{token-metrics,model-ids,transcript-entry}.ts`, `hooks/lib/otel/evaluation-attrs.ts` | citations |
| `hooks/dist/**` | rebuilt counterparts |
| `observability-toolkit/docs/BACKLOG.md` | MCP-SEMCONV-CHURN watermark (+10/−1) |

Commits: `ae60b1b4` (citations), `a284c294` + `8477e24d` (cleanup rule + doc), `6137b5c8` (semconv fix), `83a35a07` (review follow-up), toolkit `7c693f80`, and pointer bumps `3618f5fc`, `e508d6d0`, `0a581e50`, `d28625e4`.

## Lessons

- **Dedup keys that hash resource attributes don't absorb re-ships across exporter versions.** Diff attribute sets against existing rows before re-shipping.
- **Large backfill objects starve a CPU-capped drain.** Ship backlog in small objects.
- **A name-only drift check misses behaviour changes** (#404) and renames carried by data migrations (D1 renamed token metrics in place, local files did not).
- **Verify spec text from raw files.** Rendered pages and summaries truncated or paraphrased exactly the sections that mattered.

## References

- `hooks/lib/otel/attributes.ts` (semconv source block), `hooks/lib/quality/llm-judge.ts`
- `mcp-servers/observability-toolkit/services/obtool-ingest/migrations/0013_dedup_drop_r2key.sql`
- `mcp-servers/observability-toolkit/services/obtool-ingest/src/batch-processor.ts:1007-1021` (`buildPointContext`)
- semantic-conventions-genai: `docs/gen-ai/gen-ai-token-metrics.md`, `client-inference.md`, `gen-ai-metrics.md`, PRs #374, #521; release v0.1.0

---

## Appendix: Readability Analysis

Readability metrics computed with [textstat](https://github.com/textstat/textstat) on the report body (frontmatter, code blocks, and markdown syntax excluded).

### Scores

| Metric | Score | Notes |
|--------|-------|-------|
| Flesch Reading Ease | 56.9 | 0–30 very difficult, 60–70 standard, 90–100 very easy |
| Flesch-Kincaid Grade | 9.0 | US school grade level (Middle School) |
| Gunning Fog Index | 11.1 | Years of formal education needed |
| SMOG Index | 11.4 | Grade level (requires 30+ sentences) |
| Coleman-Liau Index | 12.0 | Grade level via character counts |
| Automated Readability Index | 8.7 | Grade level via characters/words |
| Dale-Chall Score | 13.51 | <5 = 5th grade, >9 = college |
| Linsear Write | 16.2 | Grade level |
| Text Standard (consensus) | 8th and 9th grade | Estimated US grade level |

### Corpus Stats

| Measure | Value |
|---------|-------|
| Word count | 1,117 |
| Sentence count | 76 |
| Syllable count | 1,783 |
| Avg words per sentence | 14.7 |
| Avg syllables per word | 1.60 |
| Difficult words | 256 |
