---
layout: single
title: "ISPublicSites Complexity Refactoring: Four Files, 75-85% Cognitive Reduction"
date: 2026-01-16
author_profile: true
breadcrumbs: true
categories: [code-quality, refactoring, complexity-analysis]
tags: [python, cyclomatic-complexity, cognitive-complexity, data-driven-design, helper-functions, registry-pattern, ast-grep-mcp]
excerpt: "Systematic refactoring of four high-complexity Python files across ISPublicSites repositories, achieving 75-85% cognitive complexity reduction using data-driven mappings, registry patterns, and helper function extraction."
header:
  overlay_image: /images/cover-reports.png
  teaser: /images/cover-reports.png
---

# ISPublicSites Complexity Refactoring: Four Files, 75-85% Cognitive Reduction

**Session Date**: 2026-01-16
**Project**: ISPublicSites (AnalyticsBot, AlephAuto, ToolVisualizer)
**Focus**: Reduce code complexity in highest-complexity Python functions
**Session Type**: Refactoring

## Executive Summary

Completed systematic refactoring of **four high-complexity Python files** across three repositories in the ISPublicSites organization. Using ast-grep-mcp analysis tools to identify complexity hotspots, then applying consistent refactoring patterns (data-driven mappings, registry patterns, helper function extraction), achieved **75-85% cognitive complexity reduction** across all files while maintaining zero breaking changes.

**Key Metrics:**

| Metric | Value |
|--------|-------|
| **Files Refactored** | 4 |
| **Repositories Affected** | 3 |
| **Avg Cognitive Reduction** | 79% |
| **Total Commits** | 4 |
| **Breaking Changes** | 0 |
| **Tests Affected** | 0 (no test failures) |

## Initial Analysis

Ran ast-grep-mcp code analysis tools (`analyze_complexity`, `detect_code_smells`, `detect_security_issues`, `find_duplication`) across 8 repositories in `~/code/ISPublicSites/`. Identified top 25 functions by complexity, selecting the top 4 for refactoring:

| Rank | File | Function | Cyclomatic | Cognitive | Nesting |
|------|------|----------|------------|-----------|---------|
| 1 | configure_analytics.py | `update_config` | 39 | 99 | 6 |
| 2 | timeout_detector.py | `_scan_file` | 29 | 73 | 5 |
| 3 | extract_blocks.py | `deduplicate_blocks` | 26 | 75 | 6 |
| 4 | generate_ui_pages.py | `generate_all_files_page` | 20 | 51 | 8 |

## Refactoring 1: configure_analytics.py

**Repository**: AnalyticsBot
**File**: `scripts/configure_analytics.py`
**Commit**: `f45ada1`

### Problem

The `update_config()` function had 39 cyclomatic complexity with deeply nested if-else chains for each analytics provider (Google Analytics, GTM, Facebook Pixel, etc.).

### Solution: Data-Driven Configuration Mappings

```python
# Before: Nested if-else chains for each provider
def update_config(base_config, user_config):
    if 'google_analytics' in user_config:
        ga = user_config['google_analytics']
        if ga.get('enabled'):
            base_config['providers']['google_analytics']['enabled'] = True
        if ga.get('measurement_id'):
            base_config['providers']['google_analytics']['config']['measurement_id'] = ga['measurement_id']
        # ... 30+ more conditions

# After: Declarative mapping with generic application
PROVIDER_MAPPINGS: dict[str, dict[str, Any]] = {
    'google_analytics': {
        'enabled_path': 'providers.google_analytics.enabled',
        'fields': {
            'measurement_id': 'providers.google_analytics.config.measurement_id',
            'api_secret': 'providers.google_analytics.config.api_secret',
        },
    },
    # ... more providers
}

def _set_nested(config: dict, path: str, value: Any) -> None:
    """Set a value in a nested dict using dot notation path."""
    keys = path.split('.')
    target = config
    for key in keys[:-1]:
        target = target.setdefault(key, {})
    target[keys[-1]] = value
```

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Cyclomatic** | 39 | 10 | **-74%** |
| **Cognitive** | 99 | 15 | **-85%** |

---

## Refactoring 2: timeout_detector.py

**Repository**: AlephAuto
**File**: `sidequest/pipeline-core/scanners/timeout_detector.py`
**Commit**: `50d4f93`

