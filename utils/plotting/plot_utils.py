"""Shared plotting utilities - DRY refactored from individual plot modules."""
import logging
import sys
from pathlib import Path

import matplotlib.pyplot as plt

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'config'))

logger = logging.getLogger(__name__)
from constants import PIE_START_ANGLE, SAVE_DPI_HIGH, GRID_ALPHA


def _parse_count_line(line: str) -> tuple[int, int] | None:
    """Parse a single count line into (index, count).

    Returns:
        Tuple of (index, count) if valid, None otherwise.
    """
    parts = line.strip().split()
    if len(parts) != 2:
        return None
    try:
        return int(parts[0]), int(parts[1])
    except ValueError:
        return None


def read_count_file(
    filepath: str,
    count_size: int,
    index_min: int,
    index_max: int,
    index_offset: int = 0
) -> list[int]:
    """Read a count file and return parsed counts array.

    Args:
        filepath: Path to the count file
        count_size: Size of the counts array to return
        index_min: Minimum valid index value
        index_max: Maximum valid index value
        index_offset: Offset to subtract from index (e.g., 1 for 1-indexed months)

    Returns:
        List of counts indexed by (value - index_offset)

    Raises:
        FileNotFoundError: If the file doesn't exist
    """
    counts = [0] * count_size
    with open(filepath, 'r') as f:
        for line in f:
            result = _parse_count_line(line)
            if result and index_min <= result[0] <= index_max:
                index, count = result
                counts[index - index_offset] = count
    return counts


def save_chart(output_file: str, dpi: int = SAVE_DPI_HIGH) -> None:
    """Save the current matplotlib figure and close it.

    Args:
        output_file: Path to save the figure
        dpi: Resolution for saved image
    """
    plt.savefig(output_file, dpi=dpi, bbox_inches='tight')
    plt.close()
    logger.info("Chart saved as %s", output_file)


def create_pie_chart(
    counts: list[int],
    labels: list[str],
    title: str,
    figsize: tuple[float, float],
    start_angle: int = PIE_START_ANGLE
) -> plt.Axes:
    """Create a pie chart with the given data.

    Args:
        counts: Data values for pie slices
        labels: Labels for each slice
        title: Chart title
        figsize: Figure size (width, height)
        start_angle: Starting angle for first slice

    Returns:
        The matplotlib Axes object
    """
    fig, ax = plt.subplots(figsize=figsize)
    ax.pie(counts, labels=labels, autopct='%1.1f%%', startangle=start_angle)
    ax.set_title(title)
    return ax


def create_bar_chart(
    x_values: list,
    y_values: list[int],
    xlabel: str,
    ylabel: str,
    title: str,
    figsize: tuple[float, float],
    color: str = '#4e79a7',
    edgecolor: str = '#2e4977',
    show_grid: bool = True
) -> plt.Axes:
    """Create a bar chart with the given data.

    Args:
        x_values: X-axis values/labels
        y_values: Y-axis values (bar heights)
        xlabel: X-axis label
        ylabel: Y-axis label
        title: Chart title
        figsize: Figure size (width, height)
        color: Bar fill color
        edgecolor: Bar edge color
        show_grid: Whether to show horizontal grid lines

    Returns:
        The matplotlib Axes object
    """
    fig, ax = plt.subplots(figsize=figsize)
    ax.bar(x_values, y_values, color=color, edgecolor=edgecolor, linewidth=1)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.set_title(title)
    if show_grid:
        ax.grid(True, axis='y', linestyle='--', alpha=GRID_ALPHA)
    plt.tight_layout()
    return ax
