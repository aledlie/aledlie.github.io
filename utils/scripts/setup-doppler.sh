#!/bin/bash
# Doppler Secrets Management Setup Script
# Run this script to configure Doppler for The Parlor project

set -e

echo "=== Doppler Setup for The Parlor ==="
echo ""

# Step 1: Login to Doppler
echo "Step 1: Logging into Doppler..."
echo "This will open your browser for authentication."
doppler login

# Step 2: Create or select project
echo ""
echo "Step 2: Setting up Doppler project..."
read -p "Enter Doppler project name (default: personal-site): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-personal-site}

# Check if project exists
if doppler projects get $PROJECT_NAME &>/dev/null; then
    echo "Project '$PROJECT_NAME' already exists. Using existing project."
else
    echo "Creating new project '$PROJECT_NAME'..."
    doppler projects create $PROJECT_NAME
fi

# Step 3: Setup project locally
echo ""
echo "Step 3: Configuring local project..."
doppler setup --project $PROJECT_NAME --config dev

# Step 4: Add secrets
echo ""
echo "Step 4: Adding secrets..."

# Google Tag Manager ID
echo "Adding Google Tag Manager ID..."
doppler secrets set GOOGLE_TAG_MANAGER_ID="GTM-TK5J8L38" --project $PROJECT_NAME --config dev

# Google Site Verification
echo "Adding Google Site Verification..."
doppler secrets set GOOGLE_SITE_VERIFICATION="N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM" --project $PROJECT_NAME --config dev

# Site URL
echo "Adding Site URL..."
doppler secrets set SITE_URL="https://www.aledlie.com" --project $PROJECT_NAME --config dev

# GitHub Repository
echo "Adding GitHub repository..."
doppler secrets set GITHUB_REPOSITORY="aledlie/aledlie.github.io" --project $PROJECT_NAME --config dev

# Step 5: Create production config
echo ""
echo "Step 5: Creating production config..."
doppler configs create prd --project $PROJECT_NAME

# Copy secrets to production
echo "Copying secrets to production..."
doppler secrets set GOOGLE_TAG_MANAGER_ID="GTM-TK5J8L38" --project $PROJECT_NAME --config prd
doppler secrets set GOOGLE_SITE_VERIFICATION="N0i0YZ1-gQvtOicfKEGXEBAcJUyN7gwv0vmVj0lkkbM" --project $PROJECT_NAME --config prd
doppler secrets set SITE_URL="https://www.aledlie.com" --project $PROJECT_NAME --config prd
doppler secrets set GITHUB_REPOSITORY="aledlie/aledlie.github.io" --project $PROJECT_NAME --config prd

echo ""
echo "✓ Doppler setup complete!"
echo ""
echo "Next steps:"
echo "1. Add .doppler.yaml to .gitignore (if not already there)"
echo "2. Update _config.yml to use Doppler secrets"
echo "3. Run Jekyll with: doppler run -- bundle exec jekyll serve"
echo ""
echo "To view secrets: doppler secrets"
echo "To run commands with secrets: doppler run -- <command>"
