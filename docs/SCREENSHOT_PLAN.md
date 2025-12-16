# Play Store Screenshot Narrative & Capture Plan

## Overview
Screenshots tell the app's story visually. Each screenshot should have a clear purpose and show the app in action with realistic, compelling content.

**Target:** 8 phone screenshots (required minimum: 2)
**Dimensions:** 16:9 aspect ratio or device-specific (1080x1920 for phone)
**Format:** PNG or JPEG

---

## Screenshot Narrative Arc

### Screenshot 1: Hero/Hook - "Learn Macedonian Naturally"
**Purpose:** Immediate value proposition
**Screen to Capture:** Dashboard or Homepage with key features visible
**Content Shown:**
- Clean, modern interface
- "Learn Macedonian" headline clear
- Quick Practice widget visible
- Daily streak indicator
- Current XP progress

**Title Overlay:** "Master Македонски at Your Own Pace"
**Caption:** "Interactive lessons, practice drills, and real content"

**Notes:**
- This is the first impression - make it count
- Show the app is modern and professional
- User should see "Learn" section prominently

---

### Screenshot 2: Grammar Foundation - "Clear Explanations"
**Purpose:** Show the teaching quality
**Screen to Capture:** Grammar lesson card or Grammar Explorer
**Content Shown:**
- A grammar topic (e.g., "Definite Articles" or "Verb Conjugation")
- Side-by-side Macedonian and English text
- Clear formatting with examples
- Visual hierarchy that's easy to follow

**Title Overlay:** "Grammar Made Clear"
**Caption:** "Understand the 'why' behind the language"

**Notes:**
- Choose a grammar card that shows both languages clearly
- Avoid overwhelming content - pick something digestible
- Show that we explain, not just drill

---

### Screenshot 3: Practice in Action - "Interactive Drills"
**Purpose:** Show the practice system
**Screen to Capture:** Quick Practice session mid-drill
**Content Shown:**
- Practice prompt with Macedonian text
- Input field with partial answer
- Progress indicator (3/5 correct)
- Accuracy percentage
- Clean, distraction-free interface

**Title Overlay:** "Practice with Instant Feedback"
**Caption:** "Adaptive drills that match your level"

**Notes:**
- Show an active session, not empty state
- Display progress indicators clearly
- Show the accuracy tracking

---

### Screenshot 4: Feedback & Learning - "Mistake Review"
**Purpose:** Show that errors are learning opportunities
**Screen to Capture:** Practice feedback screen OR completion modal with stats
**Content Shown:**
- Session complete modal with stats:
  - Correct answers: 5
  - Total attempts: 7
  - Accuracy: 85%
- Encouragement message visible
- "Review Mistakes" button prominent

**Title Overlay:** "Learn from Every Attempt"
**Caption:** "Review mistakes and track your progress"

