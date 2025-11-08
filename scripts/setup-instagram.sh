#!/bin/bash

# Instagram API Setup Script
# This script helps you set up Instagram Graph API credentials

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Instagram Graph API Setup for Daily Lessons            ║${NC}"
echo -e "${BLUE}║   @macedonianlanguagecorner                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local file not found!${NC}"
    echo "Creating .env.local file..."
    touch .env.local
fi

echo -e "${YELLOW}📋 Prerequisites:${NC}"
echo "  ✓ Instagram Business or Creator account"
echo "  ✓ Facebook Page linked to Instagram account"
echo "  ✓ Facebook Developer account"
echo ""
echo -e "${YELLOW}This script will guide you through:${NC}"
echo "  1. Creating a Facebook App"
echo "  2. Getting your Instagram Business Account ID"
echo "  3. Generating an access token"
echo "  4. Adding credentials to .env.local"
echo ""
read -p "Ready to start? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 1: Create a Facebook App${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Open this URL in your browser:"
echo -e "${BLUE}   https://developers.facebook.com/apps${NC}"
echo ""
echo "2. Click 'Create App'"
echo "3. Select 'Business' as app type"
echo "4. Fill in app details:"
echo "   - App Name: 'Macedonian Learning App' (or your choice)"
echo "   - App Contact Email: your email"
echo "5. Click 'Create App'"
echo ""
read -p "Press ENTER when you've created the app..."

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 2: Add Instagram Graph API${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. In your new app, find 'Instagram Graph API' in Products"
echo "2. Click 'Set Up' or 'Add Product'"
echo "3. Complete the setup"
echo ""
read -p "Press ENTER when Instagram Graph API is added..."

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 3: Connect Instagram Account${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Make sure @macedonianlanguagecorner is a Business or Creator account"
echo "2. Go to Instagram Settings > Account > Switch to Professional Account"
echo "3. Link it to a Facebook Page"
echo ""
echo "Need to create/link a Facebook Page?"
echo -e "${BLUE}   https://www.facebook.com/pages/create${NC}"
echo ""
read -p "Press ENTER when Instagram is linked to a Facebook Page..."

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 4: Get Instagram Business Account ID${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Open Graph API Explorer:"
echo -e "${BLUE}   https://developers.facebook.com/tools/explorer${NC}"
echo ""
echo "2. Select your app from the dropdown"
echo "3. Click 'Generate Access Token'"
echo "4. Grant permissions: instagram_basic, pages_read_engagement"
echo "5. In the query field, enter:"
echo -e "${YELLOW}   me?fields=accounts{instagram_business_account}${NC}"
echo "6. Click 'Submit'"
echo "7. Look for 'instagram_business_account' in the response"
echo "8. Copy the ID number"
echo ""
read -p "Enter your Instagram Business Account ID: " INSTAGRAM_ID

if [ -z "$INSTAGRAM_ID" ]; then
    echo -e "${RED}Error: Instagram Business Account ID cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 5: Get Long-Lived Access Token${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Still in Graph API Explorer, copy the current Access Token"
echo "2. We need to exchange it for a long-lived token (60 days)"
echo ""
echo "Option A: Use this tool to generate long-lived token:"
echo -e "${BLUE}   https://developers.facebook.com/tools/accesstoken${NC}"
echo "   Look for 'Extend Access Token' or 'Debug Token'"
echo ""
echo "Option B: I can help generate it with a curl command after you provide:"
echo "   - App ID (from your app dashboard)"
echo "   - App Secret (from Settings > Basic)"
echo "   - Short-lived token (from Graph Explorer)"
echo ""
read -p "Do you have a long-lived token ready? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your long-lived Access Token: " ACCESS_TOKEN
else
    echo ""
    read -p "Enter your App ID: " APP_ID
    read -p "Enter your App Secret: " APP_SECRET
    read -p "Enter your short-lived Access Token: " SHORT_TOKEN

    echo ""
    echo "Generating long-lived token..."

    RESPONSE=$(curl -s "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$APP_ID&client_secret=$APP_SECRET&fb_exchange_token=$SHORT_TOKEN")

    ACCESS_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

    if [ -z "$ACCESS_TOKEN" ]; then
        echo -e "${RED}Error: Failed to generate long-lived token${NC}"
        echo "Response: $RESPONSE"
        echo ""
        echo "Please use Option A to generate manually, then run this script again."
        exit 1
    fi

    echo -e "${GREEN}✓ Long-lived token generated successfully!${NC}"
fi

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}Error: Access Token cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 6: Saving Credentials${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Remove old Instagram credentials if they exist
sed -i.bak '/INSTAGRAM_ACCESS_TOKEN=/d' .env.local
sed -i.bak '/INSTAGRAM_BUSINESS_ACCOUNT_ID=/d' .env.local
rm -f .env.local.bak

# Add new credentials
echo "" >> .env.local
echo "# Instagram Graph API Credentials" >> .env.local
echo "INSTAGRAM_ACCESS_TOKEN=$ACCESS_TOKEN" >> .env.local
echo "INSTAGRAM_BUSINESS_ACCOUNT_ID=$INSTAGRAM_ID" >> .env.local

echo -e "${GREEN}✓ Credentials saved to .env.local${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Step 7: Testing Connection${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Testing API connection..."

TEST_RESPONSE=$(curl -s "https://graph.facebook.com/v18.0/$INSTAGRAM_ID/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=1&access_token=$ACCESS_TOKEN")

if echo "$TEST_RESPONSE" | grep -q '"data"'; then
    echo -e "${GREEN}✓ Success! Connection to Instagram API working!${NC}"
    echo ""
    echo "Sample post retrieved:"
    echo "$TEST_RESPONSE" | head -n 10
else
    echo -e "${RED}✗ Warning: Could not verify connection${NC}"
    echo "Response: $TEST_RESPONSE"
    echo ""
    echo "The credentials have been saved, but you may need to check:"
    echo "  • Instagram account is Business/Creator type"
    echo "  • Permissions are granted (instagram_basic)"
    echo "  • Account is linked to Facebook Page"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. Restart your dev server: npm run dev"
echo "  2. Visit: http://localhost:3000/en/daily-lessons"
echo "  3. You should see real posts from @macedonianlanguagecorner"
echo ""
echo -e "${YELLOW}Important Notes:${NC}"
echo "  • Long-lived tokens expire after 60 days"
echo "  • Set a reminder to refresh the token before expiration"
echo "  • For production, add these env vars to Vercel:"
echo "    vercel env add INSTAGRAM_ACCESS_TOKEN"
echo "    vercel env add INSTAGRAM_BUSINESS_ACCOUNT_ID"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
