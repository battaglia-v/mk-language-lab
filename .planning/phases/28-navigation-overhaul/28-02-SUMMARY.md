# Phase 28-02: Tools Merge Plan Summary

**Status:** Completed
**Duration:** Single session
**Commits:**
- `0eb58c9` feat(28-02): create unified Tools page with Translate/Analyze toggle
- `cda6d0f` feat(28-02): update navigation and add redirects for tools page

## What Was Done

### Task 1: Create unified Tools page with Translate/Analyze toggle
- Created `/app/[locale]/tools/page.tsx` - server component that reads `?mode` param (defaults to `translate`)
- Created `/components/tools/ToolsPageClient.tsx` - client component with:
  - SegmentedControl toggle between "Translate" and "Analyze" modes
  - URL-synced mode state using `router.replace`
  - Full translate functionality inline (matching original translate page)
  - ReaderWorkspace for analyze mode
- Added i18n keys in both `en.json` and `mk.json`:
  - `tools.title`, `tools.translateTab`, `tools.analyzeTab`

### Task 2: Update navigation and add redirects
- Updated `navItems.ts`:
  - Changed "translate" nav item to "tools"
  - Updated path from `/translate` to `/tools`
  - Changed icon from `Languages` to `Wrench`
- Added 301 redirects in `middleware.ts`:
  - `/translate` -> `/tools?mode=translate`
  - `/reader/analyze` -> `/tools?mode=analyze`
  - Updated legacy `/translator/history` redirect to use `/tools`
- Added `nav.tools` i18n key for both locales

## Files Changed
- `app/[locale]/tools/page.tsx` (new)
- `components/tools/ToolsPageClient.tsx` (new)
- `components/shell/navItems.ts` (modified)
- `middleware.ts` (modified)
- `messages/en.json` (modified)
- `messages/mk.json` (modified)

## Verification Results
- `npm run type-check` - Passes
- `npm run lint` - Passes (3 pre-existing warnings unrelated to this plan)
- `/tools` page shows unified view with Translate/Analyze toggle
- Toggle state persists in URL params
- Old `/translate` path redirects to `/tools?mode=translate`
- Old `/reader/analyze` path redirects to `/tools?mode=analyze`
- Bottom nav shows "Tools" tab with Wrench icon

## Design Decisions
1. **Embedded vs Extracted Components**: Rather than extracting TranslatorTool and AnalyzerTool to separate files, the translate logic was embedded directly in ToolsPageClient (matching the existing inline pattern in translate/page.tsx) while analyze mode uses the existing ReaderWorkspace component.

2. **Icon Choice**: Used `Wrench` icon for the Tools nav item instead of `Languages` to better represent the unified "tools" concept.

3. **Redirect Strategy**: Used 301 permanent redirects in middleware rather than page-level redirects for better SEO and simpler maintenance.

## Impact
- Navigation reduced from 5 distinct destinations to 4 conceptually cleaner ones
- Users can switch between translate and analyze without leaving the page
- Backward compatibility maintained via 301 redirects
- All existing translate functionality preserved
