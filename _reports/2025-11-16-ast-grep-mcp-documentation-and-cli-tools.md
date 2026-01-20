---
layout: single
title: "ast-grep-mcp Documentation Enhancement and CLI Tools Development"
date: 2025-11-16
author_profile: true
categories: reports development
tags: [ast-grep, mcp, schema-org, cli-tools, documentation, python]
excerpt: "Enhanced the ast-grep-mcp project documentation and created a new standalone CLI tool for Schema.org vocabulary queries. Improved developer experience through better documentation and provided quick command-line access to three essential Schema.org MCP tools."
header:
  image: /assets/images/cover-reports.png
  teaser: /assets/images/cover-reports.png
---

**Date**: November 16, 2025
**Session Type**: Documentation Review & Tool Development
**Repository**: ast-grep-mcp
**Focus**: CLAUDE.md enhancement, Schema.org CLI tool creation

---

## Executive Summary

Enhanced the ast-grep-mcp project documentation and created a new standalone CLI tool for Schema.org vocabulary queries. The session improved developer experience through better documentation and provided quick command-line access to three essential Schema.org MCP tools.

**Key Deliverables**:
1. ✅ Enhanced CLAUDE.md with standalone tools documentation
2. ✅ Created `schema-tools.py` - CLI for Schema.org vocabulary
3. ✅ Created `SCHEMA-TOOLS-README.md` - Comprehensive tool documentation
4. ✅ Verified all tools working correctly

---

## Session Overview

### Context

The ast-grep-mcp project is an MCP (Model Context Protocol) server providing 13 tools across two domains:
- **5 Code Search Tools** (ast-grep): dump_syntax_tree, test_match_code_rule, find_code, find_code_by_rule, find_duplication
- **8 Schema.org Tools**: get_schema_type, search_schemas, get_type_hierarchy, get_type_properties, generate_schema_example, generate_entity_id, validate_entity_id, build_entity_graph

The project recently added `schema-graph-builder.py` (a standalone tool for building unified entity graphs) but lacked:
- Documentation for the new tool in CLAUDE.md
- Quick CLI access to Schema.org vocabulary tools
- Easy way to explore Schema.org types without running the full MCP server

---

## Work Completed

### 1. CLAUDE.md Documentation Enhancement

**File Modified**: `/Users/alyshialedlie/code/ast-grep-mcp/CLAUDE.md`

#### Changes Made:

**A. Added "Standalone Tools" Section** (lines 107-183)

Documented two standalone tools:

1. **Schema.org Tools CLI (`schema-tools.py`)** - NEW
   - Command-line interface for quick Schema.org vocabulary lookups
   - Three commands: search, type, properties
   - Text and JSON output formats
   - Use cases and quick examples

2. **Schema Graph Builder (`schema-graph-builder.py`)** - Previously undocumented
   - Automates building unified entity graphs from JSON files
   - 6-step process from discovery to documentation
   - Real-world results from PersonalSite and Fisterra Dance projects
   - Output files and options reference

**B. Updated Quick Start Section** (lines 5-34)

Added standalone tool examples:
```bash
uv run python scripts/find_duplication.py /path/to/project --language python
uv run python schema-tools.py search "article"
python3 schema-graph-builder.py ~/path/to/schemas https://example.com
```

#### CLAUDE.md Final Structure (850+ lines):

```
1. Quick Start (35 lines)
2. Project Overview (43 lines)
3. MCP Client Configuration (28 lines)
4. Standalone Tools (77 lines) ⭐ NEW
5. Development Commands (108 lines)
6. Architecture (155 lines)
7. Development Notes (28 lines)
8. Real-World Usage Case Study (323 lines)
```

---

### 2. Schema.org Tools CLI Creation

**File Created**: `/Users/alyshialedlie/code/ast-grep-mcp/schema-tools.py` (executable)

#### Purpose

Provide quick command-line access to three essential Schema.org MCP tools without running the full MCP server.

#### Features

**Three Commands Implemented**:

1. **`search`** - Search for Schema.org types by keyword
   ```bash
   uv run python schema-tools.py search "article" --limit 5
   ```

2. **`type`** - Get detailed information about a specific type
   ```bash
   uv run python schema-tools.py type Person
   ```

3. **`properties`** - Get all properties available for a type
   ```bash
   uv run python schema-tools.py properties Organization --no-inherited
   ```

**Output Formats**:
- **Text** (default): Human-readable formatted output
- **JSON** (--json flag): Machine-readable for programmatic use

**Options**:
- `--limit N` - Limit search results (1-100, default: 10)
- `--no-inherited` - Exclude inherited properties
- `--json` - Output as JSON

