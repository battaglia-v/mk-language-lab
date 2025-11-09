# Mobile UX Improvements

**Date**: November 9, 2025
**Issue**: User reported multiple mobile UX problems during Android testing

## Problems Identified

### 1. Translation Tool
**Issues:**
- Default direction is MK→EN, but learners typically want EN→MK
- Requires scrolling to use on mobile (buttons/textarea not immediately visible)
- Not optimized for mobile viewport

**Solution:**
- Change default direction to EN→MK (line 71 in translate/page.tsx)
- Optimize mobile layout with better spacing
- Consider sticky buttons for mobile

### 2. Quick Practice
**Issue:** Modal requires scrolling on mobile devices

**Solution:**
- Optimize modal layout for mobile
- Consider making controls sticky
- Reduce vertical spacing on mobile

### 3. Horizontal Scrolling
**Issue:** Almost every page requires horizontal scrolling on mobile

**Root Cause:**
- Missing `overflow-x-hidden` on body/html
- Some components may have fixed widths exceeding viewport

**Solution:**
- Add `overflow-x-hidden` to root layout
- Audit all components for width issues
- Ensure all containers use `max-w` constraints

### 4. WOTD Detail
**Status:** Not actually broken - component already shows all details
**Note:** User may be confused about expected behavior. Component shows example sentence, pronunciation, etc. No expandable feature was designed.

## Implementation Priority

1. **High**: Fix horizontal scrolling (blocking)
2. **High**: Change translation default to EN→MK
3. **Medium**: Optimize translation tool mobile layout
4. **Medium**: Optimize Quick Practice modal
5. **Low**: Clarify WOTD behavior with user

## Files to Modify

1. `app/layout.tsx` - Add overflow-x-hidden
2. `app/[locale]/translate/page.tsx` - Change default direction, optimize mobile layout
3. `components/learn/QuickPracticeWidget.tsx` - Optimize modal for mobile
4. `app/globals.css` - Add responsive utilities

