# Andri Feature Implementation Plan
**Based on:** Andri's content proposal (2025-11-08)
**Goal:** Integrate her vision for vocabulary content with formality, audio, and images

---

## 📋 Andri's Proposed Format

```json
{
  "macedonian": "Денес му е роденден на Иван.",
  "english": "Today is Ivan's birthday.",
  "context": "Used to inform someone about Ivan's birthday, often in casual conversations or greetings.",
  "formality": "neutral"
}
```

Plus suggestions for:
- **Audio:** Pronunciation recordings
- **Images:** Comprehensible input (pictures with descriptions)

---

## ✅ What We Already Support

| Feature | Status | Field |
|---------|--------|-------|
| Macedonian text | ✅ | `macedonian` |
| English translation | ✅ | `english` |
| Category/Topic | ✅ | `category` |
| Difficulty level | ✅ | `difficulty` |
| Pronunciation (text) | ✅ | `pronunciation` |
| Example sentences | ✅ | `exampleMk`, `exampleEn` |
| Emoji icons | ✅ | `icon` |
| Part of speech | ✅ | `partOfSpeech` |

---

## 🚧 What We Need to Add

### Priority 1: Formality Field (Required for Andri's Vision)

**Database Change:**
```prisma
model PracticeVocabulary {
  // ... existing fields
  formality      String?   @default("neutral") // formal | neutral | informal
}
```

**Impact:**
- Users can filter by formality level
- Learners know when to use formal vs informal language
- Essential for Macedonian culture (respect levels matter)

**Implementation:**
1. Add migration to add `formality` column
2. Update admin bulk import to support formality
3. Add formality filter to Quick Practice
4. Update UI to show formality badge

**Effort:** 2-3 hours
**Priority:** HIGH (Andri explicitly mentioned this)

---

### Priority 2: Audio Pronunciation URLs

**Database Change:**
```prisma
model PracticeVocabulary {
  // ... existing fields
  audioUrl       String?   // URL to MP3/WAV pronunciation file
}
```

**Storage Options:**
1. **Vercel Blob Storage** (recommended)
   - Integrated with Vercel
   - Free tier: 100GB bandwidth/month
   - Direct upload from admin panel

2. **Cloudinary** (alternative)
   - Free tier: 25GB storage
   - Audio optimization
   - CDN delivery

3. **AWS S3** (enterprise option)
   - Pay-as-you-go
   - Most scalable

**Implementation Steps:**
1. Set up Vercel Blob storage
2. Add `audioUrl` field to schema
3. Create audio upload component in admin panel
4. Add audio player to Word of the Day
5. Add audio player to Quick Practice
6. Support bulk audio upload (zip file with filenames matching vocabulary)

**Effort:** 6-8 hours
**Priority:** HIGH (Andri asked about this)

---

### Priority 3: Image URLs for Visual Learning

**Database Change:**
```prisma
model PracticeVocabulary {
  // ... existing fields
  imageUrl       String?   // URL to comprehensible input image
  imageAlt       String?   // Alt text for accessibility
}
```

**Use Cases:**
- Visual vocabulary learning
- Comprehensible input (picture + word association)
- Better than emojis for complex concepts

**Implementation:**
1. Add `imageUrl` and `imageAlt` fields
2. Image upload in admin panel (same storage as audio)
3. Display images in Quick Practice cards
4. Display images in Word of the Day
5. Support bulk image upload with naming convention

**Effort:** 4-5 hours
**Priority:** MEDIUM (Andri mentioned "comprehensible input")

---

### Priority 4: Richer Context Field

**Current:** We use `category` for topic classification
**Andri's Need:** Contextual usage notes ("Used to inform someone about...")

**Solution:** Add dedicated context field

```prisma
model PracticeVocabulary {
  // ... existing fields
  usageContext   String?   @db.Text // When/how to use this phrase
}
```

**Display:**
- Show in Word of the Day as "Usage Notes"
- Show in Quick Practice as helpful tip
- Include in admin panel for editing

**Effort:** 2 hours
**Priority:** MEDIUM

---

## 🎯 Implementation Phases

### Phase 1: Database Schema Updates (Week 1)
**Goal:** Add all new fields to support Andri's format

Tasks:
- [ ] Create Prisma migration adding:
  - `formality` (String, default "neutral")
  - `audioUrl` (String, nullable)
  - `imageUrl` (String, nullable)
  - `imageAlt` (String, nullable)
  - `usageContext` (Text, nullable)
- [ ] Run migration on production database
- [ ] Update TypeScript types
- [ ] Update bulk import API to accept new fields

**Estimated Time:** 3-4 hours
**Blocker:** None

---

