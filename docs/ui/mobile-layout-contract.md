# Mobile Layout Contract

## Overview

This document defines the **non-negotiable** mobile-first layout rules for the mk-language-lab application. Following these rules ensures a full-width, native app feel on mobile devices without the "narrow app" constraint.

---

## The Contract (NON-NEGOTIABLE)

### For viewport widths <640px (Mobile):

1. **NO** Tailwind `container` class anywhere
2. **NO** `max-w-*` classes without responsive prefixes
3. Root content wrapper **MUST** be: `w-full max-w-none px-4` (or `px-5`)
4. Cards/sections **MUST** be `w-full`
5. **NO** extra horizontal margins that shrink usable width

### For viewport widths ≥640px (Tablet+):

1. **MAY** use `sm:max-w-*` to constrain width
2. **MAY** use `sm:mx-auto` to center content
3. **MAY** use `sm:px-6` for more generous padding

---

## Implementation

### Use PageContainer Component

The `PageContainer` component enforces this contract automatically.

```tsx
import { PageContainer } from '@/components/layout';

export default function MyPage() {
  return (
    <PageContainer size="md" className="flex flex-col gap-4 pb-24 sm:gap-5 sm:pb-6">
      {/* Your content */}
    </PageContainer>
  );
}
```

### Available Sizes

- `sm` → 640px (sm:max-w-screen-sm)
- `md` → 768px (sm:max-w-screen-md)
- `lg` → 1024px (sm:max-w-screen-lg)
- `xl` → 1280px (sm:max-w-screen-xl)
- `2xl` → 1536px (sm:max-w-screen-2xl)
- `content` → 896px (sm:max-w-[56rem]) - optimal for reading
- `wide` → 1120px (sm:max-w-[70rem]) - optimal for app content (default)
- `full` → No max-width at any breakpoint

### Example Usage by Page Type

```tsx
// Content-heavy pages (articles, documentation)
<PageContainer size="content">...</PageContainer>

// Standard app pages (dashboards, lists)
<PageContainer size="wide">...</PageContainer>

// Large layouts (admin panels, data tables)
<PageContainer size="xl">...</PageContainer>

// Hero sections, full-bleed images
<PageContainer size="full">...</PageContainer>
```

---

## Migration Checklist

When creating or updating a page:

- [ ] Replace `<div className="container ...">` with `<PageContainer>`
- [ ] Replace `max-w-*` with `sm:max-w-*` for responsive constraints
- [ ] Remove `mx-auto` from mobile layouts (PageContainer handles centering at sm+)
- [ ] Replace `px-3 sm:px-4` with PageContainer's built-in padding
- [ ] Test on 360px, 390px, and 640px viewports

---

## Violations to Avoid

### ❌ BAD: Max-width on mobile

```tsx
// Constrains width even on small mobile screens
<div className="mx-auto max-w-3xl px-4">
  ...
</div>
```

### ✅ GOOD: Full-width on mobile, constrained on tablet+

```tsx
// Full width on mobile, constrained at sm: breakpoint
<PageContainer size="md">
  ...
</PageContainer>
```

---

### ❌ BAD: Tailwind container class

```tsx
// Applies max-width immediately
<div className="container mx-auto px-4">
  ...
</div>
```

### ✅ GOOD: PageContainer with responsive sizing

```tsx
<PageContainer size="wide" className="py-6">
  ...
</PageContainer>
```

---

### ❌ BAD: Nested max-width constraints

```tsx
<PageContainer size="lg">
  {/* This inner max-w-sm defeats the full-width mobile intent */}
  <div className="max-w-sm mx-auto">
    ...
  </div>
</PageContainer>
```

### ✅ GOOD: Responsive inner constraints

```tsx
<PageContainer size="lg">
  {/* Only constrains at sm: and above */}
  <div className="sm:max-w-sm sm:mx-auto">
    ...
  </div>
</PageContainer>
```

---

## Testing

### Visual Regression Tests

The `e2e/mobile-width.spec.ts` test suite verifies mobile layout compliance:

```bash
# Run mobile width tests
npx playwright test e2e/mobile-width.spec.ts

# Generate screenshots for manual review
npx playwright test e2e/mobile-width.spec.ts --update-snapshots
```

Screenshots are saved to `e2e/screenshots/mobile-width/`:

- `translate-360x800.png`
- `translate-390x844.png`
- `learn-360x800.png`
- `learn-390x844.png`
- `reader-360x800.png`
- `reader-390x844.png`

### Manual Testing Viewports

Test these critical breakpoints:

- **360×800** - Small Android devices (e.g., Galaxy S8)
- **390×844** - iPhone 12/13/14
- **414×896** - iPhone 11 Pro Max, XS Max
- **640×800** - sm: breakpoint threshold

### Acceptance Criteria

✅ **PASS**: Cards visually span the screen with only normal padding visible
✅ **PASS**: No big side gutters or "narrow center column" effect
❌ **FAIL**: UI looks narrow/cramped with visible unused space on sides
❌ **FAIL**: Any max-width applied on mobile (<640px)

---

## Code Review Checklist

When reviewing PRs, check for:

- [ ] New pages use `PageContainer` instead of custom wrappers
- [ ] All `max-w-*` classes have responsive prefixes (`sm:`, `md:`, etc.)
- [ ] No use of Tailwind `container` class in page layouts
- [ ] Mobile screenshots show full-width content
- [ ] No regressions in existing mobile layouts

---

## Migration Status

### ✅ Migrated Pages

- `/[locale]/learn` - Uses PageContainer size="xl"
- `/[locale]/translate` - Uses PageContainer size="md"
- `/[locale]/reader` - Uses PageContainer size="xl"
- `/[locale]/practice` - Uses PageContainer size="lg"
- `/[locale]/practice/grammar` - Uses PageContainer size="lg"

### ⚠️ Needs Migration

Pages with `max-w-*` violations that need refactoring:

- `/[locale]/notifications`
- `/[locale]/page` (root/home)
- `/[locale]/resources`
- `/[locale]/daily-lessons`
- `/[locale]/(auth)/onboarding`
- `/[locale]/feedback`
- `/[locale]/practice/pronunciation`
- `/[locale]/practice/decks`
- `/[locale]/practice/decks/[deckId]`
- `/[locale]/terms`
- `/[locale]/discover`
- `/[locale]/test-sentry`

See `docs/ui/max-w-violations.txt` for detailed line numbers.

---

## References

- **Component**: `components/layout/PageContainer.tsx`
- **Tests**: `e2e/mobile-width.spec.ts`
- **Playwright Config**: Mobile viewports defined in `playwright.config.ts`

---

## Questions?

If you're unsure about layout implementation:

1. Check if your page type matches an existing pattern
2. Review migrated pages for examples
3. Run the mobile-width test suite
4. Ask in #frontend-dev channel

**Remember**: When in doubt, go full-width on mobile. It's better to be too wide than too narrow.
