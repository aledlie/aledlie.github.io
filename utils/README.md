# utils

Utility scripts for the PersonalSite repository.

## Directory Structure

```
utils/
├── analysis/       # Git commit analysis scripts
├── scripts/        # Build, migration, and cleanup scripts
├── plotting/       # Python visualization scripts
├── mcp_server.py   # MCP server for utilities
└── pyproject.toml  # Python project configuration
```

## Subdirectories

### analysis/
Git repository analysis scripts for commit patterns and statistics.
- `average_commits.sh` - Calculate average commits per time period
- `commit_distribution.sh` - Analyze commit distribution patterns
- `commits_by_*.sh` - Commits by hour, day, month, day of week
- `repo_utils.py` - Shared Python utilities for repo analysis

### scripts/
Build tooling, migration scripts, and repository maintenance.
- `cleanup-repository.sh` - Repository cleanup utilities
- `find-duplicates.sh` - Detect duplicate code using ast-grep
- `measure-baseline-metrics.sh` - Performance baseline measurement
- `migrate-scss-functions.sh` - SCSS migration utilities
- `setup-doppler.sh` - Doppler secrets setup
- `convert_*.sh` - Naming convention converters

### plotting/
Python scripts for generating visualizations.
- `plot_repo.py` - Main entry point for repo charts
- `plot_avg_commits.py` - Average commits bar charts
- `plot_commits_by_hour.py` - Hourly commit distribution
- `plot_pie_*.py` - Pie charts for commit distribution
- `plot_utils.py` - Shared plotting utilities
- `generate_wordcloud.py` - Word cloud generation

## Usage

```bash
# Run plotting scripts
cd utils/plotting
python plot_repo.py --chart-type hour

# Run analysis scripts
cd utils/analysis
./commits_by_hour.sh

# Run build utilities
cd utils/scripts
./find-duplicates.sh --preset all
```

## Documentation

- `CLEANUP-SCRIPT-DOCUMENTATION.md` - Cleanup script details
- `DUPLICATION-FINDER.md` - Duplication detection guide
