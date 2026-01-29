#!/bin/bash

# Generate commit distribution data in bucket format for plot_avg_commits.py
# Output format: "Commits X-Y: Z days"

if [ ! -f logs.txt ]; then
    echo "Error: logs.txt not found"
    exit 1
fi

# Count commits per day, then bucket them
grep '^Date:' logs.txt | \
    awk '{print $3, $4, $6}' | \
    sort | uniq -c | \
    awk '{print $1}' | \
    awk '
    {
        commits = $1
        if (commits >= 1 && commits <= 5) bucket["1-5"]++
        else if (commits >= 6 && commits <= 10) bucket["6-10"]++
        else if (commits >= 11 && commits <= 15) bucket["11-15"]++
        else if (commits >= 16 && commits <= 20) bucket["16-20"]++
        else if (commits >= 21 && commits <= 25) bucket["21-25"]++
        else if (commits >= 26 && commits <= 30) bucket["26-30"]++
        else if (commits > 30) bucket["31+"]++
    }
    END {
        # Output in order
        buckets[1] = "1-5"
        buckets[2] = "6-10"
        buckets[3] = "11-15"
        buckets[4] = "16-20"
        buckets[5] = "21-25"
        buckets[6] = "26-30"
        buckets[7] = "31+"

        for (i = 1; i <= 7; i++) {
            b = buckets[i]
            count = (b in bucket) ? bucket[b] : 0
            if (count > 0) {
                printf "Commits %s: %d days\n", b, count
            }
        }
    }
    ' > average_commits.txt

echo "Commit distribution written to average_commits.txt"
cat average_commits.txt
