import matplotlib.pyplot as plt

from constants import (
    DAYS_IN_WEEK, DAY_INDEX_MIN, DAY_INDEX_MAX,
    FIGURE_SIZE_SQUARE, PIE_START_ANGLE, SAVE_DPI_HIGH
)

def plot_pie_day(input_file='commit_counts_day.txt', output_file='images/commits_by_day.png', title='Commits by Day of Week'):
    """
    Generate a pie chart of commit counts by day of week from a file and save it as a PNG.
    """
    # Read the input file
    try:
        with open(input_file, 'r') as file:
            lines = file.readlines()
    except FileNotFoundError:
        print(f"Error: {input_file} not found")
        return

    # Parse day counts
    day_counts = [0] * DAYS_IN_WEEK
    for line in lines:
        try:
            parts = line.strip().split()
            if len(parts) != 2:
                continue
            day = int(parts[0])
            count = int(parts[1])
            if DAY_INDEX_MIN <= day <= DAY_INDEX_MAX:
                day_counts[day] = count
        except ValueError:
            continue

    # Labels
    day_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    # Create pie chart
    plt.figure(figsize=(FIGURE_SIZE_SQUARE, FIGURE_SIZE_SQUARE))
    plt.pie(day_counts, labels=day_labels, autopct='%1.1f%%', startangle=PIE_START_ANGLE)
    plt.title(title)

    # Save as PNG
    plt.savefig(output_file, dpi=SAVE_DPI_HIGH, bbox_inches='tight')
    plt.close()

    print(f"Pie chart for day saved as {output_file}")
