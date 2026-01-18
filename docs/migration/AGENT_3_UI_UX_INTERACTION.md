# 🎨 Agent 3: UI / UX / Interaction Parity Analysis

> Investigation of UI and interaction parity between PWA and React Native

---

## Executive Summary

UI patterns are generally solid but diverge from PWA in key areas: disabled states, keyboard handling, layout spacing, and feedback patterns. Forms need attention for focus management and validation display.

---

## 1. Forms and Input Focus

### PWA Input Pattern

```tsx
// app/auth/signin/page.tsx
<Input
  id="email"
  type="email"
  placeholder="you@example.com"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  disabled={isLoading}
  required
  className="h-12 rounded-xl"
  aria-invalid={Boolean(fieldErrors.email)}
  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
  data-testid="auth-signin-email"
/>
{fieldErrors.email && (
  <p id="email-error" className="text-xs text-red-500" role="alert">
    {fieldErrors.email}
  </p>
)}
```

### React Native Input Pattern

```tsx
// apps/mobile/app/sign-in.tsx
<TextInput
  style={styles.input}
  placeholder="Email"
  placeholderTextColor="#666"
  value={email}
  onChangeText={setEmail}
  autoCapitalize="none"
  keyboardType="email-address"
  autoComplete="email"
/>
```

### Gap Analysis

| Feature | PWA | RN | Fix Required |
|---------|-----|-----|--------------|
| Field-level errors | ✅ Per-field display | ❌ Single error message | Yes |
| aria-invalid | ✅ Accessibility | ❌ Not applicable | N/A |
| Disabled state | ✅ Visual + functional | ⚠️ No visual on input | Yes |
| Test IDs | ✅ Consistent | ❌ Missing | Yes |
| Error association | ✅ aria-describedby | N/A | N/A |
| Label association | ✅ htmlFor | ❌ No `<Label>` | Consider |

### Required Changes

#### 1. Add Field-Level Error Display

```tsx
// Create shared component: components/ui/FormInput.tsx
type FormInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  testID?: string;
};

export function FormInput({
  value,
  onChangeText,
  placeholder,
  error,
  disabled,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  testID,
}: FormInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(247,248,251,0.4)"
        editable={!disabled}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        testID={testID}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
```

#### 2. Add Test IDs

```tsx
// sign-in.tsx
<TextInput
  testID="auth-signin-email"  // Add
  // ...
/>
```

---

## 2. Disabled State Logic

### PWA Disabled Pattern

```tsx
// Button with shadcn/ui
<Button
  type="submit"
  disabled={isLoading || !email || !password}
  // Tailwind automatically applies:
  // - opacity-50
  // - cursor-not-allowed
  // - pointer-events-none (when disabled)
>
```

### React Native Disabled Pattern

```tsx
// TouchableOpacity
<TouchableOpacity
  style={[styles.button, isLoading && styles.buttonDisabled]}
  onPress={handleSignIn}
  disabled={isLoading || !email || !password}
>
```

```tsx
const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.6,
  },
});
```

### Issues Found

| Component | Issue |
|-----------|-------|
| `TouchableOpacity` | Only opacity change, no visual distinction |
| Multiple choice options | `disabled` works but no cursor feedback |
| Settings rows | `rowDisabled` style exists but inconsistent |

### Required Changes

#### 1. Standardize Disabled Styling

```tsx
// shared/styles.ts
export const disabledStyles = {
  button: {
    opacity: 0.5,
  },
  input: {
    opacity: 0.5,
    backgroundColor: 'rgba(247,248,251,0.05)',
  },
  touchable: {
    opacity: 0.5,
  },
};
```

#### 2. Create Consistent Button Component

