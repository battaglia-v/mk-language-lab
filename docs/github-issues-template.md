# GitHub Issues for POC to Production

Copy and paste these issues into GitHub. Create milestones first, then add issues to appropriate milestones.

---

## Milestones to Create

1. **MVP POC** - Due: November 16, 2025 (2 weeks)
2. **Content Complete** - Due: November 30, 2025 (4 weeks)
3. **Production Infrastructure** - Due: December 14, 2025 (6 weeks)
4. **Android Release** - Due: January 4, 2026 (9 weeks)
5. **iOS Release** - Due: February 1, 2026 (14 weeks)

---

## MILESTONE 1: MVP POC Issues

### Issue #1: [MVP POC] Simplify navigation to single learning path
**Labels:** `enhancement`, `poc`, `high-priority`

**Body:**
```markdown
## Overview
Remove navigation links and routes for Travel and Culture journeys to focus MVP on Family Conversations only.

## Tasks
- [ ] Remove "Travel" and "Culture" from journey goals section on home page
- [ ] Update `JOURNEY_IDS` in `data/journeys.ts` to only include 'family' (or filter in UI)
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
```

---

### Issue #2: [MVP POC] Remove task board and resource library
**Labels:** `enhancement`, `poc`

**Body:**
```markdown
## Overview
Defer complex features (task board, PDF resource viewer) to v2 to simplify POC scope.

## Tasks
- [ ] Remove /tasks route or add "Coming Soon" message
- [ ] Remove /library route or add "Coming Soon" message
- [ ] Remove /resources route or add "Coming Soon" message
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
```

---

### Issue #3: [MVP POC] Mobile responsiveness audit and fixes
**Labels:** `bug`, `ui`, `mobile`, `critical`

**Body:**
```markdown
## Overview
Test app on real mobile devices (iOS and Android) and fix responsive design issues.

## Devices to Test
- [ ] iPhone SE (smallest iOS device)
- [ ] iPhone 13 Pro (standard iOS)
- [ ] iPad (tablet layout)
- [ ] Samsung Galaxy S21 (standard Android)
- [ ] Google Pixel 6 (latest Android)
- [ ] Low-end Android device (budget phone)

## Test Scenarios
- [ ] Homepage journey selection
- [ ] Practice widget interaction (typing, selecting answers)
- [ ] Translation tool (input fields, results display)
- [ ] News feed (scrolling, reading articles)
- [ ] Tutor chat interface
- [ ] Navigation drawer/menu
- [ ] Language switcher
- [ ] Landscape orientation support

## Common Issues to Check
- [ ] Text too small to read
- [ ] Buttons too small to tap (44x44px minimum)
- [ ] Forms cut off by keyboard
- [ ] Horizontal scrolling issues
- [ ] Images not loading or too large
- [ ] Animations janky or too slow
- [ ] Touch targets overlapping
- [ ] Safe area issues (notch, home indicator)

## Acceptance Criteria
- ✅ App usable on iPhone SE (smallest screen)
- ✅ No horizontal scrolling
- ✅ All tap targets minimum 44x44px
- ✅ Forms work with mobile keyboard
- ✅ Images optimized for mobile bandwidth
- ✅ Lighthouse mobile score >90
- ✅ No layout shift (CLS <0.1)
```

---

### Issue #4: [MVP POC] Improve API error handling and fallbacks
**Labels:** `enhancement`, `api`, `reliability`

**Body:**
```markdown
## Overview
Add robust error handling to translation and tutor APIs with user-friendly error messages.

## Tasks
- [ ] Add try-catch blocks to all API routes
- [ ] Return structured error responses (status, message, retryable)
- [ ] Add timeout handling (8s for news, 10s for translation, 30s for tutor)
- [ ] Implement exponential backoff for retries
- [ ] Show user-friendly error messages in UI
- [ ] Add "Retry" button for failed requests
- [ ] Log errors to console in development
- [ ] Test error scenarios (network failure, API timeout, invalid input)

## Error Messages to Add
- Translation API down: "Translation service temporarily unavailable. Please try again."
- Tutor API down: "Our AI tutor is taking a break. Please try again in a moment."
- Rate limit hit: "You're practicing fast! Please wait X seconds."
- Network error: "Connection lost. Check your internet and try again."

## Acceptance Criteria
- ✅ No unhandled promise rejections
- ✅ User sees helpful error message for every failure scenario
- ✅ Retry button works correctly
- ✅ Errors don't break the app (graceful degradation)
```

---

### Issue #5: [MVP POC] Update README and documentation
**Labels:** `documentation`, `poc`

