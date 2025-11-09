# Agent Synchronization Log

⚠️ **IMPORTANT: READ THIS FILE BEFORE MAKING CHANGES** ⚠️

This file contains critical information about recent changes, breaking patterns, and coordination guidelines for all agents working in parallel on this codebase.

## 📝 AGENT RESPONSIBILITIES

**ALL AGENTS MUST:**

1. **READ** this file before making any changes to the codebase
2. **UPDATE** this file when you make critical changes (see criteria below)
3. **COMMIT** your updates to this file along with your code changes

### What Changes Should Be Documented Here?

**✅ YOU MUST DOCUMENT:**
- Breaking changes or API modifications
- New patterns, utilities, or shared components
- Database schema changes or migrations
- Changes to build configuration or dependencies
- Security-related changes
- Authentication/authorization changes
- New environment variables or configuration requirements
- Changes that affect other features or pages
- Important bug fixes that reveal patterns to avoid
- Deployment-related changes or infrastructure updates

**📋 RECOMMENDED TO DOCUMENT:**
- New features that other agents might need to integrate with
- Performance optimizations or caching strategies
- Changes to rate limiting or API endpoints
- New TypeScript types or interfaces that should be reused
- Accessibility improvements or patterns
- Mobile responsiveness fixes that should be applied elsewhere

**❌ NO NEED TO DOCUMENT:**
- Minor copy/text changes
- Simple styling tweaks to a single component
- Adding translation strings
- Minor refactoring that doesn't change behavior

### How to Document Your Changes

Add a new numbered section under "Latest Changes" with:
- **Date/Time:** When changes were made
- **Files Modified/Created:** List key files
- **What Changed:** Brief description of the change
- **Why It Matters:** Impact on other agents or features
- **For Other Agents:** Specific guidance or patterns to follow
- **Commit Hash:** Reference to the commit

---

## Latest Changes (2025-11-08 ~20:47 UTC)

### Critical Fixes Applied
All changes have been committed and pushed to `main` branch.

🚨 **ALL AGENTS:** Before modifying any files, review the "Important Patterns for Parallel Development" section below to avoid breaking changes.

---

### 1. Build Error Fixes ✅
**Files Modified:**
- `app/api/news/route.ts` - Fixed duplicate `limit` variable (renamed to `rateLimitMax`)
- `app/[locale]/translate/page.tsx` - Removed dead `logSession` reference
- `app/api/admin/practice-vocabulary/route.ts` - Fixed Zod enum validation
- `app/api/admin/practice-vocabulary/[id]/route.ts` - Fixed Zod enum validation
- `app/api/translate/route.ts` - Updated for Next.js 15 (removed `request.ip`)
- `app/api/word-of-the-day/route.ts` - Updated for Next.js 15 (removed `request.ip`)
- `app/api/news/route.ts` - Updated for Next.js 15 (removed `request.ip`)

**Breaking Change for Next.js 15:**
- `request.ip` no longer exists in Next.js 15
- Use: `request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'`

---

### 2. React Component Fix ✅
**File Modified:** `components/ui/toast.tsx`

**CRITICAL:** Added `"use client"` directive to toast component
- The toast component uses `React.createContext()` which MUST run on client-side
- Any component using React context/hooks MUST have `"use client"` at the top
- This fixed: `TypeError: m.createContext is not a function`

**For Other Agents:**
- If you create components with React hooks/context/state, add `"use client"` at the top
- Server components (default in Next.js 15 app dir) cannot use client-side React features

---

### 3. Vocabulary Database Cleanup ✅
**Action:** Removed `(formal)` and `(informal)` annotations from vocabulary words
- Cleaned 7 words in database
- Script: `scripts/clean-vocabulary-annotations.ts`
- Examples: "grandma (informal)" → "grandma"

---

### 4. ESLint Strict Mode Fixes ✅
**Files Modified:**
- `app/api/admin/practice-vocabulary/bulk-import/route.ts` - Replaced `any` with `Record<string, unknown>`
- `app/api/admin/practice-vocabulary/bulk-import/route.ts` - Updated Zod API from `.error.errors` to `.error.issues`
- `components/learn/QuickPracticeWidget.tsx` - Moved `useEffect` before conditional return

**For Other Agents:**
- Never use `any` type - use `Record<string, unknown>` or `unknown` instead
- Zod error handling changed: use `.error.issues` not `.error.errors`
- React Hooks must be at top level, before any conditional returns

