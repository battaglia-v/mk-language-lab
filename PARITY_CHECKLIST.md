# Parity Checklist: PWA → React Native

> Every proposed change must reference items in this checklist.  
> Mark items complete only after verification on both iOS and Android.

---

## Auth

- [x] Same error messages *(fixed: auth store now returns proper JSON errors)*
- [x] Same disabled button logic *(fixed: Google auth shows unavailable when not configured)*
- [x] Same loading indicators

## Forms

- [x] Focus behavior identical *(fixed: KeyboardSafeView standardized)*
- [x] Keyboard opens correctly *(fixed: platform-specific behavior in KeyboardSafeView)*
- [x] No blocked inputs *(fixed: dismiss keyboard on tap outside)*

## Navigation

- [x] Same routes *(fixed: tab order now matches PWA - Learn, Translate, Practice, Reader, Resources)*
- [x] Same guards *(fixed: useAuthGuard hooks; RN uses hard redirects vs PWA soft prompts - acceptable)*
- [x] Same back behavior *(fixed: LessonShell provides consistent close behavior)*
- [x] Nav hidden during immersive flows *(fixed: LessonShell used for practice/lesson sessions)*

## Practice

- [x] Same answer normalization *(fixed: uses @mk/practice normalizeAnswer)*
- [x] Unicode/diacritics handled consistently *(fixed: shared package handles NFD/NFC normalization)*

## i18n

- [x] Translation infrastructure *(added: lib/i18n.ts with en/mk translations)*
- [x] Tab labels localized *(fixed: uses useTranslations hook)*
- [ ] All strings externalized (ongoing)

## Features

- [x] Saved phrases *(added: lib/saved-phrases.ts with AsyncStorage)*
- [x] Save from translate screen *(added: bookmark button in translate results)*
- [x] Saved words practice deck *(added: practice hub shows saved phrases with count)*
- [x] Theme preference *(added: lib/theme.ts with system/light/dark)*
- [x] Theme toggle in settings *(added: visual theme selector)*
- [x] Profile access from settings *(added: View Profile row)*
- [x] Sign out from settings *(added: Sign Out button with confirmation)*

## Auth

- [x] Token refresh on 401 *(added: automatic retry with refreshToken in lib/api.ts)*
- [x] Session persistence *(tokens stored in SecureStore)*

## Grammar

- [x] Grammar screen uses LessonShell *(immersive mode with progress bar)*
- [x] Progress tracking *(onProgressChange callback added)*

## Practice Hub

- [x] Mode selection bottom sheet *(added: PracticeModeSheet component)*
- [x] Difficulty selection *(all/beginner/intermediate/advanced)*
- [x] Question count selection *(5/10/15/20)*
- [x] Mistakes tracking *(added: lib/practice-mistakes.ts)*
- [x] Mistakes review badge *(shows count in header)*

## Reader

- [x] Favorites storage *(added: lib/favorites.ts with AsyncStorage)*

## Deep Linking

