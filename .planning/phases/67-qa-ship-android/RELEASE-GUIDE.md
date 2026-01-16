# Release Guide - v2.0 Mobile App

Guide for building and releasing the Android app to Play Store.

## Prerequisites

### Tools
- Node.js 18+
- EAS CLI: `npm install -g eas-cli`
- Expo account with project access

### Credentials
- EAS project ID configured in app.config.ts
- Google Play Service Account JSON (`google-services.json`)
- Play Store listing access

## Build Profiles

| Profile | Purpose | Output | API URL |
|---------|---------|--------|---------|
| development | Local dev with dev client | APK | localhost:3000 |
| preview | Internal testing | APK | production API |
| production | Play Store release | AAB | production API |

## Build Commands

### Development Build
```bash
cd apps/mobile
eas build --profile development --platform android
```

### Preview Build (Internal Testing)
```bash
cd apps/mobile
eas build --profile preview --platform android
```

### Production Build
```bash
cd apps/mobile
eas build --profile production --platform android
```

## Release Process

### 1. Pre-Release Checklist
- [ ] QA checklist completed (see QA-CHECKLIST.md)
- [ ] Version number updated in app.config.ts
- [ ] versionCode incremented for Play Store
- [ ] All type-check passes
- [ ] Development build tested

### 2. Build Production AAB
```bash
cd apps/mobile
eas build --profile production --platform android
```

This will:
- Build an Android App Bundle (.aab)
- Auto-increment versionCode (from remote)
- Sign with production keystore

### 3. Submit to Play Store

**Option A: Automated Submit**
```bash
eas submit --platform android --profile production
```

Requires `google-services.json` in apps/mobile/

**Option B: Manual Upload**
1. Download AAB from EAS dashboard
2. Go to Play Console > Release > Production
3. Upload AAB
4. Fill release notes
5. Submit for review

### 4. Post-Release
- [ ] Verify app appears in Play Store
- [ ] Test installation from Play Store
- [ ] Monitor crash reports in Play Console
- [ ] Update TWA deprecation notice (if applicable)

## Version Management

Version format: `major.minor.patch`
- Current: 2.0.0
- versionCode: 200 (major*100 + minor*10 + patch)

EAS auto-increments versionCode on production builds.

## Troubleshooting

### Build Fails
1. Check EAS build logs
2. Verify credentials are configured
3. Run `eas build:configure` if needed

### Submit Fails
1. Verify service account has upload permissions
2. Check track name matches Play Console
3. Ensure package name matches Play Store listing

### Keystore Issues
1. Verify keystore matches Play Console
2. Contact EAS support if keystore lost

## Links

- [EAS Build Dashboard](https://expo.dev/accounts/[account]/projects/mk-language-lab/builds)
- [Play Console](https://play.google.com/console)
- [Expo Docs: EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Docs: EAS Submit](https://docs.expo.dev/submit/introduction/)
