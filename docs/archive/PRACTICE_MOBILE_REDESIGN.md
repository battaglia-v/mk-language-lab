# Practice Widget - Mobile-First Redesign

## Problem
Current Practice widget requires 600-700px of vertical space on mobile, causing heavy scrolling and poor UX.

## Mobile-First Solution (375px width target)

### Layout Changes:

**1. Collapse Progress Section on Mobile**
- Current: Full progress bar + labels + accuracy badge (~150px)
- New Mobile: Inline compact badge "3/5 ⚡ 80%" (~30px)
- Desktop: Keep full progress section

**2. Hide Settings on Mobile by Default**
- Current: Filter + Mode always visible (~120px)
- New Mobile: Collapsible settings (icon button to expand)
- Most users don't change settings mid-session
- Saves ~100px

**3. Reduce Button Count**
- Current: 4 buttons (Check, Next, Reveal, Reset) in 2x2 grid (~120px)
- New Mobile:
  - Primary: "Check Answer" (large, when typing)
  - Secondary: "Skip" button (inline with input, small)
  - Hide Reveal/Reset behind menu icon
- Saves ~60px

**4. Compact Header**
- Current: Title + Description (~80px)
- New Mobile: Just title, smaller (~40px)
- Description shown only on first visit

**5. Tighter Spacing**
- All padding: 3 → 2 (mobile)
- All gaps: 4 → 2 (mobile)
- Prompt box: p-4 → p-3 (mobile)

### Target Mobile Layout (300-350px total):

```
┌─────────────────────────┐
│ Quick Practice   [⚙️]   │ ← 40px (title + settings icon)
│ Progress: 3/5 ⚡ 80%     │ ← 30px (inline badge)
├─────────────────────────┤
│ Translate:              │ ← 80px (prompt box, compact)
│ ДОБРОУТРО              │
│ [Greetings]             │
├─────────────────────────┤
│ [Your answer here... 🔄]│ ← 50px (input with skip icon)
│                         │
│ [  Check Answer  ]      │ ← 45px (primary action)
├─────────────────────────┤
│ ✓ Correct!              │ ← 40px (feedback when shown)
└─────────────────────────┘

Total: ~285-325px (fits in viewport!)
```

### Settings Panel (Expandable):
When user taps ⚙️ icon, slide in from right:
- Category filter
- Mode toggle (MK→EN / EN→MK)
- Reset session

### Additional Buttons (Contextual):
- "Reveal Answer" - show only after wrong answer
- "Next" - auto-advance after correct, manual button after wrong

## Desktop Experience:
Keep current full layout - this redesign only affects mobile (<768px)

## Implementation Priority:
1. Collapse progress to inline badge (HIGH)
2. Hide settings behind icon (HIGH)
3. Reduce to 1-2 buttons (HIGH)
4. Compact header (MEDIUM)
5. Tighter spacing (MEDIUM)

## Expected Result:
- Practice widget fits in single viewport on mobile
- Zero scrolling required for primary flow: read → type → check
- 50-60% vertical space reduction
- Maintains all functionality, just reorganized for mobile
