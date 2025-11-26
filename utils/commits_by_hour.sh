#!/bin/bash

# Check if logs.txt exists
if [ ! -f logs.txt ]; then
    echo "Error: logs.txt not found"
    exit 1
fi

# Initialize commit_counts.txt
> commit_counts.txt

# Extract the hour from Date lines in logs.txt and count commits per hour
grep '^Date:' logs.txt | awk '{hour = substr($5, 1, 2); if (hour >= 0 && hour <= 23) printf "%02d\n", hour}' | sort | uniq -c | awk '{printf "%02d %d\n", $2, $1}' > commit_counts.txt

# Ensure all hours (00-23) are represented, filling missing hours with 0
for hour in {00..23}; do
    if ! grep -q "^$hour " commit_counts.txt; then
        echo "$hour 0" >> commit_counts.txt
    fi
done

# Sort the results by hour and aggregate duplicates
awk '{counts[$1] += $2} END {for (hour in counts) printf "%02d %d\n", hour, counts[hour]}' commit_counts.txt | sort -n > temp.txt && mv temp.txt commit_counts.txt

# Output success message
echo "Commit counts by hour written to commit_counts.txt"