# Google Play Store Launch Plan

**Last Updated:** January 10, 2026  
**Status:** Packaging-ready; monetization + QA pending

> For a full production readiness + paywall plan, see `docs/production-audit-2026-01-02.md:1`.

## Build Artifacts

| File | Location | Size |
|------|----------|------|
| Signed APK | `android-twa/app-release-signed.apk` | 1.7MB |
| AAB Bundle | `android-twa/app-release-bundle.aab` | 1.8MB |
| TWA Manifest | `android-twa/twa-manifest.json` | - |
| Keystore | `android-twa/mklanguage.keystore` | - |

## Digital Asset Links

✅ **Live at:** `https://mklanguage.com/.well-known/assetlinks.json`

```json
{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.mklanguage.twa",
    "sha256_cert_fingerprints": [
      "4C:6D:EA:CF:77:55:3A:40:09:D8:94:5E:97:D1:9A:FC:8C:7D:B8:28:03:1F:A8:EC:6B:9F:73:FC:44:F7:D2:02"
    ]
  }
}
```

## App Configuration

- **Package Name:** `com.mklanguage.twa`
- **App Name:** MK Language Lab
- **Domain:** mklanguage.com
- **Keystore Alias:** mklanguage
- **Min SDK:** 21 (Android 5.0)
- **Target SDK:** Verify in Bubblewrap build (match Play Console requirements)

---

## Play Store Listing Content

### Short Description (80 chars max)
```
Learn Macedonian with lessons, practice, translation, and real stories
```

### Full Description (4000 chars max)
```
MK Language Lab (Македонски) - Your Gateway to Learning Macedonian

Master the Macedonian language with a modern, mobile-first learning experience. Whether you're a heritage speaker reconnecting with your roots, a traveler preparing for your next adventure, or simply passionate about learning a new language, MK Language Lab provides everything you need.

🎯 KEY FEATURES

📚 Structured Learning Paths
Build a foundation with A1-B1 lessons and guided progress.

🎮 Interactive Practice
Vocabulary drills, Word Sprint sessions, and grammar exercises with instant feedback.

🌐 Macedonian ↔ English Translation
Translate text in both directions and revisit your history anytime.

📖 Reader Mode + Real News
Read graded stories and real Macedonian news to build comprehension in context.

🏆 Motivation & Progress
Track XP, streaks, and daily goals to stay consistent.

🔊 Pronunciation Support
Text-to-speech audio on supported items helps you hear how words sound.

📱 DESIGNED FOR MOBILE
Clean, touch-friendly UI with English + Macedonian language support.

🇲🇰 WHY MACEDONIAN?
Macedonian is a beautiful South Slavic language spoken by approximately 2 million people. It's the official language of North Macedonia and features a unique Cyrillic alphabet. Learning Macedonian opens doors to Balkan culture, history, and authentic travel experiences.

📚 PERFECT FOR
• Heritage speakers wanting to improve their skills
• Travelers planning to visit North Macedonia
• Language enthusiasts exploring Slavic languages
• Anyone with Macedonian family or friends

Start your Macedonian learning journey today with MK Language Lab!

Среќно учење! (Happy learning!)
```

### App Category
**Education** (subcategory: Language Learning)

### Content Rating
Suitable for all ages (PEGI 3 / Everyone)

---

## Required Store Assets

| Asset | Dimensions | Format |
|-------|------------|--------|
| App Icon | 512x512 | PNG (32-bit, no alpha) |
| Feature Graphic | 1024x500 | PNG or JPEG |
| Phone Screenshots | 1080x1920 (or 16:9) | PNG or JPEG |

### Recommended Screenshots (2-8 required)
1. Dashboard/Home screen
2. Practice session (Word Sprint or grammar)
3. Practice exercise
4. Translation tool
5. News feed
6. Progress/gamification view

---

## Submission Steps

### 1. Create Google Play Developer Account
- URL: https://play.google.com/console
- One-time fee: $25 USD
- Requires Google account

### 2. Create New App
- Select "App" (not game)
- Choose "Free" or "Paid"
- Declare it as an app (not game)

### 3. Upload AAB Bundle
- Use `app-release-bundle.aab` (NOT the APK)
- Play Store requires AAB format for new apps

### 4. Complete Store Listing
- Paste short/full descriptions above
- Upload all graphics
- Set category and content rating

### 5. Set Up App Content
- Complete privacy policy (required)
- Fill content rating questionnaire
- Declare target audience

### 6. Submit for Review
- Typical review time: 1-3 days
- May take up to 7 days for first submission

---

## Testing Before Submission

### Install APK on Device
```bash
# Via ADB (if device connected)
adb install android-twa/app-release-signed.apk

# Or transfer manually via USB/email/Drive
```

### Verify TWA Mode
- App should open WITHOUT Chrome address bar
- If address bar shows, wait 24h for Digital Asset Links propagation

### Rebuild if Needed
```bash
cd android-twa
bubblewrap build
```

---

## Important Notes

1. **Keystore Security:** The `mklanguage.keystore` file is required for ALL future updates. Keep it safe and backed up. If lost, you cannot update the app.

2. **Domain Verification:** The assetlinks.json must remain accessible at the `.well-known` path for TWA verification to work.

3. **Version Updates:** When releasing updates, increment `versionCode` and `versionName` in `twa-manifest.json` before rebuilding.

4. **Privacy Policy:** You'll need a privacy policy URL for Play Store submission. Use `https://mklanguage.com/en/privacy`.
