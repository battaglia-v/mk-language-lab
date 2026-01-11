# Google Play Store Runbook

> **Last Updated:** 2026-01-10  > **Owner**: Vincent Battaglia

## Canonical Identity
- App name: MK Language Lab
- Package name: `com.mklanguage.twa`
- Domain: https://mklanguage.com
- Start URL: `/en` (see `public/manifest.json` + `android-twa/twa-manifest.json`)
- Privacy policy: https://mklanguage.com/en/privacy
- Support email: contact@mklanguage.com

## Asset Checklist
- App icon (512x512 PNG, no alpha): `public/icon-512.png`
- Maskable icon (512x512 PNG): `public/icon-512-maskable.png`
- Feature graphic (1024x500): `public/feature-graphic.png`
- Phone screenshots (1080x1920): `public/screenshots/play-store-v2/01-*.png` → `08-*.png`
- Optional tablet screenshots (1920x1080 or 1200x1920)
- Store copy: `docs/release/PLAY_STORE_LISTING.md`
- Screenshot narrative: `docs/SCREENSHOT_PLAN.md`
- Screenshot manifest: `docs/release/SCREENSHOT_MANIFEST.md`
- Content audit summary: `docs/release/CONTENT_AUDIT_SUMMARY.md`
- Launch blockers: `docs/release/LAUNCH_BLOCKERS.md`

## Build Artifacts
- AAB: `android-twa/app-release-bundle.aab`
- APK (device testing): `android-twa/app-release-signed.apk`
- TWA manifest: `android-twa/twa-manifest.json`
- Digital Asset Links: `public/.well-known/assetlinks.json`

## Submission Steps (Play Console)
1. **Verify production site**
   - `https://mklanguage.com/en` loads without errors
   - `/.well-known/assetlinks.json` resolves and matches `com.mklanguage.twa`
2. **Update versioning**
   - Increment `appVersionName` + `appVersionCode` in `android-twa/twa-manifest.json`
3. **Build artifacts**
   - Run `bubblewrap build` in `android-twa`
   - Confirm AAB and APK created
4. **Create/Update Store Listing**
   - Use the canonical copy from `docs/release/PLAY_STORE_LISTING.md`
   - Upload icon, feature graphic, and 2-8 phone screenshots
5. **Complete App Content**
   - Privacy policy URL
   - Data safety questionnaire
   - Content rating questionnaire (IARC)
6. **Upload AAB**
   - Upload `android-twa/app-release-bundle.aab` to the target track
7. **Internal Testing**
   - Add internal testers
   - Install from Play Console link and verify TWA opens without address bar
8. **Production Release**
   - Address tester feedback
   - Submit to production for review

## Pre-Submission Sanity Checks
- App name + package name consistent across:
  - `android-twa/twa-manifest.json`
  - `public/manifest.json`
  - `public/.well-known/assetlinks.json`
  - `docs/release/PLAY_STORE_LISTING.md`
- Store screenshots match current UI and are in English
- Listing copy does not mention unsupported features (AI tutor, offline-first, push notifications)
