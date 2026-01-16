# QA Checklist - v2.0 Mobile App

Pre-release validation checklist for Android app.

## Test Environment

- [ ] Physical Android device OR emulator
- [ ] Stable internet connection for API tests
- [ ] Test account credentials ready

---

## Authentication

### Sign In
- [ ] Email/password sign in works
- [ ] Error shown for invalid credentials
- [ ] Loading state displays during auth
- [ ] Redirects to Home after successful sign in

### Sign Out
- [ ] Sign out button works from Profile
- [ ] Redirects to sign-in screen
- [ ] Session cleared (can't access tabs)

### Register
- [ ] Registration form works
- [ ] Validation for email format
- [ ] Password requirements enforced
- [ ] Success creates account and signs in

### Forgot Password
- [ ] Opens forgot password flow
- [ ] Sends reset email (external link)

---

## Home Screen

- [ ] Dashboard loads without crash
- [ ] Welcome message displays
- [ ] Navigation to other tabs works
- [ ] Pull-to-refresh works (if implemented)

---

## Learn Flow

### Level Selection
- [ ] A1, A2, B1 levels display
- [ ] Level cards show progress
- [ ] Tapping level navigates to lessons

### Lesson List
- [ ] Lessons display for selected level
- [ ] Completion indicators show
- [ ] Back navigation works

### Lesson Runner
- [ ] Lesson content loads
- [ ] 4 sections navigate correctly
- [ ] Exercises are interactive
- [ ] Progress saves on completion
- [ ] Return to lesson list works

---

## Practice Flow

### Practice Hub
- [ ] Hub screen loads
- [ ] Mode selection works (if implemented)
- [ ] Card count displays
- [ ] Start Practice button works

### Practice Session
- [ ] Cards display correctly
- [ ] Multiple choice taps register
- [ ] Cloze input works
- [ ] Typing input accepts text
- [ ] TapWords selection works
- [ ] Matching pairs work
- [ ] Progress bar updates
- [ ] Session completes successfully

### Results Screen
- [ ] Results display after session
- [ ] Score/stats shown
- [ ] Return navigation works

---

## Reader Flow

### Story List
- [ ] Stories load and display
- [ ] Level filter chips work (All/A1/A2/B1)
- [ ] Story cards show title, difficulty, duration
- [ ] Pull-to-refresh works
- [ ] Tap navigates to story

### Story Viewer
- [ ] Story content loads
- [ ] Text is readable (proper font size)
- [ ] Scrolling works smoothly
- [ ] Progress saves on scroll

### Tap-to-Translate
- [ ] Tapping word shows popup
- [ ] Translation displays
- [ ] POS badge shows (if available)
- [ ] Save to glossary works
- [ ] Popup closes on dismiss

---

## Translator

### Translation
- [ ] Input field accepts text
- [ ] Character counter updates
- [ ] Direction toggle works (EN→MK / MK→EN)
- [ ] Swap button swaps content
- [ ] Translate button calls API
- [ ] Loading state shows
- [ ] Result displays
- [ ] Error state with retry (if API fails)

### Copy & Clear
- [ ] Copy button copies result
- [ ] "Copied!" confirmation shows
- [ ] Clear (X) button clears input

### History
- [ ] History button opens modal
- [ ] History items display
- [ ] Tap loads item into input
- [ ] Clear history works
- [ ] Empty state shows when no history

---

## Profile

### Profile Screen
- [ ] Avatar with initials displays
- [ ] User email shows
- [ ] Stats cards display (XP, Streak, Lessons, Practice)
- [ ] Pull-to-refresh reloads stats
- [ ] Settings button opens settings
- [ ] Sign out button works

### Settings Screen
- [ ] Back navigation works
- [ ] Email displays (read-only)
- [ ] Change Password opens browser
- [ ] Version number displays
- [ ] Clear Cache clears data
- [ ] Privacy Policy opens browser
- [ ] Terms of Service opens browser

---

## General UX

### Navigation
- [ ] Tab bar displays all tabs
- [ ] Tab icons and labels correct
- [ ] Active tab highlighted
- [ ] Tab switching is smooth

### Visual
- [ ] Dark theme consistent throughout
- [ ] No broken layouts
- [ ] Text is legible
- [ ] Touch targets are adequate size
- [ ] Loading states display properly

### Error Handling
- [ ] Network errors show user-friendly message
- [ ] Retry options available
- [ ] App doesn't crash on errors

### Performance
- [ ] App launches within reasonable time
- [ ] Transitions are smooth
- [ ] No noticeable lag or jank
- [ ] Memory usage reasonable

---

## Notes

_Add testing notes here_

---

**Tested by:** _________________
**Date:** _________________
**Device:** _________________
**OS Version:** _________________
**App Version:** 2.0.0