### Problem

The `_scan_file()` method had inline pattern detection with nested conditions for each pattern type (Promise.race, setLoading, async functions, setTimeout).

### Solution: Registry Pattern with Detector Functions

```python
# Before: Inline pattern detection with nested conditions
def _scan_file(self, file_path):
    for line_num, line in enumerate(lines):
        if 'Promise.race' in line:
            if 'timeout' not in line.lower():
                self.findings.append(Finding(...))
        if 'setLoading(true)' in line:
            if not self._has_finally_nearby(lines, line_num):
                self.findings.append(Finding(...))
        # ... more patterns

# After: Registry of focused detector functions
@dataclass
class FileContext:
    """Context for scanning a single file."""
    file_path: Path
    content: str
    lines: list[str]

    def has_text_in_range(self, text: str, start_line: int, num_lines: int) -> bool:
        end = min(start_line + num_lines, len(self.lines))
        return any(text in self.lines[j] for j in range(start_line - 1, end))

def _detect_promise_race_no_timeout(ctx: FileContext, line_num: int, line: str) -> Finding | None:
    if 'Promise.race' not in line:
        return None
    if 'timeout' in line.lower():
        return None
    return Finding(...)

PATTERN_DETECTORS: list[Callable[[FileContext, int, str], Finding | None]] = [
    _detect_promise_race_no_timeout,
    _detect_loading_without_finally,
    _detect_async_no_error_handling,
    _detect_settimeout_no_cleanup,
]
```

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Cyclomatic** | 29 | 8 | **-72%** |
| **Cognitive** | 73 | 16 | **-78%** |

---

## Refactoring 3: extract_blocks.py

**Repository**: AlephAuto
**File**: `sidequest/pipeline-core/extractors/extract_blocks.py`
**Commit**: `eff351d`

### Problem

The `deduplicate_blocks()` function had complex strategy determination logic with repeated patterns for different block categories.

### Solution: Dataclass Rules with Strategy Mapping

```python
# Before: Inline strategy determination
def deduplicate_blocks(blocks):
    for block in blocks:
        if block.category == 'logger':
            if block.occurrences <= 5:
                strategy = 'local_util'
                rationale = f"Logger pattern used {block.occurrences} times..."
            else:
                strategy = 'shared_package'
                rationale = f"Logger pattern used {block.occurrences} times across..."
        # ... more categories

# After: Declarative strategy rules
@dataclass
class StrategyRule:
    """Rule for determining consolidation strategy."""
    max_occurrences: int | None
    strategy: str
    rationale_template: str
    complexity: str
    risk: str

CATEGORY_STRATEGY_RULES: dict[str, list[StrategyRule]] = {
    'logger': [
        StrategyRule(5, 'local_util',
                     "Logger/config pattern used {occ} times - extract to module constant",
                     'trivial', 'minimal'),
        StrategyRule(None, 'shared_package',
                     "Logger/config pattern used {occ} times across {files} files - centralize",
                     'simple', 'low'),
    ],
    # ... more categories
}
```

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Cyclomatic** | 26 | 24 | **-8%** |
| **Cognitive** | 75 | 16 | **-79%** |

---

## Refactoring 4: generate_ui_pages.py

**Repository**: ToolVisualizer
**File**: `generate_ui_pages.py`
**Commit**: `fa502e6`

### Problem

Multiple functions (`generate_all_files_page`, `generate_directory_index`, `generate_schemas_index`) had:
- Repeated HTML templates (navbar appearing 5+ times)
- Duplicate "group by first letter" logic (3 instances)
- Deep nesting (8 levels) in file processing loops

### Solution: Template Constants and Helper Functions