**Notes:**
- Show realistic stats (not 100% - that's not relatable)
- Display the encouragement system
- Highlight the review feature

---

### Screenshot 5: Pronunciation - "Hear the Language"
**Purpose:** Show audio support (with transparency)
**Screen to Capture:** Practice screen with audio player visible OR lesson with pronunciation
**Content Shown:**
- Macedonian word or phrase
- Audio play button clearly visible
- Maybe show audio wave or playing indicator
- Clean, simple interface

**Title Overlay:** "Pronunciation Support"
**Caption:** "Hear words and phrases with TTS audio"

**Notes:**
- **CRITICAL:** Caption must mention "TTS" or "text-to-speech"
- Be transparent - this isn't native audio
- But show it as a valuable learning tool

---

### Screenshot 6: Real Content - "Immerse Yourself"
**Purpose:** Show authentic Macedonian content
**Screen to Capture:** News reader or Reader section with article
**Content Shown:**
- Macedonian news article headline
- Article preview text in Macedonian
- Category tags (Politics, Culture, etc.)
- Modern, readable typography
- "Read more" or similar CTA

**Title Overlay:** "Read Real Macedonian News"
**Caption:** "Stay immersed with daily articles and content"

**Notes:**
- Choose an article with clear, professional layout
- Show that content is authentic, not toy examples
- Highlight the immersion value

---

### Screenshot 7: Custom Tools - "Your Personal Study Lab"
**Purpose:** Show customization and ownership
**Screen to Capture:** Custom deck creation OR Saved phrases view
**Content Shown:**
- Custom flashcard deck interface
- User-created cards or saved translator results
- Ability to organize and personalize
- Shows user has control

**Title Overlay:** "Create Your Own Study Materials"
**Caption:** "Custom decks, saved phrases, and personal vocabulary"

**Notes:**
- Show that users can build their own content
- Display saved phrases or custom cards
- Emphasize ownership and personalization

---

### Screenshot 8: Progress & Motivation - "Track Your Journey"
**Purpose:** Show gamification and progress tracking
**Screen to Capture:** Achievement screen OR Dashboard with XP/streak/hearts
**Content Shown:**
- Daily XP progress (e.g., 120/150 XP)
- Streak counter (e.g., 7-day streak 🔥)
- Hearts remaining (e.g., 4/5 hearts)
- Difficulty level badge
- Maybe an unlocked achievement

**Title Overlay:** "Stay Motivated with Daily Goals"
**Caption:** "Track streaks, earn XP, and unlock achievements"

**Notes:**
- Show realistic progress (not brand new, but not maxed out)
- Display multiple gamification elements
- Make it feel rewarding but achievable

---

## Technical Requirements

### Screenshot Specs
- **Format:** PNG (preferred) or JPEG
- **Phone screenshots:** 1080x1920 px or 1080x2340 px (16:9 or taller)
- **Tablet screenshots:** 1920x1080 px or 2560x1600 px (optional but recommended)
- **Max file size:** 8 MB per screenshot
- **Color space:** sRGB

### What to Avoid
❌ Placeholder text ("Lorem ipsum", "Test user", etc.)
❌ Debug info or developer tools
❌ Empty states (show realistic content)
❌ Personal information (real names, emails)
❌ Outdated UI or inconsistent design
❌ Low resolution or blurry images
❌ Misleading content (features that don't exist)

### What to Include
✅ Realistic user data (fake but believable)
✅ Consistent branding and colors
✅ High-quality, sharp images
✅ Actual app screens (not mockups)
✅ Clear, readable text
✅ Proper device bezels or clean crops
✅ Localized content (mix of English and Macedonian)

---

## Capture Process

### Preparation
1. **Set up test account** with realistic progress:
   - 5-10 completed practice sessions
   - 3-5 saved phrases
   - 1-2 custom decks
   - Streak: 3-7 days
   - XP: Mid-range (60-120/150 daily goal)

2. **Clean the UI:**
   - No debug overlays
   - No console errors
   - Proper loading states
   - Smooth animations

3. **Choose content carefully:**
   - Use real Macedonian words/phrases (not "test123")
   - Pick representative grammar topics
   - Show actual news articles
   - Display realistic accuracy (70-90%, not perfect)

### Capture Method

**Option 1: Browser Screenshots**
- Use Chrome DevTools device emulation
- Set to Pixel 5 or similar (1080x2340)
- Disable scrollbars via CSS
- Capture with full-page screenshot tool

**Option 2: Actual Device**
- Use Android device (Pixel, Samsung, etc.)
- Enable "Show taps" for demo purposes (optional)
- Use Android Studio screenshot tool
- Or use `adb shell screencap`

**Option 3: TWA/WebView**
- Deploy as TWA to test device
- Capture from actual Google Play environment
- Most authentic representation

### Post-Processing
1. **Crop to exact dimensions** (no letterboxing)
2. **Add title overlays** (optional, using Figma/Photoshop):
   - Bold, readable font
   - High contrast with background
   - Positioned at top or bottom
   - Consistent style across all screenshots
3. **Optimize file size** without quality loss
4. **Name files descriptively:**
   - `01_hero_learn_macedonian.png`
   - `02_grammar_clear_explanations.png`
   - etc.

---

## Localization Strategy

### English vs. Macedonian Content
**Recommendation:** Mix both languages in screenshots
- Show English UI labels for accessibility
- Display Macedonian content (words, articles, prompts)
- Demonstrates bilingual learning environment

### Localized Store Listings
If creating separate Macedonian store listing:
- Use same screenshot order
- Translate overlay text to Macedonian
- Keep Macedonian content the same
- Translate captions and title overlays

---

## Alternative: Promotional Video

If you have budget/time for a 30-second video instead of (or in addition to) screenshots:

**Video Script:**
1. **0-3s:** App opens, splash screen to dashboard (logo reveal)
2. **3-10s:** Quick Practice session:
   - User types answer
   - Gets feedback "Correct!"
   - Next question appears
3. **10-17s:** Grammar lesson scroll:
   - Clean formatting
   - Macedonian + English side-by-side
4. **17-24s:** News reader:
   - Scroll through article
   - Tap to read full story
5. **24-27s:** Achievement unlocked animation
6. **27-30s:** End card: "Learn Македонски Naturally" + CTA

**Music:** Upbeat, modern, not distracting
**Voiceover:** Optional (or just text overlays)

---

## Quality Checklist

Before submitting screenshots:

- [ ] All screenshots are 1080x1920 or taller
- [ ] No personal information visible
- [ ] Realistic content (no placeholders)
- [ ] Consistent UI across all screenshots
- [ ] Clear, readable text
- [ ] Shows variety of features
- [ ] Pronunciation audio labeled as TTS
- [ ] No misleading claims
- [ ] File size under 8 MB each
- [ ] Proper file names
- [ ] Reviewed on actual phone screen (check readability)

---

## Priority Order (if you can't do all 8)

**Must Have:**
1. Hero/Dashboard (Screenshot 1)
2. Practice in Action (Screenshot 3)

**High Priority:**
3. Grammar Foundation (Screenshot 2)
4. Real Content (Screenshot 6)

**Nice to Have:**
5. Feedback & Learning (Screenshot 4)
6. Progress & Motivation (Screenshot 8)

**Optional:**
7. Pronunciation (Screenshot 5) - only if TTS is clearly labeled
8. Custom Tools (Screenshot 7) - if feature is polished

---

*Last Updated: 2025-12-15*
