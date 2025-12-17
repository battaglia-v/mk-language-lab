# Mobile UI Overhaul - Release Notes

## Summary

This release delivers a mobile-first UI overhaul for MK Language Lab, making the app feel polished, spacious, and consistent across all screen sizes.

## Changes

### Phase 1: UI Kit Dev Page
- Created `/dev/ui-kit` page (gated by `NEXT_PUBLIC_ENABLE_DEV_PAGES=true`)
- Showcases all Button, Card, Badge, Input, Progress, and BottomSheet variants
- Useful for testing responsive behavior and documenting component usage

### Phase 2: Layout Foundations
- **Translate page**: Removed `max-w-3xl` constraint on mobile, now uses full width with `px-4` padding
- **Learn page**: Removed `max-w-5xl` constraint on mobile
- **Practice page**: Removed `max-w-4xl` constraint on mobile
- All pages now apply max-width only on `sm:` breakpoint (640px+)

### Phase 3: Component Fixes
- **Bottom sheets**: Already well-implemented with safe-area padding
- **Pronunciation recording**: Already fully implemented with MediaRecorder API
  - States: listen → record → scoring → compare
  - Graceful fallback when mic unsupported
  - "Using synthesized audio" messaging (not alarming)

### Phase 4: News Images
- Added per-source thumbnail policy to `ProxiedNewsImage`
- Time.mk sources now skip thumbnail attempts entirely
- Always shows beautiful placeholder for blocked sources
- No more broken image icons or infinite loading skeletons

### Phase 5: Testing & Documentation
- Created `e2e/mobile-journey.spec.ts` with real user flow tests
- Added 320px viewport (iPhone 5/SE) testing
- Created comprehensive audit at `docs/ui-overhaul/audit.md`

## Files Changed

| File | Change |
|------|--------|
| `app/[locale]/dev/ui-kit/page.tsx` | NEW - UI Kit showcase |
| `app/[locale]/translate/page.tsx` | Mobile-first container |
| `app/[locale]/learn/page.tsx` | Mobile-first container |
| `app/[locale]/practice/page.tsx` | Mobile-first container |
| `components/news/ProxiedNewsImage.tsx` | Per-source policy |
| `e2e/mobile-journey.spec.ts` | NEW - Journey tests |
| `docs/ui-overhaul/audit.md` | NEW - Audit doc |

## Testing

Run mobile journey tests:
```bash
npx playwright test e2e/mobile-journey.spec.ts
```

Run full mobile audit:
```bash
npm run test:mobile-audit
```

## Environment Variables

To enable the UI Kit dev page:
```env
NEXT_PUBLIC_ENABLE_DEV_PAGES=true
```

---
*Released: December 17, 2024*