---

### 5. Package Updates Status ⚠️
**DO NOT UPDATE THESE PACKAGES YET:**
- React/React-DOM 19.1.0 → 19.2.0 (peer dependency conflicts)
- Next.js 15.5.6 → 16.0.1 (major version, breaking changes)
- pdfjs-dist (depends on React upgrade)

**Recommendation:** Wait for ecosystem stability before upgrading

---

### 6. Deployment Status
- All builds now pass with 0 errors
- Currently deploying to production
- Previous deployment: https://mk-language-exev79756-vincent-battaglias-projects-e5a4afc9.vercel.app

---

### 7. Known Good State
- Branch: `main` (commit: `a06e147`)
- Build: ✅ Passing
- TypeScript: ✅ No errors
- ESLint: ⚠️ Warnings only (no blocking errors)
- Deploy: 🔄 In progress

---

## Important Patterns for Parallel Development

### ✅ DO:
1. Pull latest before making changes
2. Mark client components with `"use client"` when using hooks/context/state
3. Use `Record<string, unknown>` instead of `any`
4. Test builds locally before pushing
5. Use `request.headers.get()` for IP address (not `request.ip`)
6. Update this file when making structural changes

### ❌ DON'T:
1. Use `request.ip` (removed in Next.js 15)
2. Use Zod `.error.errors` (use `.error.issues`)
3. Use `any` type (use proper TypeScript types)
4. Put React Hooks after conditional returns
5. Create server components with React context
6. Update React/Next.js without team coordination

---

## Files Currently Safe to Modify
These files are stable and unlikely to have conflicts:
- `/messages/en.json` and `/messages/mk.json` (translations)
- `/public/*` (static assets)
- `/styles/*` (CSS files)
- New component files in `/components/*` (just remember `"use client"` if needed)

## Files to Coordinate Changes
These files are actively being modified:
- `/app/admin/*` (admin dashboard)
- `/app/api/*` (API routes)
- `/components/ui/toast.tsx` (just fixed)
- `package.json` (hold off on updates)

---

### 8. Transliteration Feature Added ✅
**Files Created/Modified:**
- `lib/transliterate.ts` - New Cyrillic to Latin conversion utility
- `app/api/word-of-the-day/route.ts` - Use Latinized version for pronunciation fallback

**Change:** When pronunciation is missing from database, show Latinized/Romanized version (e.g., "gledam") instead of repeating Cyrillic (e.g., "гледам")

**Commit:** `9da843e` (included in Quick Practice bug fixes commit)

**For Other Agents:**
- Use `cyrillicToLatin()` helper when you need to show Latin/Romanized Macedonian text
- Standard Macedonian transliteration rules are implemented (ж→zh, ч→ch, љ→lj, etc.)

---

### 9. Phase 1 Andri Attribution Complete ✅
**Files Modified:**
- `app/[locale]/about/page.tsx` - Added "Meet the Team" section with Vincent & Andri cards
- `app/[locale]/resources/page.tsx` - Added attribution banner with Macedonian Language Corner link
- `messages/en.json` - Added team section and resources attribution strings
- `ANDRI_CONTENT_PLAN.md` - Updated checklist to mark Phase 1 complete

**What Changed:**
- About page now features two-column grid with team member cards
- Each card includes bio, role description, and social media links
- Resources page displays attribution banner between title and search
- Links to Andri's website, Instagram, and YouTube channels

**Commit:** `c5f2b79` - Complete Phase 1 Andri attribution: About and Resources pages

**For Other Agents:**
- Phase 1 of ANDRI_CONTENT_PLAN.md is now complete ✅
- Footer attribution was already complete (commit `48ac570`)
- Next phase items: Create issues for content integration, share plan with Andri
- See ANDRI_CONTENT_PLAN.md for Phase 2-4 roadmap

---

### 10. Latest Deployment Status
- **Deployed:** 2025-11-08 ~23:35 UTC
- **Production URL:** https://mk-language-797dqch3a-vincent-battaglias-projects-e5a4afc9.vercel.app
- **Latest Commit:** `c5f2b79` - Complete Phase 1 Andri attribution
- **Build Status:** ✅ Passing
- **Deployment:** ✅ Complete

