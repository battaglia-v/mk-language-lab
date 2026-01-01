# Mobile-First Redesign v2

> **North Star**: "ChatGPT minimal + Duolingo playful"

## Design Direction

- **ChatGPT minimal**: Clean surfaces, fewer borders, calm typography, clear hierarchy, generous whitespace
- **Duolingo playful**: Subtle delight via friendly microcopy, soft rounded cards, game-like primary actions, small badges/chips, satisfying progress visuals
- **No dashboard clutter** — each screen does one job clearly

## Mobile-First Rules (Non-Negotiable)

| Rule | Implementation |
|------|----------------|
| Full width on phones | `w-full`, `px-4` (16px), max-width only at `md+` |
| Tap targets | ≥44px height minimum |
| Primary CTA | High contrast + filled + shadow (never ghosty) |
| Secondary actions | Hide behind bottom sheet or `⋯` menu |
| Advanced features | Never always-visible on mobile |

---

## 1. Current Issues & Fixes

### A) Button Affordance Problems

**Observed**: Buttons look like plain text, blend into background, look disabled

**Fix**: Standardize all buttons:
- `PrimaryButton` — filled, high contrast, shadow, 48–56px tall
- `SecondaryButton` — subtle filled
- `TertiaryButton` — text + icon + underline
- `IconButton` — clear tap target

**States**: default / pressed / disabled / loading with `cursor-pointer`, `active:scale-[0.99]`, `focus-visible:ring`

### B) Reader = "One Giant Page"

**Observed**: Mode switch + actions + recent + input + results + tiles + translations all on one screen

**Fix**: Split into 3 experiences:
1. **Library** — recent + saved + samples
2. **Reading View** — clean text, tap-word actions
3. **Analyzer** — bottom sheet or separate screen

### C) XP Mismatch (Learn vs Profile)

**Observed**: Learn shows 8/20 XP, Profile shows Total XP: 0

**Fix**: Single source of truth via `useUserStats()` hook used by both pages

---

## 2. Mobile Information Architecture

### Bottom Nav Tabs
| Tab | Icon | Route |
|-----|------|-------|
| Learn | 📚 | `/learn` |
| Translate | 🔄 | `/translate` |
| Practice | 🎯 | `/practice` |
| Reader | 📖 | `/reader` |
| More | ⋯ | `/more` |

### Navigation Patterns
- Reader/Practice = immersive modes with fewer header controls
- Use sticky bottom action bars for primary CTAs

---

## 3. Component System

### Design Tokens

```css
--radius: 14-18px
--space: 4/8/12/16/24px
--type-base: 16px
--type-title: 20-24px
--type-label: 12px
--tap-height: 48-56px
```

### Core Components
- `AppShell` — safe area + bottom nav + top bar variants
- `Card`, `SectionHeader`
- `PrimaryButton`, `SecondaryButton`, `TextButton`, `IconButton`
- `SegmentedControl`
- `BottomSheet` (critical)
- `Chip` / `Tag`
- `Skeleton`
- `EmptyState`
- `Toast`

### Interaction Polish
- All tappables: ripple/pressed state
- Long operations: inline loader + disabled state
- Forms: clear focus state, error state, helper text

---

## 4. Screen Redesigns

### 4.1 Learn (Home)

**Layout**:
1. Compact hero: "Learn Macedonian" + subtitle
2. Progress ring + streak chip
3. Primary CTA: "Start today's lesson"
4. Secondary: "Practice a skill"
5. Skills grid with clear tap affordance

**Copy (Option B — Minimal + Playful)**:
- Title: `Learn Macedonian`
- Subtitle: `Just 5 minutes — you've got this.`
- Primary CTA: `Start today's lesson`
- Secondary CTA: `Quick practice`
- Progress hint: `One more session to hit your goal.`

### 4.2 Profile

**Fix**: Replace 3 huge gradient cards with:
1. One "Stats" card (2x2 grid: Total XP, This Week, Streak, Level %)
2. One "League" card
3. One "Settings" section

**Loading state**: "Fetching your stats..."
**Error state**: "Couldn't load stats. Tap to retry."

### 4.3 Practice (Word Sprint)

**Layout** (Stepper feel):
1. Difficulty (Easy/Medium/Hard)
2. Length (10/20/custom)
3. Primary CTA sticky at bottom

**Copy**:
- Title: `Word Sprint`
- Subtitle: `Pick your challenge.`
- Disabled helper: `Choose difficulty and length to start.`

