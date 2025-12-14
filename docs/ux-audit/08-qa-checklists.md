# QA Checklists

**Last Updated:** 2025-01-14  
**Owner:** QA Team  
**Review Cycle:** Before each release

---

## Table of Contents

1. [UI Alignment Checklist](#1-ui-alignment-checklist)
2. [WCAG AA Accessibility Checklist](#2-wcag-aa-accessibility-checklist)
3. [Responsive Breakpoints Checklist](#3-responsive-breakpoints-checklist)
4. [Localization Checklist](#4-localization-checklist)
5. [Image Loading Checklist](#5-image-loading-checklist)
6. [Lighthouse Performance Checklist](#6-lighthouse-performance-checklist)
7. [Test Device Matrix](#7-test-device-matrix)

---

## 1. UI Alignment Checklist

### 1.1 Button Consistency

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| All primary buttons use `bg-accent text-accent-foreground` | ☐ | ☐ | ☐ |
| Button height minimum 44px touch target (WCAG) | ☐ | ☐ | ☐ |
| Border radius consistent (`--radius` = 0.5rem) | ☐ | ☐ | ☐ |
| Ghost buttons have visible focus state | ☐ | ☐ | ☐ |
| Icon buttons have `aria-label` | ☐ | ☐ | ☐ |
| Disabled buttons have `cursor-not-allowed` | ☐ | ☐ | ☐ |
| Button text is centered vertically and horizontally | ☐ | ☐ | ☐ |
| Loading state uses consistent spinner | ☐ | ☐ | ☐ |

### 1.2 Spacing & Layout

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Base spacing unit: 8px (0.5rem) | ☐ | ☐ | ☐ |
| Content max-width: 1280px (`--content-max`) | ☐ | ☐ | ☐ |
| Card padding: 16px minimum | ☐ | ☐ | ☐ |
| Section spacing: 32px between major sections | ☐ | ☐ | ☐ |
| No orphaned 1px gaps or misalignments | ☐ | ☐ | ☐ |
| Grid gaps use spacing tokens | ☐ | ☐ | ☐ |
| Consistent padding on mobile (16px sides) | ☐ | ☐ | ☐ |

### 1.3 Typography

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Body text: 1rem (16px) minimum | ☐ | ☐ | ☐ |
| Headings use Inter font (or fallback sans-serif) | ☐ | ☐ | ☐ |
| Line height: 1.5 for body, 1.2 for headings | ☐ | ☐ | ☐ |
| No text truncation cuts off meaning | ☐ | ☐ | ☐ |
| Text color contrast ≥ 4.5:1 (normal) or 3:1 (large) | ☐ | ☐ | ☐ |
| Macedonian characters render correctly (Ќ, Ѓ, Џ) | ☐ | ☐ | ☐ |

### 1.4 Icons & Images

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Icons aligned with text baseline | ☐ | ☐ | ☐ |
| Icon size proportional to text (1em default) | ☐ | ☐ | ☐ |
| All images have alt text | ☐ | ☐ | ☐ |
| Placeholder/fallback images display correctly | ☐ | ☐ | ☐ |
| SVG icons use currentColor | ☐ | ☐ | ☐ |

---

## 2. WCAG AA Accessibility Checklist

### 2.1 Perceivable

| Check | Criterion | Pass | Fail | N/A |
|-------|-----------|------|------|-----|
| All images have descriptive alt text | 1.1.1 | ☐ | ☐ | ☐ |
| Audio has captions or transcript | 1.2.1 | ☐ | ☐ | ☐ |
| Color is not sole indicator of meaning | 1.4.1 | ☐ | ☐ | ☐ |
| Text contrast ≥ 4.5:1 (small) | 1.4.3 | ☐ | ☐ | ☐ |
| Text contrast ≥ 3:1 (large, 18pt+) | 1.4.3 | ☐ | ☐ | ☐ |
| UI component contrast ≥ 3:1 | 1.4.11 | ☐ | ☐ | ☐ |
| Text resizable to 200% without loss | 1.4.4 | ☐ | ☐ | ☐ |
| No horizontal scroll at 320px viewport | 1.4.10 | ☐ | ☐ | ☐ |

### 2.2 Operable

| Check | Criterion | Pass | Fail | N/A |
|-------|-----------|------|------|-----|
| All interactive elements keyboard accessible | 2.1.1 | ☐ | ☐ | ☐ |
| No keyboard traps | 2.1.2 | ☐ | ☐ | ☐ |
| Skip links present and functional | 2.4.1 | ☐ | ☐ | ☐ |
| Page titles are descriptive | 2.4.2 | ☐ | ☐ | ☐ |
| Focus order logical | 2.4.3 | ☐ | ☐ | ☐ |
| Link purpose clear from text | 2.4.4 | ☐ | ☐ | ☐ |
| Focus indicator visible (2px ring) | 2.4.7 | ☐ | ☐ | ☐ |
| Touch targets ≥ 44x44px | 2.5.5 | ☐ | ☐ | ☐ |

### 2.3 Understandable

| Check | Criterion | Pass | Fail | N/A |
|-------|-----------|------|------|-----|
| Page language declared (`lang="en"` or `lang="mk"`) | 3.1.1 | ☐ | ☐ | ☐ |
| Error messages identify field and solution | 3.3.1 | ☐ | ☐ | ☐ |
| Labels for all form inputs | 3.3.2 | ☐ | ☐ | ☐ |
| Consistent navigation placement | 3.2.3 | ☐ | ☐ | ☐ |
| Changes of context user-initiated | 3.2.2 | ☐ | ☐ | ☐ |

### 2.4 Robust

| Check | Criterion | Pass | Fail | N/A |
|-------|-----------|------|------|-----|
| Valid HTML (no duplicate IDs) | 4.1.1 | ☐ | ☐ | ☐ |
| ARIA roles used correctly | 4.1.2 | ☐ | ☐ | ☐ |
| Status messages use aria-live | 4.1.3 | ☐ | ☐ | ☐ |
| Modals trap focus and restore on close | - | ☐ | ☐ | ☐ |

### 2.5 Quick Accessibility Test Procedure

```bash
# 1. Run Lighthouse accessibility audit
npm run build && npx lighthouse http://localhost:3000 --only-categories=accessibility

# 2. Check with axe-core
# In Chrome DevTools: Install axe DevTools extension, run scan

# 3. Test keyboard navigation
# Tab through entire page, verify focus visible on all interactive elements

# 4. Test screen reader
# macOS: Enable VoiceOver (Cmd+F5), navigate page
# Verify all content announced correctly
```

---

## 3. Responsive Breakpoints Checklist

### 3.1 Breakpoint Definitions

| Breakpoint | Width | Description |
|------------|-------|-------------|
| Mobile S | 320px | Smallest supported |
| Mobile L | 375px | iPhone SE/standard |
| Mobile XL | 428px | iPhone Pro Max |
| Tablet | 768px | iPad portrait |
| Desktop S | 1024px | Small laptop |
| Desktop L | 1280px | Standard desktop |
| Desktop XL | 1536px | Large monitors |

### 3.2 Mobile (< 768px)

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Navigation collapses to hamburger menu | ☐ | ☐ | ☐ |
| Content fills viewport width (16px padding) | ☐ | ☐ | ☐ |
| Cards stack vertically | ☐ | ☐ | ☐ |
| Bottom navigation visible and usable | ☐ | ☐ | ☐ |
| No horizontal overflow/scroll | ☐ | ☐ | ☐ |
| Touch targets minimum 44x44px | ☐ | ☐ | ☐ |
| Forms use appropriate input types | ☐ | ☐ | ☐ |
| Modals fit within viewport | ☐ | ☐ | ☐ |
| Font sizes readable without zoom | ☐ | ☐ | ☐ |

### 3.3 Tablet (768px - 1024px)

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Two-column layouts where appropriate | ☐ | ☐ | ☐ |
| Navigation may show partial items | ☐ | ☐ | ☐ |
| Grid layouts adjust to 2-3 columns | ☐ | ☐ | ☐ |
| Side margins increase proportionally | ☐ | ☐ | ☐ |
| Images scale appropriately | ☐ | ☐ | ☐ |

### 3.4 Desktop (≥ 1024px)

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Full navigation visible | ☐ | ☐ | ☐ |
| Content max-width 1280px centered | ☐ | ☐ | ☐ |
| Multi-column layouts (2-4 columns) | ☐ | ☐ | ☐ |
| Hover states work correctly | ☐ | ☐ | ☐ |
| Sidebar layouts if applicable | ☐ | ☐ | ☐ |
| Large images optimized/lazy loaded | ☐ | ☐ | ☐ |

### 3.5 Testing Procedure

```bash
# 1. Chrome DevTools device mode
# Test: 320px, 375px, 768px, 1024px, 1440px

# 2. Playwright responsive tests
npm run test:e2e -- --grep "responsive"

# 3. BrowserStack/Sauce Labs for real devices
# Priority: iPhone 12, iPhone SE, iPad, Pixel 5, Samsung S21
```

---

## 4. Localization Checklist

### 4.1 Translation Completeness

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| All keys in `messages/en.json` exist in `messages/mk.json` | ☐ | ☐ | ☐ |
| No hardcoded strings in components | ☐ | ☐ | ☐ |
| Dynamic content uses translation functions | ☐ | ☐ | ☐ |
| Dates formatted per locale | ☐ | ☐ | ☐ |
| Numbers formatted per locale | ☐ | ☐ | ☐ |
| Pluralization rules correct for both languages | ☐ | ☐ | ☐ |

### 4.2 Macedonian-Specific Checks

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Special characters display (Ќ, Ѓ, Љ, Њ, Џ, Ж, Ш, Ч) | ☐ | ☐ | ☐ |
| Font supports Cyrillic glyphs | ☐ | ☐ | ☐ |
| Text direction correct (LTR) | ☐ | ☐ | ☐ |
| Keyboard shortcuts work with Cyrillic input | ☐ | ☐ | ☐ |
| Transliterations provided where helpful | ☐ | ☐ | ☐ |

### 4.3 Text Expansion Handling

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Buttons allow text wrap or truncation | ☐ | ☐ | ☐ |
| Labels don't overflow containers | ☐ | ☐ | ☐ |
| Navigation items fit when translated | ☐ | ☐ | ☐ |
| Error messages fully visible | ☐ | ☐ | ☐ |

### 4.4 Testing Procedure

```bash
# 1. Compare translation files
node -e "
const en = require('./messages/en.json');
const mk = require('./messages/mk.json');
const enKeys = new Set(Object.keys(JSON.stringify(en).match(/\"[a-zA-Z]+\":/g)));
const mkKeys = new Set(Object.keys(JSON.stringify(mk).match(/\"[a-zA-Z]+\":/g)));
console.log('Missing in MK:', [...enKeys].filter(k => !mkKeys.has(k)));
"

# 2. Visual comparison
# Toggle locale and screenshot compare each page

# 3. Test locale switching
# Navigate through app, switch EN↔MK, verify no crashes
```

---

## 5. Image Loading Checklist

### 5.1 Proxy Functionality

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| `/api/image-proxy` responds to valid URLs | ☐ | ☐ | ☐ |
| Invalid domains return 400 error | ☐ | ☐ | ☐ |
| Timeout handled gracefully (10s max) | ☐ | ☐ | ☐ |
| Error responses return appropriate status | ☐ | ☐ | ☐ |
| CORS headers allow client access | ☐ | ☐ | ☐ |

### 5.2 Source Domain Testing

Test each domain returns images correctly:

| Domain | Test URL | Pass | Fail |
|--------|----------|------|------|
| time.mk | /test-image.jpg | ☐ | ☐ |
| kurir.mk | /test-image.jpg | ☐ | ☐ |
| sdk.mk | /test-image.jpg | ☐ | ☐ |
| meta.mk | /test-image.jpg | ☐ | ☐ |
| plusinfo.mk | /test-image.jpg | ☐ | ☐ |
| mia.mk | /test-image.jpg | ☐ | ☐ |
| vecer.press | /test-image.jpg | ☐ | ☐ |
| lokalno.mk | /test-image.jpg | ☐ | ☐ |

### 5.3 Fallback Behavior

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Fallback placeholder displays on error | ☐ | ☐ | ☐ |
| Placeholder has appropriate alt text | ☐ | ☐ | ☐ |
| No broken image icons visible | ☐ | ☐ | ☐ |
| Loading state visible during fetch | ☐ | ☐ | ☐ |
| Retry mechanism works | ☐ | ☐ | ☐ |

### 5.4 Performance

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Images lazy loaded below fold | ☐ | ☐ | ☐ |
| Appropriate sizes provided (srcset) | ☐ | ☐ | ☐ |
| WebP format used where supported | ☐ | ☐ | ☐ |
| No layout shift on image load (CLS < 0.1) | ☐ | ☐ | ☐ |

### 5.5 Testing Procedure

```bash
# 1. Test proxy endpoint directly
curl -I "http://localhost:3000/api/image-proxy?url=https://time.mk/test.jpg"

# 2. Test with network throttling
# Chrome DevTools → Network → Slow 3G
# Verify loading states and fallbacks

# 3. Test with blocked domains
# Block time.mk in /etc/hosts, verify fallback displays

# 4. Monitor in production
# Check Sentry for image loading errors
# Review Vercel logs for proxy failures
```

---

## 6. Lighthouse Performance Checklist

### 6.1 Target Scores

| Metric | Target | Acceptable | Current |
|--------|--------|------------|---------|
| Performance | ≥ 90 | ≥ 75 | ____ |
| Accessibility | ≥ 95 | ≥ 90 | ____ |
| Best Practices | ≥ 90 | ≥ 85 | ____ |
| SEO | ≥ 95 | ≥ 90 | ____ |

### 6.2 Core Web Vitals

| Metric | Good | Needs Improvement | Current |
|--------|------|-------------------|---------|
| LCP (Largest Contentful Paint) | < 2.5s | < 4.0s | ____ |
| FID (First Input Delay) | < 100ms | < 300ms | ____ |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.25 | ____ |
| INP (Interaction to Next Paint) | < 200ms | < 500ms | ____ |
| TTFB (Time to First Byte) | < 800ms | < 1800ms | ____ |

### 6.3 Performance Checklist

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Images optimized and lazy loaded | ☐ | ☐ | ☐ |
| JS bundle < 250KB gzipped (initial) | ☐ | ☐ | ☐ |
| CSS critical path inlined | ☐ | ☐ | ☐ |
| Fonts preloaded with display:swap | ☐ | ☐ | ☐ |
| No render-blocking resources | ☐ | ☐ | ☐ |
| Service worker caching active | ☐ | ☐ | ☐ |
| API responses cached appropriately | ☐ | ☐ | ☐ |
| Unused JavaScript eliminated | ☐ | ☐ | ☐ |
| Third-party scripts deferred | ☐ | ☐ | ☐ |

### 6.4 Testing Procedure

```bash
# 1. Local Lighthouse audit
npm run build && npm run start
npx lighthouse http://localhost:3000 --view

# 2. PageSpeed Insights (production)
# https://pagespeed.web.dev/ → enter mklanguage.com

# 3. WebPageTest (detailed)
# https://www.webpagetest.org/ → test mobile 3G

# 4. Vercel Analytics (real user data)
# Check Vercel dashboard → Analytics → Web Vitals
```

---

## 7. Test Device Matrix

### 7.1 Priority Devices (Must Test)

| Device | OS | Browser | Priority |
|--------|-----|---------|----------|
| iPhone 13/14 | iOS 16+ | Safari | P0 |
| iPhone SE | iOS 15+ | Safari | P0 |
| Pixel 5/6 | Android 12+ | Chrome | P0 |
| Samsung S21+ | Android 11+ | Chrome/Samsung | P0 |
| iPad (10th gen) | iPadOS 16+ | Safari | P1 |
| MacBook | macOS 13+ | Chrome | P1 |
| MacBook | macOS 13+ | Safari | P1 |
| Windows Laptop | Windows 11 | Chrome | P1 |
| Windows Laptop | Windows 11 | Edge | P2 |

### 7.2 PWA-Specific Tests

| Check | iOS | Android | Desktop |
|-------|-----|---------|---------|
| Add to Home Screen works | ☐ | ☐ | ☐ |
| Splash screen displays | ☐ | ☐ | ☐ |
| Offline mode functional | ☐ | ☐ | ☐ |
| Push notifications (if enabled) | ☐ | ☐ | ☐ |
| Pull-to-refresh works | ☐ | ☐ | N/A |
| Haptic feedback works | N/A | ☐ | N/A |
| App icon displays correctly | ☐ | ☐ | ☐ |

### 7.3 Pre-Release Checklist

Before each release, verify:

| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| All P0 devices tested | ☐ | ☐ | ☐ |
| No critical accessibility failures | ☐ | ☐ | ☐ |
| Lighthouse score ≥ 75 (all categories) | ☐ | ☐ | ☐ |
| Both locales functional | ☐ | ☐ | ☐ |
| News images loading (or fallback) | ☐ | ☐ | ☐ |
| Login/logout flow works | ☐ | ☐ | ☐ |
| Practice sessions complete without error | ☐ | ☐ | ☐ |
| Sentry error rate < 1% | ☐ | ☐ | ☐ |

---

## Appendix: Automated Testing Commands

```bash
# Full QA suite
npm run lint && \
npm run type-check && \
npm run test && \
npm run test:e2e && \
npm run build

# Accessibility audit
npx @axe-core/cli http://localhost:3000 --exit

# Responsive screenshots
npx playwright test --grep "visual" --update-snapshots

# Performance budget check
npm run build && \
npx bundlesize

# i18n validation
node scripts/validate-translations.js
```

---

**Sign-off:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | _____________ | ___/___/_____ | _________ |
| Dev Lead | _____________ | ___/___/_____ | _________ |
| Product | _____________ | ___/___/_____ | _________ |