**Body:**
```markdown
## Overview
Update README to reflect POC scope and simplified feature set.

## Tasks
- [ ] Remove references to removed features (task board, resource library, unused journeys)
- [ ] Update "Key Features" section
- [ ] Clarify POC scope and roadmap
- [ ] Update screenshots if needed
- [ ] Document environment variables for POC
- [ ] Add mobile testing instructions
- [ ] Update deployment guide for Vercel
- [ ] Add link to docs/poc-production-roadmap.md

## Acceptance Criteria
- ✅ README accurately reflects current app state
- ✅ No mentions of unimplemented features
- ✅ Clear setup instructions for new developers
```

---

## MILESTONE 2: Content Complete Issues

### Issue #6: [Content] Expand Family Conversations vocabulary
**Labels:** `content`, `vocabulary`, `critical`

**Body:**
```markdown
## Overview
Practice widget currently has limited vocabulary. Expand to 300+ terms focused on family conversation domain.

## Vocabulary Categories Needed
- [ ] Family members (immediate and extended)
- [ ] Common greetings (formal and informal)
- [ ] Daily activities and routines
- [ ] Emotions and feelings
- [ ] Food and meals (family dining context)
- [ ] Health and wellness phrases
- [ ] Time expressions (days, months, holidays)
- [ ] Question words and common responses
- [ ] Polite expressions and responses

## Tasks
- [ ] Audit current vocabulary in `data/practice-vocabulary.json`
- [ ] Create comprehensive family conversation word list (300+ terms)
- [ ] Categorize words by difficulty (beginner, intermediate, advanced)
- [ ] Add Macedonian translations for all terms
- [ ] Add English translations
- [ ] Verify Cyrillic spelling with native speaker
- [ ] Test practice widget with expanded vocabulary
- [ ] Ensure random selection still works well

## Acceptance Criteria
- ✅ Minimum 300 vocabulary items in practice-vocabulary.json
- ✅ All items have both Macedonian and English translations
- ✅ Words categorized by family conversation relevance
- ✅ Practice widget shows variety (no repetition within 20 questions)
- ✅ Native speaker approval rating >4/5

## Resources Needed
- Native Macedonian speaker for review (budget: $300-500)
```

---

### Issue #7: [Content] Complete all English and Macedonian translations
**Labels:** `content`, `localization`, `critical`

**Body:**
```markdown
## Overview
Audit messages/en.json and messages/mk.json to ensure 100% translation coverage with no placeholders.

## Localization Checklist
- [ ] Navigation labels
- [ ] Page titles and descriptions
- [ ] Button text and CTAs
- [ ] Form labels and placeholders
- [ ] Error messages
- [ ] Success messages
- [ ] Loading states
- [ ] Empty states
- [ ] Journey content (titles, descriptions, focus areas)
- [ ] Practice widget text
- [ ] Tutor prompts and responses
- [ ] News feed labels
- [ ] Footer content

## Tasks
- [ ] Review messages/en.json for clarity and completeness
- [ ] Review messages/mk.json for missing translations
- [ ] Identify any placeholder text or English fallbacks in Macedonian file
- [ ] Translate all UI strings (navigation, buttons, errors, labels)
- [ ] Add translations for new simplified navigation structure
- [ ] Translate error messages and validation text
- [ ] Review tutor system prompts for cultural appropriateness
- [ ] Get native speaker review of all Macedonian content
- [ ] Fix any grammatical errors or awkward phrasing
- [ ] Update glossary in docs/localization/glossary.md

## Acceptance Criteria
- ✅ Zero missing translation keys
- ✅ All Macedonian text uses correct Cyrillic spelling
- ✅ Native speaker approval rating >4.5/5
- ✅ English text is clear and free of typos
- ✅ Consistent tone and terminology across all content

## Resources Needed
- Native Macedonian speaker for review (budget: $300-500)
- Translation QA checklist from docs/localization/qa-checklist.md
```

---

### Issue #8: [Content] Create common phrases library
**Labels:** `content`, `enhancement`

**Body:**
```markdown
## Overview
Create a library of 50+ common phrases for family conversations with translations and usage notes.

## Phrase Categories
- [ ] Greetings and introductions (10 phrases)
- [ ] Asking about family members (10 phrases)
- [ ] Talking about health and well-being (8 phrases)
- [ ] Discussing food and meals (8 phrases)
- [ ] Making plans and invitations (8 phrases)
- [ ] Expressing emotions and reactions (8 phrases)
- [ ] Giving compliments and encouragement (5 phrases)
- [ ] Saying goodbye and keeping in touch (5 phrases)

## Format
Each phrase should include:
- Macedonian text (Cyrillic)
- English translation
- Pronunciation guide (optional for POC)
- Usage context note
- Formality level (informal/formal)

## Tasks
- [ ] Compile phrase list with native speaker input
- [ ] Add to data/phrases.ts or similar file
- [ ] Create UI component to display phrases
- [ ] Add search/filter functionality
- [ ] Link phrases from practice widget

## Acceptance Criteria
- ✅ Minimum 50 phrases across all categories
- ✅ All phrases reviewed by native speaker
- ✅ Usage notes helpful and accurate
- ✅ Phrases accessible from practice section
```

