# Google Play Store Launch Plan

**Last Updated:** January 2, 2026  
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
      "F1:F1:A2:E7:8E:EB:C2:C7:24:DC:0A:18:75:70:F8:FF:6B:0B:29:56:E3:8D:7D:1F:4C:81:5E:3E:C0:1B:5A:93"
    ]
  }
}
```

## App Configuration

- **Package Name:** `com.mklanguage.twa`
- **App Name:** MK Language
- **Domain:** mklanguage.com
- **Keystore Alias:** mklanguage
- **Min SDK:** 23 (Android 6.0)
- **Target SDK:** 35 (Android 15)

---

## Play Store Listing Content

### Short Description (80 chars max)
```
Learn Macedonian with AI conversations, practice, translation & news
```

### Full Description (4000 chars max)
```
MK Language Lab (Македонски) – Your Gateway to Learning Macedonian

Master the Macedonian language with an immersive, modern learning experience. Whether you're a heritage speaker reconnecting with your roots, a traveler preparing for your next adventure, or simply passionate about learning a new language, MK Language Lab provides everything you need.

🎯 KEY FEATURES

📖 AI-Powered Conversations
Practice speaking and writing with our intelligent AI tutor. Get instant feedback and corrections on your Macedonian in natural, flowing conversations.

🎮 Interactive Practice Modules
• Vocabulary Builder – Learn new words with audio pronunciation
• Fill-in-the-blank exercises – Test your grammar understanding
• Progress tracking – Monitor your improvement over time

🌐 Smart Translation
Instantly translate between English and Macedonian. Perfect for understanding text or practicing sentence construction.

📰 Macedonian News Feed
Read real Macedonian news articles curated from local sources. Improve your reading comprehension while staying informed about current events.

📱 DESIGNED FOR MOBILE
• Clean, modern interface – Focus on what matters
• Bilingual support – Switch between English and Macedonian UI

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
2. AI Tutor conversation
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

4. **Privacy Policy:** You'll need a privacy policy URL for Play Store submission. Host one at `mklanguage.com/privacy` or similar.
