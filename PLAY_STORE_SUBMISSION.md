# Google Play Store Submission Guide
## Македонски • MK Language Lab

**Build File:** `mk-language-lab-v1.0.1.aab` (56 MB)
**Package Name:** com.mk.language.lab
**Version:** 1.0.1 (versionCode: 5)

---

## 📝 Store Listing Content

### Short Description (80 characters max)
```
Learn Macedonian through AI conversations, practice, and immersive content
```
(79 characters)

### Full Description

```
Master the Macedonian language with our comprehensive learning platform designed for English speakers!

🗣️ AI-POWERED CONVERSATIONS
Practice real conversations with our GPT-4 powered AI tutor that provides cultural context and instant feedback. Perfect for beginners and advanced learners alike.

📚 INTERACTIVE PRACTICE
- Vocabulary exercises with immediate feedback
- Typing and cloze activities
- Progress tracking with XP and streaks
- Daily practice reminders

🔄 SMART TRANSLATION
Macedonian ↔ English translation powered by Google Cloud, perfect for quick lookups and learning new phrases.

📰 IMMERSIVE LEARNING
- Curated Macedonian news articles
- Daily lessons from @macedonianlanguagecorner
- Real-world content for authentic language exposure

🎯 GAMIFIED EXPERIENCE
- Earn XP points for every practice session
- Build streaks with daily engagement
- Track your progress with detailed stats
- Hearts system for extra motivation

🌍 BILINGUAL INTERFACE
Full English and Macedonian UI - switch languages anytime to match your comfort level.

📱 MOBILE-FIRST DESIGN
Optimized for learning on the go with a clean, modern interface and offline support for practice sessions.

🔒 PRIVACY-FOCUSED
Your learning data stays private. We use minimal, privacy-friendly analytics to improve the app experience.

PERFECT FOR:
✓ English speakers learning Macedonian
✓ Heritage speakers reconnecting with their roots
✓ Travelers preparing for a trip to North Macedonia
✓ Anyone interested in Slavic languages

START YOUR MACEDONIAN LANGUAGE JOURNEY TODAY!

Whether you're a complete beginner or looking to improve your fluency, Македонски • MK Language Lab provides the tools, content, and practice you need to succeed.
```

---

## 🎨 Required Assets

### 1. App Icon ✅
**File:** `/Users/vbattaglia/macedonian-learning-app/public/icon-512.png`
**Size:** 512x512px
**Status:** Ready to upload

### 2. Feature Graphic (NEEDS CREATION)
**Required Size:** 1024x500px
**Format:** PNG or JPG