---

### Issue #9: [Content] Refine tutor system prompts
**Labels:** `content`, `ai`, `enhancement`

**Body:**
```markdown
## Overview
Improve AI tutor system prompts with better cultural context and family conversation coaching.

## Tasks
- [ ] Review current MACEDONIAN_TUTOR_SYSTEM_PROMPT in api/tutor/route.ts
- [ ] Add more specific family conversation scenarios
- [ ] Include cultural context about Macedonian family dynamics
- [ ] Add examples of warm, respectful tone
- [ ] Specify when to use formal vs informal language
- [ ] Add guidance for heritage learners (different needs than tourists)
- [ ] Include common mistakes to watch for
- [ ] Test tutor responses for quality and appropriateness
- [ ] Add content moderation checks (if needed)

## Family Conversation Coaching Elements
- Warm greetings appropriate for relatives
- How to ask about family members respectfully
- Cultural norms (kissing cheeks, formal address for elders)
- Common topics (health, work, children, food)
- How to express missing family members
- Appropriate responses to news (good and bad)

## Acceptance Criteria
- ✅ Tutor responses feel warm and family-oriented
- ✅ Cultural context included in coaching
- ✅ Appropriate formality level guidance
- ✅ Test conversations feel natural
- ✅ No inappropriate or offensive responses
```

---

## MILESTONE 3: Production Infrastructure Issues

### Issue #10: [Production] Migrate from SQLite to PostgreSQL
**Labels:** `infrastructure`, `database`, `critical`

**Body:**
```markdown
## Overview
Replace SQLite with PostgreSQL for production deployment. SQLite is not suitable for Vercel serverless environment.

## Database Options
1. **Vercel Postgres** - Native integration, generous free tier
2. **Neon** - Serverless Postgres, great free tier
3. **Supabase** - Postgres + additional features

## Recommendation: Vercel Postgres or Neon

## Migration Tasks
- [ ] Choose database provider (Vercel Postgres or Neon)
- [ ] Create production database instance
- [ ] Update DATABASE_URL in Vercel environment variables
- [ ] Run `prisma generate` with new database URL
- [ ] Create migration script: `npx prisma migrate deploy`
- [ ] Test all Prisma queries work with Postgres
- [ ] Update schema.prisma if needed (SQLite vs Postgres differences)
- [ ] Create staging database for testing
- [ ] Document connection string format in README
- [ ] Add backup strategy documentation

## Schema Validation
- [ ] User model works correctly
- [ ] TutorSession JSON storage compatible
- [ ] Board columns JSON storage compatible
- [ ] Lesson model indexes optimized
- [ ] Foreign key constraints working

## Acceptance Criteria
- ✅ App connects to Postgres successfully
- ✅ All CRUD operations work
- ✅ No performance degradation vs SQLite
- ✅ Staging environment mirrors production
- ✅ Rollback plan documented
- ✅ Database connection pooling configured
```

---

### Issue #11: [Production] Implement user authentication with NextAuth.js
**Labels:** `infrastructure`, `auth`, `security`, `critical`

**Body:**
```markdown
## Overview
Add user authentication to save progress, tutor sessions, and personalize experience.

## Providers to Support
- [ ] Email/Password (with magic link option)
- [ ] Google OAuth
- [ ] GitHub OAuth (nice to have)
- [ ] Apple Sign In (required for iOS App Store)

## Implementation Tasks
- [ ] Install NextAuth.js v5 (supports App Router)
- [ ] Create /api/auth/[...nextauth]/route.ts
- [ ] Configure session strategy (JWT vs Database sessions)
- [ ] Set up OAuth apps (Google, GitHub, Apple)
- [ ] Create login page UI
- [ ] Create signup page UI
- [ ] Update AuthGuard component to check auth
- [ ] Add session provider to root layout
- [ ] Protect tutor sessions (require auth to save history)
- [ ] Add user profile page
- [ ] Implement logout flow
- [ ] Add "Continue as Guest" option

## Database Changes
- [ ] Verify Prisma User, Account, Session models match NextAuth schema
- [ ] Add migration for auth tables if needed
- [ ] Create indexes on session/account lookup fields

## Security Requirements
- [ ] CSRF protection enabled
- [ ] Secure session cookies (httpOnly, secure, sameSite)
- [ ] Rate limiting on login attempts
- [ ] Email verification for new accounts
- [ ] Password reset flow (if using email/password)
- [ ] Environment secrets documented in .env.example

## Acceptance Criteria
- ✅ Users can sign up and log in with Google
- ✅ Users can sign up and log in with email
- ✅ Sessions persist across page reloads
- ✅ Tutor chat history saved per user
- ✅ AuthGuard redirects unauthenticated users
- ✅ Guest mode allows practice widget usage
- ✅ Apple Sign In ready for iOS submission
```

