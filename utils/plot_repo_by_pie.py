import subprocess
from plot_pie_day_month import plot_pie_day_month

def get_repo_name():
    """
    Run get_repo_name.sh to get the current GitHub repository name.
    Returns the repository name or None if an error occurs.
    """
    try:
        result = subprocess.check_output(["./get_repo_name.sh"], text=True)
        # Extract repo name from "Repository name: <name>"
        repo_name = result.split(": ")[1].strip()
        return repo_name
    except (subprocess.CalledProcessError, IndexError):
        print("Error: Could not get repository name from get_repo_name.sh")
        return None

if __name__ == '__main__':
    # Get the repository name
    repo_name = get_repo_name()
    if repo_name is None:
        repo_name = "Repository"  # Fallback name

    # Customize plot title and output file
    title = f"Commits by Day of Week and Month for {repo_name}"
    output_file = f"commits_by_day_month_{repo_name}.png"

    # Generate the plot
    plot_pie_day_month(day_file='commit_counts_day.txt', month_file='commit_counts_month.txt', output_file=output_file, title=title)