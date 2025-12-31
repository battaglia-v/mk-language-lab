# Current Status (Dec 31, 2024 - Production Audit)

## Reality Check: Production is BROKEN

Previous status claimed "All phases complete" — but live production audit reveals critical regressions.

---

## Root Cause Analysis (Investigation Complete)

### P1: "Start Today's Lesson" → Empty Deck — ROOT CAUSE FOUND

**The Bug:**
- Home page links to: `/practice/session?deck=curated&difficulty=beginner`
- But `practice-vocabulary.json` items have **NO difficulty field**
- API defaults missing difficulty to `'mixed'` (see `route.ts:64`)
- Filter `curatedDeck.filter(card => card.difficulty === 'beginner')` returns `[]`
- Empty deck = "deck not found" / stuck loading

**Location:**
- Home page link: `app/[locale]/page.tsx:32`
- API default: `app/api/practice/prompts/route.ts:64`
- Filter logic: `components/practice/usePracticeDecks.ts:226`

**Fix Options (choose one):**
1. **Quick fix:** Change home page to `difficulty=all` instead of `beginner`
2. **Better fix:** Add difficulty values to vocabulary data in database
3. **Safest fix:** Modify filter to include 'mixed' when filtering by 'beginner'

**Recommended:** Option 1 (quick) + Option 2 (follow-up)

### P0: Home i18n Keys Leaking — INVESTIGATION INCOMPLETE

**Findings:**
- Keys DO exist in `messages/en.json` lines 118-121
- Keys DO exist in `messages/mk.json` lines 118-121
- Code uses `getTranslations("home")` correctly
- `homeT("guestSubtitle", { default: "..." })` syntax is non-standard but shouldn't break

**Possible causes:**
1. Production build cache issue (stale deployment)
2. Messages not bundled correctly in production
3. Server-side rendering failing silently

**Needs:** Check production deployment logs or redeploy with `--force`

---

## Production Bugs (Must Fix)

### P1: "Start Today's Lesson" → Empty Deck — FIXED ✅
- **Root cause:** Difficulty filter mismatch (beginner vs mixed)
- **Impact:** New users cannot start learning
- **Fix:** Changed `difficulty=beginner` to `difficulty=all`
- **Commit:** `b6c4d46` (Dec 31, 2024)
- **Files changed:** `app/[locale]/page.tsx`, `lib/learn/starter-path.ts`

### P0: Home i18n Keys Leaking — CRITICAL
- **Symptom:** Signed-out home shows raw keys
- **Root cause:** Unknown (keys exist, code looks correct)
- **Impact:** App looks broken to new visitors
- **Fix:** Try production redeploy with `--force`, check deployment logs

### P2: Speaking MVP — Skip-Only Vibes
- **Status:** Needs UX audit (not blocking)

### P3: Reader — Dashboard-Like
- **Status:** Needs UX audit (not blocking)

---

## Immediate Fix (P1 - Deck Issue)

```diff
// app/[locale]/page.tsx line 32
- const startLessonHref = `/${safeLocale}/practice/session?deck=curated&difficulty=beginner`;
+ const startLessonHref = `/${safeLocale}/practice/session?deck=curated&difficulty=all`;
```

This one-line change will fix the "deck not found" bug.

---

## Next Actions

### Immediate (P1)
- [ ] Fix home page difficulty parameter (beginner → all)
- [ ] Test signed-out flow locally
- [ ] Deploy and verify

### After P1 (P0 i18n)
- [ ] Check Vercel deployment logs for i18n errors
- [ ] Try `vercel --prod --force` redeploy
- [ ] If still broken, investigate next-intl server component loading

### Follow-up
- [ ] Add proper difficulty values to vocabulary database
- [ ] Audit speaking MVP UX
- [ ] Audit Reader UX

---

## Build Commands

```bash
npm run type-check    # TypeScript
npm run lint          # Linting
npm run test          # Unit tests
npm run build         # Production build
```

---

## Notes for Agent

1. **P1 is a one-line fix** — do it first
2. **P0 needs deployment investigation** — may be stale cache
3. **Test signed-out flow** — most bugs affect new/guest users
4. **Commit after each fix** — don't batch multiple fixes