---

### Issue #12: [Production] Add API rate limiting
**Labels:** `infrastructure`, `security`, `api`

**Body:**
```markdown
## Overview
Protect translation and tutor APIs from abuse using Upstash Redis for rate limiting.

## Endpoints to Protect
- `/api/translate` - 10 requests per minute per IP
- `/api/translate/detect` - 10 requests per minute per IP
- `/api/tutor` - 5 requests per minute per user
- `/api/news` - 30 requests per minute per IP

## Implementation Tasks
- [ ] Set up Upstash Redis account (free tier)
- [ ] Install @upstash/ratelimit and @upstash/redis
- [ ] Create rate limit middleware for API routes
- [ ] Add rate limit headers to responses
- [ ] Return 429 Too Many Requests with Retry-After
- [ ] Add rate limit error message to UI
- [ ] Differentiate auth vs anonymous users (higher limits for auth)
- [ ] Log rate limit violations
- [ ] Add bypass for admin/testing

## Rate Limit Tiers
**Anonymous Users:**
- Translation: 10/min, 100/hour
- Tutor: 5/min, 20/hour

**Authenticated Users:**
- Translation: 20/min, 300/hour
- Tutor: 10/min, 50/hour

## Error Handling
- [ ] Show friendly message with countdown timer
- [ ] Suggest signing in for higher limits
- [ ] Cache translation requests client-side

## Acceptance Criteria
- ✅ Rate limits enforced on all API routes
- ✅ 429 responses include Retry-After header
- ✅ UI shows helpful rate limit messages
- ✅ Authenticated users get higher limits
- ✅ Rate limit rules configurable via env vars
```

---

### Issue #13: [Production] Set up error tracking with Sentry
**Labels:** `infrastructure`, `monitoring`

**Body:**
```markdown
## Overview
Add comprehensive error tracking for client and server errors.

## Implementation Tasks
- [ ] Create Sentry account (free tier)
- [ ] Install @sentry/nextjs
- [ ] Run `npx @sentry/wizard@latest -i nextjs`
- [ ] Add SENTRY_DSN to environment variables
- [ ] Configure sentry.client.config.ts
- [ ] Configure sentry.server.config.ts
- [ ] Configure sentry.edge.config.ts
- [ ] Test error reporting in development
- [ ] Set up source maps for production
- [ ] Add user context (user ID, email)
- [ ] Add custom tags (journey, locale, environment)

## Error Boundaries
- [ ] Add error boundary to root layout
- [ ] Add boundaries to critical sections
- [ ] Create custom error fallback UI

## Monitoring Configuration
- [ ] Set up alerts (email/Slack)
- [ ] Configure issue grouping
- [ ] Set up error rate alerts (>5 errors/min)
- [ ] Add release tracking
- [ ] Configure breadcrumbs for user actions

## Privacy & GDPR
- [ ] Scrub sensitive data from logs
- [ ] Add IP anonymization
- [ ] Configure data retention (30 days)
- [ ] Add Sentry to privacy policy

## Acceptance Criteria
- ✅ Client errors logged with stack traces
- ✅ Server errors logged with context
- ✅ Source maps working
- ✅ User context attached to errors
- ✅ Alerts configured
- ✅ No sensitive data in logs
```

---

### Issue #14: [Production] Add analytics and monitoring
**Labels:** `infrastructure`, `monitoring`, `analytics`

