"""
Wrapper for plot_commits_by_hour - maintained for backward compatibility.

This module provides the plot_bar_graph function which delegates to
plot_commits_by_hour. Both functions are functionally identical.
"""
from plot_commits_by_hour import plot_commits_by_hour


# Alias for backward compatibility
plot_bar_graph = plot_commits_by_hour


if __name__ == '__main__':
    # When run as a script, delegate to plot_commits_by_hour
    # Import and execute its argument parsing
    import argparse

    parser = argparse.ArgumentParser(description='Generate bar graph of commits by hour')
    parser.add_argument('--input', default='commit_counts.txt',
                        help='Input file with hour and count data (default: commit_counts.txt)')
    parser.add_argument('--output', default='images/commits_by_hour.png',
                        help='Output PNG file (default: images/commits_by_hour.png)')
    parser.add_argument('--title', default='Git Commits by Hour of Day',
                        help='Chart title (default: Git Commits by Hour of Day)')

    args = parser.parse_args()
    plot_bar_graph(input_file=args.input, output_file=args.output, title=args.title)
