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

def plot_commits_by_hour(input_file='commit_counts.txt', output_file='images/commits_by_hour.png', title='Git Commits by Hour of Day'):
    """
    Generate a bar graph of commit counts by hour from a file and save it as a PNG.

    Args:
        input_file (str): Path to the input file with hour and count data (default: 'commit_counts.txt').
        output_file (str): Path to save the output PNG (default: 'commits_by_hour.png').
        title (str): Title of the plot (default: 'Git Commits by Hour of Day').
    """
    # Read the input file
    try:
        with open(input_file, 'r') as file:
            lines = file.readlines()
    except FileNotFoundError:
        logger.error("File not found: %s", input_file)
        return

    # Parse hours and counts, aggregating duplicates
    hour_counts = {}
    for line in lines:
        try:
            parts = line.strip().split()
            if len(parts) != 2:
                logger.warning("Skipping malformed line: %s", line.strip())
                continue
            hour, count = parts
            hour_int = int(hour)
            if not (HOUR_INDEX_MIN <= hour_int <= HOUR_INDEX_MAX):
                logger.warning("Skipping invalid hour %s in line: %s", hour, line.strip())
                continue
            count = int(count)
            hour_counts[hour_int] = hour_counts.get(hour_int, 0) + count
        except (ValueError, IndexError):
            logger.warning("Skipping malformed line: %s", line.strip())
            continue

    # Ensure all 24 hours are present
    all_hours = [f"{h:02d}" for h in range(HOURS_IN_DAY)]
    all_counts = [hour_counts.get(h, 0) for h in range(HOURS_IN_DAY)]

    # Create bar graph
    plt.figure(figsize=(FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT))
    plt.bar(all_hours, all_counts, color='#4e79a7', edgecolor='#2e4977', linewidth=1)
    plt.xlabel('Hour of Day (0-23)')
    plt.ylabel('Number of Commits')
    plt.title(title)
    plt.grid(True, axis='y', linestyle='--', alpha=GRID_ALPHA)
    plt.tight_layout()

    # Save as PNG
    plt.savefig(output_file, dpi=SAVE_DPI_HIGH, bbox_inches='tight')
    plt.close()

    logger.info("Bar graph saved as %s", output_file)

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
