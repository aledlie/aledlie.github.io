import matplotlib.pyplot as plt
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / 'config'))
from constants import (
    MONTHS_IN_YEAR, MONTH_INDEX_MIN, MONTH_INDEX_MAX,
    FIGURE_SIZE_SQUARE, PIE_START_ANGLE, SAVE_DPI_HIGH
)

def plot_pie_month(input_file='commit_counts_month.txt', output_file='images/commits_by_month.png', title='Commits by Month'):
    """
    Generate a pie chart of commit counts by month from a file and save it as a PNG.
    """
    # Read the input file
    try:
        with open(input_file, 'r') as file:
            lines = file.readlines()
    except FileNotFoundError:
        print(f"Error: {input_file} not found")
        return

    # Parse month counts
    month_counts = [0] * MONTHS_IN_YEAR
    for line in lines:
        try:
            parts = line.strip().split()
            if len(parts) != 2:
                continue
            month = int(parts[0])
            count = int(parts[1])
            if MONTH_INDEX_MIN <= month <= MONTH_INDEX_MAX:
                month_counts[month - 1] = count
        except ValueError:
            continue

    # Labels
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    # Create pie chart
    plt.figure(figsize=(FIGURE_SIZE_SQUARE, FIGURE_SIZE_SQUARE))
    plt.pie(month_counts, labels=month_labels, autopct='%1.1f%%', startangle=PIE_START_ANGLE)
    plt.title(title)

    # Save as PNG
    plt.savefig(output_file, dpi=SAVE_DPI_HIGH, bbox_inches='tight')
    plt.close()

    print(f"Pie chart for month saved as {output_file}")
