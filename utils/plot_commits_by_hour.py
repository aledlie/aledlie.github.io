import argparse
import logging
import matplotlib.pyplot as plt
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import (
    HOURS_IN_DAY, HOUR_INDEX_MIN, HOUR_INDEX_MAX,
    FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT, SAVE_DPI_HIGH, GRID_ALPHA
)


def _parse_hour_line(line: str) -> tuple[int, int] | None:
    """Parse a single line of hour count data.

    Returns:
        Tuple of (hour, count) if valid, None otherwise.
    """
    parts = line.strip().split()
    if len(parts) != 2:
        logger.warning("Skipping malformed line: %s", line.strip())
        return None
    hour_str, count_str = parts
    hour = int(hour_str)
    if not (HOUR_INDEX_MIN <= hour <= HOUR_INDEX_MAX):
        logger.warning("Skipping invalid hour %s in line: %s", hour_str, line.strip())
        return None
    return hour, int(count_str)


def _parse_hour_counts(lines: list[str]) -> dict[int, int]:
    """Parse lines into hour counts, aggregating duplicates."""
    hour_counts: dict[int, int] = {}
    for line in lines:
        try:
            result = _parse_hour_line(line)
            if result:
                hour, count = result
                hour_counts[hour] = hour_counts.get(hour, 0) + count
        except (ValueError, IndexError):
            logger.warning("Skipping malformed line: %s", line.strip())
    return hour_counts


def _create_hour_bar_graph(hour_counts: dict[int, int], title: str, output_file: str) -> None:
    """Create and save the bar graph."""
    all_hours = [f"{h:02d}" for h in range(HOURS_IN_DAY)]
    all_counts = [hour_counts.get(h, 0) for h in range(HOURS_IN_DAY)]

    plt.figure(figsize=(FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT))
    plt.bar(all_hours, all_counts, color='#4e79a7', edgecolor='#2e4977', linewidth=1)
    plt.xlabel('Hour of Day (0-23)')
    plt.ylabel('Number of Commits')
    plt.title(title)
    plt.grid(True, axis='y', linestyle='--', alpha=GRID_ALPHA)
    plt.tight_layout()
    plt.savefig(output_file, dpi=SAVE_DPI_HIGH, bbox_inches='tight')
    plt.close()
    logger.info("Bar graph saved as %s", output_file)


def plot_commits_by_hour(
    input_file: str = 'commit_counts.txt',
    output_file: str = 'images/commits_by_hour.png',
    title: str = 'Git Commits by Hour of Day'
) -> None:
    """Generate a bar graph of commit counts by hour from a file and save it as a PNG.

    Args:
        input_file: Path to the input file with hour and count data.
        output_file: Path to save the output PNG.
        title: Title of the plot.
    """
    try:
        with open(input_file, 'r') as file:
            lines = file.readlines()
    except FileNotFoundError:
        logger.error("File not found: %s", input_file)
        return

    hour_counts = _parse_hour_counts(lines)
    _create_hour_bar_graph(hour_counts, title, output_file)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate bar graph of commits by hour')
    parser.add_argument('--input', default='commit_counts.txt',
                        help='Input file with hour and count data (default: commit_counts.txt)')
    parser.add_argument('--output', default='images/commits_by_hour.png',
                        help='Output PNG file (default: images/commits_by_hour.png)')
    parser.add_argument('--title', default='Git Commits by Hour of Day',
                        help='Chart title (default: Git Commits by Hour of Day)')

    args = parser.parse_args()
    plot_commits_by_hour(input_file=args.input, output_file=args.output, title=args.title)
