# Code Duplication Finder

Utility for detecting duplicate code patterns in the PersonalSite repository using ast-grep MCP.

## Quick Start

### Using the Script Helper

```bash
# Show help
./utils/find-duplicates.sh --help

# Scan JavaScript files
./utils/find-duplicates.sh --preset js

# Scan with custom similarity (stricter matching)
./utils/find-duplicates.sh --preset js --similarity 0.9

# Scan all supported languages
./utils/find-duplicates.sh --preset all
```

### Using Claude Code Directly

Ask Claude Code:

```
Run mcp__ast-grep__find_duplication on JavaScript code in /Users/alyshialedlie/code/PersonalSite
```

Or be more specific:

```
Find duplicate functions in assets/js/ with 0.85 similarity threshold
```

## Configuration Options

### Language Support

- **javascript** - JS files in `assets/js/`
- **css** - SCSS files in `_sass/` and `assets/css/` (limited support)
- **html** - Liquid templates in `_includes/`, `_layouts/`

### Construct Types

- `function_definition` - Duplicate functions (default)
- `class_definition` - Duplicate classes
- `method_definition` - Duplicate methods within classes

### Similarity Threshold

Controls how similar code must be to be considered duplicate:

- `0.7` - Loose matching (may find false positives)
- `0.8` - Balanced (default, recommended)
- `0.9` - Strict matching (only very similar code)
- `1.0` - Exact duplicates only

### Other Parameters

- `min_lines` - Minimum lines to consider (default: 5)
  - Lower values catch smaller duplicates
  - Higher values focus on significant duplication

- `max_constructs` - Performance limit (default: 1000)
  - Prevents long analysis times on large codebases
  - Set to 0 for unlimited

- `exclude_patterns` - Paths to skip
  - Default: `["node_modules", "vendor", "_site", ".jekyll-cache", "SumedhSite", "tests"]`

## Example MCP Tool Call

```json
{
  "project_folder": "/Users/alyshialedlie/code/PersonalSite",
  "language": "javascript",
  "construct_type": "function_definition",
  "min_similarity": 0.8,
  "min_lines": 5,
  "max_constructs": 1000,
  "exclude_patterns": [
    "node_modules",
    "vendor",
    "_site",
    ".jekyll-cache",
    "SumedhSite",
    "tests"
  ]
}
```

## Sample Output

When duplicates are found, you'll get:

```json
{
  "summary": {
    "total_constructs": 45,
    "duplicate_groups": 2,
    "total_duplicated_lines": 28,
    "potential_line_savings": 14
  },
  "duplication_groups": [
    {
      "group_id": 1,
      "similarity": 0.95,
      "instances": [
        {
          "file": "assets/js/search.js",
          "start_line": 45,
          "end_line": 58,
          "code": "function validateInput(input) { ... }"
        },
        {
          "file": "assets/js/form-handler.js",
          "start_line": 112,
          "end_line": 125,
          "code": "function validateInput(data) { ... }"
        }
      ]
    }
  ],
  "refactoring_suggestions": [
    {
      "group_id": 1,
      "suggestion": "Extract common validation logic into shared utility function",
      "estimated_savings": "14 lines"
    }
  ]
}
```

## Recent Scan Results

**Last Scan:** 2025-11-16
**Language:** JavaScript
**Result:** ✓ No duplicates found (12 functions analyzed)

This is expected for the PersonalSite repository as it has:
- Minimal custom JavaScript
- Well-organized utility functions
- No copy-paste patterns

## When to Run

Run duplication detection:

1. **Before major refactoring** - Identify consolidation opportunities
2. **After adding features** - Catch accidental duplication
3. **Code review** - Validate DRY principles
4. **Performance optimization** - Find repeated expensive operations

## Integration with Workflow

### Pre-commit Check

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Check for new duplicates before committing

RESULT=$(./utils/find-duplicates.sh --preset js 2>&1)
if echo "$RESULT" | grep -q "duplicate_groups.*[1-9]"; then
    echo "⚠️  Code duplication detected! Review before committing."
    echo "$RESULT"
    exit 1
fi
```

### CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Check for code duplication
  run: |
    # Ask Claude Code to run duplication check
    # Fail if duplicates exceed threshold
```

## Limitations

1. **MCP Tool Requirement** - Must be invoked through Claude Code's function calling
2. **Language Support** - Limited to ast-grep supported languages
3. **Template Files** - Liquid templates may have limited detection accuracy
4. **Semantic Similarity** - Uses structural matching, not semantic analysis

## See Also

- [ast-grep documentation](https://ast-grep.github.io/)
- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- Project CLAUDE.md for development guidelines
