#!/bin/bash

################################################################################
# Repository Cleanup Script
#
# Purpose: Remove irrelevant files and directories based on data architecture
# Created: 2025-11-17
#
# This script performs the following cleanup tasks:
# 1. CRITICAL: Remove Python virtual environments (personal_site/, utils/numpy/)
# 2. CRITICAL: Remove .DS_Store files (macOS system files)
# 3. CRITICAL: Remove repomix-output.xml files (keep root only)
# 4. HIGH PRIORITY: Remove redundant content directories
#    - reports/ (duplicate of _reports/ collection)
#    - schemas-static/ (unused static JSON schemas)
#    - results/ (old schema analysis results)
#    - drafts/ (already in .gitignore)
#
# Estimated space savings: ~85MB+
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

# Get directory size in human readable format
get_size() {
    local path="$1"
    if [ -e "$path" ]; then
        du -sh "$path" 2>/dev/null | cut -f1
    else
        echo "N/A"
    fi
}

# Count files in directory
count_files() {
    local path="$1"
    if [ -d "$path" ]; then
        find "$path" -type f 2>/dev/null | wc -l | tr -d ' '
    else
        echo "0"
    fi
}

################################################################################
# Confirmation Prompt
################################################################################

confirm_cleanup() {
    print_header "Repository Cleanup - Confirmation Required"

    echo "This script will remove the following from your repository:"
    echo ""
    echo "CRITICAL CLEANUP:"
    echo "  1. Python virtual environments:"
    echo "     - personal_site/ ($(get_size "$REPO_ROOT/personal_site"))"
    echo "     - utils/numpy/ ($(get_size "$REPO_ROOT/utils/numpy"))"
    echo ""
    echo "  2. macOS system files:"
    echo "     - All .DS_Store files"
    echo ""
    echo "  3. Repomix output files:"
    echo "     - All repomix-output.xml files EXCEPT root"
    echo "     - Count: $(find "$REPO_ROOT" -name "repomix-output.xml" ! -path "$REPO_ROOT/repomix-output.xml" 2>/dev/null | wc -l | tr -d ' ') files"
    echo ""
    echo "HIGH PRIORITY CLEANUP:"
    echo "  4. Redundant content directories:"
    echo "     - reports/ ($(get_size "$REPO_ROOT/reports")) - duplicate of _reports/"
    echo "     - schemas-static/ ($(get_size "$REPO_ROOT/schemas-static"))"
    echo "     - results/ ($(get_size "$REPO_ROOT/results"))"
    echo "     - drafts/ ($(get_size "$REPO_ROOT/drafts"))"
    echo ""

    read -p "Do you want to proceed with cleanup? (yes/no): " response

    if [[ ! "$response" =~ ^[Yy][Ee][Ss]$ ]]; then
        print_warning "Cleanup cancelled by user"
        exit 0
    fi

    echo ""
}

################################################################################
# Cleanup Functions
################################################################################

cleanup_venvs() {
    print_header "Step 1: Removing Python Virtual Environments"

    local removed=0

    # Remove personal_site/ venv
    if [ -d "$REPO_ROOT/personal_site" ]; then
        local size=$(get_size "$REPO_ROOT/personal_site")
        print_info "Removing personal_site/ ($size)..."
        rm -rf "$REPO_ROOT/personal_site"
        print_success "Removed personal_site/"
        ((removed++))
    else
        print_info "personal_site/ not found (already removed)"
    fi

    # Remove utils/numpy/ venv
    if [ -d "$REPO_ROOT/utils/numpy" ]; then
        local size=$(get_size "$REPO_ROOT/utils/numpy")
        print_info "Removing utils/numpy/ ($size)..."
        rm -rf "$REPO_ROOT/utils/numpy"
        print_success "Removed utils/numpy/"
        ((removed++))
    else
        print_info "utils/numpy/ not found (already removed)"
    fi

    if [ $removed -eq 0 ]; then
        print_warning "No virtual environments found to remove"
    else
        print_success "Removed $removed virtual environment(s)"
    fi
}

cleanup_ds_store() {
    print_header "Step 2: Removing .DS_Store Files"

    # Find and count .DS_Store files
    local count=$(find "$REPO_ROOT" -name ".DS_Store" -type f 2>/dev/null | wc -l | tr -d ' ')

    if [ "$count" -eq 0 ]; then
        print_info "No .DS_Store files found"
        return
    fi

    print_info "Found $count .DS_Store file(s)"
    print_info "Removing all .DS_Store files..."

    find "$REPO_ROOT" -name ".DS_Store" -type f -delete

    print_success "Removed $count .DS_Store file(s)"
}