### Phase 2: Admin Panel Enhancements (Week 1-2)
**Goal:** Allow Andri to upload content with all new fields

Tasks:
- [ ] Set up Vercel Blob storage
- [ ] Add formality dropdown to vocabulary form
- [ ] Add audio file upload component
- [ ] Add image file upload component
- [ ] Add usage context textarea
- [ ] Update bulk import to handle:
  - CSV with new columns
  - JSON with new fields
  - Zip files with audio/images + metadata CSV
- [ ] Add preview before import

**Estimated Time:** 8-10 hours
**Blocker:** Phase 1 must be complete

---

### Phase 3: Frontend Display (Week 2)
**Goal:** Show new fields to learners

**Word of the Day:**
- [ ] Display formality badge
- [ ] Add audio player for pronunciation
- [ ] Show image if available
- [ ] Display usage context as "Usage Notes" section

**Quick Practice:**
- [ ] Add formality filter
- [ ] Play audio when revealing answer
- [ ] Show image in flashcard
- [ ] Show usage context as hint

**Estimated Time:** 6-8 hours
**Blocker:** Phase 1 must be complete

---

### Phase 4: Bulk Content Import (Week 2-3)
**Goal:** Import Andri's Google Drive content efficiently

**Approach A: Google Sheets Integration**
1. Andri fills out Google Sheet with standardized columns
2. Export as CSV
3. Upload CSV to admin panel
4. Preview and validate
5. Import with one click

**Approach B: Direct Google Drive Integration**
1. Andri shares Google Drive folder with audio/images
2. We create import script that:
   - Reads CSV metadata file
   - Downloads audio/images from Drive
   - Uploads to Vercel Blob
   - Imports vocabulary with URLs

**Estimated Time:** 6-8 hours
**Blocker:** Phases 1-2 must be complete

---

## 📊 Technical Decisions

### Formality Values
**Recommendation:** Use 3-tier system
- `formal` - Вие form, business, elders
- `neutral` - General use, can use in most situations
- `informal` - Ти form, friends, family

### Audio Format
**Recommendation:** MP3, 128kbps
- Widely supported
- Good quality/size balance
- Easy for Andri to record/upload

### Image Format
**Recommendation:** WebP or JPEG, max 800px width
- Modern, efficient format
- Good for web display
- Keep file sizes reasonable

### Storage Limits
**Free Tier (Vercel Blob):**
- 100GB bandwidth/month
- Estimate: ~500 audio files (2MB each) = 1GB storage
- Estimate: ~1000 images (500KB each) = 500MB storage
- Should be sufficient for initial content

---

## 💰 Cost Estimate

**Vercel Blob Storage (Free Tier):**
- Storage: Free up to 100GB
- Bandwidth: Free up to 100GB/month
- Requests: Free up to 10M/month

**Expected Usage:**
- 500 vocabulary entries with audio = ~1GB storage
- 500 entries with images = ~500MB storage
- Monthly bandwidth: ~10GB (assuming 1000 active users)

**Conclusion:** Should stay within free tier for Phase 1-2

---

## 🚀 MVP Recommendation

**For First Import (Week 1-2):**
Start with fields we already support:
1. ✅ macedonian, english (required)
2. ✅ category (map from Andri's topics)
3. ✅ pronunciation (text guide)
4. ✅ exampleMk, exampleEn (use her "context" here)
5. ✅ icon (emojis for now)

**Then Add (Week 2-3):**
6. ➕ formality (new field)
7. ➕ audioUrl (new field, after storage setup)
8. ➕ imageUrl (new field, optional)
9. ➕ usageContext (new field, her "context" notes)

**Benefits of Phased Approach:**
- Andri can start contributing immediately
- We can validate format and content quality
- Less risk of breaking existing features
- Incremental improvements

---

## 📋 Next Steps

### For Development Team:
1. Review this plan with Vini
2. Create GitHub issues for each phase
3. Prioritize Phase 1 (database schema)
4. Set up Vercel Blob storage account
5. Create migration scripts

### For Andri:
1. Access admin panel and review current vocabulary
2. Start preparing content in suggested format (see ANDRI_IMPORT_FORMAT.md)
3. Begin with 10-20 test entries using current fields
4. Provide feedback on admin UI and import process
5. Record sample audio files for testing

### Immediate Questions for Andri:
- Would you prefer Google Sheets or CSV for bulk import?
- Do you already have audio files, or will you record new ones?
- What image style do you envision (photos, illustrations, clipart)?
- How many entries can you realistically provide in Phase 1? (target: 200-300)

---

**Status:** Proposal - Awaiting approval
**Next Review:** After Andri reviews admin panel and provides feedback
