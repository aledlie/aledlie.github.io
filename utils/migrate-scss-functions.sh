#!/bin/bash

# Script to migrate deprecated SCSS global functions to Sass module system
# Usage: ./migrate-scss-functions.sh [--dry-run]
# Example: ./migrate-scss-functions.sh --dry-run  # Preview changes without applying
#
# Note: Vendor directories are intentionally excluded. Third-party library files
# (Susy, Magnific Popup, etc.) contain deprecated functions that cannot be updated
# without modifying the upstream libraries. These warnings should be ignored.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCSS_DIR="${SCSS_DIR:-_sass}"
DRY_RUN=false

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}=== DRY RUN MODE - No changes will be made ===${NC}"
fi

echo -e "${BLUE}=== SCSS Function Migration Script ===${NC}"
echo ""
echo "Target directory: $SCSS_DIR"
echo ""

# Check if SCSS directory exists
if [ ! -d "$SCSS_DIR" ]; then
    echo -e "${RED}Error: SCSS directory '$SCSS_DIR' not found${NC}"
    exit 1
fi

# Counters
FILES_MODIFIED=0
TOTAL_REPLACEMENTS=0
ADJUST_COLOR_COUNT=0
MIX_COUNT=0
UNQUOTE_COUNT=0
FILES_NEEDING_COLOR_MODULE=0
FILES_NEEDING_STRING_MODULE=0

# Temporary file for processing
TMP_FILE=$(mktemp)
trap "rm -f $TMP_FILE" EXIT

echo -e "${GREEN}Scanning SCSS files for deprecated functions...${NC}"
echo ""

# Find all SCSS files (excluding vendor directories)
find "$SCSS_DIR" -name "*.scss" -type f | grep -v "/vendor/" | while read -r file; do
    FILE_CHANGED=false
    FILE_REPLACEMENTS=0
    NEEDS_COLOR_MODULE=false
    NEEDS_STRING_MODULE=false

    # Check for deprecated functions in this file
    HAS_ADJUST_COLOR=$(grep -o "adjust-color(" "$file" 2>/dev/null | wc -l | tr -d ' ')
    HAS_MIX=$(grep -o "\bmix(" "$file" 2>/dev/null | wc -l | tr -d ' ')
    HAS_UNQUOTE=$(grep -o "unquote(" "$file" 2>/dev/null | wc -l | tr -d ' ')

    # Ensure variables are numeric
    HAS_ADJUST_COLOR=${HAS_ADJUST_COLOR:-0}
    HAS_MIX=${HAS_MIX:-0}
    HAS_UNQUOTE=${HAS_UNQUOTE:-0}

    # Calculate total replacements for this file
    FILE_TOTAL=$((HAS_ADJUST_COLOR + HAS_MIX + HAS_UNQUOTE))

    if [ $FILE_TOTAL -gt 0 ]; then
        echo -e "${YELLOW}Processing: $file${NC}"
        echo "  Found $HAS_ADJUST_COLOR adjust-color, $HAS_MIX mix, $HAS_UNQUOTE unquote"

        if [ "$DRY_RUN" = false ]; then
            # Create backup
            cp "$file" "${file}.bak"
            echo "  Created backup: ${file}.bak"

            # Read file content
            cp "$file" "$TMP_FILE"

            # Replace adjust-color with color.adjust
            if [ $HAS_ADJUST_COLOR -gt 0 ]; then
                sed -i '' 's/adjust-color(/color.adjust(/g' "$TMP_FILE"
                NEEDS_COLOR_MODULE=true
                ADJUST_COLOR_COUNT=$((ADJUST_COLOR_COUNT + HAS_ADJUST_COLOR))
                FILE_REPLACEMENTS=$((FILE_REPLACEMENTS + HAS_ADJUST_COLOR))
            fi

            # Replace mix( with color.mix( - use [[:<:]] for word boundary on macOS
            if [ $HAS_MIX -gt 0 ]; then
                sed -i '' 's/[[:<:]]mix(/color.mix(/g' "$TMP_FILE"
                NEEDS_COLOR_MODULE=true
                MIX_COUNT=$((MIX_COUNT + HAS_MIX))
                FILE_REPLACEMENTS=$((FILE_REPLACEMENTS + HAS_MIX))
            fi

            # Replace unquote with string.unquote
            if [ $HAS_UNQUOTE -gt 0 ]; then
                sed -i '' 's/[[:<:]]unquote(/string.unquote(/g' "$TMP_FILE"
                NEEDS_STRING_MODULE=true
                UNQUOTE_COUNT=$((UNQUOTE_COUNT + HAS_UNQUOTE))
                FILE_REPLACEMENTS=$((FILE_REPLACEMENTS + HAS_UNQUOTE))
            fi

            # Check if file already has @use imports
            HAS_COLOR_USE=$(grep -o "@use ['\"]sass:color['\"]" "$TMP_FILE" 2>/dev/null | wc -l | tr -d ' ')
            HAS_STRING_USE=$(grep -o "@use ['\"]sass:string['\"]" "$TMP_FILE" 2>/dev/null | wc -l | tr -d ' ')
            HAS_COLOR_USE=${HAS_COLOR_USE:-0}
            HAS_STRING_USE=${HAS_STRING_USE:-0}

            # Add @use imports at the top if needed
            if [ "$NEEDS_COLOR_MODULE" = true ] && [ $HAS_COLOR_USE -eq 0 ]; then
                # Insert @use "sass:color"; at the beginning
                echo '@use "sass:color";' | cat - "$TMP_FILE" > "${TMP_FILE}.tmp"
                mv "${TMP_FILE}.tmp" "$TMP_FILE"
                echo -e "  ${GREEN}Added: @use \"sass:color\";${NC}"
                FILES_NEEDING_COLOR_MODULE=$((FILES_NEEDING_COLOR_MODULE + 1))
            fi

            if [ "$NEEDS_STRING_MODULE" = true ] && [ $HAS_STRING_USE -eq 0 ]; then
                # Check if we already added color module
                if [ "$NEEDS_COLOR_MODULE" = true ] && [ $HAS_COLOR_USE -eq 0 ]; then
                    # Insert after the color import we just added
                    sed -i '' '1 a\
@use "sass:string";
' "$TMP_FILE"
                else
                    # Insert at the beginning
                    echo '@use "sass:string";' | cat - "$TMP_FILE" > "${TMP_FILE}.tmp"
                    mv "${TMP_FILE}.tmp" "$TMP_FILE"
                fi
                echo -e "  ${GREEN}Added: @use \"sass:string\";${NC}"
                FILES_NEEDING_STRING_MODULE=$((FILES_NEEDING_STRING_MODULE + 1))
            fi

            # Write changes back to file
            mv "$TMP_FILE" "$file"

            FILES_MODIFIED=$((FILES_MODIFIED + 1))
            TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILE_REPLACEMENTS))
            echo -e "  ${GREEN}✓ Migrated $FILE_REPLACEMENTS functions${NC}"
        else
            echo -e "  ${BLUE}[DRY RUN] Would replace $FILE_TOTAL functions${NC}"
            if [ $HAS_ADJUST_COLOR -gt 0 ]; then
                echo -e "    ${BLUE}Would add @use \"sass:color\";${NC}"
            fi
            if [ $HAS_UNQUOTE -gt 0 ]; then
                echo -e "    ${BLUE}Would add @use \"sass:string\";${NC}"
            fi
        fi
        echo ""
    fi
