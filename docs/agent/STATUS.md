# Current Status (Dec 31, 2024 - Production Audit)

## Production Status: BOTH CRITICAL BUGS FIXED ✅

As of Dec 31, 2024 23:30 UTC, both P0 and P1 bugs are resolved.

---

## Fixed Issues

### P1: "Start Today's Lesson" → Empty Deck — FIXED ✅
- **Root cause:** Difficulty filter mismatch (beginner vs mixed)
- **Fix:** Changed `difficulty=beginner` to `difficulty=all`
- **Commit:** `b6c4d46` (Dec 31, 2024)
- **Files changed:** `app/[locale]/page.tsx`, `lib/learn/starter-path.ts`

### P0: Home i18n Keys Leaking — FIXED ✅
- **Root cause:** `getTranslations("home")` wasn't receiving locale properly
- **Fix:** Changed to `getTranslations({ locale: safeLocale, namespace: "home" })`
- **Commit:** `fb18144` (Dec 31, 2024)
- **Verified via curl:** Production site shows correct translations:
  - "Learn Macedonian" ✅
  - "5 minutes a day" ✅
  - "Start Learning" ✅
- **Note:** WebFetch tool gave false negatives by parsing React/JSON data instead of rendered HTML

---

## Remaining Items (Polish)

### P2: Speaking MVP — Skip-Only Vibes
- **Status:** Needs UX audit (not blocking)
- **Spec:** See ROADMAP.md for full requirements

### P3: Reader — Dashboard-Like
- **Status:** Needs UX audit (not blocking)
- **Spec:** See ROADMAP.md for full requirements

### P4: Word Sprint Content Expansion
- **Status:** Optional enhancement

### P5: About Page Cleanup
- **Status:** Optional enhancement

---

## Commits This Session

```
9a3770e docs: update P0 i18n status with investigation findings
fb18144 fix: explicitly pass locale to getTranslations for i18n
6eaa7a6 docs: mark P1 deck fix as deployed
b6c4d46 fix: change difficulty=beginner to difficulty=all for guest lessons
ff1bec4 docs: update roadmap + status with production audit findings
```

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

1. **P0 and P1 are FIXED** — production is now functional
2. **Test with curl, not WebFetch** — WebFetch parses React data incorrectly
3. **P2-P5 are polish items** — work on them when time permits
4. **See ROADMAP.md** for detailed specs on remaining items
