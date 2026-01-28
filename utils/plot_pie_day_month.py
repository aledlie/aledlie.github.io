import matplotlib.pyplot as plt

# Chart configuration constants
DAYS_IN_WEEK = 7
DAY_INDEX_MIN = 0
DAY_INDEX_MAX = 6
MONTHS_IN_YEAR = 12
MONTH_INDEX_MIN = 1
MONTH_INDEX_MAX = 12
FIGURE_WIDTH = 12
FIGURE_HEIGHT = 6
PIE_START_ANGLE = 90
SAVE_DPI = 300

def plot_pie_day_month(day_file='commit_counts_day.txt', month_file='commit_counts_month.txt', output_file='images/commits_by_day_month.png', title='Commits by Day of Week and Month'):
    """
    Generate two pie charts: one for commits by day of week and one for commits by month, and save them in a single PNG.

    Args:
        day_file (str): Path to the day counts file (default: 'commit_counts_day.txt').
        month_file (str): Path to the month counts file (default: 'commit_counts_month.txt').
        output_file (str): Path to save the output PNG (default: 'commits_by_day_month.png').
        title (str): Main title of the plot (default: 'Commits by Day of Week and Month').
    """
    # Read day file (0: Sun, 1: Mon, ..., 6: Sat)
    day_counts = [0] * DAYS_IN_WEEK
    try:
        with open(day_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 2:
                    day = int(parts[0])
                    count = int(parts[1])
                    if DAY_INDEX_MIN <= day <= DAY_INDEX_MAX:
                        day_counts[day] = count
    except FileNotFoundError:
        print(f"Error: {day_file} not found")
        return

    # Read month file (1: Jan, 2: Feb, ..., 12: Dec)
    month_counts = [0] * MONTHS_IN_YEAR
    try:
        with open(month_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 2:
                    month = int(parts[0])
                    count = int(parts[1])
                    if MONTH_INDEX_MIN <= month <= MONTH_INDEX_MAX:
                        month_counts[month - 1] = count
    except FileNotFoundError:
        print(f"Error: {month_file} not found")
        return

    # Labels
    day_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(FIGURE_WIDTH, FIGURE_HEIGHT))
    fig.suptitle(title)

    # Pie for day of week
    ax1.pie(day_counts, labels=day_labels, autopct='%1.1f%%', startangle=PIE_START_ANGLE)
    ax1.set_title('Commits by Day of Week')

    # Pie for month
    ax2.pie(month_counts, labels=month_labels, autopct='%1.1f%%', startangle=PIE_START_ANGLE)
    ax2.set_title('Commits by Month')

    # Save
    plt.savefig(output_file, dpi=SAVE_DPI, bbox_inches='tight')
    plt.close()

    print(f"Pie charts saved as {output_file}")

if __name__ == '__main__':
    # Default behavior when run directly
    plot_pie_day_month()