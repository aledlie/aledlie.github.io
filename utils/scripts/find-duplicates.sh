#!/bin/bash
# Find duplicate code in the PersonalSite repository using ast-grep MCP

set -e

# Default values
PROJECT_FOLDER="/Users/alyshialedlie/code/PersonalSite"
LANGUAGE=""
CONSTRUCT_TYPE="function_definition"
MIN_SIMILARITY=0.8
MIN_LINES=5
MAX_CONSTRUCTS=1000
EXCLUDE_PATTERNS='["node_modules", "vendor", "_site", ".jekyll-cache", "SumedhSite"]'

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help text
show_help() {
    cat << EOF
Usage: ${0##*/} [OPTIONS]

Find duplicate code in the PersonalSite repository using ast-grep.

OPTIONS:
    -l, --language LANG        Language to scan (javascript, scss, html, ruby)
                               Required unless using preset
    -p, --preset PRESET        Use predefined scan preset:
                               - js: Scan JavaScript files
                               - scss: Scan SCSS files
                               - all: Scan all languages sequentially
    -t, --type TYPE           Construct type to check:
                               - function_definition (default)
                               - class_definition
                               - method_definition
    -s, --similarity FLOAT    Minimum similarity (0.0-1.0, default: 0.8)
    -m, --min-lines INT       Minimum lines to consider (default: 5)
    -c, --max-constructs INT  Maximum constructs to analyze (default: 1000)
    -h, --help                Show this help message

EXAMPLES:
    # Scan JavaScript for duplicate functions
    ${0##*/} --preset js

    # Scan SCSS with custom similarity threshold
    ${0##*/} --language scss --similarity 0.9

    # Scan all languages
    ${0##*/} --preset all

    # Find duplicate classes in JavaScript
    ${0##*/} --language javascript --type class_definition

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -l|--language)
            LANGUAGE="$2"
            shift 2
            ;;
        -p|--preset)
            PRESET="$2"
            shift 2
            ;;
        -t|--type)
            CONSTRUCT_TYPE="$2"
            shift 2
            ;;
        -s|--similarity)
            MIN_SIMILARITY="$2"
            shift 2
            ;;
        -m|--min-lines)
            MIN_LINES="$2"
            shift 2
            ;;
        -c|--max-constructs)
            MAX_CONSTRUCTS="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Function to run duplication check
run_duplication_check() {
    local lang=$1
    local construct=$2

    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Scanning ${lang} code for duplicate ${construct}s${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo -e "Parameters:"
    echo -e "  - Similarity threshold: ${YELLOW}${MIN_SIMILARITY}${NC}"
    echo -e "  - Minimum lines: ${YELLOW}${MIN_LINES}${NC}"
    echo -e "  - Max constructs: ${YELLOW}${MAX_CONSTRUCTS}${NC}"
    echo -e ""

    # Note: This is a placeholder - in actual use, you would call the MCP tool here
    # through Claude Code. The MCP tool can only be invoked through Claude Code's
    # function calling mechanism, not directly from bash.

    echo -e "${YELLOW}⚠️  This script should be run through Claude Code${NC}"
    echo -e "${YELLOW}To use this tool, ask Claude Code to:${NC}"
    echo -e "${YELLOW}\"Run mcp__ast-grep__find_duplication for ${lang} with similarity ${MIN_SIMILARITY}\"${NC}\n"

    # Display the MCP call that would be made
    cat << EOF
${BLUE}MCP Tool Call Configuration:${NC}
{
  "project_folder": "${PROJECT_FOLDER}",
  "language": "${lang}",
  "construct_type": "${construct}",
  "min_similarity": ${MIN_SIMILARITY},
  "min_lines": ${MIN_LINES},
  "max_constructs": ${MAX_CONSTRUCTS},
  "exclude_patterns": ${EXCLUDE_PATTERNS}
}

EOF
}

# Handle presets
if [[ -n "$PRESET" ]]; then
    case $PRESET in
        js|javascript)
            run_duplication_check "javascript" "$CONSTRUCT_TYPE"
            ;;
        scss|css)
            echo -e "${YELLOW}Note: SCSS duplication detection has limited support${NC}"
            run_duplication_check "css" "$CONSTRUCT_TYPE"
            ;;
        all)
            run_duplication_check "javascript" "$CONSTRUCT_TYPE"
            sleep 1
            run_duplication_check "css" "$CONSTRUCT_TYPE"
            ;;
        *)
            echo -e "${RED}Error: Unknown preset: $PRESET${NC}"
            echo -e "Valid presets: js, scss, all"
            exit 1
            ;;
    esac
elif [[ -n "$LANGUAGE" ]]; then
    run_duplication_check "$LANGUAGE" "$CONSTRUCT_TYPE"
else
    echo -e "${RED}Error: Either --language or --preset is required${NC}"
    show_help
    exit 1
fi

echo -e "\n${GREEN}✓ Duplication scan configuration complete${NC}\n"
