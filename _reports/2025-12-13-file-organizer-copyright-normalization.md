---
layout: single
title: "File Organizer Enhancement: Copyright Pattern Normalization for Organization Folders"
date: 2025-12-13
author_profile: true
categories: [feature-implementation, file-organization, text-processing]
tags: [python, regex, schema-org, file-organizer, normalization, copyright-detection]
excerpt: "Added company name normalization to extract actual organization names from copyright notices, consolidating folders like 'copyright 2024 Google' into 'Google'."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Session Date**: 2025-12-13<br>
**Project**: schema-org-file-system - AI-Powered File Organization<br>
**Focus**: Normalize company names extracted from copyright notices to prevent duplicate organization folders<br>
**Session Type**: Feature Implementation

## Executive Summary

Enhanced the file organizer's company name handling to properly extract organization names from copyright notices. Previously, files containing "Copyright 2024 Google" in their content would create separate folders like `Organization/copyright 2024 Google/`, `Organization/copyright 2020 Google/`, etc. Now all such files are consolidated under `Organization/Google/`.

**Key Metrics:**

| Metric | Value |
|--------|-------|
| **New Functions Added** | 1 |
| **Lines Added** | ~47 |
| **Pattern Types Handled** | 6 |
| **Test Cases Verified** | 8 |
| **Breaking Changes** | 0 |

## Problem Statement

The file organizer's organization detection was extracting company names verbatim from document content, including copyright notices. This resulted in:

- Multiple folders for the same company: `Organization/Copyright 2020 Google/`, `Organization/Copyright 2024 Google/`
- Inconsistent folder naming with dates embedded in names
- Poor organization of files belonging to the same entity

**Impact Before**: Files from the same organization scattered across multiple dated copyright folders.

## Implementation Details

### New Function: `normalize_company_name`

**File**: `scripts/file_organizer_content_based.py:431-477`

Added a normalization function to the `ContentClassifier` class that extracts actual company names from copyright patterns:

```python
def normalize_company_name(self, company_name: str) -> str:
    """
    Normalize company name by extracting actual company from common patterns.

    Handles patterns like:
    - "Copyright 2024 Google" -> "Google"
    - "© 2020 Microsoft Corporation" -> "Microsoft Corporation"
    - "(c) 2019-2024 Apple Inc" -> "Apple Inc"
    - "Copyright (C) 2023 Amazon" -> "Amazon"
    """
    if not company_name:
        return company_name

    # Patterns to extract company name from copyright notices
    copyright_patterns = [
        # "Copyright 2024 Google" or "Copyright (C) 2024 Google"
        r'(?:copyright|©|\(c\))\s*(?:\(c\))?\s*(?:\d{4}(?:\s*[-–—]\s*\d{4})?)\s+(.+)',
        # "2024 Google" (just year followed by company)
        r'^\d{4}(?:\s*[-–—]\s*\d{4})?\s+([A-Z][A-Za-z0-9\s&\-\.]+)$',
        # "(c) Google 2024" (company before year)
        r'(?:copyright|©|\(c\))\s+([A-Z][A-Za-z0-9\s&\-\.]+?)\s+\d{4}',
    ]
    # ... pattern matching logic
```

### Integration with Existing Flow

**File**: `scripts/file_organizer_content_based.py:479-496`

Modified `sanitize_company_name` to call normalization first:

```python
def sanitize_company_name(self, company_name: str) -> str:
    # First normalize the company name (extract from copyright patterns, etc.)
    normalized = self.normalize_company_name(company_name)

    # Remove special characters that aren't allowed in folder names
    sanitized = re.sub(r'[<>:"/\\|?*]', '', normalized)
    # ... rest of sanitization
```

**Design Decision**: Integrating normalization into `sanitize_company_name` ensures all code paths benefit automatically without requiring changes to callers.

## Testing and Verification

### Test Results

