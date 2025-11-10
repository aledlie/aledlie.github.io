from plot_commits_by_hour import plot_commits_by_hour
from repo_utils import get_repo_name

if __name__ == '__main__':
    # Get the repository name
    repo_name = get_repo_name()
    if repo_name is None:
        repo_name = "Repository"  # Fallback name

    # Customize plot title and output file
    title = f"Git Commits by Hour of Day for {repo_name}"
    output_file = f"commits_by_hour_{repo_name}.png"

    # Generate the plot
    plot_commits_by_hour(input_file='commit_counts.txt', output_file=output_file, title=title)