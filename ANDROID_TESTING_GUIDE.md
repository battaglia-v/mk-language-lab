# Android PWA Testing Guide

Before submitting to Google Play Store, test the PWA thoroughly on Android devices.

## Quick Test (5-10 minutes)

### 1. Install PWA on Android

**On your Android phone/tablet:**
1. Open **Chrome** browser
2. Navigate to: **https://mk-language-lab.vercel.app**
3. Tap the **⋮** menu (three dots)
4. Select **"Add to Home Screen"** or **"Install app"**
5. Tap **"Add"** or **"Install"**
6. App icon should appear on your home screen

### 2. Core Feature Tests

Test each feature and note any issues:

#### Homepage
- [ ] Word of the Day displays correctly
- [ ] Quick Start cards are readable
- [ ] Navigation menu works
- [ ] Macedonian Cyrillic text displays properly

#### Practice (Quick Practice)
- [ ] Tap "Practice" from homepage
- [ ] Vocabulary quiz loads
- [ ] Can answer questions
- [ ] Instant feedback works
- [ ] Score updates correctly
- [ ] Can navigate between questions

#### Translation Tool
- [ ] Open translation page
- [ ] Enter English text
- [ ] Translation appears in Macedonian Cyrillic
- [ ] Can swap languages (English ↔ Macedonian)
- [ ] Audio pronunciation button works (if available)

#### Word of the Day Detail
- [ ] Tap on WOTD to expand
- [ ] Example sentences display
- [ ] Pronunciation guide shows
- [ ] Cultural notes are readable

#### Learn Modules
- [ ] Navigate to Learn page
- [ ] 4 modules display (Vocabulary, Grammar, Phrases, Pronunciation)
- [ ] Can tap into each module
- [ ] Content loads in each section

#### News Feed
- [ ] Navigate to News page
- [ ] Macedonian articles display
- [ ] Can scroll through feed
- [ ] Articles are readable

#### Resources Page
- [ ] Navigate to Resources
- [ ] Andri attribution banner shows
- [ ] External links work
- [ ] Page layout looks good

### 3. Mobile UX Tests

#### Responsiveness
- [ ] All text is readable (not too small)
- [ ] Buttons are tappable (not too small)
- [ ] No horizontal scrolling required
- [ ] Cards and layouts adapt to screen size

#### Navigation
- [ ] Bottom navigation works (if present)
- [ ] Back button works as expected
- [ ] Menu opens and closes smoothly
- [ ] Can navigate between all pages

#### Performance
- [ ] Pages load quickly (< 3 seconds)
- [ ] Smooth scrolling
- [ ] No lag when tapping buttons
- [ ] Animations are smooth

### 4. Offline Functionality

#### Test Offline Mode
1. Turn on **Airplane Mode** or disable WiFi/cellular
2. Open the installed app
3. Test:
   - [ ] App opens (doesn't show error)
   - [ ] Cached pages load
   - [ ] Offline fallback page appears for uncached content
   - [ ] "You're Offline" message displays appropriately

4. Turn connectivity back on
5. Test:
   - [ ] App reconnects automatically
   - [ ] Content updates when back online

### 5. PWA-Specific Tests

#### Installation
- [ ] App icon displays correctly on home screen
- [ ] App name is readable ("Македонски • MK Language Lab")
- [ ] Icon uses Macedonian colors (red/yellow)

#### App Behavior
- [ ] Opens in standalone mode (no browser chrome)
- [ ] Status bar color matches app theme (#ff5a2c orange)
- [ ] Splash screen shows briefly on launch (if configured)
- [ ] App stays open when switching between apps

#### Updates
- [ ] Close and reopen app
- [ ] Changes from recent commits appear
- [ ] Service worker updates in background

---

## Screenshot Capture

While testing, capture these 8 screenshots for Play Store listing:

### Required Screenshots (Portrait Mode)
1. **Homepage** - Show WOTD widget and Quick Start cards
2. **Quick Practice** - Mid-quiz with Cyrillic text visible
3. **Translation** - Example translation (English → Macedonian)
4. **WOTD Detail** - Expanded view with example and cultural note
5. **Learn Modules** - 4-module grid
6. **Vocabulary Browser** - Category/difficulty view
7. **News Feed** - List of Macedonian articles
8. **Resources** - Andri attribution banner visible

### Screenshot Tips
- Use **portrait orientation**
- Capture full screen (status bar to navigation bar)
- Ensure good lighting/contrast
- Cyrillic text should be clearly visible
- No personal data visible in screenshots

### Android Screenshot Methods
**Method 1 - Button Combo:**
- Press **Power + Volume Down** simultaneously
- Screenshots save to Gallery/Photos

**Method 2 - Quick Settings:**
- Swipe down from top
- Tap **Screenshot** tile

**Method 3 - Google Assistant:**
- Say "Hey Google, take a screenshot"

---

## Common Issues & Fixes

### Issue: Can't install PWA
**Fix:**
- Ensure using Chrome (not Samsung Internet or Firefox)
- Check that site uses HTTPS (it does)
- Try clearing Chrome cache

### Issue: Cyrillic text shows as boxes/�
**Fix:**
- Update Android system fonts
- Try different browser
- Report as bug (should work on Android 5.0+)

### Issue: Offline mode doesn't work
**Fix:**
- Reinstall PWA
- Check service worker in chrome://serviceworker-internals
- Report if persistent

### Issue: App won't update
**Fix:**
- Uninstall and reinstall PWA
- Clear Chrome cache
- Wait 24 hours for service worker update

---

## Testing Devices

### Minimum Requirements
- **Android version:** 5.0+ (Lollipop)
- **Browser:** Chrome 80+
- **Screen:** 320px wide minimum

### Recommended Test Devices
- **Phone:** Any modern Android phone (2020+)
- **Tablet:** Optional but recommended
- **Emulator:** Android Studio AVD with Pixel 6 config

---

## Report Issues

Found a bug during testing? Document it:

### Bug Report Format
```
**Device:** [Phone model, Android version]
**Browser:** [Chrome version]
**Issue:** [What went wrong]
**Steps to reproduce:**
1. Open app
2. Navigate to...
3. Tap on...
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [If possible]
```

Send bug reports to: **macedonianlanguagelab@gmail.com**

---

## Next Steps After Testing

Once testing is complete and all features work:

1. ✅ Export screenshots to computer
2. ✅ Create feature graphic (1024x500px)
3. ✅ Set up Google Play Developer account ($25)
4. ✅ Complete IARC content rating questionnaire
5. ✅ Submit to Play Store

---

**Testing completed?** Mark the date and proceed to Play Store submission using **PLAY_STORE_LISTING.md** for all required content.

**Last updated:** November 9, 2025