### 4.4 Reader (3 Experiences)

#### A) Reader Library
- Search bar
- Continue reading (horizontal)
- Recent reads (horizontal)
- Samples by level (vertical list)
- Primary CTA: "Paste text" → opens bottom sheet

**Copy**:
- Title: `Reader`
- Subtitle: `Read real Macedonian, tap any word.`
- Empty: `Nothing yet — open a story to start.`

#### B) Reading View
- Title row + metadata chips
- Segmented control: Text | Grammar | Vocabulary
- Clean reading surface (larger line height, comfortable margins)
- Tap any word → Word Sheet (bottom sheet)

**Word Sheet**:
- Word + Translation + Part of speech
- Buttons: Save word | Listen | Add to practice

**Tools menu (⋯)**:
- Smart reveal (toggle)
- Highlight unknown words (toggle)
- Analyze this text
- Copy clean text

#### C) Analyzer (Separate Screen)
- Summary card (difficulty, words, sentences, time)
- Word tiles (filterable: unknown, verbs, nouns)
- Full translation (collapsible)
- Sentence cards with Save | Copy | Listen

**Sticky bottom bar**:
- Primary: `Reveal meaning`
- Secondary: `Focus mode`
- More (⋯): Copy text | Export | Reset

---

## 5. Button Affordance Audit (Global)

Every clickable must have ≥2 affordance cues:
- [ ] Shape (button/card)
- [ ] Elevation/border
- [ ] Icon
- [ ] Hover/pressed state
- [ ] Label clarity ("Copy" → "Copy text")

Never show lone text centered in a card that looks like a label.

---

## 6. XP Consistency Implementation

### A) XP Rules
- **Session XP**: Earned during active lesson/practice
- **Weekly XP**: Sum of XP events in last 7 days
- **Total XP**: Sum of all XP events

### B) Shared Hook

```typescript
// lib/hooks/useUserStats.ts
export function useUserStats() {
  // Fetches /api/user/stats
  // Returns { totalXP, weeklyXP, streakDays, levelProgress, league, refetch }
}
```

### C) UI Behavior
- Loading: skeletons (never "Loading..." text)
- Error: retry state (never zeros)
- Note under stats: "Stats update after each session."

---

## 7. Engineering Phases

### Phase 0 — UI Kit + Standards
- [ ] Build UI kit page (`/dev/ui-kit`)
- [ ] Core components (buttons, bottom sheet, segmented control)
- [ ] Mobile QA route

### Phase 1 — Global Affordance + Spacing
- [ ] Replace ambiguous buttons
- [ ] Add consistent states (pressed/disabled/loading)
- [ ] Fix padding and full-width layout

### Phase 2 — XP Fix
- [ ] Implement `useUserStats()` hook
- [ ] Align Learn/Profile stats
- [ ] Add caching + invalidation on XP events

### Phase 3 — Reader Restructure
- [ ] Build Reader Library
- [ ] Build Reading View with Word Sheet
- [ ] Move Analyzer to separate screen with sticky actions

### Phase 4 — Practice Polish
- [ ] Stepper-like setup
- [ ] Sticky Start button
- [ ] Better selected states + disabled clarity

### Phase 5 — Final Mobile UX Polish
- [ ] Skeleton loaders everywhere
- [ ] Empty state designs
- [ ] Accessibility pass (tap targets, contrast, focus)

---

## 8. Acceptance Criteria (Pre-Launch)

- [ ] All main screens usable one-handed on 360–430px width
- [ ] No ambiguous controls
- [ ] Reader split into Library → Reading → Analysis
- [ ] Profile XP matches Learn XP within one refresh
- [ ] No "Loading..." text blocks; use skeletons
- [ ] All buttons have visible states and labels

---

## 9. Copy Reference

### Button Labels (Consistent Verbs)
| Context | Label |
|---------|-------|
| Learn | Start today's lesson |
| Practice | Start session |
| Reader | Analyze text |
| Word action | Save word / Listen / Copy text |
| Error | Try again / Got it |

### Avoid
- Single-word ambiguous: "Copy", "Focus"
- Use instead: "Copy text", "Focus mode"

---

## Screenshots Reference

See `docs/ui-overhaul/screenshots/` for:
- `reader-analyzer-dense.png` — Dense controls, unclear "Copy"
- `reading-view-baseline.png` — Good baseline, needs Word Sheet
- `practice-setup.png` — Start button clarity issue
- `learn-vs-profile-xp.png` — XP mismatch documentation
