# 🔐 Agent 2: Auth & Environment Parity Analysis

> Investigation of authentication behavior parity between PWA and React Native

---

## Executive Summary

**Critical Issue Found:** RN credentials sign-in uses wrong endpoint. Google auth setup incomplete (missing client IDs). Deep linking configured but not wired to auth callback.

---

## 1. Environment Variables

### PWA Environment Variables

```bash
# Auth (NextAuth)
AUTH_SECRET / NEXTAUTH_SECRET      # JWT signing secret
AUTH_GOOGLE_ID / GOOGLE_CLIENT_ID  # Google OAuth
AUTH_GOOGLE_SECRET                 # Google OAuth secret
AUTH_FACEBOOK_ID                   # Facebook OAuth
AUTH_FACEBOOK_SECRET               # Facebook OAuth secret

# App
NEXT_PUBLIC_SITE_URL               # Base URL
```

### React Native Environment Variables

```bash
# Via eas.json profiles
EXPO_PUBLIC_API_BASE_URL           # API base (per build profile)

# Via app.config.ts extra
EAS_PROJECT_ID                     # EAS project ID

# Google Auth (expected but NOT SET)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID      # ❌ Missing
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID  # ❌ Missing  
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID      # ❌ Missing
```

### Environment Gap Analysis

| Variable | PWA | RN | Issue |
|----------|-----|-----|-------|
| API Base URL | Implicit (same origin) | `EXPO_PUBLIC_API_BASE_URL` | ✅ OK |
| Auth Secret | `AUTH_SECRET` | N/A (uses API) | ✅ OK |
| Google Web ID | `AUTH_GOOGLE_ID` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | ❌ Not set |
| Google Android ID | N/A | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | ❌ Not set |
| Google iOS ID | N/A | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | ❌ Not set |

### Required Actions

1. **Create Google OAuth credentials for mobile:**
   - Android: SHA-1 fingerprint required
   - iOS: Bundle ID required
   - Web: For Expo auth proxy

2. **Add to EAS secrets or .env:**
```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 2. Google Auth Configuration

### PWA Google Auth

```typescript
// lib/auth.ts
Google({
  clientId: googleClientId,
  clientSecret: googleClientSecret,
  authorization: {
    params: {
      prompt: 'select_account',
      access_type: 'offline',
      response_type: 'code',
    },
  },
})
```

**Flow:**
1. User clicks "Continue with Google"
2. NextAuth redirects to Google
3. Google redirects back to `/api/auth/callback/google`
4. NextAuth exchanges code for tokens
5. JWT session created with cookie

### React Native Google Auth

```typescript
// lib/google-auth.ts
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
});
```

**Flow:**
1. User taps "Continue with Google"
2. `promptAsync()` opens Google sign-in
3. Google returns `idToken`
4. RN sends idToken to `/api/mobile/auth/callback`
5. Server validates and returns JWT

### Platform-Specific Requirements

#### Web Client ID (Required for All)
- Used by Expo's auth proxy
- Same as PWA's `AUTH_GOOGLE_ID`

#### Android Client ID
- Create in Google Cloud Console
- Select "Android" application type
- Add SHA-1 fingerprint from keystore:
```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore
keytool -list -v -keystore ./android-twa/mklanguage.keystore -alias key0
```
- Package name: `com.mklanguage.app`

#### iOS Client ID
- Create in Google Cloud Console
- Select "iOS" application type
- Bundle ID: `com.mklanguage.app`
- Download `GoogleService-Info.plist` (optional, not required for expo-auth-session)

### Current Issues

1. **No client IDs set** - Google auth won't work
2. **No validation** - `isReady` check will be false
3. **No error handling** - Silent failure if credentials missing

### Required Fix

```typescript
// lib/google-auth.ts - Add validation
export function useGoogleAuth() {
  const hasCredentials = Boolean(
    GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID
  );

  if (!hasCredentials) {
    console.warn('[GoogleAuth] No OAuth credentials configured');
    return {
      request: null,
      response: null,
      promptAsync: async () => { throw new Error('Google auth not configured'); },
      isReady: false,
      isConfigured: false,
    };
  }

  // ... rest of implementation
}
```

---

## 3. Secure Storage vs localStorage

### PWA Storage

```typescript
// Auth: httpOnly cookie (managed by NextAuth)
// Theme: localStorage
localStorage.getItem('mk-theme')