- [x] Auth callback handling *(added: Linking listener in _layout.tsx)*
- [x] URL scheme configured *(mklanguage://)*

## Gamification

- [x] XP tracking *(added: lib/gamification.ts with local storage)*
- [x] Streak tracking *(added: daily streak with longest streak)*
- [x] Level calculation *(uses @mk/gamification calculateLevelFromXP)*
- [x] Daily goals *(configurable daily XP target)*
- [x] Profile integration *(shows gamification stats)*

## Analytics

- [x] Event tracking *(added: lib/analytics.ts)*
- [x] Practice events *(started, completed, correct, incorrect)*
- [x] Translation events *(requested, success, failed, copied)*
- [x] Auth events *(initiated, success, failed)*
- [x] Sign-in tracking *(integrated in sign-in.tsx)*

## Auth Guards

- [x] useAuthGuard hook *(added: hooks/useAuthGuard.ts)*
- [x] useRequireAuth *(redirects to sign-in if not authenticated)*
- [x] useRedirectIfAuth *(redirects away from auth pages if authenticated)*
- [x] Profile screen protected *(uses useRequireAuth)*
- [x] Sign-in redirect *(uses useRedirectIfAuth)*

## Custom Decks

- [x] Local storage *(added: lib/custom-decks.ts)*
- [x] Create/update/delete decks *(full CRUD operations)*
- [x] Add/update/delete cards *(card management)*
- [x] Convert to practice items *(for practice sessions)*
- [x] Server sync *(optional sync when authenticated)*

## Toast/Notifications

- [x] Toast provider *(added: lib/toast.tsx)*
- [x] Success/error/warning/info types *(styled with icons)*
- [x] Auto-dismiss with animation *(configurable duration)*
- [x] Convenience hooks *(useSuccessToast, useErrorToast, etc.)*

## Offline Mode

- [x] Network state tracking *(added: lib/offline.ts)*
- [x] Operation queue *(AsyncStorage-based)*
- [x] Auto-sync on reconnect *(processQueue on online)*
- [x] useNetworkState hook *(isOnline, isOffline)*
- [x] useOfflineAwareApi hook *(queue mutations when offline)*
- [x] Practice result queueing *(queuePracticeResult)*
- [x] Lesson completion queueing *(queueLessonComplete)*

## Word Sprint

- [x] Word Sprint screen *(added: app/practice/word-sprint.tsx)*
- [x] Difficulty picker *(easy/medium/hard)*
- [x] Session length picker *(5/10/15/20)*
- [x] Multiple choice gameplay *(2 or 4 choices)*
- [x] Combo system *(XP multiplier for streaks)*
- [x] Results screen *(accuracy, combo, XP)*
- [x] TTS support *(expo-speech)*
- [x] Analytics integration *(trackPracticeStarted/Completed)*

## SRS (Spaced Repetition)

- [x] SRS data storage *(added: lib/srs.ts)*
- [x] SM-2 algorithm *(interval/ease factor calculation)*
- [x] Due cards tracking *(getSRSStats, getDueCards)*
- [x] Practice hub indicator *(shows due count)*
- [x] Mastery levels *(Learning → Mastered)*
- [x] Review queue priority *(due first, then new)*

## Offline Status Toast

- [x] OfflineStatusToast component *(added: components/OfflineStatusToast.tsx)*
- [x] Shows warning when offline *(No Connection toast)*
- [x] Shows success when back online *(Connection restored toast)*
- [x] Integrated in root layout *(auto-monitors network state)*

## XP Notifications

- [x] XPNotificationProvider *(added: components/XPNotification.tsx)*
- [x] Animated XP popups *(scale + float animation)*
- [x] useXPNotification hook *(showXP, showQuickXP)*
- [x] Reduced motion support *(simple fade for accessibility)*
- [x] QuickXPBadge component *(inline XP display)*
- [x] Integrated in root layout *(global provider)*

## Reading Progress

- [x] Reading progress storage *(added: lib/reading-progress.ts)*
- [x] Scroll position tracking *(saveProgress, updateScrollPosition)*
- [x] Time spent tracking *(addTimeSpent)*
- [x] Completion marking *(markCompleted, isStoryCompleted)*
- [x] Reading stats *(getReadingStats)*
- [x] In-progress stories *(getInProgressStories)*

## Haptic Feedback

- [x] Haptics utility *(added: lib/haptics.ts)*
- [x] useHaptics hook *(added: hooks/useHaptics.ts)*
- [x] Pattern types *(light, medium, heavy, success, warning, error, selection)*
- [x] Native integration *(expo-haptics)*
- [x] Reduced motion respect *(useReducedMotion hook)*
- [x] Convenience methods *(haptic.success(), haptic.warning(), etc.)*

## Loading Skeletons

- [x] Skeleton base component *(added: components/ui/Skeleton.tsx)*
- [x] Shimmer animation *(animated opacity pulse)*
- [x] Text skeleton *(configurable lines)*
- [x] Card skeletons *(Lesson, Practice, Story, Profile)*
- [x] Stat skeletons *(DailyGoal, Streak)*
- [x] Screen skeletons *(Learn, Practice, Reader, Profile)*
- [x] Learn screen integration *(replaces ActivityIndicator)*

## Share Functionality

- [x] Share utility *(added: lib/share.ts)*
- [x] Native share sheet *(iOS/Android)*
- [x] Share translation *(added: translate screen)*
- [x] Share story *(added to share utility)*
- [x] Share word *(vocabulary sharing)*
- [x] Share practice results *(with accuracy and XP)*
- [x] Share streak achievements *(milestone celebrations)*
- [x] Copy to clipboard *(expo-clipboard)*

## Error Handling

- [x] ErrorBoundary component *(added: components/ErrorBoundary.tsx)*
- [x] Crash recovery UI *(retry and go home buttons)*
- [x] Error details in dev mode *(shows stack trace)*
- [x] withErrorBoundary HOC *(wrap individual components)*
- [x] ErrorFallback component *(simple fallback UI)*
- [x] Integrated in root layout *(global error boundary)*

## Pull-to-Refresh

- [x] usePullToRefresh hook *(added: hooks/usePullToRefresh.ts)*
- [x] Standardized refresh control *(consistent colors)*
- [x] Haptic feedback on refresh *(optional)*
- [x] Minimum duration *(prevents flicker)*
- [x] Learn screen integration *(uses hook)*
- [x] Reader screen integration *(uses hook)*

## Text-to-Speech (TTS)

- [x] useTTS hook *(added: hooks/useTTS.ts)*
- [x] expo-speech integration *(native TTS on iOS/Android)*
- [x] Serbian fallback for Macedonian *(sr-RS voice)*
- [x] Speaking state tracking *(isSpeaking, isLoading)*
- [x] quickSpeak utility *(one-shot speak function)*
- [x] Translate screen integration *(Listen button added)*

## Word of the Day

- [x] WordOfTheDay component *(added: components/learn/WordOfTheDay.tsx)*
- [x] API integration *(fetches from /api/word-of-the-day)*
- [x] Fallback words *(offline/error fallback)*
- [x] TTS integration *(speak word)*
- [x] Example sentences *(mk + en)*
- [x] Learn screen integration *(displays above lessons)*

## Reader Word Lookup

- [x] WordLookupSheet component *(added: components/reader/WordLookupSheet.tsx)*
- [x] Bottom sheet UI *(modal with slide animation)*
- [x] Word translation display *(original, translation, pos)*
- [x] TTS integration *(listen to word)*
- [x] Save to favorites *(bookmark action)*
- [x] Copy to clipboard *(copy word+translation)*
- [x] Difficulty badge *(A1/A2/B1/B2)*
- [x] Practice shortcut *(add to practice queue)*

## Lesson Progress

- [x] Lesson progress storage *(added: lib/lesson-progress.ts)*
- [x] Start/complete tracking *(status: not_started, in_progress, completed)*
- [x] Step answers persistence *(stepAnswers record)*
- [x] Time tracking *(timeSpent in minutes)*
- [x] Resume capability *(currentStepIndex)*
- [x] Server sync *(POST /api/lessons/progress)*
- [x] Offline queue *(queue and retry on reconnect)*
- [x] Merge strategy *(server wins for completed, local for in-progress)*

## Resources Screen

- [x] Resources tab screen *(added: app/(tabs)/resources.tsx)*
- [x] My Saved Words link *(highlighted primary action)*
- [x] Language Lab link *(translator shortcut)*
- [x] Grammar Reference link *(grammar lessons)*
- [x] Reading Library link *(reader shortcut)*
- [x] External resources *(Wikipedia, Forvo links)*
- [x] Tab navigation integration *(5th tab)*

## Saved Words Screen

- [x] Saved Words screen *(added: app/saved-words.tsx)*
- [x] Load from saved-phrases storage *(AsyncStorage)*
- [x] Sort by recent/alphabetical *(toggle)*
- [x] Delete individual words *(with confirmation)*
- [x] Clear all words *(with confirmation)*
- [x] TTS integration *(listen to words)*
- [x] Practice shortcut *(navigate to practice with saved deck)*
- [x] Empty state *(with CTA to Reader)*
- [x] Stack navigation registration *(slide from right)*

## Daily Goal Widget

- [x] DailyGoalWidget component *(added: components/learn/DailyGoalWidget.tsx)*
- [x] Daily XP progress tracking *(from gamification lib)*
- [x] Animated progress bar *(smooth fill animation)*
- [x] Goal complete state *(trophy icon, green fill)*
- [x] Streak badge *(flame icon with count)*
- [x] Level and total XP display *(quick stats)*
- [x] DailyGoalCompact variant *(for headers)*
- [x] StreakBadge component *(standalone use)*
- [x] Learn screen integration *(above Word of Day)*

## Practice Session Persistence

- [x] Practice session storage *(added: lib/practice-session.ts)*
- [x] Session state tracking *(deck, progress, answers, streak)*
- [x] Start new session *(startNewSession)*
- [x] Update progress *(updateSessionProgress)*
- [x] Complete session *(completeSession with results)*
- [x] Resume capability *(loadPracticeSession)*
- [x] Session expiry *(24h auto-clear)*
- [x] Progress helpers *(getCurrentCard, getSessionProgress)*

## Onboarding

- [x] Onboarding screen *(added: app/onboarding.tsx)*
- [x] Goal selection *(conversation, travel, culture, reading, professional)*
- [x] Level selection *(beginner, intermediate, advanced)*
- [x] Daily goal selection *(5, 10, 15, 20 min/day)*
- [x] Summary step *(review selections)*
- [x] Local storage *(saves preferences to AsyncStorage)*
- [x] Server sync *(optional POST to /api/missions/setup)*
- [x] Skip option *(bypass onboarding)*
- [x] Analytics tracking *(onboarding events)*
- [x] Stack navigation registration *(fullScreenModal)*

## Welcome Banner

- [x] WelcomeBanner component *(added: components/WelcomeBanner.tsx)*
- [x] First-time user display *(checks AsyncStorage)*
- [x] Dismissible *(saves dismissed state)*
- [x] Animated fade in/out *(Animated API)*
- [x] Get Started button *(links to onboarding)*
- [x] TipBanner variant *(compact contextual hints)*
- [x] Learn screen integration *(shows above Daily Goal)*

## Resume Practice Banner

- [x] ResumeBanner component *(added: components/practice/ResumeBanner.tsx)*
- [x] Session detection *(checks practice-session storage)*
- [x] Progress display *(deck type, cards remaining, %)*
- [x] Time ago display *(relative timestamp)*
- [x] Resume action *(navigates with resume param)*
- [x] Clear action *(dismiss and clear session)*
- [x] Animated appearance *(fade in/out)*
- [x] ResumeSessionPill variant *(compact for headers)*
- [x] Practice screen integration *(shows after header)*

## Achievements System

- [x] Achievements storage *(added: lib/achievements.ts)*
- [x] Achievement definitions *(16 achievements)*
- [x] Categories *(learning, streak, practice, special)*
- [x] XP rewards *(25-500 XP per achievement)*
- [x] Unlock tracking *(timestamp per achievement)*
- [x] Check and unlock *(based on stats)*
- [x] Time-based achievements *(night owl, early bird)*
- [x] Progress tracking *(words learned, streak, etc.)*
- [x] Stats API *(unlocked count, total XP)*

## Achievement Toast

- [x] AchievementToastProvider *(added: components/AchievementToast.tsx)*
- [x] Toast animation *(spring entrance, fade exit)*
- [x] Category colors *(learning, streak, practice, special)*
- [x] XP badge display *(shows reward)*
- [x] Haptic feedback on unlock *(success pattern)*
- [x] Auto-dismiss *(5 second timer)*
- [x] Multiple toast support *(staggered display)*
- [x] Close button *(manual dismiss)*
- [x] Root layout integration *(wraps app)*

## Achievements Screen

- [x] Achievements screen *(added: app/achievements.tsx)*
- [x] Category filtering *(all, learning, streak, practice, special)*
- [x] Stats summary *(unlocked, locked, XP earned)*
- [x] Achievement cards *(icon, title, description, XP)*
- [x] Unlock date display *(for earned achievements)*
- [x] Locked state UI *(greyed out, lock icon)*
- [x] Pull-to-refresh *(reload achievements)*
- [x] Profile integration *(link from profile screen)*
- [x] Stack navigation registration *(slide from right)*

## Level Up Celebration

- [x] LevelUpProvider *(added: components/LevelUpCelebration.tsx)*
- [x] Full-screen modal *(overlay celebration)*
- [x] Particle effects *(confetti-like animation)*
- [x] Star badge animation *(rotating entrance)*
- [x] Glow pulse effect *(animated background)*
- [x] Level number display *(previous → new)*
- [x] XP stats badge *(shows XP earned)*
- [x] Continue button *(dismiss celebration)*
- [x] Haptic feedback *(success on show)*
- [x] Root layout integration *(wraps app)*

## Practice Stats Card

- [x] PracticeStatsCard component *(added: components/PracticeStatsCard.tsx)*
- [x] Accuracy display *(percentage)*
- [x] XP earned display *(total)*
- [x] Best streak display *(count)*
- [x] Session count *(total sessions)*
- [x] Weekly progress chart *(7-day bar chart)*
- [x] Last practice date *(relative time)*
- [x] Compact variant *(for embedding)*
- [x] recordPracticeStats helper *(track sessions)*