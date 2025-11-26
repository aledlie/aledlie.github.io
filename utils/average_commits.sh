#!/bin/bash

# Check if logs.txt exists
if [ ! -f logs.txt ]; then
    echo "Error: logs.txt not found"
    exit 1
fi

# Initialize average_commits.txt
> average_commits.txt

# Extract hour and date (YYYY-MM-DD) from Date lines, count commits per hour per day
# Format: hour date count
grep '^Date:' logs.txt | awk '{
    hour = substr($5, 1, 2)
    date = $6 "-" $3 "-" $4  # e.g., 2025-Aug-25
    if (hour >= 0 && hour <= 23) {
        key = hour " " date
        counts[key]++
    }
}
END {
    # Calculate unique days per hour
    for (key in counts) {
        split(key, parts, " ")
        hour = parts[1]
        days[hour][parts[2]] = 1
    }
    # Sum commits per hour and divide by number of unique days
    for (key in counts) {
        split(key, parts, " ")
        hour = parts[1]
        total_commits[hour] += counts[key]
        num_days[hour] = length(days[hour])
    }
    # Output average commits per hour
    for (hour = 0; hour <= 23; hour++) {
        h = sprintf("%02d", hour)
        commits = (h in total_commits) ? total_commits[h] : 0
        days_count = (h in num_days) ? num_days[h] : 1  # Avoid division by zero
        avg = (commits > 0) ? commits / days_count : 0
        printf "%02d %.2f\n", hour, avg
    }
}' > average_commits.txt

# Sort by hour
sort -n average_commits.txt > temp.txt && mv temp.txt average_commits.txt

echo "Average commits per hour written to average_commits.txt"