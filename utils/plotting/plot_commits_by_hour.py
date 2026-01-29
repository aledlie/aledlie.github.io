"""Plot commits by hour of day - DRY refactored."""
import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import HOURS_IN_DAY, HOUR_INDEX_MIN, HOUR_INDEX_MAX, FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT
from plot_utils import read_count_file, create_bar_chart, save_chart


def plot_commits_by_hour(
    input_file: str = 'commit_counts.txt',
    output_file: str = 'images/commits_by_hour.png',
    title: str = 'Git Commits by Hour of Day'
) -> None:
    """Generate a bar graph of commit counts by hour.

    Args:
        input_file: Path to the input file with hour and count data.
        output_file: Path to save the output PNG.
        title: Title of the plot.
    """
    try:
        hour_counts = read_count_file(
            input_file, HOURS_IN_DAY, HOUR_INDEX_MIN, HOUR_INDEX_MAX
        )
    except FileNotFoundError:
        logger.error("File not found: %s", input_file)
        return

    hours = [f"{h:02d}" for h in range(HOURS_IN_DAY)]
    create_bar_chart(
        hours, hour_counts,
        xlabel='Hour of Day (0-23)',
        ylabel='Number of Commits',
        title=title,
        figsize=(FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT)
    )
    save_chart(output_file)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate bar graph of commits by hour')
    parser.add_argument('--input', default='commit_counts.txt',
                        help='Input file with hour and count data')
    parser.add_argument('--output', default='images/commits_by_hour.png',
                        help='Output PNG file')
    parser.add_argument('--title', default='Git Commits by Hour of Day',
                        help='Chart title')

    args = parser.parse_args()
    plot_commits_by_hour(input_file=args.input, output_file=args.output, title=args.title)
