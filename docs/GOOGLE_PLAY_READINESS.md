# Google Play Store Readiness Checklist

**Last Updated:** December 12, 2024
**Target Launch:** Q1 2025
**Status:** IN PROGRESS

---

## Executive Summary

MK Language Lab is a Progressive Web App (PWA) for Macedonian language learning. This document outlines the requirements and improvements needed to prepare for Google Play Store distribution via TWA (Trusted Web Activity).

---

## 1. PWA Technical Requirements

### Core PWA Features
- [x] Service Worker registered and functional
- [x] Web App Manifest (manifest.json) configured
- [x] App icons in all required sizes (72, 96, 128, 144, 152, 192, 384, 512px)
- [x] Splash screens configured
- [x] Offline fallback page functional (`/offline`)
- [x] HTTPS enabled (required for Play Store)
- [x] Start URL configured correctly

### Performance Metrics (Lighthouse)
- [ ] Performance Score > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

**Current Status:** Need to run Lighthouse audit and optimize as needed.

---

## 2. User Interface Requirements

### Mobile-First Design
- [x] Responsive layouts for all screen sizes (320px - 428px mobile)
- [x] Touch targets minimum 44px × 44px
- [x] No horizontal scrolling on mobile
- [x] Safe area insets for notched devices
- [x] Bottom navigation for mobile screens

### Reader Feature Improvements (Completed Dec 12, 2024)
- [x] Button alignment fixed (flex layout with consistent sizing)
- [x] Shorter mobile-friendly labels added
- [x] Popover positioning improved (bottom on mobile, collision detection)
- [x] Touch targets increased to 44px minimum
- [x] Focus Mode clarity enhanced with tooltip

### Remaining UI Fixes Needed
- [ ] Fix truncated text on Quick Practice "Reveal answer" button
- [ ] Fix input placeholder truncation on Practice page
- [ ] Remove version badges from production UI
- [ ] Ensure all loading states have proper skeletons
- [ ] Verify error states have retry options

---

## 3. Content Requirements

### Localization
- [x] English (en) translations complete
- [x] Macedonian (mk) translations complete
- [x] Next-intl configured for locale switching
- [x] RTL support not needed (neither language is RTL)

### Legal Pages
- [x] Privacy Policy accessible (`/privacy`)
- [x] Terms of Service accessible (`/terms`)
- [x] About page accessible (`/about`)
- [ ] Verify privacy policy covers Play Store requirements
- [ ] Add data collection disclosure if needed

### Content Quality
- [x] 382 vocabulary items with contextual sentences
- [x] Categories: greetings, food, family, time, activities, emotions, etc.
- [ ] Review content for accuracy (native speaker verification)
- [ ] Add more vocabulary for underrepresented categories (work, travel, nature)
- [ ] Target: 500+ vocabulary items for launch

---

## 4. Testing Requirements

### Automated Testing
- [x] Unit tests (Vitest) - 137 tests passing
- [x] E2E tests (Playwright) - 131+ passing, ~70 pre-existing failures
- [x] Type checking (TypeScript) - passing
- [x] Linting (ESLint) - 6 warnings, 0 errors

### Pre-Launch Testing Needed
- [ ] Fix critical E2E test failures
- [ ] Add Reader-specific E2E tests
- [ ] Manual testing on various Android devices
- [ ] Test on Chrome Mobile, Samsung Internet, Firefox Android
- [ ] Verify PWA install flow works correctly

### Device Testing Matrix
| Device | Screen Size | Status |
|--------|-------------|--------|
| Android Phone (small) | 320px-374px | ⏳ Pending |
| Android Phone (medium) | 375px-413px | ⏳ Pending |
| Android Phone (large) | 414px+ | ⏳ Pending |
| Android Tablet | 768px+ | ⏳ Pending |
| Chrome Mobile | Various | ⏳ Pending |
| Samsung Internet | Various | ⏳ Pending |

---

## 5. Play Store Assets

### Required Assets
- [ ] App icon (512×512px PNG, no alpha)
- [ ] Feature graphic (1024×500px)
- [ ] Phone screenshots (2-8 screenshots, 16:9 or 9:16)
- [ ] Tablet screenshots (optional, 7" and 10")
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] App category: Education
- [ ] Content rating questionnaire completed

### Suggested App Store Copy

**Short Description:**
Learn Macedonian with AI-powered translations, vocabulary practice, and interactive lessons.

**Full Description (Draft):**
MK Language Lab (Македонски) is your modern companion for learning the Macedonian language. Whether you're a complete beginner or looking to improve your fluency, our app provides:

🎯 **Smart Translation**
- English ↔ Macedonian translation
- Word-by-word breakdown for understanding
- Context-aware translations

📚 **Interactive Practice**
- 380+ vocabulary words with contextual sentences
- Flashcard and cloze deletion exercises
- Daily practice goals and streaks

📖 **Reader Mode**
- Word-by-word text analysis
- Tap any word for instant translation
- Focus mode for deep learning

📰 **Macedonian News**
- Real Macedonian news articles
- Improve reading comprehension
- Stay connected to Macedonian culture

🏆 **Gamification**
- XP points and daily streaks
- Progress tracking
- Achievement badges

---

## 6. Technical Configuration

