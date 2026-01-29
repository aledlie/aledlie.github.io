#!/bin/bash

# Script to count commits by month (1: Jan, 2: Feb, ..., 12: Dec)

# Check if logs.txt exists
if [ ! -f logs.txt ]; then
    echo "Error: logs.txt not found"
    exit 1
fi

# Extract the month from Date lines and count commits per month
grep '^Date:' logs.txt | awk '{
    month = $3
    if (month == "Jan") num = 1
    else if (month == "Feb") num = 2
    else if (month == "Mar") num = 3
    else if (month == "Apr") num = 4
    else if (month == "May") num = 5
    else if (month == "Jun") num = 6
    else if (month == "Jul") num = 7
    else if (month == "Aug") num = 8
    else if (month == "Sep") num = 9
    else if (month == "Oct") num = 10
    else if (month == "Nov") num = 11
    else if (month == "Dec") num = 12
    else next
    printf "%d\n", num
}' | sort | uniq -c | awk '{print $2 " " $1}' > commit_counts_month.txt

# Ensure all months (1-12) are represented, filling missing with 0
for month in {1..12}; do
    if ! grep -q "^$month " commit_counts_month.txt; then
        echo "$month 0" >> commit_counts_month.txt
    fi
done

# Sort the results by month
sort -n commit_counts_month.txt > temp.txt && mv temp.txt commit_counts_month.txt

echo "Commit counts by month written to commit_counts_month.txt"