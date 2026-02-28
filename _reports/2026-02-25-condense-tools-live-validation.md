---
layout: single
title: "Condense Tools Live Validation on tcad-scraper"
date: 2026-02-25
author_profile: true
categories: [ast-grep-mcp, code-condensation]
tags: [mcp, condense, typescript, ast-grep, token-reduction, live-testing, bugfix]
excerpt: "Live validation of all 6 condense MCP tools against the tcad-scraper codebase (219 files, 1.1MB) — uncovered and fixed a per-language stats serialization gap."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2026-02-25<br>
**Project**: ast-grep-mcp<br>
**Focus**: End-to-end live validation of condense feature tools<br>
**Session Type**: Validation | Bugfix

## Executive Summary

Ran all 6 condense MCP tools against the production tcad-scraper codebase (219 files, 1.1MB TypeScript/JS/Python). Every tool executed successfully with zero errors. During validation, discovered and fixed a serialization gap where `per_language_stats` in `condense_pack` output was missing byte-level metrics — only line counts were emitted. After the fix, all 117 condense tests continue to pass.

The `ai_chat` strategy achieved 15.7% actual reduction (43,827 tokens saved) against a theoretical 85% estimate, confirming the JS/TS surface extractor's brace-matching heuristic retains more code than the theoretical model assumes — documented as a future improvement area.

## Key Metrics

| Metric | Value |
|--------|-------|
| Tools validated | 6 / 6 |
| Target codebase | tcad-scraper (219 files, 1.1 MB) |
| Errors encountered | 0 |
| Bug found and fixed | 1 (per-language byte stats) |
| Tests passing | 117 / 117 |
| Best actual reduction | 15.7% (ai_chat) |
| Tokens saved (ai_chat) | 43,827 |

## Tool-by-Tool Results

### 1. condense_normalize (batch, 212 TS files)

Processed in 5 batches of 50. Completed in 0.4s.

| Metric | Value |
|--------|-------|
| Files processed | 212 |
| Normalizations applied | 11,494 |
| Files with changes | 210 / 212 |
| Byte delta | +1,774 (0.16% expansion) |

Quote canonicalization was the dominant transform. Net byte expansion is expected — normalization targets compression consistency, not direct size reduction. Top file: `continuous-batch-scraper.ts` with 1,159 normalizations.

### 2. condense_strip (batch, 219 files)

| Metric | Value |
|--------|-------|
| Files processed | 219 |
| Lines removed | 164 |
| Line reduction | 0.40% |
| Files with removals | 20 / 219 |
| Elapsed | 0.6s |

Removed `console.log`, `debugger`, `print()`, and `pdb.set_trace` statements. Top file: `setup-test-db.ts` (37 lines removed). Codebase is relatively clean — only 0.4% dead code.

### 3. condense_extract_surface (212 TS files)

| Metric | Value |
|--------|-------|
| Files processed | 212 |
| Condensed lines | 33,938 |
| Reduction | 15.0% |
| Output size | 946,780 chars |
| Elapsed | 22.5s |

Kept only `export` declarations with brace-matched blocks. Test files with `describe`/`it` (no `export` prefix) fall back to keeping all lines, limiting reduction.

### 4. condense_pack (all 4 strategies)

| Strategy | Condensed | Reduction | Tokens (est) | Time |
|----------|-----------|-----------|-------------|------|
| ai_chat | 938,923 B | 15.7% | 234,730 | 10.6s |
| ai_analysis | 1,102,420 B | 1.1% | 275,605 | 19.2s |
| archival | 1,102,420 B | 1.1% | 275,605 | 14.9s |
| polyglot | 938,923 B | 15.7% | 234,730 | 15.5s |

`ai_chat` and `polyglot` produce identical output (all files are code, no config/text routing divergence). `ai_analysis` and `archival` are identical (both lossless, normalize+strip only).

Per-language breakdown (ai_chat):

| Language | Files | Reduction |
|----------|-------|-----------|
| TypeScript | 212 | 15.6% |
| JavaScript | 4 | 26.4% |
| Python | 3 | 23.5% |

### 5. condense_estimate

| Strategy | Est. Bytes | Est. Tokens | Theoretical Reduction |
|----------|-----------|-------------|----------------------|
| ai_chat | 167,134 | 41,783 | ~85% |
| ai_analysis | 668,538 | 167,134 | ~40% |
| archival | 779,961 | 194,990 | ~30% |
| polyglot | 389,980 | 97,495 | ~65% |

