# MK Language Lab - TWA (Trusted Web Activity) Setup Guide

## Step 1: Initialize Bubblewrap (Run in Terminal)

Open your terminal and run these commands:

```bash
cd /Users/vbattaglia/mk-language-lab/android-twa
bubblewrap init --manifest https://mklanguage.com/manifest.json
```

When prompted:
1. **"Do you want Bubblewrap to install the Android SDK?"** → Type `Yes` and press Enter
2. **"Do you agree to the Android SDK terms and conditions?"** → Type `y` and press Enter
3. **Signing key prompts** → Follow the prompts to create a new signing key:
   - Key password: Create a strong password (save it securely!)
   - Key alias: `mklanguage` (already set in config)
   - First and last name: Your name
   - Organization: Your organization name (or leave blank)
   - City, State, Country: Your location info

## Step 2: Build the APK

After initialization completes:

```bash
cd /Users/vbattaglia/mk-language-lab/android-twa
bubblewrap build
```

This creates:
- `app-release-signed.apk` - For testing on devices
- `app-release-bundle.aab` - For Play Store upload

## Step 3: Configure Digital Asset Links

After building, Bubblewrap will display your app's SHA-256 fingerprint. You'll need to update:

**File:** `public/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.mklanguage.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT_HERE"]
  }
}]
```

## Step 4: Test the APK

Install on an Android device:

```bash
adb install app-release-signed.apk
```

Or transfer the APK file to your Android device and install manually.

## Important Notes

- **Save your keystore password** - You'll need it for all future builds
- **Backup your keystore file** - `mklanguage.keystore` - losing this means you can't update the app
- **Production URL** - Make sure your app is deployed to `mklanguage.com` before testing

## Troubleshooting

If you get errors about Android SDK:
```bash
bubblewrap doctor
```

If you need to update the config:
```bash
bubblewrap update
```