#### Architecture

```python
class SchemaToolsCLI:
    - initialize() → Creates SchemaOrgClient instance
    - search_schemas(query, limit) → List[Dict]
    - get_schema_type(type_name) → Dict
    - get_type_properties(type_name, include_inherited) → List[Dict]

Formatting Functions:
    - format_search_results() → Human-readable search output
    - format_type_info() → Human-readable type details
    - format_properties() → Human-readable property list

async main():
    - Argument parsing with argparse
    - Subcommand routing (search, type, properties)
    - Error handling and output formatting
```

#### Implementation Details

- **Imports SchemaOrgClient from main.py** - Uses same client as MCP server
- **Async/await pattern** - Consistent with MCP server implementation
- **Comprehensive help system** - Full argparse with examples
- **Error handling** - Validates input, provides clear error messages
- **Executable** - chmod +x, shebang line for direct execution

#### Testing Results

All three commands verified working:

```bash
✅ uv run python schema-tools.py search "article" --limit 3
   → Found TechArticle, BackgroundNewsArticle, ScholarlyArticle

✅ uv run python schema-tools.py type Person
   → Returned description, URL, parent types

✅ uv run python schema-tools.py properties Person --no-inherited
   → Listed 67 direct properties

✅ uv run python schema-tools.py search "organization" --limit 2 --json
   → Valid JSON array of results
```

---

### 3. Schema Tools Documentation

**File Created**: `/Users/alyshialedlie/code/ast-grep-mcp/SCHEMA-TOOLS-README.md`

#### Structure (350+ lines)

1. **Overview** - Purpose and available commands
2. **Installation** - Dependencies and setup
3. **Quick Start** - Basic usage examples
4. **Command Reference** - Detailed documentation for each command
   - search: Usage, arguments, options, examples, output format
   - type: Usage, arguments, options, examples, output format
   - properties: Usage, arguments, options, examples, output format
5. **Common Use Cases** - Practical scenarios with examples
6. **Output Formats** - Text vs JSON comparison
7. **Examples** - Step-by-step workflows
8. **Integration with MCP Server** - How CLI relates to full server
9. **Troubleshooting** - Common issues and solutions
10. **Related Tools** - Links to other project tools
11. **Quick Reference** - Command syntax cheat sheet

#### Key Sections

**Command Reference**:
- Complete syntax for each command
- All available options explained
- Multiple usage examples
- Output format demonstrations

**Common Use Cases**:
- Exploring Schema types (finding relevant types)
- Understanding type structure (learning before implementing)
- Planning structured data (discovering properties)
- Programmatic integration (JSON output for scripts)

**Troubleshooting**:
- Import errors (must use `uv run`)
- Type not found (check spelling, use search first)
- Network errors (first run needs internet)

---

## Technical Details

### Files Created/Modified Summary

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `CLAUDE.md` | Modified | ~850 | Enhanced with standalone tools documentation |
| `schema-tools.py` | Created | 279 | CLI tool for Schema.org vocabulary |
| `SCHEMA-TOOLS-README.md` | Created | ~350 | Comprehensive tool documentation |

### Code Metrics

**schema-tools.py**:
- 279 lines of Python code
- 3 main methods (search, type, properties)
- 3 formatting functions
- Async/await architecture
- Full argparse integration
- Comprehensive error handling

### Testing Approach

1. **Help System Verification**
   - Tested `--help` for main command
   - Tested `--help` for each subcommand
   - Verified examples in help output

2. **Functional Testing**
   - Search command with limit parameter
   - Type command for Person schema
   - Properties command with --no-inherited flag
   - JSON output mode for all commands

3. **Error Handling**
   - Import error (correct working directory)
   - Type not found error (invalid type name)
   - Network connectivity (Schema.org fetch)

---

## Use Cases and Benefits

### For Developers

**Quick Lookups During Development**:
```bash
uv run python schema-tools.py properties Person

uv run python schema-tools.py type TechArticle
```

**Exploring Schema.org Vocabulary**:
```bash
uv run python schema-tools.py search "article" --limit 10

uv run python schema-tools.py search "event"
```

**Planning Structured Data Implementation**:
```bash
uv run python schema-tools.py search "organization"

uv run python schema-tools.py type Organization

uv run python schema-tools.py properties Organization
```

### For Scripts and Automation

**Export Type Information**:
```bash
uv run python schema-tools.py properties Person --json > person-props.json

uv run python schema-tools.py search "article" --json | jq '.[] | .name'
```

**Documentation Generation**:
```bash
for type in Person Organization Article; do
  uv run python schema-tools.py type $type --json >> types-reference.json
done
```

