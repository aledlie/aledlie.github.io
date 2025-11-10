"""Shared utility functions for repository operations."""
import subprocess


def get_repo_name() -> str | None:
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
