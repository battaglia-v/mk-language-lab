# Andri Content Integration Plan
**Partnership: Vincent Battaglia & Andri (Macedonian Language Corner)**

---

## About Andri

**Andri** is a native Macedonian speaker, linguist, and creator of [Macedonian Language Corner](https://macedonianlanguagecorner.com). She provides authentic, culturally-rich Macedonian learning content through:

- 🎥 YouTube channel with comprehensible input videos
- 🎙️ "Makedonkast" podcast (slow, accessible Macedonian)
- 📱 Instagram (@macedonianlanguagecorner) with daily learning posts
- 📝 Weekly blog posts covering language and culture
- 👩‍🏫 One-on-one tutoring on iTalki

**Teaching Approach:** Accessible, practical, and culturally meaningful instruction focused on real-world connection.

---

## Content Available for Integration

### 1. **Video Content** (YouTube)
- Comprehensible input videos with translations
- Slow-paced native speaker content
- Cultural context alongside language instruction

**Integration opportunity:** Embed videos in journey lessons, pronunciation drills

### 2. **Audio Content** (Makedonkast Podcast)
- Slow, comprehensible Macedonian episodes
- Listening practice materials

**Integration opportunity:** Listening exercises, background learning mode

### 3. **Blog Posts**
- Weekly language and culture insights
- Grammar explanations
- Vocabulary guides
- Exercise examples (painting identification, postcard lessons)

**Integration opportunity:** Daily tips, cultural notes, lesson content

### 4. **Instagram Posts**
- Daily micro-lessons
- Visual vocabulary
- Cultural tips
- Engagement content

**Integration opportunity:** "Daily Lesson" feed, push notifications, quick practice prompts

### 5. **Structured Courses**
- Macedonian Language Crash Course (beginner → advanced)
- Leveled curriculum (Beginner, Intermediate, Advanced)

**Integration opportunity:** Journey structure, progressive lesson plans

---

## Content Integration Strategy

### Phase 1: Attribution & Credits (Immediate)
**Timeline:** This week
**Priority:** HIGH

1. Add "Created by Vincent & Andri" to footer
2. Add About page featuring Andri
3. Update Resources page with proper attribution
4. Add links to Macedonian Language Corner

### Phase 2: Existing Content Audit (Week 1-2)
**Timeline:** Next 2 weeks
**Priority:** HIGH

Work with Andri to:
1. Review existing 66 phrases for accuracy
2. Validate cultural appropriateness
3. Get feedback on journey structure
4. Identify which of her existing materials to integrate first

### Phase 3: Content Expansion (Weeks 3-6)
**Timeline:** Milestone 2
**Priority:** MEDIUM

Collaborate with Andri to:
1. Expand to 300+ phrases (using her existing materials)
2. Integrate blog post excerpts as cultural tips
3. Add audio pronunciations (from her podcast/videos)
4. Create intermediate and advanced journeys using her curriculum structure

### Phase 4: Dynamic Content Feed (Weeks 7-10)
**Timeline:** Milestone 3
**Priority:** MEDIUM

Build system to:
1. Display Andri's latest blog posts
2. Feature Instagram content
3. Auto-update "Daily Lesson" section
4. Embed YouTube videos in lessons

---

## Content We Need from Andri

### For Milestone 2 (Content Complete - 4 weeks)

#### 1. **Native Speaker Review** (Priority 1)
- ✅ Review existing 66 phrases for accuracy
- ✅ Validate cultural context notes
- ✅ Correct any grammar/spelling issues
- ✅ Add formality guidance where missing

**Estimated time:** 2-3 hours

#### 2. **Vocabulary Expansion** (Priority 1)
Expand from 66 to 300+ phrases in these categories:
- Numbers and time (1-100, days, months, clock)
- Weather and seasons
- Clothing and appearance
- Activities and hobbies
- Household items
- Body parts and health (expanded)
- Technology and communication
- Celebrations and traditions

**Format needed:**
```
macedonian: "Колку е часот?"
english: "What time is it?"
context: "Asking about the current time"
formality: "neutral"
```

**Estimated time:** 6-8 hours (can reuse her existing content!)

#### 3. **Audio Pronunciations** (Priority 2)
- Record pronunciations for top 100 phrases
- Or: Permission to extract audio from her YouTube/podcast

**Format needed:** MP3 files or links to timestamped videos

**Estimated time:** 3-4 hours OR permission to use existing content

#### 4. **Cultural Notes** (Priority 2)
- Expand cultural context for each journey
- Add "did you know?" tips for family conversations
- Explain formal vs informal usage scenarios

**Estimated time:** 2-3 hours

---

## Dynamic Content Integration Plan

### Instagram Post Integration

**Concept:** Fetch Andri's latest Instagram posts and display as "Daily Lessons"

**Technical approach:**
1. **Option A (Manual):** Andri or you add Instagram post content to a shared Google Sheet
2. **Option B (API):** Use Instagram Basic Display API to fetch posts automatically
3. **Option C (RSS):** If she has an RSS feed for Instagram

**Features:**
- "Daily Lesson from Andri" card on homepage
- Rotates through recent posts
- Links to original Instagram post
- Cached for 24 hours

**Implementation:** Issue #58

### Blog Post Integration

**Concept:** Display latest blog posts in Resources or News section

**Technical approach:**
1. Fetch RSS feed from macedonianlanguagecorner.com
2. Parse and display latest 5 posts
3. Cache for 24 hours
4. Link to full posts on her site

**Features:**
- "Latest from Macedonian Language Corner" section
- Excerpts with "Read more" links
- Proper attribution with her branding

**Implementation:** Issue #59

### YouTube Video Integration

**Concept:** Embed her videos in relevant lessons

**Technical approach:**
1. Curate list of videos matched to lessons
2. Embed using YouTube iframe API
3. Track which videos users watch

**Features:**
- Video pronunciation guides in practice sections
- Cultural immersion videos in journey lessons
- "Watch Andri explain this" buttons

**Implementation:** Issue #60

### Image Upload for Comprehensible Input

**Concept:** Allow vocabulary entries to include images for visual learning

**Technical approach:**
1. Add image field to practiceVocabulary schema
2. Support image uploads in admin panel (CSV + manual)
3. Use Cloudinary or Vercel Blob for storage
4. Display images in WOTD, practice exercises, vocabulary browser

**Features:**
- Visual association for better comprehension
- Support for JPG, PNG, WebP formats
- Optimized lazy loading
- Responsive images for mobile

**Implementation:** Issue #63

### Google Sheets Integration

**Concept:** Enable Andri to manage content via shared Google Sheet

**Technical approach:**
1. Set up Google Sheets API or Zapier integration
2. Create sync script to pull from designated sheet
3. Map columns to database schema
4. Support scheduled or manual sync

**Features:**
- Familiar spreadsheet interface for content creators
- Easy collaboration and review workflow
- Version history via Google Sheets
- Bulk editing capabilities

**Implementation:** Issue #64

### Cultural Notes Expansion

**Concept:** Add rich cultural context throughout the learning experience

**Content needed from Andri:**
- Cultural context for each journey
- "Did you know?" tips
- Formal vs informal usage explanations
- Regional variations and dialect notes

**Features:**
- Cultural notes in journey introductions
- "Did you know?" cards during practice
- Usage context in vocabulary details
- Formality explanations

**Implementation:** Issue #65

---

## Attribution Design

### Footer Credit
```
Created with ❤️ by Vincent Battaglia & Andri
Content by Andri of Macedonian Language Corner 🇲🇰
```

### About Page Section
```
## Meet the Team

### Vincent Battaglia
Developer & Heritage Learner
Building tools to reconnect with Macedonian roots

### Andri
Native Speaker & Linguist
Creator of Macedonian Language Corner
Providing authentic content and cultural insights

[Link to her website]
[Link to her Instagram]
[Link to her YouTube]
```

### Resources Page Header
```
🇲🇰 All content curated and validated by Andri,
native Macedonian speaker and founder of Macedonian Language Corner
```

### Implementation
See ANDRI_ATTRIBUTION_DESIGN.md (creating next)

---

## Collaboration Workflow

### Content Review Cycle
1. You create draft content/features
2. Submit to Andri for review via shared doc
3. Andri provides feedback/corrections
4. You implement changes
5. Andri gives final approval

### Regular Content Updates
**Weekly:**
- Andri shares 1-2 Instagram posts for featured lessons
- You integrate into "Daily Lesson" feed

**Monthly:**
- Andri reviews new phrases/content added
- Andri suggests cultural tips or corrections
- You prioritize her feedback in next sprint

### Communication Channels
- Email for formal reviews
- Google Docs for content collaboration
- GitHub issues for tracking integration tasks
- (Optional) Slack/Discord for quick questions

---

## Roadmap Summary

### Immediate (This Week)
- [x] Research Andri's content
- [x] Add attribution to footer and pages
  - [x] Footer attribution completed
  - [x] About page "Meet the Team" section added
  - [x] Resources page header attribution added
- [x] Create issues for content integration (#55-60, #63-65)
- [ ] Share plan with Andri for feedback

### Milestone 2 (Weeks 1-4)
- [ ] Andri reviews existing 66 phrases
- [ ] Andri provides 234 additional phrases
- [ ] Integrate audio pronunciations
- [ ] Add cultural notes to journeys

### Milestone 3 (Weeks 5-8)
- [ ] Build Instagram post feed
- [ ] Build blog post integration
- [ ] Embed YouTube videos in lessons
- [ ] Auto-updating "Daily Lesson" section

### Milestone 4+ (Weeks 9-14)
- [ ] Advanced journey content from Andri
- [ ] Intermediate journey expansion
- [ ] Podcast integration for listening practice
- [ ] Community features (if Andri interested)

---

**Next Steps:**
1. Share this plan with Andri
2. Get her approval and availability
3. Create GitHub issues for each integration task
4. Start with attribution and existing content review
