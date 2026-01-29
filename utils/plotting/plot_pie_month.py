"""Plot commits by month - DRY refactored."""
import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import MONTHS_IN_YEAR, MONTH_INDEX_MIN, MONTH_INDEX_MAX, FIGURE_SIZE_SQUARE
from plot_utils import read_count_file, create_pie_chart, save_chart

MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def plot_pie_month(
    input_file: str = 'commit_counts_month.txt',
    output_file: str = 'images/commits_by_month.png',
    title: str = 'Commits by Month'
) -> None:
    """Generate a pie chart of commit counts by month."""
    try:
        month_counts = read_count_file(
            input_file, MONTHS_IN_YEAR, MONTH_INDEX_MIN, MONTH_INDEX_MAX, index_offset=1
        )
    except FileNotFoundError:
        logger.error("File not found: %s", input_file)
        return

    create_pie_chart(
        month_counts, MONTH_LABELS, title, (FIGURE_SIZE_SQUARE, FIGURE_SIZE_SQUARE)
    )
    save_chart(output_file)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate pie chart of commits by month')
    parser.add_argument('--input', default='commit_counts_month.txt',
                        help='Input file with month and count data')
    parser.add_argument('--output', default='images/commits_by_month.png',
                        help='Output PNG file')
    parser.add_argument('--title', default='Commits by Month',
                        help='Chart title')

    args = parser.parse_args()
    plot_pie_month(input_file=args.input, output_file=args.output, title=args.title)
