# Task 1: Mobile + Desktop UI Audit

> **Last Updated:** 2025-12-14  
> **Owner:** UX Team  
> **Review Cycle:** Quarterly

## Executive Summary

This audit identifies UI inconsistencies, accessibility violations, and alignment issues across mklanguage.com. Issues are prioritized by severity and UX impact.

---

## Issue Table

| ID | Screen/Element | Problem | Severity | UX Impact | Proposed Fix |
|----|----------------|---------|----------|-----------|--------------|
| **A1** | Quick Actions Grid | Cards not equal height on mobile | High | Visual hierarchy broken | Add `h-full` + flex-grow on card content |
| **A2** | Dashboard CTA buttons | Inconsistent border-radius (some 14px, some 22px) | Medium | Brand inconsistency | Standardize to `--radius-control: 14px` |
| **A3** | News feed cards | Image aspect ratio varies (16:9, 4:3, 1:1) | High | Jarring layout shifts | Force `aspect-[16/9]` container |
| **A4** | Practice modal | Close button overlaps content on small screens | High | Blocked interaction | Add `safe-area-inset-top` + `z-50` |
| **A5** | Mobile nav | Bottom nav icons not vertically centered | Medium | Feels unpolished | Use `items-center justify-center` |
| **A6** | Form inputs | Focus ring inconsistent (some 2px, some 3px) | Low | Minor a11y concern | Standardize to `--focus-ring-width: 3px` |
| **A7** | Reader page | Line height too tight on mobile (1.4) | Medium | Reading fatigue | Increase to `--line-height-relaxed: 1.8` |
| **A8** | Streak counter | Text truncates on narrow screens | Medium | Lost information | Add `min-w-fit` or responsive text |
| **A9** | Lesson cards | Padding inconsistent (12px vs 16px vs 20px) | Medium | Visual noise | Use `--card-padding-default` token |
| **A10** | Success messages | Toast appears behind modals | High | Missed feedback | Ensure `z-[100]` on toast container |

---

## Accessibility Violations (WCAG AA)

| ID | Element | Issue | WCAG Criterion | Fix |
|----|---------|-------|----------------|-----|
| **W1** | Yellow buttons on light bg | Contrast ratio 3.8:1 (needs 4.5:1) | 1.4.3 | Darken to `#d4a800` or use dark text |
| **W2** | Muted text in cards | Contrast 3.2:1 on dark theme | 1.4.3 | Increase opacity to 0.88 |
| **W3** | Icon-only buttons | Missing `aria-label` | 1.1.1 | Add descriptive labels |
| **W4** | Practice timer | No pause for screen readers | 2.2.2 | Add pause/extend mechanism |
| **W5** | News images | Missing alt text fallback | 1.1.1 | Use article title as alt |
| **W6** | Skip link | Not visible on focus | 2.4.1 | Add focus-visible styles |
| **W7** | Form error states | Color-only indication | 1.4.1 | Add icons + text descriptions |
| **W8** | Keyboard navigation | Focus order illogical in modals | 2.4.3 | Implement focus trap |

---

## Responsive Breakpoint Issues

| Breakpoint | Issue | Affected Components |
|------------|-------|---------------------|
| 320-375px | Cards overflow horizontally | QuickActionsGrid, DailyGoalCard |
| 376-639px | 2-column grid too cramped | Practice deck grid |
| 640-767px | Awkward 3-column with gaps | News feed layout |
| 768-1023px | Sidebar causes content shift | Dashboard main area |
| 1024px+ | Max-width too narrow (1180px) | Full-width layouts |

---

## Wireframe Fixes (ASCII)

### A1: Quick Actions Grid - Before/After

```
BEFORE:                          AFTER:
┌─────────┐ ┌─────────┐         ┌─────────┐ ┌─────────┐
│ Icon    │ │ Icon    │         │ Icon    │ │ Icon    │
│ Label   │ │ Label   │         │ Label   │ │ Label   │
│         │ │ Desc... │         │ Desc... │ │ Desc... │
└─────────┘ │ Extra   │         │         │ │         │
            └─────────┘         └─────────┘ └─────────┘
 ↑ Unequal heights               ↑ Equal heights (h-full)
```

### A3: News Card - Before/After

```
BEFORE:                          AFTER:
┌──────────────────┐             ┌──────────────────┐
│ ▓▓▓▓▓▓▓▓ (4:3)  │             │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓        │             │ ▓▓▓▓ (16:9)     │
├──────────────────┤             ├──────────────────┤
│ Title            │             │ Title            │
│ Source • Time    │             │ Source • Time    │
└──────────────────┘             └──────────────────┘
                                  ↑ Consistent aspect
```

### A4: Practice Modal Close Button

```
BEFORE:                          AFTER:
┌────────────────────┐           ┌────────────────────┐
│[X]←overlaps notch  │           │    safe-area-top   │
│                    │           │         [X]        │
│   Practice Card    │           │   Practice Card    │
│                    │           │                    │
└────────────────────┘           └────────────────────┘
```

---

## Color Consistency Matrix

| Token | Current Dark | Current Light | Recommended |
|-------|--------------|---------------|-------------|
| `--primary` | #f6d83b | #f6d83b | Keep (good contrast on dark) |
| `--primary-foreground` | #000000 | #000000 | ✓ Correct |
| `--muted-foreground` | rgba(247,248,251,0.72) | rgba(11,11,18,0.72) | Increase to 0.88 |
| `--border` | #222536 | #e0e3e9 | ✓ Correct |
| `--success` | #3ecf8e | #3ecf8e | Add dark variant #059669 for light theme |

---

## Typography Audit

| Element | Current | Issue | Recommendation |
|---------|---------|-------|----------------|
| H1 | clamp(1.85rem, 3vw, 2.5rem) | Good | ✓ Keep |
| H2 | clamp(1.5rem, 2.4vw, 2.05rem) | Good | ✓ Keep |
| Body | 0.95rem | Slightly small on mobile | Use `clamp(1rem, 0.5vw + 0.9rem, 1.1rem)` |
| Caption | 0.875rem | Good | ✓ Keep |
| Button | 0.95rem | Good | ✓ Keep |
| Line-height (body) | 1.6 | Good for desktop | Add 1.7 for mobile reading |

---

## Grid System Audit

**Current state:** Mixed usage of arbitrary widths and grid columns.

**Recommendation:** Standardize to 12-column grid with consistent gutters.

```css
/* Proposed Grid System */
.grid-system {
  --grid-columns: 12;
  --grid-gutter: var(--space-4); /* 16px */
  --grid-gutter-lg: var(--space-6); /* 24px */
  
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
}

@media (min-width: 768px) {
  .grid-system {
    gap: var(--grid-gutter-lg);
  }
}
```

---

## Priority Action Items

1. **P0 (This Sprint)**
   - Fix toast z-index (A10)
   - Add alt text fallbacks (W5)
   - Fix modal close button overlap (A4)

2. **P1 (Next Sprint)**
   - Standardize card heights (A1)
   - Fix contrast issues (W1, W2)
   - Implement focus traps (W8)

3. **P2 (Backlog)**
   - Grid system refactor
   - Typography scale refinement
   - Animation consistency audit
