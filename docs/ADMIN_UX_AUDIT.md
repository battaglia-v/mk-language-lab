# Admin UX Audit and Parity Plan

Findings from reviewing `/admin` pages versus learner-facing flows.

## High-Risk Gaps
- **Practice Audio**: UI is live in admin but no real clips exist; API returns an empty set and learner app keeps audio buttons disabled. Without uploads, the feature stays invisible to learners (correct), but admins need clearer status and guardrails.
- **Word of the Day**: Full CRUD exists in `/admin/word-of-the-day`, yet no learner surface imports or renders these entries. The `includeInWOTD` flag in practice vocabulary also has no downstream effect.
- **Practice Vocabulary CMS**: Core CRUD works, but there is no bulk publish/unpublish, no export of current set, and errors fall back to `alert()` which is easy to miss.

## Parity Actions
1. **Surface Word of the Day to learners** (or temporarily hide the admin page):
   - Add a small WOTD widget to `/[locale]/learn` and `/[locale]/dashboard` using `components/learn/WordOfTheDay`.
   - Respect scheduled dates and `isActive`; show a compact fallback state when none is scheduled.
   - If we choose to defer, gate the admin route with a banner and remove the `includeInWOTD` toggle from vocabulary until the consumer is live.
2. **Practice Audio rollout**:
   - Keep audio controls disabled for learners until real uploads exist (current behavior).
   - Add an admin-only “publish readiness” meter (clip count by status, last upload time) so it’s obvious when the feature can be enabled in the app.
   - Once audio is ready, add a slim “play pronunciation” button in practice cards conditioned on `audioClip`.
3. **Vocabulary hygiene**:
   - Replace `alert()` with inline toasts for save/delete errors.
   - Add bulk `activate/deactivate` and `includeInWOTD` toggles with confirmation to reduce repetitive clicks.
   - Export current vocabulary (CSV/JSON) so editors can back up before large edits.

## Usability Quick Wins (Admin)
- Add empty states that point to the action (e.g., “No audio clips yet—upload to unlock learner playback”).
- Standardize table filters (difficulty/category/status) and preserve them in the URL for easier sharing.
- Add breadcrumbs and a persistent “Back to Dashboard” link on every admin sub-page.