**Body:**
```markdown
## Overview
Track user behavior and performance metrics using Vercel Analytics and Plausible.

## Implementation Tasks
### Vercel Analytics
- [ ] Verify @vercel/analytics is installed
- [ ] Add Analytics component to root layout
- [ ] Enable Web Vitals tracking
- [ ] Configure custom events
- [ ] Set up Vercel Speed Insights

### Plausible Analytics
- [ ] Create Plausible account
- [ ] Install plausible-tracker
- [ ] Add tracking script
- [ ] Configure custom events
- [ ] Set up conversion goals

## Custom Events to Track
- [ ] practice_started
- [ ] practice_completed
- [ ] translation_requested
- [ ] tutor_message_sent
- [ ] news_article_clicked
- [ ] journey_selected
- [ ] language_switched
- [ ] user_signed_up
- [ ] user_signed_in

## Performance Monitoring
- [ ] Track Core Web Vitals (LCP, FID, CLS)
- [ ] Monitor API response times
- [ ] Track bundle size
- [ ] Set performance budgets

## Business Metrics
- [ ] Daily Active Users (DAU)
- [ ] Weekly Active Users (WAU)
- [ ] Average session duration
- [ ] Practice sessions per user
- [ ] Retention rate (Day 1, 7, 30)

## Acceptance Criteria
- ✅ Vercel Analytics showing page views
- ✅ Plausible tracking custom events
- ✅ Performance metrics within targets
- ✅ No PII sent to analytics
- ✅ No cookie banner needed
```

---

### Issue #15: [Production] Create privacy policy and terms of service
**Labels:** `legal`, `content`, `critical`

**Body:**
```markdown
## Overview
Create GDPR-compliant privacy policy and terms of service for production launch.

## Privacy Policy Sections
- [ ] What data we collect (email, practice history, tutor conversations)
- [ ] How we use data (improve experience, save progress)
- [ ] Third-party services (OpenAI, Google Translate, Sentry, Plausible)
- [ ] Data retention policy
- [ ] User rights (access, deletion, portability)
- [ ] Cookie usage (if any)
- [ ] Children's privacy (COPPA compliance)
- [ ] International users (GDPR, CCPA)
- [ ] Contact information for privacy questions

## Terms of Service Sections
- [ ] Acceptable use policy
- [ ] User-generated content (tutor conversations)
- [ ] Intellectual property rights
- [ ] Disclaimer of warranties
- [ ] Limitation of liability
- [ ] Governing law
- [ ] Dispute resolution

## Implementation Tasks
- [ ] Use privacy policy generator or template
- [ ] Customize for MK Language Lab specifics
- [ ] Review with legal expert (optional but recommended)
- [ ] Create /privacy and /terms routes
- [ ] Add links to footer
- [ ] Add acceptance checkbox to signup form
- [ ] Store acceptance timestamp in database
- [ ] Add privacy policy link to app stores

## Acceptance Criteria
- ✅ Privacy policy covers all data collection
- ✅ Terms of service clear and enforceable
- ✅ Links accessible from all pages
- ✅ Users accept on signup
- ✅ Google Play and App Store compliant
```

---

## MILESTONE 4: Android Release Issues

### Issue #16: [Android] Create PWA manifest and service worker
**Labels:** `android`, `pwa`, `mobile`, `critical`

**Body:**
```markdown
## Overview
Convert web app to Progressive Web App (PWA) for Android installation.

## PWA Manifest Tasks
- [ ] Create public/manifest.json
- [ ] Add app name ("MK Language Lab")
- [ ] Add short name ("MK Lab")
- [ ] Set theme color
- [ ] Set background color
- [ ] Set display mode ("standalone")
- [ ] Configure screenshots

## App Icons
- [ ] Create 512x512 icon
- [ ] Create 192x192 icon
- [ ] Create 180x180 icon (iOS)
- [ ] Create 32x32 favicon
- [ ] Create maskable icon variants
- [ ] Add icons to manifest

## Service Worker
- [ ] Create service worker
- [ ] Implement install event (cache assets)
- [ ] Implement fetch event (serve from cache)
- [ ] Implement activate event (clean old caches)
- [ ] Define cache strategy
- [ ] Add offline fallback page
- [ ] Register service worker

## Offline Support
- [ ] Cache vocabulary for practice widget
- [ ] Show offline indicator
- [ ] Queue translation requests (background sync)
- [ ] Display cached news articles
- [ ] Disable tutor when offline

## Installation Prompt
- [ ] Detect if app is installable
- [ ] Show custom install prompt
- [ ] Add "Add to Home Screen" button
- [ ] Track install events

## Acceptance Criteria
- ✅ Lighthouse PWA score = 100
- ✅ App installable on Android
- ✅ Icons display correctly
- ✅ App works offline (cached content)
- ✅ Service worker updates automatically
```

---

### Issue #17: [Android] Create Play Store listing and assets
**Labels:** `android`, `marketing`, `content`

