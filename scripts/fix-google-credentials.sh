#!/bin/bash

# Script to fix the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable
# This script will extract the current JSON, validate it, and re-encode it properly

set -e

echo "🔧 Fixing GOOGLE_APPLICATION_CREDENTIALS_JSON in .env.local"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Backup the current .env.local
cp .env.local .env.local.backup
echo "✅ Created backup: .env.local.backup"

# Create a temporary file to hold the fixed JSON
TEMP_JSON=$(mktemp)
TEMP_ENV=$(mktemp)

# Extract the GOOGLE_APPLICATION_CREDENTIALS_JSON value
# This extracts everything between the quotes after the = sign
echo "📤 Extracting current GOOGLE_APPLICATION_CREDENTIALS_JSON value..."

# Try to parse and validate the JSON (this will fail if it has literal \n)
grep "GOOGLE_APPLICATION_CREDENTIALS_JSON=" .env.local | \
  sed 's/^GOOGLE_APPLICATION_CREDENTIALS_JSON="//' | \
  sed 's/"$//' > "$TEMP_JSON"

# Check if it's already base64 encoded
if echo "$(cat $TEMP_JSON)" | base64 -D >/dev/null 2>&1; then
    echo "ℹ️  Credentials appear to be base64 encoded already"
    echo "   Attempting to decode and re-encode properly..."

    # Decode and re-encode
    echo "$(cat $TEMP_JSON)" | base64 -D | jq . > /dev/null 2>&1 || {
        echo "⚠️  Warning: Decoded JSON is not valid"
    }

    # Re-encode properly (single line, no newlines)
    ENCODED=$(echo "$(cat $TEMP_JSON)" | base64 -D | jq -c . | base64 | tr -d '\n')
else
    echo "ℹ️  Credentials appear to be raw JSON with newlines"
    echo "   Validating and encoding..."

    # Try to parse as JSON (will fail if malformed)
    if ! cat "$TEMP_JSON" | jq . > /dev/null 2>&1; then
        echo "❌ Error: Current credentials are not valid JSON"
        echo "   Please manually fix the GOOGLE_APPLICATION_CREDENTIALS_JSON in .env.local"
        echo "   or provide the path to your Google credentials JSON file"
        rm -f "$TEMP_JSON" "$TEMP_ENV"
        exit 1
    fi

    # Encode as base64 (single line)
    ENCODED=$(cat "$TEMP_JSON" | jq -c . | base64 | tr -d '\n')
fi

echo "✅ Successfully encoded credentials"
echo ""

# Update the .env.local file
grep -v "GOOGLE_APPLICATION_CREDENTIALS_JSON=" .env.local > "$TEMP_ENV"
echo "GOOGLE_APPLICATION_CREDENTIALS_JSON=\"$ENCODED\"" >> "$TEMP_ENV"
mv "$TEMP_ENV" .env.local

echo "✅ Updated .env.local with properly encoded credentials"
echo ""
echo "📋 Summary:"
echo "   - Backup saved to: .env.local.backup"
echo "   - Credentials are now base64 encoded (single line, no newlines)"
echo "   - Ready to run E2E tests!"
echo ""
echo "🧪 Next steps:"
echo "   1. Run: npm run test:e2e"
echo "   2. If tests still fail, check E2E_TEST_ISSUES.md for details"

# Cleanup
rm -f "$TEMP_JSON"
