# Phase 27: Bug Fixes - Research

**Researched:** 2026-01-10
**Domain:** Mobile keyboard hints for Macedonian Cyrillic text input
**Confidence:** HIGH

<research_summary>
## Summary

Researched mobile keyboard behavior for Macedonian Cyrillic input in web applications. The key finding is that **HTML/web APIs cannot programmatically switch keyboard language** - mobile keyboard language is controlled entirely by the OS/user settings. However, there are meaningful optimizations we can apply:

1. `lang="mk"` attribute on input elements - assists screen readers and provides semantic hints
2. `autocomplete="off"` + `spellCheck={false}` - prevents English autocorrect from fighting Cyrillic input
3. User education pattern - visual hint showing "Switch to Macedonian keyboard" when expected input is Cyrillic

**Primary recommendation:** Add `lang="mk"` to Macedonian text input fields, disable English autocorrect, and show a visual keyboard hint when Cyrillic input is expected. Do NOT attempt to programmatically switch keyboards (impossible on web).
</research_summary>

<standard_stack>
## Standard Stack

### Core HTML Attributes
| Attribute | Value | Purpose | Effect |
|-----------|-------|---------|--------|
| `lang` | `"mk"` | Language hint | Screen readers, semantic markup |
| `inputmode` | `"text"` (default) | Keyboard type | Shows standard text keyboard |
| `dir` | `"ltr"` | Text direction | Left-to-right (Macedonian uses LTR) |
| `autocomplete` | `"off"` | Disable autocomplete | Prevents English suggestions |
| `spellCheck` | `{false}` | Disable spell check | Prevents English spellcheck underlining |
| `autoCapitalize` | `"off"` | Disable auto-capitalization | Prevents English capitalization rules |

### What inputmode Values Actually Do
| Value | Keyboard Type | Use For |
|-------|---------------|---------|
| `text` | Standard locale keyboard | **Cyrillic text** (default, recommended) |
| `numeric` | Digits 0-9 | PINs, codes |
| `decimal` | Digits + decimal | Prices, measurements |
| `tel` | Phone keypad | Phone numbers |
| `email` | Email keyboard (@, .) | Email addresses |
| `url` | URL keyboard (/, .) | URLs |
| `search` | Search keyboard | Search queries |
| `none` | No keyboard | Custom keyboard implementations |

**Key insight:** `inputmode` controls keyboard *type* (numeric vs text), NOT keyboard *language* (English vs Cyrillic).

### Browser Support
- `inputmode`: Baseline since December 2021 - widely supported
- `lang`: Universal support
- `spellCheck`, `autoComplete`, `autoCapitalize`: Universal support

**Installation:** N/A - native HTML attributes, no libraries needed.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Input Pattern for Cyrillic

```tsx
// For Macedonian text input (typing exercises, translations)
<Input
  lang="mk"
  inputmode="text"
  autoComplete="off"
  autoCapitalize="off"
  spellCheck={false}
  placeholder="Напишете на македонски..."
/>
```

### Visual Keyboard Hint Component
```tsx
// Pattern: Show hint when Cyrillic keyboard expected
function KeyboardHint({ expectedScript }: { expectedScript: 'cyrillic' | 'latin' }) {
  if (expectedScript !== 'cyrillic') return null;

  return (
    <div className="text-sm text-muted-foreground flex items-center gap-1">
      <KeyboardIcon className="h-4 w-4" />
      <span>Switch to Macedonian keyboard</span>
    </div>
  );
}
```

### Conditional Hint Logic
```tsx
// Show hint only when:
// 1. Input expects Cyrillic
// 2. Input is empty OR last character was Latin
const shouldShowHint = useMemo(() => {
  if (expectedScript !== 'cyrillic') return false;
  if (!value) return true; // Show on empty input
  const lastChar = value.slice(-1);
  const isCyrillic = /[\u0400-\u04FF]/.test(lastChar);
  return !isCyrillic; // Show if typing Latin
}, [value, expectedScript]);
```

### Project Structure
```
components/
├── ui/
│   └── input.tsx              # Base Input with lang support
└── practice/
    ├── word-sprint/
    │   ├── TypedInput.tsx     # Add lang="mk" here
    │   └── KeyboardHint.tsx   # NEW: Visual hint component
    └── shared/
        └── CyrillicInput.tsx  # Reusable wrapper (optional)
```

