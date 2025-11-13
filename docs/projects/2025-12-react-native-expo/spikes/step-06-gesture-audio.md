# Step 06 Spike – Quick Practice Swipe Stack & Audio Hooks

**Goal:** De-risk the upcoming Quick Practice 2.0 work by choosing gesture/audio libraries, defining component boundaries, and listing integration tasks for both Expo (mobile) and web parity.

## 1. Libraries & Runtime Constraints

| Concern | Decision | Notes |
| --- | --- | --- |
| Gestures / physics | `react-native-gesture-handler` + `react-native-reanimated` (Expo SDK 52 already bundles them) | Use the Reanimated 3 worklet syntax for performant drag, spring-back, and fling animations. |
| Haptics | `expo-haptics` | Trigger on correct/incorrect swipe + when hearts are lost. |
| Audio playback | `expo-av` (streaming) + `expo-file-system` (caching) | Shared hook will manage download, playback state, and waveform metadata (prep for Section 7 audio pipeline). |
| Data contracts | Extend `@mk/practice` types with a `CardContent` union (cloze, multipleChoice, listening, typing) | Enables shared fixture generation + keeps web/mobile aligned. |

## 2. Architecture Sketch

```
apps/mobile/features/practice/
  CardStack.tsx        // gesture + pagination logic
  cards/
    ClozeCard.tsx
    MultipleChoiceCard.tsx
    ListeningCard.tsx  // consumes audio hook
    TypingCard.tsx
  hooks/
    usePracticeSessionState.ts   // wraps shared @mk/practice helpers
    useAudioPrompt.ts            // expo-av logic + caching layer
```

- `CardStack` receives an array of `CardContent` objects plus callbacks for `onAnswer`, `onReveal`, `onHeartsChange`.
- Swipe directions:
  - Up = reveal / skip (configurable)
  - Right = correct
  - Left = incorrect (triggers heart animation)
- Use `react-native-gesture-handler`’s `PanGestureHandler` with velocity thresholds to detect completion and snap to next card via Reanimated springs.
- Provide a context to share current card progress with HUD components (hearts, XP, timer).

## 3. Audio Hook Plan (`useAudioPrompt`)

Responsibilities:
1. Accept `audioId` + metadata (duration, language, transcript).
2. Check `expo-file-system` cache directory (`AudioCache/<audioId>.m4a`). If not cached, download via signed URL (provided by backend) using `fetch` + `FileSystem.writeAsStringAsync`.
3. Load `Audio.Sound` instance from `expo-av`, expose `play`, `pause`, `replaySlow`, and `waveform` data (placeholder: evenly spaced samples until Section 7 pipeline is ready).
4. Emit status updates (buffering, playing, completed) to UI; handle concurrency by disposing previous sounds when new card mounts.
5. Hook into shared analytics (`@mk/analytics`) to log playback events.

Open TODOs for later:
- Replace placeholder waveform with backend-provided samples once audio ingestion (Section 7) ships.
- Investigate `expo-keep-awake` for long listening drills.

## 4. Shared Types & Web Parity

- Add `packages/practice/src/types.ts`:

```ts
export type PracticeCardBase = {
  id: string;
  prompt: string;
  answer: string;
  audioId?: string;
};

export type ClozeCard = PracticeCardBase & { type: 'cloze'; clozeParts: string[] };
export type MultipleChoiceCard = PracticeCardBase & { type: 'multipleChoice'; choices: string[] };
export type ListeningCard = PracticeCardBase & { type: 'listening'; transcript: string };
export type TypingCard = PracticeCardBase & { type: 'typing'; keyboardLayout?: 'mk' | 'en' };

export type PracticeCardContent = ClozeCard | MultipleChoiceCard | ListeningCard | TypingCard;
```

- Web (`components/learn/quick-practice`) can progressively adopt the same union to keep fixtures/tests aligned.

## 5. Integration Checklist

1. **Card stack prototype** (`apps/mobile/features/practice/CardStack.tsx`)
   - Implement gesture thresholds + Reanimated springs.
   - Expose imperative methods for HUD (skip, reveal, shake animation on incorrect).
2. **Audio hook + provider**
   - Create `useAudioPrompt`.
   - Add `AudioProvider` (context) at `apps/mobile/app/_layout.tsx` level to share global settings (autoplay, playback rate).
3. **Shared types & fixtures**
   - Update `packages/practice` with `PracticeCardContent`.
   - Build fixtures in `packages/practice/src/fixtures/quick-practice.json`.
4. **HUD updates**
   - Hearts/XP HUD subscribes to card stack state for micro-animations (Reanimated scale + color pulses).
5. **Testing**
   - Unit: `vitest` for `useAudioPrompt` (mock expo-av).
   - Snapshot / RTL tests for card components.
   - Manual: Expo Go swipe interactions + audio playback on device (documented in notes).

## 6. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Gesture lag on low-end Android | Keep card rendering lightweight, use worklets only, and throttle haptics. |
| Audio caching storage bloat | Limit cache size (e.g., 50 files) and evict via LRU (store metadata in `AsyncStorage`). |
| Web parity delay | Ship shared types + fixtures first so web team can plan migration even if UI lags. |

## 7. Next Steps

1. Scaffold `CardStack` + `useAudioPrompt` files (no UI polish yet).
2. Update execution plan Step 6 “Changes Required” to reference this spike.
3. Coordinate with Experience team for Tamagui styling + motion once stack API stabilizes.
