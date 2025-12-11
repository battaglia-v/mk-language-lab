# Phase 6 Execution Plan (Store Prep + Polish)

Status: resources card overflow fixed and mobile bottom nav refreshed to an anchored bar with safe-area padding. Remaining tasks focus on store assets, audits, and QA.

## Checklist
- [ ] Capture 8 Play Store phone screenshots (portrait)
- [ ] Add screenshot entries to `public/manifest.json`
- [ ] Finalize/verify store descriptions (long + short)
- [ ] Run performance audit (Lighthouse mobile)
- [ ] Run accessibility audit (WCAG AA)
- [ ] Cross-browser + device smoke testing
- [ ] Final bug fixes and visual polish pass

## 1) 8 Play Store Screenshots
- **Scenes to capture (portrait, 1080x1920 or larger):**
  1) Home — Word of the Day + quick start cards
  2) Quick Practice — mid-quiz with Cyrillic prompt + feedback
  3) Translate — English → Macedonian example with output
  4) Word of the Day detail — pronunciation + cultural note
  5) Learn modules — 4-module grid (Vocabulary, Grammar, Phrases, Pronunciation)
  6) Vocabulary browser — browse by category/difficulty
  7) News feed — list of Macedonian articles
  8) Resources — external resources list with attribution
- **Capture tips:** mobile Chrome, full screen (status bar to nav bar), crisp Cyrillic text, no personal data. Use Power + Volume Down or Google Assistant. Stage UI so CTAs and streaks look active.
- **File naming + storage:** save as PNG under `public/screenshots/` using ordered names (e.g., `01-home.png`, `02-quick-practice.png`, ...). Keep sizes consistent; trim notches if they obscure UI.

## 2) Update `manifest.json` with screenshots
- Add the `screenshots` array once assets exist; example payload:
  ```json
  "screenshots": [
    { "src": "/screenshots/01-home.png", "sizes": "1080x1920", "type": "image/png", "label": "Home" },
    { "src": "/screenshots/02-quick-practice.png", "sizes": "1080x1920", "type": "image/png", "label": "Quick Practice" },
    { "src": "/screenshots/03-translate.png", "sizes": "1080x1920", "type": "image/png", "label": "Translate" },
    { "src": "/screenshots/04-wotd-detail.png", "sizes": "1080x1920", "type": "image/png", "label": "Word of the Day" },
    { "src": "/screenshots/05-learn-modules.png", "sizes": "1080x1920", "type": "image/png", "label": "Learn Modules" },
    { "src": "/screenshots/06-vocabulary-browser.png", "sizes": "1080x1920", "type": "image/png", "label": "Vocabulary Browser" },
    { "src": "/screenshots/07-news.png", "sizes": "1080x1920", "type": "image/png", "label": "News Feed" },
    { "src": "/screenshots/08-resources.png", "sizes": "1080x1920", "type": "image/png", "label": "Resources" }
  ]
  ```
- Keep existing icon entries; re-run `npm run lint` to verify JSON formatting if needed.

## 3) Store Copy
- Primary source: `PLAY_STORE_LISTING.md`. Re-validate short (≤80 chars) and full descriptions against latest features; avoid unshipped claims.
- Ensure title remains “Македонски • MK Language Lab”; category Education > Language Learning; contact email macedonianlanguagelab@gmail.com; privacy policy URL `/privacy`.

## 4) Performance Audit (Lighthouse, Mobile)
- Run against production build or `npm run start` with `npm run build` first. Test mobile, throttled network, logged-out home and a deep page (e.g., `/mk/practice`).
- Track LCP/CLS/INP. Quick wins to check: image sizes (hero/cards), bundle splitting, unused scripts, font loading, and animation paint costs.

## 5) Accessibility Audit (WCAG AA)
- Use Lighthouse + axe (browser extension or `npx @axe-core/cli http://localhost:3000/mk`).
- Verify: focus order into header/nav, visible focus rings on nav buttons, ARIA labels on icons (ExternalLink, bottom nav icons already have `aria-label`), form labels on search/input fields, and contrast on pills/badges.

## 6) Cross-Browser / Device Testing
- Desktop: Chrome, Safari, Firefox — smoke home, learn, practice, translate, resources; confirm bottom nav hides on lg+ as expected.
- Mobile: Chrome Android, Safari iOS — check safe-area padding with the anchored nav, card overflow on Resources, and tap targets.
- TWA/Install: reinstall PWA to confirm new nav spacing and resources cards look correct when standalone.

## 7) Final Bug Fixes & Polish
- Address issues found in audits (contrast, CLS, slow assets).
- Re-check spacing at page bottoms so content never sits under the nav; resources cards should clamp long titles and keep icons clear.
- Add release notes/changelog entry once assets and manifest updates ship.
