# Mobile Audit Findings (iPhone 12, 390x844)

## Page: /en
- Issue: None observed in the core home flow (Start Learning, Learn CTA, bottom nav).
- Severity: minor
- Expected: Home shows a clear primary CTA and mobile navigation.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/practice/session?deck=curated&difficulty=all
- Issue: None observed for the Start Learning landing session.
- Severity: minor
- Expected: Session loads without errors or dead controls.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/learn
- Issue: Beginner and advanced options are mixed without a level gate.
- Severity: major
- Expected: Clear "What level are you?" prompt with beginner-first content only.
- Actual: Advanced and 30-Day options appear alongside A1 foundations with no guidance.
- Proposed fix: Add level selection (Beginner/Intermediate) and hide advanced content until chosen.

## Page: /en/learn/paths
- Issue: None observed on the paths hub.
- Severity: minor
- Expected: Paths are listed and tappable.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/learn/paths/a1
- Issue: None observed on the A1 path detail page.
- Severity: minor
- Expected: Path details and back navigation are visible.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/learn/lessons/alphabet
- Issue: None observed on the alphabet lesson.
- Severity: minor
- Expected: Lesson content loads and tabs switch.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/learn/paths/a2
- Issue: None observed on the A2 path detail page.
- Severity: minor
- Expected: Path details and back navigation are visible.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/practice
- Issue: None observed on the practice hub (cards visible and tappable).
- Severity: minor
- Expected: Practice modes are visible and navigable.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/practice/word-sprint
- Issue: Word Sprint session cannot be started on mobile.
- Severity: critical
- Expected: After selecting difficulty/length, Start is enabled and a session begins with an Exit control.
- Actual: Start remains disabled or the session UI never appears, blocking the flow.
- Proposed fix: Ensure difficulty selection updates state and Start is visible/enabled on mobile; verify picker z-index and click handling.

## Page: /en/reader
- Issue: None observed on the reader library page.
- Severity: minor
- Expected: Reader library loads with filters and sample cards.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/reader/samples/cafe-conversation
- Issue: Reader sample is a long, multi-section page without a focused reading mode.
- Severity: major
- Expected: Clear reading mode with sticky controls (back, font size, focus) and word tap using a bottom sheet.
- Actual: Reading, grammar, vocabulary, and actions feel stacked and modal-based rather than a focused reader flow.
- Proposed fix: Redesign reader layout into a focused reading mode with sticky top bar, bottom sheet word details, and collapsed grammar/vocabulary sections.

## Page: /en/translate
- Issue: Translate action is missing on mobile.
- Severity: critical
- Expected: A visible primary Translate button to submit input and show output.
- Actual: The translate CTA is hidden on small screens; input has no obvious way to execute.
- Proposed fix: Show a mobile CTA (remove hidden styles or add a sticky bottom action).

## Page: /en/more
- Issue: None observed on the More menu.
- Severity: minor
- Expected: Links to subpages are visible and tappable.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/lab
- Issue: None observed.
- Severity: minor
- Expected: Page loads without errors.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/news
- Issue: None observed.
- Severity: minor
- Expected: News page loads with articles or an empty state.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/resources
- Issue: None observed.
- Severity: minor
- Expected: Resources page loads without errors.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/profile
- Issue: None observed.
- Severity: minor
- Expected: Profile or sign-in prompt is visible.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/settings
- Issue: Settings content fails to render on mobile (page appears blank).
- Severity: major
- Expected: Daily goal, notifications, and theme controls are visible.
- Actual: Settings screen shows no settings controls, blocking configuration.
- Proposed fix: Ensure Settings page renders client UI and providers; add a visible error or empty state if load fails.

## Page: /en/about
- Issue: None observed.
- Severity: minor
- Expected: About page loads without errors.
- Actual: Matches expectations during audit.
- Proposed fix: None.

## Page: /en/help
- Issue: None observed.
- Severity: minor
- Expected: Help/support content loads without errors.
- Actual: Matches expectations during audit.
- Proposed fix: None.
