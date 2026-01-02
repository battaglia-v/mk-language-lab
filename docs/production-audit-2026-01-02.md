# Production Audit & Play Store Readiness Plan
**Last Updated:** 2026-01-02  
**Owner:** @battaglia-v  
**Scope:** `https://www.mklanguage.com` (redirects to `https://mklanguage.com`) + `mk-language-lab` codebase  

## 0) Executive Summary

### Current status
- The app is **close** to Play Store launch as a TWA *from a packaging perspective* (`android-twa/` + `docs/GOOGLE_PLAY_LAUNCH.md` exist), but it is **not ready** for launch as a **monetized subscription app** yet.
- There are **production correctness issues** (notably a legacy sign-in URL returning 404) and **paywall/billing gaps** (server verification + client gating need hardening).

### Biggest risks before launch (P0)
1. **Auth routing drift in production**: `/en/auth/signin` returns 404 while the site still links to it in some places.
2. **News UX + resilience**: the News UI shows an immediate “no results” state before data loads; SSR has no content fallback.
3. **Monetization is not end-to-end**: subscription checks, entitlement resolution, and billing verification are incomplete/inconsistent across modules.
4. **Play Billing must be validated end-to-end**: ensure Google Play products exist, web purchase flow works in the installed TWA, and server-side verification is configured.

### Testing limitation (important)
Automated browser runs from this environment hit a **403** on a critical Next.js chunk:
`/_next/static/chunks/25ef16b69a31e3e7.js?...`  
This prevents hydration and makes some UI screenshots appear “stuck”/empty. This is likely caused by a corporate proxy / bot filtering and is **not necessarily representative of real end users**. See `e2e/screenshots/mobile-audit-www-mklanguage-com/logs/*.json`.

## 1) Live Site Audit (Production)

### 1.1 Routes/flows exercised
- Anonymous: `/{locale}`, `/{locale}/learn`, `/{locale}/practice`, `/{locale}/translate`, `/{locale}/reader`, `/{locale}/news`, `/{locale}/resources`, `/{locale}/discover`, `/{locale}/daily-lessons`, `/{locale}/about`
- Authenticated (via API-based login in E2E): `/{locale}/profile`, `/{locale}/notifications`

Artifacts:
- Mobile screenshots: `e2e/screenshots/mobile-audit-www-mklanguage-com/*.png`
- Network/console logs: `e2e/screenshots/mobile-audit-www-mklanguage-com/logs/*.json`

### 1.2 Confirmed production issues

#### P0 — Broken legacy sign-in URL
- `GET https://mklanguage.com/en/auth/signin` returns **404** (legacy route).
- Canonical route exists: `GET https://mklanguage.com/en/sign-in` returns **200**.

Fix options (implement at least one):
- **Preferred**: update all links to use `/{locale}/sign-in` (already updated in `app/[locale]/page.tsx` locally).
- **Also recommended**: keep a safety redirect in middleware for old links (see `middleware.ts` logic for `/(en|mk)/auth/(signin|...)`).

#### P1 — News page “flash of empty state”
`app/[locale]/news/page.tsx` initializes with `items=[]`, `meta=null`, `isLoading=false` which causes:
- “Sources · 0/0” on initial render
- “No results” UI before the first fetch starts (useEffect runs after first paint)

Fix:
- Start with `isLoading=true`, or
- Change empty-state rendering to require `meta !== null`, or
- Server-render initial results and hydrate with client refresh.

#### P1 — Production data mismatch when JS fails
- API works: `GET /api/news?limit=5&source=all` returns a non-empty list with `meta.total≈92`.
- If hydration fails (blocked JS), News stays empty forever.

Improvement:
- Prefer server-rendering initial News list (or at least show skeleton until first fetch resolves) so the page is usable under slow/blocked JS conditions.

## 2) Mobile UI/UX Findings (from screenshots + code review)

### P0/P1 usability issues
- **Translate direction control wrapping**: direction labels wrap awkwardly on mobile in some builds. The repo includes a fix that displays `EN → MK` / `MK → EN` on small screens (`app/[locale]/translate/page.tsx`), but production may not yet reflect it.
- **Bottom nav label truncation on small widths**: on very small devices, tab labels can truncate (`Tran...`, `Read...`) if JS-based “narrow viewport” detection doesn’t run (or runs late). Prefer CSS breakpoints over JS measurement for first paint.
- **Onboarding tooltip persistence/noise**: “Start practicing here!” tooltip is visually prominent and can appear during critical flows; ensure it is:
  - limited to first session(s),
  - never blocks CTAs/forms,
  - dismissible and not re-shown after auto-dismiss.

### General UX polish recommendations (P1/P2)
- Ensure **primary CTAs** exist in every “core loop” screen (Learn → Practice → Review/Progress).
- Make “More” page (`app/[locale]/more/page.tsx`) include Upgrade/Pro entry point once paywall is live.
- Align copy/labels across locales (`messages/en.json` + `messages/mk.json`) for nav + paywall terms.

## 3) Codebase Audit (Tech Debt + Architecture)

### 3.1 Subscription/entitlement fragmentation (P0)
There are currently **two parallel systems**:
- `lib/entitlements.ts` + `hooks/use-entitlement.ts` + `app/api/user/entitlement/route.ts` (currently returns **free only**)
- `lib/subscription.ts` + `app/api/subscription/status/route.ts` + `app/api/billing/verify/route.ts`

Problems:
- Different “free tier limits” (e.g., 10 sessions/day vs 3/day) and feature lists.
- No single **source of truth** for what “Pro” means.

