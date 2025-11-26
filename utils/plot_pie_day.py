import matplotlib.pyplot as plt

def plot_pie_day(input_file='commit_counts_day.txt', output_file='commits_by_day.png', title='Commits by Day of Week'):
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
    day_counts = [0] * 7
    for line in lines:
        try:
            parts = line.strip().split()
            if len(parts) != 2:
                continue
            day = int(parts[0])
            count = int(parts[1])
            if 0 <= day <= 6:
                day_counts[day] = count
        except ValueError:
            continue

    # Labels
    day_labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    # Create pie chart
    plt.figure(figsize=(6, 6))
    plt.pie(day_counts, labels=day_labels, autopct='%1.1f%%', startangle=90)
    plt.title(title)

    # Save as PNG
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Pie chart for day saved as {output_file}")