# UI Audit Backlog

Last Updated: 2026-01-02  
Owner: @battaglia-v

This is an implementation checklist derived from `docs/ui_audit.md`. Convert items to GitHub issues as needed.

## Checklist

- [ ] P0: Run release-gate scans (3 modes) and fix any remaining missing `data-testid` failures.
- [ ] P0: Run dead-click scan and convert any dead elements to disabled-with-reason or implement an action.
- [ ] P0: Verify Reader v2 footer controls (tap/sentences/glossary/save) at 360×800 and 390×844; remove any hover-only affordances.
- [ ] P1: Standardize per-route bottom padding so content never sits under the mobile tab bar (`pb-24` + safe-area).
- [ ] P1: Ensure every sign-in required page has one clear primary CTA + secondary “Back home”.
- [ ] P1: Ensure Translate direction control never truncates at 360px (use compact labels on mobile).
- [ ] P2: Normalize card header spacing and typography (titles, subtitles, badges) across Learn/Practice/Reader.
- [ ] P2: Audit focus states + ARIA labels on all icon-only buttons (especially in modals/bottom sheets).
