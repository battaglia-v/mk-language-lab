# UI audit status and follow-up tasks

## Completed work in `work`
- Profile dashboard now shows a dedicated sign-in/try-again experience that works even without an API base URL and keeps a path back to practice. 【components/profile/ProfileDashboard.tsx†L65-L103】
- Admin layout enforces access while providing responsive navigation, dropdown access to admin tools, and a persistent "Back to site" control on mobile and desktop. 【app/admin/layout.tsx†L22-L122】

## Outstanding items for the next PR
1. **Quick Practice HUD and hierarchy still feel dense on mobile.** The header stacks multiple badges (streak, XP, difficulty, progress, hearts, accuracy cards) and only partially collapses when the input is focused. Simplify the HUD, reduce duplicate stats, and align with the minimal mobile spacing tokens from the earlier plan. 【components/learn/quick-practice/Header.tsx†L47-L120】
2. **Translate page lacks consistent navigation/back affordances and compact mobile typography.** The hero uses large display text and panel toggles but does not expose a clear route back to the main dashboard or section tabs. Add a shared top-bar/back action and tighten spacing for small breakpoints. 【app/[locale]/translate/page.tsx†L169-L198】
3. **Quick Practice tests previously emitted duplicate translation keys.** The warning surfaced during `vitest run` because `practiceAllCategories` was declared twice. Keep translation fixtures deduplicated and verify no other duplicate keys remain. 【components/learn/quick-practice/Controls.test.tsx†L8-L34】
