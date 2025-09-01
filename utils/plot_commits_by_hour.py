import matplotlib.pyplot as plt

def plot_commits_by_hour(input_file='commit_counts.txt', output_file='commits_by_hour.png', title='Git Commits by Hour of Day'):
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
        print(f"Error: {input_file} not found")
        return

    # Parse hours and counts, aggregating duplicates
    hour_counts = {}
    for line in lines:
        try:
            parts = line.strip().split()
            if len(parts) != 2:
                print(f"Warning: Skipping malformed line: {line.strip()}")
                continue
            hour, count = parts
            hour_int = int(hour)
            if not (0 <= hour_int <= 23):
                print(f"Warning: Skipping invalid hour {hour} in line: {line.strip()}")
                continue
            count = int(count)
            hour_counts[hour_int] = hour_counts.get(hour_int, 0) + count
        except (ValueError, IndexError):
            print(f"Warning: Skipping malformed line: {line.strip()}")
            continue

    # Ensure all 24 hours are present
    all_hours = [f"{h:02d}" for h in range(24)]
    all_counts = [hour_counts.get(h, 0) for h in range(24)]

    # Create bar graph
    plt.figure(figsize=(10, 6))
    plt.bar(all_hours, all_counts, color='#4e79a7', edgecolor='#2e4977', linewidth=1)
    plt.xlabel('Hour of Day (0-23)')
    plt.ylabel('Number of Commits')
    plt.title(title)
    plt.grid(True, axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()

    # Save as PNG
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"Bar graph saved as {output_file}")

if __name__ == '__main__':
    # Default behavior when run directly
    plot_commits_by_hour()