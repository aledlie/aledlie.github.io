import matplotlib.pyplot as plt

# Chart configuration constants
MONTHS_IN_YEAR = 12
MONTH_INDEX_MIN = 1
MONTH_INDEX_MAX = 12
FIGURE_SIZE = 6
PIE_START_ANGLE = 90
SAVE_DPI = 300

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
    plt.figure(figsize=(FIGURE_SIZE, FIGURE_SIZE))
    plt.pie(month_counts, labels=month_labels, autopct='%1.1f%%', startangle=PIE_START_ANGLE)
    plt.title(title)

    # Save as PNG
    plt.savefig(output_file, dpi=SAVE_DPI, bbox_inches='tight')
    plt.close()

    print(f"Pie chart for month saved as {output_file}")