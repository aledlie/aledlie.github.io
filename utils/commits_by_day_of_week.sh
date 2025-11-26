#!/bin/bash

# Script to count commits by day of week (0: Sun, 1: Mon, ..., 6: Sat)

# Check if logs.txt exists
if [ ! -f logs.txt ]; then
    echo "Error: logs.txt not found"
    exit 1
fi

# Extract the day of week from Date lines and count commits per day
grep '^Date:' logs.txt | awk '{
    day = $2
    if (day == "Sun") num = 0
    else if (day == "Mon") num = 1
    else if (day == "Tue") num = 2
    else if (day == "Wed") num = 3
    else if (day == "Thu") num = 4
    else if (day == "Fri") num = 5
    else if (day == "Sat") num = 6
    else next
    printf "%d\n", num
}' | sort | uniq -c | awk '{print $2 " " $1}' > commit_counts_day.txt

# Ensure all days (0-6) are represented, filling missing with 0
for day in {0..6}; do
    if ! grep -q "^$day " commit_counts_day.txt; then
        echo "$day 0" >> commit_counts_day.txt
    fi
done

# Sort the results by day
sort -n commit_counts_day.txt > temp.txt && mv temp.txt commit_counts_day.txt

echo "Commit counts by day of week written to commit_counts_day.txt"