**Body:**
```markdown
## Overview
Prepare all assets and content for Google Play Store listing.

## App Description
- [ ] Write short description (80 chars max)
- [ ] Write full description (4000 chars max)
- [ ] Highlight key features
- [ ] Add call-to-action
- [ ] Include screenshots descriptions

## Screenshots
- [ ] Homepage (phone)
- [ ] Practice widget (phone)
- [ ] Translation tool (phone)
- [ ] Tutor interface (phone)
- [ ] News feed (phone)
- [ ] Tablet screenshots (if supporting tablets)
- [ ] Add text overlays explaining features

## Store Listing Assets
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Promotional video (optional, 30s max)
- [ ] Promo graphic (180x120)

## Content Rating
- [ ] Complete IARC questionnaire
- [ ] Set appropriate age rating
- [ ] Disclose ads (if any)
- [ ] Disclose in-app purchases (if any)

## Store Listing Info
- [ ] Choose app category (Education)
- [ ] Add tags and keywords
- [ ] Set content rating
- [ ] Add contact email
- [ ] Add privacy policy URL
- [ ] Add website URL

## Acceptance Criteria
- ✅ All required assets created
- ✅ Descriptions compelling and accurate
- ✅ Screenshots show key features
- ✅ Content rating appropriate
- ✅ Privacy policy published
```

---

### Issue #18: [Android] Beta testing and Play Store submission
**Labels:** `android`, `testing`, `critical`

**Body:**
```markdown
## Overview
Set up beta testing track and submit to Google Play Store.

## Beta Testing Setup
- [ ] Create internal testing track
- [ ] Add test users (emails)
- [ ] Upload AAB or APK to internal track
- [ ] Share testing link with testers
- [ ] Collect feedback (minimum 14 days)
- [ ] Fix critical bugs from feedback
- [ ] Create closed testing track
- [ ] Add more testers (minimum 20)
- [ ] Test for another 7-14 days

## Pre-Submission Checklist
- [ ] App builds successfully
- [ ] No crashes during testing
- [ ] All core features work
- [ ] Privacy policy accessible
- [ ] Content rating set
- [ ] Screenshots and assets uploaded
- [ ] Store listing complete
- [ ] App signing configured

## App Signing
- [ ] Generate upload key
- [ ] Enroll in Play App Signing
- [ ] Store keystore securely
- [ ] Document signing process

## Play Store Submission
- [ ] Submit to production track
- [ ] Wait for review (typically 2-7 days)
- [ ] Address any rejection feedback
- [ ] Monitor crash reports
- [ ] Respond to user reviews

## Post-Launch
- [ ] Monitor install numbers
- [ ] Check crash rate (<2% target)
- [ ] Track user ratings (4.0+ target)
- [ ] Set up automated alerts

## Acceptance Criteria
- ✅ Beta testing completed (20+ users, 14+ days)
- ✅ All critical bugs fixed
- ✅ Play Store approval received
- ✅ App installable from Play Store
- ✅ Crash rate <2%
- ✅ Rating 4.0+
```

---

## MILESTONE 5: iOS Release Issues

### Issue #19: [iOS] Set up Apple Developer account and certificates
**Labels:** `ios`, `infrastructure`, `critical`

**Body:**
```markdown
## Overview
Set up Apple Developer Program membership and required certificates for iOS app.

## Tasks
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Verify developer account (can take 24-48 hours)
- [ ] Create App ID in developer portal
- [ ] Set up certificates (development & distribution)
- [ ] Create provisioning profiles
- [ ] Set up push notification certificate (if needed)
- [ ] Set up App Store Connect account
- [ ] Add team members (if applicable)

## App ID Configuration
- [ ] Choose explicit App ID
- [ ] Set bundle identifier (com.vbattaglia.mklanguagelab)
- [ ] Enable required capabilities (Sign in with Apple)
- [ ] Configure app services

## Certificates
- [ ] iOS Development Certificate
- [ ] iOS Distribution Certificate
- [ ] Push Services Certificate (if using push notifications)

## Acceptance Criteria
- ✅ Apple Developer account active
- ✅ App ID created
- ✅ Certificates generated and installed
- ✅ Provisioning profiles configured
- ✅ Team access configured
```

---

### Issue #20: [iOS] Migrate PWA to React Native or Capacitor
**Labels:** `ios`, `mobile`, `critical`, `technical`

