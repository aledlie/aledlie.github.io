#!/bin/bash

# Run git log with verbose output and redirect to logs.txt
git log -v > logs.txt

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "Git log successfully written to logs.txt"
else
    echo "Error: Failed to generate git log"
fi