---

## Integration with Existing Tools

### Relationship to MCP Server

```
┌─────────────────────────────────────────┐
│         ast-grep-mcp MCP Server         │
│                                         │
│  13 Tools:                              │
│  - 5 Code Search (ast-grep)             │
│  - 8 Schema.org Tools                   │
│                                         │
│  Uses: SchemaOrgClient                  │
└─────────────────────────────────────────┘
                    │
                    │ shares same client
                    ▼
┌─────────────────────────────────────────┐
│        schema-tools.py (CLI)            │
│                                         │
│  3 Commands:                            │
│  - search (from search_schemas)         │
│  - type (from get_schema_type)          │
│  - properties (from get_type_properties)│
│                                         │
│  Uses: Same SchemaOrgClient             │
└─────────────────────────────────────────┘
```

**Benefits**:
- ✅ **Consistency**: Same data source and behavior
- ✅ **Reliability**: Tested Schema.org vocabulary access
- ✅ **Performance**: Shared caching and optimization
- ✅ **Quick Access**: No need to run full MCP server

### Standalone Tools Ecosystem

```
ast-grep-mcp/
├── main.py                          # MCP server (13 tools)
├── schema-tools.py                  # CLI for 3 Schema.org tools ⭐ NEW
├── schema-graph-builder.py          # Entity graph builder
└── scripts/
    └── find_duplication.py          # Code duplication detection
```

---

## Documentation Quality Improvements

### Before This Session

**CLAUDE.md**:
- ✅ Comprehensive architecture documentation
- ✅ Real-world PersonalSite case study
- ❌ Missing schema-graph-builder.py documentation
- ❌ No quick reference for standalone tools

**Available Tools**:
- ✅ MCP server with 13 tools
- ✅ schema-graph-builder.py (undocumented)
- ✅ find_duplication.py script
- ❌ No quick CLI for Schema.org queries

### After This Session

**CLAUDE.md**:
- ✅ Complete documentation (850+ lines)
- ✅ Standalone Tools section with both tools
- ✅ Quick Start with all tool examples
- ✅ Architecture, performance, real-world usage

**Available Tools**:
- ✅ MCP server with 13 tools
- ✅ schema-graph-builder.py (fully documented)
- ✅ schema-tools.py (NEW - quick CLI access)
- ✅ find_duplication.py script

**New Documentation**:
- ✅ SCHEMA-TOOLS-README.md (350+ lines)
- ✅ Comprehensive command reference
- ✅ Use cases and examples
- ✅ Troubleshooting guide

---

## Key Learnings and Patterns

### 1. CLI Tool Design Pattern

**Successful Pattern**:
```python
class ToolCLI:
    def __init__(self):
        self.client = None

    async def initialize(self):
        if self.client is None:
            self.client = ActualClient()
            await self.client.initialize()

    async def command_wrapper(self, *args):
        await self.initialize()
        return await self.client.actual_method(*args)
```

**Benefits**:
- Lazy initialization (only when needed)
- Shared client instance
- Consistent error handling
- Easy testing

### 2. Output Format Strategy

**Text vs JSON**:
- **Text**: Human-readable, formatted with sections and indentation
- **JSON**: Machine-readable, preserves full data structure
- **Implementation**: Format after retrieval, single data source

**User Experience**:
```bash
uv run python schema-tools.py type Person

# Automation (machine)
uv run python schema-tools.py type Person --json | jq
```

### 3. Documentation Layering

**Three-Level Approach**:

1. **Quick Start** (CLAUDE.md) - Get started in seconds
   ```bash
   uv run python schema-tools.py search "article"
   ```

2. **Section Documentation** (CLAUDE.md) - Understand what it does
   - Purpose, commands, options, use cases

3. **Full Reference** (SCHEMA-TOOLS-README.md) - Complete guide
   - Command reference, examples, troubleshooting, integration

---

## Metrics and Statistics

### Development Time

- CLAUDE.md review and updates: ~10 minutes
- schema-tools.py development: ~30 minutes
- Testing and debugging: ~15 minutes
- SCHEMA-TOOLS-README.md creation: ~20 minutes
- **Total**: ~75 minutes

### Code Statistics

**Lines of Code**:
- schema-tools.py: 279 lines
- SCHEMA-TOOLS-README.md: ~350 lines
- CLAUDE.md additions: ~80 lines
- **Total new content**: ~710 lines

**Test Coverage**:
- ✅ All 3 commands functional
- ✅ All output formats tested
- ✅ All options verified
- ✅ Error handling confirmed

---

## Future Enhancements

### Potential Improvements for schema-tools.py

