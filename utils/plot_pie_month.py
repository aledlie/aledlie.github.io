import matplotlib.pyplot as plt

def plot_pie_month(input_file='commit_counts_month.txt', output_file='commits_by_month.png', title='Commits by Month'):
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
    month_counts = [0] * 12
    for line in lines:
        try:
            parts = line.strip().split()
            if len(parts) != 2:
                continue
            month = int(parts[0])
            count = int(parts[1])
            if 1 <= month <= 12:
                month_counts[month - 1] = count
        except ValueError:
            continue

    # Labels
    month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    # Create pie chart
    plt.figure(figsize=(6, 6))
    plt.pie(month_counts, labels=month_labels, autopct='%1.1f%%', startangle=90)
    plt.title(title)

    # Save as PNG
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Pie chart for month saved as {output_file}")