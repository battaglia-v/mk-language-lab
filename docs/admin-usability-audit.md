# Admin Usability + Parity Audit

## Summary
- Audited admin surfaces for feature parity with user-facing pages and mobile usability.
- Surfaced admin-managed practice metadata (difficulty, category, audio) directly in the user practice UI.
- Clarified which admin controls are unused and what to do with them (implement or retire).

## Completed improvements
- Practice difficulty from admin now drives a difficulty filter and badge on the practice workspace (curated deck).
- Practice audio uploads now render as “Listen”/“Slow” controls on practice cards.
- Category (where set in admin) now appears as a tag on the active practice card.
- Translate workspace buttons now use proper labels (no translation keys leaking on mobile).

## Feature parity map
| Admin control | User surface | Status | Action |
| --- | --- | --- | --- |
| Practice vocabulary `difficulty` | Practice page curated deck | Implemented | Filter + badge on cards. |
| Practice vocabulary `category` | Practice page curated deck | Implemented | Shown as tag on card header. |
| Practice audio uploads | Practice page curated deck | Implemented | Listen + Slow buttons pull from audio library. |
| `includeInWOTD`, pronunciation, part of speech, examples | Word of the Day/user feeds | Needs review | Wire to WOTD surfaces or remove fields if unused. |
| Custom deck metadata (name/count) | Practice page custom deck picker | Partially surfaced | Keep picker; add deck stats/description in a follow-up. |
| Discover feed settings | Public Discover feed | Monitor | Verify cards reflect admin ordering/tags; add preview if missing. |

## Next steps (admin usability)
1) Add inline validation and “saving…” states on practice vocabulary and audio forms; show server errors inline instead of alert().
2) Add quick filters (status/source type) to the practice audio table and highlight unpublished clips.
3) Add breadcrumbs/active nav highlight for deep admin routes (discover, imports) plus 44px tap targets for mobile.
4) Decide on WOTD extra fields: either render them on the user-facing WOTD module or hide them from the form.