```bash
$ python3 -c "from file_organizer_content_based import ContentClassifier; ..."

Testing normalize_company_name:
--------------------------------------------------
'Copyright 2024 Google'                  -> 'Google'
'copyright 2020 google'                  -> 'google'
'© 2019-2024 Microsoft Corporation'      -> 'Microsoft Corporation'
'(c) 2023 Apple Inc'                     -> 'Apple Inc'
'Copyright (C) 2022 Amazon'              -> 'Amazon'
'2024 Facebook'                          -> 'Facebook'
'Google LLC'                             -> 'Google LLC'
'Regular Company Name'                   -> 'Regular Company Name'
```

| Test Case | Input | Expected | Result |
|-----------|-------|----------|--------|
| Standard copyright | `Copyright 2024 Google` | `Google` | ✅ PASS |
| Lowercase | `copyright 2020 google` | `google` | ✅ PASS |
| Unicode symbol | `© 2019-2024 Microsoft Corporation` | `Microsoft Corporation` | ✅ PASS |
| Parenthetical | `(c) 2023 Apple Inc` | `Apple Inc` | ✅ PASS |
| Combined format | `Copyright (C) 2022 Amazon` | `Amazon` | ✅ PASS |
| Year prefix only | `2024 Facebook` | `Facebook` | ✅ PASS |
| No copyright (unchanged) | `Google LLC` | `Google LLC` | ✅ PASS |
| Regular name (unchanged) | `Regular Company Name` | `Regular Company Name` | ✅ PASS |

## Patterns Handled

The normalization function handles these copyright format variations:

| Pattern | Example | Extracted |
|---------|---------|-----------|
| Standard | `Copyright 2024 Google` | `Google` |
| Unicode symbol | `© 2024 Google` | `Google` |
| Parenthetical | `(c) 2024 Google` | `Google` |
| Year range | `© 2019-2024 Google` | `Google` |
| Combined | `Copyright (C) 2024 Google` | `Google` |
| Year prefix | `2024 Google` | `Google` |

## Key Decisions and Trade-offs

### Decision 1: Normalize Within Sanitize
**Choice**: Call `normalize_company_name` from within `sanitize_company_name`
**Rationale**: All code paths automatically benefit; no changes needed to callers
**Alternative Considered**: Normalize at extraction time in `extract_company_names`
**Trade-off**: Slight overhead for already-clean names (negligible)

### Decision 2: Regex-Based Pattern Matching
**Choice**: Use compiled regex patterns for copyright detection
**Rationale**: Handles multiple formats efficiently in single pass
**Alternative Considered**: String manipulation with multiple conditionals
**Trade-off**: More complex patterns but cleaner code

### Decision 3: Preserve Case
**Choice**: Return extracted name with original casing
**Rationale**: Respects how company styles their name (e.g., "iPhone", "eBay")
**Trade-off**: `copyright 2024 google` returns lowercase `google`

## Files Modified

### Modified Files (1)
- `scripts/file_organizer_content_based.py`
  - Added `normalize_company_name` method (lines 431-477, ~47 lines)
  - Modified `sanitize_company_name` to call normalization (lines 479-496)

## Session Activity

### File Organization Run

Before implementing the fix, ran the file organizer to process files:

```
Total files processed: 10
Successfully organized: 10
Errors: 0

Category Breakdown:
- Business: 1 files
- Financial: 3 files
- Legal: 2 files
- Media: 1 files
- Organization: 2 files
- Technical: 1 files

Detected Companies:
- AK Navigator: 1 files
- American Airlines: 1 files
- Flying Service: 1 files
```

## Impact

### Before
```
Organization/
├── copyright 2020 Google/
├── copyright 2024 Google/
├── Copyright (C) 2023 Google/
└── Google LLC/
```

### After
```
Organization/
├── Google/           # All Google files consolidated
├── Google LLC/       # Legal entity variant preserved
└── ...
```

## Next Steps

### Immediate
1. ✅ Feature implemented and tested

### Future Enhancements
2. Add similar normalization for trademark patterns (e.g., "Google(TM)")
3. Consider canonical company name mapping (e.g., "Google LLC" -> "Google")
4. Add unit tests to test suite

## References

### Code Files
- `scripts/file_organizer_content_based.py:431-496` - Normalization implementation

### Related Documentation
- `CLAUDE.md` - Project documentation
- `docs/DEPENDENCIES.md` - Installation guide
