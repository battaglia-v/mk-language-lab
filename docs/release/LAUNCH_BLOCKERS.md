# Launch Blockers Checklist

> **Last Updated:** 2026-01-10  > **Owner**: Vincent Battaglia

## Must-Verify Before Play Store Submission
- [ ] Confirm production DB seeded with UKIM curriculum (`ukim-a1`, `ukim-a2`, `ukim-b1`)
- [ ] Verify TWA asset links match the signing keystore (`/.well-known/assetlinks.json`)
- [ ] Capture and validate final screenshots (English UI, 1080x1920, <8MB)
- [ ] Manual device smoke test (Android phone + tablet): learn, practice, translate, reader, profile
- [ ] Play Console data safety + content rating questionnaires completed
- [ ] AAB built from `android-twa` with updated versionCode/versionName

## Post-Launch Follow-ups
- [ ] Deduplicate practice vocabulary pairs (26 duplicates)
- [ ] Run mobile regression test suite once DB is available locally
- [ ] Reconcile curriculum audit reports (`audit-results.json` vs `validation-report.json`)
