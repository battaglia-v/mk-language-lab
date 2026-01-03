# Mobile UI/UX Audit (Mobile-First)

Last Updated: 2026-01-02  
Owner: @battaglia-v

Mission: Improve usability, clarity, and consistency (Duolingo/Cloze polish). This audit is mobile-first and focuses on fixing friction, not adding new features.

## Evidence

Screenshots are captured by the Playwright release-gate suite:

- `docs/ui-audit/screenshots/390x844/<route>.png` (iPhone 12)
- `docs/ui-audit/screenshots/360x800/<route>.png` (Android common)

Routes captured: Home, Learn, Paths, Lesson, Practice, Reader, Translate, Upgrade, Profile, Settings.

## Route Notes

### Home

- Layout & spacing: Good primary CTA; verify bottom padding so content never sits under the mobile tab bar.
- Tap targets: Primary CTA meets 44px+; verify secondary link spacing (sign-in) on smaller devices.
- Typography: Hero sizing is strong; ensure subtitle doesn’t wrap awkwardly at 360px.
- Button affordance: CTA reads as a button; ensure the sign-in link is clearly tappable.
- Component consistency: Align with Learn/Practice primary CTA sizing (min-h 52–56px).
- Copy clarity: Good; consider making “5 minutes a day…” consistent across Home/Learn.
- Error/empty states: N/A.
- Accessibility quick hits: Ensure focus-visible ring on CTA and sign-in link.

### Learn

- Layout & spacing: Avoid scroll fatigue by keeping the “today” CTA above the fold at 360×800.
- Tap targets: All chips/buttons should be 44px+; watch compact stats/chips.
- Typography: Prevent truncation for long path names and status labels.
- Button affordance: “Start today’s lesson” should look primary; “Quick practice” secondary.
- Component consistency: Cards and section headers should match Practice and Reader.
- Copy clarity: Ensure consistent XP and streak microcopy between sections.
- Error/empty states: If today’s lesson can’t load, show a retry + next action.
- Accessibility quick hits: Ensure progress indicators have labels (screen readers).

### Paths

- Layout & spacing: Path node spacing is good; ensure connector lines don’t look like “empty space” at 360px.
- Tap targets: Nodes must be large enough (>=44px) and have spacing between nodes to avoid mis-taps.
- Typography: Ensure node titles don’t truncate too aggressively (2-line clamp recommended).
- Button affordance: Locked nodes should look clearly disabled (lock + muted).
- Component consistency: Same node styling across A1/A2/30-day/topic packs.
- Copy clarity: Locked tooltip should explain exactly what unlocks it.
- Error/empty states: If path data can’t load, show retry.
- Accessibility quick hits: Tooltips should be reachable via keyboard (or provide inline text).

### Lesson

- Layout & spacing: Exercise layout should keep primary CTA reachable above the tab bar and safe area.
- Tap targets: Ensure all choices and CTA buttons are 44px+ (especially skip/hint).
- Typography: Avoid cramped prompts; keep comfortable line-height.
- Button affordance: Disable submit until input is valid; show explicit reason when disabled.
- Component consistency: Exercise screens should use one common layout (ExerciseLayout).
- Copy clarity: Feedback should be short + actionable.
- Error/empty states: Malformed step data should never dead-end (skip/continue available).
- Accessibility quick hits: Focus management after submit/feedback; ARIA labels on icon buttons.

### Practice

- Layout & spacing: Practice mode cards are strong; ensure the settings bottom sheet doesn’t cover important CTAs.
- Tap targets: Cards must be full-width and 52px+ height; settings toggles 44px+.
- Typography: Keep mode titles 1 line; descriptions 1–2 lines; avoid ellipsis-only labels.
- Button affordance: Disabled cards must show “why locked” copy (e.g., saved deck).
- Component consistency: Align card styling with Reader/News “glass card” language.
- Copy clarity: XP/cadence should be consistent across cards.
- Error/empty states: If a deck is empty/locked, show next action (“Go to Translate to save a phrase”).
- Accessibility quick hits: Ensure disabled cards aren’t focusable; ARIA labels on icons.

### Reader

