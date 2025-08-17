#!/bin/bash

# Check if required tools are installed
command -v sed >/dev/null 2>&1 || { echo "sed is required but not installed. Aborting." >&2; exit 1; }
command -v find >/dev/null 2>&1 || { echo "find is required but not installed. Aborting." >&2; exit 1; }

# Function to convert kebab-case to snake_case
convert_to_snake() {
    echo "$1" | sed 's/-/_/g'
}

# Detect sed version for compatibility
if sed --version >/dev/null 2>&1; then
    SED_EXT=""  # GNU sed
else
    SED_EXT="''"  # BSD sed (macOS)
fi

# List of class selectors to skip (e.g., keep .no-js in kebab-case)
SKIP_CLASSES="no-js"

# Process SCSS files
process_scss() {
    while IFS= read -r file; do
        echo "Processing SCSS file: $file"
        # Skip specific classes
        for skip_class in $SKIP_CLASSES; do
            sed -i $SED_EXT "/\.$skip_class\b/! s/\.\([a-zA-Z][a-zA-Z0-9-]*\)/\.\1/g" "$file"
            sed -i $SED_EXT "/\.$skip_class\b/! s/\([a-zA-Z][a-zA-Z0-9-]*\)-\([a-zA-Z0-9-]*\)/\1_\2/g" "$file"
        done
        # Convert IDs
        if sed -i $SED_EXT 's/#\([a-zA-Z][a-zA-Z0-9-]*\)/#\1/g' "$file" && \
           sed -i $SED_EXT 's/\([a-zA-Z][a-zA-Z0-9-]*\)-\([a-zA-Z0-9-]*\)/\1_\2/g' "$file"; then
            echo "Converted $file"
        else
            echo "Error processing $file" >&2
        fi
    done < <(find . -type f -name "*.scss" -not -path "*/node_modules/*" -not -path "*/vendor/*")
}

# Process HTML files
process_html() {
    while IFS= read -r file; do
        echo "Processing HTML file: $file"
        # Skip specific classes in class attributes
        for skip_class in $SKIP_CLASSES; do
            sed -i $SED_EXT "/class=\"[^\"]*$skip_class[^\"]*\"/! s/class=\"\([^\"]*\)-\([a-zA-Z0-9-]*\)/class=\"\1_\2/g" "$file"
        done
        # Convert class and id attributes
        if sed -i $SED_EXT 's/class="\([^"]*\)"/class="\1"/g' "$file" && \
           sed -i $SED_EXT 's/id="\([^"]*\)"/id="\1"/g' "$file" && \
           sed -i $SED_EXT 's/id="\([^"]*\)-\([a-zA-Z0-9-]*\)/id="\1_\2/g' "$file"; then
            echo "Converted $file"
        else
            echo "Error processing $file" >&2
        fi
    done < <(find . -type f -name "*.html" -not -path "*/node_modules/*" -not -path "*/vendor/*")
}

# Main execution
echo "Starting conversion of kebab-case to snake_case..."

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
