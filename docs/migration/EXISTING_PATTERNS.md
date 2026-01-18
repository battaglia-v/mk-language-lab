# Existing Patterns & Reusable Logic

> **Rule:** Before proposing changes, search the repo for similar logic and reuse patterns.

---

## 1. Design Tokens (`@mk/tokens`)

**Location:** `packages/tokens/src/index.ts`

### Colors (MUST USE)

```typescript
import { brandColors, semanticColors } from '@mk/tokens';

// Instead of hardcoding:
backgroundColor: '#06060b'  // ❌ Don't do this

// Use tokens:
backgroundColor: brandColors.background  // ✅ Do this
```

**Available Colors:**
| Token | Value | Usage |
|-------|-------|-------|
| `brandColors.background` | `#06060b` | App background |
| `brandColors.surface` | `#0b0b12` | Card/input background |
| `brandColors.text` | `#f7f8fb` | Primary text |
| `brandColors.textMuted` | `rgba(247,248,251,0.72)` | Secondary text |
| `brandColors.accent` | `#f6d83b` | Primary accent (yellow) |
| `brandColors.border` | `#222536` | Default border |
| `brandColors.success` | `#3ecf8e` | Success states |
| `brandColors.danger` | `#ff7878` | Error states |

**Semantic Colors:**
```typescript
semanticColors.errorSurface   // Error background
semanticColors.errorBorder    // Error border
semanticColors.errorText      // Error text
semanticColors.successSurface // Success background
```

### Spacing

```typescript
import { spacingScale } from '@mk/tokens';

// spacingScale = { '2xs': 6, xs: 10, sm: 14, md: 18, lg: 22, xl: 28, '2xl': 36, '3xl': 44 }
```

### Border Radii

```typescript
import { radii } from '@mk/tokens';

// radii = { none: 0, sm: 12, md: 14, lg: 18, xl: 22, '2xl': 24, '3xl': 30, pill: 999 }
```

### Typography

```typescript
import { typographyScale } from '@mk/tokens';

// typographyScale.eyebrow = { fontSize: 12, lineHeight: 16, fontWeight: 700 }
// typographyScale.hero = { fontSize: 32, lineHeight: 40, fontWeight: 700 }
// typographyScale.title = { fontSize: 24, lineHeight: 32, fontWeight: 700 }
// typographyScale.body = { fontSize: 16, lineHeight: 24, fontWeight: 500 }
// typographyScale.caption = { fontSize: 14, lineHeight: 20, fontWeight: 600 }
```

---

## 2. Answer Normalization (`@mk/practice`)

**Location:** `packages/practice/src/normalize.ts`

### MUST USE for answer comparison

```typescript
import { normalizeAnswer, normalizeAnswerStrict } from '@mk/practice';

// normalizeAnswer: Flexible matching (strips diacritics)
normalizeAnswer('Здраво!')  // → 'здраво'
normalizeAnswer('Hello (formal)')  // → 'hello'

// normalizeAnswerStrict: Preserves diacritics for advanced learners
normalizeAnswerStrict('Здраво!')  // → 'здраво' (keeps Cyrillic intact)
```

**DO NOT** duplicate this logic. The RN app currently has local `normalizeAnswer` functions in:
- `apps/mobile/lib/practice.ts`
- `apps/mobile/components/practice/TypingCard.tsx`
- `apps/mobile/components/practice/ClozeCard.tsx`

These should import from `@mk/practice` instead.

---

## 3. Practice Session Logic (`@mk/practice`)

**Location:** `packages/practice/src/session.ts`

```typescript
import {
  evaluatePracticeAnswer,
  calculateAccuracy,
  calculateSessionProgress,
  selectNextPracticeIndex,
  getExpectedAnswer,
} from '@mk/practice';

// Evaluate an answer
const result = evaluatePracticeAnswer(userInput, practiceItem, direction);
// Returns: { isCorrect, expectedAnswer, normalizedExpected, normalizedInput, matchedAlternate }

// Calculate accuracy
const accuracy = calculateAccuracy(correctCount, totalAttempts);

// Calculate progress
const progress = calculateSessionProgress(correctCount, targetCount);
```

---

## 4. Error Classes (`lib/errors.ts`)

**Location:** `lib/errors.ts`

```typescript
import {
  NetworkError,
  TimeoutError,
  ValidationError,
  RateLimitError,
  ExternalServiceError,
  fetchWithTimeout,
  fetchWithRetry,
  createErrorResponse,
} from '@/lib/errors';

// Custom error types
throw new NetworkError('Connection failed');
throw new TimeoutError('Request timed out');
throw new ValidationError('Invalid email format');

// Fetch with automatic timeout
const response = await fetchWithTimeout(url, options, 10000);

// Fetch with retry + exponential backoff
const response = await fetchWithRetry(url, options, { maxRetries: 3 });
```

---

## 5. Haptic Feedback (`lib/haptics.ts`)

**Location:** `lib/haptics.ts` (PWA - uses Vibration API)

```typescript
import { triggerHaptic, haptic } from '@/lib/haptics';

// Trigger specific pattern
triggerHaptic('light');   // Quick feedback
triggerHaptic('success'); // Correct answer
triggerHaptic('error');   // Wrong answer/validation error

// Convenience functions
haptic.light();
haptic.success();
haptic.error();
```