- Layout & spacing: Library should keep search/filters accessible; v2 reader should keep footer controls above safe area.
- Tap targets: Word tap targets should be forgiving; footer toggles 44px+.
- Typography: Reader v2 should allow readable default size and line-height; avoid tiny prose at 360px.
- Button affordance: No icon-only controls without labels; add consistent “Listen/Save” patterns.
- Component consistency: Use one BottomSheet pattern for word details (close button + title).
- Copy clarity: Explain tap-translate/sentence mode via short inline hint.
- Error/empty states: If no saved words, the review screen should guide the user back to Reader.
- Accessibility quick hits: Words are keyboard-focusable when tap mode enabled; add scan labels/testids for automation.

### Translate

- Layout & spacing: Keep direction toggle + input above fold; sticky “Translate” CTA should not cover content.
- Tap targets: Swap button and utility icons 44px+.
- Typography: On mobile, use compact direction labels (“EN→MK”) to avoid truncation.
- Button affordance: Make “Translate” primary; copy/listen/save grouped as secondary actions.
- Component consistency: Reuse BottomSheet list pattern for history/saved.
- Copy clarity: Empty state should tell users what to type and what they’ll get.
- Error/empty states: “Clipboard blocked” and API errors should provide next action.
- Accessibility quick hits: ARIA labels for icon-only buttons; focus returns to textarea after actions.

### Upgrade

- Layout & spacing: Ensure pricing cards stack cleanly at 360px; avoid double borders/shadows.
- Tap targets: Subscribe buttons 52px+ and full-width.
- Typography: Keep price line readable; avoid wrapping “/month” awkwardly.
- Button affordance: Clearly differentiate “best value” plan and keep “Maybe later” visible.
- Component consistency: Feature list icons and badges should match the rest of the app.
- Copy clarity: Explain what unlocks and when billing occurs (Google Play vs Stripe).
- Error/empty states: If purchases unavailable, show a clear “not supported on this device” message.
- Accessibility quick hits: Ensure plan cards are navigable and have descriptive labels.

### Profile

- Layout & spacing: Signed-out state should fit on one screen with a single CTA.
- Tap targets: Sign-in CTA 52px+; secondary links spaced.
- Typography: Avoid cramped stat cards; keep labels readable at 360px.
- Button affordance: “Sign in” should be primary; “Back home” secondary.
- Component consistency: Profile cards should match Learn/Practice cards.
- Copy clarity: Explain what gets unlocked by signing in (streaks, progress sync).
- Error/empty states: If profile fetch fails, show retry + fallback link.
- Accessibility quick hits: Ensure charts/maps have fallback text.

### Settings

- Layout & spacing: Avoid dense vertical lists; group settings into cards with headers.
- Tap targets: Toggles/selects 44px+; dialog buttons 44px+.
- Typography: Long setting descriptions should wrap, not truncate.
- Button affordance: Destructive actions should be clearly labeled and require confirm.
- Component consistency: Use common Dialog/BottomSheet primitives.
- Copy clarity: “Reset progress” should explain what data is erased.
- Error/empty states: Show success toast and next action after resets.
- Accessibility quick hits: Ensure focus trapping in dialogs and correct ARIA labels.

## Prioritized Fix List

| Issue | Route | Severity | Recommendation | Component/file | Screenshot |
|------|-------|----------|----------------|----------------|------------|
| Dead interactions in Reader v2 (save + mark complete + settings) | Reader | P0 | Disable unimplemented actions and/or make them change state with clear labels; add testids for all controls | `components/reader/ReaderV2Layout.tsx`, `app/[locale]/reader/samples/[sampleId]/v2/ReaderV2Client.tsx` | `docs/ui-audit/screenshots/390x844/reader.png` |
| Tooltip obscures navigation on non-home routes | Learn/Translate/Practice | P1 | Only show first-session tooltip on intended routes and auto-dismiss when navigating away | `components/shell/MobileTabNav.tsx` | `docs/ui-audit/screenshots/390x844/learn.png` |
| Direction toggle truncation on small screens | Translate | P1 | Use compact mobile labels (`EN→MK`) while keeping full labels on larger screens | `app/[locale]/translate/page.tsx` | `docs/ui-audit/screenshots/360x800/translate.png` |
| Missing testids on interactive elements | Multiple | P0 | Add `data-testid` to all visible interactives; enforce via release-gate scans | Multiple files; see `docs/interaction_inventory.md` | N/A |