// Translation history: localStorage
localStorage.getItem('mk-translator-history')

// Saved phrases: localStorage
localStorage.getItem('mk-saved-phrases')
```

### React Native Storage

```typescript
// Auth: expo-secure-store (encrypted)
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Get token
await SecureStore.getItemAsync(TOKEN_KEY);

// Set token
await SecureStore.setItemAsync(TOKEN_KEY, token);

// Other data: AsyncStorage (not encrypted)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.getItem('@translation_history');
```

### Security Comparison

| Aspect | PWA | RN | Notes |
|--------|-----|-----|-------|
| Token storage | httpOnly cookie | SecureStore | Both secure |
| Token access | Server-side only | App-accessible | RN can read token |
| Encryption | TLS only | Device keychain | RN more secure at rest |
| XSS protection | httpOnly prevents | N/A for native | Different threat model |

### Data Migration Concern

Users switching between PWA and RN app will have:
- Different auth sessions (expected)
- No shared localStorage/AsyncStorage (expected)
- Need to re-authenticate (expected)

---

## 4. Redirect / Deep Link Behavior

### PWA Redirects

```typescript
// After auth success
router.push(callbackUrl);  // e.g., /en/learn
router.refresh();

// After sign out
// NextAuth handles redirect to /auth/signin
```

### React Native Deep Linking

**Configuration:**
```typescript
// app.config.ts
scheme: 'mklanguage',
```

**URL Schemes:**
- `mklanguage://` - Custom scheme
- `exp://` - Expo Go (dev only)

**Current Implementation:**
```typescript
// apps/mobile/app/index.tsx
export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/sign-in" />;
}
```

### OAuth Callback Deep Link

**Server Side (exists):**
```typescript
// app/api/mobile/auth/callback/route.ts
// Returns redirect to: mklanguage://?token=xxx&email=xxx
return NextResponse.redirect(appendParams(redirectUri, params));
```

**Client Side (NOT implemented):**
```typescript
// Should be in apps/mobile/app/_layout.tsx or dedicated handler
import * as Linking from 'expo-linking';

useEffect(() => {
  const handleDeepLink = async (event: { url: string }) => {
    const { queryParams } = Linking.parse(event.url);
    if (queryParams?.token) {
      await setToken(queryParams.token as string);
      await setUser({
        email: queryParams.email as string,
        name: queryParams.name as string,
        // ...
      });
      router.replace('/(tabs)');
    }
  };

  const subscription = Linking.addEventListener('url', handleDeepLink);
  
  // Check if app was opened via deep link
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => subscription.remove();
}, []);
```

### Required Deep Link Setup

1. **Handle incoming auth callback:**
```typescript
// Create apps/mobile/app/auth-callback.tsx
import { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { setToken, setUser } from '../lib/storage';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    token?: string;
    email?: string;
    name?: string;
  }>();

  useEffect(() => {
    if (params.token) {
      handleAuthCallback();
    }
  }, [params.token]);

  const handleAuthCallback = async () => {
    await setToken(params.token!);
    await setUser({
      id: '', // Will be fetched
      email: params.email || '',
      name: params.name || null,
      image: null,
    });
    router.replace('/(tabs)');
  };

  return <LoadingScreen />;
}
```

2. **Register deep link route:**
```typescript
// In _layout.tsx Stack
<Stack.Screen name="auth-callback" options={{ headerShown: false }} />
```

---

## 5. Critical Auth Issues

### Issue 1: Wrong Credentials Endpoint