done

echo ""
echo -e "${GREEN}=== Migration Summary ===${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}DRY RUN - No changes were made${NC}"
    echo ""
fi

echo "Files modified: $FILES_MODIFIED"
echo "Total function replacements: $TOTAL_REPLACEMENTS"
echo "  - adjust-color → color.adjust: $ADJUST_COLOR_COUNT"
echo "  - mix → color.mix: $MIX_COUNT"
echo "  - unquote → string.unquote: $UNQUOTE_COUNT"
echo ""
echo "Files needing @use \"sass:color\": $FILES_NEEDING_COLOR_MODULE"
echo "Files needing @use \"sass:string\": $FILES_NEEDING_STRING_MODULE"
echo ""

if [ "$DRY_RUN" = false ]; then
    if [ $FILES_MODIFIED -gt 0 ]; then
        echo -e "${GREEN}✓ Migration completed successfully!${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Run: npm run lint:scss"
        echo "  2. Test: npm run build"
        echo "  3. Review changes: git diff $SCSS_DIR"
        echo ""
        echo "To restore backups if needed:"
        echo "  find $SCSS_DIR -name '*.scss.bak' -exec bash -c 'mv \"\$1\" \"\${1%.bak}\"' _ {} \\;"
        echo ""
        echo "To remove backups after verification:"
        echo "  find $SCSS_DIR -name '*.scss.bak' -delete"
    else
        echo -e "${YELLOW}No deprecated functions found - nothing to migrate${NC}"
    fi
else
    echo -e "${BLUE}Run without --dry-run to apply changes${NC}"
    echo "  ./migrate-scss-functions.sh"
fi