**Instructions:**
1. Create a banner featuring your app name and a key visual
2. Use your brand colors (#ff5a2c accent, #080b12 dark)
3. Include app name: "Македонски • MK Language Lab"
4. Add tagline: "Learn Macedonian Naturally"

**Quick Creation Options:**
- Use Canva: Search "Google Play Feature Graphic" template
- Use Figma: 1024x500px canvas
- Or use the script: `node scripts/generate-feature-graphic.js`

### 3. Screenshots (NEEDS CREATION)
**Required:** Minimum 2, recommend 4-8
**Size:** 16:9 aspect ratio recommended (e.g., 1920x1080 or 1080x1920 for portrait)
**Format:** PNG or JPG

**Recommended Screenshots:**
1. **Home Screen** - Show main navigation and features
2. **Practice Session** - Interactive vocabulary exercise
3. **AI Tutor Chat** - Conversation with AI
4. **Progress Stats** - XP, streaks, and achievements
5. **News/Content** - Immersive learning content
6. **Translation Tool** - Quick translation feature

**How to Create:**
- Option 1: Install APK on your Android device and take screenshots
- Option 2: Use Android Studio emulator
- Option 3: Use web app screenshots from browser (resize to 16:9)

---

## 🔐 Privacy Policy (NEEDS UPDATE)

**Current URL:** https://mk-language-lab.vercel.app/privacy

**Required Updates:**
Add the following sections for mobile:

```markdown
### Mobile App Data Collection

#### Device Permissions
- **Notifications:** To send daily practice reminders (optional, user-controlled)
- **Storage:** To cache audio files and enable offline practice

#### Data Stored Locally
- Practice progress and statistics
- Cached audio files for offline use
- User preferences and settings

#### Third-Party Services (Mobile)
- Expo Push Notifications: For optional practice reminders
- Google Cloud Translation API: For translation features
- OpenAI API: For AI tutor conversations

All mobile data follows the same privacy principles as our web app: no selling of data, minimal collection, and user control over their information.
```

**Action Required:** Update `/privacy` page on your website with mobile-specific content

---

## 📋 Play Console Setup Checklist

### Pre-Submission
- [ ] Have Google Play Console account ($25 one-time fee)
- [ ] Privacy policy updated with mobile sections
- [ ] Feature graphic created (1024x500px)
- [ ] 2-8 screenshots prepared
- [ ] App icon ready (icon-512.png)

### Store Listing
- [ ] App name: "Македонски • MK Language Lab"
- [ ] Short description (copy from above)
- [ ] Full description (copy from above)
- [ ] App icon uploaded
- [ ] Feature graphic uploaded
- [ ] Screenshots uploaded (minimum 2)
- [ ] Privacy policy URL: https://mk-language-lab.vercel.app/privacy
- [ ] Category: Education
- [ ] Content rating: Everyone (educational content)
- [ ] Target audience: Ages 13+
- [ ] Contact email: [Your email]

### App Content
- [ ] Content rating questionnaire completed
- [ ] App access: Provide test credentials if sign-in required
- [ ] News app declaration: No (not a news app)
- [ ] COVID-19 contact tracing: No
- [ ] Data safety form completed
- [ ] Target SDK version: 34+ (automatically set by Expo)

### Release
- [ ] Production track selected
- [ ] AAB file uploaded: `mk-language-lab-v1.0.1.aab`
- [ ] Release notes added: "Initial Android release - Learn Macedonian through AI conversations, interactive practice, and immersive content"
- [ ] Release reviewed and submitted

---

## 🚀 Step-by-Step Upload Process

### 1. Create Google Play Console Account
1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Pay $25 registration fee (one-time)
4. Accept Developer Distribution Agreement

### 2. Create New App
1. Click "Create app"
2. App name: **Македонски • MK Language Lab**
3. Default language: **Macedonian**
4. App or game: **App**
5. Free or paid: **Free**
6. Accept declarations

### 3. Complete Store Listing
1. Navigate to: **Grow > Store presence > Main store listing**
2. Fill in:
   - App name (pre-filled)
   - Short description (80 chars max) - **Copy from above**
   - Full description (4000 chars max) - **Copy from above**
3. Upload graphics:
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Phone screenshots (2-8 images)
4. Categorization:
   - Category: **Education**
   - Tags: language learning, education, Macedonian
5. Contact details:
   - Email: [Your support email]
   - Privacy policy URL: https://mk-language-lab.vercel.app/privacy
6. Click "Save"

### 4. Set Up App Content
1. Navigate to: **Policy > App content**
2. Complete all declarations:
   - **Privacy policy:** Add URL
   - **App access:** All features available without restrictions (or provide test account)
   - **Ads:** No ads
   - **Content ratings:** Complete IARC questionnaire
     - Educational content
     - No violence, sexual content, profanity, etc.
     - Expected rating: Everyone
   - **Target audience:** Age 13+
   - **News app:** No
   - **COVID-19 contact tracing:** No
   - **Data safety:** Complete form
     - Collect: Account info (email for optional sign-in), App activity (practice stats)
     - Share: None
     - All data encrypted in transit

### 5. Create Production Release
1. Navigate to: **Release > Production**
2. Click "Create new release"
3. Upload signed AAB:
   - Click "Upload"
   - Select: `mk-language-lab-v1.0.1.aab`
4. Release name: Auto-generated (1.0.1)
5. Release notes (English):
   ```
   Initial Android release of Македонски • MK Language Lab!

   Features:
   • AI-powered conversational practice
   • Interactive vocabulary exercises
   • Smart Macedonian ↔ English translation
   • Curated news and learning content
   • Gamified experience with XP and streaks
   • Offline practice support

   Start your Macedonian language journey today!
   ```
6. Review release:
   - Check all warnings/errors
   - Fix any issues flagged by Play Console
7. Click "Save" then "Review release"
8. Click "Start rollout to Production"

### 6. Submit for Review
1. Review all sections for completion (green checkmarks)
2. Common issues to fix:
   - Missing privacy policy
   - Incomplete content rating
   - Missing screenshots
   - Data safety form not completed
3. Once all green: Click "Send for review"

### 7. Monitor Review Status
- **Location:** Dashboard > Production track
- **Typical review time:** 2-4 hours to 7 days
- **Status updates:**
  - "In review" → Google is reviewing
  - "Approved" → Live on Play Store!
  - "Rejected" → Check email for reasons, fix and resubmit

---

## 🧪 Testing Before Submission (Recommended)

### Internal Testing Track
Before submitting to production, test the app:

1. Navigate to: **Release > Testing > Internal testing**
2. Create new release
3. Upload the same AAB file
4. Add testers:
   - Create internal testing track
   - Add your email address
5. Share testing link with your device
6. Install and test:
   - Authentication works
   - Practice sessions load
   - Audio plays correctly
   - Offline mode works
   - Notifications work (if enabled)

### What to Test
- [ ] App installs successfully
- [ ] Splash screen displays
- [ ] Home screen loads
- [ ] Sign-in/sign-up works
- [ ] Practice sessions are functional
- [ ] Audio playback works
- [ ] Translation tool works
- [ ] News/content loads
- [ ] Offline mode works (turn off WiFi)
- [ ] App doesn't crash on common actions

---

## ⚠️ Common Rejection Reasons & Fixes

### 1. Privacy Policy Issues
**Problem:** Missing or incomplete privacy policy
**Fix:** Ensure https://mk-language-lab.vercel.app/privacy covers mobile data collection

### 2. Content Rating Incomplete
**Problem:** Didn't complete IARC questionnaire
**Fix:** Complete under App content > Content rating

### 3. Misleading Screenshots
**Problem:** Screenshots don't represent actual app functionality
**Fix:** Use real app screenshots, not marketing material

### 4. Target SDK Version
**Problem:** App targets old Android SDK
**Fix:** Should be automatic with Expo SDK 54 (targets SDK 34+)

### 5. App Crashes
**Problem:** App crashes on launch or during review
**Fix:** Test thoroughly before submission

---

## 📈 Post-Launch Checklist

After approval:
- [ ] App appears in Play Store search
- [ ] Download and test from Play Store
- [ ] Monitor crash reports in Play Console
- [ ] Respond to user reviews
- [ ] Track analytics in Vercel + Play Console
- [ ] Plan first update/improvements

---

## 🆘 Support Resources

- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Build Details:** https://expo.dev/accounts/vbattaglia/projects/makedonski-mk-language-lab/builds/f10cfbd9-8073-4a94-9d49-feba882e8ae2
- **Project Docs:** `/Users/vbattaglia/macedonian-learning-app/docs/`

---

**Ready to Submit?** Follow the steps above and your app will be live on the Google Play Store within a few days!
