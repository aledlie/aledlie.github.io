#!/bin/bash
# Compare current metrics to baseline

set -e

BASELINE="tests/baseline/benchmark-results-baseline.json"
CURRENT="tests/baseline/benchmark-results.json"

echo "=== Baseline Comparison ==="
echo ""

# Check if baseline exists
if [ ! -f "$BASELINE" ]; then
  echo "❌ Baseline not found: $BASELINE"
  echo ""
  echo "Run this first to create baseline:"
  echo "  npm run test:capture-baseline"
  exit 1
fi

# Check if current exists
if [ ! -f "$CURRENT" ]; then
  echo "❌ Current benchmark not found: $CURRENT"
  echo ""
  echo "Run this first to create current benchmark:"
  echo "  node tests/baseline/statistical-validation.js benchmark"
  exit 1
fi

# Run comparison using Node.js
echo "Comparing build performance..."
echo ""
node tests/baseline/statistical-validation.js compare "$BASELINE" "$CURRENT"

# Check exit code
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ No significant performance regressions detected"
  exit 0
else
  echo "❌ Performance regressions detected!"
  echo ""
  echo "Review the comparison output above."
  echo "If you see 'SIGNIFICANTLY SLOWER', investigate your changes."
  exit 1
fi