**For React Native:** Use `expo-haptics` with similar patterns:
```typescript
import * as Haptics from 'expo-haptics';

// Equivalent patterns
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // light
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // success
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);   // error
```

---

## 6. Form Error Pattern (PWA)

**Location:** `app/auth/signin/page.tsx`, `app/auth/signup/page.tsx`

```typescript
// Standard pattern for field-level errors
const [fieldErrors, setFieldErrors] = useState<{
  email?: string;
  password?: string;
  general?: string;
}>({});

// Validation
const nextErrors: typeof fieldErrors = {};
if (!formData.email) {
  nextErrors.email = 'Email is required';
}
if (Object.keys(nextErrors).length) {
  setFieldErrors(nextErrors);
  return;
}

// JSX
<Input
  aria-invalid={Boolean(fieldErrors.email)}
  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
/>
{fieldErrors.email && (
  <p id="email-error" className="text-xs text-red-500" role="alert">
    {fieldErrors.email}
  </p>
)}
```

**For React Native:** Adapt this pattern:
```typescript
// Same state structure
const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; general?: string }>({});

// JSX
<TextInput
  style={[styles.input, fieldErrors.email && styles.inputError]}
/>
{fieldErrors.email && (
  <Text style={styles.errorText}>{fieldErrors.email}</Text>
)}
```

---

## 7. Toast Notifications (PWA)

**Location:** `components/ui/toast.tsx`, `components/ui/use-toast.ts`

```typescript
import { useToast } from '@/components/ui/toast';

const { addToast } = useToast();

// Success
addToast({ type: 'success', description: 'Phrase saved' });

// Error
addToast({ type: 'error', description: 'Failed to save' });

// Info
addToast({ type: 'info', description: 'Copied to clipboard' });
```

**For React Native:** Use `Alert.alert` for now:
```typescript
import { Alert } from 'react-native';

Alert.alert('Success', 'Phrase saved');
Alert.alert('Error', 'Failed to save');
```

---

## 8. Loading Button Pattern

**PWA Pattern:**
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

**RN Pattern:**
```tsx
<TouchableOpacity disabled={isLoading} style={[styles.button, isLoading && styles.buttonDisabled]}>
  {isLoading ? (
    <View style={styles.loadingContent}>
      <ActivityIndicator color="#000" size="small" />
      <Text style={styles.buttonText}>Loading...</Text>
    </View>
  ) : (
    <Text style={styles.buttonText}>Submit</Text>
  )}
</TouchableOpacity>
```

---

## 9. Disabled State Styling

**Standard disabled opacity:** `0.5`

```typescript
// PWA (Tailwind)
disabled:opacity-50

// RN
const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.5,
  },
});
```

---

## 10. API Client Pattern (`@mk/api-client`)

**Location:** `packages/api-client/src/`

```typescript
import { usePracticePromptsQuery, practicePromptsQueryKey } from '@mk/api-client';
import { useProfileSummaryQuery } from '@mk/api-client';

// React Query hooks (PWA)
const { data, isLoading, error } = usePracticePromptsQuery();

// Query keys for cache management
queryClient.invalidateQueries(practicePromptsQueryKey);
```

---

## 11. Gamification Logic (`@mk/gamification`)

**Location:** `packages/gamification/src/`

```typescript
import { calculateXP, calculateStreakBonus, calculateLevelFromXP } from '@mk/gamification';
import { calculateCurrentHearts, canPerformActivity } from '@mk/gamification';
import { calculateStreak, getStreakStatus } from '@mk/gamification';

// XP calculation
const xp = calculateXP({ source: 'practice', correct: 8, total: 10, difficulty: 'intermediate' });

// Hearts
const { hearts, nextHeartIn } = calculateCurrentHearts(context);
const canPractice = canPerformActivity(hearts, 0);

// Streak
const { currentStreak, longestStreak } = calculateStreak(context);
```

---

## 12. Existing RN Components

**Location:** `apps/mobile/components/`

### Practice Cards
- `MultipleChoiceCard.tsx` - Multiple choice exercise
- `TypingCard.tsx` - Free-text input exercise
- `ClozeCard.tsx` - Fill-in-the-blank
- `TapWordsCard.tsx` - Word ordering
- `MatchingCard.tsx` - Pair matching

### Reader
- `TappableText.tsx` - Tap-to-translate text
- `WordPopup.tsx` - Word definition popup

### Lesson
- `DialogueSection.tsx`
- `GrammarSection.tsx`
- `PracticeSection.tsx`
- `VocabularySection.tsx`
- `SectionTabs.tsx`

---

## Summary: Before Any Change

1. **Check `@mk/tokens`** - Use existing colors, spacing, radii
2. **Check `@mk/practice`** - Use `normalizeAnswer`, session logic
3. **Check `@mk/gamification`** - Use XP, hearts, streak logic
4. **Check `lib/errors.ts`** - Use error classes
5. **Check PWA patterns** - Match field error, loading, disabled patterns
6. **Check existing RN components** - Don't duplicate

### Import Priority

```typescript
// 1. Tokens first
import { brandColors, spacingScale, radii } from '@mk/tokens';

// 2. Business logic
import { normalizeAnswer, evaluatePracticeAnswer } from '@mk/practice';
import { calculateXP } from '@mk/gamification';

// 3. Error handling
import { NetworkError, fetchWithRetry } from '@/lib/errors';
```
