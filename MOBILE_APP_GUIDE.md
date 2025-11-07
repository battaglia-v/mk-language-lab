# Mobile App Deployment Guide

This guide explains how to build and deploy your Macedonian Learning App to Android and iOS app stores using Capacitor.

## Overview

Your app is a **Next.js web application** wrapped with **Capacitor** for native mobile deployment. The app loads your production website (`https://mk-language-lab.vercel.app`) inside a native WebView, maintaining all server-side features (authentication, API routes, database).

## What's Already Set Up

✅ Capacitor installed and configured
✅ Android platform added (ready to build)
✅ iOS platform added (needs Xcode for final build)
✅ Configuration points to production Vercel deployment
✅ App ID: `com.macedonian.learn`
✅ App Name: `Macedonian Learning`

## Prerequisites

### For Android:
- **Android Studio** (download from https://developer.android.com/studio)
- **Java Development Kit (JDK)** 11 or higher

### For iOS:
- **macOS** (required for iOS development)
- **Xcode** 14+ (download from Mac App Store)
- **CocoaPods** (install via: `sudo gem install cocoapods`)
- **Apple Developer Account** ($99/year)

## Building for Android

### 1. Open Android Studio
```bash
npx cap open android
```

### 2. Configure App in Android Studio
1. Wait for Gradle sync to complete
2. Update `android/app/build.gradle`:
   - Set `versionCode` and `versionName`
   - Update `minSdkVersion` if needed (currently 22)

### 3. Generate Signing Key
```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 4. Build Release APK/AAB
1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle** (AAB) for Play Store
3. Choose your keystore file
4. Build type: **Release**

### 5. Upload to Google Play Console
1. Go to https://play.google.com/console
2. Create new app
3. Upload AAB file
4. Fill in store listing details
5. Submit for review

## Building for iOS

### 1. Install CocoaPods (if not installed)
```bash
sudo gem install cocoapods
```

### 2. Install iOS Dependencies
```bash
cd ios/App
pod install
cd ../..
```

### 3. Open Xcode
```bash
npx cap open ios
```

### 4. Configure App in Xcode
1. Select project in navigator
2. Update **Bundle Identifier**: `com.macedonian.learn`
3. Set **Team** (requires Apple Developer account)
4. Update **Version** and **Build** numbers

### 5. Add App Icons and Launch Screen
- Add icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Update LaunchScreen.storyboard

### 6. Build and Archive
1. Select **Any iOS Device** as destination
2. **Product → Archive**
3. Wait for build to complete
4. Click **Distribute App**
5. Select **App Store Connect**

### 7. Upload to App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Upload build from Xcode Organizer
4. Fill in app information
5. Submit for review

## Important Configuration

### App Loads Production Website
Your `capacitor.config.ts` is configured to load:
```typescript
server: {
  url: 'https://mk-language-lab.vercel.app',
  cleartext: true,
}
```

This means:
- ✅ All server-side features work (auth, APIs, database)
- ✅ Users always get latest updates without app store approval
- ✅ One codebase for web + mobile
- ⚠️ Requires internet connection to use the app

### Updating the App

**Content Updates**: Just deploy to Vercel - users get updates immediately!

**Native Updates** (require app store resubmission):
- App icon changes
- App name changes
- Native plugin additions
- Permissions changes

## Testing

### Android Emulator
```bash
npx cap run android
```

### iOS Simulator
```bash
npx cap run ios
```

### On Physical Device
1. Build debug version
2. Connect device via USB
3. Run from Android Studio / Xcode

## App Store Requirements

### Android (Google Play)
- App icon (512x512 PNG)
- Feature graphic (1024x500)
- Screenshots (2-8 images)
- Privacy policy URL
- Target API level 33+

### iOS (App Store)
- App icon (1024x1024 PNG)
- Screenshots for all device sizes
- Privacy policy URL
- App review information
- Export compliance information

## Adding Native Features

If you need native features (camera, push notifications, etc.):

```bash
npm install @capacitor/camera
npm install @capacitor/push-notifications
npx cap sync
```

Then use in your code:
```typescript
import { Camera } from '@capacitor/camera';
const photo = await Camera.getPhoto({
  quality: 90,
  allowEditing: true,
  resultType: CameraResultType.Uri
});
```

## Troubleshooting

**Build fails in Android Studio**:
- Clean project: **Build → Clean Project**
- Invalidate caches: **File → Invalidate Caches / Restart**
- Update Gradle: Check `android/build.gradle`

**Pod install fails (iOS)**:
- Run: `cd ios/App && pod repo update && pod install`
- Clean: `rm -rf Pods Podfile.lock && pod install`

**App shows white screen**:
- Check production URL is accessible
- Verify capacitor.config.ts server URL
- Check device has internet connection

## Production Checklist

Before submitting to app stores:

- [ ] Test on real devices (Android + iOS)
- [ ] Verify all features work in mobile WebView
- [ ] Test authentication flow
- [ ] Check responsive design on different screen sizes
- [ ] Prepare app store assets (icons, screenshots, descriptions)
- [ ] Write privacy policy
- [ ] Set up app store developer accounts
- [ ] Generate production signing keys
- [ ] Test payment flows (if applicable)
- [ ] Prepare customer support contact info

## Next Steps

1. **Immediate**: Test Android build in emulator
   ```bash
   npx cap run android
   ```

2. **This Week**:
   - Design app icon (1024x1024)
   - Take screenshots from app
   - Write app store descriptions

3. **Before Launch**:
   - Create Google Play developer account
   - Create Apple Developer account (if targeting iOS)
   - Prepare privacy policy
   - Build and test release versions

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Publishing Guide](https://developer.android.com/studio/publish)
- [iOS Publishing Guide](https://developer.apple.com/app-store/submissions/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

---

**Questions?** The setup is complete and ready for building. Focus on Android first since it's easier to test without Mac/Xcode.
