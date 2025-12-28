---
layout: single
title: "Code Duplication Analysis: ISPublicSites Repository Audit"
date: 2025-11-17
author_profile: true
breadcrumbs: true
categories: [code-quality, duplicate-detection, technical-debt]
tags: [python, typescript, ast-grep, code-analysis, refactoring, analytics-bot, tool-visualizer, tcad-scraper]
excerpt: "Code Duplication Analysis: ISPublicSites Repository Audit"
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

# Code Duplication Analysis: ISPublicSites Repository Audit
**Session Date**: 2025-11-17
**Project**: ISPublicSites - Multi-project monorepo
**Focus**: Systematic code duplication detection and refactoring recommendations

## Executive Summary

Conducted comprehensive code duplication analysis on the ISPublicSites repository using the ast-grep-mcp find_duplication tool. Analysis revealed significant duplication across both Python and TypeScript codebases:

**Python Results:**
- 589 functions analyzed
- 29 duplicate groups identified
- 1,154 total duplicated lines
- 601 lines could be eliminated through refactoring

**TypeScript Results:**
- 126 functions analyzed
- 4 duplicate groups identified
- 594 total duplicated lines
- 441 lines could be eliminated through refactoring

**Critical Finding**: The tcad-scraper batch enqueue scripts contain 360 lines of near-identical code across 10 files (93.1% similarity), representing the single largest refactoring opportunity.

## Session Overview

### Objectives
1. Catalog all available tools in the ast-grep-mcp repository
2. Run duplication detection on ISPublicSites codebase
3. Identify major refactoring opportunities
4. Provide actionable recommendations

### Tools Used
- **ast-grep-mcp**: MCP server with 17 tools for code analysis
- **find_duplication.py**: Standalone duplication detection tool
- Analysis parameters: 85% minimum similarity, 5 minimum lines

## ast-grep-mcp Tool Catalog

The repository provides 17 MCP tools organized into three categories:

### Code Search Tools (6)
1. **dump_syntax_tree** - Display CST for debugging patterns (`main.py:1011`)
2. **test_match_code_rule** - Test pattern matching (`main.py:1063`)
3. **find_code** - Search using ast-grep patterns (`main.py:1127`)
4. **find_code_by_rule** - Search with YAML rules (`main.py:1294`)
5. **find_duplication** - Detect duplicated constructs (`main.py:1475`)
6. **batch_search** - Parallel multi-query execution (`main.py:2435`)

### Code Rewrite Tools (3)
7. **rewrite_code** - Transform code with backups (`main.py:2128`)
8. **rollback_rewrite** - Restore from backup (`main.py:2348`)
9. **list_backups** - List available backups (`main.py:2394`)

### Schema.org Tools (8)
10. **get_schema_type** - Type information (`main.py:1728`)
11. **search_schemas** - Keyword search (`main.py:1767`)
12. **get_type_hierarchy** - Parent/child relationships (`main.py:1808`)
13. **get_type_properties** - Property listing (`main.py:1847`)
14. **generate_schema_example** - JSON-LD examples (`main.py:1888`)
15. **generate_entity_id** - URI generation (`main.py:1931`)
16. **validate_entity_id** - URI validation (`main.py:1992`)
17. **build_entity_graph** - Unified graph building (`main.py:2046`)

## Python Duplication Analysis

### Command Executed
```bash
uv run python scripts/find_duplication.py ~/code/ISPublicSites \
  --language python \
  --exclude-patterns "node_modules,venv,.venv,__pycache__,.git" \
  --min-similarity 0.85
```

### Performance Metrics

| Metric | Value |
|--------|-------|
| Total functions analyzed | 589 |
| Duplicate groups found | 29 |
| Total duplicated lines | 1,154 |
| Potential line savings | 601 |
| Analysis time | 23.9 seconds |
| Comparisons performed | 34,788 |
| Max possible comparisons | 146,611 |
| Efficiency gain | 76.3% (bucketing optimization) |

### Critical Issues Identified

#### 1. ToolVisualizer UI Generation Scripts

**Impact**: High - 100% identical functions duplicated 2-3 times

**Duplicate Functions:**
- `load_schema()` - 3 instances (100% similar)
  - `generate_ui_pages_v2.py:25-32`
  - `generate_is_ui.py:11-18`
  - `generate_ui_pages.py:11-18`

- `format_size()` - 2 instances (100% similar)
  - `generate_ui_pages_v2.py:34-41`
  - `generate_ui_pages.py:20-27`

