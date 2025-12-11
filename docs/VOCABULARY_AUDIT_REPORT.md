# Vocabulary Database Audit Report
**Date:** 2025-11-08
**Total Entries:** 385 words

---

## 📊 Executive Summary

The vocabulary database is in **good overall condition** with excellent data quality. All entries have complete Macedonian and English translations with proper categorization. However, there are several areas for improvement related to Word of the Day integration, difficulty levels, and duplicate entries.

---

## ✅ Strengths

### Data Quality (Excellent)
- ✅ **Zero missing translations** - All 385 words have both Macedonian and English
- ✅ **Complete categorization** - Every word is assigned to a category
- ✅ **All entries active** - No inactive/deprecated words cluttering the database

### Category Distribution (Good)
Strong coverage across 20 categories with balanced distribution:

| Category | Count | % of Total |
|----------|-------|------------|
| activities | 85 | 22.1% |
| food | 45 | 11.7% |
| family | 44 | 11.4% |
| time | 40 | 10.4% |
| greetings | 38 | 9.9% |
| emotions | 31 | 8.1% |
| health | 30 | 7.8% |
| politeness | 17 | 4.4% |
| questions | 10 | 2.6% |
| Other (11 categories) | 45 | 11.7% |

**Analysis:** The "activities" category is quite large (85 words). Consider breaking it into subcategories like "daily activities," "hobbies," "sports," etc.

---

## ⚠️ Issues Identified

### 1. Word of the Day Pool (CRITICAL)
**Issue:** Zero words are flagged for Word of the Day rotation
**Impact:** The Word of the Day feature may not be populating correctly from the practice vocabulary pool

**Recommendation:**
- Review the `includeInWOTD` flag logic
- Identify which words should be featured as Word of the Day
- Consider flagging high-quality entries with pronunciation and examples

**Action Items:**
- [ ] Check if WOTD is pulling from a separate table instead
- [ ] Decide on criteria for WOTD selection (e.g., beginner words with examples)
- [ ] Create script to flag appropriate words for WOTD

---

### 2. Difficulty Distribution (HIGH PRIORITY)
**Issue:** All 385 words are marked as "beginner" level
**Impact:** No progressive learning path; advanced learners have no filtering options

**Current State:**
- Beginner: 385 (100%)
- Intermediate: 0 (0%)
- Advanced: 0 (0%)

**Recommendation:**
Review vocabulary and assign proper difficulty levels based on:
- Word frequency in everyday conversation
- Grammatical complexity
- Topic sophistication

**Suggested Distribution:**
- Beginner (60%): Common greetings, numbers, basic family, simple food
- Intermediate (30%): Work vocabulary, emotions, complex grammar
- Advanced (10%): Formal language, cultural topics, idioms

**Action Items:**
- [ ] Create difficulty classification guidelines
- [ ] Review and reclassify vocabulary by category
- [ ] Update database with new difficulty levels
- [ ] Add bulk update script for easier management

---

### 3. Duplicate Entries (MEDIUM PRIORITY)
**Issue:** 18 words appear multiple times in the database

**Top Duplicates Identified:**
1. **кој** (who) - 2 entries (IDs: cmhqifdtt008pssd87ga4eq1t, cmhqifdlr008jssd8zhhq70j2)
2. **колку** (how many) - 2 entries (IDs: cmhqifdxa008sssd8ldjr5wqa, cmhqifdvw008rssd8yusslxtb)
3. **баба** (grandma) - 2 entries (IDs: cmhqif61f0020ssd8dapdrck0, cmhqif63m0022ssd8v3142emt)
4. **внука** (granddaughter) - 2 entries (IDs: cmhqif6px002lssd8uay8egci, cmhqif6d1002assd82t4tbtd3)
5. **вкусно** (delicious) - 2 entries (IDs: cmhqif8lj0047ssd8brqzsbt9, cmhqif8ms0048ssd8gboiwbg7)

**Recommendation:**
- Review duplicates manually to determine if they're:
  - True duplicates (merge/delete one)
  - Different forms (e.g., singular/plural) - add clarification
  - Different meanings (add context/notes)

**Action Items:**
- [ ] Export full duplicate list with English translations
- [ ] Review each duplicate for context
- [ ] Merge or differentiate as appropriate
- [ ] Add database constraint to prevent future duplicates

---

### 4. Missing Pronunciation (LOW PRIORITY)
**Issue:** Many words lack pronunciation guides
**Sample Check:** All 5 sampled words (цвет, шума, река, езеро, планина) show "no pronunciation"

**Impact:**
- Users can't learn proper pronunciation without external resources
- Word of the Day fallback uses transliteration instead of native speaker guide

**Recommendation:**
- Prioritize adding pronunciation for:
  - High-frequency words (greetings, numbers, common verbs)
  - Words with difficult sounds for English speakers
  - All Word of the Day candidates

**Action Items:**
- [ ] Work with Andri to add pronunciation guides
- [ ] Create pronunciation import template for bulk updates
- [ ] Consider using Latin script or IPA format consistently

---

## 📈 Growth Recommendations

### Short Term (Weeks 1-2)
1. **Fix WOTD Integration**
   - Verify WOTD pulling mechanism
   - Flag 50-100 beginner words for WOTD rotation
   - Test WOTD feature with flagged words

2. **Resolve Duplicates**
   - Export and review all 18 duplicate pairs
   - Merge or clarify each duplicate
   - Add database uniqueness check

3. **Add Difficulty Levels**
   - Create classification guidelines
   - Reclassify top 100 most-used words
   - Test filtering in Quick Practice

### Medium Term (Weeks 3-4)
4. **Pronunciation Expansion**
   - Add pronunciation for top 100 words
   - Work with Andri on recording or transcription
   - Ensure all WOTD candidates have pronunciation

5. **Category Refinement**
   - Split "activities" into subcategories
   - Add missing categories (technology, education)
   - Balance category sizes

### Long Term (Milestone 2+)
6. **Content Expansion to 300+ Words**
   - Add intermediate and advanced vocabulary
   - Incorporate Andri's existing content
   - Maintain balanced difficulty distribution

---

## 🎯 Priority Action Matrix

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Fix WOTD pool issue | 1-2 hours | High |
| **P1** | Add difficulty levels | 4-6 hours | High |
| **P1** | Resolve duplicates | 2-3 hours | Medium |
| **P2** | Add pronunciations (top 100) | 8-10 hours | High |
| **P2** | Refine categories | 2-3 hours | Medium |
| **P3** | Expand to 300+ words | 15-20 hours | High |

---

## 📝 Next Steps

1. Share this report with Andri for native speaker review
2. Create GitHub issues for P0 and P1 tasks
3. Document manual SQL/Prisma steps for difficulty + WOTD updates (legacy scripts removed)
4. Schedule content expansion planning session

---

**Auditor:** Claude Code Agent
**Database:** Neon PostgreSQL (practiceVocabulary table)
**Note:** Former helper script (`scripts/audit-vocabulary.ts`) was retired; replicate checks via SQL or Prisma as needed.
