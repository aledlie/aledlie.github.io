#!/bin/bash

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Error: Not inside a git repository"
    exit 1
fi

# Get the remote URL for 'origin'
remote_url=$(git remote get-url origin 2>/dev/null)
if [ -z "$remote_url" ]; then
    echo "Error: No remote 'origin' configured"
    exit 1
fi

# Extract the repository name from the remote URL
# Handles HTTPS[](https://github.com/username/repo.git) and SSH (git@github.com:username/repo.git)
repo_name=$(echo "$remote_url" | sed -E 's#.*/([^/]+)(\.git)?$#\1#')

if [ -z "$repo_name" ]; then
    echo "Error: Could not parse repository name from $remote_url"
    exit 1
fi

# Output the repository name
echo "Repository name: $repo_name"