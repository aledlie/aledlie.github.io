"""Plot commits by day of week - DRY refactored."""
import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import DAYS_IN_WEEK, DAY_INDEX_MIN, DAY_INDEX_MAX, FIGURE_SIZE_SQUARE
from plot_utils import read_count_file, create_pie_chart, save_chart

DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


def plot_pie_day(
    input_file: str = 'commit_counts_day.txt',
    output_file: str = 'images/commits_by_day.png',
    title: str = 'Commits by Day of Week'
) -> None:
    """Generate a pie chart of commit counts by day of week."""
    try:
        day_counts = read_count_file(
            input_file, DAYS_IN_WEEK, DAY_INDEX_MIN, DAY_INDEX_MAX
        )
    except FileNotFoundError:
        logger.error("File not found: %s", input_file)
        return

    create_pie_chart(
        day_counts, DAY_LABELS, title, (FIGURE_SIZE_SQUARE, FIGURE_SIZE_SQUARE)
    )
    save_chart(output_file)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate pie chart of commits by day of week')
    parser.add_argument('--input', default='commit_counts_day.txt',
                        help='Input file with day and count data')
    parser.add_argument('--output', default='images/commits_by_day.png',
                        help='Output PNG file')
    parser.add_argument('--title', default='Commits by Day of Week',
                        help='Chart title')

    args = parser.parse_args()
    plot_pie_day(input_file=args.input, output_file=args.output, title=args.title)
