from plot_pie_day_month import plot_pie_day_month
from repo_utils import get_repo_name

if __name__ == '__main__':
    # Get the repository name
    repo_name = get_repo_name()
    if repo_name is None:
        repo_name = "Repository"  # Fallback name

    # Customize plot title and output file
    title = f"Commits by Day of Week and Month for {repo_name}"
    output_file = f"images/commits_by_day_month_{repo_name}.png"

    # Generate the plot
    plot_pie_day_month(day_file='commit_counts_day.txt', month_file='commit_counts_month.txt', output_file=output_file, title=title)