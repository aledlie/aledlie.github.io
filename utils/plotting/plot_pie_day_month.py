"""Plot commits by day and month combined - DRY refactored."""
import logging
import sys
from pathlib import Path

import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import (
    DAYS_IN_WEEK, DAY_INDEX_MIN, DAY_INDEX_MAX,
    MONTHS_IN_YEAR, MONTH_INDEX_MIN, MONTH_INDEX_MAX,
    FIGURE_WIDTH_LARGE, FIGURE_HEIGHT, PIE_START_ANGLE
)
from plot_utils import read_count_file, save_chart

DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def plot_pie_day_month(
    day_file: str = 'commit_counts_day.txt',
    month_file: str = 'commit_counts_month.txt',
    output_file: str = 'images/commits_by_day_month.png',
    title: str = 'Commits by Day of Week and Month'
) -> None:
    """Generate two pie charts: commits by day and by month."""
    try:
        day_counts = read_count_file(
            day_file, DAYS_IN_WEEK, DAY_INDEX_MIN, DAY_INDEX_MAX
        )
    except FileNotFoundError:
        logger.error("File not found: %s", day_file)
        return

    try:
        month_counts = read_count_file(
            month_file, MONTHS_IN_YEAR, MONTH_INDEX_MIN, MONTH_INDEX_MAX, index_offset=1
        )
    except FileNotFoundError:
        logger.error("File not found: %s", month_file)
        return

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(FIGURE_WIDTH_LARGE, FIGURE_HEIGHT))
    fig.suptitle(title)

    ax1.pie(day_counts, labels=DAY_LABELS, autopct='%1.1f%%', startangle=PIE_START_ANGLE)
    ax1.set_title('Commits by Day of Week')

    ax2.pie(month_counts, labels=MONTH_LABELS, autopct='%1.1f%%', startangle=PIE_START_ANGLE)
    ax2.set_title('Commits by Month')

    save_chart(output_file)


if __name__ == '__main__':
    plot_pie_day_month()