1. **Caching Layer**
   - Cache Schema.org vocabulary locally
   - Faster startup after first run
   - Offline mode support

2. **Additional Commands**
   - `hierarchy` - Show type hierarchy tree
   - `example` - Generate example JSON-LD
   - `validate` - Validate JSON-LD against schema

3. **Output Formats**
   - YAML output option
   - CSV for properties table
   - Markdown for documentation

4. **Interactive Mode**
   - REPL-style interface
   - Tab completion for type names
   - History and favorites

### Documentation Enhancements

1. **Video Tutorials**
   - Quick demo of each command
   - Common workflow examples
   - Integration patterns

2. **Cheat Sheet**
   - One-page quick reference
   - Common queries and patterns
   - Keyboard shortcuts

3. **API Documentation**
   - Auto-generated from docstrings
   - Usage examples in docs
   - Integration guides

---

## Related Work

### PersonalSite Schema Enhancement Project

This session builds on the PersonalSite Schema Enhancement Project documented in CLAUDE.md:

**Original Project** (documented in CLAUDE.md lines 489-811):
- Phase 1: Unified Knowledge Graph (11 files → 1)
- Phase 2: Enhanced Blog Post Schemas (3 new types)
- Phase 3: Documentation & Validation (8 guides)
- **Tools Used**: search_schemas, get_type_properties, generate_entity_id, validate_entity_id, build_entity_graph

**This Session's Contribution**:
- Makes those same tools available via CLI
- Enables quick lookups without running MCP server
- Provides foundation for future schema projects
- Documents the schema-graph-builder.py tool that resulted from that project

### ast-grep-mcp Evolution

```
Timeline:
1. MCP server created (13 tools)
2. PersonalSite Schema Enhancement (real-world usage)
3. schema-graph-builder.py created (automation)
4. This session: schema-tools.py (quick access) ⭐
```

**Pattern**: Real-world usage → Automation → Quick access tools

---

## Conclusion

### Achievements

✅ **Enhanced Documentation**
- CLAUDE.md now complete with all standalone tools
- Quick Start section includes all tool examples
- Clear navigation and organization

✅ **Created CLI Tool**
- schema-tools.py provides quick Schema.org access
- Three essential commands working correctly
- Text and JSON output formats
- Comprehensive error handling

✅ **Comprehensive Documentation**
- SCHEMA-TOOLS-README.md covers all use cases
- Command reference with examples
- Troubleshooting and integration guides

✅ **Improved Developer Experience**
- Quick lookups without running MCP server
- Easy exploration of Schema.org vocabulary
- Better onboarding for future developers

### Impact

**For Current Developers**:
- Faster Schema.org queries during development
- Easy reference for planning implementations
- Scriptable tool for automation

**For Future Developers**:
- Clear documentation in CLAUDE.md
- Examples and use cases in README
- Well-tested, working tool

**For the Project**:
- Complete documentation ecosystem
- All tools documented and accessible
- Strong foundation for future enhancements

---

## Session Statistics

**Files Created**: 2
- schema-tools.py (279 lines, executable)
- SCHEMA-TOOLS-README.md (350+ lines)

**Files Modified**: 1
- CLAUDE.md (850+ lines total)

**Lines Added**: ~710 total
- Code: 279 lines
- Documentation: ~430 lines

**Commands Tested**: 9
- 3 commands × 2 formats (text/JSON) + 3 help commands

**Test Results**: 100% passing
- ✅ search command
- ✅ type command
- ✅ properties command
- ✅ JSON output mode
- ✅ All options working

---

## Appendix: Command Examples

### schema-tools.py Usage Examples

```bash
uv run python schema-tools.py search "article"
uv run python schema-tools.py search "organization" --limit 5
uv run python schema-tools.py search "event" --json

# Get type information
uv run python schema-tools.py type Person
uv run python schema-tools.py type BlogPosting
uv run python schema-tools.py type Organization --json

uv run python schema-tools.py properties Person
uv run python schema-tools.py properties Article --no-inherited
uv run python schema-tools.py properties Organization --json

# Help
uv run python schema-tools.py --help
uv run python schema-tools.py search --help
```

### Integration Examples

```bash
# Export properties for documentation
uv run python schema-tools.py properties Person --json > person-properties.json

uv run python schema-tools.py search "article" --json | jq '.[] | .name'

# Batch processing
for type in Person Organization Article; do
  uv run python schema-tools.py type $type --json
done > schema-types.json
```

---

**Report Generated**: November 16, 2025
**Session Duration**: ~75 minutes
**Status**: ✅ Complete
**Next Steps**: Consider future enhancements listed above