Top reduction candidates: `continuous-batch-scraper.ts` (1,769 lines, 4.3% of codebase).

### 6. condense_normalize on ~/reports/ (32 files)

Also validated against the reports site (JS, Python, CSS files):

| Metric | Value |
|--------|-------|
| Files processed | 32 |
| Normalizations applied | 59 |
| Files with changes | 16 / 32 |
| Byte reduction | 75 (0.02%) |

## Bug Found and Fixed

**Problem**: `per_language_stats` in `condense_pack` output only serialized `files_processed`, `original_lines`, `condensed_lines` — missing byte-level metrics entirely. This caused per-language stats to appear as all zeros when accessing `original_bytes`/`condensed_bytes` keys.

**Root cause**: `LanguageCondenseStats` dataclass had no byte fields, and `condense_pack_impl` only aggregated line counts per language.

**Fix** (2 files):

`src/ast_grep_mcp/models/condense.py:11-12` — Added fields:
```python
original_bytes: int = 0
condensed_bytes: int = 0
```

`src/ast_grep_mcp/features/condense/service.py:399-400` — Aggregate bytes:
```python
stats.original_bytes += file_result["original_bytes"]
stats.condensed_bytes += file_result["condensed_bytes"]
```

`src/ast_grep_mcp/features/condense/service.py:431-436` — Serialize with computed reduction:
```python
"original_bytes": s.original_bytes,
"condensed_bytes": s.condensed_bytes,
"reduction_pct": round((1.0 - s.condensed_bytes / s.original_bytes) * 100, 1)
```

All 117 condense tests pass after the fix.

## Estimate vs Actual Gap

| Strategy | Estimated Reduction | Actual Reduction | Gap |
|----------|-------------------|-----------------|-----|
| ai_chat | ~85% | 15.7% | 69.3pp |
| ai_analysis | ~40% | 1.1% | 38.9pp |

The estimator uses theoretical `STRATEGY_REDUCTION_RATIOS` constants. The actual JS/TS surface extractor keeps entire brace-matched export blocks (including function bodies), and test files with `describe`/`it` fall back to keeping everything. This is the primary improvement target for the next phase.

## Files Modified

| File | Change |
|------|--------|
| `src/ast_grep_mcp/models/condense.py:11-12` | Added `original_bytes`, `condensed_bytes` fields |
| `src/ast_grep_mcp/features/condense/service.py:399-400` | Aggregate byte counts per language |
| `src/ast_grep_mcp/features/condense/service.py:429-436` | Serialize byte metrics + reduction_pct |

## Git Context

```
d97d782 refactor(condense): remove unused CondenseDefaults constants and standardize field naming
1ffc15b feat(condense): implement P9 — condense_train_dictionary tool (zstd)
9a09893 fix(condense): address critical/high code review findings
```

### 6. condense_train_dictionary (TypeScript)

| Metric | Value |
|--------|-------|
| Dictionary path | `.condense/dictionaries/dict_typescript.zdict` |
| Dictionary size | 112,640 B (110 KB) |
| Samples used | 200 |
| Total sample bytes | 999,080 B (~1 MB) |
| Est. compression improvement | 15.0% |
| Elapsed | 13.2s |

Trained a zstd dictionary on 200 TypeScript files from tcad-scraper, written to `tcad-scraper/.condense/dictionaries/dict_typescript.zdict`. The dictionary captures repeated cross-file patterns (import paths, type annotations, test boilerplate) that standard zstd cannot exploit. Usage:

```bash
zstd -D .condense/dictionaries/dict_typescript.zdict <file>
```

The 15% estimated improvement applies on top of standard zstd compression ratios — most effective for small-to-medium files (<100KB) with consistent coding patterns across the codebase.

## References

- [CLAUDE.md](/Users/alyshialedlie/code/ast-grep-mcp/CLAUDE.md) — Project quick start
- [docs/BACKLOG.md](/Users/alyshialedlie/code/ast-grep-mcp/docs/BACKLOG.md) — Remaining work items
- [docs/CODE-CONDENSE-PHASE-2.md](/Users/alyshialedlie/code/ast-grep-mcp/docs/CODE-CONDENSE-PHASE-2.md) — Phase 2 plan
