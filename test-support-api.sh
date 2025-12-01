#!/bin/bash

# Test Support API Endpoint
# This script tests the support API endpoint with various scenarios

echo "Testing Support API Endpoint"
echo "=============================="
echo ""

# Test 1: Valid request (without Resend configured)
echo "Test 1: Valid support request"
echo "------------------------------"
curl -X POST http://localhost:3000/api/support \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Support Request",
    "description": "This is a test support request to verify the API endpoint is working correctly.",
    "errorDetails": {
      "message": "Test error message",
      "digest": "abc123",
      "stack": "Error: Test error\n    at TestComponent"
    }
  }' | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 2: Missing required fields
echo "Test 2: Missing required fields (should return 400)"
echo "----------------------------------------------------"
curl -X POST http://localhost:3000/api/support \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "test@example.com"
  }' | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

# Test 3: Invalid email format
echo "Test 3: Invalid email format (should return 400)"
echo "-------------------------------------------------"
curl -X POST http://localhost:3000/api/support \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "subject": "Test",
    "description": "Test description"
  }' | jq '.' 2>/dev/null || echo "Response received"
echo ""
echo ""

echo "Tests complete!"
echo ""
echo "Note: If RESEND_API_KEY is not configured in .env.local,"
echo "the API will return a 503 error but will log the request."
