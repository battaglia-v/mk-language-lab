# Agent Synchronization Log

⚠️ **IMPORTANT: READ THIS FILE BEFORE MAKING CHANGES** ⚠️

This file contains critical information about recent changes, breaking patterns, and coordination guidelines for all agents working in parallel on this codebase.

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

**For Other Agents:**
- Use `cyrillicToLatin()` helper when you need to show Latin/Romanized Macedonian text
- Standard Macedonian transliteration rules are implemented (ж→zh, ч→ch, љ→lj, etc.)

---

**Last Updated:** 2025-11-08 21:15 UTC
**Updated By:** Build & Deploy Agent
