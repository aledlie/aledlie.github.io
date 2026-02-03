---
layout: single
title: "ast-grep-mcp"
date: 2025-11-01
author_profile: true
excerpt: "Modular MCP server with ast-grep structural code search, Schema.org tools, refactoring, and documentation generation."
header:
  teaser: /assets/images/cover-work.png
toc: true
toc_sticky: true

# SoftwareApplication Schema
schema_type: SoftwareApplication
schema_app_name: "ast-grep-mcp"
schema_app_category: "DeveloperApplication"
schema_operating_system: "macOS, Linux, Windows"
schema_programming_language: "Python"
schema_app_version: "1.0.0"
schema_license: "MIT"
schema_offers:
  price: "0"
  priceCurrency: "USD"
schema_features:
  - "Structural code search with AST patterns"
  - "47 MCP tools across 9 categories"
  - "Schema.org knowledge graph tools"
  - "Code quality and complexity analysis"
  - "Automatic documentation generation"
  - "Cross-language refactoring support"
schema_requirements:
  - "Python 3.13+"
  - "ast-grep CLI"
  - "uv package manager"

tags:
  - mcp
  - ast-grep
  - python
  - code-search
  - schema-org
  - developer-tools
---

A modular MCP server providing structural code search, Schema.org tools, and code quality analysis through 47 tools organized across 9 feature categories.

## Overview

ast-grep-mcp is a Model Context Protocol (MCP) server that leverages ast-grep for structural code search and provides comprehensive tools for:

- **Code Search** - AST-based pattern matching across 9 search tools
- **Refactoring** - Automated code rewrite and transformation
- **Schema.org** - Knowledge graph generation and validation
- **Code Quality** - Complexity analysis and quality metrics
- **Documentation** - Automatic doc generation from code

## Installation

```bash
# Clone and install
cd ast-grep-mcp
uv sync

# Run tests
uv run pytest

# Start MCP server
uv run main.py
```

## Tool Categories

| Category | Tools | Description |
|----------|-------|-------------|
| Search | 9 | Structural code search with AST patterns |
| Rewrite | 3 | Code transformation and refactoring |
| Refactoring | 2 | Automated refactoring operations |
| Deduplication | 4 | Code duplication detection |
| Schema.org | 9 | Knowledge graph and entity tools |
| Complexity | 3 | Cyclomatic and cognitive complexity |
| Quality | 7 | Code quality metrics and analysis |
| Documentation | 5 | Documentation generation |
| Cross-Language | 5 | Multi-language support tools |

## Architecture

```
src/ast_grep_mcp/
├── core/           # Config, cache, executor, logging
├── models/         # Data models
├── utils/          # Templates, formatters, validation
├── features/       # Feature modules (search, rewrite, etc.)
└── server/         # MCP server registry
```

## Related Links

- [ast-grep Documentation](https://ast-grep.github.io/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
