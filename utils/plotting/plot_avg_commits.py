#!/usr/bin/env python3

import argparse
import logging
import re
import sys
from pathlib import Path

import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT, SAVE_DPI_HIGH, XLABEL_ROTATION

COMMIT_PATTERN = re.compile(r'Commits (\d+)-(\d+): (\d+) days')


def _parse_commit_line(line: str) -> tuple[str, int] | None:
    """Parse a single commit distribution line.

    Returns:
        Tuple of (category, count) if valid, None otherwise.
    """
    match = COMMIT_PATTERN.match(line.strip())
    if not match:
        return None
    start, end, count = match.groups()
    return f"{start}-{end}", int(count)


def _read_commit_data(file_path: str) -> tuple[list[str], list[int]]:
    """Read and parse commit data from file.

    Raises:
        FileNotFoundError: If file doesn't exist.
    """
    categories: list[str] = []
    days: list[int] = []
    with open(file_path, 'r') as file:
        for line in file:
            result = _parse_commit_line(line)
            if result:
                category, count = result
                categories.append(category)
                days.append(count)
    return categories, days


def parse_results(file_path: str) -> tuple[list[str] | None, list[int] | None]:
    """Parse the results file to extract commit count categories and days.

    Args:
        file_path: Path to the results file.

    Returns:
        Tuple of (categories, days) lists, or (None, None) on error.
    """
    try:
        categories, days = _read_commit_data(file_path)
    except FileNotFoundError:
        logger.error("File not found: %s", file_path)
        return None, None
    except Exception as e:
        logger.error("Error parsing file: %s", e)
        return None, None

    if not categories:
        logger.warning("No commit distribution data found in the file")
        return None, None
    return categories, days

def plot_bar_chart(categories: list[str], days: list[int], output_file: str) -> None:
    """Create a bar chart of commit count distribution.

    Args:
        categories: X-axis category labels (commit ranges).
        days: Y-axis values (number of days for each category).
        output_file: Path to save the output PNG.
    """
    plt.figure(figsize=(FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT))
    plt.bar(categories, days, color='skyblue', edgecolor='black')
    plt.xlabel('Commits per Day')
    plt.ylabel('Number of Days')
    plt.title('Distribution of Daily Commit Counts')
    plt.xticks(rotation=XLABEL_ROTATION, ha='right')
    plt.tight_layout()
    plt.savefig(output_file, dpi=SAVE_DPI_HIGH)
    plt.close()
    logger.info("Bar chart saved as %s", output_file)

def main():
    """Parse arguments and generate commit distribution bar chart."""
    parser = argparse.ArgumentParser(description='Plot commit distribution as a bar chart.')
    parser.add_argument('-i', '--input', default='average_commits.txt', help='Input file with commit data (default: results.txt)')
    parser.add_argument('-o', '--output', default='images/average_commits.png', help='Output file for the bar chart (default: images/average_commits.png)')
    args = parser.parse_args()

    # Parse the results file
    categories, days = parse_results(args.input)
    if categories and days:
        # Generate the bar chart
        plot_bar_chart(categories, days, args.output)

if __name__ == '__main__':
    main()