cleanup_repomix() {
    print_header "Step 3: Removing Repomix Output Files"

    # Count repomix files (excluding root)
    local count=$(find "$REPO_ROOT" -name "repomix-output.xml" ! -path "$REPO_ROOT/repomix-output.xml" -type f 2>/dev/null | wc -l | tr -d ' ')

    if [ "$count" -eq 0 ]; then
        print_info "No nested repomix-output.xml files found"
        return
    fi

    print_info "Found $count repomix-output.xml file(s) (excluding root)"
    print_info "Removing all except $REPO_ROOT/repomix-output.xml..."

    find "$REPO_ROOT" -name "repomix-output.xml" ! -path "$REPO_ROOT/repomix-output.xml" -type f -delete

    # Verify root file still exists
    if [ -f "$REPO_ROOT/repomix-output.xml" ]; then
        local size=$(get_size "$REPO_ROOT/repomix-output.xml")
        print_success "Removed $count repomix file(s), kept root file ($size)"
    else
        print_error "Warning: Root repomix-output.xml not found!"
    fi
}

cleanup_directories() {
    print_header "Step 4: Removing Redundant Content Directories"

    local dirs=(
        "reports:Duplicate of _reports/ collection"
        "schemas-static:Unused static JSON schemas"
        "results:Old schema analysis results"
        "drafts:Already in .gitignore"
    )

    local removed=0
    local total_size=0

    for dir_info in "${dirs[@]}"; do
        IFS=':' read -r dir_name description <<< "$dir_info"
        local full_path="$REPO_ROOT/$dir_name"

        if [ -d "$full_path" ]; then
            local size=$(get_size "$full_path")
            local file_count=$(count_files "$full_path")

            print_info "Removing $dir_name/ ($size, $file_count files) - $description"
            rm -rf "$full_path"
            print_success "Removed $dir_name/"
            ((removed++))
        else
            print_info "$dir_name/ not found (already removed)"
        fi
    done

    if [ $removed -eq 0 ]; then
        print_warning "No redundant directories found to remove"
    else
        print_success "Removed $removed redundant director(ies)"
    fi
}

################################################################################
# Summary and Verification
################################################################################

print_summary() {
    print_header "Cleanup Summary"

    # Get final repository size
    local final_size=$(get_size "$REPO_ROOT")

    echo "Cleanup completed successfully!"
    echo ""
    echo "Removed items:"
    echo "  ✓ Python virtual environments (personal_site/, utils/numpy/)"
    echo "  ✓ .DS_Store files"
    echo "  ✓ Nested repomix-output.xml files"
    echo "  ✓ Redundant content directories (reports/, schemas-static/, results/, drafts/)"
    echo ""
    echo "Repository size: $final_size"
    echo ""
    echo "Preserved items:"
    echo "  ✓ Core Jekyll architecture (_includes/, _layouts/, _sass/)"
    echo "  ✓ Collections (_posts/, _reports/, _work/, _projects/)"
    echo "  ✓ Configuration files (_config.yml, vercel.json, package.json)"
    echo "  ✓ Documentation (docs/)"
    echo "  ✓ Tests (tests/)"
    echo "  ✓ Utilities (utils/)"
    echo "  ✓ Root repomix-output.xml"
    echo ""
}

verify_architecture() {
    print_header "Verifying Repository Architecture"

    local critical_paths=(
        "_config.yml:Jekyll configuration"
        "_includes:Template components"
        "_layouts:Page templates"
        "_sass:SCSS partials"
        "_posts:Blog posts"
        "_reports:Reports collection"
        "_work:Work collection"
        "docs:Documentation"
        "tests:Test suite"
        "utils:Utility scripts"
        "assets:Assets directory"
        "vercel.json:Deployment config"
        "package.json:Node dependencies"
    )

    local all_present=true

    for path_info in "${critical_paths[@]}"; do
        IFS=':' read -r path description <<< "$path_info"
        local full_path="$REPO_ROOT/$path"

        if [ -e "$full_path" ]; then
            print_success "$description - Present"
        else
            print_error "$description - MISSING!"
            all_present=false
        fi
    done

    echo ""

    if [ "$all_present" = true ]; then
        print_success "All critical architecture components verified"
    else
        print_error "Some critical components are missing - review needed!"
        exit 1
    fi
}

recommend_gitignore_update() {
    print_header "Recommendations"

    echo "Consider updating .gitignore to prevent reintroduction of removed files:"
    echo ""
    echo "  # Python virtual environments"
    echo "  personal_site/"
    echo "  utils/numpy/"
    echo "  *.venv/"
    echo "  venv/"
    echo ""
    echo "  # Temporary/build artifacts (already present, verify)"
    echo "  .DS_Store"
    echo "  repomix-output.xml"
    echo "  drafts/"
    echo ""
    echo "Next steps:"
    echo "  1. Review changes: git status"
    echo "  2. Test build: RUBYOPT=\"-W0\" bundle exec jekyll build"
    echo "  3. Run tests: npm run test:all"
    echo "  4. Commit cleanup: git add -A && git commit -m \"Clean up repository...\""
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header "Repository Cleanup Script"

    # Change to repository root
    cd "$REPO_ROOT"

    # Confirm before proceeding
    confirm_cleanup

    # Execute cleanup tasks
    cleanup_venvs
    cleanup_ds_store
    cleanup_repomix
    cleanup_directories

    # Verify architecture integrity
    verify_architecture

    # Print summary
    print_summary

    # Print recommendations
    recommend_gitignore_update

    print_success "Cleanup script completed successfully!"
}

# Run main function
main "$@"
