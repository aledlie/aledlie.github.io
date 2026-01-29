"""MCP server for generating git commit visualization charts.

Provides tools for generating bar and pie charts showing commit distributions
by hour, day of week, and month for the current git repository.
"""
import subprocess
from mcp.server.fastmcp import FastMCP
from repo_utils import get_repo_name

mcp = FastMCP("git_commit_charts")


def _generate_chart(
    chart_type: str,
    data_script: str,
    plot_script: str,
    title_template: str
) -> str:
    """
    Common helper for generating charts.

    Args:
        chart_type: Type of chart (e.g., "hour bar chart", "day pie chart")
        data_script: Shell script to collect data
        plot_script: Python script to generate the plot
        title_template: Title template with {repo_name} placeholder

    Returns:
        Success message with output file path or error message
    """
    try:
        repo_name = get_repo_name()
        if not repo_name:
            return "Error: Could not determine repository name"

        # Run data collection script
        subprocess.run([data_script], check=True)

        # Generate output filename and title
        output_file = f"{chart_type.replace(' ', '_')}_{repo_name}.png"
        title = title_template.format(repo_name=repo_name)

        # Run plotting script
        subprocess.run(
            ["/opt/homebrew/bin/python3", plot_script, f"--output={output_file}", f"--title={title}"],
            check=True
        )

        return f"{chart_type.capitalize()} generated at {output_file}"
    except Exception as e:
        return f"Error generating {chart_type}: {str(e)}"


@mcp.tool()
async def generate_hour_bar_chart() -> str:
    """Generate a bar chart of commits by hour of day.

    Returns:
        Success message with output file path or error message.
    """
    return _generate_chart(
        chart_type="commits_by_hour",
        data_script="./commits_by_hour.sh",
        plot_script="plot_commits_by_hour.py",
        title_template="Git Commits by Hour of Day for {repo_name}"
    )


@mcp.tool()
async def generate_day_pie_chart() -> str:
    """Generate a pie chart of commits by day of week.

    Returns:
        Success message with output file path or error message.
    """
    return _generate_chart(
        chart_type="commits_by_day",
        data_script="./commits_by_day_of_week.sh",
        plot_script="plot_pie_day.py",
        title_template="Commits by Day of Week for {repo_name}"
    )


@mcp.tool()
async def generate_month_pie_chart() -> str:
    """Generate a pie chart of commits by month.

    Returns:
        Success message with output file path or error message.
    """
    return _generate_chart(
        chart_type="commits_by_month",
        data_script="./commits_by_month.sh",
        plot_script="plot_pie_month.py",
        title_template="Commits by Month for {repo_name}"
    )

if __name__ == "__main__":
    mcp.run()