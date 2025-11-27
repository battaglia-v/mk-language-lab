# UI and Navigation Audit

## Homepage and navigation experience
- The locale homepage now presents a modern hero with localized CTAs for translation and practice, a highlight list, and an inline navigation preview that documents the localized URLs for the primary tabs. It also includes a navigation-audit grid that lists every shell tab, its destination, and a CTA to open the page, ensuring clarity on where each button routes. 【F:app/[locale]/page.tsx†L20-L238】
- The mobile tab bar now uses evenly sized snap-aligned items with clearer focus states, ensuring every icon stays aligned and readable on small screens while maintaining locale-aware links. 【F:components/shell/MobileTabNav.tsx†L1-L49】

## Page functionality snapshot
- **Dashboard** – Presents action cards that deep-link to translate, practice, news, resources, and profile, using the same descriptive copy as the homepage. 【F:app/[locale]/dashboard/page.tsx†L1-L80】
- **Translate** – Client workspace with bidirectional direction toggles, streaming translation handling, history, saved phrases, and clipboard controls. 【F:app/[locale]/translate/page.tsx†L1-L60】
- **Practice** – Flashcard decks that adapt between curated, saved, and translator-history sources, plus progress controls for recalling phrases. 【F:app/[locale]/practice/page.tsx†L1-L80】
- **News** – Filterable news feed with source selection, search query support, and skeleton loading for headline cards. 【F:app/[locale]/news/page.tsx†L1-L80】
- **Resources** – Lazy-loads the resource catalog, flattens collections for search/filtering, and supports both drawer and desktop panels. 【F:app/[locale]/resources/page.tsx†L1-L80】
- **Profile** – Server-rendered dashboard wrapper with back-to-dashboard affordance and the `ProfileDashboard` component for streaks/quests. 【F:app/[locale]/profile/page.tsx†L1-L46】

## Admin access
- Admin authentication uses the `/admin/signin` flow with Google sign-in and redirects authenticated admins to `/admin`, while blocking non-admin sessions. 【F:app/admin/signin/page.tsx†L1-L36】
- The admin dashboard surfaces vocabulary counts, active users, word-of-the-day totals, and quick links to content management screens. 【F:app/admin/page.tsx†L1-L59】

## Recommendations
- Keep the homepage navigation audit section in sync with any new shell tabs to preserve the “button-to-destination” traceability.
- During QA, verify mobile bottom-nav spacing across devices with safe-area insets to confirm icons remain centered and reachable.
