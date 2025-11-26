import matplotlib.pyplot as plt

def plot_pie_day_month(day_file='commit_counts_day.txt', month_file='commit_counts_month.txt', output_file='commits_by_day_month.png', title='Commits by Day of Week and Month'):
    """
    Generate two pie charts: one for commits by day of week and one for commits by month, and save them in a single PNG.

    Args:
        day_file (str): Path to the day counts file (default: 'commit_counts_day.txt').
        month_file (str): Path to the month counts file (default: 'commit_counts_month.txt').
        output_file (str): Path to save the output PNG (default: 'commits_by_day_month.png').
        title (str): Main title of the plot (default: 'Commits by Day of Week and Month').
    """
    # Read day file (0: Sun, 1: Mon, ..., 6: Sat)
    day_counts = [0] * 7
    try:
        with open(day_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 2:
                    day = int(parts[0])
                    count = int(parts[1])
                    if 0 <= day <= 6:
                        day_counts[day] = count
    except FileNotFoundError:
        print(f"Error: {day_file} not found")
        return

    # Read month file (1: Jan, 2: Feb, ..., 12: Dec)
    month_counts = [0] * 12
    try:
        with open(month_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 2:
                    month = int(parts[0])
                    count = int(parts[1])
                    if 1 <= month <= 12:
                        month_counts[month - 1] = count
    except FileNotFoundError:
        print(f"Error: {month_file} not found")
        return

    # Labels
    day_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
    fig.suptitle(title)

    # Pie for day of week
    ax1.pie(day_counts, labels=day_labels, autopct='%1.1f%%', startangle=90)
    ax1.set_title('Commits by Day of Week')

    # Pie for month
    ax2.pie(month_counts, labels=month_labels, autopct='%1.1f%%', startangle=90)
    ax2.set_title('Commits by Month')

    # Save
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Pie charts saved as {output_file}")

if __name__ == '__main__':
    # Default behavior when run directly
    plot_pie_day_month()