**Body:**
```markdown
## Overview
PWAs have limited support on iOS. Migrate to React Native or Capacitor for full native experience.

## Options Analysis
### Option A: Capacitor (Recommended)
- ✅ Wraps existing web app
- ✅ Minimal code changes
- ✅ Keep Next.js codebase
- ❌ Limited native feature access

### Option B: React Native
- ✅ Full native performance
- ✅ Better iOS integration
- ❌ Requires significant rewrite
- ❌ Maintain separate codebase

## Recommendation: Start with Capacitor

## Capacitor Migration Tasks
- [ ] Install @capacitor/core, @capacitor/cli, @capacitor/ios
- [ ] Run `npx cap init`
- [ ] Configure capacitor.config.ts
- [ ] Set up iOS project: `npx cap add ios`
- [ ] Build Next.js for static export
- [ ] Copy build to Capacitor
- [ ] Open Xcode project
- [ ] Configure app icon and splash screen
- [ ] Test on iOS simulator
- [ ] Test on physical iPhone

## iOS-Specific Adjustments
- [ ] Handle safe areas (notch, home indicator)
- [ ] Implement iOS-style navigation
- [ ] Add haptic feedback
- [ ] Configure status bar appearance
- [ ] Handle keyboard behavior
- [ ] Test dark mode
- [ ] Add iOS gestures

## Acceptance Criteria
- ✅ App builds in Xcode
- ✅ App runs on iOS simulator
- ✅ App runs on physical device
- ✅ All core features work
- ✅ Safe areas handled correctly
- ✅ Performance acceptable (60fps)
```

---

### Issue #21: [iOS] TestFlight beta testing
**Labels:** `ios`, `testing`

**Body:**
```markdown
## Overview
Set up TestFlight for beta testing and collect feedback from iOS users.

## TestFlight Setup
- [ ] Upload build to App Store Connect
- [ ] Set up internal testing group
- [ ] Add internal testers (up to 100)
- [ ] Set up external testing group
- [ ] Submit build for beta review
- [ ] Wait for beta approval (typically 24-48 hours)
- [ ] Add external testers (up to 10,000)

## Testing Plan
- [ ] Minimum 25 testers
- [ ] Minimum 2-3 weeks testing period
- [ ] Test on various devices (iPhone SE, iPhone 13, iPhone 15, iPad)
- [ ] Test on various iOS versions (iOS 15, 16, 17)

## Feedback Collection
- [ ] Create feedback survey
- [ ] Monitor TestFlight feedback
- [ ] Track crashes in TestFlight
- [ ] Document bugs and issues
- [ ] Prioritize fixes
- [ ] Release updated builds to TestFlight

## Acceptance Criteria
- ✅ Build approved for TestFlight
- ✅ Minimum 25 active testers
- ✅ Testing period 2+ weeks
- ✅ Crash rate <1%
- ✅ All critical bugs fixed
- ✅ Feedback rating 4.0+
```

---

### Issue #22: [iOS] Complete App Store listing and submit
**Labels:** `ios`, `marketing`, `critical`

**Body:**
```markdown
## Overview
Prepare App Store listing and submit for App Store review.

## App Store Listing
- [ ] Write app name (30 chars max)
- [ ] Write subtitle (30 chars max)
- [ ] Write description (4000 chars max)
- [ ] Add keywords (100 chars, comma-separated)
- [ ] Choose category (Education)
- [ ] Choose subcategory
- [ ] Set content rating

## Screenshots (Required Sizes)
- [ ] 6.7" iPhone (1290x2796) - 3-10 screenshots
- [ ] 5.5" iPhone (1242x2208) - 3-10 screenshots
- [ ] 12.9" iPad (2048x2732) - Optional
- [ ] Add localized screenshots (English, Macedonian)

## App Preview Video (Optional)
- [ ] Record 15-30s demo video
- [ ] Add voiceover or captions
- [ ] Export in required format

## Privacy Nutrition Label
- [ ] Complete privacy questionnaire
- [ ] Disclose data collection
- [ ] Explain data usage
- [ ] Link to privacy policy

## App Review Information
- [ ] Provide test account (if login required)
- [ ] Add demo video showing app usage
- [ ] Add notes for reviewer
- [ ] Provide contact information

## Pre-Submission Checklist
- [ ] App complies with App Store guidelines
- [ ] No references to other platforms (Android)
- [ ] In-app purchase configured (if applicable)
- [ ] Sign in with Apple implemented (if login required)
- [ ] Privacy policy linked
- [ ] Support URL working
- [ ] App icon meets requirements
- [ ] Launch screen configured

## Submission
- [ ] Submit for App Store review
- [ ] Wait for review (typically 2-7 days)
- [ ] Address rejection feedback if any
- [ ] Monitor app status
- [ ] Respond to reviewer questions promptly

## Post-Approval
- [ ] Set release date (manual or automatic)
- [ ] Monitor install numbers
- [ ] Check crash reports
- [ ] Respond to user reviews
- [ ] Track ratings

## Acceptance Criteria
- ✅ All listing assets complete
- ✅ App submitted for review
- ✅ App approved by Apple
- ✅ App available on App Store
- ✅ Crash rate <1%
- ✅ Rating 4.0+
```

---

## Additional Critical Issues (Cross-Milestone)

### Issue #23: [Testing] Create E2E test suite
**Labels:** `testing`, `quality`