```tsx
// components/ui/Button.tsx
type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  testID?: string;
};

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : '#fff'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

---

## 3. CSS → React Native Style Mismatches

### Color System

**PWA (CSS Variables):**
```css
--mk-bg: #06060b;
--mk-text: #f7f8fb;
--mk-accent: #f6d83b;
--mk-border: #222536;
--mk-muted: rgba(247,248,251,0.6);
```

**RN (Hardcoded):**
```typescript
backgroundColor: '#06060b',
color: '#f7f8fb',
// Accent: '#f6d83b'
// Border: '#222536'
// Muted: 'rgba(247,248,251,0.6)'
```

**Issue:** Values duplicated, no central source.

**Fix:** Import from `@mk/tokens`:
```typescript
import { colors } from '@mk/tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background, // '#06060b'
  },
});
```

### Spacing System

**PWA (Tailwind):**
```
p-4 → 16px
gap-2 → 8px
rounded-xl → 12px
rounded-2xl → 16px
```

**RN (Hardcoded):**
```typescript
padding: 16,
gap: 12,  // Not always consistent
borderRadius: 12,
borderRadius: 16,
```

**Issue:** Inconsistent gap values (8, 12, 16 used interchangeably)

**Fix:** Create spacing constants:
```typescript
// lib/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};
```

### Typography

**PWA (Tailwind):**
```
text-xs → 12px
text-sm → 14px
text-base → 16px
text-lg → 18px
text-xl → 20px
text-2xl → 24px
```

**RN (Various):**
```typescript
fontSize: 11,  // Inconsistent
fontSize: 13,
fontSize: 14,
fontSize: 16,
fontSize: 18,
fontSize: 20,
fontSize: 22,
fontSize: 24,
fontSize: 28,
fontSize: 32,
```

**Fix:** Standardize typography scale:
```typescript
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};
```

### Shadows

**PWA:**
```css
shadow-sm, shadow-md, shadow-lg
```

**RN:**
```typescript
// iOS
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,

// Android
elevation: 4,
```

**Issue:** No shadows used in RN currently.

---

## 4. Layout Differences

### Safe Area Handling

**PWA:**
```css
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

**RN Current:**
```tsx
<SafeAreaView style={styles.container} edges={['top']}>
```

**Issues:**
- Bottom edge often not included
- Inconsistent across screens

**Fix:**
```tsx
// For screens with bottom content
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>

// For screens with tab bar (no bottom needed)
<SafeAreaView style={styles.container} edges={['top']}>
```

### Scroll Behavior

**PWA:**
```tsx
<main className="flex-1 px-4 py-4 pb-20 lg:pb-4 space-y-4">
```

**RN:**
```tsx
<ScrollView
  style={styles.scrollView}
  contentContainerStyle={styles.content}
>
```

**Issues:**
- No bounce customization
- Missing `showsVerticalScrollIndicator={false}` in some places
- `contentContainerStyle` padding inconsistent

**Standardize:**
```tsx
<ScrollView
  style={styles.scrollView}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
  bounces={true}
  keyboardShouldPersistTaps="handled"
>
```

### Keyboard Avoidance

**Current (Inconsistent):**
```tsx
// translate.tsx
behavior={Platform.OS === 'ios' ? 'padding' : undefined}

// sign-in.tsx
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
```

**Standardize:**
```tsx
// Create wrapper
export function KeyboardAvoidingContainer({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
```

---

## 5. Interaction Differences

### Touch Feedback

**PWA:**
```tsx
// Has haptic feedback
import { triggerHaptic } from "@/lib/haptics";
onClick={() => {
  triggerHaptic("light");
  // action
}}
```

**RN:**
```tsx
// No haptic feedback
<TouchableOpacity
  activeOpacity={0.7}
  onPress={handlePress}
>
```

**Fix (requires expo-haptics):**
```typescript
import * as Haptics from 'expo-haptics';

const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // action
};
```

### Button Press States

**PWA:**
```css
active:scale-[0.98]  /* Scale down on press */
transition-transform duration-100
```

**RN:**
```tsx
activeOpacity={0.7}  // Only opacity change
```

