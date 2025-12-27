---
layout: post
title: "Claude Code Plugin Fix Session"
date: 2025-12-27
categories: [claude-code, maintenance]
tags: [plugins, troubleshooting, configuration]
---

# Claude Code Plugin Fix Session

**Date:** 2025-12-27
**Duration:** Extended session (continued from previous context)

## Summary

Fixed 83 broken Claude Code plugins across 11 marketplaces. The plugins had incorrect cache paths pointing to non-existent directories, preventing them from loading properly.

## Problem

Plugins in `~/.claude/plugins/installed_plugins.json` had install paths pointing to:
- `/unknown` version directories that didn't exist
- Incorrect version identifiers (e.g., `22356299237c` instead of `1.0.0`)
- Missing `.claude-plugin/marketplace.json` files in cache directories

## Root Cause

The plugin installation system was creating cache entries with placeholder version strings (`unknown`) instead of copying the actual plugin content from marketplace directories.

## Solution

For each broken plugin:
1. Copied the full marketplace directory to the plugin's cache location
2. Updated `installed_plugins.json` with correct paths and version numbers
3. Fixed plugin name mismatches (e.g., `compounding-engineering` → `compound-engineering`)

## Plugins Fixed by Marketplace

| Marketplace | Count | Examples |
|-------------|-------|----------|
| claude-code-marketplace | 22 | refractor, ui-designer, sugar, lyra |
| claude-code-plugins-plus | 18 | devops-automation-pack, api-test-automation |
| awesome-claude-skills | 14 | file-organizer, canvas-design, mcp-builder |
| claude-code-templates | 5 | testing-suite, devops-automation, git-workflow |
| fradser-dotagent | 5 | git, utils, github, review, swiftui |
| claude-code-plugins | 5 | agent-sdk-dev, feature-dev, ralph-wiggum |
| claude-plugins-official | 4 | commit-commands, greptile, feature-dev |
| anthropic-agent-skills | 2 | document-skills, scientific-skills |
| claude-scientific-skills | 1 | scientific-skills (128 sub-skills) |
| every-marketplace | 1 | compound-engineering |
| superpowers-marketplace | 1 | elements-of-style |
| chrome-devtools-plugins | 1 | chrome-devtools-mcp |

**Total: 83 plugins fixed**

## Technical Details

### Key Files Modified

- `~/.claude/plugins/installed_plugins.json` - Updated all plugin paths
- `~/.claude/config/settings.json` - Fixed plugin name typo

### Fix Script Pattern

```python
# For each broken plugin:
src = marketplace_base + "/" + marketplace
dst = cache_base + "/" + marketplace + "/" + plugin_name + "/1.0.0"

shutil.copytree(src, dst, symlinks=True)

# Update installed_plugins.json
data["plugins"][plugin_key][0]["installPath"] = dst
data["plugins"][plugin_key][0]["version"] = "1.0.0"
```

### Plugin Structure Types

1. **Root-level plugins** (source: `"./"`)
   - Entire marketplace directory copied to cache
   - Examples: claude-code-templates, anthropic-agent-skills

2. **Subdirectory plugins** (source: `"./dist/claude/plugins/git"`)
   - Marketplace root copied, plugin accessed via relative path
   - Examples: fradser-dotagent plugins

## Verification

Final validation confirmed all 83 plugins have:
- Valid `marketplace.json` files
- Correct plugin definitions matching plugin names
- Accessible cache directories

## Next Steps

1. **Restart Claude Code** to load the fixed plugins
2. **Test key plugins** to verify functionality:
   - `/git:commit` - Git workflow
   - `/sugar-run` - Sugar autonomous mode
   - Agent invocations for testing-suite, devops-automation

## Lessons Learned

1. Plugin cache paths must point to directories containing `.claude-plugin/marketplace.json`
2. Root-level plugins (with `source: "./"`) need the full marketplace directory copied
3. Plugin names in `installed_plugins.json` must exactly match names in `marketplace.json`
4. Always validate JSON structure after bulk edits

## Related Issues

This session also addressed:
- Chrome extension cleanup (removed 7 risky extensions)
- Chrome "Managed by your organization" message resolved
- Safari extension audit (no third-party extensions found)

---

*Session documented for future reference and troubleshooting.*