**Body:**
```markdown
## Overview
Create end-to-end tests for critical user flows using Playwright.

## Test Scenarios
- [ ] Homepage loads and journey is visible
- [ ] Practice widget: complete a translation quiz
- [ ] Translation tool: translate text MK→EN and EN→MK
- [ ] Tutor: send message and receive response
- [ ] News feed: load articles and click through
- [ ] Language switcher: toggle between EN and MK
- [ ] Mobile responsive: test on mobile viewport
- [ ] Authentication: sign up, log in, log out

## Implementation
- [ ] Install Playwright
- [ ] Set up test configuration
- [ ] Create page object models
- [ ] Write test cases
- [ ] Set up CI/CD integration
- [ ] Run tests on PR

## Acceptance Criteria
- ✅ All critical flows covered
- ✅ Tests pass consistently
- ✅ Tests run in CI/CD
- ✅ Test coverage >70%
```

---

### Issue #24: [Performance] Optimize bundle size and loading performance
**Labels:** `performance`, `optimization`

**Body:**
```markdown
## Overview
Optimize Next.js bundle size and page load performance for mobile users.

## Analysis
- [ ] Run Lighthouse audit
- [ ] Analyze bundle with @next/bundle-analyzer
- [ ] Check Core Web Vitals
- [ ] Test on 3G network

## Optimizations
- [ ] Enable React lazy loading for heavy components
- [ ] Optimize images (next/image, WebP format)
- [ ] Remove unused dependencies
- [ ] Code split by route
- [ ] Tree-shake unused exports
- [ ] Minimize JavaScript execution time
- [ ] Defer non-critical CSS
- [ ] Preload critical resources

## Performance Budgets
- [ ] First Contentful Paint <1.8s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3.8s
- [ ] Total Blocking Time <200ms
- [ ] Cumulative Layout Shift <0.1
- [ ] Bundle size <500KB (gzipped)

## Acceptance Criteria
- ✅ Lighthouse score >90 (mobile)
- ✅ All Core Web Vitals in "Good" range
- ✅ Bundle size <500KB
- ✅ App usable on 3G
```

---

### Issue #25: [Security] Security audit and penetration testing
**Labels:** `security`, `critical`

**Body:**
```markdown
## Overview
Conduct security audit before production launch.

## Security Checklist
- [ ] HTTPS enforced everywhere
- [ ] CSRF protection enabled
- [ ] XSS protection (Content-Security-Policy headers)
- [ ] SQL injection prevention (Prisma parameterized queries)
- [ ] Rate limiting on all APIs
- [ ] Authentication token security
- [ ] Session management secure
- [ ] Environment variables not exposed client-side
- [ ] Sensitive data encrypted at rest
- [ ] CORS configured properly
- [ ] Dependencies up to date (no known vulnerabilities)

## Testing
- [ ] Run npm audit
- [ ] Run Snyk security scan
- [ ] Test authentication bypass attempts
- [ ] Test API rate limit bypass
- [ ] Test XSS vulnerabilities
- [ ] Test CSRF attacks
- [ ] Test SQL injection

## Acceptance Criteria
- ✅ Zero critical vulnerabilities
- ✅ All security best practices implemented
- ✅ Penetration testing passed
- ✅ npm audit clean
```

---

## Quick Reference

### Priority Labels
- `critical` - Blocks launch, must fix
- `high-priority` - Important but not blocking
- `low-priority` - Nice to have

### Type Labels
- `bug` - Something broken
- `enhancement` - New feature or improvement
- `content` - Content/translation work
- `infrastructure` - Backend/DevOps
- `documentation` - Docs only

### Platform Labels
- `poc` - POC/MVP scope
- `mobile` - Mobile-specific
- `android` - Android-specific
- `ios` - iOS-specific
- `pwa` - Progressive Web App

---

## How to Use This Template

1. **Create Milestones in GitHub**
   - Go to Issues → Milestones → New Milestone
   - Create all 5 milestones with due dates

2. **Create Issues**
   - Copy each issue body from this document
   - Paste into GitHub Issues → New Issue
   - Add labels
   - Assign to milestone
   - Assign to yourself

3. **Set Up Project Board** (Optional)
   - Create project board (Projects → New Project)
   - Use "Board" view
   - Add columns: Todo, In Progress, Done
   - Add all issues to board

4. **Track Progress**
   - Check off tasks as you complete them
   - Move issues across board columns
   - Close issues when done
   - Reference issues in commits: `git commit -m "Fix #12: Add rate limiting"`

---

**Total Issues:** 25  
**Estimated Timeline:** 14 weeks  
**Critical Path:** Issues #1-4 → #6-7 → #10-12 → #16-18 → #19-22