**Enhanced Version:**
```tsx
import { Animated, Pressable } from 'react-native';

function AnimatedButton({ onPress, children }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

### Loading States

**PWA:**
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Signing in...
    </>
  ) : (
    'Sign In'
  )}
</Button>
```

**RN:**
```tsx
<TouchableOpacity disabled={isLoading}>
  {isLoading ? (
    <ActivityIndicator color="#000" />
  ) : (
    <Text>Sign In</Text>
  )}
</TouchableOpacity>
```

**Issue:** RN doesn't show "Signing in..." text during loading.

**Fix:**
```tsx
<TouchableOpacity disabled={isLoading} style={styles.button}>
  {isLoading ? (
    <View style={styles.loadingContent}>
      <ActivityIndicator color="#000" size="small" />
      <Text style={styles.buttonText}>Signing in...</Text>
    </View>
  ) : (
    <Text style={styles.buttonText}>Sign In</Text>
  )}
</TouchableOpacity>
```

---

## 6. Component-Specific Fixes

### Sign In Screen

| Issue | Current | Fix |
|-------|---------|-----|
| Field errors | Single message | Per-field errors |
| Loading text | Spinner only | "Signing in..." |
| Test IDs | Missing | Add all |
| Google button | No disabled reason | Show "Not configured" |

### Practice Cards

| Issue | Current | Fix |
|-------|---------|-----|
| Feedback animation | None | Add shake/bounce |
| Correct/incorrect colors | ✅ Good | - |
| Button disabled state | Opacity only | Add visual feedback |

### Translate Screen

| Issue | Current | Fix |
|-------|---------|-----|
| Character count | ✅ Good | - |
| Copy feedback | ✅ Good | - |
| History modal | ✅ Good | - |
| Keyboard handling | ✅ Good | - |

### Profile Screen

| Issue | Current | Fix |
|-------|---------|-----|
| Avatar | Initials only | Add image support |
| Stats loading | ✅ Good | - |
| Pull to refresh | ✅ Good | - |

---

## 7. Summary of Required Changes

### P0 - Critical for Parity

1. **Standardize KeyboardAvoidingView** across all form screens
2. **Add field-level error display** in auth forms
3. **Add test IDs** to all interactive elements

### P1 - Should Fix

4. **Create shared Button component** with consistent disabled/loading states
5. **Create shared FormInput component** with error states
6. **Import colors from @mk/tokens** instead of hardcoding

### P2 - Nice to Have

7. **Add haptic feedback** (requires expo-haptics)
8. **Add press animations** for buttons
9. **Add loading text** to buttons
10. **Standardize typography scale**

### Platform-Specific Fixes

| Platform | Issue | Fix |
|----------|-------|-----|
| iOS | Safe area bottom | Include bottom edge where needed |
| Android | Keyboard height | Use `keyboardVerticalOffset` |
| Android | autoFocus timing | Add small delay |
| Both | Keyboard dismiss | Wrap in TouchableWithoutFeedback |

---

## Quick Reference: Style Mapping

| PWA (Tailwind) | RN Equivalent |
|----------------|---------------|
| `bg-[#06060b]` | `backgroundColor: '#06060b'` |
| `text-[#f7f8fb]` | `color: '#f7f8fb'` |
| `p-4` | `padding: 16` |
| `px-4 py-2` | `paddingHorizontal: 16, paddingVertical: 8` |
| `gap-2` | `gap: 8` |
| `rounded-xl` | `borderRadius: 12` |
| `rounded-2xl` | `borderRadius: 16` |
| `opacity-50` | `opacity: 0.5` |
| `min-h-[48px]` | `minHeight: 48` |
| `flex-1` | `flex: 1` |
| `items-center` | `alignItems: 'center'` |
| `justify-center` | `justifyContent: 'center'` |
| `font-bold` | `fontWeight: 'bold'` or `fontWeight: '700'` |
| `text-sm` | `fontSize: 14` |
| `text-lg` | `fontSize: 18` |