```python
# Before: Repeated navbar HTML in every function
def generate_directory_index(pages_dir, schema_files):
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>...</head>
<body>
    <nav class="navbar">
        <div class="navbar-content">
            <!-- 30+ lines of navbar HTML repeated in 5 functions -->
        </div>
    </nav>
    ...'''

# After: Extracted constants and helpers
NAVBAR_HTML = '''
    <nav class="navbar">
        <div class="navbar-content">
            ...
        </div>
    </nav>
'''

def _group_by_first_letter(items: list, key_func: Callable[[Any], str]) -> dict[str, list]:
    """Group items by their first letter."""
    grouped: dict[str, list] = {}
    for item in items:
        name = key_func(item)
        first_letter = name[0].upper() if name else '#'
        if not first_letter.isalpha():
            first_letter = '#'
        grouped.setdefault(first_letter, []).append(item)
    return grouped

def _generate_html_head(title: str, css_path: str, extra_styles: str = '') -> str:
    """Generate HTML head section."""
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title} - ToolVisualizer</title>
    <link rel="stylesheet" href="{css_path}">
    {extra_styles}
</head>
<body>
'''
```

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Cyclomatic** | ~20 | 3 | **-85%** |
| **Nesting Depth** | 8 | 3 | **-63%** |
| **Avg Complexity** | High | A (3.0) | Excellent |
| **Functions A/B** | - | 25/25 | **100%** |

---

## Patterns Applied

### 1. Data-Driven Configuration Mapping
**Used in**: configure_analytics.py
**When to use**: Multiple similar conditional branches that differ only in field names/paths
**Benefit**: Adding new providers requires only adding to mapping dict, not new code

### 2. Registry Pattern with Detector Functions
**Used in**: timeout_detector.py
**When to use**: Multiple independent checks that can be applied to each item
**Benefit**: Each detector is testable in isolation, easy to add new patterns

### 3. Dataclass Rules with Strategy Selection
**Used in**: extract_blocks.py
**When to use**: Decision trees with consistent structure across categories
**Benefit**: Rules are declarative and self-documenting

### 4. Template Constants and Helper Functions
**Used in**: generate_ui_pages.py
**When to use**: Repeated HTML/text patterns, duplicate logic across functions
**Benefit**: Single source of truth, DRY principle

---

## Files Modified

### AnalyticsBot Repository
- `scripts/configure_analytics.py` - Data-driven provider mappings

### AlephAuto Repository
- `sidequest/pipeline-core/scanners/timeout_detector.py` - Registry pattern
- `sidequest/pipeline-core/extractors/extract_blocks.py` - Dataclass rules

### ToolVisualizer Repository
- `generate_ui_pages.py` - Template constants and helpers

---

## Git Commits

| Commit | Repository | Description |
|--------|------------|-------------|
| `f45ada1` | AnalyticsBot | refactor(configure_analytics): use data-driven provider mappings |
| `50d4f93` | AlephAuto | refactor(timeout_detector): use registry pattern for detectors |
| `eff351d` | AlephAuto | refactor(extract_blocks): add StrategyRule dataclass |
| `fa502e6` | ToolVisualizer | refactor(generate_ui_pages): reduce complexity with helpers |

---

## Summary Statistics

| File | Cyclomatic Before | Cyclomatic After | Cognitive Before | Cognitive After |
|------|-------------------|------------------|------------------|-----------------|
| configure_analytics.py | 39 | 10 | 99 | 15 |
| timeout_detector.py | 29 | 8 | 73 | 16 |
| extract_blocks.py | 26 | 24 | 75 | 16 |
| generate_ui_pages.py | 20 | 3 | 51 | ~10 |
| **Totals** | **114** | **45** | **298** | **57** |
| **Reduction** | | **-61%** | | **-81%** |

---

## Key Takeaways

1. **Data-driven approaches** eliminate conditional complexity by making configuration declarative
2. **Registry patterns** convert nested conditionals into flat, extensible lists
3. **Helper function extraction** reduces nesting depth and improves testability
4. **Template constants** eliminate duplication and create single sources of truth
5. **Dataclasses** provide type-safe, self-documenting rule definitions

---

## References

### Code Files
- `AnalyticsBot/scripts/configure_analytics.py:65-160` - Provider mappings
- `AlephAuto/sidequest/pipeline-core/scanners/timeout_detector.py:30-167` - Pattern detectors
- `AlephAuto/sidequest/pipeline-core/extractors/extract_blocks.py` - Strategy rules
- `ToolVisualizer/generate_ui_pages.py:1-100` - Template constants and helpers

### Analysis Tools
- ast-grep-mcp: `analyze_complexity`, `detect_code_smells`
- radon: Cyclomatic complexity analysis

### Previous Session
- `2026-01-16-ispublicsites-code-analysis-comprehensive-review.md` - Initial analysis
