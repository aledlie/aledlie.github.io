#!/usr/bin/env python3

import matplotlib.pyplot as plt
import re
import argparse

from constants import FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT, SAVE_DPI_HIGH, XLABEL_ROTATION

def parse_results(file_path):
    """Parse the results file to extract commit count categories and days."""
    categories = []
    days = []
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
            for line in lines:
                # Match lines like "Commits 1-5: 10 days"
                match = re.match(r'Commits (\d+)-(\d+): (\d+) days', line.strip())
                if match:
                    start, end, count = match.groups()
                    categories.append(f"{start}-{end}")
                    days.append(int(count))
        if not categories:
            print("No commit distribution data found in the file.")
            return None, None
        return categories, days
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None, None
    except Exception as e:
        print(f"Error parsing file: {e}")
        return None, None

def plot_bar_chart(categories, days, output_file):
    """Create a bar chart of commit count distribution."""
    plt.figure(figsize=(FIGURE_WIDTH_STANDARD, FIGURE_HEIGHT))
    plt.bar(categories, days, color='skyblue', edgecolor='black')
    plt.xlabel('Commits per Day')
    plt.ylabel('Number of Days')
    plt.title('Distribution of Daily Commit Counts')
    plt.xticks(rotation=XLABEL_ROTATION, ha='right')
    plt.tight_layout()
    plt.savefig(output_file, dpi=SAVE_DPI_HIGH)
    plt.close()
    print(f"Bar chart saved as '{output_file}'")

def main():
    # Parse command-line arguments
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