### Anti-Patterns to Avoid
- **Attempting to switch keyboards programmatically:** Not possible on web - OS controls this
- **Using `inputmode="numeric"` for Cyrillic:** Wrong - shows number keyboard, not letters
- **Leaving English spellcheck on:** Annoying red underlines on valid Cyrillic
- **Complex keyboard detection JS:** Unreliable, battery-draining, not worth it
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard language detection | JS keyboard event analysis | Visual hint pattern | Unreliable across devices, privacy concerns |
| Virtual Cyrillic keyboard | Custom on-screen keyboard | Native keyboard + hint | Mobile users have Cyrillic keyboards installed |
| Character-by-character validation | Live Cyrillic enforcement | Post-submit validation | Frustrating UX, blocks legitimate mixed input |
| Keyboard switch API | Custom native bridge | Visual hint to user | No such API exists on web |

**Key insight:** The web platform intentionally does NOT expose keyboard language APIs for privacy reasons. The user controls their keyboard. Our job is to:
1. Make Cyrillic input comfortable (disable English autocorrect)
2. Remind users to switch keyboards when needed (visual hint)
3. Accept the input gracefully (tolerant matching)
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Expecting `inputmode` to Change Language
**What goes wrong:** Developer sets `inputmode="text" lang="mk"` and expects Cyrillic keyboard
**Why it happens:** Misunderstanding what inputmode does - it's about keyboard TYPE not LANGUAGE
**How to avoid:** Accept that keyboard language is user-controlled; use visual hints instead
**Warning signs:** Feature requests like "force Cyrillic keyboard"

### Pitfall 2: English Autocorrect Fighting Cyrillic
**What goes wrong:** User types "Здраво" and autocorrect suggests "Зрали" or underlines as misspelled
**Why it happens:** Browser's English spellcheck/autocorrect is still active
**How to avoid:** Set `spellCheck={false}`, `autoComplete="off"`, `autoCapitalize="off"`
**Warning signs:** Red underlines on valid Macedonian words

### Pitfall 3: Strict Character Validation
**What goes wrong:** Input rejects mixed Latin/Cyrillic (e.g., proper nouns, borrowed words)
**Why it happens:** Over-zealous validation requiring pure Cyrillic
**How to avoid:** Validate semantics (correct answer) not character set
**Warning signs:** Users can't type "iPhone" or "WhatsApp" in sentences

### Pitfall 4: Missing Mobile Keyboard Installation
**What goes wrong:** Users don't have Macedonian keyboard installed at all
**Why it happens:** First-time learners may not have set up Cyrillic input
**How to avoid:** Show one-time onboarding hint with keyboard setup instructions
**Warning signs:** Users consistently typing Latin transliterations

### Pitfall 5: Lang Attribute on Wrong Element
**What goes wrong:** `lang="mk"` on page but inputs still behave as English
**Why it happens:** Lang on `<html>` doesn't propagate to input behavior meaningfully
**How to avoid:** Put `lang="mk"` directly on the input element
**Warning signs:** Screen readers announce inputs as English
</common_pitfalls>

<code_examples>
## Code Examples

### Basic Macedonian Input Field
```tsx
// Source: MDN inputmode + lang documentation
<input
  type="text"
  lang="mk"
  inputMode="text"
  autoComplete="off"
  autoCapitalize="off"
  spellCheck={false}
  placeholder="Напишете тука..."
  className="..."
/>
```

### TypedInput Enhancement (Current Codebase Pattern)
```tsx
// Enhanced version of components/practice/word-sprint/TypedInput.tsx
<Input
  ref={inputRef}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Напишете го одговорот..."
  disabled={disabled || !!feedback}
  lang="mk"                    // ADD: Language hint
  autoComplete="off"           // EXISTING
  autoCapitalize="off"         // EXISTING
  spellCheck={false}           // EXISTING
  data-testid="word-sprint-typed-input"
  className={cn(
    'min-h-[52px] text-lg rounded-xl text-center',
    feedback === 'correct' && 'border-emerald-400 bg-emerald-500/20',
    feedback === 'incorrect' && 'border-amber-400 bg-amber-500/20'
  )}
/>
```

