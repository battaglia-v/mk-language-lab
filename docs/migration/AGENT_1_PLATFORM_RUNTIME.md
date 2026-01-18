# 🧠 Agent 1: Platform & Runtime Analysis

> Investigation of Expo + React Native runtime parity issues

---

## Executive Summary

The app is configured for **New Architecture** with Expo SDK 54. Currently using only Expo Go-compatible modules, but **Dev Client is recommended** for production stability and future feature expansion.

---

## 1. Expo Go vs Dev Client Compatibility

### Current Configuration

```typescript
// app.config.ts
newArchEnabled: true,  // New Architecture enabled
plugins: ['expo-router', 'expo-secure-store'],  // Minimal plugins
```

### Modules in Use (Expo Go Compatible ✅)

| Module | Version | Expo Go | Notes |
|--------|---------|---------|-------|
| `expo` | ~54.0.0 | ✅ | Core SDK |
| `expo-router` | ~6.0.21 | ✅ | File-based routing |
| `expo-auth-session` | ~7.0.10 | ✅ | OAuth flows |
| `expo-secure-store` | ~15.0.8 | ✅ | Secure storage |
| `expo-clipboard` | ~8.0.8 | ✅ | Copy/paste |
| `expo-web-browser` | ~15.0.10 | ✅ | External links |
| `expo-linking` | ~8.0.11 | ✅ | Deep links |
| `expo-status-bar` | ~3.0.9 | ✅ | Status bar |
| `expo-constants` | ~18.0.13 | ✅ | App constants |
| `react-native-safe-area-context` | ~5.6.0 | ✅ | Safe areas |
| `react-native-screens` | ~4.16.0 | ✅ | Navigation |

### Future Modules That Would Require Dev Client

| Module | Purpose | Why Needed |
|--------|---------|------------|
| `expo-haptics` | Touch feedback | PWA has haptic triggers |
| `expo-av` | Audio playback | TTS/pronunciation |
| `react-native-reanimated` | Smooth animations | XP animations, transitions |
| `react-native-gesture-handler` | Swipe gestures | Card swipe, pull-to-refresh |
| Push notifications | Reminders | Requires native config |

### Verdict: Use Dev Client

**Reasons:**
1. New Architecture (`newArchEnabled: true`) benefits from native builds
2. Haptics needed for PWA parity (PWA has `triggerHaptic()`)
3. Future audio features (TTS, pronunciation) require `expo-av`
4. Gesture-based practice cards benefit from `react-native-gesture-handler`
5. Push notifications for study reminders require Dev Client

---

## 2. New Architecture Implications

### Current Status

```typescript
// app.config.ts
newArchEnabled: true,
```

### What This Means

| Aspect | Impact |
|--------|--------|
| **JSI (JavaScript Interface)** | Synchronous native calls, better perf |
| **TurboModules** | Lazy loading of native modules |
| **Fabric Renderer** | Improved UI threading |
| **React 19 Concurrent** | Better suspense support |

### Compatibility Concerns

All current dependencies are New Architecture compatible:
- ✅ `react-native-safe-area-context` - Native support
- ✅ `react-native-screens` - Native support
- ✅ All Expo modules - Built for New Arch

### Potential Issues

1. **Third-party libraries**: Any future libraries must support New Architecture
2. **Debugging**: Flipper not fully compatible; use Expo dev tools
3. **Bridge fallback**: Some older APIs may fall back to bridge (slower)

---

## 3. iOS vs Android Differences

### Keyboard Handling (Critical)

**Current Implementation:**
```typescript
// Inconsistent across screens
// sign-in.tsx, register.tsx, forgot-password.tsx:
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

// translate.tsx (different):
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
```

**Issues:**
- Android `height` behavior can cause layout jumps
- `undefined` for Android in translate.tsx means no adjustment
- No `keyboardVerticalOffset` configured

**Recommendation:**
```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
  style={{ flex: 1 }}
>
```

### Safe Area Handling

**Current Pattern:**
```typescript
<SafeAreaView style={styles.container} edges={['top']}>
```

**Issues:**
- Bottom edge not always protected
- Android edge-to-edge mode enabled but not fully utilized

**Android-Specific:**
```typescript
// app.config.ts
android: {
  edgeToEdgeEnabled: true,
}
```

This requires careful safe area handling for system bars.

### Navigation Gestures

| Aspect | iOS | Android |
|--------|-----|---------|
| Back gesture | Swipe from edge | System back button |
| Tab bar | Bottom safe area | No safe area needed |
| Modal dismiss | Swipe down | Back button |

**Current handling:** Relies on expo-router defaults (good)

### Status Bar

```typescript
// _layout.tsx
<StatusBar style="light" />
```

**Issue:** Hardcoded to light. Should respect theme (currently dark-only app).

### Text Input Differences

| Behavior | iOS | Android |
|----------|-----|---------|
| `returnKeyType="done"` | Shows "Done" | Shows checkmark |
| `secureTextEntry` | Bullets | Dots |
| `autoComplete` | Works | Partially works |
| `autoFocus` | Works | May require delay |

