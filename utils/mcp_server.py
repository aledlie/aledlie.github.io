from typing import Any
import subprocess
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("git_commit_charts")

@mcp.tool()
async def generate_hour_bar_chart() -> str:
    """Generate a bar chart of commits by hour of day."""
    try:
        # Get repository name
        repo_name = subprocess.check_output(["./get_repo_name.sh"], text=True).split(": ")[1].strip()
        subprocess.run(["./commits_by_hour.sh"], check=True)
        subprocess.run(["/opt/homebrew/bin/python3", "plot_bar_graph.py", f"--output=commits_by_hour_{repo_name}.png", f"--title=Git Commits by Hour of Day for {repo_name}"], check=True)
        return f"Hour bar chart generated at commits_by_hour_{repo_name}.png"
    except Exception as e:
        return f"Error generating hour bar chart: {str(e)}"

@mcp.tool()
async def generate_day_pie_chart() -> str:
    """Generate a pie chart of commits by day of week."""
    try:
        repo_name = subprocess.check_output(["./get_repo_name.sh"], text=True).split(": ")[1].strip()
        subprocess.run(["./commits_by_day_of_week.sh"], check=True)
        subprocess.run(["/opt/homebrew/bin/python3", "plot_pie_day.py", f"--output=commits_by_day_{repo_name}.png", f"--title=Commits by Day of Week for {repo_name}"], check=True)
        return f"Day pie chart generated at commits_by_day_{repo_name}.png"
    except Exception as e:
        return f"Error generating day pie chart: {str(e)}"

@mcp.tool()
async def generate_month_pie_chart() -> str:
    """Generate a pie chart of commits by month."""
    try:
        repo_name = subprocess.check_output(["./get_repo_name.sh"], text=True).split(": ")[1].strip()
        subprocess.run(["./commits_by_month.sh"], check=True)
        subprocess.run(["/opt/homebrew/bin/python3", "plot_pie_month.py", f"--output=commits_by_month_{repo_name}.png", f"--title=Commits by Month for {repo_name}"], check=True)
        return f"Month pie chart generated at commits_by_month_{repo_name}.png"
    except Exception as e:
        return f"Error generating month pie chart: {str(e)}"

if __name__ == "__main__":
    mcp.run()