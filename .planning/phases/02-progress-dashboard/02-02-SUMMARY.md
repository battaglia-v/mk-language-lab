---
phase: 02-progress-dashboard
plan: 02
status: complete
completed: 2026-01-07
---

# Summary: Dashboard Continuation UX

## Objective
Update Learn page with "Continue where you left off" UX tied to UKIM curriculum.

## What Was Built

### Task 1: Fetch Journey Progress in Server Component
**Commit:** `556464f` - feat(02-02): fetch journey progress in Learn page

**Changes:**
- Modified `app/[locale]/learn/page.tsx` to query `JourneyProgress` for authenticated users
- Fetch current lesson with module context (title, orderIndex) from active journey
- Calculate completed/total lessons count from `UserLessonProgress`
- Pass journey data to client component via new optional props
- Maintain backward compatibility with existing starter-path behavior for new users

**Implementation Details:**
```typescript
// New data fetched from database
const journey = await prisma.journeyProgress.findFirst({
  where: { userId: session.user.id, isActive: true },
  include: {
    currentLesson: { select: { id, title, orderIndex } },
    currentModule: { select: { title } },
  },
});

// Passed to client as new optional props
currentLesson?: { id, title, moduleTitle, lessonNumber }
journeyProgress?: { completedCount, totalCount }
```

### Task 2: Display Continue CTA with Current Lesson
**Commit:** `794ab56` - feat(02-02): display Continue CTA with current lesson

**Changes:**
- Updated `components/learn/LearnPageClient.tsx` to accept journey progress props
- Show "Continue: [Lesson Title]" CTA when user has active journey
- Display module name and lesson progress count ("Lesson X of Y")
- Link Continue CTA to `/learn/lessons/[lessonId]` for direct curriculum access
- Preserve "Start Learning" behavior for new users without journey progress

**Translations Added:**
```json
// messages/en.json + messages/mk.json
"continueLearning": "Continue Learning" / "Продолжи со учење"
"continueLesson": "Continue: {lessonTitle}" / "Продолжи: {lessonTitle}"
"lessonOf": "Lesson {current} of {total}" / "Лекција {current} од {total}"
```

## Verification Completed

✅ All verification steps passed:
- Type-check: `npm run type-check` - No errors
- Linting: `npm run lint` - No errors
- Unit tests: All tests passing
- Pre-commit hooks: Passed for both commits

### Behavior Verified:
- ✅ Returning user with journey sees Continue CTA with lesson title
- ✅ New user without journey sees Start Learning CTA (existing behavior)
- ✅ Lesson context displayed (module title, lesson number)
- ✅ Progress count displayed (X of Y lessons)
- ✅ Translations work in both English and Macedonian
- ✅ Continue CTA links to `/learn/lessons/[lessonId]`

## Key Decisions

1. **Backward Compatibility:** Added new props as optional to `LearnPageClient`, preserving existing starter-path behavior for gradual migration
2. **Single Query Approach:** Used Prisma includes to fetch journey, module, and lesson data in one efficient query
3. **New User Handling:** Users without active journey see existing "Start Learning" state - no changes to onboarding flow
4. **Route Pattern:** Continue CTA links to `/learn/lessons/[lessonId]` as specified in plan (database ID, not hardcoded node ID)

## Files Modified

### Core Implementation:
- `app/[locale]/learn/page.tsx` - Server component fetches journey progress
- `components/learn/LearnPageClient.tsx` - Client component displays Continue CTA

### Translations:
- `messages/en.json` - Added 3 new keys to mobile.learn section
- `messages/mk.json` - Added 3 new keys to mobile.learn section (Macedonian)

## What's Next

**Plan 02-03:** Replace hardcoded starter-path with database-driven curriculum
- Server component will query `CurriculumLesson` and `Module` from database
- Display actual UKIM lessons (Тешкото для A1, Лозје для A2)
- Remove dependency on `lib/learn/starter-path.ts` and `a2-path.ts`
- Lesson completion status will reflect actual `UserLessonProgress` records

## Notes

- Journey progress is only shown when `isActive=true` (set after first lesson completion)
- Current implementation coexists with starter-path display - plan 02-03 will replace it
- Lesson route `/learn/lessons/[lessonId]` expected to exist (created in Phase 01-04)
- Progress stats use same `UserLessonProgress` table as lesson completion tracking
