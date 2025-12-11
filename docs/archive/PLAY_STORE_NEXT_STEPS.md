# Play Store Submission - Next Steps

> ⚠️ **Status (Nov 2025):** Android Play Store work is currently paused. The generated assets referenced below (feature graphic, splash screens, etc.) were removed from `public/` to reduce repo size. Recreate them if/when the Android release cycle resumes.

## ✅ Completed Items

### 1. High-Quality PWA Icons (Deployed)
- **Status:** ✅ Live on production
- **Files:**
  - `icon-192.png` (37KB, was 3.9KB)
  - `icon-512.png` (258KB, was 15KB)
  - `icon-512-maskable.png` (258KB, was 13KB)
- **Action Required:** Reinstall PWA on your Android device to see improved icons
  - Uninstall current app from home screen
  - Visit https://mk-language-lab.vercel.app
  - Install again from Chrome menu

### 2. Feature Graphic
- **Status:** ✅ Generated _(file archived; recreate when needed)_
- **File:** `public/feature-graphic.png` (previously 1024x500px, 502KB)
- **Design:** Ajvar jar icon + app name + tagline + Macedonian colors
- **Location:** Ready in `/public` directory

### 3. High-Res App Icon
- **Status:** ✅ Ready
- **File:** `public/icon-512.png` (512x512px, 258KB)
- **Quality:** Uncompressed, high-quality PNG
- **Location:** Ready for Play Store upload

### 4. Privacy Policy & Terms
- **Status:** ✅ Live
- **URLs:**
  - Privacy: https://mk-language-lab.vercel.app/privacy
  - Terms: https://mk-language-lab.vercel.app/terms
- **Contact Email:** macedonianlanguagelab@gmail.com (updated everywhere)

### 5. Play Store Listing Content
- **Status:** ✅ Complete
- **File:** `PLAY_STORE_LISTING.md`
- **Includes:**
  - Short description (80 chars)
  - Full description (updated, no fake features)
  - Keywords and tags
  - Category: Education > Language Learning
  - Age rating: Everyone (3+)

---

## 🚧 Remaining Tasks

### Priority 1: Screenshot Capture (Required)

**You need 8 phone screenshots in portrait mode:**

1. **Homepage** - Word of the Day widget and Quick Start cards
2. **Quick Practice** - Mid-quiz with Cyrillic text and instant feedback
3. **Translation Tool** - Example translation (English → Macedonian)
4. **Word of the Day Detail** - Expanded view with pronunciation and cultural note
5. **Learn Modules** - 4-module grid (Vocabulary, Grammar, Phrases, Pronunciation)
6. **Vocabulary Browser** - Browse by category/difficulty view
7. **News Feed** - List of Macedonian articles
8. **Resources Page** - External resources with Andri attribution

**How to capture:**
- Use **Power + Volume Down** buttons on Android
- Or say "Hey Google, take a screenshot"
- Screenshots save to Gallery/Photos app

**Requirements:**
- Portrait orientation
- Full screen (status bar to nav bar)
- Cyrillic text clearly visible
- No personal data visible

**Testing Guide:** Follow `ANDROID_TESTING_GUIDE.md` while capturing screenshots

---

### Priority 2: Google Play Developer Account

**Cost:** $25 one-time registration fee

**Sign up at:** https://play.google.com/console/signup

**Steps:**
1. Go to Play Console signup page
2. Sign in with your Google account (use macedonianlanguagelab@gmail.com)
3. Pay $25 registration fee (one-time)
4. Accept Developer Distribution Agreement
5. Complete account details

**Timeline:** Account approved instantly after payment

---

### Priority 3: IARC Content Rating

**What:** International Age Rating Coalition questionnaire

**Where:** Inside Google Play Console after account setup

**Steps:**
1. Open Play Console → Create app
2. Fill in basic app details
3. Go to "Content rating" section
4. Complete IARC questionnaire
5. Answer questions about content (all "No" for this app)
6. Receive rating certificate

**Expected Rating:** IARC 3+ (Everyone)

**Questions You'll Answer:**
- Violence? No
- Sexual content? No
- Language? No (just educational Macedonian)
- Controlled substances? No
- Gambling? No
- User interaction? No (no chat/social features)

**Duration:** 5-10 minutes

---

### Priority 4: Upload Assets to Play Console

Once you have your 8 screenshots:

**In Play Console → Store presence → Main store listing:**

1. **App name:** Македонски • MK Language Lab
2. **Short description:** Copy from `PLAY_STORE_LISTING.md` line 4
3. **Full description:** Copy from `PLAY_STORE_LISTING.md` lines 8-83
4. **App icon:** Upload `public/icon-512.png`
5. **Feature graphic:** Upload `public/feature-graphic.png`
6. **Phone screenshots:** Upload all 8 screenshots (in order)
7. **App category:** Education > Language Learning
8. **Contact email:** macedonianlanguagelab@gmail.com
9. **Privacy policy URL:** https://mk-language-lab.vercel.app/privacy

---

## 📋 Submission Checklist

Before clicking "Submit for review":

- [ ] Reinstalled PWA with new high-quality icons
- [ ] Captured all 8 required screenshots
- [ ] Created Google Play Developer account ($25)
- [ ] Completed IARC content rating questionnaire
- [ ] Uploaded all assets to Play Console
- [ ] Filled in all required store listing fields
- [ ] Added privacy policy URL
- [ ] Reviewed all text for typos
- [ ] Tested app thoroughly on Android device

---

## ⏱️ Timeline Estimate

| Task | Time Required |
|------|---------------|
| Reinstall PWA | 2 minutes |
| Test app + capture screenshots | 15-20 minutes |
| Set up Play Developer account | 10 minutes |
| Complete IARC rating | 10 minutes |
| Upload assets to Play Console | 15 minutes |
| Review and submit | 10 minutes |
| **Total** | **~60-75 minutes** |

**Google Review Time:** 1-7 days (typically 1-3 days for first submission)

---

## 🎯 Your Next Action

**Right now, do this:**

1. Reinstall PWA on your Android phone (see instructions at top)
2. Follow `ANDROID_TESTING_GUIDE.md` to test app
3. Capture 8 screenshots while testing
4. Transfer screenshots to your computer

**Then:**
- Sign up for Google Play Developer account
- Complete IARC questionnaire
- Upload everything

---

## 🆘 If You Get Stuck

### Screenshots not saving?
- Check Gallery/Photos app
- Try different method (buttons vs Google Assistant)
- Ensure storage permissions enabled

### PWA won't install?
- Clear Chrome cache: Settings → Privacy → Clear browsing data
- Make sure using Chrome browser (not Samsung Internet)

### Play Console confusing?
- Google's official guide: https://support.google.com/googleplay/android-developer/answer/9859152
- Most fields are self-explanatory, just copy from PLAY_STORE_LISTING.md

### App rejected?
- Check rejection reason in Play Console
- Most common: missing privacy policy (we have this covered)
- Second most common: inaccurate content rating (answer IARC honestly)

---

## 📞 Support

Questions during submission? Contact:
- **Email:** macedonianlanguagelab@gmail.com
- **Play Console Help:** https://support.google.com/googleplay/android-developer

---

**Last updated:** November 8, 2024
**Status:** Ready for screenshot capture and submission