### Keyboard Hint Component
```tsx
// NEW component for keyboard switch reminder
import { Keyboard } from 'lucide-react';

type KeyboardHintProps = {
  show: boolean;
  className?: string;
};

export function KeyboardHint({ show, className }: KeyboardHintProps) {
  if (!show) return null;

  return (
    <div className={cn(
      'flex items-center gap-1.5 text-sm text-muted-foreground animate-in fade-in duration-300',
      className
    )}>
      <Keyboard className="h-4 w-4" />
      <span>Користете македонска тастатура</span>
    </div>
  );
}
```

### Cyrillic Detection Utility
```tsx
// utils/cyrillic.ts - detect if string contains Cyrillic
export function containsCyrillic(str: string): boolean {
  return /[\u0400-\u04FF]/.test(str);
}

export function isMainlyCyrillic(str: string): boolean {
  const cyrillicCount = (str.match(/[\u0400-\u04FF]/g) || []).length;
  const letterCount = (str.match(/\p{L}/gu) || []).length;
  return letterCount > 0 && cyrillicCount / letterCount > 0.5;
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hope keyboard auto-switches | Visual hint pattern | Always this way | Web never had keyboard control |
| `type="text"` only | `inputmode` + `lang` combo | 2021+ | Better semantics, accessibility |
| English autocorrect fighting | Disable all autocorrect | Best practice | Much better Cyrillic UX |

**New tools/patterns to consider:**
- **Virtual keyboard API (Experimental):** `navigator.virtualKeyboard` - controls keyboard visibility, NOT language. Not useful here.
- **EditContext API (Experimental):** For custom text editors - overkill for our use case.

**Deprecated/outdated:**
- None - this space hasn't changed significantly. Web keyboard language control remains impossible by design (privacy).

**Reality check:** Major language learning apps (Duolingo, Babbel, etc.) use the same approach:
1. Disable English autocorrect
2. Show visual hints for keyboard switching
3. Provide on-screen character picker for special characters (optional)
</sota_updates>

<open_questions>
## Open Questions

1. **On-screen Cyrillic character picker?**
   - What we know: Some apps show clickable characters for special letters
   - What's unclear: Whether Macedonian needs this (no special diacritics beyond standard Cyrillic)
   - Recommendation: Skip for MVP - Macedonian Cyrillic is standard, users have native keyboard support

2. **First-time keyboard setup onboarding?**
   - What we know: Some users may not have Macedonian keyboard installed
   - What's unclear: How many users this affects, what the right trigger is
   - Recommendation: Consider adding a one-time "Set up your keyboard" guide in settings/onboarding. Not essential for Phase 27 (bug fixes focus).
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- MDN Web Docs - `inputmode` global attribute (fetched 2026-01-10)
- MDN Web Docs - `lang` global attribute (fetched 2026-01-10)
- HTML Living Standard - inputmode specification (fetched 2026-01-10)
- MDN Web Docs - `dir` attribute (fetched 2026-01-10)

### Secondary (MEDIUM confidence)
- web.dev - Form input best practices (verified against MDN)
- CSS-Tricks - inputmode guide (verified against HTML spec)
- W3C Internationalization - Language declarations (fetched 2026-01-10)

### Tertiary (LOW confidence - needs validation)
- None - all critical findings verified against official sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: HTML input attributes (inputmode, lang, dir)
- Ecosystem: Mobile keyboard behavior (iOS Safari, Android Chrome)
- Patterns: Visual keyboard hints, autocorrect disabling
- Pitfalls: Keyboard language misconceptions, autocorrect conflicts

**Confidence breakdown:**
- Standard approach: HIGH - verified with MDN and HTML spec
- Architecture patterns: HIGH - based on official documentation and codebase analysis
- Pitfalls: HIGH - well-documented limitations in specifications
- Code examples: HIGH - derived from existing codebase patterns + MDN

**Research date:** 2026-01-10
**Valid until:** 2026-04-10 (90 days - stable HTML spec, unlikely to change)
</metadata>

---

*Phase: 27-bug-fixes*
*Research completed: 2026-01-10*
*Ready for planning: yes*
