import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSignedIn } from './_auth';
import { getReleaseGateMode, type ReleaseGateMode } from './_mode';
import { resolveGateRoutes, type GateRoute } from './_routes';
import { maybeAddDiscoveredCustomDeckEditorRoute, maybeAddDiscoveredLessonRoute } from './_discover';
import { instrumentActionSignals, safeGoto } from './_scan-utils';

type JourneyFailure = {
  routeId: string;
  routePath: string;
  resolvedPathname: string | null;
  expectedTestIds: string[];
  error: string;
};

function expectedJourneyTestIds(route: GateRoute, mode: ReleaseGateMode): string[] {
  const id = route.id;

  if (id === 'home') return ['home-start-learning'];
  if (id === 'dashboard') return ['learn-start-todays-lesson', 'home-start-learning'];
  if (id === 'learn') return ['learn-start-todays-lesson', 'learn-browse-paths'];
  if (id === 'pathsHub') return ['paths-back-to-learn'];
  if (id.startsWith('path-')) return ['path-detail-back'];
  if (id === 'alphabetLesson') return ['alphabet-tab-learn', 'alphabet-back-to-a1'];
  if (id === 'practice') return ['practice-settings-open', 'practice-mode-vocabulary'];
  if (id === 'practiceWordSprint' || id === 'practiceCloze' || id === 'practiceFillBlanks' || id === 'practiceWordGaps') {
    return ['word-sprint-picker-start', 'word-sprint-exit'];
  }
  if (id === 'practicePronunciation') return ['pronunciation-back-to-practice'];
  if (id === 'practiceGrammar') return ['grammar-back-to-practice', 'grammar-results-retry'];
  if (id === 'practiceDecks') return ['custom-decks-back-to-practice', 'custom-decks-upgrade'];
  if (id === 'customDeckEditor') return ['deck-editor-back-to-decks', 'deck-editor-edit-info'];
  if (id === 'practiceSession' || id.startsWith('practice-session-topic-')) return ['practice-session-exit'];
  if (id === 'practiceResults') return ['practice-results-practice-again'];
  if (id === 'translate') return ['translate-input'];
  if (id === 'reader') return ['reader-tab-library', 'reader-search-input'];
  if (id === 'readerAnalyze') return ['reader-workspace-input', 'reader-workspace-analyze'];
  if (id === 'readerReview') return ['reader-review-empty-go-library', 'reader-review-footer'];
  if (id.startsWith('reader-sample-') && id.endsWith('-v2')) return ['reader-v2-back', 'reader-v2-toggle-tap'];
  if (id.startsWith('reader-sample-')) return ['reader-sample-back-to-reader', 'reader-sample-tab-text'];
  if (id === 'news') return ['news-hero'];
  if (id === 'resources') return ['resources-search-input'];
  if (id === 'discover') return ['discover-refresh', 'discover-error-retry'];
  if (id === 'dailyLessons') return ['daily-lessons-hero', 'daily-lessons-instagram'];
  if (id === 'notifications') {
    return mode === 'signed-out' ? ['notifications-sign-in'] : ['notifications-list', 'notifications-refresh', 'notifications-sign-in'];
  }
  if (id === 'tasks') return ['tasks-hero', 'tasks-board'];
  if (id === 'profile') {
    return mode === 'signed-out' ? ['profile-sign-in'] : ['profile-overview', 'profile-sign-in'];
  }
  if (id === 'settings') return ['settings-back-to-more', 'settings-reset-open'];
  if (id === 'help') return ['help-back-to-more', 'help-email-support'];
  if (id === 'about') return ['about-hero'];
  if (id === 'feedback') return ['feedback-message', 'feedback-submit', 'feedback-back'];
  if (id === 'terms') return ['terms-back-home', 'terms-contact-email'];
  if (id === 'privacy') return ['privacy-hero'];
  if (id === 'upgrade') return ['upgrade-subscribe-monthly', 'upgrade-subscribe-yearly'];
  if (id === 'more') return ['more-menu-news', 'more-menu-profile'];
  if (id === 'onboarding') return ['onboarding-start', 'onboarding-next'];
  if (id === 'localizedSignIn' || id === 'authSignIn') return ['auth-signin-email', 'auth-signin-submit'];
  if (id === 'authSignUp') return ['auth-signup-name', 'auth-signup-submit'];
  if (id === 'authError') return ['auth-error-try-again'];
  if (id === 'authSignOut') return ['auth-signout-confirm', 'auth-signout-cancel', 'auth-signout-go-home'];
  if (id === 'offline') return ['offline-try-again'];
  if (id === 'lesson') return ['lesson-runner', 'exercise-submit'];

  return [];
}

async function anyVisibleByTestIds(page: Page, testIds: string[]): Promise<boolean> {
  for (const testId of testIds) {
    if (await page.getByTestId(testId).first().isVisible().catch(() => false)) return true;
  }
  return false;
}

test.describe.serial('release gate: journey coverage', () => {
  test('every route has at least one journey assertion', async ({ page }) => {
    test.setTimeout(45 * 60 * 1000);
    const mode = getReleaseGateMode();
    const outDir = path.join(process.cwd(), 'test-results', 'release-gate', mode);
    fs.mkdirSync(outDir, { recursive: true });

    await instrumentActionSignals(page);
    await ensureSignedIn(page, mode);

    const routes = await resolveGateRoutes();
    await maybeAddDiscoveredLessonRoute(page, routes);
    await maybeAddDiscoveredCustomDeckEditorRoute(page, routes);
    const maxRoutes = Number(process.env.RELEASE_GATE_MAX_ROUTES || 0);
    const routesToVisit = maxRoutes > 0 ? routes.slice(0, maxRoutes) : routes;

    const failures: JourneyFailure[] = [];

    for (const route of routesToVisit) {
      const expectedTestIds = expectedJourneyTestIds(route, mode);
      const fallbackError = expectedTestIds.length === 0 ? `No journey testIds configured for routeId=${route.id}` : null;
      try {
        await safeGoto(page, route.path);
        const resolvedPathname = new URL(page.url()).pathname;

        if (fallbackError) {
          failures.push({
            routeId: route.id,
            routePath: route.path,
            resolvedPathname,
            expectedTestIds,
            error: fallbackError,
          });
          continue;
        }

        const ok = await anyVisibleByTestIds(page, expectedTestIds);
        if (!ok) {
          failures.push({
            routeId: route.id,
            routePath: route.path,
            resolvedPathname,
            expectedTestIds,
            error: `Expected one of these data-testids to be visible: ${expectedTestIds.join(', ')}`,
          });
        }
      } catch (error) {
        failures.push({
          routeId: route.id,
          routePath: route.path,
          resolvedPathname: null,
          expectedTestIds,
          error: error?.message || String(error),
        });
      }
    }

    fs.writeFileSync(
      path.join(outDir, 'journey-results.json'),
      JSON.stringify(
        {
          mode,
          generatedAt: new Date().toISOString(),
          totalRoutes: routesToVisit.length,
          failures,
        },
        null,
        2
      )
    );

    expect(failures, 'Every route must have at least one passing journey assertion').toHaveLength(0);
  });
});