- `get_breadcrumb_trail()` - 2 instances (100% similar)
  - `generate_ui_pages_v2.py:43-54`
  - `generate_ui_pages.py:29-41`

- `get_file_type()` - 3 instances (100% similar)
  - `generate_enhanced_schemas.py:257-283`
  - `generate_is_schemas.py:62-88`
  - `directory_schema_generator.py:55-81`

- `format_bytes()` - 3 instances (98.7% similar)
  - `generate_enhanced_schemas.py:426-432`
  - `create_consolidated_index.py:151-157`
  - `generate_is_schemas.py:183-189`

**Recommendation**: Create `ToolVisualizer/utils/common.py` with shared utilities

#### 2. AnalyticsBot Injection Scripts

**Impact**: Critical - Near-complete duplication between two injection modules

**Files Affected:**
- `inject_integrity_analytics.py` (313 lines)
- `inject_leora_analytics.py` (316 lines)

**Duplicate Methods (86-100% similar):**

| Method | Similarity | Line References |
|--------|-----------|-----------------|
| `__init__()` | 94.1% | integrity:36-43, leora:39-46 |
| `fetch_doppler_secrets()` | 98.9% | integrity:45-84, leora:48-87 |
| `generate_fb_pixel_code()` | 100% | integrity:86-105, leora:89-108 |
| `generate_gtm_head_code()` | 100% | integrity:107-115, leora:110-118 |
| `generate_gtm_body_code()` | 100% | integrity:117-122, leora:120-125 |
| `generate_ga4_code()` | 100% | integrity:124-134, leora:127-137 |
| `backup_site()` | 86.0% | integrity:136-140, leora:139-143 |
| `remove_existing_analytics()` | 100% | integrity:142-184, leora:145-187 |
| `inject_tracking_codes()` | 97.2% | integrity:186-235, leora:189-238 |
| `run()` | 99.0% | integrity:257-293, leora:253-289 |

**Total Duplication**: ~550+ lines of nearly identical code

**Recommendation**: Create base class `AnalyticsInjectorBase` with configurable project parameters:

```python
class AnalyticsInjectorBase:
    def __init__(self, site_path: str, doppler_project: str, doppler_config: str = "dev"):
        self.site_path = Path(site_path)
        self.doppler_project = doppler_project
        self.doppler_config = doppler_config
        # ... common initialization

    # All shared methods here

class IntegrityAnalyticsInjector(AnalyticsInjectorBase):
    def __init__(self, site_path: str):
        super().__init__(site_path, doppler_project="AnalyticsBot")

class LeoraAnalyticsInjector(AnalyticsInjectorBase):
    def __init__(self, site_path: str):
        super().__init__(site_path, doppler_project="integrity-studio")
```

#### 3. Other Notable Duplications

**tcad-scraper Migration Scripts:**
- `batch-migrate.py:73-93` vs `batch-migrate-client.py:69-85` (86.6% similar)
- Could be consolidated into shared migration utility

**MCP Server HTTP Handlers:**
- `mcp_server_http.py:142-157` vs `mcp_server_http.py:184-199` (92.7% similar)
- `handle_tools_list()` and `handle_initialize()` share common pattern
- Opportunity for decorator or base handler pattern

## TypeScript Duplication Analysis

### Command Executed
```bash
uv run python scripts/find_duplication.py ~/code/ISPublicSites \
  --language typescript \
  --exclude-patterns "node_modules,venv,.venv,__pycache__,.git,dist,build" \
  --min-similarity 0.85
```

### Performance Metrics

| Metric | Value |
|--------|-------|
| Total functions analyzed | 126 |
| Duplicate groups found | 4 |
| Total duplicated lines | 594 |
| Potential line savings | 441 |
| Analysis time | 1.2 seconds |
| Comparisons performed | 717 |
| Max possible comparisons | 6,555 |
| Efficiency gain | 89.1% (bucketing optimization) |

### Critical Issues Identified

#### 1. tcad-scraper Batch Enqueue Scripts

**Impact**: CRITICAL - Highest priority refactoring target

**Pattern**: 10 nearly identical scripts (93.1% similarity)

**Affected Files:**
1. `enqueue-corporation-batch.ts:24-63`
2. `enqueue-property-type-batch.ts:24-63`
3. `enqueue-residential-batch.ts:24-63`
4. `enqueue-partnership-batch.ts:24-63`
5. `enqueue-trust-batch.ts:24-65`
6. `enqueue-llc-batch.ts:24-63`
7. `enqueue-foundation-batch.ts:24-63`
8. `enqueue-commercial-batch.ts:24-64`
9. `enqueue-investment-batch.ts:24-63`
10. `enqueue-construction-batch.ts:24-63`

