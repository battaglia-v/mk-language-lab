import { test, expect } from '@playwright/test';
import { ensureSignedIn } from './_auth';
import { getReleaseGateMode } from './_mode';
import { instrumentActionSignals, safeGoto } from './_scan-utils';

test.describe.serial('release gate: reader word tap', () => {
  test('tapping a word opens the word sheet and plays audio', async ({ page }) => {
    const mode = getReleaseGateMode();
    await instrumentActionSignals(page);
    await ensureSignedIn(page, mode);

    const locale = process.env.RELEASE_GATE_LOCALE ?? 'en';
    await safeGoto(page, `/${locale}/reader/samples/cafe-conversation/v2`);

    const firstWord = page.getByTestId('reader-tappable-word').first();
    await expect(firstWord).toBeVisible();

    await firstWord.click();
    await expect(page.getByTestId('reader-word-sheet')).toBeVisible();

    const beforeSignals = await page.evaluate(() => (window as any).__mkllSignals?.speechSpeakCalls ?? 0);
    await page.getByTestId('reader-word-sheet-audio').click();
    await page.waitForTimeout(100);
    const afterSignals = await page.evaluate(() => (window as any).__mkllSignals?.speechSpeakCalls ?? 0);
    expect(afterSignals).toBeGreaterThanOrEqual(beforeSignals + 1);

    const saveButton = page.getByTestId('reader-word-sheet-save');
    await saveButton.click();
    await expect(saveButton).toBeDisabled();

    await page.getByTestId('reader-word-sheet-close').click();
    await expect(page.getByTestId('reader-word-sheet')).toBeHidden();
  });
});