### TWA (Trusted Web Activity) Setup
- [ ] Digital Asset Links file configured (/.well-known/assetlinks.json)
- [ ] TWA wrapper app created (Android Studio or Bubblewrap)
- [ ] Signing key generated and stored securely
- [ ] App signing configured in Play Console

### Environment Variables for Production
- [x] DATABASE_URL configured (PostgreSQL)
- [x] GOOGLE_PROJECT_ID configured
- [x] GOOGLE_APPLICATION_CREDENTIALS_JSON configured
- [x] AUTH_SECRET configured
- [ ] Verify all production env vars are set in Vercel

---

## 7. Security & Privacy

### Security Audit
- [x] No secrets in client code
- [x] API routes properly secured
- [x] Input validation on all forms
- [x] Rate limiting configured
- [ ] Security headers verified (CSP, HSTS, etc.)

### Privacy Compliance
- [ ] GDPR compliance (for EU users)
- [ ] Data export functionality (`/api/user/export`) verified
- [ ] Account deletion available
- [ ] Analytics consent if using tracking
- [ ] Clear data collection practices in privacy policy

---

## 8. Starter Deck Expansion Plan

### Current State (382 items)
| Category | Count | Priority |
|----------|-------|----------|
| Activities | 85 | ✓ Good |
| Food | 45 | ✓ Good |
| Family | 44 | ✓ Good |
| Time | 40 | ✓ Good |
| Greetings | 37 | ✓ Good |
| Emotions | 31 | ✓ Good |
| Health | 28 | ✓ Good |
| Politeness | 17 | ✓ Good |
| Questions | 10 | Expand |
| Weather | 5 | Expand |
| Travel | 5 | Expand |
| Transport | 5 | Expand |
| Shopping | 5 | Expand |
| Numbers | 5 | Expand |
| Nature | 5 | Expand |
| Culture | 5 | Expand |
| Places | 4 | Expand |
| Work | 3 | Expand |

### Expansion Targets (for 500+ items)
1. **Work/Business** - Add 15 items (office, jobs, meetings)
2. **Travel** - Add 15 items (airport, hotel, directions)
3. **Shopping** - Add 10 items (clothing, prices, stores)
4. **Numbers** - Add 15 items (ordinals, large numbers, math)
5. **Weather** - Add 10 items (seasons, temperature)
6. **Nature** - Add 10 items (animals, plants, landscapes)
7. **Questions** - Add 10 items (who, what, where, when, why, how)
8. **Daily Routines** - Add 15 items (morning, evening, chores)
9. **Technology** - Add 10 items (phone, computer, internet)
10. **Verbs (Common)** - Add 20 items (action verbs, auxiliary verbs)

**Note:** Do NOT copy ClozeMaster content - create original sentences.

---

## 9. Launch Checklist (Final)

### Week Before Launch
- [ ] All critical bugs fixed
- [ ] Final Lighthouse audit > 80
- [ ] All store assets uploaded
- [ ] App description and screenshots finalized
- [ ] TWA wrapper tested on multiple devices
- [ ] Privacy policy reviewed by legal

### Launch Day
- [ ] Verify production environment
- [ ] Submit to Play Store review
- [ ] Prepare for user feedback
- [ ] Monitor error tracking (Sentry)
- [ ] Social media announcement ready

### Post-Launch
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track install/uninstall metrics
- [ ] Plan first update based on feedback

---

## 10. Known Issues & Risks

### E2E Test Failures (Pre-existing)
Many E2E tests are failing due to:
1. Snapshot differences after UI updates (need refresh)
2. Navigation viewport tests needing selector updates
3. Accessibility tests expecting specific aria roles

**Mitigation:** These are test maintenance issues, not app bugs. Update tests before launch.

### ClozeMaster Content
- ClozeMaster content is proprietary and cannot be used
- Must create original vocabulary and sentences
- Consider AI assistance for generating sentences (with human review)

### Performance on Low-End Devices
- PWA should work but may be slower on budget Android phones
- Consider adding "lite mode" for low-end devices in future

---

## Appendix: File Changes Made (Dec 12, 2024)

### Reader UI Improvements
1. `components/reader/ReaderWorkspace.tsx`
   - Fixed button alignment with flexbox
   - Added shorter mobile labels
   - Added copy icon to copy button
   - Increased button height to 44px

2. `components/reader/WordByWordDisplay.tsx`
   - Changed popover positioning to bottom (better for mobile)
   - Added collision detection and padding
   - Reduced popover width on small screens
   - Increased touch targets to 44px minimum
   - Added max-height with scroll for long content

3. `messages/en.json`
   - Added `readerRevealShowShort`, `readerRevealHideShort`
   - Added `readerFocusOnShort`, `readerFocusTooltip`
   - Added `readerCopyShort`

4. `messages/mk.json`
   - Added corresponding Macedonian translations

5. `docs/READER_IMPROVEMENT_PLAN.md` (new)
   - Comprehensive improvement plan

6. `docs/GOOGLE_PLAY_READINESS.md` (this file)
   - Launch readiness checklist

### Test Updates
1. `e2e/translate.spec.ts`
   - Updated direction button selectors to match actual implementation
   - Fixed page load test to look for h1 heading