Recommendation (choose one path):
1. **Unify on `Subscription` (DB) + `UserEntitlement` (UI DTO)**:
   - `lib/subscription.ts` owns DB reads/writes.
   - `lib/entitlements.ts` owns product/feature definitions and the client DTO.
   - `GET /api/user/entitlement` computes entitlement from `Subscription` and returns a `UserEntitlement`.
2. Delete/merge redundant lists (limits, PRO features) so there is only one definition.

### 3.2 Billing verification is stubbed (P0)
`app/api/billing/verify/route.ts` currently:
- does **not** call Google Play Developer API
- treats any “long enough” token as valid
- grants 30/365 days and upserts DB

This is not acceptable for production monetization.

Minimum fix:
- Verify Google Play purchase tokens server-side using Google Play Developer API.
- Store and validate:
  - `purchaseToken`, `orderId`, `expiresAt`, `autoRenewing`, `cancelReason` (where available)
- Add a periodic reconciliation job (or RTDN integration) to keep `Subscription.status` accurate.

Required configuration (recommended env vars):
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (service account JSON with `androidpublisher` scope)
- `GOOGLE_PLAY_PACKAGE_NAME` (defaults to `com.mklanguage.twa`)
- `ENABLE_PAYWALL=true` (enables premium gating)

### 3.3 TWA billing integration (P0)
`lib/billing/google-play.ts` now supports **two** purchase paths:
- **Preferred (TWA)**: Payment Request + Digital Goods API (`window.getDigitalGoodsService`) when available.
- **Fallback (custom wrapper)**: `window.Android.launchBillingFlow` / `window.Android.queryPurchases` if you add a native bridge yourself.

What you still need to do for a real launch:
- Create subscription products in Play Console (`pro_monthly`, `pro_yearly`) and confirm they are active.
- Ensure the installed Play Store build supports the Digital Goods API (test on a real device on a non-filtered network).
- Configure server verification (`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`, `GOOGLE_PLAY_PACKAGE_NAME`) and confirm `/api/billing/verify` succeeds end-to-end.

### 3.4 Versioning and dependency consistency (P1)
- `package.json` has `next@^16.x` while `eslint-config-next@15.x`. Align these to the same major to avoid tooling/runtime drift.

### 3.5 PWA/offline posture (P1)
- `next-pwa` is configured with `register: false`, and no service worker is registered in the app.
- If you want “offline-first” claims in the Play listing, you need a real offline story:
  - service worker caching strategy, and/or
  - explicit offline fallbacks in UI and data caching in IndexedDB.

## 4) Play Store Readiness Checklist (TWA path)

### 4.1 App packaging
- `android-twa/twa-manifest.json`: verify package name, versionCode/versionName, startUrl, theme colors.
- `.well-known/assetlinks.json`: ensure it’s present and matches the signing cert fingerprint.
- Ensure deep links open in-app and the address bar is hidden (verified via TWA compliance).

### 4.2 Policy & compliance
- Privacy Policy URL reachable from the web and in-app.
- Terms URL reachable.
- Data Safety form:
  - auth identifiers (email)
  - subscription purchase data (Google Play)
  - analytics/crash reporting (if enabled)
  - user deletion flow (`app/api/user/delete/route.ts`)

### 4.3 Required testing
- Google Play pre-launch report (automated).
- Closed testing track requirements (new dev accounts often require 14 days + minimum testers).
- Device matrix:
  - small phone (320px)
  - typical Android (360px)
  - large phone (390–430px)
  - tablet (optional)

## 5) Monetization & Paywall Strategy (Recommended)

### Recommended model
- **Subscription (Pro)** with monthly + yearly options:
  - `pro_monthly`
  - `pro_yearly`
- Free tier remains useful; Pro removes limits and unlocks premium paths/content.

### What to gate (suggested)
- Advanced paths (B1+)
- Full 30‑day reading challenge beyond day 5
- Unlimited practice sessions / custom decks
- Offline downloads (once implemented)

### Play Billing vs Stripe
- In the Play Store app: **Google Play Billing only** for digital goods/subscriptions.
- On the web: Stripe is optional (but must not be used to bypass Play Billing inside the Android app).

### Implementation outline
1. Define products in Play Console (SKUs match code).
2. Implement purchase flow in wrapper (or switch to a wrapper that supports billing).
3. Verify purchases server-side and upsert `Subscription`.
4. Make `GET /api/user/entitlement` reflect real subscription state.
5. Enforce gating:
   - server-side redirect for premium routes, and/or
   - component-level gating with a consistent Upgrade CTA.

## 6) Action Plan (Prioritized)

### P0 — Must fix before any launch
1. Deploy legacy sign-in fix (link + middleware redirect).
2. Make News initial state not show “no results” before load.
3. Choose monetization implementation path (TWA+bridge vs native wrapper).
4. Replace stubbed billing verification with real verification.
5. Unify entitlement/subscription logic into a single source of truth.
6. Enable premium gating only when ready (feature flag `ENABLE_PAYWALL=true`).

### P1 — Launch-quality improvements
1. Ensure mobile nav is CSS-responsive without JS-dependent label hiding.
2. Accessibility pass: ARIA labels, focus states, reduced motion.
3. Observability: enable Sentry (or equivalent) and set up release tracking.
4. Offline story: either implement it or remove “offline” claims from listing.

### P2 — Post-launch
1. Add RTDN / subscription reconciliation to prevent drift.
2. Expand Pro value: offline packs, advanced grammar, native audio, etc.
