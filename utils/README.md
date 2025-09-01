# Git Commit Visualization Utilities

A comprehensive toolkit for analyzing and visualizing Git commit patterns through interactive charts and graphs. This project provides both standalone scripts and an MCP (Model Context Protocol) server for generating commit activity visualizations by hour, day of week, and month.

## Features

- **Commit Analysis by Time Patterns**
  - Hourly commit distribution (bar charts)
  - Day of week commit patterns (pie charts)
  - Monthly commit activity (pie charts)
  - Combined day/month visualizations

- **Multiple Output Formats**
  - High-resolution PNG charts (300 DPI)
  - Repository-specific file naming
  - Customizable titles and styling

- **MCP Server Integration**
  - Expose chart generation as MCP tools
  - Programmatic access to visualization functions
  - Integration with AI assistants and automation tools

- **Utility Scripts**
  - Git log extraction and parsing
  - Repository name detection
  - Case conversion utilities (kebab-case ↔ snake_case)

## Project Structure

```
utils/
├── README.md                    # This file
├── LICENSE.md                   # MIT License
├── pyproject.toml              # Python project configuration
├── mcp_server.py               # MCP server implementation
│
├── Data Collection Scripts/
│   ├── commit_history.sh       # Extract git log to logs.txt
│   ├── commits_by_hour.sh      # Parse commits by hour (0-23)
│   ├── commits_by_day.sh       # Parse commits by day of week (0-6)
│   ├── commits_by_month.sh     # Parse commits by month (1-12)
│   └── get_repo_name.sh        # Extract repository name from git remote
│
├── Visualization Scripts/
│   ├── plot_commits_by_hour.py # Generate hourly bar charts
│   ├── plot_bar_graph.py       # Generic bar chart generator
│   ├── plot_pie_day.py         # Day of week pie charts
│   ├── plot_pie_month.py       # Monthly pie charts
│   ├── plot_pie_day_month.py   # Combined day/month charts
│   ├── plot_repo_by_hour.py    # Repository-specific hourly charts
│   └── plot_repo_by_pie.py     # Repository-specific pie charts
│
├── Utility Scripts/
│   ├── convert_kebab_to_snake.sh # Convert kebab-case to snake_case
│   └── convert_snake_to_kebab.sh # Convert snake_case to kebab-case
│
├── Generated Data/
│   ├── logs.txt                # Git log output
│   ├── commit_counts.txt       # Hourly commit counts
│   ├── commit_counts_day.txt   # Daily commit counts
│   ├── commit_counts_month.txt # Monthly commit counts
│   └── *.png                   # Generated chart images
│
└── Python Environment/
    ├── .venv/                  # Virtual environment
    └── __pycache__/           # Python bytecode cache
```

## Installation

### Prerequisites
- Python 3.13+
- Git repository (for commit analysis)
- Bash shell (for data collection scripts)

### Setup
1. Clone or download this utilities directory
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   # or
   .venv\Scripts\activate     # On Windows
   ```

3. Install dependencies:
   ```bash
   pip install matplotlib numpy mcp[cli]
   ```

## Usage

### Quick Start
1. **Generate git log data:**
   ```bash
   ./commit_history.sh
   ```

2. **Create hourly commit visualization:**
   ```bash
   ./commits_by_hour.sh
   python plot_commits_by_hour.py
   ```

3. **Create day/month visualizations:**
   ```bash
   ./commits_by_day.sh
   ./commits_by_month.sh
   python plot_pie_day_month.py
   ```

### Individual Chart Generation

**Hourly Bar Chart:**
```bash
./commits_by_hour.sh
python plot_commits_by_hour.py
# Generates: commits_by_hour.png
```

**Day of Week Pie Chart:**
```bash
./commits_by_day.sh
python plot_pie_day.py
# Generates: commits_by_day.png
```

**Monthly Pie Chart:**
```bash
./commits_by_month.sh
python plot_pie_month.py
# Generates: commits_by_month.png
```

**Combined Day/Month Charts:**
```bash
./commits_by_day.sh
./commits_by_month.sh
python plot_pie_day_month.py
# Generates: commits_by_day_month.png
```

### Repository-Specific Charts
For charts with repository names in titles and filenames:
```bash
python plot_repo_by_hour.py    # Creates commits_by_hour_<repo_name>.png
python plot_repo_by_pie.py     # Creates commits_by_day_month_<repo_name>.png
```

### MCP Server
Run the MCP server to expose chart generation as tools:
```bash
python mcp_server.py
```

Available MCP tools:
- `generate_hour_bar_chart()` - Create hourly bar chart
- `generate_day_pie_chart()` - Create day of week pie chart  
- `generate_month_pie_chart()` - Create monthly pie chart

## Data Format

### Input Data
- **logs.txt**: Raw git log output with commit dates
- **commit_counts.txt**: Hour (00-23) and count pairs
- **commit_counts_day.txt**: Day (0-6, Sun-Sat) and count pairs
- **commit_counts_month.txt**: Month (1-12, Jan-Dec) and count pairs

### Output Charts
- **Bar Charts**: Hourly commit distribution with grid lines
- **Pie Charts**: Percentage-based circular visualizations
- **Combined Charts**: Side-by-side day/month comparisons
- **High Resolution**: 300 DPI PNG format for print quality

## Customization

### Chart Styling
- Colors: Professional blue palette (#4e79a7, #2e4977)
- Fonts: System default with clear readability
- Grid: Subtle dotted lines for bar charts
- Layout: Tight bounding boxes for clean output

### File Naming
Charts automatically include repository names when using repo-specific scripts:
- `commits_by_hour_myproject.png`
- `commits_by_day_month_myproject.png`

## Dependencies

### Python Packages
- **matplotlib**: Chart generation and visualization
- **numpy**: Numerical computations (matplotlib dependency)
- **mcp[cli]**: Model Context Protocol server framework

### System Requirements
- **Git**: Repository analysis and log extraction
- **Bash**: Shell script execution
- **sed/awk**: Text processing in shell scripts

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## Author

**Alyshia Ledlie**
- Email: alyshialedlie@example.com
- Project: Personal Site Utilities

## Contributing

This is a utility collection for personal site development. Feel free to adapt and modify for your own projects.

## Troubleshooting

### Common Issues

**"logs.txt not found"**
- Run `./commit_history.sh` first to generate git log data

**"Not inside a git repository"**
- Ensure you're running scripts from within a git repository
- Check that `.git` directory exists

**"No remote 'origin' configured"**
- Add a git remote: `git remote add origin <url>`
- Or modify `get_repo_name.sh` for different remote names

**Permission denied on shell scripts**
- Make scripts executable: `chmod +x *.sh`

**Python import errors**
- Activate virtual environment: `source .venv/bin/activate`
- Install dependencies: `pip install matplotlib numpy mcp[cli]`

### Chart Quality
- Charts are generated at 300 DPI for high quality
- Use `bbox_inches='tight'` for clean borders
- Matplotlib backend may affect output on different systems