**Total Duplication**: 360 lines (10 × ~36 lines each)

**Common Pattern**:
```typescript
async function enqueue[Type]Batch() {
  logger.info('🏛️  Starting [Type] Batch Enqueue');
  logger.info(`Auto-detected batch size: ${BATCH_SIZE}`);

  const totalCount = await prisma.searchTerms.count({
    where: { /* type-specific filter */ }
  });

  const terms = await prisma.searchTerms.findMany({
    where: { /* type-specific filter */ },
    take: BATCH_SIZE,
    orderBy: { name: 'asc' }
  });

  // Common job creation logic
  // Common logging
  // Common cleanup
}
```

**Recommendation**: Create generic batch enqueue utility:

```typescript
// src/scripts/utils/batch-enqueue.ts
interface BatchConfig {
  entityType: string;
  emoji: string;
  whereClause: any;
  batchSize?: number;
}

async function enqueueBatchGeneric(config: BatchConfig) {
  const { entityType, emoji, whereClause, batchSize = BATCH_SIZE } = config;

  logger.info(`${emoji} Starting ${entityType} Batch Enqueue`);
  logger.info(`Auto-detected batch size: ${batchSize}`);

  const totalCount = await prisma.searchTerms.count({ where: whereClause });
  const terms = await prisma.searchTerms.findMany({
    where: whereClause,
    take: batchSize,
    orderBy: { name: 'asc' }
  });

  // Unified job creation logic
}

// Usage in individual scripts
async function enqueueCorporationBatch() {
  return enqueueBatchGeneric({
    entityType: 'Corporation',
    emoji: '🏛️',
    whereClause: { category: 'corporation' }
  });
}
```

**Potential Savings**: Reduce 10 files (~400 lines) to 1 utility (~50 lines) + 10 config calls (~100 lines) = **~250 line reduction**

#### 2. Database Stats Scripts

**Impact**: Medium - Archive code duplication

**Files:**
- `db-stats-simple.ts:6-101` vs `check-db-stats.ts:5-100` (90.1% similar)
- One appears to be archived version

**Recommendation**: Remove archived version or clearly document the difference

#### 3. Test Helper Functions

**Impact**: Low - Minor duplication in test utilities

**Files**: `supertestHelpers.ts:134-138` vs `supertestHelpers.ts:146-150` (90.0% similar)

**Functions**: `assertSuccessResponse()` and `assertErrorResponse()`

**Recommendation**: Extract common assertion logic into base function

## Refactoring Priority Matrix

| Priority | Issue | Files | Lines | Complexity | Impact |
|----------|-------|-------|-------|------------|--------|
| P0 | tcad-scraper batch scripts | 10 | 360 | Low | High |
| P0 | AnalyticsBot injectors | 2 | 550+ | Medium | High |
| P1 | ToolVisualizer utilities | 7 | 200+ | Low | Medium |
| P2 | Schema generators | 3 | 150+ | Medium | Medium |
| P3 | Test helpers | 1 | 10 | Low | Low |

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 hours)
1. **ToolVisualizer Utilities**
   - Create `ToolVisualizer/utils/common.py`
   - Extract: `load_schema()`, `format_size()`, `format_bytes()`, `get_file_type()`
   - Update imports in 7 files
   - Run tests to verify

2. **Test Helper Consolidation**
   - Extract common assertion logic in `supertestHelpers.ts`
   - Update test references

### Phase 2: Major Refactoring (4-6 hours)
3. **tcad-scraper Batch Enqueue**
   - Create `src/scripts/utils/batch-enqueue.ts`
   - Implement `enqueueBatchGeneric()` function
   - Migrate 10 scripts to use generic utility
   - Comprehensive testing of all batch types
   - **Risk**: High - touches critical job enqueue logic
   - **Mitigation**: Test each batch type individually

4. **AnalyticsBot Injectors**
   - Create `AnalyticsInjectorBase` class
   - Extract all shared methods (10+ methods)
   - Update `inject_integrity_analytics.py` to use base
   - Update `inject_leora_analytics.py` to use base
   - Test both injection workflows
   - **Risk**: Medium - touches production analytics injection
   - **Mitigation**: Maintain backward compatibility, test thoroughly

