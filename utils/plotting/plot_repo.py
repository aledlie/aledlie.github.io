"""Generate repository-specific charts with customized titles and filenames.

Wrapper script that creates charts with repository name in title and output
filename based on the current git repository name.
"""
import argparse
import sys
from pathlib import Path

# Add analysis directory to path for repo_utils
sys.path.insert(0, str(Path(__file__).parent.parent / 'analysis'))

from plot_commits_by_hour import plot_commits_by_hour
from plot_pie_day_month import plot_pie_day_month
from repo_utils import get_repo_name


def main():
    """Parse arguments and generate repository-specific chart."""
    parser = argparse.ArgumentParser(
        description='Generate repository-specific commit visualization charts'
    )
    parser.add_argument(
        '--chart-type', '-t',
        choices=['hour', 'pie'],
        default='hour',
        help='Chart type: "hour" for bar chart by hour, "pie" for day/month pie charts'
    )
    args = parser.parse_args()

    repo_name = get_repo_name() or "Repository"

    if args.chart_type == 'hour':
        plot_commits_by_hour(
            input_file='commit_counts.txt',
            output_file=f'images/commits_by_hour_{repo_name}.png',
            title=f'Git Commits by Hour of Day for {repo_name}'
        )
    else:  # pie
        plot_pie_day_month(
            day_file='commit_counts_day.txt',
            month_file='commit_counts_month.txt',
            output_file=f'images/commits_by_day_month_{repo_name}.png',
            title=f'Commits by Day of Week and Month for {repo_name}'
        )


if __name__ == '__main__':
    main()
