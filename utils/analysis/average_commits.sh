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
# Note: Uses SUBSEP for 2D array simulation (macOS awk compatibility)
grep '^Date:' logs.txt | awk '{
    hour = substr($5, 1, 2)
    date = $6 "-" $3 "-" $4  # e.g., 2025-Aug-25
    if (hour >= 0 && hour <= 23) {
        key = hour " " date
        counts[key]++
        # Track unique days per hour using combined key
        day_key = hour SUBSEP date
        if (!(day_key in seen_days)) {
            seen_days[day_key] = 1
            num_days[hour]++
        }
    }
}
END {
    # Sum commits per hour
    for (key in counts) {
        split(key, parts, " ")
        hour = parts[1]
        total_commits[hour] += counts[key]
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