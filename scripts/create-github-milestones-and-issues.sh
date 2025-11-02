#!/bin/bash
set -e

REPO="battaglia-v/mk-language-lab"

echo "🎯 Creating GitHub Milestones and Issues for MK Language Lab"
echo "============================================================"
echo ""

# Note: GitHub CLI doesn't have milestone creation in the standard CLI
# You can create milestones via web UI or use the API directly
# For now, we'll create the issues and you can assign them to milestones after

echo "📝 Creating Issue #1: [MVP POC] Simplify navigation to single learning path"
gh issue create \
  --repo "$REPO" \
  --title "[MVP POC] Simplify navigation to single learning path" \
  --label "enhancement,high-priority,poc" \
  --body "## Overview
Remove navigation links and routes for Travel and Culture journeys to focus MVP on Family Conversations only.

## Tasks
- [ ] Remove \"Travel\" and \"Culture\" from journey goals section on home page
- [ ] Update \`JOURNEY_IDS\` in \`data/journeys.ts\` to only include 'family' (or filter in UI)
- [ ] Hide /journey/travel and /journey/culture routes (or redirect to /journey/family)
- [ ] Update navigation component to remove unused learn subsections
- [ ] Remove /learn/grammar, /learn/phrases, /learn/vocabulary, /learn/pronunciation routes
- [ ] Update footer and any hardcoded links
- [ ] Test all navigation flows work correctly

## Acceptance Criteria
- ✅ Only Family Conversations journey visible on homepage
- ✅ All navigation links point to valid routes
- ✅ No 404 errors when clicking through the app
- ✅ Mobile navigation works correctly

## Milestone
MVP POC (Week 1-2)"

echo ""
echo "📝 Creating Issue #2: [MVP POC] Remove task board and resource library"
gh issue create \
  --repo "$REPO" \
  --title "[MVP POC] Remove task board and resource library" \
  --label "enhancement,poc" \
  --body "## Overview
Defer complex features (task board, PDF resource viewer) to v2 to simplify POC scope.

## Tasks
- [ ] Remove /tasks route or add \"Coming Soon\" message
- [ ] Remove /library route or add \"Coming Soon\" message
- [ ] Remove /resources route or add \"Coming Soon\" message
- [ ] Update navigation to hide Tasks and Library links
- [ ] Remove task board localStorage persistence logic
- [ ] Remove PDF.js dependencies if not used elsewhere
- [ ] Update README to reflect removed features
- [ ] Clean up unused components in components/

## Acceptance Criteria
- ✅ Task board and resource library not accessible
- ✅ Navigation reflects simplified feature set
- ✅ Bundle size reduced by removing unused dependencies
- ✅ No broken links to removed features

## Milestone
MVP POC (Week 1-2)"

echo ""
echo "📝 Creating Issue #3: [MVP POC] Mobile responsiveness audit and fixes"
gh issue create \
  --repo "$REPO" \
  --title "[MVP POC] Mobile responsiveness audit and fixes" \
  --label "bug,ui,mobile,critical" \
  --body "## Overview
Test app on real mobile devices (iOS and Android) and fix responsive design issues.

## Devices to Test
- [ ] iPhone SE (smallest iOS device)
- [ ] iPhone 13 Pro (standard iOS)
- [ ] iPad (tablet layout)
- [ ] Samsung Galaxy S21 (standard Android)
- [ ] Google Pixel 6 (latest Android)

## Test Scenarios
- [ ] Homepage journey selection
- [ ] Practice widget interaction
- [ ] Translation tool
- [ ] News feed
- [ ] Tutor chat interface
- [ ] Navigation drawer/menu
- [ ] Language switcher

## Common Issues to Check
- [ ] Text too small to read
- [ ] Buttons too small to tap (44x44px minimum)
- [ ] Forms cut off by keyboard
- [ ] Horizontal scrolling issues
- [ ] Touch targets overlapping
- [ ] Safe area issues (notch, home indicator)

## Acceptance Criteria
- ✅ App usable on iPhone SE
- ✅ No horizontal scrolling
- ✅ All tap targets minimum 44x44px
- ✅ Lighthouse mobile score >90

## Milestone
MVP POC (Week 1-2)"

echo ""
echo "📝 Creating Issue #4: [MVP POC] Improve API error handling and fallbacks"
gh issue create \
  --repo "$REPO" \
  --title "[MVP POC] Improve API error handling and fallbacks" \
  --label "enhancement,api" \
  --body "## Overview
Add robust error handling to translation and tutor APIs with user-friendly error messages.

## Tasks
- [ ] Add try-catch blocks to all API routes
- [ ] Return structured error responses
- [ ] Add timeout handling
- [ ] Implement exponential backoff for retries
- [ ] Show user-friendly error messages in UI
- [ ] Add \"Retry\" button for failed requests
- [ ] Test error scenarios

## Error Messages to Add
- Translation API down
- Tutor API down
- Rate limit hit
- Network error

## Acceptance Criteria
- ✅ No unhandled promise rejections
- ✅ User sees helpful error message for every failure
- ✅ Retry button works correctly
- ✅ Graceful degradation

## Milestone
MVP POC (Week 1-2)"

echo ""
echo "📝 Creating Issue #5: [MVP POC] Update README and documentation"
gh issue create \
  --repo "$REPO" \
  --title "[MVP POC] Update README and documentation" \
  --label "documentation,poc" \
  --body "## Overview
Update README to reflect POC scope and simplified feature set.

## Tasks
- [ ] Remove references to removed features
- [ ] Update \"Key Features\" section
- [ ] Clarify POC scope and roadmap
- [ ] Update environment variables
- [ ] Add mobile testing instructions
- [ ] Update deployment guide
- [ ] Add link to docs/poc-production-roadmap.md

## Acceptance Criteria
- ✅ README accurately reflects current app state
- ✅ No mentions of unimplemented features
- ✅ Clear setup instructions

## Milestone
MVP POC (Week 1-2)"

echo ""
echo "✅ Created 5 MVP POC issues!"
echo ""
echo "Next: Create milestones manually at:"
echo "https://github.com/$REPO/milestones/new"
echo ""
echo "Then assign these issues to the 'MVP POC' milestone."