### Phase 3: Schema Consolidation (2-3 hours)
5. **Schema Generator Utilities**
   - Create shared schema utilities module
   - Extract common schema building logic
   - Update 3 schema generator files

## Technical Debt Summary

### Total Potential Savings
- **Lines of code**: ~1,042 lines could be eliminated
- **Maintenance burden**: Reduced by consolidating logic
- **Bug risk**: Lower surface area for bugs
- **Testing**: Fewer test scenarios needed

### Risk Assessment
- **Low Risk**: ToolVisualizer utilities, test helpers
- **Medium Risk**: AnalyticsBot injectors (affects production sites)
- **High Risk**: tcad-scraper batch scripts (affects job processing)

### Testing Requirements
- Unit tests for all extracted utilities
- Integration tests for refactored workflows
- Regression tests to ensure behavior unchanged
- Performance benchmarks (ensure no degradation)

## Key Insights

### Duplication Detection Efficiency
The bucketing optimization in find_duplication significantly improved performance:
- **Python**: 76.3% reduction in comparisons (34,788 vs 146,611 possible)
- **TypeScript**: 89.1% reduction in comparisons (717 vs 6,555 possible)

### Duplication Patterns
Three primary duplication patterns identified:
1. **Copy-Paste Scripts**: Batch enqueue scripts (10 files)
2. **Parallel Implementations**: Injector classes for different projects
3. **Utility Function Duplication**: UI generation helpers

### Root Causes
- Rapid development without refactoring time
- Copy-paste development for similar features
- Lack of shared utility modules
- Missing abstraction layers

## Next Steps

### Immediate Actions
1. [ ] Create GitHub issues for each P0/P1 refactoring item
2. [ ] Prioritize tcad-scraper batch script consolidation
3. [ ] Schedule code review for AnalyticsBot base class design
4. [ ] Create shared utilities branch for ToolVisualizer

### Long-term Improvements
1. [ ] Establish code review checklist for duplication
2. [ ] Add pre-commit hook for duplication detection
3. [ ] Document utility module patterns
4. [ ] Schedule quarterly duplication audits

### Monitoring
1. [ ] Track duplication metrics over time
2. [ ] Measure impact of refactoring on bug rates
3. [ ] Monitor test coverage after consolidation
4. [ ] Benchmark performance before/after

## Tools and Commands

### Duplication Analysis Commands
```bash
# Python analysis
uv run python scripts/find_duplication.py ~/code/ISPublicSites \
  --language python \
  --exclude-patterns "node_modules,venv,.venv,__pycache__,.git" \
  --min-similarity 0.85

# TypeScript analysis
uv run python scripts/find_duplication.py ~/code/ISPublicSites \
  --language typescript \
  --exclude-patterns "node_modules,venv,.venv,__pycache__,.git,dist,build" \
  --min-similarity 0.85

# With JSON output
uv run python scripts/find_duplication.py /path/to/project \
  --language python \
  --json > duplication-report.json
```

### Alternative Shell Script
```bash
./scripts/find_duplication.sh /path/to/project python function_definition 0.85
```

## References

### Documentation
- `ast-grep-mcp/CLAUDE.md` - MCP server documentation
- `ast-grep-mcp/scripts/README.md` - Duplication detection usage
- `ast-grep-mcp/main.py:1475` - find_duplication tool implementation

### Related Files
- Python duplicates primarily in:
  - `ToolVisualizer/` directory (UI generation)
  - `AnalyticsBot/` directory (injection scripts)
- TypeScript duplicates primarily in:
  - `tcad-scraper/server/src/scripts/` (batch enqueue)
  - `AnalyticsBot/backend/tests/utils/` (test helpers)

### External Resources
- ast-grep documentation: https://ast-grep.github.io/
- ast-grep patterns guide: https://ast-grep.github.io/guide/pattern-syntax.html

## Conclusion

This systematic duplication analysis revealed significant opportunities for code consolidation across the ISPublicSites repository. The most critical finding is the tcad-scraper batch enqueue scripts, which contain 360 lines of nearly identical code that could be reduced to ~110 lines through proper abstraction.

Total potential savings of over 1,000 lines of code with clear refactoring paths identified. Prioritizing the P0 and P1 items would eliminate the majority of duplication while improving maintainability and reducing bug surface area.

The analysis demonstrates the value of automated duplication detection in maintaining code quality, particularly in monorepo environments with multiple similar projects.