---

## 4. Input Focus, Keyboard, and Gesture Handling

### TextInput Focus Issues

**Current Implementation:**
```typescript
// TypingCard.tsx
<TextInput
  autoFocus
  autoCapitalize="none"
  autoCorrect={false}
  returnKeyType="done"
  editable={!showResult}
  onSubmitEditing={canCheck && !showResult ? handleCheck : undefined}
/>
```

**Issues Found:**
1. **`autoFocus` timing**: May not work on Android if component renders before layout
2. **`onSubmitEditing` conditional**: Should always be a function
3. **No `blurOnSubmit`**: Keyboard stays up after submit

**Recommended Fix:**
```typescript
<TextInput
  autoFocus={Platform.OS === 'ios'} // Delay on Android
  autoCapitalize="none"
  autoCorrect={false}
  returnKeyType="done"
  blurOnSubmit={true}
  editable={!showResult}
  onSubmitEditing={() => {
    if (canCheck && !showResult) {
      handleCheck();
    }
  }}
/>
```

### Keyboard Dismissal

**Missing:** No keyboard dismissal on tap outside.

**Required Addition:**
```typescript
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <View style={{ flex: 1 }}>
    {/* content */}
  </View>
</TouchableWithoutFeedback>
```

### Scroll + Keyboard

**Current:**
```typescript
// translate.tsx
keyboardShouldPersistTaps="handled"
```

**Issue:** Only in translate screen. Missing from other scrollable forms.

**Missing from:**
- Practice session (no scroll wrapper for keyboard)
- Settings (has scroll but no keyboard handling)

### Gesture Handling

**Not Using:** `react-native-gesture-handler`

**Impact:**
- No swipe-to-dismiss on cards
- No swipe navigation between practice cards
- Basic touch feedback only

**PWA Comparison:**
```typescript
// PWA has haptic feedback
import { triggerHaptic } from "@/lib/haptics";
handleNavClick = () => {
  triggerHaptic("light");
};
```

**RN Missing:** No haptic feedback (requires `expo-haptics`)

---

## 5. Known Incompatibilities

| Issue | Severity | Description |
|-------|----------|-------------|
| No haptics | Medium | PWA has haptic feedback, RN does not |
| Keyboard inconsistency | High | Different behavior iOS vs Android |
| No gesture library | Medium | Can't swipe cards, limited interactions |
| autoFocus Android | Medium | May not trigger on first render |
| Edge-to-edge Android | Low | Enabled but not fully styled |

---

## 6. Required Config Changes

### Immediate (Before Launch)

1. **Standardize KeyboardAvoidingView:**
```typescript
// Create shared wrapper component
export function KeyboardSafeView({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={{ flex: 1 }}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
```

2. **Add keyboard dismiss wrapper:**
```typescript
// Wrap scrollable content
<ScrollView keyboardShouldPersistTaps="handled">
```

3. **Fix autoFocus for Android:**
```typescript
// Use useEffect with small delay
useEffect(() => {
  if (Platform.OS === 'android') {
    setTimeout(() => inputRef.current?.focus(), 100);
  }
}, []);
```

### Before Major Feature Work

1. **Add `expo-haptics`:**
```bash
npx expo install expo-haptics
```

2. **Consider `react-native-reanimated`:**
```bash
npx expo install react-native-reanimated
```
Add to babel.config.js:
```javascript
plugins: ['react-native-reanimated/plugin'],
```

3. **Switch to Dev Client builds:**
```bash
npx expo prebuild
eas build --profile development
```

---

## 7. Recommendation: Dev Client

### Decision Matrix

| Factor | Expo Go | Dev Client |
|--------|---------|------------|
| Development speed | ✅ Faster | ⚠️ Slower initial |
| PWA feature parity | ❌ Limited | ✅ Full |
| Haptics | ❌ | ✅ |
| Audio/TTS | ❌ | ✅ |
| Push notifications | ❌ | ✅ |
| Gestures | ⚠️ Basic | ✅ Full |
| Production stability | ⚠️ | ✅ |

### Recommended Approach

1. **Now:** Continue with Expo Go for rapid iteration
2. **Before Beta:** Switch to Dev Client
3. **For Production:** Always use Dev Client builds

### Dev Client Setup

```bash
# Install Dev Client
npx expo install expo-dev-client

# Add to plugins in app.config.ts
plugins: ['expo-router', 'expo-secure-store', 'expo-dev-client'],

# Build development client
eas build --profile development --platform all

# Start with Dev Client
npx expo start --dev-client
```

---

## Summary

| Area | Status | Action Required |
|------|--------|-----------------|
| Expo Go compatibility | ✅ Current | - |
| New Architecture | ✅ Enabled | Monitor third-party libs |
| iOS/Android keyboard | ⚠️ Inconsistent | Standardize wrapper |
| Input focus | ⚠️ Android issues | Add focus delay |
| Gestures | ❌ Missing | Add gesture-handler |
| Haptics | ❌ Missing | Add expo-haptics |
| **Recommendation** | **Dev Client** | Before beta launch |