**Current (BROKEN):**
```typescript
// apps/mobile/store/auth.ts
signIn: async (email, password) => {
  const response = await fetch(
    `${getApiBaseUrl()}/api/auth/callback/credentials`,  // ❌ Wrong
    // ...
  );
}
```

**NextAuth's `/api/auth/callback/credentials`:**
- Expects CSRF token
- Returns redirect, not JSON
- Designed for browser form submission

**Correct Endpoint:**
```typescript
signIn: async (email, password) => {
  const response = await fetch(
    `${getApiBaseUrl()}/api/mobile/auth/login`,  // ✅ Correct
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );
  
  const data = await response.json();
  // Returns: { token, expiresAt, user: { id, name, email, image, role } }
}
```

### Issue 2: Missing Error Handling

**Current:**
```typescript
if (!response.ok) {
  const text = await response.text();
  throw new Error(text || 'Invalid email or password');
}
```

**Better:**
```typescript
if (!response.ok) {
  const data = await response.json().catch(() => ({}));
  throw new Error(data.error || 'Invalid email or password');
}
```

### Issue 3: No Token Refresh

**PWA:** NextAuth handles JWT refresh automatically

**RN:** No refresh mechanism

**Required:**
```typescript
// In apiFetch or auth store
if (response.status === 401) {
  // Try to refresh token
  const refreshed = await refreshToken();
  if (!refreshed) {
    await clearAll();
    throw new AuthError('Session expired');
  }
  // Retry original request
}
```

---

## 6. Required Changes Summary

### Immediate (P0)

1. **Fix credentials endpoint:**
```typescript
// apps/mobile/store/auth.ts
- `${getApiBaseUrl()}/api/auth/callback/credentials`
+ `${getApiBaseUrl()}/api/mobile/auth/login`
```

2. **Fix response handling:**
```typescript
const data = await response.json();
if (!data.token || !data.user) {
  throw new Error('Invalid response from server');
}
await setToken(data.token);
await setUser(data.user);
```

### Before Google Auth Works (P1)

3. **Set up Google OAuth credentials:**
   - Create Android OAuth client
   - Create iOS OAuth client  
   - Add to EAS secrets

4. **Add credential validation:**
```typescript
// lib/google-auth.ts
if (!GOOGLE_WEB_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID) {
  console.error('[GoogleAuth] No credentials configured');
}
```

### For Full Feature Parity (P2)

5. **Implement deep link handling:**
   - Add `auth-callback` route
   - Handle `mklanguage://?token=xxx` URLs

6. **Add token refresh:**
   - Implement refresh endpoint on server
   - Add refresh logic to auth store

---

## 7. Platform-Specific Gotchas

### iOS

| Issue | Solution |
|-------|----------|
| App Transport Security | API is HTTPS, no changes needed |
| Keychain sharing | SecureStore handles automatically |
| Sign in with Apple | Not implemented (consider adding) |

### Android

| Issue | Solution |
|-------|----------|
| SHA-1 for Google | Must register debug + release fingerprints |
| Back button on auth | Handle in navigation |
| Chrome Custom Tabs | expo-web-browser handles |

### Both Platforms

| Issue | Solution |
|-------|----------|
| Token persistence | SecureStore persists across app updates |
| Biometric auth | Could add for token access (future) |
| Session timeout | Need to implement refresh or re-auth |

---

## Summary

| Area | Status | Priority | Action |
|------|--------|----------|--------|
| Credentials endpoint | ❌ Wrong | P0 | Change to `/api/mobile/auth/login` |
| Google OAuth setup | ❌ Missing | P1 | Add client IDs |
| Deep link handling | ⚠️ Partial | P2 | Add callback handler |
| Token refresh | ❌ Missing | P2 | Implement refresh flow |
| Error handling | ⚠️ Basic | P2 | Improve error messages |
| Secure storage | ✅ Good | - | Using SecureStore correctly |
