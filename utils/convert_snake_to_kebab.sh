#!/bin/bash

# Check if required tools are installed
command -v sed >/dev/null 2>&1 || { echo "sed is required but not installed. Aborting." >&2; exit 1; }
command -v find >/dev/null 2>&1 || { echo "find is required but not installed. Aborting." >&2; exit 1; }

# Function to convert snake_case to kebab-case
convert_to_kebab() {
    echo "$1" | sed 's/_/-/g' | sed 's/--/-/g'
}

# Detect sed version for compatibility
if sed --version >/dev/null 2>&1; then
    SED_EXT=""  # GNU sed
else
    SED_EXT="''"  # BSD sed (macOS)
fi

# List of known Sass properties to skip
SASS_PROPERTIES="font-size line-height background-color border-radius margin-top margin-bottom margin-left margin-right padding-top padding-bottom padding-left padding-right text-align text-transform box-shadow flex-direction align-items justify-content"

# Process SCSS files
process_scss() {
    while IFS= read -r file; do
        echo "Processing SCSS file: $file"
        # Temporary file for sed operations
        temp_file=$(mktemp)
        cp "$file" "$temp_file"
        
        # Convert class names and IDs in SCSS, skipping Sass properties
        cat "$temp_file" > "$file"
        for prop in $SASS_PROPERTIES; do
            sed -i $SED_EXT "/$prop:/! s/\.\([a-zA-Z][a-zA-Z0-9_-]*\)/\.\1/g" "$file"
            sed -i $SED_EXT "/$prop:/! s/#\([a-zA-Z][a-zA-Z0-9_-]*\)/#\1/g" "$file"
            sed -i $SED_EXT "/$prop:/! s/\([a-zA-Z][a-zA-Z0-9_-]*\)_\([a-zA-Z0-9_-]*\)/\1-\2/g" "$file"
            sed -i $SED_EXT "/$prop:/! s/--/-/g" "$file"
        done
        
        # Check if conversion was successful
        if [ $? -eq 0 ]; then
            echo "Converted $file"
        else
            echo "Error processing $file" >&2
        fi
        rm -f "$temp_file"
    done < <(find . -type f -name "*.scss" -not -path "*/node_modules/*" -not -path "*/vendor/*")
}

# Process HTML files
process_html() {
    while IFS= read -r file; do
        echo "Processing HTML file: $file"
        # Temporary file for sed operations
        temp_file=$(mktemp)
        cp "$file" "$temp_file"
        
        # Convert class and id attributes, skipping Sass properties
        cat "$temp_file" > "$file"
        for prop in $SASS_PROPERTIES; do
            sed -i $SED_EXT "/class=\"[^\"]*$prop[^\"]*\"/! s/class=\"\([^\"]*\)_\([a-zA-Z0-9_-]*\)/class=\"\1-\2/g" "$file"
            sed -i $SED_EXT "/class=\"[^\"]*$prop[^\"]*\"/! s/class=\"\([^\"]*\)--\([a-zA-Z0-9_-]*\)/class=\"\1-\2/g" "$file"
            sed -i $SED_EXT "/id=\"[^\"]*$prop[^\"]*\"/! s/id=\"\([^\"]*\)_\([a-zA-Z0-9_-]*\)/id=\"\1-\2/g" "$file"
            sed -i $SED_EXT "/id=\"[^\"]*$prop[^\"]*\"/! s/id=\"\([^\"]*\)--\([a-zA-Z0-9_-]*\)/id=\"\1-\2/g" "$file"
        done
        sed -i $SED_EXT 's/class="\([^"]*\)"/class="\1"/g' "$file"
        sed -i $SED_EXT 's/id="\([^"]*\)"/id="\1"/g' "$file"
        
        # Check if conversion was successful
        if [ $? -eq 0 ]; then
            echo "Converted $file"
        else
            echo "Error processing $file" >&2
        fi
        rm -f "$temp_file"
    done < <(find . -type f -name "*.html" -not -path "*/node_modules/*" -not -path "*/vendor/*")
}

# Main execution
echo "Starting conversion of snake_case to kebab-case..."

# Check for SCSS files
if find . -type f -name "*.scss" -not -path "*/node_modules/*" -not -path "*/vendor/*" | grep -q .; then
    process_scss
else
    echo "No SCSS files found in the current directory or subdirectories."
fi

# Check for HTML files
if find . -type f -name "*.html" -not -path "*/node_modules/*" -not -path "*/vendor/*" | grep -q .; then
    process_html
else
    echo "No HTML files found in the current directory or subdirectories."
fi

echo "Conversion complete!"