**Changes in This Deployment:**
1. About page "Meet the Team" section with Vincent & Andri
2. Resources page attribution banner linking to Macedonian Language Corner
3. Complete Phase 1: Attribution & Credits from content roadmap

---

### 11. Vocabulary Database Audit Complete ✅
**Files Created:**
- `scripts/audit-vocabulary.ts` - Comprehensive database audit script
- `scripts/add-admin-andri.ts` - Script to add/upgrade admin users
- `VOCABULARY_AUDIT_REPORT.md` - Full audit findings and recommendations

**What Changed:**
Completed comprehensive audit of all 385 vocabulary entries in practiceVocabulary table. Added Andri as admin user for content management.

**Key Findings:**
- ✅ Data Quality: Excellent (no missing translations)
- ⚠️ All words marked "beginner" - needs difficulty distribution
- ⚠️ 18 duplicate entries identified (need review)
- ⚠️ Zero words in Word of the Day pool (critical issue)
- ⚠️ Many words missing pronunciation guides

**Admin User Added:**
- Email: macedonianlanguagecorner@gmail.com
- Name: Andri
- Role: admin
- User ID: cmhqw5rp70000ssv4yom8vepl

**For Other Agents:**
- Read VOCABULARY_AUDIT_REPORT.md for detailed findings
- Priority tasks: Fix WOTD pool, add difficulty levels, resolve duplicates
- Work with Andri on content review and pronunciation additions
- Use `scripts/audit-vocabulary.ts` to re-run audit after changes

**Next Steps:**
1. Review audit report with Andri
2. Create GitHub issues for P0/P1 tasks
3. Develop bulk update scripts for difficulty assignment
4. Plan content expansion to 300+ words (Milestone 2)

---

### 12. Word of the Day Pool Fixed ✅ (P0 Critical)
**Files Created:**
- `scripts/flag-wotd-words.ts` - Script to flag vocabulary words for WOTD rotation

**What Changed:**
Fixed critical P0 issue from VOCABULARY_AUDIT_REPORT.md where zero words were flagged for Word of the Day. WOTD API was returning 404 errors because `includeInWOTD` flag was false/null for all 385 words.

**Solution:**
Created and ran flagging script that identified all 385 active beginner words with complete data (examples + icons) and enabled them for WOTD rotation.

**Impact:**
- ✅ WOTD API now has 385 words to rotate daily
- ✅ Provides 12+ months of unique daily words
- ✅ Covers all 20 categories (activities, food, family, greetings, etc.)
- ✅ Fixes 404 error from empty WOTD pool

**Commit:** `236f5d6` - Fix P0 Critical: Enable Word of the Day pool

**For Other Agents:**
- Word of the Day feature is now fully operational
- No database migration needed (used existing `includeInWOTD` boolean field)
- Script can be re-run safely if needed: `npx tsx scripts/flag-wotd-words.ts`
- Future vocabulary additions should consider setting `includeInWOTD: true` for quality words

**Next Steps:**
- ✅ P0 complete - WOTD pool active
- P1 remaining: Add difficulty levels (all words currently "beginner")
- P1 remaining: Resolve 18 duplicate entries

---

---

## 🔮 Future Considerations & Technical Debt

This section tracks things to keep in mind for future work or technical debt that needs addressing.

### Pending Package Updates
- **React/React-DOM 19.1.0 → 19.2.0** - Has peer dependency conflicts, wait for ecosystem stability
- **Next.js 15.5.6 → 16.0.1** - Major version upgrade with potential breaking changes
- **pdfjs-dist** - Depends on React upgrade
- **Recommendation:** Coordinate before attempting these upgrades

### Known Issues to Address
- Favicon may need hard refresh for some users (browser caching)
- Database queries fail during local build (expected, no fix needed)

### Performance Opportunities
- Consider implementing caching strategy for Word of the Day (currently recalculated per request)
- Practice vocabulary could benefit from pagination for large datasets

### Future Enhancements to Consider
- Add more transliteration uses throughout app (not just Word of the Day)
- Consider adding a "pronunciation guide" page using the transliteration utility
- Explore batch operations for admin vocabulary management

**Note to Agents:** Feel free to add items here when you identify technical debt or future improvements during your work.

---

**Last Updated:** 2025-11-08 ~01:15 UTC
**Updated By:** Vocabulary Audit & Admin Management Agent
