# Mobile Migration Plan (React Native + Expo)

## Goals
- Ship a single native mobile app for iOS and Android with long-term maintainability.
- Preserve the existing Play Store listing by reusing the package ID and signing key.
- Keep the Next.js app as the web experience (PWA for web, not stores).

## Decisions (locked)
- Primary mobile client: React Native (Expo, managed workflow).
- TWA will be deprecated after the RN Android release.
- Play Store continuity: package ID `com.mklanguage.app` and `android-twa/mklanguage.keystore`.
- Shared logic/design from `packages/*`.

## Decisions (pending)
- IAP model (subscription vs lifetime unlock).
- Background sync requirement for v1.

## Execution checklist
- [x] Locate last commit containing Expo app (RN removed in `3de43ba0b87c000313041fbd49e959623f9c5768`).
- [ ] Restore `apps/mobile` from history and reconcile with current repo state.
- [ ] Audit API/parity gaps between the Expo app and current Next.js routes/contracts.
- [ ] Wire shared packages (`packages/api-client`, `packages/practice`, `packages/tokens`, `packages/ui`) into the Expo app.
- [ ] Re-establish Expo config (`app.config.ts`, `eas.json`, envs) and verify build profiles.
- [ ] Implement v1 parity flows (Home/Missions, Practice, Reader, Translate, Profile/Auth).
- [ ] Add native capabilities: push reminders, IAP, offline audio caching, deep links.
- [ ] Set up Apple Developer account, App Store Connect, Sign in with Apple.
- [ ] Prepare store assets/metadata and compliance for Play + App Store.
- [ ] Validate with automated tests and device QA; ship Android update; then ship iOS; deprecate TWA.

## Progress log
- 2026-01-16: Found Expo removal commit in git history; restore to follow.
